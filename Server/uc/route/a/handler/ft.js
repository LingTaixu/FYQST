/**
 * Created by Administrator on 2015/12/16.
 */

var newFourDaysBiz = require("uw-fiveDaysTarget").newFourDaysBiz;
var fiveDaysTargetBiz = require("uw-fiveDaysTarget").fiveDaysTargetBiz;
var sevenDaysTargetBiz = require("uw-fiveDaysTarget").sevenDaysTargetBiz;
var uwData = require("uw-data");
var consts = uwData.consts;
var client = require("uw-db").uwClient;
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var dsNameConsts = uwData.dsNameConsts;
var proto = module.exports;
/**
 * 五日目标请求
 * @iface getInfo
 * @args
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns [ds.FiveDaysTaret]
 */
proto.e = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    fiveDaysTargetBiz.getInfo(client,userId,function(err,data){
        if(err) return next(null, wrapResult(err));
        next(null, wrapResult(null,data,dsNameConsts.FiveDaysTaret));
    });
};

/**
 * 新四日目标请求
 * @iface getInfo1
 * @args
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns [ds.FiveDaysTaret]
 */
proto.a = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    newFourDaysBiz.getInfo(client,userId,function(err,data){
        if(err) return next(null, wrapResult(err));
        next(null, wrapResult(null,data,dsNameConsts.FiveDaysTaret));
    });
};

/**
 * 七日目标请求
 * @iface getInfo2
 * @args
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns [ds.FiveDaysTaret]
 */
proto.b = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    sevenDaysTargetBiz.getInfo(client,userId,function(err,data){
        if(err) return next(null, wrapResult(err));
        next(null, wrapResult(null,data,dsNameConsts.FiveDaysTaret));
    });
};
