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
var t_talisman = uwData.t_talisman;
var t_item = uwData.t_item;
var t_talismanLvl = uwData.t_talismanLvl;
var t_talismanRes = uwData.t_talismanRes;
var t_talismanSkill = uwData.t_talismanSkill;
var t_talismanStar = uwData.t_talismanStar;
var t_talismanConpound = uwData.t_talismanConpound;
var t_talismanConpoundFail = uwData.t_talismanConpoundFail;
//var t_talismanCom = uwData.t_talismanCom;
var t_heroStar = uwData.t_heroStar;
var t_hero = uwData.t_hero;
var t_heroGift = uwData.t_heroGift;
var t_heroPledge = uwData.t_heroPledge;
var async = require("async");
var getMsg = require("uw-utils").msgFunc(__filename);
var HeroEntity = require("uw-entity").HeroEntity;
var ds = require("uw-ds").ds;
var g_cache = require("uw-global").g_cache;
var commonUtils = require("uw-utils").commonUtils;
var propUtils = require("uw-utils").propUtils;
var exports = module.exports;

var heroDao = null;
var heroPropHelper = null;
var userUtils = null;
var userDao = null;
var userBiz = null;
var chatBiz = null;
var taskBiz = null;
var heroBiz = null;
var checkRequire = function() {
    heroDao = heroDao || require("../dao/heroDao");
    heroPropHelper = heroPropHelper || require("./heroPropHelper");
    userUtils = userUtils || require("uw-user").userUtils;
    userDao = userDao || require("uw-user").userDao;
    userBiz = userBiz || require("uw-user").userBiz;
    chatBiz = chatBiz || require("uw-chat").chatBiz;
    taskBiz = taskBiz || require("uw-task").taskBiz;
    heroBiz = heroBiz || require("uw-hero").heroBiz;
};
Number.tempId2Job = function(tempId) {
    return tempId.toString()[0] * 1;
};

//宠物合成
exports.talismanConpound = function(client, userId, trumpId1, trumpId2, cb) {
    checkRequire();
    if (!t_talisman[trumpId1] || !t_talisman[trumpId2]) return cb(getMsg(c_msgCode.abnormalData)); //数据异常");
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){ 
        if (err) return cb(err); 
        var userData = gamePlayer.userData;
        var bag = userData.bag || {};
        if (!bag[trumpId1] || !bag[trumpId2]) return cb(getMsg(c_msgCode.itemUnenough)); //背包没有指定数量的该物品
        //先从特殊宠物合成表找
        var tragetId = 0;
        var tragetCfg = null;
        trumpId1 = parseInt(trumpId1);
        trumpId2 = parseInt(trumpId2);
        for (var key in t_talismanConpound) {
            var reqItems = t_talismanConpound[key].reqItems || [];
            var temp_reqItems = reqItems.concat([]);
            if (temp_reqItems.indexOf(trumpId1) > -1) {
                temp_reqItems.splice(temp_reqItems.indexOf(trumpId1), 1);
                if (temp_reqItems.indexOf(trumpId2) > -1) {
                    tragetCfg = t_talismanConpound[key];
                    tragetId = tragetCfg.obtainId;
                    break;
                }
            }
        }
        //如特殊宠物表找到 算成功率
        var isGet = false;
        if (tragetCfg) {
            var randomNum = _getRandomNumber(1, 10000);
            if (randomNum <= tragetCfg.successPro) { //获得
                isGet = true;
            }
        }

        //没有得到宠物 则 根据合成的2个宠物品质从不同的随机库中 随机到一只合成宠物
        if (!isGet) {
            var rareCfg = { 1: "R", 2: "SR", 3: "SSR", 4: "SSS" };
            var rareWeightCfg = { "R": 0, "SR": 1, "SSR": 3, "SSS": 7 };

            var rare1 = t_item[trumpId1].rareLevel;
            var rare2 = t_item[trumpId2].rareLevel;
            var poolType = rareWeightCfg[rareCfg[rare1]] + rareWeightCfg[rareCfg[rare2]];
            // console.error("talismanConpound ====poolType===>", poolType);
            var randomArr = _getTalismanConpoundFailData(poolType);
            tragetId = commonUtils.getWeightRandomValue(randomArr);
        }

        if (!tragetId) return cb(getMsg(c_msgCode.abnormalData)); //数据异常");
        var delBagItems = {};
        delBagItems[trumpId1] = 1;
        delBagItems[trumpId2] = delBagItems[trumpId2] ? (delBagItems[trumpId2] + 1) : 1; //trumpId1 有可能和 trumpId2 一样
        for (var key in delBagItems) {
            userUtils.delBag(userData, key, delBagItems[key], c_prop.itemCostTypeKey.talisman);
        }
        var items = {};
        items[tragetId] = 1;
        
        //物品
        var bagItems = {};
        var equipBagItems = {};
        var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.talismanConpound);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        cb(null, [bagItems, delBagItems]);
    });
}

var talismanConpoundFailArr = {}; //概率包缓存
var _getTalismanConpoundFailData = function(type) {
    if (Object.keys(talismanConpoundFailArr).length <= 0) {
        for (var key in t_talismanConpoundFail) {
            var locData = t_talismanConpoundFail[key];
            var locDataArr = talismanConpoundFailArr[locData.type] || [];
            locDataArr.push(locData);
            talismanConpoundFailArr[locData.type] = locDataArr;
        }
    }
    var reList = [];
    var cutList = talismanConpoundFailArr[type] || [];
    for (var i = 0; i < cutList.length; i++) {
        var locData = cutList[i];
        reList.push([locData.obtainId, locData.rate]);
    }
    return reList;
};

