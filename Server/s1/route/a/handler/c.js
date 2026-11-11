/**
 * Created by Administrator on 2015/5/25.
 */
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var t_copy = uwData.t_copy;
var copyBiz = require("uw-copy").copyBiz;
var taskBiz = require("uw-task").taskBiz;
var uwClient = require("uw-db").uwClient;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var c_prop = uwData.c_prop;
var ds = require("uw-ds").ds;
var copyProgressDao = require('uw-copy').copyProgressDao;
var userBiz = require("uw-user").userBiz;
var taskBiz = require("uw-task").taskBiz;
var proto = module.exports;

/**
 * 获取副本列表
 * @iface getInfo
 * @args {type:"副本类型"}
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 */
proto.a = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_copy_getInfo_args;
    var type = args[argsKeys.type];
    copyBiz.getInfo(uwClient, userId, type, function(err, data) {
        if (err) return next(null, wrapResult(err, null));
        next(null, wrapResult(null, data, dsNameConsts.CopyProgressEntity));
    })
};

/**
 * 购买挑战次数
 * @iface buyCopyCount
 * @args {type:"副本类型",copyId:"副本id"}
 * @param args
 * @param session
 * @param next
 */
proto.b = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_copy_buyCopyCount_args;
    var type = args[argsKeys.type];
    var copyId = args[argsKeys.copyId];
    copyBiz.buyCopyCount(uwClient, userId, type, copyId, function(err, buyCopyCountData) {
        if (err) return next(null, wrapResult(err, null));
        var costDiamond = buyCopyCountData[2];
        // if (costDiamond > 0) {
        //     var diamondCostTypeKey = 0;
        //     switch (type) {
        //         case c_prop.copyTypeKey.equip:      //装备副本
        //             diamondCostTypeKey = c_prop.diamondCostTypeKey.equipCopyCount;
        //             break;
        //         case c_prop.copyTypeKey.hell:      //Boss副本
        //             diamondCostTypeKey = c_prop.diamondCostTypeKey.bossCopyCount;
        //             break;
        //         case c_prop.copyTypeKey.state:      //境界副本
        //             diamondCostTypeKey = c_prop.diamondCostTypeKey.realmCopyCount;
        //             break;
        //         case c_prop.copyTypeKey.paTa:      //爬塔
        //             diamondCostTypeKey = c_prop.diamondCostTypeKey.paTaAward;
        //             break;
        //     }
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,diamondCostTypeKey,costDiamond, cb1);
        //     // });

        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(uwClient, userId, taskOpt, function() {
        //     });
        // }
        var opponent = new ds.ExUserData();
        opponent.userData = buyCopyCountData[0];
        opponent.copyProgressData = buyCopyCountData[1];
        next(null, wrapResult(null, opponent, dsNameConsts.ExUserData));
    });
};

/**
 * 购买装备入场卷
 * @iface buyEquipTessera
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.c = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    copyBiz.buyEquipTessera(uwClient, userId, function(err, buyTesseraData) {
        if (err) return next(null, wrapResult(err, null));
        var costDiamond = buyTesseraData[3];
        // if (costDiamond > 0) {
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.buyEquipTessera,costDiamond,cb1);
        //     // });
        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(uwClient, userId, taskOpt, function() {
        //     });
        // }
        var opponent = new ds.ExUserData();
        opponent.userData = buyTesseraData[0];
        opponent.bagItems = buyTesseraData[1];
        opponent.equipBagItems = buyTesseraData[2];
        next(null, wrapResult(null, opponent, dsNameConsts.ExUserData));
    });
};

/**
 * 购买境界入场卷
 * @iface buyRealmTessera
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.d = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    copyBiz.buyRealmTessera(uwClient, userId, function(err, buyTesseraData) {
        if (err) return next(null, wrapResult(err, null));
        var costDiamond = buyTesseraData[3];
        // if (costDiamond > 0) {
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.buyRealmTessera,costDiamond,cb1);
        //     // });
        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(uwClient, userId, taskOpt, function() {
        //     });
        // }
        var opponent = new ds.ExUserData();
        opponent.userData = buyTesseraData[0];
        opponent.bagItems = buyTesseraData[1];
        opponent.equipBagItems = buyTesseraData[2];
        next(null, wrapResult(null, opponent, dsNameConsts.ExUserData));
    });
};

/**
 * 扫荡
 * @iface copyWipe
 * @args {copyId:"副本id",num:"扫荡次数"}
 * @param args
 * @param session
 * @param next
 * @returns [ds.FightResult]
 */
