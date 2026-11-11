/**
 * Created by Administrator on 2015/5/31.
 */
require("date-utils");
var uwData = require("uw-data");
var consts = uwData.consts;
var c_game = uwData.c_game;

var c_prop = uwData.c_prop;
var c_lvl = uwData.c_lvl;
var c_vip = uwData.c_vip;
var t_itemEquip = uwData.t_itemEquip;
var t_rebirth = uwData.t_rebirth;
var g_data = require("uw-global").g_data;
var g_cache = require("uw-global").g_cache;
var t_talismanSkill = uwData.t_talismanSkill;
var t_otherBuff = uwData.t_otherBuff;
var t_itemLogic = uwData.t_itemLogic;
var t_achieve = uwData.t_achieve;
var t_copy = uwData.t_copy;
var c_task = uwData.c_task;
var t_item = uwData.t_item;
var t_magicLvl = uwData.t_magicLvl;
var c_genuineQi = uwData.c_genuineQi;
var c_demonLotus = uwData.c_demonLotus;
var formula = require("uw-formula");
var commonUtils = require("uw-utils").commonUtils;
var propUtils = require("uw-utils").propUtils;
var equipBiz = require("uw-equip").equipBiz;
var logger = require('uw-log').getLogger("uw-logger", __filename);
var uwClient = require("uw-db").uwClient;
var mainClient = require("uw-db").mainClient;
var project = require("uw-config").project;
var g_lootConfig = require("uw-global").g_lootConfig;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var userBiz;
var chatBiz;
var taskBiz;
var itemBiz;
var mailBiz;
var sdkBiz;
var guildBiz;
var achieveBiz;
var accountDao;
//var bonusBiz;
var heroBiz;
var userDao;
var biHlObj = require("uw-log").biHlObj;
var biHlBiz = require("uw-log").biHlBiz;
var ossBiz = require("uw-log").ossBiz;
var ossObj = require("uw-log").ossObj;
var activityBiz = null;
var checkRequire = function() {
    chatBiz = chatBiz || require("uw-chat").chatBiz;
    taskBiz = taskBiz || require("uw-task").taskBiz;
    itemBiz = itemBiz || require("uw-item").itemBiz;
    mailBiz = mailBiz || require("uw-mail").mailBiz;
    sdkBiz = sdkBiz || require("uw-sdk").sdkBiz;
    accountDao = accountDao || require("uw-account").accountDao;
    //bonusBiz = bonusBiz || require("uw-bonus-share").bonusBiz;
    userDao = userDao || require("uw-user").userDao;
    userBiz = userBiz || require("./userBiz");
    guildBiz = guildBiz || require("uw-guild").guildBiz;
    achieveBiz = achieveBiz || require("uw-achieve").achieveBiz;
    heroBiz = heroBiz || require("uw-hero").heroBiz;
    activityBiz = activityBiz || require("uw-activity").activityBiz;
};
var checkBiRequire = function() {
    biHlBiz = biHlBiz || require("uw-log").biHlBiz;
    biHlObj = biHlObj || require("uw-log").biHlObj;
    ossBiz = ossBiz || require("uw-log").ossBiz;
    ossObj = ossObj || require("uw-log").ossObj;
};
Number.tempId2Job = function(tempId) {
    return tempId.toString()[0] * 1;
};
/**
 * 获取每日次数
 */
exports.getTodayCount = function(userData, type) {
    userData.counts = userData.counts || [];
    userData.countsRefreshTime = userData.countsRefreshTime || [];
    var count = userData.counts[type] || 0;
    var refreshTime = userData.countsRefreshTime[type];

    if (refreshTime) {
        refreshTime = new Date(refreshTime);
        if (!refreshTime.equalsDay(new Date())) {
            refreshTime = new Date();
            count = 0;
        }
    } else {
        refreshTime = new Date();
    }
    userData.counts[type] = count;
    userData.countsRefreshTime[type] = refreshTime;

    return count;
};

/**
 * 获得每日时间
 */
exports.getTodayRefreshTime = function(userData, type) {
    var refreshTime = userData.countsRefreshTime[type];

    if (refreshTime) {
        refreshTime = new Date(refreshTime);
        if (!refreshTime.equalsDay(new Date())) {
            refreshTime = new Date();
        }
    }

    return refreshTime;
};

/**
 * 添加每日次数
 */
exports.addTodayCount = function(userData, type, num) {
    var count = exports.getTodayCount(userData, type);
    userData.counts[type] = count + num;
    userData.countsRefreshTime[type] = new Date();
};

/**
 * 修改每日次数
 */
exports.changeTodayCount = function(userData, type, num) {
    userData.counts[type] = num;
    userData.countsRefreshTime[type] = new Date();
};


/**
 * 添加金币
 * @param userData
 * @param gold
 */
var _addGold = function(userData, gold) {
    if (gold <= 0) {
        return;
    }
    userData.gold = Math.ceil(userData.gold);
    gold = Math.ceil(gold);
    userData.gold += gold;
    //不能小于0
    userData.gold = userData.gold < 0 ? 0 : userData.gold;
    userData.gold = userData.gold > 4294967295 ? 4294967295 : userData.gold;
};

/**
 * 扣除金币
 * @param userData
 * @param gold
 */
var _reduceGold = function(userData, gold) {
    if (gold <= 0) {
        return;
    }
    userData.gold = Math.ceil(userData.gold);
    gold = Math.ceil(gold);
    userData.gold -= gold;
    //不能小于0
    userData.gold = userData.gold < 0 ? 0 : userData.gold;
    userData.gold = userData.gold > 4294967295 ? 4294967295 : userData.gold;
};

/**
 * 删除物品
 * @param userData
 * @param items
 * @param itemCostType
 */
exports.delItems = function(userData, items, itemCostType) {
    for (var key in items) {
        var locItemId = key;
        var locItemNum = parseInt(items[key]) || 0;
        _delEquipBagByTempId(userData, locItemId, locItemNum, itemCostType);
        _delBag(userData, locItemId, locItemNum, itemCostType);
    }
};

var _delEquipBagByTempId = function(userData, tempId, num, itemCostType) {
    for (var i = 0; i < num; i++) {
        for (var key in userData.equipBag) {
            var locData = userData.equipBag[key];
            var locTempId = locData[0];
            var locIsUp = locData[3];
            if (!locIsUp && locTempId == tempId) {
                // delete userData.equipBag[key];
                exports.delEquip(userData, key, itemCostType);
                break;
            }
        }
    }
};

// var _delBagByTempId = function(userData,tempId,num){
//     for(var i = 0;i<num;i++){
//         for(var key in userData.bag){
//             var locTempId = key;
//             if(locTempId==tempId){
//                 var locOwnNum = userData.bag[key]||0;
//                 //delete userData.bag[key];
//                 locOwnNum--;
//                 if(locOwnNum<=0){
//                     delete userData.bag[key];
//                 }else{
//                     userData.bag[key] = locOwnNum;
//                 }
//                 break;
//             }
//         }
//     }
// };

/**
 * 保存items数据
 * 需要更新的字段,gold,diamond,buyDiamond,giveDiamond,bag,equipBag,prestige
 * @param userData
 * @param items
 * @param itemGetType 物品产出途径
 * @param influences 是否会受buff影响 (金币，物品等)
 * @param dropEquip 是否丢弃装备 (挂机非boss的垃圾过滤掉)
 */
