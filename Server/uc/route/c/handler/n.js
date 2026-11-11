/**
 * Created by Administrator on 2015/5/29.
 */
var sessionManager = require('uw-route').sessionManager;
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var uwData = require("uw-data");
var iface = uwData.iface;
var cryptCfg = require("uw-config").crypt;
var consts = uwData.consts;
var proto = module.exports;

/**
 * 链接
 * @iface connect
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.a = function (args, session, next) {
    var sess = sessionManager.createSession();
    if (session){
   		sess.set(consts.session.ip, session.get(consts.session.ip));	
        sess.set(consts.session.ua, session.get(consts.session.ua));
        sess.set(consts.session.serverId, session.get(consts.session.serverId));
    }  
    next(null,wrapResult(null,[sess.id,cryptCfg.cryptKey,Date.now()]));
};

/**
 * 断开链接
 * @iface disconnect
 * @args {sessionId:" sessionId"}
 * @param args
 * @param session
 * @param next
 */
proto.b = function (args, session, next) {
    var argsKeys = iface.c_net_disconnect_args;
    var sessionId = args[argsKeys.sessionId];
    sessionManager.destroySession(sessionId);
    next(null,wrapResult(null,null));
};

/**
 * 获取服务器当前时间
 * @iface getServerDate
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.c = function(args, session, next){
    next(null, wrapResult(null, Date.now()));
};


/**
 * 预加载
 * @iface preLoad
 * @args
 * @param args
 * @param session
 * @param next
 */
 proto.d = function(args, session, next){
    next(null, wrapResult(null, ['test','test']));
};