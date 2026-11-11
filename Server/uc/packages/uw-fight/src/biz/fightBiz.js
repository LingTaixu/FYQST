/**
 * Created by Administrator on 2015/9/16.
 */
var exports = module.exports;
var uwData = require("uw-data");
var c_prop = uwData.c_prop;
var t_copy = uwData.t_copy;
var t_monster = uwData.t_monster;
var c_game = uwData.c_game;
var g_data = require("uw-global").g_data;
var g_cache = require("uw-global").g_cache;
var t_talismanSkill = uwData.t_talismanSkill;

var commonUtils = require("uw-utils").commonUtils;
var fightUtils = require("./fightUtils.js");
var async = require("async");
var g_copyLoot = require("uw-global").g_copyLoot;
var mailBiz = require("uw-mail").mailBiz;

var userDao = null;
var userBiz = null;
var userUtils = null;
var copyProgressDao = null;
var propUtils = null;

var checkRequire = function() {
    userDao = require("uw-user").userDao;
    userBiz = require("uw-user").userBiz;
    userUtils = require("uw-user").userUtils;
    copyProgressDao = require("uw-copy").copyProgressDao;
    propUtils = require("uw-utils").propUtils;
};


/**
 * 获取和预掉落数据
 * @param userId
 * @param copyId
 * @param isBoss
 * @param userLvl
 * @param ignoreItems
 * @param needReckonJiZi
 * @param manyNum
 * @returns {{}}  {"唯一id":[[物品id,物品数量],..]}
 */
exports.getAndInitNextLoot = function(userId, copyId, isBoss, userLvl, ignoreItems, needReckonJiZi, manyNum) {
    var t_copyData = t_copy[copyId];
    var lootDic = {};
    var lootId = 0;
    var lootCount = 0;
    manyNum = manyNum || 1;
    switch (t_copyData.type) {
        case c_prop.copyTypeKey.normal: //普通副本
            if (isBoss) {
                lootId = t_copyData.bossLoot;
                lootCount = 1;
            } else {
                //lootId = t_copyData.loot;
                //lootCount = t_copyData.monsterCount*t_copyData.monsterTotal;
                //lootCount = t_copyData.monsterTotal;
                return _getAndInitNextLoot_NormalCopyNotBoss(userId, copyId, isBoss, userLvl, ignoreItems, needReckonJiZi);
            }
            break;
        default: //其他副本只预一个
            lootId = t_copyData.bossLoot;
            lootCount = 1;
            break;
    }
    //randMonsters
    var monsterId = t_copyData.randMonsters[0];

    var monsterLvl = 0;
    if (monsterId) {
        var monsterData = t_monster[monsterId];
        if (monsterData) {
            monsterLvl = monsterData.level;
        }
    }

    for (let i = 0; i < lootCount; i++) {
        var itemsArr = [];
        if (!isBoss && monsterLvl && userLvl - monsterLvl > c_game.lootLimit[0]) {
            ignoreItems = true;
        } else {
            for (let j = 0; j < manyNum; j++) {
                itemsArr = itemsArr.concat(fightUtils.getLootItems(lootId));
            }
        }

        //泰勒的梦境魔法 活动期间内 部分副本掉落双倍
        var activityData = g_cache.getActivityDataByType_InTime(c_prop.activityTypeKey.taylorDreamMagic);
        var copyType = t_copyData.type;
        if (activityData) {
            var day = new Date().getDay();
            var actCfg = activityData.exValues || {};
            var doubleLootTypes = actCfg[day] || {};
            var lootRate = doubleLootTypes[copyType];
            lootRate = parseInt(lootRate);
            // 周五 开启试炼双倍
            // 周六 开启材料双倍 vip7 vip10 vip14 vip17 vip19 vip21
            // 周日 开启深渊双倍
            if (lootRate && lootRate > 0) {
                // console.error('in activity taylorDreamMagic=================day=lootRate======',day,lootRate);
                // console.error('before double itemsArr=====>',itemsArr);
                for (let k = 0; k < itemsArr.length; k++) {
                    var locItemData = itemsArr[k];
                    if (!locItemData) continue;
                    locItemData[1] = parseInt(locItemData[1]) * lootRate;
                }
                // console.error('after double itemsArr=====>',itemsArr);
                //userExpRate += 1;//经验也翻倍
                // console.error('userExpRate=====>',userExpRate);
            }
        }
        //泰勒的梦境魔法 end
        var uid = g_copyLoot.newOneItems(userId, copyId, itemsArr, isBoss, ignoreItems);
        lootDic[uid] = itemsArr;
    }

    return lootDic;
};