exports.saveItems = function(userData, items, itemGetType, influences, dropEquip) {
    checkBiRequire();
    checkRequire();
    if (!items) return;
    var bagItems = {};
    var equipBagItems = {};
    var expSum = 0;
    var rebirthExpSum = 0;
    var achieveExpSum = 0;
    var cybExpSum = 0;
    var jxExpSum = 0;
    var genuineQi = 0;
    var mailItems = {};
    var haveMail = false;
    var heroSkin = [];
    var getBuff = [];
    var diamond = 0;
    var gold = 0;
    for (var key in items) {
        var locId = parseInt(key);
        var locNum = parseInt(items[key]);
        if (locNum <= 0) {
            // 异常数据
            continue;
        }
        var t_itemData = t_item[locId];
        if (!t_itemData) continue;
        if (!g_lootConfig.isLoot(locId)) continue;

        var count = bagItems[locId] || 0;
        switch (t_itemData.type) {
            case c_prop.itemTypeKey.gold: //金币
                if (influences && influences[c_prop.itemTypeKey.gold]) {
                    locNum = Math.floor(locNum * (1 + influences[c_prop.itemTypeKey.gold]));
                }
                //console.error("ADDGOLD:",parseInt(items[key]), locNum, influences[c_prop.itemTypeKey.gold]);
                _addGold(userData, locNum);
                gold += locNum;
                break;
            case c_prop.itemTypeKey.diamond: //钻石
                _addDiamond(userData, locNum, itemGetType);
                diamond += locNum;
                break;
            case c_prop.itemTypeKey.prestige: //声望
                if (influences && influences[c_prop.itemTypeKey.prestige]) {
                    locNum = Math.floor(locNum * (1 + influences[c_prop.itemTypeKey.prestige]));
                }
                userData.prestige += locNum;
                break;
            case c_prop.itemTypeKey.exp: //经验
                exports.addUserExpc(userData, locNum);
                expSum += locNum;
                break;
            case c_prop.itemTypeKey.genuineQi: //真气
                exports.addGenuineQi(userData, locNum);
                genuineQi += locNum;
                break;
            case c_prop.itemTypeKey.rebirthExp: //转生经验
                userData.rebirthExp += locNum;
                rebirthExpSum += locNum;
                break;
            case c_prop.itemTypeKey.achieveExp: // 成就点数
                userData.achieveExp += locNum;
                achieveExpSum += locNum;
                break;
            case c_prop.itemTypeKey.power: // 体力
                userData.strength += locNum;
                break;
                // case c_prop.itemTypeKey.cybExp: // 次元壁（每日任务)活跃数
                //     userData.cybExp += locNum;
                //     cybExpSum += locNum;
                //     break;
                // case c_prop.itemTypeKey.jxExp: // 军衔活跃数
                //     userData.jxExp += locNum;
                //     jxExpSum += locNum;
                //     break;
            case c_prop.itemTypeKey.equip: //装备
                var equipBagResGrid = exports.getEquipBagResGrid(userData); //剩余格子数
                if (locNum <= equipBagResGrid) {
                    var addEquips = addEquip(userData, locId, locNum, itemGetType);
                    equipBagItems = propUtils.mergerProp(equipBagItems, addEquips);
                } else { //只加没有超出的部分
                    //背包满通过邮件发送
                    mailItems[key] = locNum - equipBagResGrid;
                    var addEquips = addEquip(userData, locId, equipBagResGrid, itemGetType);
                    equipBagItems = propUtils.mergerProp(equipBagItems, addEquips);
                    haveMail = true;
                }
                break;
            case c_prop.itemTypeKey.heroSkin: // 英雄皮肤
                checkRequire();
                var heroTempId = locId - 1000000;
                // 如果有该皮肤
                if (userData.heroData[heroTempId]) {
                    // 加入背包
                    addBag(userData, locId, locNum, itemGetType); //背包
                    bagItems[locId] = count + locNum;
                } else {
                    // userData.heroData[heroTempId] = { t:Math.floor(Date.now()/1000)};
                    userBiz.initHeroStar(userData, heroTempId, function() {});
                    // heroBiz.activeHeroTask(userData.id, heroTempId);
                    heroSkin.push(heroTempId);
                }
                var color = t_item[locId].color;
                var heroTypeCfg = { 4: "R", 5: "SR", 6: "SSR", 9: "SSS" };
                var heroType = heroTypeCfg[color];
                if (heroType) {
                    chatBiz = chatBiz || require("uw-chat").chatBiz;
                    chatBiz.addSysData(97, [userData.nickName, heroType, color, t_item[locId].name]);
                }
                break;
            case c_prop.itemTypeKey.gift: // 宠物
                addBag(userData, locId, locNum, itemGetType);
                bagItems[locId] = count + locNum;
                var itemData = t_item[locId];
                //t_item.rareLevel 1=R,2=SR,3=SSR,4=SSS
                var rareLevelCfg = { 2: "SR", 3: "SSR", 4: "SSS" };
                var petType = rareLevelCfg[itemData.rareLevel];
                
                //宠物合成的消息通知
                if (petType && itemGetType == c_prop.itemGetTypeKey.talismanConpound) {
                    //SR只发送系统消息通知，SSR发送系统消息和跑马灯消息通知 
                    if (itemData.rareLevel > 1) {
                        chatBiz.addSysData(190, [userData.nickName, itemData.color, itemData.name, petType]);
                    }
                    if (itemData.rareLevel > 2) {
                        chatBiz.addSysData(189, [userData.nickName, itemData.color, itemData.name, petType]);
                    }
                } else if (petType) {
                    chatBiz.addSysData(98, [userData.nickName, petType, itemData.color, t_item[locId].name]);
                    chatBiz.addSysData(157, [userData.nickName, petType, itemData.color, t_item[locId].name]);
                }

                if (itemData.rareLevel == 2) {
                    taskBiz.setTaskValue(uwClient, userData.id, c_prop.cTaskTypeKey.petSRNum, 1, function() {});
                } else if (itemData.rareLevel >= 3) {
                    taskBiz.setTaskValue(uwClient, userData.id, c_prop.cTaskTypeKey.petSSRNum, 1, function() {});
                }
                break;
            case c_prop.itemTypeKey.medal: // 称号
                addBag(userData, locId, locNum, itemGetType);
                bagItems[locId] = count + locNum;

                var color = t_item[locId].color;
                var medalType = "R";
                if (color == 4) {
                    medalType = "SR";
                } else if (color == 5) {
                    medalType = "SSR";
                } else if (color == 6) {
                    medalType = "SSS";
                }
                if (color >= 5) {
                    chatBiz = chatBiz || require("uw-chat").chatBiz;
                    chatBiz.addSysData(96, [userData.nickName, medalType, color, t_item[locId].name]);
                }
                break;
            case c_prop.itemTypeKey.geinikankan: //显示道具，不进背包，不作处理
                break;
            default:
                // 月卡和周卡 直接增加buff
                if (locId == c_prop.spItemIdKey.monthCard) {
                    exports.addMonthCardBuff(userData);
                    getBuff.push(c_prop.otherBuffIdKey.month);
                } else if (locId == c_prop.spItemIdKey.weekCard) {
                    // 需要比较后累计
                    exports.addWeekCardBuff(userData);
                    getBuff.push(c_prop.otherBuffIdKey.week);
                } else if (locId == c_prop.spItemIdKey.cybExp) {
                    userData.cybExp += locNum;
                    cybExpSum += locNum;
                    break;
                } else if (locId == c_prop.spItemIdKey.jxExp) {
                    userData.jxExp += locNum;
                    jxExpSum += locNum;
                    break;
                    // } else if (locId == c_prop.spItemIdKey.dScore) {
                    //     break;
                } else if (locId == c_prop.spItemIdKey.wangzhezhiqi) {
                    exports.addBuffImmediately(userData, c_prop.otherBuffIdKey.hpBUFF5);
                    getBuff.push(c_prop.otherBuffIdKey.hpBUFF5);
                    break;
                } else {
                    addBag(userData, locId, locNum, itemGetType); //背包
                    bagItems[locId] = count + locNum;
                    break;
                }
        }
    }
    if(!dropEquip && haveMail){
        mailBiz.addByType(uwClient, userData.id, c_prop.mailTypeKey.bagFullSupply, [], mailItems, function(){});
    }

    return [bagItems, equipBagItems, expSum, rebirthExpSum, genuineQi, mailItems, heroSkin, getBuff, diamond, achieveExpSum, gold, cybExpSum, jxExpSum];
};

