var async = require("async");
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var uwData = require("uw-data");
var c_msgCode = uwData.c_msgCode;
var c_prop = uwData.c_prop;
var mainClient = require("uw-db").mainClient;
var proto = module.exports;
var iface = uwData.iface;
var consts = uwData.consts;
var project = require("uw-config").project;
var ds = require("uw-ds").ds;
var dsNameConsts = uwData.dsNameConsts;
var getMsg = require("uw-utils").msgFunc(__filename);
var propUtils = require("uw-utils").propUtils;
var accountBiz = require("uw-account").accountBiz;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;

/**
 * 验证常规登录,成功返回null
 * @iface login
 * @args {name:"用户名",pwd:"密码",channelId:"渠道id"}
 * @param args
 * @param session
 * @param next
 */
proto.a = function (args, session, next) {
    var argsKeys = iface.h_account_login_args;
    var name = args[argsKeys.name];
    var password = args[argsKeys.pwd];
    var channelId = args[argsKeys.channelId];
    accountBiz.login(mainClient, name, password, channelId,function(err,data){
        if(err) return next(null, wrapResult(err));
        var accountData = data[0];
        var loginKey = data[1];
        propUtils.delProp(accountData,["pwd","loginKey"]);
        var exAccount = new ds.ExAccount();
        exAccount.account = accountData;
        exAccount.loginKey = loginKey;
        next(null,wrapResult(null,exAccount,dsNameConsts.ExAccount));
    });
};

/**
 * 验证sdk平台登陆,成功返回null
 * sdkData的数据说明：
 * egret: [token,login_type]
 * xiaomi: [uid,sessionId]
 * @iface loginBySdk
 * @args {channelId:"渠道号id",sdkData:"sdk的数据，是一个数组[]",deviceId:"机器码"}
 * @param args
 * @param session
 * @param next
 */
proto.a1 = function (args, session, next) {
    var argsKeys = iface.h_account_loginBySdk_args;
    var sdkData = args[argsKeys.sdkData];
    var deviceId = args[argsKeys.deviceId];
    var channelId = args[argsKeys.channelId];
    accountBiz.loginBySdk(mainClient, channelId, deviceId, sdkData,function(err,data){
        if(err) return next(null, wrapResult(err));

        var accountData = data[0];
        accountBiz.checkPayBySdk(mainClient, channelId, accountData.id, accountData.sdkData, function(){

            var loginKey = data[1];
            propUtils.delProp(accountData,["pwd","loginKey"]);
            var exAccount = new ds.ExAccount();
            exAccount.account = accountData;
            exAccount.loginKey = loginKey;
            next(null,wrapResult(null,exAccount,dsNameConsts.ExAccount));

        });
    })
};

/**
 * 注册账号
 * @iface register
 * @args {name:"账号",pwd:"密码", channelId:"渠道号id",deviceId:"机器码"}
 * @param args
 * @param session
 * @param next
 */
proto.c = function (args, session, next) {
    var argsKeys = iface.h_account_register_args;
    var name = args[argsKeys.name];
    var pwd = args[argsKeys.pwd];
    var deviceId = args[argsKeys.deviceId];
    var channelId = args[argsKeys.channelId];
    var ip = session.get(consts.session.ip);
    accountBiz.register(mainClient, name,pwd,channelId, deviceId, ip, function(err,data){
        if(err) return next(null, wrapResult(err));
        var accountData = data[0];
        var loginKey = data[1];
        propUtils.delProp(accountData,["pwd","loginKey"]);
        var exAccount = new ds.ExAccount();
        exAccount.account = accountData;
        exAccount.loginKey = loginKey;
        next(null,wrapResult(null,exAccount,dsNameConsts.ExAccount));
    })
};
