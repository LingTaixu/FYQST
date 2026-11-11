var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var c_prop = uwData.c_prop;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var userDao = require("uw-user").userDao;
var equipBiz = require("uw-equip").equipBiz;
var ds = require("uw-ds").ds;
var uwClient = require("uw-db").uwClient;
var heroBiz = require("uw-hero").heroBiz;
var heroTalismanBiz = require("uw-hero").heroTalismanBiz;
var taskBiz = require("uw-task").taskBiz;
var proto = module.exports;


/**
 * 使用法宝道具
 * @iface useTrumpItem
 * @args    {itemId:"法宝id"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.a = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_talisman_useTrumpItem_args;
    var itemId = args[argsKeys.itemId];
    //使用法宝道具
    heroTalismanBiz.useTrumpItem(uwClient, userId, itemId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var exData = new ds.ExUserData();
        exData.heroData = data[0] || [];
        exData.delBagItems = data[1];
        exData.userData = data[2];
        next(null, wrapResult(null, exData, dsNameConsts.ExUserData));
    })
};


/**
 * 穿戴装备
 * @iface wearTrump
 * @args    {tempId:"英雄id",trumpId:"法宝id"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.b = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_talisman_wearTrump_args;
    var tempId = args[argsKeys.tempId];
    var trumpId = args[argsKeys.trumpId];
    //穿戴装备
    heroTalismanBiz.changeTrump(uwClient, userId, tempId, trumpId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var exData = new ds.ExUserData();
        exData.heroData = data[0];
        exData.delBagItems = data[1];
        next(null, wrapResult(null, exData, dsNameConsts.ExUserData));
    })
};

/**
 * 法宝升级
 * @iface upTrumpLvl
 * @args    {tempId:"英雄id",trumpId:"法宝id"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.c = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_talisman_upTrumpLvl_args;
    var tempId = args[argsKeys.tempId];
    var trumpId = args[argsKeys.trumpId];
    //法宝升级
    heroTalismanBiz.upTrumpLvl(uwClient, userId, tempId, trumpId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var costCandyNum = data[2];
        if (costCandyNum > 0) {
            taskBiz.setTaskValue(uwClient, userId, c_prop.cTaskTypeKey.petFeedCandy, costCandyNum, function() {
            });
        }

        var exData = new ds.ExUserData();
        exData.heroData = data[0];
        exData.delBagItems = data[1];
        next(null, wrapResult(null, exData, dsNameConsts.ExUserData));
    })
};

/**
 * 法宝升星
 * @iface upTrumpStar
 * @args    {tempId:"英雄id",trumpId:"法宝id"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.d = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_talisman_upTrumpStar_args;
    var tempId = args[argsKeys.tempId];
    var trumpId = args[argsKeys.trumpId];
    //法宝升星
    heroTalismanBiz.upTrumpStar(uwClient, userId, tempId, trumpId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var costCandyNum = data[5];
        if (costCandyNum > 0) {
            taskBiz.setTaskValue(uwClient, userId, c_prop.cTaskTypeKey.petFeedCandy, costCandyNum, function() {
            });
        }
        var exData = new ds.ExUserData();
        exData.heroData = data[0];
        exData.delBagItems = data[1];
        exData.isGetSkill = data[2];
        exData.userData = data[3];
        exData.isFull = data[4];
        next(null, wrapResult(null, exData, dsNameConsts.ExUserData));
    })
};

/**
 * 英雄升星(英雄皮肤)
 * @iface upHeroStar
 * @args    {tempId:"英雄id"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.d1 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_talisman_upHeroStar_args;
    var tempId = args[argsKeys.tempId];
    //英雄升星
    heroTalismanBiz.upHeroStar(uwClient, userId, tempId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        // var costCandyNum = data[5];
        // if (costCandyNum > 0){
        //     taskBiz.setTaskValue(uwClient,userId,c_prop.cTaskTypeKey.petFeedCandy,costCandyNum,function(){});
        // }
        var exData = new ds.ExUserData();
        exData.heroData = data[0];
        exData.delBagItems = data[1];
        exData.isGetSkill = data[2];
        exData.userData = data[3];
        exData.isFull = data[4];
        next(null, wrapResult(null, exData, dsNameConsts.ExUserData));
    })
};

/**
 * 重铸法宝
 * @iface recastTrump
 * @args    {tempId:"英雄id",trumpId:"法宝id"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.e = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_talisman_recastTrump_args;
    var tempId = args[argsKeys.tempId];
    var trumpId = args[argsKeys.trumpId];
    //重铸法宝
    heroTalismanBiz.recastTrump(uwClient, userId, tempId, trumpId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var exData = new ds.ExUserData();
        exData.heroData = data[0];
        exData.userData = data[1];
        exData.isGetSkill = data[2];
        next(null, wrapResult(null, exData, dsNameConsts.ExUserData));
    })
};

/**
 * 法宝合成
 * @iface compoundTrump
 * @args    {tempId:"英雄id",trumpId:"法宝id"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.f = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_talisman_compoundTrump_args;
    var tempId = args[argsKeys.tempId];
    var trumpId = args[argsKeys.trumpId];
    //接口调用
    heroTalismanBiz.compoundTrump(uwClient, userId, tempId, trumpId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var exData = new ds.ExUserData();
        exData.heroData = data[0];
        exData.bagItems = data[1];
        next(null, wrapResult(null, exData, dsNameConsts.ExUserData));
    })
};
/**
 * 法宝洗炼
 * @iface baptizeTrump
 * @args    {tempId:"英雄id",trumpId:"法宝id",isCheck:"是否开启保险",baptizeNum:"次数"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.g = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_talisman_baptizeTrump_args;
    var tempId = args[argsKeys.tempId];
    var trumpId = args[argsKeys.trumpId];
    var isCheck = args[argsKeys.isCheck];
    var baptizeNum = args[argsKeys.baptizeNum];
    if(isNaN(baptizeNum) || parseInt(baptizeNum) <=0) return next(null, wrapResult("ERROR: INVALID PARA"));
    //法宝洗炼
    heroTalismanBiz.baptizeTrump(uwClient, userId, tempId, trumpId, isCheck, baptizeNum, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var costDiamond = data[4];
        // if(costDiamond>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.baptizeTrump,costDiamond, cb1);
        //     });
        // }
        var costItemNum = data[5];
        if (costItemNum > 0) {
            taskBiz.setTaskValue(uwClient, userId, c_prop.cTaskTypeKey.petFeedCake, costItemNum, function() {
            });
            //宠物投食次数（紧急委托任务）
            taskBiz.setEntrustTaskValue(uwClient, userId, c_prop.entrustTaskTypeKey.giftTouShi, 1, function() {});
        }
        var exData = new ds.ExUserData();
        exData.userData = data[0];
        exData.heroData = data[1];
        exData.delBagItems = data[2];
        exData.baptizeValue = data[3];
        next(null, wrapResult(null, exData, dsNameConsts.ExUserData));
    })
};

/**
 * 确认洗炼 已废弃
 * @iface confirmBaptizeTrump
 * @args    {tempId:"英雄id",trumpId:"法宝id"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.h = function(args, session, next) {
    // var userId = session.get(consts.session.userId);
    // var argsKeys = iface.a_talisman_confirmBaptizeTrump_args;
    // var tempId = args[argsKeys.tempId];
    // var trumpId = args[argsKeys.trumpId];
    // //法宝确认洗炼
    // heroTalismanBiz.confirmBaptizeTrump(uwClient, userId, tempId, trumpId, function (err, data) {
    //     if (err) return next(null, wrapResult(err));
    //     var exData = new ds.ExUserData();
    //     exData.heroData = data[0];
    //     next(null, wrapResult(null, exData, dsNameConsts.ExUserData));
    // })
};

/**
 * 取消洗炼 已废弃
 * @iface cancelBaptizeTrump
 * @args    {tempId:"英雄id",trumpId:"法宝id"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.i = function(args, session, next) {
    // var userId = session.get(consts.session.userId);
    // var argsKeys = iface.a_talisman_cancelBaptizeTrump_args;
    // var tempId = args[argsKeys.tempId];
    // var trumpId = args[argsKeys.trumpId];
    // //法宝确认洗炼
    // heroTalismanBiz.cancelBaptizeTrump(uwClient, userId, tempId, trumpId, function (err, data) {
    //     if (err) return next(null, wrapResult(err));
    //     var exData = new ds.ExUserData();
    //     exData.heroData = data[0];
    //     next(null, wrapResult(null, exData, dsNameConsts.ExUserData));
    // })
};

/**
 * 更新法宝总战力
 * @iface updateCombat
 * @args    {tempId:"英雄id", combat:"法宝总战力"}
 * @param args
 * @param session
 * @param next
 */
