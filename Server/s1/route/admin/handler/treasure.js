/**
 * Created by John on 2016/5/3.
 */
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var uwClient = require("uw-db").uwClient;
var ds = require("uw-ds").ds;
var c_prop = uwData.c_prop;
var g_incognito = require("uw-global").g_incognito;
var treasureBiz = require("uw-treasure").treasureBiz;
var proto = module.exports;

/**
 * 获取缓存信息
 * @iface getTreasureCash
 * @args
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.a = function (args, session, next) {
    var g_TreasureData = g_incognito.getTreasureCash();
    next(null,wrapResult(null,g_TreasureData));
};

/**
 * 获取玩家秘宝信息
 * @iface getTreasureByUserId
 * @args
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.b = function (args, session, next) {
    var treasureList = g_incognito.getTreasureListByUserId();
    next(null,wrapResult(null,treasureList));
};

/**
 *
 * @iface setTreasureByUserId
 * @args {userId:"123"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.c = function (args, session, next) {
    var argsKeys = iface.a_activity_buyMysterShop_args;
    var userId = args[argsKeys.userId];
    treasureBiz.check(uwClient, userId, function(err, num){
        if(err) return next(null, wrapResult(err));
        next(null,wrapResult(null,num));
    });
};