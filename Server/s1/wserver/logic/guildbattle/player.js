const utils = require("../../utils/utils.js");
const project = require('uw-config').project;
const dsConsts = require('uw-data').dsConsts;
const logger = require('uw-log').getLogger("uw-logger", __filename);
const dbhelper = require('../../utils/dbhelper.js');
const Actor = require('./actor.js').Actor; 
const Target = require('./actor.js').Target; 
const ActorPos = require("./actor.js").ActorPos;
const consts = require('./consts.js');
const c_bossOther = require('uw-data').c_bossOther;
const c_msgCode = require('uw-data').c_msgCode;
const gameUtils = require("../../utils/gameUtils.js");

var worldMapManager = null;   
var exports = module.exports;

class Hero {
	constructor(userId,heroId, maxHp, isRevive) {
		this.userId = userId;
		this.heroId = heroId;
		this.maxHp = maxHp;
		this.hp = maxHp; 
		this.pos = {};
		this.seq = 0;   // 序号
		this.isRevive = isRevive;		// 是否拥有水结晶
		this.revived = false;	// 是否已复活
		//logger.info("createHero:%s,%s,%s", userId,heroId, maxHp);
	}
	subHp(h){
		this.hp = this.hp - h;
		if(this.hp < 0)
			this.hp = 0;
		else if(this.hp > this.maxHp){
			this.hp = this.maxHp;
		}
		return this.hp;
	}
	setPos(x, y, dir){
		this.pos.x = x;
		this.pos.y = y;
		this.pos.dir = dir || 7;
	}
	getHp(){
		return this.hp;
	}
	setHp(hp){
		this.hp = hp;
	}
	isDead(){
		if (this.isRevive && !this.revived){	//  未复活
			return false;
		}
		return this.hp <= 0;
	}
	revive(hp){	// 复活
		this.hp = hp;
		this.revived = true;
	}
	respawn(){
		this.hp = this.maxHp;
		this.revived = false;		// 重置复活状态
	}
	getMaxHp(){
		return this.maxHp;
	}
	reload(maxHp){
		this.maxHp = maxHp;
		this.hp = maxHp;
	}
}

