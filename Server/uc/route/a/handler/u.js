/**
 * Created by Administrator on 2015/5/23.
 */

var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var c_prop = uwData.c_prop;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var t_item = uwData.t_item;
var t_medal = uwData.t_medal;
var userDao = require("uw-user").userDao;
var userBiz = require("uw-user").userBiz;
var eventBiz = require("uw-event").eventBiz;
var ds = require("uw-ds").ds;
var arenaRecordBiz = require("uw-arena-record").arenaRecordBiz;
var mainClient = require("uw-db").mainClient;
var uwClient = require("uw-db").uwClient;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var chatBiz = require("uw-chat").chatBiz;
var g_chat = require("uw-global").g_chat;
var serverUtils = require("uw-utils").serverUtils;
var taskBiz = require("uw-task").taskBiz;
var inviteBiz = require("uw-invite").inviteBiz;
var proto = module.exports;

var logger = require('uw-log').getLogger("uw-logger", __filename);

/**
 * 获取用户信息
 * @iface getInfo
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.a = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    userBiz.getInfo(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, propUtils.delProp(data, ["record"]), dsNameConsts.UserEntity));
    });
};

/**
 * 改名
 * @iface changeName
 * @args {name:"名字"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.b = function(args, session, next) {
    var argsKeys = iface.a_user_changeName_args;
    var userId = session.get(consts.session.userId);
    var name = args[argsKeys.name];
    //接口调用
    userBiz.changeName(uwClient, name, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var exData = new ds.ExUserData();
        exData.userData = data[0];
        exData.delBagItems = data[1];
        next(null, wrapResult(null, exData, dsNameConsts.ExUserData));
    });
};

/**
 * 同步信息
 * @iface syncData
 * @args {sendData:"战斗数据是数组[最新聊天id]"}
 * @param args
 * @param session
 * @param next
 * @returns ds.AsyncData
 */
proto.f = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_syncData_args;
    var sendData = args[argsKeys.sendData];
    sendData[18] = session.get(consts.session.ip); // 末尾加ip

    //接口调用
    userBiz.syncData(uwClient, sendData, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.AsyncData));
    });
};

/**
 * 同步信息2
 * @iface syncData2
 * @args
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns ds.AsyncData2
 */
proto.f1 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    userBiz.syncData2(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.AsyncData2));
    });
};

/**
 * 心跳消息
 * @iface beat
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.f2 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var ip = session.get(consts.session.ip);
    //接口调用
    userBiz.beat(uwClient, userId, ip, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, null));
    });
};

/**
 * 打开背包宝箱
 * @iface getBagChest
 * @args {chestId:"宝箱id",count:"宝箱数量",index:"选择物品的下标"}
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 */
proto.g = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_getBagChest_args;
    var chestId = args[argsKeys.chestId];
    var count = args[argsKeys.count];
    var index = args[argsKeys.index];
    if (isNaN(count) || parseInt(count) <= 0) return next(null, wrapResult("ERROR: INVALID PARA"));
    //接口调用
    userBiz.getBagChest(uwClient, userId, chestId, count, index, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var getDiamond = data[6];
        // if(getDiamond>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setDiamondRecord(uwClient,userId,c_prop.diamondGetTypeKey.openChest,getDiamond, cb1);
        //     });
        // }

        _addOpenChestTask(uwClient, userId, chestId, count);

        var exUserData = new ds.ExUserData();
        exUserData.userData = data[0];
        exUserData.isMail = data[1];
        exUserData.bagItems = data[2];
        exUserData.delBagItems = data[3];
        exUserData.equipBagItems = data[4];
        exUserData.expc = data[5];
        exUserData.rebirthExp = data[7];
        exUserData.genuineQi = data[8];

        exUserData.getBuff = data[9];
        exUserData.nobleNum = data[10];
        next(null, wrapResult(null, exUserData, dsNameConsts.ExUserData));
    });
};

