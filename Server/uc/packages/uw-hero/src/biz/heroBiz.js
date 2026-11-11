/**
 * Created by Administrator on 2014/5/16.
 */
var uwData = require("uw-data");
var c_game = uwData.c_game;
var consts = uwData.consts;
var c_msgCode = uwData.c_msgCode;
var formula = require("uw-formula");
var c_prop = uwData.c_prop;
var c_open = uwData.c_open;
var t_hero = uwData.t_hero;
var t_skill = uwData.t_skill;
var c_realm = uwData.c_realm;
var t_heroTask = uwData.t_heroTask;
var t_heroTaskTypeHelp = uwData.t_heroTaskTypeHelp;
var t_heroTaskFrstHelp = uwData.t_heroTaskFrstHelp;
var t_holyResonance = uwData.t_holyResonance;
var c_prop = uwData.c_prop;
var c_compound = uwData.c_compound;
var t_item = uwData.t_item;
var t_wing = uwData.t_wing;
var t_wingStrength = uwData.t_wingStrength;
var t_strengthRefine = uwData.t_strengthRefine;
var t_robot = uwData.t_robot;
var t_itemEquip = uwData.t_itemEquip;
var c_lvl = uwData.c_lvl;
var t_holyStrength = uwData.t_holyStrength;
var t_magicLvl = uwData.t_magicLvl;
var t_magicBook = uwData.t_magicBook;
var t_itemEquipEnchant = uwData.t_itemEquipEnchant;
var g_cache = require("uw-global").g_cache;
//var c_vip = uwData.c_vip;
var c_gem = uwData.c_gem;
var async = require("async");
var getMsg = require("uw-utils").msgFunc(__filename);
var chatBiz = require("uw-chat").chatBiz;
var heroDao = require("../dao/heroDao");
var heroPropHelper = require("./heroPropHelper");
var HeroEntity = require("uw-entity").HeroEntity;
var logger = require('uw-log').getLogger("uw-route", __filename);
// var biBiz = require('uw-log').biBiz;
// var RealmObj = require('uw-log').RealmObj;
//var WingObj = require('uw-log').WingObj;
//var genuineQiObj = require('uw-log').genuineQiObj;
var biHlBiz = require("uw-log").biHlBiz;
var biHlObj = require("uw-log").biHlObj;
var arenaBiz = require("uw-arena").arenaBiz;
var propUtils = null;

var ds = require("uw-ds").ds;

var exports = module.exports;

var taskBiz = null;
var userUtils;
var userBiz;
var userDao;
var demonLotusDao;
var copyProgressDao;
var checkRequire = function() {
    userUtils = require("uw-user").userUtils;
    userBiz = userBiz || require("uw-user").userBiz;
    userDao = require("uw-user").userDao;
    copyProgressDao = copyProgressDao || require('uw-copy').copyProgressDao;
    chatBiz = chatBiz || require("uw-chat").chatBiz;
    demonLotusDao = demonLotusDao || require("uw-demon-lotus").demonLotusDao;
    propUtils = propUtils || require('uw-utils').propUtils;
    taskBiz = taskBiz || require("uw-task").taskBiz;
};
Number.tempId2Job = function(tempId) {
    return tempId.toString()[0] * 1;
};

/**
 * 装备附魔
 * @param client
 * @param userId
 * @param heroId  英雄ID
 * @param index  对应装备下标
 * @param cb
 * @returns {*}
 */
exports.enchant = function(client, userId, heroId, index, isAvertDrop, cb) {
    checkRequire();
    var canEnchantTypes = {};
    canEnchantTypes[c_prop.heroEquipIndexKey.weapon] = 'weapon';
    canEnchantTypes[c_prop.heroEquipIndexKey.clothes] = 'clothes';
    canEnchantTypes[c_prop.heroEquipIndexKey.bracelet1] = 'bracelet1';
    canEnchantTypes[c_prop.heroEquipIndexKey.ring1] = 'ring1';
    canEnchantTypes[c_prop.heroEquipIndexKey.ring2] = 'ring2';
    canEnchantTypes[c_prop.heroEquipIndexKey.bracelet2] = 'bracelet2';
    canEnchantTypes[c_prop.heroEquipIndexKey.helmet] = 'helmet';
    canEnchantTypes[c_prop.heroEquipIndexKey.necklace] = 'necklace';
    if(!canEnchantTypes[index]) return cb(getMsg(c_msgCode.equipError)); //装备有误

    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData;
        var heroData = gamePlayer.getHero(heroId);
        var bag = userData.bag || {};
        var equipData = heroData.equipData || {};
        var equipId = equipData[index];
        if(!equipId) return cb(getMsg(c_msgCode.noEquipNow)); //请先穿戴装备！
        var equipInfo = userData.equipBag[equipId];
        var equipTempId = equipInfo[0];
        var equipLvl = t_item[equipTempId].level;
        var equipMagicLvl = t_item[equipTempId].magicLvl || 0;//装备魔导等级

        var enchantArr = heroData.enchantArr || [];
        var enchantLvl = enchantArr[index] || 0;//该位置 附魔等级
        var nextEnchantLvl = parseInt(enchantLvl) + 1;
        var nextEnchantCfg = t_itemEquipEnchant[nextEnchantLvl];
        if(!nextEnchantCfg) return cb(getMsg(c_msgCode.lvlMaxed)); //等级已达上限

        var enchantCfg = t_itemEquipEnchant[enchantLvl];
        if(!enchantCfg) return cb(getMsg(c_msgCode.configError)); //配置错误
        var equipLvlLimit = enchantCfg.equipLvlLimit || 0;
        if(equipMagicLvl == 0 && equipLvl < equipLvlLimit) return cb(getMsg(c_msgCode.eqLvlUnenoughEnchant)); //该装备等级不足，无法附魔！

        var needGold = enchantCfg.needGold;
        var needItem = enchantCfg.needItem;
        if(userData.gold < needGold) return cb(getMsg(c_msgCode.noGolds));//金币不足
        var haveMoHun = bag[c_prop.spItemIdKey.devilSoulDust] || 0;
        if(bag[c_prop.spItemIdKey.devilSoulDust] < needItem) return cb(getMsg(c_msgCode.materialUnenough));//材料不足
        var delBagItems = {};
        delBagItems[c_prop.spItemIdKey.devilSoulDust] = needItem;

        var randomNum = _getRandomNumber(1, 10000);
        var isSuccess = false;
        var realEnchantLvl = enchantCfg.failLvl;
        if (randomNum <= enchantCfg.successRate) { //获得
            isSuccess = true;
            realEnchantLvl = nextEnchantLvl;
        }
        //防降级
        if(isAvertDrop){
            if(enchantCfg.avertDrop > 0){
                if(bag[c_prop.spItemIdKey.magicEssence] < enchantCfg.avertDrop) return cb(getMsg(c_msgCode.magicEssenceUnenough));//魔力精华不足
                delBagItems[c_prop.spItemIdKey.magicEssence] = enchantCfg.avertDrop;
            }
            if(!isSuccess) realEnchantLvl = enchantLvl;//失败不掉级
        }
        
        //扣除金币、魔魂之尘 魔力精华
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.gold, needGold, c_prop.goldCostTypeKey.equipEnchant);
        
        
        for(var key in delBagItems){
            userUtils.delBag(userData, key, delBagItems[key], c_prop.itemCostTypeKey.equipEnchant);
        }
        enchantArr[index] = realEnchantLvl;
        heroData.enchantArr = enchantArr;

        // //推送系统消息(oldma)
        // //第一个%s：玩家名
        // //第二个%s：装备颜色
        // //第三个%s：装备名字
        // //第四个%s：装备强化等级
        // var locItemUid = heroData.equipData[index];
        // var locBagData = userData.equipBag[locItemUid] || {};
        // //物品基础属性
        // var locHeroItemId = locBagData[0];
        // var color = t_item[locHeroItemId].color; //装备颜色  1~6 白~红
        // chatBiz.addSysData(5, [userData.nickName, color, t_item[locHeroItemId].name, strengthLvl + 1]);
        // chatBiz.addSysData(29, [userData.nickName, color, t_item[locHeroItemId].name, strengthLvl + 1]);

        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        //更新
        var upUserData = {
            gold: userData.gold
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        var upHeroData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            enchantArr: heroData.enchantArr
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        cb(null, [upUserData, upHeroData, delBagItems]);
    });
}

/**
 * 激活深渊共鸣
 * @param client
 * @param userId
 * @param heroId
 * @param cb
 * @returns {*}
 */
exports.actHolyResonance = function(client, userId, heroId, cb) {
    //var addHolyRes = require("./heroPropHelper").addHolyRes;
    async.parallel([
        function(cb1) {
            //userDao.select(client, { id: userId }, cb1);
            g_cache.getGamePlayer(client, userId, cb1);
            // },
            // function(cb1) {
            //     heroDao.select(client, { tempId: tempId, userId: userId }, cb1)
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData; //heroData = data[1];
        var heroData = gamePlayer.getHero(heroId);
        var equipData = heroData.equipData || {};
        var holyEquipArr = [];
        var equipBag = userData.equipBag || {};
        if (equipData[c_prop.heroEquipIndexKey.sword]) holyEquipArr.push(equipData[c_prop.heroEquipIndexKey.sword]);
        if (equipData[c_prop.heroEquipIndexKey.shield]) holyEquipArr.push(equipData[c_prop.heroEquipIndexKey.shield]);
        if (equipData[c_prop.heroEquipIndexKey.cape]) holyEquipArr.push(equipData[c_prop.heroEquipIndexKey.cape]);
        if (equipData[c_prop.heroEquipIndexKey.tshirt]) holyEquipArr.push(equipData[c_prop.heroEquipIndexKey.tshirt]);
        if (equipData[c_prop.heroEquipIndexKey.shoe]) holyEquipArr.push(equipData[c_prop.heroEquipIndexKey.shoe]);
        if (equipData[c_prop.heroEquipIndexKey.belt]) holyEquipArr.push(equipData[c_prop.heroEquipIndexKey.belt]);
        var holyEquipLvList = [];
        holyEquipArr.forEach(function(equipId) {
            if (equipBag[equipId] && equipBag[equipId][0] && t_item[equipBag[equipId][0]]) {
                var lvl = t_item[equipBag[equipId][0]].itemLvl;
                lvl = parseInt(lvl);
                holyEquipLvList.push(lvl);
            }
        });
        //console.error("holyEquipLvList:",holyEquipLvList);

        var equipnum = holyEquipLvList.length; //获取装备数量
        var compare = function(x, y) {
            if (x < y) {
                return 1;
            } else if (x > y) {
                return -1;
            } else {
                return 0;
            }
        }
        holyEquipLvList.sort(compare); //装备等级降序排列
        var holyRes = heroData.holyRes || {};
        // var resonance = { "res2": 0, "res4": 0, "res6": 0 }; //存放最后的共鸣
        if (equipnum >= 2) {
            // resonance["res2"] = holyEquipLvList[1]; //2件共鸣等级
            holyRes["2"] = holyEquipLvList[1]; //2件共鸣等级
            if (equipnum >= 4) {
                holyRes["4"] = holyEquipLvList[3]; //4件共鸣等级
                if (equipnum >= 6) {
                    holyRes["6"] = holyEquipLvList[5]; //6件共鸣等级
                }
            }
        }
        heroData.holyRes = holyRes;
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        //console.error(heroData.propArr);
        //console.error(heroData.combat);
        // var holyres = heroData.holyRes || {};
        //holyres = {"2":0,"4":0,"6":0};
        // holyres["2"] = holyres["2"] || 0;
        // holyres["4"] = holyres["4"] || 0;
        // holyres["6"] = holyres["6"] || 0;

        // if (holyres["2"] == 0 || holyres["2"] < resonance["res2"]) { //未激活或之前的等级小于现在的
        //     //激活共鸣
        //     _actHolyRes(userData, heroData, 2, holyres["2"], resonance["res2"]);
        //     holyres["2"] = resonance["res2"];
        // }
        // if (holyres["4"] == 0 || holyres["4"] < resonance["res4"]) {
        //     _actHolyRes(userData, heroData, 4, holyres["4"], resonance["res4"]);
        //     holyres["4"] = resonance["res4"];
        // }
        // if (holyres["6"] == 0 || holyres["6"] < resonance["res6"]) {
        //     _actHolyRes(userData, heroData, 6, holyres["6"], resonance["res6"]);
        //     holyres["6"] = resonance["res6"];
        // }
        //console.error(holyres);

        gamePlayer.setHeroDataDirty(heroId);

        var upHeroData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            holyRes: heroData.holyRes
        }
        cb(null, upHeroData);
    });
    //检查是否覆盖或已激活
    /*g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        var userData = gamePlayer.userData;
        var heroData = gamePlayer.getHero(heroId);
        var holyres = heroData.holyRes;
        console.log(holyres);
        if (holyres["2"] == 0 || holyres["2"] < resonance["res2"]) { //未激活或之前的等级小于现在的
            //激活共鸣
            actHolyRes(userData, heroData, 2, holyres["2"], resonance["res2"]);
            holyres["2"] = resonance["res2"];
        }
        if (holyres["4"] == 0 || holyres["4"] < resonance["res4"]) {
            actHolyRes(userData, heroData, 4, holyres["4"], resonance["res4"]);
            holyres["4"] = resonance["res4"];
        }
        if (holyres["6"] == 0 || holyres["6"] < resonance["res6"]) {
            actHolyRes(userData, heroData, 6, holyres["6"], resonance["res6"]);
            holyres["6"] = resonance["res6"];
        }
        console.log(holyres);
        heroData.holyRes = holyres;
        gamePlayer.setHeroDataDirty(heroId);

        var upHeroData = {
            holyRes: holyres
        }

        cb(null, upHeroData);

    })*/



}

/**
 * 更新英雄模板id
 * @param client
 * @param userId
 * @param tempIds
 * @param cb
 * @returns {*}
 */
exports.updateHeroTmpId = function(client, userId, heroId, tempId, cb) {
    // tempIds = tempIds || [];
    // if (tempIds.length <= 0) return cb(null, []);
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {

        var heroData = gamePlayer.getHero(heroId);
        heroData.tempId = tempId;

        gamePlayer.setHeroDataDirty(heroId);

        var upHeroData = {
            id : heroData.id,
            tempId: tempId
        };
        logger.debug("updateHeroTmpId_0: heroId:%d, tempId:%d", heroId, tempId);
        // heroDao.update(client, upHeroData, { id: heroId }, function(err, data) {
        //logger.debug("updateHeroTmpId_1: err:%s, data:%s", err, data);
        cb(null, upHeroData);
        //});   
    })

    // heroDao.list(client, " userId = ? and tempId in (?)", [tempIds], cb);
    // heroDao.select(client,{tempId: tempIds[0], userId: userId},function(err,heroData){
    //     if(err) return cb(err);
    //     var upHeroData={};
    //     heroDao.update(client, upHeroData, {id: heroData.id}, cb);
    //     cb(null,updataData);
    // });

};
/**
 * 根据tempId组获取英雄数据
 * @param client
 * @param userId
 * @param tempIds
 * @param cb
 * @returns {*}
 */
// exports.getListByTempIds = function(client, userId, tempIds, cb) {
//     tempIds = tempIds || [];
//     if (tempIds.length <= 0) return cb(null, []);
//     heroDao.list(client, " userId = ? and tempId in (?)", [userId, tempIds], cb);
// };


/**
 * 技能升级
 * @param client
 * @param userId
 * @param tempId
 * @param index
 * @param cb
 * @returns {*}
 */