/**
 * 添加装备
 * @param userData
 * @param templateId        //装备模板id
 * @param num
 * @param itemGetType
 */
var addEquip = function(userData, templateId, num, itemGetType) {
    var equipBagItems = {};
    if (typeof templateId == "object") {
        for (var key in templateId) {
            equipBagItems = _addEquip(userData, key, templateId[key], itemGetType);
        }
    } else {
        equipBagItems = _addEquip(userData, templateId, num, itemGetType);
    }
    return equipBagItems;
};

var _addEquip = function(userData, templateId, num, itemGetType) {
    if (num <= 0) return;
    checkBiRequire();
    var equipBag = userData.equipBag;
    var equipBagItems = {};
    for (var i = 0; i < num; i++) {
        var equipMaxId = 1;
        if (equipBag != null && JSON.stringify(equipBag) != "{}") equipMaxId = parseInt(commonUtils.getLastKey(equipBag)) + 1;
        var randomArr = [];
        if (t_itemEquip[templateId].isUp == 1 || t_itemEquip[templateId].isRare == 1 || t_itemEquip[templateId].type == c_prop.equipTypeKey.angelOrDemon) {
            randomArr = t_itemEquip[templateId].fixProp || randomArr;
        } else {
            randomArr = equipBiz.getRandomAbility(templateId); //装备随到的属性值
        }
        var gradeBase = equipBiz.getEquipGrade(templateId, randomArr); //装备评分
        equipBag[equipMaxId] = [templateId, randomArr, gradeBase, 0];
        equipBagItems[equipMaxId] = [templateId, randomArr, gradeBase, 0];
    }

    // if (itemGetType) {
    //     var oItems = [];
    //     // BI
    //     for (var k in equipBagItems) {
    //         var tmpId = equipBagItems[k][0];
    //         if(t_item[tmpId].color && t_item[tmpId].color >= 4){
    //             oItems.push(new ossObj.ossItemObj(tmpId, t_item[tmpId].name, 1));   
    //         }
    //         //     var biObj = new biHlObj.counterItemObj(userData.accountId, userData.id, userData.lvl, tmpId, 1, t_item[tmpId].name, "inflow", c_prop.itemGetType[itemGetType]);
    //         //     biHlBiz.HlCounterBi(biObj, userData.serverIndexId, userData.id, null, userData.exData[c_prop.userExDataKey.loginIP], function(err, data) {});

    //     }

    //     if (oItems.length > 0) {
    //         var oObj = new ossObj.ossItem("inflow", itemGetType, userData.id, userData.nickName, userData.accountId, userData.lvl, oItems, userData.channelId, userData.sdkChannelId);
    //         ossBiz.WriteOss(oObj);
    //     }
    // }

    return equipBagItems;
};

exports.delEquip = function(userData, id, itemCostType) {
    checkBiRequire();
    // if (itemCostType) {
    //     var equipItem = userData.equipBag[id];
    //     var tmpId = equipItem[0];
    //     //var biObj = new biHlObj.counterItemObj(userData.accountId, userData.id, userData.lvl, tmpId, 1, t_item[tmpId].name, "outflow", c_prop.itemCostType[itemCostType]);
    //     //biHlBiz.HlCounterBi(biObj, userData.serverIndexId, userData.id, null, userData.exData[c_prop.userExDataKey.loginIP], function(err, data) {});
    //      if(t_item[tmpId].color && t_item[tmpId].color >= 4){
    //         var oItems = [];
    //         oItems.push(new ossObj.ossItemObj(tmpId, t_item[tmpId].name, 1));
    //         var oObj = new ossObj.ossItem("outflow", itemCostType, userData.id, userData.nickName, userData.accountId, userData.lvl, oItems, userData.channelId, userData.sdkChannelId);
    //         ossBiz.WriteOss(oObj);
    //     }
    // }
    delete userData.equipBag[id];
}

//获取装备背包剩余格子数
exports.getEquipBagResGrid = function(userData) {
    var count = userData.equipBagBuyCount;
    var starCount = c_game.equipBagCfg[0];
    var addCount = c_game.equipBagCfg[1];
    var vipRight = exports.getWeekCardRight(userData);
    var vipCount = c_vip[vipRight].addEquipBag;
    var equipBagGrid = starCount + count * addCount + vipCount; //背包总格子数
    var equipBag = userData.equipBag || {};
    var sum = 0;
    for (var key in equipBag) { //装备背包 {"1":[物品id,[随到的属性值],评价,是否穿戴],...}  "1":指定id,累加上去的
        if (equipBag[key][3] == 1) sum += 1;
    }
    var restGrid = equipBagGrid - Object.keys(equipBag).length + sum;
    restGrid = restGrid < 0 ? 0 : restGrid;
    return restGrid;
}

/**
 * 添加背包
 * @param userData
 * @param itemId
 * @param num
 * @param itemGetType
 */
var addBag = function(userData, itemId, num, itemGetType) {
    if (typeof itemId == "object") {
        for (var key in itemId) {
            _addBag(userData, key, itemId[key], itemGetType);
        }
    } else {
        _addBag(userData, itemId, num, itemGetType);
    }
};
var _addBag = function(userData, itemId, num, itemGetType) {
    if (num <= 0) return;
    checkBiRequire();
    var bag = userData.bag;
    var ownItemCount = bag[itemId] || 0;
    ownItemCount += num;
    bag[itemId] = ownItemCount;

    if (itemGetType) {
        // BI
        //var biObj = new biHlObj.counterItemObj(userData.accountId, userData.id, userData.lvl, itemId, num, t_item[itemId].name, "inflow", c_prop.itemGetType[itemGetType]);
        //biHlBiz.HlCounterBi(biObj, userData.serverIndexId, userData.id, null, userData.exData[c_prop.userExDataKey.loginIP], function(err, data) {});

        var channelId = userData.channelId;
        var sdkChannelId = userData.sdkChannelId;
        if (c_prop.spItemIdKey.dScore == itemId) {
            var oObj = new ossObj.ossGetCurrency(userData.id, userData.lvl, c_prop.currencyTypeKey.dScore, itemGetType, num, 0, 0, "", channelId, sdkChannelId);
            ossBiz.WriteOss(oObj);
        } else if (c_prop.spItemIdKey.elfNectar == itemId) {
            taskBiz.setEntrustTaskValue(uwClient, userData.id, c_prop.entrustTaskTypeKey.elfNectar, num, function() {});
        } else {
            // if(t_item[itemId].color && t_item[itemId].color >= 4){
            //     var oItems = [];
            //     oItems.push(new ossObj.ossItemObj(itemId, t_item[itemId].name, num));
            //     var oObj = new ossObj.ossItem("inflow", itemGetType, userData.id, userData.nickName, userData.accountId, userData.lvl, oItems, channelId, sdkChannelId);
            //     ossBiz.WriteOss(oObj);
            // }
        }
    }
    // 物品入背包
    return bag;
};
/**
 * 扣除背包
 * @param userData
 * @param itemId
 * @param num
 * @param itemCostType 非必须日志使用
 * @param getItemId 非必须日志使用
 * @param getItemNum 非必须日志使用
 * @param para 非必须日志使用
 * @returns {*}
 */
exports.delBag = function(userData, itemId, num, itemCostType, getItemId, getItemNum, para) {
    if (typeof itemId == "object") {
        for (var key in itemId) {
            _delBag(userData, key, itemId[key], itemCostType, getItemId, getItemNum, para);
        }
    } else {
        _delBag(userData, itemId, num, itemCostType, getItemId, getItemNum, para);
    }
};

