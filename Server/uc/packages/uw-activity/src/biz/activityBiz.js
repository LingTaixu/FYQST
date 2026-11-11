/**
 * Created by Administrator on 13-12-13.
 */
var uwData = require("uw-data");
var c_msgCode = uwData.c_msgCode;
var c_game = uwData.c_game;
var consts = uwData.consts;
var c_prop = uwData.c_prop;
var t_medal = uwData.t_medal;
var t_hero = uwData.t_hero;
var c_mysterShop = uwData.c_mysterShop;

var exports = module.exports = {};
var async = require("async");
var getMsg = require("uw-utils").msgFunc(__filename);
var propUtils = require("uw-utils").propUtils;
var userUtils = require("uw-user").userUtils;
var commonUtils = require("uw-utils").commonUtils;

var logger = require('uw-log').getLogger("uw-logger", __filename);
var userBiz = require("uw-user").userBiz;
var userDao = require("uw-user").userDao;
var gameRecordDao = require("uw-game-record").gameRecordDao;

var rechargeDao = require("uw-recharge").rechargeDao;
var ActivityEntity = require("uw-entity").ActivityEntity;

var activityDao = require("./../dao/activityDao");
var activityRecordDao = require("./../dao/activityRecordDao");
var receiveFun = require("./receiveFun").receiveFun;
var checkOpBiz = require("./checkOpBiz");
var activityUtils = require("./activityUtils");
var mailBiz = require("uw-mail").mailBiz;
var ActivityRecordEntity = require("uw-entity").ActivityRecordEntity;
var heroDao = require("uw-hero").heroDao;
var ds = require("uw-ds").ds;
var chatBiz = require("uw-chat").chatBiz;
var itemBiz = require("uw-item").itemBiz;
var taskBiz = require("uw-task").taskBiz;
var formula = require("uw-formula");
var g_cache = require("uw-global").g_cache;
var g_fakeData = require("uw-global").g_fakeData;
var gameCommonBiz = require("uw-game-common").gameCommonBiz;
var c_task = uwData.c_task;
Number.tempId2Job = function(tempId) {
    return tempId.toString()[0] * 1;
};

var _calRandomHero = function(userData, randomHero) {
    if (!randomHero) return;
    var getHeroTypeCount = parseInt(randomHero[0] || 0),
        getHeroNum = parseInt(randomHero[1] || 0);
    var reRandomData = userUtils.getRandomHeroData(consts.heroGetType.normal, getHeroTypeCount, getHeroNum, userData);
    for (var locHeroId in reRandomData) {
        var locHeroCount = parseInt(reRandomData[locHeroId] || 0);
        userUtils.addHero(userData, locHeroId, locHeroCount);
    }
};

/**
 * 获取7天登陆礼包详细
 * @param client
 * @param userId
 * @param cb
 */
// exports.getSevenLogin = function(client, userId, cb) {
//     async.parallel([
//         function(cb1) {
//             //userDao.select(client, { id: userId }, cb1);
//             g_cache.getGamePlayer(client, userId, cb1);
//         },
//         function(cb1) {
//             activityDao.select(client, { type: c_prop.activityTypeKey.sevenLogin, isOpen: 1 }, cb1);
//         }
//     ], function(err, data) {
//         if (err) return cb(err);
//         var gamePlayer = data[0];
//         var userData = gamePlayer.userData,
//             activityData = data[1];
//         if (!activityData) return cb(null, null); //活动不存在，或者未开启
//         var activity = userData.activity;
//         var receiveData = activity[activityData.id] || [];
//         var receiveCount = receiveData.length;
//         if (receiveCount >= activityData.items.length) return cb(null, null); //已经领取完

//         //返回数据
//         _calActivityData(client, activityData, userData, function(err, reActivity) {
//             if (err) return cb(err);
//             cb(null, reActivity);
//         });
//     });
// };

_checkUserActivity = function(client, activityList, userData, cb) {
    var now = new Date();
    var activity = userData.activity;
    for (var i = 0; i < activityList.length; i++) {
        var activityData = activityList[i];
        var startTime = activityData.startTime;
        var endTime = activityData.endTime;
        switch (activityData.type) {
            //备注  天天返利(everydayCharge)活动拆分成  每日累充(everyDayChargeDiamond)   天天氪金(chargeDays)
            case c_prop.activityTypeKey.everyDayChargeDiamond: //每日累充钻石
                //[[0,1,2,3],"2018-07-27T16:00:09.051Z"]
                var receiveData = activity[activityData.id] || [
                    [], now
                ];
                var dayReceive = receiveData[0];
                var dayRefreshTime = new Date(receiveData[1]);
                if (!dayRefreshTime.equalsDay(now)) {
                    receiveData[0] = [];
                    receiveData[1] = now;
                }
                activity[activityData.id] = receiveData;
                break;
                // case c_prop.activityTypeKey.chargeDays://天天氪金 充值多少天 策划要做周期刷新的话再写
                //     break;
            case c_prop.activityTypeKey.everydayCharge:
                //[[0,1,2,3],"2018-07-27T16:00:09.051Z",[0,1,2,3],"2018-07-27T16:00:09.051Z"]
                var receiveData = activity[activityData.id] || [
                    [], now, [], startTime.clone().clearTime()
                ];
                var dayReceive = receiveData[0];
                var dayRefreshTime = new Date(receiveData[1]); //日充值的刷新时间
                var dayReceive30 = receiveData[2];
                var dayRefreshTime30 = new Date(receiveData[3]);
                if (!dayRefreshTime.equalsDay(now)) {
                    receiveData[0] = [];
                    receiveData[1] = now;
                }
                var period = 30; //多少天一个周期
                var diffDays = dayRefreshTime30.clone().clearTime().getDaysBetween(now.clone().clearTime());
                // console.log('dayRefreshTime30',dayRefreshTime30);
                // console.log('now',now);
                // console.log('===================================',diffDays);
                if (diffDays > period) {
                    var diffDays1 = startTime.clone().clearTime().getDaysBetween(now.clone().clearTime());
                    // console.log('now',now);
                    // console.log('startTime',startTime);
                    // console.log('===================================diffDays1',diffDays1);
                    var cycle = Math.floor(diffDays1 / period); //第几个以30为一个周期的周期
                    // console.log('===================================cycle',cycle);
                    var sTime = startTime.clone().clearTime().addDays(cycle * period);
                    // console.log('===================================sTime',sTime);

                    receiveData[2] = [];
                    receiveData[3] = sTime;

                }

                activity[activityData.id] = receiveData;

                // var sTime = startTime.clone().addDays(diffDays);
                // if (sTime.isAfter(now)) 
                break;
                //兑换上限需要按整个活动周期算，不要每天清空 2018/10/12
                // case c_prop.activityTypeKey.setTheWord:
                //     //集字活动 隔天刷新兑换限制次数
                //     var receiveData = activity[activityData.id] || [
                //         [0, 0, 0, 0], now
                //     ];
                //     var refreshTime = new Date(receiveData[1]); //刷新时间;
                //     if (!refreshTime.equalsDay(now)) {
                //         receiveData[0] = [];
                //         receiveData[1] = now;
                //     }
                //     activity[activityData.id] = receiveData;
                //     break;
            case c_prop.activityTypeKey.killDragon:
                //屠龙远征 隔天刷新兑换限制次数
                var receiveData = activity[activityData.id] || [
                    [], now
                ];
                var refreshTime = new Date(receiveData[1]); //刷新时间;
                if (!refreshTime.equalsDay(now)) {
                    receiveData[0] = [];
                    receiveData[1] = now;
                }
                activity[activityData.id] = receiveData;
                break;
            case c_prop.activityTypeKey.godPetFetter:
                //神宠的羁绊 隔天刷新奖励领取数据
                var receiveData = activity[activityData.id] || [
                    [], now, []
                ];
                var refreshTime = new Date(receiveData[1]); //刷新时间;
                if (!refreshTime.equalsDay(now)) {
                    receiveData[0] = [];
                    receiveData[1] = now;
                }
                activity[activityData.id] = receiveData;
                break;
            case c_prop.activityTypeKey.everyWeekCostDiamond:
            case c_prop.activityTypeKey.everyWeekCostDScore:
                //判断活动周期 7天一个循环 不在一个循环内 清除掉已任务的数据
                let receiveDataOfWeek = activity[activityData.id]; //[refreshTime,taskIds]
                if (!receiveDataOfWeek) {
                    receiveDataOfWeek = [];
                    receiveDataOfWeek[0] = new Date();
                    receiveDataOfWeek[1] = [];
                }
                if (!receiveDataOfWeek[0]) {
                    receiveDataOfWeek[0] = new Date();
                } else {
                    receiveDataOfWeek[0] = new Date(receiveDataOfWeek[0]);
                }
                let startTimeOfWeek = startTime.clone().clearTime();
                let currentDiffDays = startTimeOfWeek.getDaysBetween(new Date().clone().clearTime());
                let refreshDiffDays = startTimeOfWeek.getDaysBetween(receiveDataOfWeek[0].clone().clearTime());
                let currentDiffWeek = Math.floor(currentDiffDays / 7);
                let refreshDiffWeek = Math.floor(refreshDiffDays / 7);
                if (currentDiffWeek != refreshDiffWeek) {
                    receiveDataOfWeek[0] = new Date();
                    receiveDataOfWeek[1] = [];
                }
                break;
            case c_prop.activityTypeKey.turntable:
                //转盘活动（星象转盘）
                var receiveData = activity[activityData.id] || [{ "1": 1 }, 1, { "15000001": 1 }, now];
                var refreshTime = new Date(receiveData[3]); //刷新时间;
                if (!refreshTime.equalsDay(now)) {
                    receiveData[0] = { "1": 1 };
                    receiveData[1] = receiveData[1] + 1;
                    receiveData[2] = { "15000001": 1 };
                    receiveData[3] = now;
                }
                activity[activityData.id] = receiveData;
                break;
        }
    }
    cb(null, userData);
};

