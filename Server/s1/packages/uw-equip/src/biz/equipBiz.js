var uwData = require("uw-data");
var formula = require("uw-formula");
var consts = uwData.consts;
var c_prop = uwData.c_prop;
var c_game = uwData.c_game;
var t_item = uwData.t_item;
var t_sellItem = uwData.t_sellItem;
var c_msgCode = uwData.c_msgCode;
//var c_customParameter = uwData.c_customParameter;
var t_inheritedEquip = uwData.t_inheritedEquip;
var t_itemEquip = uwData.t_itemEquip;
var t_inheritedEquipHelp = uwData.t_inheritedEquipHelp;
var t_holyEquip = uwData.t_holyEquip;
var t_angelDemonEquip = uwData.t_angelDemonEquip;
var t_holyEquipHelp = uwData.t_holyEquipHelp;
var g_cache = require("uw-global").g_cache;
var UserEntity = require('uw-entity').UserEntity;
var propUtils = require("uw-utils").propUtils;
var EventEntity = require('uw-entity').EventEntity;
var async = require("async");
var getMsg = require("uw-utils").msgFunc(__filename);
var exports = module.exports;

var heroDao = null;
var userDao = null;
var userUtils = null;
var heroPropHelper = null;
var mailBiz = null;
var chatBiz = null;
var commonUtils = null;
var heroBiz = null;

var checkRequire = function() {
    commonUtils = commonUtils || require("uw-utils").commonUtils;
    chatBiz = chatBiz || require("uw-chat").chatBiz;
    heroDao = heroDao || require("uw-hero").heroDao;
    userDao = userDao || require("uw-user").userDao;
    userUtils = userUtils || require("uw-user").userUtils;
    heroPropHelper = heroPropHelper || require('uw-hero').heroPropHelper;
    mailBiz = mailBiz || require("uw-mail").mailBiz;
    heroBiz = heroBiz || require("uw-hero").heroBiz;
};
Number.tempId2Job = function(tempId) {
    return tempId.toString()[0] * 1;
};
/**
 * 装备
 * @param client
 * @param userId
 * @param tempId   英雄id
 * @param index   装备位置
 * @param equipId   装备id
 * @param cb
 */
exports.changeEquip = function(client, userId, tempId, index, equipId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){ 
        if (err) return cb(err); 
        var heroData = gamePlayer.getHeroByTempId(tempId);
        var userData = gamePlayer.userData; //,heroData = data[1];
        var equipBag = userData.equipBag || {};
        var equipData = heroData.equipData || {};
        var equipLvl = t_item[equipBag[equipId][0]].level; //等级需求
        var equipMagicLvl = t_item[equipBag[equipId][0]].magicLvl || 0; //魔导等级
        var type = t_itemEquip[equipBag[equipId][0]].type; //装备类型
        var job = t_itemEquip[equipBag[equipId][0]].job; //职业
        if (!equipBag[equipId]) return cb(getMsg(c_msgCode.noEquipInBag)); //背包没有该装备
        if (equipBag[equipId][3] == 1) return cb(getMsg(c_msgCode.haveEquip)); //该装备已装备
        var equipType = 0;
        switch (parseInt(index)) {
            case c_prop.heroEquipIndexKey.weapon:
                equipType = c_prop.equipTypeKey.weapon;
                break;
            case c_prop.heroEquipIndexKey.clothes:
                equipType = c_prop.equipTypeKey.clothes;
                break;
            case c_prop.heroEquipIndexKey.bracelet1:
                equipType = c_prop.equipTypeKey.bracelet;
                break;
            case c_prop.heroEquipIndexKey.ring1:
                equipType = c_prop.equipTypeKey.ring;
                break;
            // case c_prop.heroEquipIndexKey.paralysisRing:
            //     equipType = c_prop.equipTypeKey.paralysisRing;
            //     break;
            // case c_prop.heroEquipIndexKey.reviveRing:
            //     equipType = c_prop.equipTypeKey.reviveRing;
            //     break;
            // case c_prop.heroEquipIndexKey.protectRing:
            //     equipType = c_prop.equipTypeKey.protectRing;
            //     break;
            // case c_prop.heroEquipIndexKey.harmRing:
            //     equipType = c_prop.equipTypeKey.harmRing;
            //     break;
            case c_prop.heroEquipIndexKey.ring2:
                equipType = c_prop.equipTypeKey.ring;
                break;
            case c_prop.heroEquipIndexKey.bracelet2:
                equipType = c_prop.equipTypeKey.bracelet;
                break;
            case c_prop.heroEquipIndexKey.helmet:
                equipType = c_prop.equipTypeKey.helmet;
                break;
            case c_prop.heroEquipIndexKey.necklace:
                equipType = c_prop.equipTypeKey.necklace;
                break;
            // case c_prop.heroEquipIndexKey.sword:
            //     equipType = c_prop.equipTypeKey.sword;
            //     break;
            // case c_prop.heroEquipIndexKey.shield:
            //     equipType = c_prop.equipTypeKey.shield;
            //     break;
            // case c_prop.heroEquipIndexKey.cape:
            //     equipType = c_prop.equipTypeKey.cape;
            //     break;
            // case c_prop.heroEquipIndexKey.tshirt:
            //     equipType = c_prop.equipTypeKey.tshirt;
            //     break;
            // case c_prop.heroEquipIndexKey.shoe:
            //     equipType = c_prop.equipTypeKey.shoe;
            //     break;
            // case c_prop.heroEquipIndexKey.belt:
            //     equipType = c_prop.equipTypeKey.belt;
            //     break;
            case c_prop.heroEquipIndexKey.angelOrDemon:
                equipType = c_prop.equipTypeKey.angelOrDemon;
                break;
        }
        if (type != equipType) return cb(getMsg(c_msgCode.equipNotHere)); //该装备不属于该部位
        var tempId2Job = Number.tempId2Job(tempId);
        if (job && job != tempId2Job) return cb(getMsg(c_msgCode.equipNotPerson)); //不属于该职业装备
        if (userData.lvl < equipLvl) return cb(getMsg(c_msgCode.NoLvlOpen)); //等级不够
        if (userData.magicLvl < equipMagicLvl) return cb(getMsg(c_msgCode.NoLvlOpen)); //魔导等级不够
        var equipBagItems = {};

        //判断身上是否已有装备
        if (equipData[index]) {
            var nowId = equipData[index];
            userData.equipBag[nowId][3] = 0; //设置原来装备物品为未装备
            equipBagItems[nowId] = userData.equipBag[nowId];
        }

        //装备物品
        userData.equipBag[equipId][3] = 1; //设置原来装备物品为未装备  装备背包 {"1":[物品id,[随到的属性值],评价,是否穿戴],...}  "1":指定id,累加上去的
        equipBagItems[equipId] = userData.equipBag[equipId];
        heroData.equipData[index] = parseInt(equipId);
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        gamePlayer.setUserDataDirty();
        var upHeroData = {
            propArr: heroData.propArr,
            equipData: heroData.equipData,
            combat: heroData.combat
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        cb(null, [upHeroData, equipBagItems]);
    });
};


