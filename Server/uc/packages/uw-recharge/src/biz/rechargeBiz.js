/**
 * Created by Administrator on 14-10-30.
 */
var logger = require('uw-log').getLogger("uw-logger", __filename);
var rechargeDao = require("uw-recharge").rechargeDao;

var async = require('async');
var RechargeEntity = require("uw-entity").RechargeEntity;
var RechargeData = require("uw-ds").ds.RechargeData;
var uwData = require("uw-data");
var mailBiz = require("uw-mail").mailBiz;
var c_recharge = uwData.c_recharge;
var c_payInfo = uwData.c_payInfo;
var c_msgCode = uwData.c_msgCode;
var c_prop = uwData.c_prop;
var t_item = uwData.t_item;
var consts = uwData.consts;
var getMsg = require("uw-utils").msgFunc(__filename);
var c_msgCode = uwData.c_msgCode;
var userUtils = require("uw-user").userUtils;
//var bonusBiz = require("uw-bonus-share").bonusBiz;
var propUtils = require("uw-utils").propUtils;
var projectCfg = require("uw-config").project;
var g_boss = require("uw-global").g_boss;
var biHlBiz = require("uw-log").biHlBiz;
var biHlObj = require("uw-log").biHlObj;
var ossObj = require("uw-log").ossObj;
var ossBiz = require("uw-log").ossBiz;
var g_cache = require("uw-global").g_cache;
var bossBiz;
var userDao;
var activityDao = null;
var activityBiz = null;
var chatBiz = null;
var taskBiz = null;
var guildBiz = null;
var checkRequire = function() {
    chatBiz = chatBiz || require("uw-chat").chatBiz;
    userDao = userDao || require("uw-user").userDao;
    activityDao = activityDao || require("uw-activity").activityDao;
    activityBiz = activityBiz || require("uw-activity").activityBiz;
    bossBiz = bossBiz || require("uw-boss").bossBiz;
    taskBiz = taskBiz || require("uw-task").taskBiz;
    guildBiz = guildBiz || require("uw-guild").guildBiz;
};

var curMaxSeqNo = 1;
var genTransId = function() { // 临时生产唯一流水号
    var ts = Math.floor((new Date()).getTime() / 1000);
    curMaxSeqNo++;
    return "" + ts + curMaxSeqNo;
}

/**
 * 获取充值记录信息
 * @param client
 * @param userId
 * @param cb
 */
exports.getInfo = function(client, userId, cb) {
    async.parallel([
        function(cb1) {
            var sqlStr = "select rechargeId, count(rechargeId) count from uw_recharge where userId = ? GROUP BY rechargeId"
            client.query(sqlStr, [userId], function(err, list) {
                if (err) return cb1(err);
                var countMap = {};
                for (var i = 0, li = list.length; i < li; i++) {
                    var itemi = list[i];
                    countMap[itemi.rechargeId] = itemi.count;
                }
                cb1(null, countMap);
            });
        },
        function(cb1) {
            // var sqlStr = "select * from uw_recharge where userId = ? and effTime is not null ORDER BY effTime desc"
            // client.query(sqlStr, [userId], function(err, list) {
            //     if (err) return cb1(err);
            //     var now = new Date();
            //     var cardTimeMap = {};
            //     for (var i = 0, li = list.length; i < li; i++) {
            //         var itemi = list[i];
            //         if (cardTimeMap[itemi.rechargeId]) continue;
            //         var endTime = itemi.effTime.clone();
            //         //endTime.clearTime(); 00:00
            //         //以前是直接加一个月，现在是加30天 for bug 726
            //         //endTime.addMonths(1);//间隔一个月

            //         if (itemi.rechargeId == c_prop.rechargeIdKey.month) {
            //             endTime.addDays(-30);
            //         } else if (itemi.rechargeId == c_prop.rechargeIdKey.month) {
            //             endTime.addDays(-7);
            //         }

            //         //endTime.addDays(30);
            //         if (endTime.isAfter(now))
            //             cardTimeMap[itemi.rechargeId] = [itemi.rechargeTime, endTime, itemi.effTime];
            //         //cardTimeMap[itemi.rechargeId] = [itemi.rechargeTime, itemi.effTime, endTime];
            //     }
            //     cb1(null, cardTimeMap);
            // });
            cb1(null, {});
        }
    ], function(err, results) {
        if (err) return cb(err);
        cb(null, new RechargeData(results[0], results[1]));
    });
};

