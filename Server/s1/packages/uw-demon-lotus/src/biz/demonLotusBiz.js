/**
 * Created by Administrator on 2014/5/16.
 */
var uwData = require("uw-data");
var c_game = uwData.c_game;
var c_prop = uwData.c_prop;
var c_open = uwData.c_open;
var c_lvl = uwData.c_lvl;
var c_vip = uwData.c_vip;
var c_demonLotus = uwData.c_demonLotus;
var consts = uwData.consts;
var c_msgCode = uwData.c_msgCode;
var async = require("async");
var getMsg = require("uw-utils").msgFunc(__filename);
var chatBiz = require("uw-chat").chatBiz;
var formula = require("uw-formula");
var DemonLotusEntity = require('uw-entity').DemonLotusEntity;
// var biBiz = require('uw-log').biBiz;
// var genuineQiObj = require('uw-log').genuineQiObj;
var g_cache = require("uw-global").g_cache;
var userDao = null;
var userUtils = null;
var demonLotusDao = null;
var heroBiz = null;
var checkRequire = function() {
    userDao = userDao || require("uw-user").userDao;
    userUtils = userUtils || require("uw-user").userUtils;
    demonLotusDao = demonLotusDao || require("uw-demon-lotus").demonLotusDao;
    heroBiz = heroBiz || require("uw-hero").heroBiz;
};


var ds = require("uw-ds").ds;

var exports = module.exports;

/**
 * 获取聚灵妖莲数据
 * @param client
 * @param userId
 * @param cb
 */
exports.getInfo = function(client, userId, cb) {
    checkRequire();
    //userDao.selectCols(client,"id,lvl,genuineQi,exData",{id:userId},function(err,userData){ 
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var openLvl = c_open.expBox.lvlRequired;
        if (userData.lvl < openLvl) return cb(getMsg(c_msgCode.NoLvlOpen));//等级不足
        _getRecordData(client, userId, function(err, demonLotusData) {
            if (err) return cb(getMsg(c_msgCode.NoLvlOpen));//等级不足
            _calNowGet(demonLotusData);
            userUtils.calGenuineQi(userData, demonLotusData);
            var genuineQiArr = [userData.genuineQi];
            return cb(null, [false, false, demonLotusData, genuineQiArr]);
        });
    });
};

/**
 * 升级聚灵妖莲
 * @param client
 * @param userId
 * @param cb
 */
exports.upLotus = function(client, userId, cb) {
    checkRequire();
    //userDao.select(client,{id:userId},function(err,userData){
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var openLvl = c_open.expBox.lvlRequired;
        if (userData.lvl < openLvl) return cb(getMsg(c_msgCode.noRoleLvl));
        demonLotusDao.select(client, { userId: userId }, function(err, demonLotusData) {
            if (err) return cb(err);
            var lvl = demonLotusData.lvl;
            var needLvl = c_lvl[lvl + 1].needLvl;
            if (userData.lvl < needLvl) return cb(needLvl + "级可继续升级");
            var upLotusId = c_game.demonLotusCfg[0];
            var lvlLimit = c_game.demonLotusCfg[1];
            if (lvl >= lvlLimit) return cb(getMsg(c_msgCode.lvlMaxed));//等级已达上限
            var upLotusNum = c_lvl[lvl + 1].upLotusNum;     //升级需要的道具数量
            var bag = userData.bag;
            var count = bag[upLotusId] || 0;
            if (count < upLotusNum) return cb(getMsg(c_msgCode.materialUnenough));//材料不足
            var delBagItems = {};

            //扣除材料 
            delBagItems[upLotusId] = upLotusNum;
            userUtils.delBag(userData, upLotusId, upLotusNum, c_prop.itemCostTypeKey.lotus);
            //重置时间、结算升级前经验
            _calNowGet(demonLotusData);
            demonLotusData.lastOpeTime = new Date();
            //提升等级
            demonLotusData.lvl += 1;

            gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
            var upLotusData = {
                lvl: demonLotusData.lvl,
                addUpExpc: demonLotusData.addUpExpc,
                lastOpeTime: demonLotusData.lastOpeTime
            };
            async.parallel([
                // function (cb1) {
                //     userDao.update(client, upUserData, {id: userId}, cb1);
                // },
                function(cb1) {
                    demonLotusDao.update(client, upLotusData, { id: demonLotusData.id }, cb1);
                }
            ], function(err, data) {
                if (err) return cb(err);
                cb(null, [upLotusData, delBagItems, upLotusNum]);
            });
        });
    });
};

/**
 * 领取收益
 * @param client
 * @param userId
 * @param cb
 */