/**
 * 传承
 * @param client
 * @param userId
 * @param equipId   装备id
 * @param tempId
 * @param cb
 */
exports.inheritedEquip = function(client, userId, equipId, tempId, cb) {
    checkRequire();
    //先判断是否为可传承装备
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){ 
        if (err) return cb(err); 
        var heroData = gamePlayer.getHeroByTempId(tempId);
        var userData = gamePlayer.userData;
        //var heroData = data[1];
        userData.equipBag = userData.equipBag || {};
        userData.bag = userData.bag || {};
        var equipBag = userData.equipBag;
        var bag = userData.bag;
        if (!equipBag[equipId]) {
            return cb(getMsg(c_msgCode.equipNotHave)); //尚未拥有该装备
        }

        var inheritedData = t_inheritedEquip[equipBag[equipId][0]];
        if (!inheritedData) {
            return cb(getMsg(c_msgCode.equipNotInherit)); //该装备不可传承
        }
        //var index = 0;
        //获得下一级传承的信息
        //if (equipBag[equipId].length < 3){
        //    return cb(getMsg(c_msgCode.bagDataError));//背包数据有误
        //}
        //else if (equipBag[equipId].length < 4) {//装备未传承
        //    userData.equipBag[equipId] = [equipBag[equipId][0], equipBag[equipId][1], equipBag[equipId][2], 0];
        //    index = 0;
        //}else {//装备已传承，
        //    index = userData.equipBag[equipId][3];
        //}
        var nextEquipId = inheritedData.nextId;
        if (nextEquipId == 0) {
            return cb(getMsg(c_msgCode.equipLvlMaxed)); //已是顶级装备
        }


        //先判断等级是否满足
        if (t_item[nextEquipId].level > userData.lvl) {
            return cb(getMsg(c_msgCode.roleLvlUnable)); //角色等级不足
        }
        //判断是否拥有传承道具
        var costItemId = c_game.inheritedEquip[0];
        var num = bag[costItemId] || 0;
        var needNum = inheritedData.num;
        if (needNum > num) {
            return cb(getMsg(c_msgCode.noItem)); //道具不足
        }

        userUtils.delBag(userData, costItemId, needNum, c_prop.itemCostTypeKey.inherit);
        // userData.bag = bag;

        //判断元宝是否够
        /*var needDiamond = inheritedData.diamond;
        if (needDiamond > userData.diamond) {
            return cb(getMsg(c_msgCode.noDiamond));
        }*/

        //userUtils.reduceDiamond(userData, needDiamond);
        //开始传承
        userData.equipBag[equipId][0] = nextEquipId;
        var equipData = t_itemEquip[nextEquipId] || {};
        var randomArr = equipData.fixProp; //装备随到的属性值
        var gradeBase = exports.getEquipGrade(nextEquipId, randomArr); //装备评分
        userData.equipBag[equipId][1] = randomArr;
        userData.equipBag[equipId][2] = gradeBase;
        var upHeroData = {};
        if (heroData) {
            heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
            heroData.combat = heroPropHelper.calCombat(userData, heroData);
            upHeroData = {
                propArr: heroData.propArr,
                equipData: heroData.equipData,
                combat: heroData.combat
            };
        }

        gamePlayer.setUserDataDirty();

        var equipBagItems = {};
        equipBagItems[equipId] = userData.equipBag[equipId];

        var bagItems = {};
        bagItems[costItemId] = needNum;

        if (heroData) {
            gamePlayer.setHeroDataDirty(heroData.id);
        }

        cb(null, [bagItems, {}, upHeroData, equipBagItems, needNum]);
    });
};

