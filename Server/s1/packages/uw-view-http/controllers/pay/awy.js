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
 
    sdkBiz.checkPay(req.query,function(err,data){
        if(err){
            logger.info("支付回调日志：失败！:%j req.body:%j",err,req.body);
            res.end("FAIL");
        }else{
            logger.info("支付回调日志：成功！");
            res.end("SUCCESS");
        }
    });
};

var _assignData = function(orderData, data){
    orderData = data;
};