//法宝使用
exports.useTrumpItem = function(client, userId, trumpId, cb) {
    checkRequire();
    if (!t_talisman[trumpId]) return cb(getMsg(c_msgCode.abnormalData)); //数据异常");
    var job = t_talisman[trumpId].job; //法宝职业
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){ 
        if (err) return cb(err); 
        var userData = gamePlayer.userData; //,heroList = data[1];
        var heroList = gamePlayer.heroListData;
        var openLvl = c_open.openTrump.lvlRequired;
        if (userData.lvl < openLvl) return cb(getMsg(c_msgCode.talismanNotOpen));

        //判断物品需要等级
        var needLvl = t_item[trumpId].level;
        if (userData.lvl < needLvl) return cb(getMsg(c_msgCode.cannotActPet, needLvl)); //等级不够不能激活该宠物!"+needLvl

        var exData = userData.exData || {};
        var delBagItems = {};
        var heroObj = {};
        var upHeroDataObj = [{}]; //需要更新的数据；
        var userResArr = [trumpId];
        for (var i = 0; i < heroList.length; i++) {
            var locHero = heroList[i];
            var tempId2Job = Number.tempId2Job(locHero.tempId);
            heroObj[tempId2Job] = JSON.parse(JSON.stringify(locHero));
            var talismanFg = locHero.talismanFg || {}; //法宝共鸣{共鸣id:[0,1],共鸣id:[1,0],...}
            for (var key in talismanFg) {
                var resonance = t_talismanRes[key].resonance;
                var talismanFgData = talismanFg[key] || [];
                for (var j = 0; j < talismanFgData.length; j++) {
                    if (talismanFgData[j]) {
                        if (resonance[j] && userResArr.indexOf(resonance[j]) == -1) userResArr.push(resonance[j]);
                    }
                }
            }
        }


        var heroData = heroObj[job];
        if (!heroData) return cb(getMsg(c_msgCode.noCareer));
        if (heroData.talismanData && heroData.talismanData[trumpId]) return cb(getMsg(c_msgCode.petAct)); //该宠物已激活
        if (!userData.bag[trumpId] || userData.bag[trumpId] == 0) return cb(getMsg(c_msgCode.noItem)); //没有该物品
        delBagItems[trumpId] = 1;
        userUtils.delBag(userData, trumpId, 1, c_prop.itemCostTypeKey.talisman);
        //法宝增加
        var baseData = t_talisman[trumpId];
        //var trumpData =[1,baseData.atStart,0,0,{}];
        if (!heroData.talismanData) heroData.talismanData = {};
        heroData.talismanData[trumpId] = [1, baseData.atStart, 0, 0, {}];
        //trumpData[0] = 1; //初始等级
        //trumpData[1] = baseData.atStart + Math.floor((baseData.atEnd - baseData.atStart) * Math.random()); //初始资质
        //trumpData[1] = baseData.atStart; //初始资质
        //trumpData[2] = 0;//初始星级
        //trumpData[3] = 0;//最大历史星级
        //trumpData[4] = {};
        // if(!heroData.talismanData) heroData.talismanData = {};
        // heroData.talismanData[trumpId]  = trumpData;
        //记录法宝共鸣

        var trumpIdResonance = t_talisman[trumpId].resonance; //所属共鸣编号组
        if (!heroData.talismanFg) heroData.talismanFg = {};
        var talismanFg = heroData.talismanFg;
        for (var i = 0; i < trumpIdResonance.length; i++) {
            var resonanceId = trumpIdResonance[i];
            if (!resonanceId) break;
            var locTalismanFg = talismanFg[resonanceId] || []; //[0,1,...]
            var locResonance = t_talismanRes[resonanceId].resonance; //[法宝id,法宝id，。。。]
            var tempId2Job = Number.tempId2Job(heroData.tempId);
            if (t_talisman[locResonance[0]].job == tempId2Job) {
                for (var j = 0; j < locResonance.length; j++) {
                    if (!locTalismanFg[j]) { //还未激活
                        if (userResArr.indexOf(locResonance[j]) != -1) locTalismanFg[j] = 1;
                    }
                }
                heroData.talismanFg[resonanceId] = locTalismanFg;
                var isRes = true;
                var resLength = locResonance.length;
                for (var j = 0; j < resLength; j++) {
                    if (!locTalismanFg[j]) {
                        isRes = false;
                        break;
                    }
                }
                if (isRes) {
                    var type = t_talismanRes[resonanceId].type;
                    if (type != c_prop.talismanSkillTypeKey.property) { //记录到exData
                        if (!exData[c_prop.userExDataKey.talismanSkill]) exData[c_prop.userExDataKey.talismanSkill] = {};
                        if (!exData[c_prop.userExDataKey.talismanSkill][type]) exData[c_prop.userExDataKey.talismanSkill][type] = [];
                        exData[c_prop.userExDataKey.talismanSkill][type].push(t_talismanRes[resonanceId].extraPro[0][0]);
                    }
                }
            }
        }
        //属性计算
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);
        heroData.talismanNum += 1; //记录宠物数量 用于排行榜
        heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.petNumbers, 1);
        //自动穿戴
        var talismanAdornId = heroData.talismanAdorn; //已经穿戴的法宝的ID
        if (!talismanAdornId) {
            heroData.talismanAdorn = trumpId;
        }
        //更新
        var upHeroData = {
            id: heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            talismanFg: heroData.talismanFg,
            talismanData: heroData.talismanData,
            talismanNum: heroData.talismanNum,
            talismanAdorn: heroData.talismanAdorn
        };
        var upCacheHero = gamePlayer.getHero(heroData.id);
        upCacheHero.propArr = heroData.propArr;
        upCacheHero.combat = heroData.combat;
        upCacheHero.talismanFg = heroData.talismanFg;
        upCacheHero.talismanData = heroData.talismanData;
        upCacheHero.talismanNum = heroData.talismanNum;
        upCacheHero.talismanAdorn = heroData.talismanAdorn;

        gamePlayer.setHeroDataDirty(heroData.id);
        upHeroDataObj.push([heroData.id, JSON.parse(JSON.stringify(upHeroData))]);

        for (var key in heroObj) {
            var locHeroData = heroObj[key];
            if (locHeroData.id == heroData.id) continue;
            //记录法宝共鸣
            if (!locHeroData.talismanFg) locHeroData.talismanFg = {};
            var talismanFg = locHeroData.talismanFg;
            var isUp = false;
            for (var k = 0; k < userResArr.length; k++) {
                var talisman = t_talisman[userResArr[k]];
                var trumpIdResonance = talisman.resonance; //所属共鸣编号组
                for (var i = 0; i < trumpIdResonance.length; i++) {
                    var resonanceId = trumpIdResonance[i];
                    if (!resonanceId) break;
                    var locTalismanFg = talismanFg[resonanceId] || []; //[0,1,...]
                    var locResonance = t_talismanRes[resonanceId].resonance; //[法宝id,法宝id，。。。]
                    var tempId2Job = Number.tempId2Job(locHeroData.tempId);
                    if (t_talisman[locResonance[0]].job == tempId2Job) {
                        for (var j = 0; j < locResonance.length; j++) {
                            if (!locTalismanFg[j]) { //还未激活
                                if (userResArr.indexOf(locResonance[j]) != -1) {
                                    locTalismanFg[j] = 1;
                                    isUp = true;
                                }
                            }
                        }
                        locHeroData.talismanFg[resonanceId] = locTalismanFg;
                        var isRes = true;
                        var resLength = locResonance.length;
                        for (var j = 0; j < resLength; j++) {
                            if (!locTalismanFg[j]) {
                                isRes = false;
                                break;
                            }
                        }
                        if (isRes) {
                            //共鸣技能
                            var type = t_talismanRes[resonanceId].type;
                            if (type != c_prop.talismanSkillTypeKey.property) { //记录到exData
                                if (!exData[c_prop.userExDataKey.talismanSkill]) exData[c_prop.userExDataKey.talismanSkill] = {};
                                if (!exData[c_prop.userExDataKey.talismanSkill][type]) exData[c_prop.userExDataKey.talismanSkill][type] = [];
                                exData[c_prop.userExDataKey.talismanSkill][type].push(t_talismanRes[resonanceId].extraPro[0][0]);
                            } else {
                                isUp = true;
                                //属性计算
                                locHeroData.propArr = heroPropHelper.calHeroProp(userData, locHeroData);
                                locHeroData.combat = heroPropHelper.calCombat(userData, locHeroData);
                            }
                        }
                    }
                }
            }
            if (isUp) {
                var locCacheHero = gamePlayer.getHero(locHeroData.id);
                locCacheHero.propArr = locHeroData.propArr;
                locCacheHero.combat = locHeroData.combat;
                locCacheHero.talismanFg = locHeroData.talismanFg;
                locCacheHero.talismanData = locHeroData.talismanData;

                gamePlayer.setHeroDataDirty(locHeroData.id);
            }
        }

        //更新背包
        var upUserData = {
            exData: userData.exData
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        //勋章成就  宠物数量
        userBiz.setMedalValue(client, userId, c_prop.medalLootTypeKey.petNum, 1, function() {});
        cb(null, [upHeroDataObj, delBagItems, upUserData]);
    });
};

