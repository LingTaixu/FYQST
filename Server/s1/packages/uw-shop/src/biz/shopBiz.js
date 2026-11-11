/**
 * Created by Sara on 2015/8/12.
 */
var uwData = require("uw-data");
var consts = uwData.consts;
var c_game = uwData.c_game;
var c_prop = uwData.c_prop;
var c_msgCode = uwData.c_msgCode;
var c_shop = uwData.c_shop;
var t_hero = uwData.t_hero;
var getMsg = require("uw-utils").msgFunc(__filename);
var formula = require("uw-formula");
var ShopEntity = require('uw-entity').ShopEntity;
var ShopRecordEntity = require("uw-entity").ShopRecordEntity;
var async = require("async");
var shopDao = require("./../dao/shopDao");
var shopRecordDao = require("./../dao/shopRecordDao");
var propUtils = require("uw-utils").propUtils;
var commonUtils = require("uw-utils").commonUtils;
var loginClient = require("uw-db").loginClient;
var project = require("uw-config").project;
var t_item = uwData.t_item;
var t_itemEquip = uwData.t_itemEquip;
var ossObj = require("uw-log").ossObj;
var ossBiz = require("uw-log").ossBiz;
var g_cache = require("uw-global").g_cache;
var ds = require("uw-ds").ds;
var exports = module.exports;
Number.tempId2Job = function(tempId) {
    return tempId.toString()[0] * 1;
};
var userDao = null;
var userUtils = null;
var mailBiz = null;
var taskBiz = null;
var userBiz = null;
var heroBiz = null;
var equipBiz = null;
var heroDao = null;
var fightUtils = null;
var employBiz = null;
var chatBiz = null;
var serverInfoDao = null;
var itemBiz = null;
var bossBiz = null;
var activityDao = null;
var activityBiz = null;
var guildBiz = null;
var checkRequire = function() {
    mailBiz = mailBiz || require("uw-mail").mailBiz;
    taskBiz = taskBiz || require("uw-task").taskBiz;
    userDao = userDao || require("uw-user").userDao;
    userUtils = userUtils || require("uw-user").userUtils;
    userBiz = userBiz || require("uw-user").userBiz;
    equipBiz = equipBiz || require("uw-equip").equipBiz;
    heroBiz = heroBiz || require("uw-hero").heroBiz;
    heroDao = heroDao || require("uw-hero").heroDao;
    fightUtils = fightUtils || require("uw-fight").fightUtils;
    employBiz = employBiz || require("uw-employ").employBiz;
    chatBiz = chatBiz || require("uw-chat").chatBiz;
    serverInfoDao = serverInfoDao || require("uw-server-info").serverInfoDao;
    itemBiz = itemBiz || require("uw-item").itemBiz ;
    bossBiz = bossBiz || require("uw-boss").bossBiz ;
    activityDao = activityDao || require("uw-activity").activityDao ;
    activityBiz = activityBiz || require("uw-activity").activityBiz ;
    bossBiz = bossBiz || require("uw-boss").bossBiz;
    guildBiz = guildBiz || require("uw-guild").guildBiz;
};
/**
 * 获取商店数据
 * @param client
 * @param userId
 * @param type
 * @param cb
 */
exports.getInfo = function(client, userId, type, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            //userDao.selectCols(client,"lvl",{id:userId},cb1);
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            _getShopData(client, userId, type, cb1);
        },
        function(cb1) {
            cb1(null);
            //heroDao.listCols(client," tempId "," userId = ? ",[userId],cb1);
        },
        function(cb1) {
            serverInfoDao.select(loginClient, { serverId: project.serverId }, cb1);
        }

    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData, shopData = data[1], heroList = data[2], serverData = data[3];
        heroList = gamePlayer.heroListData;
        var tempIdArr = [];
        for (var i = 0; i < heroList.length; i++) {
            tempIdArr.push(heroList[i].tempId);
        }
        _calRefreshData(client, shopData, type, userData, tempIdArr, serverData, cb);
    });
};

/**
 * 刷新商店
 * @param client
 * @param userId
 * @param type
 * @param lvlRefresh
 * @param cb
 */
exports.refreshExShop = function(client, userId, type, lvlRefresh, cb) {
    //return cb(null,null);
    checkRequire();
    if (type != c_prop.shopTypeKey.mystery) return cb(getMsg(c_msgCode.shopNotFresh));//商店类型不需要刷新
    var nowTime = new Date();
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            _getShopData(client, userId, type, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData, shopData = data[1], heroList = gamePlayer.heroListData;
        var tempIdArr = [];
        for (var i = 0; i < heroList.length; i++) {
            tempIdArr.push(heroList[i].tempId);
        }
        var userLvl = userData.lvl;
        if (type == c_prop.shopTypeKey.mystery) {
            var costDiamond = 50;        //刷新消耗
            if (userData.diamond < costDiamond || costDiamond < 0) return cb(getMsg(c_msgCode.noDiamond));//钻石不足
        }

        //刷新商品数据
        var items = _getNewItems(type, userLvl, tempIdArr);
        shopData.items = items;
        if (type == c_prop.shopTypeKey.mystery) {
            //扣除元宝
            userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.refreshExShop);
        }

        var updateExShopData = {
            items: shopData.items,
            refreshCount: shopData.refreshCount,
            refreshCountResetTime: shopData.refreshCountResetTime
        };
        var updateData = {
            gold: userData.gold,
            diamond: userData.diamond
        };
        async.parallel([
            function(cb1) {
                shopDao.update(client, updateExShopData, { id: shopData.id }, cb1);
            },
            function(cb1) {
                userDao.update(client, updateData, { id: userId }, cb1);
            }
        ], function(err, data1) {
            if (err) return cb(err);
            cb(null, [updateExShopData, updateData, costDiamond]);
        });
    });
}