// 开宝箱
var _addOpenChestTask = function(client, userId, chestId, chestNum) {

    // 铜宝箱 5101 - 5199
    // 银宝箱 5201 - 5299
    // 金宝箱 5301 - 5399
    var cTaskType = 0;
    if (5101 <= chestId && chestId < 5199) {
        cTaskType = c_prop.cTaskTypeKey.openCopperChest;
    } else if (5201 <= chestId && chestId < 5299) {
        cTaskType = c_prop.cTaskTypeKey.openSilverChest;
    } else if (5301 <= chestId && chestId < 5399) {
        cTaskType = c_prop.cTaskTypeKey.openGoldChest;
    }
    if (cTaskType > 0 && chestNum > 0)
        taskBiz.setTaskValue(client, userId, cTaskType, chestNum, function() {});
};

/**
 * 购买金币
 * @iface buyGold
 * @args
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.d = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    userBiz.buyGold(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        //任务接口调用
        //taskMgr.handle(iface.a_user_buyGold, session);
        var costDiamond = data[2];
        // if (costDiamond > 0) {
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.buyGold,costDiamond, cb1);
        //     // });
        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(uwClient, userId, taskOpt, function() {
        //     });
        // }
        var exUserData = new ds.ExUserData();
        exUserData.userData = data[0];
        exUserData.buyGoldResultArr = data[1];
        next(null, wrapResult(null, exUserData, dsNameConsts.ExUserData));
    });
};

/**
 * 购买凌云石
 * @iface buyLingyun
 * @args
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.d1 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    userBiz.buyLingyun(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        //任务接口调用
        //taskMgr.handle(iface.a_user_buyGold, session);
        var costDiamond = data[1];
        // if (costDiamond > 0) {
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.buyLingyun,costDiamond, cb1);
        //     // });
        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(uwClient, userId, taskOpt, function() {
        //     });
        // }
        var exUserData = new ds.ExUserData();
        exUserData.userData = data[0];
        exUserData.bagItems = data[2];
        next(null, wrapResult(null, exUserData, dsNameConsts.ExUserData));
    });
};

/**
 * 红点提示
 * @iface getRedPoint
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.h = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    userBiz.getRedPoint(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data));
    })
};

/**
 * 更新引导
 * @iface updateGuide
 * @args  {guideId:"引导id"}
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 */
proto.i = function(args, session, next) {
    var argsKeys = iface.a_user_updateGuide_args;
    var userId = session.get(consts.session.userId);

    var guideId = args[argsKeys.guideId];
    //接口调用
    userBiz.updateGuide(uwClient, userId, guideId, function(err, data) {
        if (err) return next(null, wrapResult(err));

        next(null, wrapResult(null, propUtils.delProp(data, ["record"]), dsNameConsts.UserEntity));


    });
};

/**
 * 更新引导状态数据 (曾经做过的状态记录)
 * @iface updateGuideExt
 * @args  {k:"引导id串",v:"对应数据"}
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 */
proto.i1 = function(args, session, next) {
    var argsKeys = iface.a_user_updateGuideExt_args;
    var userId = session.get(consts.session.userId);

    var accountId = session.get(consts.session.accountId);
    var k = args[argsKeys.k];
    var v = args[argsKeys.v];
    //接口调用
    userBiz.updateGuideExt(uwClient, userId, k, v, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.UserEntity));
    });
};

/**
 * 获取掠夺小弟记录
 * @iface getWinRecord
 * @args
 * @param args
 * @param session
 * @param next
 * @returns [ds.HeroChangeRecord]
 */
proto.j = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    arenaRecordBiz.getWinRecord(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.HeroChangeRecord));
    });
};

/**
 * 获取被抢小弟记录
 * @iface getLoseRecord
 * @args
 * @param args
 * @param session
 * @param next
 * @returns [ds.HeroChangeRecord]
 */
proto.k = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    arenaRecordBiz.getLoseRecord(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.HeroChangeRecord));
    });
};


/**
 * 保存桌面成功
 * @iface saveDeskSuccess
 * @args {type:"c_prop.userRecordTypeKey"}
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 */
proto.o = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_saveDeskSuccess_args;
    var type = args[argsKeys.type];
    //接口调用
    userBiz.saveDeskSuccess(uwClient, userId, type, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.UserEntity));
    });
};

/**
 * 设置布阵
 * @iface setHeroEmbattle
 * @args {heroEmbattle:"布阵信息"}
 * @param args
 * @param session
 * @param next
 */
