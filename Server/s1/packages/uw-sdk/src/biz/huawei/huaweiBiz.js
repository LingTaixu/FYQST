/**
 *  爱微游11h5
 */

var util = require("util");
var BaseSDK = require("../BaseSDK.js");
var sdkUtils = require("../sdkUtils.js");
var project = require("uw-config").project;
var uwData = require("uw-data");
var c_recharge = uwData.c_recharge;
var c_payInfo = uwData.c_payInfo;
var commonUtils = require("uw-utils").commonUtils;
var httpUtils = require("uw-utils").httpUtils;
var logger = require('uw-log').getLogger("uw-logger", __filename);
var querystring = require('querystring');
var md5Utils = require("uw-utils").md5Utils;
var getMsg = require("uw-utils").msgFunc(__filename); 
var c_msgCode = uwData.c_msgCode;
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

function HuaweiBiz(){
    BaseSDK.call(this);
    this.name = "华为SDK";
    // this.gameId = 2691;
    this.appId= "100319675";//游戏标识
    // this.appKey = "WYWFYQST201806CZ";//秘钥 
    this.loginKey =  null;
    this.appPayId = "890086000102043048";
    this.appPayPubKey = null;
    this.appPayPriKey =   null;

    this.getLoginKey = function(){
        if (this.loginKey){
            return this.loginKey;
        }
        this.loginKey = fs.readFileSync(path.join(__dirname,  "/gamePub.pem"),"utf-8");
        console.error("HUAWEI loginkey:", this.loginKey);
        return this.loginKey;
    };
    this.getPayPriKey = function(){
        if (this.appPayPriKey){
            return this.appPayPriKey;
        }
        this.appPayPriKey = fs.readFileSync(path.join(__dirname,  "/payPri.pem"),"utf-8");
        console.error("HUAWEI getPayPriKey:", this.appPayPriKey);
        return this.appPayPriKey;
    };
    this.getPayPubKey = function(){
        if (this.appPayPubKey){
            return this.appPayPubKey;
        }
        this.appPayPubKey = fs.readFileSync(path.join(__dirname,  "/payPub.pem"),"utf-8");
        console.error("HUAWEI appPayPubKey:", this.appPayPubKey);
        return this.appPayPubKey;
    };
    /**
     * 登陆
     * @param data
     * @param cb
     */
    this.login = function (data, cb) {
        var appId = data.appId;
        var playerId = data.playerId;
        var ts = data.ts;
        var sign = data.sign;

         var params = {
            appId :appId,
            playerId: playerId,
            ts : ts,
            sign: sign
        };
  
        var pass = _signLogin(params, this.getLoginKey());
        //pass = true;
        if (!pass) {
            return cb(getMsg(c_msgCode.reqFail));//请求失败1
        } else {
            var ret = {
                id : data.playerId,
                open_id : data.playerId
            } 
            cb(null, ret);
        }
    };

    //获取发起支付数据
    this.getPayData = function(data){
        var rechargeId = data[0];
        var open_id = data[1];
        var game_orderno = data[2];
        //var lvl = data[3];
        var userId = data[4];
        var nickName = data[5]; 
        var goodsId  = data[6];
        var sdkData = data[7];
        var channelId = data[8];
        var rechargeData =  c_recharge[rechargeId];
        var c_payData = c_payInfo[rechargeId];
        var goodsPrice = c_payData[channelId][1];
        var money = goodsPrice.toString() + ".00";  
        //var money =  "0.01";      
 
        var params = {
            userID : this.appPayId,
            applicationID : this.appId,
            amount : money,
            productName : rechargeData.name,
            requestId : game_orderno,
            productDesc : rechargeData.name
        };
        var sign = _getPaySign(params, this.getPayPriKey());
        params.sign = sign;
        params.userName = 'Hoolai';
        params.signType = 'RSA256'; 
        console.error("HuaweiBiz: getPayData:", params);
        return params;
    };

    this.checkPay = function (orderData, cb) {
        var self = this;
        console.error("huaweiBiz:checkPay ,", orderData);

        if (_signPay(orderData, this.getPayPubKey())) {
            return cb(null); 
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
};

 var _getPaySign = function (orderData, payPriKey) {
     //按照key升序后，key1=value1key2=value2key3…拼接成的字符串 
     var keys = Object.keys(orderData);
     keys.sort(); 
 
     var strPram = "";
     for(var i = 0; i < keys.length; i++){
         if (keys[i] == "sign") continue;
         strPram += keys[i] + "=" + orderData[keys[i]] + "&";
     }
     strPram = strPram.substr(0, strPram.length - 1);
 
     const sign = crypto.createSign('RSA-SHA256');
     console.error("HuaweiBiz: strPram:", strPram);
     sign.update(strPram); 
     return sign.sign(payPriKey, 'base64'); 
 };
 
 var _signPay = function(orderData, appPubKey){
    delete orderData.rechargeRequestData;
    var keys = Object.keys(orderData);
     keys.sort(); 
 
     var strPram = "";
     for(var i = 0; i < keys.length; i++){
         if (keys[i] == "sign" || keys[i] == "signType") continue;
         strPram += keys[i] + "=" + orderData[keys[i]] + "&";
     }
     strPram = strPram.substr(0, strPram.length - 1);
     console.log("strPram:", strPram);
     var verify = null;
     if (orderData.signType == "RSA256"){
         verify = crypto.createVerify('RSA-SHA256');
     }else{
        verify = crypto.createVerify('RSA-SHA1');
     }
    verify.update(strPram);
    return verify.verify(appPubKey, orderData.sign, "base64");
 };

/**
 * 华为sha加密
 * @param appKey
 * @param params
 * @returns {string}
 */
var _signLogin = function(params, appKey){
    var content = params.appId + params.playerId + params.ts;
    console.log("content:", content);
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(content);
    return verify.verify(appKey, sdkUtils.hex2bin(params.sign));
};
  
util.inherits(HuaweiBiz,BaseSDK);
module.exports = new HuaweiBiz();

// var jsonData = '{"result":"0","amount":"0.01","payType":"17","orderId":"WXce216bad853d982f56116a648f1549","notifyTime":"1530870628508","requestId":"ID19213T1530870206549","signType":"RSA256","userName":"890086000102043048","sysReserved":"oU-eisyp1fi5LbTte5nofWV9a7n0","productName":"300钻石","sign":"sA0gh6Y9+BZ6JSOooc4aJUa1u+T+AgEAshKdmcU8i5AL3W8E6D5Luci8vGATDvMN06OBWbCGXfhlPC+KfWDzKiURO/FeiDHR5ZR7y99tRBQHs4Nf7AVFY9bzoqAbc4ZyexLlHnwVfDHZJQcelc/xsvt9ZaVOPEhU4UkzFQourktz2r9NlHEI/oDZc5GEa10pH5Zwj+JxTt8QGgJ7GrUAexGKB222XIRcdXMF0MtyMeKFpR+Bdnn1YTpWseHJYtS4SMSiT291JwpbKVvYIrVYz2dwC7VQyRX4i0djclrN1dvLfErjptcbiLYgKPGpIF1W5aE+UFCzOS7kjrwzpQI1Yg=="}';
// var params = JSON.parse(jsonData);
// var appPayPubKey = fs.readFileSync(path.join(__dirname,  "/payPub.pem"),"utf-8");
// var r = _signPay(params, appPayPubKey);