//法宝穿戴
exports.changeTrump = function(client, userId, tempId, trumpId, cb) {
    checkRequire();
    var talisman = t_talisman[trumpId];
    if (!talisman) return cb(getMsg(c_msgCode.abnormalData)); //数据异常");
    var tempId2Job = Number.tempId2Job(tempId);
    if (talisman.job != tempId2Job) return cb(getMsg(c_msgCode.abnormalData)); //数据异常");
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){ 
        if (err) return err; 
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        var trumpBag = heroData.talismanData || {};

        var trumpData = trumpBag[trumpId];
        var talismanAdornId = heroData.talismanAdorn; //已经穿戴的法宝的ID
        if (talismanAdornId == trumpId) return cb(getMsg(c_msgCode.equipPet)); //已装备该宠物
        if (!trumpData) return cb(getMsg(c_msgCode.noPet)); //还未拥有该宠物
        var trumpLvl = trumpBag[trumpId];
        if (userData.lvl < trumpLvl) return cb(getMsg(c_msgCode.NoLvlOpen)); //等级不够
        heroData.talismanAdorn = trumpId;

        //更新
        var upHeroData = {
            id: heroData.id,
            talismanAdorn: heroData.talismanAdorn
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        // heroDao.update(client,upHeroData,{id:heroData.id},function(err,upData) {
        //     if (err) return cb(err);
        cb(null, [upHeroData]);
        //});
    })
};


