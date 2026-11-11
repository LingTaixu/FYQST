require("date-utils");
var uwData = require("uw-data");
var formula = require("uw-formula");
var project = require("uw-config").project;
var consts = uwData.consts;
var c_msgCode = uwData.c_msgCode;
var c_prop = uwData.c_prop;
var c_shop = uwData.c_shop;
var t_item = uwData.t_item;
var c_recharge = uwData.c_recharge;
var UserEntity = require('uw-entity').UserEntity;
var GameRecordEntity = require('uw-entity').GameRecordEntity;
var async = require("async");
var getMsg = require("uw-utils").msgFunc(__filename);
var commonUtils = require("uw-utils").commonUtils;
var serverUtils = require("uw-utils").serverUtils;
var biHlBiz = require("uw-log").biHlBiz;
var biHlObj = require("uw-log").biHlObj;
var ossBiz = require("uw-log").ossBiz;
var ossObj = require("uw-log").ossObj;
var g_cache = require("uw-global").g_cache;

var exports = module.exports;
var userDao = null;
var activityDao = null;
var activityBiz = null;
var gameRecordDao = null;
var checkRequire = function() {
    gameRecordDao = require("uw-game-record").gameRecordDao;
    userDao = require("uw-user").userDao;
    activityDao = require("uw-activity").activityDao;
    activityBiz = activityBiz || require("uw-activity").activityBiz;
};

/**
 * 记录用户每日登录次数
 * @param client
 * @param userId
 * @param cb
 */
exports.setLoginCount = function(client, userId, cb) {
    _getTodayRecord(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        //*************************************************************/
        var gameRecordData = gamePlayer.todayGameRecord;
        // var id = gameRecordData.id;
        var loginCount = gameRecordData.loginCount || 0;
        loginCount += 1;
        gameRecordData.loginCount = loginCount;
        gamePlayer.setTodayGameRecordDirty();
        cb(null);
        // var updateData = {
        //     loginCount: logincount
        // };
        // //*************************************************************/
        // gameRecordDao.update(client, updateData, { id: id }, cb);
    })
};

/**
 * 记录用户每日挑战副本次数
 * @param client
 * @param userId
 * @param cb
 */
exports.setCopyCount = function(client, userId, cb) {
    _getTodayRecord(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        //*************************************************************/
        var gameRecordData = gamePlayer.todayGameRecord;
       // var id = gameRecordData.id;
        var copyCount = gameRecordData.copyCount || 0;
        copyCount += 1;
        gameRecordData.copyCount = copyCount;
        gamePlayer.setTodayGameRecordDirty();
        cb(null);
        // var updateData = {
        //     copyCount: copycount
        // };
        // //*************************************************************/
        // gameRecordDao.update(client, updateData, { id: id }, cb);
    })
};

/**
 * 记录用户每日刷野次数
 * @param client
 * @param userId
 * @param cb
 */
exports.setWipeCount = function(client, userId, cb) {
    _getTodayRecord(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        //*************************************************************/
        var gameRecordData = gamePlayer.todayGameRecord;
        //var id = gameRecordData.id;
        var wipeCount = gameRecordData.wipeCount || 0;
        wipeCount += 1;
        gameRecordData.wipeCount = wipeCount;
        gamePlayer.setTodayGameRecordDirty();
        cb(null);
        // var updateData = {
        //     wipeCount: wipecount
        // };
        // //*************************************************************/
        // gameRecordDao.update(client, updateData, { id: id }, cb);
    })
};

/**
 * 记录用户每日pk次数
 * @param client
 * @param userId
 * @param cb
 */
exports.setPkCount = function(client, userId, cb) {
    _getTodayRecord(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        //*************************************************************/
        //var id = gameRecordData.id;
        var gameRecordData = gamePlayer.todayGameRecord;
        var pkCount = gameRecordData.pkCount || 0;
        pkCount += 1;
        gameRecordData.pkCount = pkCount;
        gamePlayer.setTodayGameRecordDirty();
        cb(null);
        // var updateData = {
        //     pkCount: pkcount
        // };
        // //*************************************************************/
        // gameRecordDao.update(client, updateData, { id: id }, cb);
    })
};

/**
 * 记录用户每日竞技场pk次数
 * @param client
 * @param userId
 * @param cb
 */
exports.setJjcPkCount = function(client, userId, cb) {
    _getTodayRecord(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        //*************************************************************/
        //var id = gameRecordData.id;
        var gameRecordData = gamePlayer.todayGameRecord;
        var jjcPkCount = gameRecordData.jjcPkCount || 0;
        jjcPkCount += 1;
        gameRecordData.jjcPkCount = jjcPkCount;
        gamePlayer.setTodayGameRecordDirty();     
        cb(null);  
        // var updateData = {
        //     jjcPkCount: jjcPkCount
        // };
        // //*************************************************************/
        // gameRecordDao.update(client, updateData, { id: id }, cb);
    })
};

