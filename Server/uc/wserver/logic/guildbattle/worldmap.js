// 地图 1920 x 2560 客户端格子40x40  协议是格子坐标
const logger = require('uw-log').getLogger("uw-logger", __filename);
var playerManager = require('./player.js').playerManager;
var npcManager = require('./npc.js').npcManager;
var pillarManager = require('./pillar.js').pillarManager;
var guildManager = require('./guilduser.js').guildManager;
var chestManager = require('./chest.js').chestManager;
const consts = require('./consts.js');
const ActorPos = require("./actor.js").ActorPos;
const battleMgr = require("./battle.js").battleMgr;
const c_bossOther = require('uw-data').c_bossOther;
const mailBiz = require("uw-mail").mailBiz;
const bossUtils = require("uw-boss").bossUtils;
//const dbhelper = require('../../utils/dbhelper.js');
const t_monster = require("uw-data").t_monster;
const osslog = require('../../utils/osslog.js');
const projectConfig = require('uw-config').project;
const c_msgCode = require('uw-data').c_msgCode;
var getMsg = require("uw-utils").msgFunc(__filename);
var w2g = require('../../utils/w2g.js'); 
var appServer = null;
var moduleNsp = null;
 

class npcConfig{
	constructor(id, x, y, npcId){
		this.id = id;
		this.x = x;
		this.y = y;
		this.npcId = npcId;
		this.status = consts.eNpcCfgStatus.init;
		this.statusTime = new Date(); 
	}
	changeStatus(s){
		this.status = s;
		this.statusTime = new Date();
	}
}

