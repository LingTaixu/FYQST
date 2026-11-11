/**
 * Created by Sara on 2015/5/28.
 */

var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;  
var ds = require("uw-ds").ds;
var c_prop = uwData.c_prop;
var g_copyLoot = require("uw-global").g_copyLoot;
 
var proto = module.exports;

/**
 * 获取掉落缓存
 * @iface getLootCache
 * @args
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns
 */
proto.a = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var data = g_copyLoot.getLootCache();
    next(null,wrapResult(null,data));
};

/**
 * 获取掉落缓存
 * @iface getGroupWarGroupDic
 * @args
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns
 */
proto.b = function (args, session, next) {
    var userId = session.get(consts.session.userId); 
};
