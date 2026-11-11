const consts = require('./consts.js'); 
const w2g = require('../../utils/w2g.js'); 
const playerManager = require('./player.js').playerManager; 
class Chest {
	constructor(id, x, y,itemId){
		this.id = id;
		this.x = x;
		this.y = y;
	 	this.itemId = itemId;//consts.eCONST.GOLD_EGG_ITEMID;		
		this.status = consts.eChestStatus.normal;
		this.owner = 0;
		this.serverId = 0;
		this.pickTime = null;
	}
	getId(){
		return this.id;
	} 
	pick(userId, serverId){
		this.status = consts.eChestStatus.picking;
		this.owner = userId;
		this.serverId = serverId;
		this.pickTime = new Date();
	}
	unpick(){
		this.status = consts.eChestStatus.normal;
		this.owner = 0;
		this.serverId = 0;
		this.pickTime = null;
	}
	getOwnerId(){
		return this.owner;
	}
	canInBag(){
		if(this.status != consts.eChestStatus.picking || !this.pickTime|| !this.owner){
			return false;
		}
		let tmNow = new Date();
		if(tmNow.getTime() - this.pickTime.getTime() >= consts.eCONST.PICK_CD){
			return true;
		}
		return false;
	}
	getStatus(s){
		return this.status;
	} 
	getProfile(){
		let p = {
			chestId : this.id,
			x : this.x,
			y : this.y,
			itemId: this.itemId,
			status: this.status,
			rid : this.owner
		};
		return p;
	}
}

var maxChestId = 1000;
var _genChestId = function(){
	return maxChestId++;
}

class ChestManager{
	constructor() {
		this.chestList = {}; 
	}
	init(worldMap){
		this.worldMap = worldMap;
	}
	getChest(chestId) {
		return this.chestList[chestId];
	}  
	size(){
		return Object.keys(this.chestList).length;
	}
	update(tmNow){
		let ids = Object.keys(this.chestList); 
		// console.log("ChestManager->update -------->",ids);
		for(let i = 0; i < ids.length; i++){
			let chestId = ids[i];
			let chest = this.chestList[chestId];
			if(chest.canInBag()){ 
				this.removeChest(chestId);
				// console.error("check put into bag:", chestId, chest.owner, chest.serverId, ",remove it");
				w2g.addWChest(chest.owner, chest.itemId, chest.serverId, 0, (err, data) => {	
					// this.removeChest(chestId);
					if(err) return;
					// 返回玩家背包新数据
					let player = playerManager.getPlayerByUid(chest.owner);
					if(player){
						player.send("syncUserData", data);

						player.pickItem();
        				let pickNum = player.getPickItem();
        				player.send("syncPickEggNum", pickNum);
					}
				});
			}
		} 
	}
	spawnChest(posArr){
		//console.log("spwanChest --------");
		let chestList = [];
		for(let i = 0; i < posArr.length; i++){
			let chest = this.createChest(posArr[i]);
			chestList.push(chest);
		}
		return chestList;
	}
	createChest(pos) {
		 let id = _genChestId();
		 let x = pos[0];
		 let y = pos[1];
		 let itemId = this.genRandomItemId();
		 let chest = new Chest(id, x, y,itemId);
		 this.chestList[id] = chest;
		// console.log("createChest:", chest);
		 return chest;
	}
	genRandomItemId(){
		var itemId = (Math.random() > 0.8)?consts.eCONST.COLOR_EGG_ITEMID:consts.eCONST.GOLD_EGG_ITEMID;
		return itemId;    
	}
	removeChest(id){
 		delete this.chestList[id];
	} 
	getChestListProto(){
		//console.log("getChestListProto:", this.chestList);
		let ids = Object.keys(this.chestList);
		let proto = [];
		for(let i = 0; i < ids.length; i++){
			let chestId = ids[i]; 
			let chest = this.chestList[chestId];
			proto.push(chest.getProfile());
		};
		return proto;
	}
	removeAllChest(){
		this.chestList = {};
	}
}

var chestManager = new ChestManager();
exports.chestManager = chestManager;
exports.init = function() { 
}