class WorldMap {
    // mapData [npc]
    constructor(mapId, mapData) {
        this.id = mapId; // 地图id (或者bossId) 
        this.bornPos = mapData.born;
        this.npcList = {};
        this.pillarList = {};
        this.userList = {};
        this.curPos = 0; // 维护出生点坐标

        this.npcCfg = {}; // npc配置
        this.pillarCfg = {};
        let npcCfg = mapData.npc;
        let pillarCfg = mapData.pillar;
        this.eggCfg = mapData.egg;
        for (let i = 0; i < npcCfg.length; i++) {
            let pos = npcCfg[i];
            let cfg = new npcConfig(i + 1, pos[0], pos[1], consts.eCONST.NPC_BZYJ_ID);
            this.npcCfg[i + 1] = cfg;
        }

        for (let i = 0; i < pillarCfg.length; i++) {
            let pos = pillarCfg[i];
            let cfg = new npcConfig(i + 1, pos[0], pos[1], consts.eCONST.NPC_PILLAR_ID);
            this.pillarCfg[i + 1] = cfg;
        }

        this.syncGuildRankTime = new Date(); // 同步公会排行数据时间
        this.createTime = new Date(); // 地图创建时间
        this.battleStartTime = null;
        this.mapStatus = consts.eMapStatus.init; // 地图状态

        this.guildTop8 = []; // 参加公会战的前8的公会
    }
    getNewPosIndex() {
        return this.curPos++ % this.bornPos.length;
    }
    getGuildCombatRank(guildId) { // 下标从0开始, 0是第一名
        //logger.error("getGuildCombatRank: ",this.guildTop8, guildId); 
        for (let i = 0; i < this.guildTop8.length; ++i) {
            if (this.guildTop8[i].userId == guildId) {
                return i;
            }
        }
        return -1;
    }
    getBornPos(player) {
        let guildId = player.getGuildId();
        let rank = this.getGuildCombatRank(guildId);
        if (rank == -1) {
            // 测试代码 随机给坐标
            //rank = this.getNewPosIndex();
            return;
        }
        return new ActorPos(this.bornPos[rank][0], this.bornPos[rank][1], 7);
    }
    getMapId() {
        return this.id;
    }
    getNpcInMap(id) {
        return this.npcList[id];
    }
    getPlayerInMap(id) {
        return this.userList[id];
    }
    initMap() {
        // 初始化地图资源 刷NPC，怪
        for (var i in this.npcCfg) {
            let cfg = this.npcCfg[i];
            cfg.changeStatus(consts.eNpcCfgStatus.done);
            let npc = npcManager.createNpc(cfg);
            npc.setMap(this);
            this.npcList[npc.getId()] = npc;
        };

        for (var i in this.pillarCfg) {
            let cfg = this.pillarCfg[i];
            cfg.changeStatus(consts.eNpcCfgStatus.done);
            let p = pillarManager.createPillar(cfg);
            p.setMap(this);
            this.pillarList[p.getId()] = p;
        };
        chestManager.init(this);
    }
    prepareBattle(cb) {
        w2g.getGuildCombatRank8(projectConfig.serverId, (err, data) => {
            logger.error("getGuildCombatRank8 From DB: ", err, data);
            if (err) return cb(err);
            if (!data || data.length <= 0) return cb("no rankList");
            this.guildTop8 = data;
            return cb(null);
        });
    }
    playerReady(player) {
        // 如果已过ready状态
        if (this.mapStatus == consts.eMapStatus.beginBattle || this.mapStatus == consts.eMapStatus.battle || this.mapStatus == consts.eMapStatus.eggact) {
            player.send('syncReady');
        }
    }
    startBattle() {
        logger.info("startBattle:");
        // 通知ready
        this.broadcast('syncReady');
    }
    isBattleStatus() {
        return this.mapStatus == consts.eMapStatus.battle;
    }
    isEggActStatus() {
        return this.mapStatus == consts.eMapStatus.eggact;
    }
    enter(player) {
    	if (this.mapStatus == consts.eMapStatus.eggact){
        	player.sendTips(c_msgCode.wsGBattleEnd.id);
        }
        if (this.mapStatus != consts.eMapStatus.enterBattle &&
            this.mapStatus != consts.eMapStatus.beginBattle &&
            this.mapStatus != consts.eMapStatus.battle
            ) {
            player.sendTips(c_msgCode.wsGBattleNoOpen.id);
            console.log("mapStatus cant enter:", this.mapStatus);
            return false;
        }
        // 进地图,玩家伙伴全部恢复生命
        if (player.getGuildId() <= 0) {
            player.sendTips(c_msgCode.wsNoGuild.id);
            console.log("no Guild:", player.getGuildId());
            return false;
        }

        // 是否可以进
        let bornPos = this.getBornPos(player);
        if (!bornPos) {
            player.sendTips(c_msgCode.wsGuildNotTop8.id);
            console.log("your Guild cant part in this battle, not top8", player.getGuildId());
            return false;
        }

        player.respawn();

        //console.log("EnterMap:", player.getGuildId(), player.getGuildName());
        let guildId = player.getGuildId();
        let guild = guildManager.getGuild(guildId);
        if (!guild) {
            guild = guildManager.createGuild(guildId, player.getGuildName(), player.getGuildChairmanId(), player.getServerId());
        }
        guild.addGuildUser(player);

        player.setPos(player.getMHeroId(), bornPos.x, bornPos.y, bornPos.dir);
        player.setScoreTime(new Date());
        this.userList[player.getUserId()] = player;

        let proto = {};
        proto.npcList = [];
        proto.pillarList = [];
        let npcIds = Object.keys(this.npcList);
        for (let i = 0; i < npcIds.length; i++) {
            let npc = this.npcList[npcIds[i]];
            proto.npcList.push(npc.getProfile());
        }
        let pillarIds = Object.keys(this.pillarList);
        for (let i = 0; i < pillarIds.length; i++) {
            let p = this.pillarList[pillarIds[i]];
            proto.pillarList.push(p.getProfile());
        }

        let ids = Object.keys(this.userList);
        let pList = [];
        for (let i = 0; i < ids.length; i++) {
            let uid = ids[i];
            if (uid == player.getUserId()) continue;
            let p = this.userList[uid];
            pList.push(p.getProfile());

            // 通知对应玩家新用户进入
            if (p.getReady())
                p.send('syncEnter', [player.getProfile()]);
            else
                p.addEnterMsg(player.getProfile());

        }
        if (pList.length > 0) {
            proto.userList = pList.sort(function(e1, e2) {
                return e1.t - e2.t;
            });
        }
        proto.me = {};
        proto.me.x = player.x;
        proto.me.y = player.y;
        proto.me.dir = player.dir;
        proto.me.guildId = player.getGuildId();
        proto.me.guildName = player.getGuildName(); 
        // let tmNow = new Date().getTime();
        // let tmprepareEndTime = Math.ceil((battleMgr.getBattleingTime().getTime() - tmNow) / 1000);
        // if (tmprepareEndTime < 0)
        //     tmprepareEndTime = tmprepareEndTime;
        proto.me.prepareEndTime = battleMgr.getBattleingTime().getTime();
        // let tmbattleEndTime = Math.ceil((battleMgr.getBattleCloseTime().getTime() - tmNow) / 1000);
        // if (tmbattleEndTime < 0)
        //     tmbattleEndTime = 0;
        proto.me.battleEndTime = battleMgr.getBattleCloseTime().getTime();
        player.send('enterGuildBattle', proto);

        let guildUser = guild.getGuildUser(player);
        if (guildUser) {
            this.syncGuildUser(player, guildUser);
        }
        // if(this.mapStatus == consts.eMapStatus.eggact){
        // 	this.syncChest(player);
        // }
        //logger.debug("syncEnter other user to new user", player.getUserId(), player.getPlayerId(), ",member size:", pList.length); 
        return true;
    }
    syncChest(player){
    	if (!this.isEggActStatus()) {
            return;
        }
		let proto = chestManager.getChestListProto();
		// console.error('syncChest----->',proto);
		player.send("syncChest", proto); 
	}
    leave(player) {
        logger.debug("player leave map:", player.getUserId());

        this._clearPlayer(player);

        delete this.userList[player.getUserId()];
        player.broadcast('syncLeave', [player.getUserId()]);
    }
    setHpFromClient(player, data) {
        //logger.debug("setHpFromClient", player.getUserId(), data);
        if (data.type == consts.eActorType.boss) {
            return this.setNpcHpFromClient(player, data);
        }

        if (data.id != player.getUserId()) {
            return;
        }

        let hero = player.getHero(data.heroId);
        if (!hero || hero.hp <= 0) return;

        let hp = data.hp;
        if (hp > hero.getMaxHp()) {
            hp = hero.getMaxHp();
        }
        hero.setHp(hp);

        let hpChange = {
            type: consts.eActorType.player,
            id: player.id,
            hp: hero.hp,
            heroId: hero.heroId,
            mhId: player.getMHeroId()
        };
        this.broadcast("syncHp", hpChange);
    }
    setNpcHpFromClient(player, data) {
        //logger.debug("setBossHpFromClient", player.getUserId(), data);
        let npc = npcManager.getNpc(data.id);
        if (!npc) return;
        if (npc.getOwnerId() != player.getUserId()) {
            return;
        }

        let hp = data.hp;
        if (hp > npc.getMaxHp()) {
            hp = npc.getMaxHp();
        }
        npc.setHp(hp);
        if (npc.getHp() <= 0) {
            this.npcDie(npc);
            this.killNpc(player);
        }
        npc.syncHp();
    }
    holdPillar(player, id) {
        if (!this.isBattleStatus()) {
            logger.debug("not in battle status", this.mapStatus);
            return;
        }
        let pillar = pillarManager.getPillar(id);
        if (!pillar) {
            logger.debug("holdPillar: pillar isnot exist", player.getUserId(), id);
            return;
        }

        if (pillar.getStatus() == consts.ePillarStatus.holding) {
            logger.debug("holdPillar: pillar is holding, canot holding it now", player.getUserId(), id);
            return;
        }

        if (pillar.getHolderGid() == player.getGuildId()) {
            logger.debug("holdPillar: pillar is owner you guild, canot holding it again", id, player.getUserId(), pillar.getGuildId(), pillar.getGuildName());
            return;
        }

        for (var id in this.pillarList) {
            let pillar = this.pillarList[id];
            if (pillar.getStatus() == consts.ePillarStatus.holding) {
                if (pillar.getholdingUserId() == player.getUserId()) {
                    logger.debug("holdPillar: canot holding two pillar", id, player.getUserId());
                    return;
                }
            }
        }

        pillar.setHoldingUser(player.getUserId(), player.getName());
        pillar.changeStatus(consts.ePillarStatus.holding);

        this.syncAllPillar();
    }
    unholdPillar(player) {
        if (!this.isBattleStatus()) {
            logger.debug("not in battle status", this.mapStatus);
            return;
        }
        // 判断是否为占柱子的玩家
        for (var id in this.pillarList) {
            let pillar = this.pillarList[id];
            if (pillar.getStatus() == consts.ePillarStatus.holding) {
                if (pillar.getholdingUserId() == player.getUserId()) {
                    pillar.clearHoldingUser();
                    pillar.changeStatus(consts.ePillarStatus.init);
                    this.syncAllPillar();
                    break;
                }
            }
        }
    }
    getPReward(player, idx) {
        if (!this.isBattleStatus()) {
            logger.debug("not in battle status", this.mapStatus);
            return;
        }
        if (idx < 0 || idx >= 5) return;
        let guildUser = guildManager.getGuildUser(player);
        if (!guildUser.canGetReward(idx)) {
            logger.debug("you canot getPReward", guildUser, idx);
            return;
        }

        guildUser.getReward(idx); // 先更新掉状态

        w2g.getPReward(player.getUserId(), idx, projectConfig.serverId, (err, data) => {
            if (err) {
                guildUser.resetReward(idx);
            }

            this.syncGuildUser(player, guildUser);
            if (!err) {
                player.send("syncUserData", data);
            }
        });
    }
    hurt(player, data) {
        //logger.debug("hurt:", player.getMapId(), player.getUserId(), player.getPlayerId(), data);	
        if (!this.isBattleStatus()) {
            logger.debug("not in battle status", this.mapStatus);
            return;
        }
        if (player.isAllHeroDie()) {
            logger.debug("player die, ignore hurt:", player.getMapId(), player.getUserId(), player.getPlayerId(), data);
            return;
        }

        let attack = data.attack;
        let hurtData = data.hurtArr[0]; // 协议是数组 {id, type, heroId, hurt}

        if (attack.type == consts.eActorType.boss) {
            return this.npcHurt(player, data);
        }

        // logger.debug("hurt:", player.getName(), player.getUserId(), player.getPlayerId(), data);	
        if (attack.id != player.getUserId()) {
            logger.debug("ignore, hurt attackId : ", attack.id, " is not playerId : ", player.getUserId(), player.getName());
            return;
        }

        // player
        let lockTarget = player.getTarget();
        if (!lockTarget) {
            logger.debug("ignore22, %j have no target", player.getUserId());
            return;
        }

        if (hurtData.type == consts.eActorType.boss) {

            let npcLogicId = hurtData.id;

            let npc = npcManager.getNpc(npcLogicId);
            if (!npc || npc.getHp() < 0) {
                return;
            }

            npc.subHp(hurtData.hurt);
            npc.syncHp();
            if (npc.getHp() <= 0) { // npc 死亡
                this.npcDie(npc);
                this.killNpc(player);
            } else {
                // boss 没有归属
                if (npc.getOwnerId() == 0) {
                    // 设置为玩家主英雄
                    npc.setOwner(player.getUserId(), player.getMHeroId());
                    npc.syncTarget();
                }
            }
        } else {
            //logger.debug("pvp hurt:", player.getMapId(), player.getUserId(), player.getPlayerId(), data);	

            let targetPlayer = this.getPlayerInMap(hurtData.id); //playerManager.getPlayerByUid(hurtData.id);
            if (!targetPlayer) {
                logger.debug("pvp  targetPlayer is null", hurtData);
                return;
            }
            let hero = targetPlayer.getHero(hurtData.heroId);
            if (!hero) {
                logger.debug("pvp hero is null", hurtData);
                return;
            }

            hero.subHp(hurtData.hurt);
            targetPlayer.syncHp(hero);
            if (hero.hp <= 0) {
                this.heroDie(targetPlayer, hero);
            }
            if (targetPlayer.isDead()) {
                this.killPlayer(player);
            }
        }
    }
    npcHurt(player, data) { // boss 攻击玩家
        //logger.debug("npcHurt :", player.getUserId(), player.getName(), data);
        if (player.isAllHeroDie()) { // 过滤掉归属者死了，npc 还打的逻辑
            return;
        }

        let attack = data.attack;
        let hurtData = data.hurtArr[0];
        let npcLogicId = attack.id;
        let npc = npcManager.getNpc(npcLogicId);
        if (npc && npc.getHp() < 0) {
            logger.debug("npc ", npcLogicId, " is dead");
            return;
        }
        // npc 只会打归属者
        if (hurtData.id != player.getUserId()) {
            return;
        }

        let hero = player.getHero(hurtData.heroId);
        if (!hero) return;

        // boss 没有归属
        if (npc.getOwnerId() == 0) {
            // player 就是target
            npc.setOwner(player.getUserId(), player.getMHeroId());
            // 归属者有变化
            npc.syncTarget();
        } else {
            // 不是所属者的，过滤掉
            if (npc.getOwnerId() != player.getUserId()) {
                return;
            }
        }

        hero.subHp(hurtData.hurt);
        player.syncHp(hero);

        if (hero.hp <= 0) {
            this.heroDie(player, hero);
        }
    }
    heroDie(player, hero) {
        // 英雄死亡 
        // 清掉敌人的信息
        //logger.debug("heroDie", player.getUserId(), hero.heroId);
        let nextMHeroId = player.getMHeroId();
        let UidKeys = Object.keys(this.userList);
        UidKeys.forEach((uid) => {
            let p = this.userList[uid];
            let target = p.getTarget();
            if (target && target.type == consts.eActorType.player &&
                target.id == player.getUserId() &&
                target.heroId == hero.heroId) {

                if (nextMHeroId > 0) {
                    p.setTarget(consts.eActorType.player, player.getUserId(), nextMHeroId)
                    p.syncTarget(true);
                } else { // player 死亡
                    p.clearTarget();
                    p.syncTarget(true);
                }
            }
        });

        let npcIds = Object.keys(this.npcList);
        npcIds.forEach((nid) => {
            let npc = npcManager.getNpc(nid);
            let npcOwner = npc.getOwner();
            if (npcOwner) {
                if (npcOwner.id == player.getUserId() && npcOwner.heroId == hero.heroId) {
                    if (nextMHeroId > 0) {
                        npc.setOwner(player.getUserId(), nextMHeroId);
                        npc.syncTarget();
                    } else {
                        npc.clearOwner();
                        npc.syncTarget();
                    }
                }
            }
        });

        if (player.isAllHeroDie()) {
            this.playerDie(player);
        }
    }
    setNpcRespawn(cfgId) {
        this.npcCfg[cfgId].changeStatus(consts.eNpcCfgStatus.needForSpawn);
    }
    npcDie(npc) {
        //  npc死亡 
        // 清理目标为该npc的玩家, 设置其target为空
        let UidKeys = Object.keys(this.userList);
        UidKeys.forEach((uid) => {
            let p = this.userList[uid];
            let target = p.getTarget();
            if (target && target.type == consts.eActorType.boss &&
                target.id == npc.getId()) {
                p.clearTarget();
                p.syncTarget(true);
            }
        });

        this.setNpcRespawn(npc.cfgId);
        npcManager.removeNpc(npc.getId());
        delete this.npcList[npc.getId()];
    }
    killNpc(player) {
        // 处理杀npc逻辑
        let guildUser = guildManager.getGuildUser(player);
        if (!guildUser) return;
        guildUser.addScore(consts.eAddScoreType.killNpc);
        this.syncGuildUser(player, guildUser);
    }
    killPlayer(player) {
        let guildUser = guildManager.getGuildUser(player);
        if (!guildUser) return;
        guildUser.addScore(consts.eAddScoreType.killPlayer);
        this.syncGuildUser(player, guildUser);
    }
    syncGuildUser(player, guildUser) {
        let p = {
            score: guildUser.getScore(),
            rewards: guildUser.getRewardIndex()
        };
        player.send('guildUser', p);
    }
    playerDie(player) {
        // 玩家死亡
        console.error("playerDie:", player.getUserId());
        // 这里不再处理目标target的变化, heroDie里统一处理
        player.setDead();

        // 判断是否为占柱子的玩家
        for (var id in this.pillarList) {
            let pillar = this.pillarList[id];
            if (pillar.getStatus() == consts.ePillarStatus.holding) {
                if (pillar.getholdingUserId() == player.getUserId()) {
                    pillar.clearHoldingUser();
                    pillar.changeStatus(consts.ePillarStatus.init);
                    this.syncAllPillar();
                    break;
                }
            }
        }
    }
    _clearPlayer(player) {

        // 清掉敌人的信息
        let UidKeys = Object.keys(this.userList);
        UidKeys.forEach((uid) => {
            let p = this.userList[uid];
            let target = p.getTarget();
            if (target && target.type == consts.eActorType.player &&
                target.id == player.getUserId()) {
                p.clearTarget();
                p.syncTarget(true);
            }
        });

        // npc
        let npcIds = Object.keys(this.npcList);
        npcIds.forEach((nid) => {
            let npc = this.npcList[nid];
            let npcOwner = npc.getOwner();
            if (npcOwner) {
                if (npcOwner.id == player.getUserId()) {
                    npc.clearOwner();
                    npc.syncTarget();
                }
            }
        });

        // 是否为占领pillar的玩家
        for (var id in this.pillarList) {
            let pillar = this.pillarList[id];
            if (pillar.getStatus() == consts.ePillarStatus.holding) {
                if (pillar.getholdingUserId() == player.getUserId()) {
                    pillar.clearHoldingUser();
                    pillar.changeStatus(consts.ePillarStatus.init);
                    this.syncAllPillar();
                    break;
                }
            }
        }
    }
    syncAllPillar() {
        let p = pillarManager.getAllPillarProfile();
        this.broadcast('syncBattle', p);
    }
    changeStatus(s) {
        //logger.info("BATTLEMAP status change ", this.mapStatus, " => ", s);
        this.mapStatus = s;
    }
    runLoop() {
        if (this.mapStatus == consts.eMapStatus.init) {
            this.changeStatus(consts.eMapStatus.prepareBattle);
            this.prepareBattle((err) => {
                if (err) {
                    this.changeStatus(consts.eMapStatus.init);
                } else {
                    this.changeStatus(consts.eMapStatus.prepareDone);
                }
            });
        } else if (this.mapStatus == consts.eMapStatus.prepareDone) {
            // 等待被改状态 enterBattle
        } else if (this.mapStatus == consts.eMapStatus.enterBattle) {
            // 等待被改状态 beginBattle
        } else if (this.mapStatus == consts.eMapStatus.beginBattle) {
            this.startBattle();
            this.changeStatus(consts.eMapStatus.battle);
        } else if (this.mapStatus == consts.eMapStatus.battle) {
            this._checkBattle();
        } else if (this.mapStatus == consts.eMapStatus.endBattle) {
            // console.error('==============consts.eMapStatus.endBattle===============');
            this.changeStatus(consts.eMapStatus.eggact);
            this.sendAward();
            this.close();
            this.syncEndBattle();
        } else if (this.mapStatus == consts.eMapStatus.eggact) {
            this._checkEggact(); //彩蛋活动
            // 宝箱check
 			chestManager.update();
        } else if (this.mapStatus == consts.eMapStatus.endEggact) {
        	// 清除宝箱
 			chestManager.removeAllChest();
 			this.syncOver();
            this.changeStatus(consts.eMapStatus.close);
        }
    }
    // _checkForBattle(){
    // 	//  公会战开启
    // 	this.prepareBattle(); 
    // }
    _getPosArr(num) {
        let eggCfgArr = this.eggCfg.slice(0);
        let return_array = [];
        while (eggCfgArr.length > 0) {
            var eggPos = eggCfgArr.pop();
            var isHave = this._isPosHaveEgg(eggPos);
            if (isHave) {
            	// console.error('==========这个位置有彩蛋了=========',eggPos);
            	continue;
            }
            return_array.push(eggPos);
        } 
        // console.error('==========return_array=======',return_array);
        return return_array;
    }
    //判断此位置是否有彩蛋了
    _isPosHaveEgg(pos) {
    	let chestList = chestManager.getChestListProto();
        for (let j = 0, len = chestList.length; j < len; j++) {
            let chest = chestList[j];
            if (chest.x == pos[0] && chest.y == pos[1]) {
                return chest;
            }
        }
        return false;
    }
    _checkEggact() {
        let tmNow = new Date();
        // 刷宝箱 7,13
        // console.error('==============>   _checkEggact');
        if (!this.lastSpawnChestTm || (tmNow.getTime() - this.lastSpawnChestTm.getTime() >= consts.eCONST.SPAWN_CHEST_INTERVAL)) {
        	let posArr = this._getPosArr(consts.eCONST.SPAWN_CHEST_NUM); // 刷新15个宝箱
        	this.spawnChests(posArr);
        	// console.error('===生成宝箱 位置======================>', posArr);
        	this.lastSpawnChestTm = tmNow;
        }
    }
    spawnChests(posArr) {
        let newChestList = chestManager.spawnChest(posArr);
        // let proto = [];
        // newChestList.forEach((e) => {
        //     proto.push(e.getProfile());
        // });
        let proto = chestManager.getChestListProto();
        this.broadcast('syncChest', proto);

        // let ids = Object.keys(this.userList);
        // for (var i = 0; i < ids.length; i++) {
        // 	let uid = ids[i];
        // 	let player = this.userList[uid];
        // 	if (player.getJoinGodness()){
        // 		player.send("syncChest", proto);
        // 	} 
        // }
    }
    pickChest(player, chestId) {
        let chest = chestManager.getChest(chestId);
        let proto = { ret: 1 };
        if (!chest || chest.getStatus() != consts.eChestStatus.normal) {
            console.info("user pick chest error:", chestId, chest && chest.getStatus());
            player.send("pickChest", proto);
            return;
        }

        // let player = this.userList[userId];
        // let guildUser = guildManager.getGuildUser(player);
        console.log("pickChest:", player.getUserId(), player.getPickItem(),consts.eCONST.MAX_PICKNUM);
        if (!player || player.getPickItem() >= consts.eCONST.MAX_PICKNUM) {
            console.info("user pick chest max picknum error:", chestId, player.getPickItem());
            player.send("pickChest", proto);
            return;
        }
        proto.ret = 0;
        player.send("pickChest", proto); 

        chest.pick(player.getUserId(), player.getServerId());

        let proto2 = chestManager.getChestListProto();
        player.broadcast("syncChest", proto2);
    }
    unpickChest(player, chestId) {
        if (!this.isEggActStatus()) {
            return;
        }
        let chest = chestManager.getChest(chestId); 
        if (!chest) return; 

        if (chest.getOwnerId() != player.getUserId()){
            console.debug("the map chest is not yours", player.getUserId(), chestId);
            return;
        }

        chest.unpick();

        let proto2 = chestManager.getChestListProto();
        player.broadcast("syncChest", proto2);
    }
    _checkBattle() {
        this._checkPillar();
        this._checkNpc();
        this._checkPlayer();
        this._checkGuild();
    }
    _checkPlayer() {
        let tmNow = new Date();
        for (let userId in this.userList) {
            let player = this.userList[userId];
            if (tmNow.getTime() - player.getScoreTime().getTime() >= consts.eCONST.PILLAR_HOLDSCORE_INTERVAL) {
                let guildUser = guildManager.getGuildUser(player);
                if (guildUser) {
                    //console.log("checkPlayer guildUser addScore:", player.getUserId());
                    guildUser.addScore(consts.eAddScoreType.participatTime);
                    this.syncGuildUser(player, guildUser);
                }
                player.setScoreTime(new Date());
            }
        }
    }
    _checkPillar() {
        let tmNow = new Date();
        let changed = false;
        for (let pid in this.pillarList) {
            let pillar = this.pillarList[pid];

            if (pillar.getStatus() == consts.ePillarStatus.holding) {
                if (tmNow.getTime() - pillar.getStatusTime().getTime() >= consts.eCONST.PILLAR_HOLDCD) {

                    let holdingUserId = pillar.getholdingUserId();
                    let player = this.getPlayerInMap(holdingUserId);
                    if (player) {

                        pillar.changeStatus(consts.ePillarStatus.init);
                        pillar.holdDone(player.getGuildId(), player.getGuildName());

                        let pillarGid = pillar.getHolderGid();
                        let guild = guildManager.getGuild(pillarGid);
                        if (guild) {
                            guild.addPillarScore(100);
                            this.syncGuildRank();
                        }
                        pillar.setScoreTime(new Date());

                    } else {
                        // 玩家不在地图
                        pillar.changeStatus(consts.ePillarStatus.init);
                        pillar.clearHoldingUser();
                    }

                    changed = true;
                }
            } else {
                let pillarGid = pillar.getHolderGid();
                let guild = guildManager.getGuild(pillarGid);
                if (guild) {
                    if (tmNow.getTime() - pillar.getScoreTime().getTime() >= consts.eCONST.PILLAR_HOLDSCORE_INTERVAL) {
                        guild.addPillarScore(100);
                        this.syncGuildRank();
                        pillar.setScoreTime(new Date());
                    }
                }
            }

        }

        if (changed) {
            this.syncAllPillar();
        }
    }
    _checkNpc() {
        let tmNow = new Date();
        for (let cfgId in this.npcCfg) {
            let cfg = this.npcCfg[cfgId];
            if (cfg.status == consts.eNpcCfgStatus.needForSpawn) {
                if (tmNow.getTime() - cfg.statusTime.getTime() >= consts.eCONST.NPC_RESPAWN_INTERVAL) {
                    this.spawnNpc(cfg);
                    cfg.changeStatus(consts.ePillarStatus.init);
                }
            }
        }
    }
    _checkGuild() {
        let tmNow = new Date();
        if (tmNow.getTime() - this.syncGuildRankTime.getTime() >= consts.eCONST.SYNC_GUILDRANK_INTERVAL) {
            this.syncGuildRank();
        }
    }
    syncGuildRank() {
        let p = guildManager.getGuildRank();
        this.broadcast("guildRank", p);
        this.syncGuildRankTime = new Date();
    }
    close() { 
    	for (let nid in this.npcList) {
    		let npc = this.npcList[nid];
    		npc.setHp(0);
	        if (npc.getHp() <= 0) {
	            this.npcDie(npc);
	        }
	        npc.syncHp();
        }
        //清除所有玩家攻击目标
        let UidKeys = Object.keys(this.userList);
        UidKeys.forEach((uid) => {
            let p = this.userList[uid];
            p.clearTarget();
            p.syncTarget(true);
        });
        logger.info("the map close");

        // 清除npc, 清除pillar
        for (let pid in this.pillarList) {
            pillarManager.removePillar(pid);
        }
        for (let nid in this.npcList) {
            npcManager.removeNpc(nid);
        }
        this.pillarList = {};
        this.npcList = {};

        // player 要让玩家自己离线再清理

        // 清理到公会战guild数据
        // guildManager.clear();
    }
    syncEndBattle() {
        logger.info("syncEndBattle");
        this.broadcast("syncEndBattle", { ret: 1 });
    }
    syncOver() {
        logger.info("syncOver");
        this.broadcast("syncOver", { ret: 1 });
    }
    spawnNpc(cfg) {
        let npc = npcManager.createNpc(cfg);
        npc.setMap(this);
        this.npcList[npc.getId()] = npc;
        let p = {
            npc: [npc.getProfile()]
        };
        this.broadcast('syncBattle', p);
    }
    sendAward() {
        // 公会战结束
        let guildRes = guildManager.getGuildBattleResult();
        let userRes = guildManager.getAllGuildUserRank();
        w2g.guildBattleResult(guildRes, userRes, projectConfig.serverId, function() {});
        // dbhelper.guildBattleResult(guildRes, userRes, projectConfig.serverId, function(err, data) {
        //     if (err) {
        //         logger.error("recored Battle Result Error");
        //         return;
        //     }

        //     w2g.guildBattleResult(guildRes, userRes, projectConfig.serverId, function() {});
        // })
    }
    sendToLog(win) {}
    sendToUser(userId, protocol, data) {
        let player = this.getPlayerInMap(userId); //playerManager.getPlayerByUid(userId);
        player && player.send(protocol, data);
    }
    broadcast(protocol, data) {
        // send data to all user in this map
        appServer.io.of(moduleNsp).to(this.id).emit(protocol, data);
    }
    broadcastAll(protocol, data) {
        // send data to all user 
        appServer.io.of(moduleNsp).emit(protocol, data);
    }
}