/**
 * 商店购买
 * @param client
 * @param userId
 * @param type
 * @param index
 * @param num
 * @param cb
 */
exports.buy = function(client, userId, type, index, num, cb) {
    //console.error("shopBiz.buy", userId, type, index, num);
    if(num <= 0){
        return cb(getMsg(c_msgCode.paramsError));
    }
    checkRequire();
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            if (type == c_prop.shopTypeKey.normal || type == c_prop.shopTypeKey.gem || type == c_prop.shopTypeKey.diamond || type == c_prop.shopTypeKey.gold || type == c_prop.shopTypeKey.worldBoss || type == c_prop.shopTypeKey.kejin) {
                exports.getInfo(client, userId, type, cb1);
            } else {
                shopDao.select(client, { userId: userId, type: type }, cb1);
            }
        },
        function(cb1) {
            if (type == c_prop.shopTypeKey.kejin) {
                activityDao.select(client, { type: c_prop.activityTypeKey.kejin, isOpen: 1 }, cb1);
            } else {
                cb1(null);
            }
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData, shopData = data[1], heroList = gamePlayer.heroListData,
            kejinActData = data[2];
        var tempIdArr = [];
        for (var i = 0; i < heroList.length; i++) {
            tempIdArr.push(heroList[i].tempId);
        }
        var itemShopData = shopData.items[index];
        if (!itemShopData) return cb(getMsg(c_msgCode.noGoods));//"此商品不存在"
        var c_shopId = itemShopData[0];
        var c_ShopData = c_shop[c_shopId];
        var mailItems = {};

        var limitNum = itemShopData[1] || 0;
        //console.log('asdfdsfsd',shopData);
        if (limitNum >= 0) {
            //限购次数
            if (limitNum < num) return cb(getMsg(c_msgCode.goodsSellOut));//此商品已售罄
            if (type != c_prop.shopTypeKey.equip) itemShopData[1] = limitNum - num;
        }

        //消耗货币
        var costGold = 0;
        var costDiamond = 0;
        var costItemId = 0;
        var costPrice = c_ShopData.price * num;
        switch (c_ShopData.currencyType) {
            case c_prop.currencyTypeKey.gold:
                if (userData.gold < costPrice) return cb(getMsg(c_msgCode.noGolds));//金币不足;
                costGold = costPrice;
                break;
            case c_prop.currencyTypeKey.diamond:
                if (userData.diamond < costPrice) return cb(getMsg(c_msgCode.noDiamond));//钻石不足;
                costDiamond = costPrice;
                break;
            case c_prop.currencyTypeKey.honor:
                if (userData.honor < costPrice) return cb(getMsg(c_msgCode.noHonor));//荣誉值不足
                break;
            case c_prop.currencyTypeKey.prestige:
                if (userData.prestige < costPrice) return cb(getMsg(c_msgCode.noFame));//声望不足");
                break;
            case c_prop.currencyTypeKey.expedition:
                var count = userData.bag[79] || 0;
                costItemId = 79;
                if (count < costPrice) return cb(getMsg(c_msgCode.noMoney));//货币不足");
                break;
            case c_prop.currencyTypeKey.expeditionHigh:
                var count = userData.bag[80] || 0;
                costItemId = 80;
                if (count < costPrice) return cb(getMsg(c_msgCode.noMoney));//货币不足");
                break;
            case c_prop.currencyTypeKey.dScore:
                costItemId = 1809;
                var count = userData.bag[1809] || 0;
                if (count < costPrice) return cb(getMsg(c_msgCode.noIntegral));//积分不足");
                //dadian记录商人 积分消耗
                break;

        }

        var itemId = c_ShopData.itemId;

        //得到物品
        //gold,diamond,buyDiamond,giveDiamond,bag,equipBag          [shopId,num,[属性],评分]
        var items = {};
        var costGoldItem = {};
        var costDiamondItem = {};
        var overlapNum = c_ShopData.itemNum || 1;
        var itemNum = num * overlapNum;
        items[itemId] = itemNum;
        costGoldItem[itemId] = costGold;
        costDiamondItem[itemId] = costDiamond; 
        // var equipBagResGrid = userUtils.getEquipBagResGrid(userData);       //装备背包剩余格数
        // for (var key in items) {
        //     if (t_item[key].type == c_prop.itemTypeKey.equip) {       //装备需要判断背包是否有空间
        //         if (items[key] <= equipBagResGrid) {
        //             equipBagResGrid -= itemShopData[1];
        //         } else {
        //             mailItems[key] = [items[key] - equipBagResGrid, itemShopData[2], itemShopData[3]];
        //             itemShopData[1] = equipBagResGrid;
        //             equipBagResGrid = 0;
        //             //if(items[key] == 0) delete items[key];
        //         }
        //     }
        // }
        var bagItems = {};
        var equipBagItems = {};
        // if (type == c_prop.shopTypeKey.equip) {
        //     for (var i = 0; i < itemShopData[1]; i++) {
        //         var equipMaxId = 1;
        //         if (userData.equipBag != null && JSON.stringify(userData.equipBag) != "{}") equipMaxId = parseInt(commonUtils.getLastKey(userData.equipBag)) + 1;
        //         var randomArr = itemShopData[2];      //装备随到的属性值
        //         var gradeBase = itemShopData[3];       //装备评分
        //         userData.equipBag[equipMaxId] = [itemId, randomArr, gradeBase, 0];
        //         equipBagItems[equipMaxId] = [itemId, randomArr, gradeBase, 0];
        //     }
        // } else 
        {

            // // 世界BOSS判断
            // if (type == c_prop.shopTypeKey.worldBoss) {
            //     if (!bossBiz.isCanBuyWbShopItem(userId, c_shopId)) {
            //         return cb(getMsg(c_msgCode.goodsSellOut));//此商品已售罄
            //     }  
            // } else 
            if (type == c_prop.shopTypeKey.kejin) {
                // 氪金活动ID
                if (!kejinActData) return cb(getMsg(c_msgCode.activitiesEnd));//活动已结束

                // 氪金礼包要做判断，只能购买一次
                var receiveData = userData.activity[kejinActData.id] || [];  //  []
                if (receiveData.indexOf(c_shopId) != -1) {
                    return cb(getMsg(c_msgCode.buyOne));//该商品只能购买一次
                }
                //领取次数 
                receiveData.push(c_shopId);
                userData.activity[kejinActData.id] = receiveData;

                // //dadian记录氪金礼包
                // var oObj = new ossObj.ossCostCurrency(userId, userData.lvl, "dScore", c_prop.itemCostTypeKey.kejin, costPrice, itemId, t_item[itemId].name, 1);
                // ossBiz.WriteOss(oObj);

                chatBiz.addSysData(158, [userData.nickName, t_item[itemId].name]);
                chatBiz.addSysData(159, [userData.nickName, t_item[itemId].name]);
            }

            // 购买宝箱 直接把宝箱对应物品给玩家
            if (t_item[itemId].type == c_prop.itemTypeKey.chest) {
                // 宝箱类，只处理了物品获取
                items = {};
                var chestId = itemId;
                for (var i = 0; i < itemNum; i++) {
                    var logicItems = itemBiz.calLogicItems(chestId);        //宝箱随机的物品
                    items = propUtils.mergerProp(items, logicItems);
                }
            }
 
            var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.shop);
            if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
            if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);
            if (Object.keys(itemsArr[5]).length > 0) mailItems = propUtils.mergerProp(mailItems, itemsArr[5]);
        }

        if (type == c_prop.shopTypeKey.equip) shopData.items.splice(index, 1);        //删除
        //如果装备商店物品全购完，自动刷新
        if (type == c_prop.shopTypeKey.equip) {
            var isRefresh = true;
            for (var i = 0; i < shopData.items.length; i++) {
                if (shopData.items[i][1] > 0) {
                    isRefresh = false;
                    break;
                }
            }
            if (isRefresh) shopData.items = _getNewItems(type, userData.lvl, tempIdArr);
        }
        //王牌精选  神秘商人 买后排序
        if (type == c_prop.shopTypeKey.trumpSelect || type == c_prop.shopTypeKey.mystery || type == c_prop.shopTypeKey.arena) {
            shopData.items.sort(function(a, b) {
                if (a[1] == 0) return 1;
                if (b[1] == 0) return -1;
            });
        }

        if(c_ShopData.shareDiamond){
            guildBiz.shareDiamond(client, userId, userData.nickName, c_shopId, function(){});
        }

        //todo 临时处理记录类型
        var costType = c_prop.itemCostTypeKey.shop;
        if (c_ShopData.currencyType == c_prop.currencyTypeKey.gold) {
            costType = c_prop.goldCostTypeKey.buy;
        } else if (c_ShopData.currencyType == c_prop.currencyTypeKey.diamond) {
            costType = c_prop.diamondCostTypeKey.shop;
        }

        userUtils.costCurrency(userData, c_ShopData.currencyType, costPrice, costType, itemId, itemNum, type);
        var delBagItems = {};
        if (costItemId > 0)
            delBagItems[costItemId] = costPrice;

        var updateData = {
            gold: userData.gold,
            honor: userData.honor,
            diamond: userData.diamond,
            prestige: userData.prestige,
            giveDiamond: userData.giveDiamond,
            buyDiamond: userData.buyDiamond,
            heroData: userData.heroData,
            heroNum: userData.heroNum,
            activity: userData.activity,
            buff: userData.buff
        };
        gamePlayer.setUserDataDirty();

        var updateShopData = {
            items: shopData.items
        };
        async.parallel([
            function(cb1) {
                if (type != c_prop.shopTypeKey.normal && type != c_prop.shopTypeKey.diamond && type != c_prop.shopTypeKey.gem && type != c_prop.shopTypeKey.gold && type != c_prop.shopTypeKey.worldBoss && type != c_prop.shopTypeKey.kejin) {
                    shopDao.update(client, updateShopData, { id: shopData.id }, cb1);
                } else {
                    cb1();
                }
            },
            function(cb1) {
                if (type == c_prop.shopTypeKey.gold) {
                    var gameCommonBiz = require("uw-game-common").gameCommonBiz;
                    gameCommonBiz.updateFakeData(client, c_prop.fakeDataTypeKey.payGoldNum, 1, cb1);
                } else {
                    cb1();
                }
            }
        ], function(err, data) {
            if (err) return cb(err);
            var isMail = false;
            _recordShop(client, type, userData, items, costGoldItem, costDiamondItem);
            if (JSON.stringify(mailItems) != "{}") {
                // mailBiz.addByType(client, userId, c_prop.mailTypeKey.equipChest, [], mailItems, function(err, data1) {
                //     if (err) return cb(err);
                    isMail = true;
                //     cb(null, [updateData, updateShopData, bagItems, equipBagItems, c_shopId, costGold, costDiamond, isMail, delBagItems]);
                // });
            }  
            cb(null, [updateData, updateShopData, bagItems, equipBagItems, c_shopId, costGold, costDiamond, isMail, delBagItems]);
            

            // 记录oss日志
            var channelId = gamePlayer.getChannelId();
            var sdkChannelId = gamePlayer.getSdkChannelId();
            var oObj = new ossObj.ossBuy(userId, userData.lvl, type, c_ShopData.currencyType, costPrice, c_shopId, itemId, t_item[itemId].name, itemNum, channelId, sdkChannelId);
            ossBiz.WriteOss(oObj);
        });
    });
};

