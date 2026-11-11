/**
 *  hoolai
 */

var path = require("path");
var sdkBiz = require("uw-sdk").sdkBiz;
var base64Utils = require("uw-utils").base64Utils;
var logger = require('uw-log').getLogger("uw-pay", __filename);
exports.config ={
    method:"use"
};
exports.handler = function (req, res, next) {
    logger.info("[hoolaily]支付回调日志：req.body:%j",req.body);
    logger.info("[hoolaily]支付回调日志：req.query:%j",req.query);
    var orderData = req.query; 
 
    var callback_info =base64Utils.Base64.decode(orderData.callback_info);
    var infoArr = callback_info.split("|");
    orderData.game_orderno = infoArr[0];
    orderData.ttf_rechargeId = infoArr[1];
    orderData.ttf_account = infoArr[2];

    sdkBiz.checkPay(orderData,function(err,data){
        if(err){
            logger.info("支付回调日志：失败！:%j req.body:%j",err,orderData);
            res.end("FAIL");
        }else{
            logger.info("支付回调日志：成功！");
            res.end("OK");
        }
    });
}; 
