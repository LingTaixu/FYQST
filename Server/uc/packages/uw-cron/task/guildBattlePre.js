/**
 * Created by Administrator on 2015/3/10.
 */
var uwData = require("uw-data");
var guildBiz = require("uw-guild").guildBiz;
var c_prop = uwData.c_prop;
var g_server = require("uw-global").g_server;
var logger = require("uw-log").getLogger("uw-logger", __filename);

var exports = module.exports;

exports.run = function(minutes) {
    if (g_server.betweenOpenDateDays() == 2){   // 开服第3天
        guildBiz.preGuildBattleMsg(minutes);
    }else if(new Date().getDay() == 0 && g_server.betweenOpenDateDays() > 2){      // 星期天
        guildBiz.preGuildBattleMsg(minutes);
    }
};


exports.runOnce = function() {

};