//获取主要精彩活动列表
exports.getList = function(client, userId, cb) {
    async.parallel([
        // function(cb1) {
        //     g_cache.getActivityList_InTime();
        // },
        // function(cb1) {
        //     var strWhere = " isOpen = 1 and ( startTime is null or (startTime <? and endTime>?)) order by sort desc";
        //     var args = [new Date(), new Date()];
        //     activityDao.list(client, strWhere, args, cb1);
        // },
        function(cb1) {
            //userDao.select(client, { id: userId }, cb1);
            g_cache.getGamePlayer(client, userId, cb1);
        }
        // function(cb1) {
        //     var strWhere = " isOpen = 1 and ( startTime is null or (startTime <? and endTime>?)) order by sort desc";
        //     var args = [new Date(), new Date()];
        //     publicActivityDao.list(client, strWhere, args, cb1);
        // }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var activityList = g_cache.getActivityList_InTime();
        var userData = gamePlayer.userData;
        var reList = [];
        _checkUserActivity(client, activityList, userData, function(err, userData) {
            var upUserData = {
                activity: userData.activity
            };
            gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
            //userDao.update(client,upUserData,{id:userId},function(err, data){});

            async.map(activityList, function(activityData, cb1) {
                _calActivityData(client, activityData, userData, function(err, exActivity) {
                    if (err) {
                        cb1(err);
                    } else {
                        var locIsNeed = checkOpBiz.isNeedOp(userData, exActivity);
                        exActivity.isNeedOp = locIsNeed;
                        var isDone = checkOpBiz.isDone(userData, exActivity);
                        var isNeedLvl = checkOpBiz.isNeedLvl(userData, exActivity);
                        if (isNeedLvl && !isDone) {
                            reList.push(exActivity);
                        }
                        cb1(null);
                    }
                });
            }, function(err, data) {
                if (err) return cb(err);
                cb(null, [upUserData, reList]);
            });
        });
    });
};

/**
 * 判断是否需要操作
 * @param client
 * @param userId
 * @param cb
 * @returns {"活动id":"是否需要操作(0|1)",.....}
 */
// exports.getIsNeedOperate = function(client, userId, cb) {
//     async.parallel([
//         function(cb1) {
//             var strWhere = " isOpen = 1 and ( startTime is null or (startTime <? and endTime>?))  order by sort desc";
//             var args = [new Date(), new Date()];
//             activityDao.list(client, strWhere, args, cb1);
//         },
//         function(cb1) {
//             userDao.select(client, { id: userId }, cb1);
//         }
//     ], function(err, data) {
//         if (err) return cb(err);
//         var activityList = data[0],
//             userData = data[1];
//         var reData = {};
//         async.map(activityList, function(locData, cb1) {
//             _calActivityData(client, locData, userData, function(err, reActivity) {
//                 if (err) {
//                     cb1(err);
//                 } else {
//                     var locIsNeed = checkOpBiz.isNeedOp(userData, reActivity);
//                     reData[reActivity.id] = locIsNeed;
//                     //大红点
//                     if (locIsNeed && reActivity.type != c_prop.activityTypeKey.firstRecharge && reActivity.type != c_prop.activityTypeKey.sevenLogin) {
//                         reData["-1"] = 1;
//                     }
//                     cb1(null);
//                 }
//             });
//         }, function(err, data) {
//             if (err) return cb(err);
//             cb(null, reData);
//         });
//     });
// };

/**
 * 领取活动
 * @param client
 * @param userId
 * @param index
 * @param activityId
 * @param cb
 */
exports.receive = function(client, userId, activityId, index, cb) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        //var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            // activityData = data[1];
            activityData = g_cache.getActivityDataById(activityId);
        if (!activityData) return cb(getMsg(c_msgCode.activitiesEnd)); //活动不存在，或者未开启
        if (activityData.startTime) { //不在时间范围内
            if (activityData.startTime.isAfter(new Date()) || activityData.endTime.isBefore(new Date())) {
                return cb(getMsg(c_msgCode.activitiesEnd)); //活动结束
            }
        }
        var oldDiamond = userData.diamond;

        _calActivityData(client, activityData, userData, function(err, exActivity) {
            if (err) return cb(err);
            var receiveFunc = receiveFun[exActivity.activity.type];
            if (!receiveFunc) return cb(getMsg(c_msgCode.activityConfigError)); //活动配置错误

            receiveFunc(client, gamePlayer, exActivity, index, function(err, receiveData) {
                if (err) return cb(err);
                var items = receiveData[0];
                var lotteryItemsArr = receiveData[1];
                var luckyTalosItemArr = receiveData[2];
                var delbag = receiveData[3];
                var exItem = receiveData[4];
                var itemsArr = [];
                var bagItems = {};
                var equipBagItems = {};
                //var mailItems = {};
                var getGold = 0;
                if (exActivity.activity.type == c_prop.activityTypeKey.dayShop || exActivity.activity.type == c_prop.activityTypeKey.tmFund ||
                    exActivity.activity.type == c_prop.activityTypeKey.month || exActivity.activity.type == c_prop.activityTypeKey.week) {
                    // 这些活动是需要支付购买的，物品有购买成功后，对应商品给与
                } else if (items && JSON.stringify(items) != "{}") {
                    itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.event);
                    if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
                    if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);
                    //if (Object.keys(itemsArr[5]).length > 0) mailItems = propUtils.mergerProp(mailItems, itemsArr[5]);
                }
                var updateData = {
                    activity: userData.activity,
                    gold: userData.gold,
                    diamond: userData.diamond,
                    buyDiamond: userData.buyDiamond,
                    giveDiamond: userData.giveDiamond,
                    cybExp: userData.cybExp,
                    jxExp: userData.jxExp,
                    prestige: userData.prestige,
                    sign: userData.sign,
                    medalData: userData.medalData,
                    heroData: userData.heroData,
                    heroNum: userData.heroNum,
                    buff: userData.buff
                };
                gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));
                if (delbag && Object.keys(delbag).length > 0) {
                    gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
                }

                var costDiamond = userData.diamond < oldDiamond ? (oldDiamond - userData.diamond) : 0;
                var getDiamond = userData.diamond > oldDiamond ? (userData.diamond - oldDiamond) : 0;

                if (exActivity.activity.type == c_prop.activityTypeKey.firstRecharge) { //玩家首充获得装备
                    chatBiz.addSysData(99, [userData.nickName]);
                }
                // else if (exActivity.activity.type == c_prop.activityTypeKey.dScoreShop && Object.keys(items).indexOf('1000105') >= 0) {
                //     //积分便利屋兑换战士英雄拉切尔
                //     chatBiz.addSysData(101, [userData.nickName]);
                // }
                _recordActivityRecord(client, userData, activityId, exActivity.activity.type, getDiamond, costDiamond);
                cb(null, [updateData, costDiamond, getDiamond, bagItems, equipBagItems, lotteryItemsArr, luckyTalosItemArr, exItem, getGold, delbag]);
            });
        });
    });
};

