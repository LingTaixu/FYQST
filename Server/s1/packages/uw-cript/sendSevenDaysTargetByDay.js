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

 

var run = function(serverData, sClient, cb) {
    activityDao.select(sClient, { type: c_prop.activityTypeKey.sevenDaysTarget, isOpen: 1 }, function(err, activityData) {
        var real_day = sevenDaysTargetBiz.getCurDay(activityData);
        if (real_day == 4) {
            console.log(serverData.serverId + '服处于新服竞赛第' + (real_day + 1) + '天 发送第'+real_day+'天排行奖励');
            sevenDaysTargetBiz.sqlTargetBak(sClient, null, function(err){
                if(err) return console.log(err);
                console.log(serverData.serverId + '服备份新服竞赛所需备份表完成');
                sevenDaysTargetBiz.sendRankAward(sClient, null, function(err){
                    if(err) return console.log(err);
                    console.log(serverData.serverId + '服新服竞赛奖励发送成功');
                    cb(null, 1);
                });
            })
        }else{
            console.log(serverData.serverId + '服处于新服竞赛第' + (real_day + 1) + '天 不处理');
            cb(null, 0);
        }
    });
};

scriptUtils.runAllServers(run);

// scriptUtils.runByServerIds([1], run);