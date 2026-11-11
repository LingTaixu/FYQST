/*
 * liuqiang 2018-04-09 
 * 剥离出数据库操作
 */
//var uwClient = require("uw-db").uwClient;
var async = require("async");
var userDao = null;
var heroDao = null;
var heroBiz = null;
var taskDao = null;
var accountDao = null;
var activityDao = null;
var publicActivityDao = null;
var gameRecordBiz = null;
var gameRecordDao = null;
var mailBiz = null;
var uwData = require("uw-data");
var c_prop = uwData.c_prop;
var loginClient = require("uw-db").loginClient;
var mainClient = require("uw-db").mainClient;
var projectConfig = require('uw-config').project;
var SAVEDB_INTERVAL = projectConfig.saveDBInterval * 1000; // 5000; // SAVE DB 的间隔
var HEARTBEAT_INTERVAL = 20000; // 20秒没有收到a.u.f 玩家离线
var REMOVEUSER_INTERVAL = 10000; // 5秒后从内存中删除
var CHECKMAIL_INTERVAL = 60000; // 1分钟check一次mail状态 
var g_server = require("./g_server");
var uwClient = null;


Number.tempId2Job = function(tempId) {
    return tempId.toString()[0] * 1;
};

exports.UDDirtyType = {
    all: 0,
    medal: 1, // 称号
    achieve: 2, // 成就
    exdata: 3, // 扩展数据
    bag: 4, // 不更新背包 bag
    equipBag: 5, // 不更新 equipBag 
    noTwoBag: 6 // 不更新  bag, equipBag
};