proto.p = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_setHeroEmbattle_args;
    var heroEmbattle = args[argsKeys.heroEmbattle];
    //接口调用
    // userDao.update(uwClient,{heroEmbattle:heroEmbattle},{id:userId},function(err,data){
    //     if (err) return next(null,wrapResult(err));
    //     next(null,wrapResult(null,null));
    // }); 
    userBiz.setHeroEmbattle(uwClient, userId, heroEmbattle, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, null));
    });
};

/**
 * 购买背包格子
 * @iface buyBagGrid
 * @args
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 */
proto.q = function(args, session, next) {
    // var userId = session.get(consts.session.userId); 
    // //接口调用
    // userBiz.buyBagGrid(uwClient,userId,function(err,data){
    //     if (err) return next(null,wrapResult(err));
    //     var userData = data[0];
    //     var costDiamond = data[1];
    //     if(costDiamond>0){
    //         gameRecordSerial.add(userId,function(cb1){
    //             gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.buyBagGrid,costDiamond, cb1);
    //         });
    //         var taskOpt = {};
    //         taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
    //         taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
    //         taskBiz.setTaskValues(uwClient,userId,taskOpt,function() {});      
    //     }
    //     next(null,wrapResult(null,userData,dsNameConsts.UserEntity));
    // });
};

/**
 * 更新战斗力
 * @iface updateCombat
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.q1 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    userBiz.updateCombat(uwClient, userId, function(err, data) {
        next(null, wrapResult(null, null));
    });
};

/**
 * 设置自动战斗
 * @iface setAutoFight
 * @args {isAuto:"是否自动"}
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 */
proto.q2 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_setAutoFight_args;
    var isAuto = args[argsKeys.isAuto];
    //接口调用
    userBiz.setAutoFight(uwClient, userId, isAuto, function(err, data) {
        next(null, wrapResult(null, null));
    });
};

/**
 * 设置报错次数
 * @iface setTimeError
 * @args {errorNum:"异常次数"}
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 */
proto.q3 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_setTimeError_args;
    var errorNum = args[argsKeys.errorNum];
    //接口调用
    userBiz.setTimeError(uwClient, userId, errorNum, function(err, data) {
        next(null, wrapResult(null, null));
    });
};

/**
 * 设置杀戮排名挑战
 * @iface setTodayRankWin
 * @args {eid:"对手userId"}
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 */
proto.q4 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_setTodayRankWin_args;
    var eid = args[argsKeys.eid];
    //接口调用
    userBiz.setTodayRankWin(uwClient, userId, eid, function(err, data) {
        next(null, wrapResult(null, null));
    });
};

/**
 * 获取战印榜
 * @iface getWarPrintedList
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.q5 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    userBiz.getWarPrintedList(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var exWarPrintedData = new ds.ExWarPrintedData();
        exWarPrintedData.medalData = data[0];
        exWarPrintedData.isUpdata = data[1];
        exWarPrintedData.delBagItems = data[2];
        exWarPrintedData.cup = data[3];
        exWarPrintedData.cupsule = data[4];
        next(null, wrapResult(null, exWarPrintedData, dsNameConsts.ExWarPrintedData));
    });
};

/**
 * 战印强化
 * @iface warPrintedStrength
 * @args {warPrintedId:"战印id"}
 * @param args
 * @param session
 * @param next
 */
proto.q6 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_warPrintedStrength_args;
    var warPrintedId = args[argsKeys.warPrintedId];
    //接口调用
    userBiz.warPrintedStrength(uwClient, userId, warPrintedId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        if (data[2] > 0) {
            taskBiz.setTaskValue(uwClient, userId, c_prop.cTaskTypeKey.costMedalItem, data[2], function() {});
        }
        var exWarPrintedData = new ds.ExWarPrintedData();
        exWarPrintedData.medalData = data[0];
        exWarPrintedData.delBagItems = data[1];
        next(null, wrapResult(null, exWarPrintedData, dsNameConsts.ExWarPrintedData));
    });
};

/**
 * 修改战印榜
 * @iface setMedalTitle
 * @args {warPrintedId:"战印id"}
 * @param args
 * @param session
 * @param next
 */
