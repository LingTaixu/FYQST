/**
 * Created by Administrator on 2014/5/16.
 */
var uwData = require("uw-data");
var c_game = uwData.c_game;
var c_prop = uwData.c_prop;
var c_lvl = uwData.c_lvl;
var consts = uwData.consts;
var c_msgCode = uwData.c_msgCode;
var t_item = uwData.t_item;
var c_open = uwData.c_open;
//var c_vip = uwData.c_vip;
var c_heartStunt = uwData.c_heartStunt;
var c_heartStuntLvl = uwData.c_heartStuntLvl;
var async = require("async");
var getMsg = require("uw-utils").msgFunc(__filename);
var HeartStuntEntity = require('uw-entity').HeartStuntEntity;
// var biBiz = require('uw-log').biBiz;
// var genuineQiObj = require('uw-log').genuineQiObj;
var userBiz = require("uw-user").userBiz;
var g_cache = require("uw-global").g_cache;
var ds = require("uw-ds").ds;
var exports = module.exports;
var formula = require("uw-formula");

var userDao = null;
var userUtils = null;
var propUtils = null;
var itemBiz = null;
var commonUtils = null;
var heartStuntDao = null;
var demonLotusDao = null;
var chatBiz = null;
var taskBiz = null;
var checkRequire = function() {
    userDao = userDao || require("uw-user").userDao;
    userUtils = userUtils || require("uw-user").userUtils;
    propUtils = propUtils || require("uw-utils").propUtils;
    heartStuntDao = heartStuntDao || require("../dao/heartStuntDao.js");
    itemBiz = itemBiz || require("uw-item").itemBiz;
    commonUtils = commonUtils || require("uw-utils").commonUtils;
    demonLotusDao = demonLotusDao || require("uw-demon-lotus").demonLotusDao;
    chatBiz = chatBiz || require("uw-chat").chatBiz;
    taskBiz = taskBiz || require("uw-task").taskBiz;
};

/**
 * 获取心法神功数据
 * @param client
 * @param userId
 * @param cb
 */
exports.getInfo = function(client, userId, cb) {
    checkRequire();
    // userDao.selectCols(client,"id,lvl",{id:userId},function(err,userData){
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var openLvl = c_open.heartStunt1.lvlRequired;
        if (userData.lvl < openLvl) return cb(getMsg(c_msgCode.noRoleLvl, openLvl));
        _getRecordData(client, userId, function(err, heartStuntData) {
            cb(null, heartStuntData);
        });
    });
};

/**
 * 选择心法
 * @param client
 * @param userId
 * @param index
 * @param heartStuntId
 * @param cb
 */