// 地图管理
class WorldMapManager {
    constructor() {
        //this.worldMapList = {};
        this.battleMap = null;
        this.loopTimer = null; // 主循环Timer
        this.checkTimer = null; // 检测公会开启Timer
        this.battleMapData = {};
        this.battleMapData.pillar = [
            [1008, 953],
            [765, 790],
            [520, 953]
        ]; // 像素点
        this.battleMapData.born = [
            [0, 15],
            [23, 15],
            [12, 4],
            [11, 25],
            [1, 9],
            [22, 21],
            [1, 21],
            [22, 8]
        ];
        this.battleMapData.npc = [
            [11, 7],
            [12, 9],
            [3, 10],
            [20, 10],
            [5, 11],
            [18, 11],
            [18, 14],
            [3, 15],
            [5, 15],
            [20, 15],
            [6, 17],
            [17, 17],
            [4, 19],
            [19, 19],
            [11, 21],
            [12, 23]
        ];
        this.battleMapData.egg = [
            [8, 11],
            [12, 11],
            [15, 11],
            [10, 12],
            [7, 13],
            [12, 13],
            [14, 13],
            [9, 14],
            [16, 14],
            [6, 15],
            [8, 15],
            [12, 15],
            [10, 16],
            [14, 16],
            [12, 17]
        ];

    }
    createMap(mapId, mapData) {
        //let p = new WorldMap(mapId, mapData);
        //p.initMap();		
        //this.worldMapList[mapId] = p;
        //return p;
        logger.info("createMap:", mapId);
        this.battleMap = new WorldMap(mapId, mapData);
        this.battleMap.initMap();
        return this.battleMap;
    }
    getMap(mapId) {
        return this.battleMap;
        //return this.worldMapList[mapId];
    }
    start() {
        if (!this.loopTimer) {
            this.loopTimer = setInterval(() => { this.run(); }, 500);
        }
        if (!this.checkTimer) {
            this.checkTimer = setInterval(() => { this.check(); }, 1000);
        }
    }
    init() {
        // // 初始化 
        // var mapData = {};
        // 	mapData.pillar = [[1008,953],[765,790],[520,953]];  // 像素点
        // 	// 位置的顺序是公会战力榜排行顺序
        // mapData.born = [[0,15],[23,15],[12,4],[11,25],[1,9],[22,21],[1,21],[22,8]];	
        // mapData.npc = [[11,7],[12,9],[3,10],[20,10],[5,11],[18,11],[18,14],[3,15],[5,15],[20,15],[6,17],[17,17],[4,19],[19,19],[11,21],[12,23]];
        // 	this.createMap(consts.eCONST.GB_MAPID, mapData);
    }
    check() {
        // 公会战时间是否已到
        let tmNow = new Date();
        battleMgr.checkOpenTime();
        if (battleMgr.status == consts.eBattleStatus.init) {
            // 今天没有公会战
            if (!battleMgr.openTime || !battleMgr.createMapTime) {
                return;
            }

            if (tmNow.isAfter(battleMgr.createMapTime) && tmNow.isBefore(battleMgr.getBattleCloseTime())) {
                // 创建地图
                this.createMap(consts.eCONST.GB_MAPID, this.battleMapData);
                battleMgr.changeStatus(consts.eBattleStatus.prepare);
                guildManager.clear();
            }
        } else if (battleMgr.status == consts.eBattleStatus.prepare) {
            if (tmNow.isAfter(battleMgr.openTime)) { // 公会战开始（可以进入)
                this.battleMap.changeStatus(consts.eMapStatus.enterBattle);
                battleMgr.changeStatus(consts.eBattleStatus.open);
            }
        } else if (battleMgr.status == consts.eBattleStatus.open) {
            // 公会战正式开始
            if (tmNow.isAfter(battleMgr.getBattleingTime())) {
                this.battleMap.changeStatus(consts.eMapStatus.beginBattle);
                battleMgr.changeStatus(consts.eBattleStatus.battle);
            }
        } else if (battleMgr.status == consts.eBattleStatus.battle) {
            // 判断是否结束 
            if (tmNow.isAfter(battleMgr.getBattleCloseTime())) {
                this.battleMap.changeStatus(consts.eMapStatus.endBattle);
                battleMgr.changeStatus(consts.eBattleStatus.eggact);
            }
        } else if (battleMgr.status == consts.eBattleStatus.eggact) {
            if (tmNow.isAfter(battleMgr.getEggactCloseTime())) {
                this.battleMap.changeStatus(consts.eMapStatus.endEggact);
                battleMgr.changeStatus(consts.eBattleStatus.close);
            }
        } else if (battleMgr.status == consts.eBattleStatus.close) {
            if (tmNow.isAfter(battleMgr.endTime)) { // 60秒后回收地图
                this.battleMap = null;
                battleMgr.changeStatus(consts.eBattleStatus.init);
                battleMgr.resetAllTime();
            }
        }
    }
    run() {
        //console.log("worldMapManager:"); 
        if (this.battleMap) {
            this.battleMap.runLoop();
        }
    }
}

var worldMapManager = new WorldMapManager();

module.exports.worldMapManager = worldMapManager;
module.exports.WorldMap = WorldMap;
module.exports.init = function() {
    appServer = appServer || require('./appUtil.js').appServer;
    moduleNsp = moduleNsp || require('./appUtil.js').ns;
    module.exports.worldMapManager.init();
}
module.exports.run = function() {
    module.exports.worldMapManager.start();
}