/**
 * 补签
 * @param client
 * @param activityId
 * @param userId
 * @param cb
 */
exports.patchSign = function(client, activityId, userId, cb) {
    async.parallel([
        function(cb1) {
            //userDao.select(client, { id: userId }, cb1);
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            activityDao.select(client, { id: activityId, isOpen: 1 }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            activityData = data[1];
        if (!activityData) return cb(getMsg(c_msgCode.activitiesEnd)); //活动不存在，或者未开启
        _calActivityData(client, activityData, userData, function(err, exActivity) {
            if (err) return cb(err);
            var diamond = userData.diamond;
            var signData = userData.sign || []; //0：签到次数1：签到时间
            var signTime = signData[1];
            if (signTime) signTime = signData[1] = new Date(signTime);
            //判断今日是否已经签到
            if (!activityUtils.isTodaySigned(signData)) return cb(getMsg(c_msgCode.cannotSign)); //今日还未签到,不能进行补签
            //补签条件
            var days = parseInt(new Date().getDate());
            if (signData[0] + 1 > days) return cb(getMsg(c_msgCode.signOutofday)); //超出了补签日期
            //var nowDays = new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate();
            //if(signData[0] + 1 > nowDays) return cb("超出了签到日期");
            var diamondNum = c_game.patchSignCon[0];
            if (diamond < diamondNum) return cb(getMsg(c_msgCode.noDiamond)); //钻石不足
            userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, diamondNum, c_prop.diamondCostTypeKey.patchSign);

            //获取补签物品
            var now = new Date();
            var signNum = activityUtils.getSignNum(signData);
            var id = (now.getMonth() + 1) * 100 + signNum + 1;
            var signDataItems = exActivity.activity.exValues[id];

            var bagItems = {};
            var equipBagItems = {};
            var itemsArr = userUtils.saveItems(userData, signDataItems, c_prop.itemGetTypeKey.patchSign);
            if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
            if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);
            var getGold = userUtils.getNumOfItems(signDataItems, c_prop.itemTypeKey.gold);
            var getDiamond = userUtils.getNumOfItems(signDataItems, c_prop.itemTypeKey.diamond);

            //更新签到次数和时间
            signData[0] = signNum + 1;
            signData[1] = new Date();
            userData.sign = signData;

            var updateData = {
                gold: userData.gold,
                diamond: userData.diamond,
                buyDiamond: userData.buyDiamond,
                giveDiamond: userData.giveDiamond,
                prestige: userData.prestige,
                exData: userData.exData,
                sign: userData.sign
            };
            gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));

            cb(null, [updateData, getGold, getDiamond, bagItems, equipBagItems, diamondNum]);
        });

    });
};

/***
 * 处理每日累充
 *
 */
exports.dayRecharge = function(client, userData, cb) {
    var strWhere = " isOpen = 1 and type = ? and ( startTime is null or (startTime <? and endTime>?)) order by sort desc";
    var now = new Date();
    var args = [c_prop.activityTypeKey.dayRecharge, now, now];
    var groupList = [];
    var tempCount = 0;
    var tempList = [];
    var max = 1000; // 
    activityDao.list(client, strWhere, args, function(err, activityList) {
        if (err) return cb(err);
        if (!activityList) return cb(null);
        async.map(activityList, function(activityData, cb1) {
            var startTime = activityData.startTime;
            var endTime = activityData.endTime;
            var period = 1;

            var diffDays = startTime.clone().clearTime().getDaysBetween(now.clone().clearTime());
            var sTime = startTime.clone().addDays(diffDays);
            if (sTime.isAfter(now)) {
                sTime.addDays(-period);
                diffDays -= period;
            }
            var eTime = sTime.clone().addDays(period);
            if (eTime.isAfter(endTime)) {
                eTime = endTime;
            }
            var userId = userData.id;
            rechargeDao.getPeriodCount(client, userId, sTime, eTime, function(err, todayRecharge) {
                if (err) return cb(err);
                var exValues = activityData.exValues;
                var items = activityData.items;
                var days = diffDays;
                for (var index = 0; index < exValues.length; index++) {
                    var itemData = items[index];
                    if (!itemData) return cb(getMsg(c_msgCode.paramsError, index));
                    var needRecharge = exValues[index];
                    if (todayRecharge < needRecharge) {
                        continue;
                    }
                    var revieData = userData.activity[activityData.id] || [];
                    var r = revieData[days] || [];
                    if (r[index] && r[index] == 1) {
                        continue;
                    }

                    r[index] = 1;
                    revieData[days] = r;
                    userData.activity[activityData.id] = revieData;
                    var rmb = exValues[index];
                    if (todayRecharge >= rmb) {
                        //mailBiz.addByType(client, userId, c_prop.mailTypeKey.dayRecharge, [rmb], items[i], function () {
                        //});
                        var mailEntity = mailBiz.createEntityByType(userId, c_prop.mailTypeKey.dayRecharge, [rmb], items[index]);
                        mailEntity.addTime = new Date();
                        tempList.push(mailEntity);
                        if (tempCount >= max) {
                            tempCount = 0;
                            groupList.push(tempList.concat([]));
                            tempList.length = 0;
                        }
                        tempCount++;
                    }
                }
                cb1(null);
            });

        }, function(err, data) {
            if (err) return cb(err);
            async.parallel([
                function(cb1) {
                    if (tempList.length > 0) {
                        groupList.push(tempList.concat([]));
                    }
                    if (groupList.length > 0) {
                        async.map(groupList, function(group, cb2) {
                            mailBiz.addMailByList(client, group, cb2);
                        }, cb1);
                    } else {
                        return cb1(null);
                    }
                },
                function(cb1) {
                    var updateUser = {
                        activity: userData.activity
                    };
                    userDao.update(client, updateUser, { id: userData.id }, cb1);
                }
            ], function(err, data) {
                if (err) return cb(err);
                cb(null);
            });
        });
    });
};


/***
 * 上报用户调研数据
 *
 */
// exports.report = function(client, activityId, userId, report, cb) {
//     userSurveyBiz.report(client, activityId, userId, report, function(err, data) {
//         if (err) return cb(err);
//         return cb(null, data);
//     });
// };

/***
 *  用户刷新每日商店
 *
 */
