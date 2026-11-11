/**
 * Created by Administrator on 2014/5/9.
 */
var uwData = require("uw-data");
var c_game = uwData.c_game;
var c_mail = uwData.c_mail;
var consts = uwData.consts;
var c_prop = uwData.c_prop;
var t_item = uwData.t_item;
var t_medal = uwData.t_medal;
var c_msgCode = uwData.c_msgCode;
var MailEntity = require('uw-entity').MailEntity;
var async = require("async");
var getMsg = require("uw-utils").msgFunc(__filename);
var mailDao = require("./../dao/mailDao");
var userDao = require("uw-user").userDao;
var userBiz = require("uw-user").userBiz;
var propUtils = require("uw-utils").propUtils;
var commonUtils = require("uw-utils").commonUtils; 
var g_cache = require("uw-global").g_cache;
var userUtils = require("uw-user").userUtils;
var exports = module.exports;
var ds = require('uw-ds').ds;

var OPERATE_READ = 0;//读操作
var OPERATE_PICK = 1;//提取物品操作
var treasureUtils = null;
var checkRequire = function() {
    treasureUtils = treasureUtils || require("uw-treasure").treasureUtils;
};

/**
 * 根据类型添加一个邮件
 * @param client
 * @param userId
 * @param type
 * @param {Array} replaceArgs
 * @param items 物品
 * @param cb
 * @returns MailEntity
 */
exports.addByType = function(client, userId, type, replaceArgs, items, cb) {
    var mailEntity = exports.createEntityByType(userId, type, replaceArgs, items);
    mailDao.insert(client, mailEntity, function(err, data) {
        if (err) return cb(err);
        var gamePlayer =  g_cache.getGamePlayerInCache(userId);
        if(gamePlayer){
            gamePlayer.setMailFlag(1);
        } 
        cb(null);
    });
};

/**
 * 创建entity实例
 * @param userId
 * @param type
 * @param replaceArgs
 * @param items
 * @returns {MailEntity}
 */
exports.createEntityByType = function(userId, type, replaceArgs, items) {
    var mailData = c_mail[type];
    var mailEntity = new MailEntity();
    mailEntity.userId = userId;//"用户id"
    mailEntity.type = type;//"类型"
    mailEntity.fromName = null;//"发送者"
    mailEntity.title = null;//"标题"
    mailEntity.content = null;//"内容"
    mailEntity.replaceArgs = replaceArgs;//"内容"
    mailEntity.items = items;//"附件物品"
    mailEntity.delHours = mailData.delHours;//"操作后几小时删除"
    mailEntity.delTime = null;//"删除时间"
    mailEntity.expireTime = (new Date()).addDays(mailData.expireDays);//"过期时间"
    mailEntity.isPicked = 0;//"是否提取物品"
    mailEntity.isRead = 0;//"是否阅读"
    mailEntity.addTime = new Date();
    return mailEntity;
};

/**
 * 批量插入邮件
 * @param client
 * @param entityList
 * @param cb
 */
exports.addMailByList = function(client, entityList, cb) {
    mailDao.insertList(client, entityList, function(err, data) {
        if (err) return cb(err);
        cb(null);
    });
};

/**
 * 阅读邮件
 * @param client
 * @param userId
 * @param mailId
 * @param cb
 */
exports.setRead = function(client, userId, mailId, cb) {
    mailDao.select(client, { id: mailId, userId: userId, isDelete: 0 }, function(err, mailData) {
        if (err) return cb(err);
        if (!mailData) return cb(getMsg(c_msgCode.noMail));//邮件不存在
        if (mailData.isRead) return cb(null);
        //更新删除时间
        _setDelTime(mailData, OPERATE_READ);

        var updateMail = { isRead: 1, delTime: mailData.delTime };
        if (_isNeedToDel(mailData)) {
            //假删除
            updateMail.isDelete = 1;
        }

        mailDao.update(client, updateMail, { id: mailId, userId: userId }, cb);

        var gamePlayer =  g_cache.getGamePlayerInCache(userId);
        if(gamePlayer){
            exports.checkGamePlayerMail(client, gamePlayer);
        }  
    });
};

/**
 * 提取物品
 * @param client
 * @param userId
 * @param mailId
 * @param cb
 */