/**
 * 定制武器
 * @param client
 * @param userId
 * @param certificate
 * @param job
 * @param name
 * @param lvl
 * @param abilityIndex
 * @param cb
 */
exports.customization = function(client, userId, certificate, job, name, lvl, abilityIndex, equipType, cb) {
    checkRequire();

};

/**
 * 升级定制武器
 * @param client
 * @param userId
 * @param equipId
 * @param cb
 */
exports.upCustomization = function(client, userId, equipId, cb) {
    checkRequire();

};


/*****************************************************************************************************/

// var _getCustomizationId = function(certificate,job,lvl,equipType){
//     //var equipType = "00";
//     var jobStr = job.toString();
//     //var part = c_customParameter[certificate].part;
//     var color = c_customParameter[certificate].color;
//     //if(part == 0){
//     //    equipType = c_prop.equipTypeKey.weapon.toString();
//     //}else if(part == 1){
//     //    equipType = c_prop.equipTypeKey.clothes.toString();
//     //}else if (part == 10) {
//     //    equipType = c_prop.equipTypeKey.helmet.toString();
//     //} else if (part == 3) {
//     //    equipType = c_prop.equipTypeKey.ring.toString();
//     //} else if (part == 2) {
//     //    equipType = c_prop.equipTypeKey.bracelet.toString();
//     //} else if (part == 11) {
//     //    equipType = c_prop.equipTypeKey.necklace.toString();
//     //}
//     if(color == 6) jobStr = (parseInt(job) + 3).toString();
//     var customizationId = "9" + jobStr + equipType.toString() + (Math.ceil(lvl/10)*10).toString();
//     return parseInt(customizationId);
// };

//输出指定范围内的随机数的随机整数
var _getRandomNumber = function(start, end) {
    var choice = end - start + 1;
    return Math.floor(Math.random() * choice + start);
};

//装备随到的属性值  templateId:装备模板id
exports.getRandomAbility = function(templateId) {
    checkRequire();
    var randomArr = [];
    var propertys = [].concat(t_itemEquip[templateId].propertys); //模板装备属性
    var filterPropArr = [33,34,35,36,37,38,39,40];//只这几种属性生成随机属性       
    for(var i = 0; i < propertys.length; i++){
        if(filterPropArr.indexOf(propertys[i][0]) == -1){
            propertys.splice(i,1);
            i--;
        }
    }

    var rate = t_itemEquip[templateId].randomRate; //随机加成属性倍率
    var randomPro = t_itemEquip[templateId].randomPro; //随机属性个数概率
    var randomNum = _getRandomNumber(1, 10000);
    var count = 0;
    var proSum = 0;
    for (var i = 0; i < randomPro.length; i++) {
        proSum += randomPro[i][1];
        if (randomNum <= proSum) {
            count = randomPro[i][0];
            break;
        }
    }
    //var indexArr = [];
    //for(var i = 0;i < propertys.length;i++){
    //    indexArr.push(i);
    //}
    for (var i = 0; i < count; i++) {
        var randomindex = _getRandomNumber(0, (propertys.length - 1));
        var abilityId = propertys[randomindex][0]; //属性id
        var abilityValue = propertys[randomindex][1]; //属性值
        var randomAbility = formula.calEquipSubjoin(abilityValue, rate); //0:装备属性; 1:装备属性随机倍率
        randomArr.push([abilityId, randomAbility]);
        propertys.splice(randomindex, 1);
        //indexArr.splice(randomindex,1);
    }
    var min = c_game.equipMinRandomCfg[0];
    var max = c_game.equipMinRandomCfg[1];
    for (var i = 0; i < propertys.length; i++) {
        var value = Math.ceil(propertys[i][1] * _getRandomNumber(min, max) / 10000); //属性值
        randomArr.push([propertys[i][0], value]);
    }

    return randomArr;
};

//装备评分计算        templateId:装备模板id  randomArr:额外属性数组
exports.getEquipGrade = function(templateId, randomArr) {
    checkRequire();
    var gradeBase = t_itemEquip[templateId].gradeBase; //模板装备基础评分
    var extraGrade = 0; //额外评分
    var equipGrade = 0; //装备附加参数
    for (var i = 0; i < randomArr.length; i++) {
        var abilityId = randomArr[i][0]; //属性id
        var abilityValue = randomArr[i][1]; //属性值
        switch (abilityId) {
            case c_prop.equipPropKey.maxHpTemp: //生命
                equipGrade = c_game.equipGrade[0];
                break;
            case c_prop.equipPropKey.attackTemp: //攻击
                equipGrade = c_game.equipGrade[1];
                break;
            case c_prop.equipPropKey.defenceTemp: //物防
                equipGrade = c_game.equipGrade[2];
                break;
            case c_prop.equipPropKey.magicDefenceTemp: //法防
                equipGrade = c_game.equipGrade[3];
                break;
            case c_prop.equipPropKey.hitTemp: //命中
                equipGrade = c_game.equipGrade[4];
                break;
            case c_prop.equipPropKey.dodgeTemp: //闪避
                equipGrade = c_game.equipGrade[5];
                break;
            case c_prop.equipPropKey.criticalTemp: //暴击
                equipGrade = c_game.equipGrade[6];
                break;
            case c_prop.equipPropKey.disCriticalTemp: //抗暴
                equipGrade = c_game.equipGrade[7];
                break;
        }
        extraGrade += equipGrade * abilityValue;
    }
    gradeBase += extraGrade;
    return gradeBase;
};


