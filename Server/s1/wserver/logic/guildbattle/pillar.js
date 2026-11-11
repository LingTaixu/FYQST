/*
 *    boss信息
 */ 

const Actor = require('./actor.js').Actor;  
const consts = require('./consts.js');
const c_bossOther = require('uw-data').c_bossOther;
const t_monster = require('uw-data').t_monster; 
const w2g = require('../../utils/w2g.js'); 
const logger = require('uw-log').getLogger("uw-logger", __filename);
var exports = module.exports;

var appServer = null;
var worldMapManager = null;
 
class Pillar{
 	constructor(id, cfgId, x,y,npcId) { 
 		this.id = id;
 		this.cfgId = cfgId;
 		this.npcId = npcId;
 		this.type = consts.eActorType.pillar;
		this.status = consts.ePillarStatus.init;	 
		this.statusTime = new Date();	// 当前状态变换时间 
 
 		this.pos = {
			x : x,
			y :y
		};
		this.mapId = null;

		this.holderGId = 0		// 已占领公会id
		this.holderGName = "";	// 已占领公会名称
		this.holdingUserId = 0;	// 当前在占领的人 （和占领公会没关系)
		this.holdingUserName = "";
		this.holderTime = null;	// 占领时间
		this.scoreTime = null;	// 产生积分的时间
	} 
	getId(){
		return this.id;
	}
	setMap(map){
		this.map = map;
	}
	getStatus(){
		return this.status;
	} 
	getStatusTime(){
		return this.statusTime;
	}  
	changeStatus(status){
		this.status = status;
		this.statusTime = new Date();
		//this.syncProfileChange();
	}
 	getProfile(){
 		let p = {
 			id : this.getId(),
 			type : this.type,
 			pillarId: this.npcId,
 			x : this.pos.x,
 			y : this.pos.y, 
 			ownerGid: this.holderGId,
 			ownerGName: this.holderGName,
 			userId : this.holdingUserId,
 			userName: this.holdingUserName,
 			status: this.status,
 		}
 		if(this.status == consts.ePillarStatus.holding){
 			var endTime = this.statusTime.getTime() + consts.eCONST.PILLAR_HOLDCD;
 			p.statusEndTime = Math.ceil((endTime - new Date().getTime())/1000);		//  秒
 			if (p.statusEndTime < 0){
 				p.statusEndTime = 0;
 			}
 		}
 		return p;
 	}
 	// syncProfileChange(){
 	// 	let p ={
 	// 		pillar:[this.getProfile()]
 	// 	};
 	// 	this.broadcastToMap('syncBattle', p);
 	// }
 	setHoldingUser( userId, userName){
 		this.holdingUserId = userId;
 		this.holdingUserName = userName; 
 	}
 	holdDone(gid, gname){
 		this.holderGId = gid;
 		this.holderGName = gname;
 		this.holderTime = new Date();
 		this.scoreTime = new Date();
 	}
 	clearHolderGuild(){
 		this.holderGId = 0;
 		this.holderGName = ''; 
 		this.holderTime = null;
 	} 
 	clearHoldingUser(){
 	 	this.holdingUserId = 0;
 		this.holdingUserName = ''; 	
 	}
 	getHolderGid(){
 		return this.holderGId;
 	}
 	getholdingUserId(){
 		return this.holdingUserId;
 	}
 	setScoreTime(s){
 		this.scoreTime = s;
 	}
 	getScoreTime(){
 		return this.scoreTime;
 	}
 	broadcastToMap(protocol, data){
		if (this.map){
			this.map.broadcast(protocol, data);
		}
	}
 }

 class PillarManager{
 	constructor() {
 		this.pillarList = {}; 
 		this.maxId = 1000; 
 	} 
 	getLogicId(){
 		return this.maxId++;
 	} 
 	getPillar(id){
 		return this.pillarList[id];
 	}
 	removePillar(id){
 		delete this.pillarList[id];
 	}
 	createPillar(cfg){ 
 		let id = this.getLogicId();
 		let p = new Pillar(id, cfg.id, cfg.x, cfg.y, cfg.npcId);
 		this.pillarList[id] = p;
 		return p;
 	} 
 	 getAllPillarProfile(){
 	 	let p = {};
 	 	p.pillar = [];
 	 	for(let id in this.pillarList){
 	 		let pi = this.pillarList[id];
 	 		p.pillar.push(pi.getProfile());
 	 	} 
 	 	return p;
 	} 
 }


var pillarManager = new PillarManager();

exports.pillarManager = pillarManager
exports.init = function() {
	appServer = appServer || require('./appUtil.js').appServer;
	exports.pillarManager.init();
}