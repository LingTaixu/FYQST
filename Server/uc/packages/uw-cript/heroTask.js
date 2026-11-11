/**
 * Created by Sara on 2016/3/31.
 */
var mainClient = require("uw-db").mainClient;
var userDao = require("uw-user").userDao;
var heroBiz = require("uw-hero").heroBiz;
var taskDao = require("uw-task").taskDao;
var t_heroTask = require("uw-data").t_heroTask;
var t_heroTaskFrstHelp = require("uw-data").t_heroTaskFrstHelp;
var c_prop = require("uw-data").c_prop;
var t_item = require("uw-data").t_item;
var arenaBiz = require("uw-arena").arenaBiz;
var g_cache = require("uw-global").g_cache;

var async = require("async");
var exports = module.exports;
var scriptUtils = require("./scriptUtils");

var initHeroTask = function(serverData, sClient, cb) {
    taskDao.listCols(sClient, "userId, heroTasks", "1=1", [], function(err, taskList) {
        if (err) return cb(err);
        async.map(taskList, function(taskInfo, cb1) {
            _checkAndInitHeroTask(sClient, taskInfo, cb1);
        }, function(err, data) {
            if (err) return cb(err);
            console.log("更新完成");
            cb(null, taskList.length);
        });
    })
};

var _checkAndInitHeroTask = function(sClient, taskInfo, cb) {
    g_cache.getGamePlayer(sClient, taskInfo.userId, function(err, gamePlayer) {
        if (err) return cb(err);
        if (!gamePlayer) return cb(null);
        var userData = gamePlayer.userData;
        var heroData = userData.heroData || {};
        var heroTasks = taskInfo.heroTasks || {};
        var heroIds = Object.keys(heroData);
        async.map(heroIds, function(heroTempId, cb1) {
            _shit(userData, heroTasks, heroData, heroTempId, sClient, function(err, changed) {
                cb1(null, changed);
            });
        }, function(err, data) {
            if (err) return cb(err);
            taskInfo.heroTasks = heroTasks;
            console.log(data);
            if (data.indexOf(1) != -1) {
                console.log("需要更新：" + taskInfo.userId);
                taskDao.update(sClient, { heroTasks: taskInfo.heroTasks }, { userId: taskInfo.userId }, function(err, data) {
                });
            }
            cb(null);
        });
    });
};

var _shit = function(userData, heroTasks, heroData, heroTempId, sClient, cb) {
    if (heroTasks[heroTempId]) {
        return cb(null, 0);
    }
    let heroTaskId = t_heroTaskFrstHelp[heroTempId] || 0;
    if (heroTaskId === 0) return cb(null, 0);
    _checkAndActiveTask(userData, heroTasks, heroTempId, heroTaskId, 0, sClient, function(err) {
        return cb(null, 1);
    });
};

var _checkAndActiveTask = function(userData, heroTasks, heroId, heroTaskId, index, client, cb) {
    let t_heroTaskData = t_heroTask[heroTaskId];
    if (!t_heroTaskData || t_heroTaskData.heroId != heroId) return cb(null);
    heroTasks[heroId] = heroTasks[heroId] || [];
    if (!_needInitHeroTask(t_heroTaskData.type, index, heroTasks[heroId])) return cb(null);
    if (heroTasks[heroId][index]) return cb(null);

    _getInitValueByHeroTaskId(userData, heroTaskId, client, function(value) {
        heroTasks[heroId][index] = heroTasks[heroId][index] || [];
        heroTasks[heroId][index][0] = heroTaskId;
        heroTasks[heroId][index][1] = value;
        heroTasks[heroId][index][2] = _checkAndGetState(heroTasks[heroId][index], t_heroTaskData);
        _checkAndActiveTask(userData, heroTasks, heroId, heroTaskId + 1, index + 1, client, cb);
    });
};

var _needInitHeroTask = function(type, index, heroTaskInfo) {
    if (index === 0) {
        return true;
    }
    let lastTask = heroTaskInfo[index - 1];
    if (lastTask && lastTask[2] !== 0) {
        return true;
    }
    switch (type) {
        case c_prop.cHeroTaskKey.heroNum:
        case c_prop.cHeroTaskKey.normalBoss:
        case c_prop.cHeroTaskKey.medalNum:
        case c_prop.cHeroTaskKey.equipRefineNum:
        case c_prop.cHeroTaskKey.heroStar:
        case c_prop.cHeroTaskKey.rebirthLvl:
        case c_prop.cHeroTaskKey.initHero:
        case c_prop.cHeroTaskKey.petNumbers:
        case c_prop.cHeroTaskKey.abyssEquip:
        case c_prop.cHeroTaskKey.areaRank:
            return true;
    }
    return false;
};

