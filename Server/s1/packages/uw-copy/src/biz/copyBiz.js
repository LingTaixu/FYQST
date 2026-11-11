/**
 * Created by Administrator on 2014/5/9.
 */
var uwData = require("uw-data");
var c_vip = uwData.c_vip;
var c_game = uwData.c_game;
var t_copy = uwData.t_copy;
var t_item = uwData.t_item;
var t_hero = uwData.t_hero;
var c_prop = uwData.c_prop;
var c_open = uwData.c_open;
var consts = uwData.consts;
var c_vipCopy = uwData.c_vipCopy;
var c_msgCode = uwData.c_msgCode;
var t_copyLoot = uwData.t_copyLoot;
var t_guildCopy = uwData.t_guildCopy;
var t_guildCopyBoss = uwData.t_guildCopyBoss;
var c_bossHurtRate = uwData.c_bossHurtRate;
var t_monster = uwData.t_monster;
var c_guildFuncCfg = uwData.c_guildFuncCfg;
var t_paTaTreasury = uwData.t_paTaTreasury;
var async = require("async");
var getMsg = require("uw-utils").msgFunc(__filename);
var UserEntity = require('uw-entity').UserEntity;
var CopyProgressEntity = require("uw-entity").CopyProgressEntity;
var formula = require("uw-formula");
var mainClient = require("uw-db").mainClient;
var g_copyFight = require("uw-global").g_copyFight;
var dsConsts = uwData.dsConsts;
//var BossObj = require('uw-log').BossObj;
var g_data = require("uw-global").g_data;
var g_cache = require("uw-global").g_cache;
var ossObj = require("uw-log").ossObj;
var ossBiz = require("uw-log").ossBiz;

var ds = require("uw-ds").ds;
var fightBiz = require("uw-fight").fightBiz;
var exports = module.exports;
var FightResult = ds.FightResult;

var chatBiz = null;
var gameCommonBiz = null;
var guildPersonalBiz = null;
var propUtils = null;
var userDao = null;
var heroBiz = null;
var copyProgressDao = null;
var copyUtils = null;
var userUtils = null;
//var biBiz = null;
var commonUtils = null;
var g_guild = null;
var guildPersonalDao = null;
var mailBiz = null;
var fightUtils = null;
var userBiz = null;
var guildBiz = null;
var taskBiz = null;
var itemBiz = null;
var CopyLootRecordEntity = null;
var copyLootRecordDao = null;
var activityBiz = null;
var logger = require('uw-log').getLogger("uw-route", __filename);
var checkRequire = function() {
    itemBiz = itemBiz || require("uw-item").itemBiz;
    taskBiz = taskBiz || require("uw-task").taskBiz;
    guildPersonalBiz = guildPersonalBiz || require("uw-guild").guildPersonalBiz;
    guildBiz = guildBiz || require("uw-guild").guildBiz;
    propUtils = propUtils || require("uw-utils").propUtils;
    userDao = userDao || require("uw-user").userDao;
    heroBiz = heroBiz || require("uw-hero").heroBiz;
    copyProgressDao = copyProgressDao || require("../dao/copyProgressDao");
    copyUtils = copyUtils || require("../biz/copyUtils");
    userUtils = userUtils || require("uw-user").userUtils;
    //biBiz = biBiz||require('uw-log').biBiz;
    commonUtils = commonUtils || require("uw-utils").commonUtils;
    gameCommonBiz = gameCommonBiz || require("uw-game-common").gameCommonBiz;
    chatBiz = chatBiz || require("uw-chat").chatBiz;
    g_guild = g_guild || require("uw-global").g_guild;
    guildPersonalDao = guildPersonalDao || require("uw-guild").guildPersonalDao;
    mailBiz = mailBiz || require("uw-mail").mailBiz;
    fightUtils = fightUtils || require("uw-fight").fightUtils;
    userBiz = userBiz || require("uw-user").userBiz;
    itemBiz = itemBiz || require("uw-item").itemBiz;
    CopyLootRecordEntity = CopyLootRecordEntity || require("uw-entity").CopyLootRecordEntity;
    copyLootRecordDao = copyLootRecordDao || require("../dao/copyLootRecordDao");
    activityBiz = activityBiz || require("uw-activity").activityBiz;
};

/**
 * 获取副本数据
 * @param client
 * @param userId
 * @param type   副本类型
 * @param cb
 */
exports.getInfo = function(client, userId, type, cb) {
    checkRequire();
    copyProgressDao.select(client, {
        userId: userId,
        copyType: type
    }, function(err, copyProgressData) {
        if (err) return cb(err);
        if (copyProgressData) return cb(null, copyProgressData);
        var copyProgress = new CopyProgressEntity();
        /** 用户id **/
        copyProgress.userId = userId;
        /*用户id*/
        /** 副本类型 **/
        copyProgress.copyType = type;
        /*副本类型*/
        /** 连胜 **/
        copyProgress.winningStreak = 0;
        /*连胜*/
        copyProgress.pCopyId = 0;

        /** 已通关子副本列表 **/
        copyProgress.copyObj = {};
        /*已通关子副本列表{子副本id:节点,子副本id:节点...}*/
        /** 子副本挑战时间列 **/
        copyProgress.timeArr = [];
        /*子副本挑战时间列*/
        /** 子副本星级 **/
        copyProgress.copyStar = {};
        /*子副本星级*/
        /** 主副本是否已经通过 **/
        copyProgress.finished = 0;
        /*主副本是否已经通过*/
        /** 子副本剩余挑战次数 **/
        copyProgress.timesPerDay = {};
        /*子副本已通关次数*/
        /** 购买次数 **/
        copyProgress.resetCounts = {};
        /*购买次数{id:次数,id:次数...}*/
        /** 查看数据 **/
        copyProgress.readObj = {};
        /*查看数据{副本id:是否阅读}*/

        copyProgressDao.insert(client, copyProgress, function(err, data) {
            if (err) return cb(err);
            copyProgress.id = data.insertId;
            cb(null, copyProgress);
        });
    });
};

/**
 * 购买挑战次数
 * @param client
 * @param userId
 * @param type   副本类型
 * @param copyId   副本id
 * @param cb
 */
exports.buyCopyCount = function(client, userId, type, copyId, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            //userDao.select(client,{id:userId},cb1)
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            copyProgressDao.select(client, {
                userId: userId,
                copyType: type
            }, cb1)
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            copyProgressData = data[1];
        var resetCounts = copyUtils.getBuyCopyCount(copyProgressData, copyId, type); //今日购买次数
        var timesPerDay = copyUtils.getReTime(userData, copyProgressData, copyId, type); //剩余次数
        //if(timesPerDay > 0) return cb(getMsg(c_msgCode.haveChallenge));//还有挑战次数

        var vipRight = userUtils.getWeekCardRight(userData) || 0;
        var costDiamond = 0; // 购买次数所需钻石
        var perKey = copyId;
        var buyCountLimit = 9999; //可购买次数
        switch (type) {
            case c_prop.copyTypeKey.equip: //装备副本
                costDiamond = c_game.buyCopyCost[0];
                buyCountLimit = c_vip[vipRight].buyEquipCount;
                break;
            case c_prop.copyTypeKey.state: //境界副本
                costDiamond = c_game.buyCopyCost[1];
                buyCountLimit = c_vip[vipRight].buyRealmCount;
                break;
            case c_prop.copyTypeKey.hell: //Boss副本 
                var vipExt = c_vip[vipRight].bossCount - c_vip[0].bossCount + timesPerDay;
                if (vipExt > 0) return cb(getMsg(c_msgCode.haveChallenge)); //还有挑战次数
                buyCountLimit = c_vip[vipRight].buyBossCount;
                costDiamond = c_game.buyCopyCost[2];
                break;
            case c_prop.copyTypeKey.vip7: //精灵副本
                perKey = copyUtils.getCopyVip(copyId);
                costDiamond = c_game.buyCopyCost[3];
                buyCountLimit = c_vip[vipRight].buyCopyCountV7;
                break;
            case c_prop.copyTypeKey.vip10: //打造副本
                perKey = copyUtils.getCopyVip(copyId);
                costDiamond = c_game.buyCopyCost[4];
                buyCountLimit = c_vip[vipRight].buyCopyCountV10;
                break;
            case c_prop.copyTypeKey.vip14: //宝石副本
                perKey = copyUtils.getCopyVip(copyId);
                costDiamond = c_game.buyCopyCost[5];
                buyCountLimit = c_vip[vipRight].buyCopyCountV14;
                break;
            case c_prop.copyTypeKey.vip17: //荣誉副本
                perKey = copyUtils.getCopyVip(copyId);
                costDiamond = c_game.buyCopyCost[6];
                buyCountLimit = c_vip[vipRight].buyCopyCountV17;
                break;
            case c_prop.copyTypeKey.vip19: //宠物副本
                perKey = copyUtils.getCopyVip(copyId);
                costDiamond = c_game.buyCopyCost[7];
                buyCountLimit = c_vip[vipRight].buyCopyCountV19;
                break;
            case c_prop.copyTypeKey.vip21: //人物副本
                perKey = copyUtils.getCopyVip(copyId);
                costDiamond = c_game.buyCopyCost[8];
                buyCountLimit = c_vip[vipRight].buyCopyCountV21;
                break;
            case c_prop.copyTypeKey.paTa: //爬塔
                costDiamond = formula.calPaTaAward(resetCounts, userData.highPaTa);
                break;
        }
        if (resetCounts > buyCountLimit) return cb(getMsg(c_msgCode.overBuyTimes)); //超过购买次数
        //判断被扣除钻石
        if (userData.diamond < costDiamond || costDiamond < 0) return cb(getMsg(c_msgCode.noDiamond)); //钻石不足
        //添加次数
        copyProgressData.timesPerDay[perKey] = timesPerDay + 1;
        copyProgressData.resetTime = new Date();
        copyProgressData.resetCounts[perKey] = resetCounts;
        //扣除钻石
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.buyCopyCount, 0, 0, type);

        if (type == c_prop.copyTypeKey.vip7 || type == c_prop.copyTypeKey.vip10 ||
            type == c_prop.copyTypeKey.vip14 || type == c_prop.copyTypeKey.vip17 ||
            type == c_prop.copyTypeKey.vip19 || type == c_prop.copyTypeKey.vip21 ){
            //拉切尔的健身计划，钻石扫荡材料副本(购买通过次数)
            activityBiz.recordLachelFitnessValue(client,userId, c_prop.lachelActTaskTypeKey.materialsCopyNum, 1, null, function(){});
        }
        //需要更新的数据
        var updateUserData = {
            diamond: userData.diamond,
            giveDiamond: userData.giveDiamond,
            buyDiamond: userData.buyDiamond
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        var updateCopyData = {
            resetTime: copyProgressData.resetTime,
            timesPerDay: copyProgressData.timesPerDay,
            resetCounts: copyProgressData.resetCounts,
            refreshTime: copyProgressData.refreshTime
        };
        async.parallel([
            function(cb2) {
                copyProgressDao.update(client, updateCopyData, {
                    id: copyProgressData.id
                }, cb2)
            }
        ], function(err, data2) {
            if (err) return cb(err);
            cb(null, [updateUserData, copyProgressData, costDiamond])
        });
    });
};

// exports.buyCopyCount = function(client,userId,type,copyId,cb){
//     checkRequire();
//     async.parallel([
//         function(cb1){
//             userDao.select(client,{id:userId},cb1)
//         },
//         function(cb1){
//             copyProgressDao.select(client,{userId:userId,copyType:type},cb1)
//         }
//     ],function(err,data){
//         if (err) return cb(err);
//         var userData = data[0],copyProgressData = data[1];
//         var resetCounts = copyUtils.getBuyCopyCount(copyProgressData,copyId);     //今日购买次数
//         var timesPerDay = copyUtils.getReTime(userData,copyProgressData,copyId,type);       //剩余次数
//         //if(timesPerDay > 0) return cb(getMsg(c_msgCode.haveChallenge));//还有挑战次数

//         var vip = 0;  // userData.vip || 0;
//         var costDiamond = 0;        // 购买次数所需钻石
//         switch (type){
//             case c_prop.copyTypeKey.equip:      //装备副本
//                 costDiamond = formula.calBuyEquip(resetCounts);
//                 break;
//             case c_prop.copyTypeKey.hell:      //Boss副本
//                 var vipExt = c_vip[vip].bossCount - c_vip[0].bossCount + timesPerDay;
//                 if(vipExt > 0) return cb(getMsg(c_msgCode.haveChallenge));//还有挑战次数
//                 var buyBossCount = c_vip[vip].buyBossCount;
//                 if(resetCounts > buyBossCount) return cb(getMsg(c_msgCode.overBuyTimes));//超过购买次数
//                 costDiamond = formula.calBuyBoss(resetCounts);
//                 break;
//             case c_prop.copyTypeKey.state:      //境界副本
//                 costDiamond = formula.calBuyRealm(resetCounts);
//                 break;
//             case c_prop.copyTypeKey.paTa:      //爬塔
//                 costDiamond = formula.calPaTaAward(resetCounts,userData.highPaTa);
//                 break; 
//         }
//         //判断被扣除钻石
//         if (userData.diamond < costDiamond) return cb(getMsg(c_msgCode.noDiamond));//钻石不足
//         //添加次数
//         copyProgressData.timesPerDay[copyId] = timesPerDay + 1;
//         copyProgressData.resetTime = new Date();
//         copyProgressData.resetCounts[copyId] = resetCounts;
//         //扣除钻石
//         userUtils.reduceDiamond(userData,costDiamond,consts.diamondConsumeType.user_5,"");

//         //需要更新的数据
//         var updateUserData = {
//             diamond:userData.diamond,
//             giveDiamond : userData.giveDiamond,
//             buyDiamond : userData.buyDiamond
//         };
//         var updateCopyData = {
//             resetTime:copyProgressData.resetTime,
//             timesPerDay : copyProgressData.timesPerDay,
//             resetCounts:copyProgressData.resetCounts,
//             refreshTime:copyProgressData.refreshTime
//         };
//         async.parallel([
//             function(cb2){
//                 userDao.update(client,updateUserData,{id:userId},cb2)
//             },
//             function(cb2){
//                 copyProgressDao.update(client,updateCopyData,{id:copyProgressData.id},cb2)
//             }
//         ],function(err,data2) {
//             if (err) return cb(err);
//             cb(null, [userData,copyProgressData,costDiamond])
//         });
//     });
// };