//升级法宝
exports.upTrumpLvl = function(client, userId, tempId, trumpId, cb) {
    checkRequire();
    var talisman = t_talisman[trumpId];
    if (!talisman) return cb(getMsg(c_msgCode.abnormalData)); //数据异常");    
    var tempId2Job = Number.tempId2Job(tempId);
    if (talisman.job != tempId2Job) return cb(getMsg(c_msgCode.abnormalData)); //数据异常");
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){ 
        if (err) return err; 
        //content 
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        if (!heroData.talismanData) heroData.talismanData = {};
        var talismanData = heroData.talismanData;
        var trumpData = talismanData[trumpId];
        if (!trumpData) return cb("还未拥有该法宝");
        //if(userData.lvl <=  trumpData[0]) return cb(getMsg(c_msgCode.NoLvlOpen));//等级不足

        var costCandyNum = 0;
        var upLvlData = t_talismanLvl[trumpId + trumpData[0]];
        var nextUpLvlData = t_talismanLvl[trumpId + trumpData[0] + 1];
        if (!nextUpLvlData) return cb(getMsg(c_msgCode.lvMax)); //已满级
        if (nextUpLvlData.userLv > userData.lvl) return cb(getMsg(c_msgCode.roleLvlUnenough)); //人物等级不足

        var bag = userData.bag;
        var delBagItems = {};

        for (var val in upLvlData.needItems) {
            var needItemsId = upLvlData.needItems[val][0];
            var needItemsNum = upLvlData.needItems[val][1];
            var ownItemsNum = bag[needItemsId] || 0;
            if (ownItemsNum < needItemsNum) return cb(getMsg(c_msgCode.noLvlUpMaterial)); //升级材料不足
            if (needItemsId == 56) costCandyNum += needItemsNum;
            userUtils.delBag(userData, needItemsId, needItemsNum, c_prop.itemCostTypeKey.talisman);
            delBagItems[needItemsId] = needItemsNum;
        }
        trumpData[0] += 1;
        heroData.talismanData[trumpId] = trumpData;

        chatBiz.addSysData(129, [userData.nickName, trumpData[0]]); //宠物升级达到
        var userFirstData = userData.exData[c_prop.userExDataKey.firstData] || {};
        if (!userFirstData[c_prop.firstDataKey.giftlvUp]) {
            chatBiz.addSysData(119, [userData.nickName]); //第一次宠物培养
            userFirstData[c_prop.firstDataKey.giftlvUp] = 1;
            userData.exData[c_prop.userExDataKey.firstData] = userFirstData;
        }
        //属性计算
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);

        var upHeroData = {
            id: heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            talismanFg: heroData.talismanFg,
            talismanData: heroData.talismanData
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        // async.parallel([
        //     // function (cb1) {
        //     //     userDao.update(client, upUserData, {id: userId}, cb1);
        //     // },
        //     function (cb1) {
        //         heroDao.update(client, upHeroData, {id: heroData.id}, cb1);
        //     }
        // ], function (err, data) {
        //     if (err) return cb(err);
        //     delete upUserData.bag;
        cb(null, [upHeroData, delBagItems, costCandyNum]);
        // });
    });
};

//法宝洗炼
exports.baptizeTrump = function(client, userId, tempId, trumpId, isCheck, baptizeNum, cb) {
    checkRequire();
    var talisman = t_talisman[trumpId];
    if (!talisman) return cb(getMsg(c_msgCode.abnormalData)); //数据异常
    var tempId2Job = Number.tempId2Job(tempId);
    if (talisman.job != tempId2Job) return cb(getMsg(c_msgCode.abnormalData)); //数据异常
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){ 
        if (err) return err; 
        var userData = gamePlayer.userData; //,heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        userData.bag = userData.bag || {};
        var bag = userData.bag || {};
        heroData.talismanData = heroData.talismanData || {};
        var talismanData = heroData.talismanData || {}; //法宝数据{法宝id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...}],法宝id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...}],....}
        var trumpData = talismanData[trumpId];
        if (!trumpData) return cb("还未拥有该法宝");
        var maxBaptizeTrump = t_talisman[trumpId].atEnd + t_talismanStar[trumpId + trumpData[3]].aptitude;
        if (trumpData[1] >= maxBaptizeTrump) return cb(getMsg(c_msgCode.maxBaptize)); //已经达到最大资质

        baptizeNum = baptizeNum || 1; //默认1次
        var cosDiamond = 0;
        var needItemsId = c_game.trumpCfg[0];
        var needItemsNum = 0; //c_game.trumpCfg[1];
        var needDiamond = 0; //c_game.trumpCfg[4]
        var delBagItems = {};

        var oldBaptizeValue = trumpData[1] || 0;
        var result = trumpData[1] || 0;
        var value = 0;
        for (var i = 0; i < baptizeNum; i++) {
            needItemsNum += c_game.trumpCfg[1];
            if (!bag[needItemsId] || bag[needItemsId] < needItemsNum) {
                needItemsNum -= c_game.trumpCfg[1];
                if (i === 0) return cb(getMsg(c_msgCode.noBaptizeMaterial)); //第一次的材料都不足直接return 洗炼材料不足
                break;
            }
            if (isCheck) {
                needDiamond += c_game.trumpCfg[4];
                if (userData.diamond < needDiamond) {
                    needDiamond -= c_game.trumpCfg[4];
                    if (i === 0) return cb(getMsg(c_msgCode.noDiamond)); //第一次的保不掉级需要的钻石都不足直接return 钻石不足;
                    break;
                }
            }


            var prob = formula.calTrumpPro(result, maxBaptizeTrump) * 100;
            var rad = _getRandomNumber(1, 100);

            if (rad <= prob) {
                value = value + formula.calTrumpAdd(result, maxBaptizeTrump);
            } else {
                if (!isCheck) {
                    value = value - formula.calTrumpSub(result, maxBaptizeTrump);
                    if (result < 0) result = 0;
                } else {
                    // result = result;
                    // value = 0;
                }
            }
            result = oldBaptizeValue + value;
            if (result > maxBaptizeTrump) {
                result = maxBaptizeTrump;
                break;
            }
        }
        cosDiamond = needDiamond;
        if (needDiamond > 0) {
            if (userData.diamond < needDiamond) {
                return cb(getMsg(c_msgCode.noDiamond));
            }
            userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, needDiamond, c_prop.diamondCostTypeKey.baptizeTrump);
        }

        delBagItems[needItemsId] = needItemsNum;
        userUtils.delBag(userData, needItemsId, needItemsNum, c_prop.itemCostTypeKey.talisman);

        chatBiz.addSysData(128, [userData.nickName, trumpData[1], result]); //宠物潜力达到 【玩家名，老值，新值】
        trumpData[1] = result;

        //if(rad<=prob){
        //    value =formula.calTrumpAdd(baptizeValue,maxBaptizeTrump);
        //    trumpData[1] = baptizeValue + value;
        //    trumpData[5] = 0;
        //    if(trumpData[1] > maxBaptizeTrump) trumpData[1] = maxBaptizeTrump;
        //    heroData.propArr =  heroPropHelper.calHeroProp(userData,heroData);
        //
        //}else{
        //    value = formula.calTrumpSub(baptizeValue,maxBaptizeTrump);
        //    trumpData[5] = baptizeValue - value;
        //    if(trumpData[5] < 0) trumpData[5] = 0;
        //    value = -value;
        //}


        heroData.talismanData[trumpId] = trumpData;
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        var upUserData = {
            diamond: userData.diamond
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        var upHeroData = {
            id: heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            talismanFg: heroData.talismanFg,
            talismanData: heroData.talismanData
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        cb(null, [upUserData, upHeroData, delBagItems, value, cosDiamond, needItemsNum]);
    });
};