exports.getRevenue = function(client, userId, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            // userDao.selectCols(client,"id,lvl,expc,rebirthExp,rebirthLvl,isOpenIn,infuseExpc,medalData,propertyData,nickName,exData,buff,achieveLvl,cybLvl,jxLvl,heroData",{id:userId},cb1);
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            demonLotusDao.select(client, { userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData, demonLotusData = data[1];
        var expSum = 0;

        var lastOpeTime = demonLotusData.lastOpeTime;
        if (lastOpeTime && new Date() > lastOpeTime) {
            var second = (new Date().getTime() - lastOpeTime.getTime()) / 1000;
            var upUserData = {
                lvl: userData.lvl,
                magicLvl: userData.magicLvl,
                expc: userData.expc,
                infuseExpc: userData.infuseExpc
            };
            if (second <= 1) return cb(null, [upUserData, demonLotusData, expSum]);
        }

        //同步妖莲数据
        _calNowGet(demonLotusData);
        //计算经验
        var addUpExpc = demonLotusData.addUpExpc;
        userUtils.addUserExpc(userData, addUpExpc);
        expSum = addUpExpc;
        //重置妖莲
        demonLotusData.addUpExpc = 0;
        demonLotusData.lastOpeTime = new Date();

        var userFirstData = userData.exData[c_prop.userExDataKey.firstData] || {};
        if (!userFirstData[c_prop.firstDataKey.demonLotus]) {
            chatBiz.addSysData(120, [userData.nickName]);//咖啡店开张--首次领经验
            userFirstData[c_prop.firstDataKey.demonLotus] = 1;
            userData.exData[c_prop.userExDataKey.firstData] = userFirstData;
        }

        //更新
        var upUserData = {
            lvl: userData.lvl,
            magicLvl: userData.magicLvl,
            expc: userData.expc,
            infuseExpc: userData.infuseExpc,
            exData: userData.exData,
            strength: userData.strength
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        var upLotusData = {
            addUpExpc: demonLotusData.addUpExpc,
            lastOpeTime: demonLotusData.lastOpeTime
        };
        async.parallel([
            // function (cb1) {
            //     userDao.update(client, upUserData, {id: userId}, cb1);
            // },
            function(cb1) {
                demonLotusDao.update(client, upLotusData, { id: demonLotusData.id }, cb1);
            }
        ], function(err, data) {
            if (err) return cb(err);
            expSum = Math.round(expSum);
            cb(null, [upUserData, upLotusData, expSum]);
        });
    });
};

/**
 * 开光
 * @param client
 * @param userId
 * @param cb
 */
exports.opening = function(client, userId, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            demonLotusDao.select(client, { userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData;
        var demonLotusData = data[1];
        var openCount = userUtils.getTodayCount(userData, c_prop.userRefreshCountKey.opening) || 0;
        var vip = 0; // userData.vip;
        var openCountMax = c_vip[vip].openingCount;
        if (openCount >= openCountMax) return cb(getMsg(c_msgCode.maidCannotGreet));//女仆累了今天不想再接客了
        var costData = c_game.demonLotusCfg[3];
        costData = costData.split(",");


        var costDiamond = parseInt(costData[openCount] || 0);
        if (costDiamond <= 0) costDiamond = costData[costData.length - 1];

        if (userData.diamond < costDiamond || costDiamond < 0) {
            return cb(getMsg(c_msgCode.noDiamond));
        }
        heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.solicitNum, 1);
        //计算经验
        var expc = c_lvl[demonLotusData.lvl].openingExp;
        var expcMult = c_game.demonLotusCfg[4];
        var expcMultMax = c_game.demonLotusCfg[5];
        var conNum = _getOpenConNum(userData);
        var curMult = expcMult * conNum;
        if (curMult >= expcMultMax) curMult = expcMultMax;

        expc += parseInt(expc * curMult / 10000);
        _addOpenConNum(userData);

        userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.activity);
        userUtils.addTodayCount(userData, c_prop.userRefreshCountKey.opening, 1);
        userUtils.addUserExpc(userData, expc);
        var updateData = {
            counts: userData.counts,
            countsRefreshTime: userData.countsRefreshTime,
            record: userData.record,
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            lvl: userData.lvl,
            magicLvl: userData.magicLvl,
            expc: userData.expc,
            rebirthExp: userData.rebirthExp,
            infuseExpc: userData.infuseExpc,
            strength: userData.strength
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        expc = Math.round(expc);
        cb(null, [costDiamond, updateData, expc]);
    });
}