/**
 * 购买装备入场卷
 * @param client
 * @param userId
 * @param cb
 */
exports.buyEquipTessera = function(client, userId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var items = {};
        var itemsArr = [];
        var bagItems = {};
        var equipBagItems = {};
        var costDiamond = t_item[c_prop.spItemIdKey.equipTessera].price; //价格

        //判断被扣除钻石
        if (userData.diamond < costDiamond || costDiamond < 0) return cb(getMsg(c_msgCode.noDiamond)); //钻石不足
        //添加物品
        items[c_prop.spItemIdKey.equipTessera] = 1;
        itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.shop);
        //扣除钻石
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.buyEquipTessera, c_prop.spItemIdKey.equipTessera, 1);

        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);

        //需要更新的数据
        var updateData = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            prestige: userData.prestige
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        cb(null, [updateData, bagItems, equipBagItems, costDiamond])
    });
};

/**
 * 购买境界入场卷
 * @param client
 * @param userId
 * @param cb
 */
exports.buyRealmTessera = function(client, userId, cb) {
    checkRequire();
    //userDao.select(client,{id:userId},function(err,userData){
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var items = {};
        var itemsArr = [];
        var bagItems = {};
        var equipBagItems = {};
        var costDiamond = t_item[c_prop.spItemIdKey.realmTessera].price; //价格

        //判断被扣除钻石
        if (userData.diamond < costDiamond || costDiamond < 0) return cb(getMsg(c_msgCode.noDiamond)); //钻石不足
        //添加物品
        items[c_prop.spItemIdKey.realmTessera] = 1;
        itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.shop);
        //扣除钻石
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.buyRealmTessera, c_prop.spItemIdKey.realmTessera, 1);

        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);

        //需要更新的数据
        var updateData = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            //bag: userData.bag, 
            prestige: userData.prestige
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        cb(null, [updateData, bagItems, equipBagItems, costDiamond]);
    });
};


/**
 * 计算副本影响英雄
 * @param copyInfo
 * @param userData
 * @param heroList
 */
exports.calCopyHeroes = function(copyInfo, userData, heroList) {
    checkRequire();
    //英雄数据改变
    for (var i = 0; i < heroList.length; i++) {
        var heroData = heroList[i];
        //经验计算升级
        if (copyInfo.expc) {
            heroBiz.calAddExpc(heroData, copyInfo.expc, userData.lvl);
        }
    }
};


/**
 * 计算副本掉落
 * @param copyTemp
 * @param isWipe 是否扫荡
 * @returns {{}}
 */
exports.calCopyLootItems = function(copyTemp, isWipe) {
    checkRequire();

    var copyId = copyTemp.id;
    var lootInfo = t_copyLoot[copyId];
    var items = {};
    if (!lootInfo) return items;
    var lootItemArr = isWipe ? lootInfo.wipeItems : lootInfo.lootItems;
    if (lootItemArr) {
        for (var i = 0; i < lootItemArr.length; i++) {
            var locItemInfo = lootItemArr[i];
            var locItemId = locItemInfo[0];
            if (!locItemId) continue;
            var locRate = locItemInfo[1];
            var locMinCount = locItemInfo[2];
            var locMaxCount = locItemInfo[3];
            if (Math.random() * 10000 > locRate) continue;
            var locAddNum = 0 | (Math.random() * (locMaxCount - locMinCount + 1));
            locAddNum += locMinCount;
            if (locAddNum <= 0) continue;
            var locItemCount = items[locItemId] || 0;
            items[locItemId] = locItemCount + locAddNum;
        }
    }

    return items;
};

//副本开始
exports.start = function(client, userId, copyId, biCost, manyNum, cb) {
    checkRequire();
    biCost = parseInt(biCost);
    var t_copyData = t_copy[copyId];
    //深渊多倍进入
    manyNum = manyNum || 1;
    async.parallel([
        function(cb1) {
            //userDao.select(client,{id:userId},cb1)
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            exports.getInfo(client, userId, t_copyData.type, cb1)
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            copyProgressData = data[1];
        //判断次数

        // 引导副本id 2000 3000 只打一次,不受条件限制
        var isFree = false;
        if (copyId == 2000 || copyId == 3000) {

            var ex = userData.exData || {};
            ex[c_prop.userExDataKey.freeData] = ex[c_prop.userExDataKey.freeData] || {};
            if (!ex[c_prop.userExDataKey.freeData][copyId]) {
                ex[c_prop.userExDataKey.freeData][copyId] = 1;
                isFree = true;
                userData.exData = ex;
            } else {
                return cb(getMsg(c_msgCode.dungeonPass, copyId)); //cb("副本已通关:" + copyId);
            }
        } else if (t_copyData.type == c_prop.copyTypeKey.normal) {
            //普通boss ，重置连胜
            //判断连胜
            //if(copyProgressData.winningStreak<t_copyData.monsterCount) return cb("连胜条件没达到");}

            if (copyId == 1 || copyId == 100001) {
                if (copyProgressData.copyObj[2]) return cb(getMsg(c_msgCode.firstCopyError)); //第一个副本进度异常
            } else if (copyId >= 100002) {
                var preCopyId = commonUtils.getLastKey(copyProgressData.copyObj);
                if (copyId != preCopyId) {
                    return cb(getMsg(c_msgCode.copyAbnormal)); //副本进度异常
                }
            }
        } else if (t_copyData.type == c_prop.copyTypeKey.paTa) {
            var paTaOpen = c_open.paTa.lvlRequired;
            if (userData.lvl < paTaOpen) return cb(getMsg(c_msgCode.towerNotOpen), paTaOpen);
            if (userData.strength < t_copy[copyId].power) return cb(getMsg(c_msgCode.strengthUnenough));

            //领取当前关卡的奖励后才能挑战下一层 
            var section = c_game.towerCopy[0].split(","); //爬塔副本id区间
            if (copyId != section[0]) {
                var awardArr = copyProgressData.copyObj[copyId - 1] || []; //{copyId:[最低血量,是否领取],copyId:[最低血量,是否领取],.....}
                if (!awardArr[1] || awardArr[1] != 1) return cb(getMsg(c_msgCode.gerRewardFirst)); //请先领取关卡奖励！
            }
            if (!copyUtils.canDoPataCopyId(copyProgressData, copyId)) {
                copyUtils.fixPataCopyId(copyProgressData, gamePlayer);
                return cb(getMsg(c_msgCode.copyAbnormal));
            }
        } else {
            //开启条件
            /*0,或者空值:无条件
            1等级
            2普通副本通关
            3境界要求
            999不开启
            4VIP等级*/

            var conds = t_copyData.cond || [];
            for (var i = 0; i < conds.length; i++) {
                var locCond = conds[i] || [];
                var locType = locCond[0];
                var locValue = locCond[1];
                if (locType == 1) {
                    var lvl = userData.lvl;
                    if (locValue > lvl) return cb(getMsg(c_msgCode.noRoleLvl), locValue);
                }
                if (locType == 999) {
                    return cb(getMsg(c_msgCode.copyClose)); //副本暂未开启
                }
                // if(locType==4){
                //     var vip = userData.vip;
                //     if(locValue > vip) return cb("vip等级不足");
                //}
            }
            if (t_copyData.type == c_prop.copyTypeKey.vip21) {
                if (!userUtils.isMonthUser(userData)) {
                    return cb(getMsg(c_msgCode.copyOnlyMonthlyVip)); //月卡用户才能挑战该副本
                }
            }
            if (t_copyData.type == c_prop.copyTypeKey.vip7 || t_copyData.type == c_prop.copyTypeKey.vip10 || t_copyData.type == c_prop.copyTypeKey.vip14 ||
                t_copyData.type == c_prop.copyTypeKey.vip17 || t_copyData.type == c_prop.copyTypeKey.vip19 || t_copyData.type == c_prop.copyTypeKey.vip21) {
                var day = (new Date()).getDay();
                if (c_vipCopy[t_copyData.type].openWeek.indexOf(day) == -1) {
                    return cb(getMsg(c_msgCode.copyCloseToday)); //副本今日未开启
                }
            }
            if (t_copyData.type == c_prop.copyTypeKey.abyss) {
                if (!_canEnterSyCopy(userData)) {
                    return cb(getMsg(c_msgCode.soTired)); //你太疲劳了,请休息好再来挑战吧
                }
            }

            var vipRight = userUtils.getWeekCardRight(userData);
            //装备副本,消耗挑战次数
            var vipExt = 0;
            switch (t_copyData.type) {
                case c_prop.copyTypeKey.equip:
                    vipExt = c_vip[vipRight].equipCount - c_vip[0].equipCount;
                    break;
                case c_prop.copyTypeKey.hell:
                    vipExt = c_vip[vipRight].bossCount - c_vip[0].bossCount;
                    break;
                case c_prop.copyTypeKey.state:
                    vipExt = c_vip[vipRight].realmCount - c_vip[0].realmCount;
                    break;
                case c_prop.copyTypeKey.vip7:
                    vipExt = c_vip[vipRight].copyCountV7 - c_vip[0].copyCountV7;
                    break;
                case c_prop.copyTypeKey.vip10:
                    vipExt = c_vip[vipRight].copyCountV10 - c_vip[0].copyCountV10;
                    break;
                case c_prop.copyTypeKey.vip14:
                    vipExt = c_vip[vipRight].copyCountV14 - c_vip[0].copyCountV14;
                    break;
                case c_prop.copyTypeKey.vip17:
                    vipExt = c_vip[vipRight].copyCountV17 - c_vip[0].copyCountV17;
                    break;
                case c_prop.copyTypeKey.vip19:
                    vipExt = c_vip[vipRight].copyCountV19 - c_vip[0].copyCountV19;
                    break;
                case c_prop.copyTypeKey.vip21:
                    vipExt = c_vip[vipRight].copyCountV21 - c_vip[0].copyCountV21;
                    break;
                    // case c_prop.copyTypeKey.vip:
                    //     var copyVip  = copyUtils.getCopyVip(copyId);
                    //     if(copyVip==7 ) vipExt = c_vip[userData.vip].copyCountV7;
                    //     if(copyVip==10 ) vipExt = c_vip[userData.vip].copyCountV10;
                    //     if(copyVip==14 ) vipExt = c_vip[userData.vip].copyCountV14;
                    //     if(copyVip==17 ) vipExt = c_vip[userData.vip].copyCountV17;
                    //     if(copyVip==19 ) vipExt = c_vip[userData.vip].copyCountV19;
                    //     break;
            }
            var reNum = copyUtils.getReTime(userData, copyProgressData, copyId, t_copyData.type);
            if (reNum + vipExt <= 0) return cb(getMsg(c_msgCode.noFrequency)); //次数不足
        }

        var costDiamondRecord = [t_copyData.type];
        var needItemId = 0;
        if (isFree) {
            // free
            needItemId = 0;
        } else if (t_copyData.type == c_prop.copyTypeKey.equip) {
            //装备副本,装备入场券
            needItemId = c_prop.spItemIdKey.equipTessera;
        } else if (t_copyData.type == c_prop.copyTypeKey.hell) {
            //boss试炼副本,boss令牌
            var bossTessera = userData.bag[c_prop.spItemIdKey.bossTessera] || 0;
            var replaceCount = userUtils.getTodayCount(userData, c_prop.userRefreshCountKey.bossTesseraReplace); //获取今日替代令使用次数
            if (bossTessera > 0 || replaceCount >= c_game.bossTesseraReplace[1]) {
                needItemId = c_prop.spItemIdKey.bossTessera;
            } else {
                needItemId = c_prop.spItemIdKey.bossTesseraReplace;
            }
        } else if (t_copyData.type == c_prop.copyTypeKey.state) {
            //境界副本，入场券
            needItemId = c_prop.spItemIdKey.realmTessera;
        } else if (t_copyData.type == c_prop.copyTypeKey.abyss) {
            needItemId = c_prop.spItemIdKey.shenyuanTessera;
        }

        var delBagItems = {};
        var costObj = {}; //biLog消耗
        if (needItemId) {
            var ownNum = userData.bag[needItemId] || 0;
            var ownNumJudgment = 1;
            if (needItemId == c_prop.spItemIdKey.bossTesseraReplace) {
                ownNumJudgment = c_game.bossTesseraReplace[0];
            } else if (needItemId == c_prop.spItemIdKey.shenyuanTessera) {
                ownNumJudgment = 0;
                var syCopyCostArr = c_game.syCopyCfg[0].split(",");
                for (var i = 0; i < syCopyCostArr.length; i++) {
                    var tmpArr = syCopyCostArr[i].split(":")
                    if (parseInt(tmpArr[0]) == copyId) {
                        ownNumJudgment = parseInt(tmpArr[1]) * manyNum;
                    }
                }

                if (ownNumJudgment <= 0 || ownNum < ownNumJudgment) {
                    return cb(getMsg(c_msgCode.noTicket)); //门票不够
                }
            }
            if (ownNum < ownNumJudgment) {
                var needDiamond = t_item[needItemId].price;
                if (needItemId == c_prop.spItemIdKey.bossTesseraReplace) {
                    needDiamond = t_item[c_prop.spItemIdKey.bossTessera].price * (ownNumJudgment - ownNum);
                }
                //判断元宝
                if (userData.diamond < needDiamond || needDiamond < 0) return cb(getMsg(c_msgCode.noDiamond));
                costDiamondRecord[1] = needDiamond;
                biCost += needDiamond;

                userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, needDiamond, c_prop.diamondCostTypeKey.startToBuyTessera, needItemId, 1, t_copyData.type);
            } else {
                //深渊副本在结束后扣除门票
                if (needItemId != c_prop.spItemIdKey.shenyuanTessera) {
                    userUtils.delBag(userData, needItemId, ownNumJudgment, c_prop.itemCostTypeKey.copy);
                    delBagItems[needItemId] = ownNumJudgment;
                    costObj[needItemId] = ownNumJudgment;
                }
                if (needItemId == c_prop.spItemIdKey.bossTesseraReplace) userUtils.addTodayCount(userData, c_prop.userRefreshCountKey.bossTesseraReplace, 1); //添加今日替代令使用次数
            }
        }
        if (t_copyData.type == c_prop.copyTypeKey.paTa) {
            userUtils.costPataPower(userData, t_copy[copyId].power);
        }
        if (biCost > 0 && t_copyData.type == c_prop.copyTypeKey.hell && !isFree) costObj[c_prop.spItemIdKey.diamond] = biCost;
        if (t_copyData.type == c_prop.copyTypeKey.hell && !isFree) g_data.setBossCost(userId, costObj);

        if (t_copyData.type == c_prop.copyTypeKey.state) {
            activityBiz.recordCarnivalValue(client, userId, c_prop.carnivalTaskTypeKey.state, 1, function() {});
        } else if (t_copyData.type == c_prop.copyTypeKey.abyss) {
            activityBiz.recordCarnivalValue(client, userId, c_prop.carnivalTaskTypeKey.abyssNum, manyNum, function() {});
            g_data.setabyssStartTime(userId, new Date());
        } else if (t_copyData.type == c_prop.copyTypeKey.hell) {
            activityBiz.recordCarnivalValue(client, userId, c_prop.carnivalTaskTypeKey.hellCopyWipeNum, 1, function() {});
        }

        var updateUser = {
            diamond: userData.diamond,
            giveDiamond: userData.giveDiamond,
            buyDiamond: userData.buyDiamond,
            counts: userData.counts,
            countsRefreshTime: userData.countsRefreshTime,
            exData: userData.exData,
            strength: userData.strength,
            strengthReTime: userData.strengthReTime
        };

        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(delBagItems));

        var updateCopyProgress = {
            winningStreak: copyProgressData.winningStreak
        };

        g_data.setPkEnemyId(userId, copyId);

        async.parallel([
            function(cb1) {
                copyProgressDao.update(client, updateCopyProgress, {
                    userId: userId,
                    copyType: t_copyData.type
                }, cb1);
            }
        ], function(err, data) {
            if (err) return cb(err);
            var copyLoot = fightBiz.getAndInitNextLoot(userId, copyId, true, userData.lvl, false, false, manyNum);

            var keys = Object.keys(copyLoot);
            var lastKey = keys[keys.length - 1];            
            g_copyFight.newData(userId, lastKey, t_copyData.type, manyNum);
            var vData = [];
            cb(null, [updateUser, updateCopyProgress, copyLoot, vData, delBagItems, costDiamondRecord]);
        });
    });
};