exports.refreshDayShop = function(client, activityId, userId, type, cb) {
    async.parallel([
        function(cb1) {
            //userDao.select(client, { id: userId }, cb1);
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            activityDao.select(client, { id: activityId, isOpen: 1 }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            activityData = data[1];
        if (!activityData) return cb(getMsg(c_msgCode.activitiesEnd)); //活动不存在，或者未开启

        var items = activityData.items;
        var activity = userData.activity[activityId] || [0, new Date(), 0]; //  [ 购买数量, 更新时间, 当前商品id]
        // 控制刷新频率 
        var leftItems = [];
        if (type == 0) { // 出低价物品
            leftItems = leftItems.concat(activityData.exValues2);
        } else {
            leftItems = leftItems.concat(items);
        }
        if (activity[2] > 0) {
            commonUtils.arrayRemoveObject(leftItems, activity[2]);
        }

        var goodsId = commonUtils.getRandomOne(leftItems);
        activity[2] = goodsId;

        userData.activity[activityId] = activity;

        var updateData = {
            activity: userData.activity
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);

        // userDao.update(client, updateData, { id: userId }, function(err, data) {
        //     if (err) return cb(err);
        cb(null, [updateData]);
        // });

    });
};

/***
 *  购买每日特惠商店 （平台通知入账后调用)
 */
exports.buyDayShop = function(client, activityId, userId, goodsId, cb) {

};

/***
 *  购买天命基金 （平台通知入账后调用)
 */
exports.buyTmFund = function(client, activityId, userId, goodsId, cb) {

};

//初始化转盘数据
exports.getLotteryInfo = function(client, activityId, userId, cb) {
    //userDao.select(client, { id: userId }, function(err, userData) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        /*
        0 单抽总次数  
        1 十连总次数 
        2 探宝总次数（每周清空） 
        3 免费单抽的最后一次抽奖时间 
        4 免费单抽剩余次数 
        5 领取的箱子序号
        6 每周刷新时间点
        */
        var userData = gamePlayer.userData;
        var now = new Date();
        var receiveData = userData.activity[activityId] || [];
        //初始化数据
        receiveData[0] = receiveData[0] || 0;
        receiveData[1] = receiveData[1] || 0;
        receiveData[2] = receiveData[2] || 0;
        receiveData[3] = receiveData[3] || now;
        if (receiveData[4] == undefined) {
            receiveData[4] = 2;
        }
        //receiveData[4] = receiveData[4] || 0;
        receiveData[5] = receiveData[5] || [0, 0, 0, 0, 0, 0, 0];
        receiveData[6] = receiveData[6] || now;
        receiveData[7] = receiveData[7] || 0; //第几轮
        // console.log(receiveData);
        var lastFreeTime = new Date(receiveData[3]); //上次增加免费抽奖次数的时间 
        var freeCount = receiveData[4]; //免费次数 最高5次
        var weekTime = new Date(receiveData[6]); //周刷新时间
        var lotteryChests = receiveData[5]; //宝箱数据  1是已经领取
        //计算免费次数
        // console.log(now,lastFreeTime);
        var freeHoursBetween = lastFreeTime.getHoursBetween(now);
        // console.log('距离最后一次免费刷新时间',lastFreeTime.isBefore(now),freeHoursBetween);
        var hoursIntervalCfg = 8; //单位时间增加免费次数
        if (lastFreeTime.isBefore(now) && freeHoursBetween >= hoursIntervalCfg) {
            var plusCount = Math.floor(freeHoursBetween / hoursIntervalCfg);
            // console.log(freeCount,plusCount);
            lastFreeTime.addHours(plusCount * hoursIntervalCfg);
            freeCount = freeCount + plusCount;
            freeCount = freeCount > 2 ? 2 : freeCount;
        }
        //每周清空 总抽奖次数 箱子领取数据 第几轮箱子
        if (weekTime.isBefore(now) && weekTime.getWeekNumber() != now.getWeekNumber()) {
            receiveData[6] = now;
            receiveData[2] = 0; //2探宝总次数（每周清空）
            receiveData[7] = 0;
            lotteryChests = [0, 0, 0, 0, 0, 0, 0]; //宝箱数据
        }
        receiveData[3] = lastFreeTime;
        receiveData[4] = freeCount;
        receiveData[5] = lotteryChests;
        // console.log(receiveData);
        userData.activity[activityId] = receiveData;
        var updateData = {
            activity: userData.activity
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        //userDao.update(client, updateData, { id: userId }, function(err, data) {
        //if (err) return cb(err);
        cb(null, [updateData]);
        //});
    });
};

/**
 * 领取转盘宝箱
 * @param client
 * @param userId
 * @param activityId
 * @param index   宝箱下标
 * @param cb
 */
exports.getLotteryChest = function(client, userId, activityId, index, cb) {
    //userDao.select(client,{id:userId},function(err,userData) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var receiveData = userData.activity[activityId] || [];
        // receiveData[2] = receiveData[2] || 0;
        // receiveData[5] = receiveData[5] || [0, 0, 0, 0, 0, 0, 0];
        var totalNum = receiveData[2];
        var receiveChests = receiveData[5];
        var weekRound = receiveData[7]; //第几轮箱子
        if (receiveChests[index] == 1) return cb(getMsg(c_msgCode.hasReward)); //已领取
        var lotteryChestCfg = c_game.lotteryChestCfg;
        if (!lotteryChestCfg) return cb(getMsg(c_msgCode.configError)); //配置错误
        var needNumCfg = lotteryChestCfg[0].split(",");
        var maxNum = needNumCfg[needNumCfg.length - 1]; //一轮最大需要多少次
        var needNum = needNumCfg[index];
        if ((totalNum * 1 - maxNum * weekRound * 1) < needNum) return cb(getMsg(c_msgCode.lotteryTimesUnenough)); // 抽奖次数不足
        var rewardCfg = lotteryChestCfg[1].split(",");
        //console.log('rewardCfg',rewardCfg);
        var chestId = rewardCfg[index];
        //console.log('chestId',chestId);
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
        receiveChests[index] = 1;
        receiveData[5] = receiveChests;
        //是否所有奖励都领取了
        var allReceive = true;
        for (var i = 0; i < receiveData[5].length; i++) {
            if (receiveData[5][i] == 0) allReceive = false;
        }
        //如果玩家提前完成全部奖励，立即重置
        if (allReceive) {
            receiveData[7]++; //记录本周第几轮宝箱
            receiveData[5] = [0, 0, 0, 0, 0, 0, 0]; //宝箱数据
        }
        userData.activity[activityId] = receiveData;
        //更新
        var updateData = {
            activity: userData.activity,
            gold: userData.gold,
            diamond: userData.diamond,
            cybExp: userData.cybExp,
            jxExp: userData.jxExp,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));
        return cb(null, [updateData, logicItems, bagItems, equipBagItems, getDiamond]);
    });
};

