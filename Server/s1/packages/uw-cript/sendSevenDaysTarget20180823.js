var async = require("async");
var exports = module.exports;
var scriptUtils = require("./scriptUtils");
var sevenDaysTargetBiz = require("uw-fiveDaysTarget").sevenDaysTargetBiz;
var arenaBiz = require("uw-arena").arenaBiz;
var activityDao = require("uw-activity").activityDao;

var uwData = require("uw-data");
var c_task = uwData.c_task;
var c_game = uwData.c_game;
var c_prop = uwData.c_prop;
var c_reward = uwData.c_reward;

var async = require("async");
var mailBiz = require("uw-mail").mailBiz;
var sevenDaysTargetDao = require("uw-fiveDaysTarget").sevenDaysTargetDao;
var getMsg = require("uw-utils").msgFunc(__filename);
var c_msgCode = uwData.c_msgCode;

/**
 * 获得当前活动到第几天
 * @param activityData
 * @return day
 */
var _getCurDay = function(activityData) {
    var today = new Date();
    if (!activityData || activityData.startTime.isAfter(today)) {
        return -1;
    }
    var startTemp = new Date();
    startTemp.setFullYear(activityData.startTime.getFullYear(), activityData.startTime.getMonth(), activityData.startTime.getDate());
    startTemp.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    var diff = today - startTemp;
    return Math.floor((diff) / 1000 / 60 / 60 / 24);
}

var run = function(serverData, sClient, cb) {
    activityDao.select(sClient, { type: c_prop.activityTypeKey.sevenDaysTarget, isOpen: 1 }, function(err, activityData) {
        var real_day = _getCurDay(activityData);
        if (real_day < 6 || real_day > 15) {
            console.log(serverData.serverId + '服处于新服竞赛第' + (real_day + 1) + '天 不处理');
            cb(null, 0);
        } else {
            day = real_day > 7 ? 7 : real_day;
            __sendRankAward(sClient, day, function(err) {
                if (err) return logger.error(err);
                if (day > 6) {
                    __sendRankAward(sClient, 6, function(err) {
                        if (err) return logger.error(err);
                        console.log(serverData.serverId + '服开服时间:' + new Date(serverData.serverDate).toString() + ',处于新服竞赛第' + (real_day + 1) + '天，补发第' + day + '天排行奖励执行完毕');
                        console.log(serverData.serverId + '服开服时间:' + new Date(serverData.serverDate).toString() + ',处于新服竞赛第' + (real_day + 1) + '天，补发第' + 6 + '天排行奖励执行完毕');
                        cb(null, 1);
                    });
                } else {
                    console.log(serverData.serverId + '服开服时间:' + new Date(serverData.serverDate).toString() + ',处于新服竞赛第' + (real_day + 1) + '天，补发第' + day + '天排行奖励执行完毕');
                    cb(null, 1);
                }
            });

        }
    });
};

__sendRankAward = function(client, day, cb) {
    // 5: c_prop.rankTypeKey.partnerCombatRank,//c_prop.rankTypeKey.heroNumRank,
    // 6: c_prop.rankTypeKey.holyCombatRank//c_prop.rankTypeKey.combatRank, 
    var rankType = null;
    if (day == 6) {
        rankType = c_prop.rankTypeKey.partnerCombatRank;
    } else if (day == 7) {
        rankType = c_prop.rankTypeKey.holyCombatRank;
    }
    if (!rankType) return cb('没取到排行类型');

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
        var rankCfg = {
            0: [0, 0],
            1: [1, 1],
            2: [2, 2],
            3: [3, 9], //4-10名
            4: [10, 19], //11-20名
        };
        var reString = c_game.sevenDayRank[day - 1];
        if (!reString) cb(getMsg(c_msgCode.rewardConfigError)); //七日排行奖励配置有错
        var strs = reString.split(",");
        for (var i = 0; i < rankList.length && i < top; i++) {
            var locRankData = rankList[i];
            var items = {};

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
        }
        if (tempList.length > 0) {
            groupList.push(tempList.concat([]));
        }

        async.map(groupList, function(group, cb1) {
            mailBiz.addMailByList(client, group, cb1);
        }, cb);
    });
};
scriptUtils.runAllServers(run);


// ALTER TABLE uw_hero_bak CHANGE holyCombat AAA int(11);
// ALTER TABLE uw_hero_bak CHANGE partnerCombat holyCombat int(11) DEFAULT '0' COMMENT '深渊装备战力';
// ALTER TABLE uw_hero_bak CHANGE AAA partnerCombat int(11) DEFAULT '0' COMMENT '伙伴战力';

// scriptUtils.runByServerIds([1], run);