//副本结束
exports.end = function(client, userId, copyId, isWin, fightData, cb) {
    checkRequire();
    var star = fightData[dsConsts.FightData.star] || 0;
    var t_copyData = t_copy[copyId];

    var oldKey = g_data.getPkEnemyId(userId);
    if (oldKey != copyId) return cb(getMsg(c_msgCode.invalidData)); //无效的数据

    g_data.setPkEnemyId(userId, -111);

    var g_fightData = g_copyFight.getData(userId, t_copyData.type);
    if (!g_fightData) return cb(getMsg(c_msgCode.noData)); //无数据，验证失败
    var lootUID = g_fightData[0];
    if (!lootUID) return cb(getMsg(c_msgCode.noData)); //无数据，验证失败
    //深渊多倍进入次数
    var manyNum = g_fightData[2];

    var isFree = false;
    if (copyId == 2000 || copyId == 3000) {
        isFree = true;
    }
    //todo 校验战斗数据
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            exports.getInfo(client, userId, t_copyData.type, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            copyProgressData = data[1];
        //如果是深渊副本，结束后扣除门票
        var ownNumJudgment = 0;
        var delBagItems = {};
        if (t_copyData.type == c_prop.copyTypeKey.abyss) {
            var syCopyCostArr = c_game.syCopyCfg[0].split(",");
            for (var i = 0; i < syCopyCostArr.length; i++) {
                var tmpArr = syCopyCostArr[i].split(":")
                if (parseInt(tmpArr[0]) == copyId) {
                    ownNumJudgment = parseInt(tmpArr[1]) * manyNum;
                }
            }
            userUtils.delBag(userData, c_prop.spItemIdKey.shenyuanTessera, ownNumJudgment, c_prop.itemCostTypeKey.copy);
            delBagItems[c_prop.spItemIdKey.shenyuanTessera] = ownNumJudgment;
        }
        // var bossObj = new BossObj();
        // bossObj.type = c_prop.biLogTypeKey.boss;
        // bossObj.serverId = userData.serverId;
        // bossObj.accountId = userData.accountId;
        // bossObj.userId = userData.id;
        // bossObj.nickName = userData.nickName;
        // bossObj.happenTime = (new Date()).toFormat("YYYY-MM-DD HH24:MI:SS");
        // bossObj.getObj = {};
        // var costObj = g_data.getBossCost(userId);
        // bossObj.costObj = costObj;
        // bossObj.bossId = copyId;  /** 挑战bossId **/
        // bossObj.isWin = isWin?1:0;  /** 挑战是否胜利 **/
        if (!isWin) {
            if (isFree) return cb(null, [null, null]);
            //  if(t_copyData.type==c_prop.copyTypeKey.hell && !isFree) biBiz.bossBi(JSON.stringify(bossObj)); 
            var bagItems = {};
            var vipExt = 0;
            var vipRight = userUtils.getWeekCardRight(userData);
            var needItemId;

            var restoreNum = 0; //返还门票数量
            switch (t_copyData.type) {
                case c_prop.copyTypeKey.paTa:
                    if (!copyUtils.canDoPataCopyId(copyProgressData, copyId)) {
                        return cb(null, [null, null]);
                    }
                    if (!copyProgressData.copyObj[copyId]) copyProgressData.copyObj[copyId] = [];
                    var residueHp = fightData[dsConsts.FightData.residueHp] || 0;
                    var nowResidueHp = copyProgressData.copyObj[copyId][0] || t_monster[t_copy[copyId].bossID].maxHp;
                    if (residueHp <= 0) residueHp = 1;
                    if (residueHp && residueHp < nowResidueHp) {
                        exports.setPaTaResidueHp(client, userId, copyId, residueHp, function() {}); //记录最低血量
                    }
                    userData.strength += t_copy[copyId].power - 1;
                    gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
                    var updateUserData = {
                        strength: userData.strength,
                        strengthReTime: userData.strengthReTime
                    };
                    return cb(null, [updateUserData, null]);
                    break;
                case c_prop.copyTypeKey.abyss:
                    //深渊副本 失败时返还4/5门票
                    var needItemNum = 0;
                    needItemId = c_prop.spItemIdKey.shenyuanTessera;
                    var syCopyCostArr = c_game.syCopyCfg[0].split(",");
                    for (var i = 0; i < syCopyCostArr.length; i++) {
                        var tmpArr = syCopyCostArr[i].split(":")
                        if (parseInt(tmpArr[0]) == copyId) {
                            needItemNum = parseInt(tmpArr[1]) * manyNum;
                            break;
                        }
                    }
                    if (needItemNum > 0) {
                        restoreNum = Math.floor(needItemNum * 4 / 5); //返回数量=该关需要数量*4/5向下取整
                    }
                    break;
                    //经验试炼和金币试炼失败时，别扣试炼券，改成扣关卡次数
                case c_prop.copyTypeKey.hell:
                    vipExt = c_vip[vipRight].bossCount - c_vip[0].bossCount;
                    //boss试炼副本,boss令牌
                    needItemId = c_prop.spItemIdKey.bossTessera;
                    restoreNum = 1;
                    break;
                case c_prop.copyTypeKey.state:
                    vipExt = c_vip[vipRight].realmCount - c_vip[0].realmCount;
                    //经验试炼副本，入场券
                    needItemId = c_prop.spItemIdKey.realmTessera;
                    restoreNum = 1;
                    break;
            }

            if (t_copyData.type == c_prop.copyTypeKey.hell || t_copyData.type == c_prop.copyTypeKey.state || t_copyData.type == c_prop.copyTypeKey.abyss) {
                var restoreItems = {};
                restoreItems[needItemId] = restoreNum;
                var itemsArr = userUtils.saveItems(userData, restoreItems, c_prop.itemGetTypeKey.pickLoot);
                if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
                gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems));
                if (t_copyData.type == c_prop.copyTypeKey.abyss) {
                    return cb(null, [{}, {}, bagItems, {}, {}, {}, {}, {}, delBagItems]);
                }
                //经验试炼和金币试炼 失败也扣关卡次数
                var reNum = copyUtils.getReTime(userData, copyProgressData, copyId, t_copyData.type);
                if (reNum + vipExt <= 0 && !isFree) return cb(getMsg(c_msgCode.noFrequency)); //次数不足
                if (!isFree) {
                    copyUtils.setTimesPerDay(copyProgressData, copyId, reNum - 1);
                }
                var updateCopyProgress = {
                    timesPerDay: copyProgressData.timesPerDay,
                    refreshTime: copyProgressData.refreshTime
                };
                return copyProgressDao.update(client, updateCopyProgress, {
                    userId: userId,
                    copyType: t_copyData.type
                }, function() {
                    cb(null, [{}, updateCopyProgress, bagItems]);
                })
            }
            return cb(null, [null, null]);
        }

        var heroTempId = 0;
        if (t_copyData.type == c_prop.copyTypeKey.normal) {
            copyProgressData.winningStreak = 0;

            //普通boss ，自动下一个副本
            // if (copyId == 999) {
            //     copyProgressData.copyObj[10001] = 1;
            // } else {
            //     copyProgressData.copyObj[copyId + 1] = 1;
            // }
            copyProgressData.copyObj = {}
            copyProgressData.copyObj[copyId + 1] = 1;
            gameCommonBiz.calHighCopyId(client, userData.nickName, copyId, function() {});

            heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.normalBoss, 1);
            //第一个%s：玩家名
            //第二个%s：普通副本名
            // chatBiz.addSysData(16,[userData.nickName,t_copyData.name,copyId]);

            //击败关卡boss副本Id（委托任务）
            taskBiz.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.normalBoss, copyId, function() {});
        } else if (t_copyData.type == c_prop.copyTypeKey.paTa) {
            if (!copyUtils.canDoPataCopyId(copyProgressData, copyId)) {
                // 校正highPata
                copyUtils.fixPataCopyId(copyProgressData, gamePlayer);
                return cb(null, [null, null]);
            }

            var towerIndex = _getTowerIndex(copyId);
            if (t_copyData.friend) {
                heroTempId = parseInt(t_copyData.friend) || 0;
                // userData.heroData[heroTempId] = { t:Math.floor(Date.now()/1000)};
                userBiz.initHeroStar(userData, heroTempId, function() {});

                // heroBiz.activeHeroTask(userData.id, heroTempId);
                chatBiz.addSysData(134, [userData.nickName, towerIndex, t_hero[heroTempId].name + '-' + t_hero[heroTempId].note]);
            }
            if (towerIndex == 1) {
                chatBiz.addSysData(115, [userData.nickName]);
            }
            if (!copyProgressData.copyObj[copyId]) {
                copyProgressData.copyObj[copyId] = [];
            }
            copyProgressData.copyObj[copyId][0] = -1;

            taskBiz.setTaskValue(client, userId, c_prop.cTaskTypeKey.passPataNum, 1, function() {});
            //经验塔层数（紧急委托任务）
            taskBiz.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.passPata, copyId, function() {});
        } else {
            //装备副本,消耗挑战次数
            var vipExt = 0;
            var vipRight = userUtils.getWeekCardRight(userData);
            switch (t_copyData.type) {
                case c_prop.copyTypeKey.equip:
                    vipExt = c_vip[vipRight].equipCount - c_vip[0].equipCount;
                    break;
                case c_prop.copyTypeKey.hell:
                    vipExt = c_vip[vipRight].bossCount - c_vip[0].bossCount;
                    break;
                case c_prop.copyTypeKey.state:
                    vipExt = c_vip[vipRight].realmCount - c_vip[0].realmCount;
                    break;
                case c_prop.copyTypeKey.vip7:
                    vipExt = c_vip[vipRight].copyCountV7 - c_vip[0].copyCountV7;
                    break;
                case c_prop.copyTypeKey.vip10:
                    vipExt = c_vip[vipRight].copyCountV10 - c_vip[0].copyCountV10;
                    break;
                case c_prop.copyTypeKey.vip14:
                    vipExt = c_vip[vipRight].copyCountV14 - c_vip[0].copyCountV14;
                    break;
                case c_prop.copyTypeKey.vip17:
                    vipExt = c_vip[vipRight].copyCountV17 - c_vip[0].copyCountV17;
                    break;
                case c_prop.copyTypeKey.vip19:
                    vipExt = c_vip[vipRight].copyCountV19 - c_vip[0].copyCountV19;
                    break;
                case c_prop.copyTypeKey.vip21:
                    vipExt = c_vip[vipRight].copyCountV21 - c_vip[0].copyCountV21;
                    break;
                    // case c_prop.copyTypeKey.vip:
                    //     var copyVip  = copyUtils.getCopyVip(copyId);
                    //     if(copyVip==7 ) vipExt = c_vip[userData.vip].copyCountV7;
                    //     if(copyVip==10 ) vipExt = c_vip[userData.vip].copyCountV10;
                    //     if(copyVip==14 ) vipExt = c_vip[userData.vip].copyCountV14;
                    //     if(copyVip==17 ) vipExt = c_vip[userData.vip].copyCountV17;
                    //     if(copyVip==19 ) vipExt = c_vip[userData.vip].copyCountV19;
                    //     break;
            }
            var reNum = copyUtils.getReTime(userData, copyProgressData, copyId, t_copyData.type);
            if (reNum + vipExt <= 0 && !isFree) return cb(getMsg(c_msgCode.noFrequency)); //次数不足
            if (t_copyData.type == c_prop.copyTypeKey.hell || t_copyData.type == c_prop.copyTypeKey.state) {
                heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.goldOrExpCopyNum, 1);
            } else if (t_copyData.type == c_prop.copyTypeKey.vip7 || t_copyData.type == c_prop.copyTypeKey.vip10 ||
                t_copyData.type == c_prop.copyTypeKey.vip14 || t_copyData.type == c_prop.copyTypeKey.vip17 ||
                t_copyData.type == c_prop.copyTypeKey.vip19 || t_copyData.type == c_prop.copyTypeKey.vip21) {
                heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.materialsCopyNum, 1);
            }
            if (!isFree) {
                copyUtils.setTimesPerDay(copyProgressData, copyId, reNum - 1);
                //报系统消息
                var userFirstData = userData.exData[c_prop.userExDataKey.firstData] || {};
                switch (t_copyData.type) {
                    case c_prop.copyTypeKey.equip:
                        if (!userFirstData[c_prop.firstDataKey.equipCopy]) {
                            chatBiz.addSysData(112, [userData.nickName, t_monster[t_copyData.bossID].name]); //第一次装备副本胜利
                            userFirstData[c_prop.firstDataKey.equipCopy] = 1;
                        }
                        break;
                    case c_prop.copyTypeKey.state:
                        if (!userFirstData[c_prop.firstDataKey.stateCopy]) {
                            chatBiz.addSysData(111, [userData.nickName]); //第一次符文副本胜利
                            userFirstData[c_prop.firstDataKey.stateCopy] = 1;
                        }
                        //记录经验试炼副本id（紧急委托任务）
                        taskBiz.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.stateCopy, copyId, function() {});
                        activityBiz.recordLachelFitnessValue(client,userId, c_prop.lachelActTaskTypeKey.stateNum, 1, null, function(){});
                        break;
                    case c_prop.copyTypeKey.hell:
                        if (!userFirstData[c_prop.firstDataKey.hellCopy]) {
                            chatBiz.addSysData(114, [userData.nickName]); //第一次幻境副本胜利
                            userFirstData[c_prop.firstDataKey.hellCopy] = 1;
                        }
                        //记录金币试炼副本id（紧急委托任务）
                        taskBiz.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.hellCopy, copyId, function() {});
                        activityBiz.recordLachelFitnessValue(client,userId, c_prop.lachelActTaskTypeKey.hellNum, 1, null, function(){});
                        break;
                }
                userData.exData[c_prop.userExDataKey.firstData] = userFirstData;

            }
            //copyProgressData.refreshTime = new Date();
            var oldStar = copyProgressData.copyStar[copyId] || 0;
            if (star > oldStar) copyProgressData.copyStar[copyId] = star;
        }

        if (t_copyData.type == c_prop.copyTypeKey.abyss) {
            // 处理深渊副本商人逻辑
            _endCopySyDataFatigue(userData, isWin, manyNum);
            heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.abyssWinNum, manyNum);
            taskBiz.setTaskValue(client, userId, c_prop.cTaskTypeKey.SYCopyNum, manyNum, function() {});
            //深渊通过XX级（紧急委托任务）
            taskBiz.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.passAbyss, copyId, function() {});
            activityBiz.recordLachelFitnessValue(client,userId, c_prop.lachelActTaskTypeKey.abyssNum, manyNum, null, function(){});
            taskBiz.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.abyssNum, manyNum, function() {});
            activityBiz.recordTurntableValue(client, userId, c_prop.turntableTypeKey.abyssNum, manyNum, null, function() {});
        }

        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);

        //更新
        var updateCopyProgress = {
            winningStreak: copyProgressData.winningStreak,
            copyObj: copyProgressData.copyObj,
            timesPerDay: copyProgressData.timesPerDay,
            refreshTime: copyProgressData.refreshTime,
            copyStar: copyProgressData.copyStar
        };

        async.parallel([
            function(cb1) {
                fightBiz.pickLoot(client, userId, [
                    [copyId, lootUID, true]
                ], true, manyNum, cb1);
            },
            function(cb1) {
                copyProgressDao.update(client, updateCopyProgress, {
                    userId: userId,
                    copyType: t_copyData.type
                }, cb1)
            },
            function(cb1) {
                _addAct(client, userId, userData.nickName, t_copyData.type, cb1);
            }
        ], function(err, data) {
            if (err) return cb(err);
            // console.error('------ccccccc------- -----ccccccc------------ccccccc------------ccccccc------');
            var updateUser = data[0][0];

            var bagItems = data[0][2];
            var equipBagItems = data[0][3];
            var getDiamond = data[0][4];
            var mailItems = data[0][5];
            g_copyFight.delData(userId, t_copyData.type);

            // bossObj.getObj = bagItems;
            // if(t_copyData.type==c_prop.copyTypeKey.hell && !isFree) biBiz.bossBi(JSON.stringify(bossObj));
            // console.error('------ccccccc------------ccccccc------------ccccccc------------ccccccc------',t_copyData.type,c_prop.copyTypeKey.abyss);
            if (t_copyData.type == c_prop.copyTypeKey.abyss) {
                updateUser.exData = userData.exData;

                // 系统通知 深渊副本
                var itemIdArr = Object.keys(bagItems || {});
                var itemIdArr2 = Object.keys(equipBagItems || {});
                var itemIdArr3 = Object.keys(mailItems || {});

                //屏蔽深渊门票、深渊卡箱、深渊魔石、传承精华、史莱姆糖果
                var ignoreItemIds = ['2007', '2015', '950', '39', '56'];
                var ignoreItemIds2 = ['2007', '2015', '950', '39', '56'];
                // console.error('------dddddddddddddddddc------',itemIdArr,itemIdArr2);
                itemIdArr.forEach(function(itemId) {
                    if (ignoreItemIds.indexOf(itemId) < 0) {
                        // 获得物品的公告
                        chatBiz.addSysData(149, [userData.nickName, t_item[itemId].color, t_item[itemId].name]);
                        chatBiz.addSysData(155, [userData.nickName, t_item[itemId].color, t_item[itemId].name]);
                    }
                    if (ignoreItemIds2.indexOf(itemId) < 0) {
                        //掉落记录
                        // console.error('------itemIdArr-------',userData.nickName, c_prop.copyTypeKey.abyss, t_copyData.bossID, itemId);
                        exports.addCopyLootRecord(client, userId, userData.nickName, c_prop.copyTypeKey.abyss, t_copyData.bossID, itemId);
                    }
                });

                itemIdArr2.forEach(function(equipId) {
                    var itemId = equipBagItems[equipId][0];
                    // 获得物品的公告equipBagItems
                    chatBiz.addSysData(149, [userData.nickName, t_item[itemId].color, t_item[itemId].name]);
                    chatBiz.addSysData(155, [userData.nickName, t_item[itemId].color, t_item[itemId].name]);
                    //掉落记录
                    // console.error('------itemIdArr2-------',userData.nickName, c_prop.copyTypeKey.abyss, t_copyData.bossID, itemId);
                    exports.addCopyLootRecord(client, userId, userData.nickName, c_prop.copyTypeKey.abyss, t_copyData.bossID, itemId);
                });

                itemIdArr3.forEach(function(itemId) {
                    chatBiz.addSysData(149, [userData.nickName, t_item[itemId].color, t_item[itemId].name]);
                    chatBiz.addSysData(155, [userData.nickName, t_item[itemId].color, t_item[itemId].name]);
                    exports.addCopyLootRecord(client, userId, userData.nickName, c_prop.copyTypeKey.abyss, t_copyData.bossID, itemId);
                });

                var abStartTime = g_data.getabyssStartTime(userId);
                if (abStartTime) {
                    var stTime = Math.floor(abStartTime.getTime() / 1000);
                    var cuTime = Math.floor((new Date()).getTime() / 1000);
                    var oObj = new ossObj.ossBoss(stTime, c_prop.copyTypeKey.abyss, copyId, stTime, cuTime, cuTime, 1, userData.combat, 0);
                    ossBiz.WriteOss(oObj);
                }
            }
            if (t_copyData.type != c_prop.copyTypeKey.normal) updateUser.heroData = userData.heroData;
            var actData = data[2];
            var guildData = actData[0];
            var guildPersonalData = actData[1];

            cb(null, [updateUser, updateCopyProgress, bagItems, equipBagItems, guildData, guildPersonalData, getDiamond, heroTempId, delBagItems]);
        });
    });

};

