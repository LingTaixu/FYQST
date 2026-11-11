// 地图 1920 x 2560 客户端格子40x40  协议是格子坐标
const logger = require('uw-log').getLogger("uw-logger", __filename);
const playerManager = require('./player.js').playerManager;
const bossManager = require('./boss.js').bossManager;
const chestManager = require('./chest').chestManager;
const consts = require('./consts.js');
const c_bossOther = require('uw-data').c_bossOther;
const c_game = require('uw-data').c_game;
const cache = require('./cache.js');
const mailBiz = require("uw-mail").mailBiz;
const bossUtils = require("uw-boss").bossUtils;
const dbhelper = require('../../utils/dbhelper.js');
const t_monster = require("uw-data").t_monster;
const osslog = require('../../utils/osslog.js');
const projectConfig = require('uw-config').project;
const c_msgCode = require('uw-data').c_msgCode;
const c_prop = require('uw-data').c_prop;
const c_bossCSWorld = require('uw-data').c_bossCSWorld;
const guildManager = require('./guild.js').guildManager;
const gameUtils = require('../../utils/gameUtils.js');

const w2g = require('../../utils/w2g.js');
var worldBoss = null; // 世界boss
var appServer = null;
var moduleNsp = null;

// var mapId = 1;
// var requestMapLogicId = function(){
// 	return mapId++;
// }
var checkRequire = function() {
    worldBoss = worldBoss || require('./worldboss.js').worldBoss;
};

