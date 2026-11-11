var CronJob = require('cron').CronJob;
var uwData = require("uw-data");
var c_open = uwData.c_open;
var c_game = uwData.c_game;
var project = require("uw-config").project;
var g_boss = require("uw-global").g_boss;
var g_guild = require("uw-global").g_guild;
var fs = require("fs");
var path = require('path');
var bossUtils = null;
var checkRequire = function() {
    bossUtils = bossUtils || require("uw-boss").bossUtils;
};

//主定时器
exports.runJobs = function() {
    checkRequire();
    ////分钟 小时 天 月 星期 年
    var minute1 = _getRandomNumber(20, 59);
    var job = new CronJob(minute1 + " 5 * * *", function() {
        require("./task/deleteExpireRecord.js").run();
        require("./task/deleteExpireMail.js").run();
    });
    job.start();

    ////分钟 小时 天 月 星期 年
    // var coffersAwardMinute = _getRandomNumber(20,59);
    // var job = new CronJob(coffersAwardMinute+" 0 * * *", function() {
    //     require("./task/coffersAward.js").run();
    // });
    // job.start();

    var chairmanImpeachMinute = _getRandomNumber(0, 59);
    var job = new CronJob(chairmanImpeachMinute + " 1 * * *", function() {
        require("./task/chairmanImpeach.js").run();
    });
    job.start(); 

    // 12点，再执行一次
    var chairmanImpeachMinute2 = _getRandomNumber(0, 59);
    var job = new CronJob(chairmanImpeachMinute2 + " 12 * * *", function() {
        require("./task/chairmanImpeach.js").run();
    });
    job.start(); 

    // for test
    // var job = new CronJob("* * * * *", function() {
    //     require("./task/chairmanImpeach.js").run();
    // });
    // job.start();

    ////分钟 小时 天 月 星期 年
    // var job = new CronJob("0 2 * * *", function() {
    //     require("./task/coffersReset.js").run();
    // });
    // job.start();

    ////分钟 小时 天 月 星期 年
    var runMinute = _getRandomNumber(0, 14);
    var job = new CronJob(runMinute + " 0 * * *", function() {
        require("./task/pkOutBak.js").run();
    });
    job.start();

    var runSendPkOutAwardMinute = _getRandomNumber(20, 40);
    ////分钟 小时 天 月 星期 年
    var job = new CronJob(runSendPkOutAwardMinute + " 0 * * *", function() {
        require("./task/sendPkOutAward.js").run();
    });
    job.start();

    //定时备份竞技场表
    var runMinute = _getRandomNumber(0, 14);
    var job = new CronJob(runMinute + " 0 * * *", function() {
        require("./task/arenaBak.js").run();
    });
    job.start();

    //定时备份boss表
    var bossBakMinute = _getRandomNumber(0, 59);
    var job = new CronJob(bossBakMinute + " 2 * * *", function() {
        require("./task/bossBak.js").run();
    });
    job.start();

    // //定时备份五日目标说需要的表
    // var job = new CronJob("0 0 * * *", function() {
    //     require("./task/fiveDaysTargetBak.js").run();
    // });
    // job.start(); 

    // //定时备份新四日目标说需要的表
    // var job = new CronJob("0 0 * * *", function() {
    //     require("./task/newFourTargetBak.js").run();
    // });
    // job.start();


    ////分钟 小时 天 月 星期 年
    var runArenaAwardMinute = _getRandomNumber(30, 59);
    var job = new CronJob(runArenaAwardMinute + " 0 * * *", function() {
        require("./task/arenaAward.js").run();
    });
    job.start();

    //分钟 小时 天 月 星期 年
    // var runMinute = _getRandomNumber(5, 50);
    // var job = new CronJob(runMinute + " * * * *", function() {
    //     require("./task/rank.js").run();
    // });
    // job.start();

    var job = new CronJob("* * * * *", function() {
        require("./task/onlineReport.js").run();
    });
    job.start();

    // 获得最新开服时间
    var job = new CronJob("*/5 * * * *", function() {
        require("./task/serverDate.js").run();
    });
    job.start();

    var job = new CronJob("*/20 * * * *", function() {
        require("./task/loadHybrid.js").run();
    });
    job.start();

    //todo 临时注释掉

    // //分钟 小时 天 月 星期 年
    // var runMinute = _getRandomNumber(20,50);
    // //runMinute = 30; //for test
    // var job = new CronJob(runMinute + " 0 * * *", function() {
    //     require("./task/fiveDaysTarget.js").run();
    // });
    // job.start();

    // //分钟 小时 天 月 星期 年
    // var runMinute = _getRandomNumber(20,50);
    // runMinute = 3;
    // var job = new CronJob(runMinute + " 0 * * *", function() {
    //     require("./task/newFourTarget.js").run();
    // });
    // job.start();

    setInterval(function() {
        require("./task/sysMsgRefresh.js").run();
        // require("./task/guildWarSaveRecord.js").run();
        // require("./task/guildWarRecordSync.js").run();
    }, 5000);

    //分钟 小时 天 月 星期 年
    var job = new CronJob("*/30 * * * *", function() {
        require("./task/chatSysRefresh.js").run();
        //console.log(new Date());
    });
    job.start();

    //分钟 小时 天 月 星期 年
    // var runHour  = c_game.challengeCupCfg[7];
    // var job = new CronJob("0 " +runHour+ " * * *", function() {
    //     require("./task/challengCup.js").run();
    // });
    // job.start();
    /* var job = new CronJob("0 * * * *", function() {
         require("./task/sendDayRecharge.js").run();
     });
     job.start();*/

    //分钟 小时 天 月 星期 年
    runHour = 5;       // 每日凌晨5点 周卡
    //var job = new CronJob("0 * * * *", function() {   // 临时整点测试
    var job = new CronJob("0 " + runHour + " * * *", function() {
        require("./task/weekCardAward.js").run();
    });
    job.start();

    // var job = new CronJob("10 * * * *", function() {   // 临时整点测试
    var job = new CronJob("10 " + runHour + " * * *", function() {
        require("./task/monthCardAward.js").run();
    });
    job.start();

    //公会数据同步
    setInterval(function() {
        require("./task/guildSys.js").run();
        //require("./task/coffersSys.js").run();
        //require("./task/challengeCupSys.js").run();
        //require("./task/guildWarSync.js").run();
        //require("./task/redEnvelopeSys.js").run();
    }, 1000);

    //公会数据同步
    // setInterval(function(){
    //     require("./task/guildWarStaticSync.js").run();
    // },3000);

    //擂台赛活动预告
    // setInterval(function(){
    //     //require("./task/guildWarSync.js").run();
    //     require("./task/challengeCupChat.js").run();
    // },20000);

    //服务器配置同步
    setInterval(function() {
       // require("./task/gameCfgSys.js").run();
        require("./task/clearServerDBCfg.js").run();
    }, 120 * 1000);//120
 
    setInterval(function() {
        require("./task/updateFakeData.js").run();
    }, 300 * 1000);//300秒

    //莱斯银行的风投业务 活动 每小时假人数=RANDOM（0,2）
    setInterval(function() {
        require("./task/updateFakeData.js").runHour();
    }, 60 * 60 * 1000);//1小时

    //定时备份七日目标需要的表
    var runMinute = _getRandomNumber(0, 20);
    var job = new CronJob(runMinute + " 0 * * *", function() {
        require("./task/sevenDaysTargetBak.js").run();
    });
    job.start();

    //定时发七日排行奖励并记录排行数据
    var runMinute = _getRandomNumber(23, 50);
    var job = new CronJob(runMinute + " 0 * * *", function() {
        require("./task/sevenDaysTarget.js").run();
    });
    job.start();

    //补发活动奖励
    var runMinute = _getRandomNumber(0, 50);
    var job = new CronJob(runMinute + " 0 * * *", function() {
        require("./task/reissueActivity.js").run();
    });
    job.start();

    setInterval(function() {
        require("./task/saveDB.js").run();
    }, 1 * 1000);//1秒

    //活动数据存入缓存
    setInterval(function() {
        require("./task/activityToCache.js").run();
    }, 60 * 1000);//60秒

    //七日活动测试用
    // setTimeout(function(){
    //     console.error('----------------------------------------备份七日目标需要的表----------------------------------------');
    //     require("./task/sevenDaysTargetBak.js").run();
    // },10*1000);

    // setTimeout(function(){
    //     console.error('----------------------------------------发七日排行奖励并记录排行数据----------------------------------------');
    //     require("./task/sevenDaysTarget.js").run();
    // },20*1000);

    // setTimeout(function(){
    //     console.error('----------------------------------------七日的竞技场数据备份 测试用----------------------------------------');
    //     require("./task/arenaBak.js").run();
    // },5*1000);

    //七日活动测试用 end
    _runWorldBoss();
    _runTeamBoss();

    _runGuildBattle();

    exports.runOnce();
};

