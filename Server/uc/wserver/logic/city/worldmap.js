// 地图 1920 x 2560 客户端格子40x40  协议是格子坐标 
const godness = require('./godness.js').godness;
const chestManager = require('./chest.js').chestManager;
const playerManager = require('./player.js').playerManager; 
const consts = require('./consts.js'); 
const logger = require('uw-log').getLogger("uw-logger", __filename);
var appServer = null;
var moduleNsp = null;

class WorldMap {
	constructor() {
		// this.mapWidth = 48; // 地图格子宽
		// this.mapHeight = 64; // 地图格子高
		// this.sectorSize = 16;
		// this.sectorXNum = this.mapWidth / this.sectorSize;
		// this.sectorYNum = this.mapHeight / this.sectorSize;
		this.userList = {};
		this.godness = godness; 
	}
	getMapId(){
		return consts.eCONST.WORLDMAP_NAME;
	}
	init(){
		this.godness.init(this); 
		chestManager.init(this);
	}
	enterWorld(player, pos) {
		//let room = this.computeInRoom(player.x, player.y);
 	
 		this.userList[player.getUserId()] = player; 
 		player.broadcast("syncEnter", [player.getProfile()]);

		// send all user to self 
		let ids = Object.keys(this.userList);
		let proto = []; 
		for (var i = 0; i < ids.length; i++) {
			let uid = ids[i];
			//if(uid == player.getUserId()) continue;
			let p = this.userList[uid]; 
			proto.push(p.getProfile()); 
		}
		player.send("syncEnter", proto);
  
		// join
		//player.enter(room);
		this.syncGodnessBegin(player); 

		// 如果是女神活动时间
		//);this.syncChestToUser(player
	}
	leaveWorld(player) {   
		this.godness.leave(player.getUserId());		
		delete this.userList[player.getUserId()];
	}
	joinGodness(player){ 
		//let ret = false;
		let proto = {ret:1};
		if (this.godness.join(player)){
			proto.ret = 0;
			player.setJoinGodness(true);
		}
		player.send("joinGodness", proto);

		if(proto.ret == 0){
			this.syncChestToUser(player);
		}
	}
	pickChest(player, chestId){  
 		let chest = chestManager.getChest(chestId);
 		let proto = {ret:1};
 		if(!chest || chest.getStatus() != consts.eChestStatus.normal){
 			console.info("user pick chest error:", chestId, chest && chest.getStatus());
 			player.send("pickChest", proto);
 			return;
 		}

 		let gUser = this.godness.getGUser(player.getUserId());
 		//console.log("pickChest:", player.getUserId(), gUser.getPickItem(),consts.eGodness.MAX_PICKNUM);
 		if (!gUser || gUser.getPickItem() >= consts.eGodness.MAX_PICKNUM){ 
 			console.info("user pick chest max picknum error:", chestId, gUser.getPickItem());
 			player.send("pickChest", proto);
 			return;
 		}
 		proto.ret = 0;
 		gUser.pickItem();
 		proto.pickNum = gUser.getPickItem();
 		player.send("pickChest", proto); 

 		chest.pick(player.getUserId(), player.getServerId()); 
 		player.broadcast("syncChest",[chest.getProfile()]);
	}
	syncGodnessBegin(player, needReply){
		
		if (!this.godness.inActivityTime(new Date())){
			if(needReply){
				player.send("syncGodnessBegin", {ret:1});
			}
			return;
		}

	 	let proto = this.godness.getProfile(); 
		if(player){ 
			player.send("syncGodnessBegin", proto);
		}else{ 
			this.broadcast("syncGodnessBegin", proto); 
		}
	}
	spawnChests(posArr){
		let newChestList = chestManager.spawnChest(posArr);
		let proto = [];
		newChestList.forEach((e) =>{
			proto.push(e.getProfile());
		});
 
		let ids = Object.keys(this.userList);
		for (var i = 0; i < ids.length; i++) {
			let uid = ids[i];
			let player = this.userList[uid];
			if (player.getJoinGodness()){
				player.send("syncChest", proto);
			} 
		}
	}
	syncChestToUser(player){
		
		if (!this.godness.inActivityTime(new Date()))
			return;

		if(player.getJoinGodness()){
			let proto = chestManager.getChestListProto();
			player.send("syncChest", proto);
			//console.log("syncChestToUser:",player.getUserId(), proto);
		}
	}
	sendToUser(userId, protocol, data){
		let player = playerManager.getPlayerByUid(userId);
		player&&player.send(protocol, data);
	}
	broadcast(protocol, data){
		// send data to all user in this map 
		appServer.io.of(moduleNsp).to(this.getMapId()).emit(protocol, data);
	}
	broadcastAll(protocol, data){ 
		// send data to all user 
		appServer.io.of(moduleNsp).emit(protocol, data);
	}  
	computeInRoom(x, y) {
		return "room_1";
		// 不是用视野aoi，用房间还是会出现挨着人可能互相看不到
		// let index = Math.floor(y / this.sectorSize) * this.sectorXNum + Math.floor(x / this.sectorSize);
		// let r = "room_" + index;
		// console.log("computeInRoom:", x, y, r);
		// return r;
	} 
}

var worldMap = new WorldMap();
module.exports.worldMap = worldMap;

module.exports.init = function() {
	appServer = appServer || require('./appUtil.js').appServer;
	moduleNsp = moduleNsp || require('./appUtil.js').ns;
}
module.exports.run = function() {
	module.exports.worldMap.init();
}