exports.choMenCulMethods = function(client, userId, index, heartStuntId, cb) {
    checkRequire();
    index = parseInt(index);
    //if((index+1)>c_game.heartStuntCfg[0]) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    if (!c_heartStunt[heartStuntId]) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
            //userDao.selectCols(client,"id,lvl,vip,propertyData,nickName,rebirthLvl",{id:userId},cb1);
        }, function(cb1) {
            heartStuntDao.select(client, { userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData, heartStuntData = data[1];
        // var openLvl = c_open.heartStunt1.lvlRequired;
        // if(userData.lvl < openLvl) return cb(getMsg(c_msgCode.noRoleLvl,openLvl));
        var openRebirthLvl = c_open.heartStunt1.rebirthLvlRequired;
        var openStr = "heartStunt" + (parseInt(index) + 1).toString();
        if (!c_open[openStr]) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
        if (userData.rebirthLvl < openRebirthLvl) return cb(getMsg(c_msgCode.teamRankUnenough));//小队评级不足
        // var vip = userData.vip;
        var stateArr = heartStuntData.stateArr || [];         //境界槽位对应选择的心法[心法id,心法id,...]
        if (stateArr[index]) return cb(getMsg(c_msgCode.oneProtoss));//同一位置只能激活一种星灵
        if (stateArr.indexOf(heartStuntId) > -1) return cb(getMsg(c_msgCode.protossOnline));//该星灵已激活!
        // var vipopenStr = "vip" + openStr;

        // var openLvl = c_open[openStr].lvlRequired;
        // var isVip = false;      //vip提前开启
        // var openVip = 0;
        // if(index == 0){
        //     isVip = true;
        // }else if(c_open[vipopenStr]){
        //     openVip = c_open[vipopenStr].lvlRequired;
        //     if(userData.vip >= openVip) isVip = true;
        // }else{
        //     return cb(getMsg(c_msgCode.abnormalData));//数据异常");
        // }
        // if(userData.lvl<openLvl && !isVip) return cb(getMsg(c_msgCode.formulaNoOpen,openLvl,openVip));


        //学习心法
        heartStuntData.stateArr[index] = heartStuntId;
        heartStuntData.heartLvlArr[index] = 0;
        //属性数据
        if (!userData.propertyData[c_prop.propertyDataKey.heartStunt]) userData.propertyData[c_prop.propertyDataKey.heartStunt] = {};
        userData.propertyData[c_prop.propertyDataKey.heartStunt][heartStuntId] = 0;

        //更新
        var upUserData = {
            propertyData: userData.propertyData
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        var upHeartStuntData = {
            stateArr: heartStuntData.stateArr,
            heartLvlArr: heartStuntData.heartLvlArr
        };
        async.parallel([
            // function (cb1) {
            //     userDao.update(client, upUserData, {id: userId}, cb1);
            // },
            function(cb1) {
                heartStuntDao.update(client, upHeartStuntData, { id: heartStuntData.id }, cb1);
            }
        ], function(err, data) {
            if (err) return cb(err);
            if (heartStuntId == 1000) {
                chatBiz.addSysData(122, [userData.nickName]);//天马 攻击力爆炸！
            } else if (heartStuntId == 2000) {
                chatBiz.addSysData(123, [userData.nickName]);//天龙 血量 抗暴！
            } else if (heartStuntId == 3000) {
                chatBiz.addSysData(124, [userData.nickName]);//仙女 命中闪避！
            }
            cb(null, [upUserData, upHeartStuntData]);
        });
    });
};

/**
 * 更换心法
 * @param client
 * @param userId
 * @param index
 * @param heartStuntId
 * @param cb
 */
exports.chaMenCulMethods = function(client, userId, index, heartStuntId, cb) {
    checkRequire();
    if (!c_heartStunt[heartStuntId]) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }, function(cb1) {
            heartStuntDao.select(client, { userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData, heartStuntData = data[1];

        var stateArr = heartStuntData.stateArr || [];         //境界槽位对应选择的心法[心法id,心法id,...]
        var heartLvlArr = heartStuntData.heartLvlArr || [];
        var heartLvl = heartLvlArr[index] || 0;
        if (!stateArr[index]) return cb(getMsg(c_msgCode.noProtoss));//该位置还未激活星灵
        var oldHeartId = stateArr[index];
        //if(stateArr.indexOf(heartStuntId) > -1) return cb(getMsg(c_msgCode.protossOnline));//该星灵已激活!
        var cosDiamond = c_game.heartStuntCfg[2];
        if (userData.diamond < cosDiamond || cosDiamond < 0) return cb(getMsg(c_msgCode.noDiamond));

        //扣除元宝
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, cosDiamond, c_prop.diamondCostTypeKey.chaMenCulMethods);
        //属性数据
        if (!userData.propertyData[c_prop.propertyDataKey.heartStunt]) userData.propertyData[c_prop.propertyDataKey.heartStunt] = {};
        //替换心法
        var oldHeartLvl = 0;
        if (stateArr.indexOf(heartStuntId) > -1) {        //心法互换
            for (var i = 0; i < stateArr.length; i++) {
                if (stateArr[i] == heartStuntId) {
                    heartStuntData.stateArr[i] = oldHeartId;
                    oldHeartLvl = heartLvlArr[i] || 0;
                }
            }
            heartStuntData.stateArr[index] = heartStuntId;
            userData.propertyData[c_prop.propertyDataKey.heartStunt][oldHeartId] = oldHeartLvl;
            userData.propertyData[c_prop.propertyDataKey.heartStunt][heartStuntId] = heartLvl;
        } else {      //单向
            heartStuntData.stateArr[index] = heartStuntId;
            delete userData.propertyData[c_prop.propertyDataKey.heartStunt][oldHeartId];
            userData.propertyData[c_prop.propertyDataKey.heartStunt][heartStuntId] = heartLvl;
        }


        //更新
        var upUserData = {
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            propertyData: userData.propertyData
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        var upHeartStuntData = {
            stateArr: heartStuntData.stateArr
        };
        async.parallel([
            function(cb1) {
                heartStuntDao.update(client, upHeartStuntData, { id: heartStuntData.id }, cb1);
            }
        ], function(err, data) {
            if (err) return cb(err);
            cb(null, [upUserData, upHeartStuntData, cosDiamond]);
        });
    });
};

/**
 * 心法加点
 * @param client
 * @param userId
 * @param index
 * @param cb
 */
exports.stuMenCulMethods = function(client, userId, index, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }, function(cb1) {
            heartStuntDao.select(client, { userId: userId }, cb1);
        }, function(cb1) {
            demonLotusDao.select(client, { userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData, heartStuntData = data[1], demonLotusData = data[2];
        var openLvl = c_open.heartStunt1.rebirthLvlRequired;
        if (userData.rebirthLvl < openLvl) return cb(getMsg(c_msgCode.teamRankUnenough));//小队评级不足

        var dot = heartStuntData.heartLvlArr;       //境界槽位下标对应心法的等级[lvl,lvl,...]
        var stateArr = heartStuntData.stateArr || [];         //境界槽位对应选择的心法[心法id,心法id,...]
        if ((index + 1) > dot.length) return cb(getMsg(c_msgCode.abnormalData));//数据异常
        var dotLvl = parseInt(dot[index]);
        var heartStuntId = parseInt(stateArr[index]);
        var heartStuntLvlId = heartStuntId + dotLvl;
        if (!c_heartStuntLvl[heartStuntLvlId]) return cb(getMsg(c_msgCode.protossMax));//已达上限
        var costGold = c_heartStuntLvl[heartStuntLvlId].cosGold;
        if (userData.gold < costGold || costGold < 0) return cb(getMsg(c_msgCode.noGolds));
        var cosGenqi = c_heartStuntLvl[heartStuntLvlId].cosGenqi;
        var genuineQiArr = userUtils.calGenuineQi(userData, demonLotusData);
        var succeedPro = c_heartStuntLvl[heartStuntLvlId].succeedPro;
        if (genuineQiArr[0] < cosGenqi) return cb(getMsg(c_msgCode.noGas));
        var oldGenuineQi = genuineQiArr[0];

        //是否进阶成功
        var isSucceed = false;
        var randomNum = _getRandomNumber(1, 10000);
        if (randomNum <= succeedPro) {        //成功
            isSucceed = true;
            heartStuntData.heartLvlArr[index] = dotLvl + 1;
            //属性数据
            if (!userData.propertyData[c_prop.propertyDataKey.heartStunt]) userData.propertyData[c_prop.propertyDataKey.heartStunt] = {};
            userData.propertyData[c_prop.propertyDataKey.heartStunt][heartStuntId] = dotLvl + 1;
            //勋章成就 星座达到指定层 每层10级 所以要算下升级后是多少层
            var newHeartLayer = Math.floor((dotLvl + 1) / 10) + 1;
            //console.log("------------------------------星座达到指定层",newHeartLayer);
            userBiz.setMedalValue(client, userId, c_prop.medalLootTypeKey.heartLayer, newHeartLayer, function() {
            });
            taskBiz.setTaskValue(client, userId, c_prop.medalLootTypeKey.heartLayer, newHeartLayer, function() {
            });
            taskBiz.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.heartStunt, newHeartLayer, function() {});
        }

        //扣除金币 
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.gold, costGold, c_prop.goldCostTypeKey.stuMenCulMethods);
        //计算真气
        userUtils.addGenuineQi(userData, -cosGenqi);
        var genuineQiArrs = [userData.genuineQi];
 
        //更新
        var upUserData = {
            gold: userData.gold,
            exData: userData.exData,
            genuineQi: userData.genuineQi,
            propertyData: userData.propertyData
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        var upHeartStuntData = {
            heartLvlArr: heartStuntData.heartLvlArr
        };
        async.parallel([
            function(cb1) {
                heartStuntDao.update(client, upHeartStuntData, { id: heartStuntData.id }, cb1);
            }
        ], function(err, data) {
            if (err) return cb(err);
            cb(null, [upUserData, upHeartStuntData, isSucceed, genuineQiArrs, costGold]);
        });
    });
};

/*****************************************************************************************************/

//判断是否有数据，无数据插入一条
var _getRecordData = function(client, userId, cb) {
    heartStuntDao.select(client, { userId: userId }, function(err, heartStuntData) {
        if (err) return cb(err);
        if (!heartStuntData) {        //如果不存在该用户数据则插入一条
            var heartStuntEntity = new HeartStuntEntity();
            heartStuntEntity.userId = userId;
            heartStuntEntity.stateArr = [];
            heartStuntEntity.heartLvlArr = [];
            heartStuntDao.insert(client, heartStuntEntity, function(err, data) {
                if (err) return cb(err);
                heartStuntEntity.id = data.insertId;
                cb(null, heartStuntEntity);
            });
        } else {
            cb(null, heartStuntData);
        }
    });
};

//输出指定范围内的随机数的随机整数
var _getRandomNumber = function(start, end) {
    var choice = end - start + 1;
    return Math.floor(Math.random() * choice + start);
};

