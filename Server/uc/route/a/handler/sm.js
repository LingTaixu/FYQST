/**
 * Created by Sara on 2015/9/22.
 */
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var c_prop = uwData.c_prop;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var userDao = require("uw-user").userDao;
var userBiz = require("uw-user").userBiz;
var smeltBiz = require("uw-smelt").smeltBiz;
var taskBiz = require("uw-task").taskBiz;
var ds = require("uw-ds").ds;
var uwClient = require("uw-db").uwClient;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;

var proto = module.exports;

/**
 * 装备熔炼
 * @iface smelt
 * @args {equipArr:"所要熔炼的装备id数组",choColor:"质量"}
 * @param args
 * @param session
 * @param next
 */
proto.a = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_smelt_smelt_args;
    var equipArr = args[argsKeys.equipArr];
    var choColor = args[argsKeys.choColor]; 
    //接口调用
    smeltBiz.smelt(uwClient,userId,equipArr,choColor,function(err,data){
        if(err) return next(null,wrapResult(err));
        var getDiamond = data[5];
        // if(getDiamond>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setDiamondRecord(uwClient,userId,c_prop.diamondGetTypeKey.smelt,getDiamond, cb1);
        //     });
        // }
        var smeltCount = equipArr.length;
        var exData = new ds.ExUserData();
        exData.userData = data[0];
        exData.gainArr = data[1];
        exData.bagItems = data[2];
        exData.equipBagItems = data[3];
        exData.delEquipBagArr = data[4];
        next(null,wrapResult(null,exData,dsNameConsts.ExUserData));

        taskBiz.setTaskValue(uwClient,userId,c_prop.cTaskTypeKey.equipSmelt,smeltCount,function(){});
        userBiz.setMedalValue(uwClient, userId, c_prop.medalLootTypeKey.equipSmelt, smeltCount, function(){});
    });
};

/**
 * 装备合成
 * @iface compound
 * @args {compoundId:"所要合成物品的Id",compoundNum:"所要合成物品的数量"}
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 */
proto.b = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_smelt_compound_args;
    var compoundId = args[argsKeys.compoundId];
    var compoundNum = args[argsKeys.compoundNum] || 1;
    if(isNaN(compoundNum) || parseInt(compoundNum) <=0) return next(null, wrapResult("ERROR: INVALID PARA"));
    //接口调用
    smeltBiz.compound(uwClient,userId,compoundId,compoundNum,function(err,data){
        if (err) return next(null,wrapResult(err));
        var exData = new ds.ExUserData();
        exData.bagItems = data[0];
        exData.delBagItems = data[1];
        next(null,wrapResult(null,exData,dsNameConsts.ExUserData));
    });
};

/**
 * 装备特戒
 * @iface wearParRing
 * @args {tempId:"英雄id",breakId:"所要装备特戒的Id"}
 * @param args
 * @param session
 * @param next
 */
proto.c = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_smelt_wearParRing_args;
    var tempId = args[argsKeys.tempId];
    var breakId = args[argsKeys.breakId];
    //接口调用
    smeltBiz.wearParRing(uwClient,userId,tempId,breakId,function(err,data){
        if(err) return next(null,wrapResult(err));
        var exData = new ds.ExUserData();
        exData.heroData = data[0];
        exData.delBagItems = data[1];
        next(null,wrapResult(null,exData,dsNameConsts.ExUserData));
    });
};

/**
 * 特戒突破
 * @iface ringBreak
 * @args {tempId:"英雄id",breakId:"所要装备特戒的Id"}
 * @param args
 * @param session
 * @param next
 */
proto.d = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_smelt_ringBreak_args;
    var tempId = args[argsKeys.tempId];
    var breakId = args[argsKeys.breakId];
    //接口调用
    smeltBiz.ringBreak(uwClient,userId,tempId,breakId,function(err,data){
        if(err) return next(null,wrapResult(err));
        var exData = new ds.ExUserData();
        exData.heroData = data[0];
        exData.delBagItems = data[1];
        next(null,wrapResult(null,exData,dsNameConsts.ExUserData));
    });
};