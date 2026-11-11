/**
 * Created by John on 2016/4/27.
 */
var userDao = require("uw-user").userDao;
var activityDao = require("uw-activity").activityDao;
var gameRecordDao= require("uw-game-record").gameRecordDao;
var uwData = require("uw-data");
var c_prop = uwData.c_prop;
var async = require("async");
var exports = module.exports;
var scriptUtils = require("./scriptUtils");
var check = function(serverData,sClient,cb) {
    async.parallel([
        function(cb1){
            activityDao.select(sClient, "isOpen = 1 and type = ? and ( startTime is null or (endTime>?)) order by sort desc", [c_prop.activityTypeKey.rebate, "2016-4-28"], cb1);
        },
        function(cb1){
            gameRecordDao.listCols(sClient, "userId, costDiamondRecord, recordTime", "recordTime >= ? and recordTime < ?",["2016-04-27", "2016-04-28"], cb1);
        }
    ], function(err, data) {
        if(err) return cb(err);
        var activityData = data[0];
        var gameRecordList = data[1];
        if(!activityData) return cb(null, 0);
        var activityId = activityData.id;
        async.map(gameRecordList,function(gameRecordData,cb1) {
            var costDiamondRecord = gameRecordData.costDiamondRecord;
            var costDiamond = costDiamondRecord[c_prop.diamondCostTypeKey.fourRole] || 0;
            costDiamond += costDiamondRecord[c_prop.diamondCostTypeKey.paTaAward] || 0;
            cb1(null, [costDiamond,gameRecordData.userId]);
        }, function(err, dataList){
            if(err) return cb(err);
            var userList = [];
            for(var i = 0; i < dataList.length; i++){
                if(dataList[i][0]){
                    userList.push(dataList[i]);
                }
            }
            async.mapLimit(userList,50,function(userIddata, cb1){
                var costDiamond = userIddata[0];
                var userId = userIddata[1];
                userDao.selectCols(sClient, "id, activity",{id:userId},function(err, userData){
                    if(err) return cb1(err);
                    var activity = userData.activity || {};
                    var userActivity = activity[activityData.id] || [];
                    var allCost = userActivity[0] || 0;
                    allCost += costDiamond;
                    userActivity[0] = allCost;
                    activity[activityData.id] = userActivity;
                    userData.activity = activity;
                    var updateUser = {
                        activity: userData.activity
                    }
                    userDao.update(sClient, updateUser,{id:userId}, cb1);
                })
            },function(err, up){
                if(err) return cb(err);
                cb(null, userList.length);
            })
        });
    });
};


scriptUtils.runAllServers(check);