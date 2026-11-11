/**
 * Created by Sara on 2015/5/28.
 */

var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var uwData = require("uw-data");
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var noticeBiz = require("uw-notice").noticeBiz;
var mainClient = require("uw-db").mainClient;

var proto = module.exports;

/**
 * 获取一条新的公告
 * @iface getNewOne
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.NoticeEntity
 */
proto.a = function (args, session, next) {
    //接口调用
    noticeBiz.getNewOne(mainClient,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.NoticeEntity));
    })
};

/**
 * 获取公告列表
 * @iface getList
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.NoticeEntity
 */
proto.b = function (args, session, next) {
    //接口调用
    noticeBiz.getList(mainClient,function(err,noticeList){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,noticeList,dsNameConsts.NoticeEntity));
    })
};