//updateEquipItemLockStatus
exports.updateEquipItemLockStatus = function(client, userId, equipId, isLocked, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var equipBag = userData.equipBag;
        var equipItemData = equipBag[equipId];
        if (!equipItemData) return cb(getMsg(c_msgCode.noEquipInBag)); //背包没有该装备
        if (equipItemData[3]) {
            return cb(getMsg(c_msgCode.equipNotLock)); //已穿戴的装备不可锁定
        }
        if (equipItemData[6] == isLocked) {
            return cb(null);
        } else {
            equipItemData[6] = isLocked;
        }
        equipBag[equipId] = equipItemData;
        userData.equipBag = equipBag;
        var equipBagItems = {};
        equipBagItems[equipId] = userData.equipBag[equipId];
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.equipBag);
        return cb(null, equipBagItems); //if(mailList.length == returnArr.length)
    });
};


exports.sellEquipItems = function(client, userId, equipIdArr, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var equipBag = userData.equipBag;
        var bagItems = {};
        var items = {};
        var delEquipBagArr = [];
        if (equipIdArr.length <= 0) {
            return cb(getMsg(c_msgCode.equipNotChoose)); //当前未选中任何装备
        }
        for (var i = 0; i < equipIdArr.length; i++) {
            var equipId = equipIdArr[i];
            var equipItemData = equipBag[equipId];
            if (!equipItemData) return cb(getMsg(c_msgCode.noEquipInBag)); //背包没有该装备
            var sellItemData = t_sellItem[equipItemData[0]];
            var equipData = t_itemEquip[equipItemData[0]];
            if (!sellItemData) return cb(getMsg(c_msgCode.equipNotSale)); //该装备不可出售
            if (equipItemData[3]) {
                return cb(getMsg(c_msgCode.equipOnNotSale)); //已穿戴的装备不可出售
            }
            if (equipItemData[6] || (equipItemData[6] == undefined && equipData.isLocked)) {
                return cb(getMsg(c_msgCode.equipLockNotSale)); //已锁定的装备不可出售
            }
            var sellItems = sellItemData.items;

            for (var key in sellItems) {
                var item = sellItems[key];
                if (t_item[item[0]].type == c_prop.itemTypeKey.equip) {
                    return cb(getMsg(c_msgCode.equipUnable)); //目前不支持获得装备
                }
                items[item[0]] = item[1];
            }
            var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.itemSell);
            if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
            delEquipBagArr.push(equipId);
            userUtils.delEquip(userData, equipId, c_prop.itemCostTypeKey.sell);
        }
        var getDiamond = userUtils.getNumOfItems(items, c_prop.itemTypeKey.diamond);
        var updateUser = {
            gold: userData.gold,
            diamond: userData.diamond
        };

        gamePlayer.setUserDataDirty();
        return cb(null, [updateUser, bagItems, getDiamond, delEquipBagArr, 0]);
    });
};


