/**
 * Created by Administrator on 2015/7/10.
 *  
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

function HoolaiBiz(){
    BaseSDK.call(this);
    this.name = "胡莱SDK";
    // this.gameId = "";
    // this.appId= "";//游戏标识
    this.appKey = "m7164ed45460ebe671b0d96fc87ee65y";//秘钥
    this.product_key_list = {
        950:"YGAf9nrUbM6238o3",
        957:"2Qq133Z7kg6DB3LR",
        959:"O53CPV23NHg478ox"
    };
    this.product_key = "YGAf9nrUbM6238o3";//秘钥   aaabbbccc
    /**
     * 登陆
     * @param data
     * @param cb
     */
    this.login = function (data, cb) {
        /* 
            data 格式
            {"uid":"","channel":"","channelUid":"","accessToken":" ","productId":""}
        */
        var token = data.accessToken;
        var productId = data.productId;
        var params = "uid="+data.uid+"&channel="+data.channel+"&channelUid="+data.channelUid+"&accessToken="+token+"&productId="+data.productId;
        var options = _getOptions(params);

        httpUtils.requestHttp(options, "", function (error, param) {
            param = JSON.parse(param);
            if (error){
                logger.error("hoolaiBiz 1 error:%s result:%s options:%j",JSON.stringify(error),param,options);
                return cb(getMsg(c_msgCode.reqFail));//请求失败1
            }
            if (param.code.toUpperCase() == 'SUCCESS') {
                    var ret = {
                        id : data.uid,
                        open_id : data.uid,
                        udid: data.udid,
                        productId:productId
                    };
                    return cb(null, ret);
            } else {
                logger.error("hoolaiBiz data error:%s result:%s options:%j",param);
                cb(getMsg(c_msgCode.reqFail));//请求失败3
            }
        });
    };

    this.checkPay = function (orderData, cb) {
        var proKey = "";
        //console.error('-------orderData',orderData);
        if (orderData.product_id) {
            proKey = this.product_key_list[orderData.product_id];
        }
        //console.error('-------proKey',proKey);
        var sign = _getPaySign(orderData, proKey);
        if(sign==orderData.sign){
            cb(null);
        }else{
            cb(getMsg(c_msgCode.validateFail));//验证失败
        }
    };

    //获取发起支付数据
    this.getPayData = function(data){
        var rechargeId = data[0]; 
        var accountName = data[1];      // 账号
        var game_orderno = data[2];
        var channelId = data[8];
        var rechargeData =  c_recharge[rechargeId];
        var c_payData = c_payInfo[rechargeId];
        var goodsPrice = c_payData[channelId][1]; 

        // 格式 游戏订单号_充值ID
        var callbackInfo = game_orderno + "|" + rechargeId + "|" + accountName;
        var payData = {
            itemId : rechargeId, 
            itemName : rechargeData.name,
            amount: parseInt(goodsPrice) * 100,     // 分
            callbackInfo : callbackInfo
        }; 
        return payData;
    };

    /**
     * 判断充值项
     * @param data [rechargeRequestData,orderData,channelId]
     * @param cb
     * @returns {*}
     */
    this.checkRechargeId = function(data ,cb){
        var rechargeRequestData = data[0];
        var orderData = data[1];
        var channelId = data[2];
        var rechargeId = rechargeRequestData.rechargeId; 
        if (!rechargeRequestData.goodsId) return cb('error_item');//此商品不存在
        if(parseInt(rechargeRequestData.goodsPrice) * 100 != parseInt(orderData.amount)){
            return cb('error_amount');//此商品不存在
        }
        
        if(orderData.ttf_account != orderData.uid){
            return cb('error_uid');
        } 

        cb(null,rechargeId);
    };

};

var _getOptions = function (params) {
    var options = {
        host: 'access.hoolai.com',
        path: "/access_open_api/login/validateAccessToken.hl?" + params,
        method: 'get',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    }; 
    return options;
};

var _getPaySign = function (orderData, product_key) {
    //按照key升序后，key1=value1key2=value2key3…拼接成的字符串 
    var params = {};
    for (var oKey in orderData) { 
        if (oKey != 'sign' && oKey != 'game_orderno' && oKey != 'ttf_rechargeId' && oKey != 'ttf_account' && oKey != 'rechargeRequestData') {
            params[oKey] = orderData[oKey];
        }
    }
     
    var strPram = "";
    for (var key in params) { 
        if (strPram == ""){
            strPram += key + '=' + params[key];
        }else{
            strPram += "&" + key + '=' + params[key];
        }
    } 
    strPram += "&product_key=" + product_key;
    var sign =  md5Utils.md5(strPram);
    return sign;
};

util.inherits(HoolaiBiz,BaseSDK);
module.exports = new HoolaiBiz();

