/**
 * Created by Administrator on 2015/1/23.
 */
var uwData = require("uw-data");
var c_msgCode = uwData.c_msgCode;
var c_prop = uwData.c_prop;
var consts = uwData.consts;
var c_lottery = uwData.c_lottery;
var c_game = uwData.c_game;
var c_task = uwData.c_task;
var c_reward = uwData.c_reward;
//var c_mysterShop = uwData.c_mysterShop;
var t_item = uwData.t_item;
var t_itemEquip = uwData.t_itemEquip;
var t_achieve = uwData.t_achieve;
var c_lotteryDiana = uwData.c_lotteryDiana;
//var c_luckyTalos = uwData.c_luckyTalos;
//var c_luckyMajong = uwData.c_luckyMajong;
// var c_everydayCharge = uwData.c_everydayCharge;
var getMsg = require("uw-utils").msgFunc(__filename);
var userUtils = require("uw-user").userUtils;
var propUtils = require("uw-utils").propUtils;
var commonUtils = require("uw-utils").commonUtils;
var activityUtils = require("./activityUtils");
var formula = require("uw-formula");
var async = require("async");
var ossObj = require("uw-log").ossObj;
var ossBiz = require("uw-log").ossBiz;
var logger = require("uw-log").getLogger("uw-logger", __filename);

var fiveDaysTargetDao = null;
var fiveDayTargetBiz = null;
var taskDao = null;
var arenaDao = null;
var chatBiz = null;
var taskBiz = null;
var treasureUtils = null;
var newFourDaysDao = null;
var newFourDaysBiz = null;
var heroDao = null;
var sevenDaysTargetBiz = null;
var sevenDaysTargetDao = null;
var gameCommonBiz = null;
var itemBiz = null;
var activityBiz = null;
var heroBiz = null;
var copyBiz = null;
var employBiz = null;
var userUtils = null;
var checkRequire = function() {
    copyBiz = copyBiz || require("uw-copy").copyBiz;
    chatBiz = chatBiz || require("uw-chat").chatBiz;
    taskBiz = taskBiz || require("uw-task").taskBiz;
    taskDao = taskDao || require("uw-task").taskDao;
    arenaDao = arenaDao || require("uw-arena").arenaDao;
    employBiz = employBiz || require("uw-employ").employBiz;
    fiveDaysTargetDao = fiveDaysTargetDao || require("uw-fiveDaysTarget").fiveDaysTargetDao;
    fiveDayTargetBiz = fiveDayTargetBiz || require("uw-fiveDaysTarget").fiveDaysTargetBiz;
    treasureUtils = treasureUtils || require("uw-treasure").treasureUtils;
    newFourDaysDao = newFourDaysDao || require("uw-fiveDaysTarget").newFourDaysDao;
    newFourDaysBiz = newFourDaysBiz || require("uw-fiveDaysTarget").newFourDaysBiz;
    heroDao = heroDao || require("uw-hero").heroDao;
    sevenDaysTargetDao = sevenDaysTargetDao || require("uw-fiveDaysTarget").sevenDaysTargetDao;
    sevenDaysTargetBiz = sevenDaysTargetBiz || require("uw-fiveDaysTarget").sevenDaysTargetBiz;
    gameCommonBiz = require("uw-game-common").gameCommonBiz;
    itemBiz = require("uw-item").itemBiz || itemBiz;
    activityBiz = activityBiz || require("uw-activity").activityBiz;
    heroBiz = heroBiz || require("uw-hero").heroBiz;
    userUtils = userUtils || require("uw-user").userUtils;
};

var fiveDaysTargetTask = { 0: "3100004", 1: "3100002", 2: "3100003", 3: "3100005", 4: "0" };

var lotteryArrData = {};
var lotteryArrData_diana = {};

var _receiveFun = {};
exports.receiveFun = _receiveFun;

//首充
_receiveFun[c_prop.activityTypeKey.firstRecharge] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    //获取对应的数据
    var userData = gamePlayer.userData;
    var itemData = activityData.activityItems[index];
    if (!itemData) return cb(getMsg(c_msgCode.activitiesEnd)); //活动结束
    var items = {};
    for (var key in itemData.items) {
        items[key] = itemData.items[key][0];
    }

    var receiveData = userData.activity[activityData.activity.id] || [];
    //领取次数
    var receiveCount = receiveData[index] || 0;

    //已经领取过
    if (receiveCount > 0) return cb(getMsg(c_msgCode.activitiesEnd));

    //判断累充钻石是否达到
    if (activityData.allRecharge <= 0) return cb(getMsg(c_msgCode.rechargeNonstandard));

    //update
    //更新领取次数
    receiveData[index] = 1;
    userData.activity[activityData.activity.id] = receiveData;
    taskBiz.setTaskValue(client, userData.id, c_prop.cTaskTypeKey.firstRecharge, 1, function() {});
    //得到物品
    cb(null, [items]);
};


//七天登陆
_receiveFun[c_prop.activityTypeKey.sevenLogin] = function(client, gamePlayer, activityData, index, cb) {
    //获取对应的数据
    var userData = gamePlayer.userData;
    var itemData = activityData.activityItems[index];
    if (!itemData) return cb(getMsg(c_msgCode.activitiesEnd)); //活动结束
    var items = itemData.items;

    // var needLvl = itemData.userLvl || 0;

    var receiveData = userData.activity[activityData.activity.id] || [
        [],
        []
    ];
    var recDays = receiveData[1] || [];
    //console.error('=======sevenLogin2======',index,recDays.length);
    var daysArr = userData.loginDays || [];
    // var daysArr = activityData.loginDays || [];
    var loginDaysNum = _getLoginDaysBetween(daysArr, activityData.activity.startTime, activityData.activity.endTime);

    if (index >= loginDaysNum) return cb(getMsg(c_msgCode.goalNotGet));
    //领取次数
    if (index < recDays.length) return cb(getMsg(c_msgCode.hasReceivedReward));
    // var receiveTime = recDays[recDays.length -1];

    // if (receiveTime) {
    //     if (typeof receiveTime == "string") {
    //         receiveTime = new Date(receiveTime);
    //     }
    //     //同一天
    //     if (Date.equalsDay(receiveTime, new Date())) return cb(getMsg(c_msgCode.todayHasReward));
    // }


    //update
    //更新领取时间
    recDays.push(new Date());
    receiveData[1] = recDays;
    userData.activity[activityData.activity.id] = receiveData;

    //得到物品
    cb(null, [items]);
};


//每日限购
_receiveFun[c_prop.activityTypeKey.limitBuy] = function(client, gamePlayer, activityData, index, cb) {
    //获取对应的数据
    var userData = gamePlayer.userData;
    var itemData = activityData.activityItems[index];
    if (!itemData) return cb(getMsg(c_msgCode.activitiesEnd)); //活动结束
    var items = itemData.items;
    var limitNum = itemData.limitNum || 0;
    var costDiamond = itemData.diamond || 0;
    //判断购买上限
    var receiveData = userData.activity[activityData.activity.id] || [];
    var indexData = receiveData[index] || []; //[次数，时间]
    var buyNum = indexData[0] || 0;
    var receiveTime = indexData[1];
    if (receiveTime) {
        receiveTime = new Date(receiveTime);
        //今天超过上限
        if (receiveTime.equalsDay(new Date())) {
            if (buyNum >= limitNum) return cb(getMsg(c_msgCode.buyLimitNow));
        } else {
            buyNum = 0;
        }
    }

    //判断钻石是否足够
    if (userData.diamond < costDiamond || costDiamond < 0) return cb(getMsg(c_msgCode.noDiamond));

    //update
    //扣除钻石
    userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.activity, 0, 0, activityData.activity.id + "-" + index);
    indexData[0] = buyNum + 1;


    indexData[1] = new Date();

    //更新购买次数
    receiveData[index] = indexData;
    userData.activity[activityData.activity.id] = receiveData;

    cb(null, [items]);
};

//时间段限购
_receiveFun[c_prop.activityTypeKey.limitBuyRange] = function(client, gamePlayer, activityData, index, cb) {
    //获取对应的数据
    var userData = gamePlayer.userData;
    var itemData = activityData.activityItems[index];
    if (!itemData) return cb(getMsg(c_msgCode.activitiesEnd)); //活动结束
    var items = itemData.items;
    var limitNum = itemData.limitNum || 0;
    var costDiamond = itemData.diamond || 0;
    //判断购买上限
    var receiveData = userData.activity[activityData.activity.id] || [];
    var indexData = receiveData[index] || []; //[次数]
    var buyNum = indexData[0] || 0;

    if (buyNum >= limitNum) return cb(getMsg(c_msgCode.buyLimitNow));

    //判断钻石是否足够
    if (userData.diamond < costDiamond || costDiamond < 0) return cb(getMsg(c_msgCode.noDiamond));

    //update
    //扣除钻石
    userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.activity, 0, 0, activityData.activity.id + "-" + index);
    indexData[0] = buyNum + 1;

    //更新购买次数
    receiveData[index] = indexData;
    userData.activity[activityData.activity.id] = receiveData;

    cb(null, [items]);
};


//天累计充值
_receiveFun[c_prop.activityTypeKey.dayChargeCount] = function(client, gamePlayer, activityData, index, cb) {
    //获取对应的数据
    var userData = gamePlayer.userData;
    var itemData = activityData.activityItems[index];
    if (!itemData) return cb(getMsg(c_msgCode.activitiesEnd)); //活动结束
    var items = itemData.items;

    var needCount = itemData.rmb || 0;

    var receiveData = userData.activity[activityData.activity.id] || [];
    //领取时间
    var receiveTime = receiveData[index];
    if (receiveTime) {
        receiveTime = new Date(receiveTime);
        //已经领取过
        if (receiveTime.equalsDay(new Date())) return cb(getMsg(c_msgCode.activitiesEnd));
    }


    //判断累充钻石是否达到
    if (activityData.todayRecharge < needCount) return cb(getMsg(c_msgCode.rechargeNonstandard));

    //update
    //更新领取次数
    receiveData[index] = new Date();
    userData.activity[activityData.activity.id] = receiveData;

    //得到物品
    cb(null, [items]);
};

//所有累计充值
_receiveFun[c_prop.activityTypeKey.allChargeCount] = function(client, gamePlayer, activityData, index, cb) {
    //获取今天累计充值
    var userData = gamePlayer.userData;
    //获取对应的数据
    var itemData = activityData.activityItems[index];
    if (!itemData) return cb(getMsg(c_msgCode.activitiesEnd)); //活动结束
    var items = itemData.items;

    var needCount = itemData.rmb || 0;

    var receiveData = userData.activity[activityData.activity.id] || [];
    //领取次数
    var receiveCount = receiveData[index] || 0;

    //已经领取过
    if (receiveCount > 0) return cb(getMsg(c_msgCode.activitiesEnd));

    //判断累充钻石是否达到
    if (activityData.allRecharge < needCount) return cb(getMsg(c_msgCode.rechargeNonstandard));

    //update
    //更新领取次数
    receiveData[index] = 1;
    userData.activity[activityData.activity.id] = receiveData;

    //得到物品
    cb(null, [items]);
};


