/**
 * Created by liuqiang on 2017/11/28.
 * 运营打点日志
 */
var uwData = require("uw-data");

var c_prop = uwData.c_prop;
var exports = module.exports;

var _checkChannel = function(channelId){
    if (!channelId) return "";
    return channelId.toString();
};

// 登录
exports.ossLogin = function(userId, nickName, lvl, channelId, sdkChannelId) {
    this.op = "login";
    this.serverId = 0;
    this.userId = userId;       // 角色id
    this.nickName = nickName;
    this.lvl = lvl;           // 角色等级
    this.channelId = _checkChannel(channelId);
    this.sdkChannelId = _checkChannel(sdkChannelId);
    this.rTime = Math.floor(new Date().getTime() / 1000); //(new Date()).toFormat("YYYY-MM-DD HH24:MI:SS");    // 记录时间
};

exports.ossItemObj = function(id, name, num) {
    this.id = parseInt(id);
    this.name = name;
    this.num = num;
};

// 物品
exports.ossItem = function(subOp, type, userId, nickName, accountId, lvl, items, channelId, sdkChannelId) {
    this.op = "item";
    this.subOp = subOp; //"inflow";  // inflow outflow
    this.serverId = 0;
    this.type = type;
    this.userId = userId;
    this.nickName = nickName;
    this.accountId = accountId;
    this.lvl = lvl;
    this.items = items;  // ossItemObj
    this.channelId = _checkChannel(channelId); 
    this.sdkChannelId = _checkChannel(sdkChannelId);
    this.rTime = Math.floor(new Date().getTime() / 1000); //(new Date()).toFormat("YYYY-MM-DD HH24:MI:SS");    // 记录时间
};

// 注册
exports.ossRegister = function(channelId, sdkChannelId, openId, accountId, ip) {
    this.op = "register";
    this.serverId = 0;
    this.channelId = _checkChannel(channelId);
    this.sdkChannelId = _checkChannel(sdkChannelId);
    this.openId = openId;
    this.accountId = accountId;
    this.ip = ip;
    this.rTime = Math.floor(new Date().getTime() / 1000); //(new Date()).toFormat("YYYY-MM-DD HH24:MI:SS");    // 记录时间
};

// 创角
exports.ossCreateRole = function(accountId, userId, nickName, channelId, sdkChannelId) {
    this.op = "createRole";
    this.serverId = 0;
    this.accountId = accountId;
    this.userId = userId;
    this.nickName = nickName;
    this.channelId = _checkChannel(channelId);
    this.sdkChannelId = _checkChannel(sdkChannelId);
    this.rTime = Math.floor(new Date().getTime() / 1000); //(new Date()).toFormat("YYYY-MM-DD HH24:MI:SS");    // 记录时间
};

// 任务
exports.ossTask = function(userId, nickName, lvl, taskType, cTaskType, taskId, taskName, channelId, sdkChannelId) {
    this.op = "task";
    this.serverId = 0;
    this.userId = userId;
    this.nickName = nickName;
    this.lvl = lvl;
    this.taskType = taskType;
    this.cTaskType = cTaskType;
    this.taskId = taskId;
    this.taskName = taskName;
    this.channelId = _checkChannel(channelId);
    this.sdkChannelId = _checkChannel(sdkChannelId);
    this.rTime = Math.floor(new Date().getTime() / 1000); //(new Date()).toFormat("YYYY-MM-DD HH24:MI:SS");    // 记录时间
};

// 充值
exports.ossRecharge = function(userId, lvl, rechargeId, cost, channelId, sdkChannelId) {
    this.op = "recharge";
    this.serverId = 0;
    this.userId = userId;
    this.lvl = lvl;
    this.rechargeId = rechargeId;
    this.cost = cost;  // 人民币
    this.channelId = _checkChannel(channelId);
    this.sdkChannelId = _checkChannel(sdkChannelId);
    this.rTime = Math.floor(new Date().getTime() / 1000); //(new Date()).toFormat("YYYY-MM-DD HH24:MI:SS");    // 记录时间
};

// 获得货币
exports.ossGetCurrency = function(userId, lvl, currency, type, num, itemId, itemNum, para, channelId, sdkChannelId) {
    switch (currency) {
        case c_prop.currencyTypeKey.gold:
            this.op = "currencyGold";
            break;
        case c_prop.currencyTypeKey.diamond:
            this.op = "currencyDiamond";
            break;
        case c_prop.currencyTypeKey.dScore:
            this.op = "currencyDScore";
            break;
        default:
            return;
    }
    this.subOp = "get";
    this.serverId = 0;
    this.userId = userId;
    this.lvl = lvl;
    this.type = type; // 什么方式获得
    this.num = num;
    this.itemId = itemId * 1;
    this.itemNum = itemNum;
    this.para = para || "";
    this.channelId = _checkChannel(channelId);
    this.sdkChannelId = _checkChannel(sdkChannelId);
    this.rTime = Math.floor(new Date().getTime() / 1000); //(new Date()).toFormat("YYYY-MM-DD HH24:MI:SS");    // 记录时间
};

// 消耗货币(钻石，积分)
exports.ossCostCurrency = function(userId, lvl, currency, type, num, itemId, itemNum, para, channelId, sdkChannelId) {
    switch (currency) {
        case c_prop.currencyTypeKey.gold:
            this.op = "currencyGold";
            break;
        case c_prop.currencyTypeKey.diamond:
            this.op = "currencyDiamond";
            break;
        case c_prop.currencyTypeKey.dScore:
            this.op = "currencyDScore";
            break;
    }
    this.subOp = "cost";
    this.serverId = 0;
    this.userId = userId;
    this.lvl = lvl;
    this.type = type; // 什么方式获得
    this.num = num;
    this.itemId = itemId * 1;
    this.itemNum = itemNum;
    this.para = para || "";
    this.channelId = _checkChannel(channelId);
    this.sdkChannelId = _checkChannel(sdkChannelId);
    this.rTime = Math.floor(new Date().getTime() / 1000); //(new Date()).toFormat("YYYY-MM-DD HH24:MI:SS");    // 记录时间
};

