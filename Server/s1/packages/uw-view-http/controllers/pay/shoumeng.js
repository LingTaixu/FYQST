/**
 *  shoumeng
 */

var path = require("path");
var sdkBiz = require("uw-sdk").sdkBiz;
var base64Utils = require("uw-utils").base64Utils;
var logger = require('uw-log').getLogger("uw-pay", __filename);
exports.config ={
    method:"use"
};
exports.handler = function (req, res, next) {
    logger.info("[shoumeng]支付回调日志：req.body:%j",req.body);
    logger.info("[shoumeng]支付回调日志：req.query:%j",req.query);
    if (req.body && req.body["coOrderId"]) {
        var orderData = req.body; 
    }
    if (req.query && req.query["coOrderId"]) {
        var orderData = req.query; 
    }
    orderData.game_orderno = orderData["coOrderId"];

    sdkBiz.checkPay(orderData,function(err,data){
        if(err){
            logger.info("支付回调日志：失败！:%j req.body:%j",err,orderData);
            res.end("FAIL");
        }else{
            logger.info("支付回调日志：成功！");
            res.end("SUCCESS");
        }
    });
}; 
