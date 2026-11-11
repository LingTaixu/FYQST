var util = require("util");
var BaseDao = require("uw-db").BaseDao;
function Dao() {
    BaseDao.call(this);
    this.Entity = require('uw-entity').GameRecordEntity;
    this.castCols = {
        rechargeRecord : BaseDao.CAST_OBJECT,
        shopRecord : BaseDao.CAST_OBJECT,
        costGoldRecord : BaseDao.CAST_OBJECT,
        costDiamondRecord : BaseDao.CAST_OBJECT,
        costDiamondRecord1 : BaseDao.CAST_OBJECT,
        costDiamondRecord2 : BaseDao.CAST_OBJECT,
        getDiamondRecord : BaseDao.CAST_OBJECT,
        getDiamondRecord1 : BaseDao.CAST_OBJECT,
        getDiamondRecord2 : BaseDao.CAST_OBJECT
    };
    //++++++++++++++++++begin++++++++++++++++++++++
    this.getTodayCost = function(client, userId, cb){
        var strSql = " userId = ? and recordTime>=? and recordTime<?";
        var sTime = (new Date()).clearTime();
        var eTime = (new Date()).clearTime().addHours(24);
        this.selectCols(client," costDiamondRecord ",strSql,[userId,sTime,eTime],function(err,data){
            if(err) return cb(err);
            if(!data) return cb(null,0);
            var count = 0;
            var costDiamondRecord = data.costDiamondRecord||{};
            for(var key in costDiamondRecord){
                var locNum = costDiamondRecord[key]||0;
                count+=locNum;
            }
            //搞不清楚 costDiamondRecord1 costDiamondRecord2干什么的  临时全部统计出来  wupeng
            // var costDiamondRecord1 = data.costDiamondRecord1||{};
            // for(var key in costDiamondRecord1){
            //     var locNum = costDiamondRecord1[key]||0;
            //     count+=locNum;
            // }
            // var costDiamondRecord2 = data.costDiamondRecord2||{};
            // for(var key in costDiamondRecord2){
            //     var locNum = costDiamondRecord2[key]||0;
            //     count+=locNum;
            // }
            cb(null,count);
        });
    };

    this.getAllCost = function(client, userId, startTime, endTime,cb){
        if(!startTime||!endTime) return cb(null,0);
        var strSql = " userId = ? and recordTime>=? and recordTime<?";
        this.listCols(client," costDiamondRecord ", strSql,[userId,startTime, endTime],function(err,dataList){
            if(err) return cb(err);
            var count = 0;
            for(var i = 0;i<dataList.length;i++){
                var locData = dataList[i];
                var costDiamondRecord = locData.costDiamondRecord||{};
                for(var key in costDiamondRecord){
                    var locNum = costDiamondRecord[key]||0;
                    count+=locNum;
                }
            }
            cb(null,count);
        });
    };

    this.getAllCostDScore = function(client, userId, startTime, endTime,cb){
        if(!startTime||!endTime) return cb(null,0);
        var strSql = " userId = ? and recordTime>=? and recordTime<?";
        this.sum(client,"costDScoreNum", strSql,[userId,startTime, endTime],function(err,total){
            if(err) return cb(err);
            cb(null,total);
        });
    };

    this.getLoginDaysArr = function(client, userId, startTime, endTime,cb){
        var loginDaysArr = [];
        if(!startTime||!endTime) return cb(null,loginDaysArr);
        var strSql = " userId = ? and recordTime>=? and recordTime<? order by recordTime asc";
        //console.error('exec select from DB getLoginDaysArr ====>',strSql,userId,startTime, endTime);
        this.listCols(client," recordTime ", strSql,[userId,startTime, endTime],function(err,dataList){
            if(err) return cb(err);
            var count = 0;
            for(var i = 0;i<dataList.length;i++){
                var locData = dataList[i];
                var recordTime = locData.recordTime;
                var stamp = new Date(recordTime).clone().clearTime().getTime();
                loginDaysArr.push(stamp);
            }
            cb(null,loginDaysArr);
        });
    };
};

util.inherits(Dao, BaseDao);
module.exports = new Dao();