var _delBag = function(userData, itemId, num, itemCostType, getItemId, getItemNum, para) {
    if (num <= 0) return;
    checkBiRequire();
    checkRequire();
    var bag = userData.bag;
    var ownItemCount = bag[itemId] || 0;
    var reItemCount = ownItemCount - num;
    bag[itemId] = reItemCount;
    if (reItemCount <= 0) delete bag[itemId];

    if (c_prop.spItemIdKey.dScore == itemId) {
        gameRecordBiz.setCostDScoreRecord(uwClient, userData.id, num, function() {});
        taskBiz.setTaskValue(uwClient, userData.id, c_prop.cTaskTypeKey.costDScore, num, function() {});
        userBiz.nobleCost(uwClient, userData.id, num);
        activityBiz.recordTurntableValue(uwClient, userData.id, c_prop.turntableTypeKey.costDScore, num, null, function() {});
    } else if (itemId == 950) {
        taskBiz.setTaskValue(uwClient, userData.id, c_prop.cTaskTypeKey.useSYItem, num, function() {});
    }

    // 记录 BI 消耗
    if (itemCostType) {
        // var biObj = new biHlObj.counterItemObj(userData.accountId, userData.id, userData.lvl, itemId, num, t_item[itemId].name, "outflow", c_prop.itemCostType[itemCostType]);
        //biHlBiz.HlCounterBi(biObj, userData.serverIndexId, userData.id, null, userData.exData[c_prop.userExDataKey.loginIP], function(err, data) {});

        var channelId = userData.channelId;
        var sdkChannelId = userData.sdkChannelId;
        if (c_prop.spItemIdKey.dScore == itemId) {
            var oObj = new ossObj.ossCostCurrency(userData.id, userData.lvl, c_prop.currencyTypeKey.dScore, itemCostType, num, getItemId, getItemNum, para, channelId, sdkChannelId);
            ossBiz.WriteOss(oObj);
        } else {
            // if(t_item[itemId].color && t_item[itemId].color >= 4){
            //     var oItems = [];
            //     oItems.push(new ossObj.ossItemObj(itemId, t_item[itemId].name, num));
            //     var oObj = new ossObj.ossItem("outflow", itemCostType, userData.id, userData.nickName, userData.accountId, userData.lvl, oItems, channelId, sdkChannelId);
            //     ossBiz.WriteOss(oObj);
            // }
        }

    }

    return bag;
};

//获取某种类型的物品数量
exports.getNumOfItems = function(items, type) {
    var num = 0;
    if (!items) return num;
    for (var key in items) {
        var locId = key;
        var locItemData = t_item[locId];
        if (!locItemData) continue;
        var locNum = parseInt(items[key]);
        if (locItemData.type == type) {
            num += locNum;
        }
    }
    return num;
};


//增加钻石
var _addDiamond = function(user, diamond, consumeType) {
    checkBiRequire();
    checkRequire();
    if (diamond <= 0) return;
    user.diamond += diamond;
    //计算获得类型，只有充值才是购买的
    if (consumeType == c_prop.itemGetTypeKey.recharge) {
        user.buyDiamond += diamond;
    } else {
        user.giveDiamond += diamond;
    }

    gameRecordBiz.setDiamondRecord(uwClient, user.id, consumeType, diamond, function() {});

    var channelId = user.channelId;
    var sdkChannelId = user.sdkChannelId;
    var oObj = new ossObj.ossGetCurrency(user.id, user.lvl, c_prop.currencyTypeKey.diamond, consumeType, diamond, 0, "", 0, channelId, sdkChannelId);
    if (oObj.op) {
        ossBiz.WriteOss(oObj);
    }
};

/**
 * 获取今日消费钻石
 * 减去钻石 diamond giveDiamond buyDiamond
 * @param userData
 * @param diamond
 * @param consumeType
 * @param data
 */
var _reduceDiamond = function(userData, diamond) {
    checkRequire();
    if (diamond <= 0) return;

    userData.diamond -= diamond;
    if (userData.diamond <= 0) {
        userData.diamond = 0;
    }
    //计算消耗类型，优先消耗系统赠送的
    //var costBuyDiamond = 0;

    // var temp = userData.giveDiamond - diamond;
    // //如果系统足够
    // if (temp >= 0) {
    //     userData.giveDiamond = temp;
    // } else {
    //     //系统耗光了
    //     userData.giveDiamond = 0;

    //     //消耗购买的
    //     costBuyDiamond = temp * -1;
    //     userData.buyDiamond -= costBuyDiamond;
    // }

    var taskOpt = {};
    taskOpt[c_prop.cTaskTypeKey.consumeSum1] = diamond;
    taskOpt[c_prop.cTaskTypeKey.consumeSum2] = diamond;
    taskBiz.setTaskValues(uwClient, userData.id, taskOpt, function() {});
    //todo 先不记录，用gameRecord表记录
    /*
        //今日消耗
        exports.addDiamondTodayCost(userData, diamond);
    */

};

/**
 * 获取今日消费钻石
 * @param userData
 */
exports.getDiamondTodayCost = function(userData) {
    //今日消耗
    var todayCostData = userData.record[c_prop.userRecordTypeKey.diamondTodayCost] || {};
    var today = (new Date()).toFormat("YYYY-MM-DD");
    var todayCost = todayCostData[today] || 0;
    return todayCost;
};

/**
 * 增加今日消费钻石
 * @param userData
 * @param diamond
 */
exports.addDiamondTodayCost = function(userData, diamond) {
    var todayCostData = userData.record[c_prop.userRecordTypeKey.diamondTodayCost] || {};
    var today = (new Date()).toFormat("YYYY-MM-DD");
    var todayCost = todayCostData[today] || 0;
    todayCost += diamond;
    todayCostData[today] = todayCost;
    userData.record[c_prop.userRecordTypeKey.diamondTodayCost] = todayCostData;
};

/**
 * 按日期区间获取消费钻石
 * @param userData
 * @param startDate
 * @param endDate
 */
exports.getDiamondByDate = function(userData, startDate, endDate) {
    var allCost = 0;
    if (!startDate || !endDate) return allCost;
    var todayCostData = userData.record[c_prop.userRecordTypeKey.diamondTodayCost] || {};
    for (var i = 0; i < 1000; i++) {
        startDate.addDays(1);
        if (startDate.isAfter(endDate)) break;
        var locKey = startDate.toFormat("YYYY-MM-DD");
        var locCost = todayCostData[locKey] || 0;
        allCost += locCost;
    }
    return allCost;
};