//缓存 (es6)
class GamePlayer {
    constructor() {
        this.userData = null;
        this.taskData = null;
        this.heroListData = null;
        this.todayGameRecord = null; // 当天GameRecord的记录值

        this.accountData = null; // 账号信息

        this.accountName = null; // 玩家账号
        this.channelId = null; // 渠道ID

        this.initOk = false;

        this.userDataDirty = false;

        // 用户数据dirty分段
        this.udMedalDirty = false;
        this.udAchieveDirty = false;
        this.udBagDirty = false; //  更新 bag字段 (排除equipBag)
        this.udEquipBagDirty = false; //  更新 equipBag字段 (排除bag)
        this.udNoTwoBagDirty = false; // 不更新 bag, equipBag 字段
        this.udExDataDirty = false;

        this.taskDataDirty = false;
        this.heroIdsDirty = [];
        this.todayGameRecordDirty = false;

        this.lastTime = new Date().getTime();
        this.saveDBTime = new Date().getTime();
        this.removeTime = null; // 记录准备删除的时间
        this.beRemoveing = false; // 在删除中

        this.haveNewMail = 0; // 是否有新邮件或有附件未领取 0 未新提醒 1 有新提醒
        this.checkMailTime = new Date().getTime() - CHECKMAIL_INTERVAL;
    }
    getHero(heroId) {
        for (var i = 0; i < this.heroListData.length; i++) {
            if (this.heroListData[i].id == heroId) {
                return this.heroListData[i];
            }
        }
    }
    getHeroByTempId(tempId) {
        for (var i = 0; i < this.heroListData.length; i++) {
            if (this.heroListData[i].tempId == tempId) {
                return this.heroListData[i];
            }
        }
    }
    getHeroByJob(tempId) {
        var tempId2Job = Number.tempId2Job(tempId);
        for (var i = 0; i < this.heroListData.length; i++) {
            if (tempId2Job == Number.tempId2Job(this.heroListData[i].tempId)) {
                return this.heroListData[i];
            }
        }
    }
    getTodayGameRecord(client, cb) {
        //   
        if (this.todayGameRecord) {
            var recordDay = new Date(this.todayGameRecord.recordTime);
            if (recordDay.equalsDay(new Date())) {
                return cb(null, this);
            }
        }

        gameRecordBiz = gameRecordBiz || require("uw-game-record").gameRecordBiz;
        gameRecordBiz.getTodayGameRecord(client, this.userData.id, (err, todayGameRecord) => {
            if (err) return (err);
            this.todayGameRecord = todayGameRecord;
            return cb(null, this);
        });
    }
    getAccount() {
        return this.accountData.name;
    }
    getAccountId() {
        return this.userData.accountId;
    }
    getChannelId() {
        return this.accountData.channelId;
    }
    getSdkChannelId() {
        return this.accountData.sdkChannelId;
    }
    getUserId() {
        return this.userData.id;
    }
    initDone() {
        this.initOk = true;
    }
    setRemove() {
        //console.error("setRemove...");
        this.beRemoveing = true;
        this.removeTime = new Date().getTime();
    }
    reuse() {
        //console.error("reuse gamePlayer cache...");
        this.removeTime = null;
        this.beRemoveing = false;
        this.active();
    }
    setUserDataDirty(t) {
        t = t || exports.UDDirtyType.all;
        switch (t) {
            case exports.UDDirtyType.all:
                this.userDataDirty = true;
                break;
            case exports.UDDirtyType.medal:
                this.udMedalDirty = true;
                break;
            case exports.UDDirtyType.achieve:
                this.udAchieveDirty = true;
                break;
            case exports.UDDirtyType.exdata:
                this.udExDataDirty = true;
                break;
            case exports.UDDirtyType.noTwoBag:
                this.udNoTwoBagDirty = true;
                break;
            case exports.UDDirtyType.bag:
                this.udBagDirty = true;
                if (this.udEquipBagDirty) {
                    this.userDataDirty = true;
                }
                break;
            case exports.UDDirtyType.equipBag:
                this.udEquipBagDirty = true;
                if (this.udBagDirty) {
                    this.userDataDirty = true;
                }
                break;
        }
    }
    clearUserDataDirty(t) {
        t = t || exports.UDDirtyType.all;
        switch (t) {
            case exports.UDDirtyType.all:
                this.userDataDirty = false;
                this.udMedalDirty = false;
                this.udAchieveDirty = false;
                this.udExDataDirty = false;
                this.udNoTwoBagDirty = false;
                this.udBagDirty = false;
                this.udEquipBagDirty = false;
                break;
            case exports.UDDirtyType.medal:
                this.udMedalDirty = false;
                break;
            case exports.UDDirtyType.achieve:
                this.udAchieveDirty = false;
                break;
            case exports.UDDirtyType.noTwoBag:
                this.udMedalDirty = false;
                this.udAchieveDirty = false;
                this.udNoTwoBagDirty = false;
                this.udExDataDirty = false;
                break;
            case exports.UDDirtyType.bag:
                this.udMedalDirty = false;
                this.udAchieveDirty = false;
                this.udNoTwoBagDirty = false;
                this.udExDataDirty = false;
                this.udBagDirty = false;
                break;
            case exports.UDDirtyType.equipBag:
                this.udMedalDirty = false;
                this.udAchieveDirty = false;
                this.udNoTwoBagDirty = false;
                this.udExDataDirty = false;
                this.udEquipBagDirty = false;
                break;
            case exports.UDDirtyType.exdata:
                this.udExDataDirty = false;
                break;
        }
    }
    setTaskDataDirty(s = true) {
        this.taskDataDirty = s;
    }
    setHeroDataDirty(id) {
        if (this.heroIdsDirty.indexOf(id) == -1) {
            this.heroIdsDirty.push(id);
        }
    }
    setAllHeroDataDirty() {
        for (var i = 0; i < this.heroListData.length; i++) {
            this.setHeroDataDirty(this.heroListData[i].id);
        }
    }
    setTodayGameRecordDirty(s = true) {
        this.todayGameRecordDirty = s;
    }
    // setMazeScoreDirty(){
    //     this.mazeScoreDirty = s;
    // }
    active() {
        this.lastTime = new Date().getTime();
    }
    check(tmNow) {
        if (!this.initOk) { // 未初始化成功
            return;
        }
        checkRequire();
        this._checkMail(tmNow);
    }
    _checkMail(tmNow) {
        if (tmNow - this.checkMailTime >= CHECKMAIL_INTERVAL) {
            mailBiz.checkGamePlayerMail(uwClient, this);
            this.checkMailTime = tmNow;
        }
    }
    getMailFlag() {
        return this.haveNewMail;
    }
    setMailFlag(f) {
        this.haveNewMail = f;
    }
    save(client) {
        if (!this.initOk) { // 未初始化成功
            console.error("check user to save , not initOk:", this.userData.id);
            return;
        }
        // 过滤掉机器人
        if (this.userData.robotId > 0 || this.userData.accountId == 0) {
            console.log("it is robot , ignore it ", this.userData.id);
            return;
        }
        console.log("check user to save:", this.userData.id);
        if (this.userDataDirty) {
            userDao.update(client, this.userData, { id: this.userData.id }, function(err, data) {});
            this.clearUserDataDirty(exports.UDDirtyType.all);
            console.log("user:", this.userData.id, " save userData to DB");
        }
        if (this.udEquipBagDirty) {
            var updateUserData = this.userData;
            var bag = this.userData.bag;
            delete updateUserData.bag;
            userDao.update(client, updateUserData, { id: this.userData.id }, function(err, data) {});
            console.log("user:", this.userData.id, " save equipBag to DB");
            this.userData.bag = bag;
            this.clearUserDataDirty(exports.UDDirtyType.equipBag);
        }
        if (this.udBagDirty) {
            var updateUserData = this.userData;
            var equipBag = this.userData.equipBag;

            delete updateUserData.equipBag;
            userDao.update(client, updateUserData, { id: this.userData.id }, function(err, data) {});
            console.log("user:", this.userData.id, " save bag to DB");
            this.userData.equipBag = equipBag;
            this.clearUserDataDirty(exports.UDDirtyType.bag);
        }
        if (this.udNoTwoBagDirty) {
            var updateUserData = this.userData;
            var bag = this.userData.bag;
            var equipBag = this.userData.equipBag;

            delete updateUserData.bag;
            delete updateUserData.equipBag;
            userDao.update(client, updateUserData, { id: this.userData.id }, function(err, data) {});
            console.log("user:", this.userData.id, " save nobag, noEquipBag to DB");
            this.userData.bag = bag;
            this.userData.equipBag = equipBag;
            this.clearUserDataDirty(exports.UDDirtyType.noTwoBag);
        }
        if (this.udExDataDirty) {
            var updateUserData = {
                exData: this.userData.exData
            };
            userDao.update(client, updateUserData, { id: this.userData.id }, function(err, data) {});
            console.log("user:", this.userData.id, " save exdata to DB");
            this.udExDataDirty = false;
        }
        if (this.udAchieveDirty) {
            var updateUserData = {
                achieveLvl: this.userData.achieveLvl,
                achieveExp: this.userData.achieveExp,
                jxLvl: this.userData.jxLvl,
                jxExp: this.userData.jxExp,
                cybLvl: this.userData.cybLvl,
                cybExp: this.userData.cybExp,
                medalExData: this.userData.medalExData,
                medalDoneData: this.userData.medalDoneData,
                exData: this.userData.exData
            };
            userDao.update(client, updateUserData, { id: this.userData.id }, function(err, data) {});
            console.log("user:", this.userData.id, " save achieve to DB");
            this.udAchieveDirty = false;
            this.udMedalDirty = false;
        }

        if (this.udMedalDirty) {
            var updateUserData = {
                medalExData: this.userData.medalExData,
                medalDoneData: this.userData.medalDoneData
            };
            userDao.update(client, updateUserData, { id: this.userData.id }, function(err, data) {});
            //console.log("user:", this.userData.id, " save medal to DB");
            this.udMedalDirty = false;
        }

        this._saveTask(client);
        this._saveHero(client);
        this._saveGameRecord(client);
        this.saveDBTime = new Date().getTime();
    }
    _saveTask(client) {
        if (this.taskDataDirty) {
            taskDao.update(client, this.taskData, { userId: this.userData.id }, function(err, data) {});
            this.taskDataDirty = false;
            console.log("user:", this.userData.id, " save taskData to DB");
        }
    }
    _saveHero(client) {
        if (this.heroIdsDirty.length > 0) {

            console.log("user:", this.userData.id, " save heroData to DB");
            // 遍历更新
            this.heroIdsDirty.forEach((heroId) => {
                var hero = this.getHero(heroId);
                console.log("user:", this.userData.id, " save hero ", heroId, " to DB");
                heroDao.update(client, hero, { id: hero.id }, function(err, data) {});
            });
            this.heroIdsDirty = [];
        }
    }
    _saveGameRecord(client) {
        gameRecordDao = gameRecordDao || require("uw-game-record").gameRecordDao;
        if (this.todayGameRecordDirty && this.todayGameRecord) {
            gameRecordDao.update(client, this.todayGameRecord, { id: this.todayGameRecord.id }, function(err, data) {});
            this.todayGameRecordDirty = false;
            console.log("user:", this.userData.id, " save todayGameRecord to DB");
        }
    }
    off2DB(client, cb) {
        if (!this.initOk) { // 未初始化成功
            console.error("check user to save , not initOk:", this.userData.id);
            return;
        }
        // 过滤掉机器人
        if (this.userData.robotId > 0 || this.userData.accountId == 0) {
            console.log("it is robot , ignore it ", this.userData.id);
            return;
        }
        this.setUserDataDirty();
        this.setTaskDataDirty();
        this.setTodayGameRecordDirty();
        this.setAllHeroDataDirty();
        this.save(client);
        this.setRemove();
        console.log("check user to save:", this.userData.id);
        //if (this.userDataDirty) {
           // this.clearUserDataDirty(exports.UDDirtyType.all);
            //console.error("user:", this.userData.id, " offline save userData to DB");
            // userDao.update(client, this.userData, { id: this.userData.id }, () => {
            //     this.setRemove();
            //     cb && cb(this);
            // });
       // }
    }
}