proto.e = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_copy_copyWipe_args;
    var copyId = args[argsKeys.copyId];
    var num = args[argsKeys.num];
    if(isNaN(num) || parseInt(num) <=0) return next(null, wrapResult("ERROR: INVALID PARA"));
    copyBiz.copyWipe(uwClient, userId, copyId, num, function(err, data) {
        if (err) return next(null, wrapResult(err, null));
        var costDiamond = data[6];
        var type = data[7];
        // if (costDiamond > 0) {
        //     var diamondCostTypeKey = 0;
        //     switch (type) {
        //         case c_prop.copyTypeKey.equip:      //装备副本
        //             diamondCostTypeKey = c_prop.diamondCostTypeKey.equipCopyCount;
        //             break;
        //         case c_prop.copyTypeKey.state:      //境界副本
        //             diamondCostTypeKey = c_prop.diamondCostTypeKey.realmCopyCount;
        //             break;
        //     }
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     if(diamondCostTypeKey){
        //     //         gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.buyRealmTessera,costDiamond, cb1);
        //     //     }
        //     // });
        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(uwClient, userId, taskOpt, function() {
        //     });
        // }
        var wipeCount = data[5];
        var exData = new ds.ExCopyProgress();
        exData.userData = data[0];
        exData.copyProgress = data[1];
        exData.bagItems = data[2];
        exData.equipBagItems = data[3];
        exData.delBagItems = data[4];
        exData.items = data[8];
        exData.wipeCount = wipeCount;
        next(null, wrapResult(null, exData, dsNameConsts.ExCopyProgress));
        for (var i = 0; i < wipeCount; i++) {
            _addCopyTask(uwClient, userId, copyId, 1, function() {
            });
        }
    });
};


/**
 * 副本开始
 * @iface start
 * @args {copyId:"副本id",biCost:"消耗log",manyNum:"深渊多次进入次数"}
 * @param args
 * @param session
 * @param next
 * @returns [ds.ExCopyProgress]
 */
proto.f = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_copy_start_args;
    var copyId = args[argsKeys.copyId];
    var biCost = args[argsKeys.biCost];
    var manyNum = args[argsKeys.manyNum];
    if (isNaN(manyNum) || manyNum <= 0){
        return next(null, wrapResult("ERROR: INVALID PARA"));
    }
    copyBiz.start(uwClient, userId, copyId, biCost, manyNum, function(err, data) {
        if (err) return next(null, wrapResult(err, null));
        var costDiamondRecord = data[5];
        var costDiamond = costDiamondRecord[1] || 0;
        // if (costDiamond > 0) {
        //     var diamondCostTypeKey = 0;
        //     switch (costDiamondRecord[0]) {
        //         case c_prop.copyTypeKey.equip://装备副本,装备入场券
        //             diamondCostTypeKey = c_prop.diamondCostTypeKey.buyEquipTessera;
        //             break;
        //         case c_prop.copyTypeKey.hell://boss试炼副本,boss令牌
        //             diamondCostTypeKey = c_prop.diamondCostTypeKey.buyBossTessera;
        //             break;
        //         case c_prop.copyTypeKey.state://境界副本，入场券
        //             diamondCostTypeKey = c_prop.diamondCostTypeKey.buyRealmTessera;
        //             break;
        //     }
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,diamondCostTypeKey,costDiamond, cb1);
        //     // });
        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(uwClient, userId, taskOpt, function() {
        //     });
        // }
        var exData = new ds.ExCopyProgress();
        exData.userData = data[0];
        exData.copyProgress = data[1];
        exData.copyLoot = data[2];
        exData.delBagItems = data[4];
        next(null, wrapResult(null, exData, dsNameConsts.ExCopyProgress));
    });
};

/**
 * 副本结束
 * @iface end
 * @args {copyId:"副本id",fightData:"战斗验证数据",isWin:"是否胜利"}
 * @param args
 * @param session
 * @param next
 * @returns [ds.ExCopyProgress]
 */
proto.g = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_copy_end_args;
    var copyId = args[argsKeys.copyId];
    var fightData = args[argsKeys.fightData];
    var isWin = args[argsKeys.isWin];
    copyBiz.end(uwClient, userId, copyId, isWin, fightData, function(err, data) {
        if (err) return next(null, wrapResult(err, null));
        gameRecordSerial.add(userId, function(cb1) {
            gameRecordBiz.setCopyCount(uwClient, userId, cb1);
        });

        var exData = new ds.ExCopyProgress();
        exData.userData = data[0];
        exData.copyProgress = data[1];
        exData.bagItems = data[2];
        exData.equipBagItems = data[3];
        exData.guildData = data[4];
        exData.guildPersonalData = data[5];
        exData.heroTempId = data[7];
        exData.delBagItems = data[8];
        next(null, wrapResult(null, exData, dsNameConsts.ExCopyProgress));
        _addCopyTask(uwClient, userId, copyId, isWin, function() {
        });
        // var getDiamond = data[6];
        // if(getDiamond>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setDiamondRecord(uwClient,userId,c_prop.diamondGetTypeKey.monster,getDiamond, cb1);
        //     });
        // }
    });
};

/**
 * 更新连胜
 * @iface updateWinningStreak
 * @args {copyId:"副本id"}
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns [ds.FightResult]
 */
proto.h = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_copy_updateWinningStreak_args;
    var copyId = args[argsKeys.copyId];
    copyBiz.updateWinningStreak(uwClient, userId, copyId, function(err, data) {
        if (err) return next(null, wrapResult(err, null));
        next(null, wrapResult(null, data, dsNameConsts.CopyProgressEntity));
    });
};