// 合成传承装备
exports.compoundEquip = function(client, userId, itemId, tempId, part, cb) {
    checkRequire();
    //先判断是否为可传承装备
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){ 
        if (err) return cb(err); 
        var userData = gamePlayer.userData;
        var heroData = gamePlayer.getHeroByTempId(tempId);
        userData.equipBag = userData.equipBag || {};
        userData.bag = userData.bag || {};
        var equipBag = userData.equipBag;
        var bag = userData.bag;

        var job = Number.tempId2Job(tempId);
        var needNum = _getCompoundItemNum(job, itemId);
        if (needNum <= 0) {
            return cb(getMsg(c_msgCode.noItem, needNum)); //该装备不可合成," + needNum
        }

        //先判断等级是否满足 
        if (t_item[itemId].level > userData.lvl) {
            return cb(getMsg(c_msgCode.roleLvlUnable)); //角色等级不足
        }

        if (t_item[itemId].type != 0 && t_item[itemId].type != 1) { // 不是武器和衣服，不能合成
            return cb(getMsg(c_msgCode.equipHereNotComp)); //该位置装备不可合成
        }

        //判断是否拥有传承道具
        var costItemId = c_game.inheritedEquip[0];
        var num = bag[costItemId] || 0;
        if (needNum > num) {
            return cb(getMsg(c_msgCode.noItem)); //道具不足
        }

        var equipBagResGrid = userUtils.getEquipBagResGrid(userData); //剩余格子数
        if (equipBagResGrid <= 1) {
            return cb(getMsg(c_msgCode.bagMax)); //装备背包已满
        }

        userUtils.delBag(userData, costItemId, needNum, c_prop.itemCostTypeKey.compound2);

        var items = {};
        items[itemId] = 1;

        var equipBagItems = {};
        var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.compound2);
        if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);

        var equipId = Object.keys(equipBagItems)[0];
        // 把装备穿到英雄身上 
        var equipData = t_itemEquip[itemId] || {};
        var randomArr = equipData.fixProp; //装备随到的属性值
        var gradeBase = exports.getEquipGrade(itemId, randomArr); //装备评分
        userData.equipBag[equipId][1] = randomArr;
        userData.equipBag[equipId][2] = gradeBase;
        userData.equipBag[equipId][3] = 1;

        // 修改返回物品的状态
        equipBagItems[equipId][3] = 1;
        var upHeroData = {};
        if (heroData) {

            // 卸下原先装备
            var oldEquipId = heroData.equipData[part];
            if (oldEquipId) {
                userData.equipBag[oldEquipId][3] = 0;
                equipBagItems[oldEquipId] = userData.equipBag[oldEquipId];
            }

            heroData.equipData[part] = parseInt(equipId);
            heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
            heroData.combat = heroPropHelper.calCombat(userData, heroData);
            upHeroData = {
                propArr: heroData.propArr,
                equipData: heroData.equipData,
                combat: heroData.combat
            };
        }

        //更新
        var upUserData = {};
        gamePlayer.setUserDataDirty();

        var delBagItems = {};
        delBagItems[costItemId] = needNum;

        if (heroData) {
            gamePlayer.setHeroDataDirty(heroData.id);
        }

        cb(null, [delBagItems, upUserData, upHeroData, equipBagItems, needNum]);
    });
};

// 分解传承装备
exports.decompoundEquip = function(client, userId, equipId, cb) {
    checkRequire();
    //先判断是否为可传承装备
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        userData.equipBag = userData.equipBag || {};
        userData.bag = userData.bag || {};
        var equipBag = userData.equipBag;
        var bag = userData.bag;
        if (!equipBag[equipId]) {
            return cb(getMsg(c_msgCode.equipNotHave)); //尚未拥有该装备
        }
        var tempId = equipBag[equipId][0];
        var inheritedData = t_inheritedEquip[tempId];
        if (!inheritedData) {
            return cb(getMsg(c_msgCode.equipNotResolve)); //该装备不能分解");
        }

        if (equipBag[equipId][3]) {
            return cb(getMsg(c_msgCode.equipOnNotResolve)); //穿戴中的装备不能分解
        }

        // 是否为初始装备分解
        var job = t_itemEquip[tempId].job;
        if (job < 1 || job > 4) {
            return cb(getMsg(c_msgCode.equipNotResolve, job)); //该装备不能分解 " + job
        }

        // 返回次数
        var reItemNum = _getCompoundItemNum(job, tempId);
        if (reItemNum <= 0) {
            return cb(getMsg(c_msgCode.equipNotResolve, reItemNum)); //该装备不能分解  "+ reItemNum
        }

        userUtils.delEquip(userData, equipId, c_prop.itemCostTypeKey.decompound2);
        var costItemId = c_game.inheritedEquip[0];
        var bagItems = {};
        bagItems[costItemId] = reItemNum;
        userUtils.saveItems(userData, bagItems, c_prop.itemGetTypeKey.decompound2);

        //更新
        var upUserData = {};
        gamePlayer.setUserDataDirty();

        var delEquipBagArr = [];
        delEquipBagArr.push(equipId);

        cb(null, [bagItems, upUserData, delEquipBagArr]);
    });
};