proto.q7 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_setMedalTitle_args;
    var warPrintedId = args[argsKeys.warPrintedId];
    //接口调用
    userBiz.setMedalTitle(uwClient, userId, warPrintedId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var exWarPrintedData = new ds.ExWarPrintedData();
        exWarPrintedData.medalTitle = data[0];
        next(null, wrapResult(null, exWarPrintedData, dsNameConsts.ExWarPrintedData));
    });
};

/**
 * 获取真气数据
 * @iface getGenuineQi
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.q8 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    userBiz.getGenuineQi(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.UserEntity));
    });
};

/**
 * 激活战印
 * @iface activeMedal
 * @args {warPrintedId:"战印id"}
 * @param args
 * @param session
 * @param next
 */
proto.q9 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_activeMedal_args;
    var warPrintedId = args[argsKeys.warPrintedId];
    //接口调用
    userBiz.activeMedal(uwClient, userId, warPrintedId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        _addGetMedelTask(uwClient, userId, warPrintedId);

        var exWarPrintedData = new ds.ExWarPrintedData();
        exWarPrintedData.medalData = data[0];
        exWarPrintedData.delBagItems = data[1];
        next(null, wrapResult(null, exWarPrintedData, dsNameConsts.ExWarPrintedData));
    });
};

var _addGetMedelTask = function(client, userId, warPrintedId) {
    if (t_medal[warPrintedId].time) return;
    var color = t_item[warPrintedId].color;
    var cTaskType = 0;
    var taskOpt = {};
    if (color == 4) {
        cTaskType = c_prop.cTaskTypeKey.medalSRNum;
    } else if (color == 5) {
        cTaskType = c_prop.cTaskTypeKey.medalSSRNum;
    }
    if (cTaskType > 0)
        taskOpt[cTaskType] = 1;

    taskOpt[c_prop.cTaskTypeKey.medalNum] = 1;
    taskBiz.setTaskValues(uwClient, userId, taskOpt, function() {});
};

/**
 * 更新taptap值
 * @iface updateTap
 * @args {num:"tap值"}
 * @param args
 * @param session
 * @param next
 */
proto.q10 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_updateTap_args;
    var num = args[argsKeys.num];
    //接口调用
    userBiz.updateTap(uwClient, userId, num, function(err, data) {
        next(null, wrapResult(null, null));
    });
};

/**
 * 更新新手弹窗数据
 * @iface updatePopUp
 * @args {popUp:"popUp数值"}
 * @param args
 * @param session
 * @param next
 */
proto.q11 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_updatePopUp_args;
    var popUp = args[argsKeys.popUp];
    //接口调用
    userBiz.updatePopUp(uwClient, userId, popUp, function(err, data) {
        next(null, wrapResult(null, propUtils.delProp(data, ["record"]), dsNameConsts.UserEntity));
    });
};

/**
 * 设置用户icon
 * @iface setIcon
 * @args {id:"英雄id"}
 * @param args
 * @param session
 * @param next
 */
proto.q12 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_setIcon_args;
    var iconId = args[argsKeys.id];
    //接口调用
    userBiz.setIcon(uwClient, userId, iconId, function(err, data) {
        next(null, wrapResult(null, data, dsNameConsts.UserEntity));
    });
};

/**
 * 爱微游实名认证成功 (客户端通知)
 * @iface setAwyVerify
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.q13 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    userBiz.setAwyVerify(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.UserEntity));
    });
};

/**
 * 领取爱微游实名认证奖励
 * @iface getAwyVerifyReward
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.q14 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    userBiz.getAwyVerifyReward(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var getDiamond = data[2];
        // if(getDiamond>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setDiamondRecord(uwClient,userId,c_prop.diamondGetTypeKey.activity,getDiamond, cb1);
        //     });
        // }

        var exUserData = new ds.ExUserData();
        exUserData.userData = data[0];
        exUserData.bagItems = data[1];
        next(null, wrapResult(null, exUserData, dsNameConsts.ExUserData));

    });
};

/**
 * 爱微游分享成功
 * @iface awyShare
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.q15 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    userBiz.awyShare(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.UserEntity));
    });
};

/**
 * 领取爱微游分享奖励
 * @iface getAwyShareReward
 * @args  {idx:'下标索引'}
 * @param args
 * @param session
 * @param next
 */
