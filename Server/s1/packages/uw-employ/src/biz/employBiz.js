/**
 * Created by Administrator on 2015/9/16.
 */
var exports = module.exports;
var uwData = require("uw-data");
var c_prop = uwData.c_prop;
var c_game = uwData.c_game;
var t_employ = uwData.t_employ;
var t_item = uwData.t_item;
var t_hero = uwData.t_hero;
var commonUtils = require("uw-utils").commonUtils;
var propUtils = require("uw-utils").propUtils;
var employRewardRecordDao = require("../dao/employRewardRecordDao");
var EmployRewardRecordEntity = require("uw-entity").EmployRewardRecordEntity;
var getMsg = require("uw-utils").msgFunc(__filename);
var c_msgCode = uwData.c_msgCode;
//var async = require("async"); 
var g_data = require("uw-global").g_data;
var g_guild = require("uw-global").g_guild;
var g_cache = require("uw-global").g_cache;
var ossObj = require("uw-log").ossObj;
var ossBiz = require("uw-log").ossBiz;
var userDao = null;
var userBiz = null;
var userUtils = null;
var taskBiz = null;
var chatBiz = null;
var checkRequire = function() {
    userDao = userDao || require("uw-user").userDao;
    userBiz = userBiz || require("uw-user").userBiz;
    userUtils = userUtils || require("uw-user").userUtils;
    taskBiz = taskBiz || require("uw-task").taskBiz;
    chatBiz = chatBiz || require("uw-chat").chatBiz;
};


var ds = require("uw-ds").ds;
var exports = module.exports;

//初始化数据
exports.getInfo = function(client, userId, cb) {
    checkRequire();
    _getRecordData(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var up = false;
        if (Object.getOwnPropertyNames(userData.employData).length === 0) {  // 第一次
            up = true;
            _refreshEmployList(userData, true);
        } else if (_needRefresh(userData)) {
            up = true;
            _refreshEmployList(userData);
        }
        if (up) gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        cb(null, userData);
        // if(up){
        //      userDao.update(client, {employData: userData.employData}, {id: userId}, function(err, data){
        //         cb(null, userData);
        //      });
        // }else{
        //     cb(null,userData);
        // }
    });
};

// 雇佣
exports.employ = function(client, userId, idx, cb) {
    checkRequire();
    _getRecordData(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var employData = userData.employData;
        if (!_isDone(employData, userData)) {
            return cb(getMsg(c_msgCode.haveMerc));//当前还有雇佣任务未完成
        }

        var eper = employData.eplist[idx];
        // 是否金币足够
        if (eper.gold) {
            if (userData.gold < eper.gold || eper.gold < 0) return cb(getMsg(c_msgCode.noGolds));//金币不足
            userUtils.costCurrency(userData, c_prop.currencyTypeKey.gold, eper.gold, c_prop.goldCostTypeKey.employ, eper.id, 1);
        }
        if (eper.diamond) {
            if (userData.diamond < eper.diamond || eper.diamond < 0) return cb(getMsg(c_msgCode.noDiamond));//钻石不足; 
            userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, eper.diamond, c_prop.diamondCostTypeKey.employ, eper.id, 1);
        }

        var doneTime = new Date(employData.doneTime) || new Date();
        if (doneTime.getWeekNumber() != (new Date()).getWeekNumber()) {
            employData.doneList = [];
        }
        employData.doneList = employData.doneList || [];
        if (employData.doneList.indexOf(eper.id) == -1) {
            employData.doneList.push(eper.id);
        }

        var newEper = {
            id: eper.id,
            hero: eper.hero,
            diamond: eper.diamond,
            gold: eper.gold,
            degree: eper.degree,
            duration: eper.duration,   // 秒
            leftTime: eper.duration,   // 秒
        };

        newEper.items = _getRewardItems(eper.id);
        newEper.extItems = _getRewardExtItems(eper.id);
        newEper.isGetExtItems = 0;
        newEper.openTime = (new Date()).getTime();
        if (Math.random() * 10000 <= t_employ[eper.id].exploreSucc) {
            newEper.succ = 1;       //  成功
        } else {
            newEper.succ = 0;
        }
        newEper.reward = [];
        userData.employData.eper = newEper;
        userData.employData.doneTime = new Date();

        var userFirstData = userData.exData[c_prop.userExDataKey.firstData] || {};
        if (!userFirstData[c_prop.firstDataKey.employ]) {
            chatBiz.addSysData(116, [userData.nickName, t_employ[eper.id].name]);//第一次雇佣
            userFirstData[c_prop.firstDataKey.employ] = 1;
            userData.exData[c_prop.userExDataKey.firstData] = userFirstData;
        }

        var updateData = {
            employData: userData.employData,
            diamond: userData.diamond,
            gold: userData.gold,
            exData: userData.exData
        };

        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);

        cb(null, [userData, eper.diamond, eper.gold]);
    });
};

