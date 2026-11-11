/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Sara on 2015/11/12.
 */
var scriptUtils = require("./scriptUtils");

var rechargeRequestDao = require("uw-recharge").rechargeRequestDao;
var activityDao = require("uw-activity").activityDao;
var uwData = require("uw-data");
var c_recharge = uwData.c_recharge;
var c_prop = uwData.c_prop;
var mainClient = require("uw-db").mainClient;
var mailBiz = require("uw-mail").mailBiz;

var async = require("async");
var exports = module.exports;


var check = function (serverData, sClient, cb) {
    rechargeRequestDao.list(mainClient, "addTime>=? and addTime<=? and status = 2 and serverId = ?", [new Date("2016-04-29 08:00:00"), new Date("2016-04-29 10:00:00"), serverData.serverId], function (err, rechargeRequestList) {
        if (err) return cb(err);
        activityDao.select(sClient, " type = ? and startTime < ?", [c_prop.activityTypeKey.singleCharge, new Date("2016-04-29 00:00:00")], function (err, activityData0) {
            if (err) return cb(err);
            if(!activityData0)  return cb(null, 0);
            activityDao.select(sClient, " type = ? and startTime > ?", [c_prop.activityTypeKey.singleCharge, new Date("2016-04-29 08:00:00")], function (err, activityData1) {
                if (err) return cb(err);
                if (!activityData1) return cb(null, 0);
                var arr = activityData1.exValues;
                var items = activityData1.items;
                var tempCount = 0;
                var tempList = [];
                for (var i = 0; i < rechargeRequestList.length; i++) {
                    var locRechargeRequest = rechargeRequestList[i];
                    var rechargeTemp = c_recharge[locRechargeRequest.rechargeId];//获取到充值项数据
                    for (var j = 0; j < arr.length; j++) {
                        if (rechargeTemp.diamond >= arr[j]) {
                            //发送邮件
                            var mailEntity = mailBiz.createEntityByType(locRechargeRequest.userId, c_prop.mailTypeKey.temp5, [], items[j]);
                            mailEntity.addTime = new Date();
                            tempList.push(mailEntity);
                            tempCount++;
                        } else {
                            break;
                        }
                    }

                }
                mailBiz.addMailByList(sClient, tempList, function (err, data) {
                    if (err) return cb(err);
                    cb(null, rechargeRequestList.length);
                });
            });
        });
    });
};

scriptUtils.runAllServers(check);