// 合成神圣装备
exports.compoundHolyEquip = function(client, userId, tempId, part, cb) {
    if (part < c_prop.heroEquipIndexKey.sword || part > c_prop.heroEquipIndexKey.belt) {
        return cb(getMsg(c_msgCode.holyEquipNotComp)); //该位置不能合成神圣装备
    }
    checkRequire();
    //先判断是否为可传承装备
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){ 
        if (err) return cb(err); 
        var userData = gamePlayer.userData;
        var heroData = gamePlayer.getHeroByTempId(tempId);
        // var heroData = data[1];
        userData.equipBag = userData.equipBag || {};
        userData.bag = userData.bag || {};
        var bag = userData.bag;

        // 已有装备,不能合成
        if (heroData.equipData[part]) {
            return cb("已有神圣装备");
        }

        var job = Number.tempId2Job(tempId);
        var initEquipArr = c_game.holyEquip[job].split(",");
        var eqidx = part - c_prop.heroEquipIndexKey.sword;
        var equipInfo = initEquipArr[eqidx].split(":");
        var costItemId = parseInt(c_game.holyEquip[0]);
        var itemId = parseInt(equipInfo[0]);
        var needNum = parseInt(equipInfo[1]);
        var num = bag[costItemId] || 0;
        if (needNum > num) {
            return cb("材料不够");
        }

        var equipBagResGrid = userUtils.getEquipBagResGrid(userData); //剩余格子数
        if (equipBagResGrid < 1) {
            return cb(getMsg(c_msgCode.bagMax)); //装备背包已满
        }

        // //先判断等级是否满足 
        if (t_item[itemId].level > userData.lvl) {
            return cb(getMsg(c_msgCode.roleLvlUnable)); //角色等级不足
        }

        userUtils.delBag(userData, costItemId, needNum, c_prop.itemCostTypeKey.compound2);
        heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.abyssEquip, 1);
        var items = {};
        items[itemId] = 1;

        var equipBagItems = {};
        var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.compound2);
        if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);

        var equipId = Object.keys(equipBagItems)[0];
        // 把装备穿到英雄身上 
        var equipData = t_itemEquip[itemId] || {};
        var randomArr = []; //equipData.fixProp || [];  //没有随机属性
        var gradeBase = exports.getEquipGrade(itemId, randomArr); //装备评分
        userData.equipBag[equipId][1] = randomArr;
        userData.equipBag[equipId][2] = gradeBase;
        userData.equipBag[equipId][3] = 1;

        // 修改返回物品的状态 
        var upHeroData = {};
        heroData.equipData[part] = parseInt(equipId);
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);
        upHeroData = {
            propArr: heroData.propArr,
            equipData: heroData.equipData,
            combat: heroData.combat
        };
        gamePlayer.setHeroDataDirty(heroData.id);

        //更新
        var upUserData = {};
        gamePlayer.setUserDataDirty();
        var delBagItems = {};
        delBagItems[costItemId] = needNum;
        equipBagItems[equipId][3] = 1;
        cb(null, [delBagItems, upUserData, upHeroData, equipBagItems, needNum]);
    });
};

//  神圣装备升级
exports.holyEquipLevelUp = function(client, userId, tempId, part, cb) {
    if (part < c_prop.heroEquipIndexKey.sword || part > c_prop.heroEquipIndexKey.belt) {
        return cb("该位置不能升级神圣装备");
    }
    checkRequire();
    //先判断是否为可传承装备
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){ 
        if (err) return cb(err); 
        var userData = gamePlayer.userData;
        //var heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        userData.equipBag = userData.equipBag || {};
        userData.bag = userData.bag || {};
        var equipBag = userData.equipBag;
        var bag = userData.bag;
        // 有装备,合成
        if (!heroData.equipData[part]) {
            return cb(getMsg(c_msgCode.noInitEquip)); //没有初始装备,不能升级
        }

        var equipId = parseInt(heroData.equipData[part]);
        var tmpId = userData.equipBag[equipId][0];
        var holyData = t_holyEquip[tmpId];
        if (!holyData) {
            return cb(getMsg(c_msgCode.equipNotLvlup)); //该装备不能升级
        }

        var nextEquipId = holyData.nextId;
        if (nextEquipId == 0) {
            return cb(getMsg(c_msgCode.equipLvlMaxed)); //已是顶级装备
        }

        //先判断等级是否满足
        if (t_item[nextEquipId].level > userData.lvl) {
            return cb(getMsg(c_msgCode.roleLvlUnable)); //角色等级不足
        }
        //判断是否拥有传承道具
        var costItemId = c_game.holyEquip[0];
        var num = bag[costItemId] || 0;
        var needNum = holyData.num;
        if (needNum > num) {
            return cb(getMsg(c_msgCode.noItem)); //道具不足
        }

        userUtils.delBag(userData, costItemId, needNum, c_prop.itemCostTypeKey.inherit);

        heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.abyssEquip, 1);

        //开始升级
        userData.equipBag[equipId][0] = nextEquipId;
        var randomArr = []; //equipData.fixProp || []; //装备随到的属性值
        var gradeBase = exports.getEquipGrade(nextEquipId, randomArr); //装备评分
        userData.equipBag[equipId][1] = randomArr;
        userData.equipBag[equipId][2] = gradeBase;
        var upHeroData = {};
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);
        upHeroData = {
            propArr: heroData.propArr,
            equipData: heroData.equipData,
            combat: heroData.combat
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        //更新
        var upUserData = {};
        gamePlayer.setUserDataDirty();

        var equipBagItems = {};
        equipBagItems[equipId] = userData.equipBag[equipId];

        var bagItems = {};
        bagItems[costItemId] = needNum;

        cb(null, [bagItems, upUserData, upHeroData, equipBagItems, needNum]);
    });
};