exports.upSkill = function(client, userId, tempId, index, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){ 
        if (err) return cb(err); 
        var userData = gamePlayer.userData; //heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        if (!heroData.skillLvlArr) heroData.skillLvlArr = [];

        var skillLvl = heroData.skillLvlArr[index] || 1; //当前技能等级
        var needLvlArr = c_game.skillRate[4].split(","); //开启技能需要等级

        var skillNeedLvl = (index == 5 ? 0 : needLvlArr[index]);
        //var cdLimit = c_game.skillRate[5];      //CD上限
        var needGold = c_lvl[skillLvl].skillNeedGold;
        if (userData.lvl < skillNeedLvl) return cb(getMsg(c_msgCode.NoLvlOpen)); //等级不足
        if (skillLvl < 200 && skillLvl >= userData.lvl) return cb(getMsg(c_msgCode.roleLvlNotOver)); //技能等级不能超过角色等级
        //var skillCd = userData.skillCd;     //技能CD
        var nowTime = new Date(); 

        if (userData.gold < needGold || needGold < 0) return cb(getMsg(c_msgCode.noGolds)); //金币不足
        //技能进阶（魔导等级技能） 200进阶技能消耗金币和物品
        var bag = userData.bag;
        var delBagItems = {};
        if (skillLvl >= 200) {
            var needMagicLvl = (skillLvl - 199) * 10;
            if (userData.magicLvl < needMagicLvl) return cb(getMsg(c_msgCode.NoLvlOpen)); //等级不足
            var needItems = c_lvl[skillLvl].skillNeedItems;
            var itemId = c_prop.spItemIdKey.magicReel;
            if (!bag[itemId] || bag[itemId] < needItems) return cb(getMsg(c_msgCode.noItem)); //物品不足
            delBagItems[itemId] = needItems;
            userUtils.delBag(userData, itemId, needItems, c_prop.itemCostTypeKey.skillAdvance);
        }
        //消耗金币
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.gold, c_lvl[skillLvl].skillNeedGold, c_prop.goldCostTypeKey.upSkill);
        //技能添加
        heroData.skillLvlArr[index] = skillLvl + 1;
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);
        //var addCd = formula.calSkillCd(skillLvl);
        //userData.skillCd = newSkillCd + addCd;
        //userData.lastSkillTime = nowTime;
        //更新
        var upUserData = {
            gold: userData.gold
            //skillCd:userData.skillCd,
            //lastSkillTime:userData.lastSkillTime
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        var upHeroData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            skillLvlArr: heroData.skillLvlArr
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        // async.parallel([
        //     // function(cb1) {
        //     //     userDao.update(client, upUserData, { id: userId }, cb1);
        //     // },
        //     function(cb1) {
        //         heroDao.update(client, upHeroData, { id: heroData.id }, cb1);
        //     }
        // ], function(err, data) {
        //     if (err) return cb(err);
        //记录技能升级次数（紧急委托任务）
        taskBiz.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.upSkill, skillLvl + 1, function() {});
        cb(null, [upUserData, upHeroData, c_lvl[skillLvl + 1].skillNeedGold, delBagItems]);
        //});
    });
};

/**
 * 技能升级
 * @param client
 * @param userId
 * @param tempId
 * @param index
 * @param cb
 * @returns {*}
 */
exports.upSkill2 = function(client, userId, tempId, skill, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){ 
        if (err) return cb(err); 
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        if (!heroData.skillLvlArr) heroData.skillLvlArr = [];

        var needGold = 0;
        var needItems = 0;
        var bag = userData.bag;
        var delBagItems = {};
        for (var index in skill) {
            var sk2Lvl = skill[index];
            var skillLvl = heroData.skillLvlArr[index] || 1; //当前技能等级
            var needLvlArr = c_game.skillRate[4].split(","); //开启技能需要等级
            var skillNeedLvl = (index == 5 ? 0 : needLvlArr[index]);
            for (var i = skillLvl; i < sk2Lvl; i++) {
                needGold += c_lvl[i].skillNeedGold;
                if (i >= 200) {
                    needItems += c_lvl[i].skillNeedItems;
                }
            }
            if (userData.lvl < skillNeedLvl) return cb(getMsg(c_msgCode.NoLvlOpen)); //等级不足
            if (skillLvl < 200 && skillLvl >= userData.lvl) return cb(getMsg(c_msgCode.roleLvlNotOver)); //技能等级不能超过角色等级
            //技能进阶（魔导等级技能） 200进阶技能消耗金币和物品
            if (sk2Lvl >= 200) {
                var needMagicLvl = (skillLvl - 199) * 10;
                if (userData.magicLvl < needMagicLvl) return cb(getMsg(c_msgCode.NoLvlOpen)); //等级不足
            }
        }

        var nowTime = new Date();

        if (userData.gold < needGold || needGold < 0) return cb(getMsg(c_msgCode.noGolds)); //金币不足
        if (needItems > 0) {
            var itemId = c_prop.spItemIdKey.magicReel;
            if (!bag[itemId] || bag[itemId] < needItems) return cb(getMsg(c_msgCode.noItem)); //物品不足
            delBagItems[itemId] = needItems;
            userUtils.delBag(userData, itemId, needItems, c_prop.itemCostTypeKey.skillAdvance);
        }
        //消耗金币
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.gold, needGold, c_prop.goldCostTypeKey.upSkill);
        var maxLvl = 0;
        for (var index in skill) {
            var sk2Lvl = skill[index];
            maxLvl = sk2Lvl > maxLvl ? sk2Lvl : maxLvl;
            heroData.skillLvlArr[index] = sk2Lvl;
        }

        //console.log("upSkill2:", skill, heroData.skillLvlArr, needGold);
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        //更新
        var upUserData = {
            gold: userData.gold
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag)
        var upHeroData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            skillLvlArr: heroData.skillLvlArr
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        // async.parallel([
        //     function(cb1) {
        //         userDao.update(client, upUserData, { id: userId }, cb1);
        //     },
        //     function(cb1) {
        //         heroDao.update(client, upHeroData, { id: heroData.id }, cb1);
        //     }
        // ], function(err, data) {
        //     if (err) return cb(err);
        //记录技能升级次数（紧急委托任务）
        taskBiz.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.upSkill, maxLvl, function() {});
        cb(null, [upUserData, upHeroData, needGold, delBagItems]);
        //});
    });
};
/**
 * 清除技能CD
 * @param client
 * @param userId
 * @param cb
 * @returns {*}
 */
exports.clearSkillCd = function(client, userId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var newSkillCd = 0; //当前cd时间
        var nowTime = new Date();
        var skillCd = userData.skillCd;
        if (!skillCd || skillCd == 0 || skillCd == null) return cb(getMsg(c_msgCode.skillNoCD)); //技能等待时间为空,不需要清除
        var lastSkillTime = userData.lastSkillTime; //最后点技能时间
        var skillTime = lastSkillTime.addSeconds(skillCd); //当前技能时间
        newSkillCd = parseInt((skillTime.getTime() - nowTime.getTime()) / 1000);
        if (newSkillCd < 0) newSkillCd = 0;

        var needDiamond = formula.calSkillDiamond(newSkillCd); //所需钻石
        if (userData.diamond < needDiamond || needDiamond < 0) return cb(getMsg(c_msgCode.noDiamond)); //钻石不足;
        //清除CD
        userData.skillCd = 0;
        userData.lastSkillTime = nowTime;
        //钻石扣除
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, needDiamond, c_prop.diamondCostTypeKey.clearSkillCd);

        //需要更新的数据
        var updateData = {
            diamond: userData.diamond,
            giveDiamond: userData.giveDiamond,
            buyDiamond: userData.buyDiamond,
            skillCd: userData.skillCd,
            lastSkillTime: userData.lastSkillTime
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        cb(null, [updateData, needDiamond]);
    });
}

/**
 * 装备符文块
 * @param client
 * @param userId
 * @param tempId 英雄id
 * @param index 符文块下标
 * @param cb
 * @returns {*}
 */
exports.wearRune = function(client, userId, tempId, index, cb) {
    checkRequire();
    //if(tempId == c_prop.heroJobKey.ys) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){ 
        if (err) return cb(err); 
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        var realmLvl = heroData.realmLvl == 0 ? 0 : heroData.realmLvl;
        if (!heroData.realmArr) heroData.realmArr = [];
        var runeId = c_realm[realmLvl].reqItems[index]; //符文块id
        if (heroData.realmArr[index] == runeId) return cb(getMsg(c_msgCode.equipItem)); //已装备过该物品
        userData.bag = userData.bag || {};
        var bag = userData.bag || {};
        if (!bag[runeId] || bag[runeId] == 0) return cb(getMsg(c_msgCode.noItem)); //没有该物品
        var needLvl = t_item[runeId].level; //装备需要等级
        if (userData.lvl < needLvl) return cb(getMsg(c_msgCode.NoLvlOpen)); //等级不足
        var delBagItems = {};

        //装备
        heroData.realmArr[index] = runeId;
        heroData.realmLvl = realmLvl;
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);
        //去除背包符文 
        delBagItems[runeId] = 1;
        userUtils.delBag(userData, runeId, 1, c_prop.itemCostTypeKey.rune);

        var realmCount = 0;
        if (heroData.realmArr.length > 0) {
            for (var j = 0; j < heroData.realmArr.length; j++) {
                if (heroData.realmArr[j]) realmCount += 1;
            }
        }
        heroData.realmSumLvl = parseInt(heroData.realmLvl) * 100 + realmCount; //境界等级 * 100 + 已装备个数

        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        var upHeroData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            realmArr: heroData.realmArr,
            realmLvl: heroData.realmLvl,
            realmSumLvl: heroData.realmSumLvl
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        cb(null, [upHeroData, delBagItems]);
    });
}

/**
 * 装备所有符文块
 * @param client
 * @param userId
 * @param tempId 英雄id
 * @param cb
 * @returns {*}
 */
exports.wearAllRune = function(client, userId, tempId, cb) {
    checkRequire(); 
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){ 
        if (err) return cb(err); 
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        var realmLvl = heroData.realmLvl == 0 ? 0 : heroData.realmLvl;
        if (!heroData.realmArr) heroData.realmArr = [];
        var runeIdArr = c_realm[realmLvl].reqItems; //符文块id数组
        var delBagItems = {};
        for (var i = 0; i < runeIdArr.length; i++) {
            var runeId = runeIdArr[i]; //符文块id
            if (heroData.realmArr[i] == runeId) continue;
            var needLvl = t_item[runeId].level; //装备需要等级
            if (userData.lvl < needLvl) continue;
            var bag = userData.bag || {};
            if (!bag[runeId] || bag[runeId] == 0) {
                if (!c_compound[runeId]) continue;
                //var bagItems = {};
                var compoundNeedObj = {}; //合成所需物品
                //var compoundNeedGold = c_compound[runeId].reqJinbi;;       //合成所需金币
                var reqItems1 = c_compound[runeId].reqItems1;
                if (reqItems1 != 0) compoundNeedObj[reqItems1] = c_compound[runeId].reqCount1;
                var reqItems2 = c_compound[runeId].reqItems2;
                if (reqItems2 != 0) compoundNeedObj[reqItems2] = c_compound[runeId].reqCount2;
                var reqItems3 = c_compound[runeId].reqItems3;
                if (reqItems3 != 0) compoundNeedObj[reqItems3] = c_compound[runeId].reqCount3;
                var reqItems4 = c_compound[runeId].reqItems4;
                if (reqItems4 != 0) compoundNeedObj[reqItems4] = c_compound[runeId].reqCount4;

                //if(gold < compoundNeedGold) return cb(getMsg(c_msgCode.noGolds));//金币不足
                //判断合成材料
                var isContinue = false;
                for (var key in compoundNeedObj) {
                    var ownCount = bag[key] || 0; //拥有所需合成材料的数量
                    if (!ownCount || ownCount < compoundNeedObj[key]) {
                        isContinue = true;
                        continue;
                    }
                }
                if (isContinue) continue;
                //扣除材料
                for (var key in compoundNeedObj) {
                    if (!delBagItems[key]) delBagItems[key] = 0;
                    delBagItems[key] += compoundNeedObj[key];
                    userUtils.delBag(userData, key, compoundNeedObj[key], c_prop.itemCostTypeKey.rune);
                }
                //获取合成物品
                var tmpItems = {};
                tmpItems[runeId] = 1;
                userUtils.saveItems(userData, tmpItems, c_prop.itemGetTypeKey.other);
                //bag[runeId] = 1;
                //bagItems[runeId] = 1;
            }

            //装备
            heroData.realmArr[i] = runeId;
            heroData.realmLvl = realmLvl;
            heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
            heroData.combat = heroPropHelper.calCombat(userData, heroData);
            //去除背包符文 
            if (!delBagItems[runeId]) delBagItems[runeId] = 0;
            delBagItems[runeId] += 1;
            userUtils.delBag(userData, runeId, 1, c_prop.itemCostTypeKey.rune);
        }

        var realmCount = 0;
        if (heroData.realmArr.length > 0) {
            for (var j = 0; j < heroData.realmArr.length; j++) {
                if (heroData.realmArr[j]) realmCount += 1;
            }
        }
        heroData.realmSumLvl = parseInt(heroData.realmLvl) * 100 + realmCount; //境界等级 * 100 + 已装备个数

        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        var upHeroData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            realmArr: heroData.realmArr,
            realmLvl: heroData.realmLvl,
            realmSumLvl: heroData.realmSumLvl
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        cb(null, [upHeroData, delBagItems]);
    });
}

/**
 * 升级境界
 * @param client
 * @param userId
 * @param tempId
 * @param cb
 * @returns {*}
 */
exports.upRealm = function(client, userId, tempId, cb) {
    checkRequire();
    //if(tempId == c_prop.heroJobKey.ys) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){ 
        if (err) return cb(err); 
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        if (err) return cb(err);
        var realmLvl = heroData.realmLvl == 0 ? 0 : heroData.realmLvl; //境界等级
        var realmArr = heroData.realmArr || []; //符文块数组
        if (realmArr.length < 6) return cb(getMsg(c_msgCode.realmFullFirst)); //请先穿满境界装备
        for (var i = 0; i < realmArr.length; i++) {
            if (realmArr[i] == null) return cb(getMsg(c_msgCode.realmFullFirst)); //请先穿满境界装备
        }
        var reqItems = c_realm[realmLvl].reqItems; //所需符文块
        for (var i = 0; i < reqItems.length; i++) {
            if (reqItems[i] != realmArr[i]) return cb(getMsg(c_msgCode.equipError)); //装备有误
        }

        //升级境界
        heroData.realmLvl = realmLvl + 1;
        heroData.realmArr = [];
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        //推送系统消息(oldma)
        //第一个%s：玩家名
        //第二个%s：境界名字
        chatBiz.addSysData(17, [userData.nickName, c_realm[heroData.realmLvl].name, heroData.realmLvl]);
        chatBiz.addSysData(18, [userData.nickName, c_realm[heroData.realmLvl].name, heroData.realmLvl]);

        var realmCount = 0;
        if (heroData.realmArr.length > 0) {
            for (var j = 0; j < heroData.realmArr.length; j++) {
                if (heroData.realmArr[j]) realmCount += 1;
            }
        }
        heroData.realmSumLvl = parseInt(heroData.realmLvl) * 100 + realmCount; //境界等级 * 100 + 已装备个数

        var updataData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            realmLvl: heroData.realmLvl,
            realmArr: heroData.realmArr,
            realmSumLvl: heroData.realmSumLvl
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        // heroDao.update(client, updataData, { id: heroData.id }, function(err, data) {
        //     if (err) return cb(err);
        cb(null, updataData);
        //});
    });
}

/**
 * 强化
 * @param client
 * @param userId
 * @param tempId
 * @param index  对应装备下标
 * @param cb
 * @returns {*}
 */
