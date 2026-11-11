/**
 * Created by Sara on 2015/5/28.
 */

var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var crystalBiz = require("uw-crystal").crystalBiz;
var crystalDao = require("uw-crystal").crystalDao;
var uwClient = require("uw-db").uwClient;
var ds = require("uw-ds").ds;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var c_prop = uwData.c_prop;
var proto = module.exports;

/**
 * 获取数据
 * @iface getInfo
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.ExCrystalData
 */
proto.a = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    crystalBiz.getCrystalData(uwClient, userId ,function(err,crystalData){
        if(err) return next(null,wrapResult(err));
        crystalBiz.getBeyondPer(uwClient,crystalData.crystalId,function(err,beyondPer){
            if(err) return next(null,wrapResult(err));
            var exCrystalData = new ds.ExCrystalData();
            exCrystalData.crystalData = crystalData;
            exCrystalData.beyondPer = beyondPer;
            next(null,wrapResult(null,exCrystalData,dsNameConsts.ExCrystalData));
        });

    })
};


/**
 * 保存数据
 * @iface saveProgress
 * @args {hp:"剩余血量",hpNum:"剩余血量条",nextReplayTime:"下一次回满时间"}
 * @param args
 * @param session
 * @param next
 */
proto.b = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_crystal_saveProgress_args ;
    var hp = args[argsKeys.hp];
    var hpNum = args[argsKeys.hpNum];
    var nextReplayTime = args[argsKeys.nextReplayTime];
    if(nextReplayTime) nextReplayTime = new Date(nextReplayTime);
    //接口调用
    crystalBiz.saveProgress(uwClient, userId,hp,hpNum,nextReplayTime ,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null));
    })
};

/**
 * 完成某个关卡
 * @iface finish
 * @args {crystalId:"当前id"}
 * @param args
 * @param session
 * @param next
 * @returns ds.CrystalEntity
 */
proto.c = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_crystal_finish_args;
    var crystalId = args[argsKeys.crystalId];
    //接口调用
    crystalBiz.finish(uwClient, userId,crystalId,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.CrystalEntity));
    })
};

/**
 * 领取奖励
 * @iface pickAward
 * @args {crystalId:"当前id"}
 * @param args
 * @param session
 * @param next
 * @returns ds.UserEntity
 */
proto.d = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_crystal_pickAward_args;
    var crystalId = args[argsKeys.crystalId];
    //接口调用
    crystalBiz.pickAward(uwClient, userId,crystalId,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.UserEntity));
    })
};

/**
 * 使用技能
 * @iface useSkill
 * @args {index:"技能下标"}
 * @param args
 * @param session
 * @param next
 * @returns ds.CrystalEntity
 */
proto.e = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_crystal_useSkill_args;
    var index = args[argsKeys.index];
    //接口调用
    crystalBiz.useSkill(uwClient, userId,index,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.CrystalEntity));
    })
};

/**
 * 刷新技能cd
 * @iface refreshSkillCd
 * @args {index:"技能下标"}
 * @param args
 * @param session
 * @param next
 * @returns ds.CrystalEntity
 */
proto.f = function (args, session, next) {
    var userId = session.get(consts.session.userId); 
    var argsKeys = iface.a_crystal_refreshSkillCd_args;
    var index = args[argsKeys.index];
    //接口调用
    crystalBiz.refreshSkillCd(uwClient, userId,index,function(err,data){
        if(err) return next(null,wrapResult(err));
        var updateData = data[0];
        var costDiamond = data[1];
        // if(costDiamond>0){
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.freshCrystalSkill,costDiamond, cb1);
        //     // });
        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(uwClient,userId,taskOpt,function() {}); 
        // }
        next(null,wrapResult(null,updateData,dsNameConsts.CrystalEntity));
    })
};
