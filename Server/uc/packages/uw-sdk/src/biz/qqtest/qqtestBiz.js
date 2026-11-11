/**
 *  手Q测试
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
var mailBiz = null;

function QQTestBiz(){
    BaseSDK.call(this);
    this.name = "手Q测试"; 
    this.gameId = 2691;
    this.appId=101482961; //201120229;//游戏标识
    this.appKey = "WYWFYQST201806CZ";//秘钥
    //this.requestHost = "openapi-test.hudong.qq.com";
    this.requestHost = "127.0.0.1:8201";
    this.verifyUrl = "/openapi/apollo_verify_openid_openkey";
    this.gameItemUrl = "/testQQ.php";
    //this.gameRewardItemIds=[117000,224000,115000];      // 活动列表
    this.gameRewardItemIds = {
        "38":117000,
        "39":224000,
        "37":115000
    };
 
    /**
     * 登陆
     * @param data
     * @param cb
     */
    this.login = function (data, cb) {
        /* 
            data 格式
            {"openId":"","accessToken":""}
        */
        if(!data.openId || data.openId.length < 8){
            return cb(getMsg(c_msgCode.validateFail)); 
        }
        var ret = {
            id : data.openId,
            open_id : data.openId 
        };
        return cb(null, ret);
    };

    // 没有支付
    // this.checkPay = function (orderData, cb) {
    //      return   cb(getMsg(c_msgCode.validateFail));//验证失败
    // };

  this.checkPay = function (orderData, cb) {
        var self = this; 
        rechargeRequestBiz = rechargeRequestBiz || require("uw-recharge").rechargeRequestBiz;
        var payData = orderData.payData;  
        var ts = Math.floor(Date.now() /1000);
        var rnd = commonUtils.getRandomNum(1,2147483647); 
        var openid = 'openid';
        var openkey = 'openkey';
        var accountId = 'openid';
        var userId = 'userId';
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

       //logger.error("checkPay params:%j options:%j",params, options);
        httpUtils.requestHttp(options, paramsData, function (err, result) {
            if (err){
                logger.error("limiBiz 1 error:%s result:%s options:%j",JSON.stringify(err),result,options);
                return cb(getMsg(c_msgCode.reqFail));//请求失败1
            }
            try {
                //console.log("limiBiz.payResult:", result);
                if (typeof result == "string") {
                    result = JSON.parse(result);
                }
                if (result.code != 0) {
                    logger.error("limiBiz 2 error:%s result:%j options:%j",JSON.stringify(err),result,options);
                    return cb(getMsg(c_msgCode.reqFail));//请求失败2
                } else {
                    // 分析itemList 
                    //return cb(null);
                    //console.log("limiBiz.payResult 1111:", result, typeof result);
                    var itemList = result.data.itemList;
                    if(itemList.length > 0){
                        logger.error("limiBiz.payResult itemList:%j", itemList);
                    }
                    for(var i = 0; i < itemList.length; i++){
                        var goodsId = itemList[i].id ;
                        var goodsNum = itemList[i].num;

                        self.consumeItem(payData.openId, payData.openKey, goodsId, goodsNum, function(err1,consumeData){
                            logger.error("limiBiz.consumeItemResult  :%j", JSON.stringify(consumeData));
                            if(!err1){ 
                                var key = "" + goodsId;
                                if(self.gameRewardItemIds[key]){
                                    self.sendGameItemToUser(userId, self.gameRewardItemIds[key], 1);
                                }else{  
                                    for(var j = 0; j < goodsNum; j++){
                                        logger.error("limiBiz.setRechargeRequestStatus :", accountId, userId, goodsId, 1);
                                        if (userId){
                                            rechargeRequestBiz.setRechargeRequestStatus0ByUserId(accountId, userId, goodsId, function(){});
                                        }else{
                                            rechargeRequestBiz.setRechargeRequestStatus0ByAccountId(accountId, goodsId, function(){});
                                        }
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
    // 没有支付
    this.getPayData = function(data){
        var payData = {}; 
        return payData;
    };

};
 
util.inherits(QQTestBiz,BaseSDK);
module.exports = new QQTestBiz();

