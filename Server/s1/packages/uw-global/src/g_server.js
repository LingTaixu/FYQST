/**
 * Created by Administrator on 2018/6/13.
 */
var loginClient = null;
var serverInfoBiz = null;
var project = require("uw-config").project;
var __serverDate;

exports.initServerDate = function(cb) {
    loginClient = loginClient || require("uw-db").loginClient;
    serverInfoBiz = serverInfoBiz || require("uw-server-info").serverInfoBiz;
    serverInfoBiz.getOpenServerDate(loginClient, project.serverId, function(err, serverDate) {
        // 是否为当前天数
        if (err) return cb(null);
        if (serverDate) {
            __serverDate = new Date(serverDate);
            console.error("init server date:", __serverDate);
        }
        return cb(null);
    });
};

exports.getOpenServerDate = function() {
    return __serverDate;
}

// 开服第几天 (当天是零天, 依次类推)
exports.betweenOpenDateDays = function() {
    if (!__serverDate) return 0;
    return __serverDate.clone().clearTime().getDaysBetween(new Date());
};

// 获取开服xx天以后的下一个周xx的0点
// 需要区分老服和新服，14天以后的下一个周一开始算作老服，只有在老服状态下才能看到自定义活动
exports.getAfterNumDaysNextWeekDay = function(afterDay = 14,targetWeekDay = 1) {
    if (!__serverDate) return 0;
    var retDay = __serverDate.clone().clearTime().addDays(afterDay - 1); //开服xx天后的零点
    var weekDay = retDay.getDay() == 0 ? 7 : retDay.getDay();//获取开服xx天后是周几
    if(weekDay < targetWeekDay){
        //根据XX天后是周几 如小于目标周几  则就是XX天后的周几加上跟目标周几差的几天
        //(比较绕 举例说明:开服日期是周2 需要获取开服14天后的下一个周5  则开服第14天是周1  下一个周5就是跟开服第14天同一周的周5)
        //    1   2   3   4   5   6   7 | 1   2   3   4   5   6   7 | 1   2   3   4   5   6   7 | 1   2   3   4   5   6   7 |
        //        ↑                                                   ↑               ↑
        //       开服                                               第14天           下个周5
        retDay = retDay.addDays(targetWeekDay - weekDay);
    }else{
        //否则 就是XX天后的周几加上跟目标周几差的几天(负数)再加7天                    
        //(比较绕 举例说明:开服日期是周3 需要获取开服14天后的下一个周1  则开服第14天是周2  下一个周1就得是开服第14天那一周的下一周周1)
        //    1   2   3   4   5   6   7 | 1   2   3   4   5   6   7 | 1   2   3   4   5   6   7 | 1   2   3   4   5   6   7 |
        //            ↑                                                   ↑                       ↑
        //           开服                                               第14天                   下个周1
        retDay = retDay.addDays(targetWeekDay - weekDay + 7);
    }
    return retDay;
};
//test
// exports.initServerDate(function(){
//     console.log("初始化开服时间缓存成功");
//     console.log(exports.getAfterNumDaysNextWeekDay());
// })
