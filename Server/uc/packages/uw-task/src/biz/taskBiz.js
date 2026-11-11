/**
 * Created by Administrator on 2014/5/16.
 */
var uwData = require("uw-data");
var c_game = uwData.c_game;
var c_task = uwData.c_task;
var c_prop = uwData.c_prop;
var c_reward = uwData.c_reward;
var c_lottery = uwData.c_lottery;
var t_itemLogic = uwData.t_itemLogic;
var consts = uwData.consts;
var c_msgCode = uwData.c_msgCode;
var t_achieve = uwData.t_achieve;
var c_entrust = uwData.c_entrust;
var t_heroGift = uwData.t_heroGift;
var async = require("async");
var g_data = require("uw-global").g_data;
var getMsg = require("uw-utils").msgFunc(__filename);
var TaskEntity = require('uw-entity').TaskEntity;
var taskSerial = require('uw-serial').taskSerial;
var utils = require('uw-utils').utils;
var biHlBiz = require("uw-log").biHlBiz;
var biHlObj = require("uw-log").biHlObj;
var ossObj = require("uw-log").ossObj;
var ossBiz = require("uw-log").ossBiz;
var g_cache = require("uw-global").g_cache;
var dsNameConsts = uwData.dsNameConsts;
var g_guild = require("uw-global").g_guild;
var g_server = require("uw-global").g_server;

var userDao = null;
var userUtils = null;
var propUtils = null;
var taskDao = null;
var heroDao = null;
var itemBiz = null;
var copyBiz = null;
var copyProgressDao = null;
var commonUtils = null;
var guildPersonalDao = null;
var heartStuntDao = null;
var checkRequire = function() {
    userDao = require("uw-user").userDao;
    userUtils = require("uw-user").userUtils;
    propUtils = require("uw-utils").propUtils;
    taskDao = require("uw-task").taskDao;
    heroDao = require("uw-hero").heroDao;
    itemBiz = require("uw-item").itemBiz;
    copyBiz = copyBiz || require("uw-copy").copyBiz;
    copyProgressDao = copyProgressDao || require("uw-copy").copyProgressDao;
    commonUtils = commonUtils || require("uw-utils").commonUtils;
    guildPersonalDao = guildPersonalDao || require("uw-guild").guildPersonalDao;
    heartStuntDao = heartStuntDao || require("uw-heart-stunt").heartStuntDao;
};

var ds = require("uw-ds").ds;

var exports = module.exports;

//初始化数据
exports.getInfo = function(client, userId, cb) {
    checkRequire();
    //_getRecordData(client,userId,function(err,data){
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        _refreshTaskData(gamePlayer.taskData);
        cb(null, gamePlayer.taskData);
    });
};

/**
 * 任务奖励领取
 * @param client
 * @param userId
 * @param taskId      任务id
 * @param cb
 */
exports.taskAward = function(client, userId, taskId, cb) {
    checkRequire();
    if (!c_task[taskId]) return cb(getMsg(c_msgCode.noMission)); // 找不到对应任务
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        _refreshTaskData(gamePlayer.taskData);
        var userData = gamePlayer.userData,
            taskData = gamePlayer.taskData;
        var returnItems = {};
        var nowTime = new Date();
        var taskCfg = c_task[taskId];
        var needValue = taskCfg.targetValue;
        var taskType = taskCfg.taskType;
        var dailyTasksStar = c_game.dailyTasksCfg[0];
        var dailyTasksEnd = c_game.dailyTasksCfg[1];
        var rewardActivity = 0;
        var rewardId = taskCfg.rewardId;
        var cTaskType = taskCfg.cTaskType;
        switch (taskType) {
            case c_prop.taskTypeKey.entrust: //紧急委托
                if (!taskData.entrustTasks) return cb(getMsg(c_msgCode.conditionMiss)); //未达成完成条件
                var entrustId = taskData.entrustTasks.length - 1;
                var entrustCfg = c_entrust[entrustId]; //配置
                //if (entrustCfg.taskIds.indexOf(taskId) == -1) return cb(getMsg(c_msgCode.conditionMiss)); //未达成完成条件
                var curEntrust = taskData.entrustTasks[taskData.entrustTasks.length - 1]; //当前的委托
                var curTasks = curEntrust.tasks || [];

                var canReceive = false;
                for (var i = 0, len = curTasks.length; i < len; i++) {
                    var childTaskData = curTasks[i];
                    if (!childTaskData[2]) { //取到第一个未完成的任务数据
                        // if (childTaskData[2] == 1) return cb(getMsg(c_msgCode.hasReward)); //已领取";
                        if (childTaskData[0] != taskId) return cb(getMsg(c_msgCode.conditionMiss)); //未达成完成条件
                        if (childTaskData[1] < needValue) return cb(getMsg(c_msgCode.conditionMiss)); //未达成完成条件
                        canReceive = true;
                        childTaskData[2] = 1;
                        break;
                    }
                }
                if (!canReceive) return cb(getMsg(c_msgCode.noMessionToGet)); //没有可领取的任务
                break;
            case c_prop.taskTypeKey.daily:
                if (!taskData.refreshTime) return cb(getMsg(c_msgCode.conditionMiss)); //未达成完成条件
                if (!taskData.refreshTime.equalsDay(nowTime)) return cb(getMsg(c_msgCode.conditionMiss)); //未达成完成条件
                var dailyTasks = taskData.dailyTasks;
                if (dailyTasks[taskId][0] < needValue) return cb(getMsg(c_msgCode.conditionMiss)); //未达成完成条件
                if (dailyTasks[taskId][1] == 1) return cb(getMsg(c_msgCode.hasReward)); //已领取");
                taskData.dailyTasks[taskId][1] = 1;
                //taskData.vitality += c_reward[rewardId].activity;
                taskData.refreshTime = nowTime;
                rewardActivity = c_reward[rewardId].activity;
                break;
            case c_prop.taskTypeKey.week:
                if (!taskData.weekRefreshTime) return cb(getMsg(c_msgCode.conditionMiss)); //未达成完成条件
                if (taskData.weekRefreshTime.getWeekNumber() != nowTime.getWeekNumber()) return cb(getMsg(c_msgCode.conditionMiss)); //未达成完成条件
                var weekTasks = taskData.weekTasks;
                if (taskId == 5000007 && weekTasks[taskId][0] != weekTasks[taskId][2]) return cb(getMsg(c_msgCode.conditionMiss)); //未达成完成条件
                if (weekTasks[taskId][0] < weekTasks[taskId][2]) return cb(getMsg(c_msgCode.conditionMiss)); //未达成完成条件
                if (weekTasks[taskId][1] == 1) return cb(getMsg(c_msgCode.hasReward)); //已领取");
                taskData.weekTasks[taskId][1] = 1;
                //taskData.vitality += c_reward[rewardId].activity;
                taskData.weekRefreshTime = nowTime;
                rewardActivity = c_reward[rewardId].activity;
                break;
            case c_prop.taskTypeKey.guide:
                var guideDoneTasks = taskData.guideDoneTasks || [];
                if (guideDoneTasks.indexOf(parseInt(taskId)) != -1) return cb(null, [null, null, null, null, null, null, 0, 0]); //return cb(getMsg(c_msgCode.hasReward));//已领取");
                guideDoneTasks.push(parseInt(taskId));
                taskData.guideDoneTasks = guideDoneTasks;
                break;
            default:
                var tasksValue = taskData.tasksValue;
                if (tasksValue[cTaskType] < needValue) return cb(getMsg(c_msgCode.conditionMiss)); //未达成完成条件
                var doneTasks = taskData.doneTasks || [];
                if (doneTasks.indexOf(taskId) != -1) return cb(getMsg(c_msgCode.hasReward)); //已领取");
                doneTasks.push(taskId);
                taskData.doneTasks = doneTasks;
                var nextTaskId = taskId + 1;
                if (c_task[nextTaskId]) taskData.tasks[cTaskType] = nextTaskId;
        }
        // if (taskId >= dailyTasksStar && taskId <= dailyTasksEnd) { //每日 {"任务id":[完成数量,是否领取],"任务id":[完成数量,是否领取],.....}
        //     if (!taskData.refreshTime) return cb(getMsg(c_msgCode.conditionMiss)); //未达成完成条件
        //     if (!taskData.refreshTime.equalsDay(nowTime)) return cb(getMsg(c_msgCode.conditionMiss)); //未达成完成条件
        //     var dailyTasks = taskData.dailyTasks;
        //     if (dailyTasks[taskId][0] < needValue) return cb(getMsg(c_msgCode.conditionMiss)); //未达成完成条件
        //     if (dailyTasks[taskId][1] == 1) return cb(getMsg(c_msgCode.hasReward)); //已领取");
        //     taskData.dailyTasks[taskId][1] = 1;
        //     //taskData.vitality += c_reward[rewardId].activity;
        //     taskData.refreshTime = nowTime;
        //     rewardActivity = c_reward[rewardId].activity;
        // } else if (taskId >= c_game.weekTasksCfg[3] && taskId <= c_game.weekTasksCfg[4]) {
        //     if (!taskData.weekRefreshTime) return cb(getMsg(c_msgCode.conditionMiss)); //未达成完成条件
        //     if (taskData.weekRefreshTime.getWeekNumber() != nowTime.getWeekNumber()) return cb(getMsg(c_msgCode.conditionMiss)); //未达成完成条件
        //     var weekTasks = taskData.weekTasks;
        //     if (taskId == 5000007 && weekTasks[taskId][0] != weekTasks[taskId][2]) return cb(getMsg(c_msgCode.conditionMiss)); //未达成完成条件
        //     if (weekTasks[taskId][0] < weekTasks[taskId][2]) return cb(getMsg(c_msgCode.conditionMiss)); //未达成完成条件
        //     if (weekTasks[taskId][1] == 1) return cb(getMsg(c_msgCode.hasReward)); //已领取");
        //     taskData.weekTasks[taskId][1] = 1;
        //     //taskData.vitality += c_reward[rewardId].activity;
        //     taskData.weekRefreshTime = nowTime;
        //     rewardActivity = c_reward[rewardId].activity;
        // } else if (taskId >= c_game.guideTasksCfg[0] && taskId <= c_game.guideTasksCfg[1]) {
        //     var guideDoneTasks = taskData.guideDoneTasks || [];
        //     if (guideDoneTasks.indexOf(parseInt(taskId)) != -1) return cb(null, [null, null, null, null, null, null, 0, 0]); //return cb(getMsg(c_msgCode.hasReward));//已领取");
        //     guideDoneTasks.push(parseInt(taskId));
        //     taskData.guideDoneTasks = guideDoneTasks;
        // } else { //成就任务  {"子类型":数量,"子类型":数量,...}
        //     var cTaskType = taskCfg.cTaskType;
        //     var tasksValue = taskData.tasksValue;
        //     if (tasksValue[cTaskType] < needValue) return cb(getMsg(c_msgCode.conditionMiss)); //未达成完成条件
        //     var doneTasks = taskData.doneTasks || [];
        //     if (doneTasks.indexOf(taskId) != -1) return cb(getMsg(c_msgCode.hasReward)); //已领取");
        //     doneTasks.push(taskId);
        //     taskData.doneTasks = doneTasks;
        //     var nextTaskId = taskId + 1;
        //     if (c_task[nextTaskId]) taskData.tasks[cTaskType] = nextTaskId;
        // }

        // 周活跃度
        var wVitalityRefreshTime = taskData.wVitalityRefreshTime;
        if (!wVitalityRefreshTime || wVitalityRefreshTime.getWeekNumber() != (new Date()).getWeekNumber()) {
            taskData.wVitality = 0;
            taskData.wVitalityChests = [0, 0];
            taskData.wVitalityRefreshTime = new Date();
        }

        //领取奖励
        // 金币
        var gold = c_reward[rewardId].gold;
        if (gold > 0) {
            userUtils.addCurrency(userData, c_prop.currencyTypeKey.gold, gold, c_prop.itemGetTypeKey.task);
            returnItems[c_prop.spItemIdKey.gold] = gold;
        }
        //钻石
        var diamond = c_reward[rewardId].diamond;
        if (diamond > 0) {
            userUtils.addCurrency(userData, c_prop.currencyTypeKey.diamond, diamond, c_prop.itemGetTypeKey.task);
            returnItems[c_prop.spItemIdKey.diamond] = diamond;
        }
        // 加声望
        var prestige = c_reward[rewardId].prestige;
        if (prestige > 0) {
            userData.prestige += prestige;
            returnItems[c_prop.spItemIdKey.prestige] = prestige;
        }
        //物品
        var itemsArr = [];
        var bagItems = {};
        var equipBagItems = {};
        var items = c_reward[rewardId].rewardItems;
        var achieveExp = 0;
        if (JSON.stringify(items) != "{}") {
            itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.task);
            if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
            if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);
            returnItems = propUtils.mergerProp(returnItems, items);
            achieveExp = itemsArr[9];
            //计算成就星级
            if (achieveExp > 0) {
                curAchieveLvl = userData.achieveLvl || 0;

                var achieveDuan = t_achieve[curAchieveLvl].achieveLvl;
                var achieveStar = t_achieve[curAchieveLvl].star;
                var t_achieveKeysArr = Object.keys(t_achieve);

                for (var i = curAchieveLvl; i < t_achieveKeysArr.length; i++) {
                    var curCfg = t_achieve[t_achieveKeysArr[i]];
                    if (curCfg.achieveLvl > achieveDuan) break;
                    if (curCfg.exp == 0) break;
                    if (userData.achieveExp >= curCfg.exp) {
                        // console.log('userData.achieveExp',userData.achieveExp);
                        userData.achieveExp -= curCfg.exp;
                        userData.achieveLvl++;
                    }
                }

            }
            //计算成就星级 end
            rewardActivity += itemsArr[11];
        }

        if (rewardActivity > 0) {
            userData.cybExp += rewardActivity;
            taskData.vitality += rewardActivity;
            taskData.wVitality += rewardActivity;
        }

        //更新    gold,diamond,buyDiamond,giveDiamond,bag,equipBag,prestige
        var upUserData = {
            lvl: userData.lvl,
            magicLvl: userData.magicLvl,
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            genuineQi: userData.genuineQi,
            prestige: userData.prestige,
            achieveExp: userData.achieveExp,
            achieveLvl: userData.achieveLvl,
            cybExp: userData.cybExp,
            heroData: userData.heroData
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));
        var upTaskData = {
            tasks: taskData.tasks,
            vitality: taskData.vitality,
            wVitality: taskData.wVitality,
            refreshTime: taskData.refreshTime,
            dailyTasks: taskData.dailyTasks,
            tasksValue: taskData.tasksValue,
            doneTasks: taskData.doneTasks,
            weekTasks: taskData.weekTasks,
            guideDoneTasks: taskData.guideDoneTasks,
            wVitality: taskData.wVitality,
            wVitalityChests: taskData.wVitalityChests,
            wVitalityRefreshTime: taskData.wVitalityRefreshTime,
            entrustTasks: taskData.entrustTasks
        };
        gamePlayer.setTaskDataDirty();

        //BI
        var taskTypeCfg = ['daily', 'achieve', 'week', 'guide'];
        //var taskTypeCfg = ['每日任务','成就任务','佣兵周任务','引导任务'];
        var biObj = new biHlObj.counterMissionObj(userData.accountId, userId, userData.lvl, taskTypeCfg[taskCfg.taskType], taskCfg.id, taskCfg.name);
        biHlBiz.HlCounterBi(biObj, userData.serverIndexId, userId, gamePlayer.accountData, userData.exData[c_prop.userExDataKey.loginIP], function(err, data) {});

        var channelId = gamePlayer.getChannelId();
        var sdkChannelId = gamePlayer.getSdkChannelId();
        // var oObj = new ossObj.ossTask(userId, userData.nickName, userData.lvl, taskTypeCfg[taskCfg.taskType], taskCfg.cTaskType, taskId, taskCfg.name, channelId, sdkChannelId);
        // ossBiz.WriteOss(oObj);

        //dadian领奖
        var activityId = 0;
        if (taskCfg.taskType == c_prop.taskTypeKey.week) {
            activityId = 45;
            oObj = new ossObj.ossReward(userId, userData.lvl, activityId, taskId, JSON.stringify(c_reward[rewardId].rewardItems), channelId, sdkChannelId);
            ossBiz.WriteOss(oObj);
        } else if (taskCfg.taskType == c_prop.taskTypeKey.daily) {
            //记录领取每日任务次数（紧急委托任务）
            exports.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.receiveDailyTask, 1, function() {});
        }


        cb(null, [upUserData, upTaskData, returnItems, rewardActivity, bagItems, equipBagItems, diamond, achieveExp]);
    });
}
//递归找出可领取的成就任务ID
var _getCanReceiveTasks = function(taskId, taskData, curDuan, canReceiveTasks) {
    // console.log('taskId---------------------------------------------------------------',taskId);
    if (!c_task[taskId]) return canReceiveTasks;
    var showLvl = c_task[taskId].showLvl;
    if (showLvl > curDuan) return canReceiveTasks; //非当前段位的任务不领取

    var needValue = c_task[taskId].targetValue;
    var rewardId = c_task[taskId].rewardId;

    var cTaskType = c_task[taskId].cTaskType;
    var tasksValue = taskData.tasksValue;
    if (tasksValue[cTaskType] < needValue) {
        taskData.tasks[cTaskType] = taskId;
        return canReceiveTasks;
    }
    var doneTasks = taskData.doneTasks || [];
    if (doneTasks.indexOf(taskId) != -1) return canReceiveTasks;
    doneTasks.push(taskId);
    taskData.doneTasks = doneTasks;

    canReceiveTasks.push(taskId);
    var nextTaskId = taskId + 1;
    _getCanReceiveTasks(nextTaskId, taskData, curDuan, canReceiveTasks);
}
/**
 * 成就任务一键领取
 * @param client
 * @param userId
 * @param taskId      任务id
 * @param cb
 */
