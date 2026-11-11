const utils = require("../../utils/utils.js");
const project = require('uw-config').project;
const dsConsts = require('uw-data').dsConsts;
const logger = require('uw-log').getLogger("uw-logger", __filename);
const moduleNsp = '/city';
class Player {
	constructor(socket, serverId, pos, data) {
		let po = pos.split(",");
		this.x = po[0];
		this.y = po[1];
		this.socket = socket;
		let userData = data[0];
		this.data = data[1];
		this.data.rid = userData.id;
		this.userId =  userData.id;
		//this.data.pos = [this.x, this.y];
		this.data.path = [];
		this.serverId = serverId;
		//this.lastPath = [];
		this.map = null;
		this.offline = false; // 离线标识, 等待客户端主动断开连接
		this.join = false;	// 是否参加女神活动
		this.lastGetExp = new Date();	// 最后获得经验的时间 
	} 
	setData(data){
		var path = this.data.path;
		let userData = data[0];
		this.data = data[1];
		this.data.rid = userData.id;
		this.userId =  userData.id;
		this.data.path = path;
	}
	getUserId() { 
		return this.userId;
		//return this.data.v['1'][dsConsts.UserEntity.id];
	}
	getPlayerId() { 
		return this.socket.id;
	}
	getServerId(){
		return this.serverId;
	}
	getProfile(){
		return this.data;
	}
	getMapId(){
		if (this.map)
			return this.map.getMapId();
		return ;
	}
	setPos(pos){
		if (this.offline) return;
		this.x = pos[0];
		this.y = pos[1];
		//this.data.pos = pos;	
	}
	setPath(path) {
		if (this.offline) return; 
		this.setPos([path[0].x, path[0].y]);
		//this.lastPath = path;
		this.data.path = path;
	} 
	bekickoff() {
		// 通知被顶掉
		logger.info("bekickoff:%s,%s", this.getPlayerId(), this.getUserId());
		this.send('kickout');
		if(this.map){		
			this.broadcast('syncLeave', [this.getUserId()]);		
			this.socket.leave(this.getMapId());
			this.offline = true;
		}
	}
	leave() {
		if (this.offline) return;
		//console.log("leaveroom :", room, this.socket.id); 
		this.broadcast('syncLeave', [this.getUserId()]);
		this.join = false;
		if(this.map){ 
			this.map.leaveWorld(this);
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
	enter(map, pos) {
		if (this.offline) return;
		if(this.getMapId() == map.getMapId()){
			logger.debug("player is in the same map: ", this.getUserId(), map.getMapId());
			return;
		}

		logger.debug("enter:", map.getMapId(), this.getUserId(), this.socket.id);
		this.map = map;
		this.socket.join(map.getMapId());
		this.join = false;

		// send self to others
		this.broadcast('syncEnter', [this.data]);
		logger.debug("syncEnter new user to other, new user : ", this.getUserId(), this.socket.id);
		if (pos) {
			this.setPos(pos);
		}
		this.map.enterWorld(this);
	}
	move(data){ 
		if(this.offline || !this.map) return;

		let oldX = this.x;
		let oldY = this.y;
		let newX = data.path[0].x;
		let newY = data.path[0].y;
		data.rid = this.data.rid;
		this.setPath(data.path);
		this.broadcast('syncPos', [data]);

		//this.map.move(this, data);
 
		// let oldRoom = this.computeInRoom(oldX, oldY);
		// let newRoom = this.computeInRoom(newX, newY);
		// if (oldRoom == newRoom) {
		// 	player.broadcast(oldRoom, 'syncPos', [data]);
		// } else {
		// 	player.leave(oldRoom);
		// 	player.enter(newRoom);
		// 	player.broadcast(newRoom, 'syncPos', [data]);
		// }
	}
	update(tm){		// 玩家check循环, tm是当前时间
 		
	}
	updateUserInfo(){
		//if (this.offline) return;
		if(!this.map) return;
		this.broadcast('syncUser', [this.data]);
		this.send('syncUser', [this.data]);
	}
	joinGodness(){
		if(!this.map || this.offline)  return;
	 	this.map.joinGodness(this);
	}
	setJoinGodness(s){
		this.join = s;
	}
	getJoinGodness(){
		return this.join;
	} 
	pickChest(chestId){
		if(!this.map || this.offline)  {
			console.error("pickChest err:", this.getUserId(), chestId, this.offline);
			return;
		}
	 	this.map.pickChest(this, chestId);
	}
	offLine() {
		this.leave();
		this.logout();
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
	getServerId(playerId){
		if (this.playerList[playerId]){
			this.playerList[playerId].getServerId();
		}
		return 0;
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
module.exports.playerManager = playerManager;
module.exports.Player = Player;