exports.strength = function(client, userId, tempId, index, cb) {
    checkRequire();
    //if(tempId == c_prop.heroJobKey.ys) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    async.parallel([
        function(cb1) {
            //userDao.select(client, { id: userId }, cb1);
            g_cache.getGamePlayer(client, userId, cb1);
            // },
            // function(cb1) {
            //     heroDao.select(client, { tempId: tempId, userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        if (!userData.bag) userData.bag = {};
        if (!heroData.intensifyArr) heroData.intensifyArr = [];
        var bag = userData.bag;
        var strengthNum = bag[c_prop.spItemIdKey.intensify] || 0; //拥有强化石数量
        var strengthLvl = heroData.intensifyArr[index] || 0; //当前强化等级
        var strengthLimit = c_game.initCfg[2]; //强化上限
        var cLvlId = 1;
        if (strengthLvl != 0) cLvlId = strengthLvl;
        var costGold = c_lvl[cLvlId].equipStrengthGold;
        var costStrengthNum = c_lvl[cLvlId].equipStrengthNum;
        if (strengthLvl >= strengthLimit) return cb(getMsg(c_msgCode.strengthMax)); //已达到强化上限
        if (userData.gold < costGold || costGold < 0) return cb(getMsg(c_msgCode.noGolds)); //金币不足
        if (strengthNum < costStrengthNum) return cb(getMsg(c_msgCode.manaUnenough)); //玛娜之心不足
        var delBagItems = {};

        //强化等级+1
        heroData.intensifyArr[index] = strengthLvl + 1;
        //扣除金币、强化石
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.gold, costGold, c_prop.goldCostTypeKey.strength);
        delBagItems[c_prop.spItemIdKey.intensify] = costStrengthNum;
        userUtils.delBag(userData, c_prop.spItemIdKey.intensify, costStrengthNum, c_prop.itemCostTypeKey.strength);

        //推送系统消息(oldma)
        //第一个%s：玩家名
        //第二个%s：装备颜色
        //第三个%s：装备名字
        //第四个%s：装备强化等级
        var locItemUid = heroData.equipData[index];
        var locBagData = userData.equipBag[locItemUid] || {};
        //物品基础属性
        var locHeroItemId = locBagData[0];
        if(locHeroItemId > 0){
            var color = t_item[locHeroItemId].color; //装备颜色  1~6 白~红
            chatBiz.addSysData(5, [userData.nickName, color, t_item[locHeroItemId].name, strengthLvl + 1]);
            chatBiz.addSysData(29, [userData.nickName, color, t_item[locHeroItemId].name, strengthLvl + 1]);
        }

        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        var intensifyNum = userData.bag[c_prop.spItemIdKey.intensify] || 0;
        var bagItems2 = {};
        bagItems2[c_prop.spItemIdKey.intensify] = intensifyNum;

        //更新
        var upUserData = {
            gold: userData.gold
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        var upHeroData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            intensifyArr: heroData.intensifyArr
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        cb(null, [upUserData, upHeroData, delBagItems, costGold, bagItems2]);
    });
}

/**
 * 一键强化
 * @param client
 * @param userId
 * @param tempId
 * @param eqp  {对应装备下标:目标等级}
 * @param cb
 * @returns {*}
 */
exports.strength2 = function(client, userId, tempId, eqp, cb) {
    checkRequire();
    //if(tempId == c_prop.heroJobKey.ys) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    async.parallel([
        function(cb1) {
            //userDao.select(client, { id: userId }, cb1);
            g_cache.getGamePlayer(client, userId, cb1);
            // },
            // function(cb1) {
            //     heroDao.select(client, { tempId: tempId, userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        if (!userData.bag) userData.bag = {};
        if (!heroData.intensifyArr) heroData.intensifyArr = [];
        var bag = userData.bag;
        var strengthNum = bag[c_prop.spItemIdKey.intensify] || 0; //拥有强化石数量
        var strengthLimit = c_game.initCfg[2]; //强化上限

        var delBagItems = {};

        var costStrengthNum = 0;
        var costGold = 0;
        var strengthenTimes = 0; //强化次数
        for (var index in eqp) {
            var str2lv = eqp[index];
            var strengthLvl = heroData.intensifyArr[index] || 0; //当前强化等级
            if (strengthLvl >= str2lv) return cb(getMsg(c_msgCode.paramsError)); //参数错误!

            if (strengthLvl >= strengthLimit) return cb(getMsg(c_msgCode.strengthMax)); //已达到强化上限
            if (str2lv > strengthLimit) return cb(getMsg(c_msgCode.strengthOver)); //超过强化上限 

            for (var i = strengthLvl; i < str2lv; i++) {
                var cLvlId = i;
                //if (cLvlId == 0) cLvlId = 1;
                costGold += c_lvl[cLvlId].equipStrengthGold;
                costStrengthNum += c_lvl[cLvlId].equipStrengthNum;
                strengthenTimes++;
            }
        }

        if (userData.gold < costGold || costGold < 0) return cb(getMsg(c_msgCode.noGolds)); //金币不足
        if (strengthNum < costStrengthNum) return cb(getMsg(c_msgCode.manaUnenough)); //玛娜之心不足

        for (var index in eqp) {
            var str2lv = eqp[index];
            var strengthLvl = heroData.intensifyArr[index] || 0; //当前强化等级
            heroData.intensifyArr[index] = str2lv;

            //推送系统消息(oldma)
            //第一个%s：玩家名
            //第二个%s：装备颜色
            //第三个%s：装备名字
            //第四个%s：装备强化等级
            var locItemUid = heroData.equipData[index];
            var locBagData = userData.equipBag[locItemUid] || {};
            //物品基础属性
            var locHeroItemId = locBagData[0];
            if(locHeroItemId > 0){
                var color = t_item[locHeroItemId].color; //装备颜色  1~6 白~红
                if (strengthLvl == 0) strengthLvl = 1;
                for (var i = strengthLvl; i <= str2lv; i++) {
                    chatBiz.addSysData(5, [userData.nickName, color, t_item[locHeroItemId].name, i]);
                    chatBiz.addSysData(29, [userData.nickName, color, t_item[locHeroItemId].name, i]);
                } 
            }
        }

        //扣除金币、强化石 
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.gold, costGold, c_prop.goldCostTypeKey.strength);
        delBagItems[c_prop.spItemIdKey.intensify] = costStrengthNum;
        userUtils.delBag(userData, c_prop.spItemIdKey.intensify, costStrengthNum, c_prop.itemCostTypeKey.strength);

        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        var intensifyNum = userData.bag[c_prop.spItemIdKey.intensify] || 0;
        var bagItems2 = {};
        bagItems2[c_prop.spItemIdKey.intensify] = intensifyNum;

        //更新
        var upUserData = {
            gold: userData.gold
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        var upHeroData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            intensifyArr: heroData.intensifyArr
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        cb(null, [upUserData, upHeroData, delBagItems, costGold, strengthenTimes, bagItems2]);
    });
}
/**
 * 升星
 * @param client
 * @param userId
 * @param tempId
 * @param index  对应装备下标
 * @param cb
 * @returns {*}
 */
exports.upStar = function(client, userId, tempId, index, cb) {
    checkRequire();
    //if(tempId == c_prop.heroJobKey.ys) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    async.parallel([
        function(cb1) {
            //userDao.select(client, { id: userId }, cb1);
            g_cache.getGamePlayer(client, userId, cb1);
            // },
            // function(cb1) {
            //     heroDao.select(client, { tempId: tempId, userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        if (!userData.bag) userData.bag = {};
        if (!heroData.starArr) heroData.starArr = [];
        if (!heroData.starTopArr) heroData.starTopArr = [];
        var bag = userData.bag;
        var starNum = bag[c_prop.spItemIdKey.starStone] || 0; //拥有升星石数量
        var starLvl = heroData.starArr[index] || 0; //当前升星等级
        //var starLimit = c_game.initCfg[3];      //升星上限
        var cLvlId = 0;
        if (starLvl != 0) cLvlId = starLvl;

        var costGold = c_lvl[cLvlId].upStarGold;
        var costStarNum = c_lvl[cLvlId].upStarNum;
        var starTop = heroData.starTopArr[index] || 0; //当前升星突破重数
        var maxUpStarLvl = c_lvl[starTop].maxUpStarLvl; //最大升星数级数
        if (starLvl >= maxUpStarLvl) return cb(getMsg(c_msgCode.upStarMax)); //已达到升星上限
        if (userData.gold < costGold || costGold < 0) return cb(getMsg(c_msgCode.noGolds)); //金币不足;
        if (starNum < costStarNum) return cb(getMsg(c_msgCode.upStarUnenough)); //升星石不足
        var delBagItems = {};

        //升星等级+1
        heroData.starArr[index] = starLvl + 1;
        //扣除金币、升星石
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.gold, costGold, c_prop.goldCostTypeKey.upStar);
        delBagItems[c_prop.spItemIdKey.starStone] = costStarNum;
        userUtils.delBag(userData, c_prop.spItemIdKey.starStone, costStarNum, c_prop.itemCostTypeKey.upstar);

        //推送系统消息(oldma)
        //第一个%s：玩家名
        //第二个%s：装备颜色
        //第三个%s：装备名字
        //第四个%s：装备强化等级
        var locItemUid = heroData.equipData[index];
        var locBagData = userData.equipBag[locItemUid] || {};
        //物品基础属性
        var locHeroItemId = locBagData[0];
        if(locHeroItemId > 0){
            var color = t_item[locHeroItemId].color; //装备颜色  1~6 白~红
            chatBiz.addSysData(6, [userData.nickName, color, t_item[locHeroItemId].name, starLvl + 1]);
            chatBiz.addSysData(7, [userData.nickName, color, t_item[locHeroItemId].name, starLvl + 1]);
        }

        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);
        //记录升星次数（紧急委托任务）
        taskBiz.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.upStarEquip, 1, function() {});

        //更新
        var upUserData = {
            gold: userData.gold
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        var upHeroData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            starArr: heroData.starArr
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        cb(null, [upUserData, upHeroData, delBagItems, costGold]);
    });
}

/**
 * 升星突破
 * @param client
 * @param userId
 * @param tempId
 * @param index  对应装备下标
 * @param cb
 * @returns {*}
 */
exports.starTop = function(client, userId, tempId, index, cb) {
    checkRequire();
    //if(tempId == c_prop.heroJobKey.ys) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    async.parallel([
        function(cb1) {
            //userDao.select(client, { id: userId }, cb1);
            g_cache.getGamePlayer(client, userId, cb1);
            // },
            // function(cb1) {
            //     heroDao.select(client, { tempId: tempId, userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        if (!heroData.starArr) heroData.starArr = [];
        if (!heroData.starTopArr) heroData.starTopArr = [];
        var bag = userData.bag;
        var starNum = bag[c_prop.spItemIdKey.starStone] || 0; //拥有升星石数量
        var starLvl = heroData.starArr[index] || 0; //当前升星等级
        var starTop = heroData.starTopArr[index] || 0; //当前升星突破重数
        if (!c_lvl[starTop + 1].upStarTop) return cb(getMsg(c_msgCode.upStarTopMax)); //当前升星突破重数已打上限
        var maxUpStarLvl = c_lvl[starTop].maxUpStarLvl; //最大升星数级数
        if (maxUpStarLvl > starLvl) return cb(getMsg(c_msgCode.canUpStar)); //当前还可以继续升星
        var topCosNum = c_lvl[starTop].topCosNum; //突破消耗升星石数
        var topCosGold = c_lvl[starTop].topCosGold; //突破消耗金币
        var succeedPro = c_lvl[starTop].succeedPro; //突破成功率
        if (userData.gold < topCosGold || topCosGold < 0) return cb(getMsg(c_msgCode.noGolds)); //金币不足;
        if (starNum < topCosNum) return cb(getMsg(c_msgCode.upStarUnenough)); //升星石不足

        var isSucceed = false;
        var randomNum = _getRandomNumber(1, 10000);
        if (!heroData.starTopArr[index]) heroData.starTopArr[index] = 0;
        if (randomNum <= succeedPro) { //成功
            isSucceed = true;
            heroData.starTopArr[index] += 1;
        }

        //扣除金币、升星石
        var delBagItems = {};
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.gold, topCosGold, c_prop.goldCostTypeKey.upStar);
        delBagItems[c_prop.spItemIdKey.starStone] = topCosNum;
        userUtils.delBag(userData, c_prop.spItemIdKey.starStone, topCosNum, c_prop.itemCostTypeKey.upStar);

        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);
        //更新
        var upUserData = {
            gold: userData.gold
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        var upHeroData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            starTopArr: heroData.starTopArr
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        cb(null, [upUserData, upHeroData, delBagItems, [isSucceed]]);
    });
};

/**
 * 宝石升级
 * @param client
 * @param userId
 * @param tempId
 * @param index
 * @param cb
 */
exports.upGem = function(client, userId, tempId, index, cb) {
    checkRequire();
    //if(tempId == c_prop.heroJobKey.ys) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    async.parallel([
        function(cb1) {
            //userDao.select(client, { id: userId }, cb1);
            g_cache.getGamePlayer(client, userId, cb1);
            // },
            // function(cb1) {
            //     heroDao.select(client, { tempId: tempId, userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        if (!userData.bag) userData.bag = {};
        var bag = userData.bag;
        if (!heroData.gemArr) heroData.gemArr = [];
        var gemInitialIndex = index;
        if (index > 7) gemInitialIndex = index - 4;
        var gemId = heroData.gemArr[index] || c_game.gemInitial[gemInitialIndex];
        var gemIdLimit = c_game.gemLimit[gemInitialIndex]; //宝石id上限
        var gemLvlLimitStart = parseInt(c_game.gemLvlLimit[0].split(",")[0]); //宝石等级限制开始等级
        var itemID = c_gem[gemId].itemID; //需要宝石碎片id
        var count = c_gem[gemId].count; //需要宝石碎片数量
        var gemLvl = c_gem[gemId].gemLvl + 1; //宝石等级
        var gemCount = bag[itemID] || 0; //拥有宝石碎片数量
        if (gemId >= gemIdLimit) return cb(getMsg(c_msgCode.gemMax)); //已升到最高等级
        var lastgemLvlLimit = c_game.gemLvlLimit[c_game.gemLvlLimit.length - 1].split(",");
        if (gemLvl >= gemLvlLimitStart) {
            if (gemLvl >= lastgemLvlLimit[0]) {
                if (userData.lvl < lastgemLvlLimit[1]) return cb(getMsg(c_msgCode.NoLvlOpen)); //等级不足
            }
            for (var i = 0; i < c_game.gemLvlLimit.length; i++) {
                if (parseInt(c_game.gemLvlLimit[i].split(",")[0]) > gemLvl) {
                    if (userData.lvl < parseInt(c_game.gemLvlLimit[i - 1].split(",")[1])) return cb(getMsg(c_msgCode.NoLvlOpen)); //等级不足
                    break;
                }
            }
        }
        if (gemCount < count) return cb(getMsg(c_msgCode.gemUnenough)); //宝石碎片数量不足
        var delBagItems = {};

        //英雄宝石等级+1
        heroData.gemArr[index] = gemId + 1;
        //扣除宝石碎片 
        delBagItems[itemID] = count;
        userUtils.delBag(userData, itemID, count, c_prop.itemCostTypeKey.upGem);
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        if (heroData.gemArr.length > 0) {
            var gemSumLvl = 0;
            for (var j = 0; j < heroData.gemArr.length; j++) {
                var gemId = heroData.gemArr[j];
                if (gemId) {
                    if (gemId < 100) {
                        gemSumLvl += parseInt(gemId);
                    } else {
                        gemSumLvl += parseInt((gemId.toString().substr(gemId.toString().length - 2)));
                    }
                }
            }
            heroData.gemSumLvl = gemSumLvl;
        }

        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        var upHeroData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            gemArr: heroData.gemArr,
            gemSumLvl: heroData.gemSumLvl
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        cb(null, [upHeroData, delBagItems]);

    });
}

/**
 * 翅膀激活
 * @param client
 * @param userId
 * @param tempId
 * @param cb
 */
