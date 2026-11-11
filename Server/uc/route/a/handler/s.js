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
var userDao = require("uw-user").userDao;
var shopBiz = require("uw-shop").shopBiz;
var uwClient = require("uw-db").uwClient;
var taskBiz = require("uw-task").taskBiz;

var ds = require("uw-ds").ds;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var eventBiz = require("uw-event").eventBiz;

var proto = module.exports;

/**
 * 获取商店数据
 * @iface getInfo
 * @args {type:"商店类型c_prop.shopTypeKey.normal"}
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 */
proto.a = function(args, session, next){
    var argsKeys = iface.a_shop_getInfo_args;
    var userId = session.get(consts.session.userId);
    var type = args[argsKeys.type];
    shopBiz.getInfo(uwClient,userId, type, function(err, exShopData){
        if(err) return next(null,wrapResult(err));
        next(null, wrapResult(null, exShopData,dsNameConsts.ShopEntity));
    });
};

/**
 * 刷新商店
 * @iface refreshExShop
 * @args {type:"类型",lvlRefresh:"是否等级刷新"}
 * @param args
 * @param session
 * @param next
 */
proto.b = function(args, session, next){
    var argsKeys = iface.a_shop_refreshExShop_args;
    var userId = session.get(consts.session.userId); 
    var type = args[argsKeys.type];
    var lvlRefresh = args[argsKeys.lvlRefresh];
    //接口调用
    shopBiz.refreshExShop(uwClient,userId,type,lvlRefresh, function(err, data){
        if(err) return next(null,wrapResult(err));
        var exUserData = new ds.ExUserData();
        exUserData.shopData = data[0];
        exUserData.userData = data[1];
        var costGold = data[2];
        // if(costGold>0){
        //     gameRecordSerial.add(userId,function(cb1) {
        //         gameRecordBiz.setCostDiamondRecord(uwClient, userId, c_prop.goldCostTypeKey.refreshShop, costGold,  cb1);
        //     });
        // }
        next(null, wrapResult(null, exUserData, dsNameConsts.ExUserData));
    });
};

/**
 * 商店购买
 * @iface buy
 * @args {index:"用户选择的items下标",type:"商店类型c_prop.shopTypeKey.normal",num:"购买数量"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.c = function(args, session, next){
    var argsKeys = iface.a_shop_buy_args;
    var userId = session.get(consts.session.userId); 
    var index = args[argsKeys.index];
    var type = args[argsKeys.type];
    var num = args[argsKeys.num];
    if(isNaN(num) || num<=0) num = 1;
    //接口调用
    shopBiz.buy(uwClient, userId,type, index, num,   function(err, data){
        if(err) return next(null,wrapResult(err));
        var shopId = data[4];
        var costGold = data[5];
        var costDiamond = data[6];
        gameRecordSerial.add(userId,function(cb1) {
            gameRecordBiz.setShopRecord(uwClient, userId, shopId, num,costGold,costDiamond,  cb1);
        });
        // if(costGold != 0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setCostGoldRecord(uwClient,userId,c_prop.goldCostTypeKey.buy,costGold, cb1);
        //     });
        // }
        var taskOpt = {};
        // if(costDiamond>0){
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.shop,costDiamond, cb1);
        //     // });
        //     // taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     // taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        // }
        taskOpt[c_prop.cTaskTypeKey.shopBuy] = 1;
        taskBiz.setTaskValues(uwClient,userId,taskOpt,function() {}); 
        var exData = new ds.ExUserData();
        exData.userData = data[0];
        exData.shopData = data[1];
        exData.bagItems = data[2];
        exData.equipBagItems = data[3];
        exData.isMail = data[7]; 
        exData.delBagItems = data[8];
        next(null, wrapResult(err, exData ,dsNameConsts.ExUserData));
    });
};

/**
 * 购买所有（装备商店）
 * @iface buyAll
 * @args {type:"商店类型c_prop.shopTypeKey.normal"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.d = function(args, session, next){
    var argsKeys = iface.a_shop_buyAll_args;
    var userId = session.get(consts.session.userId);
     var type = args[argsKeys.type];
    //接口调用
    shopBiz.buyAll(uwClient,userId,type,function(err, data){
        if(err) return next(null,wrapResult(err));
        var shopIdObj = data[4];        //{"c_shopId":数量,.....}
        var costGold = data[5];
        var costDiamond = data[6];
        for(var key in shopIdObj){
            gameRecordSerial.add(userId,function(cb1) {
                gameRecordBiz.setShopRecord(uwClient, userId, key, shopIdObj[key],costGold,costDiamond,  cb1);
            });
        }
        // if(costGold != 0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setCostGoldRecord(uwClient,userId,c_prop.goldCostTypeKey.buy,costGold, cb1);
        //     });
        // }
        var taskOpt = {};
        // if(costDiamond>0){
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.shop,costDiamond, cb1);
        //     // });
            
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        // }
        taskOpt[c_prop.cTaskTypeKey.shopBuy] = 1;
        taskBiz.setTaskValues(uwClient,userId,taskOpt,function() {}); 
        var exData = new ds.ExUserData();
        exData.userData = data[0];
        exData.shopData = data[1];
        exData.bagItems = data[2];
        exData.equipBagItems = data[3];
        exData.shopIdObj = data[4];
        exData.showMsgArr = data[7];
        exData.isMail = data[8]; 
        next(null, wrapResult(err, exData ,dsNameConsts.ExUserData));
    });
};

/**
 * 拉霸（宠物商店）
 * @iface laba
 * @args {type:"操作类型 0 使用猫粮 1 使用钻石",guide:"1 表示引导拉霸 0 普通拉霸",num:"拉霸次数"}
 * @param args
 * @param session
 * @param next
 * @returns ds.LabaData
 */
proto.e = function(args, session, next){
    var argsKeys = iface.a_shop_laba_args;
    var userId = session.get(consts.session.userId); 
    var type = args[argsKeys.type];  
    var guide = args[argsKeys.guide];  
    var num = args[argsKeys.num];  
    if(isNaN(num) || parseInt(num) <=0) return next(null, wrapResult("ERROR: INVALID PARA"));
     //接口调用
    shopBiz.laba(uwClient,userId,type, guide, num, function(err, data){
         if(err) return next(null,wrapResult(err));
        var taskOpt = {};
        var costDiamond = data[4];
        // if(costDiamond>0){
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.laba,costDiamond, cb1);
        //     // });
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        // }
        taskOpt[c_prop.cTaskTypeKey.labaPet] = num;
        taskBiz.setTaskValues(uwClient,userId,taskOpt,function() {}); 
        
        var  labaData = new ds.LabaData();
        labaData.userData = data[0]; 
        labaData.bagItems = data[1];
        labaData.delBagItems = data[2]; 
        labaData.labaRet = data[3];
        next(null, wrapResult(err, labaData ,dsNameConsts.LabaData));

    }); 
};

 