//法宝升星
exports.upTrumpStar = function(client, userId, tempId, trumpId, cb) {
    checkRequire();
    var talisman = t_talisman[trumpId];
    if (!talisman) return cb(getMsg(c_msgCode.abnormalData)); //数据异常");
    var tempId2Job = Number.tempId2Job(tempId);
    if (talisman.job != tempId2Job) return cb(getMsg(c_msgCode.abnormalData)); //数据异常");
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){ 
        if (err) return cb(err); 
        var userData = gamePlayer.userData; //, heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        userData.bag = userData.bag || {};
        var bag = userData.bag || {};
        var exData = userData.exData || {};
        heroData.talismanData = heroData.talismanData || {};
        var talismanData = heroData.talismanData || {}; //法宝数据{法宝id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...}],法宝id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...}],....}
        var trumpData = talismanData[trumpId];
        if (!trumpData) return cb("还未拥有该法宝");
        var lvl = trumpData[0] || 1; //当前等级
        var starLvl = trumpData[2] || 0; //当前升星等级
        var lvlLimit = t_talismanLvl[parseInt(trumpId) + parseInt(lvl)].starLimit; //等级上限
        if (starLvl >= lvlLimit) return cb(getMsg(c_msgCode.maxStarIs, lvlLimit)); //当前开启最大星级为"+ lvlLimit
        var starLimit = c_game.trumpCfg[2]; //升星上限
        if (starLvl >= starLimit) return cb(getMsg(c_msgCode.upStarMax)); //已达到升星上限

        var costCandyNum = 0;
        var delBagItems = {};
        var t_talismanStarId = parseInt(trumpId) + parseInt(starLvl);
        var needItems = t_talismanStar[t_talismanStarId].needItems;
        for (var i = 0; i < needItems.length; i++) {
            var itemId = needItems[i][0];
            var itemCount = needItems[i][1];
            if (!bag[itemId] || bag[itemId] < itemCount) return cb(getMsg(c_msgCode.noUpStarMaterial)); //升星材料不足
            if (itemId == 56) costCandyNum += itemCount;
            delBagItems[itemId] = itemCount;
            userUtils.delBag(userData, itemId, itemCount, c_prop.itemCostTypeKey.talisman);
        }
        heroData.talismanData[trumpId][2] = starLvl + 1;
        var maxStar = heroData.talismanData[trumpId][3] || 0;
        var isHighStar = false;
        if ((starLvl + 1) > maxStar) {
            heroData.talismanData[trumpId][3] = starLvl + 1;
            isHighStar = true;
        }

        chatBiz.addSysData(130, [userData.nickName, heroData.talismanData[trumpId][2]]); //宠物升星达到

        //是否获得技能
        var isGetSkill = false;
        var skillId = t_talismanStar[t_talismanStarId].skillId;
        if (skillId) {
            var getPro = t_talismanStar[t_talismanStarId].getPro;
            var randomNum = _getRandomNumber(1, 10000);
            if (randomNum <= getPro) { //获得
                isGetSkill = true;
                var type = t_talismanSkill[skillId].type;
                if (type != c_prop.talismanSkillTypeKey.property) { //记录到exData
                    if (!exData[c_prop.userExDataKey.talismanSkill]) exData[c_prop.userExDataKey.talismanSkill] = {};
                    if (!exData[c_prop.userExDataKey.talismanSkill][type]) exData[c_prop.userExDataKey.talismanSkill][type] = [];
                    exData[c_prop.userExDataKey.talismanSkill][type].push(skillId);
                }
                var skillObj = trumpData[4] || {}; //{星级:技能id,星级:技能id,...}
                skillObj[starLvl + 1] = skillId;
                heroData.talismanData[trumpId][4] = skillObj;
                heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
                heroData.combat = heroPropHelper.calCombat(userData, heroData);
            }
        }

        //更新
        var upUserData = {
            exData: userData.exData
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        var upHeroData = {
            id: heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            talismanData: heroData.talismanData
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        cb(null, [upHeroData, delBagItems, isGetSkill, upUserData, isHighStar, costCandyNum]);
    });
};

