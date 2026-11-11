/**
 * Created by Administrator on 2014/5/16.
 */
var uwData = require("uw-data");
var c_game = uwData.c_game;
var consts = uwData.consts;
var c_msgCode = uwData.c_msgCode;
var c_prop = uwData.c_prop;
var t_item = uwData.t_item;
var t_itemBreak = uwData.t_itemBreak;
var t_itemEquip = uwData.t_itemEquip;
var c_compound = uwData.c_compound;
var formula = require("uw-formula");
var async = require("async");
var getMsg = require("uw-utils").msgFunc(__filename);
var commonUtils = require("uw-utils").commonUtils;
var userUtils = require("uw-user").userUtils;
var propUtils = require("uw-utils").propUtils;
var userDao = require("uw-user").userDao;
var heroDao = require("uw-hero").heroDao;
var HeroEntity = require("uw-entity").HeroEntity;
var chatBiz = require("uw-chat").chatBiz;
var heroPropHelper = require('uw-hero').heroPropHelper;
var taskBiz = require("uw-task").taskBiz;
var ds = require("uw-ds").ds;
var g_cache = require("uw-global").g_cache;
var exports = module.exports;

/**
 * 装备熔炼
 * @param client
 * @param userId
 * @param equipArr  所要熔炼的装备id数组
 * @param choColor  质量
 * @param cb
 * @returns {*}
 */