proto.q16 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_getAwyShareReward_args;
    var idx = args[argsKeys.idx];
    //接口调用
    userBiz.getAwyShareReward(uwClient, userId, idx, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var exUserData = new ds.ExUserData();
        exUserData.userData = data[0];
        exUserData.bagItems = data[1];
        next(null, wrapResult(null, exUserData, dsNameConsts.ExUserData));
    });
};

/**
 * 获取邀请信息
 * @iface getInviteInfo
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.q17 = function(args, session, next) {
    var userId = session.get(consts.session.userId);

    //接口调用
    inviteBiz.getInviteInfo(uwClient, mainClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var inviteData = new ds.InviteData();
        inviteData.invite = data[0];
        next(null, wrapResult(null, inviteData, dsNameConsts.InviteData));
    });
};

/**
 * 领取邀请奖励
 * @iface getInviteReward
 * @args  {idx:'下标索引'}
 * @param args
 * @param session
 * @param next
 */
proto.q18 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_getInviteReward_args;
    var idx = args[argsKeys.idx];

    //接口调用
    inviteBiz.getInviteReward(uwClient, mainClient, userId, idx, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var inviteData = new ds.InviteData();
        inviteData.userData = data[0];
        inviteData.invite = data[1];
        inviteData.bagItems = data[2];
        next(null, wrapResult(null, inviteData, dsNameConsts.InviteData));
    });
};

/**
 * 获取邀请奖励记录表
 * @iface getInviteRewardRecord
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.q19 = function(args, session, next) {
    var userId = session.get(consts.session.userId);

    //接口调用
    inviteBiz.getInviteRewardRecord(mainClient, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var inviteData = new ds.InviteData();
        inviteData.rewardHisList = data;
        next(null, wrapResult(null, inviteData, dsNameConsts.InviteData));
    });
};

/**
 * 通知关注结果
 * @iface setFocus
 * @args {ret:'0'}
 * @param args
 * @param session
 * @param next
 */
proto.q20 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_setFocus_args;
    var ret = 1; //args[argsKeys.ret];
    userBiz.setFocus(uwClient, userId, ret, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.UserEntity));
    });
};
/**
 * 获取绑定手机url
 *@iface getBindPhoneUrl
 * @args
 * @param args
 * @param session
 * @param next
 * @return string url
 */
proto.r = function(args, session, next) {
    var accountId = session.get(consts.session.accountId);
    userBiz.getBindPhoneUrl(mainClient, accountId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var url = data.bindurl || "";
        next(null, wrapResult(null, url));
    });
};


/**
 * 领取玩吧礼包
 *@iface getWanbagift
 * @args {os:"ios", giftId:"901"}
 * @param args
 * @param session
 * @param next
 */
proto.s = function(args, session, next) {
    return next(null, null);
    // var userId = session.get(consts.session.userId);
    // var argsKeys = iface.a_user_getWanbagift_args;
    // var os = args[argsKeys.os];
    // var giftId = args[argsKeys.giftId];
    // //接口调用
    // userBiz.getWanbaGift(uwClient, userId, os, giftId, function(err, data) {
    //     if (err) return next(null, wrapResult(err));
    //     var ex = new ds.WanbaGift;
    //     ex.code = data[0];
    //     ex.message = data[1];
    //     ex.userData = data[2];
    //     ex.bagItems = data[5];
    //     ex.equipBagItems = data[6];
    //     /*
    //     var getDiamond = data[4];
    //     if(getDiamond>0){
    //         gameRecordSerial.add(userId,function(cb1){
    //             gameRecordBiz.setDiamondRecord(uwClient,userId,c_prop.diamondGetTypeKey.mail,getDiamond, cb1);
    //         });
    //     }*/
    //     next(null, wrapResult(null, ex, dsNameConsts.WanbaGift));
    // });
};