//=============================================掉落记录===========================================================

//掉落记录缓存
var copyLootRecordListCache = [];
/**
 * 增加BOSS掉落记录
 * @param id
 * @param args
 */
exports.addCopyLootRecord = function(client, userId, userName, copyType, bossId, itemId) {
    //bossId 填0 代表是深渊商人
    checkRequire();
    var color = t_item[itemId].color;
    //需要记录的物品品阶配置
    var itemColorCfg = [6, 7, 8, 9];
    if (itemColorCfg.indexOf(color) > -1) {
        //2018-05-03 13:21:27  张三 在 秘境BOSS 击败了  XXX 爆出 XXXXX
        var recordEntity = new CopyLootRecordEntity();
        recordEntity.userId = userId;
        recordEntity.userName = userName;
        recordEntity.copyType = copyType;
        recordEntity.bossId = bossId;
        recordEntity.itemId = itemId;
        recordEntity.lootTime = new Date();
        // console.error('=====================addCopyLootRecord=======================',recordEntity);

        copyLootRecordListCache.push(recordEntity);
        if (copyLootRecordListCache.length > 50) {
            copyLootRecordListCache.shift();
        }
        copyLootRecordDao.insert(client, recordEntity, function(err, newRecord) {
            // if (err) return cb(err);
            // recordEntity.id = newRecord.insertId;
        });
    }

    // async.series([
    //     function(cb1){
    //         copyLootRecordListCache.push(recordEntity);
    //     },
    //     function(cb1){
    //         copyLootRecordDao.insert(client, recordEntity ,function(err, newRecord){
    //             if (err) return cb(err);
    //             recordEntity.id = newRecord.insertId;
    //             console.error('======newRecord===',newRecord);

    //         });
    //     }
    // ],function(err,data){
    //     if (err) return cb(err);
    //     console.error('=====================recordEntity333=======================',recordEntity);
    // });
};

/**
 * 获取列表
 * @returns [ds.ChatData]
 */
exports.getCopyLootRecordList = function(client, cb) {
    checkRequire();
    //初步思路 缓存里有50条取缓存里的  缓存里不足50条则取数据库里的
    if (copyLootRecordListCache.length >= 50) {
        var tempArr = copyLootRecordListCache.slice(0);
        tempArr.reverse();
        return cb(null, tempArr);
    }
    copyLootRecordDao.list(client, '1=1 order by id desc limit 50', [], function(err, dataList) {
        if (err) return cb(err);
        // dataList.reverse();
        cb(null, dataList);
    });
};
//========================================================================================================================

//普通推图副本领取奖励
exports.normalAward = function(client, userId, copyId, cb) {
    checkRequire();
    var t_copyData = t_copy[copyId];
    if (t_copyData.type != c_prop.copyTypeKey.normal || !t_copyData.friend) return cb(getMsg(c_msgCode.abnormalData)); //数据异常");
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            copyProgressDao.select(client, {
                userId: userId,
                copyType: c_prop.copyTypeKey.normal
            }, cb1)
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            copyProgressData = data[1];

        var maxPassCopyId = commonUtils.getLastKey(copyProgressData.copyObj) || 100001;
        maxPassCopyId = parseInt(maxPassCopyId);
        // if (!copyProgressData.copyObj[copyId]) return cb(getMsg(c_msgCode.copyNotPass)); //还未通关该关卡
        // console.error("copyId===>maxPassCopyId",copyId , maxPassCopyId);
        if (maxPassCopyId <= copyId) return cb(getMsg(c_msgCode.copyNotPass)); //还未通关该关卡
        var isPickAward = copyProgressData.isPickAward || [0];
        if (isPickAward[0] >= copyId) return cb(getMsg(c_msgCode.hasReceivedReward)); //已领取过该奖励！
        // 解救小伙伴或世界boss宝箱 发给用户邮件 
        var items = {};
        var getDiamond = 0;
        var bagItems = {};
        var equipBagItems = {};
        var heroTempId = 0;

        var its = t_copyData.friend.toString().indexOf(",");
        if (its > -1) { //获得物品
            items = commonUtils.strToArrInArr(t_copyData.friend);
            items = commonUtils.kvArr2KvObj(items);

            if (items[c_prop.spItemIdKey.diamond]) getDiamond = items[c_prop.spItemIdKey.diamond];
            var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.copy);
            if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
            if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);
            // mailBiz.addByType(client, userId, c_prop.mailTypeKey.worldMapCopy, [t_copyData.name], items, function(){});
        } else { // 解锁伙伴（只解锁一个)
            heroTempId = parseInt(t_copyData.friend) || 0;
            if (heroTempId == 101 && userData.heroData[heroTempId]) { //创号时若选的是101 则激活1
                heroTempId = 1;
            }
            if (heroTempId > 0 && !userData.heroData[heroTempId]) {
                userBiz.initHeroStar(userData, heroTempId, function() {});
                //关卡解救小伙伴
                //console.log('asdasdasdasda',t_copy[copyId].name, t_hero[heroTempId].name+'-'+t_hero[heroTempId].note);
                chatBiz.addSysData(107, [userData.nickName, t_copy[copyId].name, t_hero[heroTempId].name + '-' + t_hero[heroTempId].note]);
            }
        }

        //改变状态
        isPickAward[0] = copyId;
        copyProgressData.isPickAward = isPickAward;

        //需要更新的数据
        var updateData = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            heroNum: userData.heroNum,
            heroData: userData.heroData
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));
        var updateCopyData = {
            copyObj: copyProgressData.copyObj,
            isPickAward: copyProgressData.isPickAward
        };
        async.parallel([
            // function(cb1){
            //     userDao.update(client,updateData,{id:userId},cb1)
            // },
            function(cb1) {
                copyProgressDao.update(client, updateCopyData, {
                    id: copyProgressData.id
                }, cb1)
            }
        ], function(err, data2) {
            if (err) return cb(err);
            var heroData = userData.heroData;
            cb(null, [userData, copyProgressData, bagItems, equipBagItems, getDiamond, heroTempId, heroData])
        });
    });
};