/**
 * 记录用户每日拉霸次数
 * @param client
 * @param userId
 * @param cb
 */
exports.setLabaCount = function(client, userId, cb) {
    _getTodayRecord(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        //*************************************************************/
        //var id = gameRecordData.id;
        var gameRecordData = gamePlayer.todayGameRecord;
        var labaCount = gameRecordData.labaCount || 0;
        labaCount += 1;
        gameRecordData.labaCount = labaCount;
        gamePlayer.setTodayGameRecordDirty();    
        cb(null);
        // var updateData = {
        //     labaCount: labacount
        // };
        // //*************************************************************/
        // gameRecordDao.update(client, updateData, { id: id }, cb);
    })
};

exports.setChallengeCupPkCount = function(client, userId, cb) {
    _getTodayRecord(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        //*************************************************************/
        //var id = gameRecordData.id;
        var gameRecordData = gamePlayer.todayGameRecord;
        var challengeCupPkCount = gameRecordData.challengeCupPkCount || 0;
        challengeCupPkCount += 1;
        gameRecordData.challengeCupPkCount = challengeCupPkCount;
        gamePlayer.setTodayGameRecordDirty();  
        cb(null);
        // var updateData = {
        //     challengeCupPkCount: challengeCupPkCount
        // }
        // //*************************************************************/
        // gameRecordDao.update(client, updateData, { id: id }, cb)
    });
}

/**
 * 记录用户每日充值记录
 * @param client
 * @param userId
 * @param rechargeId
 * @param payMoney
 * @param cb
 */
exports.setRecharge = function(client, userId, rechargeId, payMoney, cb) {
    checkRequire();
    activityBiz.recordCarnivalValue(client,userId, c_prop.carnivalTaskTypeKey.totalChargeCount, payMoney, function(){});
    activityBiz.recordTurntableValue(client, userId, c_prop.turntableTypeKey.totalChargeCount, payMoney, null, function() {});
    _getTodayRecord(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        //*************************************************************/
        //var id = gameRecordData.id;
        var gameRecordData = gamePlayer.todayGameRecord;
        var rechargeCount = gameRecordData.rechargeCount || 0;
        var rechargeSum = gameRecordData.rechargeSum || 0;
        var rechargerecord = gameRecordData.rechargeRecord[rechargeId] || 0;
        rechargeCount += 1;
        rechargeSum += payMoney;
        gameRecordData.rechargeRecord[rechargeId] = rechargerecord + payMoney;

        gameRecordData.rechargeCount = rechargeCount;
        gameRecordData.rechargeSum = rechargeSum;
        gamePlayer.setTodayGameRecordDirty();  
        cb(null);
        // var updateData = {
        //     rechargeCount: rechargeCount,
        //     rechargeSum: rechargeSum,
        //     rechargeRecord: gameRecordData.rechargeRecord
        // };
        // //*************************************************************/
        // gameRecordDao.update(client, updateData, { id: id }, cb);
    })
};

/**
 * 记录用户每日商店记录
 * @param client
 * @param userId
 * @param shopId
 * @param sum
 * @param cb
 */
exports.setShopRecord = function(client, userId, shopId, sum,costGold,costDiamond, cb) {
    
    _getTodayRecord(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        //*************************************************************/
        //var id = gameRecordData.id;
        var gameRecordData = gamePlayer.todayGameRecord;
        var daycount = !gameRecordData.shopRecord[shopId] ? 0 : gameRecordData.shopRecord[shopId][0];
        var count = !gameRecordData.shopRecord[shopId] ? 0 : gameRecordData.shopRecord[shopId][1];
        daycount += 1;
        count += sum;
        gameRecordData.shopRecord[shopId] = [daycount, count];
        gamePlayer.setTodayGameRecordDirty();  
        cb(null);
        // var updateData = {
        //     shopRecord: gameRecordData.shopRecord
        // };
        //*************************************************************/
       // gameRecordDao.update(client, updateData, { id: id }, cb);
         
    })
};

/**
 * 记录用户每日消耗金币记录
 * @param client
 * @param userId
 * @param costGoldId
 * @param costGoldCount
 * @param cb
 */