/**
 * 更新设置数据
 *@iface updateSetting
 * @args {catNoVipChat:"true", autoBuyLittleHorn:"true", hideChatSys:"false", hideChatWorld:"false", hideChatGuild:"false", hideDanmu:"false"}
 * @param args
 * @param session
 * @param next
 */
proto.t = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_updateSetting_args;
    var catNoVipChat = args[argsKeys.catNoVipChat];
    var autoBuyLittleHorn = args[argsKeys.autoBuyLittleHorn];

    var hideChatSys = args[argsKeys.hideChatSys];
    var hideChatWorld = args[argsKeys.hideChatWorld];
    var hideChatGuild = args[argsKeys.hideChatGuild];
    var hideDanmu = args[argsKeys.hideDanmu];
    userBiz.updateSetting(uwClient, userId, catNoVipChat, autoBuyLittleHorn, hideChatSys, hideChatWorld, hideChatGuild, hideDanmu, function(err, userData) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, userData, dsNameConsts.userData));
    });
};

/**
 * 更新背包某样物品
 *@iface updateItems4Bag
 * @args {itemId:"itemId"}
 * @param args
 * @param session
 * @param next
 */
proto.u = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_updateItems4Bag_args;
    var itemId = args[argsKeys.itemId];
    userBiz.updateItems4Bag(uwClient, userId, itemId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data));
    });
};

/**
 * 更新背包物品 (客户端请求最新背包)
 *@iface syncUserInfo
 * @args
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 */
proto.u2 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_syncUserInfo_args;
    userBiz.syncUserInfo(uwClient, userId, function(err, userData) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, userData, dsNameConsts.UserEntity));
    });
};

/**
 * 购买组队副本次数
 *@iface buyTeamBossNum
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.v = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    userBiz.buyTeamBossNum(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var userData = data[0];
        var costDiamond = data[1];
        // if (costDiamond > 0) {
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.buyTeamBossNum,costDiamond, cb1);
        //     // });
        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(uwClient, userId, taskOpt, function() {
        //     });
        // }
        next(null, wrapResult(null, userData, dsNameConsts.UserEntity));
    });
};

/**
 * 关注组队副本
 *@iface followTeamBoss
 * @args {id:"组队副本id"}
 * @param args
 * @param session
 * @param next
 */
proto.v1 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_followTeamBoss_args;
    var id = args[argsKeys.id];
    userBiz.followTeamBoss(uwClient, userId, id, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var userData = data[0];
        next(null, wrapResult(null, userData, dsNameConsts.UserEntity));
    });
};

/**
 * 取消关注组队副本
 *@iface unfollowTeamBoss
 * @args {id:"组队副本id"}
 * @param args
 * @param session
 * @param next
 */
proto.v2 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_unfollowTeamBoss_args;
    var id = args[argsKeys.id];
    userBiz.unfollowTeamBoss(uwClient, userId, id, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var userData = data[0];
        next(null, wrapResult(null, userData, dsNameConsts.UserEntity));
    });
};

/**
 * 关注中立boss
 *@iface followZhongLiBoss
 * @args {id:"中立Bossid"}
 * @param args
 * @param session
 * @param next
 */
proto.v3 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_followZhongLiBoss_args;
    var id = args[argsKeys.id];
    userBiz.followZhongLiBoss(uwClient, userId, id, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var userData = data[0];
        next(null, wrapResult(null, userData, dsNameConsts.UserEntity));
    });
};

/**
 * 取消关注中立boss
 *@iface unfollowZhongLiBoss
 * @args {id:"中立Bossid"}
 * @param args
 * @param session
 * @param next
 */
proto.v4 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_unfollowZhongLiBoss_args;
    var id = args[argsKeys.id];
    userBiz.unfollowZhongLiBoss(uwClient, userId, id, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var userData = data[0];
        next(null, wrapResult(null, userData, dsNameConsts.UserEntity));
    });
};


