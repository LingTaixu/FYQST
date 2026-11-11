var logger = require('uw-log').getLogger("uw-logger",__filename);
var util = require("util");
var BaseDao = require("uw-db").BaseDao;
var uwData = require("uw-data");
var c_recharge =  uwData.c_recharge;

function Dao(){
    BaseDao.call(this);
    this.Entity = require('uw-entity').RechargeEntity;
    this.getTodayCount = function(client, userId, cb){
        var strSql = "SELECT sum(payMoney) payMoney FROM uw_recharge WHERE userId = ? and rechargeTime>? and rechargeTime<?";
        var sTime = (new Date()).clearTime();
        var eTime = (new Date()).clearTime().addHours(24);
        client.query(strSql,[userId,sTime,eTime],function(err,data){
            if(err) return cb(err);
            var sum = data[0].payMoney||0;
            cb(err,sum) ;
        });
    };

    this.getAllCount = function(client, userId, startTime, endTime,cb){
        if(!startTime||!endTime) return cb(null,0);
        var strSql = "SELECT sum(payMoney) payMoney FROM uw_recharge WHERE userId = ? and rechargeTime>? and rechargeTime<?";
        client.query(strSql,[userId,startTime, endTime],function(err,data){
            if(err) return cb(err);
            var sum = data[0].payMoney||0;
            cb(err,sum) ;
        });
    };

    // 充值总数量,判断首冲奖励（元宝的商品，不包括月卡，成长基金等)
    this.getAllCount2 = function(client, userId, startTime, endTime,cb){
        if(!startTime||!endTime) return cb(null,0);
        var strSql = "SELECT sum(payMoney) payMoney FROM uw_recharge WHERE userId = ? and rechargeTime>? and rechargeTime<? and rechargeId < 21";
        client.query(strSql,[userId,startTime, endTime],function(err,data){
            if(err) return cb(err);
            var sum = data[0].payMoney||0;
            cb(err,sum) ;
        });
    };

    this.getRechargeDays = function(client, userId, startTime, endTime, payMoney,cb) {
        if (!startTime || !endTime) return cb(null, 0);
        var strSql = "SELECT COUNT(* ) days FROM (SELECT DATEDIFF(rechargeTime,?) days, SUM(payMoney) payMoneys FROM uw_recharge WHERE userId = ? and rechargeTime>? AND rechargeTime<?  GROUP BY days) a WHERE payMoneys >= ?";
        client.query(strSql, [startTime, userId, startTime, endTime, payMoney], function (err, data) {
            if (err) return cb(err);
            var days = data[0].days || 0;
            cb(null, days);
        });
    };
    //----------------------------------------------------------------累计充值活动 wupeng----------------------------------------------------------------
    this.getRechargeDaysWorthDiamond = function(client, userId, startTime, endTime, worthDiamond,cb) {
        if (!startTime || !endTime) return cb(null, 0);
        var strSql = "SELECT rechargeId,rechargeTime,DATE_FORMAT(rechargeTime,'%Y-%m-%d') day FROM uw_recharge WHERE userId = ? and rechargeTime>? AND rechargeTime<? ";
        client.query(strSql, [userId, startTime, endTime], function (err, data) {
            if (err) return cb(err);
            var arrDayList = {};
            var days = 0;
            // console.log('asdfsdfasd',data);
            for(var i=0,len = data.length; i<len; i++){
                var row = data[i];
                // console.log('查询的玩家充值数据---------------------------getTodayRechargeDiamondCount-------------',row);
                if(c_recharge[row.rechargeId] && c_recharge[row.rechargeId].worthDiamond ){
                    // console.log('c_recharge[row.rechargeId].worthDiamond',c_recharge[row.rechargeId].worthDiamond);
                    if(!arrDayList[row.day])arrDayList[row.day] = 0;
                    arrDayList[row.day] += (c_recharge[row.rechargeId].worthDiamond)*1;//算出每天累充了多少钻
                }
            }
             // console.log('查询的玩家充值数据---------------------------arrDayList-------------',arrDayList);
            for(var day in arrDayList){
                var v=arrDayList[day];
                if(v >= worthDiamond){
                    days++;
                }
            }
             // console.log('fdgdfgdfgdfsdfsdf',days);
            cb(null, days);
        });
    };
    this.getTodayRechargeDiamondCount = function(client, userId, cb){
        var strSql = "SELECT rechargeId,rechargeTime FROM uw_recharge WHERE userId = ? and rechargeTime>? AND rechargeTime<? ";
        var sTime = (new Date()).clearTime();
        var eTime = (new Date()).clearTime().addHours(24);
        client.query(strSql,[userId,sTime,eTime],function(err,data){
            if(err) return cb(err);
            var sum = 0;
            for(var i=0,len = data.length; i<len; i++){
                var row = data[i];
                
                if(c_recharge[row.rechargeId] && c_recharge[row.rechargeId].worthDiamond ){
                    sum +=  (c_recharge[row.rechargeId].worthDiamond)*1;//算出每天累充了多少钻
                }
            }
            // console.log('csdasdasdasdasdasdsada',sum);
            cb(err,sum) ;
        });
    };
    //----------------------------------------------------------------累计充值活动 end ----------------------------------------------------------------
    this.getPeriodCount = function(client, userId, sTime, eTime, cb){
        var strSql = "SELECT sum(payMoney) payMoney FROM uw_recharge WHERE userId = ? and rechargeTime>? and rechargeTime<?";
        client.query(strSql,[userId,sTime,eTime],function(err,data){
            if(err) return cb(err);
            var sum = data[0].payMoney||0;
            cb(err,sum) ;
        });
    };
    this.getPeriodCountList = function(client, sTime, eTime, cb){
        var strSql = "SELECT sum(payMoney) todayRecharge, userId FROM uw_recharge WHERE rechargeTime>? and rechargeTime<? group by userId ORDER BY todayRecharge DESC";
        client.query(strSql,[sTime,eTime],function(err,dataList){
            if(err) return cb(err);
            cb(null,dataList);
        });
    };
    this.getMaxRechargeMoney = function(client, userId, startTime, endTime, cb) {
        var strSql = "SELECT MAX(payMoney) maxPayMoney FROM uw_recharge WHERE userId = ? and rechargeTime>? and rechargeTime<?";
        client.query(strSql,[userId,startTime,endTime],function(err,data){
            if(err) return cb(err);
            var maxPayMoney = data[0].maxPayMoney || 0;
            cb(null,maxPayMoney);
        });
    };
    this.getValidEffUserIdList = function(client, rechargeId, nowTime, cb){
        var strSql = "SELECT distinct userId  FROM uw_recharge WHERE rechargeId = ? and effTime>?";
        //var strSql = "SELECT  userId, rechargeId, effTime  FROM uw_recharge WHERE rechargeId = ? and effTime>?";
        client.query(strSql,[rechargeId, nowTime],function(err,data){
            if(err) return cb(err); 
            cb(null,data);
        });
    };
    // 充值人数 
    this.getRechargeUserNum = function(client, startTime, endTime, cb){
        var strSql = "SELECT count(*) userNum from (select distinct userId from uw_recharge WHERE rechargeTime>? and rechargeTime<? ) a";
        client.query(strSql,[startTime,endTime],function(err,data){
            if(err) return cb(err);
            var userNum = data[0].userNum || 0;
            cb(null,userNum);
        });
    };
    // 购买打赏物品的次数
    this.getRechargeDaShangNum = function(client, startTime, endTime, cb){
        var strSql = "SELECT count(*) dsNum from uw_recharge WHERE rechargeTime>? and rechargeTime<?  and rechargeId > 40 and rechargeId < 61 ";
        client.query(strSql,[startTime,endTime],function(err,data){
            if(err) return cb(err);
            var dsNum = data[0].dsNum || 0;
            cb(null,dsNum);
        });
    };
}
util.inherits(Dao,BaseDao);
module.exports = new Dao();