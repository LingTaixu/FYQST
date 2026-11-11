/**
 * Created by Sara on 2015/5/28.
 */

var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var coffersBiz = require("uw-coffers").coffersBiz;
var uwClient = require("uw-db").uwClient;
var ds = require("uw-ds").ds;
var c_prop = uwData.c_prop;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var g_coffers = require("uw-global").g_coffers;
var proto = module.exports;

/**
 * 掠夺守卫门
 * @iface lootDefense
 * @args {attackData:"[攻击玩家id,攻击玩家名，服务器id,服务器名称,是否胜利]",door:"攻击哪个门"}
 * @param args
 * @param session
 * @param next
 * @returns [状态，个人资源，国库资源]
 */
proto.a = function (args, session, next) {
    var argsKeys = iface.admin_coffers_lootDefense_args ;
    var attackData = args[argsKeys.attackData];
    var attackUserId = attackData[0];
    var attackUserName = attackData[1];
    var attackServerId = attackData[2];
    var attackServerName = attackData[3];
    var isWin = attackData[4];
    var door = args[argsKeys.door];
    coffersBiz.lootDefense(uwClient,attackUserId,attackUserName,attackServerId,attackServerName,isWin,door,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data));
    });
};

/**
 * 掠夺国库
 * @iface lootCoffersDefense
 * @args {hurt:"伤害",breakNum:"攻破门数"}
 * @param args
 * @param session
 * @param next
 * @returns [状态，个人资源，国库资源]
 */
proto.a1 = function (args, session, next) {
    var argsKeys = iface.admin_coffers_lootCoffersDefense_args ;
    var hurt = args[argsKeys.hurt];
    var breakNum = args[argsKeys.breakNum];
    coffersBiz.lootCoffersDefense(uwClient,hurt,breakNum,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data));
    });
};

/**
 * 获取缓存信息
 * @iface getCache
 * @args
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.b = function (args, session, next) {
    var data = g_coffers.getCoffers();
    next(null,wrapResult(null,data));
};

/**
 * 重置积分累计积分
 * @iface resetPoints
 * @args
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.c = function (args, session, next) {
    coffersBiz.resetPoints(uwClient,function(err,data){
        if(err) return next(null,wrapResult(err));
        var data = g_coffers.getCoffers();
        next(null,wrapResult(null,data));
    });
};

/**
 * 更新缓存
 * @iface updateCache
 * @args {data:"[[key,value],[key,value]]"}
 * @param args
 * @param session
 * @param next
 * @returns
 */
proto.d = function (args, session, next) {
    var argsKeys = iface.admin_coffers_updateCache_args ;
    var data = args[argsKeys.data]||[];
    var updateData = {};
    var g_coffersData = g_coffers.getCoffers();
    for(var i = 0;i<data.length;i++){
        var locData = data[i];
        var locKey = locData[0];
        var locValue = locData[1];
        if(g_coffersData.hasOwnProperty(locKey)){
            updateData[locKey] = locValue;
        }
    }
    g_coffers.setCoffers(updateData);
    var g_coffersData = g_coffers.getCoffers();
    next(null,wrapResult(null,g_coffersData));
};