exports.achieveTaskAwardAll = function(client, userId, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        _refreshTaskData(gamePlayer.taskData);
        var userData = gamePlayer.userData,
            taskData = gamePlayer.taskData;
        var rewardActivity = 0;
        var curTasks = taskData.tasks;
        var canReceiveTasks = [];
        var curDuan = t_achieve[userData.achieveLvl].achieveLvl;
        for (var key in curTasks) {
            var taskId = curTasks[key];
            _getCanReceiveTasks(taskId, taskData, curDuan, canReceiveTasks);
            // console.log('canReceiveTasks---------------------------------------------------------------',canReceiveTasks);
        }
        if (canReceiveTasks.length == 0) return cb(getMsg(c_msgCode.noMessionToGet)); //没有可领取的任务
        var returnItems = {};
        canReceiveTasks.forEach(function(taskId) {
            var rewardId = c_task[taskId].rewardId;
            var items = c_reward[rewardId].rewardItems || {}; // 不能修改

            var gold = c_reward[rewardId].gold;
            if (gold > 0) {
                if (!returnItems[c_prop.spItemIdKey.gold]) {
                    returnItems[c_prop.spItemIdKey.gold] = gold;
                } else {
                    returnItems[c_prop.spItemIdKey.gold] += gold;
                }
            }
            //钻石
            var diamond = c_reward[rewardId].diamond;
            if (diamond > 0) {
                if (!returnItems[c_prop.spItemIdKey.diamond]) {
                    returnItems[c_prop.spItemIdKey.diamond] = diamond;
                } else {
                    returnItems[c_prop.spItemIdKey.diamond] += diamond;
                }
            }
            // 加声望
            var prestige = c_reward[rewardId].prestige;
            if (prestige > 0) {
                if (!returnItems[c_prop.spItemIdKey.prestige]) {
                    returnItems[c_prop.spItemIdKey.prestige] = prestige;
                } else {
                    returnItems[c_prop.spItemIdKey.prestige] += prestige;
                }
            }

            returnItems = propUtils.mergerProp(returnItems, items);
        });

        var getDiamond = returnItems[c_prop.spItemIdKey.diamond];

        //物品
        var itemsArr = [];
        var bagItems = {};
        var equipBagItems = {};

        var achieveExp = 0;
        if (JSON.stringify(returnItems) != "{}") {
            itemsArr = userUtils.saveItems(userData, returnItems, c_prop.itemGetTypeKey.task);
            if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
            if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);

            achieveExp = itemsArr[9];
            //计算成就星级
            if (achieveExp > 0) {
                curAchieveLvl = userData.achieveLvl || 0;

                var achieveDuan = t_achieve[curAchieveLvl].achieveLvl;
                var achieveStar = t_achieve[curAchieveLvl].star;
                var t_achieveKeysArr = Object.keys(t_achieve);

                for (var i = curAchieveLvl; i < t_achieveKeysArr.length; i++) {
                    var curCfg = t_achieve[t_achieveKeysArr[i]];
                    if (curCfg.achieveLvl > achieveDuan) break;
                    if (curCfg.exp == 0) break;
                    if (userData.achieveExp >= curCfg.exp) {
                        // console.log('userData.achieveExp',userData.achieveExp);
                        userData.achieveExp -= curCfg.exp;
                        userData.achieveLvl++;
                    }
                }

            }
            //计算成就星级 end
            rewardActivity += itemsArr[11];
        }
        if (rewardActivity > 0) {
            userData.cybExp += rewardActivity;
            taskData.vitality += rewardActivity;
            taskData.wVitality += rewardActivity;
        }
        //更新    gold,diamond,buyDiamond,giveDiamond,bag,equipBag,prestige
        var upUserData = {
            lvl: userData.lvl,
            magicLvl: userData.magicLvl,
            gold: userData.gold,
            diamond: userData.diamond,
            genuineQi: userData.genuineQi,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            prestige: userData.prestige,
            achieveExp: userData.achieveExp,
            achieveLvl: userData.achieveLvl,
            cybExp: userData.cybExp
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));
        var upTaskData = {
            tasks: taskData.tasks,
            vitality: taskData.vitality,
            wVitality: taskData.wVitality,
            refreshTime: taskData.refreshTime,
            dailyTasks: taskData.dailyTasks,
            tasksValue: taskData.tasksValue,
            doneTasks: taskData.doneTasks,
            weekTasks: taskData.weekTasks,
            guideDoneTasks: taskData.guideDoneTasks,
            wVitality: taskData.wVitality,
            wVitalityChests: taskData.wVitalityChests,
            wVitalityRefreshTime: taskData.wVitalityRefreshTime
        };
        gamePlayer.setTaskDataDirty();
        canReceiveTasks.forEach(function(taskId) {
            //BI
            var taskCfg = c_task[taskId];
            var taskTypeCfg = ['daily', 'achieve', 'week', 'guide'];
            //var taskTypeCfg = ['每日任务','成就任务','佣兵周任务','引导任务'];
            var biObj = new biHlObj.counterMissionObj(userData.accountId, userId, userData.lvl, taskTypeCfg[taskCfg.taskType], taskCfg.id, taskCfg.name);
            biHlBiz.HlCounterBi(biObj, userData.serverIndexId, userId, gamePlayer.accountData, userData.exData[c_prop.userExDataKey.loginIP], function(err, data) {});

            // var channelId = gamePlayer.getChannelId();
            // var sdkChannelId = gamePlayer.getSdkChannelId();
            // var oObj = new ossObj.ossTask(userId, userData.nickName, userData.lvl, taskTypeCfg[taskCfg.taskType], taskCfg.cTaskType, taskId, taskCfg.name, channelId, sdkChannelId);
            // ossBiz.WriteOss(oObj);
        })
        cb(null, [upUserData, upTaskData, returnItems, rewardActivity, bagItems, equipBagItems, getDiamond, achieveExp]);
    });
}
/**
 * 领取活跃度宝箱
 * @param client
 * @param userId
 * @param index   宝箱下标
 * @param cb
 */
