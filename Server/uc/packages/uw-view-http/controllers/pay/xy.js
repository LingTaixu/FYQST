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
        act: "",  
        account: "",
        ts: "",
        gameid: "",
        partnerid: "",
        sid: "",
        money: "",
        paytype: "",
        clientip: "",
        orderno:"",
        other:"",     // 逻辑字段
        sign:0,        // 逻辑字段，需要转换成内部的元
        sandbox:""
    };
    if (req.body && req.body["orderno"]) {
        var body = req.body;
        _assignData(orderData, body);
    } else {  
        _assignData(orderData, req.query);
    }
    sdkBiz.checkPay(orderData,function(err,data){
        if(err){
            logger.info("支付回调日志：失败！:%j req.body:%j",err,req.body);
            res.render("index", {"code": 2,
                                "data": {
                                    "result": "发货失败",
                                    "orderno": orderData.orderno
                                }
                    });
        }else{
            logger.info("支付回调日志：成功！");
            res.render("index", {"code": 1,
                                "data": {
                                    "result": "发货成功",
                                    "orderno": orderData.orderno
                                }
                    });
        }
    });
};

var _assignData = function(orderData, data){
    orderData.act = data["act"];
    orderData.account = data["account"];
    orderData.ts = data["ts"];
    orderData.gameid = data["gameid"];
    orderData.partnerid = data["partnerid"];
    orderData.sid = data["sid"];
    orderData.money = data["money"];
    orderData.paytype = data["paytype"];
    orderData.clientip = data["clientip"];
    orderData.orderno = data["orderno"];
    orderData.other = data["other"];          
    orderData.sandbox = data["sandbox"]; // 价格分 //* .01;     // 价格由分转换成元
    orderData.sign = data["sign"]; 
};