//记录嘉年华各类任务完成值
exports.recordCarnivalValue = function(client, userId, cTaskType, count, cb) {
    // checkRequire();
    //不在嘉年华活动期间内则不记录达成值
    var activityData = g_cache.getActivityDataByType_InTime(c_prop.activityTypeKey.carnival);
    if (!activityData) return cb(null);
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData;

        var activityId = activityData.id; //活动ID
        var userActivity = userData.activity || {};
        var userCarnivalActivity = userActivity[activityId] || [];
        var recordData = userCarnivalActivity[0] || {};
        //    carnivalTaskTypeKey :
        //{loginGame:0,teamBoss:1,state:2,
        // costGoldCount:3,zhongLi:4,paTaTreasury:5,
        // totalChargeCount:6,arenaCount:7,employNum:8,
        // diamondCost:9,abyssNum:10,hellCopyWipeNum:11,
        // guildAct:12,pkWinCount:13,lotteryNum:14},

        if (cTaskType == c_prop.carnivalTaskTypeKey.teamBoss ||
            cTaskType == c_prop.carnivalTaskTypeKey.state ||
            cTaskType == c_prop.carnivalTaskTypeKey.costGoldCount ||
            cTaskType == c_prop.carnivalTaskTypeKey.zhongLi ||
            cTaskType == c_prop.carnivalTaskTypeKey.paTaTreasury ||
            cTaskType == c_prop.carnivalTaskTypeKey.totalChargeCount ||
            cTaskType == c_prop.carnivalTaskTypeKey.arenaCount ||
            cTaskType == c_prop.carnivalTaskTypeKey.employNum ||
            cTaskType == c_prop.carnivalTaskTypeKey.diamondCost ||
            cTaskType == c_prop.carnivalTaskTypeKey.abyssNum ||
            cTaskType == c_prop.carnivalTaskTypeKey.hellCopyWipeNum ||
            cTaskType == c_prop.carnivalTaskTypeKey.guildAct ||
            cTaskType == c_prop.carnivalTaskTypeKey.pkWinCount ||
            cTaskType == c_prop.carnivalTaskTypeKey.lotteryNum) {
            var value = recordData[cTaskType] || 0;
            recordData[cTaskType] = parseInt(value) + parseInt(count);
            // console.error('==============recordData[cTaskType]===================',recordData[cTaskType],value,count);
        } else {
            return cb(null);
        }
        userCarnivalActivity[0] = recordData;
        userActivity[activityId] = userCarnivalActivity;
        userData.activity = userActivity;

        var updateData = {
            activity: userData.activity
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);

        return cb(null, updateData);
    });
};

//获取某类型活动配置
exports.getActivityByType = function(client, userId, actType, cb) {
    async.parallel([
        function(cb1) {
            var strWhere = " isOpen = 1 and type = ? and ( startTime is null or (startTime <? and endTime>?)) order by sort desc";
            var args = [actType, new Date(), new Date()];
            activityDao.list(client, strWhere, args, cb1);
        },
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[1];
        var activityList = data[0],
            userData = gamePlayer.userData;
        var reList = [];

        async.map(activityList, function(activityData, cb1) {
            _calActivityData(client, activityData, userData, function(err, exActivity) {
                if (err) {
                    cb1(err);
                } else {
                    var locIsNeed = checkOpBiz.isNeedOp(userData, exActivity);
                    exActivity.isNeedOp = locIsNeed;
                    var isDone = checkOpBiz.isDone(userData, exActivity);
                    var isNeedLvl = checkOpBiz.isNeedLvl(userData, exActivity);
                    if (isNeedLvl && !isDone) {
                        reList.push(activityData);
                    }
                    cb1(null);
                }
            });
        }, function(err, data) {
            if (err) return cb(err);
            cb(null, reList);
        });
    });
};


/***************************************************private*************************************************/
var _recordActivityRecord = function(client, userData, activityId, activityType, getDiamond, costDiamond) {
    activityRecordDao.select(client, {
        userId: userData.id,
        activityId: activityId
    }, function(err, activityRecord) {
        if (err) return console.log(err);
        if (!activityRecord) { //无数据插入
            var activityRecordEntity = new ActivityRecordEntity();
            activityRecordEntity.userId = userData.id;
            activityRecordEntity.userLvl = userData.lvl;
            activityRecordEntity.userVip = userData.vip;
            activityRecordEntity.activityId = activityId;
            activityRecordEntity.activityType = activityType;
            activityRecordEntity.costDiamond = costDiamond;
            activityRecordEntity.getDiamond = getDiamond;
            activityRecordEntity.joinCount = 1;
            activityRecordEntity.addTime = new Date();
            activityRecordEntity.updateTime = new Date();
            activityRecordDao.insert(client, activityRecordEntity, function(err) {
                if (err) console.log(err);
            });
        } else { //有数据更新
            var costTotalDiamond = activityRecord.costDiamond || 0;
            var getTotalDiamond = activityRecord.getDiamond || 0;
            var joinCount = activityRecord.joinCount || 0;
            costTotalDiamond += costDiamond;
            getTotalDiamond += getDiamond;
            joinCount += 1;
            var updateActivityRecord = {
                costDiamond: costTotalDiamond,
                getDiamond: getTotalDiamond,
                joinCount: joinCount,
                updateTime: new Date()
            };
            activityRecordDao.update(client, updateActivityRecord, { id: activityRecord.id }, function(err) {
                if (err) console.log(err);
            });
        }
    });
};


//输出指定范围内的随机数的随机整数
var _getRandomNumber = function(start, end) {
    var choice = end - start + 1;
    return Math.floor(Math.random() * choice + start);
};

var _calActivityData = function(client, activityData, userData, cb) {
    var exActivity = new ds.ExActivity();
    exActivity.activity = activityData;
    var now = new Date();
    if (now.isBefore(activityData.endTime)) {
        exActivity.leftTime = now.getSecondsBetween(activityData.endTime);
    }
    var reItems = [];
    for (var i = 0; i < activityData.items.length; i++) {
        var items = activityData.items[i];
        var exValue = activityData.exValues[i];
        var exValue2 = activityData.exValues2[i];
        var exValue3 = activityData.exValues3[i];
        var randomHero = activityData.randomHeroes[i];
        var aItem = new ds.ActivityItem();
        aItem.items = items;
        //aItem.randomHero = randomHero;
        switch (activityData.type) {
            case c_prop.activityTypeKey.firstRecharge:
            case c_prop.activityTypeKey.sevenLogin:
            case c_prop.activityTypeKey.alchemistEquateExchange: //炼金术士的等价交换
                aItem.items = items;
                break;
            case c_prop.activityTypeKey.limitBuy:
            case c_prop.activityTypeKey.limitBuyRange:
                aItem.diamond = exValue;
                aItem.limitNum = exValue2;
                aItem.discount = exValue3;
                break;
            case c_prop.activityTypeKey.dayChargeCount:
            case c_prop.activityTypeKey.allChargeCount:
            case c_prop.activityTypeKey.goddessPrivateRequite: //女神的私人报答
            case c_prop.activityTypeKey.godPetFetter: //神宠的羁绊
            case c_prop.activityTypeKey.singleCharge:
            case c_prop.activityTypeKey.dayRecharge:
            case c_prop.activityTypeKey.angelOrDemon: //天使or恶魔
            case c_prop.activityTypeKey.elfContract: //精灵契约（精灵觉醒）
                aItem.rmb = exValue;
                break;
            case c_prop.activityTypeKey.dayCostCount:
            case c_prop.activityTypeKey.allCostCount:
            case c_prop.activityTypeKey.rebate:
                aItem.diamond = exValue;
                break;
            case c_prop.activityTypeKey.upLvl:
                aItem.userLvl = exValue;
                break;
            case c_prop.activityTypeKey.upVip:
                aItem.vipLvl = exValue;
                break;
            case c_prop.activityTypeKey.limitPanicBuying:
                aItem.limitNum = exValue2;
                break;
                // case c_prop.activityTypeKey.everydayCharge:
                //     aItem.rmb = exValue;
                //     break;
            case c_prop.activityTypeKey.setTheWord:
                aItem.wordSet = exValue;
                break;
            case c_prop.activityTypeKey.vPlan:
                aItem.vPlan = exValue;
                break;
            case c_prop.activityTypeKey.giftShop:
                break;
            case c_prop.activityTypeKey.tmFund:
                aItem.price = exValue;
                aItem.rechargeId = exValue2;
                break;
            default:
                aItem.items = items;
                break;
        }
        reItems.push(aItem);
    }
    exActivity.activityItems = reItems;
    _calCostRecharge(client, exActivity, userData, function(err, data) {
        if (err) return cb(err);
        cb(null, exActivity);
    });
};