//记录爬塔最低血量
exports.setPaTaResidueHp = function(client, userId, copyId, residueHp, cb) {
    checkRequire();
    copyProgressDao.selectCols(client, " id,copyObj ", " userId = ? and copyType = ?", [userId, c_prop.copyTypeKey.paTa], function(err, copyProgressData) {
        if (err) return cb(err);
        if (!copyProgressData.copyObj[copyId]) copyProgressData.copyObj[copyId] = [];
        copyProgressData.copyObj[copyId][0] = residueHp;
        copyProgressDao.update(client, {
            copyObj: copyProgressData.copyObj
        }, {
            id: copyProgressData.id
        }, cb);
    });
};

var _addAct = function(client, userId, nickName, copyType, cb) {
    switch (copyType) {
        // case c_prop.copyTypeKey.equip:
        //     guildBiz.guildGrown(client, userId, nickName, 2, cb);  
        //     break;
        case c_prop.copyTypeKey.hell:
            guildBiz.guildGrown(client, userId, nickName, 4, cb);
            break;
        case c_prop.copyTypeKey.state:
            guildBiz.guildGrown(client, userId, nickName, 3, cb);
            break;
        default:
            cb(null, [null, null]);
            break;
    }
};

/**
 * 更新连胜
 * @param client
 * @param userId
 * @param copyId
 * @param cb
 */
exports.updateWinningStreak = function(client, userId, copyId, cb) {
    checkRequire();
    var t_copyData = t_copy[copyId];
    var copyType = t_copyData.type;
    copyProgressDao.select(client, {
        userId: userId,
        copyType: copyType
    }, function(err, copyProgressData) {
        if (err) return cb(err);
        //普通副本，连胜+
        var updateCopyProgress = null;
        if (copyType == c_prop.copyTypeKey.normal) {
            if (copyProgressData.winningStreak < t_copyData.monsterCount) {
                copyProgressData.winningStreak++;
                updateCopyProgress = {
                    winningStreak: copyProgressData.winningStreak
                };
            }
        }
        if (!updateCopyProgress) return cb(null, updateCopyProgress);

        copyProgressDao.update(client, updateCopyProgress, {
            id: copyProgressData.id
        }, function(err, data) {
            if (err) return cb(err);
            cb(null, updateCopyProgress);
        });

    });
};

/**
 * 更新连胜
 * @param client
 * @param userId
 * @param copyId
 * @param cb
 */
exports.setRead = function(client, userId, copyId, cb) {
    checkRequire();
    var t_copyData = t_copy[copyId];
    var copyType = t_copyData.type;
    copyProgressDao.select(client, {
        userId: userId,
        copyType: copyType
    }, function(err, copyProgressData) {
        if (err) return cb(err);
        copyProgressData.readObj[copyId] = 1;
        var updateCopyProgress = {
            readObj: copyProgressData.readObj
        };
        copyProgressDao.update(client, updateCopyProgress, {
            id: copyProgressData.id
        }, function(err, data) {
            if (err) return cb(err);
            cb(null, updateCopyProgress);
        });

    });
};

//公会副本开始
exports.guildStart = function(client, userId, copyId, bossId, cb) {
    checkRequire();
    bossId = parseInt(bossId);
    var type = c_prop.copyTypeKey.guild;
    if (!t_guildCopy[copyId] || !t_guildCopyBoss[bossId]) return cb(getMsg(c_msgCode.abnormalData)); //数据异常");
    var section = t_guildCopy[copyId].section;
    if (bossId < section[0] || bossId > section[1]) return cb(getMsg(c_msgCode.abnormalData)); //数据异常");
    async.parallel([

        function(cb1) {
            exports.getInfo(client, userId, type, cb1);
        },
        function(cb1) {
            guildPersonalDao.selectCols(client, " guildId ", {
                userId: userId
            }, cb1);
        },
        function(cb1) {
            userDao.selectCols(client, " nickName ", {
                id: userId
            }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var copyProgressData = data[0],
            mPersonalData = data[1],
            userData = data[2];

        var refreshTime = copyProgressData.refreshTime;
        var guildData = g_guild.getGuild(mPersonalData.guildId);
        if (!guildData) return cb(getMsg(c_msgCode.outGuildBoss));
        if (!guildData.guildCopyData) guildData.guildCopyData = {};
        //开启条件
        var openLvl = t_guildCopy[copyId].openLvl;
        if (openLvl > guildData.lvl) return cb(getMsg(c_msgCode.allianceNonstandard)); //行会等级不足!
        var needProgress = c_game.guildCopyCfg[2];
        for (var i = section[0]; i <= section[1]; i++) {
            if (bossId > i) {
                if (!guildData.guildCopyData[i]) return cb(getMsg(c_msgCode.lastGildCopyNotOver)); //上一个公会副本进度还未完成
                var progress1 = guildData.guildCopyData[i][0] || 0;
                if (progress1 < needProgress) return cb(getMsg(c_msgCode.lastGildCopyNotOver)); //上一个公会副本进度还未完成
            }
        }
        //判断当前进度
        if (!guildData.guildCopyData[bossId]) guildData.guildCopyData[bossId] = [];
        var progress2 = guildData.guildCopyData[bossId][0] || 0;
        if (progress2 >= needProgress) return cb(getMsg(c_msgCode.cannotCallengeAgain)); //该副本被通关，不可继续挑战！


        //消耗挑战次数
        //var vipExt = c_vip[userData.vip].guildFbCount - c_vip[0].guildFbCount;
        //var reNum = copyUtils.getReTime(userData,copyProgressData,bossId,type);
        //if(reNum+vipExt<=0) return cb(getMsg(c_msgCode.noFrequency));//次数不足

        //判断cd
        var pCopyId = copyProgressData.pCopyId || 0; //cd秒数
        if (refreshTime) {
            //判断cd
            var timeLimit = c_game.guildCopyCfg[3];
            var second = (new Date().getTime() - refreshTime.getTime()) / 1000;
            if (pCopyId >= timeLimit) {
                if (second < pCopyId) return cb(getMsg(c_msgCode.waiting)); //等待中！
                //if ((pCopyId - second) > timeLimit) return cb("CD中！");
            }
        }

        g_data.setPkEnemyId(userId, copyId + "" + bossId);


        cb(null, []);
    });
};

//公会副本结束
exports.guildEnd = function(client, userId, copyId, bossId, isWin, cb) {
    checkRequire();
    isWin = isWin ? 1 : 0;
    /** 挑战是否胜利 **/
    var nowTime = new Date();
    var type = c_prop.copyTypeKey.guild;
    if (!t_guildCopy[copyId] || !t_guildCopyBoss[bossId]) return cb(getMsg(c_msgCode.abnormalData)); //数据异常");
    var section = t_guildCopy[copyId].section;
    if (bossId < section[0] || bossId > section[1]) return cb(getMsg(c_msgCode.abnormalData)); //数据异常");
    var index = parseInt(bossId) - parseInt(section[0]) + 1;


    var oldKey = g_data.getPkEnemyId(userId);
    var mKey = copyId + "" + bossId;
    if (oldKey != mKey) return cb(getMsg(c_msgCode.invalidData)); //无效的数据

    //todo 校验伤害数据
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            exports.getInfo(client, userId, type, cb1);
        },
        function(cb1) {
            guildPersonalDao.selectCols(client, " guildId ", {
                userId: userId
            }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            copyProgressData = data[1],
            mPersonalData = data[2];

        var refreshTime = copyProgressData.refreshTime; //最后通关副本时间
        var guildData = g_guild.getGuild(mPersonalData.guildId);
        if (!guildData) return cb(null, [{}, {}, {}, {}, {}, 0, 0, 0, {}, getMsg(c_msgCode.outGuildBoss)]);
        if (!guildData.guildCopyData) guildData.guildCopyData = {};
        //开启条件
        var openLvl = t_guildCopy[copyId].openLvl;
        if (openLvl > guildData.lvl) return cb(null, [{}, {}, {}, {}, {}, 0, 0, 0, {}, getMsg(c_msgCode.allianceNonstandard)]); //行会等级不足!
        var needProgress = c_game.guildCopyCfg[2];
        for (var i = section[0]; i <= section[1]; i++) {
            if (bossId > i) {
                if (!guildData.guildCopyData[i]) return cb(null, [{}, {}, {}, {}, {}, 0, 0, 0, {}, "上一个boss进度还未完成"]);
                var progress1 = guildData.guildCopyData[i][0] || 0;
                if (progress1 < needProgress) return cb(null, [{}, {}, {}, {}, {}, 0, 0, 0, {}, "上一个boss进度还未完成"]);
            }
        }
        //判断当前进度
        //var progress2 = guildData.guildCopyData[bossId][0]||0;
        //if(progress2>=needProgress) return cb(null,[{},{},{},{},{},0,0,0,{},"该BOSS已被击杀，不可继续挑战！"]);

        //消耗挑战次数
        //var vipExt = c_vip[userData.vip].guildFbCount - c_vip[0].guildFbCount;
        //var reNum = copyUtils.getReTime(userData,copyProgressData,bossId,type);
        //if(reNum+vipExt<=0) return cb(getMsg(c_msgCode.noFrequency));//次数不足
        //copyUtils.setTimesPerDay(copyProgressData,bossId,reNum-1);

        //判断cd
        var second = 0;
        var pCopyId = copyProgressData.pCopyId || 0; //cd秒数
        if (refreshTime) {
            //判断cd
            var timeLimit = c_game.guildCopyCfg[3];
            second = (new Date().getTime() - refreshTime.getTime()) / 1000;
            if (pCopyId >= timeLimit) {
                if (second < pCopyId) return cb(null, [{}, {}, {}, {}, {}, 0, 0, 0, {}, "CD中！"]);
            }
            //if((pCopyId - second) > timeLimit) return cb(null,[{},{},{},{},{},0,0,0,{},"CD中！"]);
            var resetTime = guildData.resetTime;
            if (resetTime) {
                if (refreshTime < resetTime && nowTime > resetTime) {
                    copyProgressData.timesPerDay = {};
                }
            }
        }
        var cdSecond = c_game.guildCopyCfg[0];
        var count = copyProgressData.timesPerDay[bossId] || 0;
        copyProgressData.timesPerDay[bossId] = count + 1;
        copyProgressData.refreshTime = nowTime;
        copyProgressData.pCopyId = pCopyId - second + cdSecond;
        if (second > pCopyId) copyProgressData.pCopyId = cdSecond;

        var bossAward = {};
        var chapterAward = [{}];
        var guildCopyData = guildData.guildCopyData || {};
        if (!guildCopyData[bossId]) guildCopyData[bossId] = [];
        var guildCopyArr = guildCopyData[bossId];
        if (!guildCopyArr[1]) guildCopyArr[1] = [];
        var participationData = guildCopyArr[1]; //参与成员数据
        //胜利
        if (isWin) {
            //记录参与
            if (participationData.indexOf(userId) == -1) participationData.push(userId);
            //计算进度
            var pg = guildCopyArr[0] || 0;
            var addProgress = 1; //胜利累加次数
            if (pg < needProgress) {
                if ((pg + addProgress) >= needProgress) { //完成boss进度
                    guildCopyArr[0] = needProgress;
                    //todo 行会宝库获得
                    //奖励直接通过邮件获得
                    bossAward = _getBossAward(bossId);
                    chapterAward = _getChapterAward(bossId, needProgress, guildCopyData);

                    // 通关章节


                } else {
                    guildCopyArr[0] = pg + addProgress;
                }
            }

            //计算获得
            var bagItems = {};
            var equipBagItems = {};
            var getDiamond = 0;
            var award = t_guildCopyBoss[bossId].award;
            var item = {};
            if (award.length > 0) {
                var itemsArr = [];
                for (var i = 0; i < award.length; i++) {
                    item[award[i][0]] = award[i][1];
                    if (award[i][0] == c_prop.spItemIdKey.diamond) getDiamond += award[i][1];
                }
                itemsArr = userUtils.saveItems(userData, item, c_prop.itemGetTypeKey.copy);
                if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
                if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);
            }


            guildBiz.guildGrown(client, userId, userData.nickName, 7, function(err, data) {});
        }

        var updateCopyProgress = {
            timesPerDay: copyProgressData.timesPerDay,
            refreshTime: copyProgressData.refreshTime,
            pCopyId: copyProgressData.pCopyId
        };

        var updateData = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            prestige: userData.prestige
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));
        g_guild.setGuild(guildData.id, guildData);
        async.parallel([
            function(cb1) {
                copyProgressDao.update(client, updateCopyProgress, {
                    userId: userId,
                    copyType: type
                }, cb1)
            },
            function(cb1) {
                if (Object.keys(bossAward).length > 0) {
                    exports.sendGuildCopyAward(client, mPersonalData.guildId, c_prop.mailTypeKey.guildBoss, participationData, t_monster[bossId].name, bossAward, cb1);
                } else {
                    cb1();
                }
            },
            function(cb1) {
                if (Object.keys(chapterAward[0]).length > 0) {
                    exports.sendGuildCopyAward(client, mPersonalData.guildId, c_prop.mailTypeKey.guildChapter, chapterAward[2], chapterAward[1], chapterAward[0], cb1);
                } else {
                    cb1();
                }
            }
        ], function(err, data) {
            if (err) return cb(err);
            cb(null, [updateData, updateCopyProgress, bagItems, equipBagItems, guildData, getDiamond, isWin, guildCopyArr[0], item, ""]);
        });
    });

};