//英雄升星
exports.upHeroStar = function(client, userId, tempId, cb) {
    checkRequire();
    // var heroStar = t_heroStar[tempId];
    // if(!heroStar) return cb(getMsg(c_msgCode.abnormalData));//数据异常");
    // var tempId2Job = Number.tempId2Job(tempId);
    // if(talisman.job != tempId2Job) return cb(getMsg(c_msgCode.abnormalData));//数据异常");

    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){ 
        if (err) return cb(err); 
        var userData = gamePlayer.userData; //, heroDataList = data[1];
        // var tempId2Job = Number.tempId2Job(tempId);
        // var heroData = null;
        // // console.log('dfsdsdasdas',heroDataList);
        // for(var i=0;i<heroDataList.length;i++){
        //     // console.log('fsdfsdfsdfsdasd',tempId2Job,heroDataList[i].tempId,Number.tempId2Job(heroDataList[i].tempId));
        //     if(tempId2Job == Number.tempId2Job(heroDataList[i].tempId)){
        //         heroData = heroDataList[i];
        //         break;
        //     }
        // }
        var heroData = gamePlayer.getHeroByJob(tempId);

        if (!heroData || heroData == null) return cb(getMsg(c_msgCode.noProfession)); //该职业尚未开启
        userData.bag = userData.bag || {};
        var bag = userData.bag || {};
        var exData = userData.exData || {};
        //英雄数据{英雄id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...},英雄获得时间,亲密度等级,是否激活羁绊],英雄id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...},英雄获得时间,亲密度等级,是否激活羁绊],....}
        userData.heroData = userData.heroData || {};
        var userHeroData = userData.heroData || {};
        if (!userHeroData[tempId]) return cb(getMsg(c_msgCode.noHero)); //还未拥有该英雄
        var trumpData = userHeroData[tempId];

        //兼容老号
        if (!Array.isArray(trumpData)) {
            userBiz.initHeroStar(userData, tempId, function() {});
        }

        var lvl = trumpData[0] || 1; //当前等级
        var starLvl = trumpData[2] || 0; //当前升星等级

        var lvlLimit = c_game.trumpHero[0]; //升星上限
        if (starLvl >= lvlLimit) return cb(getMsg(c_msgCode.upStarMax)); //已达到升星上限

        var costCandyNum = 0;
        var delBagItems = {};
        var t_heroStarId = (tempId + '00' + starLvl) * 1;
        var needItems = t_heroStar[t_heroStarId].needItems;
        // console.log('fsdasdasdasd',needItems);
        if (needItems) {
            for (var i = 0; i < needItems.length; i++) {
                var itemId = needItems[i][0];
                var itemCount = needItems[i][1];
                if (!bag[itemId] || bag[itemId] < itemCount) return cb(getMsg(c_msgCode.noUpStarMaterial)); //升星材料不足
                costCandyNum += itemCount;
                delBagItems[itemId] = itemCount;
            }
        }

        // 需要先保证所有材料都足够
        if (needItems) {
            for (var i = 0; i < needItems.length; i++) {
                var itemId = needItems[i][0];
                var itemCount = needItems[i][1];
                userUtils.delBag(userData, itemId, itemCount, c_prop.itemCostTypeKey.heroUpStar);
            }
        }

        userData.heroData[tempId][2] = starLvl + 1;
        var maxStar = userData.heroData[tempId][3] || 0;
        var isHighStar = false;
        if ((starLvl + 1) > maxStar) {
            userData.heroData[tempId][3] = starLvl + 1;
            isHighStar = true;
        }

        // chatBiz.addSysData(130,[userData.nickName, heroData.talismanData[tempId][2] ]);//宠物升星达到
        if (tempId == 404) { //目前只有塔利斯有这类任务  暂时这么写
            heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.heroStar, userData.heroData[tempId][2]);
        }

        //任一英雄升到XX星
        taskBiz.setTaskValue(client, userId, c_prop.cTaskTypeKey.heroStar, userData.heroData[tempId][2], function() {});

        //是否获得技能
        var isGetSkill = false;
        var skillId = t_heroStar[t_heroStarId].skillId;
        if (skillId) {
            var getPro = t_heroStar[t_heroStarId].getPro;
            var randomNum = _getRandomNumber(1, 10000);
            if (randomNum <= getPro) { //获得
                isGetSkill = true;
                var type = t_talismanSkill[skillId].type;
                if (type != c_prop.talismanSkillTypeKey.property) { //记录到exData
                    if (!exData[c_prop.userExDataKey.talismanSkill]) exData[c_prop.userExDataKey.talismanSkill] = {};
                    if (!exData[c_prop.userExDataKey.talismanSkill][type]) exData[c_prop.userExDataKey.talismanSkill][type] = [];
                    exData[c_prop.userExDataKey.talismanSkill][type].push(skillId);
                }
                var skillObj = trumpData[4] || {}; //{星级:技能id,星级:技能id,...}
                skillObj[starLvl + 1] = skillId;
                userData.heroData[tempId][4] = skillObj;


                heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
                heroData.combat = heroPropHelper.calCombat(userData, heroData);
            }
        }

        //更新
        var upUserData = {
            exData: userData.exData,
            heroNum: userData.heroNum,
            heroData: userData.heroData
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        var upHeroData = {
            id: heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        cb(null, [upHeroData, delBagItems, isGetSkill, upUserData, isHighStar, costCandyNum]);
    });
};