var _calCostRecharge = function(client, exActivity, userData, cb) {
    switch (exActivity.activity.type) {
        // case c_prop.activityTypeKey.sevenLogin:
        //     gameRecordDao.getLoginDaysArr(client, userData.id, exActivity.activity.startTime, exActivity.activity.endTime, function(err, loginDaysArr) {
        //         if (err) return cb(err);
        //         exActivity.loginDays = loginDaysArr;
        //         cb(null);
        //     });
        //     break;
        case c_prop.activityTypeKey.goddessPrivateRequite: //女神的私人报答
            rechargeDao.getAllCount(client, userData.id, exActivity.activity.startTime, exActivity.activity.endTime, function(err, allRechargeCount) {
                if (err) return cb(err);
                exActivity.allRecharge = allRechargeCount;
                cb(null);
            });
            break;
        case c_prop.activityTypeKey.elfContract: //精灵契约（精灵觉醒）
        case c_prop.activityTypeKey.angelOrDemon: //天使or恶魔
            rechargeDao.getAllCount(client, userData.id, exActivity.activity.startTime, exActivity.activity.endTime, function(err, allRechargeCount) {
                if (err) return cb(err);
                exActivity.allRecharge = allRechargeCount;
                cb(null);
            });
            break;
        case c_prop.activityTypeKey.firstRecharge: // 首冲
            async.parallel([
                function(cb1) {
                    rechargeDao.getAllCount2(client, userData.id, (new Date()).addYears(-5), new Date(), function(err, allRecharge) {
                        if (err) return cb1(err);
                        exActivity.allRecharge = allRecharge;
                        cb1(null);
                    });
                },
                function(cb1) {
                    rechargeDao.getRechargeUserNum(client, (new Date()).addYears(-5), new Date(), function(err, reUserNum) {
                        if (err) return cb1(err);
                        exActivity.reUserNum = reUserNum;
                        cb1(null);
                    });
                }
            ], function(err, data) {
                if (err) return cb(err);
                cb(null);
            });
            break;
        case c_prop.activityTypeKey.dayChargeCount:
            rechargeDao.getTodayCount(client, userData.id, function(err, todayRecharge) {
                if (err) return cb(err);
                exActivity.todayRecharge = todayRecharge;
                cb(null);
            });
            break;
        case c_prop.activityTypeKey.allChargeCount:
            rechargeDao.getAllCount(client, userData.id, exActivity.activity.startTime, exActivity.activity.endTime, function(err, allRechargeCount) {
                if (err) return cb(err);
                exActivity.allRecharge = allRechargeCount;
                cb(null);
            });
            break;
        case c_prop.activityTypeKey.dayCostCount:
            exActivity.days = _getCurDay(exActivity.activity);
            gameRecordDao.getTodayCost(client, userData.id, function(err, todayCost) {
                if (err) return cb(err);
                exActivity.todayCost = todayCost;
                cb(null, todayCost);
            });
            break;
        case c_prop.activityTypeKey.dayRecharge:
            var startTime = exActivity.activity.startTime;
            var endTime = exActivity.activity.endTime;
            var period = 1;
            var now = new Date();
            var diffDays = startTime.clone().clearTime().getDaysBetween(now.clone().clearTime());
            var sTime = startTime.clone().addDays(diffDays);
            if (sTime.isAfter(now)) {
                sTime.addDays(-period);
                diffDays -= period;
            }
            var eTime = sTime.clone().addDays(period);
            if (eTime.isAfter(endTime)) {
                eTime = endTime;
            }
            exActivity.leftTime = now.getSecondsBetween(eTime);
            exActivity.days = diffDays;
            rechargeDao.getPeriodCount(client, userData.id, sTime, eTime, function(err, todayRecharge) {
                if (err) return cb(err);
                exActivity.todayRecharge = todayRecharge;
                cb(null, todayRecharge);
            });
            break;
        case c_prop.activityTypeKey.allCostCount:
            gameRecordDao.getAllCost(client, userData.id, exActivity.activity.startTime, exActivity.activity.endTime, function(err, allCost) {
                if (err) return cb(err);
                exActivity.allCost = allCost;
                cb(null, allCost);
            });
            break;
        case c_prop.activityTypeKey.everyWeekCostDiamond:
            let startTimeOfCostDiamond = exActivity.activity.startTime.clone().clearTime();
            let diffDaysOfCostDiamond = startTimeOfCostDiamond.getDaysBetween(new Date().clone().clearTime());
            let weekOfCostDiamond = Math.floor(diffDaysOfCostDiamond / 7);
            let realStartTimeOfCostDiamond = startTimeOfCostDiamond.clone().addWeeks(weekOfCostDiamond);
            let realEndTimeOfCostDiamond = realStartTimeOfCostDiamond.clone().addWeeks(1);
            exActivity.leftTime = new Date().getSecondsBetween(realEndTimeOfCostDiamond);
            gameRecordDao.getAllCost(client, userData.id, realStartTimeOfCostDiamond, realEndTimeOfCostDiamond, function(err, allCost) {
                if (err) return cb(err);
                exActivity.allCost = allCost;
                cb(null, allCost);
            });
            break;
        case c_prop.activityTypeKey.everyWeekCostDScore:
            let startTimeOfCostDScore = exActivity.activity.startTime.clone().clearTime();
            let diffDaysOfCostDScore = startTimeOfCostDScore.getDaysBetween(new Date().clone().clearTime());
            let weekOfCostDScore = Math.floor(diffDaysOfCostDScore / 7);
            let realStartTimeOfCostDScore = startTimeOfCostDScore.clone().addWeeks(weekOfCostDScore);
            let realEndTimeOfCostDScore = realStartTimeOfCostDScore.clone().addWeeks(1);
            exActivity.leftTime = new Date().getSecondsBetween(realEndTimeOfCostDScore);
            gameRecordDao.getAllCostDScore(client, userData.id, realStartTimeOfCostDScore, realEndTimeOfCostDScore, function(err, allCost) {
                if (err) return cb(err);
                exActivity.allCost = allCost;
                cb(null, allCost);
            });
            break;
        case c_prop.activityTypeKey.rebate:
            var userActivityData = userData.activity[exActivity.activity.id];
            if (userActivityData) {
                exActivity.allCost = userActivityData[0] || 0;
            } else {
                exActivity.allCost = 0;
            }
            cb(null);
            break;
        case c_prop.activityTypeKey.fiveDaysTarget:
            exActivity.days = _getCurDay(exActivity.activity);
            cb(null);
            break;
        case c_prop.activityTypeKey.newFourDays:
            exActivity.days = _getCurDay(exActivity.activity);
            cb(null);
            break;
        case c_prop.activityTypeKey.sevenDaysTarget:
            exActivity.days = _getCurDay(exActivity.activity);
            cb(null);
            break;
        case c_prop.activityTypeKey.carnival: //嘉年华
            exActivity.days = _getCurDay(exActivity.activity);
            cb(null);
            break;
            // gameRecordDao.getLoginDaysArr(client, userData.id, exActivity.activity.startTime, exActivity.activity.endTime, function(err, loginDaysArr) {
            //     if (err) return cb(err);
            //     exActivity.days = _getCurDay(exActivity.activity);
            //     exActivity.loginDays = loginDaysArr;
            //     cb(null);
            // });
            break;
        case c_prop.activityTypeKey.chargeDays:
            //算出累计充值多少天
            var worthDiamond = 50;
            var sTime = exActivity.activity.startTime;
            var eTime = exActivity.activity.endTime;
            var now = new Date();
            exActivity.leftTime = now.getSecondsBetween(eTime);
            //exActivity.days = diffDays;
            rechargeDao.getRechargeDaysWorthDiamond(client, userData.id, sTime, eTime, worthDiamond, function(err, rechargeDays) {
                if (err) return cb(err);
                exActivity.days = rechargeDays;
                cb(null);
            });
            break;
        case c_prop.activityTypeKey.everyDayChargeDiamond:
            rechargeDao.getTodayRechargeDiamondCount(client, userData.id, function(err, todayRecharge) {
                if (err) return cb(err);
                exActivity.todayRecharge = todayRecharge;
                cb(null);
            });
            break;
        case c_prop.activityTypeKey.everydayCharge: //此条已废 20180622
            async.parallel([
                function(cb1) {
                    //算出累计充值多少天
                    var worthDiamond = 50;

                    var startTime = exActivity.activity.startTime;
                    var endTime = exActivity.activity.endTime;
                    var period = 30;
                    var now = new Date();
                    var diffDays = startTime.clone().clearTime().getDaysBetween(now.clone().clearTime());
                    var cycle = Math.floor(diffDays / 30); //第几个以30为一个周期的周期
                    var sTime = startTime.clone().clearTime().addDays(cycle * period);
                    var eTime = sTime.clone().addDays(period);

                    exActivity.leftTime = now.getSecondsBetween(eTime);
                    //exActivity.days = diffDays;
                    rechargeDao.getRechargeDaysWorthDiamond(client, userData.id, sTime, eTime, worthDiamond, function(err, rechargeDays) {
                        if (err) return cb1(err);
                        exActivity.days = rechargeDays;
                        cb1(null);
                    });
                },
                function(cb1) {
                    rechargeDao.getTodayRechargeDiamondCount(client, userData.id, function(err, todayRecharge) {
                        if (err) return cb1(err);
                        exActivity.todayRecharge = todayRecharge;
                        cb1(null);
                    });
                }
            ], function(err, data) {
                if (err) return cb(err);
                cb(null);
            });
            break;
        case c_prop.activityTypeKey.godPetFetter: //神宠的羁绊
            async.parallel([
                function(cb1) {
                    //算出累计充值多少天
                    var payMoney = 98;
                    var startTime = exActivity.activity.startTime;
                    var endTime = exActivity.activity.endTime;
                    rechargeDao.getRechargeDays(client, userData.id, startTime, endTime, payMoney, function(err, rechargeDays) {
                        if (err) return cb1(err);
                        exActivity.days = rechargeDays;
                        cb1(null);
                    });
                },
                function(cb1) {
                    rechargeDao.getTodayCount(client, userData.id, function(err, todayRecharge) {
                        if (err) return cb1(err);
                        exActivity.todayRecharge = todayRecharge;
                        cb1(null);
                    });
                }
            ], function(err, data) {
                if (err) return cb(err);
                cb(null);
            });
            break;
        case c_prop.activityTypeKey.laisBank: //莱斯银行的风投业务
            var fakeData = g_fakeData.getFakeDataCache() || {};
            exActivity.reUserNum = fakeData[c_prop.fakeDataTypeKey.payLaisBankNum] || 0;
            cb(null);
            // gameRecordDao.getLoginDaysArr(client, userData.id, exActivity.activity.startTime, exActivity.activity.endTime, function(err, loginDaysArr) {
            //     if (err) return cb(err);
            //     exActivity.loginDays = loginDaysArr;
            //     var fakeData = g_fakeData.getFakeDataCache() || {};
            //     exActivity.reUserNum = fakeData[c_prop.fakeDataTypeKey.payLaisBankNum] || 0;
            //     cb(null);
            // });
            // gameCommonBiz.getInfo(client, function(err, fakeData) {
            //     if (err) return cb(err);
            //     exActivity.reUserNum = fakeData.fakeData[c_prop.fakeDataTypeKey.payLaisBankNum] || 0;
            //     cb(null);
            // });
            break;
        case c_prop.activityTypeKey.dianaWardrobe: //戴安娜的私人衣橱
            var fakeData = g_fakeData.getFakeDataCache() || {};
            // console.error('=======fakeData========',fakeData);
            //累计总抽奖次数：戴安娜的衣橱c_prop.fakeDataTypeKey.dianaWardrobeLotteryNum、遥的星象占卜c_prop.fakeDataTypeKey.astrologyLotteryNum
            exActivity.reUserNum = fakeData[exActivity.activity.exValues.fakeDataTypeKey] || 0;
            cb(null);
            break;
        case c_prop.activityTypeKey.vPlan:
            rechargeDao.getMaxRechargeMoney(client, userData.id, exActivity.activity.startTime, exActivity.activity.endTime, function(err, maxPaymoney) {
                if (err) return cb(err);
                exActivity.maxPaymoney = maxPaymoney;
                cb(null);
            });
            break;
        case c_prop.activityTypeKey.luckyMajong:
            var userActivityData = userData.activity[exActivity.activity.id];
            exActivity.luckValue = userActivityData || 0;
            cb(null);
            break;
        case c_prop.activityTypeKey.giftShop: //  打赏礼包
            if (userData.lvl < 80) {
                exActivity.activity.exData[c_prop.activityExDataTypeKey.minLvl] = 9999;
                return cb(null);
            }
            heroDao.listCols(client, "id, tempId", " userId = (?) order by id", [userData.id], function(err, heroIds) {
                //console.log("c_prop.activityTypeKey.giftShop:", heroIds);
                if (err) {
                    exActivity.activity.exData[c_prop.activityExDataTypeKey.minLvl] = 9999;
                    return cb(err);
                }
                var reItems = [];
                var lvl = userData.lvl;
                var rebirthLvl = userData.rebirthLvl;
                var jobIdsInfo = {};
                var jobs = [];

                heroIds.forEach(function(v, idx, heroIds) {
                    jobs[idx] = Number.tempId2Job(v.tempId);
                });

                // 第2个职业未解锁
                if (!jobs[1]) {
                    exActivity.activity.exData[c_prop.activityExDataTypeKey.minLvl] = 9999;
                } else {
                    var aItem = new ds.ActivityItem();
                    var tmpItem = null;

                    if (lvl >= 120) {
                        if (rebirthLvl >= 5) {
                            tmpItem = exActivity.activity.exValues2[5];
                        } else if (rebirthLvl >= 1) {
                            if (jobs[1] == c_prop.heroJobKey.fs) { // 第2职业 (法师)
                                tmpItem = exActivity.activity.exValues2[4]; // 给(射手的礼包)
                            } else {
                                tmpItem = exActivity.activity.exValues2[3];
                            }
                        }
                    } else if (lvl >= 80 && lvl < 120) {
                        if (jobs[1] == c_prop.heroJobKey.fs) {
                            tmpItem = exActivity.activity.exValues2[1];
                        } else {
                            tmpItem = exActivity.activity.exValues2[2];
                        }
                    }

                    if (!tmpItem) {
                        exActivity.activity.exData[c_prop.activityExDataTypeKey.minLvl] = 9999;
                    } else {
                        aItem.items = tmpItem.items;
                        reItems.push(aItem);
                        exActivity.activity.exValues2 = tmpItem;
                        // exActivity.activity.title = tmpItem.title;
                        exActivity.activity.fullTitle = tmpItem.fullTitle;
                        exActivity.activity.content = tmpItem.content;
                        exActivity.activity.activityItems = reItems;
                    }
                    // exActivity.activity.exData[c_prop.activityExDataTypeKey.minLvl] = tmpItem.lv;
                    // exActivity.activity.exData[c_prop.activityExDataTypeKey.maxLvl] = tmpItem.nextlv;

                }
                cb(null);
            })
            break;
        default:
            cb(null);
            break;
    }
};