//天使or恶魔
_receiveFun[c_prop.activityTypeKey.angelOrDemon] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    index = index + '';
    var indexArr = index.split("_"); //0_0领取充值98的奖励  1_0抽奖 2_0钻石买东西
    if (indexArr.length != 2) return cb(getMsg(c_msgCode.paramsError));
    var rType = parseInt(indexArr[0]); //领取的类型 
    index = parseInt(indexArr[1]);
    //获取对应的数据
    var items = {};
    var delBag = {};
    var receiveData = userData.activity[activityData.activity.id] || []; //[]   

    var lotteryItemsArr = [];
    var exItem = {};
    switch (rType) {
        case 0:
            if (receiveData[0]) return cb(getMsg(c_msgCode.hasReward));
            var itemData = activityData.activityItems[index];
            var needCount = itemData.rmb || 0;
            //判断累充是否达到
            if (activityData.allRecharge < needCount) return cb(getMsg(c_msgCode.rechargeNonstandard));
            itemData.items.forEach(function(item) {
                items = propUtils.mergerProp(items, item);
            });
            // console.error("angelOrDemon------> 0",items);
            receiveData[0] = 1;
            break;
        case 1:
            var lotteryNum = index || 1; //抽奖次数
            if (lotteryNum != 1 && lotteryNum != 10) return cb(getMsg(c_msgCode.paramsError));
            var exValues2 = activityData.activity.exValues2;
            var spItemId = c_prop.spItemIdKey.dScore;
            var costValue = lotteryNum == 1 ? exValues2.price : exValues2.price10; //价格  (未必是元宝)
            if (!costValue) return cb(getMsg(c_msgCode.paramsError));
            userData.bag = userData.bag || {};
            var bag = userData.bag;
            var own = bag[spItemId] || 0;
            if (own < costValue) return cb(getMsg(c_msgCode.noIntegral));
            var chestId = exValues2.chestId;
            var mustGetChestId = exValues2.mustGetChestId || 100316;
            // var logicItems = itemBiz.calLogicItems(chestId);        //宝箱随机的物品
            // items = propUtils.mergerProp(items, logicItems);
            var mustGetItems = {};
            for (var i = 0; i < lotteryNum; i++) {
                var logicItems = itemBiz.calLogicItems(chestId); //宝箱随机的物品
                items = propUtils.mergerProp(items, logicItems);
                lotteryItemsArr.push(logicItems);

                var mustGetItems = itemBiz.calLogicItems(mustGetChestId); //必得宝箱随机的物品
                exItem = propUtils.mergerProp(exItem, mustGetItems);
                items = propUtils.mergerProp(items, mustGetItems);
            }
            userUtils.delBag(userData, spItemId, costValue, c_prop.itemCostTypeKey.activity, chestId, lotteryNum, activityData.activity.id + "-" + index);
            delBag[spItemId] = costValue;
            break;
        case 2:
            if (receiveData[1]) return cb(getMsg(c_msgCode.hasReward));
            var exValues3 = activityData.activity.exValues3;
            if (!exValues3) return cb(getMsg(c_msgCode.paramsError));

            var costValue = exValues3.price;
            //判断钻石是否足够
            if (userData.diamond < costValue || costValue < 0) return cb(getMsg(c_msgCode.noDiamond));
            receiveData[1] = 1;
            exValues3.items.forEach(function(item) {
                items = propUtils.mergerProp(items, item);
            });
            // console.error("angelOrDemon------> 2",items);
            userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costValue, c_prop.diamondCostTypeKey.activity, 0, 0, activityData.activity.id + "-" + index);
            break;
        default:
            return cb(getMsg(c_msgCode.paramsError));
    }

    for (var key in items) {
        var locItemData = t_item[key];
        var ignoreItemIds = [100250, 100251, 100252];
        if (ignoreItemIds.indexOf(locItemData.id) < 0) {
            chatBiz.addSysData(166, [userData.nickName, locItemData.id, locItemData.name, locItemData.color]);
            chatBiz.addSysData(167, [userData.nickName, locItemData.id, locItemData.name, locItemData.color]);

            //抽奖记录
            if (rType == 1) {
                // var locItemData = t_item[key];
                if (locItemData.color >= 5) {
                    var recItems = {};
                    recItems[key] = 1;
                    employBiz.insertEmployRewardRecord(client, c_prop.employLogTypeKey.angelAndDevilLottery, userData, 0, 0, recItems, function(err, data) {});
                }
            }
        }
    }
    userData.activity[activityData.activity.id] = receiveData;
    cb(null, [items, lotteryItemsArr, [], delBag, exItem]);
};

//精灵契约（精灵觉醒）
_receiveFun[c_prop.activityTypeKey.elfContract] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    index = index + '';
    var indexArr = index.split("_"); //0_0领取充值258的奖励  1_0抽奖 2_0钻石买东西
    if (indexArr.length != 2) return cb(getMsg(c_msgCode.paramsError));
    var rType = parseInt(indexArr[0]); //领取的类型 
    index = parseInt(indexArr[1]);
    //获取对应的数据
    var items = {};
    var delBag = {};
    var receiveData = userData.activity[activityData.activity.id] || []; //[]   

    var lotteryItemsArr = [];
    var exItem = {};
    switch (rType) {
        case 0:
            if (receiveData[0]) return cb(getMsg(c_msgCode.hasReward));
            var itemData = activityData.activityItems[index];
            var needCount = itemData.rmb || 0;
            //判断累充是否达到
            if (activityData.allRecharge < needCount) return cb(getMsg(c_msgCode.rechargeNonstandard));
            itemData.items.forEach(function(item) {
                items = propUtils.mergerProp(items, item);
            });
            // console.error("angelOrDemon------> 0",items);
            receiveData[0] = 1;
            break;
        case 1:
            var lotteryNum = index || 1; //抽奖次数
            if (lotteryNum != 1 && lotteryNum != 10) return cb(getMsg(c_msgCode.paramsError));
            var exValues2 = activityData.activity.exValues2;
            var spItemId = c_prop.spItemIdKey.dScore;
            var costValue = lotteryNum == 1 ? exValues2.price : exValues2.price10; //价格  (未必是元宝)
            if (!costValue) return cb(getMsg(c_msgCode.paramsError));
            userData.bag = userData.bag || {};
            var bag = userData.bag;
            var own = bag[spItemId] || 0;
            if (own < costValue) return cb(getMsg(c_msgCode.noIntegral));
            var chestId = exValues2.chestId;
            var mustGetChestId = exValues2.mustGetChestId || 100417;
            // var logicItems = itemBiz.calLogicItems(chestId);        //宝箱随机的物品
            // items = propUtils.mergerProp(items, logicItems);
            var mustGetItems = {};
            for (var i = 0; i < lotteryNum; i++) {
                var logicItems = itemBiz.calLogicItems(chestId); //宝箱随机的物品
                items = propUtils.mergerProp(items, logicItems);
                lotteryItemsArr.push(logicItems);

                var mustGetItems = itemBiz.calLogicItems(mustGetChestId); //必得宝箱随机的物品
                exItem = propUtils.mergerProp(exItem, mustGetItems);
                items = propUtils.mergerProp(items, mustGetItems);
            }
            userUtils.delBag(userData, spItemId, costValue, c_prop.itemCostTypeKey.activity, chestId, lotteryNum, activityData.activity.id + "-" + index);
            delBag[spItemId] = costValue;
            break;
        case 2:
            if (receiveData[1]) return cb(getMsg(c_msgCode.hasReward));
            var exValues3 = activityData.activity.exValues3;
            if (!exValues3) return cb(getMsg(c_msgCode.paramsError));

            var costValue = exValues3.price;
            //判断钻石是否足够
            if (userData.diamond < costValue || costValue < 0) return cb(getMsg(c_msgCode.noDiamond));
            receiveData[1] = 1;
            exValues3.items.forEach(function(item) {
                items = propUtils.mergerProp(items, item);
            });
            // console.error("angelOrDemon------> 2",items);
            userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costValue, c_prop.diamondCostTypeKey.activity, 0, 0, activityData.activity.id + "-" + index);
            break;
        default:
            return cb(getMsg(c_msgCode.paramsError));
    }

    for (var key in items) {
        var locItemData = t_item[key];
        //屏蔽 羁绊礼盒、声望之羽、史莱姆软糖、魔魂之尘
        var ignoreItemIds = [100219, 52, 56, 100222, 100250, 100251, 100252];
        if (locItemData.color >= 5 && ignoreItemIds.indexOf(locItemData.id) < 0) {
            chatBiz.addSysData(191, [userData.nickName, locItemData.id, locItemData.name, locItemData.color]);
            chatBiz.addSysData(192, [userData.nickName, locItemData.id, locItemData.name, locItemData.color]);
        }

        //抽奖记录
        if (rType == 1) {
            // var locItemData = t_item[key];
            if (locItemData.color >= 5 && ignoreItemIds.indexOf(locItemData.id) < 0) {
                var recItems = {};
                recItems[key] = 1;
                employBiz.insertEmployRewardRecord(client, c_prop.employLogTypeKey.elfContract, userData, 0, 0, recItems, function(err, data) {});
            }
        }
    }
    userData.activity[activityData.activity.id] = receiveData;
    cb(null, [items, lotteryItemsArr, [], delBag, exItem]);
};

//炼金术士的等价交换
_receiveFun[c_prop.activityTypeKey.alchemistEquateExchange] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    //获取对应的数据
    var itemData = activityData.activityItems[index];
    if (!itemData) return cb(getMsg(c_msgCode.paramsError));

    var receiveData = userData.activity[activityData.activity.id] || [
        [],
        []
    ]; //[[买礼包1的时间,买礼包2的时间,买礼包3的时间],[是否发过1返还邮件,是否发过2返还邮件,是否发过3返还邮件]]
    //已经领取过
    if (receiveData[0][index]) return cb(getMsg(c_msgCode.hasReward));

    var exValues = activityData.activity.exValues;
    if (!exValues || !exValues[index]) return cb(getMsg(c_msgCode.paramsError));
    var costValue = exValues[index].price;

    if (!costValue) return cb(getMsg(c_msgCode.paramsError));

    var costCurrencyType = exValues[index].currencyType;
    // console.error("costCurrencyType--------------"+costCurrencyType);
    var chestId = itemData.items;
    var delBag = {};
    if (c_prop.currencyTypeKey.dScore == costCurrencyType) {
        //console.error("积分购买--------------");
        //判断是积分购买
        var spItemId = c_prop.spItemIdKey.dScore;
        userData.bag = userData.bag || {};
        var bag = userData.bag;
        var own = bag[spItemId] || 0;
        if (own < costValue) return cb(getMsg(c_msgCode.noIntegral));
        //扣除积分
        userUtils.delBag(userData, spItemId, costValue, c_prop.itemCostTypeKey.activity, chestId, 1, activityData.activity.id + "-" + index);
        delBag[spItemId] = costValue;
    } else if (c_prop.currencyTypeKey.diamond == costCurrencyType) {
        //console.error("钻石购买--------------");
        //判断是钻石购买
        //判断钻石是否足够
        if (userData.diamond < costValue) return cb(getMsg(c_msgCode.noDiamond));
        //扣除钻石
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costValue, c_prop.diamondCostTypeKey.activity, 0, 0, activityData.activity.id + "-" + index);
    } else {
        return cb(getMsg(c_msgCode.paramsError));
    }

    var items = {};
    var logicItems = itemBiz.calLogicItems(chestId); //宝箱随机的物品
    items = propUtils.mergerProp(items, logicItems);

    var now = new Date();
    receiveData[0][index] = now;
    //更新领取次数 
    userData.activity[activityData.activity.id] = receiveData;
    //得到物品
    cb(null, [items, [],
        [], delBag
    ]);
};

//女神的私人报答
_receiveFun[c_prop.activityTypeKey.goddessPrivateRequite] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    //获取今天累计充值
    //获取对应的数据
    var itemData = activityData.activityItems[index];
    if (!itemData) return cb(getMsg(c_msgCode.activitiesEnd)); //活动结束
    var items = {};
    var chestId = itemData.items;
    var logicItems = itemBiz.calLogicItems(chestId); //宝箱随机的物品
    items = propUtils.mergerProp(items, logicItems);

    var needCount = itemData.rmb || 0;

    var receiveData = userData.activity[activityData.activity.id] || [];
    //领取次数
    var receiveCount = receiveData[index] || 0;

    //已经领取过
    if (receiveCount > 0) return cb(getMsg(c_msgCode.hasReward));

    //判断累充钻石是否达到
    if (activityData.allRecharge < needCount) return cb(getMsg(c_msgCode.rechargeNonstandard));

    //update
    //更新领取次数
    receiveData[index] = 1;
    userData.activity[activityData.activity.id] = receiveData;

    //得到物品
    cb(null, [items]);
};

//神宠的羁绊
_receiveFun[c_prop.activityTypeKey.godPetFetter] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    index = index + '';
    var indexArr = index.split("_");
    var rType; //领取的类型   单日累充奖励 还是 多日累充奖励
    if (indexArr.length == 1) {
        rType = 1;
        index = parseInt(indexArr[0]);
    } else if (indexArr.length == 2) {
        rType = 2;
        index = parseInt(indexArr[1]);
    } else {
        return cb(getMsg(c_msgCode.paramsError));
    }

    //获取对应的数据
    var items = {};
    var rechargeDays = activityData.days || 0; //充值天数 从1开始
    var todayRecharge = activityData.todayRecharge;

    var receiveData = userData.activity[activityData.activity.id];

    //已经领取过
    if (rType == 1 && receiveData[0] && receiveData[0][index]) return cb(getMsg(c_msgCode.hasReward));
    if (rType == 2 && receiveData[2] && receiveData[2][index]) return cb(getMsg(c_msgCode.hasReward));

    //update
    //更新领取次数
    var needValue;
    if (rType == 1) {
        var itemData = activityData.activityItems[index];
        needValue = itemData.rmb;
        if (todayRecharge < needValue) return cb(getMsg(c_msgCode.nonstandard));
        receiveData[0][index] = 1;

        var chestId = itemData.items;
        var logicItems = itemBiz.calLogicItems(chestId); //宝箱随机的物品
        items = propUtils.mergerProp(items, logicItems);
    } else if (rType == 2) {
        needValue = index + 1;
        if (rechargeDays < needValue) return cb(getMsg(c_msgCode.nonstandard));
        receiveData[2][index] = 1;

        var chestId = activityData.activity.exValues2[index];
        var logicItems = itemBiz.calLogicItems(chestId); //宝箱随机的物品
        items = propUtils.mergerProp(items, logicItems);
    }
    userData.activity[activityData.activity.id] = receiveData;
    cb(null, [items]);
};

