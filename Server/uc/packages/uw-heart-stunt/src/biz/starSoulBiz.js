/**
 * Created by Administrator on 2018/7/19.
 */
var uwData = require("uw-data");
var c_game = uwData.c_game;
var c_starSoul = uwData.c_starSoul;
var c_prop = uwData.c_prop;
var c_lvl = uwData.c_lvl;
var consts = uwData.consts;
var c_msgCode = uwData.c_msgCode;
var t_item = uwData.t_item;
var c_open = uwData.c_open;
var async = require("async");
var getMsg = require("uw-utils").msgFunc(__filename);
var userBiz = require("uw-user").userBiz;
var g_cache = require("uw-global").g_cache;
var ds = require("uw-ds").ds;
var exports = module.exports;

var userDao = null;
var userUtils = null;
var propUtils = null;
var itemBiz = null;
var commonUtils = null;
var chatBiz = null;
var taskBiz = null;
var checkRequire = function() {
    userDao = userDao || require("uw-user").userDao;
    userUtils = userUtils || require("uw-user").userUtils;
    propUtils = propUtils || require("uw-utils").propUtils;
    itemBiz = itemBiz || require("uw-item").itemBiz;
    commonUtils = commonUtils || require("uw-utils").commonUtils;
    chatBiz = chatBiz || require("uw-chat").chatBiz;
    taskBiz = taskBiz || require("uw-task").taskBiz;
};

/**
 * 激活星盘(初始化数据)
 * @param client
 * @param userId
 * @param index
 * @param cb
 */
exports.activateStarPlate = function(client, userId, index, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        _checkCanOpen(client, userData, c_open.starPlate, { heartStuntIndex: index }, function(err) {
            if (err) return cb(err);
            _checkAndInitStarSoulData(userData, index);
            var updateUser = {
                propertyData: userData.propertyData
            };
            cb(null, updateUser);
        });
    });
};

/**
 * 解锁星盘槽位
 * @param client
 * @param userId
 * @param index
 * @param slotIndex
 * @param cb
 */
exports.openSlot = function(client, userId, index, slotIndex, cb) {
    checkRequire();
    if (slotIndex > 8 || slotIndex < 2) return cb(getMsg(c_msgCode.paramsError)); //参数错误
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var openStr = "starPlateSlot" + (parseInt(slotIndex) + 1).toString();
        // console.error("openStr",openStr,c_open[openStr]);
        _checkCanOpen(client, userData, c_open[openStr], { heartStuntIndex: index }, function(err) {
            if (err) return cb(err);
            _checkAndInitStarSoulData(userData, index);
            var starSoulData = userData.propertyData[c_prop.propertyDataKey.starSoul][index][slotIndex] || [0, 0];
            starSoulData[1] = 1;
            userData.propertyData[c_prop.propertyDataKey.starSoul][index][slotIndex] = starSoulData;
            var updateUser = {
                propertyData: starSoulData
            };
            cb(null, updateUser);
        });
    });
};

/**
 * 穿戴星魂
 * @param client
 * @param userId
 * @param index
 * @param slotIndex
 * @param starSoulId
 * @param cb
 */
exports.wearStarSoul = function(client, userId, index, slotIndex, starSoulId, cb) {
    checkRequire();
    if (slotIndex > 8 || slotIndex < 0) return cb(getMsg(c_msgCode.paramsError)); //参数错误
    if (!c_starSoul[starSoulId]) return cb(getMsg(c_msgCode.paramsError)); //参数错误
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var items = {};
        var bagItems = {};
        var delBagItems = {};
        var bag = userData.bag || {};

        if (!bag[starSoulId]) return cb(getMsg(c_msgCode.noEquipInBag)); //背包没有该装备
        var starSoulInfo = c_starSoul[starSoulId];
        //槽位9 只能穿戴创世星魂
        if (slotIndex == 8 && starSoulInfo.type != 3) return cb(getMsg(c_msgCode.paramsError)); //参数错误

        _checkAndInitStarSoulData(userData, index);
        //该位置有星魂的话先拆下
        var slotIndexData = userData.propertyData[c_prop.propertyDataKey.starSoul][index][slotIndex];
        if (slotIndexData[0]) {
            items[slotIndexData[0]] = 1;
            var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.takeOffStarSoul);
            if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        }


        slotIndexData[0] = starSoulId;

        delBagItems[starSoulId] = 1;
        userUtils.delBag(userData, starSoulId, 1, c_prop.itemCostTypeKey.wearStarSoul);

        var updateUser = {
            propertyData: userData.propertyData
        };
        cb(null, [updateUser, bagItems, delBagItems]);
    });
};

/**
 * 脱下星魂
 * @param client
 * @param userId
 * @param index
 * @param slotIndex
 * @param cb
 */
exports.takeOffStarSoul = function(client, userId, index, slotIndex, cb) {
    checkRequire();
    if (slotIndex > 8 || slotIndex < 0) return cb(getMsg(c_msgCode.paramsError)); //参数错误
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var items = {};
        var bagItems = {};

        _checkAndInitStarSoulData(userData, index);
        var slotIndexData = userData.propertyData[c_prop.propertyDataKey.starSoul][index][slotIndex];
        if (!slotIndexData[0] || !c_starSoul[slotIndexData[0]]) return cb(getMsg(c_msgCode.noStarSoulAtSlot)); //该位置没有星魂

        items[slotIndexData[0]] = 1;
        var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.takeOffStarSoul);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);

        slotIndexData[0] = 0;

        var updateUser = {
            propertyData: userData.propertyData
        };
        cb(null, [updateUser, bagItems]);
    });
};