exports.getVitalityChest = function(client, userId, index, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        _refreshTaskData(gamePlayer.taskData);
        var userData = gamePlayer.userData,
            taskData = gamePlayer.taskData;
        var nowTime = new Date();
        if (!taskData.refreshTime) return cb(getMsg(c_msgCode.dayHydUnenough)); //日活跃度不足
        if (!taskData.refreshTime.equalsDay(nowTime)) return cb(getMsg(c_msgCode.dayHydUnenough)); //日活跃度不足
        var vitality = taskData.vitality; //活跃度
        var needVitality = c_game.vitalityCfg[index]; //需要的活跃度
        if (vitality < needVitality) return cb(getMsg(c_msgCode.dayHydUnenough)); //日活跃度不足
        var vitalityChests = taskData.vitalityChests || [0, 0, 0, 0, 0];
        if (vitalityChests[index] == 1) return cb(getMsg(c_msgCode.hasReward)); //已领取");

        var chestId = c_game.vitalityCfg[index + 5];
        var logicItems = itemBiz.calLogicItems(chestId); //随机的物品
        var getDiamond = 0;
        if (logicItems[c_prop.spItemIdKey.diamond]) {
            getDiamond = logicItems[c_prop.spItemIdKey.diamond];
        }
        //获得物品
        var bagItems = {};
        var equipBagItems = {};
        var itemsArr = userUtils.saveItems(userData, logicItems, c_prop.itemGetTypeKey.vitalityChest);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);
        //数据改变
        taskData.refreshTime = nowTime;
        vitalityChests[index] = 1;
        taskData.vitalityChests = vitalityChests;
        //更新
        var updateData = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            strength: userData.strength,
            strengthReTime: userData.strengthReTime
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));
        var updateTaskData = {
            refreshTime: taskData.refreshTime,
            vitalityChests: taskData.vitalityChests
        };
        gamePlayer.setTaskDataDirty();
        return cb(null, [updateData, updateTaskData, logicItems, bagItems, equipBagItems, getDiamond]);
    });
}

/**
 * 领取周活跃度宝箱
 * @param client
 * @param userId
 * @param index   宝箱下标
 * @param cb
 */
exports.getWeekVitalityChest = function(client, userId, index, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        _refreshTaskData(gamePlayer.taskData);
        var userData = gamePlayer.userData,
            taskData = gamePlayer.taskData;
        var nowTime = new Date();
        if (!taskData.wVitalityRefreshTime) return cb(getMsg(c_msgCode.weekHydUnenough)); //周活跃度不足
        if (taskData.wVitalityRefreshTime.getWeekNumber() != nowTime.getWeekNumber())
            return cb(getMsg(c_msgCode.weekHydUnenough)); //周活跃度不足
        var vitality = taskData.wVitality; //活跃度
        var needVitality = c_game.weekVitalityCfg[index]; //需要的活跃度
        if (vitality < needVitality) return cb(getMsg(c_msgCode.weekHydUnenough)); //周活跃度不足
        var vitalityChests = taskData.wVitalityChests || [0, 0];
        if (vitalityChests[index] == 1) return cb(getMsg(c_msgCode.hasReward)); //已领取");

        var chestId = c_game.weekVitalityCfg[index + 2];
        var logicItems = itemBiz.calLogicItems(chestId); //随机的物品
        var getDiamond = 0;
        if (logicItems[c_prop.spItemIdKey.diamond]) {
            getDiamond = logicItems[c_prop.spItemIdKey.diamond];
        }
        //获得物品
        var bagItems = {};
        var equipBagItems = {};
        var itemsArr = userUtils.saveItems(userData, logicItems, c_prop.itemGetTypeKey.vitalityChest);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);
        //数据改变
        taskData.wVitalityRefreshTime = nowTime;
        vitalityChests[index] = 1;
        taskData.wVitalityChests = vitalityChests;
        //更新
        var updateData = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));
        var updateTaskData = {
            wVitalityRefreshTime: taskData.wVitalityRefreshTime,
            wVitalityChests: taskData.wVitalityChests
        };
        gamePlayer.setTaskDataDirty();
        return cb(null, [updateData, updateTaskData, logicItems, bagItems, equipBagItems, getDiamond]);
    });
}

var dailyKeyMap = {};
dailyKeyMap[1] = 2100001;
dailyKeyMap[71] = 2100002;
dailyKeyMap[6] = 2100003;
dailyKeyMap[14] = 2100004;
dailyKeyMap[20] = 2100005;
//dailyKeyMap[9] = 2100006;
dailyKeyMap[12] = 2100007;
dailyKeyMap[13] = 2100008;
dailyKeyMap[11] = 2100009;
dailyKeyMap[15] = 2100010;
dailyKeyMap[16] = 2100011;
dailyKeyMap[17] = 2100012;
// dailyKeyMap[21] = 2100013;
// dailyKeyMap[22] = 2100014;
// dailyKeyMap[23] = 2100015;
dailyKeyMap[30] = 2100013;
dailyKeyMap[31] = 2100014;
dailyKeyMap[32] = 2100015;


dailyKeyMap[73] = 2100016;
dailyKeyMap[22] = 2100017;
dailyKeyMap[23] = 2100018;

dailyKeyMap[67] = 2100019;
dailyKeyMap[48] = 2100020;
dailyKeyMap[74] = 2100021;
dailyKeyMap[75] = 2100022;
dailyKeyMap[76] = 2100023;
dailyKeyMap[77] = 2100024;


var weekKeyMap = {}; // 周任务
weekKeyMap[91] = 5000001;
weekKeyMap[92] = 5000002;
weekKeyMap[93] = 5000003;
weekKeyMap[94] = 5000004;
weekKeyMap[95] = 5000005;
weekKeyMap[96] = 5000006;
weekKeyMap[97] = 5000007;
weekKeyMap[98] = 5000008;
weekKeyMap[99] = 5000009;


//成就任务 （0 6 7 11）
// 7  8
//特殊成就任务    任一达到（1  2  3  5  8  10）
//特殊成就任务    通关副本（4  9 12 13）
//每日        （1 2 6 14 20 9 12 13 11 15 16）
//任务完成数据记录接口
exports.setTaskValue = function(client, userId, cTaskType, count, cb) {
    checkRequire();
    // taskSerial.add(userId,function(cb1){
    _setTaskValue(client, userId, cTaskType, count, function(err, data) {
        cb(err, data);
        //cb1(err,data);
    });
    // });
}