/**
 * 购买全部
 * @param client
 * @param userId
 * @param type
 * @param cb
 */
exports.buyAll = function(client, userId, type, cb) {
    return cb(null, null);

};

/**
 * 拉霸
 * @param client
 * @param userId
 * @param type:"操作类型 0 使用钻石 1 使用猫粮" (废弃参数)
 * @param guide:" 0 普通拉霸 1 引导拉霸"
 * @param cb
 */
exports.laba = function(client, userId, type, guide, labaNum, cb) {
    checkRequire();
    if (type != 0 /*&& type != 1*/) return cb(getMsg(c_msgCode.protocolError));//协议参数错误
    if (labaNum != 1 && labaNum != 10) return cb(getMsg(c_msgCode.protocolError));//协议参数错误
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData, heroList = gamePlayer.heroListData;

        var delBagItems = {};
        var bagItems = {};
        var tmpArr1 = c_game.labaCfg[3].split(";");
        var returnItemId = tmpArr1[0] || 58;
        var costDiamond = 0;
        var costItemNum = 0;
        //if (type == 0) { 
        // 10连抽，优先使用猫粮
        var itemId = c_game.labaCfg[1] || 1807;
        var ownItemCount = userData.bag[itemId] || 0;
        if (ownItemCount >= labaNum) {
            costItemNum = labaNum;
            delBagItems[itemId] = costItemNum;
            userUtils.delBag(userData, itemId, costItemNum, c_prop.itemCostTypeKey.laba);
        } else {

            var restItemCount = labaNum - ownItemCount;
            var costDiamond1 = c_game.labaCfg[2] || 580;
            costDiamond = costDiamond1 * restItemCount;
            if (userData.diamond < costDiamond || costDiamond < 0) return cb(getMsg(c_msgCode.noDiamond));//钻石不足;
            userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.laba, itemId, restItemCount);
            userUtils.addTodayCount(userData, c_prop.userRefreshCountKey.laba, labaNum);

            if (ownItemCount > 0) {
                delBagItems[itemId] = ownItemCount;
                userUtils.delBag(userData, itemId, ownItemCount, c_prop.itemCostTypeKey.laba);
            }
        }
        //}  

        //记录抽宠次数  达到指定次数 送小伙伴
        var labaTotalCount = userData.exData[c_prop.userExDataKey.labaTotalCount] || 0;
        userData.exData[c_prop.userExDataKey.labaTotalCount] = labaTotalCount + labaNum;
        if (userData.exData[c_prop.userExDataKey.labaTotalCount] >= 500) {
            var heroTempId = 204;
            userBiz.initHeroStar(userData, heroTempId, function() {});
        }
        chatBiz.addSysData(143, [userData.nickName, userData.exData[c_prop.userExDataKey.labaTotalCount]]);

        var temItems = {};
        var labaRetArray = [];
        var labaRet = 0;
        if (guide) {
            // var tmpArr = c_game.labaCfg[3].split(";");
            // temItems[parseInt(tmpArr[0])] = parseInt(tmpArr[1]);
            // temItems[c_game.labaCfg[9]] = 1;
            // labaRet = 1;
            var labaRetItem = [];
            var lootId = c_game.labaCfg[9];
            var temItemsArr = fightUtils.getLootItems(lootId);
            for (var j = 0; j < temItemsArr.length; j++) {
                if (!temItems[temItemsArr[j][0]]) temItems[temItemsArr[j][0]] = 0;
                temItems[temItemsArr[j][0]] += temItemsArr[j][1];
                if (temItemsArr[j][0] != returnItemId) {
                    labaRetItem.push(temItemsArr[j][0]);
                }
            }
            labaRet = 1;
            labaRetArray.push([labaRet, labaRetItem]);
        } else {

            var jobsIdArray = [];
            heroList.forEach(function(v) {
                jobsIdArray.push(Number.tempId2Job(v.tempId));
            });

            for (var i = 0; i < labaNum; i++) {

                // 只出拥有角色的宠物
                labaRet = _labaProcess();
                var labaRetItem = [];
                var lootIds = c_game.labaCfg[labaRet + 5].split(",");

                var chooseJob = commonUtils.getRandomOne(jobsIdArray);
                var lootId = parseInt(lootIds[chooseJob - 1]);
                var temItemsArr = fightUtils.getLootItems(lootId);
                //录视频用的！！！！
                // labaRet = 2;
                // temItemsArr = [[119000,1],[58,500]];
                //录视频用的！！！！ end
                for (var j = 0; j < temItemsArr.length; j++) {
                    if (!temItems[temItemsArr[j][0]]) temItems[temItemsArr[j][0]] = 0;
                    temItems[temItemsArr[j][0]] += temItemsArr[j][1];
                    if (temItemsArr[j][0] != returnItemId) {
                        labaRetItem.push(temItemsArr[j][0]);
                    }
                }

                labaRetArray.push([labaRet, labaRetItem]);
            }
        }

        // 记录拉霸记录
        var rwdItems = Object.keys(temItems);
        var rwdItemId = 0;
        for (var i = 0; i < rwdItems.length; i++) {
            rwdItemId = rwdItems[i];
            if (t_item[rwdItemId].type == 15) {
                var recItems = {};
                recItems[rwdItemId] = 1;
                employBiz.insertEmployRewardRecord(client, 1, userData, 0, 0, recItems, function(err, data) {
                });
            }
        }

        //计算物品
        var itemsArr = [];
        //var equipBagItems = {};
        var itemsArr = userUtils.saveItems(userData, temItems, c_prop.itemGetTypeKey.laba);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        //if(Object.keys(itemsArr[1]).length>0) equipBagItems = propUtils.mergerProp(equipBagItems,itemsArr[1]);
        heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.getPetNum, labaNum);

        var updateData = {
            diamond: userData.diamond,
            counts: userData.counts,
            countsRefreshTime: userData.countsRefreshTime,
            exData: userData.exData,
            heroNum: userData.heroNum,
            heroData: userData.heroData
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);

        // 记录拉霸日志
        var channelId = gamePlayer.getChannelId();
        var sdkChannelId = gamePlayer.getSdkChannelId();
        var oObj = new ossObj.ossLaba(userId, userData.lvl, type, labaNum, costItemNum, costDiamond, '', channelId, sdkChannelId);
        ossBiz.WriteOss(oObj);

        return cb(null, [updateData, bagItems, delBagItems, labaRetArray, costDiamond]);
        // });
    });
};

