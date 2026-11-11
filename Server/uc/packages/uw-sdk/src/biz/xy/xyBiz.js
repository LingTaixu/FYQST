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
var commonUtils = require("uw-utils").commonUtils;
var httpUtils = require("uw-utils").httpUtils;
var logger = require('uw-log').getLogger("uw-logger", __filename);
var querystring = require('querystring');
var md5Utils = require("uw-utils").md5Utils;
var getMsg = require("uw-utils").msgFunc(__filename);
var c_msgCode = uwData.c_msgCode;

function XyBiz(){
    BaseSDK.call(this);
    this.name = "旭扬";
    // this.gameId = "";
    // this.appId= "";//游戏标识
    this.appKey = "m7164ed45460ebe671b0d96fc87ee65y";//秘钥
 
    /**
     * 登陆
     * @param data
     * @param cb
     */
    this.login = function (data, cb) {

        /* 
            data 格式
            {"userdata":{"accountName":"","uid":"","token":"","sdkVersionCode":" ","gid":"","sign":""}}
        */
        //var sdkData = data; 
        //console.log("secret_key="+this.appKey+"&t="+userdata.t+"&uid="+userdata.uid);
        var userdata = data.userdata; 
        if(md5Utils.md5(userData.accountName+"&"+userdata.gid+"&"+userdata.appKey+"&"+userdata.sdkVersionCode+"&"+userdata.token+"&"+userdata.uid) != userdata.sign){
            cb(getMsg(c_msgCode.validateFail));//验证失败
        }else{
            var ret = {
                id : userdata.accountName,
                open_id : userdata.accountName
            } 
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
        /*
             {
                "transactionId": 订单号,
                "gameOther": 订单号 //扩展透传数据, {userid":"角色 ID", rechargeId: 物品id orderid:订单号, "serverid","游戏分区号"}
                "sid" : 服务器id,
                "apid: 商品id
            }
        */
        var rechargeId = data[0];
        var open_id = data[1];
        var game_orderno = data[2];
        //var lvl = data[3];
        //var userId = data[4];
        //var nickName = data[5];
        //var rechargeData =  c_recharge[rechargeId];
        //var total_fee = parseInt(rechargeData.cost) * 100;  //单位到分
       //var total_fee = 100;   // 测试代码
        //var subject = rechargeData.name;
  
        var payData = {
            transactionId : game_orderno, 
            apid : rechargeId,
            gameOther: game_orderno,
            sid: project.serverId
        }; 
        return payData;
    };

};

var _getPaySign = function (orderData, appKey) {
    //按照key升序后，key1=value1key2=value2key3…拼接成的字符串 
    var params = {
        act: orderData.act,
        ts: orderData.ts,
        gameid: orderData.gameid,
        partnerid: orderData.partnerid,
        sid: orderData.sid,
        money: orderData.money,
        clientip: orderData.clientip,
        orderno: orderData.orderno,
        formkey: appKey 
    }; 
    var strPram = "";
    for (var key in params) { 
        if (strPram == ""){
            strPram +=  params[key];
        }else{
            strPram += "&" + params[key];
        }
    } 
    var sign =  md5Utils.md5(strPram);
    return sign;
};

util.inherits(XyBiz,BaseSDK);
module.exports = new XyBiz();