//法宝重铸
exports.recastTrump = function(client, userId, tempId, trumpId, cb) {
    checkRequire();

    var talisman = t_talisman[trumpId];
    if (!talisman) return cb(getMsg(c_msgCode.abnormalData)); //数据异常
    var tempId2Job = Number.tempId2Job(tempId);
    if (talisman.job != tempId2Job) return cb(getMsg(c_msgCode.abnormalData)); //数据异常
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){ 
        if (err) return cb(err); 
        var userData = gamePlayer.userData; //, heroData = data[1];
        var heroData = gamePlayer.getHeroByTempId(tempId);
        var exData = userData.exData || {};
        heroData.talismanData = heroData.talismanData || {};
        var talismanData = heroData.talismanData || {}; //法宝数据{法宝id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...}],法宝id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...}],....}
        var trumpData = talismanData[trumpId];
        if (!trumpData) return cb("还未拥有该法宝");
        var starLvl = trumpData[2] || 0; //当前升星等级
        if (starLvl <= 0) return cb(getMsg(c_msgCode.atMinStar)); //已降至最低星级

        //减星
        heroData.talismanData[trumpId][2] = 0; //starLvl - 1;
        //是否扣除技能
        var isUp = false;
        var skillObj = trumpData[4] || {}; //{星级:技能id,星级:技能id,...}
        //if(skillObj[starLvl]){      //需要扣除技能
        //    var skillId = skillObj[starLvl];
        //    var type = t_talismanSkill[skillId].type;
        //    if(type != c_prop.talismanSkillTypeKey.property){      //记录到exData
        //        if(exData[c_prop.userExDataKey.talismanSkill] && exData[c_prop.userExDataKey.talismanSkill][type] && exData[c_prop.userExDataKey.talismanSkill][type].indexOf(skillId) != -1){
        //            var skillArr = exData[c_prop.userExDataKey.talismanSkill][type];
        //            for(var i = 0 ;i<skillArr.length;i++){
        //                if(skillId == skillArr[i]){
        //                    isUp = true;
        //                    skillArr.splice(i,1);
        //                }
        //            }
        //        }
        //    }
        //    delete skillObj[starLvl];
        //    heroData.talismanData[trumpId][4] = skillObj;
        //    heroData.propArr =  heroPropHelper.calHeroProp(userData,heroData);
        //    heroData.combat =  heroPropHelper.calCombat(userData,heroData);
        //}
        for (var key in skillObj) {
            var skillId = skillObj[key];
            var type = t_talismanSkill[skillId].type;
            if (type != c_prop.talismanSkillTypeKey.property) { //记录到exData
                if (exData[c_prop.userExDataKey.talismanSkill] && exData[c_prop.userExDataKey.talismanSkill][type] && exData[c_prop.userExDataKey.talismanSkill][type].indexOf(skillId) != -1) {
                    var skillArr = exData[c_prop.userExDataKey.talismanSkill][type];
                    for (var i = 0; i < skillArr.length; i++) {
                        if (skillId == skillArr[i]) {
                            isUp = true;
                            skillArr.splice(i, 1);
                        }
                    }
                }
            }
        }
        heroData.talismanData[trumpId][4] = {};
        heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
        heroData.combat = heroPropHelper.calCombat(userData, heroData);

        //更新
        var upHeroData = {
            id: heroData.id,
            propArr: heroData.propArr,
            combat: heroData.combat,
            talismanData: heroData.talismanData
        };
        gamePlayer.setHeroDataDirty(heroData.id);
        var upUserData = {
            exData: userData.exData
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        // async.parallel([
        //     function (cb1) {
        //         // if(isUp){
        //         //     userDao.update(client, upUserData, {id: userId}, cb1);
        //         // }else{
        //            cb1();
        //         //}
        //     },
        //     function (cb1) {
        //         heroDao.update(client, upHeroData, {id: heroData.id}, cb1);
        //     }
        // ], function (err, data) {
        //     if (err) return cb(err);
        cb(null, [upHeroData, upUserData, isUp]);
        //});
    })
};

//法宝合成
exports.compoundTrump = function(client, userId, tempId, trumpId, cb) {
    // checkRequire();
    // var talisman = t_talisman[trumpId];
    // if (!talisman) return cb(getMsg(c_msgCode.abnormalData)); //数据异常");
    // var tempId2Job = Number.tempId2Job(tempId);
    // if (talisman.job != tempId2Job) return cb(getMsg(c_msgCode.abnormalData)); //数据异常");
    // async.parallel([
    //     function(cb1) {
    //         g_cache.getGamePlayer(client, userId, cb1);
    //     }
    // ], function(err, data) {
    //     if (err) return cb(err);
    //     var gamePlayer = data[0];
    //     var userData = gamePlayer.userData; //, heroData = data[1];
    //     var heroData = gamePlayer.getHeroByTempId(tempId);
    //     var talismanAdorn = heroData.talismanAdorn || 0;
    //     heroData.talismanData = heroData.talismanData || {};
    //     var talismanData = heroData.talismanData || {}; //法宝数据{法宝id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...}],法宝id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...}],....}
    //     var compoundNeedObj = {}; //合成所需物品
    //     var talismanCom = t_talismanCom[trumpId];
    //     if (!talismanCom) return cb(getMsg(c_msgCode.abnormalData)); //数据异常");
    //     var reqItems1 = talismanCom.reqItems1;
    //     if (reqItems1) compoundNeedObj[reqItems1] = [talismanCom.reqCount1, talismanCom.needLvl1, talismanCom.needStar1]; //[数量,要求等级,要求星级]
    //     var reqItems2 = talismanCom.reqItems2;
    //     if (reqItems2) compoundNeedObj[reqItems2] = [talismanCom.reqCount2, talismanCom.needLvl2, talismanCom.needStar2];
    //     var reqItems3 = talismanCom.reqItems3;
    //     if (reqItems3) compoundNeedObj[reqItems3] = [talismanCom.reqCount3, talismanCom.needLvl3, talismanCom.needStar3];

    //     //判断合成材料
    //     for (var key in compoundNeedObj) {
    //         var trumpData = talismanData[key];
    //         if (!trumpData) return cb(getMsg(c_msgCode.noSynthesis));
    //         var trumpLvl = trumpData[0] || 1;
    //         if (trumpLvl < compoundNeedObj[key][1]) return cb(getMsg(c_msgCode.lowLevelTalismen));
    //         var trumpStar = trumpData[2] || 0;
    //         if (trumpStar < compoundNeedObj[key][2]) return cb(getMsg(c_msgCode.lowStarTailsmen));
    //         delete heroData.talismanData[key];
    //         if (talismanAdorn == key) heroData.talismanAdorn = 0;
    //     }
    //     //获取合成物品
    //     let bagItems = {};
    //     if (talismanData[trumpId]) { //如果存在 直接放入背包
    //         bagItems[trumpId] = 1;
    //         gamePlayer.saveItems(userData, bagItems, c_prop.itemGetTypeKey.other);
    //     } else { //直接穿戴
    //         var randomNum = _getRandomNumber(t_talisman[trumpId].atStart, t_talisman[trumpId].atEnd);
    //         heroData.talismanData[trumpId] = [1, randomNum, 0, 0, {}]; //法宝id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...}]
    //     }

    //     //属性计算
    //     heroData.propArr = heroPropHelper.calHeroProp(userData, heroData);
    //     heroData.combat = heroPropHelper.calCombat(userData, heroData);

    //     gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems));
    //     var upHeroData = {
    //         id: heroData.id,
    //         propArr: heroData.propArr,
    //         combat: heroData.combat,
    //         talismanAdorn: heroData.talismanAdorn,
    //         talismanData: heroData.talismanData
    //     };
    //     gamePlayer.setHeroDataDirty(heroData.id);
    //     cb(null, [upHeroData, bagItems]);
    // });
};