var __gamePlayerList = {};
var __accountList = {};         // key : accountId, value:userId
var __activityCache = {}; //活动缓存

exports.CacheType = {
    all: 9999,
    userData: 0,
    taskData: 1,
    heroData: 2
};

var checkRequire = function() {
    userDao = userDao || require("uw-user").userDao;
    heroDao = heroDao || require("uw-hero").heroDao;
    heroBiz = heroBiz || require("uw-hero").heroBiz;
    taskDao = taskDao || require("uw-task").taskDao;
    mailBiz = mailBiz || require("uw-mail").mailBiz;
    accountDao = accountDao || require("uw-account").accountDao;
    activityDao = activityDao || require("uw-activity").activityDao;
    publicActivityDao = publicActivityDao || require("uw-activity").publicActivityDao;
    gameRecordBiz = gameRecordBiz || require("uw-game-record").gameRecordBiz;
    gameRecordDao = gameRecordDao || require("uw-game-record").gameRecordDao;

    uwClient = uwClient || require("uw-db").uwClient;
};

exports.GamePlayerList = function() {
    return __gamePlayerList;
};

exports.initGamePlayer = function(userData, accountData, task, heroList) {
    var userId = userData.id;
    if (__gamePlayerList[userId])
        delete __gamePlayerList[userId];

    var gamePlayer = new GamePlayer();
    gamePlayer.userData = userData;
    gamePlayer.taskData = task;
    gamePlayer.heroListData = heroList;

    gamePlayer.accountData = accountData;
    gamePlayer.initDone();
    __gamePlayerList[userId] = gamePlayer;
    __accountList[accountData.id] = userId;
    //console.log("initGamePlayer: accountData ", accountData);
    return gamePlayer;
};

