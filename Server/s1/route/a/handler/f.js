/**
 * Created by Sara on 2015/9/10.
 */

var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var c_prop = uwData.c_prop;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var friendBiz = require("uw-friend").friendBiz;
var ds = require("uw-ds").ds;
var uwClient = require("uw-db").uwClient;

var proto = module.exports;

/**
 * 获取用户好友信息
 * @iface getInfo
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.a = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    friendBiz.getInfo(uwClient,userId,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.ExUserData));
    });
};

/**
 * 请求添加好友
 * @iface requestFriend
 * @args {requestedId:"被请求用户id"}
 * @param args
 * @param session
 * @param next
 */
proto.b = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_friend_requestFriend_args;
    var requestedId = args[argsKeys.requestedId];
    //接口调用
    friendBiz.requestFriend(uwClient,userId,requestedId,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.FriendEntity));
    });
};

/**
 * 处理好友请求
 * @iface disposeFriendRequest
 * @args {requestId:"请求用户id",isTake:"是否接受请求  0：不接受  1：接受"}
 * @param args
 * @param session
 * @param next
 */
proto.c = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_friend_disposeFriendRequest_args;
    var requestId = args[argsKeys.requestId];
    var isTake = args[argsKeys.isTake];
    //接口调用
    friendBiz.disposeFriendRequest(uwClient,userId,requestId,isTake,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.FriendEntity));
    });
};

/**
 * 随机获取助阵好友/陌生人
 * @iface eventCheer
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.d = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    friendBiz.eventCheer(uwClient,userId,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.ExUserData));
    });
};

/**
 * 获取请求列表
 * @iface getRequestInfo
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.e = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    friendBiz.getRequestInfo(uwClient,userId,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.ExUserData));
    });
};
