/*
*	世界boss 管理逻辑
*/
const logger = require('uw-log').getLogger("uw-logger", __filename);
const playerManager = require('./player.js').playerManager; 
const consts = require('./consts.js'); 
const w2g = require('../../utils/w2g.js');
const WBShop = require('./shop.js').WBShop;
const c_bossCSWorld = require('uw-data').c_bossCSWorld;
const guildManager = require('./guild.js').guildManager; 
var worldMapManager = null;
var checkRequire = function(){
	worldMapManager = worldMapManager || require('./worldmap.js').worldMapManager;
}; 

var getBossId = function(){
	// 现在世界boss只有1个
	let wids = Object.keys(c_bossCSWorld);
	for (let i = 0; i < wids.length; i++){
		 let bossEntity = c_bossCSWorld[wids[i]];  
		if (bossEntity.type == consts.eBossType.CSWorldBoss){
			return bossEntity.id;
		} 
	}
};

var inBattleTime = function(bossId){
	//return true;
	let bossEntity = c_bossCSWorld[bossId];  	 
	let tmNow = new Date();
	// 提前2秒开始
	let startTime = tmNow.clone().clearTime().addHours(bossEntity.startTime[0]).addMinutes(bossEntity.startTime[1]).addSeconds(-2);
	let endTime = tmNow.clone().clearTime().addHours(bossEntity.endTime[0]).addMinutes(bossEntity.endTime[1]);
  	if(tmNow.isAfter(startTime)&&tmNow.isBefore(endTime)){
    	return true;
	} 		 
	return false;
}

class WorldBoss {
	constructor(){
 		this.timer = null;
 		this.bossId = 0;
 		this.stage = consts.eWBStage.init;
 		this.stageTime = new Date();
		this.bossId = getBossId(); 
	}
	changeStage(s){
		this.stage = s;
		this.stageTime = new Date();
	}
	init(){	 
	}
	start(){
		if(!this.timer){
 			this.timer = setInterval(() =>{this.run();}, 1000);
		}
	}
	run(){
		if(this.stage == consts.eWBStage.init){
			this.changeStage(consts.eWBStage.prepareForBattle);
		}else if(this.stage == consts.eWBStage.prepareForBattle){
			//console.log("prepareForBattle");
			if (inBattleTime(this.bossId)){
				this.openWBBattle();
			}
		}else if(this.stage == consts.eWBStage.battle){
			// ready worldbssmap change stage, do nothing
		}else if(this.stage == consts.eWBStage.shop){
			this.checkWbShop();
			if (this.wbShop.status == consts.eShopStatus.close){
				this.changeStage(consts.eWBStage.close);
			} 
		}else if(this.stage == consts.eWBStage.close){
			// for next battle
			this.close();
		} 
	}	 
	checkWbShop(){
		let tmNow = new Date();
		if (!this.wbShop) return; 
		if(this.wbShop.status == consts.eShopStatus.limit){
			let sec = this.wbShop.statusTime.getSecondsBetween(tmNow);
			//console.log("checkWbShop limit:", sec);
			if(sec >= consts.eCONST.SHOP_STAGE1_INTERVAL){ 
				this.wbShop.changeStatus(consts.eShopStatus.all);
				this.syncWbShopStage2();
			}
		}else if (this.wbShop.status == consts.eShopStatus.all){
			let sec = this.wbShop.statusTime.getSecondsBetween(tmNow);
			//console.log("checkWbShop all:", sec);
			if(sec >= consts.eCONST.SHOP_STAGE2_INTERVAL){  
				this.wbShop.close();
				this.syncWbShopStage3();
			}
		}
	}
	openWBBattle(){
		// 开地图 
		logger.info("openWorldMap:", this.bossId);
		checkRequire();
		worldMapManager.createWorldBossMap(this.bossId);
		this.changeStage(consts.eWBStage.battle);
	}
	buyGoods(player, goodsId){
		if (!this.wbShop) return;
		if(this.wbShop.canBuyGoods(goodsId, player.getUserId())){
			//(userId, bossId, goodsId, serverId
			w2g.wbShopBuy(player.getUserId(), this.wbShop.bossId, goodsId, player.getServerId(), (err, data, exUserData) =>{
				//console.error("buyGoods RESP:", err, data);
				if(err) return ; 
				if(!exUserData || exUserData.errcode) return;	 
				this.wbShop.buyGoods(goodsId, player.getUserId());
				player.send("syncUserData", data);

				// 刷新掉玩家的商品
				if(this.wbShop.status == consts.eShopStatus.all){
					let pt =  this.wbShop.getStage2GoodsList();
					this.wbShop.userIdList.forEach(function(id){
						let pyer = playerManager.getPlayerByUid(id);
						pyer && pyer.send("syncGoodsList", pt);
					}); 
				}else{
					let proto = this.wbShop.canbuyGoodsList(player.getUserId());
					player.send("syncGoodsList", proto);
				}
				return ;
			});
		}
	}
	openWbShop(bossId, userIds, goodsIdList){
		logger.info("worldboss.openWbShop:",userIds, goodsIdList);
		this.changeStage(consts.eWBStage.shop);
		this.wbShop = new WBShop(bossId);
		this.wbShop.setGoodsList(goodsIdList);
		this.wbShop.setUserList(userIds);
		this.wbShop.open();
		this.syncWbShopStage1();
	}
	syncWbShopStage1(){
		let userIds = this.wbShop.userIdList;
		for(let i = 0; i < userIds.length && i < 3; i++){
			let player = playerManager.getPlayerByUid(userIds[i]);
			if (player){
				let proto = {
					goodslst : this.wbShop.getGoodsListByIdx(i),
					endTime : consts.eCONST.SHOP_STAGE1_INTERVAL
				};
				player.send("syncGoodsList", proto);
			}
		}
	}
	syncWbShopStage2(){
		let userIds = this.wbShop.userIdList;
		for(let i = 0; i < userIds.length; i++){
			let player = playerManager.getPlayerByUid(userIds[i]);
			if (player){
				let proto = {
					goodslst : this.wbShop.getGoodsList(),
					endTime : consts.eCONST.SHOP_STAGE2_INTERVAL
				};
				player.send("syncGoodsList", proto);
			}
		}
	}
	syncWbShopStage3(){
		let userIds = this.wbShop.userIdList;
		for(let i = 0; i < userIds.length; i++){
			let player = playerManager.getPlayerByUid(userIds[i]);
			if (player){
				let proto = {
					goodslst : [],
					endTime : 0
				};
				player.send("syncGoodsList", proto);
			}
		}
	}
	close(){
		checkRequire();
		this.wbShop = null;
		worldMapManager.deleteWorldBossMap(this.bossId);
		this.changeStage(consts.eWBStage.prepareForBattle);
		guildManager.clear();
	}
};

var worldBoss = new WorldBoss();

module.exports.worldBoss = worldBoss; 
module.exports.init = function() { 
	module.exports.worldBoss.init();
};
module.exports.run = function() {
	module.exports.worldBoss.start();
}