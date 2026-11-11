/**
 * Created by Administrator on 2015/4/16.
 */

var logger = require('uw-log').getLogger("uw-logger",__filename);
var async = require('async');
var RechargeRequestEntity = require("uw-entity").RechargeRequestEntity;
var mainClient = require("uw-db").mainClient;
var loginClient = require('uw-db').loginClient;
var project = require("uw-config").project;
var rechargeBiz = require("../biz/rechargeBiz");
var rechargeRequestDao = require("uw-recharge").rechargeRequestDao;
var sdkBiz = require("uw-sdk").sdkBiz;
var uwData = require("uw-data");
var c_recharge = uwData.c_recharge;
var c_payInfo = uwData.c_payInfo;
var g_cache = require("uw-global").g_cache;
var userDao = null;
var accountDao = null;
var limiBiz = null;
var checkRequire = function(){
    userDao = userDao || require("uw-user").userDao;
    accountDao = accountDao || require("uw-account").accountDao;
};


/**
 * 获取请求
 * @param client
 * @param userId
 * @param rechargeId
 * @param goodsId
 * @param cb
 */
exports.getRequest = function(client,userId,rechargeId,goodsId,cb){
    checkRequire();
    //userDao.select(client, {id:userId},function(err,userData){
    g_cache.getGamePlayer(client, userId, function(err,gamePlayer){
        if(err) return cb(err);
        rechargeBiz.canRecharge(client, userId, rechargeId, gamePlayer.getChannelId(), function(err1,data1){
            if(err1) return cb(err1);
            //accountDao.select(loginClient,{id:userData.accountId},function(err,accountData){
            // if(err) return cb(err);

            var userData = gamePlayer.userData;
            var entity = new RechargeRequestEntity();
            /** 账号id **/
            entity.accountId = userData.accountId;/*账号id*/
            /** 用户id **/
            entity.userId = userData.id;/*用户id*/
            /** 服务器id **/
            entity.serverId = project.serverId;/*服务器id*/
            /** 充值项id **/
            entity.rechargeId = rechargeId;/*充值项id*/
            /** 状态 **/
            entity.status = 0;/*状态 0:请求 1:支付成功 2:领取钻石*/
            /** 添加时间 **/
            entity.addTime = new Date();/*添加时间*/
            /** 渠道物品id **/
            entity.goodsId = goodsId;/*渠道物品id*/
            entity.lvl = userData.lvl;
            entity.channelId = gamePlayer.getChannelId();
            entity.sdkChannelId = gamePlayer.getSdkChannelId();
            
            var c_payData = c_payInfo[rechargeId];
            var price = c_payData[gamePlayer.getChannelId()][1];
           // var rechargeTemp = c_recharge[rechargeId];
            entity.goodsPrice = price;
            
            entity.gmStatus = 0;
            rechargeRequestDao.insert(mainClient,entity,function(err,data){
                if(err) return cb(err);
                //[rechargeId,openId,orderId,lvl]
                var orderNo = _getOrderId(data.insertId);
                rechargeRequestDao.update(mainClient,{"orderNo":orderNo},{id:data.insertId},function(err,data){
                    if(err) return cb(err);
                    var tempData = [rechargeId,gamePlayer.accountData.name,orderNo,userData.lvl,userData.id,userData.nickName,goodsId,gamePlayer.accountData.sdkData, gamePlayer.accountData.channelId];
                    var payData = sdkBiz.getPayData(gamePlayer.accountData.channelId,tempData);
                    cb(null,[data.insertId,project.serverId,payData]);
                });
            });
            //});
        });
    });
};


/**
 * 获取请求
 * @param client
 * @param accountId
 * @param userId
 * @param cb
 */
exports.handleRequest = function(client,accountId, userId,cb){
    checkRequire();
    async.series([
        function(cb1){
            _handleStatus1(client,accountId, userId,cb1);
        },
        function(cb1){
            rechargeRequestDao.select(mainClient," accountId = ? and userId = ? and status < 2 and addTime> ? ",[accountId , userId, (new Date()).addDays(-1)],cb1);
        }
    ],function(err,data){
        if(err) return cb(err);
        //handleReData ,[userUpdate,addDiamond,rechargeId]
        var handleReData = data[0],notHandleData = data[1];
        var userUpdate = handleReData[0],addDiamond = handleReData[1],rechargeId = handleReData[2];
        var isFinish = 1;
        if(notHandleData) isFinish = 0;//未处理完 
        cb(null,[userUpdate,addDiamond,isFinish,rechargeId]);
    });
};

//处理状态为1的请求
var _handleStatus1 = function(client,accountId ,userId,cb){
    rechargeRequestDao.select(mainClient," accountId = ? and  userId = ? and status = 1 ",[accountId,userId],function(err,rechargeRequestData){
        if(err) return cb(err);
        if(!rechargeRequestData) return cb(null,[{},0,0]);
        rechargeBiz.rechargeNotValid(client, userId, rechargeRequestData.rechargeId, rechargeRequestData.channelId, rechargeRequestData.orderId, rechargeRequestData.gmStatus == 1, function(err,reData){
            if(err) return cb(err);
            rechargeRequestDao.update(mainClient,{status:2},{id:rechargeRequestData.id},function(err,data){
                if(err) return cb(err);
                var userUpdate = reData[0],addDiamond = reData[1];
                //[userUpdate,addDiamond] 
                cb(null,[userUpdate,addDiamond,rechargeRequestData.rechargeId]);
            })
        });
    });
};

exports.checkPayResult = function(client, accountId, userId, orderNo, payData, cb){
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err,gamePlayer){
        if(err) return cb(err); 
        var accountData = gamePlayer.accountData;
        if(accountData.channelId != 10011) return cb("only for limi");

        limiBiz = limiBiz || require("uw-sdk").limiBiz;
        var orderData = {
            game_orderno: orderNo,
            payData : payData
        };

        orderData.payData.userId = userId;
        orderData.payData.accountId = accountId;
        if (!orderData.payData.openId)
            orderData.payData.openId = accountData.sdkData.openId;
        if (!orderData.payData.openKey)
            orderData.payData.openKey = accountData.sdkData.openKey;

        limiBiz.checkPay(orderData, function(err, data){
            //console.error("checkPayResult 2:",err, data);
            cb(null);
        });

    });
};

// 设置充值成功
exports.setRechargeRequestStatus0ByAccountId = function(accountId, goodsId, cb){
    rechargeRequestDao.select(mainClient," accountId = ? and goodsId = ? and status = 0 order by id desc",[accountId,goodsId],function(err,rechargeRequestData){
        if(err) return cb(err);
        if(!rechargeRequestData) return cb(null);
        rechargeRequestDao.update(mainClient,{status:1},{id:rechargeRequestData.id},function(err1,data){
            if(err1) return cb(err1);
            return cb(null);
        });
    });
};

// 设置充值成功
exports.setRechargeRequestStatus0ByUserId = function(accountId, userId, goodsId, cb){
    rechargeRequestDao.select(mainClient," accountId = ? and userId = ? and goodsId = ? and status = 0 order by id desc",[accountId,userId,goodsId],function(err,rechargeRequestData){
        if(err) return cb(err);
        if(!rechargeRequestData) return cb(null);
        rechargeRequestDao.update(mainClient,{status:1},{id:rechargeRequestData.id},function(err1,data){
            if(err1) return cb(err1);
            return cb(null);
        });
    });
};

var _getOrderId = function(id){
    return "ID" + id + "T" + Date.now();
};
