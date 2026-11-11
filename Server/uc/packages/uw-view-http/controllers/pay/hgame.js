/**
 * Created by Administrator on 2015/4/16.
 */

var path = require("path");
var sdkBiz = require("uw-sdk").sdkBiz;
var logger = require('uw-log').getLogger("uw-pay", __filename);
exports.config ={
    method:"use"
};
exports.handler = function (req, res, next) {
    logger.info("支付回调日志：req.body:%j",req.body);
    logger.info("支付回调日志：req.query:%j",req.query);
    var cbIp = getClientIp(req);
    logger.info("ip：",cbIp);

    //白名单
    //var start=ipToNumber("172.16.0.0"),end=ipToNumber("172.18.0.0"),myip=ipToNumber(cbIp);
    //if(myip<start||myip>end){
    //    var retData = {
    //        code:1,
    //        message:"ip不在白名单内"
    //    };
    //    return res.jsonp(retData);
    //}

    //game_key ： 这⾥里是平台提供的game_key（required）
    //game_orderno ： 游戏⽅方⽣生成的唯⼀一订单号（required）
    //orderno ： 平台⽣生成的唯⼀一订单号（required）
    //subject ： 游戏道具名称（required）
    //description ： 游戏道具描述（option）
    //total_fee : 商品价格（required）
    //signature : 签名（required）
    var orderData = {
        game_key: "",//订单号
        game_orderno: "",
        orderno: "",
        subject: "",
        description: "",
        total_fee: "",
        signature: ""
    };
    if (req.body && req.body["game_key"]) {
        var body = req.body;
        orderData.game_key = body["game_key"];
        orderData.game_orderno = body["game_orderno"];
        orderData.orderno = body["orderno"];
        orderData.subject = body["subject"];
        orderData.description = body["description"];
        orderData.total_fee = body["total_fee"];
        orderData.signature = body["signature"];
    } else {
        orderData.game_key = req.query["game_key"];
        orderData.game_orderno = req.query["game_orderno"];
        orderData.orderno = req.query["orderno"];
        orderData.subject = req.query["subject"];
        orderData.description = req.query["description"];
        orderData.total_fee = req.query["total_fee"];
        orderData.signature = req.query["signature"];
    }
    sdkBiz.checkPay(orderData,function(err,data){
        if(err){
            logger.info("支付回调日志：失败！:%j req.body:%j",err,req.body);
            var retData = {
                code:1,
                message:"游戏支付失败"
            };
            res.jsonp(retData);
        }else{
            logger.info("支付回调日志：成功！");
            var retData = {
                code:0,
                message:"游戏支付成功"
            };
            res.jsonp(retData);
        }
    });
};

var getClientIp = function(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
};

var ipToNumber = function(ip){//IP地址转为数字
    var arr=ip.split('.');
    return 256*256*256*parseInt(arr[0])+256*256*parseInt(arr[1])+256*parseInt(arr[2])+parseInt(arr[3]);
};