/**
 * 查看
 * @iface setRead
 * @args {copyId:"副本id"}
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns [ds.CopyProgressEntity]
 */
proto.i = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_copy_setRead_args;
    var copyId = args[argsKeys.copyId];
    copyBiz.setRead(uwClient, userId, copyId, function(err, data) {
        if (err) return next(null, wrapResult(err, null));
        next(null, wrapResult(null, data, dsNameConsts.CopyProgressEntity));
    });
};

/**
 * 行会副本开始
 * @iface guildStart
 * @args {copyId:"章节id",bossId:"bossid"}
 * @param args
 * @param session
 * @param next
 * @returns []
 */
proto.j = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_copy_guildStart_args;
    var copyId = args[argsKeys.copyId];
    var bossId = args[argsKeys.bossId];
    copyBiz.guildStart(uwClient, userId, copyId, bossId, function(err, data) {
        if (err) return next(null, wrapResult(err, null));
        next(null, wrapResult(null, data));
    });
};

/**
 * 行会副本结束
 * @iface guildEnd
 * @args {copyId:"章节id",bossId:"bossid",isWin:"结果"}
 * @param args
 * @param session
 * @param next
 * @returns [ds.ExCopyProgress]
 */
proto.k = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_copy_guildEnd_args;
    var copyId = args[argsKeys.copyId];
    var bossId = args[argsKeys.bossId];
    var isWin = args[argsKeys.isWin];
    copyBiz.guildEnd(uwClient, userId, copyId, bossId, isWin, function(err, data) {
        if (err) return next(null, wrapResult(err, null));
        gameRecordSerial.add(userId, function(cb1) {
            gameRecordBiz.setCopyCount(uwClient, userId, cb1);
        });

        var exData = new ds.ExCopyProgress();
        exData.userData = data[0];
        exData.copyProgress = data[1];
        exData.bagItems = data[2];
        exData.equipBagItems = data[3];
        exData.guildData = data[4];
        exData.isWin = data[6];
        exData.progress = data[7];
        exData.items = data[8];
        exData.msg = data[9];
        next(null, wrapResult(null, exData, dsNameConsts.ExCopyProgress));
        taskBiz.setTaskValue(uwClient, userId, c_prop.cTaskTypeKey.guildCopy, 1, function() {
        });
        // var getDiamond = data[5];
        // if(getDiamond>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setDiamondRecord(uwClient,userId,c_prop.diamondGetTypeKey.monster,getDiamond, cb1);
        //     });
        // }
    });
};

/**
 * 行会副本领取奖励
 * @iface guildCopyAward
 * @args {type:"boss或章节",typeId:"bossId或章节id"}
 * @param args
 * @param session
 * @param next
 * @returns [ds.ExCopyProgress]
 */
proto.l = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_copy_guildCopyAward_args;
    var type = args[argsKeys.type];
    var typeId = args[argsKeys.typeId];
    copyBiz.guildCopyAward(uwClient, userId, type, typeId, function(err, data) {
        if (err) return next(null, wrapResult(err, null));
        var exData = new ds.ExCopyProgress();
        exData.userData = data[0];
        exData.copyProgress = data[1];
        exData.bagItems = data[2];
        exData.equipBagItems = data[3];
        next(null, wrapResult(null, exData, dsNameConsts.ExCopyProgress));
    });
};