//添加经验
exports.addUserExpc = function(user, expc) {
    checkRequire();
    expc = parseInt(expc);
    //先判断是否达到转生等级，是的话，积累为转生经验，否者，正常流程
    var oldLvl = user.lvl;
    // var rebirthLvl = user.rebirthLvl;
    // var nextRebirthLvl = 145;       // 转生限制等级
    // if(rebirthLvl == 0){
    //     nextRebirthLvl = t_rebirth[1].lvl;
    // }else{
    //     var nextRebirthLvlData = t_rebirth[rebirthLvl] || {}
    //     nextRebirthLvl = nextRebirthLvlData.limitLvl || 145;
    // }
    // if(oldLvl == nextRebirthLvl){
    //     exports.addRebirthExpc(user, expc); //容易溢出，需整改
    //     return;
    // }

    //是否开启注入经验
    // if (user.isOpenIn == 1) {
    //     var fourRoleExpc = 0;
    //     var needInfuseExpc = c_game.fourRole[2];
    //     if ((expc + user.infuseExpc) < needInfuseExpc) {
    //         fourRoleExpc = expc;
    //         expc = 0;
    //     } else {
    //         fourRoleExpc = (needInfuseExpc - user.infuseExpc);
    //         expc -= fourRoleExpc;
    //         user.isOpenIn == 0;
    //     }
    //     exports.addFourRoleExpc(user, fourRoleExpc, user.isOpenIn);
    // }

    var succLvUp = false;
    //限制最高等级
    var maxLvl = c_game.initCfg[0];
    if (oldLvl < maxLvl) {
        for (var i = oldLvl; i < maxLvl; i++) {
            var locLvlData = c_lvl[i];
            if (!locLvlData) break;
            var locNextNeed = locLvlData.reqExp - user.expc;
            if (expc < locNextNeed) {
                user.expc += expc;
                break;
            } else {
                expc -= locNextNeed;
                user.lvl++;
                user.expc = 0;
                succLvUp = true;
                if (c_lvl[user.lvl]) {
                    user.strength += c_lvl[user.lvl].power || 0;
                }
                //判断是否达到转生限制等级
                // if(user.lvl == nextRebirthLvl){
                //     exports.addRebirthExpc(user, expc);
                //     break;
                // }
            }
        }
    } else {
        //增加魔导等级
        var magicLvl = user.magicLvl || 0;
        user.expc += expc;
        // console.error('======magicLvl==expc=user.expc==t_magicLvl[magicLvl].reqExp',magicLvl,expc,user.expc, t_magicLvl[magicLvl].reqExp);
        while (t_magicLvl[magicLvl] && t_magicLvl[magicLvl].reqExp && user.expc >= t_magicLvl[magicLvl].reqExp) {
            // console.error('经验够升级魔导等级',user.expc, parseInt(t_magicLvl[magicLvl].reqExp));
            user.expc -= parseInt(t_magicLvl[magicLvl].reqExp);
            magicLvl++;
            // console.error('扣完经验后剩余经验，魔导等级',user.expc,magicLvl);
        }
        // console.error('cal add expc magicLvl',magicLvl);
        user.magicLvl = magicLvl;
    }


    // if(user.lvl>=nextRebirthLvl){
    //     user.lvl = nextRebirthLvl;
    //     user.expc = 0;
    // }

    if (succLvUp) {
        _userLevelUpBi(user);
        guildBiz.checkGuildGift(uwClient, user.id, 1, user.lvl, function() {});
    }

    g_data.setUserLvl(user.id, user.lvl);
    if (oldLvl != user.lvl) {
        taskBiz.setTaskValue(uwClient, user.id, c_prop.cTaskTypeKey.personLvl, user.lvl, function() {});
        userBiz.setMedalValue(uwClient, user.id, c_prop.medalLootTypeKey.personLvl, user.lvl, function() {});
        //紧急委托任务，用户等级
        taskBiz.setEntrustTaskValue(uwClient, user.id, c_prop.entrustTaskTypeKey.userLvl, user.lvl, function() {});
        //bonusBiz.inviteeLevelUp(uwClient, user.id, oldLvl, user.lvl, function(){});
        _setLvlAchievement(user);
    }
};

var _userLevelUpBi = function(userData) {
    checkBiRequire();
    var biObj = new biHlObj.milestoneObj(userData.accountId, "level_up", userData.lvl, "roleid=" + userData.id + ",exp=" + userData.combat);
    biHlBiz.HlMilestoneBi(biObj, userData.serverIndexId, userData.id, null, userData.exData[c_prop.userExDataKey.loginIP], function(err, data) {});

    // var oObj = new ossObj.ossLevelUp(userData.id,userData.lvl,userData.diamond,userData.gold,userData.honor);
    // ossBiz.WriteOss(oObj);
}

//第四角色注入经验
exports.addFourRoleExpc = function(userData, expc, isOpen) {
    userData.infuseExpc += expc;
    if (userData.infuseExpc < 0) userData.infuseExpc = 0;
    userData.isOpenIn = isOpen;
    var updateUserData = {
        isOpenIn: userData.isOpenIn,
        infuseExpc: userData.infuseExpc
    };
    userDao.update(uwClient, updateUserData, { id: userData.id }, function(err) {
        if (err) console.log(err);
    });
};

//添加转生经验
// exports.addRebirthExpc = function(userData, expc) {
//     userData.rebirthExp += expc; //容易溢出，需整改
//     var updateUserData = {
//         rebirthExp: userData.rebirthExp
//     };
//     userDao.update(uwClient, updateUserData, { id: userData.id }, function(err) { if (err) console.log(err); });
// };

//添加经验
/*
exports.addVipExpc = function(userData, expc){
    checkRequire();
    var oldVip = userData.vip;
    userData.vipScore+=expc;

    var curVip =  _getCurVip(userData.vipScore);
    //curVip -=1;
    userData.vip = curVip;

    //限制最高等级
    var maxLvl = c_game.initCfg[5];
    if(userData.vip>=maxLvl){
        userData.vip = maxLvl;
    }

    if(oldVip!=curVip){
        for(var i = oldVip+1;i<=curVip;i++){
            var locCurVip = i;
            //第一个%s：玩家名
            //第二个%s：VIP等级
            chatBiz.addSysData(21,[userData.nickName,locCurVip]);
            chatBiz.addSysData(22,[userData.nickName,locCurVip]);
            // VIP奖励（通过邮件）
            var chestsId = c_vip[locCurVip].itemId;
            var logicItems = itemBiz.calLogicItems(chestsId);        //宝箱随机的物品
            if(JSON.stringify(logicItems) != "{}") mailBiz.addByType(uwClient, userData.id, c_prop.mailTypeKey.vip, [locCurVip], logicItems, function(){});
        }
    }
};*/

//消耗货币 gold,diamond,honor
exports.costCurrency = function(userData, currencyType, costNum, costType, itemId, itemNum, para) {
    costNum = parseInt(costNum);
    if (isNaN(costNum) || costNum <= 0) {
        console.error('costCurrency ERROR', userData.id, currencyType, costNum, costType, itemId, itemNum, para);
        return;
    }
    switch (currencyType) {
        case c_prop.currencyTypeKey.gold:
            _reduceGold(userData, costNum);
            break;
        case c_prop.currencyTypeKey.diamond:
            _reduceDiamond(userData, costNum);
            break;
        case c_prop.currencyTypeKey.honor:
            userData.honor -= costNum;
            break;
        case c_prop.currencyTypeKey.prestige:
            userData.prestige -= costNum;
            break;
        case c_prop.currencyTypeKey.expedition:
            _delBag(userData, 79, costNum);
            break;
        case c_prop.currencyTypeKey.expeditionHigh:
            _delBag(userData, 80, costNum);
            break;
        case c_prop.currencyTypeKey.dScore: //积分
            _delBag(userData, c_prop.spItemIdKey.dScore, costNum, costType, itemId, itemNum, para);
            break;
    }
    _costRecord(userData, currencyType, costNum, costType, itemId, itemNum, para)
};

var _costRecord = function(userData, currencyType, costNum, costType, itemId, itemNum, para) {
    if (costNum <= 0) {
        return;
    }
    checkBiRequire();
    switch (currencyType) {
        case c_prop.currencyTypeKey.gold:
            gameRecordBiz.setCostGoldRecord(uwClient, userData.id, costType, costNum, function() {});
            break;
        case c_prop.currencyTypeKey.diamond:
            gameRecordBiz.setCostDiamondRecord(uwClient, userData.id, costType, costNum, function() {});
            break;
        default:
            return;
    }

    var channelId = userData.channelId;
    var sdkChannelId = userData.sdkChannelId;
    var oObj = new ossObj.ossCostCurrency(userData.id, userData.lvl, currencyType, costType, costNum, itemId, itemNum, para, channelId, sdkChannelId);
    ossBiz.WriteOss(oObj);
};

