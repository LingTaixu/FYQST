/**
 * Created by Administrator on 14-9-25.
 */
 var uwData = require("uw-data");
var c_game = uwData.c_game;
var c_bossParameter = uwData.c_bossParameter;
var c_bossWorld = uwData.c_bossWorld;
var c_prop = uwData.c_prop;
var getMsg = require("uw-utils").msgFunc(__filename);
var c_msgCode = uwData.c_msgCode; 
var bossUtils = require("./bossUtils");

var BossObj = function () {
    //整个服务器掉落的缓存
    this._bossData = {};
    this._userDic = {};
    this._rankUserList = [];
    this._isOpen = false;
    this._guildDic = {};
    this._timeOutId = null;
    this._rankRefreshTime = null;
    this._bossId = null;//
    this._personal = false;     // 属于个人的，先阶段是引导boss，该boss永远不会死亡,死亡只是对个人显示 （现阶段只有组队boss才有 固定id :300000)
    this._shopRecord = {};     // 商店购买记录

    this.initBossId = function(bossId){
        this._bossId = bossId;
        if (bossId == 300000){
            this._personal = true; 
        }
    };

    this.getBossId = function(){
        return this._bossId;
    };

    this.getBossType = function(){
        if (c_bossParameter[this._bossId]) return c_prop.worldBossTypeKey.guild;
        if (c_bossWorld[this._bossId]) return c_prop.worldBossTypeKey.world;
        if (c_bossTeam[this._bossId]) return c_prop.worldBossTypeKey.team;
        return getMsg(c_msgCode.unknowType); 
    };

    //重置数据
    this.reset = function () {
        this._bossData = {};
        this._userDic = {};
        this._rankUserList = [];
        this._isOpen = false;
        this._guildDic = {};
        this._rankRefreshTime = null;
        this._shopRecord = {};
        if (this._timeOutId) {
            clearTimeout(this._timeOutId);
            this._timeOutId = null;
        }
    };

    //是否进行中
    this.isOpen = function () {
        return this._isOpen;
    };

    this.isPersonal = function(){
        return this._personal;
    }

    /**
     * 初始化
     */
    this.openBoss = function (bossOpt, setOverFun) {
        this.reset();
        this._isOpen = true;
        var boss = new BossData();
        boss.originHp = bossOpt.originHp;
        boss.curHp = bossOpt.curHp;
        boss.bossId = bossOpt.bossId;//boss的id
        boss.bossName = bossOpt.bossName;//boss的id
        boss.startTime = bossOpt.startTime;
        boss.endTime = bossOpt.endTime;
        boss.callUserId = bossOpt.callUserId;
        boss.callUserName = bossOpt.callUserName;
        boss.callUserIcon = bossOpt.callUserIcon;
        boss.callUserGuildName = bossOpt.callUserGuildName;
        boss.callUserGuildId = bossOpt.callUserGuildId;
        boss.type = bossOpt.type;
        boss.isLock = bossOpt.isLock;
        boss.originBossId = bossOpt.originBossId;
        boss.isRepeat = bossOpt.isRepeat; 
        boss.isPersonal = this._personal;
//        boss.status = bossOpt.status;
        this._bossData = boss;


        //如果是行会boss，boss会逃跑
        if(bossOpt.type==c_prop.worldBossTypeKey.guild){
            var reTime = this._getReDisappearSeconds(bossOpt.bossId);
            //reTime = 30;
            this._timeOutId = setTimeout(setOverFun, reTime * 1000);
        }
        return boss;
    };

    /**
     * 初始化世界boss
     */
    this.openWorldBoss = function (bossOpt,setOverFun) {
        this.reset();
        this._isOpen = true;
        var boss = new BossData();
        boss.originHp = bossOpt.originHp;
        boss.curHp = bossOpt.curHp;
        boss.bossId = bossOpt.bossId;//boss的id
        boss.bossName = bossOpt.bossName;//boss的id
        boss.startTime = bossOpt.startTime;
        boss.endTime = bossOpt.endTime;
        boss.type = bossOpt.type;
        boss.originBossId = bossOpt.originBossId;
        boss.isPersonal = this._personal;
//        boss.status = bossOpt.status;
        this._bossData = boss;

        var reTime = this._getReDisappearSeconds(bossOpt.bossId);
        //reTime = 30;
        this._timeOutId = setTimeout(setOverFun, reTime * 1000);
        return boss;
    };

    /**
     * 初始化世界boss
     */
    this.openTeamBoss = function (bossOpt,setOverFun) {
        this.reset();
        this._isOpen = true;
        var boss = new BossData();
        boss.originHp = bossOpt.originHp;
        boss.curHp = bossOpt.curHp;
        boss.bossId = bossOpt.bossId;//boss的id
        boss.bossName = bossOpt.bossName;//boss的id
        boss.startTime = bossOpt.startTime;
        boss.endTime =  bossOpt.endTime;
        boss.type = bossOpt.type;
        boss.originBossId = bossOpt.originBossId;
        boss.status = bossOpt.status;
        boss.isPersonal = this._personal;
        this._bossData = boss;
        //console.log("openTeamBoss:",boss.isPersonal); 
        //reTime = 30;  没有结束时间 
        return boss;
    };

    //获取公会数据
    this.getGuildData = function (guildId) {
        var guildData = this._guildDic[guildId];
        if (!guildData) {
            guildData = new GuildData();
            guildData.guildId = guildId;
            this._guildDic[guildId] = guildData;
        }
        return guildData;
    };

    //设置公会数据
    this.setGuildData = function (guildId, data) {
        this._guildDic[guildId] = data;
    };

    /**
     * 获取bossData
     * @returns {{}}
     */
    this.getBossData = function () {
        return this._bossData;
    };

    //获取伤害排行数据
    this.getRankUserList = function () {
        if (!this._rankRefreshTime) {
            this._rankRefreshTime = new Date();
        }
        if (this._rankRefreshTime && this._rankRefreshTime.getSecondsBetween(new Date()) > 5) {
            this.calDpsRank();
            this._rankRefreshTime = new Date();
        }
        if (this._rankUserList.length <= 0) this.calDpsRank();

        return this._rankUserList;
    };

    //获取用户数据
    this.getUserData = function (userId) {
        var userData = this._userDic[userId];
        if (!userData) {
            userData = new UserData();
            userData.userId = userId;
            userData.hurt = 0;
            userData.rank = 0;
            this._userDic[userId] = userData;
        }
        return userData;
    };

    this.hasUserData = function (userId) {
        var userData = this._userDic[userId];
        if (userData) {
            return true;
        } else {
            return false;
        }
    };

    // 得到用户hurt值
    this.getUserHurt = function(userId){
        var userData = this._userDic[userId];
        if (!userData) {
            return 0;
        }
        return userData.hurt;
    };

    //设置用户数据
    this.setUserData = function (userId, data) {
        this._userDic[userId] = data;
    };

    //获取所有数据
    this.getAllUserData = function () {
        return this._userDic;
    };

    // 是否有用户在战斗
    this.hasUserFight = function(){ 
        for(var userId in this._userDic){
            if (this._userDic[userId].isStartFight){
                return true;
            }
        }
        return false;
    }

    // 获得世界boss的shopInfo
    this.getShopInfo = function(userId){
        if (!this._isOpen || this._bossData.isOver != 1|| !this._bossData.deathTime  || !this._userDic[userId] || this._bossData.type != c_prop.worldBossTypeKey.world){
           // console.error("BossObj.getShopInfo:",this._isOpen, this._bossData.isOver, this._bossData.deathTime, this._userDic[userId],this._bossData.type);
            return null;
        }
        
        var userData = this._userDic[userId];
        //console.log("getShopInfo;", this._userDic); 
        var nowSec = new Date().getTime();
        var deathSec = this._bossData.deathTime.getTime();
        if (nowSec - deathSec > 600 * 1000 || nowSec < deathSec){
           // console.error("BossObj.getShopInfo 2:", nowSec, deathSec);
            return null;
        }
        var ret = {};
        if (nowSec - deathSec > 300 * 1000) {         
            for (var i = 0; i < c_bossWorld[this._bossData.bossId].rechargeId.length; i++){
                var rechargeId = c_bossWorld[this._bossData.bossId].rechargeId[i];
                if (!this._shopRecord[rechargeId])
                    ret[rechargeId] = Math.floor((600 * 1000 -  nowSec + deathSec) / 1000);
            }
            return ret;
        }else{ 
            if (!userData.rank || userData.rank > 3){
               // console.error("BossObj.getShopInfo 3:", userData.rank);
                return null;
            }else{
                var rechargeId = c_bossWorld[this._bossData.bossId].rechargeId[userData.rank-1];
                if (this._shopRecord[rechargeId]){
                  //  console.error("BossObj.getShopInfo 4:", this._shopRecord, rechargeId);
                    return null;
                }
                ret[rechargeId] =  Math.floor((300 * 1000 -  nowSec + deathSec) / 1000);
                return ret;
            }
        }
        return null;
    };

    this.canBuyShopItem = function(userId, rechargeId){
        var shopItem = this.getShopInfo(userId);
        if (!shopItem || !shopItem[rechargeId]){
            // console.error("canBuyShopItem  :", shopItem);
            return false;
        }
        // 已被购买过
        if (this._shopRecord[rechargeId]){
           // console.error("canBuyShopItem 3:", this._shopRecord, rechargeId);
            return false;
        }
        return true;
    }

    // 玩家购买
    this.buyShopItem = function(userId, rechargeId){
        var shopItem = this.getShopInfo(userId);
        if (!shopItem || !shopItem[rechargeId]){
           // console.error("buyShopItem  :", this._shopRecord, rechargeId);
            return false;
        }

        this._shopRecord[rechargeId] = userId;
        return true;
    };

    //获取伤害排行        [UserData,UserData.....]
    this.calDpsRank = function () {
        var list = [];
        for (var key in this._userDic) {
            var userData = this._userDic[key];
            var hurt = userData.hurt || 0;
            if (hurt <= 0) continue;
            list.push([userData.userId, hurt]);
        }
        list = this._sortList(list);
        var rank = 0;
        var returnArr = [];
        for (var i = 0; i < list.length; i++) {
            rank++;
            var userId = list[i][0];
            this._userDic[userId].rank = rank;
            returnArr.push(this._userDic[userId]);
        }
        this._rankUserList = returnArr;
    };

    //排序
    this._sortList = function (list) {
        //数据结构：[id,伤害]
        var sortIdx = [1, 0]; //排序规则：伤害＞id
        var sortType = [-1, 1]; //id升序，伤害降序
        list.sort(function (a, b) {
            for (var i = 0; i < 2; i++) {
                var type = sortType[i];
                if (a[sortIdx[i]] > b[sortIdx[i]]) {
                    return type <= 0 ? -1 : 1;
                }
                else if (a[sortIdx[i]] < b[sortIdx[i]]) {
                    return type <= 0 ? 1 : -1;
                }
            }
            return 0;
        });
        return list;
    };

    //获取剩余消失时间
    this._getReDisappearSeconds = function (bossId) {
        var diffSeconds = 0;
        if(this.getBossType()==c_prop.worldBossTypeKey.guild){
            var c_bossData = c_bossParameter[bossId];
            var startTime = this._bossData.startTime;
            //timeLimit
            var aliveTime = c_bossData.timeLimit;
            diffSeconds = (new Date()).getSecondsBetween(startTime.clone().addSeconds(aliveTime));
        } else if(this.getBossType()==c_prop.worldBossTypeKey.world){
            var endTime =bossUtils.getWorldOpenEndTime(bossId);
            diffSeconds = (new Date()).getSecondsBetween(endTime);
        }
        diffSeconds = diffSeconds > 0 ? diffSeconds : 0;
        return diffSeconds;
    };
};
 
