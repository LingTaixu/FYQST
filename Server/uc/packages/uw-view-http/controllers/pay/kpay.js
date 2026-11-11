/**
 * Created by Administrator on 2015/4/16.
 * 掌盟SDK 
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
 
    var orderData = {
        platform: "",  
        uid: "",
        orderid: "",
        extradata: "",
        feemoney: "",
        paytime: "",    
        sign:""        // 逻辑字段，需要转换成内部的元
    };
    if (req.body && req.body["orderid"]) {
        var body = req.body;
        _assignData(orderData, body);
    } else {  
        _assignData(orderData, req.query);
    }
    sdkBiz.checkPay(orderData,function(err,data){
        if(err){
            logger.info("支付回调日志：失败！:%j req.body:%j",err,req.body);
            res.end("FAIL");
        }else{
            logger.info("支付回调日志：成功！"); 
            res.end("OK");
        }
    });
};

var _assignData = function(orderData, data){
    orderData.platform = data["platform"];
    orderData.uid = data["uid"];
    orderData.orderid = data["orderid"];
    orderData.extradata = data["extradata"];
    orderData.paytime = data["paytime"];
    orderData.feemoney = data["feemoney"];
    orderData.sign = data["sign"]; 
};