//莱斯银行的风投业务
_receiveFun[c_prop.activityTypeKey.laisBank] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    index = index + '';
    var indexArr = index.split("_");
    if (indexArr.length != 2) return cb(getMsg(c_msgCode.paramsError));
    var rType = parseInt(indexArr[0]); //领取的类型 
    index = parseInt(indexArr[1]);
    //获取对应的数据
    var items = {};
    var delBag = {};
    var receiveData = userData.activity[activityData.activity.id] || [null, [],
        []
    ]; //[购买债券时间,[个人分红的领取数据],[全民返利的购买数据]]
    // console.error('===laisBanklaisBank===',receiveData);
    var now = new Date();
    switch (rType) {
        case 1: //购买债券
            if (receiveData[0]) return cb(getMsg(c_msgCode.hasReward));
            var exValues2 = activityData.activity.exValues2;

            if (!exValues2) return cb(getMsg(c_msgCode.paramsError));
            var spItemId = c_prop.spItemIdKey.dScore;
            var costValue = exValues2[spItemId]; //价格  (未必是元宝)
            if (!costValue) return cb(getMsg(c_msgCode.paramsError));
            userData.bag = userData.bag || {};
            var bag = userData.bag;
            var own = bag[spItemId] || 0;
            if (own < costValue) return cb(getMsg(c_msgCode.noIntegral));
            userUtils.delBag(userData, spItemId, costValue, c_prop.itemCostTypeKey.activity, 0, 0, activityData.activity.id + "-" + index);
            delBag[spItemId] = costValue;
            receiveData[0] = now;
            gameCommonBiz.updateFakeData(client, c_prop.fakeDataTypeKey.payLaisBankNum, 1, function() {});
            break;
        case 2: //2领取个人分红（1-7天)
            //没买过债券 不能领
            if (!receiveData[0]) return cb(getMsg(c_msgCode.enableToReward));
            var buyTime = new Date(receiveData[0]);
            var recDay = buyTime.clone().clearTime().addDays(index * 1);
            // console.error('recDayrecDayrecDayrecDayrecDay',recDay,recDay.getTime());

            if (receiveData[1] && receiveData[1][index]) return cb(getMsg(c_msgCode.hasReward));
            //如果不是领取当天的 需要判断那一天有没有登陆过
            if (!recDay.equalsDay(now)) {
                var timeStamp = recDay.getTime();
                // console.error('timeStamptimeStamptimeStamptimeStamp',timeStamp);
                // var daysArr = activityData.loginDays || [];
                // if (daysArr.indexOf(timeStamp) < 0) return cb(getMsg(c_msgCode.enableToReward));
                if (userData.loginDays.indexOf(timeStamp) < 0) return cb(getMsg(c_msgCode.enableToReward));
            }
            receiveData[1][index] = 1;
            var itemData = activityData.activityItems[index];
            items = itemData.items;
            break;
        case 3: //3全民返利
            if (receiveData[2] && receiveData[2][index]) return cb(getMsg(c_msgCode.hasReward));
            var exValues = activityData.activity.exValues;
            if (!exValues) return cb(getMsg(c_msgCode.paramsError));
            var itemData = exValues[index]; //[{"37":5},3000,60,30],  物品数据,实际价格,打折，需要全服购买多少债券才能买
            if (!itemData) return cb(getMsg(c_msgCode.paramsError));
            var needServerBuyNum = itemData[3];
            var reUserNum = activityData.reUserNum; //全服购买债券人数
            if (reUserNum < needServerBuyNum) return cb(getMsg(c_msgCode.giftNonstandard));

            var costValue = itemData[1];
            //判断钻石是否足够
            if (userData.diamond < costValue || costValue < 0) return cb(getMsg(c_msgCode.noDiamond));
            receiveData[2][index] = 1;
            userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costValue, c_prop.diamondCostTypeKey.activity, 0, 0, activityData.activity.id + "-" + index);
            items = itemData[0];
            break;
    }
    userData.activity[activityData.activity.id] = receiveData;
    cb(null, [items, [],
        [], delBag
    ]);
};

//每日消费返利 (7日)
_receiveFun[c_prop.activityTypeKey.dayCostCount] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    //获取对应的数据
    var items = {};
    var taskId = index * 1;
    var taskDataConfig = c_task[taskId];
    if (!taskDataConfig)
        return cb(getMsg(c_msgCode.noMission));
    var acDay = activityData.days % 7;
    var todayCost = activityData.todayCost;
    // if (day > 6) {
    //     return cb(getMsg(c_msgCode.activitiesEnd));
    // }
    var dayCostRebateCfg = c_game.dayCostRebateCfg;
    var taskDay = -1; //第几天的任务
    for (var i = 0; i < dayCostRebateCfg.length; i++) {
        if (dayCostRebateCfg[i].indexOf(taskId) > -1) {
            taskDay = i;
            break;
        }
    }
    if (taskDay > acDay) {
        return cb(getMsg(c_msgCode.eventNoStart));
    }
    var receiveData = userData.activity[activityData.activity.id]; //[123,123,123,1123]  {"refreshTime":12312312312,"taskIds":[123,123,123,1123]}
    if (!receiveData) {
        receiveData = {};
        receiveData.refreshTime = new Date();
        receiveData.taskIds = [];
    }
    //改老数据格式
    if (Array.isArray(receiveData)) {
        var oldDataTemp = [].concat(receiveData);
        receiveData = {};
        receiveData.refreshTime = new Date();
        receiveData.taskIds = oldDataTemp;
    }
    //判断活动周期 7天一个循环 不在一个循环内 清除掉已任务的数据
    if (!receiveData.refreshTime) {
        receiveData.refreshTime = new Date();
    } else {
        receiveData.refreshTime = new Date(receiveData.refreshTime);
    }

    //console.log('asdasdfsdfsd------------------------',activityData.activity.startTime,receiveData.refreshTime,new Date());

    var diffDay = _getCurDay(activityData.activity.startTime, receiveData.refreshTime);
    //console.log('asdasdfsdfsd diff------------------------',activityData.days, diffDay);
    if (Math.ceil((activityData.days + 1) / 7) > Math.ceil((diffDay + 1) / 7)) {
        receiveData.taskIds = [];
        receiveData.refreshTime = new Date();
    }
    //已经领取过
    if (receiveData.taskIds && receiveData.taskIds.indexOf(taskId) > -1) return cb(getMsg(c_msgCode.missionHasReward));
    var needValue = taskDataConfig.targetValue;
    if (todayCost < needValue) return cb(getMsg(c_msgCode.nonstandard));
    //update
    //更新领取次数
    receiveData.taskIds.push(taskId);
    userData.activity[activityData.activity.id] = receiveData;
    var rewardId = taskDataConfig.rewardId;
    var c_rewardData = c_reward[rewardId];
    if (c_rewardData.prestige > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.prestige, c_rewardData.prestige, c_prop.itemGetTypeKey.event)
    }
    if (c_rewardData.gold > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.gold, c_rewardData.gold, c_prop.itemGetTypeKey.event)
    }
    if (c_rewardData.diamond > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.diamond, c_rewardData.diamond, c_prop.itemGetTypeKey.event)
    }
    items = c_rewardData.rewardItems;

    //dadian 领取奖励
    var channelId = userData.channelId;
    var sdkChannelId = userData.sdkChannelId;
    var oObj = new ossObj.ossReward(userData.id, userData.lvl, c_prop.activityTypeKey.dayCostCount, rewardId, JSON.stringify(items), channelId, sdkChannelId);
    ossBiz.WriteOss(oObj);

    //得到物品
    cb(null, [items]);
};

//每周消费钻石
_receiveFun[c_prop.activityTypeKey.everyWeekCostDiamond] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    //获取对应的数据
    let items = {};
    let taskId = index * 1;
    let taskDataConfig = c_task[taskId];
    if (!taskDataConfig || taskDataConfig.taskType != 9 || taskDataConfig.cTaskType != 0)
        return cb(getMsg(c_msgCode.noMission));

    let receiveData = userData.activity[activityData.activity.id]; //[refreshTime,taskIds]
    if (!receiveData) {
        receiveData = [];
        receiveData[0] = new Date();
        receiveData[1] = [];
    }

    //已经领取过
    if (receiveData[1] && receiveData[1].indexOf(taskId) > -1) return cb(getMsg(c_msgCode.missionHasReward));
    let needValue = taskDataConfig.targetValue;
    let allCost = activityData.allCost;
    if (allCost < needValue) return cb(getMsg(c_msgCode.nonstandard));
    //update
    //更新领取次数
    receiveData[1].push(taskId);
    userData.activity[activityData.activity.id] = receiveData;
    var rewardId = taskDataConfig.rewardId;
    var c_rewardData = c_reward[rewardId];
    if (c_rewardData.prestige > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.prestige, c_rewardData.prestige, c_prop.itemGetTypeKey.event)
    }
    if (c_rewardData.gold > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.gold, c_rewardData.gold, c_prop.itemGetTypeKey.event)
    }
    if (c_rewardData.diamond > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.diamond, c_rewardData.diamond, c_prop.itemGetTypeKey.event)
    }

    items = c_rewardData.rewardItems;

    //dadian 领取奖励
    var channelId = userData.channelId;
    var sdkChannelId = userData.sdkChannelId;
    var oObj = new ossObj.ossReward(userData.id, userData.lvl, c_prop.activityTypeKey.everyWeekCostDiamond, rewardId, JSON.stringify(items), channelId, sdkChannelId);
    ossBiz.WriteOss(oObj);

    //得到物品
    cb(null, [items]);
};

//每周消费积分
_receiveFun[c_prop.activityTypeKey.everyWeekCostDScore] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    //获取对应的数据
    let items = {};
    let taskId = index * 1;
    let taskDataConfig = c_task[taskId];
    if (!taskDataConfig || taskDataConfig.taskType != 9 || taskDataConfig.cTaskType != 1)
        return cb(getMsg(c_msgCode.noMission));

    let receiveData = userData.activity[activityData.activity.id]; //[refreshTime,taskIds]
    if (!receiveData) {
        receiveData = [];
        receiveData[0] = new Date();
        receiveData[1] = [];
    }

    //已经领取过
    if (receiveData[1] && receiveData[1].indexOf(taskId) > -1) return cb(getMsg(c_msgCode.missionHasReward));
    let needValue = taskDataConfig.targetValue;
    let allCost = activityData.allCost;
    if (allCost < needValue) return cb(getMsg(c_msgCode.nonstandard));
    //update
    //更新领取次数
    receiveData[1].push(taskId);
    userData.activity[activityData.activity.id] = receiveData;
    var rewardId = taskDataConfig.rewardId;
    var c_rewardData = c_reward[rewardId];
    if (c_rewardData.prestige > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.prestige, c_rewardData.prestige, c_prop.itemGetTypeKey.event)
    }
    if (c_rewardData.gold > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.gold, c_rewardData.gold, c_prop.itemGetTypeKey.event)
    }
    if (c_rewardData.diamond > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.diamond, c_rewardData.diamond, c_prop.itemGetTypeKey.event)
    }

    items = c_rewardData.rewardItems;

    //dadian 领取奖励
    var channelId = userData.channelId;
    var sdkChannelId = userData.sdkChannelId;
    var oObj = new ossObj.ossReward(userData.id, userData.lvl, c_prop.activityTypeKey.everyWeekCostDScore, rewardId, JSON.stringify(items), channelId, sdkChannelId);
    ossBiz.WriteOss(oObj);

    //得到物品
    cb(null, [items]);
};

/**
 * 获得天数差
 * @param activityData
 * @return day
 */
var _getCurDay = function(startTime, endTime) {
    // var endTime = endTime?endTime:new Date(); 
    //console.log('asdasdasdas',startTime,endTime);
    var startTemp = new Date();
    var endTemp = new Date();
    startTemp.setFullYear(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());
    startTemp.setHours(0, 0, 0, 0);
    endTemp.setFullYear(endTime.getFullYear(), endTime.getMonth(), endTime.getDate());
    endTemp.setHours(0, 0, 0, 0);
    var diff = endTemp - startTemp;
    //console.log('endTemp - startTemp',endTemp,startTemp);
    return Math.floor((diff) / 1000 / 60 / 60 / 24);
}
// //每日消费
// _receiveFun[c_prop.activityTypeKey.dayCostCount] = function (client, userData, activityData, index, cb) {

//     //获取对应的数据
//     var itemData = activityData.activityItems[index];
//     if (!itemData) return cb(getMsg(c_msgCode.activitiesEnd));//活动结束
//     var items = itemData.items;