var _getOpenConNum = function(userData) {
    var conNum = userData.record[c_prop.userRecordTypeKey.demonLotusOpenNum] || 0;
    var conDate = userData.record[c_prop.userRecordTypeKey.demonLotusOpenDate] || new Date();
    conDate = new Date(conDate);
    if (conDate.getDaysBetween(new Date()) > 1) {
        conNum = 0;
    }
    return conNum;
}

var _addOpenConNum = function(userData) {
    var conNum = _getOpenConNum(userData);
    var conDate = userData.record[c_prop.userRecordTypeKey.demonLotusOpenDate];
    if (!conDate) {
        conNum = 1;
    } else {
        conDate = new Date(conDate);
        if (!conDate.equalsDay(new Date())) {
            conNum += 1;
        }
    }
    userData.record[c_prop.userRecordTypeKey.demonLotusOpenNum] = conNum;
    userData.record[c_prop.userRecordTypeKey.demonLotusOpenDate] = new Date();
}


/**
 * 妖莲进阶
 * @param client
 * @param userId
 * @param cb
 */
exports.lotusAdvance = function(client, userId, cb) {
    checkRequire();
    //userDao.select(client,{id:userId},function(err,userData){
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        demonLotusDao.select(client, { userId: userId }, function(err, demonLotusData) {
            if (err) return cb(err);
            var lvl = demonLotusData.lvl || 0;    //妖莲等级
            var advanceLvl = demonLotusData.advanceLvl || 0;      //妖莲进阶等级
            if (!c_demonLotus[advanceLvl + 1]) return cb(getMsg(c_msgCode.rankMaxed));//cb("进阶等级已达上限");
            var advNeedLvl = c_demonLotus[advanceLvl].advNeedLvl;   //进阶需要妖莲等级
            if (lvl < advNeedLvl) return cb(getMsg(c_msgCode.advanceLvl, advNeedLvl));//cb(advNeedLvl+"级可进阶");
            var advCosLotus = c_demonLotus[advanceLvl].advCosLotus;     //妖莲进阶消耗妖莲之心
            var bag = userData.bag;
            var upLotusId = c_prop.spItemIdKey.lotus;
            var count = bag[upLotusId] || 0;
            if (count < advCosLotus) return cb(getMsg(c_msgCode.materialUnenough));//材料不足

            //是否进阶成功
            var isSucceed = false;
            var advSucceedPro = c_demonLotus[advanceLvl].advSucceedPro;
            var randomNum = _getRandomNumber(1, 10000);
            if (randomNum <= advSucceedPro) {        //成功
                isSucceed = true;
                demonLotusData.advanceLvl = advanceLvl + 1;
            }

            //扣除材料
            var delBagItems = {};
            delBagItems[upLotusId] = advCosLotus;
            userUtils.delBag(userData, upLotusId, advCosLotus, c_prop.itemCostTypeKey.lotus);

            gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
            var upLotusData = {
                advanceLvl: demonLotusData.advanceLvl
            };
            async.parallel([
                // function (cb1) {
                //     userDao.update(client, upUserData, {id: userId}, cb1);
                // },
                function(cb1) {
                    if (!isSucceed) return cb1(null);
                    demonLotusDao.update(client, upLotusData, { id: demonLotusData.id }, cb1);
                }
            ], function(err, data) {
                if (err) return cb(err);
                cb(null, [upLotusData, delBagItems, isSucceed, advCosLotus]);
            });
        });
    });
};

/**
 * 妖莲宝物培养
 * @param client
 * @param userId
 * @param cb
 */