exports.wingActivate = function(client, userId, tempId, cb) {
    checkRequire();
    var tempId2Job = Number.tempId2Job(tempId);
    // if (tempId2Job == c_prop.heroJobKey.ys) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    async.parallel([
        function(cb1) {
            //userDao.select(client, { id: userId }, cb1);
            g_cache.getGamePlayer(client, userId, cb1);
            // },
            // function(cb1) {
            //     heroDao.select(client, { tempId: tempId, userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        var wingArr = heroData.wingArr;
        if (wingArr[1]) return cb(getMsg(c_msgCode.isActivate)); //已激活

        heroData.wingArr = [0, 1, 0, 0];
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        var wingSumLvl = heroData.wingArr[1] || 0;
        var starSum = heroData.wingArr[2] || 0;
        heroData.wingSumLvl = parseInt(wingSumLvl) * 100 + parseInt(starSum); //翅膀等级*100+星数
        heroData.wingCombat = heroPropHelper.calHeroWingCombat(userData, heroData); //翅膀总战力 
        //更新
        var upHeroData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            wingArr: heroData.wingArr,
            wingSumLvl: heroData.wingSumLvl,
            wingCombat: heroData.wingCombat
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        // heroDao.update(client, upHeroData, { id: heroData.id }, function(err, data) {
        //     if (err) return cb(err);
        cb(null, upHeroData);
        //});
    });
};

/**
 * 翅膀培养
 * @param client
 * @param userId
 * @param tempId
 * @param fosType       //培养类型
 * @param cb
 */
exports.wingFos = function(client, userId, tempId, fosType, cb) {
    checkRequire();
    var tempId2Job = Number.tempId2Job(tempId);
    //if (tempId2Job == c_prop.heroJobKey.ys) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        if (!userData.bag) userData.bag = {};
        var bag = userData.bag;
        var lvl = userData.lvl;
        if (lvl < c_game.wingCrit[6]) return cb(getMsg(c_msgCode.unenoughLvlToTrain)); //角色达到一定等级才可培养
        if (!heroData.wingArr) heroData.wingArr = [0, 1, 0, 0]; //初始翅膀数据 [id,等级,星级,当前星经验]
        var wingId = heroData.wingArr[0] || 0;
        var oldWingId = wingId;
        var wingLvl = heroData.wingArr[1] || 1;
        var wingStar = heroData.wingArr[2] || 0;
        var wingExp = heroData.wingArr[3] || 0;
        var idLimit = c_game.initCfg[4];
        if (wingStar >= 10) return cb(getMsg(c_msgCode.trainAfterStrengh)); //请先升级再继续培养
        if (wingId >= idLimit) return cb(getMsg(c_msgCode.lvlMaxed)); //等级已到上限
        var critMul = c_game.wingCrit[1]; //经验暴击倍率
        var critPro = c_game.wingCrit[2]; //经验暴击概率
        //不同培养获得不同经验
        var gainExp = 0; //获得经验
        var conMoney = 0; //消耗货币
        var delBagItems = {};
        var wingShowArr = [];
        var costGold = 0;
        var costDiamond = 0;
        //var costObj = {};
        switch (fosType) {
            case c_prop.wingFosTypeKey.comFoster: //普通培养
                gainExp = c_game.wingCrit[5];
                conMoney = c_game.wingCrit[4];
                if (userData.gold < conMoney || conMoney < 0) return cb(getMsg(c_msgCode.noGolds)); //金币不足;
                userUtils.costCurrency(userData, c_prop.currencyTypeKey.gold, conMoney, c_prop.goldCostTypeKey.wingFos);
                // bag[gc.c_prop.spItemIdKey.plumage]
                // if(userData.gold < 1) return cb("守护玉不足");
                // userData.gold -= conMoney;
                costGold = conMoney;
                //costObj[c_prop.spItemIdKey.gold] = conMoney;
                break;
            case c_prop.wingFosTypeKey.advFoster: //高级培养
                gainExp = c_game.wingCrit[0] * 10; //一次消耗10个精灵之泪
                conMoney = c_game.wingCrit[3] * 10;
                if (bag[c_prop.spItemIdKey.plumage] && bag[c_prop.spItemIdKey.plumage] >= 10) {
                    delBagItems[c_prop.spItemIdKey.plumage] = 10;
                    userUtils.delBag(userData, c_prop.spItemIdKey.plumage, 10, c_prop.itemCostTypeKey.wing);
                    //costObj[c_prop.spItemIdKey.plumage] = 10;
                } else {
                    if (userData.diamond < conMoney || conMoney < 0) return cb(getMsg(c_msgCode.noDiamond)); //钻石不足;
                    userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, conMoney, c_prop.diamondCostTypeKey.wingFos, c_prop.spItemIdKey.plumage, 10);
                    costDiamond = conMoney;
                    //costObj[c_prop.spItemIdKey.diamond] = conMoney;
                }
                break;
            default:
                return cb(getMsg(c_msgCode.unknowType)); //未知类型
                break;
        }
        //获得经验是否暴击
        var randomNum = _getRandomNumber(1, 10000);
        var isCrit = false;
        if (randomNum <= critPro) {
            gainExp = critMul * gainExp;
            isCrit = true;
        }
        wingShowArr[0] = gainExp;
        wingShowArr[1] = isCrit;
        gainExp += wingExp;
        //计算所得经验可升几星
        var starLvl = 0; //获得星级
        for (var i = wingId; i < idLimit; i++) {
            if (gainExp < t_wing[i].needExp) break;
            if ((starLvl + wingStar) >= 10) break;
            starLvl += 1;
            gainExp -= t_wing[i].needExp;
        }

        wingId += starLvl;
        wingExp = gainExp;
        wingStar += starLvl;
        if ((starLvl + wingStar) >= 10) wingExp = 0;
        heroData.wingArr[0] = wingId;
        heroData.wingArr[1] = wingLvl;
        heroData.wingArr[2] = wingStar;
        heroData.wingArr[3] = wingExp;
        //heroData.wingArr = [wingId,wingLvl,wingStar,wingExp];
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        //推送系统消息(oldma)

        if (oldWingId != wingId) {
            //第一个%s：玩家名
            //第二个%s：翅膀名
            chatBiz.addSysData(8, [userData.nickName, t_wing[wingId].name, wingId]);
            chatBiz.addSysData(9, [userData.nickName, t_wing[wingId].name, wingId]);
        }

        chatBiz.addSysData(10, [userData.nickName, isCrit]);

        var wingSumLvl = heroData.wingArr[1] || 0;
        var starSum = heroData.wingArr[2] || 0;
        heroData.wingSumLvl = parseInt(wingSumLvl) * 100 + parseInt(starSum); //翅膀等级*100+星数
        heroData.wingCombat = heroPropHelper.calHeroWingCombat(userData, heroData); //翅膀总战力 


        var plumageNum = userData.bag[c_prop.spItemIdKey.plumage] || 0;
        var bagItems2 = {};
        bagItems2[c_prop.spItemIdKey.plumage] = plumageNum;

        //更新
        var upUserData = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(delBagItems));
        var upHeroData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            wingArr: heroData.wingArr,
            wingSumLvl: heroData.wingSumLvl,
            wingCombat: heroData.wingCombat
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        cb(null, [upUserData, upHeroData, delBagItems, wingShowArr[0], wingShowArr[1], costGold, costDiamond, bagItems2]);
    });
}

/**
 * 翅膀升级
 * @param client
 * @param userId
 * @param tempId
 * @param cb
 */
exports.upWing = function(client, userId, tempId, cb) {
    checkRequire();
    var tempId2Job = Number.tempId2Job(tempId);
    //if (tempId2Job == c_prop.heroJobKey.ys) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    async.parallel([
        function(cb1) {
            //userDao.select(client, { id: userId }, cb1);
            g_cache.getGamePlayer(client, userId, cb1);
            // },
            // function(cb1) {
            //     heroDao.select(client, { tempId: tempId, userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        var wingArr = heroData.wingArr; //翅膀数据 [id,等级,星级,当前星经验]
        var idLimit = c_game.initCfg[4];
        if (wingArr[2] < 10) return cb(getMsg(c_msgCode.notLvlUp)); //未满足升级条件
        if ((wingArr[0] + 1) >= idLimit) return cb(getMsg(c_msgCode.lvlMaxed)); //等级已到上限

        //升级
        heroData.wingArr[0] += 1;
        heroData.wingArr[1] += 1;
        heroData.wingArr[2] = 0;
        heroData.wingArr[3] = 0;
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        var wingSumLvl = heroData.wingArr[1] || 0;
        var starSum = heroData.wingArr[2] || 0;
        heroData.wingSumLvl = parseInt(wingSumLvl) * 100 + parseInt(starSum); //翅膀等级*100+星数
        heroData.wingCombat = heroPropHelper.calHeroWingCombat(userData, heroData); //翅膀总战力 

        var updateHero = {
            id : heroData.id,
            wingArr: heroData.wingArr,
            combat: heroData.combat,
            propArr: heroData.propArr,
            wingSumLvl: heroData.wingSumLvl,
            wingCombat: heroData.wingCombat
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        //更新
        // heroDao.update(client, { wingArr: heroData.wingArr, propArr: heroData.propArr }, { id: heroData.id }, function(err, data) {
        //     if (err) return cb(err);
        cb(null, updateHero);
        //});
    });
};

/**
 * 翅膀一键升阶
 * @param client
 * @param userId
 * @param tempId
 * @param fosType       //培养类型
 * @param isUseDiamond //是否使用元宝
 * @param cb
 */

exports.wingFos2Top = function(client, userId, tempId, fosType, isUseDiamond, cb) {
    checkRequire();
    var tempId2Job = Number.tempId2Job(tempId);
    // if (tempId2Job == c_prop.heroJobKey.ys) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        if (!userData.bag) userData.bag = {};
        var bag = userData.bag;
        var lvl = userData.lvl;
        if (lvl < c_game.wingCrit[6]) return cb(getMsg(c_msgCode.activateByRoleLvl)); //角色达到一定等级才可激活
        if (!heroData.wingArr) heroData.wingArr = [0, 1, 0, 0]; //初始翅膀数据 [id,等级,星级,当前星经验]
        var wingId = heroData.wingArr[0] || 0;
        var oldWingId = wingId;
        var wingLvl = heroData.wingArr[1] || 1;
        var wingStar = heroData.wingArr[2] || 0;
        var wingExp = heroData.wingArr[3] || 0;
        var idLimit = c_game.initCfg[4];
        if (wingStar >= 10) return cb(getMsg(c_msgCode.trainAfterStrengh)); //请先升级再继续培养
        if (wingId >= idLimit) return cb(getMsg(c_msgCode.lvlMaxed)); //等级已到上限
        var critMul = c_game.wingCrit[1]; //经验暴击倍率
        var critPro = c_game.wingCrit[2]; //经验暴击概率
        //不同培养获得不同经验
        var totalGainExp = 0;
        totalGainExp += wingExp;
        var conMoney = 0; //消耗货币
        var delBagItems = {};
        var wingShowArr = [0, 0]; //增加经验，暴击次数
        var costGold = 0;
        var costDiamond = 0;
        //var costObj = {};
        var fosNum = 0
        var globalStarLvl = 0;
        for (var nowStar = wingStar; nowStar < 10;) {
            var gainExp = 0; //获得经验
            switch (fosType) {
                case c_prop.wingFosTypeKey.comFoster: //普通培养
                    gainExp = c_game.wingCrit[5];
                    conMoney = c_game.wingCrit[4];
                    if (userData.gold < conMoney || conMoney < 0) {
                        if (fosNum == 0) {
                            return cb(getMsg(c_msgCode.noGolds));
                        } else {
                            return _over(client, totalGainExp, [wingStar, wingLvl, wingId, oldWingId], wingShowArr, delBagItems, [costGold, costDiamond], isCrit, gamePlayer, heroData, cb);
                        }
                    }
                    userUtils.costCurrency(userData, c_prop.currencyTypeKey.gold, conMoney, c_prop.goldCostTypeKey.wingFos);
                    costGold += conMoney;
                   // costObj[c_prop.spItemIdKey.gold] = conMoney;
                    break;
                case c_prop.wingFosTypeKey.advFoster: //高级培养
                    gainExp = c_game.wingCrit[0];
                    conMoney = c_game.wingCrit[3];
                    if (bag[c_prop.spItemIdKey.plumage] && bag[c_prop.spItemIdKey.plumage] > 0) {
                        var locNum = delBagItems[c_prop.spItemIdKey.plumage] || 0;
                        delBagItems[c_prop.spItemIdKey.plumage] = locNum + 1;
                        userUtils.delBag(userData, c_prop.spItemIdKey.plumage, 1, c_prop.itemCostTypeKey.wing);
                        //costObj[c_prop.spItemIdKey.plumage] = 1;
                    } else {
                        if (isUseDiamond) {
                            if (userData.diamond < conMoney || conMoney < 0) {
                                if (fosNum == 0) {
                                    return cb(getMsg(c_msgCode.noDiamond));
                                } else {
                                    return _over(client, totalGainExp, [wingStar, wingLvl, wingId, oldWingId], wingShowArr, delBagItems, [costGold, costDiamond], isCrit, gamePlayer, heroData, cb);
                                }
                            }
                            userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, conMoney, c_prop.diamondCostTypeKey.wingFos, c_prop.spItemIdKey.plumage, 1);
                            costDiamond += conMoney;
                            //costObj[c_prop.spItemIdKey.diamond] = conMoney;
                        } else {
                            if (fosNum == 0) {
                                return cb(getMsg(c_msgCode.notEnoughFeather)); //精灵之泪不足
                            } else {
                                return _over(client, totalGainExp, [wingStar, wingLvl, wingId, oldWingId], wingShowArr, delBagItems, [costGold, costDiamond], isCrit, gamePlayer, heroData, cb);
                            }
                        }
                    }
                    break;
                default:
                    return cb(getMsg(c_msgCode.unknowType)); //未知类型
                    break;
            }
            //获得经验是否暴击
            var randomNum = _getRandomNumber(1, 10000);
            var isCrit = false;
            if (randomNum <= critPro) {
                gainExp = critMul * gainExp;
                isCrit = true;
                wingShowArr[1] += 1;
            }
            totalGainExp += gainExp;
            wingShowArr[0] += totalGainExp;
            fosNum++;

            //计算所得经验可升几星
            var starLvl = 0; //获得星级
            for (var i = wingId; i < idLimit; i++) {
                if (totalGainExp < t_wing[i].needExp) break;
                if ((starLvl + wingStar) >= 10) break;
                starLvl += 1;
                globalStarLvl += 1;
                nowStar = starLvl + wingStar;
                totalGainExp -= t_wing[i].needExp;
            }

            wingId += starLvl;
            wingStar += starLvl;
        }


        //wingId += starLvl;
        wingExp = totalGainExp;
        //wingStar += starLvl;
        if (wingStar >= 10) wingExp = 0;
        heroData.wingArr[0] = wingId;
        heroData.wingArr[1] = wingLvl;
        heroData.wingArr[2] = wingStar;
        heroData.wingArr[3] = wingExp;
        //heroData.wingArr = [wingId,wingLvl,wingStar,wingExp];
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        //推送系统消息(oldma) 
        for (var i = oldWingId + 1; i <= wingId && i <= oldWingId + 11; i++) {
            //第一个%s：玩家名
            //第二个%s：翅膀名 
            chatBiz.addSysData(8, [userData.nickName, t_wing[i].name, i]);
            chatBiz.addSysData(9, [userData.nickName, t_wing[i].name, i]);
        }

        chatBiz.addSysData(10, [userData.nickName, isCrit]);

        var wingSumLvl = heroData.wingArr[1] || 0;
        var starSum = heroData.wingArr[2] || 0;
        heroData.wingSumLvl = parseInt(wingSumLvl) * 100 + parseInt(starSum); //翅膀等级*100+星数
        heroData.wingCombat = heroPropHelper.calHeroWingCombat(userData, heroData); //翅膀总战力 
        //更新
        var upUserData = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(delBagItems));
        var upHeroData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            wingArr: heroData.wingArr,
            wingSumLvl: heroData.wingSumLvl,
            wingCombat: heroData.wingCombat
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        // async.parallel([
        //     // function(cb1) {
        //     //     userDao.update(client, upUserData, { id: userId }, cb1);
        //     // },
        //     function(cb1) {
        //         heroDao.update(client, upHeroData, { id: heroData.id }, cb1);
        //     }
        // ], function(err, data) {
        //     if (err) return cb(err);
        cb(null, [upUserData, upHeroData, delBagItems, wingShowArr[0], wingShowArr[1], costGold, costDiamond]);
        //});
    });
};