/**
 * 预加载掉落
 * @param client
 * @param userId
 * @param copyId
 * @param lvl
 * @param cb
 * @returns {*}
 */
exports.preLoot = function(client, userId, copyId, lvl, cb) {
    checkRequire();
    var preTimeData = g_data.getPreLootTime(userId);
    var intervalTime = c_game.battleSet[1];
    // var isTime5Error = false;
    // var isTime1Error = false;
    var isError = false;
    if (preTimeData) {
        var errorNum = preTimeData[0];
        var preTime = preTimeData[1];
        var diffMilliseconds = preTime.getMillisecondsBetween(new Date());

        if (diffMilliseconds < intervalTime * 1000 - 800) {
            errorNum++;
            isError = true;
        }
        //连续5次异常
        // if(errorNum>=5){
        //     errorNum = 0;
        //     isTime5Error = true;
        // }
        if (isError) {
            g_data.setPreLootTime(userId, [errorNum, preTime]);
        } else {
            g_data.setPreLootTime(userId, [errorNum, new Date()]);
        }
    } else {
        g_data.setPreLootTime(userId, [0, new Date()]);
    }
    /*
        var onlineLootData = g_data.getOnlineLootData(userId);
        onlineLootData[0] = new Date();

        g_data.setOnlineLootData(userId,onlineLootData);
    */

    var ignoreItems = false;
    if (isError) {
        console.error("时间异常，没有掉落1111111111111111111");
        ignoreItems = true;
    } else {
        //console.error("时间正常，有掉落122222222222222222222");
    }
    //---------------------集字活动-----------------
    //var isJiZiActivityOpen = g_cache.getActivityDataByType_InTime(c_prop.activityTypeKey.setTheWord);
    var isJiZiActivityOpenList = g_cache.getActivityListByType_InTime(c_prop.activityTypeKey.setTheWord);

    // console.error('fightBiz===isJiZiActivityOpen=====>',isJiZiActivityOpen);
    var needReckonJiZi = false; //是否需要计算集字掉落
    for (let i = 0; i < isJiZiActivityOpenList.length; i++) {
        var isJiZiActivityOpen = isJiZiActivityOpenList[i];
        if (isJiZiActivityOpen && isJiZiActivityOpen.exValues2 && isJiZiActivityOpen.exValues2[0]) {
            var jiZiIntervalTime = 60 * 1000; //计算集字掉落的间隔时间
            var jiZiLootTime = g_data.getJiZiLootTime(userId);
            if (jiZiLootTime) {
                var betweenMilliseconds = jiZiLootTime.getMillisecondsBetween(new Date());
                if (betweenMilliseconds > jiZiIntervalTime) {
                    needReckonJiZi = true;
                }
                if (needReckonJiZi) {
                    g_data.setJiZiLootTime(userId, new Date());
                    break;
                }
            } else {
                needReckonJiZi = true;
                g_data.setJiZiLootTime(userId, new Date());
                break;
            }
        }
    }
    var lootData = exports.getAndInitNextLoot(userId, copyId, false, lvl, ignoreItems, needReckonJiZi, 1);
    // console.log('-------------------lootData----------------------',lootData);
    // if(isTime5Error){
    //     userBiz.setTimeError(client, userId, function(){
    //         cb(null,lootData);
    //     });
    // }else{
    //     cb(null,lootData);
    // }
    cb(null, lootData);
};

/**
 * 杀死怪物接口，这里会存储金币
 * @param client
 * @param userId
 * @param uidDataArr  [[copyId,uid,isBoss],.....]
 * @param isBoss
 * @param manyNum
 * @param cb
 */