//法宝战力更新
exports.updateCombat = function(client, userId, tempId, combat, cb) {

    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err); 
        //  var upHeroData = {
        //     talismanCombat:combat 
        // }; 
        var heroData = gamePlayer.getHero(tempId);
        heroData.talismanCombat = combat;
        gamePlayer.setHeroDataDirty(heroData.id);
        return cb(null, null);
        //heroDao.update(client, upHeroData, {id: tempId, userId: userId}, cb);
    })

};

/*****************************************************************************************************/


//输出指定范围内的随机数的随机整数
var _getRandomNumber = function(start, end) {
    start = parseInt(start);
    end = parseInt(end);
    var choice = end - start + 1;
    return Math.floor(Math.random() * choice + start);
};

/**
 * 亲密升级
 * @param client
 * @param userId
 * @param tempId
 * @param cb
 */
exports.giveGiftToHero = function(client, userId, tempId, cb) {
    if (!t_hero[tempId]) return cb(getMsg(c_msgCode.protocolError));
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err); 
        let userData = gamePlayer.userData;
        let heroData = userData.heroData;
        if (!heroData[tempId]) {
            return cb(getMsg(c_msgCode.protocolError));
        }
        let targetHeroData = heroData[tempId];
        let heroGiftId = targetHeroData[6] || 0;
        if (heroGiftId === 0) {
            heroGiftId = t_hero[tempId].heroGiftId;
        } else {
            heroGiftId = heroGiftId + 1;
        }
        if (t_heroGift[heroGiftId].heroId !== tempId)
            return cb(getMsg(c_msgCode.protocolError));

        let t_heroGiftData = t_heroGift[heroGiftId];
        if (!t_heroGiftData) {
            return cb(getMsg(c_msgCode.protocolError));
        }

        let bag = userData.bag;
        let delItems = {};
        if (t_heroGiftData.cost) {
            for (let i = 0; i < t_heroGiftData.cost.length; i++) {
                let itemId = t_heroGiftData.cost[i][0];
                let itemCount = t_heroGiftData.cost[i][1];
                if (!bag[itemId] || bag[itemId] < itemCount) return cb(getMsg(c_msgCode.noItem));
                delItems[itemId] = itemCount;
            }
        }

        if (Object.keys(delItems).length > 0) {
            userUtils.delBag(userData, delItems, c_prop.itemCostTypeKey.other);
        }
        targetHeroData[6] = heroGiftId;
        userUtils.checkHeroEntranceTask(gamePlayer, c_game.heroTask[1], t_heroGiftData.level);
        //紧急委托  记录人物亲密等级
        taskBiz.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.intimacy, t_heroGiftData.level, function() {});

        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        let updateUserData = {
            heroData: userData.heroData
        };

        return cb(null, [updateUserData, delItems]);
    })
};

/**
 * 激活永恒羁绊
 * @param client
 * @param userId
 * @param tempId
 * @param cb
 */
exports.activeForever = function(client, userId, tempId, cb) {
    if (!t_hero[tempId]) return cb(getMsg(c_msgCode.protocolError));
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err); 
        let userData = gamePlayer.userData;
        let heroData = userData.heroData;
        if (!heroData[tempId]) {
            return cb(getMsg(c_msgCode.protocolError));
        }
        let targetHeroData = heroData[tempId];
        let active = targetHeroData[7] || 0;
        if (active === 1) {
            return cb(getMsg(c_msgCode.protocolError));
        }
        let heroGiftId = targetHeroData[6] || 0;
        let t_heroHeroGiftData = t_heroGift[heroGiftId];
        let t_heroPledgeData = t_heroPledge[tempId];
        if (!t_heroHeroGiftData || t_heroHeroGiftData.level < t_heroPledgeData.level) {
            return cb(getMsg(c_msgCode.protocolError));
        }

        let bag = userData.bag;
        let delItems = {};
        if (t_heroPledgeData.cost) {
            for (let i = 0; i < t_heroPledgeData.cost.length; i++) {
                let itemId = t_heroPledgeData.cost[i][0];
                let itemCount = t_heroPledgeData.cost[i][1];
                if (!bag[itemId] || bag[itemId] < itemCount) return cb(getMsg(c_msgCode.noItem));
                delItems[itemId] = itemCount;
            }
        }

        if (delItems) {
            userUtils.delBag(userData, delItems, c_prop.itemCostTypeKey.other);
        }
        targetHeroData[7] = 1;
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        let updateUserData = {
            heroData: userData.heroData
        };
        return cb(null, [updateUserData, delItems]);
    })
};