/**
 * 行会副本重置
 * @iface guildCopyReset
 * @args
 * @param args
 * @param session
 * @param next
 * @returns []
 */
proto.m = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    copyBiz.guildCopyReset(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err, null));
        next(null, wrapResult(null, data, dsNameConsts.GuildEntity));
    });
};

/**
 * 公会副本清除CD
 * @iface clearGuildCopy
 * @args {bossId:"bossID"}
 * @param args
 * @param session
 * @param next
 */
proto.n = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_copy_clearGuildCopy_args;
    var bossId = args[argsKeys.bossId];
    copyBiz.clearGuildCopy(uwClient, userId, bossId, function(err, buyCopyCountData) {
        if (err) return next(null, wrapResult(err, null));
        var costDiamond = buyCopyCountData[2];
        // if (costDiamond > 0) {
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.clearGuildCopy,costDiamond, cb1);
        //     // });
        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(uwClient, userId, taskOpt, function() {
        //     });
        // }
        var opponent = new ds.ExUserData();
        opponent.userData = buyCopyCountData[0];
        opponent.copyProgressData = buyCopyCountData[1];
        next(null, wrapResult(null, opponent, dsNameConsts.ExUserData));
    });
};

/**
 * 爬塔领取奖励
 * @iface paTaAward
 * @args {copyId:"副本id"}
 * @param args
 * @param session
 * @param next
 * @returns [ds.ExCopyProgress]
 */
proto.o = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_copy_paTaAward_args;
    var copyId = args[argsKeys.copyId];
    copyBiz.paTaAward(uwClient, userId, copyId, function(err, data) {
        if (err) return next(null, wrapResult(err, null));
        // var getDiamond = data[4];
        // if(getDiamond>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setDiamondRecord(uwClient,userId,c_prop.diamondGetTypeKey.monster,getDiamond, cb1);
        //     });
        // }
        var exData = new ds.ExCopyProgress();
        exData.userData = data[0];
        exData.copyProgress = data[1];
        exData.bagItems = data[2];
        exData.equipBagItems = data[3];
        next(null, wrapResult(null, exData, dsNameConsts.ExCopyProgress));
    });
};

/**
 * 爬塔宝库抽奖
 * @iface paTaTreasury
 * @args {free:"是否为免费，免费为1，付费为0"}
 * @param args
 * @param session
 * @param next
 * @returns [ds.ExCopyProgress]
 */
proto.o1 = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_copy_paTaTreasury_args;
    var free = args[argsKeys.free];
    copyBiz.paTaTreasury(uwClient, userId, free, function(err, data) {
        if (err) return next(null, wrapResult(err, null));
        var costDiamond = data[5];
        // if (costDiamond > 0) {
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.paTaAward,costDiamond, cb1);
        //     // });

        //     var taskOpt = {};
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        //     taskBiz.setTaskValues(uwClient, userId, taskOpt, function() {
        //     });
        // }
        var exData = new ds.ExCopyProgress();
        exData.userData = data[0];
        exData.copyProgress = data[1];
        exData.bagItems = data[2];
        exData.equipBagItems = data[3];
        exData.delBagItems = data[4];
        exData.items = data[6];
        next(null, wrapResult(null, exData, dsNameConsts.ExCopyProgress));
        taskBiz.setTaskValue(uwClient, userId, c_prop.cTaskTypeKey.paTaLottery, 1, function() {
        });
    });
};

/**
 * 推图副本领取奖励
 * @iface normalAward
 * @args {copyId:"副本id"}
 * @param args
 * @param session
 * @param next
 * @returns [ds.ExCopyProgress]
 */
proto.p = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_copy_normalAward_args;
    var copyId = args[argsKeys.copyId];
    copyBiz.normalAward(uwClient, userId, copyId, function(err, data) {
        if (err) return next(null, wrapResult(err, null));
        // var getDiamond = data[4];
        // if(getDiamond>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setDiamondRecord(uwClient,userId,c_prop.diamondGetTypeKey.monster,getDiamond, cb1);
        //     });
        // }
        var exData = new ds.ExCopyProgress();
        exData.userData = data[0];
        exData.copyProgress = data[1];
        exData.bagItems = data[2];
        exData.equipBagItems = data[3];

        exData.heroTempId = data[5];
        exData.heroData = data[6];
        next(null, wrapResult(null, exData, dsNameConsts.ExCopyProgress));
    });
};