exports.setCostGoldRecord = function(client, userId, costGoldId, costGoldCount, cb) {
    checkRequire();
    activityBiz.recordCarnivalValue(client,userId, c_prop.carnivalTaskTypeKey.costGoldCount, costGoldCount, function(){});
    _getTodayRecord(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        //*************************************************************/
        //var id = gameRecordData.id;
        var gameRecordData = gamePlayer.todayGameRecord;
        if (costGoldCount == null) costGoldCount = 0;
        var costgoldcount = gameRecordData.costGoldRecord[costGoldId] || 0;
        gameRecordData.costGoldRecord[costGoldId] = costgoldcount + costGoldCount;
        gamePlayer.setTodayGameRecordDirty();  
        var userData = gamePlayer.userData;
        // var updateData = {
        //     costGoldRecord: gameRecordData.costGoldRecord
        // };
        // //*************************************************************/
        // gameRecordDao.update(client, updateData, { id: id }, cb);
        cb(null);

        if(costGoldCount > 0){//商店的单独报 setShopRecord

            var ip = userData.exData[c_prop.userExDataKey.loginIP];
            var biObj = new biHlObj.economyObj();
            biObj.userid = userData.accountId;
            biObj.roleid = userId; 
            biObj.currency = "gold";
            biObj.kingdom = "expenditure"; //earning收入 expenditure支出
            biObj.amount = costGoldCount;
            biObj.phylum = c_prop.goldCostType[costGoldId];
            biObj.value = 0;   //货币兑换的道具数量
            biObj.genus = "";
            biObj.classfield = "";
            biObj.extra = "user_level:"+userData.lvl+";diamond:"+userData.diamond+";gold:"+userData.gold;
            biHlBiz.HlEconomyBi(biObj,null,userId, gamePlayer.accountData, ip,function(err, data){});   

            // var oObj = new ossObj.ossCostCurrency(userData.id, userData.lvl, "gold", costGoldId, costGoldCount, 0, "", 0);
            // ossBiz.WriteOss(oObj);
        }
    })
};

/**
 *记录用户每日消耗钻石记录
 * @param client
 * @param userId
 * @param costDiamondId
 * @param costDiamondCount
 * @param cb
 */
exports.setCostDiamondRecord = function(client, userId, costDiamondId, costDiamondCount,  cb) {
    checkRequire();
    activityBiz.recordCarnivalValue(client,userId, c_prop.carnivalTaskTypeKey.diamondCost, costDiamondCount, function(){});
    _getTodayRecord(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        //*************************************************************/
        //var id = gameRecordData.id;
        var gameRecordData = gamePlayer.todayGameRecord;
        var costdiamondcount = gameRecordData.costDiamondRecord[costDiamondId] || 0;
        gameRecordData.costDiamondRecord[costDiamondId] = costdiamondcount + costDiamondCount;
        gamePlayer.setTodayGameRecordDirty();  
        var userData = gamePlayer.userData;
        // var updateData = {
        //     costDiamondRecord: gameRecordData.costDiamondRecord
        // };

        //*************************************************************/
        // gameRecordDao.update(client, updateData, { id: id }, function(err, data) {
        //     if (err) return cb(err);
            _recordActivityDiamond(client, userId, costDiamondId, costDiamondCount, function(){});
        //});
        cb(null);
        // console.log("setCostDiamondRecord  ", costDiamondId, costDiamondCount);
        //BI
        if(costDiamondCount > 0){ 

            var ip = userData.exData[c_prop.userExDataKey.loginIP];
            var biObj = new biHlObj.economyObj();
            biObj.userid = userData.accountId;
            biObj.roleid = userId; 
            biObj.currency = "yb";
            biObj.kingdom = "expenditure"; //earning收入 expenditure支出
            biObj.amount = costDiamondCount;
            biObj.phylum = c_prop.diamondCostType[costDiamondId];
            biObj.value = 0;   //货币兑换的道具数量
            biObj.genus = "";
            biObj.classfield = "";
            biObj.extra = "user_level:"+userData.lvl+";diamond:"+userData.diamond+";gold:"+userData.gold;
            biHlBiz.HlEconomyBi(biObj,null, userId, gamePlayer.accountData,ip,function(err, data){});  

            // var oObj = new ossObj.ossCostCurrency(userData.id, userData.lvl, "yb", costDiamondId, costDiamondCount, 0, "", 0);
            // ossBiz.WriteOss(oObj);
        }
         
    })
};

/**
 *记录用户每日消耗积分记录
 * @param client
 * @param userId
 * @param costCount
 * @param cb
 */
exports.setCostDScoreRecord = function(client, userId, costCount,  cb) {
    if(costCount <= 0) return cb(null);
    checkRequire();
    _getTodayRecord(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        //*************************************************************/
        //var id = gameRecordData.id;
        var gameRecordData = gamePlayer.todayGameRecord;
        gameRecordData.costDScoreNum = gameRecordData.costDScoreNum || 0;
        gameRecordData.costDScoreNum += costCount;
        gamePlayer.setTodayGameRecordDirty();
        cb(null);

    })
};

