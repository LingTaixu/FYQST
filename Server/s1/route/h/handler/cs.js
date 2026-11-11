/**
 * Created by marco on 15/11/20.
 */
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var uwData = require("uw-data");
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var kefuClient = require("uw-db").mainClient;
var kefuBiz = require("uw-chat").kefuBiz;
var proto = module.exports;
var accountDao = require("uw-account").accountDao;
var mainClient = require("uw-db").mainClient;
var loginClient = require("uw-db").loginClient;
var getMsg = require("uw-utils").msgFunc(__filename);
var c_msgCode = uwData.c_msgCode;

/**
 * 获取最新客服系统聊天记录
 * @iface getList
 * @args {lastId:"最后一条的唯一id",openId:"openId"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ChatData
 */
proto.hda = function(args, session, next){
    var argsKeys = iface.h_kefu_getList_args;
    var lastId = args[argsKeys.lastId] || 0;
    var openId = args[argsKeys.openId];
    var userId = session.get(consts.session.userId);
    kefuBiz.getList(kefuClient,userId,openId,lastId,function(err, data){
        if(err) return next(null, wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.ChatData));
    });
};

/**
 * 发送客服聊天记录聊天
 * @iface sendData
 * @args {lastId:"最后一条的唯一id",content:"聊天内容",openId:"openId",nickname:"nickname",vipLevel:"vip_level"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ChatData
 */
proto.hdb = function(args, session, next){
    var argsKeys = iface.h_kefu_sendData_args;
    var lastId = args[argsKeys.lastId] || 0;
    var content = args[argsKeys.content];
    var openId = args[argsKeys.openId];
    var nickname = args[argsKeys.nickname];
    var vipLevel = args[argsKeys.vipLevel];
    var userId = session.get(consts.session.userId);
    var accountId = session.get(consts.session.accountId);
    //检查是否禁言
    accountDao.selectCols(loginClient,"bendExpireAt, bendType",{id:accountId},function(err,accountData){
        if(err) return next(null,wrapResult(err));
        var expireAt = Date.parse(accountData.bendExpireAt);
        if(expireAt && expireAt > Date.now() && (accountData.bendType & 2)){
            return next(null,wrapResult(getMsg(c_msgCode.wordBeBend)));
        }
        kefuBiz.addData(kefuClient, lastId, content, openId, userId, nickname, vipLevel, function(err, data) {
            if(err) return next(null, wrapResult(err));
            next(null,wrapResult(null,data,dsNameConsts.ChatData));
        })
    });
};