/**
 * 商店购买
 * @param client
 * @param userId
 * @param type
 * @param index
 * @param num
 * @param cb
 */
exports.buyWbShopItem = function(client, userId, goodsId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){

        var type = c_prop.shopTypeKey.worldBoss;
        var userData = gamePlayer.userData;
        var c_ShopData = c_shop[goodsId];
        var itemId = c_ShopData.itemId;
        var itemNum = 1;
        var costItemId = 0;
        var costPrice = c_ShopData.price * itemNum;
        switch (c_ShopData.currencyType) {
            case c_prop.currencyTypeKey.gold:
                if (userData.gold < costPrice) return cb(getMsg(c_msgCode.noGolds));//金币不足;
                costGold = costPrice;
                break;
            case c_prop.currencyTypeKey.diamond:
                if (userData.diamond < costPrice) return cb(getMsg(c_msgCode.noDiamond));//钻石不足;
                costDiamond = costPrice;
                break;
            case c_prop.currencyTypeKey.honor:
                if (userData.honor < costPrice) return cb(getMsg(c_msgCode.noHonor));//荣誉值不足
                break;
            case c_prop.currencyTypeKey.prestige:
                if (userData.prestige < costPrice) return cb(getMsg(c_msgCode.noFame));//声望不足");
                break;
            case c_prop.currencyTypeKey.expedition:
                var count = userData.bag[79] || 0;
                costItemId = 79;
                if (count < costPrice) return cb(getMsg(c_msgCode.noMoney));//货币不足");
                break;
            case c_prop.currencyTypeKey.expeditionHigh:
                var count = userData.bag[80] || 0;
                costItemId = 80;
                if (count < costPrice) return cb(getMsg(c_msgCode.noMoney));//货币不足");
                break;
            case c_prop.currencyTypeKey.dScore:
                costItemId = 1809;
                var count = userData.bag[1809] || 0;
                if (count < costPrice) return cb(getMsg(c_msgCode.noIntegral));//积分不足");
                //dadian记录商人 积分消耗
                break;
        }

        // 购买宝箱 直接把宝箱对应物品给玩家
        if (t_item[itemId].type == c_prop.itemTypeKey.chest) {
            // 宝箱类，只处理了物品获取
            items = {};
            var chestId = itemId;
            for (var i = 0; i < itemNum; i++) {
                var logicItems = itemBiz.calLogicItems(chestId);        //宝箱随机的物品
                items = propUtils.mergerProp(items, logicItems);
            }
        }

        var bagItems = {};
        var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.shop);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
 
        //todo 临时处理记录类型
        var costType = c_prop.itemCostTypeKey.shop;
        if (c_ShopData.currencyType == c_prop.currencyTypeKey.gold) {
            costType = c_prop.goldCostTypeKey.buy;
        } else if (c_ShopData.currencyType == c_prop.currencyTypeKey.diamond) {
            costType = c_prop.diamondCostTypeKey.shop;
        } 
        userUtils.costCurrency(userData, c_ShopData.currencyType, costPrice, costType, itemId, itemNum, type);
        if(c_ShopData.shareDiamond){
            guildBiz.shareDiamond(client, userId, userData.nickName, goodsId, function(){});
        }

        var delBagItems = {};
        if (costItemId > 0)
            delBagItems[costItemId] = costPrice;

        var updateData = {
            gold: userData.gold,
            honor: userData.honor,
            diamond: userData.diamond,
            prestige: userData.prestige,
            giveDiamond: userData.giveDiamond,
            buyDiamond: userData.buyDiamond, 
        };
        gamePlayer.setUserDataDirty();

        _recordShop(client, type, userData, items, {}, {});

        cb(null, [updateData, bagItems, delBagItems]);

        // 记录oss日志
        var channelId = gamePlayer.getChannelId();
        var sdkChannelId = gamePlayer.getSdkChannelId();
        var oObj = new ossObj.ossBuy(userId, userData.lvl, type, c_ShopData.currencyType, costPrice, goodsId, itemId, t_item[itemId].name, itemNum, channelId, sdkChannelId);
        ossBiz.WriteOss(oObj);

    });
};