var _setTaskValue = function(client, userId, cTaskType, count, cb) {

    //_getRecordData(client,userId,function(err,taskData){
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        _refreshTaskData(gamePlayer.taskData);
        var taskData = gamePlayer.taskData;
        var dailyTasks = taskData.dailyTasks; //日常任务。{"任务id":[完成数量,是否领取],"任务id":[完成数量,是否领取],.....}
        var refreshTime = taskData.refreshTime; //日常数据最后修改时间
        var tasksValue = taskData.tasksValue; //成就任务完成数据  {"子类型":数量,"子类型":数量,...}
        var weekTasks = taskData.weekTasks; //周任务。{"任务id":[完成数量,目标数量,是否领取],"任务id":[完成数量,目标数量,是否领取],.....}
        var weekRefreshTime = taskData.weekRefreshTime;
        //成就任务 （6 7 11）
        if (cTaskType == c_prop.cTaskTypeKey.equipSmelt ||
            cTaskType == c_prop.cTaskTypeKey.clearHero || cTaskType == c_prop.cTaskTypeKey.encounter || cTaskType == c_prop.cTaskTypeKey.rankFighting ||
            cTaskType == c_prop.cTaskTypeKey.petFeedCake || cTaskType == c_prop.cTaskTypeKey.petFeedCandy ||
            cTaskType == c_prop.cTaskTypeKey.openCopperChest || cTaskType == c_prop.cTaskTypeKey.openSilverChest || cTaskType == c_prop.cTaskTypeKey.openGoldChest ||
            cTaskType == c_prop.cTaskTypeKey.costInheritedItem || cTaskType == c_prop.cTaskTypeKey.costMedalItem || cTaskType == c_prop.cTaskTypeKey.labaPet ||
            cTaskType == c_prop.cTaskTypeKey.petSRNum || cTaskType == c_prop.cTaskTypeKey.petSSRNum ||
            cTaskType == c_prop.cTaskTypeKey.medalNum || cTaskType == c_prop.cTaskTypeKey.medalSRNum || cTaskType == c_prop.cTaskTypeKey.medalSSRNum ||
            cTaskType == c_prop.cTaskTypeKey.employerSNum || cTaskType == c_prop.cTaskTypeKey.employerSSNum ||
            cTaskType == c_prop.cTaskTypeKey.buyWeekCard || cTaskType == c_prop.cTaskTypeKey.buyMonthCard || cTaskType == c_prop.cTaskTypeKey.buyDashang || cTaskType == c_prop.cTaskTypeKey.buyTMFund ||
            cTaskType == c_prop.cTaskTypeKey.buyDayShop || cTaskType == c_prop.cTaskTypeKey.buyDiamond || cTaskType == c_prop.cTaskTypeKey.costDScore ||
            cTaskType == c_prop.cTaskTypeKey.firstRecharge || cTaskType == c_prop.cTaskTypeKey.costLotus ||
            cTaskType == c_prop.cTaskTypeKey.letouNum || cTaskType == c_prop.cTaskTypeKey.heroSkinSSRNum ||
            cTaskType == c_prop.cTaskTypeKey.enterZLBossNum || cTaskType == c_prop.cTaskTypeKey.useSYItem ||
            cTaskType == c_prop.cTaskTypeKey.worldBossNum) {
            var value = tasksValue[cTaskType] || 0;
            taskData.tasksValue[cTaskType] = value + count;
        }
        //特殊成就任务    任一角色全身第一颗宝石+ N   （ 8 ）
        if (cTaskType == c_prop.cTaskTypeKey.heroGem || cTaskType == c_prop.cTaskTypeKey.heroStar || cTaskType == c_prop.cTaskTypeKey.jxLvl || cTaskType == c_prop.cTaskTypeKey.cybLvl ||
            cTaskType == c_prop.cTaskTypeKey.nobleLvl) {
            var value = tasksValue[cTaskType] || 0;
            if (count > value) taskData.tasksValue[cTaskType] = count;
        }
        //特殊成就任务    任一达到（0  1  2  3  5  10）
        if (cTaskType == c_prop.cTaskTypeKey.personLvl || cTaskType == c_prop.cTaskTypeKey.skillLvl || cTaskType == c_prop.cTaskTypeKey.equipStrength ||
            cTaskType == c_prop.cTaskTypeKey.equipUpStar || cTaskType == c_prop.cTaskTypeKey.gemUp ||
            cTaskType == c_prop.cTaskTypeKey.paralysisUp || cTaskType == c_prop.cTaskTypeKey.reviveUp || cTaskType == c_prop.cTaskTypeKey.protectUp || cTaskType == c_prop.cTaskTypeKey.harmUp ||
            cTaskType == c_prop.cTaskTypeKey.combat || cTaskType == c_prop.cTaskTypeKey.rebirthLvl || cTaskType == c_prop.cTaskTypeKey.realmLvl ||
            cTaskType == c_prop.cTaskTypeKey.heartLayer || cTaskType == c_prop.cTaskTypeKey.paTa || cTaskType == c_prop.cTaskTypeKey.wing|| cTaskType == c_prop.cTaskTypeKey.heroSkinNum ) {
            var value = tasksValue[cTaskType] || 0;
            if (count > value) taskData.tasksValue[cTaskType] = count;
        }
        //特殊成就任务    通关副本（4 9 12 13）
        if (cTaskType == c_prop.cTaskTypeKey.closeTollGate || cTaskType == c_prop.cTaskTypeKey.equipCopy ||
            cTaskType == c_prop.cTaskTypeKey.hell || cTaskType == c_prop.cTaskTypeKey.state || cTaskType == c_prop.cTaskTypeKey.guild || cTaskType == c_prop.cTaskTypeKey.copyV7 ||
            cTaskType == c_prop.cTaskTypeKey.copyV10 || cTaskType == c_prop.cTaskTypeKey.copyV14 || cTaskType == c_prop.cTaskTypeKey.copyV17 || cTaskType == c_prop.cTaskTypeKey.copyV19 ||
            cTaskType == c_prop.cTaskTypeKey.teamBoss || cTaskType == c_prop.cTaskTypeKey.worldBoss || cTaskType == c_prop.cTaskTypeKey.guildChapter) {
            var value = tasksValue[cTaskType] || 0;
            if (count > value) taskData.tasksValue[cTaskType] = count;
        }

        //每日        （1 71 6 14 20 9 12 13 11 15 16）
        if (cTaskType == c_prop.cTaskTypeKey.skillLvl || cTaskType == c_prop.cTaskTypeKey.equipStrengthNum ||
            cTaskType == c_prop.cTaskTypeKey.equipSmelt || cTaskType == c_prop.cTaskTypeKey.shopBuy ||
            cTaskType == c_prop.cTaskTypeKey.chat || cTaskType == c_prop.cTaskTypeKey.equipCopy ||
            cTaskType == c_prop.cTaskTypeKey.hell || cTaskType == c_prop.cTaskTypeKey.state ||
            cTaskType == c_prop.cTaskTypeKey.encounter || cTaskType == c_prop.cTaskTypeKey.wingTrain ||
            cTaskType == c_prop.cTaskTypeKey.rankFighting || cTaskType == c_prop.cTaskTypeKey.treasure ||
            cTaskType == c_prop.cTaskTypeKey.paTaLottery ||
            cTaskType == c_prop.cTaskTypeKey.heartStunt || cTaskType == c_prop.cTaskTypeKey.loginGame ||
            cTaskType == c_prop.cTaskTypeKey.consumeSum1 || cTaskType == c_prop.cTaskTypeKey.consumeSum2 ||
            cTaskType == c_prop.cTaskTypeKey.lotusGetExp ||
            cTaskType == c_prop.cTaskTypeKey.employNum || cTaskType == c_prop.cTaskTypeKey.teamBossNum || cTaskType == c_prop.cTaskTypeKey.openGoldChest ||
            cTaskType == c_prop.cTaskTypeKey.killZLBossNum || cTaskType == c_prop.cTaskTypeKey.SYCopyNum || cTaskType == c_prop.cTaskTypeKey.passPataNum) { //成就副本数据记录
            if (!dailyKeyMap[cTaskType] || !c_task[dailyKeyMap[cTaskType]]) return cb(null, {});
            var daily = {};
            if (!refreshTime || !refreshTime.equalsDay(new Date())) {
                taskData.vitality = 0;
                taskData.vitalityChests = [0, 0, 0, 0, 0];
                var dailyTasksStar = c_game.dailyTasksCfg[0];
                var dailyTasksEnd = c_game.dailyTasksCfg[1];
                for (var i = dailyTasksStar; i <= dailyTasksEnd; i++) {
                    if (c_task[i]) daily[i] = [0, 0];
                }
            } else {
                daily = dailyTasks;
            }
            var dailyValue = 0;
            if (daily[dailyKeyMap[cTaskType]]) {
                dailyValue = daily[dailyKeyMap[cTaskType]][0];
            }
            var targetValue = c_task[dailyKeyMap[cTaskType]].targetValue;
            //特殊每日判断  减少更新次数
            if (cTaskType == c_prop.cTaskTypeKey.shopBuy || cTaskType == c_prop.cTaskTypeKey.wingTrain // || cTaskType == c_prop.cTaskTypeKey.rankFighting
                ||
                cTaskType == c_prop.cTaskTypeKey.chat || cTaskType == c_prop.cTaskTypeKey.treasure //|| cTaskType == c_prop.cTaskTypeKey.guildCopy
                ||
                cTaskType == c_prop.cTaskTypeKey.paTaLottery || cTaskType == c_prop.cTaskTypeKey.heartStunt || cTaskType == c_prop.cTaskTypeKey.loginGame ||
                cTaskType == c_prop.cTaskTypeKey.consumeSum1 || cTaskType == c_prop.cTaskTypeKey.consumeSum2 ||
                cTaskType == c_prop.cTaskTypeKey.lotusGetExp ||
                cTaskType == c_prop.cTaskTypeKey.employNum || cTaskType == c_prop.cTaskTypeKey.teamBossNum || cTaskType == c_prop.cTaskTypeKey.openGoldChest ||
                cTaskType == c_prop.cTaskTypeKey.killZLBossNum || cTaskType == c_prop.cTaskTypeKey.SYCopyNum || cTaskType == c_prop.cTaskTypeKey.passPataNum) {
                if (dailyValue >= targetValue) return cb(null, {});
            }
            if (cTaskType == c_prop.cTaskTypeKey.equipStrengthNum || cTaskType == c_prop.cTaskTypeKey.equipSmelt || cTaskType == c_prop.cTaskTypeKey.consumeSum1 || cTaskType == c_prop.cTaskTypeKey.consumeSum2 ||
                cTaskType == c_prop.cTaskTypeKey.employNum || cTaskType == c_prop.cTaskTypeKey.teamBossNum || cTaskType == c_prop.cTaskTypeKey.openGoldChest) {
                if (dailyValue < targetValue)
                    dailyValue = dailyValue + count;
            } else {
                if (dailyValue < targetValue)
                    dailyValue = dailyValue + 1;
            }
            if (daily[dailyKeyMap[cTaskType]]) {
                daily[dailyKeyMap[cTaskType]][0] = dailyValue;
            } else {
                daily[dailyKeyMap[cTaskType]] = [dailyValue, 0];
            }

            taskData.dailyTasks = daily;
            taskData.refreshTime = new Date();
        } else if (cTaskType == c_prop.cTaskTypeKey.employ1 || cTaskType == c_prop.cTaskTypeKey.employ2 ||
            cTaskType == c_prop.cTaskTypeKey.employ3 || cTaskType == c_prop.cTaskTypeKey.employ4 ||
            cTaskType == c_prop.cTaskTypeKey.employ5 || cTaskType == c_prop.cTaskTypeKey.employ6 ||
            cTaskType == c_prop.cTaskTypeKey.exploreDegree || cTaskType == c_prop.cTaskTypeKey.exploreFail || cTaskType == c_prop.cTaskTypeKey.employSUpNum) {
            // 周任务
            var weeks = {};
            if (!weekRefreshTime || weekRefreshTime.getWeekNumber() != (new Date()).getWeekNumber()) {
                for (var i = c_game.weekTasksCfg[3]; i <= c_game.weekTasksCfg[4]; i++) {
                    weeks[i] = [0, 0, _initWeekTargetValue(i)];
                }
            } else {
                weeks = weekTasks;
            }
            var weekValue = 0;
            if (weeks[weekKeyMap[cTaskType]]) {
                weekValue = weeks[weekKeyMap[cTaskType]][0];
            }
            if (cTaskType == c_prop.cTaskTypeKey.exploreFail || cTaskType == c_prop.cTaskTypeKey.employSUpNum) {
                weekValue = weekValue + count;
            } else if (cTaskType == c_prop.cTaskTypeKey.exploreDegree) {
                weekValue = count;
            } else {
                weekValue = weekValue + 1;
            }
            if (weeks[weekKeyMap[cTaskType]]) {
                weeks[weekKeyMap[cTaskType]][0] = weekValue;
            } else {
                weeks[weekKeyMap[cTaskType]] = [weekValue, 0, _initWeekTargetValue(weekKeyMap[cTaskType])];
            }
            taskData.weekTasks = weeks;
            taskData.weekRefreshTime = new Date();
        }

        var wVitalityRefreshTime = taskData.wVitalityRefreshTime;
        if (!wVitalityRefreshTime || wVitalityRefreshTime.getWeekNumber() != (new Date()).getWeekNumber()) {
            taskData.wVitality = 0;
            taskData.wVitalityChests = [0, 0];
            taskData.wVitalityRefreshTime = new Date();
        }

        //更新
        var updataData = {
            dailyTasks: taskData.dailyTasks,
            vitality: taskData.vitality,
            vitalityChests: taskData.vitalityChests,
            refreshTime: taskData.refreshTime,
            tasksValue: taskData.tasksValue,
            weekTasks: taskData.weekTasks,
            weekRefreshTime: taskData.weekRefreshTime,
            wVitality: taskData.wVitality,
            wVitalityChests: taskData.wVitalityChests,
            wVitalityRefreshTime: taskData.wVitalityRefreshTime
        };
        gamePlayer.setTaskDataDirty()
        cb(null, updataData);
    });
};