/**
 * 运行一次
 */
exports.runOnce = function() {
    require("./task/rank.js").runOnce();
    require("./task/deleteExpireMail.js").runOnce();
    require("./task/activityToCache.js").runOnce(); 
};

/*******************************************************private*************************************************************/


var _runWorldBoss = function() {
    var worldBossIds = bossUtils.getWorldBossIds();
    for (var i = 0; i < worldBossIds.length; i++) {
        var locBossId = worldBossIds[i];
        var startTime = bossUtils.getWorldOpenStartTime(locBossId);
        __runWorldBoss(locBossId, startTime);
    }
};

var __runWorldBoss = function(bossId, startTime) {
    //预告1
    var pre1 = startTime.clone().addMinutes(-10);
    var job1 = new CronJob(pre1.getMinutes() + " " + pre1.getHours() + " * * *", function() {
        require("./task/worldBossPre.js").run(bossId, 10);
    });
    job1.start();

    //预告2
    var pre2 = startTime.clone().addMinutes(-5);
    var job2 = new CronJob(pre2.getMinutes() + " " + pre2.getHours() + " * * *", function() {
        require("./task/worldBossPre.js").run(bossId, 5);
    });
    job2.start();

    //开启
    var job3 = new CronJob(startTime.getMinutes() + " " + startTime.getHours() + " * * *", function() {
        require("./task/worldBossCheck.js").run(bossId);
    });
    job3.start();
};