exports.smelt = function (client, userId, equipArr, choColor, cb) {
    g_cache.getGamePlayer(client, userId, function (err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var gainArr = [];       //存放熔炼所得
        var bagItems = {};
        //var delBagItems = {};
        var equipBagItems = {};
        var delEquipBagArr = [];
        var equipBag = userData.equipBag;
        var basePro = c_game.smeltEquip[0];     //熔炼得到装备的概率
        var getDiamond = 0;
        for (var i = 0; i < equipArr.length; i++) {
            var item = {};
            if (!equipArr[i]) continue;
            if (!equipBag[equipArr[i]]) return cb(null, [{}, gainArr, bagItems, equipBagItems, delEquipBagArr]);
            var templateId = equipBag[equipArr[i]][0];      //装备模板id
            var color = t_item[templateId].color;       //装备颜色  1~6 白~红
            if (choColor && choColor != color) continue;
            if (equipBag[equipArr[i]][3]) continue;
            var s_lock = equipBag[equipArr[i]][6];
            if (_isLocked(s_lock, t_itemEquip[templateId])) continue;
            var level = t_item[templateId].level;       //装备等级
            var magicLvl = t_item[templateId].magicLvl || 0;    //装备魔导等级
            //魔导装备当做200级装备处理
            if (magicLvl > 0) {
                level = 200;
            }
            var randomNumber = _getRandomNumber(1, 10000);
            var itemsArr = [];
            if (t_itemEquip[templateId].job == 4) basePro = 0;
            if (t_itemEquip[templateId].isUp == 1 || t_itemEquip[templateId].isRare == 1 || templateId >= 900001 || t_itemEquip[templateId].isSuper == 1 || t_itemEquip[templateId].isSuper == 2) basePro = 0;
            if (randomNumber > basePro) {     //熔炼失败 得到强化石
                var levelPar = 0;       //装备等级参数
                var levelItemPar = 0;       //装备等级获得神之金属参数
                if (level == 1) {
                    levelPar = c_game.smeltGoldLvlCfg[0];
                    levelItemPar = c_game.smeltItemLvlCfg[0];
                } else {
                    var levelArr = level.toString().split("");
                    levelPar = c_game.smeltGoldLvlCfg[parseInt(level.toString().substring(0, level.toString().length - 1))] || c_game.smeltGoldLvlCfg[0];
                    levelItemPar = c_game.smeltItemLvlCfg[parseInt(level.toString().substring(0, level.toString().length - 1))] || c_game.smeltItemLvlCfg[0];
                }
                var currencyPar = 0;        //装备颜色金币参数
                var starStonePar = 0;       //装备颜色神之金属参数
                switch (color) {
                    case c_prop.equipColorKey.white:
                        currencyPar = c_game.smeltGoldCfg[0];
                        break;
                    case c_prop.equipColorKey.green:
                        currencyPar = c_game.smeltGoldCfg[1];
                        break;
                    case c_prop.equipColorKey.blue:
                        currencyPar = c_game.smeltGoldCfg[2];
                        break;
                    case c_prop.equipColorKey.purple:
                        currencyPar = c_game.smeltGoldCfg[3];
                        break;
                    case c_prop.equipColorKey.orange:
                        currencyPar = c_game.smeltGoldCfg[4];
                        starStonePar = c_game.smeltItemCfg[0];
                        // if (t_itemEquip[templateId].isSuper == 1){//S
                        //     currencyPar = c_game.smeltDiamondCfg[1];
                        // }else if(t_itemEquip[templateId].isSuper == 2){//R
                        //     currencyPar = c_game.smeltDiamondCfg[2];
                        // }else if(t_itemEquip[templateId].isRare == 1){
                        //     currencyPar = c_game.smeltDiamondCfg[3];
                        // }else{
                        //     currencyPar = c_game.smeltDiamondCfg[0];
                        // }
                        break;
                    case c_prop.equipColorKey.red:
                        if (t_itemEquip[templateId].isSuper == 1) {//S
                            currencyPar = c_game.smeltGoldCfg[6];
                            starStonePar = c_game.smeltItemCfg[2];
                        } else if (t_itemEquip[templateId].isSuper == 2) {//R
                            currencyPar = c_game.smeltGoldCfg[5];
                            starStonePar = c_game.smeltItemCfg[1];
                        }
                        // currencyPar = c_game.smeltDiamondCfg[4];
                        break;
                }
                // console.log("currencyPar",currencyPar,"levelPar",levelPar,"starStonePar",starStonePar);
                if (color <= 4) {        //白绿蓝紫装
                    item[c_prop.spItemIdKey.gold] = formula.calSmeltGetCurrency(currencyPar, levelPar);
                    var num = _getSmeltIntensify(color, level);
                    //gainArr.push(["强化石",num,c_prop.equipColorKey.white]);
                    item[c_prop.spItemIdKey.intensify] = num;
                } else {      //橙红装
                    //改成获得神之金属
                    item[c_prop.spItemIdKey.starStone] = formula.calSmeltGetItem(starStonePar, levelItemPar);
                    item[c_prop.spItemIdKey.gold] = formula.calSmeltGetCurrency(currencyPar, levelPar);
                    // if(level >= 30){
                    //     item[c_prop.spItemIdKey.diamond] = formula.calSmeltGetCurrency(currencyPar,levelPar);
                    //     getDiamond += item[c_prop.spItemIdKey.diamond];
                    // }else{
                    //     if(level == 1) item[c_prop.spItemIdKey.gold] = c_game.lowOraEquipCfg[0];
                    //     if(level == 10) item[c_prop.spItemIdKey.gold] = c_game.lowOraEquipCfg[1];
                    //     if(level == 20) item[c_prop.spItemIdKey.gold] = c_game.lowOraEquipCfg[2];
                    // }
                }
                itemsArr = userUtils.saveItems(userData, item, c_prop.itemGetTypeKey.smelt);
            } else {      //装备
                var smeltArr = templateId.toString().split("");
                smeltArr[1] = "0";
                var smeltId = parseInt(smeltArr.join(""));
                var newId = 0;
                if (color >= c_prop.equipColorKey.orange) {       //橙色以上装备
                    newId = formula.calSmeltId(smeltId);
                } else {
                    var smeltColorPro = _getSmeltColorPro(color);       //熔炼装备颜色升级概率
                    randomNumber = _getRandomNumber(1, 10000);
                    if (randomNumber <= smeltColorPro) {      //装备品阶升级
                        newId = formula.calSmeltUpId(smeltId);
                    } else {      //装备品阶不变
                        newId = formula.calSmeltId(smeltId);
                    }
                }
                gainArr.push(newId);            //([t_item[newId].name,1,color]);
                //推送系统消息(oldma)
                //第一个%s：玩家名
                //第二个%s：装备颜色
                //第三个%s：装备名字
                chatBiz.addSysData(3, [userData.nickName, color, t_item[newId].name]);
                chatBiz.addSysData(4, [userData.nickName, color, t_item[newId].name]);

                item[newId] = 1;
                itemsArr = userUtils.saveItems(userData, item, c_prop.itemGetTypeKey.smelt);
            }

            if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
            if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);
            //删除熔炼装备
            delEquipBagArr.push(equipArr[i]);
            //delete equipBag[equipArr[i]];
            userUtils.delEquip(userData, equipArr[i], c_prop.itemCostTypeKey.smelt);
            //记录熔炼次数（委托任务）
            taskBiz.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.smeltEquip, 1, function() {});
        }
        //更新
        var updateData = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            prestige: userData.prestige
        };
        gamePlayer.setUserDataDirty();
        return cb(null, [updateData, gainArr, bagItems, equipBagItems, delEquipBagArr, getDiamond]);
    });
};

/**
 * 装备合成
 * @param client
 * @param userId
 * @param compoundId  所要合成物品的Id
 * @param cb
 * @returns {*}
 */