proto.j = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_talisman_updateCombat_args;
    var tempId = args[argsKeys.tempId];
    var combat = args[argsKeys.combat];

    heroTalismanBiz.updateCombat(uwClient, userId, tempId, combat, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, null));
    })
};

/**
 * 亲密升级
 * @iface giveGiftToHero
 * @args  {tempId:"英雄配置文件id"}
 * @param args
 * @param session
 * @param next
 * @return ds.ExUserData()
 */
proto.k = function(args, session, next) {
    let userId = session.get(consts.session.userId);
    let argsKeys = iface.a_talisman_giveGiftToHero_args;
    let tempId = args[argsKeys.tempId];

    heroTalismanBiz.giveGiftToHero(uwClient, userId, tempId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        let exData = new ds.ExUserData();
        exData.userData = data[0];
        exData.delBagItems = data[1];
        next(null, wrapResult(null, exData, dsNameConsts.ExUserData));
    })
};

/**
 * 激活永恒羁绊
 * @iface activeForever
 * @args  {tempId:"英雄配置文件id"}
 * @param args
 * @param session
 * @param next
 * @return ds.ExUserData()
 */
proto.l = function(args, session, next) {
    let userId = session.get(consts.session.userId);
    let argsKeys = iface.a_talisman_activeForever_args;
    let tempId = args[argsKeys.tempId];

    heroTalismanBiz.activeForever(uwClient, userId, tempId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        let exData = new ds.ExUserData();
        exData.userData = data[0];
        exData.delBagItems = data[1];
        next(null, wrapResult(null, exData, dsNameConsts.ExUserData));
    })
};

/**
 * 宠物合成
 * @iface talismanConpound
 * @args  {trumpId1:"消耗宠物1",trumpId2:"消耗宠物2"}
 * @param args
 * @param session
 * @param next
 * @return ds.ExUserData()
 */
proto.m = function(args, session, next) {
    let userId = session.get(consts.session.userId);
    let argsKeys = iface.a_talisman_talismanConpound_args;
    let trumpId1 = args[argsKeys.trumpId1];
    let trumpId2 = args[argsKeys.trumpId2];

    heroTalismanBiz.talismanConpound(uwClient, userId, trumpId1,trumpId2, function(err, data) {
        if (err) return next(null, wrapResult(err));
        let exData = new ds.ExUserData();
        exData.bagItems = data[0];
        exData.delBagItems = data[1];
        next(null, wrapResult(null, exData, dsNameConsts.ExUserData));
    })
};