class Player extends Actor{
	constructor(socket, serverId, userData, heroData, showData,guildData) {
		super(consts.eActorType.player,userData.id);

		this.socket = socket; 
  		this.serverId = serverId; 
		this.offline = false; // 离线标识, 等待客户端主动断开连接
		this.map = null;
		this.heroList = {};

		this.combat = 0;		// 玩家战力 （由客户端更新)
		this.target = null;		// 玩家攻击目标(玩家或者boss)
 
		this.mhId = 0;  // 主英雄Id
		this.x = 0;		
		this.y = 0;		
		this.dir = 7;
		this.isFollow = false;   // 是否关注boss血量

		this.faction = null;	// 玩家阵营 
		this.isReady = false;		// 客户端是否已ready，可接受syncEnter信息
		//this.enterMapTime = null;  // 玩家进入地图时间

		this.status = consts.ePlayerStatus.alive;	// 玩家状态
		this.statusTime = new Date();	// 当前状态变换时间

		this.scoreTime = null;		// 记录积分的时间

		this.enterMsg = [];
		this.seqheroIds = [];
		this.setData(userData, heroData,showData,guildData);
		this.pickItemNum = 0;		// 宝箱拾取数目
	}  
	getMHeroId(){ 		//  按顺序取hero hp > 0
 		for(let i = 0; i < this.seqheroIds.length; i++){
 			let hec = this.heroList[this.seqheroIds[i]];
 			if(hec.getHp() > 0){
 				//console.log("getMHeroId:", hec.heroId);
 				return hec.heroId;
 			}
 		}
 		//console.log("getMHeroId:", 0, this.seqheroIds);
 		return 0; 
	}	
	isAllHeroDie(){ 
		let ids = Object.keys(this.heroList);
		for(let i = 0; i < ids.length; i++){
			let hero = this.heroList[ids[i]];
			if (!hero.isDead()){ 
				return false;
			}
		}
		return true;
	}
	getHp(){
		let hp = 0;
		let ids = Object.keys(this.heroList);
		for(let i = 0; i < ids.length; i++){
			let hero = this.heroList[ids[i]];
			hp += hero.hp;
		}
		return hp;
	}
	getUserId(){
		return this.getId();
		//return this.userData.id;
	}
	getPlayerId() { 
		return this.socket.id;
	}
	getName(){
		return this.userData.nickName;
	}
	getServerId(){
		return this.serverId;
	} 
	getMapId(){
		if (this.map)
			return this.map.getMapId();
		return ;
	}
	getGuildId(){
		return this.guildData[0] || 0;
	}
	getGuildLvl(){
		return this.guildData[2] || 0;
	}
	getGuildName(){
		return this.guildData[1] || '';
	}
	getGuildChairmanId(){
		return this.guildData[3] || 0;
	}
	unpickItem(){
		this.pickItemNum--;
	}
	pickItem(){
		this.pickItemNum++;
	}
	getPickItem(){
		return this.pickItemNum;
	}
	getProfile(){
		let p = {
			type : this.actorType,
			id :  this.getId(),
			maxHp : this.getMaxHp(),
			hp : this.getHp(),
			name : this.userData.nickName,
			iconId: this.userData.iconId,
			data : this.showData,
			guildId: this.guildData[0],
			guildName: this.guildData[1],
			//t: this.enterMapTime,
			mhId: this.mhId,
			x: this.x,
			y: this.y
		}
		p.target = {}
		if (this.target){
			p.target = this.target;
		} 
		return p;
	}
	getHero(heroId){
		return this.heroList[heroId];
	}
	getMaxHp(){
		//console.log("heroList:", this.heroList);
		let maxHp = 0;
		let ids = Object.keys(this.heroList);
		for(let i = 0; i < ids.length; i++){
			let hero = this.heroList[ids[i]];
			maxHp += hero.maxHp;
		}
		return maxHp;
	}
	isDead(){
		return this.status == consts.ePlayerStatus.dead;
	}	
	setDead(){
		this.status = consts.ePlayerStatus.dead;	 
		this.statusTime = new Date();	
	}
	setData(userData,heroData,showData,guildData){
		// 用户数据库数据
		this.userData = {};
		this.userData.id = userData.id;
		this.userData.nickName = userData.nickName;
		this.userData.lvl = userData.lvl; 
		this.userData.iconId = userData.iconId;
		this.showData = showData;
		this.guildData = guildData;
		this.seqheroIds = [];
		for(let i = 0; i < heroData.length; i++){
			let hec = heroData[i];
			this.seqheroIds.push(hec.id);
			if(!this.heroList[hec.id]){
				let hero = new Hero(this.getUserId(), hec.id, dbhelper.getMaxHp(hec), gameUtils.isReviveHero(hec));		
				hero.seq = i;
				this.heroList[hec.id] = hero;
			}else{
				this.heroList[hec.id].reload(dbhelper.getMaxHp(hec));
			}
		}
		//console.log("seqheroIds:", this.seqheroIds);
	}
	setMap(m){
		this.map = m;
	}
	setCombat(combat){
		this.combat = combat;
	}
	getCombat(){
		return this.combat;
	}
	setScoreTime(s){
		this.scoreTime = s;
	}
	getScoreTime(){
		return this.scoreTime;
	}
	bekickoff() {
		// 通知被顶掉
		logger.info("bekickoff:%s,%s", this.getPlayerId(), this.getUserId());
		this.send('kickout');
		if(this.mapId){
			this.broadcast('syncLeave', [this.getUserId()]);		
			this.socket.leave(this.mapId);	
		}
		this.offline = true;
	} 
	leaveMap() {
		logger.info("leaveMap:%s,%s", this.getPlayerId(), this.getUserId());
		if (this.offline) return;
		this.isReady  = false;
		//this.enterMapTime = null;
		this.enterMsg = [];
		this.clearTarget();

		//console.log("leaveMap :", this.getMapId(), this.socket.id); 
		if(this.map){ 
			this.map.leave(this);
			this.socket.leave(this.getMapId());
			this.map = null;
		}
	}
	logout() {
		logger.info("logout:%s,%s", this.getPlayerId(), this.getUserId());
		this.socket.disconnect();
		this.map = null;
		//this.enterMapTime = null;
		exports.playerManager.removePlayer(this);
	}
	getReady(){
		return this.isReady;
	}
	addEnterMsg(msg){
		this.enterMsg.push(msg);
	}
	readyDone(){
		if(this.isReady) {
			logger.info("ready again ignore ", this.getPlayerId(), this.getUserId());
			return;
		};
		this.isReady = true;
		logger.info("ready done ", this.getPlayerId(), this.getUserId());
		if (this.enterMsg.length > 0){
			this.send('syncEnter', this.enterMsg);
			this.enterMsg = [];
		}

		// 测试，立即开始
		//this.send('syncReady');
		this.map.playerReady(this);
	}
	enterMap(mapId) {
		var self = this;
		logger.info("enterMap:%s,%s,%s", self.getPlayerId(), self.getUserId(),mapId);
		if (self.offline) return;
		if (self.getMapId() == mapId) {
			this.sendTips(c_msgCode.wsGBatttleEnterAgain.id);
			logger.debug("player is in the same map: ", self.getUserId(), mapId);
			return;
		}

		worldMapManager = worldMapManager || require('./worldmap.js').worldMapManager; 
		let m = worldMapManager.getMap(mapId);
		if(!m){
			this.sendTips(c_msgCode.wsGBattleNoOpen.id);
			logger.info("enterMap:%s,%s,%s map not exist!", self.getPlayerId(), self.getUserId(),mapId);
			return;
		}

	 	if(self.map){
			self.leaveMap();
		}
		self.isReady = false;
		self.enterMsg = [];
		

		//this.enterMapTime = new Date();
		// 设置hero的pos

		//let cfg = c_bossOther[mapId].pos;
		self.mhId = self.getMHeroId();
		if(m.enter(self)){
			logger.debug("enter:", mapId, self.getUserId(), self.socket.id);	
			self.map = m;
			self.socket.join(mapId);
		}
	} 
	setPos(mhId, x, y, dir){
		this.mhId = mhId;
		this.x = x;
		this.y = y;
		this.dir = dir || 7;
	}	
	onChangePos(data){  
		if (data.id == this.getUserId()){		// 自身移动有效
			this.setPos(data.mhId, data.x, data.y, data.dir);
			this.broadcast("syncPos", data);
		}
	}
	onChangeTarget(data){
		if (!data || !data.id || data.id == 0){
  			this.clearTarget();
  		}else{
  			if (this.getUserId() == data.id){
  				return;
  			} 

  			//  返回target 
  			if(data.type == consts.eActorType.player){
  				// 打玩家
  				let targetPlayer = this.map.getPlayerInMap(data.id);  
  				if(targetPlayer.getHp() > 0){
  					this.setTarget(targetPlayer.getActorType(), targetPlayer.getUserId(), targetPlayer.getMHeroId()); 
  				}

  			}else{
  				let npc = this.map.getNpcInMap(data.id);   
  				if (npc && npc.getHp() > 0){
					this.setTarget(data.type, data.id, data.heroId); 
  				}
  			}
  		}

		let proto = {
			id : this.getUserId(),
			type : this.getActorType()
		}; 
		if (this.getTarget()){
			proto.target = this.getTarget();
		} 
		this.broadcastToMap('syncTarget',proto);
	}
	setTarget(actorType, id, heroId){
		 if(!this.map) return;  
		 this.target = new Target(actorType, id, heroId);
	}	
	respawn(){
		let ids = Object.keys(this.heroList);
		for(let i = 0; i < ids.length; i++){
			let hero = this.heroList[ids[i]];
			hero.respawn();
		} 
	}
	onGetPReward(data){
		if(!this.map) return;
		this.map.getPReward(this, data.idx);
	}
	onReviveHero(data){ 
		let hero = this.getHero(data.heroId);
		if(!hero) {
			return;
		}
		hero.revive(data.hp);
		hero.setPos(data.x, data.y, data.dir);
		let proto = {
			id : data.id,
			heroId: data.heroId,
			hp : data.hp,
			x : data.x,
			y : data.y,
			dir : data.dir, 		
			name : this.userData.nickName,
			iconId: this.userData.iconId,
			data : this.showData,
			guildId: this.guildData[0],
			guildName: this.guildData[1]
		} 
		this.broadcastToMap("syncReviveHero", proto); 

		if(this.isDead()){
			this.status = consts.ePlayerStatus.alive;	 
			this.statusTime = new Date();	
		}
		this.syncMHero(); 
	}
	onRevive(type){	// 复活
		if(!this.map) return;
		//if(!this.isDead()) return;
		if(this.status != consts.ePlayerStatus.dead) {
			logger.debug("revive the player is alive?????");
			return;
		}

		if(this.getHp() > 0){
			logger.debug("revive the player hp :", this.getHp());
			return;
		}
 
		this._revive(type);
	} 
	syncMHero(){
		let proto = {
			id: this.getUserId(), 
			mhId : this.getMHeroId()
		}; 
		this.broadcastToMap("syncMHero", proto); 
	}
	_revive(type){
		this.respawn(); 

		this.status = consts.eNpcStatus.alive;	 
		this.statusTime = new Date();	 
		this.clearTarget();

		if(!type){	// 不是花钱的用户
			let bornPos = this.map.getBornPos(this); 
			this.x = bornPos.x;
			this.y = bornPos.y;
		}

		let proto = {
			id: this.getUserId(),
			type: this.actorType,
			x: this.x,
			y: this.y,
			dir : this.dir
		};
 
		this.send("syncRevive", proto);
		this.syncTarget(true);
		//console.log("syncRevive:", proto);
		// 通知其他玩家，重进地图
		this.broadcast('syncEnter', [this.getProfile()]);	
	}
	syncTarget(all){	
		let proto = {
			id : this.getUserId(),
			heroId: this.getMHeroId(),
			type : this.getActorType() 
		}; 
		if (this.getTarget()){
			proto.target = this.getTarget();
		}
 		//console.log("playerSyncTarget", proto);
		// this.send('syncTarget',proto);
		// if(all)
			this.broadcastToMap('syncTarget',proto);
	} 
	clearTarget(){
  		this.target = null;
	}
	getTarget(){
		return this.target;
	}
	onHurt(data){
		if(this.offline || !this.map) return;
		this.map.hurt(this, data);
	}
	onHoldPillar(id){
		if(this.offline || !this.map) return;
		this.map.holdPillar(this, id);
	}
	onunHoldPillar(){
		if(this.offline || !this.map) return;
		this.map.unholdPillar(this);		
	}
	onSetHpFromClient(data){
		// 客户端同步自身HP给服务器更新 (譬如加血技能)
		if(this.offline || !this.map) return;
		this.map.setHpFromClient(this, data);
	}
	onpickChest(chestId){
		if(this.offline || !this.map) return;
	 	this.map.pickChest(this, chestId);
	}
	onunpickChest(chestId){
		if(this.offline || !this.map) return;
	 	this.map.unpickChest(this, chestId);
	}
	