class WorldMap {
    constructor(bossId) {
        this.id = bossId; // 地图id (或者bossId) 
        this.boss = null;
        this.monsterList = {};
        this.userList = {};
        this.posSeq = 0; // 位置序号 0 1 2 3
        this.isChestMap = false; // 是否有宝箱玩法
        this.mapChest = null; // 地图里宝箱
        this.nextChestShowTime = null; // 下次地图上出现宝箱时间
        this.isDelete = false; // 设置需要回收
        this.deleteTime = 0;
    }
    getPosSeq() {
        return this.posSeq++ % 4;
    }
    getMapId() {
        return this.id;
    }
    addBoss(boss) {
        //console.log("worldMap " + this.id + ",add Boss:", boss);
        this.boss = boss;
    }
    initMap(mapData) {
        this.mapData = mapData;
        let boss = bossManager.createBoss(mapData.type, mapData.id, mapData.groupId, this);
        this.addBoss(boss);

        // 有宝箱
        if (mapData.chest) {
            this.isChestMap = true;
            let pos = this.getChestBornPos();
            this.mapChest = chestManager.createChest(parseInt(mapData.chest[0]), parseInt(pos[0]), parseInt(pos[1]));
        }
    }
    setDelete() {
        if (!this.isDelete) {
            this.isDelete = true;
            this.deleteTime = new Date().getTime();
        }
    }
    getChestBornPos() {
        let arrIndex = Math.floor(Math.random() * this.mapData.chestPos.length);
        return this.mapData.chestPos[arrIndex];
    }
    getPlayerBornPos() {
        if (this.boss.bossType == consts.eBossType.CSWorldBoss) {
            return c_bossCSWorld[this.id].pos;
        } else {
            return c_bossOther[this.id].pos;
        }
    }
    canEnter(player, cb) {
        return this.boss.canJoin(player, cb);
    }
    getPlayerInMap(id) {
        return this.userList[id];
    }
    checkEnter() {
        if (this.boss.getStatus() != consts.eBossStatus.alive) {
            return 'Boss准备中,请等待';
        }
        return null;
    }
    onGuildRankAll(player) {
        return;
    }
    onUserRank(player) {
        return;
    }
    onGetSelfRank(player) {
        return;
    }
    inspire(player) {
        return;
    }
    getMapChestProfile() {
        if (!this.isChestMap) { return };
        if (this.mapChest) {
            return this.mapChest.getProfile();
        } else {
            let p = {};
            p.nextChestShowTime = this.nextChestShowTime;
            return p;
        }
    }
    reloadBossPlayer() {
        // 把地图里的玩家全部加入到bossPlayer
        let ids = Object.keys(this.userList);
        for (var i = 0; i < ids.length; i++) {
            let player = this.userList[ids[i]];
            if (player) {
                this.boss.addBossPlayer(player.getUserId(), player.getServerId(), player.getName(), player.getCombat());
            }
        }
    }
    onEnter(player) {
        //console.log("map.onEnter:", this.getMapId(), player.getUserId());
    }
    onSyncUserList(player) {
        let ids = Object.keys(this.userList);
        let pList = [];
        let proto = {};
        for (var i = 0; i < ids.length; i++) {
            let uid = ids[i];
            if (uid == player.getUserId()) continue;
            let p = this.userList[uid];
            pList.push(p.getProfile());

        }
        if (pList.length > 0) {
            proto.userList = pList.sort(function(e1, e2) {
                return e1.t - e2.t;
            });
        }
        player.send("syncUserList", proto);
    }
    enter(player) {
        let e = this.checkEnter();
        if (e) {
            player.sendTips(null, e);
            return;
        }

        // 获得玩家进入时的最新数据
        w2g.reloadBattleUser(player.getUserId(), player.getServerId(), (err, data) => {
            //console.error("w2g.reloadBattleUser",data[0].exData);
            if (err) return;
            let userData = data[0];
            let showData = data[1];
            let guildData = data[2];
            let heroData = data[3];

            player.setData(userData, heroData, showData, guildData);

            // 取到最新数据再进入地图

            // 进地图,玩家伙伴全部恢复生命
            player.respawn();

            this.onEnter(player);

            this.userList[player.getUserId()] = player;
            //player.broadcast('syncEnter', [player.getProfile()]);

            this.boss.addBossPlayer(player.getUserId(), player.getServerId(), player.getName(), player.getCombat());
            // 玩家默认是攻击boss
            if (this.boss.bossType == consts.eBossType.CSTianMing ||
                this.boss.bossType == consts.eBossType.CSWorldBoss) {
                player.setTarget(consts.eActorType.boss, this.boss.getId(), this.boss.getId());
            }

            let proto = {};
            proto.boss = this.boss.getProfile();
            let ids = Object.keys(this.userList);
            let pList = [];

            for (var i = 0; i < ids.length; i++) {
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
            proto.me = {
                x: player.x,
                y: player.y,
                dir: player.dir
            };
            proto.chest = this.getMapChestProfile();
            player.send('syncEnterBoss', proto);

            player.syncTarget(true);
            logger.debug("syncEnter other user to new user", player.getUserId(), player.getPlayerId(), ",member size:", pList.length);

        });
    }
    leave(player) {
        //console.log("player leave map:", player.getUserId());
        this._clearPlayer(player);
        delete this.userList[player.getUserId()];
        player.broadcast('syncLeave', [player.getUserId()]);

        if (Object.keys(this.userList) == 0) {
            // boss 坐标回到出生点
            this.boss.setPos2BornPos();
        }
        this.onLeave(player);
    }
    onLeave(player) {
        console.log("map.onLeave:", this.getMapId(), player.getUserId());
    }
    revive(player, type) {
        player.revive(type);

        // 设置玩家目标
        //player.setTarget(consts.eActorType.boss, this.boss.getId(), this.boss.getId());
    }
    reviveHero(player, hero) {
        // player.setTarget(consts.eActorType.boss, this.boss.getId(), this.boss.getId());
        // player.syncTarget(true);
        //console.error("reviveHero:", player.getUserId(), hero.heroId);
        // 通知客户端 
        player.syncTarget(true);

        let UidKeys = Object.keys(this.userList);
        UidKeys.forEach((uid) => {
            let p = this.userList[uid];
            let target = p.getTarget();
            if (target && target.type == consts.eActorType.player &&
                target.id == player.getUserId() &&
                target.heroId == hero.heroId) {
                //console.error("syncTarget:", p.getUserId());
                p.syncTarget(true);
            }
        });

        let bossTarget = this.boss.getTarget();
        if (bossTarget) {
            if (bossTarget.id == player.getUserId() && bossTarget.heroId == hero.heroId) {
                //console.error("syncBossTarget:", bossTarget);
                this.boss.syncTarget();
            }
        }
    }
    setHpFromClient(player, data) {
        //logger.debug("setHpFromClient", player.getUserId(), data);
        if (data.type == consts.eActorType.boss && data.id == this.boss.getId()) {
            return this.setBossHpFromClient(player, data);
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
    setBossHpFromClient(player, data) {
        //logger.debug("setBossHpFromClient", player.getUserId(), data);
        if (this.boss.getOwnerId() != player.getUserId()) {
            return;
        }
        let hp = data.hp;
        if (hp > this.boss.getMaxHp()) {
            hp = this.boss.getMaxHp();
        }
        this.boss.setHp(hp);

        let hpChange = {
            type: consts.eActorType.boss,
            id: this.boss.getId(),
            hp: this.boss.getHp(),
            heroId: this.boss.getId(),
            mhId: this.boss.getId()
        };
        //console.log("syncHp:", hpChange);
        this.broadcast("syncHp", hpChange);
        return;
    }
    cancelBossOwner(player) {
        logger.debug("worldMap cancelBossOwner");
    }
    bossDie() {
        if (this.boss.bossType == consts.eBossType.CSTianMing ||
            this.boss.bossType == consts.eBossType.CSWorldBoss) {
            this.broadcast('syncOver', { ret: consts.eBossResult.win });
        }
        //console.log("bossDie:", this.boss.getId());
        this.sendAward();
        // 记录boss最后归属 
        let ownerId = this.boss.getOwnerId();
        if (ownerId > 0) {
            let player = playerManager.getPlayerByUid(ownerId);
            if (player) {
                this.boss.recordNewestOwner(player.getUserId(), player.getName(), player.getGuildName());
            }
        }
    }
    bossLoseTarget() {
        // 通知所有玩家boss回到出生点
        //logger.debug("bossLoseTarget broadcast", this.boss.getId()); 
        let data = {
            id: this.boss.getId(),
            x: this.boss.bornX,
            y: this.boss.bornY
        }
        this.broadcast("syncBossBack", data);
    }
    hurt(player, data) {
        //logger.debug("hurt:", player.getMapId(), player.getUserId(), player.getPlayerId(), data);	
        if (player.isAllHeroDie()) {
            logger.debug("player die, ignore hurt:", player.getMapId(), player.getUserId(), player.getPlayerId(), data);
            return;
        }

        let attack = data.attack;
        let hurtData = data.hurtArr[0];

        if (attack.type == consts.eActorType.boss && attack.id == this.boss.getId()) {
            return this.bossHurt(player, data);
        }

        // logger.debug("hurt:", player.getName(), player.getUserId(), player.getPlayerId(), data);	
        if (attack.id != player.getUserId()) {
            logger.debug("ignore, hurt attackId : ", attack.id, " is not playerId : ", player.getUserId(), player.getName());
            return;
        }

        // player
        let lockTarget = player.getTarget();
        if (!lockTarget) {
            logger.debug("ignore22, hurt attackId : ", attack.id, " is not playerId : ", player.getUserId(), player.getName());
            return;
        }

        // 不能判断lockTarget,因为可能会给自己加血，hurtData可能是自己
        if (hurtData.type == consts.eActorType.boss) {

            if (this.boss.getHp() <= 0) {
                //logger.debug("boss die, ignore hurt ", data);
                return;
            }

            // 是否可以获得归属权
            if (!player.canOwnerBoss(this.boss.bossType, this.boss.groupType)) {
                logger.debug("player owner boss limit, ignore...", player.getUserId(), this.boss.getId());
                return;
            }

            // boss 没有归属
            if (this.boss.getOwnerId() == 0) {
                // 设置为玩家主英雄
                this.boss.setTarget(player.getUserId(), player.getMHeroId());
                this.boss.syncTarget();
                if (player.canOwnerBoss(this.boss.bossType, this.boss.groupType)) {
                    this.boss.setOwner(player.getUserId());
                    this.boss.syncBossOwner();
                }
            }

            if (this.boss.getFightStatus() == consts.eFightStatus.shield) {
                //logger.debug("boss in shield, ignore hurt ", data);
                return;
            }

            this.boss.subHp(hurtData.hurt);
            this.boss.setFirstFightTime();
            // 激活护盾
            if (this.boss.canActivateShield()) {
                // boss到20%的血量
                if (this.boss.getHp() == 0) {
                    this.boss.setHp(this.boss.getMaxHp() * consts.eCONST.SHIELD_ACTIVATE_HP);
                }
                this.boss.activateShield();
                let proto = {
                    shield: 1,
                    shieldEndTime: consts.eCONST.SHEILD_MAX_TIME
                };
                logger.info("boss activate shield, syncBoss:", proto);
                this.broadcast("syncBoss", proto);
            }

            this.boss.syncHp();

            if (this.boss.getHp() <= 0) {
                this.bossDie();
            }
        } else {
            //logger.debug("pvp hurt:", player.getMapId(), player.getUserId(), player.getPlayerId(), data);	
            // 是玩家
            let targetPlayer = this.getPlayerInMap(hurtData.id); //playerManager.getPlayerByUid(hurtData.id);
            if (!targetPlayer) {
                logger.debug("pvp  targetPlayer is null", hurtData);
                return;
            }
            if (targetPlayer.isAllHeroDie()) {
                logger.debug("pvp  targetPlayer is dead", hurtData.id);
                return;
            }
            let hero = targetPlayer.getHero(hurtData.heroId);
            if (!hero) {
                logger.debug("pvp hero is null", hurtData);
                return;
            }
            // if(hurtData.hurt < 0){
            // 	logger.info("[HP BEFORE]:", hurtData.hurt, hero.hp);
            // }
            hero.subHp(hurtData.hurt);
            // if(hurtData.hurt < 0){
            // 	logger.info("[HP AFTER]:", hurtData.hurt, hero.hp);
            // }
            targetPlayer.syncHp(hero);
            if (hero.hp <= 0) {
                this.heroDie(targetPlayer, hero);
            }
            if (targetPlayer.isDead()) {
                //this.killPlayer(player);
                // 设置boss归属 

                // 是否可以获得归属权
                if (player.canOwnerBoss(this.boss.bossType, this.boss.groupType)) {
                    this.boss.setOwner(player.getUserId());
                    this.boss.syncBossOwner();
                } else {
                    this.boss.clearOwner();
                    this.boss.syncBossOwner();
                    this.bossLoseTarget();
                }

                if (this.boss.bossType == consts.eBossType.CSTianMing) {
                    this.boss.setTarget(player.getUserId(), player.getMHeroId());
                    this.boss.syncTarget();
                }

                let bossPlayer = this.boss.getBossPlayer(hurtData.id);
                if (bossPlayer) {
                    bossPlayer.addBeKillNum();
                }
                let bossPlayerMe = this.boss.getBossPlayer(player.getUserId());
                if (bossPlayerMe) {
                    bossPlayerMe.addKillNum();
                }
            }
        }
    }
    bossHurt(player, data) { // boss 攻击玩家
        //console.log("bossHurt :", player.getUserId(), player.getName(), data);
        if (player.isAllHeroDie()) { // 过滤掉归属者死了，boss 还打的逻辑
            return;
        }

        let attack = data.attack;
        let hurtData = data.hurtArr[0];

        if (this.boss.getHp() < 0) {
            logger.debug("boss ", this.boss.getId(), " is dead");
            return;
        }

        let hero = player.getHero(hurtData.heroId);
        if (!hero) return;

        this.boss.setFirstFightTime();
        // boss 没有归属
        if (this.boss.getOwnerId() == 0) {
            // player 就是target
            this.boss.setTarget(player.getUserId(), player.getMHeroId());
            this.boss.syncTarget();
            // 归属者有变化
            // 是否可以获得归属权
            if (player.canOwnerBoss(this.boss.bossType, this.boss.groupType)) {
                this.boss.setOwner(player.getUserId());
                this.boss.syncBossOwner();
            }
        } else {
            // 不是攻击目标的，过滤掉
            if (this.boss.getTargetId() != player.getUserId()) {
                return;
            }
        }

        hero.subHp(hurtData.hurt);
        player.syncHp(hero);

        if (hero.hp <= 0) {
            this.heroDie(player, hero);
        }

        if (player.isDead()) {

        }
    }
    heroDie(player, hero) {
        // 英雄死亡 
        // 清掉敌人的信息
        let nextMHeroId = player.getMHeroId();
        let UidKeys = Object.keys(this.userList);
        UidKeys.forEach((uid) => {
            let p = this.userList[uid];
            let target = p.getTarget();
            if (target.type == consts.eActorType.player &&
                target.id == player.getUserId() &&
                target.heroId == hero.heroId) {

                if (nextMHeroId > 0) {
                    p.setTarget(consts.eActorType.player, player.getUserId(), nextMHeroId);
                    p.syncTarget(true);
                } else { // player 已死亡
                    if (player.isAllHeroDie()) {
                        p.setTarget(consts.eActorType.boss, this.boss.getId(), this.boss.getId());
                        p.syncTarget(true);
                    }
                }
            }
        });

        let bossTarget = this.boss.getTarget();
        if (bossTarget) {
            if (bossTarget.id == player.getUserId() && bossTarget.heroId == hero.heroId) {
                if (nextMHeroId > 0) {
                    this.boss.setTarget(player.getUserId(), nextMHeroId);
                    this.boss.syncTarget();
                } else {
                    if (player.isAllHeroDie()) {
                        this.boss.clearTarget();
                        this.bossLoseTarget();
                        this.boss.syncTarget();
                    }
                }
            }
        }

        // if(this.boss.getOwnerId() != this.boss.getTarget().id){
        // 	if (player.canOwnerBoss(this.boss.bossType, this.boss.groupType)) {
        // 		this.boss.setOwner(this.boss.getTarget().id);
        // 		this.boss.syncBossOwner();
        // 	}
        // }

        if (player.isAllHeroDie()) {
            this.playerDie(player);
        }
    }
    playerDie(player) {
        // 玩家死亡
        logger.info("playerDie:", player.getUserId(), this.mapChest);
        player.setDead();

        // 如果再采集宝箱
        if (this.mapChest) {
            if (this.mapChest.owner == player.getUserId()) {
                this.mapChest.unpick();
                this.broadcast("syncChest", this.getMapChestProfile());
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
                p.setTarget(consts.eActorType.boss, this.boss.getId(), this.boss.getId());
                p.syncTarget(true);
            }
        });

        // boss  
        if (this.boss.getTargetId() == player.getUserId()) {
            this.boss.clearTarget();
            this.boss.syncTarget();
            this.bossLoseTarget();
        }
        if (this.boss.getOwnerId() == player.getUserId()) {
            this.boss.clearOwner();
            this.boss.syncBossOwner();
        }
    }
    changePos(player, data) {
        if (data.type == consts.eActorType.boss) {
            if (this.boss.target.id == player.getUserId()) { // 归属者有效
                this.boss.changePos(data.x, data.y, data.dir);
                player.broadcast("syncPos", data);
            }
        } else if (data.type == consts.eActorType.player) {
            if (data.id == player.getUserId()) { // 自身移动有效
                player.changePos(data.mhId, data.x, data.y, data.dir);
                player.broadcast("syncPos", data);
            }
        }
    }
    playerChangeTarget(player, data) {

        // 客户端同步boss目标
        if (data && data.senderType == consts.eActorType.boss) {
            return this.bossChangeTargetFromClient(player, data);
        }

        if (!data || !data.id || data.id == 0) {
            player.clearTarget();
        } else {

            if (player.getUserId() == data.id) {
                return;
            }

            // 打玩家
            if (data.type == consts.eActorType.player) {
                //  返回target 
                let targetPlayer = playerManager.getPlayerByUid(data.id);
                if (!targetPlayer ||targetPlayer.isAllHeroDie()) {
                    // 设置为boss
                    player.setTarget(consts.eActorType.boss, this.boss.getId(), this.boss.getId());
                } else {
                    player.setTarget(targetPlayer.getActorType(), targetPlayer.getUserId(), targetPlayer.getMHeroId());
                }

            } else {
                player.setTarget(data.type, data.id, data.heroId);
            }
        }
        player.syncTarget(true);
    }
    bossChangeTargetFromClient(player, data) {
        if (this.boss.getOwnerId() > 0) {
            return this._bossChangeTargetFromOwner(player, data);
        }

        return this._bossChangetTargetFromFirstOne(player, data);

    }
    _bossChangetTargetFromFirstOne(player, data) {
        // 已经有攻击目标
        if (this.boss.getTargetId() > 0) {
            this.boss.syncTarget(player);
            //console.log("_bossChangetTargetFromFirstOne ignore:", this.boss.getId(), player.getId(), data);
            return;
        }
        //console.log("_bossChangetTargetFromFirstOne:", this.boss.getId(), player.getId(), data.id);
        let targetPlayer = playerManager.getPlayerByUid(data.id);
        if (targetPlayer && targetPlayer.getHp() > 0) {
            this.boss.setTarget(targetPlayer.getUserId(), targetPlayer.getMHeroId());
            this.boss.syncTarget();
        }
    }
    _bossChangeTargetFromOwner(player, data) {
        // 判断是否是归属者同步的数据
        if (player.getUserId() != this.boss.getOwnerId()) {
            this.boss.syncTarget(player);
            //logger.debug("bossChangeTargetFromClient error, not the owner do", player.getUserId(), player.getPlayerId(), this.boss.getId()); 
            return;
        }

        // 取消攻击目标
        if (data.id == 0) {
            this.boss.clearTarget();
            this.boss.syncTarget();
            this.bossLoseTarget();
            //logger.debug("bossChangeTargetFromClient , client tell boss lose target", player.getUserId(), player.getPlayerId(), this.boss.getId()); 
            return;
        }

        let targetPlayer = playerManager.getPlayerByUid(data.id);
        if (targetPlayer && targetPlayer.getHp() > 0) {
            this.boss.setTarget(targetPlayer.getUserId(), targetPlayer.getMHeroId());
            this.boss.syncTarget();
        }
    }
    pickChest(player, chestId) {
        //console.error("pickChest:", this.boss.getId(), chestId, this.isChestMap);
        if (!this.isChestMap) return;

        // 是否可以夺宝
        if (!player.canPickChest(this.boss.bossType, this.boss.groupType)) {
            console.log("player pick boss chest limit, ignore...", player.getUserId(), this.boss.getId());
            player.sendTips(c_msgCode.pickChestUnenough.id);
            return;
        }

        if (!this.mapChest || this.mapChest.getId() != chestId) {
            console.debug("the map chest is gone", this.boss.getId(), chestId);
            return;
        }

        let proto = { ret: 1 };
        if (this.mapChest.getStatus() != consts.eChestStatus.normal) {
            console.info("user pick chest error:", chestId, this.mapChest.getStatus());
            player.send("pickChest", proto);
            return;
        }

        proto.ret = 0;
        player.send("pickChest", proto);
        //console.log("user pick chest ok:", chestId, proto);
        this.mapChest.pick(player.getUserId(), player.getServerId());

        this.broadcast("syncChest", this.getMapChestProfile());
    }
    unpickChest(player, chestId) {
        if (!this.isChestMap) return;
        if (!this.mapChest || this.mapChest.getId() != chestId) {
            console.debug("the map chest is gone", this.boss.getId(), chestId);
            return;
        }
        if (this.mapChest.getOwnerId() != player.getUserId()) {
            console.debug("the map chest is not yours", player.getUserId(), chestId);
            return;
        }

        this.mapChest.unpick();
        this.broadcast("syncChest", this.getMapChestProfile());
    }
    dropBossBonus(idx) {
        // 接口
        return;
    }
    check() {
        //console.log('map check boss:',this.boss.getId());
        this.checkBoss();
        this.checkChest();
    }
    checkBoss() {
        let tmNow = new Date();
        let bossCfg = c_bossOther[this.boss.getId()];
        if (this.boss.getStatus() == consts.eBossStatus.init) {
            this.boss.spawn();
            if (this.boss.bossType == consts.eBossType.CSTianMing || this.boss.bossType == consts.eBossType.TianMing) {
                // 取时间间隔
                let h = tmNow.getHours();
                h = Math.floor(h / 2) * 2;
                let newBornTime = tmNow.clone().clearTime().addHours(h);
                logger.info("fix boss bornTime:", this.boss.getId(), newBornTime);
                this.boss.fixBornTime(newBornTime);
            }
        } else if (this.boss.getStatus() == consts.eBossStatus.readyForAlive) {
            let statusTime = this.boss.getStatusTime();
            let seconds = statusTime.getSecondsBetween(tmNow);
            if (seconds >= bossCfg.refreshInterval) {
                if (this.boss.getHp() > 0)
                    this.broadcast('syncOver', { ret: consts.eBossResult.timeout });

                this.boss.spawn();
                this.reloadBossPlayer();

                if (this.boss.bossType == consts.eBossType.CSTianMing) {
                    bossManager.setTMDirty(true);
                }
            }
        } else if (this.boss.getStatus() == consts.eBossStatus.alive) {
            // 有变化 护盾消失
            if (this.boss.checkFightStatus()) {

                let proto = {
                    shield: 0,
                    shieldEndTime: 0
                }
                this.broadcast("syncBoss", proto);
            }

            if (this.boss.getHp() <= 0) {
                this.boss.changeStatus(consts.eBossStatus.dead);
                //this.sendAward();
            } else {
                // 生存时间是否已到
                if (bossCfg.alive > 0) {
                    let seconds = this.boss.bornTime.getSecondsBetween(tmNow);
                    if (seconds >= bossCfg.alive) {
                        this.boss.changeStatus(consts.eBossStatus.dead);
                        this.bossTimeOut();
                    }
                }
            }
        } else if (this.boss.getStatus() == consts.eBossStatus.dead) {
            let seconds = this.boss.bornTime.getSecondsBetween(tmNow);
            if (seconds >= bossCfg.alive) {
                this.boss.changeStatus(consts.eBossStatus.readyForAlive);
                this.clearMap();
            }
        }
    }
    clearMap() {
        let UidKeys = Object.keys(this.userList);
        UidKeys.forEach((uid) => {
            let p = this.userList[uid];
            p.leaveMap();
        });
        this.userList = [];
    }
    checkChest() {
        if (!this.isChestMap) return;

        // 宝箱还存在
        if (this.mapChest) {
            if (this.mapChest.canInBag()) {

                let owner = this.mapChest.owner;
                let itemId = this.mapChest.itemId;
                let serverId = this.mapChest.serverId;

                // let oplayer = playerManager.getPlayerByUid(owner);
                // if(oplayer){
                // 	oplayer.send("syncPickDone", itemId);
                // }

                chestManager.removeChest(this.mapChest.getId());


                this.mapChest = null;
                this.nextChestShowTime = new Date().addSeconds(this.mapData.chestRefreshCD || 300);

                this.broadcast("syncChest", this.getMapChestProfile());

                //console.error("check put into bag,remove it");
                w2g.addWChest(owner, itemId, serverId, 1, (err, data, bagItems) => {
                    if (err) return;

                    // 返回玩家背包新数据					
                    let player = playerManager.getPlayerByUid(owner);
                    if (player) {
                        //console.error("syncPickDone", bagItems);
                        player.send("syncPickDone", bagItems);
                    }

                    w2g.addHJBossNum(owner, consts.eCostHJType.chest, this.boss.getId(), this.boss.groupType, serverId, (err1, retData) => {
                        if (err1) return;
                        let userData = retData[0];
                        let exUserData = retData[1];
                        if (player) {
                            player.send("syncUserData", exUserData);
                            player.setUserData(userData);
                        }
                        return;
                    });

                    if (player) {
                        player.send("syncUserData", data);
                    }
                });
            }
        } else {

            // 刷新chest
            let tmNow = new Date();
            if (tmNow.isAfter(this.nextChestShowTime)) {
                let pos = this.getChestBornPos();
                this.mapChest = chestManager.createChest(parseInt(this.mapData.chest[0]), parseInt(pos[0]), parseInt(pos[1]));
                this.nextChestShowTime = null;
                this.broadcast("syncChest", this.getMapChestProfile());
            }
        }
    }
    // sendAward() {
    //     //let insertList = [];
    //     // let mailId = _getMailId(this.boss.bossType);
    //     // let awardArr = bossUtils.getBossOtherAwardItems(this.boss.getId());
    //     // msg.items = awardArr[2];
    //     // this.broadcast('syncResult', msg);

    //     //console.log("sendAward:", this.boss.bossType, this.boss.getId(),this.boss.userIdList);
    //     let userIds = Object.keys(this.boss.userIdList);
    //     userIds.forEach((userId) => {

    //         let bossPlayer = this.boss.getBossPlayer(userId); // this.boss.userIdList[userId];
    //         let serverId = bossPlayer.serverId; //this.boss.userIdList[userId][0];
    //         if (this.boss.getOwnerId() == userId) {
    //             // let locMail = mailBiz.createEntityByType(userId, mailId + 1, [t_monster[this.boss.getId()].name], awardArr[1]);
    //             // //insertList.push(locMail);
    //             // w2g.writeMails(bossPlayer.serverId, w2g.mailEvent.bossReward, [locMail], function() {});
    //             // w2g.noticeAddItem(userId, this.boss.bossType, awardArr[1], this.boss.getId(), serverId);

    //             if (this.boss.bossType == consts.eBossType.HJBoss) {
    //                 w2g.addHJBossNum(userId, consts.eCostHJType.own, this.boss.getId(), this.boss.groupType, serverId, (err1, retData) => {
    //                     if (err1) return;
    //                     let userData = retData[0];
    //                     let exUserData = retData[1];
    //                     let player = playerManager.getPlayerByUid(userId);
    //                     if (player) {
    //                         player.send("syncUserData", exUserData);
    //                         player.setUserData(userData);
    //                     }
    //                     return;
    //                 });
    //             }
    //         } else {
    //             if (this.boss.bossType == consts.eBossType.CSTianMing) {
    //                 // let locMail = mailBiz.createEntityByType(userId, mailId, [t_monster[this.boss.getId()].name], awardArr[0]);
    //                 // w2g.writeMails(bossPlayer.serverId, w2g.mailEvent.bossReward, [locMail], function() {});
    //                 // //insertList.push(locMail); 
    //                 // w2g.noticeAddItem(userId, this.boss.bossType, awardArr[0], this.boss.getId(), serverId);
    //             }
    //         }

    //         // 中立Boss
    //         // if (this.boss.bossType == consts.eBossType.HJBoss || this.boss.bossType == consts.eBossType.CSTianMing) {
    //         let userName = bossPlayer.userName; //this.boss.userIdList[userId][1];
    //         w2g.killBoss(userId, userName, this.boss.getId(), this.boss.bossType, this.boss.getOwnerId() == userId, serverId, (err, zhongLiBossOwnerLootItems) => {
    //             if(this.boss.getOwnerId() == userId){
    //                 let msg = {
    //                     'bossId': this.boss.getId(),
    //                     //'ret' : consts.eBossResult.eWin,
    //                     'owner': this.boss.getOwnerId(),
    //                     'items':zhongLiBossOwnerLootItems
    //                 };
    //                 this.broadcast('syncResult', msg);
    //             }
    //         });
    //         // console.log("w2g.killBoss:",userId, userName, this.boss.getId(), serverId);
    //         // }
    //     });

    //     // 通知结束日志
    //     this.sendToLog(true);
    // }
    sendAward() {
        let userIds = Object.keys(this.boss.userIdList);
        userIds.forEach((userId) => {
            let bossPlayer = this.boss.getBossPlayer(userId); // this.boss.userIdList[userId];
            let userName = bossPlayer.userName; //this.boss.userIdList[userId][1];
            let serverId = bossPlayer.serverId; //this.boss.userIdList[userId][0];
            w2g.killBoss(userId, userName, this.boss.getId(), this.boss.bossType, this.boss.getOwnerId() == userId, serverId, (err, zhongLiBossOwnerLootItems) => {
                if(this.boss.getOwnerId() == userId){
                    if (this.boss.bossType == consts.eBossType.HJBoss) {
                        w2g.addHJBossNum(userId, consts.eCostHJType.own, this.boss.getId(), this.boss.groupType, serverId, (err1, retData) => {
                            if (err1) return;
                            let userData = retData[0];
                            let exUserData = retData[1];
                            let player = playerManager.getPlayerByUid(userId);
                            if (player) {
                                player.send("syncUserData", exUserData);
                                player.setUserData(userData);
                            }
                            return;
                        });
                    }
                    let msg = {
                        'bossId': this.boss.getId(),
                        //'ret' : consts.eBossResult.eWin,
                        'owner': this.boss.getOwnerId(),
                        'items':zhongLiBossOwnerLootItems
                    };
                    this.broadcast('syncResult', msg);
                }
            });
        }); 
        this.sendToLog(true);
    }
    sendToLog(win) {
        var logData = {
            op: "boss",
            serverId: projectConfig.serverId || 999999,
            bornTime: Math.floor(this.boss.bornTime.getTime() / 1000),
            bossType: this.boss.bossType,
            bossId: this.id
        }
        if (this.boss.firstFightTime) {
            logData['firstFightTime'] = Math.floor(this.boss.firstFightTime.getTime() / 1000);
        } else {
            logData['firstFightTime'] = 0;
        }
        if (win) {
            logData['deadTime'] = Math.floor(new Date().getTime() / 1000);
        } else {
            logData['deadTime'] = 0;
        }
        logData['endTime'] = Math.floor(new Date().getTime() / 1000);
        let maxCombat = 0;
        let killNum = 0;
        let userIds = Object.keys(this.boss.userIdList);
        userIds.forEach((userId) => {
            let bossPlayer = this.boss.getBossPlayer(userId);
            if (bossPlayer.combat > maxCombat) {
                maxCombat = bossPlayer.combat;
            }
            killNum += bossPlayer.killNum;
        });
        logData['userNum'] = userIds.length;
        logData['maxCombat'] = maxCombat;
        logData['killNum'] = killNum;
        //console.log("sendToLog:", logData);
        osslog.WriteOss(logData);
    }
    bossTimeOut() {
        this.sendToLog(false);
    }
    getUserNum() {
        return Object.keys(this.userList).length;
    }
    sendToUser(userId, protocol, data) {
        let player = playerManager.getPlayerByUid(userId);
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

// 异界BOSS
class HJBossMap extends WorldMap {
    constructor(bossId) {
        super(bossId)
    }
    checkEnter() {
        return null;
    }
    heroDie(player, hero) {
        // 英雄死亡 
        // 清掉敌人的信息
        let nextMHeroId = player.getMHeroId();
        //console.error("heroDie:", hero.heroId, nextMHeroId);
        let UidKeys = Object.keys(this.userList);
        UidKeys.forEach((uid) => {
            let p = this.userList[uid];
            let target = p.getTarget();
            if (target && target.type == consts.eActorType.player &&
                target.id == player.getUserId() &&
                target.heroId == hero.heroId) {

                if (nextMHeroId > 0) {
                    p.setTarget(consts.eActorType.player, player.getUserId(), nextMHeroId);
                    p.syncTarget(true);
                } else { // player 已死亡
                    if (player.isAllHeroDie()) {
                        //console.error("playerAllDie:",  player.getUserId());
                        p.clearTarget();
                        p.syncTarget(true);
                    }
                }
            }
        });

        let bossTarget = this.boss.getTarget();
        if (bossTarget.id == player.getUserId() && bossTarget.heroId == hero.heroId) {

            if (nextMHeroId > 0) {
                this.boss.setTarget(player.getUserId(), nextMHeroId);
                this.boss.syncTarget();
            } else {
                if (player.isAllHeroDie()) {
                    this.boss.clearTarget();
                    // boss 失去目标 
                    this.bossLoseTarget();

                    this.boss.syncTarget();
                }
            }
        }

        // if(this.boss.getOwnerId() != this.boss.getTarget().id){
        // 	if (player.canOwnerBoss(this.boss.bossType, this.boss.groupType)) {
        // 		this.boss.setOwner(this.boss.getTarget().id);
        // 		this.boss.syncBossOwner();
        // 	}
        // }

        if (player.isAllHeroDie()) {
            this.playerDie(player);
        }
    }
    spawnBoss() {
        this.boss.spawn();
        let proto = this.boss.getProfile();
        this.broadcast("spwanBoss", proto);
    }
    checkBoss() {
        let tmNow = new Date();
        let bossCfg = c_bossOther[this.boss.getId()];
        if (this.boss.getStatus() == consts.eBossStatus.init) {
            this.boss.spawn();
        } else if (this.boss.getStatus() == consts.eBossStatus.readyForAlive) {
            let statusTime = this.boss.getStatusTime();
            let seconds = statusTime.getSecondsBetween(tmNow);
            if (seconds >= bossCfg.refreshInterval) {
                this.spawnBoss();
                this.reloadBossPlayer();
                if (this.boss.bossType == consts.eBossType.HJBoss) {
                    bossManager.setHJDirty(true);
                }
            }
        } else if (this.boss.getStatus() == consts.eBossStatus.alive) {
            // 有变化 护盾消失
            if (this.boss.checkFightStatus()) {

                let proto = {
                    shield: 0,
                    shieldEndTime: 0
                }
                this.broadcast("syncBoss", proto);
            }

            if (this.boss.getLoseTargetStatus() == consts.eLoseTargetStatus.noTarget) {

                let loseTargetTime = this.boss.getLoseTargetStatusTime();
                let seconds = loseTargetTime.getSecondsBetween(tmNow);
                if (seconds >= consts.eCONST.BOSS_RECOVERHP_CD) {
                    this.boss.setLoseTargetStatus(consts.eLoseTargetStatus.init);

                    // 回满血 
                    this.boss.setHp(this.boss.getMaxHp());
                    // 同步boss血量
                    this.boss.syncHp();
                }
            }

            if (this.boss.getHp() <= 0) {
                this.boss.changeStatus(consts.eBossStatus.dead);
            } else {
                // 生存时间是否已到
            }
        } else if (this.boss.getStatus() == consts.eBossStatus.dead) {
            let seconds = this.boss.bornTime.getSecondsBetween(tmNow);
            if (seconds >= bossCfg.alive) {
                this.boss.changeStatus(consts.eBossStatus.readyForAlive);
            }
            this.clearMap();
        }
    }
    clearMap() {
        // nothing
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

        // boss  
        if (this.boss.getTargetId() == player.getUserId()) {
            this.boss.clearTarget();
            this.boss.syncTarget();
            this.bossLoseTarget();
        }
        if (this.boss.getOwnerId() == player.getUserId()) {
            this.boss.clearOwner();
            this.boss.syncBossOwner();
        }

        // 如果在采集宝箱用户
        if (this.mapChest) {
            if (this.mapChest.owner == player.getUserId()) {
                this.mapChest.unpick();
                this.broadcast("syncChest", this.getMapChestProfile());
            }
        }
    }
    cancelBossOwner(player) {
        logger.debug("HJBossMap cancelBossOwner");
        // 归属者取消boss归属		
        if (this.boss.getOwnerId() != player.getUserId()) {
            logger.debug("you arenot boss owner", this.boss.getId(), this.getUserId());
            return;
        }

        this.boss.clearOwner();
        this.boss.syncBossOwner();
    }
}

// 跨服世界Boss地图 （没有归属逻辑)
class CSWorldBossMap extends WorldMap {
    constructor(bossId) {
        super(bossId)
        this.syncRanksTime = new Date();
    }
    checkEnter() {
        // boss死亡后不能进入
        if (this.boss.getStatus() != consts.eBossStatus.alive) {
            return '世界Boss尚没开启,请等待';
        }
        return null;
    }
    onEnter(player) {
        let guildId = player.getGuildId();
        let guild = guildManager.getGuild(guildId);
        if (!guild) {
            guild = guildManager.createGuild(guildId, player.getGuildName(), player.getServerId());
        }
        guild.addGuildUser(player);
    }
    onLeave(player) {
        //console.log("map.onLeave:", this.getMapId(), player.getUserId());
        let guildUser = guildManager.getGuildUser(player);
        if (guildUser) {
            w2g.wbHurt(player.getUserId(), guildUser.getHurt(), player.getServerId(), (err, data) => {
                if (err) return;
                player.send("syncUserData", data);
            });
        }
    }
    initMap(mapData) {
        this.mapData = mapData;
        let boss = bossManager.createBoss(mapData.type, mapData.id, mapData.groupId, this);
        this.addBoss(boss);
    }
    hurt(player, data) {
        //logger.debug("hurt:", player.getMapId(), player.getUserId(), player.getPlayerId(), data);	
        if (player.isAllHeroDie()) {
            logger.debug("player die, ignore hurt:", player.getMapId(), player.getUserId(), player.getPlayerId(), data);
            return;
        }

        if (this.boss.getStatus() != consts.eBossStatus.alive) {
            logger.debug("boss die, ignore hurt:", player.getMapId(), player.getUserId(), player.getPlayerId(), data);
            return;
        }

        let attack = data.attack;
        let hurtData = data.hurtArr[0];

        if (attack.type == consts.eActorType.boss && attack.id == this.boss.getId()) {
            return this.bossHurt(player, data);
        }

        // logger.debug("hurt:", player.getName(), player.getUserId(), player.getPlayerId(), data);	
        if (attack.id != player.getUserId()) {
            logger.debug("ignore, hurt attackId : ", attack.id, " is not playerId : ", player.getUserId(), player.getName());
            return;
        }

        // player
        let lockTarget = player.getTarget();
        if (!lockTarget) {
            logger.debug("ignore22, hurt attackId : ", attack.id, " is not playerId : ", player.getUserId(), player.getName());
            return;
        }

        // 不能判断lockTarget,因为可能会给自己加血，hurtData可能是自己
        if (hurtData.type == consts.eActorType.boss) {

            if (this.boss.getHp() <= 0) {
                //logger.debug("boss die, ignore hurt ", data);
                return;
            }

            this.boss.setBeAttacked();

            // boss 没有目标
            if (this.boss.getTargetId() == 0) {
                // 设置为玩家主英雄
                this.boss.setTarget(player.getUserId(), player.getMHeroId());
                this.boss.syncTarget();
            }

            if (hurtData.hurt <= 0) {
                logger.debug("boss in  hurt, hurt < 0, ignore", hurtData.hurt, hurtData);
                return;
            }
            let guildUser = guildManager.getGuildUser(player);
            if (guildUser) {
                let oldHurt = guildUser.getHurt();
                guildUser.addHurt(hurtData.hurt);
                let newHurt = guildUser.getHurt();

                let tmMSec = new Date().getTime();
                if (tmMSec - player.syncHurtTime >= consts.eCONST.SYNC_HURT_INTERAVL) {
                    w2g.wbHurt(player.getUserId(), newHurt, player.getServerId(), (err, data) => {
                        if (err) return;
                        player.syncHurtTime = tmMSec;
                        player.send("syncUserData", data);
                    });
                }

                // if (gameUtils.isCrossHurt(oldHurt, newHurt)) {
                //     w2g.wbHurt(player.getUserId(), newHurt, player.getServerId(), (err, data) => {
                //         if (err) return;
                //         player.send("syncUserData", data);
                //     });
                // };
            }
            this.boss.setFirstFightTime();
            // 定时扣血量 
        } else {
            // 不能打玩家, 但是可以加血
            let targetPlayer = this.getPlayerInMap(hurtData.id); //playerManager.getPlayerByUid(hurtData.id);
            if (!targetPlayer) {
                logger.debug("pvp  targetPlayer is null", hurtData);
                return;
            }
            if (targetPlayer.isAllHeroDie()) {
                logger.debug("pvp  targetPlayer is dead", hurtData.id);
                return;
            }
            let hero = targetPlayer.getHero(hurtData.heroId);
            if (!hero) {
                logger.debug("pvp hero is null", hurtData);
                return;
            }
            hero.subHp(hurtData.hurt);
            targetPlayer.syncHp(hero);
        }
    }
    bossHurt(player, data) { // boss 攻击玩家
        //console.log("bossHurt :", player.getUserId(), player.getName(), data);
        if (player.isAllHeroDie()) { // 过滤掉归属者死了，boss 还打的逻辑
            return;
        }

        let attack = data.attack;
        let hurtData = data.hurtArr[0];

        if (this.boss.getHp() < 0) {
            logger.debug("boss ", this.boss.getId(), " is dead");
            return;
        }

        let hero = player.getHero(hurtData.heroId);
        if (!hero) return;

        this.boss.setFirstFightTime();
        // boss 没有归属
        if (this.boss.getTargetId() == 0) {
            // player 就是target
            this.boss.setTarget(player.getUserId(), player.getMHeroId());
            this.boss.syncTarget();
        } else {
            // 不是攻击目标的，过滤掉
            if (this.boss.getTargetId() != player.getUserId()) {
                return;
            }
        }

        hero.subHp(hurtData.hurt);
        player.syncHp(hero);

        if (hero.hp <= 0) {
            this.heroDie(player, hero);
        }

        if (player.isDead()) {

        }
    }
    heroDie(player, hero) {
        // 英雄死亡 
        // 清掉敌人的信息
        let nextMHeroId = player.getMHeroId();
        //console.error("heroDie:", hero.heroId, nextMHeroId);
        let UidKeys = Object.keys(this.userList);
        UidKeys.forEach((uid) => {
            let p = this.userList[uid];
            let target = p.getTarget();
            if (target && target.type == consts.eActorType.player &&
                target.id == player.getUserId() &&
                target.heroId == hero.heroId) {

                if (nextMHeroId > 0) {
                    p.setTarget(consts.eActorType.player, player.getUserId(), nextMHeroId);
                    p.syncTarget(true);
                } else { // player 已死亡
                    if (player.isAllHeroDie()) {
                        //console.error("playerAllDie:",  player.getUserId());
                        p.clearTarget();
                        p.syncTarget(true);
                    }
                }
            }
        });

        let bossTarget = this.boss.getTarget();
        if (bossTarget.id == player.getUserId() && bossTarget.heroId == hero.heroId) {

            if (nextMHeroId > 0) {
                this.boss.setTarget(player.getUserId(), nextMHeroId);
                this.boss.syncTarget();
            } else {
                if (player.isAllHeroDie()) {
                    this.boss.clearTarget();
                    // boss 失去目标 
                    this.bossLoseTarget();

                    this.boss.syncTarget();
                }
            }
        }

        if (player.isAllHeroDie()) {
            this.playerDie(player);
        }
    }
    bossDie() {
        this.broadcast('syncOver', { ret: consts.eBossResult.win });
        logger.info("worldBoss bossDie:", this.boss.getId());
        this.sendAward();
    }
    openWbShop() {
        checkRequire();
        let goodsIds = c_bossCSWorld[this.boss.getId()].rechargeId;
        worldBoss.openWbShop(this.boss.getId(), this._userIdList || [], goodsIds);
    }
    sendAward() {
        //this._resultData = {}; 
        this.sendGuildAward();
        // 个人奖励放最后
        this.sendPersonalAward();

        // 记录
        this.recordResult();
    }
    sendPersonalAward() {
        let gulist = guildManager.getAllGuildUserRank();
        this._userIdList = [];
        // this._resultData.rank5 = [];
        // this._resultData.hurtDic = {};
        for (let i = 0; i < gulist.length; i++) {
            let guser = gulist[i];
            if (i < 10) {
                w2g.wbPersonAward(guser.userId, this.boss.getId(), i, guser.serverId, function() {});
            }

            let r = Math.random();
            if (r <= consts.eCONST.LUCKY_PROPAB) {
                // 玩家可以获得幸运宝箱
                w2g.wbLastShotAward(guser.userId, this.boss.getId(), guser.serverId, function() {});
            }

            // if(i < 5){
            // 	this._resultData.rank5.push(guser.userId);
            // }
            //this._resultData.hurtDic[guser.userId] = [guser.nickName, guser.hurt];

            // 返回结果给客户端
            let player = this.userList[guser.userId];
            if (player) {
                let guildUser = guildManager.getGuildUser(player);
                if (guildUser) {
                    let grank = -1;
                    if (!this._guildTopMap[guildUser.guildId]) {
                        if (this._guildTopMap[guildUser.guildId] == 0) {
                            grank = 0;
                        }
                    } else {
                        grank = this._guildTopMap[guildUser.guildId];
                    }
                    let proto = {
                        hurt: guildUser.getHurt(),
                        rank: i,
                        grank: grank,
                        rank1Name: gulist[0].nickName,
                        rank1GuildName: this._rank1GuildName
                    };
                    player.send("syncResult", proto);
                }
            }
            this._userIdList.push(guser.userId);
        }
    }
    sendGuildAward() {
        let glist = guildManager.getGuildRank();
        this._guildTopMap = {};
        for (let i = 0; i < glist.length; i++) {
            let guild = glist[i];
            if (i == 0) {
                // this._resultData.guild1Id = guild.guildId;
                // this._resultData.guild1Name = guild.guildName;
                this._rank1GuildName = guild.guildName;
            }

            if (i < 150) {
                w2g.wbGuildAward(guild.guildId, this.boss.getId(), i, guild.sid, function() {});
            }
            this._guildTopMap[parseInt(guild.guildId)] = i;
        }
    }
    recordResult() {
        // if (this._resultData.rank5.length > 0){
        // 	w2g.wbBattleResult(projectConfig.battleId, this.boss.getId(), this._resultData, function(){});
        // }
        let ret = guildManager.getGuildWBResult();
        if (ret.ulist.length > 0) {
            w2g.wbBattleResult(projectConfig.battleId, this.boss.getId(), ret, function() {});
        }
    }
    spawnBoss() {
        this.boss.spawn();
        let proto = this.boss.getProfile();
        this.broadcast("spwanBoss", proto);
    }
    inspire(player) {

        let guildUser = guildManager.getGuildUser(player);
        if (!guildUser) {
            return;
        }
        if (guildUser.getInspire() > (c_game.worldBossCfg[17] || 50)) {
            return;
        }

        // 鼓舞 
        w2g.inspire(player.getUserId(), this.getMapId(), player.getServerId(), (err, data, exUserData) => {
            if (err) return;
            if (!exUserData || exUserData.errcode) return;

            let guildUser = guildManager.getGuildUser(player);
            if (guildUser) {
                guildUser.addInspire(1);
                this.syncUserSelf(player);
            }

            player.send("syncUserData", data);
            return;
        });
    }
    check() {
        //console.log('map check boss:',this.boss.getId());
        this.checkBoss();
        this.checkGuild();
    }
    checkBossSkill(tmNow) {
        // 技能已完毕
        if (this.boss.skillArr.length == 0) {
            return;
        }
        let curSkill = this.boss.skillArr[0];
        //console.log("checkBossSkill:", curSkill, tmNow);
        if (tmNow.isAfter(curSkill.executeTime)) {
            logger.info("worldBoss checkBossSkill:", curSkill, tmNow);
            // 执行AOE
            this.executeBossSkill(curSkill);
            this.boss.skillArr.shift();
        }
    }
    executeBossSkill(skill) {
        let proto = {
            skillId: skill.id,
            hurt: skill.hurt
        }
        this.broadcast("executeSkill", proto);

        // 遍历所有玩家，所有英雄扣血
        let UidKeys = Object.keys(this.userList);
        UidKeys.forEach((uid) => {
            let p = this.userList[uid];
            let ids = Object.keys(p.heroList);
            for (let i = 0; i < ids.length; i++) {
                let hero = p.heroList[ids[i]];
                if (hero.getHp() > 0) {
                    hero.subHp(skill.hurt);
                    p.syncHp(hero);
                }
            }
            if (p.isAllHeroDie()) {
                this.playerDie(p);
            }
        });

        // boss对象是否已死亡
        let bossTarget = this.boss.getTarget();
        let player = this.getPlayerInMap(bossTarget.id);
        if (!player) return;
        let playerHero = player.getHero(bossTarget.heroId);
        if (!playerHero) {
            this.boss.clearTarget();
            // boss 失去目标 
            this.bossLoseTarget();

            this.boss.syncTarget();
            return;
        }

        if (playerHero.isDead()) {
            this.heroDie(player, playerHero);
        }
    }
    syncUserSelf(player) {
        let guildUser = guildManager.getGuildUser(player);
        if (guildUser) {
            let proto = {};
            proto.hurt = guildUser.getHurt();
            proto.inspire = guildUser.getInspire();
            player.send("syncSelf", proto);
        }
    }
    dropBossBonus(idx) {
        // console.log("dropBossBonus:",idx);
        let type = 0;
        // if (idx == 9){
        // 	type = 1;
        // }
        let UidKeys = Object.keys(this.userList);
        UidKeys.forEach((uid) => {
            let player = this.userList[uid];
            let r = Math.random();
            if (r <= consts.eCONST.DROP_PROPAB) {
                // 玩家可以获得神秘钥匙 
                w2g.addWorldLuckyAward(uid, this.boss.getId(), type, player.getServerId(), (err, data, bagItems) => {
                    if (err) return;
                });
            }
        });
        return;
    }
    checkUser(tmNow) {
        let tmMSec = tmNow.getTime();
        let UidKeys = Object.keys(this.userList);
        UidKeys.forEach((uid) => {
            let p = this.userList[uid];
            if (tmMSec - p.syncSelfTime >= consts.eCONST.SYNC_SELF_INTERAVL) {
                this.syncUserSelf(p);
                p.syncSelfTime = tmMSec;
            }
        });
    }
    checkBoss() {
        checkRequire();
        let tmNow = new Date();
        let bossCfg = c_bossCSWorld[this.boss.getId()];
        if (this.boss.getStatus() == consts.eBossStatus.init) {
            this.boss.spawn();
        } else if (this.boss.getStatus() == consts.eBossStatus.readyForAlive) {
            let statusTime = this.boss.getStatusTime();
            let seconds = statusTime.getSecondsBetween(tmNow);
            if (seconds >= bossCfg.refreshInterval) {
                if (this.boss.getHp() > 0)
                    this.broadcast('syncOver', { ret: consts.eBossResult.timeout });

                this.boss.spawn();
                this.reloadBossPlayer();
            }
        } else if (this.boss.getStatus() == consts.eBossStatus.alive) {
            // // 有变化 护盾消失
            // if(this.boss.checkFightStatus()){

            // 	let proto = {
            // 		shield: 0,
            // 		shieldEndTime:0
            // 	} 
            // 	this.broadcast("syncBoss", proto);

            // 	// 重置被攻击状态
            // 	this.boss.refreshReduceHpTime();
            // }

            // //护盾中
            // if(this.boss.getFightStatus() == consts.eFightStatus.shield){
            // 	return;
            // }

            this.checkBossSkill(tmNow);
            this.checkUser(tmNow);

            let hurtBossHp = 0;
            // if (this.boss.beAttacked){
            // 	let difActiveTime = this.boss.beAttackedTime.getMillisecondsBetween(tmNow);
            // 	if (difActiveTime >= 2000){	// 2秒没有打boss, 重置状态
            // 		this.boss.clearBeAttacked();
            // 	}else{
            let difReduceTime = this.boss.lastReduceTime.getMillisecondsBetween(tmNow);
            if (difReduceTime >= 500) { // 500毫秒扣一次血
                hurtBossHp = Math.floor(difReduceTime / 1000.0 * this.boss.perReduceHp);
                this.boss.refreshReduceHpTime();
            }
            // 	}
            // }

            if (hurtBossHp > 0) {
                this.boss.subHp(hurtBossHp);
                this.boss.syncHp();
            }

            if (this.boss.getHp() <= 0) {
                this.boss.changeStatus(consts.eBossStatus.dead);
                this.bossDie();
                //this.sendAward();
            } else {
                // 生存时间是否已到
                if (bossCfg.alive > 0) {
                    let seconds = this.boss.bornTime.getSecondsBetween(tmNow);
                    if (seconds >= bossCfg.alive) {
                        this.boss.changeStatus(consts.eBossStatus.dead);
                        this.bossDie();
                        //this.bossTimeOut();
                    }
                }
            }
        } else if (this.boss.getStatus() == consts.eBossStatus.dead) {
            // 设置地图回收逻辑
            this.openWbShop();
            this.boss.changeStatus(consts.eBossStatus.final);
            this.clearMap();
        } else if (this.boss.getStatus() == consts.eBossStatus.final) {}
    }
    checkGuild() {
        if (this.getUserNum() <= 0) return;
        let tmNow = new Date();
        if (tmNow.getTime() - this.syncRanksTime.getTime() >= consts.eCONST.SYNC_GUILDRANK_INTERVAL) {
            this.syncRanks();
        }
    }
    clearMap() {
        let UidKeys = Object.keys(this.userList);
        UidKeys.forEach((uid) => {
            let p = this.userList[uid];
            p.leaveMap();
        });
        this.userList = [];
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

        // boss  
        if (this.boss.getTargetId() == player.getUserId()) {
            this.boss.clearTarget();
            this.boss.syncTarget();
            this.bossLoseTarget();
        }
    }
    cancelBossOwner(player) {
        logger.debug("CSWorldBossMap cancelBossOwner");
    }
    syncRanks() {
        let p = guildManager.getUserRank3();
        this.broadcast("syncRanks", p);
        this.syncRanksTime = new Date();
    }
    onGuildRankAll(player) {
        let p = guildManager.getGuildRank();
        player.send("guildRankAll", p);
    }
    onUserRank(player) {
        let p = guildManager.getAllGuildUserRankProto();
        player.send("userRank", p);
    }
    onGetSelfRank(player) {
        let guser = guildManager.getGuildUser(player);
        let proto = {};
        proto.hurt = guser.getHurt();
        proto.grank = guildManager.getGuildRankByGid(player.getGuildId());
        proto.urank = guildManager.getUserRankByUid(player.getUserId());
        player.send("getSelfRank", proto);
    }
}

// 地图管理
class WorldMapManager {
    constructor() {
        this.worldMapList = {};
        this.timer = null;
    }
    _createMap(mapType, mapId) {
        let p = null;
        if (mapType == consts.eBossType.HJBoss) { // 幻境boss
            p = new HJBossMap(mapId);
        } else if (mapType == consts.eBossType.CSWorldBoss) { // 世界Boss
            p = new CSWorldBossMap(mapId);
        } else {
            p = new WorldMap(mapId);
        }
        this.worldMapList[mapId] = p;
        //console.error("create createMap:", mapType, mapId);
        return p;
    }
    getMap(mapId) {
        return this.worldMapList[mapId];
    }
    init() {
        logger.info("WorldMapManager::init");
        let ids = Object.keys(c_bossOther);
        for (let i = 0; i < ids.length; i++) {
            let bossEntity = c_bossOther[ids[i]];
            if (bossEntity.type == consts.eBossType.CSTianMing ||
                bossEntity.type == consts.eBossType.HJBoss) {
                let m = this._createMap(bossEntity.type, bossEntity.id);
                m.initMap(bossEntity);
            }
        }
        // // 世界boss
        // let wids = Object.keys(c_bossCSWorld);
        // for (let i = 0; i < wids.length; i++){
        // 	 let bossEntity = c_bossCSWorld[wids[i]]; 
        // 	 console.log("csworld bossEntity:", bossEntity);
        // 	if (bossEntity.type == consts.eBossType.CSWorldBoss){
        // 		let m = this._createMap(bossEntity.type, bossEntity.id);
        // 		m.initMap(bossEntity);
        // 	} 
        // }
    }
    createWorldBossMap(id) {
        let bossEntity = c_bossCSWorld[id];
        let m = this._createMap(bossEntity.type, bossEntity.id);
        m.initMap(bossEntity);
    }
    deleteWorldBossMap(id) {
        let m = this.worldMapList[id];
        m && m.setDelete();
    }
    start() {
        if (!this.timer) {
            this.timer = setInterval(() => { this.run(); }, 1000);
        }
    }
    run() {
        //console.log("worldMapManager:");
        // 天命boss定时同步信息 (每秒钟同步一次)
        var tmNowSec = new Date().getTime();
        bossManager.check();
        let bossInfo = bossManager.getBossListByType(consts.eBossType.CSTianMing);
        let mapIds = Object.keys(this.worldMapList);
        for (let i = 0; i < mapIds.length; i++) {
            let mapId = mapIds[i];
            let wmap = this.worldMapList[mapId];

            if (wmap.isDelete && tmNowSec - wmap.deleteTime > consts.eCONST.MAP_DEL_INTERVAL) {
                delete this.worldMapList[mapId];
            } else {
                wmap.check();
                if (wmap.boss.bossType == consts.eBossType.CSTianMing) {
                    wmap.broadcast("syncBossInfo", bossInfo);
                }
            }
        }
    }
}

var _getMailId = function(bossType) {
    if (bossType == consts.eBossType.CSTianMing) {
        return 73;
    } else if (bossType == consts.eBossType.HJBoss) {
        return 92;
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