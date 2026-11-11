/**
 * Created by Sara on 2015/5/28.
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
var g_boss = require("uw-global").g_boss;
var proto = module.exports;


/**
 * 获取boss缓存信息
 * @iface getBossData
 * @args {bossId:"bossId"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.a = function (args, session, next) {
    var argsKeys = iface.admin_boss_getBossData_args ;
    var bossId = args[argsKeys.bossId]||0;
    var data = g_boss.getBossObj(bossId).getBossData();
    next(null,wrapResult(null,data));
};

/**
 * 获取用户缓存信息
 * @iface getUserCache
 * @args {bossId:"bossId"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.a1 = function (args, session, next) {
    var argsKeys = iface.admin_boss_getUserCache_args ;
    var bossId = args[argsKeys.bossId]||0;
    var data = g_boss.getBossObj(bossId).getAllUserData();
    next(null,wrapResult(null,data));
};


/**
 * 获取某个用户数据
 * @iface getGuildById
 * @args {id:"id"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.a2 = function (args, session, next) {
    var argsKeys = iface.admin_guild_getGuildById_args ;
    var id = args[argsKeys.id]||0;
    var g_userData = g_boss.getUserData(id);
    next(null,wrapResult(null,g_userData));
};

/**
 * 更新boss缓存
 * @iface updateBossCache
 * @args {data:"[[key,value],[key,value]]"}
 * @param args
 * @param session
 * @param next
 * @returns
 */
proto.b = function (args, session, next) {
    var argsKeys = iface.admin_boss_updateBossCache_args ;
    var data = args[argsKeys.data]||[];
    var g_bossData = g_boss.getBossData();
    for(var i = 0;i<data.length;i++){
        var locData = data[i];
        var locKey = locData[0];
        var locValue = locData[1];
        if(g_bossData.hasOwnProperty(locKey)){
            g_bossData[locKey] = locValue;
        }
    }
    next(null,wrapResult(null,g_bossData));
};

/**
 * 更新某个用户数据
 * @iface updateUserCache
 * @args {id:"id",data:"[[key,value],[key,value]]"}
 * @param args
 * @param session
 * @param next
 * @returns
 */
proto.c = function (args, session, next) {
    var argsKeys = iface.admin_guild_updateCache_args ;
    var id = args[argsKeys.id]||0;
    if(!id) return  next(null,wrapResult(null,null));
    var data = args[argsKeys.data]||[];

    var g_userData = g_boss.getUserData(id);
    for(var i = 0;i<data.length;i++){
        var locData = data[i];
        var locKey = locData[0];
        var locValue = locData[1];
        if(g_userData.hasOwnProperty(locKey)){
            g_userData[locKey] = locValue;
        }
    }
    g_boss.setUserData(id,g_userData);

    next(null,wrapResult(null,g_userData));
};