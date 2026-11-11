/**
 * Created by Administrator on 2014/5/16.
 */
var uwData = require("uw-data");
var c_game = uwData.c_game;
var c_prop = uwData.c_prop;
var c_vip = uwData.c_vip;
var consts = uwData.consts;
var c_msgCode = uwData.c_msgCode;
var c_guildAct = uwData.c_guildAct;
var c_guildFuncCfg = uwData.c_guildFuncCfg;
var c_guildGift = uwData.c_guildGift;
var c_reward = uwData.c_reward;
var async = require("async");
var getMsg = require("uw-utils").msgFunc(__filename);
var GuildPersonalEntity = require('uw-entity').GuildPersonalEntity;
var guildDao = require("../dao/guildDao.js");
var guildPersonalDao = require("../dao/guildPersonalDao.js");
var guildUtils = require("./guildUtils.js");
var g_guild = require("uw-global").g_guild;
var g_data = require("uw-global").g_data; 
var commonUtils = require("uw-utils").commonUtils;
var propUtils = require("uw-utils").propUtils;
var g_cache = require("uw-global").g_cache;
var itemBiz = null;
var userDao = null;
var userUtils = null;
var activityBiz = null;
var heroBiz = null;
var checkRequire = function() {
    userDao = require("uw-user").userDao;
    userUtils = require("uw-user").userUtils;
    itemBiz = require("uw-item").itemBiz;
    activityBiz = activityBiz || require("uw-activity").activityBiz;
    heroBiz = heroBiz || require("uw-hero").heroBiz;
};

var ds = require("uw-ds").ds;

var exports = module.exports;

/**
 * 除了上香之外的贡献
 * @param client
 * @param userId
 * @param actId
 * @param cb
 */


/**
 * 上香
 * @param client
 * @param userId
 * @param actId
 * @param cb
 * @returns {*}
 */