//增加货币 gold,diamond,honor
exports.addCurrency = function(userData, addType, addNum, addRecordType, data) {
    addNum = parseInt(addNum);
    if (isNaN(addNum) || addNum <= 0) return;
    switch (addType) {
        case c_prop.currencyTypeKey.gold:
            _addGold(userData, addNum);
            break;
        case c_prop.currencyTypeKey.diamond:
            _addDiamond(userData, addNum, addRecordType);
            break;
        case c_prop.currencyTypeKey.honor:
            userData.honor += addNum;
            break;
        case c_prop.currencyTypeKey.prestige:
            userData.prestige += addNum;
            break;
        case c_prop.currencyTypeKey.expedition:
            userData.bag[79] = userData.bag[79] || 0;
            userData.bag[79] += addNum;
            break;
        case c_prop.currencyTypeKey.expeditionHigh:
            userData.bag[80] = userData.bag[80] || 0;
            userData.bag[80] += addNum;
            break;
        case c_prop.currencyTypeKey.dScore: //积分
            userData.bag[1809] = userData.bag[1809] || 0;
            userData.bag[1809] += addNum;
            break;
    }
};

/**
 * 添加真气
 * @param userData
 * @param genuineQi
 */
exports.addGenuineQi = function(userData, genuineQi) {
    userData.genuineQi = Math.ceil(userData.genuineQi);
    genuineQi = Math.ceil(genuineQi);
    userData.genuineQi += genuineQi;

    //不能小于0
    userData.genuineQi = userData.genuineQi < 0 ? 0 : userData.genuineQi;
};

/**
 * 计算当前真气       【lvl,genuineQi,exData】
 * @param userData
 */
exports.calGenuineQi = function(userData, demonLotusData) {
    var offAddGenuineQi = 0;
    var genuLimit = 0;
    var nowTime = new Date();
    var genuineQi = userData.genuineQi < 0 ? 0 : Math.ceil(userData.genuineQi);
    if (!c_genuineQi[userData.lvl]) return [offAddGenuineQi, genuLimit];
    var produceFix = c_genuineQi[userData.lvl].recovery || 0; //基础速度
    if (userData.exData[c_prop.userExDataKey.talismanSkill] && userData.exData[c_prop.userExDataKey.talismanSkill][c_prop.talismanSkillTypeKey.genuineQi]) {
        var skillArr = userData.exData[c_prop.userExDataKey.talismanSkill][c_prop.talismanSkillTypeKey.genuineQi];
        for (var i = 0; i < skillArr.length; i++) {
            var skillId = skillArr[i];
            if (t_talismanSkill[skillId]) {
                produceFix += t_talismanSkill[skillId].effect[0][0];
            }
        }
    }

    if (!userData.exData[c_prop.userExDataKey.genuineQi]) userData.exData[c_prop.userExDataKey.genuineQi] = [];
    var exData = userData.exData[c_prop.userExDataKey.genuineQi];
    if (!exData[0]) userData.exData[c_prop.userExDataKey.genuineQi][0] = new Date();
    var lastTime = new Date(userData.exData[c_prop.userExDataKey.genuineQi][0]); //最后结算时间

    //距离上次结算的秒差
    var second = parseInt((nowTime.getTime() - lastTime.getTime()) / 1000);
    if (second > 0) {
        offAddGenuineQi = Math.ceil(second * produceFix) + genuineQi;
    } else {
        offAddGenuineQi = genuineQi;
    }
    var advanceLvl = 0;
    if (demonLotusData) {
        advanceLvl = demonLotusData.advanceLvl || 0;
    }
    var genqiAccLimit = parseInt(c_demonLotus[advanceLvl].genqiAccLimit);
    genuLimit = parseInt(c_genuineQi[userData.lvl].genuLimit) + genqiAccLimit; //真气上限
    if (offAddGenuineQi > genuLimit) {
        if (genuineQi < genuLimit) {
            offAddGenuineQi = genuLimit;
        } else {
            offAddGenuineQi = genuineQi;
        }
    }

    if (second >= 1) {
        userData.genuineQi = offAddGenuineQi;
        userData.genuineQi = Math.ceil(userData.genuineQi);
        userData.exData[c_prop.userExDataKey.genuineQi][0] = new Date();
    }

    return [offAddGenuineQi, genuLimit];
};

/**
 * 判读是否为月卡用户
 * @param userData
 */
exports.isMonthUser = function(userData) {
    userData.buff = userData.buff || {};
    if (!userData.buff[c_prop.otherBuffIdKey.month]) {
        return false;
    }

    if (Date.now() - userData.buff[c_prop.otherBuffIdKey.month][1] > 30 * 24 * 3600 * 1000) {
        delete userData.buff[c_prop.otherBuffIdKey.month];
        return false;
    }
    return true;
};


/**
 * 判读是否为周卡用户
 * @param userData
 */
exports.isWeekUser = function(userData) {
    userData.buff = userData.buff || {};
    if (!userData.buff[c_prop.otherBuffIdKey.week]) {
        return false;
    }

    if (Date.now() - userData.buff[c_prop.otherBuffIdKey.week][1] > 7 * 24 * 3600 * 1000) {
        delete userData.buff[c_prop.otherBuffIdKey.week];
        return false;
    }
    return true;
};

/**
 * 判读是否为基金用户
 * @param userData
 */
exports.isTMFundUser = function(userData) {
    if (userData.activity && userData.activity[1083]) {
        return true;
    }
    return false;
};

exports.getMonthCardRight = function(userData) {
    var self = this;
    if (this.isMonthUser(userData)) {
        return c_prop.vipRightTypeKey.month;
    }
    return c_prop.vipRightTypeKey.normal;
};

exports.getWeekCardRight = function(userData) {
    var self = this;
    if (this.isWeekUser(userData)) {
        return c_prop.vipRightTypeKey.week;
    }
    return c_prop.vipRightTypeKey.normal;
}

exports.addMonthCardBuff = function(userData) {
    userData.buff = userData.buff || {};
    var duration = 30 * 24 * 3600;
    _addBuff(userData.buff, c_prop.otherBuffIdKey.month, duration);
};

exports.addWeekCardBuff = function(userData) {
    userData.buff = userData.buff || {};
    var duration = 7 * 24 * 3600;
    _addBuff(userData.buff, c_prop.otherBuffIdKey.week, duration);
};

exports.addBuffImmediately = function(userData, otherBuffId) {
    userData.buff = userData.buff || {};
    _addBuff(userData.buff, otherBuffId, t_otherBuff[otherBuffId].conTime);
};

exports.isExistBuff = function(userData, buffId) {
    exports.fixUserBuff(userData);
    //console.log("use buff  :", userData.buff, buffId);
    if (userData.buff && userData.buff[buffId]) {
        return true;
    }
    return false;
};

exports.addBuffItem = function(userData, itemId, itemNum) {
    userData.buff = userData.buff || {};
    //console.log("use buff id :", t_itemLogic[itemId]);
    var buffId = t_itemLogic[itemId].create[0][0];
    var buffDuration = t_itemLogic[itemId].create[0][1] * itemNum;
    _addBuff(userData.buff, buffId, buffDuration);
};

var _addBuff = function(buff, buffId, duration) {
    var tmNow = (new Date()).getTime();
    // buff 格式 buffid:[buff开始时间, buff结束时间]
    if (buff[buffId]) { // 未结束，直接累加
        if (buff[buffId][1] > tmNow) {
            buff[buffId][1] = buff[buffId][1] + duration * 1000;
        } else {
            buff[buffId] = [tmNow, tmNow + 1000 * duration];
        }
    } else {
        buff[buffId] = [tmNow, tmNow + 1000 * duration];
    }
}

// 校验一些数据 如buff
exports.fixUserData = function(userData) {
    exports.fixUserBuff(userData);
    exports.fixAchieveSkill(userData);
};

exports.fixUserBuff = function(userData) {
    var tmNow = (new Date()).getTime();
    if (userData.buff) {
        for (var k in userData.buff) {
            var buf = userData.buff[k];
            if (buf[1] < tmNow) {
                delete userData.buff[k];
            }
        }
    }
}

