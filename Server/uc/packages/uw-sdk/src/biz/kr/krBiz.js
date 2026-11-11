/**
 * Created by Administrator on 2015/7/10.
 * 韩国接入
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

function KrBiz(){
    BaseSDK.call(this);
    this.name = "韩国版";
    this.appId = "ttf"; 
    // this.gameId = "";
    // this.appId= "";//游戏标识
    this.appKey = "QEmgn4pMLHV5tuCy";//秘钥
 
    /**
     * 登陆
     * @param data
     * @param cb
     */
    this.login = function (data, cb) {

        /* 
            data 格式
             {"platform":"","uid":"","serverid":"","time":" ","isadult":"","sign":""}
        */  
        console.log("krBiz.login:", data);
        var rawStr = ""+data.platform+data.uid+data.serverid+data.time+data.isadult+data.mode+this.appKey;
        console.log("=== rawStr:", rawStr, ", md5:", md5Utils.md5(rawStr));
        if(md5Utils.md5(""+data.platform+data.uid+data.serverid+data.time+data.isadult+data.mode+this.appKey) != data.sign){
            cb(getMsg(c_msgCode.validateFail));//验证失败
        }else{
            var ret = {
                id : data.uid,
                open_id : data.uid,
                platform: data.platform,
                isadult: data.isadult,
                channelid : data.platform
            };
            cb(null, ret);
        }
    };

    this.checkPay = function (orderData, cb) {
        var sign = _getPaySign(orderData, this.appKey);
        if(sign==orderData.sign){
            cb(null);
        }else{
            cb(getMsg(c_msgCode.validateFail));//验证失败
        }
    };

    //获取发起支付数据
    this.getPayData = function(data){
        var rechargeId = data[0];
        var open_id = data[1];
        var game_orderno = data[2];
        var userId = data[4];
        var goodsId  = data[6];
        var sdkData = data[7];
        var channelId = data[8];
        var channelName = sdkData['platform'];
   
        var rechargeData =  c_recharge[rechargeId];
        var subject = rechargeData.name;
        var c_payData = c_payInfo[rechargeId];
        var goodsPrice = c_payData[channelId][1];
        var money = parseInt(goodsPrice);      
        var buyAmonut = 1; 

        var payData = {
            appId : this.appId, 
            channelName: channelName, 
            orderId : game_orderno,
            subject: subject,
            money : money,
            userId : sdkData.id,
            buyAmonut : 1,
            extInfo: game_orderno,
            itemCode: goodsId
        }; 

        var sign = md5Utils.md5(payData.appId+payData.channelName+payData.orderId+payData.subject+payData.money+payData.userId+payData.buyAmonut+payData.extInfo+payData.itemCode+this.appKey);
        payData.sign = sign;
        return payData;
    };

};

var _getPaySign = function (orderData, appKey) {
    //按照key升序后，key1=value1key2=value2key3…拼接成的字符串 
    var params = {
        platform: orderData.platform,
        uid: orderData.uid,
        orderid: orderData.orderid,
        extradata: orderData.extradata,
        feemoney: orderData.feemoney,
        paytime: orderData.paytime,
        appKey: appKey 
    }; 
    var strPram = "";
    for (var key in params) { 
        strPram +=  params[key];
    }  
    var sign =  md5Utils.md5(strPram); 
    return sign;
};

util.inherits(KrBiz,BaseSDK);
module.exports = new KrBiz();