	onsyncChest(){
		if(this.offline || !this.map) return;
	 	this.map.syncChest(this);
	}
	offLine() {
		this.leaveMap();
		this.logout();
	}
	syncHp(hero){
		let hpChange = {
			type : consts.eActorType.player,
			id : this.getUserId(),
			hp : hero.hp,
			heroId: hero.heroId, 
			mhId : this.getMHeroId()
		};  
		this.broadcastToMap("syncHp", hpChange);
	}
	sendTips(code, tips){
		let proto = { 
			code : code, 
			tips : tips
		}; 
		this.send("syncTips", proto);
	} 
	broadcast(protocol, data) { // exclude player self
		if (this.offline) return;
		//console.log("broadcast:", room, protocol, data);
		this.socket.to(this.getMapId()).emit(protocol, data);
	}
	send(protocol, data){
		if (this.offline) return;
		this.socket.emit(protocol, data);
	}
	broadcastToMap(protocol, data){
		if (this.offline) return;
		if(this.map){
			this.map.broadcast(protocol, data);
		}
	}
}

class PlayerManager{
	constructor() {
		this.playerList = {};
		this.userIdList = {};
	}
	getPlayerByUid(userId) {
		return this.userIdList[userId];
	}
	getPlayer(playerId) {
		return this.playerList[playerId];
	} 
	getHero(userId, heroId){
		let p = this.getPlayerByUid(userId);
		return p && p.getHero(heroId);
	}
	addPlayer(player) {
		//logger.info("addPlayer:", player.getUserId());
		if (this.userIdList[player.getUserId()]) {
			logger.info("the player repeat login !!!", player.getUserId());
		}

		let oldPlayer = this.userIdList[player.getUserId()];
		if (oldPlayer) { 
			oldPlayer.bekickoff();

			// 删除老用户，由客户端触发 :(
			// delete this.playerList[oldPlayer.getPlayerId()];
			// delete this.userIdList[oldPlayer.getUserId()];
		} 

		this.playerList[player.getPlayerId()] = player;
		this.userIdList[player.getUserId()] = player;
	}
	removePlayer(player){
		logger.info("offline user, delete player:", player.getPlayerId(), player.getUserId());
		delete this.playerList[player.getPlayerId()];

		let p2 = this.getPlayerByUid(player.getUserId());
		if(p2 && p2.getPlayerId() == player.getPlayerId()){
			logger.info("offline user, delete user:", player.getPlayerId(), player.getUserId() );
			delete this.userIdList[player.getUserId()];
		} 
	}
}
var playerManager = new PlayerManager();
exports.playerManager = playerManager;
exports.Player = Player;