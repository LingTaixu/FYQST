/**
 * Created by Sara on 2015/5/28.
 */

var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var couponBiz = require("uw-coupon").couponBiz;
var uwClient = require("uw-db").uwClient;
var ds = require("uw-ds").ds;
var c_prop = uwData.c_prop;
var pkOutBiz = require("uw-pkOut").pkOutBiz;
var taskBiz = require("uw-task").taskBiz;
var arenaRecordBiz = require("uw-arena-record").arenaRecordBiz;
var treasureRecordDao = require("uw-treasure").treasureRecordDao;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var g_data = require("uw-global").g_data;
var userBiz = require("uw-user").userBiz;

var proto = module.exports;

/**
 * 开启pk
 * @iface open
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.PkOutEntity
 */
proto.a = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    pkOutBiz.open(uwClient,userId ,function(err,pkOutData){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,pkOutData,dsNameConsts.PkOutEntity));
    })
};

/**
 * 获取对手列表
 * @iface getEnemyList
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.ExPkOut
 */
proto.b = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    pkOutBiz.getEnemyList(uwClient,userId ,function(err,data){
        if(err) return next(null,wrapResult(err));
        var exPkOut = new ds.ExPkOut();
        exPkOut.enemyList = data[0];
        exPkOut.pkOutData = data[1];
        next(null,wrapResult(null,exPkOut,dsNameConsts.ExPkOut));
    })
};

/**
 * 获取未报仇仇人列表
 * @iface getRevengeEnemyList
 * @args
 * @param args
 * @param session
 * @param next
 * @returns [ds.PkOutUserData]
 */
proto.b1 = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    pkOutBiz.getRevengeEnemyList(uwClient,userId ,20,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.PkOutUserData));
    })
};

/**
 * 刷新对手
 * @iface refreshEnemy
 * @args
 * @param args
 * @param session
 * @param next
 * @returns [ds.PkOutUserData]
 */
proto.c = function (args, session, next) {
    var userId = session.get(consts.session.userId);
     //接口调用
    pkOutBiz.refreshEnemy(uwClient,userId ,function(err,data){
        if(err) return next(null,wrapResult(err));
        var costDiamond = data[2];
        // if(costDiamond>0){
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.refreshEnemy,costDiamond, cb1);
        //     // });
        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(uwClient,userId,taskOpt,function() {}); 
        // }
        var exPkOut = new ds.ExPkOut();
        exPkOut.userData = data[0];
        exPkOut.pkOutData = data[1];
        next(null,wrapResult(null,exPkOut,dsNameConsts.ExPkOut));
    })
};

/**
 * 请求开始战斗
 * @iface start
 * @args {enemyId:"对手id",fightType:"战斗类型 c_prop.fightTypeKey",isRevenge:"是否复仇"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExPkOut
 */
proto.d = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_pkOut_start_args;
    var enemyId = args[argsKeys.enemyId];
    var fightType = args[argsKeys.fightType]||c_prop.fightTypeKey.pk;
    var isRevenge = args[argsKeys.isRevenge];
    //接口调用
    pkOutBiz.start(uwClient,userId ,enemyId,fightType,isRevenge, function(err,data){
        if(err) return next(null,wrapResult(err));
        var exPkOut = new ds.ExPkOut();
        exPkOut.pkOutData = data[0];
        exPkOut.heroList = data[1];
        exPkOut.otherDataList = data[2];
        exPkOut.fightData = data[3];
        exPkOut.guildData = data[4];
        exPkOut.guildPersonalData = data[5];
        next(null,wrapResult(null,exPkOut,dsNameConsts.ExPkOut));

        taskBiz.setTaskValue(uwClient,userId,c_prop.cTaskTypeKey.encounter,1,function() {});
        //遭遇战
        userBiz.setMedalValue(uwClient, userId, c_prop.medalLootTypeKey.encounter, 1, function(){});
    })
};

/**
 * 结束战斗
 * @iface end
 * @args {isWin:"是否胜利", enemyId:"对手的userId",fightData:"战斗数据",fightType:"战斗类型 c_prop.fightTypeKey",isRevenge:"是否复仇"}
 * @param args
 * @param session
 * @param next
 * @returns ds.FightResult
 */
proto.e = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_pkOut_end_args;
    var enemyId = args[argsKeys.enemyId];
    var fightData = args[argsKeys.fightData];
    var isWin = args[argsKeys.isWin];
    var fightType = args[argsKeys.fightType]||c_prop.fightTypeKey.pk;
    var isRevenge = args[argsKeys.isRevenge];
    //接口调用
    pkOutBiz.end(uwClient,userId, enemyId, isWin, fightData, fightType,isRevenge,function(err,data){
        if(err) return next(null,wrapResult(err));
        gameRecordSerial.add(userId,function(cb1) {
            gameRecordBiz.setPkCount(uwClient, userId, cb1);
        });
        next(null,wrapResult(null,data,dsNameConsts.FightResult));
    })
};

