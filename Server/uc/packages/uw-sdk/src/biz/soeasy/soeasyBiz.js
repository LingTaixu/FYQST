/**
 * Created by Administrator on 2015/7/10.
 * soeasySdk 掌盟sdk
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

function SoEasyBiz(){
    BaseSDK.call(this);
    this.name = "掌盟sdk";
    // this.gameId = "";
    this.appId= "1966";//游戏标识
    this.appKey = "QQ436043762";//秘钥
    
    /**
     * 登陆
     * @param data
     * @param cb
     */
    this.login = function (data, cb) {

        /* 
            data 格式
            {"common":{"sdkindx":"","sdkname":"","channel":""},"userdata":{"uid":"","name":"","sex":"","area":" ","nick":"","t":"","sign":""}}
        */
        //var sdkData = data; 
        //console.log("secret_key="+this.appKey+"&t="+userdata.t+"&uid="+userdata.uid);
        var userdata = data.userdata; 
        if(md5Utils.md5("account="+userdata.uid+"&time="+userdata.t+"&key="+this.appKey) != userdata.sign){
            cb(getMsg(c_msgCode.validateFail));//验证失败
        }else{
            var ret = {
                id : userdata.uid,
                open_id : userdata.uid,
                channelid :data.common.sdkindx,
                sdkname : data.common.sdkname,
                channel : data.common.channel
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
             {"check":"md5(fee+feeid+seceret_key)",
                 "feeid":" 必填 cp 方自定义的计费 id ",
                 fee": 必填 金额 分,
                 "feename":"必填 商品名称",
                 "extradata":"透传参数 支付回调通知时会带给 cp",
                 "serverid","游戏分区号",
                 "rolename":"角色 名称",
                 roleid":"角色 ID",
                 servername":"分区服名称"
            }
        */
        var rechargeId = data[0];
        var open_id = data[1];
        var game_orderno = data[2];
        var lvl = data[3];
        var userId = data[4];
        var nickName = data[5];
        var channelId = data[8];
        var rechargeData =  c_recharge[rechargeId];
        var c_payData = c_payInfo[rechargeId];
        var goodsPrice = c_payData[channelId][1];
        var total_fee = parseInt(goodsPrice) * 100;  //单位到分
       //var total_fee = 100;   // 测试代码
        var subject = rechargeData.name;
  
        var payData = {
            check :  md5Utils.md5("name="+subject+"&price="+total_fee+"&extractInfo="+game_orderno+"&key=" + this.appKey),
            feeid : rechargeId,
            fee : total_fee,
            feename : subject,
            extradata: game_orderno,
            serverid: project.serverId,
            rolename: nickName,
            roleid: userId.toString(),
            servername:"TTF"+project.serverId+"服" 
        }; 
        return payData;
    };

};

var _getPaySign = function (orderData, appKey) {
    //按照key升序后，key1=value1key2=value2key3…拼接成的字符串 
    var params = {
        appid: orderData.appid,
        extradata: orderData.extradata,
        feeid: orderData.feeid,
        feemoney: orderData.feemoney,
        orderid: orderData.orderid,
        paystatus: orderData.paystatus,
        paytime: orderData.paytime,
        prover: orderData.prover,
        sdkindx: orderData.sdkindx,
        uid: orderData.uid
    }; 
    var strPram = "";
    for (var key in params) { 
        if (strPram == ""){
            strPram +=  key + "=" + params[key];
        }else{
            strPram += "&" + key + "=" + params[key];
        }
    } 
    var sign = md5Utils.md5(md5Utils.md5(strPram) + appKey);
    return sign;
};

util.inherits(SoEasyBiz,BaseSDK);
module.exports = new SoEasyBiz();
 
