/**
 * Created by Sara on 2015/5/28.
 */

var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var sdkBiz = require("uw-sdk").sdkBiz;

var ds = require("uw-ds").ds;
var accountDao = require("uw-account").accountDao;
var mainClient = require("uw-db").mainClient;
var loginClient = require("uw-db").loginClient;
var proto = module.exports;

/**
 * 获取vip
 * @iface getVip
 * @args
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns ds.SdkVipData
 */
proto.a = function (args, session, next) {
    return next(null, null);
    var accountId = session.get(consts.session.accountId);
    accountDao.selectCols(loginClient,"channelId,name",{id:accountId},function(err,accountData){
        if(err) return next(null,wrapResult(err));
        var vipData = new ds.SdkVipData();
/*
        //todo 返回虚假数据
        vipData.isVip = 1;//是否vip 0:否，1：是
        vipData.vipLevel = 2;//vip等级
        vipData.score = 100;//积分（星星）数量
        return next(null,wrapResult(null,vipData,dsNameConsts.SdkVipData));
*/
        //接口调用
        sdkBiz.getVip(accountData.channelId,[accountData.name],function(err,data){
            if(err) return next(null,wrapResult(err));
            vipData.isVip = data.isVip;//是否vip 0:否，1：是
            vipData.vipLevel = data.vipLevel;//vip等级
            vipData.score = data.score;//积分（星星）数量
            next(null,wrapResult(null,vipData,dsNameConsts.SdkVipData));
        });
    });
};