/**
 * 获得当前活动到第几天
 * @param activityData
 * @return day
 */
var _getCurDay = function(activityData) {
    var today = new Date();
    if (!activityData || today.isAfter(activityData.endTime) || activityData.startTime.isAfter(today)) {
        return -1;
    }
    var startTemp = new Date();
    startTemp.setFullYear(activityData.startTime.getFullYear(), activityData.startTime.getMonth(), activityData.startTime.getDate());
    startTemp.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    var diff = today - startTemp;
    return Math.floor((diff) / 1000 / 60 / 60 / 24);
}

var _queryList = function(cb) {
    var sql = "select * from uw_activity where isOpen = 1 and ( startTime is null or (startTime <? and endTime>?)) order by sort desc";
    client.query(sql, [new Date(), new Date()], function(err, dataList) {
        if (err) return cb(err);
        var self = activityDao;
        var castCols = self.castCols;
        if (castCols) {
            for (var i = 0, li = dataList.length; i < li; i++) {
                var data = dataList[i];
                for (var key in castCols) {
                    var value = data[key];
                    if (value) {
                        //todo oldma 遇到单倍数正斜线会报错,所以double一下
                        if (data.type != c_prop.activityTypeKey.limitPanicBuying) {
                            value = value.replace(/\\/g, '\\\\');
                            data[key] = JSON.parse(value);
                        } else {
                            data[key] = value;
                        }
                    } else {
                        var castType = castCols[key];
                        if (castType == BaseDao.CAST_ARRAY) value = [];
                        else if (castType == BaseDao.CAST_OBJECT) value = {};
                        data[key] = value;
                    }
                }
            }
        }
        cb(null, dataList);
    });
}

