/**
 *  跨服boss
 */

var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var commonUtils = require('uw-utils').commonUtils; 
var uwData = require("uw-data");
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface; 
var mainClient = require("uw-db").mainClient;
var battlesGroupBiz =require("uw-battles-group").battlesGroupBiz;
var ds = require("uw-ds").ds;
var c_prop = uwData.c_prop;   
var proto = module.exports;

/**
 * 获取跨服boss的服务器地址
 * @iface getCSBossServer
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.BossEntity
 */
proto.a = function (args, session, next) {
    //接口调用
    battlesGroupBiz.getCSBossServer(mainClient, function(err,data){
        if(err) return next(null,wrapResult(err));
        propUtils.delProp(data,["serverArr","name","type"]);
        next(null, wrapResult(null, data, dsNameConsts.BattlesGroupEntity));
    });
};