/**
 * 获取排行列表，返回50名数据
 * @iface getRankList
 * @args
 * @param args
 * @param session
 * @param next
 * @returns [ds.Rank]
 */
proto.f = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    pkOutBiz.getRankList(uwClient,  function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.Rank));
    })
};


/**
 * 获取个人排名
 * @iface getMyRank
 * @args
 * @param args
 * @param session
 * @param next
 * @returns 排名
 */
proto.g = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    pkOutBiz.getMyRank(uwClient, userId, function(err,rank){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,rank));
    });
};

/**
 * 获取个人战斗记录，最多20条
 * @iface getPkRecordList
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.ArenaRecordEntity
 */
proto.h = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    arenaRecordBiz.getPkRecordList(uwClient, userId,0,20, function(err,arenaRecordList){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,arenaRecordList,dsNameConsts.ArenaRecordEntity));
    });
};

/**
 * 获取个人战斗记录，最多20条
 * @iface getRankPkRecordList
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.ArenaRecordEntity
 */
proto.h1 = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    arenaRecordBiz.getRankPkRecordList(uwClient, userId,0,20, function(err,arenaRecordList){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,arenaRecordList,dsNameConsts.ArenaRecordEntity));
    });
};


/**
 * 设置阅读
 * @iface setPkRecordRead
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.i = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    arenaRecordBiz.setPkRead(uwClient, userId, function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null));
    });
};

/**
 * 处理被抢
 * @iface dealRecord
 * @args {fightType:"战斗类型 c_prop.fightTypeKey"}
 * @param args
 * @param session
 * @param next
 */
proto.j = function (args, session, next) {
    var userId = session.get(consts.session.userId); 
    var argsKeys = iface.a_pkOut_dealRecord_args;
    var fightType = args[argsKeys.fightType]||c_prop.fightTypeKey.pk;

    //接口调用
    pkOutBiz.dealRecord(uwClient, userId, fightType, function(err,data){
        if(err) return next(null,wrapResult(err));
        var costGold = data[2];
        // if(costGold>0){
        //     gameRecordSerial.add(userId,function(cb1) {
        //         gameRecordBiz.setCostGoldRecord(uwClient, userId, c_prop.goldCostTypeKey.fieldPk, costGold, cb1);
        //     });
        // }
        var exPkOut = new ds.ExPkOut();
        exPkOut.userData = data[0];
        exPkOut.pkOutData = data[1];
        exPkOut.hasNewDeal = data[3];
        next(null,wrapResult(null,exPkOut,dsNameConsts.ExPkOut));
    });
};

/**
 * 清除pk值
 * @iface clearPkValue
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.k = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    pkOutBiz.clearPkValue(uwClient, userId, function(err,data){
        if(err) return next(null,wrapResult(err));
        var costDiamond = data[2];
        // if (costDiamond > 0){
        //     // gameRecordSerial.add(userId,function(cb1) {
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient, userId, c_prop.diamondCostTypeKey.clearPkValue, costDiamond, cb1);
        //     // });
        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(uwClient,userId,taskOpt,function() {}); 
        // }
        var exPkOut = new ds.ExPkOut();
        exPkOut.userData = data[0];
        exPkOut.pkOutData = data[1];
        next(null,wrapResult(null,exPkOut,dsNameConsts.ExPkOut));
    });
};

/**
 * 设置去掉红点
 * @iface resetBePkKill
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.l = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    g_data.setBePkKill(userId,false);
    next(null,wrapResult(null));
};

/**
 * 隐姓埋名
 * @iface incognito
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.m = function(args, session, next) {
    var userId = session.get(consts.session.userId); 
    pkOutBiz.incognito(uwClient, userId, function(err, data){
        if(err) return next(null,wrapResult(err));
        var costDiamond = data[2];
        // if (costDiamond > 0){
        //     // gameRecordSerial.add(userId,function(cb1) {
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient, userId, c_prop.diamondCostTypeKey.incognito, costDiamond, cb1);
        //     // });
        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(uwClient,userId,taskOpt,function() {});         
        // }
        var incognito = new ds.Incognito();
        incognito.userData = data[0];
        incognito.openTime = data[1];
        next(null, wrapResult(null, incognito,dsNameConsts.Incognito));
    })
};



/**
 * 获取个人战斗记录，最多20条
 * @iface getTreasurePkRecordList
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.TreasureRecordEntity
 */
proto.n = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    treasureRecordDao.list(uwClient, "1=1 order by id desc limit ?",[30], function(err,arenaRecordList){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,arenaRecordList,dsNameConsts.TreasureRecordEntity));
    });
};

