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
 
    /*    var body = {
        "orderId":"42336448587846634645744363464A4248673D3D",
        "id":"3d22fddeb484b4458eac95eddb4de89d",
        "money":"6",
        "ext":"xyz",
        "time":"1430193421",
        "serverId":"1",
        "goodsId":"1",
        "goodsNumber":"1",
        "sign":"d721c8605ca8faaf3e632404ec27896c"
    };*/
    var orderData = {
        appid: "",  
        sdkindx: "",
        uid: "",
        feeid: "",
        feemoney: "",
        orderid: "",
        extradata: "",
        paytime: "",
        prover: "",
        paystatus:"",
        goodsId:"",     // 逻辑字段
        money:0,        // 逻辑字段，需要转换成内部的元
        sign:""
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
    orderData.appid = data["appid"];
    orderData.sdkindx = data["sdkindx"];
    orderData.uid = data["uid"];
    orderData.feeid = data["feeid"];
    orderData.feemoney = data["feemoney"];
    orderData.orderid = data["orderid"];
    orderData.extradata = data["extradata"];
    orderData.paytime = data["paytime"];
    orderData.prover = data["prover"];
    orderData.paystatus = data["paystatus"];
    orderData.goodsId = data["feeid"];          
    orderData.money =   data["feemoney"]; // 价格分 //* .01;     // 价格由分转换成元
    orderData.sign = data["sign"]; 
};