// 优化任务接口
// @param: taskOpt {cTaskType:count}
exports.setTaskValues = function(client, userId, taskOpt, cb) {
    checkRequire();
    //taskSerial.add(userId,function(cb1){
    _setTaskValues(client, userId, taskOpt, function(err, data) {
        cb(err, data);
        //cb1(err,data);
    });
    //});
}

var _setTaskValues = function(client, userId, taskOpt, cb) {

    //_getRecordData(client,userId,function(err,taskData){
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        _refreshTaskData(gamePlayer.taskData);
        var taskData = gamePlayer.taskData;
        for (var cTaskType in taskOpt) {
            var count = taskOpt[cTaskType];

            var dailyTasks = taskData.dailyTasks; //日常任务。{"任务id":[完成数量,是否领取],"任务id":[完成数量,是否领取],.....}
            var refreshTime = taskData.refreshTime; //日常数据最后修改时间
            var tasksValue = taskData.tasksValue; //成就任务完成数据  {"子类型":数量,"子类型":数量,...}
            var weekTasks = taskData.weekTasks; //周任务。{"任务id":[完成数量,目标数量,是否领取],"任务id":[完成数量,目标数量,是否领取],.....}
            var weekRefreshTime = taskData.weekRefreshTime;
            //成就任务 （6 7 11）
            if (cTaskType == c_prop.cTaskTypeKey.equipSmelt ||
                cTaskType == c_prop.cTaskTypeKey.clearHero || cTaskType == c_prop.cTaskTypeKey.encounter || cTaskType == c_prop.cTaskTypeKey.rankFighting ||
                cTaskType == c_prop.cTaskTypeKey.petFeedCake || cTaskType == c_prop.cTaskTypeKey.petFeedCandy ||
                cTaskType == c_prop.cTaskTypeKey.openCopperChest || cTaskType == c_prop.cTaskTypeKey.openSilverChest || cTaskType == c_prop.cTaskTypeKey.openGoldChest ||
                cTaskType == c_prop.cTaskTypeKey.costInheritedItem || cTaskType == c_prop.cTaskTypeKey.costMedalItem || cTaskType == c_prop.cTaskTypeKey.labaPet ||
                cTaskType == c_prop.cTaskTypeKey.petSRNum || cTaskType == c_prop.cTaskTypeKey.petSSRNum ||
                cTaskType == c_prop.cTaskTypeKey.medalNum || cTaskType == c_prop.cTaskTypeKey.medalSRNum || cTaskType == c_prop.cTaskTypeKey.medalSSRNum ||
                cTaskType == c_prop.cTaskTypeKey.employerSNum || cTaskType == c_prop.cTaskTypeKey.employerSSNum ||
                cTaskType == c_prop.cTaskTypeKey.buyWeekCard || cTaskType == c_prop.cTaskTypeKey.buyMonthCard || cTaskType == c_prop.cTaskTypeKey.buyDashang || cTaskType == c_prop.cTaskTypeKey.buyTMFund ||
                cTaskType == c_prop.cTaskTypeKey.buyDayShop || cTaskType == c_prop.cTaskTypeKey.buyDiamond || cTaskType == c_prop.cTaskTypeKey.costDScore ||
                cTaskType == c_prop.cTaskTypeKey.firstRecharge || cTaskType == c_prop.cTaskTypeKey.costLotus ||
                cTaskType == c_prop.cTaskTypeKey.letouNum || cTaskType == c_prop.cTaskTypeKey.heroSkinSSRNum ||
                cTaskType == c_prop.cTaskTypeKey.enterZLBossNum || cTaskType == c_prop.cTaskTypeKey.useSYItem) {
                var value = tasksValue[cTaskType] || 0;
                taskData.tasksValue[cTaskType] = value + count;
            }
            //特殊成就任务    任一角色全身第一颗宝石+ N   （ 8 ）
            if (cTaskType == c_prop.cTaskTypeKey.heroGem || cTaskType == c_prop.cTaskTypeKey.heroStar || cTaskType == c_prop.cTaskTypeKey.jxLvl || cTaskType == c_prop.cTaskTypeKey.cybLvl ||
                cTaskType == c_prop.cTaskTypeKey.nobleLvl) {
                var value = tasksValue[cTaskType] || 0;
                if (count > value) taskData.tasksValue[cTaskType] = count;
            }
            //特殊成就任务    任一达到（0  1  2  3  5  10）
            if (cTaskType == c_prop.cTaskTypeKey.personLvl || cTaskType == c_prop.cTaskTypeKey.skillLvl || cTaskType == c_prop.cTaskTypeKey.equipStrength ||
                cTaskType == c_prop.cTaskTypeKey.equipUpStar || cTaskType == c_prop.cTaskTypeKey.gemUp ||
                cTaskType == c_prop.cTaskTypeKey.paralysisUp || cTaskType == c_prop.cTaskTypeKey.reviveUp || cTaskType == c_prop.cTaskTypeKey.protectUp || cTaskType == c_prop.cTaskTypeKey.harmUp ||
                cTaskType == c_prop.cTaskTypeKey.combat || cTaskType == c_prop.cTaskTypeKey.rebirthLvl || cTaskType == c_prop.cTaskTypeKey.realmLvl ||
                cTaskType == c_prop.cTaskTypeKey.heartLayer || cTaskType == c_prop.cTaskTypeKey.paTa || cTaskType == c_prop.cTaskTypeKey.wing|| cTaskType == c_prop.cTaskTypeKey.heroSkinNum) {
                var value = tasksValue[cTaskType] || 0;
                if (count > value) taskData.tasksValue[cTaskType] = count;
            }
            //特殊成就任务    通关副本（4 9 12 13）
            if (cTaskType == c_prop.cTaskTypeKey.closeTollGate || cTaskType == c_prop.cTaskTypeKey.equipCopy ||
                cTaskType == c_prop.cTaskTypeKey.hell || cTaskType == c_prop.cTaskTypeKey.state || cTaskType == c_prop.cTaskTypeKey.guild || cTaskType == c_prop.cTaskTypeKey.copyV7 ||
                cTaskType == c_prop.cTaskTypeKey.copyV10 || cTaskType == c_prop.cTaskTypeKey.copyV14 || cTaskType == c_prop.cTaskTypeKey.copyV17 || cTaskType == c_prop.cTaskTypeKey.copyV19 ||
                cTaskType == c_prop.cTaskTypeKey.teamBoss || cTaskType == c_prop.cTaskTypeKey.worldBoss || cTaskType == c_prop.cTaskTypeKey.guildChapter) {
                var value = tasksValue[cTaskType] || 0;
                if (count > value) taskData.tasksValue[cTaskType] = count;
            }

            //每日        （1 2 6 14 20 9 12 13 11 15 16）
            if (cTaskType == c_prop.cTaskTypeKey.skillLvl || cTaskType == c_prop.cTaskTypeKey.equipStrengthNum ||
                cTaskType == c_prop.cTaskTypeKey.equipSmelt || cTaskType == c_prop.cTaskTypeKey.shopBuy ||
                cTaskType == c_prop.cTaskTypeKey.chat || cTaskType == c_prop.cTaskTypeKey.equipCopy ||
                cTaskType == c_prop.cTaskTypeKey.hell || cTaskType == c_prop.cTaskTypeKey.state ||
                cTaskType == c_prop.cTaskTypeKey.encounter || cTaskType == c_prop.cTaskTypeKey.wingTrain ||
                cTaskType == c_prop.cTaskTypeKey.rankFighting || cTaskType == c_prop.cTaskTypeKey.treasure ||
                cTaskType == c_prop.cTaskTypeKey.paTaLottery ||
                cTaskType == c_prop.cTaskTypeKey.heartStunt || cTaskType == c_prop.cTaskTypeKey.loginGame ||
                cTaskType == c_prop.cTaskTypeKey.consumeSum1 || cTaskType == c_prop.cTaskTypeKey.consumeSum2 ||
                cTaskType == c_prop.cTaskTypeKey.lotusGetExp ||
                cTaskType == c_prop.cTaskTypeKey.employNum || cTaskType == c_prop.cTaskTypeKey.teamBossNum || cTaskType == c_prop.cTaskTypeKey.openGoldChest ||
                cTaskType == c_prop.cTaskTypeKey.killZLBossNum || cTaskType == c_prop.cTaskTypeKey.SYCopyNum || cTaskType == c_prop.cTaskTypeKey.passPataNum) { //成就副本数据记录

                if (!dailyKeyMap[cTaskType] || !c_task[dailyKeyMap[cTaskType]]) continue;
                var daily = {};
                if (!refreshTime || !refreshTime.equalsDay(new Date())) {
                    taskData.vitality = 0;
                    taskData.vitalityChests = [0, 0, 0, 0, 0];
                    var dailyTasksStar = c_game.dailyTasksCfg[0];
                    var dailyTasksEnd = c_game.dailyTasksCfg[1];
                    for (var i = dailyTasksStar; i <= dailyTasksEnd; i++) {
                        if (c_task[i]) daily[i] = [0, 0];
                    }
                } else {
                    daily = dailyTasks;
                }
                var dailyValue = 0;
                if (daily[dailyKeyMap[cTaskType]]) {
                    dailyValue = daily[dailyKeyMap[cTaskType]][0];
                }
                //特殊每日判断  减少更新次数
                // if(cTaskType == c_prop.cTaskTypeKey.shopBuy || cTaskType == c_prop.cTaskTypeKey.wingTrain //|| cTaskType == c_prop.cTaskTypeKey.rankFighting
                //     || cTaskType == c_prop.cTaskTypeKey.chat || cTaskType == c_prop.cTaskTypeKey.treasure|| cTaskType == c_prop.cTaskTypeKey.guildCopy
                //     || cTaskType == c_prop.cTaskTypeKey.paTaLottery || cTaskType == c_prop.cTaskTypeKey.heartStunt|| cTaskType == c_prop.cTaskTypeKey.loginGame
                //     || cTaskType == c_prop.cTaskTypeKey.consumeSum1 || cTaskType == c_prop.cTaskTypeKey.consumeSum2
                //     || cTaskType == c_prop.cTaskTypeKey.lotusGetExp || cTaskType == c_prop.cTaskTypeKey.guildLottery|| cTaskType == c_prop.cTaskTypeKey.guildPersonAct){
                //     var targetValue = c_task[dailyKeyMap[cTaskType]].targetValue;
                //     if(dailyValue >= targetValue) continue;//return cb(null, {});
                // }
                if (cTaskType == c_prop.cTaskTypeKey.equipStrengthNum || cTaskType == c_prop.cTaskTypeKey.equipSmelt || cTaskType == c_prop.cTaskTypeKey.consumeSum1 ||
                    cTaskType == c_prop.cTaskTypeKey.consumeSum2 ||
                    cTaskType == c_prop.cTaskTypeKey.employNum || cTaskType == c_prop.cTaskTypeKey.teamBossNum || cTaskType == c_prop.cTaskTypeKey.openGoldChest) {
                    dailyValue = dailyValue + count;
                } else {
                    dailyValue = dailyValue + 1;
                }
                if (daily[dailyKeyMap[cTaskType]]) {
                    daily[dailyKeyMap[cTaskType]][0] = dailyValue;
                } else {
                    daily[dailyKeyMap[cTaskType]] = [dailyValue, 0];
                }
                taskData.dailyTasks = daily;
                taskData.refreshTime = new Date();
            } else if (cTaskType == c_prop.cTaskTypeKey.employ1 || cTaskType == c_prop.cTaskTypeKey.employ2 ||
                cTaskType == c_prop.cTaskTypeKey.employ3 || cTaskType == c_prop.cTaskTypeKey.employ4 ||
                cTaskType == c_prop.cTaskTypeKey.employ5 || cTaskType == c_prop.cTaskTypeKey.employ6 ||
                cTaskType == c_prop.cTaskTypeKey.exploreDegree || cTaskType == c_prop.cTaskTypeKey.exploreFail || cTaskType == c_prop.cTaskTypeKey.employSUpNum) {
                // 周任务
                var weeks = {};
                if (!weekRefreshTime || weekRefreshTime.getWeekNumber() != (new Date()).getWeekNumber()) {
                    for (var i = c_game.weekTasksCfg[3]; i <= c_game.weekTasksCfg[4]; i++) {
                        weeks[i] = [0, 0, _initWeekTargetValue(i)];
                    }
                } else {
                    weeks = weekTasks;
                }
                var weekValue = 0;
                if (weeks[weekKeyMap[cTaskType]]) {
                    weekValue = weeks[weekKeyMap[cTaskType]][0];
                }
                if (cTaskType == c_prop.cTaskTypeKey.exploreFail || cTaskType == c_prop.cTaskTypeKey.employSUpNum) {
                    weekValue = weekValue + count;
                } else if (cTaskType == c_prop.cTaskTypeKey.exploreDegree) {
                    weekValue = count;
                } else {
                    weekValue = weekValue + 1;
                }
                if (weeks[weekKeyMap[cTaskType]]) {
                    weeks[weekKeyMap[cTaskType]][0] = weekValue;
                } else {
                    weeks[weekKeyMap[cTaskType]] = [weekValue, 0, _initWeekTargetValue(weekKeyMap[cTaskType])];
                }
                taskData.weekTasks = weeks;
                taskData.weekRefreshTime = new Date();
            }
        }

        var wVitalityRefreshTime = taskData.wVitalityRefreshTime;
        if (!wVitalityRefreshTime || wVitalityRefreshTime.getWeekNumber() != (new Date()).getWeekNumber()) {
            taskData.wVitality = 0;
            taskData.wVitalityChests = [0, 0];
            taskData.wVitalityRefreshTime = new Date();
        }

        //更新
        var updataData = {
            dailyTasks: taskData.dailyTasks,
            vitality: taskData.vitality,
            vitalityChests: taskData.vitalityChests,
            refreshTime: taskData.refreshTime,
            tasksValue: taskData.tasksValue,
            weekTasks: taskData.weekTasks,
            weekRefreshTime: taskData.weekRefreshTime,
            wVitality: taskData.wVitality,
            wVitalityChests: taskData.wVitalityChests,
            wVitalityRefreshTime: taskData.wVitalityRefreshTime
        };
        gamePlayer.setTaskDataDirty();
        cb(null, updataData);
    });
};