exports.pickAct = function(client, userId, actId, cb) {
    checkRequire();

    // 6.白檀香 7.紫檀香 8.天木香
    var guildActData = c_guildAct[actId];
    if (!guildActData) return cb(getMsg(c_msgCode.noData));//木有这个数据
    /*
     vi.	上白檀香：使用金币上香，每日有次数限制
     vii.	上紫檀香：使用元宝上香无次数限制，读取（【c_game(游戏配置)】【67】【参数1.2.3】
     viii.	上天木香：使用元宝上香无次数限制
     */
    async.parallel([
        function(cb1) {
            guildPersonalDao.select(client, { userId: userId }, cb1);
        },
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[1];
        var guildPersonalData = data[0], userData = gamePlayer.userData;
        var guildData = g_guild.getGuild(guildPersonalData.guildId);
        if (!guildData) return cb(getMsg(c_msgCode.outGuild));
        var costDiamond = 0, costGold = 0, addAct = guildActData.act, getGold = guildActData.gold;
        //判断次数
        var num = guildUtils.getActNum(guildPersonalData, actId);
        if (guildActData.num > 0) {
            if (num >= guildActData.num) return cb(getMsg(c_msgCode.todayLimit));//今日已经达到上限
        }

        //判断消耗
        //var vip = 0; // userData.vip;
        switch (guildActData.type) {
            case 6:
                costGold = c_game.guildAct[1];
                if (userData.gold < costGold) return cb(getMsg(c_msgCode.noGolds));//金币不足

                break;
            case 7:
                //参数10：元宝上香1
                //if(!c_vip[vip].isPickAct) return cb(getMsg(c_msgCode.noPrivilege));
                costDiamond = c_game.guildAct[9];
                if (userData.diamond < costDiamond || costDiamond < 0) return cb(getMsg(c_msgCode.noDiamond));
                break;
            case 8:
                //参数11：元宝上香2
                //if(!c_vip[vip].isPickAct) return cb(getMsg(c_msgCode.noPrivilege));
                costDiamond = c_game.guildAct[10];
                if (userData.diamond < costDiamond || costDiamond < 0) return cb(getMsg(c_msgCode.noDiamond));
                break;
            default :
                return cb(getMsg(c_msgCode.unknowType));//未知类型
                break;
        }

        // 捐献暴击
        if (guildPersonalData.actCrit == 1) {
            addAct *= 2;
        }

        // 下次暴击概率
        var n = _getRandomNumber(0, 10000);
        if (n <= c_game.guildAct[12]) {
            guildPersonalData.actCrit = 1;
        } else {
            guildPersonalData.actCrit = 0;
        }

        //扣除消耗
        if (costDiamond > 0) {
            userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.guildAct);
            activityBiz.recordLachelFitnessValue(client,userId, c_prop.lachelActTaskTypeKey.guildDiamondNum, 1, null, function(){});
        }
        if (costGold > 0) {
            userUtils.costCurrency(userData, c_prop.currencyTypeKey.gold, costGold, c_prop.goldCostTypeKey.guildAct);
        }
        //得到金币
        if (getGold > 0) {
            userUtils.addCurrency(userData, c_prop.currencyTypeKey.gold, getGold, c_prop.itemGetTypeKey.guildAct);
        }
        heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.guildAct, 1);

        var getItemId = c_prop.spItemIdKey.guildAct;
        var bagItems = {};
        bagItems[getItemId] = addAct;
        userUtils.saveItems(userData, bagItems, c_prop.itemGetTypeKey.guildAct);

        //增加次数
        guildUtils.addActNum(guildPersonalData, actId, 1);
        //增加贡献
        guildUtils.addTodayAct(guildPersonalData, addAct);

        //行会贡献
        guildUtils.addGuildAct(guildData, addAct);

        // 福利值
        guildUtils.addFuli(guildData, guildActData.fuli);

        guildUtils.checkGuildGiftData(guildPersonalData, 3, actId);
        activityBiz.recordCarnivalValue(client, userId, c_prop.carnivalTaskTypeKey.guildAct, 1, function() {
        });
        var updateUser = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);

        var updateGuildPersonal = {
            todayAct: guildPersonalData.todayAct,
            exitGuildCount: guildPersonalData.exitGuildCount,
            lotteryCount: guildPersonalData.lotteryCount,
            actLastTime: guildPersonalData.actLastTime,
            noticeCount: guildPersonalData.noticeCount,
            addUpAct: guildPersonalData.addUpAct,
            actData: guildPersonalData.actData,
            guildAct: guildPersonalData.guildAct,
            giftData: guildPersonalData.giftData,
            weekHydChests: guildPersonalData.weekHydChests,
            todayHydChests: guildPersonalData.todayHydChests,
            weekRefreshTime: guildPersonalData.weekRefreshTime,
            fuliChests: guildPersonalData.fuliChests,
            actCrit: guildPersonalData.actCrit
        };

        var updateGuild = {
            addUpAct: guildData.addUpAct,
            lvl: guildData.lvl,
            hydData: guildData.hydData,
            fuli: guildData.fuli
        };

        g_guild.setGuild(guildData.id, guildData);

        async.parallel([
            function(cb1) {
                guildPersonalDao.update(client, updateGuildPersonal, { id: guildPersonalData.id }, cb1);
            }
        ], function(err, data) {
            if (err) return cb(err);
            cb(null, [updateUser, updateGuild, updateGuildPersonal, costDiamond, costGold, addAct, bagItems]);
        });
    });
};

//获取成员
exports.getMemberList = function(client, userId, cb) {
    guildPersonalDao.select(client, { userId: userId }, function(err, guildPersonalData) {
        if (err) return cb(err);
        if (!guildPersonalData || !guildPersonalData.guildId) return cb(null, []);
        guildPersonalDao.getPersonUserList(client, guildPersonalData.guildId, function(err, personalUserList) {
            if (err) return cb(err);
            var reMemberList = [];
            for (var i = 0; i < personalUserList.length; i++) {
                var locData = personalUserList[i];
                var lastUpdate = locData.lastUpdateTime;
                var locMember = new ds.GuildMember();
                locMember.lvl = locData.lvl;//等级
                locMember.magicLvl = locData.magicLvl;//等级
                locMember.nickName = locData.nickName;//昵称
                locMember.combat = locData.combat;//战力
                locMember.guildAct = locData.guildAct;//累计贡献
                locMember.position = locData.position;//职能
                locMember.ennoble = locData.ennoble;//爵位
                locMember.lastUpdateTime = lastUpdate;//最后更新时间
                locMember.iconId = locData.iconId;//头像
                locMember.vip = locData.vip;//vip
                locMember.userId = locData.userId;//vip
                locMember.offlineHour = 0;
                if (lastUpdate) {
                    var minute = (new Date().getTime() - lastUpdate.getTime()) / 1000 / 60;
                    if (minute > 2) {
                        var hour = Math.ceil((minute / 60));
                        locMember.offlineHour = hour;
                    }
                }
                reMemberList.push(locMember);
            }
            cb(null, reMemberList);
        });
    });
};