/**
 * 翅膀强化
 * @param client
 * @param userId
 * @param tempId
 * @param part       //部位  1：左  2：右
 * @param isReplace       //是否元宝替代  否：false  是：true
 * @param cb
 */
exports.wingStrength = function(client, userId, tempId, part, isReplace, cb) {
    checkRequire();
    var tempId2Job = Number.tempId2Job(tempId);
    //if (tempId2Job == c_prop.heroJobKey.ys) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        var needDiamond = 0;
        var delBagItems = {};
        if (!userData.bag) userData.bag = {};
        var bag = userData.bag;
        var plumage = bag[c_prop.spItemIdKey.plumage] || 0; //羽毛数量
        if (!heroData.wingArr) heroData.wingArr = [0, 1, 0, 0, 0, 0]; //翅膀[id,等级,星级,当前星经验,左翅强化等级,右翅强化等级]
        var wingLvl = heroData.wingArr[1] || 1;
        var openLvl = c_game.wingCrit[7]; //翅膀强化开启等级
        if (wingLvl < openLvl) return cb(getMsg(c_msgCode.wingStrenghOpen, openLvl)); //守护精灵强化功能开启等级为:" + openLvl
        var lvl = 0;
        var index = 0;
        if (part == c_prop.wingStrengthKey.left) {
            lvl = heroData.wingArr[4] || 0; //左翅强化等级
            index = 4;
        } else if (part == c_prop.wingStrengthKey.right) {
            lvl = heroData.wingArr[5] || 0; //右翅强化等级
            index = 5;
        } else {
            return cb(getMsg(c_msgCode.wingStrenghWrongPos)); //守护精灵强化位置错误
        }
        //var id = parseInt(part.toString() + (lvl).toString);
        var needPlumage = t_wingStrength[lvl].consume;
        if (!t_wingStrength[lvl]) return cb(getMsg(c_msgCode.wingStrenghMax)); //守护精灵强化等级已到上限
        if (t_wingStrength[lvl].needWingLvl > wingLvl) return cb(getMsg(c_msgCode.cannotWingStrengh, t_wingStrength[lvl].needWingLvl)); //守护精灵不能继续强化,需要到达阶数:" + t_wingStrength[lvl].needWingLvl

        //消耗判断、结算
        if (needPlumage > plumage) {
            if (isReplace) { //元宝替代
                var buyPlumageNum = needPlumage - plumage;
                needDiamond = buyPlumageNum * 5;
                if (needDiamond > userData.diamond || needDiamond < 0) return cb(getMsg(c_msgCode.noDiamond));
                delBagItems[c_prop.spItemIdKey.plumage] = plumage;
                userUtils.delBag(userData, c_prop.spItemIdKey.plumage, plumage, c_prop.itemCostTypeKey.wing);
                userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, needDiamond, c_prop.diamondCostTypeKey.wingStrength, c_prop.spItemIdKey.plumage, buyPlumageNum);
            } else {
                return cb(getMsg(c_msgCode.notEnoughFeather));
            }
        } else {
            delBagItems[c_prop.spItemIdKey.plumage] = needPlumage;
            userUtils.delBag(userData, c_prop.spItemIdKey.plumage, needPlumage, c_prop.itemCostTypeKey.wing);
        }

        var isSucceed = false;
        var isCrit = false;
        var isDemote = false;
        var succeedPro = t_wingStrength[lvl].successPro; //成功概率
        var randomNum = _getRandomNumber(1, 10000);
        if (!heroData.wingArr[index]) heroData.wingArr[index] = 0;
        if (randomNum <= succeedPro) { //成功
            isSucceed = true;
            heroData.wingArr[index] += 1;
            var critPro = t_wingStrength[lvl].critPro; //暴击概率
            var randomNum1 = _getRandomNumber(1, 10000);
            if (randomNum1 <= critPro) { //加2级
                if (t_wingStrength[lvl + 2] && t_wingStrength[lvl + 2].needWingLvl <= wingLvl) {
                    isCrit = true;
                    heroData.wingArr[index] += 1;
                }
            }
        } else { //失败
            var demotePro = t_wingStrength[lvl].demotePro; //掉级概率
            var randomNum2 = _getRandomNumber(1, 10000);
            if (randomNum2 <= demotePro) {
                isDemote = true;
                heroData.wingArr[index] -= 1;
                if (heroData.wingArr[index] < 0) heroData.wingArr[index] = 0;
            }
        }
        //记录左右翅膀强化历史最高等级和  前端技能需要用到
        var highLvl = heroData.wingArr[6] || 0;
        var lLvl = heroData.wingArr[4] || 0;
        var rLvl = heroData.wingArr[5] || 0; //要这样写下 否则 NaN
        if (lLvl + rLvl > highLvl) heroData.wingArr[6] = lLvl + rLvl;

        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        heroData.wingCombat = heroPropHelper.calHeroWingCombat(userData, heroData); //翅膀总战力 

        //推送系统消息(oldma)
        //if(oldWingId!=wingId){
        //    //第一个%s：玩家名
        //    //第二个%s：翅膀名
        //    chatBiz.addSysData(8,[userData.nickName,t_wing[wingId].name,wingId]);
        //    chatBiz.addSysData(9,[userData.nickName,t_wing[wingId].name,wingId]);
        //}
        //
        //chatBiz.addSysData(10,[userData.nickName,isCrit]);

        //更新
        var upUserData = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(delBagItems));
        var upHeroData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            wingArr: heroData.wingArr,
            wingCombat: heroData.wingCombat
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        cb(null, [upUserData, upHeroData, delBagItems, needDiamond, [isSucceed, heroData.wingArr[index], isCrit, isDemote]]);
    });
};

/**
 * 装备精炼
 * @param client
 * @param userId
 * @param tempId
 * @param index  对应装备下标
 * @param cb
 */
exports.equipRefine = function(client, userId, tempId, index, cb) {
    checkRequire();
    //if(tempId == c_prop.heroJobKey.ys) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        var delBagItems = {};
        if (!userData.bag) userData.bag = {};
        if (!heroData.refineArr) heroData.refineArr = [];
        var bag = userData.bag;
        var strengthNum = bag[c_prop.spItemIdKey.intensify] || 0; //拥有强化石数量
        var strengthLvl = heroData.intensifyArr[index] || 0; //当前强化等级
        var refineLvl = heroData.refineArr[index] || 0; //当前精炼等级
        var openLvl = c_game.equipRefineCfg[0];
        if (openLvl > strengthLvl) return cb(getMsg(c_msgCode.reinforceRequire, openLvl));
        if (!t_strengthRefine[refineLvl + 1]) return cb(getMsg(c_msgCode.refineMax)); //精炼等级已达最高
        var needStrLvl = t_strengthRefine[refineLvl].needStrLvl;
        if (needStrLvl > strengthLvl) return cb(getMsg(c_msgCode.strengthNotRefine, needStrLvl)); //强化等级不足无法精炼:" + needStrLvl 

        var costGold = t_strengthRefine[refineLvl].consumeGold;
        var costStrengthNum = t_strengthRefine[refineLvl].consumeStr;
        var succeedPro = t_strengthRefine[refineLvl].succeedPro;
        if (userData.gold < costGold || costGold < 0) return cb(getMsg(c_msgCode.noGolds)); //金币不足;
        if (strengthNum < costStrengthNum) return cb(getMsg(c_msgCode.manaUnenough)); //玛娜之心不足

        var isSucceed = false;
        var isCrit = false;
        var isDemote = false;
        var randomNum = _getRandomNumber(1, 10000);
        if (!heroData.refineArr[index]) heroData.refineArr[index] = 0;
        if (randomNum <= succeedPro) { //成功
            isSucceed = true;
            heroData.refineArr[index] += 1;
            exports.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.equipRefineNum, 1);
            var critPro = t_strengthRefine[refineLvl].critPro; //暴击概率
            var randomNum1 = _getRandomNumber(1, 10000);
            if (randomNum1 <= critPro) { //加2级
                if (t_strengthRefine[refineLvl + 2] && t_strengthRefine[refineLvl + 2].needStrLvl <= strengthLvl) {
                    isCrit = true;
                    heroData.refineArr[index] += 1;
                    exports.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.equipRefineNum, 1);
                }
            }
        } else { //失败
            var demotePro = t_strengthRefine[refineLvl].demotePro; //掉级概率
            var randomNum2 = _getRandomNumber(1, 10000);
            if (randomNum2 <= demotePro) {
                isDemote = true;
                heroData.refineArr[index] -= 1;
                if (heroData.refineArr[index] < 0) {
                    heroData.refineArr[index] = 0;
                } else {
                    exports.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.equipRefineNum, -1);
                }
            }
        }

        //扣除金币、强化石 
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.gold, costGold, c_prop.goldCostTypeKey.equipRefine);
        delBagItems[c_prop.spItemIdKey.intensify] = costStrengthNum;
        userUtils.delBag(userData, c_prop.spItemIdKey.intensify, costStrengthNum, c_prop.itemCostTypeKey.wing);

        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        //更新
        var upUserData = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(delBagItems));
        var upHeroData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            refineArr: heroData.refineArr
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        cb(null, [upUserData, upHeroData, delBagItems, [isSucceed, heroData.refineArr[index], isCrit, isDemote]]);
    });
};

exports.callHero = function(client, userId, tempId, sex, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            //userDao.select(client, { id: userId }, cb1);
            g_cache.getGamePlayer(client, userId, cb1);
            // },
            // function(cb1) {
            //     heroDao.listCols(client, "id,tempId", "userId = ?", [userId], cb1);
        },
        function(cb1) {
            copyProgressDao.select(client, { userId: userId, copyType: c_prop.copyTypeKey.normal }, cb1)
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByJob(tempId);
        var heroList = gamePlayer.heroListData;
        var copyProgressData = data[1];
        if (heroList.length >= 4) return cb(getMsg(c_msgCode.getAllHero)); //角色已全部解锁 

        if (heroData) return cb(getMsg(c_msgCode.haveHero)); //已经拥有该英雄 //预防重复

        var needLvl = 0;
        var needRebirthLvl = 0;
        var needPassNormalCopy = 0;
        var openRole = 99999999;

        if (heroList.length == 1) {
            needLvl = c_open.openRole2.lvlRequired;
            //法师 通关第五关后就可以解锁
            needPassNormalCopy = c_open.openRole2.passNormalRequired;
            var copyObj = copyProgressData.copyObj || {};
            var keys = Object.keys(copyObj);
            var curCopyId = keys[keys.length - 1] || 1;
            if (curCopyId <= needPassNormalCopy) return cb(getMsg(c_msgCode.passNormalCopy, needPassNormalCopy)); //通关第五关后才能解锁
        } else if (heroList.length == 2) {
            needRebirthLvl = c_open.openRole3.rebirthLvlRequired;
        } else if (heroList.length == 3) {
            needRebirthLvl = c_open.openRole4.rebirthLvlRequired;
        }
        if (userData.lvl < needLvl) return cb(getMsg(c_msgCode.NoLvlOpen)); //等级不够
        if (userData.rebirthLvl < needRebirthLvl) return cb(getMsg(c_msgCode.teamRankUnenough)); //小队评级不够

        // BI 
        var biObj = new biHlObj.counterRoleChoiceObj(userData.accountId, userId, userData.lvl, userData.nickName);
        biHlBiz.HlCounterBi(biObj, userData.serverIndexId, userId, gamePlayer.accountData, userData.exData[c_prop.userExDataKey.loginIP], function(err, data) {});

        exports.createByTempId(client, userData, tempId, sex, heroList.length, function(err, data) {
            if (err) return cb(err);
            // 加入到cache中
            gamePlayer.heroListData.push(data);
            //gamePlayer.setHeroDataDirty(data.id);
            userBiz.initHeroStar(userData, tempId, function() {});

            cb(null, [data, userData.nickName, heroList.length]);
        });


    });
};

//保存出战列表
exports.saveFightList = function(client, userId, fightArr, cb) {
    checkRequire();
    //heroDao.listCols(client, "id,fightSort", "userId = ?", [userId] , function(err,heroList){
    //if (err) return cb(err);
    async.parallel([
        function(cb1) {
            //userDao.selectCols(client, "id,lvl,vip", "id = ?", [userId], cb1);
            g_cache.getGamePlayer(client, userId, cb1);
            // },
            // function(cb1) {
            //     heroDao.listCols(client, "id,fightSort", "userId = ?", [userId], cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            heroList = gamePlayer.heroListData;

        // if (!c_vip[userData.vip].buzhen) {
        //     var openCon = c_open.fightList.lvlRequired;
        //     if (userData.lvl < openCon) return cb(getMsg(c_msgCode.functionOpen, userData.lvl, userData.vip));
        // }

        var returnArr = [];
        async.map(heroList, function(heroData, cb1) {
            var index = fightArr.indexOf(heroData.id);
            if (index != -1) {
                heroData.fightSort = index;
                // heroDao.update(client, { fightSort: index }, { id: heroData.id }, cb1);
                var upHeroData = {
                    id: heroData.id,
                    fightSort: heroData.fightSort
                };
                gamePlayer.setHeroDataDirty(heroData.id);
                returnArr.push(upHeroData);
                cb1();
            } else {
                async.setImmediate(function() {
                    cb1();
                });
            }
        }, function(err, data) {
            if (err) return cb(err);
            cb(null, returnArr);
        });
    });
};

//开启自动注入
exports.autoInfuseSwitch = function(client, userId, isOpenIn, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            //userDao.selectCols(client, "id,vip,isOpenIn,rebirthLvl", " id = ? ", [userId], cb1);
            g_cache.getGamePlayer(client, userId, cb1);
            // },
            // function(cb1) {
            //     heroDao.listCols(client, "id,tempId", "userId = ?", [userId], cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData;
        var heroList = gamePlayer.heroListData;

        if (heroList.length < 3) return cb(getMsg(c_msgCode.careerNotOpen));
        var needRebirthLvl = c_game.fourRole[1];
        var needRebirthLvl1 = c_game.fourRole[11];
        if (userData.rebirthLvl < needRebirthLvl) { //不足二转
            if (userData.rebirthLvl < needRebirthLvl1) return cb(getMsg(c_msgCode.teamRankLvlUnenough)); //小队评级等级不足
            //if (!c_vip[userData.vip].openRole4) return cb("vip等级不足");
        }

        if (isOpenIn) {
            userData.isOpenIn = 1;
        } else {
            userData.isOpenIn = 0;
        }
        for (var i = 0; i < heroList.length; i++) {
            var locHero = heroList[i];
            var tempId2Job = Number.tempId2Job(locHero.tempId);
            if (tempId2Job == c_prop.heroJobKey.ys) userData.isOpenIn = 0; //预防
        }

        var updateData = {
            isOpenIn: userData.isOpenIn
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        // userDao.update(client, updateData, { id: userId }, function(err, data) {
        //     if (err) return cb(err);
        return cb(null, updateData);
        //});
    });
};