// 分解神圣装备
exports.decompoundHolyEquip = function(client, userId, equipId, cb) {
    checkRequire();
    //先判断是否为可传承装备
    //userDao.select(client,{id:userId},function(err,userData) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        userData.equipBag = userData.equipBag || {};
        userData.bag = userData.bag || {};
        var equipBag = userData.equipBag;
        var bag = userData.bag;
        if (!equipBag[equipId]) {
            return cb(getMsg(c_msgCode.equipNotHave)); //尚未拥有该装备
        }
        var tempId = equipBag[equipId][0];
        var holyData = t_holyEquip[tempId];
        if (!holyData) {
            return cb(getMsg(c_msgCode.equipNotResolve)); //该装备不能分解
        }

        if (equipBag[equipId][3]) {
            return cb(getMsg(c_msgCode.equipOnNotResolve)); //穿戴中的装备不能分解
        }

        // 是否为初始装备分解
        var job = t_itemEquip[tempId].job;
        if (job < 1 || job > 4) {
            return cb(getMsg(c_msgCode.equipNotResolve, job)); //该装备不能分解 " + job
        }

        // 返回次数
        var reItemNum = _getCompoundHolyItemNum(job, tempId);
        if (reItemNum <= 0) {
            return cb(getMsg(c_msgCode.equipNotResolve, reItemNum)); //该装备不能分解  "+ reItemNum
        }

        userUtils.delEquip(userData, equipId, c_prop.itemCostTypeKey.decompound2);
        var costItemId = c_game.holyEquip[0];
        var bagItems = {};
        bagItems[costItemId] = reItemNum;
        userUtils.saveItems(userData, bagItems, c_prop.itemGetTypeKey.decompound2);

        //更新
        var upUserData = {};
        gamePlayer.setUserDataDirty();
        var delEquipBagArr = [];
        delEquipBagArr.push(equipId);
        cb(null, [bagItems, upUserData, delEquipBagArr]);
    });
};

//  天使恶魔装备升级/升星
exports.angelDemonEquipLevelUp = function(client, userId, tempId, part, haveInitEquipIds, cb) {
    if (part != c_prop.heroEquipIndexKey.angelOrDemon) {
        return cb("该位置不能升级");
    }
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){ 
        if (err) return cb(err); 
        var userData = gamePlayer.userData;
        var heroData = gamePlayer.getHeroByTempId(tempId);
        userData.equipBag = userData.equipBag || {};
        userData.bag = userData.bag || {};
        var equipBag = userData.equipBag;
        var bag = userData.bag;
        if (!heroData.equipData[part]) {
            return cb(getMsg(c_msgCode.equipNotHave)); //尚未拥有该装备
        }

        var equipId = parseInt(heroData.equipData[part]);
        var tmpId = userData.equipBag[equipId][0];
        var angelDemonData = t_angelDemonEquip[tmpId];
        if (!angelDemonData) {
            return cb(getMsg(c_msgCode.equipNotLvlup)); //该装备不能升级
        }

        var nextEquipId = angelDemonData.nextId;
        if (nextEquipId == 0) {
            return cb(getMsg(c_msgCode.equipLvlMaxed)); //已是顶级装备
        }

        //先判断等级是否满足
        if (t_item[nextEquipId].level > userData.lvl) {
            return cb(getMsg(c_msgCode.roleLvlUnable)); //角色等级不足
        }

        //判断道具是否够
        var needItems = angelDemonData.needItems;
        // console.log('fsdasdasdasd',needItems);
        var needBagItems = [];
        var delEquipBagArr = [];
        if (needItems) {
            for (var i = 0; i < needItems.length; i++) {
                var itemId = needItems[i][0];
                var itemCount = needItems[i][1];
                if (t_item[itemId].type == c_prop.itemTypeKey.equip) {
                    //校验下 客户端传的ID
                    for (var j = 0; j < haveInitEquipIds.length; j++) {
                        if (delEquipBagArr.length >= itemCount) break;
                        if (equipBag[haveInitEquipIds[j]][3]) continue; //穿戴中的装备不能当做材料
                        if (equipBag[haveInitEquipIds[j]][0] == itemId) delEquipBagArr.push(haveInitEquipIds[j]);
                    }
                    if (delEquipBagArr.length < itemCount) return cb(getMsg(c_msgCode.materialUnenough)); //材料不足
                } else {
                    if (!bag[itemId] || bag[itemId] < itemCount) {
                        return cb(getMsg(c_msgCode.materialUnenough)); //材料不足
                    }
                    needBagItems.push([itemId, itemCount]);
                }
            }
        }
        var delBagItems = {};
        // 扣背包物品
        for (var i = 0; i < needBagItems.length; i++) {
            var itemId = needBagItems[i][0];
            var itemCount = needBagItems[i][1];
            delBagItems[itemId] = itemCount;
            userUtils.delBag(userData, itemId, itemCount, c_prop.itemCostTypeKey.other);
        }
        // 扣装备
        for (var i = 0; i < delEquipBagArr.length; i++) {
            var temp_equipId = delEquipBagArr[i];
            userUtils.delEquip(userData, temp_equipId, c_prop.itemCostTypeKey.other);
        }

        //开始升级
        userData.equipBag[equipId][0] = nextEquipId;
        var randomArr = []; //equipData.fixProp || []; //装备随到的属性值
        var gradeBase = exports.getEquipGrade(nextEquipId, randomArr); //装备评分
        userData.equipBag[equipId][1] = randomArr;
        userData.equipBag[equipId][2] = gradeBase;
        var upHeroData = {};
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);
        upHeroData = {
            propArr: heroData.propArr,
            equipData: heroData.equipData,
            combat: heroData.combat
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        //更新
        var upUserData = {};
        gamePlayer.setUserDataDirty();

        var equipBagItems = {};
        equipBagItems[equipId] = userData.equipBag[equipId];
        cb(null, [upUserData, upHeroData, delBagItems, equipBagItems, delEquipBagArr]);
    });
};