/*******************************************************private*************************************************************/
var _recordShop = function(client, shopType, userData, items, costGold, costDiamond) {
    var insertList = [];
    for (var itemId in items) {
        var shopRecord = new ShopRecordEntity();
        shopRecord.userId = userData.id;
        shopRecord.userLvl = userData.lvl;
        shopRecord.userVip = userData.vip;
        shopRecord.costDiamond = costDiamond[itemId] || 0;
        shopRecord.costGold = costGold[itemId] || 0;
        shopRecord.buyItemId = parseInt(itemId);
        shopRecord.buyAmount = parseInt(items[itemId]);
        shopRecord.buyTime = new Date();
        shopRecord.shopType = shopType;
        insertList.push(shopRecord);
    }
    shopRecordDao.insertList(client, insertList, function(err) {
        if (err) return console.log(err);
    })
}


//输出指定范围内的随机数的随机整数
var _getRandomNumber = function(start, end) {
    var choice = end - start + 1;
    return Math.floor(Math.random() * choice + start);
};

var _arrLength = function(length, arr) {
    if (length - arr.length <= 0) {
        arr.splice(_getRandomNumber(0, arr.length - 1), 1);
    }
}

//判断是否有数据，无数据插入一条
var _getShopData = function(client, userId, type, cb) {
    if (type == c_prop.shopTypeKey.normal || type == c_prop.shopTypeKey.gem || type == c_prop.shopTypeKey.diamond || type == c_prop.shopTypeKey.gold || type == c_prop.shopTypeKey.worldBoss || type == c_prop.shopTypeKey.kejin) {
        var shopEntity = new ShopEntity();
        shopEntity.id = 1;
        shopEntity.userId = userId;
        shopEntity.type = type;
        cb(null, shopEntity);
    } else {
        shopDao.select(client, { userId: userId, type: type }, function(err, shopData) {
            if (err) return cb(err);
            if (!shopData) {        //插入一条
                var shopEntity = new ShopEntity();
                shopEntity.userId = userId;
                shopEntity.type = type;
                shopDao.insert(client, shopEntity, function(err, data) {
                    if (err) return cb(err);
                    shopEntity.id = data.insertId;
                    cb(null, shopEntity);
                });
            } else {
                cb(null, shopData);
            }
        });
    }
};

