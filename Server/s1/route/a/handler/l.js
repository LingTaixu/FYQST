/**
 * Created by Sara on 2015/10/4.
 */
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var c_prop = uwData.c_prop;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var lotteryBiz = require("uw-lottery").lotteryBiz;
var ds = require("uw-ds").ds;
var uwClient = require("uw-db").uwClient;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var taskBiz = require("uw-task").taskBiz;

var proto = module.exports;

/**
 * 抽奖
 * @iface lottery
 * @args {type:"抽奖类型",count:"抽奖次数"}
 * @param args
 * @param session
 * @param next
 */
proto.a = function (args, session, next) {
    var argsKeys = iface.a_lottery_lottery_args;
    var userId = session.get(consts.session.userId); 
    var type = args[argsKeys.type];
    var count = args[argsKeys.count];
    count = parseInt(count);
    if (count != 1 && count != 10) return next(null, wrapResult("异常!"));
    //todo  目前用不到
    return next(null, wrapResult("作废!"));
    //接口调用
    lotteryBiz.lottery(uwClient,userId,type,count,function(err,data){
        if(err) return next(null,wrapResult(err));
        var costDiamond = data[7];
        var taskOpt = {};
        // if(costDiamond>0){
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.lottery,costDiamond, cb1);
        //     // });

        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond; 
        // }

        taskOpt[c_prop.cTaskTypeKey.treasure] = 1;
        taskBiz.setTaskValues(uwClient,userId,taskOpt,function() {}); 

        var exData = new ds.ExUserData();
        exData.userData = data[0];
        exData.lotteryData = data[1];
        exData.items = data[2];
        exData.treasureValue = data[3];
        exData.bagItems = data[4];
        exData.delBagItems = data[5];
        exData.equipBagItems = data[6];
        next(null,wrapResult(null,exData,dsNameConsts.ExUserData)); 
    });
};

/**
 * 领取探宝值宝箱
 * @iface getTreasureChest
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.b = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    lotteryBiz.getTreasureChest(uwClient,userId,function(err,data){
        if (err) return next(null,wrapResult(err));
        var exData = new ds.ExUserData();
        exData.userData = data[0];
        exData.lotteryData = data[1];
        exData.items = data[2];
        exData.cosTreValue = data[3];
        exData.bagItems = data[4];
        exData.equipBagItems = data[5];
        next(null,wrapResult(null,exData,dsNameConsts.ExUserData));
    });
};

/**
 * 初始化数据
 * @iface getInfo
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.c = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    lotteryBiz.getInfo(uwClient,userId,function(err,data){
        if (err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.LotteryEntity));
    });
};