//雇佣完成领取额外物品
exports.getExtItems = function(client, userId, cb) {
    checkRequire();
    _getRecordData(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var employData = userData.employData;
        if (!employData.eper) {
            return cb(getMsg(c_msgCode.noExplore));//当前没有探索任务
        }

        var eper = employData.eper;
        if (eper.openTime + eper.duration * 1000 > (new Date()).getTime()) {
            return cb(getMsg(c_msgCode.haveExplore));//探索任务还没有结束
        }

        if (eper.reward.succ == 0) {
            return cb(getMsg(c_msgCode.exploreLose));//探索失败无法领取
        }

        if (employData.eper.isGetExtItems == 1) {
            return cb(getMsg(c_msgCode.rewardEnd));//奖励已领取结束
        }

        if (!employData.eper) return cb(getMsg(c_msgCode.paramsError));//参数错误
        if (!employData.eper.extItems || JSON.stringify(employData.eper.extItems) == "{}") return cb(getMsg(c_msgCode.paramsError));//没有额外物品
        
        var items = employData.eper.extItems;

        //计算物品
        var bagItems = {};
        var equipBagItems = {};
        var itemsArr = [];
        var equipBagItems = {};
        var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.employReward);

        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);

        //标记雇佣额外物品已领取
        employData.eper.isGetExtItems = 1;

        var updateData = {
            employData: userData.employData
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));
        return cb(null, [updateData, bagItems, equipBagItems]);
    });
};


// 主动刷新
exports.refresh = function(client, userId, cb) {
    checkRequire();
    _getRecordData(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var employData = userData.employData;
        if (!_isDone(employData, userData)) {
            return cb(getMsg(c_msgCode.haveMerc));//当前还有雇佣任务未完成
        }

        var costDiamond = 0;
        if (!_needRefresh(userData)) {
            costDiamond = parseInt(c_game.employCfg[6]);
            if (userData.diamond < costDiamond || costDiamond < 0) return cb(getMsg(c_msgCode.noDiamond));//钻石不足; 
            userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.refreshEmploy);

            //dadian记录刷新佣兵
            // var oObj = new ossObj.ossCostCurrency(userId, userData.lvl, "yb", c_prop.diamondCostTypeKey.refreshEmploy, costDiamond, 0, '', 1);
            // ossBiz.WriteOss(oObj);
        }
        _refreshEmployList(userData);

        var updateData = {
            employData: userData.employData,
            diamond: userData.diamond
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        //userDao.update(client, updateData, {id: userId}, function(err, data){
        cb(null, [updateData, costDiamond]);
        //});       
    });

};

// 减少cd
exports.reduceCD = function(client, userId, cb) {
    checkRequire();
    _getRecordData(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var employData = userData.employData;
        if (!employData.eper) {
            return cb(getMsg(c_msgCode.noExplore));//当前没有探索任务
        }

        var eper = employData.eper;
        var itemId = 1808;  // 佣兵加速令
        var ownItemCount = userData.bag[itemId] || 0;
        if (ownItemCount <= 0) return cb(getMsg(c_msgCode.noMercSpeed));//佣兵加速令已经没有了
        var interval = 1800;  // 减少30分
        eper.duration = eper.duration - interval;
        if (eper.duration < 0) eper.duration = 0;
        var tmNow = (new Date()).getTime();
        eper.leftTime = Math.floor((eper.openTime + eper.duration * 1000 - tmNow) / 1000);
        if (eper.leftTime < 0) {
            eper.leftTime = 0;
        }
        // 处理异常
        if (eper.duration <= 0) {
            eper.leftTime = 0;
        }

        // 扣物品
        var delBagItems = {};
        delBagItems[itemId] = 1;
        userUtils.delBag(userData, itemId, 1, c_prop.itemCostTypeKey.inherit);

        var updateData = {
            employData: userData.employData
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);

        //userDao.update(client,updateData,{id:userId},function(err, data){
        // if (err) return cb(err);
        return cb(null, [updateData, delBagItems]);
        // });
    });
};