//额外注入
exports.extraInfuse = function(client, userId, type, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            demonLotusDao.select(client, { userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            demonLotusData = data[1];

        var needRebirthLvl = c_game.fourRole[1];
        var needRebirthLvl1 = c_game.fourRole[11];
        if (userData.rebirthLvl < needRebirthLvl) { //不足二转
            if (userData.rebirthLvl < needRebirthLvl1) return cb(getMsg(c_msgCode.teamRankLvlUnenough)); //小队评级等级不足
            // if (!c_vip[userData.vip].openRole4) return cb("vip等级不足");
        }

        var needInfuseExpc = c_game.fourRole[2];
        if (userData.infuseExpc >= needInfuseExpc) return cb(getMsg(c_msgCode.roleLvlEnough)); //角色开启所需经验数量已足够

        var startEnd = [];
        var critPro = 0;
        var multiple = 0;
        var cosDiamond = 0;
        var isCrit = false;
        var genuineQiArrs = [];
        var fourRole = c_game.fourRole;
        if (type == c_prop.extraInfuseTypeKey.genuineQi) {
            var cosGenqi = fourRole[3]; //注入真气消耗
            var genuineQiArr = userUtils.calGenuineQi(userData, demonLotusData);
            if (genuineQiArr[0] < cosGenqi) return cb(getMsg(c_msgCode.noGas));
            var oldGenuineQi = genuineQiArr[0];
            startEnd = fourRole[6].split(","); //转化进度
            critPro = fourRole[4]; //暴击倍率（百分比）
            multiple = fourRole[5]; //暴击倍数
            //计算真气
            userUtils.addGenuineQi(userData, -cosGenqi);
            genuineQiArrs = [userData.genuineQi];

        } else if (type == c_prop.extraInfuseTypeKey.diamond) {
            cosDiamond = fourRole[7]; //注入真气消耗
            if (userData.diamond < cosDiamond || cosDiamond < 0) return cb(getMsg(c_msgCode.noDiamond));
            startEnd = fourRole[10].split(","); //转化进度
            critPro = fourRole[8]; //暴击倍率（百分比）
            multiple = fourRole[9]; //暴击倍数
            //计算元宝
            userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, cosDiamond, c_prop.diamondCostTypeKey.fourRole);
        } else {
            return cb(getMsg(c_msgCode.abnormalData)); //数据异常");
        }

        //计算注入经验
        var getExpc = _getRandomNumber(parseInt(startEnd[0]), parseInt(startEnd[1]));
        var randomNum = _getRandomNumber(1, 100);
        if (randomNum <= critPro) {
            getExpc = getExpc * multiple;
            isCrit = true;
        }
        userData.infuseExpc += getExpc;
        if (userData.infuseExpc < 0) userData.infuseExpc = 0;

        //更新
        var upUserData = {
            diamond: userData.diamond,
            giveDiamond: userData.giveDiamond,
            buyDiamond: userData.buyDiamond,
            genuineQi: userData.genuineQi,
            infuseExpc: userData.infuseExpc,
            exData: userData.exData
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        cb(null, [upUserData, genuineQiArrs, isCrit, getExpc, cosDiamond]);
    });
};

/**
 * 创建一个新英雄
 * @param client
 * @param userData
 * @param tempId
 * @param sex
 * @param cb
 */
exports.createByTempId = function(client, userData, tempId, sex, count, cb) {
    checkRequire();
    var userId = userData.id;
    var nowLvl = userData.lvl;
    heroDao.select(client, { tempId: tempId, userId: userId }, function(err, data) {
        if (err) return cb(err);
        if (data) return cb(null, data);
        var skillLvlArr = [];
        var tempId2Job = Number.tempId2Job(tempId);
        if (tempId2Job == c_prop.heroJobKey.ys) skillLvlArr = [nowLvl, nowLvl, nowLvl, nowLvl, nowLvl];
        var hero = new HeroEntity();
        /** 用户id **/
        hero.userId = userId;
        /*用户id*/
        /** 模板id **/
        hero.tempId = tempId;
        /*模板id*/
        /** 强化 **/
        hero.intensifyArr = [];
        /*强化[等级,等级,...] 下标对应装备位置*/
        /** 星级 **/
        hero.starArr = [];
        /*星级[星级,星级,...] 下标对应装备位置*/
        /** 宝石 **/
        hero.gemArr = [];
        /*宝石[id,id,id,...]下标对应装备位置*/
        /** 翅膀 **/
        hero.wingArr = [];
        /*翅膀[id,等级,星级,当前星经验]*/
        /** 装备数据 **/
        hero.equipData = {};
        /*{&quot;部位&quot;:物品id,....}*/
        /** 技能等级组 **/
        hero.skillLvlArr = skillLvlArr;
        /*[技能1等级,技能2等级...]*/
        /** 境界符文组 **/
        hero.realmArr = [];
        /*境界符文组  [0,1,2,3,4,5]*/
        //var userData = {id:userId,lvl:userData.lvl,equipBag:userData.equipBag,rebirthLvl:userData.rebirthLvl,medalData:userData.medalData,propertyData:userData.propertyData};
        hero.propArr = heroPropHelper.calHeroProp(userData, hero);
        hero.combat = heroPropHelper.calCombat(userData, hero);
        hero.fightSort = count;
        hero.holyArr = [];
        /*神圣属性[徽章等级,徽章当前经验,法典等级,法典当前经验]*/
        hero.sex = sex;
        hero.refineArr = [];
        hero.starTopArr = [];
        hero.talismanData = {};
        hero.talismanFg = {};
        heroDao.insert(client, hero, function(err, data) {
            if (err) return cb(err);
            hero.id = data.insertId;
            cb(null, hero);
        });
    });

};

/**
 * 获取主角色外观显示
 * @param client
 * @param userId
 * @param cb
 */
exports.getMainHeroDisplay = function(client, userId, cb) {
    checkRequire();
    var reData = [];
    // userDao.selectCols(client, "id,lvl,equipBag,robotId,isKing,rebirthLvl,medalData,propertyData,buff,achieveLvl,cybLvl,jxLvl,heroData", " id = ? ", [userId], function(err, userData) {
    g_cache.getGamePlayer_UserData(client, userId, function(err, gamePlayerData) {
        if (err) return cb(err);
        var userData = gamePlayerData[0].userData;
        if (!userData) return cb(null, reData);
        exports.getMainHeroDisplayByUserData(client, userData, cb);
    });

};

/**
 * 获取主角色外观显示
 * @param client
 * @param userData  "id,lvl,equipBag,robotId"
 * @param cb
 */
exports.getMainHeroDisplayByUserData = function(client, userData, cb) {
    heroDao.select(client, " userId = ? order by id asc", [userData.id], function(err, hero) {
        if (err) return cb(err);
        var reData = [];
        if (!hero) return cb(null, reData);
        hero.propArr = heroPropHelper.calHeroProp(userData, hero);
        hero.combat = heroPropHelper.calCombat(userData, hero);
        if (userData.robotId == 0) {
            //计算装备显示id
            reData[0] = _getClothDisplayID(userData, hero);
            //计算武器显示id
            reData[1] = _getWeaponDisplayID(userData, hero);
            //计算翅膀
            reData[2] = _getWingDisplayID(userData, hero);
            //性别
            reData[3] = hero.sex;
        } else {
            var t_robotData = t_robot[userData.robotId];
            var locDisplayIds = t_robotData.displayIds[0];

            var t_clothData = t_itemEquip[locDisplayIds[1]];
            if (hero.sex == c_prop.sexKey.male) {
                reData[0] = t_clothData.displayID.split(",")[0];
            } else {
                reData[0] = t_clothData.displayID.split(",")[1];
            }
            var t_wuqiData = t_itemEquip[locDisplayIds[0]];
            reData[1] = t_wuqiData.displayID;
            var t_wingData = t_wing[locDisplayIds[2]];
            reData[2] = t_wingData.displayID;
        }

        reData[4] = userData.isKing;
        return cb(null, reData);
    });
};

/**
 * 获取主角色外观显示
 * @param client
 * @param userId
 * @param tempId
 * @param cb
 */
exports.getHeroDisplayByTempId = function(client, userId, tempId, cb) {
    checkRequire();
    var reData = [];
    //userDao.selectCols(client, "id,lvl,equipBag,robotId,isKing,rebirthLvl,medalData,propertyData,buff,achieveLvl,cybLvl,jxLvl,heroData", " id = ? ", [userId], function(err, userData) {
    g_cache.getGamePlayer_UserData(client, userId, function(err, gamePlayerData) {
        if (err) return cb(err);
        var userData = gamePlayerData[0].userData;
        if (!userData) return cb(null, reData);
        heroDao.list(client, " userId = ? and tempId = ? order by id asc", [userId, tempId], function(err, heroList) {
            if (err) return cb(err);
            var hero;
            var index = 0;
            for (var i = 0; i < heroList.length; i++) {
                var locHero = heroList[i];
                if (locHero.tempId == tempId) {
                    hero = locHero;
                    index = i;
                }
            }
            if (!hero) return cb(null, reData);
            if (userData.robotId == 0) {
                hero.propArr = heroPropHelper.calHeroProp(userData, hero);
                hero.combat = heroPropHelper.calCombat(userData, hero);
                //计算装备显示id
                reData[0] = _getClothDisplayID(userData, hero);
                //计算武器显示id
                reData[1] = _getWeaponDisplayID(userData, hero);
                //计算翅膀
                reData[2] = _getWingDisplayID(userData, hero);
                //性别
                reData[3] = hero.sex;

            } else {
                var t_robotData = t_robot[userData.robotId];
                var locDisplayIds = t_robotData.displayIds[index];

                var t_clothData = t_itemEquip[locDisplayIds[1]];
                if (hero.sex == c_prop.sexKey.male) {
                    reData[0] = t_clothData.displayID.split(",")[0];
                } else {
                    reData[0] = t_clothData.displayID.split(",")[1];
                }
                var t_wuqiData = t_itemEquip[locDisplayIds[0]];
                reData[1] = t_wuqiData.displayID;
                var t_wingData = t_wing[locDisplayIds[2]];
                reData[2] = t_wingData.displayID;
            }
            reData[4] = userData.isKing;
            return cb(null, reData);
        });
    });

};

/**
 * 获取战斗英雄
 * @param client
 * @param userData
 * @param cb
 */
exports.getPkList = function(client, userData, cb) {
    checkRequire();
    // logger.error("heroPropHelper.js getPkList ", userData.id);
    heroDao.list(client, " userId = ? order by fightSort asc", [userData.id], function(err, heroList) {
        if (err) return cb(err);
        var heroOtherArr = [];
        for (var i = 0; i < heroList.length; i++) {
            var locHero = heroList[i];
            var locOther = []; //[衣服显示id,武器显示id,翅膀显示id]
            if (userData.robotId == 0) {

                locHero.propArr = heroPropHelper.calHeroProp(userData, locHero);
                locHero.combat = heroPropHelper.calCombat(userData, locHero);
                //计算装备显示id
                locOther[0] = _getClothDisplayID(userData, locHero);
                //计算武器显示id
                locOther[1] = _getWeaponDisplayID(userData, locHero);
                //计算翅膀
                locOther[2] = _getWingDisplayID(userData, locHero);
            } else {
                var t_robotData = t_robot[userData.robotId];
                var locDisplayIds = t_robotData.displayIds[i];

                var t_clothData = t_itemEquip[locDisplayIds[1]];
                if (locHero.sex == c_prop.sexKey.male) {
                    locOther[0] = t_clothData.displayID.split(",")[0];
                } else {
                    locOther[0] = t_clothData.displayID.split(",")[1];
                }
                var t_wuqiData = t_itemEquip[locDisplayIds[0]];
                locOther[1] = t_wuqiData.displayID;
                var t_wingData = t_wing[locDisplayIds[2]];
                locOther[2] = t_wingData.displayID;
            }
            heroOtherArr.push(locOther);
        }
        var fightData = [userData.lvl, userData.equipBag, userData.nickName, userData.isKing, userData.blueDiamond, userData.rebirthLvl, userData.medalTitle, userData.propertyData, userData.cup, userData.achieveLvl, userData.noble, userData.iconId, userData.buff, userData.magicLvl];
        //[lvl,equipBag,nickName,isKing, bluediamond, rebirthLvl,medalTitle]
        cb(null, [heroList, heroOtherArr, fightData]);
    });
};

/**
 * 获取战斗英雄2 (按队列顺序)
 * @param client
 * @param userData
 * @param cb
 */
// exports.getPkList2 = function(client, userData, cb) {
//     checkRequire();
//     // logger.error("heroPropHelper.js getPkList ", userData.id);
//     heroDao.list(client, " userId = ? order by fightSort asc", [userData.id], function(err, heroList) {
//         if (err) return cb(err);
//         var heroOtherArr = [];
//         for (var i = 0; i < heroList.length; i++) {
//             var locHero = heroList[i];
//             var locOther = []; //[衣服显示id,武器显示id,翅膀显示id]
//             if (userData.robotId == 0) {

//                 locHero.propArr = heroPropHelper.calHeroProp(userData, locHero);
//                 locHero.combat = heroPropHelper.calCombat(userData, locHero);
//                 //计算装备显示id
//                 locOther[0] = _getClothDisplayID(userData, locHero);
//                 //计算武器显示id
//                 locOther[1] = _getWeaponDisplayID(userData, locHero);
//                 //计算翅膀
//                 locOther[2] = _getWingDisplayID(userData, locHero);
//             } else {
//                 var t_robotData = t_robot[userData.robotId];
//                 var locDisplayIds = t_robotData.displayIds[i];

//                 var t_clothData = t_itemEquip[locDisplayIds[1]];
//                 if (locHero.sex == c_prop.sexKey.male) {
//                     locOther[0] = t_clothData.displayID.split(",")[0];
//                 } else {
//                     locOther[0] = t_clothData.displayID.split(",")[1];
//                 }
//                 var t_wuqiData = t_itemEquip[locDisplayIds[0]];
//                 locOther[1] = t_wuqiData.displayID;
//                 var t_wingData = t_wing[locDisplayIds[2]];
//                 locOther[2] = t_wingData.displayID;
//             }
//             heroOtherArr.push(locOther);
//         }
//         var fightData = [userData.lvl, userData.equipBag, userData.nickName, userData.isKing, userData.blueDiamond, userData.rebirthLvl, userData.medalTitle, userData.propertyData, userData.cup];
//         //[lvl,equipBag,nickName,isKing, bluediamond, rebirthLvl,medalTitle]
//         cb(null, [heroList, heroOtherArr, fightData]);
//     });
// };

//获取英雄显示
exports.getShowHeroData = function(client, userId, cb) {
    checkRequire();
    //userDao.selectCols(client, "id,robotId,lvl,equipBag,nickName,isKing, blueDiamond, rebirthLvl,medalData,medalExData,medalDoneData,buff,medalTitle,propertyData,achieveLvl,cybLvl,jxLvl,heroData", " id = ? ", [userId], function(err, userData) {
    g_cache.getGamePlayer_UserData(client, userId, function(err, gamePlayerData) {
        if (err) return cb(err);
        var userData = gamePlayerData[0].userData;
        exports.getPkList(client, userData, function(err, data) {
            if (err) return cb(err);
            cb(null, data);
        });
    });
};

/**
 * 计算属性和战力
 * @param client
 * @param userId
 * @param cb
 */
exports.calPropAndCombat = function(client, userId, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            //userDao.selectCols(client, "id,lvl,equipBag,isKing,rebirthLvl,medalData,propertyData,buff,achieveLvl,cybLvl,jxLvl,heroData", "id = ?", [userId], cb1);
            g_cache.getGamePlayer(client, userId, cb1);
            // },
            // function(cb1) {
            //     heroDao.list(client, { userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            heroList = gamePlayer.heroListData;
        for (var i = 0; i < heroList.length; i++) {
            var locHero = heroList[i];
            locHero.propArr = heroPropHelper.calHeroProp(userData, locHero);
            locHero.combat = heroPropHelper.calCombat(userData, locHero);
            gamePlayer.setHeroDataDirty(locHero.id);
        }

        cb(null, heroList);
        // async.map(heroList, function(heroData, cb1) {
        //     heroDao.update(client, { propArr: heroData.propArr, combat: heroData.combat }, { id: heroData.id }, cb1);
        // }, function(err, data) {
        //     if (err) return cb(err);
        //     cb(null, heroList);
        // });
    });
};

/**
 * 重新计算并且获取英雄列表
 * @param client
 * @param userData
 * @param cb
 */
