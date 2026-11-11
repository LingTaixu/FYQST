/**
 * Created by Administrator on 2016/7/6.
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
var proto = module.exports;

var expeditionBiz = require("uw-expedition").expeditionBiz;


/**
 * 获取过关信息
 * @iface getInfo
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.a = function(args,session,next) {
    var userId = session.get(consts.session.userId);
    expeditionBiz.getInfo(uwClient, userId, function (err, data) {
        if (err) return next(null, wrapResult(err));
        var expeditionData = new ds.ExpeditionData();
        expeditionData.expData = data[0]
        expeditionData.expHeroData = data[1];
        next(null,wrapResult(null,expeditionData,dsNameConsts.ExpeditionData));
    });
}

/**
 * 穿元婴
 * @iface wearSoul
 * @args {tempId:"模板id",soulId:"元婴id"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExpeditionData
 */
proto.b = function(args,session,next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_expedition_wearSoul_args;
    var tempId = args[argsKeys.tempId];
    var soulId = args[argsKeys.soulId];
    expeditionBiz.wearSoul(uwClient, userId, tempId, soulId,function (err, data) {
        if (err) return next(null, wrapResult(err));
        var expeditionData = new ds.ExpeditionData();
        expeditionData.expData = data[0];
        expeditionData.expHeroData = data[1];
        next(null,wrapResult(null,expeditionData,dsNameConsts.ExpeditionData));
    });
}

/**
 * 战斗开始
 * @iface startBattle
 * @args {stageId:"关卡id"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExpeditionData
 */
proto.c = function(args,session,next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_expedition_startBattle_args;
    var stageId = args[argsKeys.stageId];
    expeditionBiz.startBattle(uwClient, userId, stageId,function (err, data) {
        if (err) return next(null, wrapResult(err));
        var expeditionData = new ds.ExpeditionData();
        expeditionData.expData = data[0];
        expeditionData.expHeroData = data[1];
        next(null,wrapResult(null,expeditionData,dsNameConsts.ExpeditionData));
    });
}

/**
 * 战斗结束
 * @iface endBattle
 * @args {isWin:"是否胜利",herosHp:"剩余血量"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExpeditionData
 */
proto.d = function(args,session,next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_expedition_endBattle_args;
    var isWin = args[argsKeys.isWin];
    var herosHp = args[argsKeys.herosHp];
    expeditionBiz.endBattle(uwClient, userId, stageId,function (err, data) {
        if (err) return next(null, wrapResult(err));
        var expeditionData = new ds.ExpeditionData();
        expeditionData.expData = data[0];
        expeditionData.expHeroData = data[1];
        expeditionData.finishData = data[2];
        expeditionData.finishLvl = data[3];
        next(null,wrapResult(null,expeditionData,dsNameConsts.ExpeditionData));
    });
}


///**
// * 战斗结束
// * @iface buyBlackItem
// * @args {itemId:"物品表id"}
// * @param args
// * @param session
// * @param next
// * @returns ds.ExpeditionData
// */
//
//proto.e = function(args,session,next) {
//    var userId = session.get(consts.session.userId);
//    var argsKeys = iface.a_expedition_buyBlackItem_args;
//    var itemId = args[argsKeys.itemId];
//    expeditionBiz.buyBlackItem(uwClient, userId, itemId,function (err, data) {
//        if (err) return next(null, wrapResult(err));
//    });
//}