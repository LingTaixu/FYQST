/**
 *  huawei
 */

var path = require("path");
var sdkBiz = require("uw-sdk").sdkBiz;
var logger = require('uw-log').getLogger("uw-pay", __filename);
exports.config ={
    method:"use"
};
exports.handler = function (req, res, next) {
    logger.info("[HUWAEI]支付回调日志：req.body:%j",req.body);
    logger.info("[HUWAEI]支付回调日志：req.query:%j",req.query);
    var orderData = {};
    if (req.body && req.body["orderId"]) {
        orderData = req.body; 
    } else {   
        orderData = req.query; 
    }

    sdkBiz.checkPay(orderData,function(err,data){
        if(err){
            logger.info("支付回调日志：失败！:%j req.body:%j",err,orderData);
            res.json({result:1});
        }else{
            logger.info("支付回调日志：成功！");
            res.json({result:0});
        }
    });
}; 