//批准委托
exports.ratifyEntrust = function(client, userId, index, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            taskData = gamePlayer.taskData;
        var entrustCfg = c_entrust[index]; //配置
        if (!entrustCfg) return cb(getMsg(c_msgCode.paramsError)); //参数错误;

        var entrustTasks = taskData.entrustTasks || []; //委托任务数据
        if (entrustTasks[index]) return cb(getMsg(c_msgCode.hasReward)); //已领取");

        if (index > 0) {
            var preEntrust = entrustTasks[index - 1]; //上一个委托
            //必须上一阶段的委托任务完成 才能批准
            if (!preEntrust || !preEntrust.isDone) return cb(getMsg(c_msgCode.nonstandard)); //条件不足;
        }

        //初始化任务
        entrustTasks[index] = { "tasks": [], "isDone": 0 };

        // var tempArr = [];
        // entrustCfg.taskIds.forEach(function(taskId, key) {
        //     tempArr.push({ 'key': key, 'taskId': taskId });
        // });

        // console.error("entrustCfg.taskIds---------"+entrustCfg.taskIds);
        async.mapSeries(entrustCfg.taskIds, function(taskId, cb1) {
            // console.error("taskId---------"+taskId);
            var taskCfg = c_task[taskId];
            //初始化任务值
            _initEntrustTaskValue(client, gamePlayer, taskCfg.cTaskType, function(err, value) {
                if (err) return cb1(err);
                // console.error("taskCfg.cTaskType---------"+taskCfg.cTaskType+",taskCfg.id"+taskCfg.id);
                var taskData = [taskId, value, 0];
                entrustTasks[index]["tasks"].push(taskData);
                cb1(null);
            });
        }, function(err, data) {
            if (err) return cb(err);
            //数据改变  
            taskData.entrustTasks = entrustTasks;
            //更新
            var updateTaskData = {
                entrustTasks: taskData.entrustTasks
            };
            gamePlayer.setTaskDataDirty();
            return cb(null, [updateTaskData]);
        });
    });
}