exports.compound = function (client, userId, compoundId, compoundNum, cb) {
    //userDao.select(client,{id:userId},function(err,userData){
    g_cache.getGamePlayer(client, userId, function (err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        userData.bag = userData.bag || {};
        var bag = userData.bag || {};
        //var gold = userData.gold;
        var bagItems = {};
        var compoundNeedObj = {};       //合成所需物品
        //var compoundNeedGold = c_compound[compoundId].reqJinbi;;       //合成所需金币
        var reqItems1 = c_compound[compoundId].reqItems1;
        if (reqItems1 != 0) compoundNeedObj[reqItems1] = c_compound[compoundId].reqCount1 * compoundNum;
        var reqItems2 = c_compound[compoundId].reqItems2;
        if (reqItems2 != 0) compoundNeedObj[reqItems2] = c_compound[compoundId].reqCount2 * compoundNum;
        var reqItems3 = c_compound[compoundId].reqItems3;
        if (reqItems3 != 0) compoundNeedObj[reqItems3] = c_compound[compoundId].reqCount3 * compoundNum;
        var reqItems4 = c_compound[compoundId].reqItems4;
        if (reqItems4 != 0) compoundNeedObj[reqItems4] = c_compound[compoundId].reqCount4 * compoundNum;

        //if(gold < compoundNeedGold) return cb(getMsg(c_msgCode.noGolds));//金币不足
        //判断合成材料
        for (var key in compoundNeedObj) {
            var ownCount = bag[key] || 0;        //拥有所需合成材料的数量
            if (!ownCount || ownCount < compoundNeedObj[key]) return cb(getMsg(c_msgCode.materialUnenough));//材料不足
        }
        //扣除材料
        for (var key in compoundNeedObj) {
            userUtils.delBag(userData, key, compoundNeedObj[key], c_prop.itemCostTypeKey.compound);
        }
        //获取合成物品
        var items = {};
        items[compoundId] = compoundNum;
        userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.compound);
        //userUtils.addBag(bag, compoundId,1);
        bagItems[compoundId] = compoundNum;
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        return cb(null, [bagItems, compoundNeedObj]);
    });
}

/**
 * 装备特戒
 * @param client
 * @param userId
 * @param tempId    英雄id
 * @param breakId  所要突破物品的Id
 * @param cb
 * @returns {*}
 */
exports.wearParRing = function (client, userId, tempId, breakId, cb) {
    //if(tempId == c_prop.heroJobKey.ys) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    var index = t_itemBreak[breakId].position;
    async.parallel([
        function (cb1) {
            //userDao.select(client,{id:userId},cb1);
            g_cache.getGamePlayer(client, userId, cb1);
            // },
            // function(cb1){
            //     heroDao.select(client,{userId:userId,tempId:tempId},cb1);
        }
    ], function (err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData;//, heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        var delBagItems = {};
        var bag = userData.bag;
        if (!bag[breakId] || bag[breakId] == 0) return cb(getMsg(c_msgCode.noRime));//还未拥有该结晶
        //装备
        heroData.equipData[index] = breakId;
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);
        //删除背包特戒 
        delBagItems[breakId] = 1;
        userUtils.delBag(userData, breakId, 1, c_prop.itemCostTypeKey.ring);

        _addSmeltTask(client, userId, breakId, function (err, data) {
        });

        //更新
        // var upUserData = {
        //     bag:userData.bag
        // };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        var upHeroData = {
            propArr: heroData.propArr,
            combat: heroData.combat,
            equipData: heroData.equipData
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        // async.parallel([
        //     // function(cb2){
        //     //     userDao.update(client,upUserData,{id:userId},cb2);
        //     // },
        //     function(cb2){
        //         heroDao.update(client,upHeroData,{id:heroData.id},cb2);
        //     }
        // ],function(err,upData) {
        //     if (err) return cb(err);
        cb(null, [upHeroData, delBagItems]);
        //});
    });
}

/**
 * 特戒突破
 * @param client
 * @param userId
 * @param tempId    英雄id
 * @param breakId  所要突破特戒的Id
 * @param cb
 * @returns {*}
 */