/**
 * 玩家主城假用户数据
 *@iface getFakeWSUserList
 * @args
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 */
proto.x = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    userBiz.getFakeWSUserList(uwClient, userId, 20, function(err, dataList) {
        if (err) return next(null, wrapResult(err));
        var wsData = new ds.WSRoleList();
        wsData.roleList = [];
        for (var i = 0; i < dataList.length; i++) {
            var data = dataList[i];
            var wsRoleData = new ds.WSRoleData();
            wsRoleData.userData = {};
            var userData = data[0];
            wsRoleData.userData.id = userData.id;
            wsRoleData.userData.nickName = userData.nickName;
            wsRoleData.userData.lvl = userData.lvl;
            wsRoleData.userData.iconId = userData.iconId;
            wsRoleData.userData.medalTitle = userData.medalTitle;
            wsRoleData.hero = data[1];
            wsRoleData.fightData = data[2];
            wsData.roleList.push(wsRoleData);
        }
        next(null, wrapResult(err, wsData, dsNameConsts.WSRoleList));
    });
};

/**
 * 玩家请求复活
 *@iface relive
 * @args {type:"类型"}
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 */
proto.y = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_relive_args;
    var type = args[argsKeys.type];
    userBiz.relive(uwClient, userId, type, function(err, data) {
        var userData = data[0];
        var costDiamond = data[1];
        // if (costDiamond > 0) {
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.relive,costDiamond, cb1);
        //     // });
        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(uwClient, userId, taskOpt, function() {
        //     });
        // }
        next(null, wrapResult(err, userData, dsNameConsts.UserEntity));
    });
};

/**
 * 奖杯升级
 * @iface upgradeCup
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.c = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    userBiz.upgradeCup(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var exWarPrintedData = new ds.ExWarPrintedData();
        exWarPrintedData.cup = data[0];
        next(null, wrapResult(null, exWarPrintedData, dsNameConsts.ExWarPrintedData));
    });
};

/**
 * 奖杯胶囊使用
 * @iface useCapsule
 * @args {capsuleId:"胶囊id"}
 * @param args
 * @param session
 * @param next
 */
proto.c1 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_useCapsule_args;
    var capsuleId = args[argsKeys.capsuleId];
    userBiz.useCapsule(uwClient, userId, capsuleId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var exWarPrintedData = new ds.ExWarPrintedData();
        exWarPrintedData.capsule = data[0];
        exWarPrintedData.delBagItems = data[1];
        next(null, wrapResult(null, exWarPrintedData, dsNameConsts.ExWarPrintedData));
    });
};

/**
 * 英雄任务奖励领取
 * @iface receiveHeroEntranceTask
 * @args {taskId:"任务id"}
 * @param args
 * @param session
 * @param next
 */
proto.c2 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_receiveHeroEntranceTask_args;
    var taskId = args[argsKeys.taskId];
    userBiz.receiveHeroEntranceTask(uwClient, userId, taskId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var exUserData = new ds.ExUserData();
        exUserData.userData = data[0];
        exUserData.bagItems = data[1];
        next(null, wrapResult(null, exUserData, dsNameConsts.ExUserData));
    });
};

/**
 * 获取扩展字段信息
 * @iface getExData
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.c3 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    userBiz.getExData(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.UserEntity));
    });
};

/**
 * 购买月卡和周卡
 * @iface buyMonthlyOrWeekCard
 * @args {cardId:"卡id，21为周卡，22为月卡"}
 * @param args
 * @param session
 * @param next
 */
proto.c4 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_buyMonthlyOrWeekCard_args;
    var cardId = args[argsKeys.cardId];
    userBiz.buyMonthlyOrWeekCard(uwClient, userId, cardId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        let ret = new ds.ExUserData;
        ret.userData = data[0];
        ret.delBagItems = data[1];
        next(null, wrapResult(null, ret, dsNameConsts.ExUserData));
    });
};


/**
 * 激活贵族
 * @iface activeNoble
 * @args {}
 * @param args
 * @param session
 * @param next
 */
proto.z = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_activeNoble_args;
    //接口调用
    userBiz.activeNoble(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var ret = new ds.ExUserData();
        ret.userData = data[0];
        ret.delBagItems = data[1];
        next(null, wrapResult(null, ret, dsNameConsts.ExUserData));
    })
};

/**
 * 贵族奖励领取
 * @iface nobleReceive
 * @args {type:"0为日常, 1为VIP购买",nobleLevel:"要领取的贵族等级"}
 * @param args
 * @param session
 * @param next
 */
