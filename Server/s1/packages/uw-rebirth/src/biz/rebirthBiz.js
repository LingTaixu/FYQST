/**
 * Created by Administrator on 2016/1/20.
 */

var uwData = require("uw-data");
var c_prop = uwData.c_prop;
var t_rebirth = uwData.t_rebirth;
var c_msgCode = uwData.c_msgCode;
var c_game = uwData.c_game;
var getMsg = require("uw-utils").msgFunc(__filename);
var userUtils = require("uw-user").userUtils;
var async = require("async");
var heroPropHelper = require("uw-hero").heroPropHelper;
var propUtils = require("uw-utils").propUtils;
var g_cache = require("uw-global").g_cache;
var exports = module.exports;

var userDao = null;
var heroDao = null;
var chatBiz = null;
var guildBiz = null;
var heroBiz = null;

var checkRequire = function() {
    userDao = userDao || require("uw-user").userDao;
    heroDao = heroDao || require("uw-hero").heroDao;
    chatBiz = chatBiz || require("uw-chat").chatBiz;
    guildBiz = guildBiz || require("uw-guild").guildBiz;
    heroBiz = heroBiz || require("uw-hero").heroBiz;
};
/**
 * 获取转生信息
 * @param client
 * @param userId
 * @param cb
 */
exports.rebirth = function(client, userId, cb) {
    checkRequire();
    //userDao.select(client, {id: userId}, function(err, userData){
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var rebirthLvl = userData.rebirthLvl;
        var rebirthExp = userData.rebirthExp;
        var nextRebirthLvl = rebirthLvl + 1;
        var rebirthData = t_rebirth[nextRebirthLvl];
        if (rebirthData) {
            var needLvl = rebirthData.lvl;
            if (needLvl > userData.lvl) {
                return cb(getMsg(c_msgCode.topLvl)); //该等级不可提升
            }
            var needExp = rebirthData.exp;
            if (rebirthExp >= needExp) {
                userData.rebirthExp = rebirthExp - needExp;
                userData.rebirthLvl = nextRebirthLvl;
                gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);

                var heroList = gamePlayer.heroListData;
                if (heroList) {
                    for (var i = 0; i < heroList.length; i++) {
                        var locHero = heroList[i];
                        locHero.propArr = heroPropHelper.calHeroProp(userData, locHero);
                        locHero.combat = heroPropHelper.calCombat(userData, locHero);
                        gamePlayer.setHeroDataDirty(locHero.id);
                    }
                }

                var updateUserData = {
                    rebirthLvl: userData.rebirthLvl,
                    rebirthExp: userData.rebirthExp
                };

                heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.rebirthLvl, 1);

                guildBiz.checkGuildGift(client, userId, 5, userData.rebirthLvl, function(err, data) {
                });

                if (userData.rebirthLvl == 1) {
                    chatBiz.addSysData(125, [userData.nickName]); //第一次评级
                } else if (userData.rebirthLvl == 2) {
                    chatBiz.addSysData(127, [userData.nickName]); //第二次评级
                }
                return cb(null, [updateUserData, heroList]);
            } else {
                return cb(getMsg(c_msgCode.noExperience));
            }
        } else {
            return cb(getMsg(c_msgCode.topRank)); //已达最高评级
        }
    });
}


/**
 * 购买转生丹
 * @param index
 * @param num
 * @param client
 * @param userId
 * @param cb
 */
exports.buyRebirth = function(index, num, client, userId, cb) {
    if(num <= 0){
        return cb(getMsg(c_msgCode.paramsError));
    }
    checkRequire();
    //userDao.select(client,{id: userId}, function(err, userData) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var buyCount = 0; //已购买次数
        // var needGold = 0;//需要金币
        var needDiamond = 0; //需要钻石
        var buyMax = 0;
        var rebirthType = null;
        switch (index) {
            case 0:
                buyCount = userUtils.getTodayCount(userData, c_prop.userRefreshCountKey.buyPrimaryRebirth);
                rebirthType = c_prop.userRefreshCountKey.buyPrimaryRebirth;
                break;
            case 1:
                buyCount = userUtils.getTodayCount(userData, c_prop.userRefreshCountKey.buyMidRebirth);
                rebirthType = c_prop.userRefreshCountKey.buyMidRebirth;
                break;
            case 2:
                buyCount = userUtils.getTodayCount(userData, c_prop.userRefreshCountKey.buyAdvancedRebirth);
                rebirthType = c_prop.userRefreshCountKey.buyAdvancedRebirth;
                break;
            default:
                return cb(getMsg(c_msgCode.paramsError)); //参数有误
        }

        var limitStr = c_game.rebirth[2];
        var limitArr = limitStr.split(",");
        buyMax = limitArr[index] || 0;
        buyMax *= 1;
        var diamondStr = c_game.rebirth[1];
        var diamondArr = diamondStr.split(",");
        // needGold = diamondArr[index] || 0;
        needDiamond = diamondArr[index] || 0;

        if (buyCount + num > buyMax) return cb(getMsg(c_msgCode.buyLimitNow)); //每日限购
        // needGold *= num;
        // if(userData.gold < needGold){
        //     return cb(getMsg(c_msgCode.noGolds));
        // }
        needDiamond *= num;
        if (userData.diamond < needDiamond || needDiamond < 0) {
            return cb(getMsg(c_msgCode.noDiamond));
        }
        // userUtils.costCurrency(userData, c_prop.currencyTypeKey.gold, needGold);
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, needDiamond, c_prop.diamondCostTypeKey.shop, 0, 0, rebirthType);

        // userUtils.reduceDiamond(userData, needDiamond);
        userUtils.addTodayCount(userData, rebirthType, num);
        //购买逻辑
        var item = {};
        item[c_game.rebirth[0].split(",")[index]] = num;
        var bagItems = {};
        var equipBagItems = {};
        var itemsArr = userUtils.saveItems(userData, item, c_prop.itemGetTypeKey.rebirth);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);
        var updateData = {
            counts: userData.counts,
            countsRefreshTime: userData.countsRefreshTime,
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));

        cb(null, [updateData, bagItems, equipBagItems, needDiamond]);
    });
}