// 分解天使恶魔装备
exports.decompoundAngelDemonEquip = function(client, userId, equipId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        userData.equipBag = userData.equipBag || {};
        userData.bag = userData.bag || {};
        var equipBag = userData.equipBag;
        var bag = userData.bag;
        if (!equipBag[equipId]) {
            return cb(getMsg(c_msgCode.equipNotHave)); //尚未拥有该装备
        }
        var tmpId = equipBag[equipId][0];
        var angelDemonData = t_angelDemonEquip[tmpId];
        if (!angelDemonData || angelDemonData.isInit) {
            return cb(getMsg(c_msgCode.equipNotResolve)); //该装备不能分解
        }

        if (equipBag[equipId][3]) {
            return cb(getMsg(c_msgCode.equipOnNotResolve)); //穿戴中的装备不能分解
        }

        var reItems = {}; //返还的物品
        for (var i = tmpId, preInfo; preInfo = t_angelDemonEquip[--i];) {
            if (!preInfo) return cb(getMsg(c_msgCode.configError)); //配置错误
            // console.error('preInfo.needItems----->',preInfo.needItems);
            var needItems = preInfo.needItems;
            if (needItems) {
                for (var j = 0; j < needItems.length; j++) {
                    var itemId = needItems[j][0];
                    var itemCount = needItems[j][1];
                    var tempObj = {};
                    tempObj[itemId] = itemCount;
                    reItems = propUtils.mergerProp(reItems, tempObj);
                }
            }
            if (preInfo.isInit) {
                //1级原始的也返还
                var tempObj = {};
                tempObj[preInfo.id] = 1;
                reItems = propUtils.mergerProp(reItems, tempObj);
                break;
            }
        }
        // console.error('reItems----->',reItems);
        var bagItems = {};
        var equipBagItems = {};
        //var mailItems = {};
        var itemsArr = userUtils.saveItems(userData, reItems, c_prop.itemGetTypeKey.decompound2);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);
 
        userUtils.delEquip(userData, equipId, c_prop.itemCostTypeKey.decompound2);

        //更新
        var upUserData = {};
        gamePlayer.setUserDataDirty();
        var delEquipBagArr = [];
        delEquipBagArr.push(equipId);
        cb(null, [upUserData, bagItems, equipBagItems, delEquipBagArr]);
    });
};

// 返回 -1 表示不能分解/合成
var _getCompoundItemNum = function(job, tempId) {

    var inheritedData = t_inheritedEquip[tempId];
    if (!inheritedData) {
        return -1;
    }

    var inherSeq = t_inheritedEquipHelp[tempId];
    var num = 0;
    if (inherSeq) {
        for (var i = 0; i < inherSeq.length; i++) {
            num += t_inheritedEquip[inherSeq[i]].num;
        }
        // 初始装备 inherSeq[0]
        var num2 = 0;
        var initInherIds = c_game.inheritedEquip[job].split(",");
        for (var i = 0; i < initInherIds.length; i++) {
            var initItem = initInherIds[i].split(":");
            if (initItem[0] == inherSeq[0]) {
                num2 = parseInt(initItem[1]);
            }
        }

        // 没有初始装备 ? 不能分解
        if (num2 == 0) {
            return -1;
        }

        num += num2;

    } else {
        //console.log("_getCompoundItemNum:", job, c_game.inheritedEquip);
        var initInherIds = c_game.inheritedEquip[job].split(",");
        for (var i = 0; i < initInherIds.length; i++) {
            var initItem = initInherIds[i].split(":");
            if (initItem[0] == tempId) {
                num = parseInt(initItem[1]);
            }
        }
    }

    if (num == 0) {
        return -1;
    }

    return num;
}

// 返回 -1 表示不能分解/合成
var _getCompoundHolyItemNum = function(job, tempId) {

    var holyData = t_holyEquip[tempId];
    if (!holyData) {
        return -1;
    }

    var inherSeq = t_holyEquipHelp[tempId];
    var num = 0;
    if (inherSeq) {
        for (var i = 0; i < inherSeq.length; i++) {
            num += t_holyEquip[inherSeq[i]].num;
        }
        // 初始装备 inherSeq[0]
        var num2 = 0;
        var initInherIds = c_game.holyEquip[job].split(",");
        for (var i = 0; i < initInherIds.length; i++) {
            var initItem = initInherIds[i].split(":");
            if (initItem[0] == inherSeq[0]) {
                num2 = parseInt(initItem[1]);
            }
        }

        // 没有初始装备 ? 不能分解
        if (num2 == 0) {
            return -1;
        }

        num += num2;

    } else {
        //console.log("_getCompoundItemNum:", job, c_game.inheritedEquip);
        var initInherIds = c_game.holyEquip[job].split(",");
        for (var i = 0; i < initInherIds.length; i++) {
            var initItem = initInherIds[i].split(":");
            if (initItem[0] == tempId) {
                num = parseInt(initItem[1]);
            }
        }
    }

    if (num == 0) {
        return -1;
    }

    return num;
}