exports.calAndGetHeroListNotUpdate = function(client, userData, cb) {
    checkRequire();
    heroDao.list(client, { userId: userData.id }, function(err, heroList) {
        if (err) return cb(err);
        for (var i = 0; i < heroList.length; i++) {
            var locHero = heroList[i];
            locHero.propArr = heroPropHelper.calHeroProp(userData, locHero);
            locHero.combat = heroPropHelper.calCombat(userData, locHero);
        }
        cb(null, heroList);
    });
};

// 重新算战力
exports.recomputeHeroPropCombat = function(gamePlayer) {
    var userData = gamePlayer.userData;
    var heroList = gamePlayer.heroListData;

    // checkRequire();
    // heroDao.list(client, { userId: userData.id }, function(err, heroList) {
    //if (err) return cb(err);
    for (var i = 0; i < heroList.length; i++) {
        var locHero = heroList[i];
        locHero.propArr = heroPropHelper.calHeroProp(userData, locHero);
        locHero.combat = heroPropHelper.calCombat(userData, locHero);
    }
    //cb(null, heroList);
    //});
};

/**
 * 重新计算并且获取英雄列表
 * @param client
 * @param userData
 * @param cb
 */
exports.calAndGetHeroList = function(client, userData, cb) {
    checkRequire();
    heroDao.list(client, { userId: userData.id }, function(err, heroList) {
        if (err) return cb(err);
        var allCombatArr = [];
        for (var i = 0; i < heroList.length; i++) {
            var locHero = heroList[i];
            locHero.propArr = heroPropHelper.calHeroProp(userData, locHero);
            locHero.combat = heroPropHelper.calCombat(userData, locHero);
            allCombatArr.push(locHero.combat);

            //判断装备丢失
            var equipData = locHero.equipData;
            if (equipData) {
                for (var key in equipData) {
                    /*
                                        heroEquipIndexKey : {weapon:0,clothes:1,bracelet1:2,ring1:3,paralysisRing:4,reviveRing:5,protectRing:6,harmRing:7,ring2:8,bracelet2:9,helmet:10,necklace:11},
                                        heroEquipIndex : {"0":'武器',"1":'衣服',"2":'手镯1',"3":'戒指1',"4":'麻痹戒指',"5":'复活戒指',"6":'护身戒指',"7":'伤害戒指',"8":'戒指2',"9":'手镯2',"10":'头盔',"11":'项链'},
                    */
                    if (key == c_prop.heroEquipIndexKey.weapon ||
                        key == c_prop.heroEquipIndexKey.clothes ||
                        key == c_prop.heroEquipIndexKey.bracelet1 ||
                        key == c_prop.heroEquipIndexKey.ring1 ||
                        key == c_prop.heroEquipIndexKey.ring2 ||
                        key == c_prop.heroEquipIndexKey.bracelet2 ||
                        key == c_prop.heroEquipIndexKey.helmet ||
                        key == c_prop.heroEquipIndexKey.necklace
                    ) {
                        var uid = equipData[key];
                        if (!userData.equipBag[uid]) {
                            delete equipData[key];
                            var missNum = userData.exData[c_prop.userExDataKey.missEquip] || 0;
                            userData.exData[c_prop.userExDataKey.missEquip] = missNum + 1;
                        }
                    }

                }
            }
        }


        async.map(heroList, function(heroData, cb1) {
            heroDao.update(client, {
                propArr: heroData.propArr,
                combat: heroData.combat,
                equipData: heroData.equipData
            }, { id: heroData.id }, cb1);
        }, function(err, data) {
            if (err) return cb(err);
            cb(null, heroList);
        });
    });
};

/**
 * 通过tempId(iconId) 重新计算并且获取英雄
 * @param client
 * @param userData
 * @param cb
 */
exports.calAndGetHero = function(client, userData, tempId, cb) {
    checkRequire();
    heroDao.list(client, { userId: userData.id }, function(err, heroList) {
        if (err) return cb(err);
        var retHeroData = null;
        var zsheroData = null;
        for (var i = 0; i < heroList.length; i++) {
            var locHero = heroList[i];
            if (Number.tempId2Job(locHero.tempId) == 1) { //战士的英雄数据
                zsheroData = heroList[i];
            }

            if (Number.tempId2Job(locHero.tempId) == Number.tempId2Job(tempId)) {
                retHeroData = heroList[i];
                retHeroData.tempId = tempId; // 替换成icon的皮肤
                // locHero.propArr = heroPropHelper.calHeroProp(userData, locHero);
                // locHero.combat = heroPropHelper.calCombat(userData, locHero);

            }
        }
        if (retHeroData) {
            var clientNeedEquipBag = userUtils.getClientNeedEquipBag(userData, zsheroData);
            var fightData = [userData.lvl, clientNeedEquipBag, userData.nickName, userData.isKing, userData.blueDiamond, userData.rebirthLvl, userData.medalTitle, userData.propertyData, userData.cup, userData.achieveLvl, userData.noble, userData.iconId, userData.buff, userData.magicLvl];
            return cb(null, [retHeroData, fightData]);
        }

        //logger.debug("calAndGetHero: userId:%d, tempId:%d", userData.id, tempId);
        return cb(null, null);
    });
};

/**
 * 神圣激活
 * @param client
 * @param userId
 * @param tempId
 * @param idx
 * @param cb
 */
exports.holyActivate = function(client, userId, tempId, idx, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            //userDao.select(client, { id: userId }, cb1);
            g_cache.getGamePlayer(client, userId, cb1);
            // },
            // function(cb1) {
            //     heroDao.select(client, { tempId: tempId, userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        heroData.holyArr = heroData.holyArr || [0, 0, 0, 0];
        var holyArr = heroData.holyArr;
        var holyArrIdx = -1;
        if (idx == 0) holyArrIdx = 0;
        else if (idx == 1) holyArrIdx = 2;
        else return cb(getMsg(c_msgCode.paramsError)); //参数错误!
        if (holyArr[holyArrIdx]) return cb(getMsg(c_msgCode.isActivate)); //已激活

        heroData.holyArr[holyArrIdx] = 1;
        heroData.holyArr[holyArrIdx + 1] = 0;

        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        //更新
        var upHeroData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            holyArr: heroData.holyArr
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        // heroDao.update(client, upHeroData, { id: heroData.id }, function(err, data) {
        //     if (err) return cb(err);
        cb(null, upHeroData);
        //});
    });
};

/**
 * 神圣培养
 * @param client
 * @param userId
 * @param tempId
 * @param idx
 * @param itemId
 * @param itemNum
 * @param cb
 */
exports.holyFos = function(client, userId, tempId, idx, items, cb) {
    checkRequire();
    var tempId2Job = Number.tempId2Job(tempId);
    //if (tempId2Job == c_prop.heroJobKey.ys) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    async.parallel([
        function(cb1) {
            //userDao.select(client, { id: userId }, cb1);
            g_cache.getGamePlayer(client, userId, cb1);
            // },
            // function(cb1) {
            //     heroDao.select(client, { tempId: tempId, userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        if (!userData.bag) userData.bag = {};

        var holyArr = heroData.holyArr;
        var holyArrIdx = -1;
        if (idx == 0) holyArrIdx = 0;
        else if (idx == 1) holyArrIdx = 2;
        else return cb(getMsg(c_msgCode.paramsError)); //参数错误!
        if (!holyArr[holyArrIdx]) return cb(getMsg(c_msgCode.noActivate)); //未激活

        var holyLvl = holyArr[holyArrIdx];
        var nextLvl = holyLvl + 1;
        if (t_holyStrength[holyLvl].badgeExp == 0 || !t_holyStrength[nextLvl]) {
            return cb(getMsg(c_msgCode.lvMax)); //已满级
        }


        // 消耗物品  
        var itemExp = 0;
        var itemExpMap = {};
        var holyCostArr = c_game.holyEquip[5 + idx].split(",");
        for (var i = 0; i < holyCostArr.length; i++) {
            var tmpCost = holyCostArr[i].split(":");
            // if (parseInt(tmpCost[0]) == itemId){
            //     itemExp = parseInt(tmpCost[1]);
            //     break;
            // }
            itemExpMap[tmpCost[0]] = parseInt(tmpCost[1]);
        }

        for (var itId in items) {
            var num = userData.bag[itId] || 0;
            var itemNum = parseInt(items[itId]);
            if (num < itemNum) {
                return cb("材料不够");
            }

            itemExp += itemExpMap[itId] * itemNum;
        }

        if (itemExp == 0) {
            return cb(getMsg(c_msgCode.trainWrong)); //培养材料不对
        }
        // var num = userData.bag[itemId] || 0;
        // if ( num < itemNum){
        //     return cb("材料不够");
        // }

        var delBagItems = items;
        userUtils.delBag(userData, items, c_prop.itemCostTypeKey.wing);

        //console.log("holyFos: ", itemExp, heroData.holyArr);
        var bLvup = false;
        var holyExp = holyArr[holyArrIdx + 1] || 0;
        holyExp = holyExp + itemExp;
        while (true) {
            var holyStrengthData = t_holyStrength[holyLvl];
            if (!holyStrengthData) break;
            var needExp = holyStrengthData.badgeExp || 0;
            if (holyArrIdx == 2) {
                needExp = holyStrengthData.codeExp || 0;
            }

            nextLvl = holyLvl + 1; // 已满级
            if (needExp == 0 || !t_holyStrength[nextLvl]) {
                break;
            }

            if (holyExp >= needExp) {
                holyExp = holyExp - needExp;
                holyLvl++;
                //console.log("holyFos lvl: ", holyLvl, holyExp);
                bLvup = true;
            } else {
                break;
            }
        }

        holyArr[holyArrIdx] = holyLvl;
        holyArr[holyArrIdx + 1] = holyExp;
        heroData.holyArr = holyArr;

        if (bLvup) {
            heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
            heroData.combat = heroPropHelper.calCombat(userData, heroData);
        }

        //更新
        var upUserData = {};
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(delBagItems));
        var upHeroData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            holyArr: heroData.holyArr,
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        cb(null, [upUserData, upHeroData, delBagItems]);
    });
};

/**
 * 英雄任务激活
 * @param userId
 * @param heroId(配置文件id)
 */
exports.activeHeroTask = function(userId, heroId) {
    if (!t_hero[heroId]) return;
    g_cache.getGamePlayer(null, userId, function(err, gamePlayer) {
        if (err) return;
        let taskData = gamePlayer.taskData;
        taskData.heroTasks = taskData.heroTasks || {};
        let heroTasks = taskData.heroTasks;
        if (heroTasks[heroId]) return;
        let heroTaskId = t_heroTaskFrstHelp[heroId] || 0;
        if (heroTaskId === 0) return;
        //先计算其他英雄任务条件，本次激活的英雄，初始化时会赋值
        exports.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.heroNum, 1);
        exports.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.initHero, heroId);
        _checkAndActiveTask(gamePlayer, heroTasks, heroId, heroTaskId, 0, function() {
            gamePlayer.setTaskDataDirty();
        });
    })
};

//{heroId:[[heroTaskId, currentValue, state]...]}
var _checkAndActiveTask = function(gamePlayer, heroTasks, heroId, heroTaskId, index, cb) {
    let t_heroTaskData = t_heroTask[heroTaskId];
    if (!t_heroTaskData || t_heroTaskData.heroId != heroId) return cb();
    heroTasks[heroId] = heroTasks[heroId] || [];
    if (!_needInitHeroTask(t_heroTaskData.type, index, heroTasks[heroId])) return cb();
    if (heroTasks[heroId][index]) return cb();

    _getInitValueByHeroTaskId(gamePlayer, heroTaskId, function(value) {
        heroTasks[heroId][index] = heroTasks[heroId][index] || [];
        heroTasks[heroId][index][0] = heroTaskId;
        heroTasks[heroId][index][1] = value;
        heroTasks[heroId][index][2] = _checkAndGetState(heroTasks[heroId][index], t_heroTaskData);
        _checkAndActiveTask(gamePlayer, heroTasks, heroId, heroTaskId + 1, index + 1, cb);
    });
};

var _checkAndGetState = function(heroTaskData, t_heroTaskData) {
    switch (t_heroTaskData.type) {
        case c_prop.cHeroTaskKey.areaRank:
            return (heroTaskData[1] != 0 && heroTaskData[1] <= t_heroTaskData.target) ? 1 : 0;
        default:
            return heroTaskData[1] >= t_heroTaskData.target ? 1 : 0;
    }
};

var _needInitHeroTask = function(type, index, heroTaskInfo) {
    if (index === 0) {
        return true;
    }
    let lastTask = heroTaskInfo[index - 1];
    if (lastTask && lastTask[2] !== 0) {
        return true;
    }
    //B类任务需要预先初始化
    switch (type) {
        case c_prop.cHeroTaskKey.heroNum:
        case c_prop.cHeroTaskKey.normalBoss:
        case c_prop.cHeroTaskKey.medalNum:
        case c_prop.cHeroTaskKey.equipRefineNum:
        case c_prop.cHeroTaskKey.heroStar:
        case c_prop.cHeroTaskKey.rebirthLvl:
        case c_prop.cHeroTaskKey.initHero:
        case c_prop.cHeroTaskKey.petNumbers:
        case c_prop.cHeroTaskKey.abyssEquip:
        case c_prop.cHeroTaskKey.areaRank:
            return true;
    }
    return false;
};

var _getInitValueByHeroTaskId = function(gamePlayer, heroTaskId, cb) {
    let userData = gamePlayer.userData,
        heroList = gamePlayer.heroListData;
    let heroData = userData.heroData || {};
    let heroTaskData = t_heroTask[heroTaskId];
    let value = 0;
    let uwClient = require("uw-db").uwClient;
    let waitCallBack = false;
    switch (heroTaskData.type) {
        case c_prop.cHeroTaskKey.heroNum:
            value = userData.heroNum || 0;
            break;
        case c_prop.cHeroTaskKey.normalBoss:
            waitCallBack = true;
            let copyBiz = require("uw-copy").copyBiz;
            copyBiz.getInfo(uwClient, userData.id, c_prop.copyTypeKey.normal, function(err, copyProgressData) {
                if (err) return cb(value);
                if (!copyProgressData || !copyProgressData.copyObj) return cb(value);
                let copyArr = Object.keys(copyProgressData.copyObj);
                value = copyArr.length;
                return cb(value);
            });
            break;
        case c_prop.cHeroTaskKey.medalNum || 0:
            value = userData.medalNum;
            break;
        case c_prop.cHeroTaskKey.equipRefineNum:
            for (let i = 0; i < heroList.length; i++) {
                let refineArr = heroList[i].refineArr || [];
                for (let j = 0; j < refineArr.length; j++) {
                    value += refineArr[j] || 0;
                }
            }
            break;
        case c_prop.cHeroTaskKey.heroStar:
            let targetHeroData = heroData[heroTaskData.heroId];
            if (targetHeroData) {
                value = targetHeroData[2] || 0;
            }
            break;
        case c_prop.cHeroTaskKey.rebirthLvl:
            value = userData.rebirthLvl || 0;
            break;
        case c_prop.cHeroTaskKey.initHero:
            if (heroData[heroTaskData.target]) {
                value = heroTaskData.target;
            }
            break;
        case c_prop.cHeroTaskKey.petNumbers:
            for (let i = 0; i < heroList.length; i++) {
                value += heroList[i].talismanNum;
            }
            break;
        case c_prop.cHeroTaskKey.abyssEquip:
            for (let i = 0; i < heroList.length; i++) {
                let equipData = heroList[i].equipData || {};
                for (let j = c_prop.heroEquipIndexKey.sword; j <= c_prop.heroEquipIndexKey.belt; j++) {
                    if (equipData[j]) {
                        let tmpId = userData.equipBag[equipData[j]][0];
                        value += t_item[tmpId].itemLvl || 0;
                    }
                }
            }
            break;
        case c_prop.cHeroTaskKey.areaRank:
            waitCallBack = true;
            arenaBiz.selectArena(uwClient, userData.id, function(err, arenaData) {
                if (err) return cb(value);
                value = arenaData.highRank;
                return cb(value);
            });
            break;
    }
    if (!waitCallBack) return cb(value);
};