var _runTeamBoss = function() {

    //公会数据同步
    setInterval(function() {
        var teamBossIds = bossUtils.getTeamBossIds();
        for (var i = 0; i < teamBossIds.length; i++) {
            var locBossId = teamBossIds[i];
            require("./task/teamBossCheck.js").run(locBossId);
        }
    }, 2000);
};

var __runTeamBoss = function() {
    // var job1 = new CronJob("* * * * *", function() {
    //     require("./task/teamBossCheck.js").run(bossId);
    // });
    // job1.start();
    var teamBossIds = bossUtils.getTeamBossIds();
    for (var i = 0; i < teamBossIds.length; i++) {
        var locBossId = teamBossIds[i];
        require("./task/teamBossCheck.js").run(locBossId);
    }
};

//输出指定范围内的随机数的随机整数
var _getRandomNumber = function(start, end) {
    var choice = end - start + 1;
    return Math.floor(Math.random() * choice + start);
};

var _runGuildBattle = function() {
    var startTime = g_guild.getGuildStartTime();
    if (startTime) {
        __runGuildBattle(startTime);
    }
};

var __runGuildBattle = function(startTime) {
    var pre1 = startTime.clone().addMinutes(-30);
    var job1 = new CronJob(pre1.getMinutes() + " " + pre1.getHours() + " * * *", function() {
        require("./task/guildBattlePre.js").run(30);
    });
    job1.start();

    //开启
    var job2 = new CronJob(startTime.getMinutes() + " " + startTime.getHours() + " * * *", function() {
        require("./task/guildBattlePre.js").run();
    });
    job2.start();
};