var _getInitValueByHeroTaskId = function(userData, heroTaskId, client, cb) {
    let heroData = userData.heroData || {};
    let heroTaskData = t_heroTask[heroTaskId];
    let value = 0;
    let waitCallBack = false;
    switch (heroTaskData.type) {
        case c_prop.cHeroTaskKey.heroNum:
            value = userData.heroNum || 0;
            break;
        case c_prop.cHeroTaskKey.normalBoss:
            waitCallBack = true;
            let copyBiz = require("uw-copy").copyBiz;
            copyBiz.getInfo(client, userData.id, c_prop.copyTypeKey.normal, function(err, copyProgressData) {
                if (err) return cb(value);
                if (!copyProgressData || !copyProgressData.copyObj) return cb(value);
                let copyArr = Object.keys(copyProgressData.copyObj);
                value = copyArr.length;
                return cb(value);
            });
            break;
        case c_prop.cHeroTaskKey.medalNum || 0:
            value = userData.medalNum;
            break;
        case c_prop.cHeroTaskKey.equipRefineNum:
            waitCallBack = true;
            heroBiz.calAndGetHeroList(client, userData, function(err, heroList) {
                for (let i = 0; i < heroList.length; i++) {
                    let refineArr = heroList[i].refineArr || [];
                    for (let j = 0; j < refineArr.length; j++) {
                        value += refineArr[j] || 0;
                    }
                }
                return cb(value);
            });
            break;
        case c_prop.cHeroTaskKey.heroStar:
            let targetHeroData = heroData[heroTaskData.heroId];
            if (targetHeroData) {
                value = targetHeroData[2] || 0;
            }
            break;
        case c_prop.cHeroTaskKey.rebirthLvl:
            value = userData.rebirthLvl || 0;
            break;
        case c_prop.cHeroTaskKey.initHero:
            if (heroData[heroTaskData.target]) {
                value = heroTaskData.target;
            }
            break;
        case c_prop.cHeroTaskKey.petNumbers:
            waitCallBack = true;
            heroBiz.calAndGetHeroList(client, userData, function(err, heroList) {
                for (let i = 0; i < heroList.length; i++) {
                    value += heroList[i].talismanNum;
                }
                return cb(value);
            });
            break;
        case c_prop.cHeroTaskKey.abyssEquip:
            waitCallBack = true;
            heroBiz.calAndGetHeroList(client, userData, function(err, heroList) {
                for (let i = 0; i < heroList.length; i++) {
                    let equipData = heroList[i].equipData || {};
                    for (let j = c_prop.heroEquipIndexKey.sword; j <= c_prop.heroEquipIndexKey.belt; j++) {
                        if (equipData[j]) {
                            let tmpId = userData.equipBag[equipData[j]][0];
                            value += t_item[tmpId].itemLvl || 0;
                        }
                    }
                }
                return cb(value);
            });
            break;
        case c_prop.cHeroTaskKey.areaRank:
            waitCallBack = true;
            arenaBiz.selectArena(client, userData.id, function(err, arenaData) {
                if (err) return cb(value);
                value = arenaData.highRank;
                return cb(value);
            });
            break;
    }
    if (!waitCallBack) return cb(value);
};

var _checkAndGetState = function(heroTaskData, t_heroTaskData) {
    switch (t_heroTaskData.type) {
        case c_prop.cHeroTaskKey.areaRank:
            return heroTaskData[1] != 0 && heroTaskData[1] <= t_heroTaskData.target ? 1 : 0;
        default:
            return heroTaskData[1] >= t_heroTaskData.target ? 1 : 0;
    }
};

scriptUtils.runByServerIds([1,2,3,4,5,6,7,8,9,10],initHeroTask);
//scriptUtils.runByServerIds([11,12,13,14,15,16,17,18,19,20],initHeroTask);
//scriptUtils.runByServerIds([21,22,23,24,25,26,27,28,29,30],initHeroTask);
//scriptUtils.runByServerIds([31,32,33,34,35,36,37,38,39,40],initHeroTask);
//scriptUtils.runByServerIds([41,42,43,44,45,46,47,48,49],initHeroTask);

 
