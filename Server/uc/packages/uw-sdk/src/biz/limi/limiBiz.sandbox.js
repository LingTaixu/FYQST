/**
 *  爱微游11h5
 */

var util = require("util");
var BaseSDK = require("../BaseSDK.js");
var sdkUtils = require("../sdkUtils.js");
var project = require("uw-config").project;
var uwData = require("uw-data");
var c_recharge = uwData.c_recharge;
var commonUtils = require("uw-utils").commonUtils;
var httpUtils = require("uw-utils").httpUtils;
var logger = require('uw-log').getLogger("uw-logger", __filename);
var querystring = require('querystring');
var md5Utils = require("uw-utils").md5Utils;
var getMsg = require("uw-utils").msgFunc(__filename); 
var c_msgCode = uwData.c_msgCode;
var rechargeRequestBiz = null;

function LimiBiz(){
    BaseSDK.call(this);
    this.name = "厘米秀SDK";
    this.gameId = 2691;
    this.appId= 101482961; //201120229;//游戏标识
    this.appKey = "WYWFYQST201806CZ";//秘钥
    this.requestHost = "openapi-test.hudong.qq.com";
    //this.requestHost = "openapi.hudong.qq.com";
    this.verifyUrl = "/openapi/apollo_verify_openid_openkey";
    this.gameItemUrl = "/openapi/apollo_game_item_proxy";
   
    /**
     * 登陆
     * @param data
     * @param cb
     */
    this.login = function (data, cb) {
        var ts = Math.floor(Date.now() /1000);
         var rnd = commonUtils.getRandomNum(1,2147483647); 
         var params = {
            appid :this.appId,
            gameid: this.gameId,
            openkey : data.openKey,
            openid: data.openId,
            ts: ts,
            rnd : rnd
        };
 
        params.sig = sdkUtils.getLimiSha1Params('POST', this.verifyUrl, this.appKey + "&",params);
        var paramsData = querystring.stringify(params);
        var options = {
            host: this.requestHost,
            path: this.verifyUrl,
            method: 'POST',
            headers: {
            "Content-Type": 'application/x-www-form-urlencoded',  
            "Content-Length": paramsData.length  
            }
        }; 

        httpUtils.requestHttp(options, paramsData,  (err, result) => {
            if (err){
                logger.error("limiBiz 1 error:%s result:%s options:%j",JSON.stringify(err),result,options);
                return cb(getMsg(c_msgCode.reqFail));//请求失败1
            }
            try {
                //console.log(result);
                if (typeof result == "string") {
                    result = JSON.parse(result);
                }
                if (result.ret != 0) {
                    logger.error("limiBiz 2 error:%s result:%j options:%j",JSON.stringify(err),result,options);
                    return cb(getMsg(c_msgCode.reqFail));//请求失败2
                } else {


                    var ret = {
                        id : data.openId,
                        openId : data.openId,
                        openKey : data.openKey 
                    };
                    if(data.fuid && data.fuid.length <= 40){
                        ret.fuid = data.fuid;
                    }
                    return cb(null, ret);
                }
            } catch (e) {
                logger.error("limiBiz data error:%s result:%s options:%j",JSON.stringify(e),result,options);
                cb(getMsg(c_msgCode.reqFail));//请求失败3
            }
        });
    };

    this.checkPay = function (orderData, cb) {
        var self = this;
        console.error("limiBiz:checkPay ,", orderData);
        rechargeRequestBiz = rechargeRequestBiz || require("uw-recharge").rechargeRequestBiz;
        var payData = orderData.payData;  
        var ts = Math.floor(Date.now() /1000);
        var rnd = commonUtils.getRandomNum(1,2147483647); 
        var openid = payData.openId;
        var openkey = payData.openKey;
        var accountId = payData.accountId;
        var userId = payData.userId;
        var params = {
            appid :this.appId,
            gameid: this.gameId,
            openkey : payData.openKey,
            openid: payData.openId,
            cmd : 1,
            mask : 1,
            ts: ts,
            rnd : rnd
        };
 
        params.sig = sdkUtils.getLimiSha1Params('POST', this.gameItemUrl, this.appKey + "&",params);
        var paramsData = querystring.stringify(params);
        var options = {
            host: this.requestHost,
            path: this.gameItemUrl,
            method: 'POST',
            headers: {
            "Content-Type": 'application/x-www-form-urlencoded',  
            "Content-Length": paramsData.length  
            }
        }; 

        httpUtils.requestHttp(options, paramsData, function (err, result) {
            if (err){
                logger.error("limiBiz 1 error:%s result:%s options:%j",JSON.stringify(err),result,options);
                return cb(getMsg(c_msgCode.reqFail));//请求失败1
            }
            try {
                console.log("limiBiz.payResult:", result);
                if (typeof result == "string") {
                    result = JSON.parse(result);
                }
                if (result.ret != 0) {
                    logger.error("limiBiz 2 error:%s result:%j options:%j",JSON.stringify(err),result,options);
                    return cb(getMsg(c_msgCode.reqFail));//请求失败2
                } else {
                    // 分析itemList 
                    //return cb(null);
                    console.log("limiBiz.payResult 1111:", result, typeof result);
                    var itemList = result.data.itemList;
                    console.log("limiBiz.payResult itemList:", itemList);
                    for(var i = 0; i < itemList.length; i++){
                        var goodsId = itemList[i].id ;
                        var goodsNum = itemList[i].num;

                        self.consumeItem(payData.openId, payData.openKey, goodsId, goodsNum, function(err1,consumeData){

                            console.log("limiBiz.consumeItemResult:", JSON.stringify(consumeData));
                            if(!err1){
                                for(var j = 0; j < goodsNum; j++){
                                    if (userId){
                                        rechargeRequestBiz.setRechargeRequestStatus0ByUserId(accountId, userId, goodsId, function(){});
                                    }else{
                                        rechargeRequestBiz.setRechargeRequestStatus0ByAccountId(accountId, goodsId, function(){});
                                    }
                                }
                            } 
                        });
                    }
                    cb(null);
                    // console.error("checkPay itemInfo", goodsId, goodsNum);
                    // if (goodsNum <= 0){
                    //     return cb('尚未到账');
                    // }else {
                    //     // 消耗掉
                    //     self.consumeItem(payData.openId, payData.openKey, goodsId, goodsNum, function(err1,consumeData){
                    //         console.error("consumeItem:", err1, consumeData);
                    //     });
                    //     return cb(null);
                    // }
 
                }
            } catch (e) {
                logger.error("limiBiz data error:%s result:%s options:%j",JSON.stringify(e),result,options);
                cb(getMsg(c_msgCode.reqFail));//请求失败3
            }
        });
    };

     this.consumeItem = function (openId, openKey, goodsId, goodsNum, cb) {
        console.error("limiBiz:consumeItem ,", openId, openKey, goodsId, goodsNum); 
        var ts = Math.floor(Date.now() /1000);
        var rnd = commonUtils.getRandomNum(1,2147483647); 
        var params = {
            appid :this.appId,
            gameid: this.gameId,
            openkey : openKey,
            openid: openId,
            cmd : 2, 
            itemids: goodsId,
            itemnums: goodsNum,
            itemseqs : ts,
            ts: ts,
            rnd : rnd
        };

        params.sig = sdkUtils.getLimiSha1Params('POST', this.gameItemUrl, this.appKey + "&",params);
        var paramsData = querystring.stringify(params);
        var options = {
            host: this.requestHost,
            path: this.gameItemUrl,
            method: 'POST',
            headers: {
            "Content-Type": 'application/x-www-form-urlencoded',  
            "Content-Length": paramsData.length  
            }
        }; 

        httpUtils.requestHttp(options, paramsData, function (err, result) {
            if (err){
                logger.error("limiBiz 1 error:%s result:%s options:%j",JSON.stringify(err),result,options);
                return cb(getMsg(c_msgCode.reqFail));//请求失败1
            }
            try {
                console.log("limiBiz.consomeItemResult:", JSON.stringify(result));
                if (typeof result == "string") {
                    result = JSON.parse(result);
                }
                if (result.ret != 0) {
                    logger.error("limiBiz 2 error:%s result:%j options:%j",JSON.stringify(err),result,options);
                    return cb(getMsg(c_msgCode.reqFail));//请求失败2
                } else {
                    return cb(null, result);
                }
            } catch (e) {
                logger.error("limiBiz data error:%s result:%s options:%j",JSON.stringify(e),result,options);
                cb(getMsg(c_msgCode.reqFail));//请求失败3
            }
        });


    };

    /**
     * 判断充值项
     * @param data [rechargeRequestData,orderData,channelId]
     * @param cb
     * @returns {*}
     */
    this.checkRechargeId = function(data ,cb){
        var rechargeRequestData = data[0];
        // var orderData = data[1];
        // var channelId = data[2];
        var rechargeId = rechargeRequestData.rechargeId; 
        cb(null,rechargeId);
    };

    //获取发起支付数据
    this.getPayData = function(data){
        var game_orderno = data[2];
        return game_orderno;
    };

    this.request = function(options, paramsData, cb){
        httpUtils.requestHttp(options, paramsData, cb);
    }
};
 
 
util.inherits(LimiBiz,BaseSDK);
module.exports = new LimiBiz();

