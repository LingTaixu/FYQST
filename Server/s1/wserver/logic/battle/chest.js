const consts = require('./consts.js'); 
const w2g = require('../../utils/w2g.js'); 
const playerManager = require('./player.js').playerManager; 
class Chest {
	constructor(id, x, y,itemId){
		this.id = id;
		this.x = x;
		this.y = y;
	 	this.itemId = itemId; 	
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
	getOwnerId(){
		return this.owner;
	}
	unpick(){
		this.status = consts.eChestStatus.normal;
		this.owner = 0;
		this.serverId = 0;
		this.pickTime = null;
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
		if(this.status == consts.eChestStatus.picking){
			 var endTime = this.pickTime.getTime() + consts.eCONST.PICK_CD;
 			p.statusEndTime = Math.ceil((endTime - new Date().getTime())/1000);		//  秒
 			if (p.statusEndTime < 0){
 				p.statusEndTime = 0;
 			}
		}
		return p;
	}
}

var maxChestId = 100000;
var _genChestId = function(){
	return maxChestId++;
}

class ChestManager{
	constructor() {
		this.chestList = {}; 
	}
	getChest(chestId) {
		return this.chestList[chestId];
	}  
	size(){
		return Object.keys(this.chestList).length;
	}
	createChest(itemId, x, y) {
		 let id = _genChestId();
		 let chest = new Chest(id, x, y,itemId);
		 this.chestList[id] = chest; 
		 return chest;
	}
	removeChest(id){
 		delete this.chestList[id];
	}  
	removeAllChest(){
		this.chestList = {};
	}
}

var chestManager = new ChestManager();
exports.chestManager = chestManager;
exports.init = function() { 
}