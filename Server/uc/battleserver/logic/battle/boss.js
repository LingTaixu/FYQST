/*
 *    boss信息
 */ 

const Actor = require('./actor.js').Actor; 
const Target = require('./actor.js').Target; 
const consts = require('./consts.js');
const c_bossOther = require('uw-data').c_bossOther;
const c_bossCSWorld = require('uw-data').c_bossCSWorld;
const t_monster = require('uw-data').t_monster; 
const w2g = require('../../utils/w2g.js');
const zlarea = require("./area.js").zlarea;
const hjarea = require("./area.js").hjarea;
const logger = require('uw-log').getLogger("uw-logger", __filename);
var exports = module.exports;

var appServer = null;
//var worldMapManager = null;

// 参加BossPlayer
class BossPlayer {
	constructor(userId, serverId, name,  combat){
		this.userId = userId;
		this.serverId = serverId;
		this.userName = name;
		this.combat = combat;
		this.beKillNum = 0;		// 被玩家杀死次数
		this.killNum = 0;		// 杀人数 
	}
	addKillNum(){
		this.killNum++;
	}
	addBeKillNum(){
		this.beKillNum++;
	} 
}

// 世界boss 技能
class Skill {
	constructor(id, t, hurt){
		this.id = id;
		this.executeTime = t;	//	执行时间点
		this.hurt = hurt;	// aoe 伤害
	}
}

 class Boss extends Actor{
 	constructor(type, id, groupType, map) {
 		super(consts.eActorType.boss,id);
		this.bossType = type; 	
		this.groupType = groupType;
		this.map = map;
		this.status = consts.eBossStatus.init;	// boss状态
		this.statusTime = new Date();	// 当前状态变换时间
		this.target = new Target(consts.eActorType.player, 0, 0);//  攻击目标
		this.ownerId = 0;	// 所属者 

		let cfg = null;
		if(this.bossType == consts.eBossType.CSWorldBoss){
			cfg = c_bossCSWorld[id];
		}else{
			cfg = c_bossOther[id];
		}
		//console.log("bossId:", id,", type:", this.bossType);
		let maxHp = t_monster[id].maxHp;
		this.setMaxHp(maxHp);  
		this.bornTime = null;
		this.userIdList = {};		// 攻打过该BOSS的用户Id
		this.bornX = cfg.pos[0][0];
		this.bornY = cfg.pos[0][1];
//		console.log("CONSTRUCTOR BOSS:", id, cfg);
		this.pos = {
			x : this.bornX,
			y : this.bornY,
			dir : 7
		}; 
		this.fightStatus = consts.eFightStatus.idle;	// 正常
		this.fightStatusTime = new Date(); // 当前状态开始时间
		this.shieldNum = 0;			// 触发护盾次数
		this.firstFightTime = null;	// 首次被攻击时间

		this.targetStatus = consts.eLoseTargetStatus.init;
		this.targetStatusTime = new Date();

		this.lastOwnerUId = 0;
		this.lastOwnerUName = ""; 
		this.lastOwnerGName = "";

		this.perReduceHp = 0;
		if(this.bossType == consts.eBossType.CSWorldBoss){
			this.perReduceHp =  Math.floor(maxHp / cfg.alive); // Math.floor(maxHp / 30); // 
		}

		// 如果是定时扣血量的boss, 每秒扣血量hp
		this.beAttacked = false;			// 被攻击 （是否被攻击)
		this.beAttackedTime = null;			// 被攻击时间 (2秒钟没有被攻击，不再扣血)
		this.lastReduceTime = new Date();		// 上次扣血时间

		// boss aoe
		this.skillArr = [];
		if(this.bossType == consts.eBossType.CSWorldBoss){
			for(let i = 0; i < cfg.skills.length; i++){
				let c = cfg.skills[i]; 
				let t = new Date().addSeconds(c[1]);
				this.skillArr.push(new Skill(c[0],t,c[2]));
			}  
			//console.log("skillArr:", this.skillArr);
		}
		// boss bonus 福利值, 每掉10% 每个用户随机出神秘钥匙
		this.bonusValue = 0;	
	} 
	canActivateShield(){	//是否可触发护盾
		if  (this.shieldNum > 0){	// 已触发护盾
			return false;
		}
		if(this.getHp() <= this.getMaxHp() * consts.eCONST.SHIELD_ACTIVATE_HP){
			return true;
		}
		return false;
	}
	activateShield(){
		this.shieldNum++;
		this.setFightStatus(consts.eFightStatus.shield);
	}
	setBeAttacked(){
		 if(!this.beAttacked){	// 变为被攻击状态
		 	this.lastReduceTime = new Date();		// 刷新扣血时间
		 	//console.log("boss setBeAttacked, reset reduceTime:", this.lastReduceTime);
		 }
		 //console.log("boss setBeAttacked ");
		 this.beAttacked = true;
		 this.beAttackedTime = new Date();
	}
    clearBeAttacked(){
    	//console.log("clearBeAttacked");
    	this.beAttacked = false;
    	this.lastReduceTime = new Date();		// 刷新扣血时间
    }
    refreshReduceHpTime(){
    	this.lastReduceTime = new Date();		// 刷新扣血时间
    	//console.log("boss refreshReduceHpTime reduceTime:", this.lastReduceTime);
    }
	getStatus(){
		return this.status;
	} 
	getStatusTime(){
		return this.statusTime;
	} 
	getDeadTime(){
		if (this.status == consts.eBossStatus.dead){
			return this.statusTime;
		}else if (this.status == consts.eBossStatus.readyForAlive){
			return this.statusTime;
		}
	}
	getFightStatus(){
		return this.fightStatus;
	}
	setFightStatus(s){
		if (this.fightStatus != s){
			this.fightStatus = s;
			this.fightStatusTime = new Date();
		}
	}
	setFirstFightTime(){
		if(!this.firstFightTime){
			this.firstFightTime = new Date();
		}
	}
	// 记录最后的归属者信息
	recordNewestOwner(userId, userName,  guildName){
		//console.log("recordNewestOwner:", userId, userName, guildName);
		this.lastOwnerUId = userId;
		this.lastOwnerUName = userName; 
		this.lastOwnerGName = guildName;	
	}
	changePos(x, y, dir){
		this.pos.x = x;
		this.pos.y = y;
		this.pos.dir = dir;
	}
	subHp(h){
		let oldHp = this.hp;
		this.hp -= h;
		if (this.hp <= 0){
			this.hp = 0; 
		}else if(this.hp > this.maxHp){
			this.hp = this.maxHp;
		}

		let nextBonusValue = this.bonusValue + 1;
		let bonusHp = this.getMaxHp() * (1 - nextBonusValue / 10);
		if (oldHp > bonusHp && this.hp <= bonusHp){
			// 触发掉落逻辑
			this.map.dropBossBonus(this.bonusValue);
			this.bonusValue = nextBonusValue;
		}

		return this.hp;
	}
	setPos2BornPos(){
		this.pos.x = this.bornX;
		this.pos.y = this.bornY;
	}
	spawn(){  
		this.setHp(this.getMaxHp());
		this.changeStatus(consts.eBossStatus.alive);
		this.bornTime = new Date();
		this.userIdList = {};
		this.clearOwner();
		let cfg = null;
		if(this.bossType == consts.eBossType.CSWorldBoss){
			cfg = c_bossCSWorld[this.id];
		}else{
			cfg = c_bossOther[this.id];
		}
		this.pos = {
			x : cfg.pos[0][0],
			y : cfg.pos[0][1]
		};

		this.fightStatus = consts.eFightStatus.normal;	// 正常
		this.fightStatusTime = new Date(); 				// 当前状态开始时间
		this.shieldNum = 0;								// 触发护盾次数

		this.targetStatus = consts.eLoseTargetStatus.init;
		this.targetStatusTime = new Date();

		// this.lastOwnerUId = 0;
		// this.lastOwnerUName = ""; 
		// this.lastOwnerGName = "";
	}
	fixBornTime(tm){
		this.bornTime = tm;
	}
	changeStatus(status){
		//console.log("boss changeStatus:", this.getId(), this.status, "->", status);
		this.status = status;
		this.statusTime = new Date();
	}
	checkFightStatus(){
		let changed = false;
		if(this.fightStatus == consts.eFightStatus.shield){
			let tmNow = new Date();
			let sec = this.fightStatusTime.getSecondsBetween(tmNow);
			if(sec >= consts.eCONST.SHEILD_MAX_TIME){
				this.setFightStatus(consts.eFightStatus.normal);
				changed = true;
			}
		}
		return changed;
	}
	canJoin(player, cb){
		//let cfg = c_bossOther[id]; 
		if (this.userIdList[player.getUserId()]){
			return cb(null);
		} 
		// 参与异界boss
		w2g.enterWBoss(player.getUserId(), this.bossType, this.getId(), player.getServerId(), (err, exUserData) => {
			//console.log("w2g.enterWBoss.canJoin:", err, exUserData);
			if(err) {
				logger.info("ENTERWBOSS FAIL :%d,%d,%d,%j", player.getUserId(), this.bossType, this.getId(),err);
				//return cb(err);
			} 
			// if(!exUserData || exUserData.errcode) {
			// 	logger.info("ENTERWBOSS FAIL2 :%d,%d,%d,%j", player.getUserId(), this.bossType, this.getId(),exUserData);
			// 	return cb('numlimit');
			// }
			// player.send("syncUserData", exUserData);
			return cb(null);
		}); 
	}
 	getProfile(){
 		let p = {
 			id : this.getId(),
 			type : this.type,
 			fightType: this.bossType,
 			maxHp: this.getMaxHp(),
 			hp : this.getHp(),
 			x : this.pos.x,
 			y : this.pos.y, 
 			dir : this.pos.dir,
 			target: {}
 		}
 
 		if(this.fightStatus == consts.eFightStatus.shield){
 			p.shield = 1;
 			p.shieldEndTime = 0;
 			let tmNow = new Date();
 			let sec = this.fightStatusTime.getSecondsBetween(tmNow);
 			if(sec < consts.eCONST.SHEILD_MAX_TIME ){
 				p.shieldEndTime =  consts.eCONST.SHEILD_MAX_TIME - sec;
 			} 
 		}

 		if(this.target.id > 0){
 			p.target = {
 				id:this.target.id,
 				heroId: this.target.heroId,
 				type : consts.eActorType.player
 			};
 		}  
 		p.ownerId =  this.ownerId;
 		return p;
 	}
 	setOwner(id){
 		//console.error("setOwner:", id);
 		this.ownerId = id;
 	} 
 	clearOwner(){
 		this.ownerId = 0; 
 	}
 	getOwnerId(){
 		return this.ownerId;
 	} 	
 	clearTarget(){
 		this.target.id = 0;
 		this.target.heroId = 0;
 		this.setLoseTargetStatus(consts.eLoseTargetStatus.noTarget);
 	}
 	setLoseTargetStatus(s){
 		if(this.targetStatus != s){
	 		//console.log("the boss setLoseTargetStatus:", this.targetStatus, "->", s);
	 		this.targetStatus = s;
	 		this.targetStatusTime = new Date();
 		}
 	}
 	getLoseTargetStatus(){
 		return this.targetStatus;
 	}
 	getLoseTargetStatusTime(){
 		return this.targetStatusTime;
 	} 
 	getTargetId(){
 		return this.target.id;
 	}
 	getTarget(){
 		return this.target;
 	}
 	setTarget(id, heroId){
 		if(heroId <= 0){
 			logger.info("BOSS SETTARGET ERR:", id, heroId);
 			this.clearTarget();
 		}else{
 			this.setLoseTargetStatus(consts.eLoseTargetStatus.haveTarget);
	 		this.target.id = id;
	 		this.target.heroId = heroId;
 		}
 	}
 	syncTarget(player){
		// boss 归属
		let proto = {
			id : this.getId(),
			heroId : this.getId(),
			type : consts.eActorType.boss 
		};
		if (this.getTargetId() > 0){
			proto.target = {};
			proto.target.id = this.getTargetId();
			proto.target.heroId = this.getTarget().heroId;
			proto.target.type = consts.eActorType.player;
		}
		//console.log("syncTarget:", proto);
		if(player){
			player.send('syncTarget',proto);
		}else{
			this.broadcastToMap('syncTarget',proto);	
		}
	} 	
	syncBossOwner(){
		// boss 归属
		let proto = {
			ownerId : this.getOwnerId() 
		}; 
		//console.log("syncBossOwner:", proto);
		this.broadcastToMap('syncBossOwner',proto);	
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
 	// BossPlayer管理 
 	addBossPlayer(userId, serverId, userName, combat){
 		let bossPlayer = this.userIdList[userId];
 		if(bossPlayer){
 			bossPlayer.combat = combat;
 		}else{
 			bossPlayer = new BossPlayer(userId, serverId, userName, combat);
 			this.userIdList[userId] = bossPlayer;
 		} 
 	}
 	getBossPlayer(userId){
 		return this.userIdList[userId];
 	} 	
 	broadcastToMap(protocol, data){
		if (this.map){
			this.map.broadcast(protocol, data);
		}
	}
 }

 class BossManager{
 	constructor() {
 		this.bossList = {}; 
 		this.TMDirty = false;   // 控制重生广播
 		this.HJDirty = false;   // 异界boss血量
 	}
 	init(){   
 	} 
 	createBoss(type, bossId, groupType, m){ 
 		let npc = new Boss(type, bossId, groupType, m);
 		this.bossList[bossId] = npc;
 		return npc;
 	} 
 	setTMDirty(s){
 		this.TMDirty = s;
 	} 	
 	setHJDirty(s){
 		this.HJDirty = s;
 	}
 	getBossListByType(type){
 		let lst = [];
 		let bossIds = Object.keys(this.bossList);
 		//console.error("getBossListByType:", this.bossList);
 		for(let i = 0; i < bossIds.length; i++){
 			let bossId = bossIds[i];
 			let boss = this.bossList[bossId];
 			if(boss.bossType == type){
	 			lst.push(
					{
						id: boss.getId(),
						type: boss.bossType,
						hp: boss.getHp(),
						bornTime: boss.bornTime,
						lastOwnerUId: boss.lastOwnerUId,
						lastOwnerUName: boss.lastOwnerUName,
						lastOwnerGName: boss.lastOwnerGName,
						deadTime: boss.getDeadTime()
					}
 				);
 			}
 		}
 		return lst;
 	}
 	check(){ 
 		if(this.TMDirty){ 
 			let tmData = this.getBossListByType(consts.eBossType.CSTianMing);
 			zlarea.broadcastToAll("syncBossInfo", tmData); 
 			this.setTMDirty(false);
 		}
 		if(this.HJDirty){
 		 	let tmData = this.getBossListByType(consts.eBossType.HJBoss);
 			hjarea.broadcast("syncBossInfo", tmData); 
 			this.setHJDirty(false);	
 		}
 	}
 }


var bossManager = new BossManager();

exports.bossManager = bossManager
exports.init = function() {
	appServer = appServer || require('./appUtil.js').appServer;
	exports.bossManager.init();
}