exports.pickLoot = function(client, userId, uidDataArr, isBoss, manyNum, cb) {
    checkRequire();
    //todo 验证数据

    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var bagItems = {};
        var mailItems = {};
        var equipBagItems = {};
        var getDiamond = 0;
        var oldDiamond = userData.diamond;

        if (uidDataArr[0] && uidDataArr[0][0] && t_copy[uidDataArr[0][0]].type == c_prop.copyTypeKey.paTa) {
            //记录爬塔最高层数
            var section = c_game.towerCopy[0].split(","); //爬塔副本id区间
            var highPaTa = uidDataArr[0][0] - parseInt(section[0]) + 1;
            if (highPaTa > userData.highPaTa) userData.highPaTa = highPaTa;
        }

        var userExpAll = 0;
        var goldsAll = 0;
        // console.error("pickLoot  uidDataArr",uidDataArr);
        for (var i = 0; i < uidDataArr.length; i++) {
            var locData = uidDataArr[i];
            var copyId = locData[0],
                uid = locData[1],
                isBoss = locData[2];
            // console.error('iiiiiiiiii',i);
            if (!g_copyLoot.hasUid(userId, copyId, uid)) {
                // console.error('continue1 i ',userId, copyId, uid, i);
                continue;
            }

            var t_copyData = t_copy[copyId];

            var itemsArrData = g_copyLoot.getItemsByUid(userId, copyId, uid) || [
                [], false
            ];
            var itemsArr = itemsArrData[0] || [];
            var itemsIsBoss = itemsArrData[1] || false;
            var ignoreItems = itemsArrData[2] || false;
            // console.error('ignoreItems',ignoreItems);
            if (ignoreItems) continue;
            // console.error('itemsIsBoss != isBoss',itemsIsBoss != isBoss);
            if (itemsIsBoss != isBoss) continue;
            // 金币获取加成
            var userAddGoldRate = 0;
            var exData = userData.exData || {};
            if (!isBoss) {
                userAddGoldRate = fightUtils.getSelfBuffAddGoldRate(userData);
                var goldSkillPro = 0;
                if (exData[c_prop.userExDataKey.talismanSkill] && exData[c_prop.userExDataKey.talismanSkill][c_prop.talismanSkillTypeKey.gold]) {
                    var skillArr = exData[c_prop.userExDataKey.talismanSkill][c_prop.talismanSkillTypeKey.gold] || [];
                    for (var k = 0; k < skillArr.length; k++) {
                        var skillId = skillArr[k];
                        if (t_talismanSkill[skillId]) {
                            goldSkillPro += parseInt(t_talismanSkill[skillId].effect[0][0]);
                        }
                    }
                }
                //console.error("goldSkillPro:", goldSkillPro);
                userAddGoldRate += goldSkillPro / 10000;
            }
            var influences = {};
            influences[c_prop.itemTypeKey.gold] = userAddGoldRate;
            //console.error("influences:", userAddGoldRate);

            var locItem = {};
            for (var j = 0; j < itemsArr.length; j++) {
                var locItemData = itemsArr[j];
                if (!locItemData) continue;

                locItem[locItemData[0]] = locItem[locItemData[0]] || 0;
                locItem[locItemData[0]] += locItemData[1];

                goldsAll += (locItem[c_prop.spItemIdKey.gold] || 0);
            }

            //获取经验
            var monsterId = 1;
            var userAddExpRate = 0;
            if (isBoss) {
                monsterId = t_copyData.bossID;
            } else {
                monsterId = t_copyData.randMonsters[0];
                userAddExpRate = fightUtils.getSelfBuffAddExpcRate(userData);
            }

            var userExp = t_monster[monsterId].userExp;
            var userExpRate = fightUtils.getBuffExpcRate();
            userExpRate += userAddExpRate;

            //泰勒的梦境魔法 活动期间内 部分副本掉落双倍
            var activityData = g_cache.getActivityDataByType_InTime(c_prop.activityTypeKey.taylorDreamMagic);
            var copyType = t_copyData.type;
            if (activityData) {
                var day = new Date().getDay();
                var actCfg = activityData.exValues || {};
                var doubleLootTypes = actCfg[day] || {};
                var lootRate = doubleLootTypes[copyType];
                lootRate = parseInt(lootRate);
                // 周五 开启试炼双倍
                // 周六 开启材料双倍 vip7 vip10 vip14 vip17 vip19 vip21
                // 周日 开启深渊双倍
                if (lootRate && lootRate > 0) {
                    //  console.error('in activity taylorDreamMagic=================day=lootRate======',day,lootRate);
                    //  console.error('before double locItem=====>',locItem);
                    // for (var key in locItem) {
                    //     locItem[key] = parseInt(locItem[key]) * lootRate;
                    // }
                    //  console.error('after double locItem=====>',locItem);
                    userExpRate += 1; //经验也翻倍
                    // console.error('userExpRate=====>',userExpRate);
                }
            }
            //泰勒的梦境魔法 end
            //深渊多倍进入 经验翻倍
            manyNum = manyNum || 1;
            if (manyNum > 1) {
                userExpRate += parseInt(manyNum) - 1;
            }
            //end 深渊多倍进入
            // console.error('monsterId:',monsterId,'userExp:',userExp,'userExpRate:',userExpRate);
            //多倍经验
            userExp = userExp * userExpRate;
            //技能影响
            var skillPro = 0;
            var exData = userData.exData || {};
            if (exData[c_prop.userExDataKey.talismanSkill] && exData[c_prop.userExDataKey.talismanSkill][c_prop.talismanSkillTypeKey.exp]) {
                var skillArr = exData[c_prop.userExDataKey.talismanSkill][c_prop.talismanSkillTypeKey.exp];
                for (var l = 0; l < skillArr.length; l++) {
                    var skillId = skillArr[l];
                    if (t_talismanSkill[skillId]) {
                        skillPro += parseInt(t_talismanSkill[skillId].effect[0][0]);
                    }
                }
            }
            userExp = userExp * (skillPro / 10000 + 1);
            // console.error('addUserExpc===》',userExp);
            userUtils.addUserExpc(userData, userExp);
            userExpAll += userExp;

            var saveItemsArr = userUtils.saveItems(userData, locItem, c_prop.itemGetTypeKey.pickLoot, influences, !isBoss);
            if (isBoss) {
                if (Object.keys(saveItemsArr[5]).length > 0) mailItems = propUtils.mergerProp(mailItems, saveItemsArr[5]);
            }
            if (Object.keys(saveItemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, saveItemsArr[0]);
            if (Object.keys(saveItemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, saveItemsArr[1]);
            //移除掉落
            g_copyLoot.delByUid(userId, copyId, uid);
        }

        // gold,diamond,buyDiamond,giveDiamond,strength,strengthReTime,bag
        // console.log("********",bagItems);
        var updateUser = {
            gold: userData.gold,
            lvl: userData.lvl,
            magicLvl: userData.magicLvl,
            expc: userData.expc,
            rebirthExp: userData.rebirthExp,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            onlineLootData: userData.onlineLootData,
            infuseExpc: userData.infuseExpc,
            highPaTa: userData.highPaTa,
            strength: userData.strength,
            strengthReTime: userData.strengthReTime
        };

        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));

        getDiamond = userData.diamond - oldDiamond;
        cb(null, [updateUser, null, bagItems, equipBagItems, getDiamond, mailItems]);
    });
};

