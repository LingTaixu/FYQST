/*
 *	公会战数据
 */

const logger = require('uw-log').getLogger("uw-logger", __filename);
const consts = require('./consts.js');
const w2g = require('../../utils/w2g.js'); 
const c_game = require('uw-data').c_game;
const mailBiz = require("uw-mail").mailBiz; 

// boss战玩家
class GuildUser {
 	constructor(serverId, userId, nickName, guildId, guildName) {
 		this.serverId = serverId;
		this.userId = userId;
		this.nickName = nickName;
 		this.guildId = guildId;
 		this.guildName = guildName;
 		this.hurt = 0;		// 玩家伤害值
 		this.inspireNum = 0;
	}
	addHurt(h){
		this.hurt += h;
	} 
	getHurt(){
		return this.hurt;
	} 
	addInspire(){
		this.inspireNum++;
	}
	getInspire(){
		return this.inspireNum;
	}
};

// 公会
class Guild {
	constructor(guildId, guildName, serverId) {
		this.guildId = guildId;
		this.guildName = guildName;
		this.serverId = serverId; 
		this.gUserList = {}; 
	} 
	addGuildUser(player){
		let userId = player.getUserId();
		if (this.gUserList[userId]) return;
		//console.log("guild:addGuildUser ", player.getServerId(), userId, player.getName(), player.getGuildId(), player.getGuildName());
		let guser = new GuildUser(player.getServerId(), userId, player.getName(), player.getGuildId(), player.getGuildName());
		this.gUserList[player.getUserId()] = guser;
	}
	clear(){
		this.gUserList = {};
	}
	getGuildUser(player){
		let userId = player.getUserId();
		return this.gUserList[userId];
	}
	getGuildById(userId){
		return this.gUserList[userId];
	}
	getHurt(){
		let hurt = 0;
		let gUserIds = Object.keys(this.gUserList);
		for(let i = 0; i < gUserIds.length; i++){
			hurt += this.gUserList[gUserIds[i]].getHurt();
		}
		return hurt;
	}
	getGuildUserList(){
		return this.gUserList;
	} 
};

class GuildManager {
 	constructor() {
 		this.guildList = {};
	}	
	createGuild(guildId, guildName, serverId){
		//console.log("guild:createGuild ", guildId, guildName, serverId);
		if (this.guildList[guildId]){
			return;
		}

		let guild = new Guild(guildId, guildName, serverId);
		this.guildList[guildId] = guild;
		return guild;
	}
	getGuild(guildId){
		return this.guildList[guildId];
	}
	clear(){
		for(let guildId in this.guildList){
			let guild = this.guildList[guildId];
			guild.clear();
		}
		this.guildList = {};
	}
	getGuildUser(player){
		let guildId = player.getGuildId();
		let guild = this.guildList[guildId];
		if (!guild) return; 
		return guild.getGuildUser(player);
	} 
	getGuildUserById(guildId, userId){ 
		let guild = this.guildList[guildId];
		if (!guild) return; 
		return guild.getGuildUserById(userId);
	} 
	getUserRankByUid(uid){
		let ulst = this.getAllGuildUserRank();

		//console.log("getUserRankByUid:",uid, ulst);
		for(let i = 0; i < ulst.length; i++){
			if(ulst[i].userId == uid){
				return i;
			}
		}
		return -1;
	}
	getGuildRankByGid(gid){
		if(gid <= 0) {
			return -1;
		}
		let glst = this.getGuildRank();
		//console.log("getGuildRankByGid:",gid, glst);
		for(let i = 0; i < glst.length; i++){
			if(glst[i].guildId == gid){
				return i;
			}
		}
		return -1;
	}
	getAllGuildUserRankProto(){
		let allUserList = [];
		for(let guildId in this.guildList){
			let guild = this.guildList[guildId];
			
			let guildUserList = guild.getGuildUserList();
			for(let userId in guildUserList){
				let guildUser = guildUserList[userId]; 
				let info = {
					userId : guildUser.userId,
					nickName : guildUser.nickName,
					sid: guildUser.serverId,
					hurt : guildUser.getHurt() 
				};
				allUserList.push(info);
			}
		}
		allUserList.sort(function(e1, e2){
			return e2.hurt - e1.hurt;
		});
		//console.log("getAllGuildUserRankProto:", allUserList);
		return allUserList;
	}
	getAllGuildUserRank(){
		let allUserList = [];
		for(let guildId in this.guildList){
			let guild = this.guildList[guildId];
			let guildUserList = guild.getGuildUserList();
			for(let userId in guildUserList){
				let guildUser = guildUserList[userId]; 
				allUserList.push(guildUser);
			}
		}
		allUserList.sort(function(e1, e2){
			return e2.hurt - e1.hurt;
		});
		//console.log("getAllGuildUserRank:", allUserList);
		return allUserList;
	}
	getGuildRank(){
		let rankList = [];
		for(let guildId in this.guildList){
			if (guildId == 0) {		// 无行会
				continue;
			}
			let guild = this.guildList[guildId];
			let info = {
				guildId : guildId,
				guildName : guild.guildName,
				hurt : guild.getHurt(),
				sid : guild.serverId
			};
			rankList.push(info);
		}

		rankList.sort(function(e1, e2){
			return  e2.hurt - e1.hurt;
		});
		return rankList;
	}
	getUserRank3(){
		//  玩家排行前3
		let proto = {}; 
		let rankList = this.getAllGuildUserRankProto();
		let urank3 = [];
		if(rankList.length > 3){
			urank3.push(rankList[0]);
			urank3.push(rankList[1]);
			urank3.push(rankList[2]);
			proto.urank3 = urank3;
		}else{
			proto.urank3 = rankList;
		}  
		return proto;		
	}
	getGuildWBResult(){
		// 世界boss战斗结构
		let ret = {};
		ret.glist = this.getGuildRank();
		ret.ulist = this.getAllGuildUserRankProto();
		return ret;
	}
} 

var guildManager = new GuildManager();
module.exports.guildManager = guildManager; 
module.exports.init = function() {
};