//     var needCount = itemData.diamond || 0;

//     var receiveData = userData.activity[activityData.activity.id] || [];

//     //领取时间
//     var receiveTime = receiveData[index];
//     if(receiveTime){
//         receiveTime = new Date(receiveTime);
//         //已经领取过
//         if(receiveTime.equalsDay(new Date())) return cb(getMsg(c_msgCode.activitiesEnd));
//     }

//     //判断累充钻石是否达到
//     if (activityData.todayCost < needCount) return cb("累计消费达不到条件");

//     //update
//     //更新领取次数
//     receiveData[index] = new Date();
//     userData.activity[activityData.activity.id] = receiveData;

//     //得到物品
//     cb(null, [items]);
// };

//全部消费
_receiveFun[c_prop.activityTypeKey.allCostCount] = function(client, gamePlayer, activityData, index, cb) {
    //获取对应的数据
    var userData = gamePlayer.userData;
    var itemData = activityData.activityItems[index];
    if (!itemData) return cb(getMsg(c_msgCode.activitiesEnd)); //活动结束
    var items = itemData.items;

    var needCount = itemData.diamond || 0;

    var receiveData = userData.activity[activityData.activity.id] || [];
    //领取次数
    var receiveCount = receiveData[index] || 0;

    //已经领取过
    if (receiveCount > 0) return cb(getMsg(c_msgCode.activitiesEnd));

    //判断累充钻石是否达到
    if (activityData.allCost < needCount) return cb(getMsg(c_msgCode.consumeNonstandard));

    //update
    //更新领取次数
    receiveData[index] = 1;
    userData.activity[activityData.activity.id] = receiveData;

    //得到物品
    cb(null, [items]);
};

//领主升级
// _receiveFun[c_prop.activityTypeKey.upLvl] = function (client, userData, activityData, index, cb) {
//     //获取对应的数据
//     var itemData = activityData.activityItems[index];
//     if (!itemData) return cb(getMsg(c_msgCode.activitiesEnd));//活动结束
//     var items = itemData.items;

//     var needLvl = itemData.userLvl || 0;

//     var receiveData = userData.activity[activityData.activity.id] || [];
//     //领取次数
//     var receiveCount = receiveData[index] || 0;

//     //已经领取过
//     if(receiveCount>0) return cb(getMsg(c_msgCode.activitiesEnd));

//     //判断等级是否达到
//     if (userData.lvl < needLvl) return cb(getMsg(c_msgCode.lordNonstandard));

//     //update
//     //更新领取次数
//     receiveData[index] = 1;
//     userData.activity[activityData.activity.id] = receiveData;

//     //得到物品
//     cb(null, [items]);
// };

//vip升级
// _receiveFun[c_prop.activityTypeKey.upVip] = function (client, userData, activityData, index, cb) {
//     //获取对应的数据
//     var itemData = activityData.activityItems[index];
//     if (!itemData) return cb(getMsg(c_msgCode.activitiesEnd));//活动结束
//     var items = itemData.items;

//     var needLvl = itemData.vipLvl || 0;

//     var receiveData = userData.activity[activityData.activity.id] || [];
//     //领取次数
//     var receiveCount = receiveData[index] || 0;

//     //已经领取过
//     if(receiveCount>0) return cb(getMsg(c_msgCode.activitiesEnd));

//     //判断等级是否达到
//     if (userData.vip < needLvl) return cb(getMsg(c_msgCode.vipNonstandard));

//     //update
//     //更新领取次数
//     receiveData[index] = 1;
//     userData.activity[activityData.activity.id] = receiveData;

//     //得到物品
//     cb(null, [items]);
// };

//签到
_receiveFun[c_prop.activityTypeKey.sign] = function(client, gamePlayer, activityData, index, cb) {
    //获取对应的数据
    var userData = gamePlayer.userData;
    var exValues = activityData.activity.exValues;

    var signData = userData.sign || [];
    var signTime = signData[1];
    if (signTime) signTime = signData[1] = new Date(signTime);
    //判断今日是否已经签到
    if (activityUtils.isTodaySigned(signData)) {
        return cb(getMsg(c_msgCode.todayHasSigned));
    }

    //获取今日签到物品
    var now = new Date();
    var signNum = activityUtils.getSignNum(signData);
    var id = (now.getMonth() + 1) * 100 + signNum + 1;

    var items = exValues[id];

    //更新签到次数和时间
    signData[0] = signNum + 1;
    signData[1] = new Date();
    userData.sign = signData;

    //得到物品
    cb(null, [items]);
};

//嘉年华
_receiveFun[c_prop.activityTypeKey.carnival] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    var days = activityData.days;

    var taskId = index * 1;
    var taskDataConfig = c_task[taskId];
    if (!taskDataConfig) return cb(getMsg(c_msgCode.noMission));
    var taskDay = -1; //第几天的任务
    var carnivalCfg = c_game.carnivalCfg;
    for (var i = 0; i < carnivalCfg.length; i++) {
        if (carnivalCfg[i].indexOf(taskDataConfig.cTaskType) > -1) {
            taskDay = i;
            break;
        }
    }
    if (taskDay > days) return cb(getMsg(c_msgCode.eventNoStart));
    userData.activity[activityData.activity.id] = userData.activity[activityData.activity.id] || [];
    var receiveData = userData.activity[activityData.activity.id][1] || {};
    if (receiveData[taskId]) return cb(getMsg(c_msgCode.hasReceivedReward)); //已领取

    var recordData = userData.activity[activityData.activity.id][0] || {};
    var taskValue = recordData[taskDataConfig.cTaskType] || 0;

    var needValue = taskDataConfig.targetValue;
    if (taskDataConfig.cTaskType == c_prop.carnivalTaskTypeKey.loginGame) {
        var daysArr = userData.loginDays || [];
        // var daysArr = activityData.loginDays || [];
        taskValue = _getLoginDaysBetween(daysArr, activityData.activity.startTime, activityData.activity.endTime);
    }
    if (taskValue < needValue) return cb(getMsg(c_msgCode.goalNotGet));

    //update
    //更新领取次数
    receiveData[taskId] = 1;
    userData.activity[activityData.activity.id][1] = receiveData;

    var rewardId = taskDataConfig.rewardId;
    var c_rewardData = c_reward[rewardId];

    if (c_rewardData.prestige > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.prestige, c_rewardData.prestige, c_prop.itemGetTypeKey.event)
    }
    if (c_rewardData.gold > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.gold, c_rewardData.gold, c_prop.itemGetTypeKey.event)
    }
    if (c_rewardData.diamond > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.diamond, c_rewardData.diamond, c_prop.itemGetTypeKey.event)
    }

    let items = c_rewardData.rewardItems;
    //得到物品
    cb(null, [items]);
};

var _getLoginDaysBetween = function(daysArr, startTime, endTime) {
    var loginDaysNum = 0;
    startTime = new Date(startTime);
    endTime = new Date(endTime);
    daysArr.forEach(function(day) {
        // day = new Date(day);
        if (day >= startTime.getTime() && day <= endTime.getTime()) {
            // if(day.isAfter(startTime) && day.isBefore(endTime)){
            loginDaysNum++;
        }
    })
    return loginDaysNum;
}

//七日目标
_receiveFun[c_prop.activityTypeKey.sevenDaysTarget] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    //获取对应的数据
    var items = {};
    var sevenDaysTargetItemArr = [];
    var taskId = index * 1;
    var taskDataConfig = c_task[taskId];
    if (!taskDataConfig)
        return cb(getMsg(c_msgCode.noMission));
    var day = sevenDaysTargetBiz.getCurDay(activityData.activity);
    if (day >= 8) {
        return cb(getMsg(c_msgCode.activitiesEnd));
    }
    var sevenDayTask = c_game.sevenDayTask;
    var taskDay = -1; //第几天的任务
    for (var i = 0; i < sevenDayTask.length; i++) {
        if (sevenDayTask[i].indexOf(taskId) > -1) {
            taskDay = i;
            break;
        }
    }

    // 2个七日活动，不校验
    if (taskDay == 7 || taskDay == 8 || taskDay == 9) {;
    } else if (taskDay > day) {
        return cb(getMsg(c_msgCode.eventNoStart));
    }
    // if (index <0 || index > 4)
    //     return cb("参数错误");
    var receiveData = userData.activity[activityData.activity.id] || [];
    //领取次数
    var receiveCount = receiveData[index] || 0;

    //已经领取过
    if (receiveData.indexOf(taskId) > -1) return cb(getMsg(c_msgCode.activitiesEnd));

    //判断是否完成相应任务
    // async.parallel([
    //     // function(cb1) {
    //     //     //竞技场数据
    //     //     arenaDao.select(client, { userId: userData.id }, cb1);
    //     // }//,
    //     // function(cb1) {
    //     //     var strSql = "";
    //     //     //得到宠物总战力 总宝石等级
    //     //     strSql = "SELECT  SUM(T1.talismanCombat) AS talismanTotalCombat,SUM(T1.gemSumLvl) AS totalGemSumLvl,SUM(T1.wingCombat) AS totalWingCombat,SUM(T1.realmLvl) AS totalRealmLvl,SUM(T1.holyCombat) AS totalHolyCombat,SUM(T1.partnerCombat) AS totalPartnerCombat FROM uw_hero T1 WHERE userId = ?";
    //     //     client.query(strSql, [userData.id], cb1);
    //     // },
    //     // function(cb1) {
    //     //     heroDao.listCols(client, "id,equipData", "userId = ?", [userData.id], cb1);
    //     // }
    // ], function(err, data) {
    // var arenaData = data[0];
    // var curValueData = data[1];
    // var heroList = data[2];
    // var equipBag = userData.equipBag || {};
    // var equipSumGrade = 0;
    // for (var i = 0; i < heroList.length; i++) {
    //     var equipData = heroList[i].equipData;

    //     for (var key in equipData) {
    //         var locItemUid = equipData[key];
    //         if (!locItemUid) continue;
    //         //戒指存的是tempid
    //         if (key == c_prop.heroEquipIndexKey.paralysisRing ||
    //             key == c_prop.heroEquipIndexKey.reviveRing ||
    //             key == c_prop.heroEquipIndexKey.protectRing ||
    //             key == c_prop.heroEquipIndexKey.harmRing
    //         ) {
    //             // nothing
    //         } else {
    //             var locBagData = equipBag[locItemUid] || {};
    //             equipSumGrade += locBagData[2] || 0;
    //         }
    //     }
    // }

    var ex = userData.exData;
    var arenaCount = ex[c_prop.userExDataKey.arenaCount] || 0;
    var needValue = taskDataConfig.targetValue;
    //判断任务是否达成
    var tasksType = taskDataConfig.cTaskType;
    var tasksValue = "";
    var value = 0;
    switch (taskDay) {
        case 0:
            // //爬塔
            // value = userData.highPaTa;
            //宝石总等级
            value = userUtils.getGemLvlSum(gamePlayer); //curValueData.totalGemSumLvl;
            break;
        case 1:
            value = userUtils.getRealmLvlSum(gamePlayer); //curValueData.totalRealmLvl; // 符文等级
            break;
        case 2:
            //守护精灵(翅膀)总战力
            value = userUtils.getWingCombatSum(gamePlayer); //curValueData.totalWingCombat;
            break;
        case 3:
            //竞技排名
            // value = arenaData.highRank;
            // 小队评级
            value = userData.rebirthLvl;
            break;
        case 4:
            //宠物战力
            value = userUtils.getTalismanCombatSum(gamePlayer); //curValueData.talismanTotalCombat;
            break;
        case 5:
            // value = Object.keys(userData.heroData || {}).length;   // 人数收集
            //伙伴战力
            value = userUtils.getPartnerCombatSum(gamePlayer); // curValueData.totalPartnerCombat;
            break;
        case 6:
            // value = userData.combat;
            //神圣装备战力 
            value = userUtils.getHolyCombatSum(gamePlayer); // curValueData.totalHolyCombat;
            break;
        case 7: // 装备评分
            value = userUtils.getEquipGrade(gamePlayer); //equipSumGrade;
            // 策划会改装备评分基础值,扩大1.3
            value = Math.floor(value * 1.3);
            break;
        case 8: // 小队等级
            value = userData.lvl;
            break;
        case 9: // 小队评级
            value = userData.rebirthLvl;
            break;
    }
    // if (taskDay == 3) {
    //     if (value > needValue) return cb(getMsg(c_msgCode.goalNotGet));
    // } else {
    //     if (value < needValue) return cb(getMsg(c_msgCode.goalNotGet));
    // }
    //console.error("day : ", taskDay, ",currentValue:", value);
    if (value < needValue) return cb(getMsg(c_msgCode.goalNotGet));
    //update
    //更新领取次数
    receiveData.push(taskId);
    userData.activity[activityData.activity.id] = receiveData;
    var rewardId = taskDataConfig.rewardId;
    var c_rewardData = c_reward[rewardId];

    if (c_rewardData.prestige > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.prestige, c_rewardData.prestige, c_prop.itemGetTypeKey.event)
    }
    if (c_rewardData.gold > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.gold, c_rewardData.gold, c_prop.itemGetTypeKey.event)
    }
    if (c_rewardData.diamond > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.diamond, c_rewardData.diamond, c_prop.itemGetTypeKey.event)
    }

    items = c_rewardData.rewardItems;

    //dadian 领取奖励
    var channelId = userData.channelId;
    var sdkChannelId = userData.sdkChannelId;
    var oObj = new ossObj.ossReward(userData.id, userData.lvl, c_prop.activityTypeKey.sevenDaysTarget, taskId, JSON.stringify(items), channelId, sdkChannelId);
    ossBiz.WriteOss(oObj);

    //得到物品
    cb(null, [items]);
    // });
};

