/**
 * Created by Sara on 2016/1/5.
 */
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var c_prop = uwData.c_prop;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var ds = require("uw-ds").ds;
var uwClient = require("uw-db").uwClient;
var redEnvelopeBiz = require("uw-red-envelope").redEnvelopeBiz;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var taskBiz = require("uw-task").taskBiz;

var proto = module.exports;

/**
 * 获取红包列表
 * @iface getList
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.a = function (args, session, next) {
     return next(null, null);
    var userId = session.get(consts.session.userId);
    //接口调用
    redEnvelopeBiz.getList(uwClient,userId,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.RedEnvelopeEntity));
    });
};

/**
 * 发送红包
 * @iface sendRedEnvelope
 * @args {type:"红包类型",spItemId:"红包物品",amount:"红包金额",personNum:"红包领取份数",wish:"祝福文本"}
 * @param args
 * @param session
 * @param next
 */
proto.b = function (args, session, next) {
    return next(null, null);
    var argsKeys = iface.a_redEnvelope_sendRedEnvelope_args;
    var userId = session.get(consts.session.userId); 
    var type = args[argsKeys.type];
    var spItemId = args[argsKeys.spItemId];
    var amount = args[argsKeys.amount];
    var personNum = args[argsKeys.personNum];
    var wish = args[argsKeys.wish];
    //接口调用
    redEnvelopeBiz.sendRedEnvelope(uwClient,userId, type,spItemId,amount,personNum,wish,"",0,0,function(err,data){
        if (err) return next(null,wrapResult(err));
        var costDiamond = data[2];
        // if(spItemId == c_prop.spItemIdKey.diamond && costDiamond>0){
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.redEnvelope,costDiamond, cb1);
        //     // });
        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(uwClient,userId,taskOpt,function() {}); 
        // }
        var exData = new ds.ExRedEnvelopeData();
        exData.redEnvelopeData = data[0];
        exData.userData = data[1];
        if(data[3]) exData.redEnvelopePersonalData = data[3];
        next(null,wrapResult(null,exData,dsNameConsts.ExRedEnvelopeData));
    });
};

/**
 * 同步红包
 * @iface syncRedEnvelope
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.c = function (args, session, next) {
     return next(null, null);
    var userId = session.get(consts.session.userId); 
    //接口调用
    redEnvelopeBiz.syncRedEnvelope(uwClient,userId,function(err,data){
        if(err) return next(null,wrapResult(err));
        var setDiamond = data[0];
        // if(setDiamond>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setDiamondRecord(uwClient,userId,c_prop.diamondGetTypeKey.mail,setDiamond, cb1);
        //     });
        // }
        next(null,wrapResult(null,setDiamond));
    });
};

/**
 * 获取最新的红包记录
 * @iface getNewList
 * @args {lastId:"最后一条的唯一id"}
 * @param args
 * @param session
 * @param next
 * @returns
 */
proto.d = function (args, session, next) {
     return next(null, null);
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_redEnvelope_getNewList_args ;
    var lastId = args[argsKeys.lastId];
    redEnvelopeBiz.getNewList(uwClient,userId,lastId,function(err,dataList){
        if(err) return next(null,wrapResult(err));
        var exData = new ds.ExRedEnvelopeData();
        exData.redEnvelopeData = dataList[0];
        exData.nameObj = dataList[1];
        next(null,wrapResult(null,exData,dsNameConsts.ExRedEnvelopeData));
    });
};

/**
 * 抢红包
 * @iface receiveBonus
 * @args {redEnvelopeId:"红包id"}
 * @param args
 * @param session
 * @param next
 */
proto.e = function (args, session, next) {
     return next(null, null);
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_redEnvelope_receiveBonus_args ;
    var redEnvelopeId = args[argsKeys.redEnvelopeId]; 
    //接口调用
    redEnvelopeBiz.receiveBonus(uwClient,userId,redEnvelopeId,function(err,data){
        if(err) return next(null,wrapResult(err));
        var setDiamond = data[1];
        var isDiamond = data[5];
        // if(setDiamond>0 && isDiamond){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setDiamondRecord(uwClient,userId,c_prop.diamondGetTypeKey.redEnvelope,setDiamond, cb1);
        //     });
        // }
        var isGet = data[0];
        var exRedEnvelopeData = new ds.ExRedEnvelopeData();
        exRedEnvelopeData.isGet = isGet;
        if(isGet){
            exRedEnvelopeData.userData = data[2];
            exRedEnvelopeData.redEnvelopeData = data[4];
            exRedEnvelopeData.redEnvelopePersonalData = data[3];
        }
        next(null,wrapResult(null,exRedEnvelopeData,dsNameConsts.ExRedEnvelopeData));
    });
};