/**
 * 复活
 * @param client
 * @param userId
 * @param cb
 */
exports.revive = function(client, userId, cb) {
    checkRequire();
    //消耗
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.gold, 100, c_prop.goldCostTypeKey.revive);
        var updateUser = {
            gold: userData.gold
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        cb(null, updateUser);
    });
};


var _calLootCount = function(userId, copyId, expc, getGold, userData) {

    //小时，金币
    //小时，波怪
    var onlineLootData = g_data.getOnlineLootData(userId);

    //[上一次预掉落时间，累计次数,累计时间,累计金币，累计经验,副本id]
    var preTime = onlineLootData[0],
        addNum = onlineLootData[1] | 0,
        addSeconds = onlineLootData[2],
        addGolds = onlineLootData[3] || 0,
        addExpc = onlineLootData[4] || 0,
        curCopyId = onlineLootData[5] || 0,
        numMillSeconds = onlineLootData[6] || 0;
    var oldCopyId = copyId;
    var nowDate = new Date();
    var difSeconds = preTime.getSecondsBetween(nowDate);
    if (difSeconds < 5) difSeconds = 5;
    if (difSeconds > 20) difSeconds = 20;
    var difMilliseconds = preTime.getMillisecondsBetween(nowDate);
    if (copyId != oldCopyId) {
        addNum = 1;
        addSeconds = difSeconds;
        addGolds = getGold;
        addExpc = expc;
        curCopyId = copyId;
        numMillSeconds = difMilliseconds;
    } else {
        addNum += 1;
        addSeconds += difSeconds;
        addGolds += getGold;
        addExpc += expc;
        numMillSeconds += difMilliseconds;

    }
    //在线掉落数据[每秒经验,每秒金币,每波怪多少秒,是否统计];
    var userOnlineLootData = userData.onlineLootData;

    //超过10分钟才开始保存数据
    if (numMillSeconds > 10 * 3600 * 1000) {
        //这里保存一次服务器
        var perExpc = parseInt(addExpc / addSeconds); //每秒经验
        var perGold = parseInt(addGolds / addSeconds); //每秒金币

        var perMonsterSec = parseInt(numMillSeconds / addNum) / 1000; //每波怪多少秒
        userData.onlineLootData = [perExpc, perGold, perMonsterSec, 2]; //
        //addNum = 0;
        //numMillSeconds = 0;
    }


    onlineLootData[1] = addNum;
    onlineLootData[2] = addSeconds;
    onlineLootData[3] = addGolds;
    onlineLootData[4] = addExpc;
    onlineLootData[5] = curCopyId;
    onlineLootData[6] = numMillSeconds;
    g_data.setOnlineLootData(userId, onlineLootData);
};