//指定物品神秘商店
// _receiveFun[c_prop.activityTypeKey.appMysterShop] = function(client, userData, activityData, index, cb) {
//     checkRequire();
//     var indexArr = index.split(",");
//     if (indexArr.length != 2) return cb(getMsg(c_msgCode.paramsError));
//     var index = parseInt(indexArr[0]);
//     var itemIndex = indexArr[1];

//     //获取对应的数据
//     var exValues = activityData.activity.exValues;
//     if (!exValues[0]) return cb(getMsg(c_msgCode.paramsError));
//     var mysterShopId = exValues[0];
//     if (!c_mysterShop[mysterShopId]) return cb(getMsg(c_msgCode.paramsError));
//     var mysterShop = c_mysterShop[mysterShopId];
//     if (mysterShop.type != 2) return cb(getMsg(c_msgCode.paramsError));
//     if (!userData.activity[activityData.activity.id]) {
//         userData.activity[activityData.activity.id] = [0, [], new Date()]; //[积分,[领取次数,领取次数,领取次数],积分最后获得时间]
//     } else {
//         if (userData.activity[activityData.activity.id][2]) {
//             var actTime = userData.activity[activityData.activity.id][2];
//             if (activityData.activity.startTime) { //判断积分是否是本次活动积分
//                 //不在时间范围内
//                 if (activityData.activity.startTime.isAfter(actTime) || activityData.activity.endTime.isBefore(actTime)) {
//                     userData.activity[activityData.activity.id] = [0, [], new Date()];
//                 }
//             }
//         }
//     }
//     var receiveData = userData.activity[activityData.activity.id];

//     var integral = 0; //积分
//     var needIntegral = 999999; //需要积分
//     var items = {};
//     var lotteryItemsArr = [];
//     switch (index) {
//         case 0:
//             if (!mysterShop.integralItem1[itemIndex]) return cb(getMsg(c_msgCode.paramsError));
//             var itemId = mysterShop.integralItem1[itemIndex][0];
//             if (!t_item[itemId]) return cb(getMsg(c_msgCode.paramsError));
//             items[itemId] = mysterShop.integralItem1[itemIndex][1] || 1;
//             needIntegral = mysterShop.integralItem1[itemIndex][2] || 999999;
//             break;
//         case 1:
//             if (!mysterShop.integralItem2[itemIndex]) return cb(getMsg(c_msgCode.paramsError));
//             var itemId = mysterShop.integralItem2[itemIndex][0];
//             if (!t_item[itemId]) return cb(getMsg(c_msgCode.paramsError));
//             items[itemId] = mysterShop.integralItem2[itemIndex][1] || 1;
//             needIntegral = mysterShop.integralItem2[itemIndex][2] || 999999;
//             break;
//         case 2:
//             if (!mysterShop.integralItem3[itemIndex]) return cb(getMsg(c_msgCode.paramsError));
//             var itemId = mysterShop.integralItem3[itemIndex][0];
//             if (!t_item[itemId]) return cb(getMsg(c_msgCode.paramsError));
//             items[itemId] = mysterShop.integralItem3[itemIndex][1] || 1;
//             needIntegral = mysterShop.integralItem3[itemIndex][2] || 999999;
//             break;
//         default:
//             return cb(getMsg(c_msgCode.paramsError));
//             break;
//     }
//     lotteryItemsArr.push(items);
//     if (receiveData[0]) integral = receiveData[0];
//     if (integral < needIntegral) return cb(getMsg(c_msgCode.noIntegral));

//     //积分扣除
//     userData.activity[activityData.activity.id][0] = integral - needIntegral;
//     //更新领取次数
//     if (!userData.activity[activityData.activity.id][1][0]) userData.activity[activityData.activity.id][1][0] = {};
//     if (!userData.activity[activityData.activity.id][1][0][itemId]) userData.activity[activityData.activity.id][1][0][itemId] = 0;
//     userData.activity[activityData.activity.id][1][0][itemId] += items[itemId];

//     for (var key in items) {
//         var locItemData = t_item[key];
//         chatBiz.addSysData(33, [userData.nickName, locItemData.color, locItemData.name]);
//     }

//     //得到物品
//     cb(null, [items, lotteryItemsArr]);
// };

//深渊首通奖励
_receiveFun[c_prop.activityTypeKey.abyssPass] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    //获取对应的数据
    var items = {};
    var taskId = index * 1;
    var taskConfig = c_task[taskId];
    if (!taskConfig) return cb(getMsg(c_msgCode.noMission));
    var receiveData = userData.activity[activityData.activity.id] || [];
    receiveData[0] = receiveData[0] || [];
    //已经领取过
    if (receiveData[0].indexOf(taskId) > -1) return cb(getMsg(c_msgCode.hasReward));

    async.parallel([
        function(cb1) {
            copyBiz.getInfo(client, userData.id, c_prop.copyTypeKey.abyss, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var copyProgressData = data[0];

        var needValue = taskConfig.targetValue;

        if (!copyProgressData || !copyProgressData.copyStar || !copyProgressData.copyStar[needValue]) return cb(getMsg(c_msgCode.nonstandard)); //不可领取
        //update
        //更新领取次数
        receiveData[0].push(taskId);

        userData.activity[activityData.activity.id] = receiveData;
        var rewardId = taskConfig.rewardId;
        var c_rewardData = c_reward[rewardId];
        if (c_rewardData.prestige > 0) {
            userUtils.addCurrency(userData, c_prop.currencyTypeKey.prestige, c_rewardData.prestige, c_prop.itemGetTypeKey.event)
        }
        if (c_rewardData.gold > 0) {
            userUtils.addCurrency(userData, c_prop.currencyTypeKey.gold, c_rewardData.gold, c_prop.itemGetTypeKey.event)
        }
        if (c_rewardData.diamond > 0) {
            userUtils.addCurrency(userData, c_prop.currencyTypeKey.diamond, c_rewardData.diamond, c_prop.itemGetTypeKey.event)
        }

        items = c_rewardData.rewardItems;

        //dadian 领取奖励
        var channelId = userData.channelId;
        var sdkChannelId = userData.sdkChannelId;
        var oObj = new ossObj.ossReward(userData.id, userData.lvl, c_prop.activityTypeKey.abyssPass, rewardId, JSON.stringify(items), channelId, sdkChannelId);
        ossBiz.WriteOss(oObj);
        //得到物品todayRecharge
        cb(null, [items]);
    });
};

//天天氪金
_receiveFun[c_prop.activityTypeKey.chargeDays] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    //获取对应的数据
    var items = {};
    var taskId = index * 1;
    var taskConfig = c_task[taskId];
    if (!taskConfig) return cb(getMsg(c_msgCode.noMission));
    var rechargeDays = activityData.days || 0; //充值天数 从1开始

    var chargeDaysCfg = c_game.chargeDays;
    if (chargeDaysCfg[0].indexOf(taskId) < 0) return cb(getMsg(c_msgCode.activityConfigError));

    var receiveData = userData.activity[activityData.activity.id] || [];
    receiveData[0] = receiveData[0] || [];
    //已经领取过
    if (receiveData[0].indexOf(taskId) > -1) return cb(getMsg(c_msgCode.hasReward));
    var needValue = taskConfig.targetValue;

    if (rechargeDays < needValue) return cb(getMsg(c_msgCode.nonstandard));
    //update
    //更新领取次数
    receiveData[0].push(taskId);

    userData.activity[activityData.activity.id] = receiveData;
    var rewardId = taskConfig.rewardId;
    var c_rewardData = c_reward[rewardId];
    if (c_rewardData.prestige > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.prestige, c_rewardData.prestige, c_prop.itemGetTypeKey.event)
    }
    if (c_rewardData.gold > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.gold, c_rewardData.gold, c_prop.itemGetTypeKey.event)
    }
    if (c_rewardData.diamond > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.diamond, c_rewardData.diamond, c_prop.itemGetTypeKey.event)
    }

    items = c_rewardData.rewardItems;

    //dadian 领取奖励
    var channelId = userData.channelId;
    var sdkChannelId = userData.sdkChannelId;
    var oObj = new ossObj.ossReward(userData.id, userData.lvl, c_prop.activityTypeKey.chargeDays, rewardId, JSON.stringify(items), channelId, sdkChannelId);
    ossBiz.WriteOss(oObj);
    //得到物品todayRecharge
    cb(null, [items]);
};

//每日累充钻石
_receiveFun[c_prop.activityTypeKey.everyDayChargeDiamond] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    //获取对应的数据
    var items = {};
    var taskId = index * 1;
    var taskDataConfig = c_task[taskId];
    if (!taskDataConfig)
        return cb(getMsg(c_msgCode.noMission));

    var todayRecharge = activityData.todayRecharge;
    var everyDayChargeDiamondCfg = c_game.everyDayChargeDiamond;
    if (everyDayChargeDiamondCfg[0].indexOf(taskId) < 0) return cb(getMsg(c_msgCode.activityConfigError));


    var receiveData = userData.activity[activityData.activity.id] || [];
    receiveData[0] = receiveData[0] || [];

    //已经领取过
    if (receiveData[0].indexOf(taskId) > -1) return cb(getMsg(c_msgCode.hasReward));

    var needValue = taskDataConfig.targetValue;
    if (todayRecharge < needValue) return cb(getMsg(c_msgCode.nonstandard));
    //update
    //更新领取次数
    receiveData[0].push(taskId);

    userData.activity[activityData.activity.id] = receiveData;
    var rewardId = taskDataConfig.rewardId;
    var c_rewardData = c_reward[rewardId];
    if (c_rewardData.prestige > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.prestige, c_rewardData.prestige, c_prop.itemGetTypeKey.event)
    }
    if (c_rewardData.gold > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.gold, c_rewardData.gold, c_prop.itemGetTypeKey.event)
    }
    if (c_rewardData.diamond > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.diamond, c_rewardData.diamond, c_prop.itemGetTypeKey.event)
    }
    items = c_rewardData.rewardItems;

    //dadian 领取奖励
    var channelId = userData.channelId;
    var sdkChannelId = userData.sdkChannelId;
    var oObj = new ossObj.ossReward(userData.id, userData.lvl, c_prop.activityTypeKey.everyDayChargeDiamond, rewardId, JSON.stringify(items), channelId, sdkChannelId);
    ossBiz.WriteOss(oObj);
    //得到物品todayRecharge
    cb(null, [items]);
};

//天天充值
_receiveFun[c_prop.activityTypeKey.everydayCharge] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    //获取对应的数据
    var items = {};
    var taskId = index * 1;
    var taskDataConfig = c_task[taskId];
    if (!taskDataConfig)
        return cb(getMsg(c_msgCode.noMission));
    var rechargeDays = activityData.days || 0; //充值天数 从1开始
    var todayRecharge = activityData.todayRecharge;
    var everyDayRechargeCfg = c_game.everyDayRecharge;

    var taskType = -1; //0 每日累计充值奖励  1 是累计充值天数奖励
    for (var i = 0; i < everyDayRechargeCfg.length; i++) {
        if (everyDayRechargeCfg[i].indexOf(taskId) > -1) {
            taskType = i;
            break;
        }
    }
    if (taskType == -1)
        return cb(getMsg(c_msgCode.activityConfigError));
    var receiveData = userData.activity[activityData.activity.id];

    //已经领取过
    if (taskType == 0 && receiveData[0] && receiveData[0].indexOf(taskId) > -1) return cb(getMsg(c_msgCode.hasReward));
    if (taskType == 1 && receiveData[2] && receiveData[2].indexOf(taskId) > -1) return cb(getMsg(c_msgCode.hasReward));
    var needValue = taskDataConfig.targetValue;

    //update
    //更新领取次数
    if (taskType == 0) {
        if (todayRecharge < needValue) return cb(getMsg(c_msgCode.nonstandard));
        receiveData[0].push(taskId);
    } else if (taskType == 1) {
        if (rechargeDays < needValue) return cb(getMsg(c_msgCode.nonstandard));
        receiveData[2].push(taskId);
    }
    userData.activity[activityData.activity.id] = receiveData;
    var rewardId = taskDataConfig.rewardId;
    var c_rewardData = c_reward[rewardId];

    if (c_rewardData.prestige > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.prestige, c_rewardData.prestige, c_prop.itemGetTypeKey.event)
    }
    if (c_rewardData.gold > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.gold, c_rewardData.gold, c_prop.itemGetTypeKey.event)
    }
    if (c_rewardData.diamond > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.diamond, c_rewardData.diamond, c_prop.itemGetTypeKey.event)
    }
    items = c_rewardData.rewardItems;

    //dadian 领取奖励
    var channelId = userData.channelId;
    var sdkChannelId = userData.sdkChannelId;
    var oObj = new ossObj.ossReward(userData.id, userData.lvl, c_prop.activityTypeKey.everydayCharge, rewardId, JSON.stringify(items), channelId, sdkChannelId);
    ossBiz.WriteOss(oObj);
    //得到物品todayRecharge
    cb(null, [items]);
};

