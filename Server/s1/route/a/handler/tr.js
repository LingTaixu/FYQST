/**
 * Created by John on 2016/4/14.
 */
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var c_prop = uwData.c_prop;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var userDao = require("uw-user").userDao;
var treasureBiz = require("uw-treasure").treasureBiz;
var ds = require("uw-ds").ds;
var uwClient = require("uw-db").uwClient;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var taskBiz = require("uw-task").taskBiz;
var proto = module.exports;

/**
 * 江湖探秘
 * @iface spies
 * @args
 * @param args
 * @param session
 * @param next
 * @returns [ds.PkOutUserData]
 */
proto.a = function(args, session,next){
    var userId = session.get(consts.session.userId); 
    //接口调用
    treasureBiz.spies(uwClient,userId, function(err,data){
        if (err) return next(null,wrapResult(err));
        var costDiamond = data[2];
        // if(costDiamond>0){
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.spies,costDiamond, cb1);
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
 * 获取新pk额外信息
 * @iface getExPkOutInfo
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.ExPkOutInfo
 */
proto.b = function(args, session,next) {
    var userId = session.get(consts.session.userId);
    treasureBiz.getExPkOutInfo(uwClient, userId, function(err, data){
        if (err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.ExPkOutInfo));
    })
};

/**
 * 开启秘宝
 * @iface open
 * @args {id:"id"}
 * @param args
 * @param session
 * @param next
 * @returns ds.TreasureInfo
 */
proto.c = function(args, session, next){
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_treasure_open_args;
    var id = args[argsKeys.id];
    treasureBiz.open(uwClient, id, userId, function(err, data){
        if (err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.TreasureInfo));
    })
};

/**
 * 开启秘宝
 * @iface compose
 * @args {itemId:"id"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ComposeInfo
 */
proto.d = function(args, session, next){
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_treasure_compose_args;
    var itemId = args[argsKeys.itemId];
    treasureBiz.compose(uwClient,userId, itemId,function(err, data){
        if (err) return next(null,wrapResult(err));
        var re = new ds.ComposeInfo();
        re.delBagItem = data[0];
        re.treasureInfo = data[1];
        next(null,wrapResult(null,re,dsNameConsts.ComposeInfo));
    })
}