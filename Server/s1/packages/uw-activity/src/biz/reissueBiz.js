var uwData = require("uw-data");
var c_game = uwData.c_game;
var c_prop = uwData.c_prop;
var c_reward = uwData.c_reward;
var c_msgCode = uwData.c_msgCode;
var exports = module.exports = {};
var async = require("async");
var itemBiz = require("uw-item").itemBiz;
var g_cache = require("uw-global").g_cache;
var propUtils = require("uw-utils").propUtils;
// var gameRecordDao = require("uw-game-record").gameRecordDao;

var userDao = null;
var userBiz = null;
var mailBiz = null;
var activityDao = null;
var rechargeDao = null;
var checkRequire = function() {
    userDao = userDao || require("uw-user").userDao;
    userBiz = userBiz || require("uw-user").userBiz;
    mailBiz = mailBiz || require("uw-mail").mailBiz;
    rechargeDao = rechargeDao || require("uw-recharge").rechargeDao;
    activityDao = activityDao || require("./../dao/activityDao");
    // activityDao = activityDao || require("uw-activity").activityDao;
};

//玩家主动请求调用
exports.reissueActivityReward = function(client, userData) {
    checkRequire();
    //玩家无活动数据 则不必走补发逻辑
    // console.error('==============reissueActivityReward=========================');
    var userActivityData = userData.activity;
    if (!userActivityData) return;
    // console.error('==============have userActivityData=========================');
    //===========================================炼金术士的等价交换===========================================
    //c_prop.activityType.alchemistEquateExchange
    //无此活动配置 则不必走补发逻辑
    var activityData = g_cache.getActivityDataByType(c_prop.activityTypeKey.alchemistEquateExchange);
    // console.error('==============activityData=========================',activityData);
    if (!activityData) return;
    // console.error('==============have activityData=========================');
    //玩家无此活动数据 则不必走补发逻辑
    var activityId = activityData.id; //活动ID
    if (!userActivityData[activityId]) return;
    // console.error('==============have userActivityData[activityId]=========================',activityId);
    //没买过  热血战斗礼包 小队集结礼包 神宠养成礼包 
    if (!userActivityData[activityId][0] || userActivityData[activityId][0].length <= 0) return;
    var now = new Date();
    // console.error('==============reissueActivityReward=========================');
    for (var i = 0, len = userActivityData[activityId][0].length; i < len; i++) {
        // console.error('===========i========',i);
        if (!userActivityData[activityId][0][i]) continue; //没买过礼包
        if (userActivityData[activityId][1][i]) continue; //补发过了
        if (!activityData.exValues || !activityData.exValues[i]) continue; //防错
        var buyTime = new Date(userActivityData[activityId][0][i]);
        // console.error('===========buyTime========',buyTime);
        var daysApart = activityData.exValues[i].daysApart; //隔几天返还
        // console.error('===========daysApart========',daysApart);
        // console.error('===========buyTime.getDaysBetween(now)========',buyTime.getDaysBetween(now));
        if (buyTime.getDaysBetween(now) < daysApart) continue; //时间没到

        var mailItems = {};
        var spItemId = c_prop.spItemIdKey.dScore;
        //判断活动返回的是否是钻石
        //console.error("活动反还类型--------------"+activityData.exValues[i].currencyType);
        if (c_prop.currencyTypeKey.diamond == activityData.exValues[i].currencyType) {
            spItemId = c_prop.spItemIdKey.diamond;
        }
        var num = activityData.exValues[i].price || 0; //返还积分数  
        if (num <= 0) continue;
        userActivityData[activityId][1][i] = 1;
        mailItems[spItemId] = num;
        // console.error('===========mailItems========',mailItems);
        mailBiz.addByType(client, userData.id, c_prop.mailTypeKey.alchemistEquateExchange, [], mailItems, function() {});
    }

}