//行会副本领取奖励
exports.guildCopyAward = function(client, userId, type, typeId, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            //userDao.select(client,{id:userId},cb1);
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            exports.getInfo(client, userId, type, cb1);
        },
        function(cb1) {
            guildPersonalDao.select(client, {
                userId: userId
            }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            copyProgressData = data[1],
            mPersonalData = data[2];

        var guildData = g_guild.getGuild(mPersonalData.guildId);
        if (!guildData) return cb(getMsg(c_msgCode.joinInGildFirst)); //请先加入行会！
        var guildCopyData = guildData.guildCopyData;
        var award = [];
        var prizeData = {}; //领取数据
        var clearTime = "";
        var joinTime = mPersonalData.joinTime;
        var refreshTime = copyProgressData.refreshTime; //最后一次通关子副本时间
        if (!refreshTime || !refreshTime.equalsDay(new Date())) {
            copyProgressData.refreshTime = new Date();
            copyProgressData.isPickAward = [];
            copyProgressData.isPickChests = [];
        }
        if (type == c_prop.guildCopyKey.boss) {
            var guildCopyBoss = t_guildCopyBoss[typeId];
            if (!guildCopyBoss) return cb(getMsg(c_msgCode.abnormalData)); //数据异常！");
            if (!guildCopyData[typeId] || guildCopyData[typeId][0] < 10000) return cb(getMsg(c_msgCode.copyNotEnd)); //该副本进度还未完成！
            clearTime = guildCopyData[typeId][1].toString();
            prizeData = copyProgressData.isPickAward[0] || {};
            award = guildCopyBoss.lastShotAward;
            if (joinTime && joinTime > new Date(clearTime)) return cb(getMsg(c_msgCode.enableToReward)); //不满足领取条件！
            if (prizeData[typeId] && prizeData[typeId] == 1) return cb(getMsg(c_msgCode.hasReceivedReward)); //已领取过该奖励！
            if (!copyProgressData.isPickAward[0]) copyProgressData.isPickAward[0] = {};
            copyProgressData.isPickAward[0][typeId] == 1;
        } else if (type == c_prop.guildCopyKey.chapter) {
            var guildCopy = t_guildCopy[typeId];
            if (!guildCopy) return cb(getMsg(c_msgCode.abnormalData)); //数据异常！");
            var start = guildCopy.section[0];
            var end = guildCopy.section[1];
            clearTime = guildCopyData[start][1].toString();
            for (var i = start; i <= end; i++) {
                if (guildCopyData[i][1] > new Date(clearTime)) clearTime = guildCopyData[i][1].toString();
                if (!guildCopyData[i] || guildCopyData[i][0] < 10000) return cb(getMsg(c_msgCode.otherCopyNotEnd)); //还有副本进度未完成！
            }
            prizeData = copyProgressData.isPickChests[0] || {};
            award = guildCopy.award;
            if (joinTime && joinTime > new Date(clearTime)) return cb(getMsg(c_msgCode.enableToReward)); //不满足领取条件！
            if (prizeData[typeId] && prizeData[typeId] == 1) return cb(getMsg(c_msgCode.hasReceivedReward)); //已领取过该奖励！
            if (!copyProgressData.isPickChests[0]) copyProgressData.isPickChests[0] = {};
            copyProgressData.isPickChests[0][typeId] == 1;
        } else {
            return cb(getMsg(c_msgCode.abnormalData)); //数据异常！");
        }
        var isUpGp = false;
        if (!joinTime) {
            isUpGp = true;
            mPersonalData.joinTime = new Date();
        }

        //领奖
        var items = {};
        var bagItems = {};
        var equipBagItems = {};
        for (var i = 0; i < award.length; i++) {
            items[award[i][0]] = award[i][1];
        }
        var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.guildCopy);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);

        var updateData = {
            gold: userData.gold,
            honor: userData.honor,
            diamond: userData.diamond,
            prestige: userData.prestige,
            giveDiamond: userData.giveDiamond,
            buyDiamond: userData.buyDiamond
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));

        var upCopyProgressData = {
            refreshTime: copyProgressData.refreshTime,
            isPickAward: copyProgressData.isPickAward,
            isPickChests: copyProgressData.isPickChests
        };

        async.parallel([
            function(cb1) {
                copyProgressDao.update(client, upCopyProgressData, {
                    id: copyProgressData.id
                }, cb1);
            },
            // function(cb1){
            //     userDao.update(client,updateData,{id:userId},cb1);
            // },
            function(cb1) {
                if (isUpGp) {
                    guildPersonalDao.update(client, {
                        joinTime: mPersonalData.joinTime
                    }, {
                        id: mPersonalData.id
                    }, cb1);
                } else {
                    cb1();
                }
            }
        ], function(err, data) {
            if (err) return cb(err);
            cb(null, [updateData, upCopyProgressData, bagItems, equipBagItems]);
        });
    });
};

//行会副本重置
exports.guildCopyReset = function(client, userId, cb) {
    checkRequire();
    guildPersonalDao.select(client, {
        userId: userId
    }, function(err, mPersonalData) {
        if (err) return cb(err);
        if (!mPersonalData.guildId) return cb(getMsg(c_msgCode.outGuild));
        var guildData = g_guild.getGuild(mPersonalData.guildId);
        if (!guildData) return cb(getMsg(c_msgCode.outGuild));
        if (c_guildFuncCfg[mPersonalData.position].resetCopy == 0) return cb(getMsg(c_msgCode.noPower)); //没有权限

        var resetCount = guildData.resetCount;
        var resetTime = guildData.resetTime;
        var countLimit = c_game.guildCopyCfg[1];
        if (resetTime && new Date() < new Date(resetTime).clone().addDays(countLimit)) return cb(getMsg(c_msgCode.noReset));

        //重置
        guildData.guildCopyData = {};
        guildData.resetTime = new Date();
        guildData.resetCount = resetCount + 1;
        var updateGuildData = {
            guildCopyData: guildData.guildCopyData,
            resetTime: guildData.resetTime,
            resetCount: guildData.resetCount
        };
        g_guild.setGuild(guildData.id, guildData);
        cb(null, updateGuildData);
    });
};

/**
 * 公会副本清除CD
 * @param client
 * @param userId
 * @param bossId
 * @param cb
 */
exports.clearGuildCopy = function(client, userId, bossId, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            copyProgressDao.select(client, {
                userId: userId,
                copyType: c_prop.copyTypeKey.guild
            }, cb1)
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            copyProgressData = data[1];
        var nowTime = new Date();
        var refreshTime = copyProgressData.refreshTime;
        var type = c_prop.copyTypeKey.guild;
        var resetCounts = copyUtils.getBuyCopyCount(copyProgressData, type); //今日购买次数

        //cd
        var pCopyId = copyProgressData.pCopyId || 0; //cd秒数
        if (refreshTime) {
            var second = (nowTime.getTime() - refreshTime.getTime()) / 1000;
            pCopyId -= second;
        }
        if (pCopyId <= 0) return cb(getMsg(c_msgCode.noCDToClear)); //没有需要清除的CD
        var costDiamond = formula.calGuildCopyCd(pCopyId); // 购买次数所需钻石
        //判断被扣除钻石
        if (userData.diamond < costDiamond || costDiamond < 0) return cb(getMsg(c_msgCode.noDiamond)); //钻石不足
        //添加次数
        copyProgressData.resetTime = nowTime;
        copyProgressData.resetCounts[type] = resetCounts;
        //扣除cd
        copyProgressData.pCopyId = 0;
        copyProgressData.refreshTime = nowTime;
        //扣除钻石
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.clearGuildCopy);

        //需要更新的数据
        var updateUserData = {
            diamond: userData.diamond,
            giveDiamond: userData.giveDiamond,
            buyDiamond: userData.buyDiamond
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        var updateCopyData = {
            resetTime: copyProgressData.resetTime,
            resetCounts: copyProgressData.resetCounts,
            pCopyId: copyProgressData.pCopyId,
            refreshTime: copyProgressData.refreshTime
        };
        async.parallel([
            function(cb2) {
                copyProgressDao.update(client, updateCopyData, {
                    id: copyProgressData.id
                }, cb2);
            }
        ], function(err, data2) {
            if (err) return cb(err);
            cb(null, [updateUserData, copyProgressData, costDiamond]);
        });
    });
};

/**
 * 发送奖励
 * @param client
 * @param cb
 */
exports.sendGuildCopyAward = function(client, guildId, mailType, participationData, name, items, cb) {
    checkRequire();
    if (guildId == 0 || Object.keys(items).length <= 0) return cb();
    guildPersonalDao.listCols(client, " userId ", " guildId = ? AND userId IN (?) ", [guildId, participationData], function(err, gpList) {
        if (err) return cb(err);
        var max = 1000; //分1000一批插入
        var groupList = [];
        var tempCount = 0;
        var tempList = [];
        for (var i = 0; i < gpList.length; i++) {
            var locData = gpList[i];
            var mailEntity = mailBiz.createEntityByType(locData.userId, mailType, [name], items);
            mailEntity.addTime = new Date();
            tempList.push(mailEntity);
            if (tempCount >= max) {
                tempCount = 0;
                groupList.push(tempList.concat([]));
                tempList.length = 0;
            }
            tempCount++;
        }
        if (tempList.length > 0) {
            groupList.push(tempList.concat([]));
        }

        async.mapLimit(groupList, 1, function(group, cb1) {
            mailBiz.addMailByList(client, group, cb1);
        }, cb);
    });
};

//爬塔领取奖励
exports.paTaAward = function(client, userId, copyId, cb) {
    checkRequire();
    var section = c_game.towerCopy[0].split(","); //爬塔副本id区间
    if (copyId < section[0] || copyId > section[1]) return cb(getMsg(c_msgCode.abnormalData)); //数据异常");
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            copyProgressDao.select(client, {
                userId: userId,
                copyType: c_prop.copyTypeKey.paTa
            }, cb1)
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            copyProgressData = data[1];

        if (!copyProgressData.copyObj[copyId]) copyProgressData.copyObj[copyId] = [];
        var awardArr = copyProgressData.copyObj[copyId]; //{copyId:[最低血量,是否领取],copyId:[最低血量,是否领取],.....}
        if (!awardArr[0] || awardArr[0] != -1) return cb(getMsg(c_msgCode.bossNotPass)); //还未通关该boss
        if (awardArr[1] && awardArr[1] == 1) return cb(getMsg(c_msgCode.hasReceivedReward)); //已领取过该奖励！");
        var items = {};
        var award = t_paTaTreasury[copyId].award || [];
        for (var i = 0; i < award.length; i++) {
            items[award[i][0]] = award[i][1];
        }

        // 校验数据，修改highPata
        var section = c_game.towerCopy[0].split(","); //爬塔副本id区间
        var highPaTa = copyId - parseInt(section[0]) + 1;
        if (highPaTa > userData.highPaTa) userData.highPaTa = highPaTa;
       
        //获得物品
        var getDiamond = 0;
        var bagItems = {};
        var equipBagItems = {};
        if (items[c_prop.spItemIdKey.diamond]) getDiamond = items[c_prop.spItemIdKey.diamond];
        var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.tower);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);
        //改变状态
        copyProgressData.copyObj[copyId][1] = 1;

        //需要更新的数据
        var updateData = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            highPaTa: userData.highPaTa
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));
        var updateCopyData = {
            copyObj: copyProgressData.copyObj
        };
        async.parallel([
            // function(cb2){
            //     userDao.update(client,updateData,{id:userId},cb2)
            // },
            function(cb2) {
                copyProgressDao.update(client, updateCopyData, {
                    id: copyProgressData.id
                }, cb2)
            }
        ], function(err, data2) {
            if (err) return cb(err);
            cb(null, [updateData, copyProgressData, bagItems, equipBagItems, getDiamond])
        });
    });
};

//镇妖塔宝库抽奖
exports.paTaTreasury = function(client, userId, free, cb) {
    checkRequire();
    var type = c_prop.copyTypeKey.paTa;
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            copyProgressDao.select(client, {
                userId: userId,
                copyType: type
            }, cb1)
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            copyProgressData = data[1];

        var costDiamond = 0;
        var delBagItems = {};
        var paTaOpen = c_open.paTa.lvlRequired;
        if (userData.lvl < paTaOpen) return cb(getMsg(c_msgCode.towerNotOpen), paTaOpen);
        var highPaTa = userData.highPaTa || 0; //爬塔最高层数
        if (highPaTa < 1) return cb(getMsg(c_msgCode.noLevelDown));
        var vipRight = userUtils.getWeekCardRight(userData);

        if (free == 0) {
            var reNum = copyUtils.getReTime(userData, copyProgressData, type, type); //剩余次数
            var exNum = c_vip[vipRight].buyPaTaTreasuryCount - c_vip[0].buyPaTaTreasuryCount;
            if (reNum + exNum <= 0) return cb(getMsg(c_msgCode.noFrequency)); //次数不足
            var resetTime = copyProgressData.resetTime;
            if (!resetTime || !resetTime.equalsDay(new Date())) {
                copyProgressData.resetTime = new Date();
                copyProgressData.resetCounts = {};
            }

            var needItemId = c_prop.spItemIdKey.paTaTreasuryTessera; //探险宝库券
            var needItemCount = parseInt(userData.bag[needItemId] || 0);
            var lotteryCounts = copyUtils.getBuyCopyCount(copyProgressData, type); //今日购买次数
            //优先消耗道具
            if (needItemCount > 0) {
                delBagItems[needItemId] = 1;
                userUtils.delBag(userData, needItemId, 1, c_prop.itemCostTypeKey.other);
            } else { //消耗元宝、
                costDiamond = formula.calPaTaAward(lotteryCounts, userData.highPaTa);
                //判断被扣除钻石
                if (userData.diamond < costDiamond || costDiamond < 0) return cb(getMsg(c_msgCode.noDiamond)); //钻石不足
                //扣除钻石
                userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.paTaAward, needItemId, 1);
            }
            copyProgressData.resetTime = new Date();
            copyProgressData.resetCounts[type] = lotteryCounts;

            //计算抽奖剩余次数
            copyProgressData.timesPerDay[type] = parseInt(reNum) - 1;
        } else {
            if (userData.lvl < c_game.power[6]) return cb(getMsg(c_msgCode.NoLvlOpen));
            let num = userUtils.getTodayCount(userData, c_prop.userRefreshCountKey.freePataTreasuryNum);
            let numLimit = c_vip[vipRight].paTaTreasuryCount || 0;
            if (num >= numLimit) return cb(getMsg(c_msgCode.noFrequency));
            if (userData.strength < c_game.power[3]) return cb(getMsg(c_msgCode.strengthUnenough));
            userUtils.costPataPower(userData, c_game.power[3]);
            userUtils.addTodayCount(userData, c_prop.userRefreshCountKey.freePataTreasuryNum, 1);
        }

        //计算抽奖物品
        var items = {};
        var getItems = {};

        //必掉金币
        var willFall = {};
        willFall[c_prop.spItemIdKey.gold] = parseInt(c_game.lotteryWillFall[0]);
        items = propUtils.mergerProp(items, willFall);

        var section = c_game.towerCopy[0].split(","); //爬塔副本id区间
        var highCopyId = highPaTa - 1 + parseInt(section[0]);
        var treasury = t_paTaTreasury[highCopyId].treasury; //宝库内容
        var weightArr = [];
        var create = [].concat(treasury);
        for (var i = 0; i < create.length; i++) {
            weightArr.push(create[i][2]);
        }
        var weightIndex = commonUtils.getWeightRandom(weightArr);
        items[create[weightIndex][0]] = create[weightIndex][1];
        getItems[create[weightIndex][0]] = create[weightIndex][1];

        //额外获得
        var exData = t_paTaTreasury[highCopyId].exData || []; //额外掉落
        for (var i = 0; i < exData.length; i++) {
            var randomPro = exData[i][2];
            var randomNum = _getRandomNumber(1, 10000);
            if (randomNum <= randomPro) {
                items[exData[i][0]] = exData[i][1];
                getItems[exData[i][0]] = exData[i][1];
            }
        }

        var bagItems = {};
        var equipBagItems = {};
        //console.error('========爬塔宝库获得物品=============',items);

        var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.pataTreasury);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);

        heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.paTaTreasury, 1);

        //需要更新的数据
        var updateData = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            counts: userData.counts,
            countsRefreshTime: userData.countsRefreshTime,
            strength: userData.strength
        };
        activityBiz.recordCarnivalValue(client, userId, c_prop.carnivalTaskTypeKey.paTaTreasury, 1, function() {});
        activityBiz.recordLachelFitnessValue(client,userId, c_prop.lachelActTaskTypeKey.paTaTreasuryNum, 1, null, function(){});
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));
        var updateCopyData = {
            refreshTime: copyProgressData.refreshTime,
            resetTime: copyProgressData.resetTime,
            resetCounts: copyProgressData.resetCounts,
            timesPerDay: copyProgressData.timesPerDay,
        };
        async.parallel([
            function(cb2) {
                copyProgressDao.update(client, updateCopyData, {
                    id: copyProgressData.id
                }, cb2)
            }
        ], function(err, data2) {
            if (err) return cb(err);
            var troHorLamp = t_paTaTreasury[highCopyId].troHorLamp;
            if (troHorLamp) {
                for (var i = 0; i < troHorLamp.length; i++) {
                    var zmdItemId = troHorLamp[i][0];
                    var zmdItemCount = troHorLamp[i][1];
                    if (bagItems[zmdItemId] && bagItems[zmdItemId] == zmdItemCount) {
                        var zmdItemName = "";
                        if (t_item[zmdItemId]) zmdItemName = t_item[zmdItemId].name;
                        chatBiz.addSysData(79, [userData.nickName, zmdItemName, zmdItemCount]);
                        chatBiz.addSysData(80, [userData.nickName, zmdItemName, zmdItemCount]);
                    }
                }
            }
            cb(null, [updateData, copyProgressData, bagItems, equipBagItems, delBagItems, costDiamond, getItems]);
        });
    });
};