// 点击领取奖励
exports.reward = function(client, userId, idx, cb) {
    checkRequire();
    _getRecordData(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var employData = userData.employData;
        if (!employData.eper) {
            return cb(getMsg(c_msgCode.noExplore));//当前没有探索任务
        }

        var eper = employData.eper;
        if (eper.openTime + eper.duration * 1000 > (new Date()).getTime()) {
            return cb(getMsg(c_msgCode.haveExplore));//探索任务还没有结束
        }

        if (eper.reward.succ == 0) {
            return cb(getMsg(c_msgCode.exploreLose));//探索失败无法领取
        }

        if (eper.reward.length >= _getEmployRewardMaxNum(userData)) {
            return cb(getMsg(c_msgCode.rewardEnd));//奖励已领取结束
        }

        if (eper.reward.indexOf(parseInt(idx)) != -1) {
            return cb(getMsg(c_msgCode.noRepeatReward));//不能重复领取
        }

        eper.reward = eper.reward || [];
        eper.reward.push(parseInt(idx));

        var items = eper.items[idx];

        //计算物品
        var bagItems = {};
        var equipBagItems = {};
        var itemsArr = [];
        var equipBagItems = {};
        var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.employReward);

        var rwdItemId = Object.keys(items)[0];
        var color = t_item[rwdItemId].color;

        if (color > 3)
            exports.insertEmployRewardRecord(client, 0, userData, eper.id, eper.hero, items, function(err, data) {
            });

        // 领取结束,重新刷新雇佣列表  
        if (eper.reward.length == _getEmployRewardMaxNum(userData)) {
            _refreshEmployList(userData);
        }

        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);

        var updateData = {
            employData: userData.employData,
            heroData: userData.heroData,
            heroNum: userData.heroNum,
            buff: userData.buff
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));
        return cb(null, [updateData, bagItems, equipBagItems]);
    });
};

// 点击领取feedback 奖励
exports.feedback = function(client, userId, cb) {
    checkRequire();
    _getRecordData(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var employData = userData.employData;
        if (!employData.eper) {
            return cb(getMsg(c_msgCode.noExplore));//当前没有探索任务
        }

        var eper = employData.eper;
        if (eper.openTime + eper.duration > (new Date()).getTime()) {
            return cb(getMsg(c_msgCode.haveExplore));//探索任务还没有结束
        }

        if (eper.reward.succ == 0) {
            return cb(getMsg(c_msgCode.noRewardGift));//无法领取回馈奖励
        }

        //eper.done = 1; 
        delete employData.eper;

        // 返回5倍 改为2倍
        var items = {};
        if (eper.gold > 0) {
            items[c_prop.spItemIdKey.gold] = eper.gold * 2;
        } else if (eper.diamond > 0) {
            items[c_prop.spItemIdKey.diamond] = eper.diamond * 2;
        }

        // 领取结束,重新刷新雇佣列表  
        _refreshEmployList(userData);

        userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.employFb);
        var updateData = {
            gold: userData.gold,
            diamond: userData.diamond,
            employData: userData.employData
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        //userDao.update(client,updateData,{id:userId},function(err, data){
        //if (err) return cb(err);
        return cb(null, [updateData]);
        // });
    });
};

exports.getRewardHistory = function(client, type, cb) {
    checkRequire();
    var condition = "ORDER BY id DESC limit 50";
    employRewardRecordDao.list(client, "recordType = ? " + condition, [type], function(err, hisList) {
        if (err) return cb(err);
        cb(null, hisList);
    });
};

/***
 * 插入雇佣奖励
 *
 */
exports.insertEmployRewardRecord = function(client, recordType, userData, employId, heroId, items, cb) {
    var employRewwardEntity = new EmployRewardRecordEntity();
    employRewwardEntity.recordType = recordType;
    employRewwardEntity.userId = userData.id;
    employRewwardEntity.userName = userData.nickName;
    employRewwardEntity.employId = employId;
    employRewwardEntity.heroId = heroId;
    employRewwardEntity.items = items;
    var myGuildId = g_data.getGuildId(userData.userId);
    var myGuild = g_guild.getGuild(myGuildId);
    var guildName = "";
    if (myGuild) {
        guildName = myGuild.name;
    }
    employRewwardEntity.guildName = guildName;
    employRewwardEntity.recordDate = new Date();
    employRewardRecordDao.insert(client, employRewwardEntity, cb);
};


//  employData 只更新内存结构, 不更新数据库
var _getRecordData = function(client, userId, cb) {
    //userDao.select(client,{id:userId},function(err,userData) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        // 重算剩余时间 
        userData.employData = userData.employData || {};
        var employData = userData.employData;
        if (Object.getOwnPropertyNames(employData).length) {
            var tmNow = (new Date()).getTime();
            employData.leftRefreshTm = Math.floor((employData.refreshTime + parseInt(c_game.employCfg[7]) * 1000 - tmNow) / 1000);
            if (employData.leftRefreshTm < 0) {
                employData.leftRefreshTm = 0;
            }
            var eper = employData.eper;
            if (eper) {
                eper.leftTime = Math.floor((eper.openTime + eper.duration * 1000 - tmNow) / 1000);
                if (eper.leftTime < 0) {
                    eper.leftTime = 0;
                }
            }
        }

        return cb(null, gamePlayer);
    });
};

