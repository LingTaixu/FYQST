/**
 * Created by Sara on 2015/5/28.
 */

var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var guildPersonalBiz = require("uw-guild").guildPersonalBiz;
var uwClient = require("uw-db").uwClient;
var ds = require("uw-ds").ds;
var c_prop = uwData.c_prop;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var taskBiz = require("uw-task").taskBiz;

var proto = module.exports;

/**
 * 贡献
 * @iface pickAct
 * @args {actId:"贡献id"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExGuildData
 */
proto.a = function (args, session, next) {
    var userId = session.get(consts.session.userId); 
    var argsKeys = iface.a_guildPerson_pickAct_args ;
    var actId = args[argsKeys.actId];
    //接口调用
    guildPersonalBiz.pickAct(uwClient,userId ,actId ,function(err,data){
        if(err) return next(null,wrapResult(err));
        var ex = new ds.ExGuildData();
        ex.userData = data[0];//
        ex.guildData = data[1];//
        ex.guildPersonalData = data[2];
        ex.addAct = data[5];
        ex.bagItems = data[6];
        
        var costDiamond = data[3];
        var costGold = data[4];
        var addAct = data[5];
        var taskOpt = {};
        // if(costDiamond>0){
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.guildAct,costDiamond, cb1);
        //     // });

        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        // }

        // if(costGold>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setCostGoldRecord(uwClient,userId,c_prop.goldCostTypeKey.guildAct,costGold, cb1);
        //     });
        // }

        if (addAct > 0){
            taskOpt[c_prop.cTaskTypeKey.guildPersonAct] = addAct;
        }
        taskBiz.setTaskValues(uwClient,userId,taskOpt,function() {}); 

        next(null,wrapResult(null,ex,dsNameConsts.ExGuildData));
    })
};


/**
 * 获取成员列表
 * @iface getMemberList
 * @args
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns ds.GuildMember
 */
proto.b = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    guildPersonalBiz.getMemberList(uwClient,userId ,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.GuildMember));
    })
};


/**
 * 操作会员
 * @iface opMember
 * @args {targetUserId:"对方userId",op:"操作类型"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExGuildData
 */
proto.c = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_guildPerson_opMember_args ;
    var targetUserId = args[argsKeys.targetUserId];
    var op = args[argsKeys.op];
    //接口调用
    guildPersonalBiz.opMember(uwClient,userId ,targetUserId ,op,function(err,data){
        if(err) return next(null,wrapResult(err));
        var ex = new ds.ExGuildData();
        ex.guildData = data[0];//
        ex.guildPersonalData = data[1];
        next(null,wrapResult(null,ex,dsNameConsts.ExGuildData));
    })
};


/**
 * 领取公会日活跃度宝箱
 * @iface getGTVitalityChest
 * @args {index:"宝箱下标"}
 * @param args
 * @param session
 * @param next
 */
proto.d = function (args, session, next) {
    var argsKeys = iface.a_guildPerson_getGTVitalityChest_args;
    var userId = session.get(consts.session.userId);
    var index = args[argsKeys.index]; 
    //接口调用
    guildPersonalBiz.getGTVitalityChest(uwClient,userId,index,function(err,data){
        if (err) return next(null,wrapResult(err));
        // var getDiamond = data[3];
        // if(getDiamond>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setDiamondRecord(uwClient,userId,c_prop.diamondGetTypeKey.guildDayVitalityChest,getDiamond, cb1);
        //     });
        // }
        var exData = new ds.ExGuildData();
        exData.userData = data[0];
        exData.guildPersonalData = data[1];
        exData.bagItems = data[2]; 
        next(null,wrapResult(null,exData,dsNameConsts.ExGuildData));
    });
};


/**
 * 领取公会周活跃度宝箱
 * @iface getGWVitalityChest
 * @args {index:"宝箱下标"}
 * @param args
 * @param session
 * @param next
 */
proto.e = function (args, session, next) {
    var argsKeys = iface.a_guildPerson_getGWVitalityChest_args;
    var userId = session.get(consts.session.userId);
    var index = args[argsKeys.index]; 
    //接口调用
    guildPersonalBiz.getGWVitalityChest(uwClient,userId,index,function(err,data){
        if (err) return next(null,wrapResult(err));
        // var getDiamond = data[3];
        // if(getDiamond>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setDiamondRecord(uwClient,userId,c_prop.diamondGetTypeKey.guildWeekVitalityChest,getDiamond, cb1);
        //     });
        // }
        var exData = new ds.ExGuildData();
        exData.userData = data[0];
        exData.guildPersonalData = data[1];
        exData.bagItems = data[2]; 
        next(null,wrapResult(null,exData,dsNameConsts.ExGuildData));
    });
};

/**
 * 领取公会礼包
 * @iface getGift
 * @args {id:"礼包id"}
 * @param args
 * @param session
 * @param next
 */
proto.f = function (args, session, next) {
    var argsKeys = iface.a_guildPerson_getGift_args;
    var userId = session.get(consts.session.userId);
    var id = args[argsKeys.id]; 
    //接口调用
    guildPersonalBiz.getGift(uwClient,userId,id,function(err,data){
        if (err) return next(null,wrapResult(err));
        // var getDiamond = data[3];
        // if(getDiamond>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setDiamondRecord(uwClient,userId,c_prop.diamondGetTypeKey.guildGrownGift,getDiamond, cb1);
        //     });
        // }
        var exData = new ds.ExGuildData();
        exData.userData = data[0];
        exData.guildPersonalData = data[1];
        exData.bagItems = data[2]; 
        next(null,wrapResult(null,exData,dsNameConsts.ExGuildData));
    });
};

/**
 * 领取公会日捐献宝箱
 * @iface getFuliChest
 * @args {index:"宝箱索引"}
 * @param args
 * @param session
 * @param next
 */
proto.g = function (args, session, next) {
    var argsKeys = iface.a_guildPerson_getFuliChest_args;
    var userId = session.get(consts.session.userId);
    var index = args[argsKeys.index]; 
    //接口调用
    guildPersonalBiz.getFuliChest(uwClient,userId,index,function(err,data){
        if (err) return next(null,wrapResult(err));
        // var getDiamond = data[3];
        // if(getDiamond>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setDiamondRecord(uwClient,userId,c_prop.diamondGetTypeKey.guildFuliChest,getDiamond, cb1);
        //     });
        // }
        var exData = new ds.ExGuildData();
        exData.userData = data[0];
        exData.guildPersonalData = data[1];
        exData.bagItems = data[2]; 
        next(null,wrapResult(null,exData,dsNameConsts.ExGuildData));
    });
};