//服务器主动补发活动奖励   cron调
exports.sendReissueActivityReward = function(client, cb) {
    checkRequire();
    var now = new Date();
    async.parallel([
        function(cb1) {
            var needOperateTypes = [
                c_prop.activityTypeKey.sevenLogin,
                c_prop.activityTypeKey.carnival,
                c_prop.activityTypeKey.goddessPrivateRequite,
                c_prop.activityTypeKey.godPetFetter,
                c_prop.activityTypeKey.laisBank
            ];
            var strWhere = " isOpen = 1 and endTime < ? and type in (?) order by sort desc";
            var args = [now, needOperateTypes];
            //for test
            // var strWhere = " isOpen = 1 and type in (?) order by sort desc";
            // var args = [needOperateTypes];
            activityDao.list(client, strWhere, args, cb1);
        },
        function(cb1) {
            userDao.list(client, " accountId > 0 and robotId = 0 ", [], cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var activityList = data[0];
        var userList = data[1];
        // console.error(activityList);
        if (!activityList || activityList.length == 0) return cb(null);

        async.eachSeries(activityList, function(activityInfo, callback) {
            var diffDays = activityInfo.endTime.clone().clearTime().getDaysBetween(now.clone().clearTime());
            console.error(activityInfo.title,'sendReissueActivityReward   diffDays==>', diffDays);
            //for test
            // diffDays = 1;
            //活动结束后的 次日凌晨才执行
            if (now.isAfter(activityInfo.endTime)) {
                switch (activityInfo.type) {
                    case c_prop.activityTypeKey.sevenLogin:
                        if (diffDays == 1) {
                            _sendSevenLoginAward(client, userList, activityInfo, callback);
                        } else {
                            callback(null);
                        }
                        break;
                    case c_prop.activityTypeKey.carnival:
                        if (diffDays == 1) {
                            async.series([
                                function(cb) {
                                    _sendCarnivalReachAward(client, userList, activityInfo, cb); //嘉年华累计完成XX任务奖励
                                },
                                function(cb) {
                                    _sendCarnivalAward(client, userList, activityInfo, cb); //补发 嘉年华
                                }
                            ], function(err, results) {
                                callback(null);
                            });
                        } else {
                            callback(null);
                        }
                        break;
                    case c_prop.activityTypeKey.goddessPrivateRequite:
                        if (diffDays == 1) {
                            _sendGoddessPrivateRequiteAward(client, userList, activityInfo, callback); //补发 女神的私人报答
                        } else {
                            callback(null);
                        }
                        break;
                    case c_prop.activityTypeKey.godPetFetter:
                        if (diffDays == 1) {
                            _sendGodPetFetterAward(client, userList, activityInfo, callback); //补发 神宠的羁绊
                        } else {
                            callback(null);
                        }
                        break;
                    case c_prop.activityTypeKey.laisBank:
                        if (diffDays >= 1 && diffDays <= 7) { //玩家第7天买的债券 会持续到第13天 所以最迟第14天凌晨也要判断下补发
                            _sendLaisBankAward(client, userList, activityInfo, callback); //补发 莱斯银行的风投业务
                        } else {
                            callback(null);
                        }
                        break;
                    default:
                        callback(null);
                }
            } else {
                callback(null);
            }

        }, function(err, data) {
            if (err) return cb(err);
            console.log('===========================所有活动补发处理完成============================');
            return cb(null);
        });
    });
}

//莱斯银行的风投业务   补发
var _sendLaisBankAward = function(client, userList, activityInfo, callback) {
    console.log('_sendLaisBankAward');
    var startTime = activityInfo.startTime;
    var endTime = activityInfo.endTime;
    var groupList = [];
    var tempCount = 0;
    var tempList = [];
    var max = 1000;
    async.map(userList, function(userData, cb1) {
        var gamePlayer = g_cache.getGamePlayerInCache(userData.id);
        if (gamePlayer) {
            userData = gamePlayer.userData;
            // console.log('user Online', gamePlayer.userData.id);
        }
        // gameRecordDao.getLoginDaysArr(client, userData.id, startTime, endTime, function(err, loginDaysArr) {
        //     if (err) return cb1(err);
        //     var loginDays = loginDaysArr || [];
        var activity = userData.activity || {};
        var userLaisBankData = activity[activityInfo.id] || [];
        var reissueData = activity['reissueData'] || {};
        if (reissueData[activityInfo.id]) return cb1(null); //补发过了 不处理
        // console.log('_userLaisBankData', userData.nickName);
        var buyTime = userLaisBankData[0];
        if (!buyTime) return cb1(null); //没买过债券 不处理
        buyTime = new Date(buyTime);
        var receiveArr = userLaisBankData[1] || [];
        var itemsCfg = activityInfo.items;

        var items = {};
        itemsCfg.forEach(function(val, index) {
            if (receiveArr[index]) return; //领过的不补发
            var recDay = buyTime.clone().clearTime().addDays(index * 1);
            var timeStamp = recDay.getTime();
            // console.error('timeStamptimeStamptimeStamptimeStamp',timeStamp);
            if (userData.loginDays.indexOf(timeStamp) < 0) return; //当天没登录不补发
            // if (loginDays.indexOf(timeStamp) < 0) return; //当天没登录不补发
            var logicItems = itemsCfg[index];
            items = propUtils.mergerProp(items, logicItems);
        })

        if (Object.keys(items).length == 0) return cb1(null);


        var userId = userData.id;
        var mailEntity = mailBiz.createEntityByType(userId, c_prop.mailTypeKey.reissueLaisBank, null, items);
        mailEntity.addTime = new Date();
        tempList.push(mailEntity);
        if (tempCount >= max) {
            tempCount = 0;
            groupList.push(tempList.concat([]));
            tempList.length = 0;
        }
        tempCount++;

        reissueData[activityInfo.id] = 1;
        activity['reissueData'] = reissueData;
        userData.activity = activity;

        if (gamePlayer) {
            gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        } else {
            // console.log('activityactivity', activity);
            userDao.update(client, { activity: userData.activity }, { id: userData.id }, function() {});
        }
        cb1(null);
        // });

    }, function(err, data) {
        if (err) return callback(null);
        if (tempList.length > 0) {
            groupList.push(tempList.concat([]));
        }
        if (groupList.length > 0) {
            async.map(groupList, function(group, cb2) {
                mailBiz.addMailByList(client, group, cb2);
            }, function() {});
        }
        callback(null);
    });
};

//神宠的羁绊  补发(目前只补发多日累充)
var _sendGodPetFetterAward = function(client, userList, activityInfo, callback) {
    console.log('_sendGodPetFetterAward');
    var groupList = [];
    var tempCount = 0;
    var tempList = [];
    var max = 1000;
    async.map(userList, function(userData, cb1) {
        var gamePlayer = g_cache.getGamePlayerInCache(userData.id);
        if (gamePlayer) {
            userData = gamePlayer.userData;
        }

        var activity = userData.activity || {};
        var reissueData = activity['reissueData'] || {};
        if (reissueData[activityInfo.id]) return cb1(null); //发过了
        var userGodPetFetterData = activity[activityInfo.id] || [];
        var receiveRechargeDaysArr = userGodPetFetterData[2] || [];
        var rDays = 0;
        // var todayRecharge = 0;
        async.parallel([
            function(cb2) {
                //算出累计充值多少天 
                var payMoney = 98;
                var startTime = activityInfo.startTime;
                var endTime = activityInfo.endTime;
                rechargeDao.getRechargeDays(client, userData.id, startTime, endTime, payMoney, function(err, rechargeDays) {
                    if (err) return cb2(err);
                    rDays = rechargeDays;
                    cb2(null);
                });
            }
            // function(cb1) {
            //     rechargeDao.getTodayCount(client, userData.id, function(err, todayRecharge) {
            //         if (err) return cb1(err);
            //         exActivity.todayRecharge = todayRecharge;
            //         cb1(null);
            //     });
            // }
        ], function(err, data) {
            if (err) return cb1(err);
            if (rDays == 0) return cb1(null);
            var rechargeDaysItemsCfg = activityInfo.exValues2;

            var items = {};
            rechargeDaysItemsCfg.forEach(function(val, index) {
                if (receiveRechargeDaysArr[index]) return;
                if (rDays <= index) return;
                var chestId = val;
                var logicItems = itemBiz.calLogicItems(chestId); //宝箱随机的物品
                items = propUtils.mergerProp(items, logicItems);
            })
            if (Object.keys(items).length == 0) return cb1(null);

            var userId = userData.id;

            var mailEntity = mailBiz.createEntityByType(userId, c_prop.mailTypeKey.reissueGodPetFetter, null, items);
            mailEntity.addTime = new Date();
            tempList.push(mailEntity);
            if (tempCount >= max) {
                tempCount = 0;
                groupList.push(tempList.concat([]));
                tempList.length = 0;
            }
            tempCount++;

            reissueData[activityInfo.id] = 1;
            activity['reissueData'] = reissueData;
            userData.activity = activity;

            if (gamePlayer) {
                gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
            } else {
                userDao.update(client, { activity: userData.activity }, { id: userData.id }, function() {});
            }
            cb1(null);
        });
    }, function(err, data) {
        if (err) return callback(null);
        if (tempList.length > 0) {
            groupList.push(tempList.concat([]));
        }
        // console.log('_groupList',groupList);
        if (groupList.length > 0) {
            async.map(groupList, function(group, cb2) {
                mailBiz.addMailByList(client, group, cb2);
            }, function() {});
        }
        callback(null);
    });
}

//女神的私人报答  补发
var _sendGoddessPrivateRequiteAward = function(client, userList, activityInfo, callback) {
    console.log('_sendGoddessPrivateRequiteAward');
    var groupList = [];
    var tempCount = 0;
    var tempList = [];
    var max = 1000;
    async.map(userList, function(userData, cb1) {
        var gamePlayer = g_cache.getGamePlayerInCache(userData.id);
        if (gamePlayer) {
            userData = gamePlayer.userData;
        }

        var activity = userData.activity || {};
        var reissueData = activity['reissueData'] || {};
        if (reissueData[activityInfo.id]) return cb1(null); //发过了

        rechargeDao.getAllCount(client, userData.id, activityInfo.startTime, activityInfo.endTime, function(err, allRechargeCount) {
            if (err) return cb1(err);
            var userGoddessData = activity[activityInfo.id] || [];
            var receiveArr = userGoddessData;

            var itemsCfg = activityInfo.items;
            var needRechargeCountCfg = activityInfo.exValues;
            var items = {};
            itemsCfg.forEach(function(val, index) {
                if (receiveArr[index]) return;
                if (allRechargeCount < needRechargeCountCfg[index]) return;
                var chestId = val;
                var logicItems = itemBiz.calLogicItems(chestId); //宝箱随机的物品
                items = propUtils.mergerProp(items, logicItems);
            })

            if (Object.keys(items).length == 0) return cb1(null);

            var userId = userData.id;

            var mailEntity = mailBiz.createEntityByType(userId, c_prop.mailTypeKey.reissueGoddessPrivateRequite, null, items);
            mailEntity.addTime = new Date();
            tempList.push(mailEntity);
            if (tempCount >= max) {
                tempCount = 0;
                groupList.push(tempList.concat([]));
                tempList.length = 0;
            }
            tempCount++;

            reissueData[activityInfo.id] = 1;
            activity['reissueData'] = reissueData;
            userData.activity = activity;

            if (gamePlayer) {
                gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
            } else {
                userDao.update(client, { activity: userData.activity }, { id: userData.id }, function() {});
            }

            cb1(null);
        });
    }, function(err, data) {
        if (err) return callback(null);
        if (tempList.length > 0) {
            groupList.push(tempList.concat([]));
        }
        // console.log('_groupList',groupList);
        if (groupList.length > 0) {
            async.map(groupList, function(group, cb2) {
                mailBiz.addMailByList(client, group, cb2);
            }, function() {});
        }
        callback(null);
    });
}
var _sendCarnivalAward = function(client, userList, activityInfo, cb) {
    console.error('补发嘉年华奖励');
    cb(null);
}
//嘉年华 累计完成任务数 发奖励
var _sendCarnivalReachAward = function(client, userList, activityInfo, cb) {
    console.log('_sendCarnivalReachAward');
    var groupList = [];
    var tempCount = 0;
    var tempList = [];
    var max = 1000;
    async.map(userList, function(userData, cb1) {
        var gamePlayer = g_cache.getGamePlayerInCache(userData.id);
        if (gamePlayer) {
            userData = gamePlayer.userData;
        }

        var activity = userData.activity || {};
        //[{"任务类型":达成数},{"已领取的任务ID":1},{特殊数据 记录嘉年华期间连胜的},{‘isSendReach’:1}]
        var userCarnivalData = activity[activityInfo.id];
        if (userCarnivalData) {
            if (userCarnivalData[3] && userCarnivalData[3].isSendReach) return cb1(null); //发过了
            var doneTasks = userCarnivalData[1] || {};
            var doneTasksNum = Object.keys(doneTasks).length;
            if (doneTasksNum == 0) return cb1(null);
            var rewardId = 0;
            var maxNum = 0;
            c_game.carnivalReachCfg.forEach(function(item) {
                var itemArr = item.split(',');
                var needNum = itemArr[0] * 1;
                if (doneTasksNum >= needNum && doneTasksNum > maxNum) {
                    maxNum = needNum;
                    rewardId = itemArr[1];
                }
            });
            if (rewardId) {
                var c_rewardData = c_reward[rewardId];
                var items = c_rewardData.rewardItems;

                var userId = userData.id;
                // console.log('_sendCarnivalReachAward',userId,userData.nickName,rewardId,items);
                var mailEntity = mailBiz.createEntityByType(userId, c_prop.mailTypeKey.carnivalReach, null, items);
                mailEntity.addTime = new Date();
                tempList.push(mailEntity);
                if (tempCount >= max) {
                    tempCount = 0;
                    groupList.push(tempList.concat([]));
                    tempList.length = 0;
                }
                tempCount++;
                userCarnivalData[3] = userCarnivalData[3] || {};
                userCarnivalData[3].isSendReach = 1;
                activity[activityInfo.id] = userCarnivalData;

                userData.activity = activity;
                if (gamePlayer) {
                    gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
                } else {
                    userDao.update(client, { activity: userData.activity }, { id: userData.id }, function() {});
                }
            }
        }
        cb1(null);
    }, function(err, data) {
        if (err) return cb(null);
        if (tempList.length > 0) {
            groupList.push(tempList.concat([]));
        }
        // console.log('_groupList',groupList);
        if (groupList.length > 0) {
            async.map(groupList, function(group, cb2) {
                mailBiz.addMailByList(client, group, cb2);
            }, function() {});
        }
        cb(null);
    });
}

//七日登录活动   若超过活动期限，则在活动结束消息后，发放到邮箱。
var _sendSevenLoginAward = function(client, userList, activityInfo, callback) {
    var startTime = activityInfo.startTime;
    var endTime = activityInfo.endTime;
    var groupList = [];
    var tempCount = 0;
    var tempList = [];
    var max = 1000;
    console.log('_sendSevenLoginAward');
    async.map(userList, function(userData, cb1) {
        // console.log('userData.id', userData.id);
        var gamePlayer = g_cache.getGamePlayerInCache(userData.id);
        if (gamePlayer) {
            userData = gamePlayer.userData;
            // console.log('user Online', gamePlayer.userData.id);
        }
        // gameRecordDao.getLoginDaysArr(client, userData.id, startTime, endTime, function(err, loginDaysArr) {
        //     if (err) return cb1(err);
        //     // console.error('=====================',loginDaysArr);
        //     var daysArr = loginDaysArr || [];
        var activity = userData.activity || {};
        var userSevenLoginData = activity[activityInfo.id] || [];
        // if (!userSevenLoginData) return cb1(null);
        if (userSevenLoginData[2] && userSevenLoginData[2].isReissue) return cb1(null); //补发过了
        // console.log('_userSevenLoginData', userData.nickName);
        var daysArr = userData.loginDays || [];
        var loginDays = _getLoginDaysBetween(daysArr, startTime, endTime);

        var receiveArr = userSevenLoginData[1] || [];
        var items = activityInfo.items;
        var dontReceDays = loginDays - receiveArr.length; //有几天没领过
        var awItems = {};
        if (dontReceDays <= 0) return cb1(null);

        for (var i = 0; i < dontReceDays; i++) {
            var dayIndex = receiveArr.length + i;
            var dayItems = items[dayIndex];
            awItems = propUtils.mergerProp(awItems, dayItems);
        }
        var userId = userData.id;
        // console.log('_sendSevenLoginAward', userId, userData.nickName, dontReceDays, awItems);
        var mailEntity = mailBiz.createEntityByType(userId, c_prop.mailTypeKey.sevenLogin, null, awItems);
        mailEntity.addTime = new Date();
        tempList.push(mailEntity);
        if (tempCount >= max) {
            tempCount = 0;
            groupList.push(tempList.concat([]));
            tempList.length = 0;
        }
        tempCount++;
        cb1(null);

        userSevenLoginData[2] = userSevenLoginData[2] || {};
        userSevenLoginData[2].isReissue = 1;
        activity[activityInfo.id] = userSevenLoginData;

        userData.activity = activity;
        if (gamePlayer) {
            gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        } else {
            // console.log('activityactivity', activity);
            userDao.update(client, { activity: userData.activity }, { id: userData.id }, function() {});
        }
        // });

    }, function(err, data) {
        if (err) return callback(null);
        if (tempList.length > 0) {
            groupList.push(tempList.concat([]));
        }
        if (groupList.length > 0) {
            async.map(groupList, function(group, cb2) {
                mailBiz.addMailByList(client, group, cb2);
            }, function() {});
        }
        callback(null);
    });
};

var _getLoginDaysBetween = function(daysArr, startTime, endTime) {
    var loginDaysNum = 0;
    startTime = new Date(startTime);
    endTime = new Date(endTime);
    daysArr.forEach(function(day) {
        // day = new Date(day);
        if (day >= startTime.getTime() && day <= endTime.getTime()) {
            // if(day.isAfter(startTime) && day.isBefore(endTime)){
            loginDaysNum++;
        }
    })
    return loginDaysNum;
}


//TODO 所有活动 邮件补发的逻辑
//七日登录活动   若超过活动期限，则在活动结束消息后，发放到邮箱。
// exports.sendSevenLoginAward = function(client) {
// var strWhere = " isOpen = 1 and type = ? order by sort desc";
// var args = [c_prop.activityTypeKey.sevenLogin];
// activityDao.list(client, strWhere, args, function(err, activityList) {
//     if (err) return cb(err);
//     if (!activityList) return cb(null);
//     var sevenLoginActivity = activityList[0];
//     var now = new Date();
//     var diffDays = sevenLoginActivity.endTime.clone().clearTime().getDaysBetween(now.clone().clearTime());
//     if (sevenLoginActivity && now.isAfter(sevenLoginActivity.endTime) && diffDays == 1) {
//         var groupList = [];
//         var tempCount = 0;
//         var tempList = [];
//         var max = 1000; // 
//         userDao.list(uwClient, " accountId > 0 and robotId = 0 ", [], function(err, userList) {
//             if (err) return console.error("出错啦", err);
//             async.map(userList, function(userData, cb1) {
//                 var activity = userData.activity || {};
//                 var userSevenLoginData = activity[c_prop.activityTypeKey.sevenLogin];
//                 if (userSevenLoginData) {
//                     var loginDayArr = userSevenLoginData[0];
//                     var receiveArr = userSevenLoginData[1];

//                     var items = sevenLoginActivity.items;
//                     var dontReceDays = loginDayArr.length - receiveArr.length; //有几天没领过
//                     var awItems = {};
//                     if (dontReceDays > 0) {
//                         for (var i = 0; i < dontReceDays; i++) {
//                             var dayIndex = receiveArr.length + i;
//                             var dayItems = items[dayIndex];
//                             awItems = propUtils.mergerProp(awItems, dayItems);
//                             receiveArr.push(1);
//                         }
//                     }
//                     var mailEntity = mailBiz.createEntityByType(userId, c_prop.mailTypeKey.sevenLogin, null, awItems);
//                     mailEntity.addTime = new Date();
//                     tempList.push(mailEntity);
//                     if (tempCount >= max) {
//                         tempCount = 0;
//                         groupList.push(tempList.concat([]));
//                         tempList.length = 0;
//                     }
//                     tempCount++;
//                     cb1(null);
//                 }
//                 userData.activity = activity;
//                 userDao.update(uwClient, { activity: userData.activity }, { id: userData.id }, cb1);
//             }, function(err, data) {
//                 if (err) return console.error("出错啦", err);
//                 async.parallel([
//                     function(cb1) {
//                         if (tempList.length > 0) {
//                             groupList.push(tempList.concat([]));
//                         }
//                         if (groupList.length > 0) {
//                             async.map(groupList, function(group, cb2) {
//                                 mailBiz.addMailByList(client, group, cb2);
//                             }, cb1);
//                         } else {
//                             return cb1(null);
//                         }
//                     }
//                 ], function(err, data) {
//                     if (err) return cb(err);
//                     cb(null);
//                 });
//             });
//         });
//     }
// });

// };


//test
// var uwClient = require("uw-db").uwClient;
// exports.sendReissueActivityReward(uwClient, function(err,data) {
//     if(err)console.error(err);
// });