/**
 * 记录用户每日获取钻石记录
 * @param client
 * @param userId
 * @param getDiamondId
 * @param getDiamondCount
 * @param cb
 */
exports.setDiamondRecord = function(client, userId, getDiamondId, getDiamondCount, cb) {
    _getTodayRecord(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        //*************************************************************/
        //var id = gameRecordData.id;
        var gameRecordData = gamePlayer.todayGameRecord;
        var getdiamondcount = gameRecordData.getDiamondRecord[getDiamondId] || 0;
        gameRecordData.getDiamondRecord[getDiamondId] = getdiamondcount + getDiamondCount;
        gamePlayer.setTodayGameRecordDirty(); 
        var userData = gamePlayer.userData;
        // var updateData = {
        //     getDiamondRecord: gameRecordData.getDiamondRecord
        // };
        //*************************************************************/
        //gameRecordDao.update(client, updateData, { id: id }, cb);
        cb(null);

        //BI
        if (getDiamondCount > 0){
            var ip = userData.exData[c_prop.userExDataKey.loginIP];
            var biObj = new biHlObj.economyObj();
            biObj.userid = userData.accountId;
            biObj.roleid = userId; 
            biObj.currency = "yb";
            biObj.kingdom = "earning"; //earning收入 expenditure支出
            biObj.amount = getDiamondCount;
            biObj.phylum = c_prop.diamondGetType[getDiamondId];
            biObj.value = 0;   //货币兑换的道具数量
            biObj.genus = "";
            biObj.classfield = "";
            biObj.extra = "user_level:"+userData.lvl+";diamond:"+userData.diamond+";gold:"+userData.gold;
            biHlBiz.HlEconomyBi(biObj,null,userId, gamePlayer.accountData, ip,function(err, data){});  
        }
    })
};

/*****************************************************************************************************/
var _getTodayRecord = function(client, userId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){
        if(err) return cb(err);
        gamePlayer.getTodayGameRecord(client, cb); 
    });
};

exports.getTodayGameRecord = function(client, userId, cb){
    checkRequire();
    gameRecordDao.select(client," userId = ? and recordTime = ?",[userId,(new Date()).toFormat("YYYY-MM-DD")],function(err, gameRecordData){
        if (err) return cb(err); 
        if (gameRecordData) { 
            cb(null, gameRecordData);
        } else {
            var gameRecordEntity = new GameRecordEntity();
            gameRecordEntity.userId = userId;
            gameRecordEntity.rechargeRecord = {};
            gameRecordEntity.shopRecord = {};
            gameRecordEntity.costGoldRecord = {};
            gameRecordEntity.costDiamondRecord = {};
            gameRecordEntity.getDiamondRecord = {};
            gameRecordEntity.recordTime = (new Date()).toFormat("YYYY-MM-DD");
            gameRecordEntity.serverId = project.serverId;
            gameRecordDao.insert(client, gameRecordEntity, function(err, data) {
                if (err) return cb(err);
                gameRecordEntity.id = data.insertId; 
                cb(null, gameRecordEntity);
            });
        }
    });
}

var _recordActivityDiamond = function(client, userId, costDiamondId, costDiamond, cb) {
    async.parallel([
        function(cb1) {
            var strWhere = " type = ? and isOpen = 1 and ( startTime is null or (startTime <? and endTime>?)) order by sort desc";
            var args = [c_prop.activityTypeKey.rebate, new Date(), new Date()];
            activityDao.list(client, strWhere, args, cb1);
        },
        function(cb1) {
            //userDao.select(client, { id: userId }, cb1);
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var activityList = data[0];
        var gamePlayer = data[1];
        var userData = gamePlayer.userData;
        var activity = userData.activity || {};
        async.map(activityList, function(activityData, cb1) {
            var userActivity = activity[activityData.id] || [];
            var allCost = userActivity[0] || 0;
            if (activityData.exValues2.length > 0 && activityData.exValues2.indexOf(parseInt(costDiamondId)) == -1) {
                costDiamond = 0;
            }
            allCost += costDiamond;
            userActivity[0] = allCost;
            activity[activityData.id] = userActivity;
            cb1(null);
        }, function(err, data) {
            if (err) return cb(err);
            // var updateUser = {
            //     activity: userData.activity
            // }
            // userDao.update(client, updateUser, { id: userId }, cb);
            gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
            return cb(null);
        });
    });
}