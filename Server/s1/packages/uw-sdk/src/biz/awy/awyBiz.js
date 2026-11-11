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

function AwyBiz(){
    BaseSDK.call(this);
    this.name = "爱微游SDK";
    // this.gameId = "";
    // this.appId= "";//游戏标识
    this.appKey = "A7164ed45460ebe671b0d96fc87ee65y";//秘钥
    this.verifyUrl = "https://api.11h5.com/login?cmd=checkUserToken&userToken={token}";
 
    /**
     * 登陆
     * @param data
     * @param cb
     */
    this.login = function (data, cb) {
        /* 
            data 格式
            {"token":"","fuid":"","focus":"","verify":" ","wallow":""}
        */
         var params =  "cmd=checkUserToken&userToken="+data.token;
         var options = _getOptions(params);

            httpUtils.requestHttps(options, "", function (err, result) {
                if (err){
                    logger.error("awyBiz 1 error:%s result:%s options:%j",JSON.stringify(err),result,options);
                    return cb(getMsg(c_msgCode.reqFail));//请求失败1
                }
                try {
                    //console.log(result);
                    if (typeof result == "string") {
                        result = JSON.parse(result);
                    }
                    if (result.error) {
                        logger.error("awyBiz 2 error:%s result:%j options:%j",JSON.stringify(err),result,options);
                        return cb(getMsg(c_msgCode.reqFail));//请求失败2
                    } else {
                        var ret = {
                            id : result.uid,
                            open_id : result.uid,
                            //nickname: result.nickname,
                            //headimgurl: result.headimgurl,
                            //sex: result.sex,
                            focus: result.focus,
                            verify: data.verify,
                            wallow: data.wallow,
                            fuid : data.fuid,
                            usertype: result.usertype
                        };
                        return cb(null, ret);
                    }
                } catch (e) {
                    logger.error("awyBiz data error:%s result:%s options:%j",JSON.stringify(e),result,options);
                    cb(getMsg(c_msgCode.reqFail));//请求失败3
                }
            });
    };

    this.checkPay = function (orderData, cb) {
        var sign = _getPaySign(orderData, this.appKey);
        if(sign==orderData.sign){
            cb(null);
        }else{
            cb(getMsg(c_msgCode.validateFail));//验证失败
        }
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
        var rechargeId = data[0];
        var open_id = data[1];
        var game_orderno = data[2];
        var goodsId  = data[6];
        //var lvl = data[3];
        //var userId = data[4];
        //var nickName = data[5];
        //var rechargeData =  c_recharge[rechargeId];
        //var total_fee = parseInt(rechargeData.cost) * 100;  //单位到分
       //var total_fee = 100;   // 测试代码
        //var subject = rechargeData.name;
  
        var payData = {
            pid : goodsId,  
            txid: game_orderno,
            userdata:game_orderno,
            product_count:1
        }; 
        return payData;
    };

};

var _getOptions = function (params) {
    var options = {
        host: 'api.11h5.com',
        path: "/login?" + params,
        method: 'get',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    }; 
    return options;
};

var _getPaySign = function (orderData, appKey) {
    //按照key升序后，key1=value1key2=value2key3…拼接成的字符串 

    delete orderData.rechargeRequestData;
    
    var keys = Object.keys(orderData);
    keys.sort(); 

    var strPram = "";
    for(var i = 0; i < keys.length; i++){
        if (keys[i] == "sign") continue;
        strPram += keys[i] + "=" + orderData[keys[i]] + "&";
    }
    var sign = md5Utils.md5(strPram + "key=" + appKey); 
    return sign.toUpperCase();
};

util.inherits(AwyBiz,BaseSDK);
module.exports = new AwyBiz();

