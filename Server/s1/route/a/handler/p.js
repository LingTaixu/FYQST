/**
 * Created by Sara on 2015/5/26.
 */

var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var userDao = require("uw-user").userDao;
var pkBiz = require("uw-fight").pkBiz;
var rankBiz = require("uw-rank").rankBiz;
var uwClient = require("uw-db").uwClient;
var c_pkLvl = uwData.c_pkLvl;
var ds = require("uw-ds").ds;
var c_prop = uwData.c_prop;
var arenaRecordBiz = require('uw-arena-record').arenaRecordBiz;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var eventBiz = require("uw-event").eventBiz;
var taskBiz = require("uw-task").taskBiz;
var proto = module.exports;

/**
 * 购买挑战次数
 * @iface buyPKNum
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.UserEntity
 */
proto.a = function (args, session, next) {
    var userId = session.get(consts.session.userId); 
    //接口调用
    pkBiz.buyPKNum(uwClient,userId,function(err,data){
        if(err) return next(null,wrapResult(err));
        var userData = data[0];
        var costDiamond = data[1];
        // if(costDiamond>0){
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.fightNum,costDiamond, cb1);
        //     // });
        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(uwClient,userId,taskOpt,function() {}); 
        // }
        next(null,wrapResult(null,propUtils.delProp(userData,["record"]),dsNameConsts.UserEntity));
    })
};

/**
 * 获取对手列表
 * @iface getPKUserList
 * @args
 * @param args
 * @param session
 * @param next
 * @returns  [ds.PKUserData]
 */
proto.b = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    pkBiz.getOpponent(uwClient,userId,function(err,dataList){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,dataList,dsNameConsts.PKUserData));
    })
};

/**
 * 获取对手信息
 * @iface getPKUserData
 * @args {userId:"用户id"}
 * @param args
 * @param session
 * @param next
 * @returns  ds.PKUserData
 */
proto.c = function (args, session, next) {
    var argsKeys = iface.a_pk_getPKUserData_args;
    var userId = args[argsKeys.userId];
    //接口调用
    pkBiz.getOppoData(uwClient,userId,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.PKUserData));
    });
};

/**
 * 战斗
 * @iface fight
 * @args {enemyId:"对手id",isNPC:"是否npc 0|1",fightType:"1、排位赛 2、仇人榜"}
 * @param args
 * @param session
 * @param next
 * @returns  ds.FightResult
 */
proto.d = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_pk_fight_args;
    var enemyId = args[argsKeys.enemyId];
    var isNPC = args[argsKeys.isNPC];
    var fightType = args[argsKeys.fightType]||1;
    //接口调用
    pkBiz.fight(uwClient,userId,enemyId,isNPC,fightType,function(err,data){
        if(err) return next(null,wrapResult(err));

        gameRecordSerial.add(userId,function(cb1){
            gameRecordBiz.setPkCount(uwClient,userId,cb1);
        });

        var fightResult = data[0];
        var userLvl = data[1];
        eventBiz.randomEvent(uwClient,userId,userLvl,c_prop.randomCfg1Key.copyFinish,function(err,eventData){
            if (err) return next(null,wrapResult(err));
            fightResult.eventData = eventData;
            next(null,wrapResult(null,fightResult,dsNameConsts.FightResult));
        });
    });
};

/**
 * 获取仇人列表
 * @iface getEnemyList
 * @args
 * @param args
 * @param session
 * @param next
 * @returns  [ds.PKUserData]
 */
proto.e = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    pkBiz.getEnemyList(uwClient,userId,function(err,dataList){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,dataList,dsNameConsts.PKUserData));
    })
};

/**
 * 获取排行榜
 * @iface getUserRanks
 * @args
 * @param args
 * @param session
 * @param next
 * @returns [ds.PKUserData]
 */
proto.f = function (args, session, next) {
    //接口调用
    rankBiz.getUserRanks(uwClient,function(err,dataList){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,dataList,dsNameConsts.PKUserData));
    })
};

/**
 * 获取自己的排名
 * @iface getRank
 * @args
 * @param args
 * @param session
 * @param next
 * @returns 排名
 */
proto.g = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    rankBiz.getRank(uwClient,userId,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data));
    })
};

/**
 * 改签名
 * @iface changeSign
 * @args {sign:"签名"}
 * @param args
 * @param session
 * @param next
 * @returns ds.UserEntity
 */
proto.h = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_pk_changeSign_args;
    var sign = args[argsKeys.sign];
    //接口调用
    pkBiz.changeSign(uwClient,userId, sign ,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,propUtils.delProp(data,["record"]),dsNameConsts.UserEntity));
    })
};

/**
 * 设置阅读
 * @iface setRead
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.i = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    arenaRecordBiz.setRead(uwClient,userId,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null));
    })
};

/**
 * 跳过战斗
 * @iface skip
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.j = function (args, session, next) {
    var userId = session.get(consts.session.userId); 
    //接口调用
    pkBiz.skip(uwClient,userId,function(err,data){
        if(err) return next(null,wrapResult(err));
        var userData = data[0];
        var costDiamond = data[1];
        // if(costDiamond>0){
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.skip,costDiamond, cb1);
        //     // });
        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(uwClient,userId,taskOpt,function() {}); 
        // }
        next(null,wrapResult(null,propUtils.delProp(userData,["record"]),dsNameConsts.UserEntity));
    })
};

/**
 * 领取排行奖励
 * @iface pickRankAward
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.k = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    pkBiz.pickRankAward(uwClient,userId,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,propUtils.delProp(data,["record"]),dsNameConsts.UserEntity));
    })
};

/**
 * 获取仇人pk记录
 * @iface getEnemyRecord
 * @args {enemyId:"敌人id"}
 * @param args
 * @param session
 * @param next
 * @returns [ds.HeroChangeRecord]
 */
proto.l = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_pk_getEnemyRecord_args;
    var enemyId = args[argsKeys.enemyId];
    //接口调用
    arenaRecordBiz.getEnemyRecord(uwClient,userId,enemyId,function(err,data){
        if (err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.HeroChangeRecord));
    });
};

/**
 * 获取野外仇人列表
 * @iface getList
 * @args
 * @param args
 * @param session
 * @param next
 * @returns  [ds.PKUserData]
 */
proto.m = function (args, session, next) {
    //todo  仇人
    var userId = session.get(consts.session.userId);
    //接口调用
    pkBiz.getList(uwClient,userId,function(err,dataList){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,dataList,dsNameConsts.PKUserData));
    })
};