/**
 * 英雄任务检测
 * @param userId
 * @param targetType
 * @param value
 */
exports.checkAndUpdateHeroTask = function(userId, targetType, value) {
    if (!t_heroTaskTypeHelp[targetType]) return;
    g_cache.getGamePlayer(null, userId, function(err, gamePlayer) {
        if (err) return;
        let taskData = gamePlayer.taskData;
        let heroTasks = taskData.heroTasks || {};
        let heroIds = t_heroTaskTypeHelp[targetType] || [];
        let changed = false;
        for (let i = 0; i < heroIds.length; i++) {
            let heroTaskInfo = heroTasks[heroIds[i]];
            if (!heroTaskInfo) {
                continue;
            }
            let heroChanged = _checkAndUpdateHeroTask(gamePlayer, heroTasks, heroTaskInfo, targetType, value);
            if (!changed && heroChanged) {
                changed = true;
            }
        }
        if (changed) {
            gamePlayer.setTaskDataDirty();
        }
    })
};

var _checkAndUpdateHeroTask = function(gamePlayer, heroTasks, heroTaskInfo, targetType, value) {
    let changed = false;
    for (let i = 0; i < heroTaskInfo.length; i++) {
        if (heroTaskInfo[i][2] !== 0) {
            continue;
        }
        let t_heroTaskData = t_heroTask[heroTaskInfo[i][0]];
        let type = t_heroTaskData.type;
        if (type !== targetType) {
            continue;
        }
        switch (type) {
            case c_prop.cHeroTaskKey.initHero:
            case c_prop.cHeroTaskKey.areaRank:
            case c_prop.cHeroTaskKey.heroStar:
                heroTaskInfo[i][1] = value;
                break;
            case c_prop.cHeroTaskKey.pkWinHigh:
                if (value === 0) {
                    heroTaskInfo[i][1] = 0;
                } else {
                    heroTaskInfo[i][1] += value;
                }
                break;
            default:
                heroTaskInfo[i][1] += value;
                break;
        }
        changed = true;
        let state = _checkAndGetState(heroTaskInfo[i], t_heroTaskData);
        if (state > 0) {
            heroTaskInfo[i][2] = state;
            userUtils.checkHeroEntranceTask(gamePlayer, c_game.heroTask[0], 1);
            _checkAndActiveTask(gamePlayer, heroTasks, t_heroTaskData.heroId, t_heroTaskData.id + 1, i + 1, function() {
                gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
            });
        }
    }
    return changed;
};

/**
 * 领取英雄传记任务
 * @param uwClient
 * @param userId
 * @param tempId
 * @param index
 * @param cb
 * @returns {*}
 */
exports.receiveHeroTask = function(uwClient, userId, tempId, index, cb) {
    if (!t_hero[tempId] || index < 0) return cb(getMsg(c_msgCode.protocolError));
    g_cache.getGamePlayer(uwClient, userId, function(err, gamePlayer) {
        if (err) return cb(getMsg(c_msgCode.protocolError));
        let taskData = gamePlayer.taskData;
        let heroTasks = taskData.heroTasks || {};
        if (!heroTasks[tempId]) return cb(getMsg(c_msgCode.protocolError, "tempId"));
        let heroTaskInfo = heroTasks[tempId];
        if (!heroTaskInfo[index]) return cb(getMsg(c_msgCode.protocolError, "index"));
        if (heroTaskInfo[index][2] !== 1) return cb(getMsg(c_msgCode.protocolError, "state"));
        let t_heroTaskData = t_heroTask[heroTaskInfo[index][0]];
        heroTaskInfo[index][2] = 2;
        gamePlayer.setTaskDataDirty();

        let bagItems = {};
        let itemsArr = userUtils.saveItems(gamePlayer.userData, t_heroTaskData.reward, c_prop.itemGetTypeKey.other);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);

        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);

        cb(null, [taskData, bagItems]);
    })
};

//伙伴战力更新
exports.updatePartnerCombat = function(client, userId, heroId, combat, cb) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        var heroData = gamePlayer.getHero(heroId);
        if (!heroData.partnerCombat) heroData.partnerCombat = 0;
        if (heroData.partnerCombat < combat) { // 保存最大值，客户端算的数字好像会变小，过滤掉
            heroData.partnerCombat = combat;
            gamePlayer.setHeroDataDirty(heroData.id);
        }
        return cb(null, null);
    })
};

//深渊装备战力更新
exports.updateHolyCombat = function(client, userId, heroId, combat, cb) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        var heroData = gamePlayer.getHero(heroId);
        if (!heroData.holyCombat) heroData.holyCombat = 0;
        if (heroData.holyCombat < combat) { // 保存最大值，不让其下降
            heroData.holyCombat = combat;
            gamePlayer.setHeroDataDirty(heroData.id);
        }
        return cb(null, null);
    })
};


//========================================================魔法学院========================================================
// 魔书加点 
exports.addMagicPoint = function(client, userId, heroId, bookType, cb) {
    checkRequire();
    //console.error("addMagicPoint====",userId, heroId, bookType);
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var heroData = gamePlayer.getHero(heroId);
        var magicBookData = heroData.magicBookData || {};
        if (!magicBookData[bookType]) magicBookData[bookType] = parseInt(bookType + '000');
        var curBookId = magicBookData[bookType];
        var needPoint = t_magicBook[curBookId].needPoint;
        var nextBookId = parseInt(magicBookData[bookType]) + 1;
        if (!t_magicBook[nextBookId] || t_magicBook[nextBookId].type != bookType) {
            return cb(getMsg(c_msgCode.magicBookMax)); //魔书已达最高等级！
        }

        var costPoint = 0; //已经用掉的点数
        for (var key in magicBookData) {
            var bookId = magicBookData[key];
            costPoint += parseInt(t_magicBook[bookId].usedPoint);
        }
        var magicLvl = userData.magicLvl || 0;
        var magicBookExtraPoint = heroData.magicBookExtraPoint || 0; //使用贤者之石增加的额外魔灵点数
        var havePoint = parseInt(t_magicLvl[magicLvl].mPropPoint) + magicBookExtraPoint; //魔灵点数上限
        var leftPoint = havePoint - costPoint;
        if (leftPoint <= 0 || leftPoint < needPoint) return cb(getMsg(c_msgCode.magicPointUnenough)); //魔灵点数不足; 
        //更新数据
        magicBookData[bookType] = nextBookId;

        heroData.magicBookData = magicBookData;
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        gamePlayer.setHeroDataDirty(heroId);

        var upHeroData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            magicBookData: heroData.magicBookData
        }
        //console.error("upHeroData====",upHeroData);
        cb(null, upHeroData);
    });
}

//重置魔灵点数
exports.resetMagicPoint = function(client, userId, heroId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var heroData = gamePlayer.getHero(heroId);
        // var magicBookData = heroData.magicBookData || {};
        var cosDiamond = 500;
        if (userData.diamond < cosDiamond) return cb(getMsg(c_msgCode.noDiamond)); //钻石不足; 
        // magicBookTypeKey : {power:1,physique:2,defense:3,luck:4,skill:5},
        var magicBookData = {};
        magicBookData[c_prop.magicBookTypeKey.power] = parseInt(c_prop.magicBookTypeKey.power + '000');
        magicBookData[c_prop.magicBookTypeKey.physique] = parseInt(c_prop.magicBookTypeKey.physique + '000');
        magicBookData[c_prop.magicBookTypeKey.defense] = parseInt(c_prop.magicBookTypeKey.defense + '000');
        magicBookData[c_prop.magicBookTypeKey.luck] = parseInt(c_prop.magicBookTypeKey.luck + '000');
        magicBookData[c_prop.magicBookTypeKey.skill] = parseInt(c_prop.magicBookTypeKey.skill + '000');

        heroData.magicBookData = magicBookData;
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        gamePlayer.setHeroDataDirty(heroId);
        var upHeroData = {
            id : heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            magicBookData: heroData.magicBookData
        }
        //更新 
        gamePlayer.setHeroDataDirty(heroData.id);

        //扣钻石
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, cosDiamond, c_prop.diamondCostTypeKey.resetMagicPoint);
        //更新
        var upUserData = {
            diamond: userData.diamond,
            giveDiamond: userData.giveDiamond,
            buyDiamond: userData.buyDiamond
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        cb(null, [upUserData, upHeroData]);
    });
}

// 魔书额外点数 
exports.addMagicExtraPoint = function(client, userId, heroId, count, cb) {
    checkRequire();
    //console.error("addMagicExtraPoint====",userId, heroId, count);
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        if (!userData.bag) userData.bag = {};
        var bag = userData.bag;
        var delBagItems = {};
        var heroData = gamePlayer.getHero(heroId);
        var magicBookExtraPoint = heroData.magicBookExtraPoint || 0;

        count = count || 1;
        var itemId = c_prop.spItemIdKey.magicExtraPoint;
        if (!bag[itemId] || bag[itemId] < count) return cb(getMsg(c_msgCode.noItem)); //物品不足
        //每个贤者之石增加10点魔灵点
        heroData.magicBookExtraPoint = magicBookExtraPoint + 10 * count;
        delBagItems[itemId] = count;
        userUtils.delBag(userData, itemId, count, c_prop.itemCostTypeKey.magicExtraPoint);

        //更新
        gamePlayer.setHeroDataDirty(heroId);
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(delBagItems));

        var upHeroData = {
            id : heroData.id,
            magicBookExtraPoint: heroData.magicBookExtraPoint
        }
        //console.error("upHeroData====",upHeroData);
        cb(null, [upHeroData, delBagItems]);
    });
}

/*****************************************************************************************************/

//获取武器显示id
var _getClothDisplayID = function(userData, heroData) {
    //判断衣服
    var tempID = _getEquipTempIdByPart(userData, heroData, c_prop.heroEquipIndexKey.clothes);
    var displayIDArr = [];

    if (tempID) {
        var t_itemEquipData = t_itemEquip[tempID];
        displayIDArr = t_itemEquipData.displayID.toString().split(",");
    } else {
        //如果没有则返回角色默认
        //self.tempId
        var t_heroData = t_hero[heroData.tempId];
        displayIDArr = t_heroData.displayID.toString().split(",");
    }

    if (heroData.sex == c_prop.sexKey.male) {
        return displayIDArr[0];
    } else {
        return displayIDArr[1];
    }
};

//获取武器显示id
var _getWeaponDisplayID = function(userData, heroData) {
    //判断衣服
    var tempID = _getEquipTempIdByPart(userData, heroData, c_prop.heroEquipIndexKey.weapon);
    var displayID = null;

    if (tempID) {
        var t_itemEquipData = t_itemEquip[tempID];
        displayID = t_itemEquipData.displayID;
    }
    return displayID;
};

//获取武器显示id
var _getWingDisplayID = function(userData, heroData) {
    var wingId = heroData.wingArr[0];
    var wingLvl = heroData.wingArr[1] || 0;
    var displayID = null;
    var t_wingData = t_wing[wingId];
    if (t_wingData && wingLvl > 0) {
        displayID = t_wingData.displayID;
    }
    return displayID;
};

//根据部位获得装备tempId，如果该部位没有装备则返回null
var _getEquipTempIdByPart = function(userData, heroData, part) {
    var equipId = heroData.equipData[part];
    if (!equipId) return null;
    var equipData = userData.equipBag[equipId];
    if (!equipData) return null;
    return equipData[0];
};

//输出指定范围内的随机数的随机整数
var _getRandomNumber = function(start, end) {
    var choice = end - start + 1;
    return Math.floor(Math.random() * choice + start);
};
/*
 *client
 * totaolGainExp
 * wing [wingStar, wingLvl,wingId, oldWingId]
 * wingShowArr
 * delBagItems
 * cost [costGold,costDiamond]
 * isCrit
 * userData
 * heroData
 * cb
 */
//
var _over = function(client, totalGainExp, wing, wingShowArr, delBagItems, cost, isCrit, gamePlayer, heroData, cb) {
    var userData = gamePlayer.userData;
    var wingExp = totalGainExp;
    var wingStar = wing[0];
    var wingLvl = wing[1];
    var wingId = wing[2];
    var oldWingId = wing[3];
    var costGold = cost[0];
    var costDiamond = cost[1];
    //wingStar += starLvl;
    if (wingStar >= 10) wingExp = 0;
    heroData.wingArr[0] = wingId;
    heroData.wingArr[1] = wingLvl;
    heroData.wingArr[2] = wingStar;
    heroData.wingArr[3] = wingExp;
    //heroData.wingArr = [wingId,wingLvl,wingStar,wingExp];
    heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
    heroData.combat = heroPropHelper.calCombat(userData, heroData);

    //推送系统消息(oldma)

    if (oldWingId != wingId) {
        //第一个%s：玩家名
        //第二个%s：翅膀名
        chatBiz.addSysData(8, [userData.nickName, t_wing[wingId].name, wingId]);
        chatBiz.addSysData(9, [userData.nickName, t_wing[wingId].name, wingId]);
    }

    chatBiz.addSysData(10, [userData.nickName, isCrit]);

    //更新
    var upUserData = {
        gold: userData.gold,
        diamond: userData.diamond,
        buyDiamond: userData.buyDiamond,
        giveDiamond: userData.giveDiamond
    };
    gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(delBagItems));
    var upHeroData = {
        propArr: heroData.propArr,
        combat: heroData.combat,
        wingArr: heroData.wingArr
    };
    gamePlayer.setHeroDataDirty(heroData.id);
    cb(null, [upUserData, upHeroData, delBagItems, wingShowArr[0], wingShowArr[1], costGold, costDiamond]);
}
//激活共鸣
// var _actHolyRes = function(userData, heroData, type, lastlevel, nowlevel) { //(2,1,2)表示激活两件共鸣，之前为一级共鸣，现在为二级共鸣

//     if (lastlevel == 0) { //之前未激活
//         var pulsattr = t_holyResonance[1]["resonance" + type][0][0]; //需要增加的属性id
//         var lastval = 0; //上次加的值
//     } else {
//         var pulsattr = t_holyResonance[lastlevel]["resonance" + type][0][0]; //需要增加的属性id
//         var lastval = t_holyResonance[lastlevel]["resonance" + type][0][1]; //上次加的值
//     }

//     var nowval = t_holyResonance[nowlevel]["resonance" + type][0][1];
//     var needplus = nowval - lastval; //需要补加的值
//     console.error("nowval:", nowval);
//     console.error("needplus:", needplus);
//     //heroPropHelper.calHeroHolyCombat(userData, heroData);
//     heroData = heroPropHelper.addHolyRes(pulsattr, needplus, userData, heroData);
//     heroData.combat = heroPropHelper.calCombat(userData, heroData);
//     console.error("newcombat:", heroData.combat);
//     return heroData;

// }
/*


*/
/**
 * 获取主角色外观显示
 * @param client
 * @param userId
 * @param cb
 */
/*

var getHeroDisplay = function(client,userId,cb){
    checkRequire();
    var reList = [];
    userDao.selectCols(client,"id,lvl,equipBag"," id = ? ",[userId],function(err,userData){
        if (err) return cb(err);
        if(!userData) return cb(null, reData);
        heroDao.list(client," userId = ? order by id asc",[userId],function(err,heroList){
            if (err) return cb(err);
            for(var i = 0;i<heroList.length;i++){
                var reData = [];
                var hero = heroList[i];
                hero.propArr = heroPropHelper.calHeroProp(userData.lvl, userData.equipBag, hero);
                hero.combat = heroPropHelper.calCombat(userData.lvl, userData.equipBag, hero);
                //计算装备显示id
                reData[0] = _getClothDisplayID(userData, hero);
                //计算武器显示id
                reData[1] = _getWeaponDisplayID(userData, hero);
                //计算翅膀
                reData[2] = _getWingDisplayID(userData, hero);
                //性别
                reData[3] = hero.sex;
                reList.push(reData);
            }

            //console.log(reList);
            return cb(null, reList);
        });
    });

};
var uwClient = require("uw-db").uwClient;
getHeroDisplay(uwClient,2201,function(){});*/