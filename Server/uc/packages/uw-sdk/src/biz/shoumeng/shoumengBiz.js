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

function ShoumengBiz(){
    BaseSDK.call(this);
    this.name = "手盟";
    this.gameId = "2096";
    // this.appId= "";//游戏标识
    this.loginKey = "SMMHVHYXNATJLKIFTJLXATAVLDKKGZSM";//登录秘钥  
    this.payKey = "SMXJDKRZRPWEQPOCAWITGTQGNRBZVLSM";//支付秘钥  
 
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
        // console.log("手盟login:", data);
        var sign = _getLoginSign(data, this.loginKey);
        // console.error('------sign',sign);
        // console.error('------data.sign',data.sign);
        if(sign == data.sign){
            var ret = {
                'id': data.login_account,
                'login_account': data.login_account,
                'cm': data.cm,
                'game_id': data.game_id,
                'cid': data.cid,
            } 
            cb(null, ret);
        }else{
            cb(getMsg(c_msgCode.validateFail));//验证失败
        }
    };

    this.checkPay = function (orderData, cb) {
        var sign = _getPaySign(orderData, this.payKey);
        // console.error('------sign',sign);
        // console.error('------orderData.sign',orderData.sign);
        if(sign == orderData.sign){
            cb(null);
        }else{
            cb(getMsg(c_msgCode.validateFail));//验证失败
        }
    };

    //获取发起支付数据
    this.getPayData = function(data){
        console.error('------data',data);
        var rechargeId = data[0]; 
        var login_account = data[1];
        var game_orderno = data[2];
        var channelId = data[8];
        var rechargeData =  c_recharge[rechargeId];
        var c_payData = c_payInfo[rechargeId];
        var goodsPrice = c_payData[channelId][1]; 
        var payData = {
            gameId : this.gameId,
            userId : login_account,
            itemId : rechargeId, 
            coinName : rechargeData.name,
            totalFee: parseInt(goodsPrice),     // 分
            cpOrderId : game_orderno,
            gameServerId : project.serverId,
            ratio : 50//那边说写死
        }; 
        return payData;
    };

};

var _getLoginSign = function (orderData, loginKey) {
    var strPram = '';
    if (orderData.login_account) {
        strPram += orderData.login_account;
    }
    if (orderData.cm) {
        strPram += orderData.cm;
    }
    if (orderData.time) {
        strPram += orderData.time;
    }
    strPram += loginKey;
    // console.error('---------strPram',strPram);
    var sign =  md5Utils.md5(strPram);
    return sign;
};

var _getPaySign = function (orderData, payKey) {
    var strPram = '';
    if (orderData.orderId) {
        strPram += 'orderId=' + orderData.orderId;
    }
    if (orderData.uid) {
        strPram += '&uid=' + orderData.uid;
    }
    if (orderData.amount) {
        strPram += '&amount=' + orderData.amount;
    }
    if (orderData.coOrderId) {
        strPram += '&coOrderId=' + orderData.coOrderId;
    }
    if (orderData.success) {
        strPram += '&success=' + orderData.success;
    }
    strPram += '&secret=' + payKey;
    // console.error('---------strPram',strPram);
    var sign =  md5Utils.md5(strPram);
    return sign;
};

util.inherits(ShoumengBiz,BaseSDK);
module.exports = new ShoumengBiz();