exports.getGamePlayer = function(client, userId, cb) {
    checkRequire();
    if (__gamePlayerList[userId]) {
        // console.log("getGamePlayer from Cache:", userId);
        __gamePlayerList[userId].reuse();
        return cb(null, __gamePlayerList[userId]);
    }

    // console.log("getGamePlayer from DB:", userId);
    // console.trace("TRACE GET FROMDB");
    async.parallel([
        function(cb1) {
            userDao.select(uwClient, { id: userId }, cb1);
        },
        function(cb1) {
            taskDao.select(uwClient, { userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);

        async.parallel([
            function(cb2) {
                //accountDao.selectCols(loginClient,"name,channelId,sdkChannelId",{id:data[0].accountId}, cb1);
                accountDao.select(loginClient, { id: data[0].accountId }, cb2);
            },
            function(cb2) {
                heroBiz.calAndGetHeroList(uwClient, data[0], cb2);
            }

        ], function(err2, data2) {
            if (err2) return cb(err2);

            var gamePlayer = new GamePlayer();
            gamePlayer.userData = data[0];
            gamePlayer.taskData = data[1];
            gamePlayer.heroListData = data2[1];
            gamePlayer.accountData = data2[0]; 

            //console.log("getGamePlayer: accountData ", gamePlayer.accountData);
            __gamePlayerList[userId] = gamePlayer;
            __accountList[gamePlayer.userData.accountId]  = userId;
            gamePlayer.initDone();
            return cb(null, __gamePlayerList[userId]);
        });
    });
};

exports.getGamePlayerInCache = function(userId) {
    return __gamePlayerList[userId];
};

exports.getGamePlayerInCacheByAccountId = function(accountId){
    let userId = __accountList[accountId];
    if(userId){
        return exports.getGamePlayerInCache(userId);
    }
};

//  先取内存里的UserData, 没有就查数据库， 不保存 (返回[GamePlayer, 是否在内存中])
exports.getGamePlayer_UserData = function(uwClient, userId, cb) {
    checkRequire();

    if (__gamePlayerList[userId])
        return cb(null, [__gamePlayerList[userId], 1]);
    userDao.select(uwClient, { id: userId }, function(err, userData) {
        if (err) return cb(err);
        var gamePlayer = {
            userData: userData
        };
        return cb(null, [gamePlayer, 0]);
    });
};

//  先取内存里的HeroListData, 没有就查数据库， 不保存 (返回[GamePlayer, 是否在内存中])
exports.getGamePlayer_HeroListData = function(uwClient, userId, cb) {
    checkRequire();

    if (__gamePlayerList[userId])
        return cb(null, [__gamePlayerList[userId], 1]);

    heroBiz.calAndGetHeroList(uwClient, userId, function(err, heroListData) {
        if (err) return cb(err);
        var gamePlayer = {
            heroListData: heroListData
        };
        return cb(null, [gamePlayer, 0]);
    });
};


exports.removeGamePlayer = function(userId) {
    //console.error("removeGamePlayer:", userId);
    let p = __gamePlayerList[userId];
    delete __accountList[p.getAccountId()];
    p = null;
    delete __gamePlayerList[userId];
};

exports.activePlayer = function(userId) {
    if (__gamePlayerList[userId]) {
        __gamePlayerList[userId].active();
    }
};

exports.checkPlayers = function(client) {
    var playerIds = Object.keys(__gamePlayerList);
    var nowTime = new Date().getTime();
    playerIds.forEach(function(userId) {
        var gamePlayer = __gamePlayerList[userId];

        if (gamePlayer.beRemoveing) {
            if (nowTime - gamePlayer.removeTime > REMOVEUSER_INTERVAL) {
                //console.error("removeGamePlayer:", gamePlayer.getUserId());
                exports.removeGamePlayer(userId);
            }

        } else {
            gamePlayer.check(nowTime);
            if (nowTime - gamePlayer.saveDBTime > SAVEDB_INTERVAL) {
                // console.error("check SAVEDB ...");
                gamePlayer.save(client);
            }
            if (nowTime - gamePlayer.lastTime > HEARTBEAT_INTERVAL) {
                //console.error("check Lost ...");

                gamePlayer.off2DB(client, function(p) {
                    // 设置为删除状态
                    // p.setRemove();
                    // 这里需要确保入库完毕
                });
            }
        }

    });
};

exports.savePlayersToDB = function() {
    // console.log("savePlayersToDB......");
    checkRequire();
    var playerIds = Object.keys(__gamePlayerList);
    var nowTime = new Date().getTime();
    playerIds.forEach(function(userId) {
        var gamePlayer = __gamePlayerList[userId];
        gamePlayer.save(uwClient);
        exports.removeGamePlayer(userId);
    });
};

// 变化的bag, equipBag
exports.userDirtyFlag = function(bagItems, equipBagItems) {
    var f1, f2;
    if (bagItems && Object.keys(bagItems).length > 0) {
        f1 = exports.UDDirtyType.bag;
    }
    if (equipBagItems && Object.keys(equipBagItems).length > 0) {
        f2 = exports.UDDirtyType.equipBag;
    }

    if (f1 == exports.UDDirtyType.bag && f2 == exports.UDDirtyType.equipBag) {
        return exports.UDDirtyType.all;
    } else if (f1 == exports.UDDirtyType.bag) {
        return exports.UDDirtyType.bag;
    } else if (f2 == exports.UDDirtyType.equipBag) {
        return exports.UDDirtyType.equipBag;
    } else {
        return exports.UDDirtyType.noTwoBag;
    }
};


//=============================================================== 活动数据缓存===============================================================
//根据活动类型获取 单个活动数据(必须在活动时间内)
exports.getActivityDataByType_InTime = function(type) {
    for (var aid in __activityCache) {
        var curAct = __activityCache[aid];
        if (curAct.type == type && __isInActivityTime(curAct)) {
            return curAct;
        }
    }
    return null;
};

//根据活动类型获取 单个活动数据(不管是否在活动时间内)
exports.getActivityDataByType = function(type) {
    for (var aid in __activityCache) {
        var curAct = __activityCache[aid];
        if (curAct.type == type) return curAct;
    }
    return null;
};

//根据活动Id获取  活动数据(不管是否在活动时间内)
exports.getActivityDataById = function(id) {
    if(__activityCache[id])return __activityCache[id];
    return null;
};

//获取同类型活动列表(不管是否在活动时间内)
exports.getActivityListByType = function(type) {
    var tempArr = [];
    for (var aid in __activityCache) {
        var curAct = __activityCache[aid];
        if (curAct.type == type) {
            tempArr.push(curAct);
        }
    }
    return tempArr;
};

//获取同类型活动列表(必须在活动时间内)
exports.getActivityListByType_InTime = function(type) {
    var tempArr = [];
    for (var aid in __activityCache) {
        var curAct = __activityCache[aid];
        if (curAct.type == type && __isInActivityTime(curAct)) {
            tempArr.push(curAct);
        }
    }
    return tempArr;
};

var __isInActivityTime = function(activityData) {
    if (!activityData) return false;
    var now = new Date();

    if (activityData.isOpen && (!activityData.startTime || now.between(new Date(activityData.startTime), new Date(activityData.endTime)))) {
        // if (activityData.type == c_prop.activityTypeKey.killDragon) { //屠龙远征特殊判断只在星期5 6 0  开启
        //     var weekDay = now.getDay();
        //     if (weekDay != 5 && weekDay != 6 && weekDay != 0) return false;
        // }
        return true;
    }
    return false;
}

//1,2,4,5-10,11  ===> [1,2,4,5,6,7,8,9,10,11]
var __section2Arr = function(ruleStr) {
    var returnArr = [];
    if (!ruleStr) return returnArr;
    var tempArr = ruleStr.split(',');
    tempArr.forEach(function(item) {
        var arr = item.split('-');
        if (arr.length == 1) {
            var num = parseInt(arr[0]);
            if(!isNaN(num)){
                returnArr.push(num);
            }
        } else if (arr.length == 2) {
            var min = parseInt(arr[0]);
            var max = parseInt(arr[1]);
            if (!isNaN(min) && !isNaN(min)) {
                for (var i = min; i <= max; i++){
                    returnArr.push(i);
                }
            }
        }
    });
    return returnArr;
}
// var arr = __section2Arr('1,2,4,5-10,11');

//活动表缓存
exports.setActivityDataToCache = function(client) {
    checkRequire();
    // var strWhere = " isOpen = 1 and ( startTime is null or (startTime <? and endTime>?)) order by sort desc";
    var strWhere = " 1=1 ORDER BY sort DESC,startTime DESC";
    var now = new Date();
    // var args = [now, now];
    var args = [];
    __activityCache = {};
    activityDao.list(client, strWhere, args, function(err, activityList) {
        activityList = activityList || [];
        for (var i = 0; i < activityList.length; i++) {
            var activityData = activityList[i];
            __activityCache[activityData.id] = activityData;
        }
    });
    var openServerDate = g_server.getOpenServerDate();
    var limitDay = g_server.getAfterNumDaysNextWeekDay(14, 1);
    //过了开服14天后的下一个周1 才会有自定义通用活动
    if (now.isAfter(limitDay)) {
        // console.error("本服已过开服14天的下一个周1  getOpenServerDate===>",g_server.getOpenServerDate(),"limitDay===>",limitDay,"now===>",now);
        var serverId = projectConfig.serverId;
        serverId = parseInt(serverId);
        //ID分段 100000开始
        publicActivityDao.list(mainClient, strWhere, args, function(err, activityList) {
            activityList = activityList || [];
            // console.error('activityList=======>',activityList);
            for (var i = 0; i < activityList.length; i++) {
                var activityData = activityList[i];
                //有指定服限制
                if (activityData.serverArr) {
                    var serverArr = __section2Arr(activityData.serverArr);
                    // console.error('serverArr=======>',serverArr,serverId,activityData.id);
                    if (!serverArr.includes(serverId)) continue;
                }
                //是否支持任意时间生效 （转为老服的时间处于某活动时间区间内时  此活动是否生效的逻辑）
                if(!activityData.isAnyTimeValid && activityData.startTime){
                    var actStartTime = new Date(activityData.startTime);
                    if(limitDay.isAfter(actStartTime))continue;//变老服时此活动已经进行到一半 且此活动不支持任意时间生效 则不读取
                }
                if (!__activityCache[activityData.id]) {
                    __activityCache[activityData.id] = activityData;
                }
            }
        });
    }

};

//根据活动类型获取所有 活动列表(不管是否在活动时间内)
exports.getActivityList = function() {
    return __activityCache;
};

//根据活动类型获取所有 活动列表(必须在活动时间内)
exports.getActivityList_InTime = function() {
    var tempArr = [];
    for (var aid in __activityCache) {
        var curAct = __activityCache[aid];
        if (__isInActivityTime(curAct)) {
            tempArr.push(curAct);
        }
    }
    return tempArr;
};