//计算物品刷新 
var _calRefreshData = function(client, shopData, type, userData, tempIdArr, serverData, cb) {
    var isRefresh = false;
    var userLvl = userData.lvl;
    switch (type) {
        case c_prop.shopTypeKey.normal:
            if (!shopData.items || shopData.items.length < 1) {
                shopData.items = _getNewItems(type, userLvl, tempIdArr);
                //shopData.lastTime = curLastRefreshTime;
                isRefresh = false;
            }
            break;
        case c_prop.shopTypeKey.arena:
            var curLastRefreshTime = _getCurLastRefreshTime();
            if (!shopData.lastTime || !shopData.lastTime.equals(curLastRefreshTime)) {
            // if (!shopData.items || shopData.items.length < 1) {
                var items = _getNewItems(type, userLvl, tempIdArr);
                if(userData.heroData[103]){//有拉切尔 则不给再买拉切尔了
                    for (var i = 0; i < items.length; i++) {
                         var shopId = items[i][0];
                         if(c_shop[shopId].itemId == 1000103) {
                            items[i][1] = 0;
                            break;
                         }
                    } 
                }
                shopData.items = items;
                shopData.lastTime = curLastRefreshTime;
                isRefresh = true;
            }
            //排序
            shopData.items.sort(function(a, b) {
                if (a[1] == 0) return 1;
                if (b[1] == 0) return -1;
            }); 
            break;
        // case c_prop.shopTypeKey.equip:
        //     var curLastRefreshTime = _getCurLastRefreshTime();
        //     if (!shopData.lastTime || !shopData.lastTime.equals(curLastRefreshTime)) {
        //         shopData.items = _getNewItems(type,userLvl,tempIdArr);
        //         shopData.lastTime = curLastRefreshTime;
        //         isRefresh = true;
        //     }
        //     break;
        case c_prop.shopTypeKey.gem:
            if (!shopData.items || shopData.items.length < 1) {
                shopData.items = _getNewItems(type, userLvl, tempIdArr);
                //shopData.lastTime = curLastRefreshTime;
                isRefresh = false;
            }
            break;
        case c_prop.shopTypeKey.expedition:
            if (!shopData.items || shopData.items.length < 1) {
                shopData.items = _getNewItems(type, userLvl, tempIdArr);
                //shopData.lastTime = curLastRefreshTime;
                isRefresh = false;
            }
            break;
        case c_prop.shopTypeKey.expeditionHigh:
            if (!shopData.items || shopData.items.length < 1) {
                shopData.items = _getNewItems(type, userLvl, tempIdArr);
                //shopData.lastTime = curLastRefreshTime;
                isRefresh = false;
            }
            break;
        case c_prop.shopTypeKey.diamond:
            if (!shopData.items || shopData.items.length < 1) {
                shopData.items = _getNewItems(type, userLvl, tempIdArr);
                shopData.lastTime = curLastRefreshTime;
                isRefresh = false;
            }
            break;
        case c_prop.shopTypeKey.trumpSelect://王牌精选
            var curLastRefreshTime = _getCurLastRefreshTime();
            if (!shopData.lastTime || !shopData.lastTime.equals(curLastRefreshTime)) {
                //获取开服时间
                if (!serverData) return cb(getMsg(c_msgCode.serverMaintain));//服务器维护中...
                var now = new Date();
                var day = _getDiffDay(serverData.serverDate, now);
                day = day < 0? 0:day;
                var itemCfg = c_game.trumpSelectShop || [];
                day = day % itemCfg.length;
                var goods = itemCfg[day];
                goods = goods.split(',');
                var reTempItems = [];
                for (var i = 0; i < goods.length; i++) {
                    var locShopData = c_shop[goods[i]];
                    reTempItems.push([locShopData.id, locShopData.limit || 1]);
                }
                //console.log('fsdfweqweq',reTempItems);
                //shopData.items = _getNewItems(type,userLvl,tempIdArr);
                shopData.items = reTempItems;
                shopData.lastTime = curLastRefreshTime;
                isRefresh = true;
            }
            break;

        case c_prop.shopTypeKey.mystery://神秘商人
            var tmNow = new Date();
            var needRefresh = _isNeedRefreshMystery(tmNow, shopData.lastTime);
            if (needRefresh) {
                //console.log('fsdfweqweq',reTempItems);
                shopData.items = _getNewItems(type, userLvl, tempIdArr);
                shopData.lastTime = tmNow;
                isRefresh = true;
            }
            break;
        case   c_prop.shopTypeKey.gold:
            if (!shopData.items || shopData.items.length < 1) {
                shopData.items = _getNewItems(type, userLvl, tempIdArr);
                isRefresh = false;
            }
            break;
        case c_prop.shopTypeKey.worldBoss:
            if (!shopData.items || shopData.items.length < 1) {
                shopData.items = _getNewItems(type, userLvl, tempIdArr);
                isRefresh = false;
            }
            break;
        case c_prop.shopTypeKey.kejin:
            if (!shopData.items || shopData.items.length < 1) {
                shopData.items = _getNewItems(type, userLvl, tempIdArr);
                isRefresh = false;
            }
            break;
        default :
            break;
    }

    if (!isRefresh) return cb(null, shopData);

    var updateShopData = {};
    updateShopData.items = shopData.items;
    updateShopData.lastTime = shopData.lastTime;

    shopDao.update(client, updateShopData, { id: shopData.id }, function(err, data) {
        if (err) return cb(err);
        cb(null, shopData);
    });
};


