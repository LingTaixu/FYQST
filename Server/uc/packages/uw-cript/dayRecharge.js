/**
 * Created by John on 2016/5/6.
 */
var userDao = require("uw-user").userDao;;
var uwData = require("uw-data");
var c_prop = uwData.c_prop;
var async = require("async");
var exports = module.exports;
var scriptUtils = require("./scriptUtils");
var activityDao = require("uw-activity").activityDao;
var rechargeDao = require("uw-recharge").rechargeDao;
var mailBiz = require("uw-mail").mailBiz;
var check = function(serverData,sClient,cb) {
    var strWhere = " isOpen = 1 and type = ? and ( startTime is null or (startTime <? and endTime>?)) order by sort desc";
    var now = new Date();
    var args = [c_prop.activityTypeKey.dayRecharge, now, now.clone().addHours(-2)];
    var groupList = [];
    var tempCount = 0;
    var tempList = [];
    var max = 1000;//
    activityDao.list(sClient, strWhere, args, function (err, activityList) {
        if (err) return cb(err);
        if (!activityList) return cb(null);
        async.map(activityList, function (activityData, cb1) {

            /*var startTime = activityData.startTime;
            var endTime = activityData.endTime;
            var period = 1;

            var diffDays = startTime.clone().clearTime().getDaysBetween(now.clone().clearTime());
            var sTime = startTime.clone().addDays(diffDays);
            if (sTime.isAfter(now)) {
                sTime.addDays(-period);
                diffDays -= period;
            }
            if (diffDays <= 0) {
                return cb(null);
            }
            diffDays -= period; //往前放一天
            sTime = startTime.clone().addDays(diffDays); //计算结算时间
            var eTime = sTime.clone().addDays(period);
            if (eTime.isAfter(endTime)) {
                eTime = endTime;
            }*/
            var sTime = new Date("2016-05-05 15:00:00");
            var eTime = new Date("2016-05-06 15:00:00");
            rechargeDao.getPeriodCountList(sClient, sTime, eTime, function (err, todayRechargeList) {
                if (err) return cb1(err);
                async.mapLimit(todayRechargeList, 50, function (todayRechargeData, cb2) {
                    userDao.select(sClient, {id:todayRechargeData.userId}, function(err, userData){
                        if(err) return cb1(err);
                        var exValues = activityData.exValues;
                        var items = activityData.items;
                        for (var i = 0; i < exValues.length; i++) {
                            var rmb = exValues[i];
                            if (todayRechargeData.todayRecharge >= rmb) {
                                var mailEntity = mailBiz.createEntityByType(todayRechargeData.userId, c_prop.mailTypeKey.dayRecharge, [rmb], items[i]);
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
                       cb2(null, 1);

                    });
                },function(err, data){
                    if (err)  return cb1(err);
                    cb1(null);
                });
            }, function (err, data) {

            });
        },function(err, data){
            if (err)  return cb(err);
            if (tempList.length > 0) {
                groupList.push(tempList.concat([]));
            }
            if (groupList.length > 0) {
                async.map(groupList, function (group, cb2) {
                    mailBiz.addMailByList(sClient, group, cb2);
                }, function(err,up){
                    if(err){
                        console.log(err);
                    }
                    return cb(null, data.length);
                })
            } else {
                return cb(null, data.length);
            }
        });
    });
}

scriptUtils.runAllServers(check);