/**
 * 升级星魂
 * @param client
 * @param userId
 * @param index
 * @param starSoulId
 * @param cb
 */
exports.levelUpStarSoul = function(client, userId, starSoulId, cb) {
    checkRequire();
    if (!c_starSoul[starSoulId]) return cb(getMsg(c_msgCode.paramsError)); //参数错误
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var items = {};
        var bagItems = {};
        var delBagItems = {};

        var bag = userData.bag || {};

        //判断道具是否够 扣所需物品
        var starSoulInfo = c_starSoul[starSoulId];
        var needItems = starSoulInfo.needItems;
        if (needItems) {
            for (var i = 0; i < needItems.length; i++) {
                var itemId = needItems[i][0];
                var itemCount = needItems[i][1];

                if (!bag[itemId] || bag[itemId] < itemCount) {
                    return cb(getMsg(c_msgCode.materialUnenough)); //材料不足
                }
                userUtils.delBag(userData, itemId, itemCount, c_prop.itemCostTypeKey.levelUpStarSoul);
                delBagItems[itemId] = itemCount;
            }
        }
        //获得
        items[starSoulId] = 1;
        var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.levelUpStarSoul);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);

        cb(null, [bagItems, delBagItems]);
    });
};


//************************************************************************************************************************************************************************
var _checkAndInitStarSoulData = function(userData, index) {
    //激活星盘
    //[[[0,1],[0,1],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],[],[]]   [[[星魂ID,槽位是否激活]],契约2的星盘，契约3的星盘]
    var starSoulData = userData.propertyData[c_prop.propertyDataKey.starSoul] || [];
    starSoulData[index] = starSoulData[index] || [
        [0, 1],
        [0, 1],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0]
    ];
    userData.propertyData[c_prop.propertyDataKey.starSoul] = starSoulData;
};


var _checkCanOpen = function(client, userData, cfg, paramObj, cb) {
    var canOpen = false;
    var userId = userData.id;
    if (!cfg) {
        if (cb) return cb(getMsg(c_msgCode.configError)); //配置错
    }

    if (cfg.lvlRequired) { //需求等级
        canOpen = userData.lvl >= cfg.lvlRequired;
        if (!canOpen) {
            if (cb) return cb(getMsg(c_msgCode.noRoleLvl, openLvl));
        }
    }

    if (cfg.rebirthLvlRequired) { //需求小队评级
        canOpen = userData.rebirthLvl >= cfg.rebirthLvlRequired;
        if (!canOpen) {
            if (cb) return cb(getMsg(c_msgCode.teamRankUnenough)); //小队评级不足
        }
    }

    if (cfg.nobleRequired) { //需求贵族等级达到
        var nobleData = userData.noble || [];
        var nobleLevel = userUtils.getNobleLevel(nobleData);
        canOpen = nobleLevel >= cfg.nobleRequired;
        if (!canOpen) {
            if (cb) return cb(getMsg(c_msgCode.nobleLvlUnenough)); //贵族等级不足
            // return canOpen;
        }
    }

    var checkList = [];
    if (cfg.passNormalRequired) { //需求通关XX关
        checkList.push(function(cb1) {
            var copyProgressDao = copyProgressDao || require('uw-copy').copyProgressDao;
            copyProgressDao.select(client, { userId: userId, copyType: c_prop.copyTypeKey.normal }, function(err,copyProgressData) {
                if (err) return cb1(err);
                var copyObj = copyProgressData.copyObj || {};
                var keys = Object.keys(copyObj);
                var curCopyId = keys[keys.length - 1] || 1;
                canOpen = curCopyId > cfg.passNormalRequired;
                if (!canOpen) {
                    cb1(getMsg(c_msgCode.passNormalCopy, needPassNormalCopy)); //通关第X关后才能解锁
                } else {
                    cb1(null);
                }
            });
        });

    }
    if (cfg.heartStuntRequired) { //需求星灵契约达到
        // var heartData = userData.propertyData[c_prop.propertyDataKey.heartStunt] || {};
        // for (var key in heartData) {
        //     var locHeartId = parseInt(key);
        //     var locHeartLvl = parseInt(heartData[key] || 0);
        //     //console.error('locHeartLvl',locHeartLvl,'cfg.heartStuntRequired',cfg.heartStuntRequired);
        //     canOpen = locHeartLvl >= cfg.heartStuntRequired;
        //     if (canOpen) break; //任意一个星灵契约达到就满足条件
        // }
        checkList.push(function(cb1) {
            heartStuntIndex = paramObj.heartStuntIndex || 0;
            var heartStuntDao = heartStuntDao || require("../dao/heartStuntDao.js");
            heartStuntDao.select(client, { userId: userId }, function(err,heartStuntData) {
                if (err) return cb1(err);
                var heartLvlArr = heartStuntData.heartLvlArr || [];
                var curIndexHeartLvl = heartLvlArr[heartStuntIndex] || 0;
                canOpen = curIndexHeartLvl >= cfg.heartStuntRequired;
                if (!canOpen) {
                    cb1(getMsg(c_msgCode.heartStuntUnenough)); //星灵契约层数不足
                } else {
                    cb1(null);
                }
            });
        });
    }

    async.series(checkList, function(err, results) {
        if (err) return cb(err);
        return cb(null);
    });
}