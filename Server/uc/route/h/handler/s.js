var pomelo = require("pomelo");
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var uwData = require("uw-data");
var mainClient = require("uw-db").mainClient;
var loginClient = require("uw-db").loginClient;
var c_msgCode = uwData.c_msgCode;
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var ds = require("uw-ds").ds;

var serverInfoDao = require("uw-server-info").serverInfoDao;
var serverInfoBiz = require("uw-server-info").serverInfoBiz;
var channelConfigBiz = require("uw-channel-config").channelConfigBiz;
var propUtils = require('uw-utils').propUtils;
var proto = module.exports;

/**
 * 获取所有服务器列表
 * @iface getServerList
 * @args {isTest:"是否测试"}
 * @param args
 * @param session
 * @param next
 * @returns [ServerInfoEntity..]
 */
proto.a = function(args, session, next){
    var argsKeys = iface.h_serverInfo_getServerList_args;
    var isTest = args[argsKeys.isTest];

    serverInfoBiz.getList(mainClient, isTest, function(err,serverList){
        if(err) return next(err);
        for (var i = 0; i < serverList.length; i++) {
            var server = serverList[i];
            propUtils.delProp(server, ["dbLink"]);
            propUtils.delProp(server, ["host2"]); 
        } 
        next(null, wrapResult(null,serverList,dsNameConsts.ServerInfoEntity));
    });
};


/**
 * 获取服务器实例数据
 * @iface getServerInfo
 * @args {id:"服务器id"}
 * @param args
 * @param session
 * @param next
 * @returns ServerInfoEntity
 */
proto.c = function(args, session, next){
    var argsKeys = iface.h_serverInfo_getServerInfo_args;
    var id = args[argsKeys.id];
    serverInfoDao.select(loginClient,{id:id},function(err,data){
        if(err) return next(err);
        data = propUtils.delProp(data, ["dbLink"]);
        next(null, wrapResult(null,data,dsNameConsts.ServerInfoEntity));
    });
};

/**
 * 获取服务器当前时间
 * @iface getServerDate
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.e = function(args, session, next){
    next(null, wrapResult(null, Date.now()));
};

/**
 * 获取拥有角色的服务器
 * @iface getUserServers
 * @args {accountId:"账号id"}
 * @param args
 * @param session
 * @param next
 * @returns [ServerInfoEntity..]
 */
proto.f = function(args, session, next){
    var argsKeys = iface.h_serverInfo_getUserServers_args;
    var accountId = args[argsKeys.accountId];
    serverInfoBiz.getUserServers(mainClient,accountId,function(err,serverList){
        if(err) return next(err);
        for (var i = 0; i < serverList.length; i++) {
            var server = serverList[i];
            propUtils.delProp(server, ["dbLink"]);
            propUtils.delProp(server, ["host2"]); 
        }
        next(null, wrapResult(null,serverList,dsNameConsts.ServerInfoEntity));
    });
};

/**
 * 获取账户服务器信息
 * @iface getaccountServers
 * @args {openId:"openId",appId:"wanba",isTest:"1"}
 * @param args
 * @param session
 * @param next
 * @returns [ds.AccountServer]
 */
proto.g = function(args, session, next){
    var argKeys = iface.h_serverInfo_getaccountServers_args;
    var openId = args[argKeys.openId];
    var appId = args[argKeys.appId];
    var isTest = args[argKeys.isTest];
    serverInfoBiz.getAccountServers(mainClient, openId, appId,isTest, function(err,data){
        if(err) return next(err);
        var accountArr = new ds.AccountServer();
        accountArr.myServerArr = data[0];
        accountArr.serverArr = data[1];
        accountArr.lastServer = data[2];
        next(null, wrapResult(null,accountArr,dsNameConsts.AccountServer));
    });
};

/**
 * 获取BI渠道配置表
 * @iface getChannelConfig
 * @args 
 * @param args
 * @param session
 * @param next
 * @returns [ds.AccountServer]
 */
proto.h0 = function(args, session, next){ 
    channelConfigBiz.getList(mainClient, function(err,data){
        if(err) return next(err);
        next(null, data);
    });
};