//初始化（紧急委托）任务值  B类任务需要初始化
var _initEntrustTaskValue = function(client, gamePlayer, cTaskType, cb) {
    checkRequire();
    var value = 0;
    var userData = gamePlayer.userData,
        taskData = gamePlayer.taskData;
        heroList = gamePlayer.heroListData;
    var userId = userData.id;
    switch (cTaskType) {
        case c_prop.entrustTaskTypeKey.normalBoss:
            copyProgressDao.select(client, { userId: userId, copyType: c_prop.copyTypeKey.normal }, function(err, copyProgressData) {
                // copyBiz.getInfo(client, userId, c_prop.copyTypeKey.normal, function(err, copyProgressData) {
                if (err) return cb(err);
                if (!copyProgressData || !copyProgressData.copyObj) return cb(null, value);
                var copyArr = Object.keys(copyProgressData.copyObj);
                value = copyArr.length;
                return cb(null, value);
            });
            break;
        case c_prop.entrustTaskTypeKey.stateCopy:
            copyProgressDao.select(client, { userId: userId, copyType: c_prop.copyTypeKey.state }, function(err, copyProgressData) {
                // copyBiz.getInfo(client, userId, c_prop.copyTypeKey.state, function(err, copyProgressData) {
                if (err) return cb(err);
                if (!copyProgressData || !copyProgressData.copyStar) return cb(null, value);
                value = parseInt(commonUtils.getLastKey(copyProgressData.copyStar));
                return cb(null, value);
            });
            break;
        case c_prop.entrustTaskTypeKey.hasGuild:
            guildPersonalDao.select(client, { userId: userId }, function(err, guildPersonalData) {
                if (err) return cb(err);
                if (guildPersonalData && guildPersonalData.guildId > 0) {
                    var guildData = g_guild.getGuild(guildPersonalData.guildId);
                    if (guildData) {
                        value = 1;
                    }
                }
                return cb(null, value);
            });
            break;
        case c_prop.entrustTaskTypeKey.hellCopy:
            copyProgressDao.select(client, { userId: userId, copyType: c_prop.copyTypeKey.hell }, function(err, copyProgressData) {
                // copyBiz.getInfo(client, userId, c_prop.copyTypeKey.hell, function(err, copyProgressData) {
                if (err) return cb(err);
                if (!copyProgressData || !copyProgressData.copyStar) return cb(null, value);
                value = parseInt(commonUtils.getLastKey(copyProgressData.copyStar));
                return cb(null, value);
            });
            break;
        case c_prop.entrustTaskTypeKey.userLvl:
            value = userData.lvl || 0;
            return cb(null, value);
            break;
        case c_prop.entrustTaskTypeKey.passPata:
            copyProgressDao.select(client, { userId: userId, copyType: c_prop.copyTypeKey.paTa }, function(err, copyProgressData) {
                // copyBiz.getInfo(client, userId, c_prop.copyTypeKey.paTa, function(err, copyProgressData) {
                if (err) return cb(err);
                if (!copyProgressData || !copyProgressData.copyObj) return cb(null, value);
                value = parseInt(commonUtils.getLastKey(copyProgressData.copyObj));
                return cb(null, value);
            });
            break;
        case c_prop.entrustTaskTypeKey.userCombat:
            value = userData.combat || 0;
            return cb(null, value);
            break;
        case c_prop.entrustTaskTypeKey.passAbyss:
            copyProgressDao.select(client, { userId: userId, copyType: c_prop.copyTypeKey.abyss }, function(err, copyProgressData) {
                // copyBiz.getInfo(client, userId, c_prop.copyTypeKey.abyss, function(err, copyProgressData) {
                if (err) return cb(err);
                if (!copyProgressData || !copyProgressData.copyStar) return cb(null, value);
                value = parseInt(commonUtils.getLastKey(copyProgressData.copyStar));
                return cb(null, value);
            });
            break;
        case c_prop.entrustTaskTypeKey.rebirthLvl:
            value = userData.rebirthLvl || 0;
            return cb(null, value);
            break;
        case c_prop.entrustTaskTypeKey.receiveDailyTask: //领取1次日常任务
            if (taskData && taskData.dailyTasks) {
                var keysArr = Object.keys(taskData.dailyTasks);
                for (var i = 0, len = keysArr.length; i < len; i++) {
                    var taskId = keysArr[i];
                    if (taskData.dailyTasks[taskId] && taskData.dailyTasks[taskId][1] == 1) {
                        value = 1;
                        break;
                    }
                }
            }
            return cb(null, value);
            break;
        case c_prop.entrustTaskTypeKey.receiveLvGift:
            var activityData = g_cache.getActivityDataByType(c_prop.activityTypeKey.lvGift);
            if (activityData) {
                var activityId = activityData.id; //活动ID
                if (userData.activity && userData.activity[activityId] && userData.activity[activityId][0] > 0) {
                    value = 1;
                }
            }
            return cb(null, value);
            break;
        case c_prop.entrustTaskTypeKey.fairyCopy: //精灵副本
            copyProgressDao.select(client, { userId: userId, copyType: c_prop.copyTypeKey.vip7 }, function(err, copyProgressData) {
                // copyBiz.getInfo(client, userId, c_prop.copyTypeKey.vip7, function(err, copyProgressData) {
                if (err) return cb(err);
                if (!copyProgressData || !copyProgressData.copyStar) return cb(null, value);
                value = parseInt(commonUtils.getLastKey(copyProgressData.copyStar));
                return cb(null, value);
            });
            break;
        case c_prop.entrustTaskTypeKey.achieveLvl:
            value = userData.achieveLvl || 0;
            return cb(null, value);
            break;
        case c_prop.entrustTaskTypeKey.upSkill:
            heroDao.list(client, { userId: userData.id }, function(err, heroList) {
                if (err) return cb(err);
                var maxSkillLvl = 0;
                for (var i = 0; i < heroList.length; i++) {
                    var locHero = heroList[i];
                    var skillLvlArr = locHero.skillLvlArr || [];
                    skillLvlArr.forEach(function(skillLvl) {
                        maxSkillLvl = skillLvl > maxSkillLvl ? skillLvl : maxSkillLvl;
                    });
                }
                return cb(null, maxSkillLvl);
            });
            break;
        case c_prop.entrustTaskTypeKey.clearHero:
            value = heroList.length || 0;
            return cb(null, value);
            break;
        case c_prop.entrustTaskTypeKey.heartStunt:
            heartStuntDao.select(client, { userId: userId }, function(err, heartStuntData) {
                if (!heartStuntData) return cb(null, value);
                var dot = heartStuntData.heartLvlArr;
                var newHeartLayer = 0;
                for(var i = 0; i < dot.length; i++) {
                    newHeartLayer = Math.floor(dot[i] / 10) + 1;
                    if(newHeartLayer > value) {
                        value = newHeartLayer;
                    }
                }
                return cb(null, value);
            });
            break;
        case c_prop.entrustTaskTypeKey.loginNum:
            value = g_server.betweenOpenDateDays() || 0;
            value += 1;
            return cb(null, value);
            break;
        case c_prop.entrustTaskTypeKey.wingFos:
            for(var i = 0; i < heroList.length; i++) {
                if (heroList[i].wingArr[1] > value) {
                    value = heroList[i].wingArr[1]
                }
            }
            return cb(null, value);
            break;
        case c_prop.entrustTaskTypeKey.wingAllCombat:
            for(var i = 0; i < heroList.length; i++) {
                value += heroList[i].wingCombat;
            }
            return cb(null, value);
            break;
        case c_prop.entrustTaskTypeKey.elfNectar:
            value = userData.bag[c_prop.spItemIdKey.elfNectar] || 0;
            return cb(null, value);
            break;
        case c_prop.entrustTaskTypeKey.intimacy:
            var heroData = userData.heroData;
            for(var heroId in heroData) {
                var heroGiftId = heroData[heroId][6] || 0;
                if (!heroGiftId) {
                    continue;
                }
                var t_heroGiftData = t_heroGift[heroGiftId]
                if (t_heroGiftData.level > value) {
                    value = t_heroGiftData.level;
                }
            }
            return cb(null, value);
            break;
        default:
            return cb(null, value);
    }
}
//领取委托奖励
exports.receiveEntrustAward = function(client, userId, index, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            taskData = gamePlayer.taskData;
        var entrustCfg = c_entrust[index]; //配置
        if (!entrustCfg) return cb(getMsg(c_msgCode.paramsError)); //参数错误;

        var entrustTasks = taskData.entrustTasks || []; //委托任务数据
        if (!entrustTasks[index]) return cb(getMsg(c_msgCode.paramsError)); //参数错误;
        if (entrustTasks[index].isDone) return cb(getMsg(c_msgCode.hasReward)); //已领取");
        var tasks = entrustTasks[index].tasks || [];

        var canReceive = true;
        //必须上一阶段的委托任务全部完成 才能批准
        for (var i = 0, len = tasks.length; i < len; i++) {
            var taskData = tasks[i] || [];
            var isComplete = taskData[2] || false;
            if (!isComplete) return cb(getMsg(c_msgCode.nonstandard)); //条件不足;
        }
        entrustTasks[index].isDone = 1;
        //数据改变  
        taskData.entrustTasks = entrustTasks;

        //领取奖励
        var rewardId = entrustCfg.rewardId;
        // 金币
        var gold = c_reward[rewardId].gold;
        if (gold > 0) {
            userUtils.addCurrency(userData, c_prop.currencyTypeKey.gold, gold, c_prop.itemGetTypeKey.task);
        }
        //钻石
        var diamond = c_reward[rewardId].diamond;
        if (diamond > 0) {
            userUtils.addCurrency(userData, c_prop.currencyTypeKey.diamond, diamond, c_prop.itemGetTypeKey.task);
        }
        // 加声望
        var prestige = c_reward[rewardId].prestige;
        if (prestige > 0) {
            userData.prestige += prestige;
        }
        //物品
        var itemsArr = [];
        var bagItems = {};
        var equipBagItems = {};
        var items = c_reward[rewardId].rewardItems;
        if (JSON.stringify(items) != "{}") {
            itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.task);
            if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
            if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);
        }

        var upUserData = {
            lvl: userData.lvl,
            magicLvl: userData.magicLvl,
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            genuineQi: userData.genuineQi,
            prestige: userData.prestige,
            achieveExp: userData.achieveExp,
            achieveLvl: userData.achieveLvl,
            cybExp: userData.cybExp,
            heroData: userData.heroData
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));
        var upTaskData = {
            entrustTasks: taskData.entrustTasks
        };
        gamePlayer.setTaskDataDirty();
        cb(null, [upUserData, upTaskData, bagItems, equipBagItems]);
    });
}

//设置紧急委托任务值
exports.setEntrustTaskValue = function(client, userId, entrustTaskType, count, cb) {
    checkRequire();
    count = parseInt(count);
    //[ {"tasks": [[3, 0, 1],[任务类型, 任务值, 是否领取]],"isDone": 0}]
    // A类  从激活任务时开始计算
    // B类  计算至今的累计值
    //累加值型的任务类型
    var AccumulativeTypes = {};
    AccumulativeTypes[c_prop.entrustTaskTypeKey.zhongLiNum] = 1;
    AccumulativeTypes[c_prop.entrustTaskTypeKey.yijieDuoBao] = 1;
    AccumulativeTypes[c_prop.entrustTaskTypeKey.smeltEquip] = 1;
    AccumulativeTypes[c_prop.entrustTaskTypeKey.upStarEquip] = 1;
    AccumulativeTypes[c_prop.entrustTaskTypeKey.upWing] = 1;
    AccumulativeTypes[c_prop.entrustTaskTypeKey.upMedal] = 1;
    AccumulativeTypes[c_prop.entrustTaskTypeKey.giftTouShi] = 1;
    AccumulativeTypes[c_prop.entrustTaskTypeKey.abyssNum] = 1;
    AccumulativeTypes[c_prop.entrustTaskTypeKey.yijieNum] = 1;

    //最高值型的任务类型
    var MaximumValueTypes = {};
    MaximumValueTypes[c_prop.entrustTaskTypeKey.receiveDailyTask] = 1;
    MaximumValueTypes[c_prop.entrustTaskTypeKey.normalBoss] = 1;
    MaximumValueTypes[c_prop.entrustTaskTypeKey.stateCopy] = 1;
    MaximumValueTypes[c_prop.entrustTaskTypeKey.hasGuild] = 1;
    MaximumValueTypes[c_prop.entrustTaskTypeKey.hellCopy] = 1;
    MaximumValueTypes[c_prop.entrustTaskTypeKey.userLvl] = 1;
    MaximumValueTypes[c_prop.entrustTaskTypeKey.passPata] = 1;
    MaximumValueTypes[c_prop.entrustTaskTypeKey.userCombat] = 1;
    MaximumValueTypes[c_prop.entrustTaskTypeKey.passAbyss] = 1;
    MaximumValueTypes[c_prop.entrustTaskTypeKey.rebirthLvl] = 1;
    MaximumValueTypes[c_prop.entrustTaskTypeKey.receiveLvGift] = 1;
    MaximumValueTypes[c_prop.entrustTaskTypeKey.fairyCopy] = 1;
    MaximumValueTypes[c_prop.entrustTaskTypeKey.achieveLvl] = 1;
    MaximumValueTypes[c_prop.entrustTaskTypeKey.upSkill] = 1;
    MaximumValueTypes[c_prop.entrustTaskTypeKey.heartStunt] = 1;
    MaximumValueTypes[c_prop.entrustTaskTypeKey.loginNum] = 1;
    MaximumValueTypes[c_prop.entrustTaskTypeKey.wingFos] = 1;
    MaximumValueTypes[c_prop.entrustTaskTypeKey.wingAllCombat] = 1;
    MaximumValueTypes[c_prop.entrustTaskTypeKey.intimacy] = 1;
    MaximumValueTypes[c_prop.entrustTaskTypeKey.clearHero] = 1;//设置的时候累加
    MaximumValueTypes[c_prop.entrustTaskTypeKey.elfNectar] = 1;//设置的时候累加

    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            taskData = gamePlayer.taskData;
            heroList = gamePlayer.heroListData;
        var entrustTasks = taskData.entrustTasks;
        if (!entrustTasks || entrustTasks.length == 0) return cb(null, {});
        var entrustId = entrustTasks.length - 1;
        var curEntrust = entrustTasks[entrustId]; //当前的委托
        var curTasks = curEntrust.tasks;

        var isChange = false;
        for (let i = 0, len = curTasks.length; i < len; i++) {
            var childTaskData = curTasks[i];
            if (!c_task[childTaskData[0]]) continue;
            var curTaskType = c_task[childTaskData[0]].cTaskType;
            var value = childTaskData[1] || 0;
            //判断任务是A类还是B类
            if (AccumulativeTypes[entrustTaskType]) {
                if (!childTaskData[2]) { //没领取
                    //同类型
                    if (curTaskType == entrustTaskType) {
                        childTaskData[1] = value + count;
                    }
                    break; //只设置当前正在做的任务 by 策划   如果是A类任务则只设置当前任务值   如果是B类任务则要设置当前委托内所有同类型任务值
                }
                isChange = true;
            } else if (MaximumValueTypes[entrustTaskType]) {
                if (!childTaskData[2] && curTaskType == entrustTaskType) { //没领取 且 同类型
                    //精灵总战力
                    if (entrustTaskType == c_prop.entrustTaskTypeKey.wingAllCombat) {
                        for(let j = 0; j < heroList.length; j++) {
                            count += heroList[j].wingCombat;
                        }
                    }
                    if (entrustTaskType == c_prop.entrustTaskTypeKey.clearHero || entrustTaskType == c_prop.entrustTaskTypeKey.elfNectar) {
                        count = value + count;
                    }
                    if (count > value) childTaskData[1] = count;
                    isChange = true;
                }
            }
        }
        if (!isChange) return cb(null, {});
        //数据改变  
        taskData.entrustTasks = entrustTasks;

        var upTaskData = {
            entrustTasks: taskData.entrustTasks
        };
        g_data.setEntrustTasksChange(userId, 1);
        gamePlayer.setTaskDataDirty();
        cb(null, upTaskData);
    });
}
/*****************************************************************************************************/