//充值返利
_receiveFun[c_prop.activityTypeKey.rebate] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    index = parseInt(index);
    var itemData = activityData.activityItems[index];
    if (!itemData) return cb(getMsg(c_msgCode.paramsError, index));
    var items = itemData.items;
    var receiveData = userData.activity[activityData.activity.id] || [];
    var r = receiveData[1] || [];
    if (r[index] && r[index] == 1) {
        return cb(getMsg(c_msgCode.activitiesEnd));
    }
    var needCost = itemData.diamond;
    var allCost = activityData.allCost;
    if (allCost < needCost) {
        return cb(getMsg(c_msgCode.consumeNonstandard));
    }
    r[index] = 1;
    receiveData[1] = r;
    userData.activity[activityData.activity.id] = receiveData;
    return cb(null, [items]);
};


//每日累充
/*_receiveFun[c_prop.activityTypeKey.dayRecharge] = function(client, userData, activityData, index, cb){
    checkRequire();
    index = parseInt(index);
    var itemData = activityData.activityItems[index];
    var days = activityData.days;
    if(!itemData) return cb("indesx:"+index,参数有误);
    var items = itemData.items;
    var revieData = userData.activity[activityData.activity.id] || [];
    var r = revieData[days] || [];
    if (r[index] && r[index] == 1) {
        return cb(getMsg(c_msgCode.activitiesEnd));
    }
    var needRecharge = itemData.rmb;
    var todayRecharge = activityData.todayRecharge;
    if(todayRecharge < needRecharge){
        return cb("今日充值达不到条件");
    }
    r[index] = 1;
    revieData[days] = r;
    userData.activity[activityData.activity.id] = revieData;
    return cb(null, [items]);
}*/
//集字活动  20180508
_receiveFun[c_prop.activityTypeKey.setTheWord] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    index = parseInt(index);
    //等级限制
    var limitLvl = activityData.activity.items[index].limitLvl || [];
    var limitMagicLvl = activityData.activity.items[index].limitLvl || [];
    var lvlMin = limitLvl[0] || 0;
    var lvlMax = limitLvl[1] || 999999;
    var magicLvlMin = limitLvl[0] || 0;
    var magicLvlMax = limitLvl[1] || 999999;
    if (userData.lvl < lvlMin && userData.lvl > lvlMax) return cb(getMsg(c_msgCode.lvLimit));
    if (userData.magicLvl < magicLvlMin && userData.magicLvl > magicLvlMax) return cb(getMsg(c_msgCode.lvLimit));
    //兑换的物品
    var actItem = activityData.activity.items[index].getItems;
    var items = {};
    var itemKey = 0;
    for (var key in actItem) {
        itemKey = parseInt(key);
        items[key] = actItem[key];
        break;
    }
    var revieData = userData.activity[activityData.activity.id] || [
        []
    ];
    var buyCount = revieData[0][index] || 0; //已兑换次数
    // 判断是否已购买到限制次数
    var limitValue = activityData.activity.items[index].limitNum;
    if (buyCount >= limitValue) {
        return cb(getMsg(c_msgCode.exchangeNumMaxed));
    }
    var bag = userData.bag;
    var needBag = activityData.activity.items[index].needItems; //集字条件
    if (!needBag) return cb(getMsg(c_msgCode.configError));
    var delBag = {};
    for (var key in needBag) {
        var costValue = needBag[key]
        var own = bag[key] || 0;
        if (own < costValue)
            return cb(getMsg(c_msgCode.materialUnenough));
        userUtils.delBag(userData, key, costValue, c_prop.itemCostTypeKey.other);
        delBag[key] = costValue;
    }
    buyCount += 1;
    revieData[0][index] = buyCount;
    userData.activity[activityData.activity.id] = revieData;

    //dadian 记录集字奖励
    var channelId = userData.channelId;
    var sdkChannelId = userData.sdkChannelId;
    var oObj = new ossObj.ossReward(userData.id, userData.lvl, activityData.activity.type, itemKey, JSON.stringify(items), channelId, sdkChannelId);
    ossBiz.WriteOss(oObj);

    return cb(null, [items, [],
        [], delBag
    ]);
};

//屠龙远征
_receiveFun[c_prop.activityTypeKey.killDragon] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    index = parseInt(index);
    //兑换的物品
    var actItem = activityData.activity.items[index];
    var limitValue = actItem.limitNum || 0; //可兑换次数
    var getItems = actItem.getItems || {}; //兑换的物品
    var items = {};
    var itemKey = 0;
    for (var key in getItems) {
        itemKey = parseInt(key);
        items[key] = getItems[key];
        break;
    }

    var revieData = userData.activity[activityData.activity.id] || [];
    var buyCount = revieData[0][index] || 0; //已兑换次数
    // 判断是否已购买到限制次数
    if (limitValue != 0 && buyCount >= limitValue) {
        return cb(getMsg(c_msgCode.exchangeNumMaxed));
    }
    var bag = userData.bag;
    var needBag = actItem.needItems; //条件
    if (!needBag) return cb(getMsg(c_msgCode.configError));
    var delBag = {};
    for (var key in needBag) {
        var costValue = needBag[key]
        var own = bag[key] || 0;
        if (own < costValue)
            return cb(getMsg(c_msgCode.materialUnenough));
        userUtils.delBag(userData, key, costValue, c_prop.itemCostTypeKey.other);
        delBag[key] = costValue;
    }
    buyCount += 1;
    revieData[0][index] = buyCount;
    userData.activity[activityData.activity.id] = revieData;

    //dadian 记录奖励
    var channelId = userData.channelId;
    var sdkChannelId = userData.sdkChannelId;
    var oObj = new ossObj.ossReward(userData.id, userData.lvl, activityData.activity.type, itemKey, JSON.stringify(items), channelId, sdkChannelId);
    ossBiz.WriteOss(oObj);

    return cb(null, [items, [],
        [], delBag
    ]);
};

//拉切尔的健身计划
_receiveFun[c_prop.activityTypeKey.lachelFitness] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    var activityId = activityData.activity.id;
    var actReceive = userData.activity[activityId][1] || {};
    if (actReceive[index]) return cb(getMsg(c_msgCode.hasReceivedReward)); //已领取
    var actItems = activityData.activity.items;
    //用户领取奖励的健身值
    var needValue = actItems[index]["target"] || 0;
    //用户的健身值
    var targetValue = userData.activity[activityId][2];
    if (targetValue < needValue) return cb(getMsg(c_msgCode.goalNotGet));

    //update
    //更新领取状态
    actReceive[index] = 1;
    userData.activity[activityId][1] = actReceive;

    var rewardId = actItems[index]["reward"];
    var c_rewardData = c_reward[rewardId];

    if (c_rewardData.prestige > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.prestige, c_rewardData.prestige, c_prop.itemGetTypeKey.event)
    }
    if (c_rewardData.gold > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.gold, c_rewardData.gold, c_prop.itemGetTypeKey.event)
    }
    if (c_rewardData.diamond > 0) {
        userUtils.addCurrency(userData, c_prop.currencyTypeKey.diamond, c_rewardData.diamond, c_prop.itemGetTypeKey.event)
    }

    let items = c_rewardData.rewardItems;
    //得到物品
    cb(null, [items]);
};

//用户调研
_receiveFun[c_prop.activityTypeKey.userSurvey] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();

    cb(null, []);
};

//探宝 消耗乐透值
_receiveFun[c_prop.activityTypeKey.lottery] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    /*
        3.  探宝抽库规则：

        a)  探宝1次：读取配置【c_lottery(抽宝箱表)】库1普通抽奖
        b)  探宝10次（指按钮，不是累积）：读取配置【c_lottery(抽宝箱表)】库2十次抽奖
        c)  探宝累积5次必中：读取配置【c_lottery(抽宝箱表)】库3抽奖必得
        d)  探宝10连抽：必中读取配置【c_lottery(抽宝箱表)】库4抽奖必得
        e)  探宝1次：读取配置【c_lottery(抽宝箱表)】库1权重获取物品
        f)  探宝10次：2库加7个+3库加2个+4库加1个
    */
    var userData = gamePlayer.userData;
    //获取对应的数据
    var items = {};
    var lotteryItemsArr = [];
    if (index != 1 && index != 10) return cb(getMsg(c_msgCode.paramsError));
    //必掉金币
    // var willFall = {};
    // willFall[c_prop.spItemIdKey.gold] = parseInt(c_game.lotteryWillFall[0])*parseInt(index);
    // items = propUtils.mergerProp(items,willFall);
    // lotteryItemsArr = lotteryItemsArr.concat(willFall);

    /*
    0 单抽总次数  
    1 十连总次数 
    2探宝总次数（每周清空） 
    3免费单抽的最后一次抽奖时间 
    4免费单抽剩余次数 
    5领取的箱子序号
    6每周刷新时间点
    */
    var receiveData = userData.activity[activityData.activity.id] || [];
    //抽奖次数
    var receiveCount = (index == 1 ? receiveData[0] : receiveData[1]) || 0;
    var freeCount = receiveData[4]; //免费次数 最高5次
    var costLottery = 999999999; //costDiamond
    var costDScore = 0;
    var prop = c_game.lotteryCostCfg[8] || 1; //打折

    var lotteryType = 1;
    if (index == 10) {
        //消耗乐透值

        costLottery = c_game.lotteryCostCfg[1] * prop;
        //探宝10次：2库加7个+3库加2个+4库加1个
        var random2Data = _getLotteryItems(2, 7, userData.lvl);
        var random3Data = _getLotteryItems(3, 2, userData.lvl);
        var random4Data = _getLotteryItems(4, 1, userData.lvl);

        items = propUtils.mergerProp(items, random2Data[0]);
        items = propUtils.mergerProp(items, random3Data[0]);
        items = propUtils.mergerProp(items, random4Data[0]);
        lotteryItemsArr = lotteryItemsArr.concat(random2Data[1]);
        lotteryItemsArr = lotteryItemsArr.concat(random3Data[1]);
        lotteryItemsArr = lotteryItemsArr.concat(random4Data[1]);

    } else if (index == 1) {
        if (freeCount > 0) {
            if (freeCount == 2) receiveData[3] = new Date(); //免费次数满时 重置下更新免费次数时间字段
            costLottery = 0;
            //有免费次数 消耗免费次数 不扣乐透值
            freeCount--;

            lotteryType = 0;
        } else {
            // return cb("免费次数不足");
            //单抽 改为只能免费次数抽    
            costLottery = c_game.lotteryCostCfg[0] * prop;
        }

        var randomData;
        if (receiveCount == 0) {
            randomData = _getLotteryItems(5, 1, userData.lvl);
        } else if ((receiveCount + 1) % 5 == 0) {
            randomData = _getLotteryItems(3, 1, userData.lvl);
        } else {
            randomData = _getLotteryItems(1, 1, userData.lvl);
        }
        items = propUtils.mergerProp(items, randomData[0]);
        lotteryItemsArr = lotteryItemsArr.concat(randomData[1]);
    }
    //额外奖励
    var mustGetChestId = activityData.activity.items.mustGetChestId || 100601;
    var mustGetItems = {};
    var exItem = {};
    for (var i = 0; i < index; i++) {
        var mustGetItems = itemBiz.calLogicItems(mustGetChestId); //必得宝箱随机的物品
        exItem = propUtils.mergerProp(exItem, mustGetItems);
        items = propUtils.mergerProp(items, mustGetItems);
    }
    //判断乐透值 是否足够
    var spItemId = c_prop.spItemIdKey.lottery;
    if (index == 1 && freeCount < 0) {
        if (!userData.bag[spItemId] || userData.bag[spItemId] < costLottery) {
            return cb(getMsg(c_msgCode.lotteryNonstandard));
        }
    } else if (index == 10) {
        if (!userData.bag[spItemId] || userData.bag[spItemId] < costLottery) {
            var hasLetou = userData.bag[spItemId] || 0;
            var costDScore = (costLottery - hasLetou) * 10;
            if (!userData.bag[c_prop.spItemIdKey.dScore] || userData.bag[c_prop.spItemIdKey.dScore] < costDScore) {
                return cb(getMsg(c_msgCode.lotteryNonstandard));
            } else {
                costLottery = hasLetou;
            }
        }
    }

    var delBag = {};
    if (costLottery > 0) {
        userUtils.delBag(userData, spItemId, costLottery, c_prop.itemCostTypeKey.activity);
        delBag[spItemId] = costLottery;
    }
    if (costDScore > 0) {
        userUtils.delBag(userData, c_prop.spItemIdKey.dScore, costDScore, c_prop.itemCostTypeKey.activity, 0, 0, activityData.activity.id + "-" + index);
        delBag[c_prop.spItemIdKey.dScore] = costDScore;
    }

    //items
    //推送系统消息(oldma)
    //第一个%s：玩家名
    //第二个%s：物品名
    for (var key in items) {
        var locItemData = t_item[key];
        // 只报传承装备和 11380 掉落结晶时（物品ID：3，4，5，6）也要有跑马灯和抽奖记录
        if ((t_itemEquip[key] && t_itemEquip[key].isUp) || key == 11380 || key == 122000 || (key >= 3 && key <= 6) ||
            key == 1400005 || key == 1400006 || key == 1400015 || key == 1400016 || key == 1989
        ) {
            chatBiz.addSysData(14, [userData.nickName, locItemData.name, locItemData.color]);
            chatBiz.addSysData(23, [userData.nickName, locItemData.name, locItemData.color]);
        }
    }

    //更新领取次数
    receiveCount++;
    if (index == 1) {
        receiveData[0] = receiveCount;
        receiveData[4] = freeCount;
    } else if (index == 10) {
        receiveData[1] = receiveCount;
        heroBiz.checkAndUpdateHeroTask(userData.id, c_prop.cHeroTaskKey.lotteryTenNum, 1);
    }
    receiveData[2] = receiveData[2] || 0; //2探宝总次数（每周清空）
    receiveData[2] += index;
    userData.activity[activityData.activity.id] = receiveData;
    //累计在天天乐透抽奖XX次
    var userId = userData.id;
    taskBiz.setTaskValue(client, userId, c_prop.cTaskTypeKey.letouNum, index, function() {});
    activityBiz.recordCarnivalValue(client, userId, c_prop.carnivalTaskTypeKey.lotteryNum, index, function() {});
    //dadian记录乐透次数
    var channelId = userData.channelId;
    var sdkChannelId = userData.sdkChannelId;
    var oObj = new ossObj.ossLottery(userId, userData.lvl, lotteryType, index, costLottery, costDScore, JSON.stringify(lotteryItemsArr), channelId, sdkChannelId);
    ossBiz.WriteOss(oObj);
    //得到物品
    cb(null, [items, lotteryItemsArr, [], delBag, exItem]);
};