proto.z1 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_nobleReceive_args;
    var type = args[argsKeys.type];
    var nobleLevel = args[argsKeys.nobleLevel];
    //接口调用
    userBiz.nobleReceive(uwClient, userId, type, nobleLevel, function(err, data) {
        if (err) return next(null, wrapResult(err));

        var ret = new ds.ExUserData();
        ret.userData = data[0];
        ret.bagItems = data[1];
        ret.equipBagItems = data[2];
        next(null, wrapResult(err, ret, dsNameConsts.ExUserData));
    })
};
/**
 * 精灵觉醒 精灵觉醒激活
 * @iface elfWakingActivate
 * @args  {elfId:"精灵id"}
 * @param args
 * @param session
 * @param next
 */
proto.w = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_elfWakingActivate_args;
    var elfId = args[argsKeys.elfId];
    userBiz.elfWakingActivate(uwClient, userId, elfId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var exUserData = new ds.ExUserData();
        exUserData.userData = data[0];
        exUserData.heroData = data[1];
        exUserData.delBagItems = data[2];
        next(null, wrapResult(null, exUserData, dsNameConsts.ExUserData));
    })
};

/**
 * 精灵觉醒 精灵觉醒升级
 * @iface elfWakingUpgrade
 * @args  {elfId:"精灵id"}
 * @param args
 * @param session
 * @param next
 */
proto.w1 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_elfWakingUpgrade_args;
    var elfId = args[argsKeys.elfId];
    userBiz.elfWakingUpgrade(uwClient, userId, elfId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var exUserData = new ds.ExUserData();
        exUserData.userData = data[0];
        exUserData.heroData = data[1];
        exUserData.delBagItems = data[2];
        next(null, wrapResult(null, exUserData, dsNameConsts.ExUserData));
    })
};

/**
 * 精灵觉醒 精灵觉醒现身
 * @iface elfWakingAppear
 * @args  {elfId:"精灵id", isAppear:"是否现身"}
 * @param args
 * @param session
 * @param next
 */
proto.w2 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_elfWakingAppear_args;
    var elfId = args[argsKeys.elfId];
    var isAppear = args[argsKeys.isAppear];
    userBiz.elfWakingAppear(uwClient, userId, elfId, isAppear, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var exUserData = new ds.ExUserData();
        exUserData.userData = data[0];
        next(null, wrapResult(null, exUserData, dsNameConsts.ExUserData));
    })
};



/**
 * 无限迷宫 初始化数据
 * @iface initInfiniteMazeData
 * @args  {}
 * @param args
 * @param session
 * @param next
 */
proto.m = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_initInfiniteMazeData_args;
    userBiz.initInfiniteMazeData(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.UserEntity));
    })
};

/**
 * 无限迷宫 开门
 * @iface openMazeDoor
 * @args  {doorId:"门id"}
 * @param args
 * @param session
 * @param next
 */
proto.m1 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_openMazeDoor_args;
    var doorId = args[argsKeys.doorId];
    userBiz.openMazeDoor(uwClient, userId, doorId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var mazeData = new ds.MazeData();
        mazeData.userData = data[0];
        mazeData.bagItems = data[1];
        mazeData.equipBagItems = data[2];
        mazeData.delBagItems = data[3];
        mazeData.addScore = data[4];
        mazeData.isSuccess = data[5];
        mazeData.items = data[6];
        next(null, wrapResult(null, mazeData, dsNameConsts.MazeData));
    })
};

/**
 * 无限迷宫 获取排名 请求rankServer
 * @iface getMazeRankList
 * @args  {}
 * @param args
 * @param session
 * @param next
 */
proto.m2 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_user_getMazeRankList_args;
    userBiz.getMazeRankList(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        // console.error("data=type=>",typeof data);
        // console.error("data==>",data);
        // console.error("data.topList==>",data['topList']);
        var mazeRankData = new ds.MazeRankData();
        mazeRankData.myRank = data[0];
        mazeRankData.myScore = data[1];
        mazeRankData.rankList = data[2];
        // console.error("mazeRankData==>",mazeRankData);
        next(null, wrapResult(null, mazeRankData, dsNameConsts.MazeRankData));
    })
};
