/**
 * Created by oldma on 14-9-26.
 * 邮件
 */

var uwClient = require("uw-db").uwClient;
var uwData = require("uw-data");

var iface = uwData.iface;
var consts = uwData.consts;
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var mailBiz = require('uw-mail').mailBiz;
var mailDao = require('uw-mail').mailDao;
var client = require("uw-db").uwClient;
var ds = require("uw-ds").ds;
var async = require('async');
var propUtils = require('uw-utils').propUtils;
var dsNameConsts = uwData.dsNameConsts;
var c_prop = uwData.c_prop;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;

var proto = module.exports;


/**
 * 获取邮件列表
 * @iface getList
 * @args
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns MailEntity
 */
proto.a = function(args, session, next){
    var userId = session.get(consts.session.userId);
    mailBiz.getList(client,userId,function(err,mailList){
        if (err) return next(null,wrapResult(err));
        next(null, wrapResult(null,mailList,dsNameConsts.MailEntity));
    });
};

/**
 * 提取邮件物品
 * @iface pickItems
 * @args {mailId:"邮件id"}
 * @param args
 * @param session
 * @param next
 * @return ds.ExUserData
 */
proto.b = function(args, session, next){
    var argsKeys = iface.a_mail_pickItems_args;
    var mailId = args[argsKeys.mailId];
    var userId = session.get(consts.session.userId); 
    mailBiz.pickItems(client,userId,mailId,function(err,data){
        if (err) return next(null,wrapResult(err));
        var ex = new ds.ExUserData();
        ex.userData = data[0];
        ex.gold = data[1];
        ex.items = data[3];
        ex.bagItems = data[4];
        ex.equipBagItems = data[5];
        ex.isMail = data[6];
        ex.isFull = data[7]; 
        // var getDiamond = data[2];
        // if(getDiamond>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setDiamondRecord(uwClient,userId,c_prop.diamondGetTypeKey.mail,getDiamond, cb1);
        //     });
        // }
        next(null,wrapResult(null,ex,dsNameConsts.ExUserData));
    });
};

/**
 * 一键领取
 * @iface pickAllItems
 * @args
 * @param args
 * @param session
 * @param next
 * @return ds.ExUserData
 */
proto.d = function(args, session, next){
    var argsKeys = iface.a_mail_pickItems_args;
    var userId = session.get(consts.session.userId); 
    mailBiz.pickAllItems(client,userId,function(err,data){
        if (err) return next(null,wrapResult(err));
        var ex = new ds.ExUserData();
        ex.userData = data[0];
        ex.gold = data[1];
        ex.pickAllItemsArr = data[3];
        ex.pickAllItemsList = data[4];
        ex.bagItems = data[5];
        ex.equipBagItems = data[6];
        ex.isMail = data[7];
        ex.isFull = data[8]; 
        // var getDiamond = data[2];
        // if(getDiamond>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setDiamondRecord(uwClient,userId,c_prop.diamondGetTypeKey.mail,getDiamond, cb1);
        //     });
        // }
        next(null,wrapResult(null,ex,dsNameConsts.ExUserData));
    });
};

/**
 * 设置阅读邮件
 * @iface setRead
 * @args {mailId:"邮件id"}
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 */
proto.c = function(args, session, next){
    var argsKeys = iface.a_mail_setRead_args;
    var mailId = args[argsKeys.mailId];
    var userId = session.get(consts.session.userId);
    mailBiz.setRead(client,userId,mailId,function(err,data){
        if (err) return next(null,wrapResult(err));
        next(null,wrapResult(null));
    });
};


/**
 * 获取是否存在需要阅读或者提取物品的邮件
 * @iface getIsNeedOperate
 * @args {mailId:"邮件id"}
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns 1|0
 */
proto.e = function(args, session, next){
    var userId = session.get(consts.session.userId);
    mailBiz.getIsNeedOperate(client, userId, function (err, data) {
        if (err) return next(null,wrapResult(err));
        console.log("mailmail:", data);
        next(null,wrapResult(null,data));
    });
};



