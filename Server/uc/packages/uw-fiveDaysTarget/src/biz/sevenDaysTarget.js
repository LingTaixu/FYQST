/**
 * Created by Administrator on 2015/12/15.
 */
var uwData = require("uw-data");
var c_task = uwData.c_task;
var async = require("async");
var mailBiz = require("uw-mail").mailBiz;
var taskBiz = require("uw-task").taskBiz;
var c_game = uwData.c_game;
var c_prop = uwData.c_prop;
var c_reward = uwData.c_reward;
var taskDao = null;
var sevenDaysTargetDao = null;
var getMsg = require("uw-utils").msgFunc(__filename);
var c_msgCode = uwData.c_msgCode;
var ossObj = require("uw-log").ossObj;
var ossBiz = require("uw-log").ossBiz;


var userDao = null;
var userBiz = null;

var activityDao = null;
// 天数：1    小队等级    SSS：暗之巨龙、SSR:小黄鸡    小队等级    皇家猫粮
// 天数：2    竞技排名    SSR称号：Gladiator 角斗士 竞技场排名   结晶袋
// 天数：3    宠物战力    SSR称号：Kawaii 卡哇伊    宠物战力    史莱姆糖果
// 天数：4    宝石等级    SSR称号：Galaxy 星辰大海   宝石等级    神秘宝石袋
// 天数：5    成就点数    SSR称号：God-like 大神   成就点 充电宝
// 天数：6    精灵等级    SSR称号：Athena 雅典娜    精灵战力    精灵之泪
// 天数：7    小队战力    SSR称号：Champion 最强王者 小队战力    声望之羽
var sevenDaysTargetTask = c_game.sevenDayTask;
var sevenDaysTargetRankType = {
    0: c_prop.rankTypeKey.gemRank,
    1: c_prop.rankTypeKey.realmRank,
    2: c_prop.rankTypeKey.wingRank,
    3: c_prop.rankTypeKey.rebirthlvlRank,//c_prop.rankTypeKey.arenaRank,//c_prop.rankTypeKey.paTaRank
    4: c_prop.rankTypeKey.talismanCombatRank,
    5: c_prop.rankTypeKey.partnerCombatRank,//c_prop.rankTypeKey.heroNumRank,
    6: c_prop.rankTypeKey.holyCombatRank//c_prop.rankTypeKey.combatRank, 
};

var checkRequire = function() {
    userDao = userDao || require("uw-user").userDao;
    userBiz = userBiz || require("uw-user").userBiz;
    activityDao = activityDao || require("uw-activity").activityDao;
    taskDao = taskDao || require("uw-task").taskDao;
    sevenDaysTargetDao = sevenDaysTargetDao || require("../dao/sevenDaysTargetDao");
};
/**
 * 定时发送七日目标奖励
 * @param client
 * @param cb
 */
