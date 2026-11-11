/**
 * Created by Administrator on 2014/5/22.
 */
var async = require("async");
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var trans = require("uw-db").uwTrans;
var client = require("uw-db").uwClient;
var loginClient = require("uw-db").loginClient;

var proto = module.exports;
var ds = require("uw-ds").ds;

var uwData = require("uw-data");
var c_msgCode = uwData.c_msgCode;
var iface = uwData.iface;
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var c_prop = uwData.c_prop;

var propUtils = require('uw-utils').propUtils;
var getMsg = require("uw-utils").msgFunc(__filename);
var arenaBiz = require("uw-arena").arenaBiz;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var eventBiz = require("uw-event").eventBiz;
var arenaRecordBiz = require('uw-arena-record').arenaRecordBiz;
var taskBiz = require("uw-task").taskBiz;

/**
 * 获取竞技场信息
 * @iface getInfo
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.ArenaRecordEntity
 */
proto.a = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    arenaBiz.getInfo(client, userId, function (err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.ArenaEntity));
    });
};

/**
 * 重置竞技场挑战对手
 * @iface resetFightRanks
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.ArenaRecordEntity
 */
proto.d = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    arenaBiz.resetFightRanks(client, userId, function (err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.ArenaEntity));
    });
};


/**
 * 挑战开始
 * @iface fightStart
 * @args {rank:"挑战排行"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExArena
 */
proto.h1 = function (args, session, next) {
    var argsKeys = iface.a_arena_fightStart_args;
    var rank = args[argsKeys.rank];
    var userId = session.get(consts.session.userId);
    arenaBiz.fightStart(client, userId, rank, function (err, data) {
        if (err) return next(null, wrapResult(err));
        var exArena = new ds.ExArena();
        exArena.arenaData = data[0];
        exArena.heroList = data[1];
        exArena.otherDataList = data[2];
        exArena.fightData = data[3];
        exArena.userData = data[4];
        next(null,wrapResult(null,exArena,dsNameConsts.ExArena));

        taskBiz.setTaskValue(client,userId,c_prop.cTaskTypeKey.rankFighting,1,function(){});

    });
};

/**
 * 挑战结束
 * @iface fightEnd
 * @args {rank:"挑战排行",isWin:"是否胜利",fightData:"战斗数据"}
 * @param args
 * @param session
 * @param next
 * @returns ds.FightResult
 */
proto.h2 = function (args, session, next) {
    var argsKeys = iface.a_arena_fightEnd_args;
    var rank = args[argsKeys.rank];
    var isWin = args[argsKeys.isWin];
    var fightData = args[argsKeys.fightData];
    var userId = session.get(consts.session.userId);

    arenaBiz.fightEnd(client, userId, rank, isWin, function (err, data) {
        if (err) return next(null, wrapResult(err));
        gameRecordSerial.add(userId,function(cb1) {
            gameRecordBiz.setJjcPkCount(client, userId,cb1);
        });
        var fightResult = data[0];
        var userLvl = data[1];
        next(null,wrapResult(null,fightResult,dsNameConsts.FightResult));
    });
};

/**
 * 获取对手列表
 * @iface getFightUserList
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.PKUserData
 */
proto.l = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    arenaBiz.getFightUserList(client, userId, function (err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.PKUserData));
    });
};

/**
 * 购买挑战次数
 * @iface buyPKNum
 * @args
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.m = function (args, session, next) {
    var userId = session.get(consts.session.userId); 
    //接口调用
    arenaBiz.buyPKNum(client,userId,function(err,data){
        if(err) return next(null,wrapResult(err));
        var userData = data[0];
        var arenaData = data[1];
        var costDiamond = data[2];
        // if(costDiamond>0){
        //     // gameRecordSerial.add(userId,function(cb1) {
        //     //     gameRecordBiz.setCostDiamondRecord(client, userId, c_prop.diamondCostTypeKey.arenaNum, costDiamond, cb1);
        //     // });

        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(client,userId,taskOpt,function() {}); 
        // }
        var exUserData = new ds.ExUserData();
        exUserData.userData = propUtils.delProp(userData,["record"]);
        exUserData.arenaData = arenaData;
        next(null,wrapResult(null,exUserData,dsNameConsts.ExUserData));
    })
};

/**
 * 获取巅峰赛记录实例
 * @iface getRecordList
 * @args {index:"索引id",count:"总数"}
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns [ArenaRecordEntity]
 */
proto.n = function (args, session, next) {
    var argsKeys = iface.a_arena_getRecordList_args;
    var index = args[argsKeys.index];
    var count = args[argsKeys.count];
    var userId = session.get(consts.session.userId);
    arenaBiz.getRecordList(client,userId, index,count, function (err, data) {
        if (err) return next(null, wrapResult(err));
        propUtils.delProp(data, ["userLvl","userName","userIcoinId","rank"]);
        next(null, wrapResult(null, data, dsNameConsts.ArenaRecordEntity));
    });
};

/**
 * 设置阅读
 * @iface setRead
 * @args
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 */
proto.o = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    arenaRecordBiz.setArenaRead(client,userId,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null));
    })
};

/**
 * 领取排行奖励
 * @iface pickRankAward
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.p = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    arenaBiz.pickRankAward(client,userId,function(err,data){
        if(err) return next(null,wrapResult(err));
        var exData = new ds.ExUserData();
        exData.userData = data[0];
        exData.arenaData = data[1];
        next(null,wrapResult(null,exData,dsNameConsts.ExUserData));
    })
};


/**
 * 购买挑战次数
 * @iface refreshCD
 * @args
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.q = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    arenaBiz.refreshCD(client,userId,function(err,data){
        if(err) return next(null,wrapResult(err));
        var userData = data[0];
        var arenaData = data[1];
        var costDiamond = data[2];
        // if(costDiamond>0){
        //     // gameRecordSerial.add(userId,function(cb1) {
        //     //     gameRecordBiz.setCostDiamondRecord(client, userId, c_prop.diamondCostTypeKey.refreshCD, costDiamond, cb1);
        //     // });

        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(client,userId,taskOpt,function() {}); 
        // }
        var exUserData = new ds.ExUserData();
        exUserData.userData = userData;
        exUserData.arenaData = arenaData;
        next(null,wrapResult(null,exUserData,dsNameConsts.ExUserData));
    })
};

/**
 * 获取排行榜列表
 * @iface getRankList
 * @args
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns [ds.Rank]
 */
proto.r = function (args, session, next) {
    var argsKeys = iface.a_arena_getRecordList_args;
    arenaBiz.getRankList(client, 50, function (err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.Rank));
    });
};

/**
 * 获取下次刷新剩余时间
 * @iface getRefreshRemainTime
 * @args
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 */

proto.rt = function(args, session, next){
    arenaBiz.getRefreshRemainTime(loginClient,function(err,data){
        if (err) return next(null, wrapResult(err));
        next(null,wrapResult(null, data));
    })
}