//判断是否有数据，无数据插入一条 _getRecordData
exports.getTaskInfoForLogin = function(client, userId, cb) {
    checkRequire();
    taskDao.select(client, { userId: userId }, function(err, taskData) {
        if (err) return cb(err);
        if (!taskData) { //如果不存在该用户数据则插入一条
            var tasks = {};
            var tasksValue = {};
            var dailyTasks = {};
            var weekTasks = {};
            var dailyTasksStar = c_game.dailyTasksCfg[0];
            var dailyTasksEnd = c_game.dailyTasksCfg[1];
            for (var i = dailyTasksStar; i <= dailyTasksEnd; i++) {
                if (i == 2100006 || i == 2100017) continue;
                if (c_task[i]) {
                    dailyTasks[i] = [0, 0];
                }
            }
            // for(var i = 0;i <= 13; i++){
            //     if(i <= 10){
            //         tasks[i] = c_game.honorStartCfg1[i];
            //     }else{
            //         tasks[i] = c_game.honorStartCfg2[i-11];
            //     }
            //     tasksValue[i] = 0;
            // }   

            for (var i = 0; i < c_game.honorStartCfg1.length; i++) {
                var honorStartCfg = c_game.honorStartCfg1[i].split(",");
                var taskType = parseInt(honorStartCfg[1]);
                var tid = parseInt(honorStartCfg[0]);
                if (tid > 0) {
                    if (c_task[tid]) {
                        tasks[taskType] = parseInt(tid);
                        tasksValue[taskType] = 0;
                    }
                }
            }
            for (var i = 0; i < c_game.honorStartCfg2.length; i++) {
                var honorStartCfg = c_game.honorStartCfg2[i].split(",");
                var taskType = parseInt(honorStartCfg[1]);
                var tid = parseInt(honorStartCfg[0]);
                if (tid > 0) {
                    if (c_task[tid]) {
                        tasks[taskType] = parseInt(tid);
                        tasksValue[taskType] = 0;
                    }
                }
            }
            //console.error("=======c_game.honorStartCfg3.length=========",c_game.honorStartCfg3.length);
            for (var i = 0; i < c_game.honorStartCfg3.length; i++) {
                var honorStartCfg = c_game.honorStartCfg3[i].split(",");
                var taskType = parseInt(honorStartCfg[1]);
                var tid = parseInt(honorStartCfg[0]);
                if (tid > 0) {
                    if (c_task[tid]) {
                        tasks[taskType] = parseInt(tid);
                        tasksValue[taskType] = 0;
                    }
                }
            }

            for (var i = c_game.weekTasksCfg[3]; i <= c_game.weekTasksCfg[4]; i++) {
                if (c_task[i]) {
                    weekTasks[i] = [0, 0, _initWeekTargetValue(i)];
                }
            }
            var taskEntity = new TaskEntity();
            taskEntity.userId = userId;
            taskEntity.dailyTasks = dailyTasks;
            taskEntity.vitality = 0;
            taskEntity.vitalityChests = [0, 0, 0, 0, 0];
            taskEntity.tasks = tasks;
            taskEntity.tasksValue = tasksValue;
            taskEntity.doneTasks = [];
            taskEntity.weekTasks = weekTasks;
            taskEntity.weekRefreshTime = new Date();
            taskEntity.wVitality = 0;
            taskEntity.wVitalityChests = [0, 0];
            taskEntity.wVitalityRefreshTime = new Date();
            taskDao.insert(client, taskEntity, function(err, data) {
                if (err) return cb(err);
                taskEntity.id = data.insertId;
                cb(null, taskEntity);
            });
        } else {
            // 清理旧数据 (只是内存)
            _refreshTaskData(taskData);

            cb(null, taskData);
        }
    });
};

var _refreshTaskData = function(taskData) {
    // 清理旧数据 (只是内存)
    var weekTasks = taskData.weekTasks; //周任务。{"任务id":[完成数量,目标数量,是否领取],"任务id":[完成数量,目标数量,是否领取],.....}
    var weekRefreshTime = taskData.weekRefreshTime;

    // 周任务
    var weeks = {};
    //星期六的日期如果包含时分秒，getWeekNumber()获取的是下一周，会刷新任务
    // var nowTime = new Date();
    // nowTime.setDate(nowTime.getDate() - 1);
    // if (!weekRefreshTime || (new Date(weekRefreshTime.setDate(weekRefreshTime.getDate()-1))).getWeekNumber() != (new Date(nowTime)).getWeekNumber()) {
    if (!weekRefreshTime || weekRefreshTime.getWeekNumber() != (new Date()).getWeekNumber()) {
        for (var i = c_game.weekTasksCfg[3]; i <= c_game.weekTasksCfg[4]; i++) {
            weeks[i] = [0, 0, _initWeekTargetValue(i)];
        }
    } else {
        weeks = weekTasks;
    }
    taskData.weekTasks = weeks;
    taskData.weekRefreshTime = new Date();

    var wVitalityRefreshTime = taskData.wVitalityRefreshTime;
    if (!wVitalityRefreshTime || wVitalityRefreshTime.getWeekNumber() != (new Date()).getWeekNumber()) {
        taskData.wVitality = 0;
        taskData.wVitalityChests = [0, 0];
        taskData.wVitalityRefreshTime = new Date();
    }
}

//判断是否完成任务
var _isTask = function(userData, heroList, taskId) {
    var isTask = false;
    var cTaskType = c_task[taskId].cTaskType;
    var need = c_task[taskId].targetValue;
    switch (cTaskType) {
        case c_prop.cTaskTypeKey.personLvl: //人物等级
            var lvl = userData.lvl;
            if (lvl >= need) isTask = true;
            break;
        case c_prop.cTaskTypeKey.skillLvl: //技能等级
            var skillLvl = 0;
            for (var i = 0; i < heroList.length; i++) {
                var heroData = heroList[i];
                var skillLvlArr = heroData.skillLvlArr;
                for (var ii = 0; ii < skillLvlArr.length; ii++) {
                    if (skillLvlArr[ii] > skillLvl) skillLvl = skillLvlArr[ii];
                }
            }
            if (skillLvl >= need) isTask = true;
            break;
        case c_prop.cTaskTypeKey.equipStrength: //装备强化
            var intensify = 0;
            for (var i = 0; i < heroList.length; i++) {
                var heroData = heroList[i];
                var intensifyArr = heroData.intensifyArr;
                for (var ii = 0; ii < intensifyArr.length; ii++) {
                    if (intensifyArr[ii] > intensify) intensify = intensifyArr[ii];
                }
            }
            if (intensify >= need) isTask = true;
            break;
        case c_prop.cTaskTypeKey.equipUpStar: //装备升星
            var star = 0;
            for (var i = 0; i < heroList.length; i++) {
                var heroData = heroList[i];
                var starArr = heroData.starArr;
                for (var ii = 0; ii < starArr.length; ii++) {
                    if (starArr[ii] > star) star = starArr[ii];
                }
            }
            if (star >= need) isTask = true;
            break;
        case c_prop.cTaskTypeKey.closeTollGate: //通关关卡
            break;
        case c_prop.cTaskTypeKey.gemUp: //宝石升级
            var gem = 0;
            for (var i = 0; i < heroList.length; i++) {
                var heroData = heroList[i];
                var gemArr = heroData.gemArr;
                for (var ii = 0; ii < gemArr.length; ii++) {
                    if (gemArr[ii] > gem) gem = gemArr[ii];
                }
            }
            if (gem >= need) isTask = true;
            break;
        case c_prop.cTaskTypeKey.equipSmelt: //熔炼装备
            break;
        case c_prop.cTaskTypeKey.clearHero: //解锁职业
            break;
        case c_prop.cTaskTypeKey.heroGem: //角色宝石
            for (var i = 0; i < heroList.length; i++) {
                var heroData = heroList[i];
                var gemArr = heroData.gemArr;
                var isTrue = 0;
                for (var ii = 0; ii < gemArr.length; ii++) {
                    if (!gemArr[ii] || gemArr[ii] < 1) isTrue = 1;
                }
                if (isTrue == 0) isTask = true;
            }
            break;
        case c_prop.cTaskTypeKey.equipCopy: //装备副本
            break;
        case c_prop.cTaskTypeKey.combat: //战力
            break;
        case c_prop.cTaskTypeKey.encounter: //遭遇战
            break;
        case c_prop.cTaskTypeKey.hell: //炼狱副本
            break;
        case c_prop.cTaskTypeKey.state: //境界副本
            break;
        case c_prop.cTaskTypeKey.copyV7:
            break;
        case c_prop.cTaskTypeKey.copyV10:
            break;
        case c_prop.cTaskTypeKey.copyV14:
            break;
        case c_prop.cTaskTypeKey.copyV17:
            break;
        case c_prop.cTaskTypeKey.copyV19:
            break;
    }
    return isTask;
}


//输出指定范围内的随机数的随机整数
var _getRandomNumber = function(start, end) {
    var choice = end - start + 1;
    return Math.floor(Math.random() * choice + start);
};

// 生成周任务 targetValue
var _initWeekTargetValue = function(taskId) {
    var value = 0;
    if (taskId == 5000007) {
        var arr = c_game.weekTasksCfg[0].split(",");
        var minValue = parseInt(arr[0]) || 20;
        var maxValue = parseInt(arr[1]) || 80;
        value = _getRandomNumber(minValue, maxValue);
    } else if (taskId == 5000008) {
        var arr = c_game.weekTasksCfg[1].split(",");
        var minValue = parseInt(arr[0]) || 20;
        var maxValue = parseInt(arr[1]) || 25;
        value = _getRandomNumber(minValue, maxValue);
    } else if (taskId == 5000009) {
        var arr = c_game.weekTasksCfg[2].split(",");
        var minValue = parseInt(arr[0]) || 5;
        var maxValue = parseInt(arr[1]) || 10;
        value = _getRandomNumber(minValue, maxValue);
    } else {
        value = c_task[taskId].targetValue;
    }
    return value;
}