//生成商品数组
var _getNewItems = function(type, userLvl, tempIdArr) {
    var reTempItems = [];
    var shopDataArr = [];
    var itemsLength = _getItemsLength(type);
    if (type == c_prop.shopTypeKey.equip) {       //装备商店特殊处理
        var itemsLengthArr = itemsLength.split(",");        //范围对应数量数组
        for (var i = 0; i < itemsLengthArr.length; i++) {
            shopDataArr = [];
            var itemsScope = c_game.shopCfg[i + 4].split(",");        //权重范围数组
            //过滤类型，权重范围，等级
            for (var key in c_shop) {
                var locShopData = c_shop[key];
                if (locShopData.type != type || locShopData.id < itemsScope[0] || locShopData.id > itemsScope[1]) continue;
                var job = t_itemEquip[locShopData.itemId].job;
                if (userLvl < locShopData.needLvl || userLvl > locShopData.endLvl || tempIdArr.indexOf(job) < 0) continue;
                shopDataArr.push(locShopData);
            }
            //权重
            var weightArr = [];
            for (var ii = 0; ii < shopDataArr.length; ii++) {
                var locShopData = shopDataArr[ii];
                weightArr.push(locShopData.rate);
            }

            if (itemsLength - reTempItems.length < 0) {
                _arrLength(itemsLength, reTempItems);
                if (itemsLength - reTempItems.length < 0) {
                    _arrLength(itemsLength, reTempItems);
                }
            }

            var arr = [];
            for (var ii = 0; ii < itemsLengthArr[i] - arr.length; ii++) {
                if (weightArr.length <= 0) break;
                var locIndex = commonUtils.getWeightRandom(weightArr);
                var locShopData = shopDataArr[locIndex];
                arr.push([locShopData.id, locShopData.limit || 1]);
                reTempItems.push([locShopData.id, locShopData.limit || 1]);

                weightArr.splice(locIndex, 1);
                shopDataArr.splice(locIndex, 1);
                ii--;
            }
        }

    } else {
        //过滤类型，等级
        for (var key in c_shop) {
            var locShopData = c_shop[key];
            if (locShopData.type != type) continue;
            if (locShopData.needLvl != 0 && userLvl < locShopData.needLvl) continue;
            if (locShopData.endLvl != 0 && userLvl > locShopData.endLvl) continue;
            shopDataArr.push(locShopData);
        }
        //过滤必出
        for (var i = 0; i < shopDataArr.length; i++) {
            var locShopData = shopDataArr[i];
            if (locShopData.rate == 10000) {
                reTempItems.push([locShopData.id, locShopData.limit || 1]);
                shopDataArr.splice(i, 1);
                i--;
            }
        }
        //随机剩余
        var weightArr = [];
        for (var i = 0; i < shopDataArr.length; i++) {
            var locShopData = shopDataArr[i];
            weightArr.push(locShopData.rate);
        }

        if (itemsLength - reTempItems.length < 0) {
            _arrLength(itemsLength, reTempItems);
            if (itemsLength - reTempItems.length < 0) {
                _arrLength(itemsLength, reTempItems);
            }
        }

        for (var i = 0; i < itemsLength - reTempItems.length; i++) {
            if (weightArr.length <= 0) break;
            var locIndex = commonUtils.getWeightRandom(weightArr);
            var locShopData = shopDataArr[locIndex];
            reTempItems.push([locShopData.id, locShopData.limit || 1]);

            weightArr.splice(locIndex, 1);
            shopDataArr.splice(locIndex, 1);
            i--;
        }
    }

    //排序
    reTempItems = reTempItems.sort(_sortItems);
    if (reTempItems.length > itemsLength) {
        for (var i = 0; i < reTempItems.length - itemsLength; i++) {
            reTempItems.pop();
        }
    }
    shopDataArr.length = 0;
    if (type == c_prop.shopTypeKey.equip) {       //给装备加具体属性评分
        reTempItems.sort(function() {
            return 0.5 - Math.random()
        });     //打乱数组顺序
        for (var i = 0; i < reTempItems.length; i++) {
            var templateId = c_shop[reTempItems[i][0]].itemId;
            var randomAbility = [];       //计算额外属性
            if (t_itemEquip[templateId].isUp == 1 || t_itemEquip[templateId].isRare == 1) {
                randomAbility = t_itemEquip[templateId].fixProp;
            } else {
                randomAbility = equipBiz.getRandomAbility(templateId);      //装备随到的属性值
            }
            reTempItems[i][2] = randomAbility;
            reTempItems[i][3] = equipBiz.getEquipGrade(templateId, randomAbility);        //计算评分
        }
    }
    return reTempItems;
};