//戴安娜的私人衣橱
_receiveFun[c_prop.activityTypeKey.dianaWardrobe] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    var items = {};
    var lotteryItemsArr = [];
    if (index != 1 && index != 10) return cb(getMsg(c_msgCode.paramsError));
    var serverLotteryNum = activityData.reUserNum || 0; //全服抽奖次数
    var receiveData = userData.activity[activityData.activity.id] || [];
    //抽奖次数
    var receiveCount = parseInt(receiveData[0] || 0);

    var costCfg = activityData.activity.exValues || {};
    var costNum = costCfg[index];
    if (!costNum) return cb(getMsg(c_msgCode.configError));
    var spItemId = c_prop.spItemIdKey.dScore;
    //判断积分 是否足够
    if (!userData.bag[spItemId] || userData.bag[spItemId] < costNum) {
        return cb(getMsg(c_msgCode.noIntegral));
    }

    var sPoolNum = normalPoolNum = tenPoolNum = 0; //全服奖金池  普通奖金池  第十抽奖金池
    for (var i = 1; i <= index; i++) {
        if ((serverLotteryNum + i) % 100 == 0) {
            sPoolNum++;
            continue;
        }
        if ((receiveCount + i) % 10 == 0) {
            tenPoolNum++;
            continue;
        }
        normalPoolNum++;
    }
    //console.error("==sPoolNum==normalPoolNum==tenPoolNum==", sPoolNum, normalPoolNum, tenPoolNum);
    //console.error("==serverLotteryNum==", serverLotteryNum);
    var poolType = activityData.activity.exValues.poolType || 0;
    if (index == 10) {
        //从不同的奖池计算
        var random2Data = _getLotteryItems_diana(1, normalPoolNum, userData.lvl, poolType);
        var random3Data = _getLotteryItems_diana(2, tenPoolNum, userData.lvl, poolType);
        var random4Data = _getLotteryItems_diana(3, sPoolNum, userData.lvl, poolType);

        items = propUtils.mergerProp(items, random2Data[0]);
        items = propUtils.mergerProp(items, random3Data[0]);
        items = propUtils.mergerProp(items, random4Data[0]);
        lotteryItemsArr = lotteryItemsArr.concat(random2Data[1]);
        lotteryItemsArr = lotteryItemsArr.concat(random3Data[1]);
        lotteryItemsArr = lotteryItemsArr.concat(random4Data[1]);

    } else if (index == 1) {
        var randomData;
        if (sPoolNum > 0) {
            randomData = _getLotteryItems_diana(3, 1, userData.lvl, poolType);
        } else if (tenPoolNum > 0) {
            randomData = _getLotteryItems_diana(2, 1, userData.lvl, poolType);
        } else {
            randomData = _getLotteryItems_diana(1, 1, userData.lvl, poolType);
        }
        items = propUtils.mergerProp(items, randomData[0]);
        lotteryItemsArr = lotteryItemsArr.concat(randomData[1]);
    }
    //额外奖励
    var mustGetChestId = costCfg.mustGetChestId || 100611;
    var mustGetItems = {};
    var exItem = {};
    for (var i = 0; i < index; i++) {
        var mustGetItems = itemBiz.calLogicItems(mustGetChestId); //必得宝箱随机的物品
        exItem = propUtils.mergerProp(exItem, mustGetItems);
        items = propUtils.mergerProp(items, mustGetItems);
    }

    var delBag = {};
    if (costNum > 0) {
        userUtils.delBag(userData, spItemId, costNum, c_prop.itemCostTypeKey.activity, 0, 0, activityData.activity.id + "-" + index);
        delBag[spItemId] = costNum;
    }

    //items
    //推送系统消息
    var activityName = activityData.activity.fullTitle || activityData.activity.title;
    for (var key in items) {
        var locItemData = t_item[key];
        var ignoreItemIds = [950, 100250, 100251, 100252];
        // 道具品级在6或以上的发系统公告，并且id不为950的深渊宝石
        if (parseInt(locItemData.color) > 5 && ignoreItemIds.indexOf(locItemData.id) < 0) {
            chatBiz.addSysData(184, [userData.nickName, activityName, locItemData.color, locItemData.name]);
            chatBiz.addSysData(185, [userData.nickName, activityName, locItemData.color, locItemData.name]);

            var recItems = {};
            recItems[locItemData.id] = 1;
            //日志类型employLogTypeKey
            employBiz.insertEmployRewardRecord(client, costCfg.employLogTypeKey, userData, 0, 0, recItems, function(err, data) {});
        }
    }

    //更新领取次数
    receiveCount += index;
    receiveData[0] = receiveCount;

    userData.activity[activityData.activity.id] = receiveData;
    //记录全服抽奖次数
    gameCommonBiz.updateFakeData(client, costCfg.fakeDataTypeKey, index, function(){});
    if (poolType == 1) {
        activityBiz.recordLachelFitnessValue(client,userData.id, c_prop.lachelActTaskTypeKey.dianaActNum, index, activityData.activity.id, function(){});
    } else if (poolType == 2) {
        activityBiz.recordTurntableValue(client,userData.id, c_prop.turntableTypeKey.auguryNum, index, activityData.activity.id, function(){});
    }

    // var userId = userData.id;
    // taskBiz.setTaskValue(client, userId, c_prop.cTaskTypeKey.letouNum, index, function() {});
    // activityBiz.recordCarnivalValue(client, userId, c_prop.carnivalTaskTypeKey.lotteryNum, index, function() {});
    //dadian 
    // var channelId = userData.channelId;
    // var sdkChannelId = userData.sdkChannelId;
    // var oObj = new ossObj.ossLottery(userId, userData.lvl, lotteryType, index, 0, costNum, JSON.stringify(lotteryItemsArr), channelId, sdkChannelId);
    // ossBiz.WriteOss(oObj); 
    cb(null, [items, lotteryItemsArr, [], delBag, exItem]);
};

var _getLotteryItems_diana = function(type, num, userLvl, poolType) {
    var items = {};
    var itemsArr = [];
    var randomArr = _getLotteryData_diana(type, userLvl, poolType);
    var ids = [];
    if (randomArr.length <= 0) return [items, itemsArr];

    for (var i = 0; i < num; i++) {
        var locId = commonUtils.getWeightRandomValue(randomArr);
        if (locId) ids.push(locId);
        var locLottery = c_lotteryDiana[locId];
        //itemId  minNum maxNum
        var locItemId = locLottery.itemId;
        var locItemNum = locLottery.minNum + 0 | (Math.random() * (locLottery.maxNum - locLottery.minNum + 1));
        var locItems = {};
        locItems[locItemId] = locItemNum;
        itemsArr.push(locItems);
        items = propUtils.mergerProp(items, locItems);
    }
    return [items, itemsArr];
};

var _getLotteryData_diana = function(type, userLvl, poolType) {
    if (Object.keys(lotteryArrData_diana).length <= 0) {
        var typeDate = {};
        for (var key in c_lotteryDiana) {
            var locData = c_lotteryDiana[key];
            typeDate = lotteryArrData_diana[locData.poolType] || {};
            var locDataArr = typeDate[locData.type] || [];
            locDataArr.push(locData);
            typeDate[locData.type] = locDataArr;
            lotteryArrData_diana[locData.poolType] = typeDate;
        }
    }
    var reList = [];
    var cutList = lotteryArrData_diana[poolType][type] || [];
    for (var i = 0; i < cutList.length; i++) {
        var locData = cutList[i];
        //限制等级
        if (userLvl < locData.needLvl) continue;
        if (locData.surpassLvl > 0 && userLvl >= locData.surpassLvl) continue;
        reList.push([locData.id, locData.rate]);
    }
    return reList;
};

// 积分便利店
_receiveFun[c_prop.activityTypeKey.dScoreShop] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    index = parseInt(index);
    var receiveData = userData.activity[activityData.activity.id] || {};

    // 商品
    var actItem = activityData.activity.items[index];
    //var spItemId = exData[c_prop.activityExDataTypeKey.spItemId];
    var spItemId = c_prop.spItemIdKey.dScore;
    if (!spItemId) return cb(getMsg(c_msgCode.paramsError));

    var costValue = 0;
    var limitValue = 0;
    var items = {};
    var itemKey = 0;
    for (var key in actItem) {
        itemKey = parseInt(key);
        costValue = actItem[key][0];
        limitValue = actItem[key][1];
        items[key] = actItem[key][2];
        break;
    }

    if (!userData.bag[spItemId] || userData.bag[spItemId] < costValue) {
        return cb(getMsg(c_msgCode.noIntegral));
    }

    // 判断是否已购买到限制次数
    var buyCount = receiveData[index] || 0; // 对应idx购买数量
    if (buyCount >= limitValue) {
        return cb(getMsg(c_msgCode.exchangeNumMaxed));
    }

    var delBag = {};
    userUtils.delBag(userData, spItemId, costValue, c_prop.itemCostTypeKey.activity, itemKey, items[itemKey], activityData.activity.id + "-" + index);
    delBag[spItemId] = costValue;

    receiveData[index] = buyCount + 1;
    userData.activity[activityData.activity.id] = receiveData;

    return cb(null, [items, [],
        [], delBag
    ]);
};

