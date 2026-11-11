/**
 * Created by Administrator on 13-12-13.
 */
var uwData = require("uw-data");
var t_item = uwData.t_item;
var t_itemLogic = uwData.t_itemLogic;
var t_sellItem = uwData.t_sellItem;
var c_prop = uwData.c_prop;
var c_msgCode = uwData.c_msgCode;
var g_cache = require("uw-global").g_cache;
var exports = module.exports = {};

var uwUtils = require("uw-utils");
var getMsg = uwUtils.msgFunc(__filename);
var propUtils = uwUtils.propUtils;
var commonUtils = uwUtils.commonUtils;
var userUtils = require("uw-user").userUtils;

var userBiz = null;
var userDao = null;
//var equipDao = require("./../dao/equipDao");
//var equipBiz = require("./../biz/equipBiz");

var checkRequire = function() {
    userDao = userDao || require("uw-user").userDao;
    userBiz = userBiz || require("uw-user").userBiz;
};


/**
 * 购买暗影石
 * @param client
 * @param userId
 * @param itemId
 * @param num
 * @param cb
 */
// exports.buyDarkStoneItem = function (client, userId, itemId, num, cb) {
//     checkRequire();

// };

/**
 * 计算道具随机的物品
 * @param itemId
 * @returns {id:num,id:num}
 */
exports.calLogicItems = function(itemId) {
    var randomCreates = {};
    var itemLogicTempData = t_itemLogic[itemId];
    //console.log("calLogicItems:", itemId, itemLogicTempData);
    //console.log('itemLogicTempData',itemLogicTempData);
    if (itemLogicTempData.num < 0) {
        randomCreates = getRandomRangCreate(itemLogicTempData.create);
    } else if (itemLogicTempData.num == 0) {
        randomCreates = getRandomCreate(itemLogicTempData.create);
    } else if (itemLogicTempData.num == 1) {
        var weightArr = [];
        var create = [].concat(itemLogicTempData.create);
        for (var i = 0; i < create.length; i++) {
            weightArr.push(create[i][2]);
        }
        var weightIndex = commonUtils.getWeightRandom(weightArr);
        randomCreates[create[weightIndex][0]] = create[weightIndex][1];
    } else {
        var randomArr = commonUtils.getRandomArray(itemLogicTempData.create, itemLogicTempData.num);
        for (var i = 0; i < randomArr.length; i++) {
            var c = randomArr[i];
            if (randomCreates[c[0]]) {
                randomCreates[c[0]] += c[1];
            } else {
                randomCreates[c[0]] = c[1];
            }
        }
    }
    //必定获得
    if (itemLogicTempData.create2) {
        for (var i = 0; i < itemLogicTempData.create2.length; i++) {
            var locCreate2 = itemLogicTempData.create2[i];
            if (!locCreate2) continue;
            var locItemsId = locCreate2[0];
            var locItemsNum = locCreate2[1] || 0;
            if (!locItemsId || !locItemsNum) continue;
            var locOwnNum = randomCreates[locItemsId] || 0;
            randomCreates[locItemsId] = locOwnNum + locItemsNum;
        }
    }
    return randomCreates;
};

/**
 * 出售物品
 * @param client
 * @param userId|userData
 * @param itemId
 * @param itemNum
 * @param cb
 */
exports.sellItems = function(client, userId, itemId, itemNum, cb) {
    checkRequire();
    itemNum = parseInt(itemNum);
    if (itemNum <= 0) return cb(getMsg(c_msgCode.itemSaleError)); //出售物品异常

    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var bag = userData.bag;
        var bagItems = {};
        var delBagItems = {};
        var ownItemNum = bag[itemId];
        if (!ownItemNum || ownItemNum < itemNum) return cb(getMsg(c_msgCode.itemUnenough)); //背包没有指定数量的该物品
        var sellItemData = t_sellItem[itemId];
        if (!sellItemData) return cb(getMsg(c_msgCode.equipNotSale)); //该装备不可出售
        var sellItems = sellItemData.items;
        var items = {};
        for (var key in sellItems) {
            var item = sellItems[key];
            if (t_item[item[0]].type == c_prop.itemTypeKey.equip) {
                return cb(getMsg(c_msgCode.equipUnable)); //目前不支持获得装备
            }
            items[item[0]] = item[1] * itemNum;
        }
        userUtils.delBag(userData, itemId, itemNum, c_prop.itemCostTypeKey.sell);
        // userUtils.delBag(userData, itemId, itemNum);测试代码，为了避开bi
        delBagItems[itemId] = itemNum;
        var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.itemSell);
        // var getGold = userUtils.getNumOfItems(items, c_prop.itemTypeKey.gold);
        var getDiamond = userUtils.getNumOfItems(items, c_prop.itemTypeKey.diamond);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);

        var updateUser = {
            gold: userData.gold,
            diamond: userData.diamond
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        return cb(null, [updateUser, bagItems, getDiamond, delBagItems]);
    });
};

//--------------------------------------------private method-------------------------------------------------------------------------------

//获取随机的物品
var getRandomCreate = function(createArr) {
    var ret = {};
    for (var i = 0; i < createArr.length; i++) {
        var locCreate = createArr[i];
        if (Math.random() * 10000 <= locCreate[2]) {
            ret[locCreate[0]] = locCreate[1];
        }
    }
    return ret;
};

//获取随机的物品
var getRandomRangCreate = function(createArr) {
    var ret = {};
    var random = Math.random() * 10000;
    for (var i = 0; i < createArr.length; i++) {
        var locCreate = createArr[i];
        if (random <= locCreate[2]) {
            ret[locCreate[0]] = locCreate[1];
            break;
        }
    }
    return ret;
};