//副本扫荡
exports.copyWipe = function(client, userId, copyId, num, cb) {
    checkRequire();
    var t_copyData = t_copy[copyId];
    var type = t_copyData.type;
    // if(type != c_prop.copyTypeKey.equip && type != c_prop.copyTypeKey.state ) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    async.parallel([
        function(cb1) {
            //userDao.select(client,{id:userId},cb1)
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            exports.getInfo(client, userId, type, cb1)
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            copyProgressData = data[1];

        //判断星数
        if (type == c_prop.copyTypeKey.equip || type == c_prop.copyTypeKey.state) {
            var copyStar = copyProgressData.copyStar;
            if (!copyStar[copyId] || copyStar[copyId] < 3) return cb(getMsg(c_msgCode.notPerfect));
        }

        //装备副本,消耗挑战次数
        var wipeCount = num; //扫荡次数
        var vipExt = 0;
        var needItemId = 0;
        var cosDiamond = 0;
        var delBagItems = {};
        var vipRight = userUtils.getWeekCardRight(userData) || 0;
        switch (type) {
            case c_prop.copyTypeKey.equip:
                //装备副本,装备入场券
                needItemId = c_prop.spItemIdKey.equipTessera;
                vipExt = c_vip[vipRight].equipCount - c_vip[0].equipCount;
                break;
            case c_prop.copyTypeKey.state:
                //境界副本，入场券
                needItemId = c_prop.spItemIdKey.realmTessera;
                vipExt = c_vip[vipRight].realmCount - c_vip[0].realmCount;
                break;
            case c_prop.copyTypeKey.hell:
                //boss试炼副本,boss令牌
                var bossTessera = userData.bag[c_prop.spItemIdKey.bossTessera] || 0;
                var replaceCount = userUtils.getTodayCount(userData, c_prop.userRefreshCountKey.bossTesseraReplace); //获取今日替代令使用次数
                if (bossTessera > 0 || replaceCount >= c_game.bossTesseraReplace[1]) {
                    needItemId = c_prop.spItemIdKey.bossTessera;
                } else {
                    needItemId = c_prop.spItemIdKey.bossTesseraReplace;
                }
                vipExt = c_vip[vipRight].bossCount - c_vip[0].bossCount;
                break;
            case c_prop.copyTypeKey.vip7:
                vipExt = c_vip[vipRight].copyCountV7 - c_vip[0].copyCountV7;
                break;
            case c_prop.copyTypeKey.vip10:
                vipExt = c_vip[vipRight].copyCountV10 - c_vip[0].copyCountV10;
                break;
            case c_prop.copyTypeKey.vip14:
                vipExt = c_vip[vipRight].copyCountV14 - c_vip[0].copyCountV14;
                break;
            case c_prop.copyTypeKey.vip17:
                vipExt = c_vip[vipRight].copyCountV17 - c_vip[0].copyCountV17;
                break;
            case c_prop.copyTypeKey.vip19:
                vipExt = c_vip[vipRight].copyCountV19 - c_vip[0].copyCountV19;
                break;
            case c_prop.copyTypeKey.vip21:
                vipExt = c_vip[vipRight].copyCountV21 - c_vip[0].copyCountV21;
                break;
        }
        var reNum = copyUtils.getReTime(userData, copyProgressData, copyId, type);
        var residue = reNum + vipExt; //剩余次数
        if (residue <= 0 || wipeCount > residue) return cb(getMsg(c_msgCode.noFrequency)); //次数不足

        //消耗道具、次数
        // if(!needItemId) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
        if (needItemId) {
            var haveItemCount = parseInt(userData.bag[needItemId] || 0);
            if (haveItemCount > 0) { //优先消耗光道具
                var canWipeCount = haveItemCount;
                var multiple = 1; //每次需要消耗几个物品
                if (needItemId == c_prop.spItemIdKey.bossTesseraReplace) {
                    multiple = parseInt(c_game.bossTesseraReplace[0]);
                    if (multiple == 0) return cb(getMsg(c_msgCode.configError)); //防止除数为0
                    canWipeCount = Math.floor(haveItemCount / multiple);
                }
                if (canWipeCount < wipeCount) {
                    wipeCount = canWipeCount;
                }
                var needItemNum = wipeCount * multiple;
                delBagItems[needItemId] = needItemNum;
                userUtils.delBag(userData, needItemId, needItemNum, c_prop.itemCostTypeKey.copy);
            } else { //消耗元宝
                cosDiamond = parseInt(t_item[needItemId].price) * residue;
                if (userData.diamond < cosDiamond || cosDiamond < 0) return cb(getMsg(c_msgCode.noDiamond));
                userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, cosDiamond, c_prop.diamondCostTypeKey.copyWipeToBuyTessera, needItemId, residue, type);
            }
        }

        copyUtils.setTimesPerDay(copyProgressData, copyId, reNum - wipeCount);
        if (t_copyData.type == c_prop.copyTypeKey.vip7 || t_copyData.type == c_prop.copyTypeKey.vip10 ||
            t_copyData.type == c_prop.copyTypeKey.vip14 || t_copyData.type == c_prop.copyTypeKey.vip17 ||
            t_copyData.type == c_prop.copyTypeKey.vip19 || t_copyData.type == c_prop.copyTypeKey.vip21) {
            heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.materialsCopyNum, wipeCount);
        }

        var items = {};
        var userExp = 0;
        var monsterId = t_copyData.bossID;
        var temUserExp = t_monster[monsterId].userExp;
        for (var i = 0; i < wipeCount; i++) {
            var temItems = {};
            //物品
            var lootId = t_copyData.bossLoot;
            var temItemsArr = fightUtils.getLootItems(lootId);
            for (var j = 0; j < temItemsArr.length; j++) {

                if (temItems[temItemsArr[j][0]]) {
                    temItems[temItemsArr[j][0]] += temItemsArr[j][1];
                } else {
                    temItems[temItemsArr[j][0]] = temItemsArr[j][1];
                }

            }
            items = propUtils.mergerProp(items, temItems);
            //获取经验
            userExp += temUserExp;
        }
        var userExpRate = fightUtils.getBuffExpcRate();

        //泰勒的梦境魔法 活动期间内 部分副本掉落双倍
        var activityData = g_cache.getActivityDataByType_InTime(c_prop.activityTypeKey.taylorDreamMagic);
        if (activityData) {
            var day = new Date().getDay();
            var actCfg = activityData.exValues || {};
            var doubleLootTypes = actCfg[day] || {};
            var lootRate = doubleLootTypes[type];
            lootRate = parseInt(lootRate);
            // 周五 开启试炼双倍
            // 周六 开启材料双倍 vip7 vip10 vip14 vip17 vip19 vip21
            // 周日 开启深渊双倍
            if (lootRate && lootRate > 0) {
                // console.error('in activity taylorDreamMagic=================day=lootRate======',day,lootRate);
                // console.error('before double locItem=====>',items);
                for(var key in items){
                    items[key] = parseInt(items[key]) * lootRate;
                }
                // console.error('before double locItem=====>',items);
                userExpRate += 1;//经验也翻倍
                // console.error('userExpRate=====>',userExpRate);
            }
        }
        //泰勒的梦境魔法 end
        
        // var userAddExpRate = fightUtils.getSelfBuffAddExpcRate(userData);
        // userExpRate += userAddExpRate;

        // 金币加成   
        // var userAddGoldRate = fightUtils.getSelfBuffAddGoldRate(userData);
        var userAddGoldRate = 0;
        var influences = {};
        influences[c_prop.itemTypeKey.gold] = userAddGoldRate;

        //多倍经验
        userExp = userExp * userExpRate;

        //计算物品、经验
        var itemsArr = [];
        var bagItems = {};
        var equipBagItems = {};
        itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.copyWipe, influences);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);
        userUtils.addUserExpc(userData, userExp);

        //更新

        var updateCopyProgress = {
            timesPerDay: copyProgressData.timesPerDay,
            refreshTime: copyProgressData.refreshTime
        };

        var updateData = {
            lvl: userData.lvl,
            magicLvl: userData.magicLvl,
            expc: userData.expc,
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            prestige: userData.prestige,
            rebirthExp: userData.rebirthExp,
            genuineQi: userData.genuineQi,
            medalData: userData.medalData,
            strength: userData.strength
        };
        if (type == c_prop.copyTypeKey.hell) {
            activityBiz.recordCarnivalValue(client, userId, c_prop.carnivalTaskTypeKey.hellCopyWipeNum, wipeCount, function() {});
            activityBiz.recordLachelFitnessValue(client,userId, c_prop.lachelActTaskTypeKey.hellNum, 1, null, function(){});
            heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.goldOrExpCopyNum, wipeCount);
        } else if (type == c_prop.copyTypeKey.state) {
            activityBiz.recordCarnivalValue(client, userId, c_prop.carnivalTaskTypeKey.state, wipeCount, function() {});
            activityBiz.recordLachelFitnessValue(client,userId, c_prop.lachelActTaskTypeKey.stateNum, 1, null, function(){});
            heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.goldOrExpCopyNum, wipeCount);
        }
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));
        async.parallel([
            function(cb1) {
                copyProgressDao.update(client, updateCopyProgress, {
                    userId: userId,
                    copyType: type
                }, cb1);
            }
        ], function(err, data) {
            if (err) return cb(err);
            var addArr = [];
            for (var i = 0; i < wipeCount; i++) {
                addArr.push(function(cb1) {
                    _addAct(client, userId, userData.nickName, type, cb1);
                });
            }
            async.series(addArr, function() {
                cb(null, [updateData, updateCopyProgress, bagItems, equipBagItems, delBagItems, wipeCount, cosDiamond, type, items]);
            });
        });
    });
};


