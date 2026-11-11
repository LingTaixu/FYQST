/**
 * Created by Administrator on 2016/1/8.
 */
var challengeCupBiz = require("uw-challenge-cup").challengeCupBiz;
var uwData = require("uw-data");
var consts = uwData.consts;
var client = require("uw-db").uwClient;
var dsNameConsts = uwData.dsNameConsts;
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var taskBiz = require("uw-task").taskBiz;
var iface = uwData.iface;
var ds = require("uw-ds").ds;
var c_prop = uwData.c_prop;
var proto = module.exports;
/**
 * 取得王城擂主信息
 * @iface getInfo
 * @args
 * @param args
 * @param session
 * @param next
 * @returns [ds.ChallengeCupData]
 */
proto.a = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    challengeCupBiz.getInfo(client,userId,function(err,data){
        if(err) return next(null, wrapResult(err));
        next(null, wrapResult(null,data,dsNameConsts.ChallengeCupData));
    });
};
/**
 * 开始挑战擂主
 * @iface startFight
 * @args  {championUserId: "挑战擂主的userId"}
 * @param args
 * @param session
 * @param next
 * @return [ds.ExChallengeCupFight]
 */
proto.b = function(args, session, next){
    var userId = session.get(consts.session.userId); 
    var argsKeys = iface.a_challengeCup_startFight_args;
    var championUserId = args[argsKeys.championUserId];
    challengeCupBiz.startFight(client, userId, championUserId,function(err, data){
        if(err) return next(null, wrapResult(err));
        var exChallengeCupFight = new ds.ExChallengeCupFight();
        if(data[0]){
            exChallengeCupFight.errCode = data[0];
            return next(null, wrapResult(null, exChallengeCupFight,dsNameConsts.ExChallengeCupFight));
        }
        var costDiamond = data[1];
        exChallengeCupFight.heroList = data[2];
        exChallengeCupFight.otherDataList = data[3];
        exChallengeCupFight.fightData = data[4];
        exChallengeCupFight.userData = data[5];
        // if(costDiamond>0){
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(client,userId,c_prop.diamondCostTypeKey.challengeCup,costDiamond, cb1);
        //     // });
        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(client,userId,taskOpt,function() {}); 
        // }
        next(null, wrapResult(null, exChallengeCupFight,dsNameConsts.ExChallengeCupFight));
    })
}

/**
 * 结束战斗
 * @iface endFight
 * @args  {isWin: "是否战斗胜利"}
 * @param args
 * @param session
 * @param next
 * @return ds.FightResult
 */
proto.c = function(args, session, next){
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_challengeCup_endFight_args;
    var isWin = args[argsKeys.isWin];
    challengeCupBiz.endFight(client, userId, isWin, function(err, data){
        if(err) return next(null, wrapResult(err));
        /*gameRecordSerial.add(userId,function(cb1) {
            gameRecordBiz.setChallengeCupPkCount(client, userId,cb1);
        });*/
        next(null, wrapResult(null, data, dsNameConsts.FightResult));
    })
}
/**
 *消除cd
 * @iface clearCd
 * @args
 * @param args
 * @param session
 * @param next
 * @return [...]
 */

proto.d = function(args, session, next){
    var userId = session.get(consts.session.userId); 
    challengeCupBiz.clearCd(client, userId, function(err, data){
        if(err) return next(null, wrapResult(err));
        var costDiamond = data[0];
        var userData = data[1];
        // if(costDiamond>0){
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(client,userId,c_prop.diamondCostTypeKey.clearChallengeCupCd,costDiamond, cb1);
        //     // });
        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(client,userId,taskOpt,function() {}); 
        // }
        next(null, wrapResult(null, userData));
    })
}
/**
 * 登台，成为第一位擂主
 * @iface toBeChampion
 * @args
 * @param args
 * @param session
 * @param next
 * @returns [ds.ChallengeCupData]
 */
proto.e = function(args, session, next){
    var  userId = session.get(consts.session.userId);
    challengeCupBiz.toBeChampion(client, userId, function(err, data){
        if(err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.ChallengeCupData));
    })
}

/**
 * 获取伤害排行榜
 * @iface getDurationTimeRankList
 * @args
 * @param args
 * @param session
 * @param next
 * @return [ds.ChampionDurationTimeRank]
 */
proto.f = function(args, session, next){
    var  userId = session.get(consts.session.userId);
    challengeCupBiz.getDurationTimeRankList(userId, function(err, data){
        if(err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.ChampionDurationTimeRank));
    });
}

/**
 * 取得王城擂主活动是否开启
 * @iface getIsOpen
 * @args
 * @param args
 * @param session
 * @param next
 * @returns [isOpen, now, openTime]
 */
proto.g = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    challengeCupBiz.getIsOpen(client,userId,function(err,data){
        if(err) return next(null, wrapResult(err));
        next(null, wrapResult(null,data));
    });
};

/**
 * 操作，顶，踩
 * @iface op
 * @args  {op: "0：踩 1 ：顶"}
 * @param args
 * @param session
 * @param next
 * @return ds.ChallengeCupData
 */
proto.h = function(args, session, next){
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_challengeCup_op_args;
    var op = args[argsKeys.op];
    challengeCupBiz.op(client, userId, op, function(err, data){
        if(err) return next(null, wrapResult(err));
        var challengeCupData = new ds.ChallengeCupData();
        challengeCupData.upCount = data[0];//顶数
        challengeCupData.downCount = data[1];//踩数
        challengeCupData.myOpNum = data[2];//个人操作次数
        next(null, wrapResult(null, challengeCupData, dsNameConsts.ChallengeCupData));
    })
};