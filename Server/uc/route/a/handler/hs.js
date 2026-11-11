/**
 * Created by Sara on 2016/1/13.
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
var heartStuntBiz = require("uw-heart-stunt").heartStuntBiz;
var starSoulBiz = require("uw-heart-stunt").starSoulBiz;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var taskBiz = require("uw-task").taskBiz;

var proto = module.exports;

/**
 * 获取心法神功数据
 * @iface getInfo
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.a = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    heartStuntBiz.getInfo(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.HeartStuntEntity));
    });
};

/**
 * 选择心法
 * @iface choMenCulMethods
 * @args  {index:"槽位下标",heartStuntId:"选择心法id"}
 * @param args
 * @param session
 * @param next
 */
proto.b = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_heartStunt_choMenCulMethods_args;
    var index = args[argsKeys.index];
    var heartStuntId = args[argsKeys.heartStuntId];
    //接口调用
    heartStuntBiz.choMenCulMethods(uwClient, userId, index, heartStuntId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var exHeartStuntData = new ds.ExHeartStuntData();
        exHeartStuntData.heartStuntData = data[1];
        exHeartStuntData.userData = data[0];
        next(null, wrapResult(null, exHeartStuntData, dsNameConsts.ExHeartStuntData));
    });
};

/**
 * 心法加点
 * @iface stuMenCulMethods
 * @args  {index:"槽位下标"}
 * @param args
 * @param session
 * @param next
 */
proto.c = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_heartStunt_stuMenCulMethods_args;
    var index = args[argsKeys.index];
    //接口调用
    heartStuntBiz.stuMenCulMethods(uwClient, userId, index, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var costGold = data[4];
        // gameRecordSerial.add(userId,function(cb1) {
        //     gameRecordBiz.setCostGoldRecord(uwClient, userId, c_prop.goldCostTypeKey.stuMenCulMethods, costGold, cb1);
        // });
        var exHeartStuntData = new ds.ExHeartStuntData();
        exHeartStuntData.heartStuntData = data[1];
        exHeartStuntData.userData = data[0];
        exHeartStuntData.isSucceed = data[2];
        exHeartStuntData.genuineQiArr = data[3];
        next(null, wrapResult(null, exHeartStuntData, dsNameConsts.ExHeartStuntData));
        taskBiz.setTaskValue(uwClient, userId, c_prop.cTaskTypeKey.heartStunt, 1, function() {});
    });
};

/**
 *更换心法
 * @iface chaMenCulMethods
 * @args  {index:"槽位下标",heartStuntId:"选择心法id"}
 * @param args
 * @param session
 * @param next
 */
proto.d = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_heartStunt_chaMenCulMethods_args;
    var index = args[argsKeys.index];
    var heartStuntId = args[argsKeys.heartStuntId];
    //接口调用
    heartStuntBiz.chaMenCulMethods(uwClient, userId, index, heartStuntId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var costDiamond = data[2];
        // if(costDiamond>0){
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.chaMenCulMethods,costDiamond, cb1);
        //     // });
        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(uwClient,userId,taskOpt,function() {}); 
        // }
        var exHeartStuntData = new ds.ExHeartStuntData();
        exHeartStuntData.heartStuntData = data[1];
        exHeartStuntData.userData = data[0];
        next(null, wrapResult(null, exHeartStuntData, dsNameConsts.ExHeartStuntData));
    });
};



/**
 * 激活星盘(初始化数据)
 *@iface activateStarPlate
 * @args {index:"契约槽位下标"}
 * @param args
 * @param session
 * @param next
 */
proto.e = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_heartStunt_activateStarPlate_args;
    var index = args[argsKeys.index];
    //接口调用
    starSoulBiz.activateStarPlate(uwClient, userId, index, function(err, userData) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, userData, dsNameConsts.UserEntity));
    });
};

/**
 * 解锁星盘槽位
 *@iface openSlot
 * @args {index:"契约槽位下标",slotIndex:"星盘位置下标"}
 * @param args
 * @param session
 * @param next
 */
proto.f = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_heartStunt_openSlot_args;
    var index = args[argsKeys.index];
    var slotIndex = args[argsKeys.slotIndex];

    //接口调用
    starSoulBiz.openSlot(uwClient, userId, index, slotIndex, function(err, userData) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, userData, dsNameConsts.UserEntity));
    });
};

/**
 * 穿戴星魂
 *@iface wearStarSoul
 * @args {index:"契约槽位下标",slotIndex:"星盘位置下标",starSoulId:"要穿的星魂ID"}
 * @param args
 * @param session
 * @param next
 */
proto.g = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_heartStunt_wearStarSoul_args;
    var index = args[argsKeys.index];
    var slotIndex = args[argsKeys.slotIndex];
    var starSoulId = args[argsKeys.starSoulId];

    //接口调用
    starSoulBiz.wearStarSoul(uwClient, userId, index, slotIndex, starSoulId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var exUserData = new ds.ExUserData();
        exUserData.userData = data[0];
        exUserData.bagItems = data[1];
        exUserData.delBagItems = data[2];
        next(null, wrapResult(null, exUserData, dsNameConsts.ExUserData));
    });
};

/**
 * 脱下星魂
 *@iface takeOffStarSoul
 * @args {index:"契约槽位下标",slotIndex:"星盘位置下标"}
 * @param args
 * @param session
 * @param next
 */
proto.h = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_heartStunt_takeOffStarSoul_args;
    var index = args[argsKeys.index];
    var slotIndex = args[argsKeys.slotIndex];
    //接口调用
    starSoulBiz.takeOffStarSoul(uwClient, userId, index, slotIndex, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var exUserData = new ds.ExUserData();
        exUserData.userData = data[0];
        exUserData.bagItems = data[1];
        next(null, wrapResult(null, exUserData, dsNameConsts.ExUserData));
    });
};

/**
 * 升级星魂
 *@iface levelUpStarSoul
 * @args {starSoulId:"要升到的星魂ID"}
 * @param args
 * @param session
 * @param next
 */
proto.i = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_heartStunt_levelUpStarSoul_args;
    var starSoulId = args[argsKeys.starSoulId];
    //接口调用
    starSoulBiz.levelUpStarSoul(uwClient, userId, starSoulId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var exUserData = new ds.ExUserData();
        exUserData.bagItems = data[0];
        exUserData.delBagItems = data[1];
        next(null, wrapResult(null, exUserData, dsNameConsts.ExUserData));
    });
};