// 在线人数
exports.ossOnlineNum = function(num) {
    this.op = "onlineNum";
    this.serverId = 0;
    this.num = num;
    this.rTime = Math.floor(new Date().getTime() / 1000); //(new Date()).toFormat("YYYY-MM-DD HH24:MI:SS");    // 记录时间
};
// 商店购买
exports.ossBuy = function(userId, lvl, shopType, currencyType, currencyNum, goodsId, itemId, itemName, itemNum, channelId, sdkChannelId) {
    this.op = "buy";
    this.serverId = 0;
    this.userId = userId;
    this.lvl = lvl;
    this.shopType = shopType;
    this.currencyType = currencyType;
    this.currencyNum = currencyNum;
    this.goodsId = goodsId;
    this.itemId = itemId;
    this.itemName = itemName;
    this.itemNum = itemNum;
    this.channelId = _checkChannel(channelId);
    this.sdkChannelId = _checkChannel(sdkChannelId);
    this.rTime = Math.floor(new Date().getTime() / 1000); //(new Date()).toFormat("YYYY-MM-DD HH24:MI:SS");    // 记录时间
};
// 拉霸
exports.ossLaba = function(userId, lvl, type, labaNum, costItemNum, costDiamond, Data, channelId, sdkChannelId) {
    this.op = "laba";
    this.serverId = 0;
    this.userId = userId;
    this.lvl = lvl;
    this.type = type;
    this.labaNum = labaNum;
    this.costItemNum = costItemNum;
    this.costDiamond = costDiamond;
    this.Data = Data;
    this.channelId = _checkChannel(channelId);
    this.sdkChannelId = _checkChannel(sdkChannelId);
    this.rTime = Math.floor(new Date().getTime() / 1000); // (new Date()).toFormat("YYYY-MM-DD HH24:MI:SS");    // 记录时间
};
// // 玩家升级
// exports.ossLevelUp = function(userId,lvl,diamond,gold,honor){
// 	this.op = "levelup";
// 	this.serverId = 0; 
// 	this.lvl = lvl;
// 	this.diamond = diamond;
// 	this.gold = gold;
// 	this.honor = honor;
// 	this.rTime = (new Date()).toFormat("YYYY-MM-DD HH24:MI:SS");    // 记录时间
// };

// 聊天信息
exports.ossChatMsg = function(accountId, account, userId, nickName, type, content) {
    this.op = "chat";
    this.serverId = 0;
    this.accountId = 0;
    this.account = account;
    this.userId = userId;
    this.nickName = nickName;
    this.content = content;
    this.type = type;
    this.chatTime = Math.floor(new Date().getTime() / 1000);
}

// 乐透
exports.ossLottery = function(userId, lvl, type, lotteryNum, costItemNum, costScore, Data, channelId, sdkChannelId) {
    this.op = "lottery";
    this.serverId = 0;
    this.userId = userId;
    this.lvl = lvl;
    this.type = type;
    this.lotteryNum = lotteryNum;
    this.costItemNum = costItemNum;
    this.costScore = costScore;
    this.Data = Data;
    this.channelId = _checkChannel(channelId);
    this.sdkChannelId = _checkChannel(sdkChannelId);
    this.rTime = Math.floor(new Date().getTime() / 1000); // (new Date()).toFormat("YYYY-MM-DD HH24:MI:SS");    // 记录时间
};

// 开服排名
exports.ossOpenServerRank = function(userId, lvl, regTime, payTotal, rankScore, type, dayNum, Data) {
    this.op = "openServerRank";
    this.serverId = 0;
    this.userId = userId;
    this.lvl = lvl;
    this.regTime = regTime;	//
    this.payTotal = payTotal;	//充值总额
    this.rankScore = rankScore;	//活动类型
    this.type = type;	//活动类型
    this.dayNum = dayNum;
    this.Data = Data;
    this.rTime = Math.floor(new Date().getTime() / 1000); // (new Date()).toFormat("YYYY-MM-DD HH24:MI:SS");    // 记录时间
};


// 领奖
exports.ossReward = function(userId, lvl, type, rewardId, Data, channelId, sdkChannelId) {
    this.op = "reward";
    this.serverId = 0;
    this.userId = userId;
    this.lvl = lvl;
    this.type = type;  //活动类型
    this.rewardId = rewardId;  //领取的目标奖励
    this.Data = Data;
    this.channelId = _checkChannel(channelId);
    this.sdkChannelId = _checkChannel(sdkChannelId);
    this.rTime = Math.floor(new Date().getTime() / 1000); // (new Date()).toFormat("YYYY-MM-DD HH24:MI:SS");    // 记录时间
};


// boss
exports.ossBoss = function(bornTime, bossType, bossId, firstFightTime, deadTime, endTime, userNum, maxCombat, killNum) {
    this.op = "boss";
    this.serverId = 0;
    this.bornTime = bornTime;
    this.bossType = bossType;
    this.bossId = bossId;
    this.firstFightTime = firstFightTime;
    this.deadTime = deadTime;
    this.endTime = endTime;
    this.userNum = userNum;
    this.maxCombat = maxCombat;
    this.killNum = killNum;
};






