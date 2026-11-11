/**
 * Created by Sara on 2015/10/6.
 */
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var uwData = require("uw-data");
var consts = uwData.consts;
var c_prop = uwData.c_prop;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var taskBiz = require("uw-task").taskBiz;
var activityBiz = require("uw-activity").activityBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var ds = require("uw-ds").ds;
var uwClient = require("uw-db").uwClient;   
var employBiz = require("uw-employ").employBiz;
var heroBiz = require("uw-hero").heroBiz;

var proto = module.exports;

/**
 * 获得雇佣数据
 * @iface getInfo
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.a = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用 
    employBiz.getInfo(uwClient,userId,function(err,data){
        if (err) return next(null,wrapResult(err));
        var exData = new ds.ExUserData();
        exData.userData = data; 
        next(null,wrapResult(null,exData,dsNameConsts.ExUserData));
    });
}; 

/**
 * 雇佣
 * @iface employ
 * @args {idx:"雇佣位置"}
 * @param args
 * @param session
 * @param next
 */
proto.b = function (args, session, next) {
    var argsKeys = iface.a_employ_employ_args;
    var userId = session.get(consts.session.userId);
    var idx = args[argsKeys.idx]; 
    //接口调用 
    employBiz.employ(uwClient,userId,idx,function(err,data){
        if (err) return next(null,wrapResult(err));
        var exData = new ds.ExUserData();
        exData.userData = data[0];
        var costDiamond = data[1];
        var costGold = data[2];

        // 任务
        var eper = data[0].employData.eper; 
        //console.log("employ:", eper);

        var taskOpt = {};
        taskOpt[_getTaskTypeByEmployId(eper.id)] = 1; 
        if (eper.id == 5 || eper.id == 6){
            taskOpt[c_prop.cTaskTypeKey.employSUpNum] = 1; 
        } 
        if (eper.id == 5){
            taskOpt[c_prop.cTaskTypeKey.employerSNum] = 1;  
        }else if (eper.id == 6){
            taskOpt[c_prop.cTaskTypeKey.employerSSNum] = 1;  
        }
        if(eper.id >= 4){//A级
            activityBiz.recordCarnivalValue(uwClient,userId, c_prop.carnivalTaskTypeKey.employNum, 1, function(){});
            activityBiz.recordLachelFitnessValue(uwClient,userId, c_prop.lachelActTaskTypeKey.employNum, 1, null, function(){});
            heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.employANum, 1);
        }
        // if(costGold>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setCostGoldRecord(uwClient,userId,c_prop.goldCostTypeKey.employ,costGold, cb1);
        //     });
        // }
        // if (costDiamond > 0){
        //     // gameRecordSerial.add(userId, function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.employ,costDiamond, cb1);
        //     // });
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond; 
        // }
        
        taskOpt[c_prop.cTaskTypeKey.employNum] = 1; 
        taskOpt[c_prop.cTaskTypeKey.exploreDegree] = eper.degree;  
        taskBiz.setTaskValues(uwClient,userId,taskOpt,function() {}); 
        next(null,wrapResult(null,exData,dsNameConsts.ExUserData));
    });  
};

/**
 * 刷新雇佣列表
 * @iface refresh
 * @args 
 * @param args
 * @param session
 * @param next
 */
proto.c = function (args, session, next) {    
    var userId = session.get(consts.session.userId);
    //接口调用 
    employBiz.refresh(uwClient,userId,function(err,data){
        if (err) return next(null,wrapResult(err));
        var exData = new ds.ExUserData();
        exData.userData = data[0];
        var costDiamond = data[1]; 

        var taskOpt = {};
        // if (costDiamond > 0){
        //     // gameRecordSerial.add(userId, function(cb1){
        //     //     // todo liuqiang
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.employ,costDiamond, cb1);
        //     // });
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond; 
        // }
        taskBiz.setTaskValues(uwClient,userId,taskOpt,function() {});

        next(null,wrapResult(null,exData,dsNameConsts.ExUserData));
    });  
};

/**
 * 减少探索时间
 * @iface reduceCD
 * @args 
 * @param args
 * @param session
 * @param next
 */
proto.d = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用 
    employBiz.reduceCD(uwClient,userId,function(err,data){
        if (err) return next(null,wrapResult(err));
        var exData = new ds.ExUserData();
        exData.userData = data[0];
        exData.delBagItems = data[1]; 
        next(null,wrapResult(null,exData,dsNameConsts.ExUserData));
    });  
};

/**
 * 点击领取奖励信息
 * @iface reward
 * @args {idx:"奖励索引"}
 * @param args
 * @param session
 * @param next
 */
proto.e = function (args, session, next) {
    var argsKeys = iface.a_employ_reward_args;
    var userId = session.get(consts.session.userId);
    var idx = args[argsKeys.idx]; 
    //接口调用 
    employBiz.reward(uwClient,userId,idx,function(err,data){
        if (err) return next(null,wrapResult(err));
        var exData = new ds.ExUserData();
        exData.userData = data[0];
        exData.bagItems = data[1];
        exData.equipBagItems = data[2]; 
        next(null,wrapResult(null,exData,dsNameConsts.ExUserData));
    }); 
};

/**
 * 雇佣完成额外奖励
 * @iface getExtItems
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.e2 = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用 
    employBiz.getExtItems(uwClient,userId,function(err,data){
        if (err) return next(null,wrapResult(err));
        var exData = new ds.ExUserData();
        exData.userData = data[0];
        exData.bagItems = data[1];
        exData.equipBagItems = data[2]; 
        next(null,wrapResult(null,exData,dsNameConsts.ExUserData));
    }); 
};

/**
 * 探索失败，领取失败奖励
 * @iface feedback
 * @args 
 * @param args
 * @param session
 * @param next
 */
proto.f = function (args, session, next) { 
    var userId = session.get(consts.session.userId);
    //接口调用 
    employBiz.feedback(uwClient,userId, function(err,data){
        if (err) return next(null,wrapResult(err));
        var exData = new ds.ExUserData();
        exData.userData = data[0]; 
        taskBiz.setTaskValue(uwClient, userId, c_prop.cTaskTypeKey.exploreFail, 1, function(err, data){});
        next(null,wrapResult(null,exData,dsNameConsts.ExUserData));
    }); 
};


/**
 * 获得雇佣奖励记录
 * @iface getRewardHistory
 * @args  {type:"记录类型"}
 * @param args
 * @param session
 * @param next
 */
proto.g = function (args, session, next) {
    var argsKeys = iface.a_employ_getRewardHistory_args;
    var userId = session.get(consts.session.userId);
    var type = args[argsKeys.type];
    //接口调用 
    employBiz.getRewardHistory(uwClient, type, function(err,data){
        if (err) return next(null,wrapResult(err));
        var exData = new ds.ExEmploy();
        exData.rewardHisList = data; 
        next(null,wrapResult(null,exData,dsNameConsts.ExEmploy));
    });
}; 

var _getTaskTypeByEmployId = function(id){
    switch(id){
        case 1:
            return c_prop.cTaskTypeKey.employ1;
        case 2:
            return c_prop.cTaskTypeKey.employ2;
        case 3:
            return c_prop.cTaskTypeKey.employ3;
        case 4:
            return c_prop.cTaskTypeKey.employ4;
        case 5:
            return c_prop.cTaskTypeKey.employ5;
        case 6:
            return c_prop.cTaskTypeKey.employ6;
    }
}