var _getAndInitNextLoot_NormalCopyNotBoss = function(userId, copyId, isBoss, userLvl, ignoreItems, needReckonJiZi) {
    var t_copyData = t_copy[copyId];
    var lootDic = {};
    var lootId = 0;
    var lootCount = t_copyData.loot.length;
    var monsterId = t_copyData.randMonsters[0];

    var monsterLvl = 0;
    if (monsterId) {
        var monsterData = t_monster[monsterId];
        if (monsterData) {
            monsterLvl = monsterData.level;
        }
    }

    for (var i = 0; i < lootCount; i++) {
        lootId = t_copyData.loot[i];
        var itemsArr = null;
        if (!isBoss && monsterLvl && userLvl - monsterLvl > c_game.lootLimit[0]) {
            ignoreItems = true;
        } else {

            itemsArr = fightUtils.getLootItems(lootId);
        }
        if (ignoreItems) {
            itemsArr = [];
        }
        var uid = g_copyLoot.newOneItems(userId, copyId, itemsArr, isBoss, ignoreItems);
        lootDic[uid] = itemsArr;
    }

    //集字掉落
    // console.log('-----------------needReckonJiZi-----------------',needReckonJiZi);
    if (needReckonJiZi) {
        //lootId = 430001;//集字掉落包
        //var activityDate = g_cache.getActivityDataByType_InTime(c_prop.activityTypeKey.setTheWord);
        var activityDateList = g_cache.getActivityListByType_InTime(c_prop.activityTypeKey.setTheWord);
        for (let i = 0; i < activityDateList.length; i++) {
            var activityDate = activityDateList[i];
            if (activityDate && activityDate.exValues2 && activityDate.exValues2[0]) {
                lootId = activityDate.exValues2[0];
                var itemsArr2 = fightUtils.getLootItems(lootId);
                // itemsArr2 = [[1983,1],[1984,1],[1985,1]];//测试用 必掉
                var uid2 = g_copyLoot.newOneItems(userId, copyId, itemsArr2, isBoss, ignoreItems);
                // console.log("========================================集字掉落========================================",itemsArr2);
                lootDic[uid2] = itemsArr2;
            }
        }
    }
    return lootDic;
};