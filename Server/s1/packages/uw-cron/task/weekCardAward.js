var exports = module.exports;
var uwClient = require("uw-db").uwClient;
var logger = require("uw-log").getLogger("uw-logger", __filename);
var uwData = require("uw-data");
var c_prop = uwData.c_prop;
var c_game = uwData.c_game;
var c_recharge = uwData.c_recharge;
var userDao = require("uw-user").userDao;
var rechargeDao = require("uw-recharge").rechargeDao;
var mailBiz = require("uw-mail").mailBiz;
var g_cache = require("uw-global").g_cache;

/*
 * 周卡每日邮件奖励
 */

exports.run = function(cfg) {
    var rechargeId = c_prop.rechargeIdKey.week;
    var nowTime = new Date();
    var nowTimeSec = nowTime.getTime();
    userDao.listCols(uwClient, " id, buff, exData ", " accountId > 0 and robotId = 0 and buff != '{}'", [], function(err, userList) {
        //console.log("userList:", userList);
        for (var i = 0; i < userList.length; i++) {
            var gamePlayer = g_cache.getGamePlayerInCache(userList[i].id);
            var userData = null;
            if (gamePlayer) {
                userData = gamePlayer.userData;
            } else {
                userData = userList[i];
            }
            if (!userData.buff[c_prop.otherBuffIdKey.week]) continue;
            var lastAwardTime = userData.exData[c_prop.userExDataKey.weekCardAwardTime] || 0;
            var cardEndTime = userData.buff[c_prop.otherBuffIdKey.week][1];
            var cardStartTime = userData.buff[c_prop.otherBuffIdKey.week][0]; 
            //console.log("cardInfo: ", cardStartTime, cardEndTime, lastAwardTime, nowTimeSec);
            if ( cardEndTime < nowTimeSec) continue; 

            // 之前是老的周卡发送时间，重置掉
            if (lastAwardTime < cardStartTime) {
                lastAwardTime = 0;
            }

            // 如果第一次
            if (lastAwardTime == 0) {

                // 当天5点
                var fristAwardTime = 0;
                var buyCardDay = new Date(cardStartTime);
                buyCardDay.clearTime();
                var buyCardDayAwardTime = buyCardDay.getTime() + 5 * 3600 * 1000;
                if (cardStartTime < buyCardDayAwardTime) {
                    fristAwardTime = buyCardDayAwardTime;
                } else {
                    fristAwardTime = buyCardDayAwardTime + 24 * 3600 * 1000;
                }

                // 向前推一天
                lastAwardTime = fristAwardTime - 24 * 3600 * 1000;
            }

            if (lastAwardTime <= 1514995200000) continue;//'2018-01-04 00:00:00'
             
            console.log("WEEKCARD: ", userData.id, ":", lastAwardTime, nowTimeSec, cardStartTime, cardEndTime); 

            // 是否需要发补偿邮件
            var bNeedChange = false;
            var tmpAwardTime = lastAwardTime;
            while (tmpAwardTime + 24 * 3600 * 1000 <= nowTimeSec) {
                tmpAwardTime += 24 * 3600 * 1000;
                lastAwardTime = tmpAwardTime;
                // 发邮件
                console.log("WEEKCARD REWARD: ", userData.id, ":", lastAwardTime, nowTimeSec, cardStartTime, cardEndTime);
                //console.log("weekCardAward :",userData.id, lastAwardTime);
                _sendWeekCardDailyAward(userData.id);
                bNeedChange = true;
            }
            //console.log("weekCardAward just modify :",userData.id,userData.exData[c_prop.userExDataKey.weekCardAwardTime], lastAwardTime);
            if (bNeedChange) {
                userData.exData[c_prop.userExDataKey.weekCardAwardTime] = lastAwardTime;
                if (gamePlayer) {
                    gamePlayer.setUserDataDirty();
                } else {
                    _modifyWeekCardAwardTime(userData.id, userData.exData);
                }
            }
        }

    });


    // rechargeDao.getValidEffUserIdList(uwClient, rechargeId, nowTime, function(err,userIdList){
    // 	if (err || !userIdList || userIdList.length == 0) return;
    // 	 var userIds = [];
    //        for (var i = 0; i < userIdList.length; i++) {
    //            userIds.push(userIdList[i]['userId']);
    //        }
    //        //console.log("weekCardAward userList:", userIdList, userIds);
    // 	//var sql = "select * from uw_user where id > 0";
    // 	userDao.listCols(uwClient, " id, buff, exData ", " id in (?) ",[userIds], function(err, userList) {
    // 		//console.log("userList:", userList);
    // 		for (var i = 0; i < userList.length; i++){
    //                var gamePlayer = g_cache.getGamePlayerInCache(userList[i].id);
    //                var userData = null;
    //                if (gamePlayer) {
    //                    userData = gamePlayer.userData;
    //                } else {
    //                    userData = userList[i];
    //                }
    // 			if(!userData.buff[c_prop.otherBuffIdKey.week]) continue;
    // 			var lastAwardTime = userData.exData[c_prop.userExDataKey.weekCardAwardTime] || 0;
    // 			var cardEndTime = userData.buff[c_prop.otherBuffIdKey.week][1];
    // 			var cardStartTime = userData.buff[c_prop.otherBuffIdKey.week][0]; //cardEndTime - 7 * 24*3600 * 1000;
    // 			//console.log("cardInfo: ", cardStartTime, cardEndTime, lastAwardTime, nowTimeSec);
    // 			if (/*cardStartTime > nowTimeSec ||*/ cardEndTime < nowTimeSec){ // 累计的话，而且没有发过奖励，好像有问题
    // 				console.log("error time: ");
    // 				continue;
    // 			} 

    // 			// 之前是老的周卡发送时间，重置掉
    // 			if (lastAwardTime < cardStartTime){
    // 				lastAwardTime = 0;
    // 			}

    // 			// 如果第一次
    // 			if (lastAwardTime == 0){

    // 				// 当天5点
    // 				var fristAwardTime = 0;
    // 				var buyCardDay = new Date(cardStartTime);
    // 				buyCardDay.clearTime();
    // 				var buyCardDayAwardTime = buyCardDay.getTime() + 5 * 3600 * 1000;
    // 				if (cardStartTime < buyCardDayAwardTime){
    // 					fristAwardTime = buyCardDayAwardTime;
    // 				}else{
    // 					fristAwardTime = buyCardDayAwardTime  + 24 * 3600 * 1000;
    // 				}

    // 				// 向前推一天
    // 				lastAwardTime = fristAwardTime - 24 * 3600 * 1000; 
    // 			}

    // 			if(lastAwardTime <= 1514995200000){  //'2018-01-04 00:00:00'
    // 				continue;
    // 			}

    // 			//if(userData.id == 97901){
    // 				console.log("WEEKCARD: ", userData.id, ":", lastAwardTime,nowTimeSec, cardStartTime, cardEndTime);
    // 			//}

    // 			// 是否需要发补偿邮件
    // 			var bNeedChange = false;
    // 			var tmpAwardTime = lastAwardTime;
    // 			while (tmpAwardTime + 24*3600 * 1000 <= nowTimeSec){
    // 				tmpAwardTime += 24*3600 * 1000; 
    //  					lastAwardTime = tmpAwardTime;
    // 				// 发邮件
    // 				console.log("WEEKCARD REWARD: ", userData.id, ":", lastAwardTime,nowTimeSec, cardStartTime, cardEndTime);
    // 				//console.log("weekCardAward :",userData.id, lastAwardTime);
    // 				_sendWeekCardDailyAward(userData.id);
    // 				bNeedChange = true; 
    // 			}	
    // 				//console.log("weekCardAward just modify :",userData.id,userData.exData[c_prop.userExDataKey.weekCardAwardTime], lastAwardTime);
    // 				if (bNeedChange){
    // 					userData.exData[c_prop.userExDataKey.weekCardAwardTime] = lastAwardTime;
    //                    if (gamePlayer) {
    //                        gamePlayer.setUserDataDirty();
    //                    } else {
    //                        _modifyWeekCardAwardTime(userData.id, userData.exData);
    //                    }
    // 				}
    // 		}

    // 	}); 
    // });

};

function _modifyWeekCardAwardTime(userId, userExData) {
    var updateData = {
        exData: userExData
    };
    // console.log("_modifyWeekCardAwardTime: ", userId, userExData);
    userDao.update(uwClient, updateData, { id: userId }, function(err, data) {});
}

function _sendWeekCardDailyAward(userId) {
    var mailType = 64;
    var newMail = {};
    newMail[c_prop.spItemIdKey.diamond] = c_game.mouthlycard[5];
    mailBiz.addByType(uwClient, userId, mailType, [], newMail, function(err, data) {});
}

exports.runOnce = function() {

};
if (require.main == module) {
    exports.run();
}