exports.fixAchieveSkill = function(userData) {
    achieveBiz = achieveBiz || require("uw-achieve").achieveBiz;
    if (userData.achieveLvl < 22) return;
    var achieveCfg = t_achieve[userData.achieveLvl];
    var gameAchCfg = c_game.achieveCfg[0].split(",");
    for (var i = 2; i <= achieveCfg.achieveLvl; i++) {
        var skillId = parseInt(gameAchCfg[i - 2]);
        achieveBiz.addAchieveSkill(userData, skillId);
    }
};

/**
 * 添加honor
 * @param userData
 * @param honor
 */
exports.addHonor = function(userData, honor) {
    userData.honor += honor;
};

exports.getTeamBossNum = function(userData) {
    var maxNum = c_game.worldBossCfg[11] || 8;
    var reNumInterval = c_game.worldBossCfg[12] || 7200;
    if (!userData.exData[c_prop.userExDataKey.teamBossNum]) {
        userData.exData[c_prop.userExDataKey.teamBossNum] = [maxNum, new Date()];
        return userData.exData[c_prop.userExDataKey.teamBossNum];
    }

    var curLastTime = new Date();
    var lastReplayTime = new Date(userData.exData[c_prop.userExDataKey.teamBossNum][1]);
    var reNum = userData.exData[c_prop.userExDataKey.teamBossNum][0];
    var seconds = lastReplayTime.getSecondsBetween(curLastTime);
    if (seconds > reNumInterval) {
        var num = Math.floor(seconds / reNumInterval);
        reNum += num;
        if (reNum > maxNum) {
            lastReplayTime = curLastTime;
            reNum = maxNum;
        } else {
            lastReplayTime.addSeconds(reNumInterval * num);
        }
    }
    userData.exData[c_prop.userExDataKey.teamBossNum] = [reNum, lastReplayTime];
    return userData.exData[c_prop.userExDataKey.teamBossNum];
};

exports.costTeamBossNum = function(userData, num) {
    var reNum = exports.getTeamBossNum(userData);
    if (reNum[0] < 1) return;
    reNum[0] -= num;
    reNum[0] = reNum[0] < 0 ? 0 : reNum[0];
    userData.exData[c_prop.userExDataKey.teamBossNum] = reNum;
};

exports.getZhongLiBossNum = function(userData) {
    var maxNum = c_game.worldBossCfg[13] || 12;
    var reNumInterval = c_game.worldBossCfg[14] || 5400;
    if (!userData.exData[c_prop.userExDataKey.ZLBossNum]) {
        userData.exData[c_prop.userExDataKey.ZLBossNum] = [maxNum, new Date()];
        return userData.exData[c_prop.userExDataKey.ZLBossNum];
    }

    var curLastTime = new Date();
    var lastReplayTime = new Date(userData.exData[c_prop.userExDataKey.ZLBossNum][1]);
    var reNum = userData.exData[c_prop.userExDataKey.ZLBossNum][0];
    var seconds = lastReplayTime.getSecondsBetween(curLastTime);
    if (seconds > reNumInterval) {
        var num = Math.floor(seconds / reNumInterval);
        reNum += num;
        if (reNum > maxNum) {
            lastReplayTime = curLastTime;
            reNum = maxNum;
        } else {
            lastReplayTime.addSeconds(reNumInterval * num);
        }
    }
    userData.exData[c_prop.userExDataKey.ZLBossNum] = [reNum, lastReplayTime];
    return userData.exData[c_prop.userExDataKey.ZLBossNum];
}

exports.costZhongLiBossNum = function(userData) {
    var reNum = exports.getZhongLiBossNum(userData);
    if (reNum[0] < 1) return;
    reNum[0] -= 1;
    userData.exData[c_prop.userExDataKey.ZLBossNum] = reNum;
};

exports.getWBHurtAwardData = function(userData) {
    // wbHurtAward : 格式 {award:[1,1,1,1,1], hurt:伤害值, t: 时间}
    var lst = c_game.worldBossCfg[18].split(",");
    if (!userData.exData[c_prop.userExDataKey.wbHurtAward]) {
        var tmNow = new Date().getTime();
        var exHurtData = {};
        exHurtData.t = tmNow;
        exHurtData.hurt = 0;
        exHurtData.award = [];
        for (var i = 0; i < lst.length; i++) {
            exHurtData.award.push(0);
        }
        userData.exData[c_prop.userExDataKey.wbHurtAward] = exHurtData;
    } else {
        var t = userData.exData[c_prop.userExDataKey.wbHurtAward].t;
        if (!new Date().equalsDay(new Date(t))) { // 不是同一天，重置
            var tmNow = new Date().getTime();
            var exHurtData = {};
            exHurtData.t = tmNow;
            exHurtData.hurt = 0;
            exHurtData.award = [];
            for (var i = 0; i < lst.length; i++) {
                exHurtData.award.push(0);
            }
            userData.exData[c_prop.userExDataKey.wbHurtAward] = exHurtData;
        }
    }
    return userData.exData[c_prop.userExDataKey.wbHurtAward];
};

exports.getHJBossData = function(userData, groupType) {

    // HJBossData : 格式 {groupType: {tm: 时间戳, num: 已夺宝次数, cnum: 已夺宝箱数目}} 
    if (!userData.exData[c_prop.userExDataKey.HJBossData]) {
        userData.exData[c_prop.userExDataKey.HJBossData] = {};
        var tmNow = new Date().getTime();
        userData.exData[c_prop.userExDataKey.HJBossData][groupType] = {
            tm: tmNow,
            num: 0,
            cnum: 0
        };
    } else {
        if (!userData.exData[c_prop.userExDataKey.HJBossData][groupType]) {
            var tmNow = new Date().getTime();
            userData.exData[c_prop.userExDataKey.HJBossData][groupType] = {
                tm: tmNow,
                num: 0,
                cnum: 0
            };
        } else {
            var t = userData.exData[c_prop.userExDataKey.HJBossData][groupType].tm;
            if (!new Date().equalsDay(new Date(t))) { // 不是同一天，重置
                userData.exData[c_prop.userExDataKey.HJBossData][groupType] = {
                    tm: new Date().getTime(),
                    num: 0,
                    cnum: 0
                };
            }
        }
    }

    return userData.exData[c_prop.userExDataKey.HJBossData];
};

exports.getHJBossGroupData = function(userData, groupType) {
    var hjBossData = exports.getHJBossData(userData, groupType);
    return hjBossData[groupType];
};


exports.canOwnBoss = function(userData, groupType) {
    var maxNum = c_game.worldBossCfg[16] || 3;
    var hjBossGroupData = exports.getHJBossGroupData(userData, groupType);
    if (hjBossGroupData.num >= maxNum) {
        console.log("cannot owner boss");
        return false;
    }
    console.log("can owner boss");
    return true;
};

exports.canPickHJBossChest = function(userData, groupType) {
    var maxNum = c_game.worldBossCfg[15] || 3;
    var hjBossGroupData = exports.getHJBossGroupData(userData, groupType);
    if (hjBossGroupData.cnum >= maxNum) return false;
    return true;
};

exports.addHJBossOwnNum = function(userData, groupType) {
    var maxNum = c_game.worldBossCfg[16] || 3;
    var hjBossGroupData = exports.getHJBossGroupData(userData, groupType);
    if (hjBossGroupData.num >= maxNum) return;
    hjBossGroupData.num += 1;
    userData.exData[c_prop.userExDataKey.HJBossData][groupType] = hjBossGroupData;
    console.log("addHJBossOwnNum:", userData.exData[c_prop.userExDataKey.HJBossData][groupType]);
};

exports.addHJBossChestNum = function(userData, groupType) {
    var maxNum = c_game.worldBossCfg[15] || 3;
    var hjBossGroupData = exports.getHJBossGroupData(userData, groupType);
    if (hjBossGroupData.cnum >= maxNum) return;
    hjBossGroupData.cnum += 1;
    userData.exData[c_prop.userExDataKey.HJBossData][groupType] = hjBossGroupData;
    console.error("addHJBossChestNum:", userData.exData[c_prop.userExDataKey.HJBossData][groupType]);
};