//操作会员
exports.opMember = function(client, userId, targetUserId, op, cb) {
    async.parallel([
        function(cb1) {
            guildPersonalDao.select(client, { userId: userId }, cb1);
        },
        function(cb1) {
            guildPersonalDao.select(client, { userId: targetUserId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var mPersonalData = data[0], tPersonalData = data[1];
        if (mPersonalData.guildId != tPersonalData.guildId) return cb(getMsg(c_msgCode.notInSameGild));//该玩家不在同一个行会
        var guildData = g_guild.getGuild(mPersonalData.guildId);
        if (!guildData) return cb(getMsg(c_msgCode.outGuild));
        _opMember(mPersonalData, tPersonalData, guildData, op, function(err, data) {
            if (err) return cb(err);
            var updateMPersonal = {
                position: mPersonalData.position
            };

            var updateTPersonal = {
                guildId: tPersonalData.guildId,
                position: tPersonalData.position,
                viceTime: tPersonalData.viceTime,
                todayAct: tPersonalData.todayAct,
                guildAct: tPersonalData.guildAct,
                lastQuipGuildTime: tPersonalData.lastQuipGuildTime,
                exitGuildCount: tPersonalData.exitGuildCount,
                lotteryCount: tPersonalData.lotteryCount,
                actLastTime: tPersonalData.actLastTime,
                noticeCount: tPersonalData.noticeCount,
                addUpAct: tPersonalData.addUpAct,
                actData: tPersonalData.actData,
                giftData: tPersonalData.giftData,
                weekHydChests: tPersonalData.weekHydChests,
                todayHydChests: tPersonalData.todayHydChests,
                weekRefreshTime: tPersonalData.weekRefreshTime,
                fuliChests: tPersonalData.fuliChests,
                actCrit: tPersonalData.actCrit
            };

            var updateGuild = {
                chairmanId: guildData.chairmanId,
                viceChairmanId: guildData.viceChairmanId,
                guildPopulation: guildData.guildPopulation
            };
            g_guild.setGuild(guildData.id, guildData);
            async.parallel([
                function(cb1) {
                    guildPersonalDao.update(client, updateMPersonal, { id: mPersonalData.id }, cb1);
                },
                function(cb1) {
                    guildPersonalDao.update(client, updateTPersonal, { id: tPersonalData.id }, cb1);
                }
            ], function(err, data) {
                if (err) return cb(err);
                cb(null, [updateGuild, updateMPersonal]);
            });
        });
    });
};

//初始化公会id
exports.initGuildIdToGlobal = function(client, userId, cb) {
    guildPersonalDao.selectCols(client, "guildId,ennoble", " userId = ?", [userId], function(err, data) {
        if (err) return cb(err);
        if (!data) {
            g_data.setGuildId(userId, null);
            g_data.setGuildEnnoble(userId, null);
            return cb(null);
        }
        g_data.setGuildId(userId, data.guildId);
        g_data.setGuildEnnoble(userId, data.ennoble);
        cb(null);
    });
};

//获取公会名称
exports.getGuildNameByUserIds = function(client, userIds, cb) {
    var reData = {};
    if (userIds.length <= 0) return cb(null, reData);
    guildPersonalDao.listCols(client, "userId, guildId", " userId in (?)", [userIds], function(err, dataList) {
        if (err) return cb(err);
        for (var i = 0; i < dataList.length; i++) {
            var locData = dataList[i];
            reData[locData.userId] = g_guild.getGuildName(locData.guildId);
        }
        cb(null, reData);
    });
};

// 获得所有用户的公会名字
exports.getAllGuildUsers = function(client, cb) {
    guildPersonalDao.listCols(client, "userId, guildId", " 1=1 ", [], function(err, dataList) {
        if (err) return cb(err);
        var reData = {};
        for (var i = 0; i < dataList.length; i++) {
            var locData = dataList[i];
            reData[locData.userId] = g_guild.getGuildName(locData.guildId);
        }
        cb(null, reData);
    });
};

exports.getGift = function(client, userId, id, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            guildPersonalDao.select(client, { userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData, guildPersonalData = data[1];
        var guildData = g_guild.getGuild(guildPersonalData.guildId);
        if (!guildData) return cb(getMsg(c_msgCode.rewardInGild));//你需要加入行会里才能领取

        var c_giftData = c_guildGift[id];
        if (!c_giftData) {
            return cb(getMsg(c_msgCode.giftBagUnexist));//礼包不存在
        }

        var giftData = guildPersonalData.giftData || {};
        if (!giftData[id]) {
            return cb(getMsg(c_msgCode.giftBagData));//礼包数据不存在
        }

        if (giftData[id][0] == 0) {
            return cb(getMsg(c_msgCode.giftNonstandard));//条件未达到
        }

        if (giftData[id][1] == 1) {
            return cb(getMsg(c_msgCode.giftBagReward));//礼包已领取
        }

        giftData[id][1] = 1;

        var rewardId = c_giftData.rewardId;
        var returnItems = {};
        //领取奖励
        // 金币
        var gold = c_reward[rewardId].gold;
        if (gold > 0) {
            userUtils.addCurrency(userData, c_prop.currencyTypeKey.gold, gold, c_prop.itemGetTypeKey.guildGrown);
            returnItems[c_prop.spItemIdKey.gold] = gold;
        }
        //钻石
        var diamond = c_reward[rewardId].diamond;
        if (diamond > 0) {
            userUtils.addCurrency(userData, c_prop.currencyTypeKey.diamond, diamond, c_prop.itemGetTypeKey.guildGrown);
            returnItems[c_prop.spItemIdKey.diamond] = diamond;
        }
        //物品
        var itemsArr = [];
        var bagItems = {};
        //var equipBagItems = {};
        var items = c_reward[rewardId].rewardItems;
        var achieveExp = 0;
        if (JSON.stringify(items) != "{}") {
            itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.guildGrown);
            if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
            //if(Object.keys(itemsArr[1]).length>0) equipBagItems = propUtils.mergerProp(equipBagItems,itemsArr[1]);
            returnItems = propUtils.mergerProp(returnItems, items);
        }

        //更新
        var updateData = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            prestige: userData.prestige
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        var updateGuildPersonalData = {
            giftData: guildPersonalData.giftData
        };
        async.parallel([
            function(cb1) {
                guildPersonalDao.update(client, updateGuildPersonalData, { userId: userId }, cb1);
            }
        ], function(err, data1) {
            if (err) return cb(err);
            return cb(null, [updateData, updateGuildPersonalData, bagItems, diamond]);
        });
    });
}

/**
 * 领取活跃度宝箱
 * @param client
 * @param userId
 * @param index   宝箱下标
 * @param cb
 */
exports.getGTVitalityChest = function(client, userId, index, cb) {
    if (index < 0 || index > 4) return cb(getMsg(c_msgCode.dayHydUnenough));
    checkRequire();
    async.parallel([
        function(cb1) {
            //userDao.select(client,{id:userId},cb1);
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            guildPersonalDao.select(client, { userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData, guildPersonalData = data[1];
        var guildData = g_guild.getGuild(guildPersonalData.guildId);
        if (!guildData) return cb(getMsg(c_msgCode.outGuild));
        guildUtils.calRefreshGuildData(guildData);
        guildUtils.calRefreshGuildPersonalData(guildPersonalData);

        var nowTime = new Date();
        if (!guildData.todayHydRefreshTime) return cb(getMsg(c_msgCode.dayHydUnenough));//日活跃度不足
        if (!guildData.todayHydRefreshTime.equalsDay(nowTime)) return cb(getMsg(c_msgCode.dayHydUnenough));//日活跃度不足
        var vitality = guildData.todayHyd;     //活跃度
        var needVitality = c_game.guildVitalityCfg[index];     //需要的活跃度
        if (vitality < needVitality) return cb(getMsg(c_msgCode.dayHydUnenough));//日活跃度不足
        var vitalityChests = guildPersonalData.todayHydChests || [0, 0, 0, 0, 0];
        if (vitalityChests[index] == 1) return cb(getMsg(c_msgCode.hasReward));//已领取");

        var chestId = c_game.guildVitalityCfg[index + 5];
        var logicItems = itemBiz.calLogicItems(chestId);        //随机的物品
        var getDiamond = 0;
        if (logicItems[c_prop.spItemIdKey.diamond]) {
            getDiamond = logicItems[c_prop.spItemIdKey.diamond];
        }
        //获得物品
        var bagItems = {};
        //var equipBagItems = {};
        var itemsArr = userUtils.saveItems(userData, logicItems, c_prop.itemGetTypeKey.guildHydChest);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        //if(Object.keys(itemsArr[1]).length>0) equipBagItems = propUtils.mergerProp(equipBagItems,itemsArr[1]);
        //数据改变
        guildPersonalData.actLastTime = nowTime;
        vitalityChests[index] = 1;
        guildPersonalData.todayHydChests = vitalityChests;
        //更新
        var updateData = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        var updateGuildPersonalData = {
            todayAct: guildPersonalData.todayAct,
            exitGuildCount: guildPersonalData.exitGuildCount,
            lotteryCount: guildPersonalData.lotteryCount,
            actLastTime: guildPersonalData.actLastTime,
            noticeCount: guildPersonalData.noticeCount,
            addUpAct: guildPersonalData.addUpAct,
            actData: guildPersonalData.actData,
            guildAct: guildPersonalData.guildAct,
            giftData: guildPersonalData.giftData,
            weekHydChests: guildPersonalData.weekHydChests,
            todayHydChests: guildPersonalData.todayHydChests,
            weekRefreshTime: guildPersonalData.weekRefreshTime,
            fuliChests: guildPersonalData.fuliChests,
            actCrit: guildPersonalData.actCrit
        };
        async.parallel([
            function(cb1) {
                guildPersonalDao.update(client, updateGuildPersonalData, { userId: userId }, cb1);
            }
        ], function(err, data1) {
            if (err) return cb(err);
            return cb(null, [updateData, updateGuildPersonalData, bagItems, getDiamond]);
        });
    });
}

/**
 * 领取周活跃度宝箱
 * @param client
 * @param userId
 * @param index   宝箱下标
 * @param cb
 */
exports.getGWVitalityChest = function(client, userId, index, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            guildPersonalDao.select(client, { userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData, guildPersonalData = data[1];

        var guildData = g_guild.getGuild(guildPersonalData.guildId);
        if (!guildData) return cb(getMsg(c_msgCode.outGuild));
        guildUtils.calRefreshGuildData(guildData);
        guildUtils.calRefreshGuildPersonalData(guildPersonalData);

        var nowTime = new Date();
        if (!guildData.weekHydRefreshTime) return cb(getMsg(c_msgCode.weekHydUnenough));//周活跃度不足
        //if(!guildPersonalData.actLastTime.equalsDay(nowTime)) return cb(getMsg(c_msgCode.dayHydUnenough));//日活跃度不足
        if (guildData.weekHydRefreshTime.getWeekNumber() != nowTime.getWeekNumber())
            return cb(getMsg(c_msgCode.weekHydUnenough));//周活跃度不足

        var vitality = guildData.weekHyd;     //活跃度
        var needVitality = c_game.guildWeekVitalityCfg[index];     //需要的活跃度
        if (vitality < needVitality) return cb(getMsg(c_msgCode.weekHydUnenough));//周活跃度不足
        var vitalityChests = guildPersonalData.weekHydChests || [0, 0, 0];
        if (vitalityChests[index] == 1) return cb(getMsg(c_msgCode.hasReward));//已领取");

        var chestId = c_game.guildWeekVitalityCfg[index + 3];
        var logicItems = itemBiz.calLogicItems(chestId);        //随机的物品
        var getDiamond = 0;
        if (logicItems[c_prop.spItemIdKey.diamond]) {
            getDiamond = logicItems[c_prop.spItemIdKey.diamond];
        }
        //获得物品
        var bagItems = {};
        // var equipBagItems = {};
        var itemsArr = userUtils.saveItems(userData, logicItems, c_prop.itemGetTypeKey.guildWeekHydChest);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        //if(Object.keys(itemsArr[1]).length>0) equipBagItems = propUtils.mergerProp(equipBagItems,itemsArr[1]);
        //数据改变 

        vitalityChests[index] = 1;
        guildPersonalData.weekHydChests = vitalityChests;
        //更新
        var updateData = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        var updateGuildPersonalData = {
            todayAct: guildPersonalData.todayAct,
            exitGuildCount: guildPersonalData.exitGuildCount,
            lotteryCount: guildPersonalData.lotteryCount,
            actLastTime: guildPersonalData.actLastTime,
            noticeCount: guildPersonalData.noticeCount,
            addUpAct: guildPersonalData.addUpAct,
            actData: guildPersonalData.actData,
            guildAct: guildPersonalData.guildAct,
            giftData: guildPersonalData.giftData,
            weekHydChests: guildPersonalData.weekHydChests,
            todayHydChests: guildPersonalData.todayHydChests,
            weekRefreshTime: guildPersonalData.weekRefreshTime,
            fuliChests: guildPersonalData.fuliChests,
            actCrit: guildPersonalData.actCrit
        };


        //console.error("guildPersonalData:", guildPersonalData);
        async.parallel([
            function(cb1) {
                guildPersonalDao.update(client, updateGuildPersonalData, { userId: userId }, cb1);
            }
        ], function(err, data1) {
            if (err) return cb(err);
            return cb(null, [updateData, updateGuildPersonalData, bagItems, getDiamond]);
        });
    });
}

/**
 * 领取日福利宝箱
 * @param client
 * @param userId
 * @param index   宝箱下标
 * @param cb
 */
exports.getFuliChest = function(client, userId, index, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            guildPersonalDao.select(client, { userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData, guildPersonalData = data[1];
        var guildData = g_guild.getGuild(guildPersonalData.guildId);
        if (!guildData) return cb(getMsg(c_msgCode.outGuild));
        guildUtils.calRefreshGuildData(guildData);
        guildUtils.calRefreshGuildPersonalData(guildPersonalData);

        var nowTime = new Date();
        if (!guildData.todayHydRefreshTime) return cb(getMsg(c_msgCode.benefitsUnenough));//公会福利值不足
        if (!guildData.todayHydRefreshTime.equalsDay(nowTime)) return cb(getMsg(c_msgCode.benefitsUnenough));//公会福利值不足
        var vitality = guildData.fuli;     //福利值
        var needVitality = c_game.guildFuliCfg[index];     //需要的活跃度
        if (vitality < needVitality) return cb(getMsg(c_msgCode.benefitsUnenough));//公会福利值不足
        var vitalityChests = guildPersonalData.fuliChests || [0, 0, 0];
        if (vitalityChests[index] == 1) return cb(getMsg(c_msgCode.hasReward));//已领取");

        var chestId = c_game.guildFuliCfg[index + 3];
        var logicItems = itemBiz.calLogicItems(chestId);        //随机的物品
        var getDiamond = 0;
        if (logicItems[c_prop.spItemIdKey.diamond]) {
            getDiamond = logicItems[c_prop.spItemIdKey.diamond];
        }
        //获得物品
        var bagItems = {};
        //var equipBagItems = {};
        var itemsArr = userUtils.saveItems(userData, logicItems, c_prop.itemGetTypeKey.guildFuliChest);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        //if(Object.keys(itemsArr[1]).length>0) equipBagItems = propUtils.mergerProp(equipBagItems,itemsArr[1]);
        //数据改变
        guildPersonalData.actLastTime = nowTime;
        vitalityChests[index] = 1;
        guildPersonalData.fuliChests = vitalityChests;
        //更新
        var updateData = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        var updateGuildPersonalData = {
            todayAct: guildPersonalData.todayAct,
            exitGuildCount: guildPersonalData.exitGuildCount,
            lotteryCount: guildPersonalData.lotteryCount,
            actLastTime: guildPersonalData.actLastTime,
            noticeCount: guildPersonalData.noticeCount,
            addUpAct: guildPersonalData.addUpAct,
            actData: guildPersonalData.actData,
            guildAct: guildPersonalData.guildAct,
            giftData: guildPersonalData.giftData,
            weekHydChests: guildPersonalData.weekHydChests,
            todayHydChests: guildPersonalData.todayHydChests,
            weekRefreshTime: guildPersonalData.weekRefreshTime,
            fuliChests: guildPersonalData.fuliChests,
            actCrit: guildPersonalData.actCrit
        };
        async.parallel([
            function(cb1) {
                guildPersonalDao.update(client, updateGuildPersonalData, { userId: userId }, cb1);
            }
        ], function(err, data1) {
            if (err) return cb(err);
            return cb(null, [updateData, updateGuildPersonalData, bagItems, getDiamond]);
        });
    });
}


var _opMember = function(mPersonalData, tPersonalData, guildData, op, cb) {
    var guildFuncData = c_guildFuncCfg[mPersonalData.position];
    if (!guildFuncData) return cb(null);
    switch (op) {
        case c_prop.guildMemberOpKey.trans:
            //转让会长
            //判断权限
            if (!guildFuncData.upToChairman) return cb(getMsg(c_msgCode.noPower));//权限不足!");
            //行会战开启期间不能转让会长
 
            mPersonalData.position = c_prop.guildPostKey.rankFile;
            tPersonalData.position = c_prop.guildPostKey.chairman;
            guildData.chairmanId = tPersonalData.userId;
            var viceChairmanId = guildData.viceChairmanId || [];
            for (var i = 0; i < viceChairmanId.length; i++) {
                if (viceChairmanId[i] == mPersonalData.userId || viceChairmanId[i] == tPersonalData.userId) viceChairmanId.splice(i--, 1);
            }
            g_data.setGuildChange(tPersonalData.userId, 1);
            break;
        case c_prop.guildMemberOpKey.kick:
            if (guildFuncData.moveMember == 0) return cb(getMsg(c_msgCode.noPower));//权限不足!");
            if (guildFuncData.moveMember == 2) {
                if (tPersonalData.position != c_prop.guildPostKey.rankFile)
                    return cb(getMsg(c_msgCode.noPower));//权限不足!");
            }
            //行会战开启期间不能踢人 
            //moveMember

            guildData.guildPopulation -= 1;
            var ennoble = tPersonalData.ennoble;
            if (ennoble) {
                guildData.ennobleData[ennoble] -= 1;
                if (guildData.ennobleData[ennoble] < 0) guildData.ennobleData[ennoble] = 0;
            }
            //如果是副会长
            commonUtils.arrayRemoveObject(guildData.viceChairmanId, tPersonalData.userId);

            //踢出行会
            tPersonalData.guildId = 0;
            tPersonalData.position = c_prop.guildPostKey.rankFile;
            tPersonalData.guildAct = 0;
            tPersonalData.ennoble = 0;
            tPersonalData.lastQuipGuildTime = new Date();


            g_data.setGuildId(tPersonalData.userId, null);
            g_data.setGuildEnnoble(tPersonalData.userId, null);
            g_data.setGuildChange(tPersonalData.userId, 1);
            break;
        case c_prop.guildMemberOpKey.release:
            if (!guildFuncData.movePosition) return cb(getMsg(c_msgCode.noPower));//权限不足!");
            //解除职务
            //todo
            tPersonalData.position = c_prop.guildPostKey.rankFile;
            commonUtils.arrayRemoveObject(guildData.viceChairmanId, tPersonalData.userId);
            g_data.setGuildChange(tPersonalData.userId, 1);
            break;
        case c_prop.guildMemberOpKey.increase:
            if (!guildFuncData.upToVice) return cb(getMsg(c_msgCode.noPower));//权限不足!");
            if (guildData.viceChairmanId.length >= 3) return cb(getMsg(c_msgCode.maxFukaijoIs, 3));//最多副会长数量:3
            //提升职务
            //todo
            tPersonalData.position = c_prop.guildPostKey.viceChairman;

            if (guildData.viceChairmanId.indexOf(tPersonalData.userId) < 0) {
                guildData.viceChairmanId.push(tPersonalData.userId);
            }

            g_data.setGuildChange(tPersonalData.userId, 1);
            break;
    }
    cb(null);
};

//输出指定范围内的随机数的随机整数
var _getRandomNumber = function(start, end) {
    var choice = end - start + 1;
    return Math.floor(Math.random() * choice + start);
};