//排序
var _sortItems = function(a, b) {
    var shopData1 = c_shop[a[0]];
    var shopData2 = c_shop[b[0]];
    return shopData1.order < shopData2.order ? -1 : 1;
};

//获取项目数
var _getItemsLength = function(type) {
    //"参数1：竞技场商店种类数量
    //参数2：普通商店种类数量"
    var itemLength = 0;
    switch (type) {
        case c_prop.shopTypeKey.normal:
            itemLength = c_game.shopCfg[1];
            break;
        case c_prop.shopTypeKey.arena:
            itemLength = c_game.shopCfg[0];
            break;
        case c_prop.shopTypeKey.equip:
            itemLength = c_game.shopCfg[3];
            break;
        case c_prop.shopTypeKey.gem:
            itemLength = c_game.shopCfg[2];
            break;
        case c_prop.shopTypeKey.expedition:
            itemLength = c_game.shopCfg[9];
            break;
        case c_prop.shopTypeKey.expeditionHigh:
            itemLength = c_game.shopCfg[10];
            break;
        case c_prop.shopTypeKey.diamond:
            itemLength = c_game.shopCfg[1];
            break;
        case c_prop.shopTypeKey.trumpSelect:
            itemLength = c_game.shopCfg[1];
            break;
        case c_prop.shopTypeKey.mystery:
            itemLength = 6;
            break;
        case c_prop.shopTypeKey.gold:
            itemLength = 20;
            break;
        case c_prop.shopTypeKey.worldBoss:
            itemLength = 20;
            break;
        case c_prop.shopTypeKey.kejin:
            itemLength = 20;
            break;
    }
    return itemLength;
};

//判断神秘商人 是否需要刷新
var _isNeedRefreshMystery = function(tmNow, lastTime) {
    if (!lastTime) {
        return true;
    }
    //console.log('asdfdfwerwerw',tmNow,lastTime);
    if (tmNow.getTime() - new Date(lastTime).getTime() > parseInt(3 * 60 * 60) * 1000) {//3小时刷新
        return true;
    }
    return false;
}

//获取最后一次的刷新具体时间
var _getCurLastRefreshTime = function() {
    // var curHour = (new Date).getHours();
    // var reTime = null;
    // if(curHour<5){
    //     reTime = (new Date).addDays(-1).clearTime().addHours(5);
    // }else{
    //     reTime = (new Date).clearTime().addHours(5);//.addHours(5)
    // }
    var reTime = (new Date).clearTime();
    return reTime;
};

// 获得拉霸结果
var _labaProcess = function() {

    var rCount = 0;
    var sCount = 0;     // S出现次数
    // 随机概率 R,S
    var arr = c_game.labaCfg[4].split(";")
    //随机剩余
    var symbolArr = ['R', 'S'];
    var weightArr = [];
    for (var i = 0; i < arr.length; i++) {
        weightArr.push(parseInt(arr[i])); //* 100
    }

    for (var i = 0; i < 3; i++) {
        var locIndex = commonUtils.getWeightRandom(weightArr);
        var symbol = symbolArr[locIndex];
        if (symbolArr[locIndex] == 'R') {
            rCount++;
        } else {
            sCount++;
        }
    }

    return sCount;
};

/**
 * 获得两个时间点相差多少天
 * @param startTime
 * @param endTime
 * @return day -1 开是时间在结束时间之后, >=0 相差多少天
 */
var _getDiffDay = function(startTime, endTime) {
    if (!startTime) {
        startTime = new Date();
    }
    return startTime.clone().clearTime().getDaysBetween(endTime.clone().clearTime());
};