exports.costPataPower = function(userData, costPower) {
    exports.synPataPower(userData);
    if (userData.strength < costPower) return;
    userData.strength -= costPower;
    let maxPower = c_game.power[1];
    if (userData.strength < maxPower && userData.strength + costPower >= maxPower) {
        userData.strengthReTime = new Date();
    }
};

exports.synPataPower = function(userData) {
    let maxPower = c_game.power[1];
    if (!userData.strengthReTime) {
        if (userData.strength === 0) {
            userData.strength = maxPower;
        }
        userData.strengthReTime = new Date();
        return;
    }
    if (maxPower <= userData.strength) return;
    let currentTime = new Date();
    let lastTime = new Date(userData.strengthReTime);
    let seconds = lastTime.getSecondsBetween(currentTime);
    let interval = c_game.power[2] * 60;
    let rePower = userData.strength;
    if (seconds > interval) {
        let num = Math.floor(seconds / interval);
        rePower += num;
        if (rePower > maxPower) {
            lastTime = currentTime;
            rePower = maxPower;
        } else {
            lastTime.addSeconds(interval * num);
        }
    }
    userData.strength = rePower;
    userData.strengthReTime = lastTime;
};

/**************************************************************************************************/

//上报等级数据
var _setLvlAchievement = function(userData) {
    accountDao.select(mainClient, { id: userData.accountId }, function(err, accountData) {
        if (err) return err;
        if (!accountData) return;
        /*var roleId = data[0];
         var serverId = data[1];
         var roleLvl = data[2];
         var open_id = data[3];*/
        var data = [];
        data[0] = userData.id;
        data[1] = project.serverId;
        data[2] = userData.lvl;
        data[3] = accountData.name;
        data[4] = userData.nickName;

        sdkBiz.setAchievement(accountData.channelId, data, function() {});
    })
};

// var _getCurVip = function(vipScore){
//     var tempVip = 0;
//     for(var i = 0;i<100;i++){
//         var locLvlData = c_vip[i];
//         if(!locLvlData) break;
//         var locNextData = c_vip[i+1];
//         if(!locNextData) break;
//         if(vipScore<locLvlData.score){
//             break;
//         }
//         tempVip++;
//     }
//     return tempVip;
// };

exports.checkHeroEntranceTask = function(gamePlayer, taskId, target) {
    if (!c_task[taskId] || c_task[taskId].targetValue > target) return;
    let userData = gamePlayer.userData;
    userData.exData[c_prop.userExDataKey.heroEntranceTask] = userData.exData[c_prop.userExDataKey.heroEntranceTask] || {};
    let exData = userData.exData[c_prop.userExDataKey.heroEntranceTask];
    if (exData[taskId] && exData[taskId] != 0) return;
    exData[taskId] = 1;
    gamePlayer.setUserDataDirty(g_cache.UDDirtyType.exData);
};

/**
 * 获取贵族等级
 */
exports.getNobleLevel = function(nobleData) {
    if (!nobleData) return 0;
    if (!nobleData[2]) return 0; //没激活贵族  则是0级
    if (!nobleData[0] && !nobleData[1]) return 0;
    let total = nobleData[1] + Math.floor(nobleData[0] / 500);
    let vips = c_game.vip[3].split(",") || [];
    let level = 0;
    for (let i = 0; i < vips.length; i++) {
        if (vips[i] > total) {
            break;
        }
        level = i + 1;
    }
    return level;
};

//从equipBag里过滤出客户端需要的 （目前只需要穿戴中的 天使恶魔装备） 效率不行 作废
exports.filterOutAngelDemonEquipBag = function(equipBag) {
    equipBag = equipBag || {};
    var clientNeedEquipBag = {};
    for (var key in equipBag) {
        var locEquip = equipBag[key];
        if (locEquip[3] == 1 && locEquip[0] && t_itemEquip[locEquip[0]] && t_itemEquip[locEquip[0]].type == c_prop.equipTypeKey.angelOrDemon) {
            clientNeedEquipBag[key] = locEquip;
        }
    }
    return clientNeedEquipBag;
};


//算出客户端需要的装备背包（天使恶魔装备等）
exports.getClientNeedEquipBag = function(userData, zsheroData) {
    var clientNeedEquipBag = {};
    if (!zsheroData || !zsheroData.equipData) return clientNeedEquipBag;
    var equipData = zsheroData.equipData;
    var angelDemonEquipId = equipData[c_prop.heroEquipIndex.angelOrDemon];

    var equipBag = userData.equipBag || {};
    if (equipBag[angelDemonEquipId]) {
        clientNeedEquipBag[angelDemonEquipId] = equipBag[angelDemonEquipId];
    }
    return clientNeedEquipBag;
};

// 获得符文等级和
exports.getRealmLvlSum = function(gamePlayer) {
    var realmLvl = 0;
    var heroList = gamePlayer.heroListData;
    for (var i = 0; i < heroList.length; i++) {
        realmLvl += heroList[i].realmLvl || 0;
    }
    return realmLvl;
};

// 获得宝石等级和
exports.getGemLvlSum = function(gamePlayer) {
    var totalGemSumLvl = 0;
    var heroList = gamePlayer.heroListData;
    for (var i = 0; i < heroList.length; i++) {
        totalGemSumLvl += heroList[i].gemSumLvl || 0;
    }
    return totalGemSumLvl;
};

// 获得守护精灵战力和
exports.getWingCombatSum = function(gamePlayer) {
    var totalWingCombat = 0;
    var heroList = gamePlayer.heroListData;
    for (var i = 0; i < heroList.length; i++) {
        totalWingCombat += heroList[i].wingCombat || 0;
    }
    return totalWingCombat;
};

// 获得神圣装备战力和
exports.getHolyCombatSum = function(gamePlayer) {
    var totalHolyCombat = 0;
    var heroList = gamePlayer.heroListData;
    for (var i = 0; i < heroList.length; i++) {
        totalHolyCombat += heroList[i].holyCombat || 0;
    }
    return totalHolyCombat;
};

// 获得伙伴皮肤战力和
exports.getPartnerCombatSum = function(gamePlayer) {
    var totalPartnerCombat = 0;
    var heroList = gamePlayer.heroListData;
    for (var i = 0; i < heroList.length; i++) {
        totalPartnerCombat += heroList[i].partnerCombat || 0;
    }
    return totalPartnerCombat;
};

// 获得宠物战力和
exports.getTalismanCombatSum = function(gamePlayer) {
    var talismanTotalCombat = 0;
    var heroList = gamePlayer.heroListData;
    for (var i = 0; i < heroList.length; i++) {
        talismanTotalCombat += heroList[i].talismanCombat || 0;
    }
    return talismanTotalCombat;
};

// 获得装备评分
exports.getEquipGrade = function(gamePlayer) {
    var equipSumGrade = 0;
    var userData = gamePlayer.userData;
    var equipBag = userData.equipBag || {};
    var heroList = gamePlayer.heroListData;
    for (var i = 0; i < heroList.length; i++) {
        var equipData = heroList[i].equipData;
        for (var key in equipData) {
            var locItemUid = equipData[key];
            if (!locItemUid) continue;
            //戒指存的是tempid
            if (key == c_prop.heroEquipIndexKey.paralysisRing ||
                key == c_prop.heroEquipIndexKey.reviveRing ||
                key == c_prop.heroEquipIndexKey.protectRing ||
                key == c_prop.heroEquipIndexKey.harmRing
            ) {
                // nothing
            } else {
                var locBagData = equipBag[locItemUid] || {};
                equipSumGrade += locBagData[2] || 0;
                //console.error("getEquipGrade:", heroList[i].id, key, locItemUid, locBagData[2], equipSumGrade);
            }
        }
    }
    return equipSumGrade;
};