var GuildData = function () {
    this.guildId = null;//行会id
    this.inspireRecordArr = [];//鼓舞记录 [玩家名，玩家名....]
    this.inspireEndTime = new Date();//鼓舞结束时间
    this.inspireNum = 0;//鼓舞次数
    this.fightUserIds = [];
};

var UserData = function () {
    this.userId = null;
    this.userName = null;//用户名
    this.hurt = 0;//伤害
    this.rank = 0;//排名
    this.isStartFight = false;//是否开始战斗userData
    this.guildName = "";//公会名
    this.icon = null;//头像
    this.vip = null;//排名
    this.lastHurtTime = null;//最后一次伤害时间
    this.heroMaxHurt = {};//英雄对怪物的最大伤害
    this.myKey = 0 | Math.random() * 1000;//字符串
    this.isFirstStart = 1;
    this.locItems = null; // 掉落物品数值  （组队boss有效)
    this.inspireNum = 0;    // 个人鼓舞次数 （组队boss有效)
    this.inspireEndTime = new Date(); // 个人鼓舞结束时间（组队boss有效)
    this.hurtBossHp = 0;    // 组队引导boss有用,记录扣得boss血量
    this.combat = 0;
};

//缓存对象
var BossData = function () {
    this.originHp = 0;//原始生命值
    this.curHp = 0;//当前hp
    this.bossId = null;//boss的id
    this.bossName = null;//boss名称
    this.killUserId = null;//击杀人的id
    this.killUserName = null;//击杀人的名字
    this.deathTime = null;//死亡时间
    this.startTime = null;//开始时间
    this.endTime = null;//结束时间
    this.callUserId = null;//召唤者id
    this.callUserName = null;//召唤者名字
    this.callUserGuildName = null;//召唤者公会名
    this.callUserGuildId = null;//召唤者公会id
    this.callUserIcon = null; //召唤者Icon
    this.isOver = 0;
    this.type = 0;//世界boss类型
    this.sendNoHpMsgArr = [];
    this.isLock = null;
    this.originBossId = null;//boss的起始id
    this.sendTreasureMsgArr = [];
    this.isRepeat = 0;
    this.isPersonal = false;
    this.isActive = false;      // 标识是否活跃 （全民BOSS)
    this.lastActvieTime = null;   // 最后伤害时间
};


module.exports = BossObj;