var _needRefresh = function(userData) {
    if (!userData.employData || !userData.employData.eplist) {
        return true;
    }
    // 如果还有雇佣任务未完成，不能刷新
    if (userData.employData.eper && userData.employData.eper.reward.length < _getEmployRewardMaxNum(userData)) {
        return false;
    }
    // 已2个小时没有雇佣
    var tmNow = (new Date()).getTime();
    //console.log(tmNow, userData.employData.refreshTime);
    if (tmNow - userData.employData.refreshTime > parseInt(c_game.employCfg[7]) * 1000) {
        return true;
    }
    return false;
}

var _refreshEmployList = function(userData, init) {
    userData.employData = userData.employData || {}
    var employData = userData.employData;
    delete employData.eper;
    employData.refreshTime = (new Date).getTime();
    employData.leftRefreshTm = parseInt(c_game.employCfg[7]);

    var doneTime = new Date(userData.employData.doneTime) || new Date();
    if (doneTime.getWeekNumber() != (new Date()).getWeekNumber()) {
        userData.employData.doneList = [];
    }

    employData.eplist = [];
    var doneList = [];
    var t1 = _spawnEmployTask(userData.employData.doneList, init);
    employData.eplist.push(t1);
    t1 = _spawnEmployTask(userData.employData.doneList, init);
    employData.eplist.push(t1);
    userData.employData = employData;
}

var _spawnEmployTask = function(doneList, init) {
    if (!doneList) {
        doneList = [];
    }

    var cfg;
    if (init) {
        cfg = c_game.employCfg[0];
    } else {
        cfg = c_game.employCfg[1];
    }
    // 找到SS
    // if (doneList.indexOf(5) != -1){
    //     cfg = c_game.employCfg[5]
    // }else if(doneList.indexOf(4) != -1){
    //     cfg = c_game.employCfg[4];
    // }else if(doneList.indexOf(3) != -1){
    //     cfg = c_game.employCfg[3];
    // }else if(doneList.indexOf(2) != -1){
    //     cfg = c_game.employCfg[2];
    // }else if(doneList.indexOf(1) != -1){
    //     cfg = c_game.employCfg[1];
    // }else {
    //     cfg = c_game.employCfg[0];
    // }  

    var id = commonUtils.getWeightRandomValue(commonUtils.strToArrInArr(cfg));
    var epCfg = t_employ[id];

    var idx = commonUtils.getWeightRandom([epCfg.diamondWeight, epCfg.goldWeight]);
    var eper = {};
    eper.id = id;
    if (idx == 0) {
        eper.diamond = epCfg.costDiamond;
    } else {
        eper.gold = epCfg.costGold;
    }
    eper.hero = commonUtils.getRandomOne(epCfg.heroIds);
    eper.degree = commonUtils.getRandomNum(epCfg.minExplore, epCfg.maxExplore);
    eper.duration = epCfg.exploreBaseTime * eper.degree;

    return eper;
}


var _getRewardItems = function(id) {
    var cfg = t_employ[id];
    var ret = [];

    var rate1 = [];
    for (var i = 0; i < cfg.items.length; i++) {
        rate1.push(parseInt(cfg.items[i][2]));
    }

    for (var i = 0; i < 3; i++) {
        var idx = commonUtils.getWeightRandom(rate1);
        var it = {};
        it[cfg.items[idx][0]] = parseInt(cfg.items[idx][1]);
        ret.push(it);
    }

    var rate2 = [];
    for (var i = 0; i < cfg.items2.length; i++) {
        rate2.push(parseInt(cfg.items2[i][2]));
    }

    for (var i = 0; i < 2; i++) {
        var idx = commonUtils.getWeightRandom(rate2);
        var it = {};
        it[cfg.items2[idx][0]] = parseInt(cfg.items2[idx][1]);
        ret.push(it);
    }

    var rate3 = [];
    for (var i = 0; i < cfg.items3.length; i++) {
        rate3.push(parseInt(cfg.items3[i][2]));
    }

    var idx = commonUtils.getWeightRandom(rate3);
    var it = {};
    it[cfg.items3[idx][0]] = parseInt(cfg.items3[idx][1]);
    ret.push(it);
    return ret;
}

//雇佣完成获得额外物品
var _getRewardExtItems = function(id) {
    var cfg = t_employ[id].extItems || [];
    var ret = {};
    for (var i = 0; i < cfg.length; i++) {
        var locCreate = cfg[i];
        if (Math.random() * 10000 <= locCreate[2]) {
            ret[locCreate[0]] = locCreate[1];
        }
    }
    
    return ret;
}

var _isDone = function(employData, userData) {
    if (employData.eper && employData.eper.reward.length < _getEmployRewardMaxNum(userData)) {
        return false;
    }
    return true;
}

var _getEmployRewardMaxNum = function(userData) {
    var maxNum = 2;
    if (userUtils.isMonthUser(userData)) {
        maxNum = 3;
    }
    return maxNum;
};
//_spawnEmployTask([1]);
//var items = _getRewardItems(1);
//console.log(items);






