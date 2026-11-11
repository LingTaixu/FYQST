/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Sara on 2015/11/12.
 */

var serverInfoDao =  require("uw-server-info").serverInfoDao;
var serverInfoBiz =  require("uw-server-info").serverInfoBiz;
var rechargeRequestDao =  require("uw-recharge").rechargeRequestDao;
var activityDao = require("uw-activity").activityDao;
var uwData = require("uw-data");
var c_recharge =  uwData.c_recharge;
var c_prop =  uwData.c_prop;
var mainClient =  require("uw-db").mainClient;
var loginClient =  require("uw-db").loginClient;
var mailBiz = require("uw-mail").mailBiz;

var async = require("async");
var exports = module.exports;

exports.check = function(cb){
    serverInfoDao.list(loginClient,{},function(err,serverList){
        if(err) return cb(err);
        var allRecord = 0;
        async.mapLimit(serverList,1,function(serverData,cb1){
            serverCheck(serverData,function(err,num){
                if(err) {
                    cb1(err);
                }else{
                    console.log("服务器【%s】成功执行，共（%s）条",serverData.serverId,num);
                    allRecord+=num;
                    cb1(null);
                }
            });
        },function(err,data){
            if(err) return cb(err);
            cb(null,allRecord);
        });
    });
    //获取服务器列表
    //获取时间段充值;
    //判断是否
    //12:00-14:30
};

var serverCheck = function(serverData,cb){
    serverInfoBiz.getServerClient(serverData.serverId, function (err, sClient) {
        if(err) return cb(err);
        rechargeRequestDao.list(mainClient,"addTime>=? and addTime<=? and status = 2 and serverId = ?",[new Date("2016-02-06 12:00:00"),new Date("2016-02-06 14:30:00"),serverData.serverId],function(err,rechargeRequestList){
            if(err) return cb(err);
            activityDao.select(sClient, {type: c_prop.activityTypeKey.singleCharge, isOpen: 1}, function(err,activityData){
                if(err) return cb(err);
                if(!activityData) return cb(null,0);
                var arr = activityData.exValues;
                var items = activityData.items;
                var tempCount = 0;
                var tempList = [];
                for(var i = 0;i<rechargeRequestList.length;i++){
                    var locRechargeRequest = rechargeRequestList[i];
                    var rechargeTemp = c_recharge[locRechargeRequest.rechargeId];//获取到充值项数据
                    for(var j = 0; j < arr.length; j++) {
                        if (rechargeTemp.diamond >= arr[j]) {
                            //发送邮件
                            var mailEntity = mailBiz.createEntityByType(locRechargeRequest.userId, c_prop.mailTypeKey.temp5, [], items[j]);
                            mailEntity.addTime = new Date();
                            tempList.push(mailEntity);
                            tempCount++;
                        }else {
                            break;
                        }
                    }

                }
                mailBiz.addMailByList(sClient,tempList,function(err,data){
                    if(err) return cb(err);
                    cb(null,rechargeRequestList.length);
                });
            });
        });
    });
};

exports.check(function(err,allRecord){
    if(err){
        console.error("执行错误:");
        console.error(err);
    }else{
        console.log("全部执行成功!一共（%s）条",allRecord);
    }
});