/**
 * 充值
 * @param client
 * @param userId
 * @param rechargeId
 * @param channelId
 * @param receiptData
 * @param cb
 */
exports.recharge = function(client, userId, rechargeId, channelId, receiptData, isFake, cb) {
    checkRequire();  
    var rechargeTemp = c_recharge[rechargeId]; //获取到充值项数据
    exports.canRecharge(client, userId, rechargeId, channelId, function(err, effTime) {
        if (err) return cb(err);
        _validIAP(client, channelId, receiptData, function(err, transId) {
            if (err) return cb(err);
            _rechargeDiamond(client, userId, rechargeId, channelId, transId, effTime, isFake, function(err, data) {
                if (err) return cb(err);
                return cb(null, data);
            });
        });
    });
};

/**
 * 充值
 * @param client
 * @param userId
 * @param rechargeId
 * @param channel
 * @param transId
 * @param cb
 */
exports.rechargeNotValid = function(client, userId, rechargeId, channel, transId, isFake, cb) {
    checkRequire();
    var rechargeTemp = c_recharge[rechargeId]; //获取到充值项数据
    exports.canRecharge(client, userId, rechargeId, channel, function(err, effTime) {
        if (err) return cb(err);
        _rechargeDiamond(client, userId, rechargeId, channel, transId, effTime, isFake, function(err, data) {
            if (err) return cb(err);
            return cb(null, data);
        });
    });
};

exports.canRecharge = function(client, userId, rechargeId, channelId, cb) {
    checkRequire();
    if (!c_recharge[rechargeId]) {
        return cb(getMsg(c_msgCode.noGoods)); //此商品不存在
    }
    var c_payData = c_payInfo[rechargeId];
    if (!c_payData[channelId]) {
        return cb(getMsg(c_msgCode.noGoods)); //此商品不存在
    }
    return cb(null);
};