// 超级等级礼包
_receiveFun[c_prop.activityTypeKey.lvGift] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    //获取对应的数据
    var itemData = activityData.activityItems[index];
    if (!itemData) return cb(getMsg(c_msgCode.activitiesEnd)); //活动结束
    var items = itemData.items;

    var receiveData = userData.activity[activityData.activity.id] || [0]; // 领取次数
    //领取次数
    var receiveCount = receiveData[index] || 0;

    //已经领取过
    if (receiveCount > 0) return cb(getMsg(c_msgCode.lvGiftCant));

    //判断是否已满10级
    if (userData.lvl < 10) return cb(getMsg(c_msgCode.lvlRequire, 10));

    //更新领取次数
    receiveData[index] = 1;
    //记录新手礼包领取（紧急委托任务）
    taskBiz.setEntrustTaskValue(client, userData.id, c_prop.entrustTaskTypeKey.receiveLvGift, 1, function() {});

    userData.activity[activityData.activity.id] = receiveData;

    //得到物品
    cb(null, [items]);
};

// 天命基金
_receiveFun[c_prop.activityTypeKey.tmFund] = function(client, gamePlayer, activityData, index, cb) {
    //获取对应的数据
    var userData = gamePlayer.userData;
    var itemData = activityData.activityItems[index];
    if (!itemData) return cb(getMsg(c_msgCode.activitiesEnd)); //活动结束
    var items = itemData.items;

    var receiveData = userData.activity[activityData.activity.id] || [];
    //领取次数
    var receiveCount = receiveData[index] || 0;

    //已经领取过
    if (receiveCount > 0) return cb(getMsg(c_msgCode.tmFundCant));

    //update
    //更新领取次数
    receiveData[index] = 1;
    userData.activity[activityData.activity.id] = receiveData;

    //得到物品
    cb(null, [items]);
};

// 每日优选
_receiveFun[c_prop.activityTypeKey.dayShop] = function(client, gamePlayer, activityData, rechargeId, cb) {
    //获取对应的数据
    var userData = gamePlayer.userData;
    //var itemData = activityData.activityItems[index];
    //if (!itemData) return cb(getMsg(c_msgCode.activitiesEnd));//活动结束  
    var receiveData = userData.activity[activityData.activity.id] || [0, new Date(), 0]; //  [ 购买数量, 更新时间, 当前商品id]

    var oldRfTime = new Date(receiveData[1]);
    if (!oldRfTime.equalsDay(new Date())) {
        receiveData[0] = 0;
    }

    //领取次数
    var receiveCount = receiveData[0] || 0;
    var limitNum = activityData.activity.exValues[0] || 2;
    //if(receiveCount>=limitNum) return cb(getMsg(c_msgCode.noBuyTimes));//今日购买次数已用完

    if (receiveCount < limitNum) {
        //更新活动数据
        receiveData[0] += 1;
    } else {
        receiveData[0] = limitNum;
    }

    receiveData[1] = new Date();
    receiveData[2] = rechargeId;
    userData.activity[activityData.activity.id] = receiveData;
    //得到物品
    cb(null, [{}]);
};

// 打赏活动 giftShop
_receiveFun[c_prop.activityTypeKey.giftShop] = function(client, gamePlayer, activityData, rechargeId, cb) {
    //获取对应的数据
    var userData = gamePlayer.userData;
    var aId = activityData.activity.exValues[rechargeId];
    //if (!itemData) return cb(getMsg(c_msgCode.activitiesEnd));//活动结束  
    var receiveData = userData.activity[activityData.activity.id] || []; //  []

    //领取次数 
    receiveData.push(aId);
    userData.activity[activityData.activity.id] = receiveData;
    //得到物品
    cb(null, [{}]);
};

// 氪金礼包 kejin
_receiveFun[c_prop.activityTypeKey.kejin] = function(client, gamePlayer, activityData, rechargeId, cb) {
    //获取对应的数据
    //var aId = activityData.activity.exValues[rechargeId];
    //if (!itemData) return cb(getMsg(c_msgCode.activitiesEnd));//活动结束  
    var userData = gamePlayer.userData;
    var receiveData = userData.activity[activityData.activity.id] || []; //  []

    //领取次数 
    receiveData.push(rechargeId);
    userData.activity[activityData.activity.id] = receiveData;
    //得到物品
    cb(null, [{}]);
};

//转盘活动（星象转盘）
_receiveFun[c_prop.activityTypeKey.turntable] = function(client, gamePlayer, activityData, index, cb) {
    checkRequire();
    var userData = gamePlayer.userData;
    if (index != 1) return cb(getMsg(c_msgCode.paramsError));
    //获取对应的数据
    var items = {};
    var receiveData = userData.activity[activityData.activity.id] || [];
    var luckDrawNum = receiveData[1] || 0;
    var price = activityData.activity.exValues.price || 1;
    var costValue = index * price;
    if (luckDrawNum < costValue) return cb(getMsg(c_msgCode.lotteryTimesUnenough)); //抽奖次数不足
    var chestId = activityData.activity.exValues.chestId || 100501;
    var lotteryItemsArr = []; //客户端展示的抽奖结果
    for (var i = 0; i < index; i++) {
        var logicItems = itemBiz.calLogicItems(chestId); //宝箱随机的物品
        items = propUtils.mergerProp(items, logicItems);
        lotteryItemsArr.push(logicItems);
    }

    receiveData[1] = luckDrawNum - costValue;

    // for (var key in items) {
    //     var locItemData = t_item[key];
    //     chatBiz.addSysData(166, [userData.nickName, locItemData.id, locItemData.name, locItemData.color]);
    //     chatBiz.addSysData(167, [userData.nickName, locItemData.id, locItemData.name, locItemData.color]);

    //     //抽奖记录
    //     if (rType == 1) {
    //         // var locItemData = t_item[key];
    //         if (locItemData.color >= 5) {
    //             var recItems = {};
    //             recItems[key] = 1;
    //             employBiz.insertEmployRewardRecord(client, c_prop.employLogTypeKey.angelAndDevilLottery, userData, 0, 0, recItems, function(err, data) {});
    //         }
    //     }
    // }
    userData.activity[activityData.activity.id] = receiveData;
    cb(null, [items, lotteryItemsArr]);
};

/************************************************************************************************/
var _getWeightItem = function(weightArr) {
    var exDropId = 0;
    var weightTotal = 0;
    for (var id in weightArr) {
        weightTotal += weightArr[id];
    }
    var randNum = _getRandomNumber(0, weightTotal);
    var curWeight = 0;
    for (var id in weightArr) {
        curWeight += weightArr[id]
        if (randNum <= curWeight) {
            exDropId = id;
            break;
        }
    }
    return exDropId;
}

var _getLuckyTalosItems = function(index, spItemId, userData, activityData, c_data, amount, rare) {
    var userActivityData = userData.activity[activityData.activity.id] || {};
    //计算全概率，类别3组，其他组
    var itemArr = [];
    var weightTotal = 0;
    var item3Arr = [];
    var itemNo3Arr = [];
    var itemAllArr = [];
    var subType = activityData.activity.exData[c_prop.activityExDataTypeKey.subType] || 0;
    var now = new Date();
    for (var id in c_data) {
        var luckyTalos = c_data[id];
        if (luckyTalos.spItemId != spItemId || luckyTalos.subType != subType)
            continue;
        var lvGroup = luckyTalos.subTypeDivide || [0, 999];
        if (userData.lvl < lvGroup[0] || userData.lvl > lvGroup[1])
            continue;
        //检测是否已经超出掉落数量限制
        if (luckyTalos.itemLimit != 0) {
            var recevieData = userActivityData[id] || [0, 0];
            var recevieDate;
            if (recevieData[0]) {
                recevieDate = new Date(recevieData[0]);
            } else {
                recevieDate = now;
            }
            var recevieCount = recevieData[1];
            // console.log(id);
            if (recevieDate.isBefore(now) && recevieDate.clone().addHours(24).isAfter(now) && recevieCount >= luckyTalos.itemLimit)
                continue;
        }
        itemAllArr.push(id);
        if (!amount) {
            amount = luckyTalos.cardCount;
        }
        weightTotal += luckyTalos.weight;
        if (luckyTalos.class == 1) {
            if (luckyTalos.color >= 3) {
                item3Arr.push(id);
            } else {
                itemNo3Arr.push(id);
            }
        }
        if (luckyTalos.ifRare) {
            rare[luckyTalos.id] = luckyTalos.weight;
        }
    }

    //掉落
    var randNum = _getRandomNumber(0, weightTotal);
    var dropId = 0;
    var curWeight = 0;
    for (var i = 0; i < itemAllArr.length; i++) {
        var id = itemAllArr[i];
        var luckyTalos = c_data[id];
        if (luckyTalos.spItemId != spItemId || luckyTalos.subType != subType)
            continue;
        curWeight += luckyTalos.weight;
        if (randNum <= curWeight) {
            dropId = id;
            break;
        }
    }
    if (c_data[dropId] && c_data[dropId].itemLimit != 0) {
        var recevieData = userActivityData[dropId] || [0, 0];
        var recevieDate;
        if (recevieData[0]) {
            recevieDate = new Date(recevieData[0]);
        } else {
            recevieDate = now;
        }
        if (recevieDate.clone().addHours(24).isBefore(now)) {
            recevieData[1] = 0;
            recevieData[0] = now;
        }
        recevieData[1] += 1;
        userActivityData[dropId] = recevieData;
        userData.activity[activityData.activity.id] = userActivityData;
    }

    //掉落展示物品
    var dropIndex = item3Arr.indexOf(dropId);
    if (dropIndex != -1) {
        item3Arr.splice(dropIndex, 1);
    }
    var tempArr = _genknuth(amount - 2, item3Arr);
    dropIndex = itemNo3Arr.indexOf(dropId);
    if (dropIndex != -1) {
        itemNo3Arr.splice(dropIndex, 1);
    }
    var lastId = _genknuth(1, itemNo3Arr);
    tempArr.push(lastId[0]);
    for (var i = 0, j = 0; i < amount; i++) {
        if (i != index) {
            itemArr[i] = tempArr[j];
            j++
        } else {
            itemArr[i] = dropId;
        }
    }
    return itemArr;
};


var _genknuth = function(m, srcArr) {
    var desArr = [];
    var n = srcArr.length;
    if (n < m) {
        return [];
    } else if (n == m) {
        return srcArr;
    }
    for (var i = 0; i < n; i++) {
        if (_getRandomNumber(0, n - i - 1) < m) {
            m--;
            desArr.push(srcArr[i]);
        }
    }
    return srcArr;
};

// 增加每次多返回一个传承石
var _getLotteryItems = function(type, num, userLvl) {
    var items = {};
    var itemsArr = [];
    var randomArr = _getLotteryData(type, userLvl);
    var ids = [];
    if (randomArr.length <= 0) return [items, itemsArr];

    //var inheritedItemId = c_game.inheritedEquip[0]; // 传承石
    for (var i = 0; i < num; i++) {
        var locId = commonUtils.getWeightRandomValue(randomArr);
        if (locId) ids.push(locId);
        var locLottery = c_lottery[locId];
        //itemId  minNum maxNum
        var locItemId = locLottery.itemId;
        var locItemNum = locLottery.minNum + 0 | (Math.random() * (locLottery.maxNum - locLottery.minNum + 1));
        var locItems = {};
        locItems[locItemId] = locItemNum;
        //locItems[inheritedItemId] = 1; //传承石
        itemsArr.push(locItems);
        items = propUtils.mergerProp(items, locItems);
    }
    return [items, itemsArr];
};

var _getLotteryData = function(type, userLvl) {
    if (Object.keys(lotteryArrData).length <= 0) {
        for (var key in c_lottery) {
            var locData = c_lottery[key];
            var locDataArr = lotteryArrData[locData.type] || [];
            locDataArr.push(locData);
            lotteryArrData[locData.type] = locDataArr;
        }
    }
    var reList = [];
    var cutList = lotteryArrData[type] || [];
    for (var i = 0; i < cutList.length; i++) {
        var locData = cutList[i];
        //限制等级
        if (userLvl < locData.needLvl) continue;
        if (locData.surpassLvl > 0 && userLvl >= locData.surpassLvl) continue;
        reList.push([locData.id, locData.rate]);
    }
    return reList;
};

//输出指定范围内的随机数的随机整数
var _getRandomNumber = function(start, end) {
    var choice = end - start + 1;
    return Math.floor(Math.random() * choice + start);
};

/**
 * 获取每日参与活动次数
 * param activityDataDay [count,refreshTime]
 */
var _getTodayCount = function(activityDataDay) {
    var count = activityDataDay[0];
    var refreshTime = activityDataDay[1];
    if (refreshTime) {
        refreshTime = new Date(refreshTime);
        if (!refreshTime.equalsDay(new Date())) {
            refreshTime = new Date();
            count = 0;
        }
    }
    activityDataDay[0] = count;
    activityDataDay[1] = refreshTime;
    return count;
};

/**
 * 添加额外必的物品
 * @param items
 * @param exItem
 * @private
 */
var _addExItem = function(items) {
    var gold = items[c_prop.spItemIdKey.gold] || 0;
    items[c_prop.spItemIdKey.gold] = gold + c_game.talosWillFall[0];
}