//记录拉切尔的健身计划各类任务完成值
exports.recordLachelFitnessValue = function(client, userId, cTaskType, count, fromActivityId, cb) {
    // checkRequire();
    //不在拉切尔活动期间内则不记录达成值
    var activityList = g_cache.getActivityListByType_InTime(c_prop.activityTypeKey.lachelFitness);
    if (activityList.length == 0) return cb(null);
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData;

        var isChange = false;
        for (let i = 0; i < activityList.length; i++) {
            var activityData = activityList[i];
            var activityId = activityData.id; //活动ID
            var userActivity = userData.activity || {};
            var userCarnivalActivity = userActivity[activityId] || [];
            var recordData = userCarnivalActivity[0] || {};
            var totalFitness = userCarnivalActivity[2] || 0; //用户总健身值
            var value = recordData[cTaskType] || 0; //用户已获得能量值
            var taskIdList = activityData.exValues || []; //健身活动的所有任务id、每完成一次获得的健身值
            //var exValuesNum = activityData.exValues[cTaskType] || 1; //每次获得能量值
            //var taskIdList = activityData.exValues2; //健身活动的所有任务id
            var targetValue = 0;
            var exValuesNum = 0;
            for (let j = 0; j < taskIdList.length; j++) {
                var taskId = taskIdList[j].taskId;
                var taskType = c_task[taskId].cTaskType;
                if (taskType == cTaskType) {
                    targetValue = c_task[taskId].targetValue;
                    exValuesNum = taskIdList[j].fitValue;
                }
            }
            if (value == targetValue) continue;

            if (cTaskType == c_prop.lachelActTaskTypeKey.teamBossNum ||
                cTaskType == c_prop.lachelActTaskTypeKey.zhongLiNum ||
                cTaskType == c_prop.lachelActTaskTypeKey.stateNum ||
                cTaskType == c_prop.lachelActTaskTypeKey.hellNum ||
                cTaskType == c_prop.lachelActTaskTypeKey.arenaNum ||
                cTaskType == c_prop.lachelActTaskTypeKey.pkNum ||
                cTaskType == c_prop.lachelActTaskTypeKey.materialsCopyNum ||
                cTaskType == c_prop.lachelActTaskTypeKey.paTaTreasuryNum ||
                cTaskType == c_prop.lachelActTaskTypeKey.guildDiamondNum ||
                cTaskType == c_prop.lachelActTaskTypeKey.employNum ||
                cTaskType == c_prop.lachelActTaskTypeKey.abyssNum ||
                cTaskType == c_prop.lachelActTaskTypeKey.dianaActNum) {
                var countNum = parseInt(count * exValuesNum);
                if (value + countNum > targetValue) {
                    countNum = targetValue - parseInt(value);
                }
                recordData[cTaskType] = parseInt(value) + countNum;
                totalFitness = parseInt(totalFitness) + countNum;
                // console.error('==============recordData[cTaskType]===================',recordData[cTaskType],value,count);
            } else if (cTaskType == c_prop.lachelActTaskTypeKey.loginNum) {
                var loginTime = userCarnivalActivity[3];
                if (!loginTime || !new Date(loginTime).equalsDay(new Date())) {
                    recordData[cTaskType] = parseInt(value) + parseInt(count * exValuesNum);
                    totalFitness = parseInt(totalFitness) + parseInt(count * exValuesNum);
                }
            } else {
                continue;
            }
            userCarnivalActivity[0] = recordData;
            userCarnivalActivity[2] = totalFitness;
            userCarnivalActivity[3] = new Date();
            userActivity[activityId] = userCarnivalActivity;
            userData.activity = userActivity;
            isChange = true;
        }

        if (!isChange) return cb(null, {});
        var updateData = {
            activity: userData.activity
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);

        return cb(null, updateData);
    });
}

//记录转盘活动各类任务完成值
exports.recordTurntableValue = function(client, userId, cTaskType, count, fromActivityId, cb) {
    //不在转盘活动期间内则不记录达成值
    var activityList = g_cache.getActivityListByType_InTime(c_prop.activityTypeKey.turntable);
    if (activityList.length == 0) return cb(null);
    count = parseInt(count);
    // "activityId": [{"15000001":0,"任务id":任务值},可抽奖次数,[{"15000001":0},{"任务id":抽奖的领取状态}]]

    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData;

        var isChange = false;
        for (let i = 0; i < activityList.length; i++) {
            var activityData = activityList[i];
            var activityId = activityData.id; //活动ID
            var userActivity = userData.activity || {};
            var userTurntableActivity = userActivity[activityId] || [];
            var recordData = userTurntableActivity[0] || {};
            var luckDrawNum = userTurntableActivity[1] || 0; //用户转盘可抽奖次数
            var luckDrawData = userTurntableActivity[2] || {}; //抽奖券领取情况
            var taskIdList = activityData.items || []; //转盘活动的所有任务id、完成获得的抽奖次数、关联活动id
            var taskList = {}; //{"任务id":任务完成值}
            var taskAwardNumList = {}; //{"任务id":任务完成可以获得的抽奖次数}
            //var relationActIdList = {};   //{"任务id":任务完成可以获得的抽奖次数}

            taskIdList.forEach(function(taskCfg) {
                var taskId = taskCfg.taskId;
                if (!taskCfg.taskId || !c_task[taskId]) return;
                if (c_task[taskId].cTaskType == cTaskType && !luckDrawData[taskId]) {
                    var value = recordData[cTaskType] || 0; //用户已完成任务值
                    recordData[cTaskType] = parseInt(value) + count;

                    if (recordData[cTaskType] >= c_task[taskId].targetValue) {
                        var exValuesNum = taskCfg.awardNum || 1; //任务完成可获得的抽奖次数
                        userTurntableActivity[1] = luckDrawNum + exValuesNum;
                        luckDrawData[taskId] = 1;
                        isChange = true;
                    }
                }
            });
        }

        if (!isChange) return cb(null, {});
        //数据改变
        var updateData = {
            activity: userData.activity
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        cb(null, updateData);
    });
}