/**********************************************************private**************************************************************/
// 外部必须判断条件
var _rechargeDiamond = function(client, userId, rechargeId, channelId, transId, effTime, isFake, cb) {
    var rechargeTemp = c_recharge[rechargeId]; //获取到充值项数据

    // 对应渠道是否有该物品
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            rechargeDao.count(client, { userId: userId, rechargeId: rechargeId }, cb1);
        },
        function(cb1) {
            rechargeDao.count(client, { userId: userId }, cb1);
        },
        function(cb1) {
            activityDao.select(client, { type: c_prop.activityTypeKey.singleCharge, isOpen: 1 }, cb1);
        },
        function(cb1) {
            rechargeDao.count(client, "userId = ? and rechargeId BETWEEN ? AND ?", [userId, 60, 100], cb1);
        }

    ], function(err, results) {
        if (err) return cb(err);
        var gamePlayer = results[0];
        var userData = gamePlayer.userData;
        var rechargeCount = results[1];
        var allCount = results[2];
        var activityData = results[3];
        var youXuanCount = results[4];

        var addDiamond = rechargeTemp.diamond; //充值金额
        var userUpdate = {};
        //userUtils.addVipExpc(userData,addDiamond);//vip积分
        // userUpdate.vipScore = userData.vipScore;//vip积分
        //userUpdate.vip = userData.vip;//计算出vip等级

        //第一次充值判断是否3倍
        // if (allCount <= 0 && rechargeTemp.isTreble) {
        //     addDiamond += rechargeTemp.diamond * 2;
        // }

        //addDiamond +=  rechargeCount > 0 ? rechargeTemp.extra : rechargeTemp.first;//计算上额外送的
        addDiamond += rechargeTemp.extra;

        // 对应商品列表
        var bagItems = {};
        var equipBagItems = {};
       // var mailItems = {};
        var itemDiamond = 0; // 物品列表里加的钻石
        if (rechargeTemp.dscore && rechargeTemp.dscore > 0) { //积分
            rechargeTemp.items = rechargeTemp.items || [];
            rechargeTemp.items.push([1809, rechargeTemp.dscore]);
        }
        if (rechargeTemp.lottery && rechargeTemp.lottery > 0) { //乐透值
            rechargeTemp.items = rechargeTemp.items || [];
            rechargeTemp.items.push([2000, rechargeTemp.lottery]);
        }
        if (rechargeTemp.items) {
            var items = {};
            rechargeTemp.items.forEach(function(v) {
                items[v[0]] = v[1];
            });
            //获得物品
            var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.recharge);
            if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
            if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);
   
            userUpdate.bag = userData.bag;
            userUpdate.equipBag = userData.equipBag;
            itemDiamond += itemsArr[8];
        }
        if (addDiamond > 0) {
            userUtils.addCurrency(userData, c_prop.currencyTypeKey.diamond, addDiamond, c_prop.itemGetTypeKey.recharge, rechargeId);
        }
        userUpdate.diamond = userData.diamond;
        userUpdate.giveDiamond = userData.giveDiamond;
        userUpdate.buyDiamond = userData.buyDiamond;
        userUpdate.prestige = userData.prestige;
        userUpdate.heroData = userData.heroData;

        // // 是否为月卡或周卡
        // if (rechargeId == c_prop.rechargeIdKey.month) {
        //     userUtils.addMonthCardBuff(userData);
        // } else if (rechargeId == c_prop.rechargeIdKey.week) {
        //     userUtils.addWeekCardBuff(userData);
        // }
        userUpdate.buff = userData.buff;

        if (rechargeTemp.guildGiftBox) {
            guildBiz.sendGiftBox(client, userId, userData.nickName, rechargeTemp.guildGiftBox, function(err, data) {});
        }

        //支付回调,添加充值
        async.parallel([
            function(cb1) { 
               userDao.update(client, userUpdate, { id: userId }, function(err1, tmpData1){
                    if(err1){
                         console.error("PAY STATUS INFO1:%s,%d,%d,%d,%d", userData.accountId, userId, rechargeTemp.type, rechargeId, isFake ? 0 : 1, err1);
                    }
                    cb1(null, tmpData1);
               });
            },
            function(cb1) {
                var rechargeEntity = new RechargeEntity();
                rechargeEntity.userId = userId;
                rechargeEntity.rechargeId = rechargeId;
                rechargeEntity.diamond = rechargeTemp.diamond || 0;
                rechargeEntity.rechargeTime = new Date();
                rechargeEntity.channelId = channelId;
                rechargeEntity.transId = transId;
                rechargeEntity.effTime = effTime;
                rechargeEntity.userLvl = userData.lvl;
                rechargeEntity.currency = "CNY";
                // 记录为对应渠道的
                var c_payData = c_payInfo[rechargeId];
                var goodsPrice = parseInt(c_payData[channelId][1]);
                rechargeEntity.payMoney = goodsPrice;
                rechargeDao.insert(client, rechargeEntity, function(err1, data1){
                    if(err1){
                         console.error("PAY STATUS INFO2:%s,%d,%d,%d,%d", userData.accountId, userId, rechargeTemp.type, rechargeId, isFake ? 0 : 1, err1);
                    }
                    cb1(null, data1);
                });
            },
            function(cb1) { //单笔充值
                if (!activityData || activityData.startTime.isAfter(new Date()) || activityData.endTime.isBefore(new Date())) {
                    cb1(null); //活动结束
                } else {
                    var arr = activityData.exValues;
                    var items = activityData.items;
                    var tempCount = 0;
                    var tempList = [];
                    for (var i = 0; i < arr.length; i++) {
                        if (rechargeTemp.diamond >= arr[i]) {
                            //发送邮件
                            var mailEntity = mailBiz.createEntityByType(userId, c_prop.mailTypeKey.temp5, [], items[i]);
                            mailEntity.addTime = new Date();
                            tempList.push(mailEntity);
                            tempCount++;
                        } else {
                            break;
                        }
                    }

                    mailBiz.addMailByList(client, tempList, function(err1, data){
                        if(err1){
                             console.error("PAY STATUS INFO3:%s,%d,%d,%d,%d", userData.accountId, userId, rechargeTemp.type, rechargeId, isFake ? 0 : 1, err1);
                        }
                        cb1(null);
                    });
                    cb1(null);
                }
            },
            function(cb1) { // 月卡&周卡

                // if(rechargeTemp.type != c_prop.rechargeGoodsTypeKey.card){
                //     return cb1(null);
                // } 

                // //首次购买月卡&周卡 跑马灯
                // if (rechargeCount == 0) {
                //     if (rechargeId == c_prop.rechargeIdKey.week) {
                //         chatBiz.addSysData(104, [userData.nickName]);
                //     } else if (rechargeId == c_prop.rechargeIdKey.month) {
                //         chatBiz.addSysData(103, [userData.nickName]);
                //     }
                // }

                cb1(null);
            },
            function(cb1) {
                // 天命基金  
                if (rechargeTemp.type == c_prop.rechargeGoodsTypeKey.tmFund) {
                    activityDao.select(client, {
                        type: c_prop.activityTypeKey.tmFund,
                        isOpen: 1
                    }, function(err, tmFundActivityData) {
                        if (tmFundActivityData) {
                            activityBiz.receive(client, userId, tmFundActivityData.id, 0, function(err1, recvdata){
                                if(err1){
                                     console.error("PAY STATUS INFO4:%s,%d,%d,%d,%d", userData.accountId, userId, rechargeTemp.type, rechargeId, isFake ? 0 : 1, err1);
                                }
                                cb1(null, recvdata);
                            });
                            //首次购买天命基金 跑马灯
                            if (rechargeCount == 0) {
                                chatBiz.addSysData(100, [userData.nickName]);
                            }
                        } else {
                            cb1(null);
                        }
                    });
                } else {
                    cb1(null);
                }
            },
            function(cb1) {
                // 每日特惠
                if (rechargeTemp.type == c_prop.rechargeGoodsTypeKey.dailyPreferential) {
                    activityDao.select(client, {
                        type: c_prop.activityTypeKey.dayShop, 
                        isOpen: 1
                    }, function(err, tmpActivityData) {
                        if (tmpActivityData) {
                            activityBiz.receive(client, userId, tmpActivityData.id, rechargeId, function(err1,recvdata){
                                if(err1){
                                     console.error("PAY STATUS INFO5:%s,%d,%d,%d,%d", userData.accountId, userId, rechargeTemp.type, rechargeId, isFake ? 0 : 1, err1);
                                }
                                cb1(null, recvdata);
                            });
                            //首次购买每日优选 跑马灯
                            if (youXuanCount == 0) {
                                chatBiz.addSysData(102, [userData.nickName]);
                            }
                        } else {
                            cb1(null);
                        }
                    });

                } else {
                    cb1(null);
                }
            },
            function(cb1) {
                // 打赏 
                if (rechargeTemp.type == c_prop.rechargeGoodsTypeKey.daShang) {
                    activityDao.select(client, {
                        type: c_prop.activityTypeKey.giftShop,
                        isOpen: 1
                    }, function(err, tmpActivityData) {
                        if (tmpActivityData) {
                            activityBiz.receive(client, userId, tmpActivityData.id, rechargeId, function(err1, recvdata){
                                if(err1){
                                     console.error("PAY STATUS INFO6:%s,%d,%d,%d,%d", userData.accountId, userId, rechargeTemp.type, rechargeId, isFake ? 0 : 1, err1);
                                }
                                cb1(null, recvdata);
                            });
                        } else {
                            cb1(null);
                        }
                    });

                } else {
                    cb1(null);
                }
            },
            function(cb1) {
                //  修改fakeData数据
                var gameCommonBiz = require("uw-game-common").gameCommonBiz;
                if (rechargeTemp.type == c_prop.rechargeGoodsTypeKey.diamond) {
                    gameCommonBiz.updateFakeData(client, c_prop.fakeDataTypeKey.payDiamondNum, 1, function(){});
                } else if (rechargeTemp.type == c_prop.rechargeGoodsTypeKey.daShang) {  
                    gameCommonBiz.updateFakeData(client, c_prop.fakeDataTypeKey.payDSGiftNum, 1, function(){});
                } else if (rechargeTemp.type  == c_prop.rechargeGoodsTypeKey.tmFund) {
                    gameCommonBiz.updateFakeData(client, c_prop.fakeDataTypeKey.payTmFundNum, 1, function(){});
                } else {
                    gameCommonBiz.updateFakeData(client, c_prop.fakeDataTypeKey.payUserNum, 1, function(){});
                } 
                cb1(null);
            }
        ], function(err, data) {

            console.error("PAY OK:%s,%d,%d,%d,%d", userData.accountId, userId, rechargeTemp.type, rechargeId, isFake ? 0 : 1);

            // 特殊处理, 需要改掉订单状态
            if (err) {
                if (!isFake) { // 过滤掉模拟充值
                    if (!transId) {
                        transId = genTransId();
                    }
                    var biObj = new biHlObj.paymentObj(userData.accountId, userId, transId, rechargeTemp.cost, userData.exData[c_prop.userExDataKey.loginIP], addDiamond);
                    biObj.extra = "goods_id:" + rechargeId + ";user_level:" + userData.lvl; //+";";//+userData.exData[c_prop.userExDataKey.uaInfo];
                    biHlBiz.HlPaymentBi(biObj, userData.serverIndexId, userData.id, gamePlayer.accountData, biObj.ip, function(err, data) {});

                    var oObj = new ossObj.ossRecharge(userId, userData.lvl, rechargeId, parseInt(rechargeTemp.cost || "0"), userData.channelId, userData.sdkChannelId);
                    ossBiz.WriteOss(oObj);
                }
                console.error("PAY STATUS ERR:%s,%d,%d,%d,%d", userData.accountId, userId, rechargeTemp.type, rechargeId, isFake ? 0 : 1, err);
                return cb(null, [userUpdate, addDiamond, rechargeId]);
            }
            //bonusBiz.inviteeCharge(client, userId, rechargeTemp.diamond, function(){});
            //activityBiz.dayRecharge(client, userData,function(){});
            var tmFundData = data[4];
            var dayShopData = data[5];
            var daShangData = data[6];
            //var fakeData = data[8]; 

            // 最新活动数据
            if (tmFundData) {
                userUpdate.activity = tmFundData[0].activity;
            } else if (dayShopData) {
                userUpdate.activity = dayShopData[0].activity;
            } else if (daShangData) {
                userUpdate.activity = daShangData[0].activity;
            }
            // 充值立即入库
            gamePlayer.save(client);

            // BI
            //console.log("ready to send HlPaymentBi");
            if (!isFake) { // 过滤掉模拟充值
                if (!transId) {
                    transId = genTransId();
                }
                var biObj = new biHlObj.paymentObj(userData.accountId, userId, transId, rechargeTemp.cost, userData.exData[c_prop.userExDataKey.loginIP], addDiamond);
                biObj.extra = "goods_id:" + rechargeId + ";user_level:" + userData.lvl; //+";";//+userData.exData[c_prop.userExDataKey.uaInfo];
                biHlBiz.HlPaymentBi(biObj, userData.serverIndexId, userData.id, gamePlayer.accountData, biObj.ip, function(err, data) {});

                var oObj = new ossObj.ossRecharge(userId, userData.lvl, rechargeId, parseInt(rechargeTemp.cost || "0"), userData.channelId, userData.sdkChannelId);
                ossBiz.WriteOss(oObj);
            }

            // 充值成就任务
            _addRechargeTask(client, userId, rechargeTemp.type, addDiamond);
            cb(null, [userUpdate, addDiamond, rechargeId]);
        });
    });
};

