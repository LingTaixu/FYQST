
/**
 * Created by oldma on 14-9-26.
 * 战斗
 */

var uwData = require("uw-data");
var iface = uwData.iface;
var consts = uwData.consts;
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;

var fightBiz = require('uw-fight').fightBiz;
var client = require("uw-db").uwClient;
var ds = require("uw-ds").ds;
var dsNameConsts = uwData.dsNameConsts;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var c_prop = uwData.c_prop;
var t_copy = uwData.t_copy;
var logger = require('uw-log').getLogger("uw-sys-error", __filename);
var g_copyLoot = require("uw-global").g_copyLoot;
var proto = module.exports;


/**
 * 捡取掉落，得到金币，装备
 * @iface pickLoot
 * @args {copyId:"副本id",uidArr:"掉落唯一id组",fightData:"战斗数据"}
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.a = function(args, session, next){
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_fight_pickLoot_args;
    var copyId = args[argsKeys.copyId];
    var fightData = args[argsKeys.fightData];
    var uidArr = args[argsKeys.uidArr]; 
    if(!uidArr){
        logger.error("args error:",JSON.stringify(args));
        logger.error("g_copyLoot error:",JSON.stringify(g_copyLoot.getLootCache()));

        uidArr = [];
    }
    var uidDataArr = [];
    for(var i = 0;i<uidArr.length;i++){
        var locUid = uidArr[i];
        uidDataArr.push([copyId,locUid,false]);
    }

    fightBiz.pickLoot(client,userId,uidDataArr,false,1, function(err,data){
        if (err) return next(null,wrapResult(err));
        var ex = new ds.ExUserData();
        ex.userData = data[0];
        ex.copyProgressData = data[1];
        ex.bagItems = data[2];
        ex.equipBagItems = data[3];
        // var getDiamond = data[4];
        // if(getDiamond>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setDiamondRecord(client,userId,c_prop.diamondGetTypeKey.monster,getDiamond, cb1);
        //     });
        // }
        next(null,wrapResult(null,ex,dsNameConsts.ExUserData));
    });
};

/**
 * 复活
 * @iface revive
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.UserEntity
 */
proto.b = function(args, session, next){
    var userId = session.get(consts.session.userId);
    fightBiz.revive(client,userId,function(err,data){
        if (err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.UserEntity));
    });
};


/**
 * 获取和预掉落数据
 * @iface getAndInitNextLoot
 * @args {copyId:"副本id",isBoss:"是否boss关卡",lvl:"用户等级"}
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns {"唯一id":[[物品id,物品数量],..]}
 */
proto.c = function(args,session , next){

    var userId = session.get(consts.session.userId);
    var sessionId = session.id;

    var argsKeys = iface.a_fight_getAndInitNextLoot_args;
    var copyId = args[argsKeys.copyId];
    var isBoss = args[argsKeys.isBoss];
    var lvl = args[argsKeys.lvl];
    var t_copyData = t_copy[copyId];


    //只有普通副本走这里逻辑，其他类型不在这
    if(t_copyData.type!=c_prop.copyTypeKey.normal) return next(null,wrapResult(null,[]));
    fightBiz.preLoot(client, userId, copyId, lvl,function (err, lootData) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, lootData));
    });
};