exports.pickItems = function(client, userId, mailId, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            mailDao.select(client, { id: mailId, userId: userId, isDelete: 0 }, cb1);
        },
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[1];
        var mailData = data[0], userData = gamePlayer.userData;
        if (!mailData) return cb(getMsg(c_msgCode.noMail));//邮件不存在
        if (Object.keys(mailData.items).length <= 0) return cb(getMsg(c_msgCode.noItemToReceive));//没有物品不能领取
        if (mailData.isPicked) return cb(getMsg(c_msgCode.hasReceive));//已经被领取过啦
        var bagItems = {};
        var equipBagItems = {};
        var isFull = false;
        var isMail = false;
        var items = {}; 
        //var mailItems = {};
        //var getItems = [];
        
        //getItems = _getItems(mailData, userData);
        items = mailData.items;
        treasureUtils.addTreasure(client, userData, items);
        var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.mailAffix);  
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);
        if (Object.keys(itemsArr[5]).length > 0) {
            isFull = true;
            isMail = true;
        }

        //更新删除时间
        _setDelTime(mailData, OPERATE_PICK);
        mailData.isPicked = 1; 

        var getGold = userUtils.getNumOfItems(items, c_prop.itemTypeKey.gold);
        var getDiamond = userUtils.getNumOfItems(items, c_prop.itemTypeKey.diamond);

        var updateData = {      //gold,diamond,buyDiamond,giveDiamond,bag,equipBag,prestige
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            prestige: userData.prestige,
            jxExp: userData.jxExp,
            cybExp: userData.cybExp,
            medalData: userData.medalData,
            heroData: userData.heroData,
            heroNum: userData.heroNum,
            buff: userData.buff
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));
        async.parallel([
            function(cb1) {
                var updateMail = { isPicked: mailData.isPicked, delTime: mailData.delTime}; 
                if (_isNeedToDel(mailData)) {
                    //假删除
                    updateMail.isDelete = 1;
                }
                mailDao.update(client, updateMail, { id: mailId }, cb1);//更新邮件状态
            }
        ], function(err, data) {
            if (err) return cb(err); 
            // var count = 0;
            // var biType = 0;
            // if (mailData.type == c_prop.mailTypeKey.pkKill) {
            //     count = mailData.items[c_prop.spItemIdKey.starStone] || 0;
            //     biType = c_prop.upStarWayKey.pkAward;
            // } else {
            //     count = mailData.items[c_prop.spItemIdKey.starStone] || 0;
            //     biType = c_prop.upStarWayKey.mail;
            // }
            if(isMail){
                gamePlayer.setMailFlag(true);
            }else{
                exports.checkGamePlayerMail(client, gamePlayer);
            }
            return cb(null, [updateData, getGold, getDiamond, mailData.items, bagItems, equipBagItems, isMail, isFull]);
        });

    });
};

/**
 * 一键领取
 * @param client
 * @param userId
 * @param cb
 */
exports.pickAllItems = function(client, userId, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            mailDao.list(client, " userId = ? and isDelete = 0 and isPicked = 0 ", [userId], cb1);
        },
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[1];
        var mailList = data[0], userData = gamePlayer.userData;
        if (mailList.length == 0) return cb(getMsg(c_msgCode.noReceiveMail));//没有可领取邮件
        var returnArr = [];
        var returnItemsArr = [];
        var getGold = 0;
        var getDiamond = 0;
        var bagItems = {};
        var equipBagItems = {};
        var isMail = false;
        var isFull = false;
        var mailFlag = 0;
        async.map(mailList, function(locData, cb1) {
            returnArr.push(locData.id);
            //var getItems = [];
            var nowTime = new Date();
            var expireTime = locData.expireTime;
            if (expireTime && (expireTime.isBefore(nowTime) || expireTime.equals(nowTime))) {
                if (mailList.length == 1) return cb(getMsg(c_msgCode.noReceiveMail));//没有可领取邮件
            } else {
                if (Object.keys(locData.items).length > 0) {
                    locData.isPicked = 1; //_getIsPicked(locData);
 
                    //getItems = _getItems(locData, userData);
                    var items = locData.items;
                    var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.mailAffix);
                    if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
                    if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);
                    if (Object.keys(itemsArr[5]).length > 0) {
                        isFull = true;
                        isMail = true;
                    }

                    treasureUtils.addTreasure(client, userData, items);

                    getGold += userUtils.getNumOfItems(items, c_prop.itemTypeKey.gold);
                    getDiamond += userUtils.getNumOfItems(items, c_prop.itemTypeKey.diamond);            
                    returnItemsArr.push(itemsArr[5]);
                }
            }

            //更新删除时间
            _setDelTime(locData, OPERATE_PICK);

            var updateMail = { isRead: 1, isPicked: locData.isPicked, delTime: locData.delTime}; 
            if (_isNeedToDel(locData)) {
                //假删除
                updateMail.isDelete = 1;
            }
            mailDao.update(client, updateMail, { id: locData.id }, function() {});//更新邮件状态


            // var count = 0;
            // var biType = 0;
            // if (locData.type == c_prop.mailTypeKey.pkKill) {
            //     count = locData.items[c_prop.spItemIdKey.starStone] || 0;
            //     biType = c_prop.upStarWayKey.pkAward;
            // } else {
            //     count = locData.items[c_prop.spItemIdKey.starStone] || 0;
            //     biType = c_prop.upStarWayKey.mail;
            // }
            
            cb1();
        }, function(err, mapData) {
            if (err) return cb(err);
 
            var updateData = {
                gold: userData.gold,
                diamond: userData.diamond,
                buyDiamond: userData.buyDiamond,
                giveDiamond: userData.giveDiamond,
                prestige: userData.prestige,
                medalData: userData.medalData,
                heroData: userData.heroData,
                heroNum: userData.heroNum,
                buff: userData.buff
            };
            gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));

            if(!isMail){
                gamePlayer.setMailFlag(false);
            }else{
                gamePlayer.setMailFlag(true);
            }

            return cb(null, [updateData, getGold, getDiamond, returnArr, returnItemsArr, bagItems, equipBagItems, isMail, isFull]);      
        });
    });
};