var _addRechargeTask = function(client, userId, rechargeType, addDiamond) {
    checkRequire();
    var cTaskType = 0;
    // if (rechargeType == c_prop.rechargeGoodsTypeKey.card) {
    //     cTaskType = c_prop.cTaskTypeKey.buyWeekCard;
    // } else if (rechargeType == c_prop.rechargeGoodsTypeKey.card) {
    //     cTaskType = c_prop.cTaskTypeKey.buyMonthCard;
    // } else 
    if (rechargeType == c_prop.rechargeGoodsTypeKey.tmFund) {
        cTaskType = c_prop.cTaskTypeKey.buyTMFund;
    } else if(rechargeType == c_prop.rechargeGoodsTypeKey.daShang) {
        cTaskType = c_prop.cTaskTypeKey.buyDashang;
    } else if(rechargeType == c_prop.rechargeGoodsTypeKey.dailyPreferential) {
        cTaskType = c_prop.cTaskTypeKey.buyDayShop;
    } else if(rechargeType == c_prop.rechargeGoodsTypeKey.diamond) {
        taskBiz.setTaskValue(client, userId, c_prop.cTaskTypeKey.buyDiamond, addDiamond, function() {});
    }

    if (cTaskType > 0)
        taskBiz.setTaskValue(client, userId, cTaskType, 1, function() {});
};

var _validIAP = function(client, channel, receiptData, cb) {
    if (!projectCfg.isValidIAP) {
        return cb(null);
    }
    if (receiptData) {
        //苹果验证
        appStoreBiz.verifyReceipt(projectCfg.isSandBox, receiptData, function(err, transaction_id) {
            if (err) return cb(err);
            rechargeDao.select(client, { channel: channel, transId: transaction_id }, function(err, data) {
                if (err) return cb(err);
                if (data) return cb(getMsg(c_msgCode.rechargeSuccess)); //已经成功充值//防重复提交的
                cb(null, transaction_id);
            });
        });
    } else {
        //todo 其他验证
        return cb(getMsg(c_msgCode.validateFail)); //验证失败
    }
};

/*if(require.main = module){
    checkRequire();
    exports.recharge(require("uw-db").uwClient, 68698, 21, 99999, null, function(err, data){console.log(err)})
} */