/**
 * 深渊副本抽奖
 * @iface syCopyLottery
 * @args {index:"索引号"}
 * @param args
 * @param session
 * @param next
 * @returns [ds.ExUserData]
 */
proto.q = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_copy_syCopyLottery_args;
    var index = args[argsKeys.index];
    copyBiz.syCopyLottery(uwClient, userId, index, function(err, data) {
        if (err) return next(null, wrapResult(err, null));

        var exData = new ds.ExUserData();
        exData.userData = data[0];
        exData.bagItems = data[1];
        exData.equipBagItems = data[2];
        exData.delBagItems = data[3];
        next(null, wrapResult(null, exData, dsNameConsts.ExUserData));
    });
};

/**
 * 掉落记录
 * @iface getCopyLootRecordList
 * @args
 * @param args
 * @param session
 * @param next
 * @returns [ds.ExUserData]
 */
proto.r = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    copyBiz.getCopyLootRecordList(uwClient, function(err, data) {
        if (err) return next(null, wrapResult(err, null));
        next(null, wrapResult(null, data, dsNameConsts.CopyLootRecordEntity));
        // var exData = new ds.ExUserData();
        // exData.userData = data[0]; 
        // exData.bagItems = data[1];
        // exData.equipBagItems = data[2];
        // exData.delBagItems = data[3]; 
        // next(null, wrapResult(null, exData, dsNameConsts.CopyLootRecordEntity));
    });
};

var _addCopyTask = function(uwClient, userId, copyId, isWin, cb) {
    var taskType = 0;
    var medalLootType = 0;
    var t_copyData = t_copy[copyId];
    if (t_copyData.type == c_prop.copyTypeKey.normal) {
        taskType = c_prop.cTaskTypeKey.closeTollGate;
        medalLootType = c_prop.medalLootTypeKey.closeTollGate;
    } else if (t_copyData.type == c_prop.copyTypeKey.equip) {
        taskType = c_prop.cTaskTypeKey.equipCopy;
        medalLootType = c_prop.medalLootTypeKey.equipCopy;
    } else if (t_copyData.type == c_prop.copyTypeKey.hell) {
        taskType = c_prop.cTaskTypeKey.hell;
        medalLootType = c_prop.medalLootTypeKey.hell;
    } else if (t_copyData.type == c_prop.copyTypeKey.state) {
        taskType = c_prop.cTaskTypeKey.state;
        medalLootType = c_prop.medalLootTypeKey.state;
    } else if (t_copyData.type == c_prop.copyTypeKey.paTa) {
        taskType = c_prop.cTaskTypeKey.paTa;
        medalLootType = c_prop.medalLootTypeKey.paTa;
    } else if (t_copyData.type == c_prop.copyTypeKey.vip7) {
        taskType = c_prop.cTaskTypeKey.copyV7;
    } else if (t_copyData.type == c_prop.copyTypeKey.vip10) {
        taskType = c_prop.cTaskTypeKey.copyV10;
    } else if (t_copyData.type == c_prop.copyTypeKey.vip14) {
        taskType = c_prop.cTaskTypeKey.copyV14;
    } else if (t_copyData.type == c_prop.copyTypeKey.vip17) {
        taskType = c_prop.cTaskTypeKey.copyV17;
    } else if (t_copyData.type == c_prop.copyTypeKey.vip19) {
        taskType = c_prop.cTaskTypeKey.copyV19;
    }
    if (isWin) {
        if (taskType != 0) {
            taskBiz.setTaskValue(uwClient, userId, taskType, copyId, cb);
        }
        if (medalLootType != 0) {
            userBiz.setMedalValue(uwClient, userId, medalLootType, copyId, cb);
        }
        if(taskType = c_prop.cTaskTypeKey.copyV7){
            //精灵副本（紧急委托任务）
            taskBiz.setEntrustTaskValue(uwClient, userId, c_prop.entrustTaskTypeKey.fairyCopy, copyId, function() {});
        }
    }
};

/**
 * 购买探险秘境的体力
 * @iface buyPataPower
 * @args
 * @param args
 * @param session
 * @param next
 * @returns [UserEntity]
 */
proto.s = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    copyBiz.buyPataPower(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err, null));
        next(null, wrapResult(null, data, dsNameConsts.UserEntity));
    });
};

//通关关卡获得勋章测试
// if(require.main = module){
//     _addCopyTask(uwClient, 72346, 8100, true, function(err, data){console.log(err)})
// }


