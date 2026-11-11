/**
 * Created by Sara on 2015/5/28.
 */

var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var couponBiz = require("uw-coupon").couponBiz;
var uwClient = require("uw-db").uwClient;
var ds = require("uw-ds").ds;
var c_prop = uwData.c_prop;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;

var proto = module.exports;

/**
 * 使用兑换码
 * @iface use
 * @args {code:"兑换码"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.a = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var accountId = session.get(consts.session.accountId);
    var argsKeys = iface.a_coupon_use_args ;
    var code = args[argsKeys.code]; 
    //接口调用
    couponBiz.use(uwClient,userId ,accountId, code ,function(err,data){
        if(err) return next(null,wrapResult(err));
        var ex = new ds.ExUserData();
        ex.userData = data[0];
        ex.gold = data[1];
        // var getDiamond = data[2];
        // if(getDiamond>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setDiamondRecord(uwClient,userId,c_prop.diamondGetTypeKey.coupon,getDiamond, cb1);
        //     });
        // }
        next(null,wrapResult(null,ex,dsNameConsts.ExUserData));
    })
};