exports.ringBreak = function (client, userId, tempId, breakId, cb) {
    //if(tempId == c_prop.heroJobKey.ys) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    var index = t_itemBreak[breakId].position;
    async.parallel([
        function (cb1) {
            //userDao.select(client,{id:userId},cb1);
            g_cache.getGamePlayer(client, userId, cb1);
            // },
            // function(cb1){
            //     heroDao.select(client,{userId:userId,tempId:tempId},cb1);
        }
    ], function (err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData;//, heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        var bag = userData.bag;
        var delBagItems = {};
        var equipData = heroData.equipData;
        if (!equipData[index] || equipData[index] != breakId) return cb(getMsg(c_msgCode.noRimeToUse));//还未拥有用于突破的结晶
        if (!c_compound[breakId + 1]) return cb(getMsg(c_msgCode.rimeMax));//结晶已经突破到最高
        var needLvl = c_compound[breakId + 1].needLvl;
        if (userData.lvl < needLvl) return cb(getMsg(c_msgCode.NoLvlOpen));//等级不足
        var reqItems1 = c_compound[breakId + 1].reqItems1;
        var reqCount1 = c_compound[breakId + 1].reqCount1;
        delBagItems[reqItems1] = reqCount1;
        var count = bag[reqItems1] || 0;
        if (count < reqCount1) return cb(getMsg(c_msgCode.materialUnenough));//材料不足
        //扣除材料和原戒指
        userUtils.delBag(userData, reqItems1, reqCount1, c_prop.itemCostTypeKey.ring);
        delete heroData.equipData[index];
        //添加突破戒指
        heroData.equipData[index] = breakId + 1;
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        _addSmeltTask(client, userId, breakId + 1, function (err, data) {
        });

        //更新
        // var upUserData = {
        //     bag:userData.bag
        // };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        var upHeroData = {
            propArr: heroData.propArr,
            combat: heroData.combat,
            equipData: heroData.equipData
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        // async.parallel([
        //     // function(cb2){
        //     //     userDao.update(client,upUserData,{id:userId},cb2);
        //     // },
        //     function(cb2){
        //         heroDao.update(client,upHeroData,{id:heroData.id},cb2);
        //     }
        // ],function(err,upData) {
        //     if (err) return cb(err);
        cb(null, [upHeroData, delBagItems]);
        // });
    });
}

/******************************************************************************/

//输出指定范围内的随机数的随机整数
var _getRandomNumber = function (start, end) {
    var choice = end - start + 1;
    return Math.floor(Math.random() * choice + start);
};

var _addSmeltTask = function (client, userId, breakId, cb) {

    var breakLv = t_itemBreak[breakId].level || 20;
    var cTaskType = 0;
    if (t_itemBreak[breakId].position == 4) {
        cTaskType = c_prop.cTaskTypeKey.paralysisUp;
    } else if (t_itemBreak[breakId].position == 5) {
        cTaskType = c_prop.cTaskTypeKey.reviveUp;
    } else if (t_itemBreak[breakId].position == 6) {
        cTaskType = c_prop.cTaskTypeKey.protectUp;
    } else if (t_itemBreak[breakId].position == 7) {
        cTaskType = c_prop.cTaskTypeKey.harmUp;
    }
    if (cTaskType > 0)
        taskBiz.setTaskValue(client, userId, cTaskType, breakLv, cb);
};

//熔炼获得强化石
var _getSmeltIntensify = function (color, lvl) {
    var smeltNeed = 0;
    switch (color) {
        case c_prop.equipColorKey.white:        //白
            smeltNeed = c_game.smeltIntensify[0];
            break;
        case c_prop.equipColorKey.green:        //绿
            smeltNeed = c_game.smeltIntensify[1];
            break;
        case c_prop.equipColorKey.blue:         //蓝
            smeltNeed = c_game.smeltIntensify[2];
            break;
        case c_prop.equipColorKey.purple:       //紫
            smeltNeed = c_game.smeltIntensify[3];
            break;
        case c_prop.equipColorKey.orange:       //橙
            smeltNeed = c_game.smeltIntensify[4];
            break;
        case c_prop.equipColorKey.red:      //红
            break;
    }
    return formula.calSmeltIntensify(smeltNeed, lvl);    //熔炼参数  装备等级
};

//熔炼装备颜色升级概率
var _getSmeltColorPro = function (color) {
    var smeltColorPro = 0;
    switch (color) {
        case c_prop.equipColorKey.white:        //白
            smeltColorPro = c_game.smeltEquip[1];
            break;
        case c_prop.equipColorKey.green:        //绿
            smeltColorPro = c_game.smeltEquip[2];
            break;
        case c_prop.equipColorKey.blue:         //蓝
            smeltColorPro = c_game.smeltEquip[3];
            break;
        case c_prop.equipColorKey.purple:       //紫
            smeltColorPro = c_game.smeltEquip[4];
            break;
    }
    return smeltColorPro;
};

var _isLocked = function (s_lock, itemInfo) {
    var islock = 0;
    if (s_lock == undefined) {
        //server端未记录到是否已锁定.根据配表决定
        if (itemInfo && itemInfo.isLocked) {
            islock = itemInfo.isLocked;
        }
    } else {
        islock = s_lock;
    }
    return islock;
}