/**
 * 获取列表
 * @param client
 * @param userId
 * @param cb
 */
exports.getList = function(client, userId, cb) {
    mailDao.list(client, " userId = ? and isDelete = ? order by id desc", [userId, 0], function(err, mailList) {
        if (err) return cb(err);
        //筛选过期的
        for (var i = 0; i < mailList.length; i++) {
            var locMailData = mailList[i];
            if (_isNeedToDel(locMailData)) {
                mailList.splice(i, 1);
                i--;
            }
        }
        cb(null, mailList);
    });
};

/**
 * 获取是否存在需要阅读或者提取物品的邮件
 * @param client
 * @param userId
 * @param cb
 */
exports.getIsNeedOperate = function(client, userId, cb) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){
        if(err) return cb(err);
        return cb(null, gamePlayer.getMailFlag());
    });
};

var _getIsNeedOperate = function(client, userId, cb) {
    mailDao.listCols(client, "expireTime,delTime,isPicked,items,isRead", " userId = ? and isDelete = ? ", [userId, 0], function(err, mailList) {
        //筛选过期的
        for (var i = 0; i < mailList.length; i++) {
            var locMailData = mailList[i];
            if (_isNeedToDel(locMailData)) {
                mailList.splice(i, 1);
                i--;
            }
        } 
        for (var i = 0; i < mailList.length; i++) {
            var locMailData = mailList[i];
            //如果有附件并且没有领取
            if (locMailData.items && Object.keys(locMailData.items).length > 0 && locMailData.isPicked == 0) {
                return cb(null, 1);
            } else if (locMailData.isRead == 0) {
                //如果没阅读
                return cb(null, 1);
            }
        }
        return cb(null);
    });
};

// 邮件红点数据
exports.checkGamePlayerMail = function(client, gamePlayer){

    _getIsNeedOperate(client, gamePlayer.getUserId(), function(err, flag){
        if(err) return;
        if(flag == 1){
            gamePlayer.setMailFlag(1);
        }else{
            gamePlayer.setMailFlag(0);
        }
    });
};

/************************************************************private*******************************************************************/

/**
 * 是否需要删除
 * @param mailData
 * @returns {boolean}
 * @private
 */
var _isNeedToDel = function(mailData) {
    var expireTime = mailData.expireTime;
    var delTime = mailData.delTime;
    var nowTime = new Date();
    //判断是否已经过期,或者到达删除时间
    if (expireTime.isBefore(nowTime) || expireTime.equals(nowTime)) {
        return true;
    }
    if (delTime && (delTime.isBefore(nowTime) || delTime.equals(nowTime))) {
        return true;
    }
    return false;
};


/**
 * 计算删除时间
 * @param mailData
 * @param type
 * @private
 */
var _setDelTime = function(mailData, type) {
    if (type == OPERATE_READ) {
        //没有物品则设置删除时间
        if (!mailData.items) {
            mailData.delTime = (new Date()).addHours(mailData.delHours);
        }
    } else if (type == OPERATE_PICK) {
        //设置删除时间
        mailData.delTime = (new Date()).addHours(mailData.delHours);
    }
};

// //计算获得物品  装备邮件类型需要做特殊处理，装备背包空间剩余多少领多少
// var _getItems = function(mailData, userData) {
//     var items = {};
//     var equipObj = {};
//     for (var key in mailData.items) {
//         if (t_item[key].type == c_prop.itemTypeKey.equip) equipObj[key] = mailData.items[key];
//     }
//     var equipBagResGrid = userUtils.getEquipBagResGrid(userData);       //装备背包剩余格子数
//     for (var key in equipObj) {
//         if (equipObj[key] <= equipBagResGrid) {
//             equipBagResGrid -= equipObj[key];
//             items[key] = equipObj[key];
//             delete equipObj[key];
//         } else {
//             if (equipBagResGrid != 0) {
//                 items[key] = equipBagResGrid;
//                 equipObj[key] = equipObj[key] - equipBagResGrid;
//                 equipBagResGrid = 0;
//                 if (equipObj[key] == 0) delete equipObj[key];
//             }
//         }
//     }
//     if (mailData.type == c_prop.mailTypeKey.equipChest) {
//         mailData.items = equipObj;
//         return [items];
//     } else {
//         for (var key in equipObj) {
//             mailData.items[key] = mailData.items[key] - equipObj[key];
//             if (mailData.items[key] == 0) delete mailData.items[key];
//         }
//         return [mailData.items, equipObj];
//     }

// }

//获取是否提取物品
// var _getIsPicked = function(mailData) {
//     if (mailData.type == c_prop.mailTypeKey.equipChest) {
//         var items = mailData.items;
//         if (Object.keys(items).length > 0) {
//             return 0;
//         } else {
//             return 1;
//         }
//     } else {
//         return 1;
//     }
// }