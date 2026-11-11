/*
 *	公会战数据
 */

const logger = require('uw-log').getLogger("uw-logger", __filename);
const consts = require('./consts.js');
const w2g = require('../../utils/w2g.js'); 
const c_game = require('uw-data').c_game;
const mailBiz = require("uw-mail").mailBiz;
const ActorPos = require("./actor.js").ActorPos; 

var scoreAwardCfg = [];
var _initAwardCfg = function(){
	let awardCfg = c_game.guildBattleCfg[3].split(";");
	for(let i = 0; i < awardCfg.length; i++){
		let s = awardCfg[i].split(",");
		scoreAwardCfg.push([parseInt(s[0]),parseInt(s[1]),parseInt(s[2])]);
	}
};

// 公会战玩家
class GuildUser {
 	constructor(userId, nickName, guildId, guildName) {
		this.userId = userId;
		this.nickName = nickName;
 		this.guildId = guildId;
 		this.guildName = guildName;
 		this.score = 0;		// 玩家积分 
 		this.rewardIndex = [0,0,0,0,0];
	}
	addScore(type){
		//console.log("addScore:", type);
		let oldScore = this.score;
		// 杀怪
		switch(type){
			case consts.eAddScoreType.killNpc:
				this.score += 1;
				break;
			case consts.eAddScoreType.killPlayer:
				this.score += 2;
				break;
			case consts.eAddScoreType.participatTime:
				this.score += 1;
				break;
		}
		//this.checkScoreAward(oldScore, this.score);
	} 
	getRewardIndex(){
		return this.rewardIndex;
	}
	getScore(){
		return this.score;
	}
	canGetReward(idx){
		if (this.rewardIndex[idx] == 1) return false;
		return scoreAwardCfg[idx][0] <= this.score;
	}
	getReward(idx){
		this.rewardIndex[idx] = 1;
	}
	resetReward(idx){
		this.rewardIndex[idx] = 0;
	}
};

// 公会
class Guild {
	constructor(guildId, guildName, chairmanId) {
		this.guildId = guildId;
		this.guildName = guildName;
		this.chairmanId = chairmanId; 
		this.chairmanName = '';
		this.pillarScore = 0;		// 柱子积分
		this.score = 0;				// 计算出的积分
		this.gUserList = {};
		this.guildBornPos = null;		// 公会出生点
	}
	getGuildBornPos(){
		return this.guildBornPos;
	}
	setGuildBornPos(x,y,dir){
		this.guildBornPos = new ActorPos(x, y, dir);
	}
	addGuildUser(player){
		let userId = player.getUserId();
		if (this.gUserList[userId]) return;
		let guser = new GuildUser(userId, player.getName(), player.getGuildId(), player.getGuildName());
		this.gUserList[player.getUserId()] = guser;
	}
	clear(){
		this.gUserList = {};
	}
	getGuildUser(player){
		let userId = player.getUserId();
		return this.gUserList[userId];
	} 
	addPillarScore(n){
		this.pillarScore +=n;
	}
	getScore(){
		let userScoreList = [];
		let gUserIds = Object.keys(this.gUserList);
		gUserIds.forEach((uid) => {
			let gUser = this.gUserList[uid];
			userScoreList.push(gUser.getScore()); 
		});
		userScoreList.sort();
		let userScore = 0;

		// 前3 
		let isOver = false;
		let score1 = 0;
		let score2 = 0;
		let score3 = 0;
		for(let i = 0; i < 3; i++){
			if (userScoreList[i]){
				score1 += userScoreList[i];
			}else{
				isOver = true;
				break;
			}
		} 

		if(!isOver){
			for(let i = 3; i < 10; i++){
				if (userScoreList[i]){
					score2 += userScoreList[i];
				}else{
					isOver = true;
					break;
				}
			} 
		}

		if(!isOver){
			for(let i = 10; i < 20; i++){
				if (userScoreList[i]){
					score3 += userScoreList[i];
				}else{
					isOver = true;
					break;
				}
			} 
		}

		let uscore = Math.ceil(score1 * .5 + score2 * .2 + score3 * .1);
		this.score = uscore + this.pillarScore; 
		return this.score;
	}
	getGuildUserList(){
		return this.gUserList;
	} 
};

class GuildManager {
 	constructor() {
 		this.guildList = {};
	}	
	createGuild(guildId, guildName, chairmanId, serverId){
		if (this.guildList[guildId]){
			return;
		}

		let guild = new Guild(guildId, guildName, chairmanId);
		this.guildList[guildId] = guild;
		w2g.getUserInfo(chairmanId,  serverId, (err, userInfo) => {
			if(err) return;  
			guild.chairmanName = userInfo.nickName;
		});
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
	getAllGuildUserRank(){
		let allUserList = [];
		for(let guildId in this.guildList){
			let guild = this.guildList[guildId];
			
			let guildUserList = guild.getGuildUserList();
			for(let userId in guildUserList){
				let guildUser = guildUserList[userId]; 
				let info = {
					userId : guildUser.userId,
					nickName : guildUser.nickName,
					guildId : guildId,
					guildName : guild.guildName,
					chairmanId: guild.chairmanId,
					chairmanName: guild.chairmanName,
					score : guildUser.getScore()
				};
				allUserList.push(info);
			}
		}
		allUserList.sort(function(e1, e2){
			return e2.score - e1.score;
		});
		console.log("getAllGuildUserRank:", allUserList);
		return allUserList;
	}
	getGuildRank(){
		let rankList = [];
		for(let guildId in this.guildList){
			let guild = this.guildList[guildId];
			let info = {
				guildId : guildId,
				guildName : guild.guildName,
				score: guild.getScore()
			};
			rankList.push(info);
		}

		rankList.sort(function(e1, e2){
			return e2.score - e1.score;
		});
		return rankList;
	}
	getGuildBattleResult(){
		let rankList = [];
		for(var guildId in this.guildList){
			let guild = this.guildList[guildId]; 
			let info = {
				guildId : guildId,
				guildName : guild.guildName,
				chairmanId: guild.chairmanId,
				chairmanName: guild.chairmanName,
				score: guild.getScore()
			};
			rankList.push(info);
		}

		rankList.sort(function(e1, e2){
			return e2.score - e1.score;
		});

		console.log("getGuildBattleResult:", rankList);
		return rankList;
	}
} 

var guildManager = new GuildManager();
module.exports.guildManager = guildManager; 
module.exports.init = function() {
	_initAwardCfg();
} 