exports.treasureTrain = function(client, userId, cb) {
    checkRequire();
    //userDao.selectCols(client,"id,lvl,nickName,serverId,accountId,genuineQi,bag,exData,propertyData",{id:userId},function(err,userData) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        demonLotusDao.select(client, { userId: userId }, function(err, demonLotusData) {
            if (err) return cb(err);
            var advanceLvl = demonLotusData.advanceLvl || 0;      //妖莲进阶等级
            var treasureLvl = demonLotusData.treasureLvl || 0;      //妖莲宝物等级
            if (!c_demonLotus[treasureLvl].treaCosGenqi) return cb(getMsg(c_msgCode.maidMaxed));//cb("女仆等级已达上限");
            var treaNeedUserLvl = c_demonLotus[treasureLvl].treaNeedUserLvl;
            if (userData.lvl < treaNeedUserLvl) return cb(getMsg(c_msgCode.maidCannotLvlup));//等级不够不能培养女仆
            var treaCosLotus = c_demonLotus[treasureLvl].treaCosLotus;     //宝物升级消耗妖莲
            var treaCosGenqi = c_demonLotus[treasureLvl].treaCosGenqi;     //宝物升级消耗真气
            var genuineQiArr = userUtils.calGenuineQi(userData, demonLotusData);
            var bag = userData.bag;
            var upLotusId = c_prop.spItemIdKey.lotus;
            var count = bag[upLotusId] || 0;
            if (count < treaCosLotus) return cb(getMsg(c_msgCode.materialUnenough));//材料不足
            if (genuineQiArr[0] < treaCosGenqi) return cb(getMsg(c_msgCode.noGas));
            var oldGenuineQi = genuineQiArr[0];

            //是否进阶成功
            var isSucceed = false;
            var treaSucceedPro = c_demonLotus[treasureLvl].treaSucceedPro;
            var randomNum = _getRandomNumber(1, 10000);
            if (randomNum <= treaSucceedPro) {        //成功
                isSucceed = true;
                demonLotusData.treasureLvl = treasureLvl + 1;
            }

            //扣除材料
            var delBagItems = {};
            delBagItems[upLotusId] = treaCosLotus;
            userUtils.delBag(userData, upLotusId, treaCosLotus, c_prop.itemCostTypeKey.lotus);
            //计算真气
            userUtils.addGenuineQi(userData, -treaCosGenqi);
            var genuineQiArrs = [userData.genuineQi];

            //todo   c_demonLotus[].treaPropertys(宝物附加属性)
            userData.propertyData[c_prop.propertyDataKey.dlTreasure] = demonLotusData.treasureLvl;
  
            //更新
            var upUserData = {
                genuineQi: userData.genuineQi,
                exData: userData.exData,
                propertyData: userData.propertyData
            };
            gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
            var upLotusData = {
                treasureLvl: demonLotusData.treasureLvl
            };
            async.parallel([
                // function (cb1) {
                //     userDao.update(client, upUserData, {id: userId}, cb1);
                // },
                function(cb1) {
                    if (!isSucceed) return cb1(null);
                    demonLotusDao.update(client, upLotusData, { id: demonLotusData.id }, cb1);
                }
            ], function(err, data) {
                if (err) return cb(err);
                cb(null, [upLotusData, upUserData, delBagItems, isSucceed, genuineQiArrs, treaCosLotus]);
            });
        });
    });
};

/*****************************************************************************************************/
//输出指定范围内的随机数的随机整数
var _getRandomNumber = function(start, end) {
    var choice = end - start + 1;
    return Math.floor(Math.random() * choice + start);
};

//计算当前经验
var _calNowGet = function(demonLotusData) {
    var nowTime = new Date();
    var lvl = demonLotusData.lvl;
    var advanceLvl = demonLotusData.advanceLvl || 0;
    var addUpExpc = demonLotusData.addUpExpc;
    var lastOpeTime = demonLotusData.lastOpeTime;
    var expOutput = c_lvl[lvl].expOutput;       //经验产量（每秒）
    expOutput += c_demonLotus[advanceLvl].expOutput;
    var storeLimit = c_lvl[lvl].storeLimit;       //经验贮存上限
    storeLimit += c_demonLotus[advanceLvl].expcAccLimit;
    var expc = 0;
    if (addUpExpc < storeLimit && lastOpeTime && nowTime > lastOpeTime) {
        var second = (nowTime.getTime() - lastOpeTime.getTime()) / 1000;
        if (second > 1) expc = Math.round(expOutput * second);
    }
    var expcSum = addUpExpc + expc;
    demonLotusData.addUpExpc = expcSum;
    if (expcSum > storeLimit) demonLotusData.addUpExpc = storeLimit;
};

//判断是否有数据，无数据插入一条
var _getRecordData = function(client, userId, cb) {
    demonLotusDao.select(client, { userId: userId }, function(err, demonLotusData) {
        if (err) return cb(err);
        if (!demonLotusData) {        //如果不存在该用户数据则插入一条
            var demonLotusEntity = new DemonLotusEntity();
            demonLotusEntity.userId = userId;
            demonLotusEntity.lvl = 1;
            demonLotusEntity.addUpExpc = 0;
            demonLotusEntity.lastOpeTime = new Date();
            demonLotusEntity.advanceLvl = 0;
            demonLotusEntity.treasureLvl = 0;
            demonLotusDao.insert(client, demonLotusEntity, function(err, data) {
                if (err) return cb(err);
                demonLotusEntity.id = data.insertId;
                cb(null, demonLotusEntity);
            });
        } else {
            cb(null, demonLotusData);
        }
    });
};