exports.sendRankAward = function(client, dayPara, cb) {
    //todo
    checkRequire();
    async.parallel([
        function(cb1) {
            activityDao.select(client, { type: c_prop.activityTypeKey.sevenDaysTarget, isOpen: 1 }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var day = -1;
        if(!dayPara){ 
            var activityData = data[0];
            if (!activityData) {
                return cb(getMsg(c_msgCode.actClose));//活动未开启
            }

            day = _getCurDay(activityData);   
        }else{
            day = dayPara;
        }
        console.error('---------------------------sendRankAward---------------------------','第'+day+'天');
        if (day < 1 || day > 7) { //第五天活动未开放，开放是需改
            return cb(getMsg(c_msgCode.dateError));//日期有误
        }
        // if(day == 6){//第7天 不发第6天的排行奖励
        //     return cbxx("第六天晚上不发奖励");
        // }
        var rankType = sevenDaysTargetRankType[day - 1];

        var top = 20;
        sevenDaysTargetDao.getRankListTopBak(client, rankType, top, function(err, rankList) {
            if (err) return cb(err);
            var max = 1000; //
            var groupList = [];
            var tempCount = 0;
            var tempList = [];
            //得到七日目标历史数据
            var rankArr = [];
            //console.error('---------------------------rankList---------------------------',rankList);
            for (var i = 0; i < rankList.length; i++) {
                var loc = {};
                loc.userId = rankList[i].userId;
                loc.userName = rankList[i].userName;
                loc.iconId = rankList[i].iconId;
                loc.userLvl = rankList[i].userLvl;
                loc.pkWinCount = rankList[i].pkWinCount;
                loc.combat = rankList[i].combat;
                loc.rankType = rankList[i].rankType;
                loc.rankValue = rankList[i].rankValue;
                rankArr.push(loc);
            }
            sevenDaysTargetDao.insertList(client, rankArr, function() {});
            var rankCfg = {
                0: [0, 0],
                1: [1, 1],
                2: [2, 2],
                3: [3, 9], //4-10名
                4: [10, 19], //11-20名
            };
            var reString = c_game.sevenDayRank[day - 1];
            // if(day == 7) reString = c_game.sevenDayRank[day - 2];
            if (!reString) cb(getMsg(c_msgCode.rewardConfigError));//七日排行奖励配置有错
            var strs = reString.split(",");
            for (var i = 0; i < rankList.length && i < top; i++) {
                var locRankData = rankList[i];
                var items = {};
                //var locPKLvl = userUtils.getPKLvl({pkWinCount:locRankData.pkWinCount});
                //var pkLvlData = c_pkLvl[locPKLvl];
                //items[c_prop.spItemIdKey.diamond] = pkLvlData.rewardPerDay; 

                //获取排名对应的奖励 ID
                var rewardId = 0;
                var rewardOrderArr = Object.keys(rankCfg);
                for (var j = 0; j < rewardOrderArr.length; j++) {
                    var order = rewardOrderArr[j];
                    if (i >= rankCfg[order][0] && i <= rankCfg[order][1]) {
                        rewardId = strs[order];
                        break;
                    }
                }
                var c_rewardData = c_reward[rewardId];
                items = c_rewardData.rewardItems;
                var mailEntity = mailBiz.createEntityByType(locRankData.userId, c_prop.mailTypeKey.temp7day, [0, i + 1], items);
                mailEntity.addTime = new Date();
                tempList.push(mailEntity);
                if (tempCount >= max) {
                    tempCount = 0;
                    groupList.push(tempList.concat([]));
                    tempList.length = 0;
                }
                tempCount++;
                //dadian记录开服活动排名奖励
                //需要取注册时间， 发奖励时的充值总额
                oObj = new ossObj.ossOpenServerRank(locRankData.userId, locRankData.userLvl, 0, 0, locRankData.rankValue*1, rewardId*1, day, JSON.stringify(c_rewardData.rewardItems));
                ossBiz.WriteOss(oObj);
            }
            if (tempList.length > 0) {
                groupList.push(tempList.concat([]));
            }

            async.map(groupList, function(group, cb1) {
                mailBiz.addMailByList(client, group, cb1);
            }, cb);
        });
    });
};

//复制竞技场表数据
exports.sqlTargetBak = function(client, dayPara, cb) {
    checkRequire();
    activityDao.select(client, { type: c_prop.activityTypeKey.sevenDaysTarget, isOpen: 1 }, function(err, activityData) {
        var day = -1;
        if(dayPara){
            day = dayPara;
        }else{
           day =  _getCurDay(activityData);
        }
        console.error('sevenDaysTarget sqlTargetBak day-->',day);
        if (day < 1 || day > 7) {
            cb(getMsg(c_msgCode.dateError));//日期有误
        } else {
            sevenDaysTargetDao.sqlTargetBak(client, day, cb);
        }
    });
};


/**
 * 得到七日目标信息
 * @param client
 * @param cb
 */
exports.getInfo = function(client, userId, cb) {
    checkRequire();
    //得到五日目标信息
    async.parallel([
        function(cb1) {
            activityDao.select(client, { type: c_prop.activityTypeKey.sevenDaysTarget, isOpen: 1 }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var day = -1;
        var activityData = data[0];

        day = _getCurDay(activityData);

        if (day < 0) {
            return cb(getMsg(c_msgCode.dateError));//日期有误
        }
        // console.log('-----七日的-getInfo-----',day,sevenDaysTargetRankType[day]);
        async.parallel([
            function(cb1) {
                //得到战斗力数据
                // rankBiz.getRankListTop(client, rankType, 3, cb1);
                //console.error('实时数据',day,sevenDaysTargetRankType[day]);
                sevenDaysTargetDao.getRankListTop(client, sevenDaysTargetRankType[day], 20, cb1);
            },
            function(cb1) {
                //得到五日目标排行榜数据
                //console.log('得到五日目标排行榜数据');
                sevenDaysTargetDao.list(client, "", [], cb1);
            }
        ], function(err, data) {
            if (err) return cb(err);
            var relRankData = data[0]; //实时数据
            var rankData = data[1];

            var reData = {};
            reData.day = day;

            reData.items = [];
            var value = 0;
            for (var i = 0; i <= day && i <=6; i++) {
                var locData = _genDailyData(i, rankData, value, activityData);
                locData.value = value;
                if (i == day) {//当天的  取实时数据
                    //console.error(relRankData);
                    locData.rank = relRankData;
                }
                // if(day ==6 && i==5){//第六七天一个榜  所以第七天排行数据取实时
                //     locData.rank = relRankData;
                // }
                reData.items.push(locData);
            }
            cb(null, reData);
        });
    });
};

/**
 * 得到每一天的数据
 * @param usrData
 * @param day
 * @param rankData
 */
var _genDailyData = function(day, rankData, value, activityData) {
    //玩家活动数据
    var locData = {};
    locData.value = 0;


    locData.rank = [];
    if (rankData) {
        for (var i = 0; i < rankData.length; i++) {
            if (rankData[i].rankType == sevenDaysTargetRankType[day]) {
                locData.rank.push(rankData[i])
            }
        }
    }
    return locData;
}


/**
 * 获得当前活动到第几天
 * @param activityData
 * @return day
 */
exports.getCurDay = function(activityData) {
    return _getCurDay(activityData);
}
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