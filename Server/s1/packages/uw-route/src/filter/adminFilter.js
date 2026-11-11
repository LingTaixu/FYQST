/**
 * Created by Administrator on 2015/5/23.
 */

var uwData = require("uw-data");
var c_msgCode = uwData.c_msgCode;
var consts = uwData.consts;
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var cryptCfg = require("uw-config").crypt;

module.exports = function(option){
    var routeList = option.routeList||[];

    return function(req, res, next){
        var arrRoute = req.uwRoute.route.split(".");
        if(routeList.indexOf(arrRoute[0])==-1) return next(null);

        //没登陆
        if(req.uwRoute.adminKey!=cryptCfg.adminKey){
            res.send(wrapResult("秘钥错误!"));
            return ;
        }
        next(null);
    }
};