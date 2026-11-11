/*
 *    boss信息
 */ 

const Actor = require('./actor.js').Actor; 
const Target = require('./actor.js').Target; 
const consts = require('./consts.js');
const c_bossOther = require('uw-data').c_bossOther;
const t_monster = require('uw-data').t_monster; 
const w2g = require('../../utils/w2g.js'); 
const logger = require('uw-log').getLogger("uw-logger", __filename);
var exports = module.exports;

var appServer = null;
var worldMapManager = null;
 
class Npc extends Actor{
 	constructor(id, cfgId, x,y,npcId) {
 		super(consts.eActorType.boss,id);
 		this.cfgId = cfgId;
 		this.npcId = npcId; 
		this.status = consts.eNpcStatus.init;	// boss状态
		this.statusTime = new Date();	// 当前状态变换时间
		this.target = new Target(consts.eActorType.player, 0, 0);// 所属者
		let maxHp = t_monster[npcId].maxHp;
		this.setMaxHp(maxHp);  
		this.setHp(maxHp);
		this.bornTime = null; 
		this.pos = {
			x : x,
			y :y,
			dir : 7 
		}   
		this.map = null;
	} 
	getNpcId(){
		return this.npcId;
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
	getDeadTime(){
		if (this.status == consts.eNpcStatus.dead){
			return this.statusTime;
		}else if (this.status == consts.eNpcStatus.readyForAlive){
			return this.statusTime;
		}
	}   
	changePos(x, y, dir){
		this.pos.x = x;
		this.pos.y = y;
		this.pos.dir = dir || 7;
	} 
	subHp(h){
		this.hp -= h;
		if (this.hp <= 0){
			this.hp = 0;
			//this.die(); 由check来处理
		}else if(this.hp > this.maxHp){
			this.hp = this.maxHp;
		}
		return this.hp;
	}
	changeStatus(status){
		//console.log("changeStatus:", this.getId(), this.status, "->", status);
		this.status = status;
		this.statusTime = new Date();
	}
	canJoin(player, cb){
		//let cfg = c_bossOther[id];
		// 有客户端判断，服务器不检查了.
		return cb(null);
	}
 	getProfile(){
 		let p = {
 			id : this.getId(),
 			npcId : this.getNpcId(),
 			type : this.getActorType(), 
 			maxHp: this.getMaxHp(),
 			hp : this.getHp(),
 			x : this.pos.x,
 			y : this.pos.y,
 			dir : this.pos.dir
 		}

 		if(this.target && this.target.id > 0){
 			p.target = {
 				id:this.target.id,
 				heroId: this.target.heroId,
 				type : consts.eActorType.player
 			};
 		} 
 		return p;
 	}
 	setOwner(id, heroId){
 		if(heroId <= 0){
 			logger.info("BOSS SETOWNER ERR:", id, heroId);
 			this.clearOwner();
 		}else{
	 		this.target.id = id;
	 		this.target.heroId = heroId;
 		}
 	}
 	getOwner(){
 		return this.target;
 	}
 	clearOwner(){
 		this.target.id = 0;
 		this.target.heroId = 0;
 	}
 	getOwnerId(){
 		return this.target.id;
 	}
 	syncHp(){
		let hpChange = {
			type : consts.eActorType.boss,
			id : this.getId(),
			hp : this.getHp(),
			heroId: this.getId() 
		};	 
		this.broadcastToMap("syncHp", hpChange);
 	}
 	syncTarget(){
		// boss 归属
		let proto = {
			id : this.getId(),
			heroId : this.getId(),
			type : consts.eActorType.boss 
		};
		if (this.getOwnerId() > 0){
			proto.target = {};
			proto.target.id = this.getOwnerId();
			proto.target.heroId = this.getOwner().heroId;
			proto.target.type = consts.eActorType.player;
		}
		//console.log("syncTarget:", proto);
		this.broadcastToMap('syncTarget',proto);	
	}
 	broadcastToMap(protocol, data){
		if (this.map){
			this.map.broadcast(protocol, data);
		}
	}
 }

 class NpcManager{
 	constructor() {
 		this.npcList = {}; 
 		this.maxId = 1000; 
 	}
 	init(){

 	}
 	getNpc(id) {
		return this.npcList[id];
	}  
 	getLogicId(){
 		return this.maxId++;
 	} 
 	createNpc(cfg){ 
 		let id = this.getLogicId();
 		let npc = new Npc(id, cfg.id, cfg.x, cfg.y, cfg.npcId);
 		this.npcList[id] = npc;
 		return npc;
 	} 
 	removeNpc(id){
 		delete this.npcList[id];
 	} 
 }


var npcManager = new NpcManager();

exports.npcManager = npcManager
exports.init = function() {
	appServer = appServer || require('./appUtil.js').appServer;
	exports.npcManager.init();
}