exports.syCopyLottery = function(client, userId, index, cb) {
    if (index < 0 || index > 5) return cb(getMsg(c_msgCode.paramsError)); //参数错误!
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        // [疲劳点,疲劳刷新时间,抽奖有效,[{id:物品id,num:物品数量}}],[宝箱领取标识]]
        var syData = userData.exData[c_prop.userExDataKey.syData];
        if (!syData) return cb(getMsg(c_msgCode.syBmDisappear)); //深渊商人已消失
        var ret = syData[2] || 0;
        if (!ret) return cb(getMsg(c_msgCode.syBmDisappear)); //深渊商人已消失
        var indexArr = syData[4];
        var itemArr = syData[3];
        if (indexArr[index] != 0) return cb(getMsg(c_msgCode.hasChosen)); //该物品已被抽取过
        var lotteryNum = 0;
        for (var i = 0; i < indexArr.length; i++) {
            if (indexArr[i]) {
                lotteryNum++
            };
        }

        indexArr[index] = 1;
        var costArr = c_game.syCopyCfg[5].split(",");
        var costValue = parseInt(costArr[lotteryNum]);

        var spItemId = c_prop.spItemIdKey.dScore;
        var haveItemNum = userData.bag[spItemId] || 0;
        if (haveItemNum < costValue) {
            return cb(getMsg(c_msgCode.noIntegral)); //你的积分不够
        }

        // 开宝箱
        var itemCfg = itemArr[index];
        var delBagItems = {};
        userUtils.delBag(userData, spItemId, costValue, c_prop.itemCostTypeKey.activity, itemCfg[0], itemCfg[1]);
        delBagItems[spItemId] = costValue;


        //var logicItems = itemBiz.calLogicItems(chestId);        //宝箱随机的物品
        var items = {};
        items[itemCfg[0]] = itemCfg[1];

        var bagItems = {};
        var equipBagItems = {};
        var mailItems = {};
        var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.shop);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);
        if (Object.keys(itemsArr[5]).length > 0) mailItems = propUtils.mergerProp(mailItems, itemsArr[5]);

        // var heroSkin = itemsArr[6];
        // if (heroSkin.length > 0) {
        //     userBiz.setMedalValue(client, userId, c_prop.medalLootTypeKey.clearHeroSkin, heroSkin.length, function() {
        //     });
        //     //累计拥有XX个英雄 累计拥有XX个SSR英雄
        //     taskBiz.setTaskValue(client, userId, c_prop.cTaskTypeKey.heroSkinNum, heroSkin.length, function() {
        //     });
        //     var ssrNum = 0;
        //     for (var i = 0; i < heroSkin.length; i++) {
        //         if (t_hero[heroSkin[i]].talismanstar == 3) {
        //             ssrNum++;
        //         }
        //     }
        //     taskBiz.setTaskValue(client, userId, c_prop.cTaskTypeKey.heroSkinSSRNum, ssrNum, function() {
        //     });
        // }
        // 系统通知 深渊副本
        var itemIdArr = Object.keys(bagItems);
        var itemIdArr2 = Object.keys(equipBagItems);
        var itemIdArr3 = Object.keys(mailItems);
        //屏蔽深渊门票、深渊卡箱、深渊魔石、传承精华、史莱姆糖果
        //console.error('================syCopyLottery================',itemIdArr,itemIdArr2);
        var ignoreItemIds = ['2007', '2015', '950', '39', '56'];
        var ignoreItemIds2 = ['2007', '2015', '950', '39', '56'];
        itemIdArr.forEach(function(itemId) {
            // 获得物品的公告
            if (ignoreItemIds.indexOf(itemId) < 0) {
                chatBiz.addSysData(150, [userData.nickName, t_item[itemId].color, t_item[itemId].name]);
                chatBiz.addSysData(156, [userData.nickName, t_item[itemId].color, t_item[itemId].name]);
            }
            if (ignoreItemIds2.indexOf(itemId) < 0) {
                //掉落记录
                exports.addCopyLootRecord(client, userId, userData.nickName, c_prop.copyTypeKey.abyss, 0, itemId);
            }
        });

        itemIdArr2.forEach(function(equipId) {
            var itemId = equipBagItems[equipId][0];
            //console.error('================syCopyLottery222================',itemId);
            // 获得物品的公告equipBagItems
            chatBiz.addSysData(150, [userData.nickName, t_item[itemId].color, t_item[itemId].name]);
            chatBiz.addSysData(156, [userData.nickName, t_item[itemId].color, t_item[itemId].name]);
            //掉落记录
            exports.addCopyLootRecord(client, userId, userData.nickName, c_prop.copyTypeKey.abyss, 0, itemId);
        });

        itemIdArr3.forEach(function(itemId) {
            chatBiz.addSysData(150, [userData.nickName, t_item[itemId].color, t_item[itemId].name]);
            chatBiz.addSysData(156, [userData.nickName, t_item[itemId].color, t_item[itemId].name]);
            exports.addCopyLootRecord(client, userId, userData.nickName, c_prop.copyTypeKey.abyss, 0, itemId);
        });

        var updateData = {
            heroData: userData.heroData,
            heroNum: userData.heroNum,
            exData: userData.exData
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));


        return cb(null, [updateData, bagItems, equipBagItems, delBagItems]);
    });
};

exports.buyPataPower = function(client, userId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        let userData = gamePlayer.userData;
        let num = userUtils.getTodayCount(userData, c_prop.userRefreshCountKey.buyPataPowerNum);
        let vipRight = userUtils.getWeekCardRight(userData) || 0;
        let numLimit = c_vip[vipRight].power_buy || 0;
        if (num >= numLimit) return cb(getMsg(c_msgCode.protocolError));
        if (userData.diamond < c_game.power[5] || c_game.power[5] < 0) return cb(getMsg(c_msgCode.noDiamond));

        userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, c_game.power[5], c_prop.diamondCostTypeKey.other);
        userUtils.addTodayCount(userData, c_prop.userRefreshCountKey.buyPataPowerNum, 1);
        let power = userData.strength || 0;
        userData.strength = power + c_game.power[4];

        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);

        let updateData = {
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            counts: userData.counts,
            countsRefreshTime: userData.countsRefreshTime,
            strength: userData.strength
        };

        return cb(null, updateData);
    });
};

/*****************************************************************************************************/

var _fightWithMonster = function(client, userData, copyProgress, copyId, cb) {
    var t_copyData = t_copy[copyId];
    var nodeIndex = copyProgress.copyObj[copyId] || 0;
    var enemyMembers = copyUtils.getMonsterMembers(copyId, nodeIndex);
    heroBiz.getSelfFightMembers(client, userData, function(err, data) {
        if (err) return cb(err);
        var fightResult = null;
        var nodeType = t_copyData.nodeType[nodeIndex];
        if (nodeType == 1) {
            fightResult = new ds.FightResult();
            fightResult.winStatus = consts.winStatus.win;
        } else {
            var selfMembers = data[0],
                heroList = data[1];
            fightResult = multFightBiz.fight(selfMembers, enemyMembers);
        }
        return cb(null, [fightResult, heroList]);
    });
};

//输出指定范围内的随机数的随机整数
var _getRandomNumber = function(start, end) {
    var choice = end - start + 1;
    return Math.floor(Math.random() * choice + start);
};

//获取扫荡掉落物品
var _getWipeItems = function(copyInfo) {
    var items = {};
    var lootIds = copyInfo.lootIds;
    for (var i = 0; i < lootIds.length; i++) {
        var wipeItems = t_copyLoot[lootIds[i]].wipeItems;
        for (var i1 = 0; i1 < wipeItems.length; i1++) {
            if (wipeItems[i1][0] != 0) {
                var itemId = wipeItems[i1][0]; //物品id
                var probability = wipeItems[i1][1]; //概率
                var upper = wipeItems[i1][2]; //物品数量下限  1
                var lower = wipeItems[i1][3]; //物品数量上限   2
                if (probability == 10000) {
                    items[itemId] = _getRandomNumber(upper, lower);
                } else {
                    if (probability >= _getRandomNumber(0, 10000)) {
                        items[itemId] = _getRandomNumber(upper, lower);
                    }
                }
            }
        }
    }
    return items;
};

//获取伤害奖励
var _getDamageAward = function(bossId, damage) {
    var award = [];
    var guildCopyBoss = t_guildCopyBoss[bossId];
    if (damage >= guildCopyBoss.needDamage1) {
        if (damage >= guildCopyBoss.needDamage10) {
            return guildCopyBoss.award10;
        }
        for (var i = 1; i <= 10; i++) {
            var needDamageStr = "needDamage" + i.toString();
            if (damage < guildCopyBoss[needDamageStr]) {
                var awardStr = "award" + (i - 1).toString();
                award = guildCopyBoss[awardStr];
                break;
            }
        }
    }
    return award;
};

//获取BOSS奖励
var _getBossAward = function(id) {
    var items = {};
    var award = t_guildCopyBoss[id].lastShotAward;
    for (var i = 0; i < award.length; i++) {
        items[award[i][0]] = award[i][1];
    }
    return items;
};

//获取章节奖励
var _getChapterAward = function(bossId, needProgress, guildCopyData) {
    var items = {};
    var participationData = [];
    for (var key in t_guildCopy) {
        var guildCopy = t_guildCopy[key];
        var start = guildCopy.section[0];
        var end = guildCopy.section[1];
        if (bossId >= start && bossId <= end) {
            for (var i = start; i <= end; i++) {
                if (i != bossId && !guildCopyData[i]) return [items];
                if (i != bossId && guildCopyData[i][0] < needProgress) return [items];
                var properArr = guildCopyData[i][1];
                for (var j = 0; j < properArr.length; j++) {
                    var userId = properArr[j];
                    if (participationData.indexOf(userId) == -1) participationData.push(userId);
                }
            }
            var award = guildCopy.award;
            for (var i = 0; i < award.length; i++) {
                items[award[i][0]] = award[i][1];
            }
            break;
        }
    }
    return [items, guildCopy.name, participationData];
};

//计算进度
var _getGuildProgress = function(hurt, bossId, index) {
    var returnHurt = 0;
    var needHurt = t_guildCopyBoss[bossId].needDamage1;
    if (hurt < needHurt) return returnHurt;
    var start = "guildStartHurt" + index.toString();
    var end = "guildEndHurt" + index.toString();
    var guildProgress = "guildProgress" + index.toString();
    for (var key in c_bossHurtRate) {
        var locData = c_bossHurtRate[key];
        var locStartHurt = locData[start];
        var locEndHurt = locData[end];
        var locRate = locData[guildProgress];
        if (hurt >= locStartHurt && hurt <= locEndHurt) {
            returnHurt += (hurt - locStartHurt) * locRate;
            break;
        } else {
            returnHurt += (locEndHurt - locStartHurt) * locRate;
        }
    }
    return parseInt(returnHurt);
};

//获取本周周日日期
var _getDateStr = function() {
    var today = new Date();
    var weekday = today.getDay();
    var weekday = new Date(1000 * 60 * 60 * 24 * (7 - weekday) + today.getTime());
    var y = weekday.getFullYear();
    var m = weekday.getMonth() + 1; //获取当前月份的日期
    m = parseInt(m, 10);
    if (m < 10) {
        m = "0" + m;
    }
    var d = weekday.getDate();
    d = parseInt(d, 10);
    if (d < 10) {
        d = "0" + d;
    }
    return new Date(y + "-" + m + "-" + d + " 23:59:59");
};

//获取探险层数
var _getTowerIndex = function(copyId) {
    var self = this;
    var copyIdRange = c_game.towerCopy[0].split(',');
    var starCopyId = parseInt(copyIdRange[0]);
    return parseInt(copyId) - starCopyId + 1;
};

var _clearSyCopyData = function(userData) {

    if (userData.exData[c_prop.userExDataKey.syData]) {
        var fatigue = userData.exData[c_prop.userExDataKey.syData][0];
        var refreshime = userData.exData[c_prop.userExDataKey.syData][1];
        userData.exData[c_prop.userExDataKey.syData] = [fatigue, refreshime];
    } else {
        userData.exData[c_prop.userExDataKey.syData] = [0, new Date()];
    }
};

var _canEnterSyCopy = function(userData) {
    _refreshSyCopy(userData);
    if (userData.exData[c_prop.userExDataKey.syData]) {
        var fatigue = userData.exData[c_prop.userExDataKey.syData][0];
        if (fatigue >= parseInt(c_game.syCopyCfg[4])) { // 疲劳值
            return false;
        }
    }
    return true;
};

var _refreshSyCopy = function(userData) {

    var nowDate = new Date();
    if (userData.exData[c_prop.userExDataKey.syData]) {
        var fatigue = userData.exData[c_prop.userExDataKey.syData][0];
        var refreshime = new Date(userData.exData[c_prop.userExDataKey.syData][1]);
        var minutes = refreshime.getMinutesBetween(nowDate);
        if (minutes >= 4) {
            var intervalNum = Math.floor(minutes / 4);
            fatigue -= intervalNum;
            if (fatigue < 0) {
                fatigue = 0;
            }

            userData.exData[c_prop.userExDataKey.syData][0] = fatigue;
            userData.exData[c_prop.userExDataKey.syData][1] = refreshime.addMinutes(intervalNum * 4);
        }
    }
};

var _endCopySyDataFatigue = function(userData, isWin, manyNum) {

    _refreshSyCopy(userData);
    var addFatigue = parseInt(c_game.syCopyCfg[3]) * manyNum;
    var now = new Date();
    // [疲劳点,疲劳刷新时间,抽奖有效,[宝箱id列表],[宝箱领取标识],宝箱出现时间]
    if (userData.exData[c_prop.userExDataKey.syData]) {
        // var fatigue = userData.exData[c_prop.userExDataKey.syData][0];
        // fatigue = fatigue + addFatigue;
        // var refreshime  = userData.exData[c_prop.userExDataKey.syData][1];
        // var traderAppearTime = userData.exData[c_prop.userExDataKey.syData][5];
        userData.exData[c_prop.userExDataKey.syData][0] += addFatigue;
    } else {
        userData.exData[c_prop.userExDataKey.syData] = [addFatigue, now];
    }

    if (!isWin) {
        return;
    }

    var r = parseInt(c_game.syCopyCfg[2]);
    if (Math.random() * 10000 <= r) {
        var items = _getRewardItemArr();
        var idxs = [0, 0, 0, 0, 0, 0];
        items.sort(function(a, b) {
            return Math.random() > 0.5 ? -1 : 1; //用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
        });
        userData.exData[c_prop.userExDataKey.syData][2] = 1;
        userData.exData[c_prop.userExDataKey.syData][3] = items;
        userData.exData[c_prop.userExDataKey.syData][4] = idxs;
        userData.exData[c_prop.userExDataKey.syData][5] = now; //宝箱出现时间
    } else {
        userData.exData[c_prop.userExDataKey.syData][2] = 0;

    }
};

var _getRewardItems = function(para) {
    // para  物品id,物品数量,权重
    var itemArr = para.split(";");
    var rate = [];
    for (var i = 0; i < itemArr.length; i++) {
        var r = itemArr[i].split(",");
        rate.push(parseInt(r[2]));
    }

    var idx = commonUtils.getWeightRandom(rate);
    var item = itemArr[idx].split(",");
    var ret = [];
    ret[0] = parseInt(item[0]);
    ret[1] = parseInt(item[1]);
    return ret;
};

var _getRewardItemArr = function() {
    var ret = [];
    for (var i = 6; i < 12; i++) {
        ret.push(_getRewardItems(c_game.syCopyCfg[i]));
    }
    return ret;
};