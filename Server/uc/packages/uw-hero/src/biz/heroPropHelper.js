/**
 * Created by Administrator on 2015/9/23.
 */
var uwData = require("uw-data");
var c_lvl = uwData.c_lvl;
var c_prop = uwData.c_prop;
var t_hero = uwData.t_hero;
var t_item = uwData.t_item;
var t_rebirth = uwData.t_rebirth;
var t_monster = uwData.t_monster;
var t_collector = uwData.t_collector;
var t_itemAttribute = uwData.t_itemAttribute;
var t_itemEquip = uwData.t_itemEquip;
var t_itemBreak = uwData.t_itemBreak;
var t_talisman = uwData.t_talisman;
var t_talismanLvl = uwData.t_talismanLvl;
var t_talismanRes = uwData.t_talismanRes;
var t_talismanSkill = uwData.t_talismanSkill;
var t_talismanStar = uwData.t_talismanStar;
var t_heroGift = uwData.t_heroGift;
var t_heroPledge = uwData.t_heroPledge;
var t_otherBuff = uwData.t_otherBuff;
var c_gem = uwData.c_gem;
var t_wing = uwData.t_wing;
var t_wingStrength = uwData.t_wingStrength;
var c_realm = uwData.c_realm;
var t_skill = uwData.t_skill;
var t_itemRealm = uwData.t_itemRealm;
var c_game = uwData.c_game;
var c_guildLvl = uwData.c_guildLvl;
var c_guildEnnoble = uwData.c_guildEnnoble;
var logger = require("uw-log").getLogger("uw-logger", __filename);
var formula = require("uw-formula");
var g_guild = require("uw-global").g_guild;
var g_data = require("uw-global").g_data;
var t_medal = uwData.t_medal;
var t_medalLvl = uwData.t_medalLvl;
var t_strengthRefine = uwData.t_strengthRefine;
var c_demonLotus = uwData.c_demonLotus;
var c_starSoul = uwData.c_starSoul;
var c_heartStuntLvl = uwData.c_heartStuntLvl;
var t_achieve = uwData.t_achieve;
var t_cyb = uwData.t_cyb;
var t_junxian = uwData.t_junxian;
var t_holyStrength = uwData.t_holyStrength;
var t_holyResonance = uwData.t_holyResonance;
var t_magicBook = uwData.t_magicBook;
var t_itemEquipEnchant = uwData.t_itemEquipEnchant;
var t_elfWaking = uwData.t_elfWaking;
var t_elfWakingLvl = uwData.t_elfWakingLvl;
var exports = module.exports;
var MAX_PROP = 59;

/**
 * 计算英雄属性
 * @param userData 必须包含lvl ,equipBag, id,rebirthLvl,medalData,isKing,propertyData,buff,,achieveLvl,cybLvl,jxLvl,heroData
 * @param heroData
 */
exports.calHeroProp = function(userData, heroData) {
    var userLvl = userData.lvl,
        equipBag = userData.equipBag,
        isKing = userData.isKing;
    var propArr = [];
    _clearPropArr(propArr);

    //固定属性
    var t_heroData = t_hero[heroData.tempId];
    _addPropValue(propArr, c_prop.heroPropKey.moveSpeedTemp, t_heroData.moveSpeed);
    _addPropValue(propArr, c_prop.heroPropKey.attackIntervalTemp, t_heroData.attackInterval);

    // fix: 等级超出 c_lvl 配置上限时回退到最高配置行，避免 c_levelUpData.* 报错导致请求挂死
    var c_levelUpData = c_lvl[userLvl];
    if (!c_levelUpData) {
        var _maxLvlKey = -1;
        for (var _k in c_lvl) {
            var _nk = parseInt(_k);
            if (!isNaN(_nk) && _nk > _maxLvlKey) _maxLvlKey = _nk;
        }
        c_levelUpData = c_lvl[_maxLvlKey] || c_lvl[0];
    }
    //计算基础成长
    //maxHp attack  defence magicDefence    hit dodge   critical    disCritical
    //幻术师特殊
    // var addons = t_heroData.addons;
    // addons = addons.split(',');
    // addons = addons.map(function(item){
    //     return item*.01;
    // });
    var addons = {};
    addons[0] = 0;
    if (t_heroData.job == c_prop.heroJobKey.ys) {

        _addPropValue(propArr, c_prop.heroPropKey.maxHp, c_levelUpData.maxHp2 * (1 + addons[0]));
        _addPropValue(propArr, c_prop.heroPropKey.attack, c_levelUpData.attack2 * (1 + addons[0]));
        _addPropValue(propArr, c_prop.heroPropKey.defence, c_levelUpData.defence2 * (1 + addons[0]));
        _addPropValue(propArr, c_prop.heroPropKey.magicDefence, c_levelUpData.magicDefence2 * (1 + addons[0]));
        _addPropValue(propArr, c_prop.heroPropKey.hit, c_levelUpData.hit2 * (1 + addons[0]));
        _addPropValue(propArr, c_prop.heroPropKey.dodge, c_levelUpData.dodge2 * (1 + addons[0]));
        _addPropValue(propArr, c_prop.heroPropKey.critical, c_levelUpData.critical2 * (1 + addons[0]));
        _addPropValue(propArr, c_prop.heroPropKey.disCritical, c_levelUpData.disCritical2 * (1 + addons[0]));
    } else {

        _addPropValue(propArr, c_prop.heroPropKey.maxHp, c_levelUpData.maxHp * (1 + addons[0]));
        _addPropValue(propArr, c_prop.heroPropKey.attack, c_levelUpData.attack * (1 + addons[0]));
        _addPropValue(propArr, c_prop.heroPropKey.defence, c_levelUpData.defence * (1 + addons[0]));
        _addPropValue(propArr, c_prop.heroPropKey.magicDefence, c_levelUpData.magicDefence * (1 + addons[0]));
        _addPropValue(propArr, c_prop.heroPropKey.hit, c_levelUpData.hit * (1 + addons[0]));
        _addPropValue(propArr, c_prop.heroPropKey.dodge, c_levelUpData.dodge * (1 + addons[0]));
        _addPropValue(propArr, c_prop.heroPropKey.critical, c_levelUpData.critical * (1 + addons[0]));
        _addPropValue(propArr, c_prop.heroPropKey.disCritical, c_levelUpData.disCritical * (1 + addons[0]));
    }
    //计算装备
    var equipData = heroData.equipData || {}; //{"部位":物品id,....}
    var intensifyArr = heroData.intensifyArr || []; //强化[等级,等级,...] 下标对应装备位置
    var starArr = heroData.starArr || []; //星级[星级,星级,...] 下标对应装备位置
    var gemArr = heroData.gemArr || []; //[id,id,id,...]    //宝石
    var enchantArr = heroData.enchantArr || []; //[等级,等级,...] 下标对应装备位置    //附魔

    var refineArr = heroData.refineArr || [];
    /*装备精炼[等级,等级,...] 下标对应装备位置*/
    var starTopArr = heroData.starTopArr || [];
    /*升星突破[升星突破重数,升星突破重数,...] 下标对应装备位置*/


    var holyPropArr = []; // 神圣属性
    _clearPropArr(holyPropArr);

    for (var key in equipData) {
        var locItemUid = equipData[key];
        if (!locItemUid) continue;
        var locBagData = [];
        var locItemId = null;
        //戒指存的是tempid
        if (key == c_prop.heroEquipIndexKey.paralysisRing ||
            key == c_prop.heroEquipIndexKey.reviveRing ||
            key == c_prop.heroEquipIndexKey.protectRing ||
            key == c_prop.heroEquipIndexKey.harmRing
        ) {
            locItemId = locItemUid;
        } else {
            locBagData = equipBag[locItemUid] || {};
            locItemId = locBagData[0];
        }

        //物品基础属性

        var locItemData = t_item[locItemId];
        if (!locItemData) {
            //logger.error("英雄计算属性没有这个装备，这是为什么呢，locItemUid[%s],locItemId[%s]",locItemUid,locItemId);
            logger.error("英雄计算属性没有这个装备，这是为什么呢，uid[%d], heroid[%d],locItemUid[%s],locItemId[%s]", userData.id, heroData.id, locItemUid, locItemId);
            continue;
        }
        if (locItemData.type == c_prop.itemTypeKey.equip) {
            var locItemEquipData = t_itemEquip[locItemId];
            if (!locItemEquipData) {
                continue;
            }
            if (locItemEquipData.type == c_prop.equipTypeKey.angelOrDemon) { // 天使恶魔装备
                var angelOrDemonPropArr = []; // 小天使小恶魔装备
                _clearPropArr(angelOrDemonPropArr);
                _addPropsToProp(angelOrDemonPropArr, locItemEquipData.propertys);

                var addition = locItemEquipData.addition || 0;
                //小天使   生命 抗暴  闪避   吃加成
                _addPropValue(propArr, c_prop.heroPropKey.maxHpTemp, angelOrDemonPropArr[c_prop.heroPropKey.maxHpTemp] * (1 + addition / 10000));
                _addPropValue(propArr, c_prop.heroPropKey.disCriticalTemp, angelOrDemonPropArr[c_prop.heroPropKey.disCriticalTemp] * (1 + addition / 10000));
                _addPropValue(propArr, c_prop.heroPropKey.dodgeTemp, angelOrDemonPropArr[c_prop.heroPropKey.dodgeTemp] * (1 + addition / 10000));
                //小恶魔   攻击  暴击  命中  吃加成
                _addPropValue(propArr, c_prop.heroPropKey.attackTemp, angelOrDemonPropArr[c_prop.heroPropKey.attackTemp] * (1 + addition / 10000));
                _addPropValue(propArr, c_prop.heroPropKey.criticalTemp, angelOrDemonPropArr[c_prop.heroPropKey.criticalTemp] * (1 + addition / 10000));
                _addPropValue(propArr, c_prop.heroPropKey.hitTemp, angelOrDemonPropArr[c_prop.heroPropKey.hitTemp] * (1 + addition / 10000));
                //不吃加成
                _addPropValue(propArr, c_prop.heroPropKey.maxHpScale2, angelOrDemonPropArr[c_prop.heroPropKey.maxHpScale2]);
                _addPropValue(propArr, c_prop.heroPropKey.damageDecreaseTemp, angelOrDemonPropArr[c_prop.heroPropKey.damageDecreaseTemp]);
                _addPropValue(propArr, c_prop.heroPropKey.damageIncrease, angelOrDemonPropArr[c_prop.heroPropKey.damageIncrease]);
                _addPropValue(propArr, c_prop.heroPropKey.attackScale2, angelOrDemonPropArr[c_prop.heroPropKey.attackScale2]);

            } else if (locItemEquipData.isSacred) { // 神圣装备
                //var locPropertys = locItemEquipData.propertys;
                //console.log("ADD HOLY EQUIP:", locPropertys);
                _addPropsToProp(holyPropArr, locItemEquipData.propertys);

            } else {
                //var locEquipPropertys = locItemEquipData.propertys;
                //var locPropertys = [];
                // 原先的定制装备 注释掉 
                // var chuanchenIdArr = c_game.customizationCfg[14];
                // chuanchenIdArr = chuanchenIdArr.split(",");
                // if(locItemId>=parseInt(chuanchenIdArr[0])&&locItemId<=parseInt(chuanchenIdArr[1])){
                //     var indexArr = locBagData[5]||[];
                //     for(var indexI = 0 ;indexI<indexArr.length;indexI++){
                //         var locIndex = indexArr[indexI];
                //         locPropertys.push(locEquipPropertys[locIndex]);
                //     }
                // }else{
                //     locPropertys = locEquipPropertys;
                // }
                var locPropertys = locItemEquipData.propertys;
                _addPropsToProp(propArr, locPropertys);

                //升星
                //upStarPropAdd
                var upStarPropArr = [33, 34, 35, 36, 37, 38, 39, 40]; //受升星加成的属性
                var upStarPropertys = [];
                for (var i = 0, len = locPropertys.length; i < len; i++) {
                    if (upStarPropArr.indexOf(locPropertys[i][0]) > -1) {
                        upStarPropertys.push(locPropertys[i]);
                    }
                }
                var upStarPropAdd = c_lvl[starArr[key] || 0].upStarPropAdd / 10000;
                _addPropsToProp(propArr, upStarPropertys, upStarPropAdd);
                //[10,4,null,4]
                //升星突破
                var starTopProps = c_lvl[starTopArr[key] || 0].propertys;
                var topAddIndex = 0;
                var topAddValue = 0;
                var leftIndexArr = [0, 1, 2, 3];
                if (leftIndexArr.indexOf(parseInt(key)) > -1) {
                    var topProps = starTopProps[key] || [];
                    topAddIndex = topProps[0];
                    topAddValue = topProps[1];
                }
                var rightIndexArr = [8, 9, 10, 11];
                if (rightIndexArr.indexOf(parseInt(key)) > -1) {
                    var topProps = starTopProps[key - 4] || [];
                    topAddIndex = topProps[0];
                    topAddValue = topProps[1];
                }

                _addPropValue(propArr, topAddIndex, topAddValue);

                //强化属性
                //slotStrengthProperty  propValue
                var propValue = (locItemEquipData.propValue || 0) * (intensifyArr[key] || 0);
                //强化精炼
                var strengthAdd = t_strengthRefine[refineArr[key] || 0].strAddition;
                _addPropValue(propArr, locItemEquipData.slotStrengthProperty, propValue * (1 + strengthAdd / 10000));

                //宝石
                var locGemId = gemArr[key];
                var locGemData = c_gem[locGemId];
                if (locGemData) {
                    _addPropValue(propArr, locGemData.effectType1, locGemData.effectPro1);
                    _addPropValue(propArr, locGemData.effectType2, locGemData.effectPro2);
                    _addPropValue(propArr, locGemData.effectType3, locGemData.effectPro3);
                    _addPropValue(propArr, locGemData.effectType4, locGemData.effectPro4);
                }

                //随机属性
                var locRandomProps = locBagData[1];

                if (locRandomProps) {
                    _addPropsToProp(propArr, locRandomProps);
                }

                //装备附魔
                var enchantLvl = enchantArr[key];
                if(enchantLvl){
                    var enchantCfg = t_itemEquipEnchant[enchantLvl];
                    var canEnchantTypes = {};
                    canEnchantTypes[c_prop.heroEquipIndexKey.weapon] = 'weapon';
                    canEnchantTypes[c_prop.heroEquipIndexKey.clothes] = 'clothes';
                    canEnchantTypes[c_prop.heroEquipIndexKey.bracelet1] = 'bracelet1';
                    canEnchantTypes[c_prop.heroEquipIndexKey.ring1] = 'ring1';
                    canEnchantTypes[c_prop.heroEquipIndexKey.ring2] = 'ring2';
                    canEnchantTypes[c_prop.heroEquipIndexKey.bracelet2] = 'bracelet2';
                    canEnchantTypes[c_prop.heroEquipIndexKey.helmet] = 'helmet';
                    canEnchantTypes[c_prop.heroEquipIndexKey.necklace] = 'necklace';
                    var cfg_field = canEnchantTypes[key];
                    if(cfg_field){
                        var enchantProps = enchantCfg[cfg_field];
                        // console.error('enchantProps=========>',enchantProps);
                        _addPropsToProp(propArr, enchantProps);
                    }
                }
            }
        }
        if (locItemData.type == c_prop.itemTypeKey.break) {
            var locItemBreakData = t_itemBreak[locItemId];
            if (locItemBreakData) {
                var locPropertys = locItemBreakData.props;
                _addPropsToProp(propArr, locPropertys);
            }
        }
    }

    //console.log("HOLYPROPARR:", JSON.stringify(holyPropArr));
    // 神圣属性
    var holyArr = heroData.holyArr || [0, 0, 0, 0];
    var holyLeftLvl = holyArr[0] || 0;
    var holyRightLvl = holyArr[2] || 0;

    // 徽章法典基础属性
    _addPropValue(holyPropArr, c_prop.heroPropKey.attackTemp, t_holyStrength[holyLeftLvl].attackTemp);
    _addPropValue(holyPropArr, c_prop.heroPropKey.maxHpTemp, t_holyStrength[holyRightLvl].maxHpTemp);

    // 徽章法典加成属性
    //console.log("ADD PROP22:", c_prop.heroPropKey.attackTemp, holyPropArr[c_prop.heroPropKey.attackTemp], holyPropArr[c_prop.heroPropKey.attackTemp] * (1+t_holyStrength[holyLeftLvl].attack/10000));
    _addPropValue(propArr, c_prop.heroPropKey.attackTemp, holyPropArr[c_prop.heroPropKey.attackTemp] * (1 + t_holyStrength[holyLeftLvl].attack / 10000));
    _addPropValue(propArr, c_prop.heroPropKey.defenceTemp, holyPropArr[c_prop.heroPropKey.defenceTemp] * (1 + t_holyStrength[holyLeftLvl].defence / 10000));
    _addPropValue(propArr, c_prop.heroPropKey.criticalTemp, holyPropArr[c_prop.heroPropKey.criticalTemp] * (1 + t_holyStrength[holyLeftLvl].critical / 10000));
    _addPropValue(propArr, c_prop.heroPropKey.hitTemp, holyPropArr[c_prop.heroPropKey.hitTemp] * (1 + t_holyStrength[holyLeftLvl].hit / 10000));

    _addPropValue(propArr, c_prop.heroPropKey.maxHpTemp, holyPropArr[c_prop.heroPropKey.maxHpTemp] * (1 + t_holyStrength[holyRightLvl].maxHp / 10000));
    _addPropValue(propArr, c_prop.heroPropKey.magicDefenceTemp, holyPropArr[c_prop.heroPropKey.magicDefenceTemp] * (1 + t_holyStrength[holyRightLvl].magicDefence / 10000));
    _addPropValue(propArr, c_prop.heroPropKey.disCriticalTemp, holyPropArr[c_prop.heroPropKey.disCriticalTemp] * (1 + t_holyStrength[holyRightLvl].disCritical / 10000));
    _addPropValue(propArr, c_prop.heroPropKey.dodgeTemp, holyPropArr[c_prop.heroPropKey.dodgeTemp] * (1 + t_holyStrength[holyRightLvl].dodge / 10000));

    //深渊共鸣
    var holyRes = heroData.holyRes || {};
    for (var key in holyRes) {
        if (holyRes[key] > 0 && t_holyResonance[holyRes[key]]) {
            var field = 'resonance' + key;
            if (t_holyResonance[holyRes[key]][field]) {
                var holyResProps = t_holyResonance[holyRes[key]][field];
                //console.error(heroData.tempId, '计算深渊共鸣属性', holyResProps);
                _addPropsToProp(propArr, holyResProps);
            }
        }
    }
    // if (holyRes["2"] > 0) { //如果有两件共鸣
    //     holyResProps = t_holyResonance[holyRes["2"]].resonance2;
    //     _addPropsToProp(propArr, holyResProps);
    // }
    // if (holyRes["4"] > 0) { //如果有四件共鸣
    //     holyResProps = t_holyResonance[holyRes["4"]].resonance4;
    //     _addPropsToProp(propArr, holyResProps);
    // }
    // if (holyRes["6"] > 0) { //如果有六件共鸣
    //     holyResProps = t_holyResonance[holyRes["6"]].resonance6;
    //     _addPropsToProp(propArr, holyResProps);
    // }

    //魔法学院 魔书
    var magicBookData = heroData.magicBookData || {};
    for (var key in magicBookData) {
        var bookId = magicBookData[key];
        if (t_magicBook[bookId] && t_magicBook[bookId].propertys) {
            //console.error(heroData.tempId, '魔法学院 魔书属性', t_magicBook[bookId].propertys);
            _addPropsToProp(propArr, t_magicBook[bookId].propertys);
        }
    }

    //翅膀
    var wingArr = heroData.wingArr; //[id,等级,星级,当前星经验,左翅强化等级,右翅强化等级]
    var wingId = wingArr[0];
    var wingLeftLvl = wingArr[4] || 0;
    var wingRightLvl = wingArr[5] || 0;
    var t_wingData = t_wing[wingId];
    if (t_wingData) {
        //attack    maxHp   defense magicDefense
        _addPropValue(propArr, c_prop.heroPropKey.maxHpTemp, t_wingData.maxHp * (1 + t_wingStrength[wingRightLvl].maxHp / 10000));
        _addPropValue(propArr, c_prop.heroPropKey.attackTemp, t_wingData.attack * (1 + t_wingStrength[wingLeftLvl].attack / 10000));
        _addPropValue(propArr, c_prop.heroPropKey.defenceTemp, t_wingData.defence * (1 + t_wingStrength[wingLeftLvl].defence / 10000));
        _addPropValue(propArr, c_prop.heroPropKey.magicDefenceTemp, t_wingData.magicDefence * (1 + t_wingStrength[wingRightLvl].magicDefence / 10000));
    }

    //精灵觉醒
    var elfWakingData = userData.elfWakingData || {};
    for (var elfWakingId in elfWakingData) {
        var elfWaking = t_elfWaking[elfWakingId];
        var elfWakingLvl = t_elfWakingLvl[elfWakingData[elfWakingId]];
        //属性技能
        if (elfWaking.skills[0][1] == 1 && elfWaking.skills[0][2] == elfWakingLvl.lvl) {
            var talismanSkill = t_talismanSkill[elfWaking.skills[0][0]];
            _addPropValue(propArr, talismanSkill.effect[0], talismanSkill.effect[1]);
        }
        if (elfWaking.skills[1][1] == 1 && elfWaking.skills[1][2] == elfWakingLvl.lvl) {
            var talismanSkill = t_talismanSkill[elfWaking.skills[1][0]];
            _addPropValue(propArr, talismanSkill.effect[0], talismanSkill.effect[1]);
        }
        //基本属性
        for (var propertyId in elfWakingLvl.propertys) {
            _addPropValue(propArr, elfWakingLvl.propertys[propertyId][0], elfWakingLvl.propertys[propertyId][1]);
        }
        //天赋
        _addPropValue(propArr, elfWakingLvl.inborn[0], elfWakingLvl.inborn[1]);

    }

    //境界
    var realmLvl = heroData.realmLvl; //境界等级
    var c_realmData = c_realm[realmLvl];
    if (c_realmData) {
        _addPropsToProp(propArr, c_realmData.propertys);
    }
    var realmArr = heroData.realmArr; //境界符文
    for (var i = 0; i < realmArr.length; i++) {
        var locRealmId = realmArr[i];
        if (!locRealmId) continue;
        var locItemRealmData = t_itemRealm[locRealmId];
        if (!locItemRealmData) continue;
        _addPropsToProp(propArr, locItemRealmData.propertys);
    }

    //公会加成
    var userId = userData.id;
    if (userId) {
        var guildId = g_data.getGuildId(userId);
        var guildData = g_guild.getGuild(guildId);
        if (guildId && guildData) {
            var guildLvlData = c_guildLvl[guildData.lvl];
            if (guildLvlData) {
                //c_guildFuncCfg
                var guildMult = 0;
                var ennoble = g_data.getGuildEnnoble(userId);
                var guildEnnobleData = c_guildEnnoble[ennoble];
                if (guildEnnobleData) {
                    guildMult = guildEnnobleData.props / 10000;
                }
                //c_guildFuncCfg
                _addPropsToProp(propArr, guildLvlData.props, guildMult);
            }
        }
    }

    //霸主
    // if(isKing){
    //     /* var kingItemId = c_game.challengeCupCfg[5];
    //      var locItemEquipData = t_itemEquip[kingItemId];
    //      if(locItemEquipData) {
    //      var locPropertys = locItemEquipData.propertys;
    //      _addPropsToProp(propArr, locPropertys);
    //      }*/
    //     var kingPropMult = c_game.challengeCupCfg[11];
    //     for(var i = 0;i<propArr.length;i++){
    //         var locPropValue = propArr[i];
    //         if(i>=33&&i<=40){
    //             if(locPropValue){
    //                 propArr[i] = locPropValue*(1+kingPropMult/10000);
    //             }
    //         }
    //     }
    // }

    //转生等级
    if (userData.rebirthLvl) {
        var t_rebirthData = t_rebirth[userData.rebirthLvl];
        if (t_rebirthData) {
            _addPropValue(propArr, c_prop.heroPropKey.maxHpTemp, t_rebirthData.maxHpTemp);
            _addPropValue(propArr, c_prop.heroPropKey.attackTemp, t_rebirthData.attackTemp);
            _addPropValue(propArr, c_prop.heroPropKey.defenceTemp, t_rebirthData.defenceTemp);
            _addPropValue(propArr, c_prop.heroPropKey.magicDefenceTemp, t_rebirthData.magicDefenceTemp);
            _addPropValue(propArr, c_prop.heroPropKey.hitTemp, t_rebirthData.hitTemp);
            _addPropValue(propArr, c_prop.heroPropKey.dodgeTemp, t_rebirthData.dodgeTemp);
            _addPropValue(propArr, c_prop.heroPropKey.criticalTemp, t_rebirthData.criticalTemp);
            _addPropValue(propArr, c_prop.heroPropKey.disCriticalTemp, t_rebirthData.disCriticalTemp);

            _addPropValue(propArr, c_prop.heroPropKey.maxHpScale2, t_rebirthData.maxHpScale);
            _addPropValue(propArr, c_prop.heroPropKey.attackScale2, t_rebirthData.attackScale);
        }
    }

    //成就段位等级
    if (userData.achieveLvl) {
        var t_achieveData = t_achieve[userData.achieveLvl];
        if (t_achieveData) {
            _addPropValue(propArr, c_prop.heroPropKey.maxHpTemp, t_achieveData.maxHpTemp);
            _addPropValue(propArr, c_prop.heroPropKey.attackTemp, t_achieveData.attackTemp);
            _addPropValue(propArr, c_prop.heroPropKey.defenceTemp, t_achieveData.defenceTemp);
            _addPropValue(propArr, c_prop.heroPropKey.magicDefenceTemp, t_achieveData.magicDefenceTemp);
            _addPropValue(propArr, c_prop.heroPropKey.hitTemp, t_achieveData.hitTemp);
            _addPropValue(propArr, c_prop.heroPropKey.dodgeTemp, t_achieveData.dodgeTemp);
            _addPropValue(propArr, c_prop.heroPropKey.criticalTemp, t_achieveData.criticalTemp);
            _addPropValue(propArr, c_prop.heroPropKey.disCriticalTemp, t_achieveData.disCriticalTemp);
        }

        // 成就技能数据
        var achieveSkill = userData.exData[c_prop.userExDataKey.achieveSkill];
        if (achieveSkill) {

            for (var i = 0; i < achieveSkill.length; i++) {
                var skillId = achieveSkill[i];
                var talismanSkill = t_talismanSkill[skillId];
                if (talismanSkill && talismanSkill.type == 1) {
                    _addPropsToProp(propArr, talismanSkill.effect);
                }
            }
        }
    }

    // 次元壁等级
    if (userData.cybLvl) {
        var t_cybData = t_cyb[userData.cybLvl];
        if (t_cybData) {
            _addPropValue(propArr, c_prop.heroPropKey.hitTemp, t_cybData.hitTemp);
            _addPropValue(propArr, c_prop.heroPropKey.dodgeTemp, t_cybData.dodgeTemp);
            _addPropValue(propArr, c_prop.heroPropKey.criticalTemp, t_cybData.criticalTemp);
            _addPropValue(propArr, c_prop.heroPropKey.disCriticalTemp, t_cybData.disCriticalTemp);

            // 伤害减免 
            _addPropsToProp(propArr, t_cybData.effect);
        }
    }

    // 军衔等级
    if (userData.jxLvl) {
        var t_jxData = t_junxian[userData.jxLvl];
        if (t_jxData) {
            _addPropValue(propArr, c_prop.heroPropKey.maxHpTemp, t_jxData.maxHpTemp);
            _addPropValue(propArr, c_prop.heroPropKey.attackTemp, t_jxData.attackTemp);
            _addPropValue(propArr, c_prop.heroPropKey.defenceTemp, t_jxData.defenceTemp);
            _addPropValue(propArr, c_prop.heroPropKey.magicDefenceTemp, t_jxData.magicDefenceTemp);

            // 伤害加成
            _addPropsToProp(propArr, t_jxData.effect);
        }
    }

    //勋章
    var medalPropArr = [];
    _clearPropArr(medalPropArr);
    if (userData.medalData) {
        var currentTime = (new Date()).getTime();
        for (var key in userData.medalData) {
            var locMedalId = parseInt(key);
            var locMedalData = userData.medalData[key] || [];
            if (locMedalData[1] && locMedalData[1] < currentTime) continue;
            var locMedalLvlId = parseInt(locMedalData[0] || 0);
            var t_medalData = t_medal[locMedalId];
            var t_medalLvlData = t_medalLvl[locMedalLvlId];
            if (t_medalData && t_medalLvlData) {
                _addPropsToProp(medalPropArr, t_medalData.propertys, t_medalLvlData.strengthPro / 10000);
            }
        }
    }

    //奖杯
    if (userData.cup) {
        var t_collectorData = t_collector[userData.cup];
        if (t_collectorData) {
            _addPropsToProp(medalPropArr, t_collectorData.propertys);
        }
    }

    //奖杯胶囊
    var medalAddPer = 0;
    if (userData.capsuleData) {
        for (var capsuleId in userData.capsuleData) {
            var t_itemAttributeData = t_itemAttribute[capsuleId];
            if (t_itemAttributeData) {
                var num = userData.capsuleData[capsuleId] || 0;
                medalAddPer += t_itemAttributeData.addition * num;
                _addPropsToProp(medalPropArr, t_itemAttributeData.propertys, num - 1);
            }
        }
    }
    _addArrToProp(propArr, medalPropArr, medalAddPer / 10000);

    if (userData.propertyData) {
        for (var key in userData.propertyData) {
            if (key == c_prop.propertyDataKey.dlTreasure) {
                var treaLvl = userData.propertyData[key];
                var demonLotusData = c_demonLotus[treaLvl];
                if (demonLotusData) {
                    _addPropsToProp(propArr, demonLotusData.treaPropertys);
                }
            }
            if (key == c_prop.propertyDataKey.heartStunt) {
                var heartData = userData.propertyData[key] || {};
                for (var key in heartData) {
                    var locHeartId = parseInt(key);
                    var locHeartLvl = parseInt(heartData[key] || 0);
                    var locHeartProps = _getHeartProps(locHeartId, locHeartLvl);
                    _addPropsToProp(propArr, locHeartProps);
                }
            }
            //星盘 星魂
            if (key == c_prop.propertyDataKey.starSoul) {
                var starSoulData = userData.propertyData[key] || [];
                starSoulData.forEach(function(starPlateData) {
                    if (starPlateData && starPlateData.length > 0) {
                        starPlateData.forEach(function(starSoul) {
                            var starSoulId = parseInt(starSoul[0]);
                            var starSoulCfg = c_starSoul[starSoulId];
                            if (starSoulCfg) {
                                _addPropsToProp(propArr, starSoulCfg.propertys);
                            }
                        });
                    }
                });
            }
        }
    }

    //宝物
    if (heroData.talismanData) {
        var talismanData = heroData.talismanData; //法宝数据{法宝id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...},临时资质],法宝id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...},临时资质],....}
        for (var key in talismanData) {
            var locTalId = parseInt(key);
            var locTalData = talismanData[key] || [];

            var talLvl = 0; //等级
            var talAptitude = 0; //资质
            var skillObj = {};
            if (locTalData[0]) talLvl = locTalData[0];
            if (locTalData[1]) talAptitude = locTalData[1];
            if (locTalData[4]) skillObj = locTalData[4];

            //基础属性
            var talismanLvl = t_talismanLvl[locTalId + talLvl];
            if (talismanLvl) {
                _addPropsToProp(propArr, talismanLvl.propertys, talAptitude / 1000);
            }
            //技能
            if (JSON.stringify(skillObj).length > 2) {
                for (var star in skillObj) {
                    var talismanSkill = t_talismanSkill[skillObj[star]];
                    if (talismanSkill && talismanSkill.type == 1) {
                        _addPropsToProp(propArr, talismanSkill.effect);
                    }
                }
            }
        }
        //共鸣
        var talismanFg = heroData.talismanFg;
        for (var key in talismanFg) {
            var talismanRes = t_talismanRes[key];
            if (!talismanRes) continue;
            if (talismanRes.type == 1) {
                var resArr = talismanFg[key] || [];
                var resonance = talismanRes.resonance;
                var isRes = true;
                var resLength = resonance.length;
                //预防
                if (resLength <= 0) continue;
                for (var i = 0; i < resLength; i++) {
                    if (!resArr[i]) {
                        isRes = false;
                        break;
                    }
                }
                if (isRes) {
                    _addPropsToProp(propArr, talismanRes.extraPro);
                }
            }
        }
    }


    if (userData.heroData) {
        //英雄升星
        var userHeroData = userData.heroData; //法宝数据{法宝id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...},临时资质],法宝id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...},临时资质],....}
        var job = Number.tempId2Job(heroData.tempId);

        for (var key in userHeroData) {
            var locTalId = parseInt(key);
            if (Number.tempId2Job(locTalId) != job) continue; //过滤一下非本职业的升星属性
            var locTalData = userHeroData[key] || [];

            var skillObj = {};
            if (locTalData[4]) skillObj = locTalData[4];
            //技能
            if (JSON.stringify(skillObj).length > 2) {
                for (var star in skillObj) {
                    var talismanSkill = t_talismanSkill[skillObj[star]];
                    if (talismanSkill.type == 1) {
                        _addPropsToProp(propArr, talismanSkill.effect);
                    }
                }
            }
            //英雄礼物
            if (locTalData[6] && t_heroGift[locTalData[6]]) {
                _addPropsToProp(propArr, t_heroGift[locTalData[6]].properties);
            }
            if (locTalData[7] && locTalData[7] == 1) {
                _addPropsToProp(propArr, t_heroPledge[locTalId].properties);
            }
        }
    }

    // 是否有飞翔靴(移动速度Buff)
    var userUtils = require("uw-user").userUtils;
    if (userUtils.isExistBuff(userData, c_prop.otherBuffIdKey.spdAdd75)) {
        // moveSpeedOBuff 
        _addPropValue(propArr, c_prop.heroPropKey.moveSpeedOBuff, 7500);
    }
    if (userUtils.isExistBuff(userData, c_prop.otherBuffIdKey.hpBUFF5)) {
        _addPropValue(propArr, c_prop.heroPropKey.maxHpScale2, t_otherBuff[c_prop.otherBuffIdKey.hpBUFF5].addHurt);
    }
    //c_heartStuntLvl
    // console.error("heroPropHelper.js prop", heroData.id, heroData.tempId, propArr);
    return propArr;
};

/**
 * 计算英雄战力
 * @param userData 必须包含lvl ,equipBag, id
 * @param heroData
 */
exports.calCombat = function(userData, heroData) {
    var userLvl = userData.lvl,
        equipBag = userData.equipBag;
    /**
     * 基础属性战斗力公式
     * @param a 血量之和
     * @param a1 血量参数
     * @param b 攻击之和
     * @param b1 攻击参数
     * @param c 物防之和
     * @param c1 物防参数
     * @param d 魔防之和
     * @param d1 魔防参数
     * @param e 暴击之和
     * @param e1 暴击参数
     * @param f 抗暴之和
     * @param f1 抗暴参数
     * @param g 闪避之和
     * @param g1 闪避参数
     * @param h 命中之和
     * @param h1 命中参数
     * @param j 攻击频率
     * @param j1 攻击频率参数
     */
    var maxHp = exports.getMaxHpFight(heroData);
    var attack = getAttackFight(heroData);
    var defence = getDefenceFight(heroData);
    var magicDefence = getMagicDefenceFight(heroData);
    var critical = getCriticalFight(heroData);
    var disCritical = getDisCriticalFight(heroData);
    var dodge = getDodgeFight(heroData);
    var hit = getHitFight(heroData);
    var attackInterval = attackIntervalFight(heroData);

    // console.error("heroPropHelper.js calCombat maxHP:", heroData.id, heroData.tempId, maxHp);
    // console.error("heroPropHelper.js calCombat attack:", heroData.id, heroData.tempId, attack);

    // 数值膨胀
    var damageIncrease = getDamageIncreaseFight(heroData);
    var damageDecrease = getDamageDecreaseFight(heroData);
    // 新属性
    var dodgeAddHp = getDodgeAddHpFight(heroData); //闪避回血值*换算系数=伤害减免值  0.35
    var criticalHurt = getCriticalHurtFight(heroData); //暴击伤害值*换算系数=伤害加深值 0.16
    var deathBlow = getDeathBlowFight(heroData); //致命一击*换算系数=伤害加深值 1

    damageIncrease += criticalHurt * 0.16;
    damageIncrease += deathBlow * 1;
    damageDecrease += dodgeAddHp * 0.35;
    attack = attack * (1 + damageIncrease * 0.6);
    maxHp = maxHp * (1 + damageDecrease * 0.6);

    //参数1：血量参数
    //参数2：攻击参数
    //参数3：物防参数
    //参数4：魔防参数
    //参数5：暴击参数
    //参数6：抗暴参数
    //参数7：闪避参数
    //参数8：命中参数
    //参数9：攻击频率
    var maxHp1 = c_game.combatMult[0] / 10000;
    var attack1 = c_game.combatMult[1] / 10000;
    var defence1 = c_game.combatMult[2] / 10000;
    var magicDefence1 = c_game.combatMult[3] / 10000;
    var hit1 = c_game.combatMult[4] / 10000;
    var dodge1 = c_game.combatMult[5] / 10000;
    var critical1 = c_game.combatMult[6] / 10000;
    var disCritical1 = c_game.combatMult[7] / 10000;
    var attackInterval1 = c_game.combatMult[8];
    //基础属性战斗力公式
    //console.log(maxHp,maxHp1,attack,attack1,defence,defence1,magicDefence,magicDefence1,critical,critical1,disCritical,disCritical1,dodge,dodge1,hit,hit1,attackInterval,attackInterval1);
    var combat1 = formula.calBaseCombat(maxHp, maxHp1, attack, attack1, defence, defence1, magicDefence, magicDefence1, critical, critical1, disCritical, disCritical1, dodge, dodge1, hit, hit1, attackInterval, attackInterval1);


    //戒指战力公式
    /**
     * 戒指战力公式
     * @param a 戒指1
     * @param b 戒指2
     * @param c 戒指3
     * @param d 戒指4
     */
    var breakCombat1 = 0;
    var breakCombat2 = 0;
    var breakCombat3 = 0;
    var breakCombat4 = 0;
    //breakCombat1 =
    for (var key in heroData.equipData) {
        var locItemUid = heroData.equipData[key];
        if (!locItemUid) continue;
        //物品基础属性
        var locItemId = locItemUid;
        var locItemBreak = t_itemBreak[locItemId];
        if (!locItemBreak) continue;

        if (key == c_prop.heroEquipIndexKey.paralysisRing) {
            breakCombat1 = locItemBreak.combat;
        }
        if (key == c_prop.heroEquipIndexKey.reviveRing) {
            breakCombat2 = locItemBreak.combat;
        }
        if (key == c_prop.heroEquipIndexKey.protectRing) {
            breakCombat3 = locItemBreak.combat;
        }
        if (key == c_prop.heroEquipIndexKey.harmRing) {
            breakCombat4 = locItemBreak.combat;
        }
    }

    var combat2 = formula.calBreakCombat(breakCombat1, breakCombat2, breakCombat3, breakCombat4);
    //技能战力公式
    /**
     * 技能战力公式
     * @param k 第1技能战力
     * @param k1 第1技能等级
     * @param l 第2技能战力
     * @param l1 第2技能等级
     * @param m 第3技能战力
     * @param m1 第3技能等级
     * @param n 第4技能战力
     * @param n1 第4技能等级
     * @param s 第5技能战力
     * @param s1 第5技能等级
     */

    var skillCombatArr = [0, 0, 0, 0, 0];
    var skillLvlArr = [0, 0, 0, 0, 0];
    //200级后技能战斗力加成
    var skillCombatArr2 = [0, 0, 0, 0, 0];
    var skillLvlArr2 = [0, 0, 0, 0, 0];
    var skillOpenNeedArr = c_game.skillRate[4];
    skillOpenNeedArr = skillOpenNeedArr.split(",");
    var t_heroData = t_hero[heroData.tempId];
    var tempSkillIds = t_heroData.skillIds;
    for (var i = 0; i < tempSkillIds.length; i++) {
        var locSkillId = tempSkillIds[i];
        var locTalentSkillId = _getReplaceTalentSkillId(i, heroData.talismanData);
        if (locTalentSkillId) locSkillId = locTalentSkillId;
        var locSkillData = t_skill[locSkillId];
        if (!locSkillData) continue;
        var locNeedLvl = parseInt(skillOpenNeedArr[i]);

        if (userLvl >= locNeedLvl) {
            //开启的
            skillCombatArr[i] = locSkillData.combat;
            skillLvlArr[i] = heroData.skillLvlArr[i] || 1;
            //200级技能进阶后是新技能id   等级需要减200
            if (heroData.skillLvlArr[i] && heroData.skillLvlArr[i] > 200) {
                skillLvlArr[i] = 200;
                var locSkillId2 = t_heroData.skillIds2[i];
                var locSkillData2 = t_skill[locSkillId2];
                if (!locSkillData2) continue;
                skillLvlArr2[i] = heroData.skillLvlArr[i] - 200;
                skillCombatArr2[i] = locSkillData2.combat;
            }
        }
    }
    var combat3 = formula.calSkillCombat(skillCombatArr[0], skillLvlArr[0], skillCombatArr[1], skillLvlArr[1], skillCombatArr[2], skillLvlArr[2], skillCombatArr[3], skillLvlArr[3], skillCombatArr[4], skillLvlArr[4]);
    //200级技能进阶的战斗力
    var combat4 = formula.calSkillCombat(skillCombatArr2[0], skillLvlArr2[0], skillCombatArr2[1], skillLvlArr2[1], skillCombatArr2[2], skillLvlArr2[2], skillCombatArr2[3], skillLvlArr2[3], skillCombatArr2[4], skillLvlArr2[4]);
    //console.log(combat1,combat2,combat3);
    var allCombat = combat1 + combat2 + combat3 + combat4;
    allCombat = parseInt(allCombat);
    //console.log("heroPropHelper.js combat", allCombat,combat1,combat2,combat3);
    return allCombat;
};

//计算精灵战力
exports.calHeroWingCombat = function(userData, heroData) {
    var propArr = [];
    _clearPropArr(propArr);
    //翅膀
    var wingArr = heroData.wingArr; //[id,等级,星级,当前星经验,左翅强化等级,右翅强化等级]

    var wingId = wingArr[0];
    var wingLeftLvl = wingArr[4] || 0;
    var wingRightLvl = wingArr[5] || 0;
    var t_wingData = t_wing[wingId];
    if (t_wingData) {
        //attack    maxHp   defense magicDefense
        _addPropValue(propArr, c_prop.heroPropKey.maxHpTemp, t_wingData.maxHp * (1 + t_wingStrength[wingRightLvl].maxHp / 10000));
        _addPropValue(propArr, c_prop.heroPropKey.attackTemp, t_wingData.attack * (1 + t_wingStrength[wingLeftLvl].attack / 10000));
        _addPropValue(propArr, c_prop.heroPropKey.defenceTemp, t_wingData.defence * (1 + t_wingStrength[wingLeftLvl].defence / 10000));
        _addPropValue(propArr, c_prop.heroPropKey.magicDefenceTemp, t_wingData.magicDefence * (1 + t_wingStrength[wingRightLvl].magicDefence / 10000));
    }
    // console.log('calHeroWingCombat--propArr',propArr);
    //算战力
    /**
     * 基础属性战斗力公式
     * @param a 血量之和
     * @param a1 血量参数
     * @param b 攻击之和
     * @param b1 攻击参数
     * @param c 物防之和
     * @param c1 物防参数
     * @param d 魔防之和
     * @param d1 魔防参数
     * @param e 暴击之和
     * @param e1 暴击参数
     * @param f 抗暴之和
     * @param f1 抗暴参数
     * @param g 闪避之和
     * @param g1 闪避参数
     * @param h 命中之和
     * @param h1 命中参数
     * @param j 攻击频率
     * @param j1 攻击频率参数
     */

    var maxHp = propArr[c_prop.heroPropKey.maxHpTemp];
    var attack = propArr[c_prop.heroPropKey.attackTemp];
    var defence = propArr[c_prop.heroPropKey.defenceTemp];
    var magicDefence = propArr[c_prop.heroPropKey.magicDefenceTemp];
    var critical = 0;
    var disCritical = 0;
    var dodge = 0;
    var hit = 0;
    var attackInterval = attackIntervalFight(heroData);
    //参数1：血量参数
    //参数2：攻击参数
    //参数3：物防参数
    //参数4：魔防参数
    //参数5：暴击参数
    //参数6：抗暴参数
    //参数7：闪避参数
    //参数8：命中参数
    //参数9：攻击频率
    var maxHp1 = c_game.combatMult[0] / 10000;
    var attack1 = c_game.combatMult[1] / 10000;
    var defence1 = c_game.combatMult[2] / 10000;
    var magicDefence1 = c_game.combatMult[3] / 10000;
    var hit1 = c_game.combatMult[4] / 10000;
    var dodge1 = c_game.combatMult[5] / 10000;
    var critical1 = c_game.combatMult[6] / 10000;
    var disCritical1 = c_game.combatMult[7] / 10000;
    var attackInterval1 = c_game.combatMult[8];
    //基础属性战斗力公式
    //console.log(maxHp,maxHp1,attack,attack1,defence,defence1,magicDefence,magicDefence1,critical,critical1,disCritical,disCritical1,dodge,dodge1,hit,hit1,attackInterval,attackInterval1);
    var combat = formula.calBaseCombat(maxHp, maxHp1, attack, attack1, defence, defence1, magicDefence, magicDefence1, critical, critical1, disCritical, disCritical1, dodge, dodge1, hit, hit1, attackInterval, attackInterval1);
    // console.log('calHeroWingCombat--combat',combat);
    return combat;
}
//加上共鸣战力
// exports.addHolyRes = function(pulsattr, needplus, userData, heroData) {
//     _addPropValue(heroData.propArr, pulsattr, needplus);
//     return heroData;

// }
//计算深渊装备战力
exports.calHeroHolyCombat = function(userData, heroData) {
    var equipBag = userData.equipBag;
    var propArr = [];
    _clearPropArr(propArr);

    var holyPropArr = []; // 神圣属性
    _clearPropArr(holyPropArr);

    var equipData = heroData.equipData || {}; //{"部位":物品id,....}
    for (var key in equipData) {
        if (key == c_prop.heroEquipIndexKey.sword ||
            key == c_prop.heroEquipIndexKey.shield ||
            key == c_prop.heroEquipIndexKey.cape ||
            key == c_prop.heroEquipIndexKey.tshirt ||
            key == c_prop.heroEquipIndexKey.shoe ||
            key == c_prop.heroEquipIndexKey.belt
        ) {
            var locItemUid = equipData[key];
            if (!locItemUid) continue;
            locBagData = equipBag[locItemUid] || {};
            if (!locBagData) continue;
            locItemId = locBagData[0];

            var locItemEquipData = t_itemEquip[locItemId];
            if (!locItemEquipData) continue;
            _addPropsToProp(holyPropArr, locItemEquipData.propertys);
        }
    }

    var holyArr = heroData.holyArr || [0, 0, 0, 0];
    var holyLeftLvl = holyArr[0] || 0;
    var holyRightLvl = holyArr[2] || 0;
    // 徽章法典基础属性
    _addPropValue(holyPropArr, c_prop.heroPropKey.attackTemp, t_holyStrength[holyLeftLvl].attackTemp);
    _addPropValue(holyPropArr, c_prop.heroPropKey.maxHpTemp, t_holyStrength[holyRightLvl].maxHpTemp);

    // 徽章法典加成属性
    //console.log("ADD PROP22:", c_prop.heroPropKey.attackTemp, holyPropArr[c_prop.heroPropKey.attackTemp], holyPropArr[c_prop.heroPropKey.attackTemp] * (1+t_holyStrength[holyLeftLvl].attack/10000));
    _addPropValue(propArr, c_prop.heroPropKey.attackTemp, holyPropArr[c_prop.heroPropKey.attackTemp] * (1 + t_holyStrength[holyLeftLvl].attack / 10000));
    _addPropValue(propArr, c_prop.heroPropKey.defenceTemp, holyPropArr[c_prop.heroPropKey.defenceTemp] * (1 + t_holyStrength[holyLeftLvl].defence / 10000));
    _addPropValue(propArr, c_prop.heroPropKey.criticalTemp, holyPropArr[c_prop.heroPropKey.criticalTemp] * (1 + t_holyStrength[holyLeftLvl].critical / 10000));
    _addPropValue(propArr, c_prop.heroPropKey.hitTemp, holyPropArr[c_prop.heroPropKey.hitTemp] * (1 + t_holyStrength[holyLeftLvl].hit / 10000));

    _addPropValue(propArr, c_prop.heroPropKey.maxHpTemp, holyPropArr[c_prop.heroPropKey.maxHpTemp] * (1 + t_holyStrength[holyRightLvl].maxHp / 10000));
    _addPropValue(propArr, c_prop.heroPropKey.magicDefenceTemp, holyPropArr[c_prop.heroPropKey.magicDefenceTemp] * (1 + t_holyStrength[holyRightLvl].magicDefence / 10000));
    _addPropValue(propArr, c_prop.heroPropKey.disCriticalTemp, holyPropArr[c_prop.heroPropKey.disCriticalTemp] * (1 + t_holyStrength[holyRightLvl].disCritical / 10000));
    _addPropValue(propArr, c_prop.heroPropKey.dodgeTemp, holyPropArr[c_prop.heroPropKey.dodgeTemp] * (1 + t_holyStrength[holyRightLvl].dodge / 10000));

    var maxHp = propArr[c_prop.heroPropKey.maxHpTemp];
    var attack = propArr[c_prop.heroPropKey.attackTemp];
    var defence = propArr[c_prop.heroPropKey.defenceTemp];
    var magicDefence = propArr[c_prop.heroPropKey.magicDefenceTemp];

    var critical = propArr[c_prop.heroPropKey.criticalTemp];
    var disCritical = propArr[c_prop.heroPropKey.disCriticalTemp];
    var dodge = propArr[c_prop.heroPropKey.dodgeTemp];
    var hit = propArr[c_prop.heroPropKey.hitTemp];
    var attackInterval = attackIntervalFight(heroData);

    var maxHp1 = c_game.combatMult[0] / 10000;
    var attack1 = c_game.combatMult[1] / 10000;
    var defence1 = c_game.combatMult[2] / 10000;
    var magicDefence1 = c_game.combatMult[3] / 10000;
    var hit1 = c_game.combatMult[4] / 10000;
    var dodge1 = c_game.combatMult[5] / 10000;
    var critical1 = c_game.combatMult[6] / 10000;
    var disCritical1 = c_game.combatMult[7] / 10000;
    var attackInterval1 = c_game.combatMult[8];
    var combat = formula.calBaseCombat(maxHp, maxHp1, attack, attack1, defence, defence1, magicDefence, magicDefence1, critical, critical1, disCritical, disCritical1, dodge, dodge1, hit, hit1, attackInterval, attackInterval1);
    return combat;
}

//计算伙伴战力
exports.calHeroPartnerCombat = function(userData, heroData) {
    var propArr = [];
    _clearPropArr(propArr);

    if (userData.heroData) {
        //英雄升星
        var userHeroData = userData.heroData; //法宝数据{法宝id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...},临时资质],法宝id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...},临时资质],....}
        var job = Number.tempId2Job(heroData.tempId);

        for (var key in userHeroData) {
            var locTalId = parseInt(key);
            if (Number.tempId2Job(locTalId) != job) continue; //过滤一下非本职业的升星属性
            var locTalData = userHeroData[key] || [];

            var skillObj = {};
            if (locTalData[4]) skillObj = locTalData[4];
            //技能
            if (JSON.stringify(skillObj).length > 2) {
                for (var star in skillObj) {
                    var talismanSkill = t_talismanSkill[skillObj[star]];
                    if (talismanSkill.type == 1) {
                        _addPropsToProp(propArr, talismanSkill.effect);
                    }
                }
            }
            //英雄礼物
            if (locTalData[6] && t_heroGift[locTalData[6]]) {
                _addPropsToProp(propArr, t_heroGift[locTalData[6]].properties);
            }
            if (locTalData[7] && locTalData[7] == 1) {
                _addPropsToProp(propArr, t_heroPledge[locTalId].properties);
            }
        }
    }
    var maxHp = propArr[c_prop.heroPropKey.maxHpTemp];
    var attack = propArr[c_prop.heroPropKey.attackTemp];
    var defence = propArr[c_prop.heroPropKey.defenceTemp];
    var magicDefence = propArr[c_prop.heroPropKey.magicDefenceTemp];

    var critical = propArr[c_prop.heroPropKey.criticalTemp];
    var disCritical = propArr[c_prop.heroPropKey.disCriticalTemp];
    var dodge = propArr[c_prop.heroPropKey.dodgeTemp];
    var hit = propArr[c_prop.heroPropKey.hitTemp];
    var attackInterval = attackIntervalFight(heroData);

    var maxHp1 = c_game.combatMult[0] / 10000;
    var attack1 = c_game.combatMult[1] / 10000;
    var defence1 = c_game.combatMult[2] / 10000;
    var magicDefence1 = c_game.combatMult[3] / 10000;
    var hit1 = c_game.combatMult[4] / 10000;
    var dodge1 = c_game.combatMult[5] / 10000;
    var critical1 = c_game.combatMult[6] / 10000;
    var disCritical1 = c_game.combatMult[7] / 10000;
    var attackInterval1 = c_game.combatMult[8];
    var combat = formula.calBaseCombat(maxHp, maxHp1, attack, attack1, defence, defence1, magicDefence, magicDefence1, critical, critical1, disCritical, disCritical1, dodge, dodge1, hit, hit1, attackInterval, attackInterval1);
    return combat;
}

//获取法宝技能        [技能id,技能id,...]
var _getTalismanSkill = function(talismanData) {
    var self = this;
    var returnArr = [];
    for (var key in talismanData) {
        var skillObj = talismanData[key][4] || {};
        for (var key1 in skillObj) {
            returnArr.push(skillObj[key1]);
        }
    }
    return returnArr;
}

var _getReplaceTalentSkillId = function(index, talismanData) {
    var skillArr = _getTalismanSkill(talismanData);
    var reSkillId = 0; //

    for (var i = 0; i < skillArr.length; i++) {
        var locSkillId = skillArr[i];
        if (!locSkillId) continue;
        var locSkillData = t_talismanSkill[locSkillId];
        if (!locSkillData) continue;
        var locType = locSkillData.type;
        if (locType != c_prop.talismanSkillTypeKey.replaceSkill) continue;
        var locTeffect = locSkillData.effect || [];
        locTeffect = locTeffect[0];
        if (!locTeffect) continue;
        var locIndex = locTeffect[0];
        var locTalentSkillId = locTeffect[1];
        if (index != locIndex) continue;

        if (locTalentSkillId > reSkillId) {
            reSkillId = locTalentSkillId;
        }
    }
    return reSkillId;
}


var _clearPropArr = function(propArr) {
    for (var i = 0; i < MAX_PROP + 1; i++) {
        propArr[i] = 0;
    }
};

var _addPropValue = function(propArr, index, value) {
    if (!index || !value) return;
    propArr[index] += value;
};

var _addPropsToProp = function(propArr, props, mult) {
    mult = mult || 0;
    if (!props) return;
    for (var i = 0; i < props.length; i++) {
        var locData = props[i];
        if (!locData) continue;
        var locIndex = locData[0];
        if (!locIndex) continue;
        propArr[locIndex] += locData[1] * (1 + mult);
    }
};

var _addArrToProp = function(propArr, props, mult) {
    mult = mult || 0;
    if (!props) return;
    for (var i = 0; i < props.length; i++) {
        var locData = props[i];
        if (!locData) continue;
        propArr[i] += locData * (1 + mult);
    }
};

//生命
exports.getMaxHpFight = function(heroData) {
    return _getFightPropByIndex(heroData, 1, 2, 33, 49);
}

//物攻
var getAttackFight = function(heroData) {
    return _getFightPropByIndex(heroData, 3, 4, 34, 50);
}

//物防
var getDefenceFight = function(heroData) {
    return _getFightPropByIndex(heroData, 5, 6, 35, 51);
}

//魔防
var getMagicDefenceFight = function(heroData) {
    return _getFightPropByIndex(heroData, 7, 8, 36, 52);
}

//命中
var getHitFight = function(heroData) {
    return _getFightPropByIndex(heroData, 9, 10, 37, 53);
}

//闪避
var getDodgeFight = function(heroData) {
    return _getFightPropByIndex(heroData, 11, 12, 38, 54);
}

//暴击
var getCriticalFight = function(heroData) {
    return _getFightPropByIndex(heroData, 13, 14, 39, 55);
}

//抗暴
var getDisCriticalFight = function(heroData) {
    return _getFightPropByIndex(heroData, 15, 16, 40, 56);
};

//攻击速度
var attackIntervalFight = function(heroData) {
    return _getFightPropByIndex(heroData, 21, 22, 43);
};

var _getPropByIndex = function(heroData, index) {
    return heroData.propArr[index] || 0;
};

var _getFightPropByIndex = function(heroData, baseIndex, scaleIndex, tempScale, scaleIndex2) {
    if (scaleIndex2) {
        return Math.floor(_getPropByIndex(heroData, baseIndex) * (1 + _getPropByIndex(heroData, scaleIndex) / 10000 + _getPropByIndex(heroData, scaleIndex2) / 10000) + _getPropByIndex(heroData, tempScale) * (1 + _getPropByIndex(heroData, scaleIndex2) / 10000));
    } else {
        return Math.floor(_getPropByIndex(heroData, baseIndex) * (1 + _getPropByIndex(heroData, scaleIndex) / 10000) + _getPropByIndex(heroData, tempScale));
    }
};

//单次攻击最高伤害
exports.getDamageMaxAHit = function(heroData, target, lvl) { //target = t_monster[32];
    var skill;
    var critDamage, defence, damage, maxDamage = 0;

    critDamage = _getCritDamage(getCriticalFight(heroData), target.disCritical);
    defence = _getDefence(target.defense, target.magicDefence, heroData.tempId, lvl, getAttackFight(heroData));

    var skillOpenNeedArr = c_game.skillRate[4];
    skillOpenNeedArr = skillOpenNeedArr.split(",");
    var tempSkillIds = t_hero[heroData.tempId].skillIds;
    var skillArr = [];
    for (var i = 0; i < tempSkillIds.length; i++) {
        var locNeedLvl = parseInt(skillOpenNeedArr[i]);
        if (lvl >= locNeedLvl) {
            skillArr.push(heroData.skillLvlArr[i] || 1);
        }
    }

    for (var i = 0; i < skillArr.length; ++i) {
        skill = t_skill[tempSkillIds[i]]; // 获取技能表数据
        var skillLevel = skillArr[i]; // 技能等级
        if (skillLevel == 0)
            continue;
        var hpCoefficient = _getHpCoefficient(skill, skillLevel);
        if (hpCoefficient < 0) {
            damage = getAttackFight(heroData);
            damage *= (1 - defence);
            damage = (damage + damage * critDamage);
            damage *= 1 + getDamageIncreaseFight(heroData) - target.damageDecrease;
            damage *= hpCoefficient;

        } else {
            damage = 0;
        }
        damage = -damage;
        damage = Math.ceil(damage);
        if (damage > maxDamage) {
            maxDamage = damage;
        }
    }

    return maxDamage;
}

//计算单个英雄秒伤
exports.getDamagePerSec = function(heroData, target, lvl) { //target = t_monster[32];
    var skill;
    var hitRate, critRate, critDamage, defence, damage;
    var skillDamagePerSecs = [];

    hitRate = _getHitRate(getHitFight(heroData), target.dodge);
    critRate = _getCriticalRate(getCriticalFight(heroData), target.disCritical);
    critDamage = _getCritDamage(getCriticalFight(heroData), target.disCritical);
    defence = _getDefence(target.defense, target.magicDefence, heroData.tempId, lvl, getAttackFight(heroData));

    var skillOpenNeedArr = c_game.skillRate[4];
    skillOpenNeedArr = skillOpenNeedArr.split(",");
    var tempSkillIds = t_hero[heroData.tempId].skillIds;
    var skillArr = [];
    for (var i = 0; i < tempSkillIds.length; i++) {
        var locNeedLvl = parseInt(skillOpenNeedArr[i]);
        if (lvl >= locNeedLvl) {
            skillArr.push(heroData.skillLvlArr[i] || 1);
        }
    }

    var damagePerSec = 0;
    for (var i = 0; i < skillArr.length; ++i) {
        skill = t_skill[tempSkillIds[i]]; // 获取技能表数据
        var skillLevel = skillArr[i]; // 技能等级
        if (skillLevel == 0)
            continue;
        var hpCoefficient = _getHpCoefficient(skill, skillLevel);
        if (hpCoefficient < 0) {
            damage = getAttackFight(heroData);
            damage *= (1 - defence);
            damage = (damage + damage * critRate * critDamage) / (1 + critRate);
            damage *= 1 + getDamageIncreaseFight(heroData) - target.damageDecrease;
            damage *= hpCoefficient;
            damage *= hitRate;

            damagePerSec += (-damage * 1000 / (skill.cd * 10));
        } else {
            damage = 0;
        }
    }

    return damagePerSec;
}

var getDamageIncreaseFight = function(heroData) {
    return (_getPropByIndex(heroData, 23) + _getPropByIndex(heroData, 44)) / 10000;
}
var getDamageDecreaseFight = function(heroData) {
    return (_getPropByIndex(heroData, 24) + _getPropByIndex(heroData, 45)) / 10000;
}

var getDodgeAddHpFight = function(heroData) {
    return _getPropByIndex(heroData, 57) / 10000; //闪避回血
};

var getCriticalHurtFight = function(heroData) {
    return _getPropByIndex(heroData, 58) / 10000; //暴击伤害
};

var getDeathBlowFight = function(heroData) {
    return _getPropByIndex(heroData, 59) / 10000; //致命一击
};

var _getHitRate = function(hitFight, dodgeFightTarget) { //是否命中成功，b对方的闪避
    return hitFight / (hitFight + dodgeFightTarget);
}

var _getCriticalRate = function(criticalFight, disCriticalFightTarget) { //是否暴击，b对方的抗暴
    return criticalFight / (criticalFight + disCriticalFightTarget);
}
var _getCritDamage = function(criticalFight, disCriticalFightTarget) { //获取暴击伤害，b对方的抗爆
    return criticalFight / (criticalFight + disCriticalFightTarget) * 3;
}

var _getDefence = function(defenceFight, magicDefenceFight, attackType, roleLevel, attack) { //获取防御，b攻击者的攻击行为， a攻击者等级
    //var def = 0;
    //def = attackType == 1 ? defenceFight : attackType == 2 ? magicDefenceFight : (magicDefenceFight + defenceFight) / 2;
    //return 20000 >= def ? 0.002 * def / (1 + 0.8 * attackRoleLevel + 0.002 * def) : 40 / (0.8 * attackRoleLevel + 41) + 0.001 * (def - 20000) / (1 + 0.8 * attackRoleLevel + 0.001 * (def - 20000));

    var def = attackType == 1 ? defenceFight : attackType == 2 ? magicDefenceFight : (magicDefenceFight + defenceFight) / 2;
    var curDef;
    if (def <= 10000) {
        curDef = 0.002 * def / (1 + 0.015 * roleLevel + 0.002 * def);
        curDef = Math.min(curDef, 0.6);
    } else if (def < 60000) {
        curDef = 100 / (1 + 0.8 * roleLevel + 100) + 0.001 * (def - 10000) / (1 + 1.25 * roleLevel + 0.001 * (def - 10000));
        curDef = Math.min(curDef, 0.9);
    } else {
        if (attack < 120000) {
            curDef = 0.8 + def / (def + 4000000);
        } else {
            curDef = def / (def + attack * 0.125);
        }
        curDef = Math.min(curDef, 0.9);
    }

    return curDef;
}

var _getHpCoefficient = function(skillInfo, skillLevel) {
    return (skillInfo.damage + skillInfo.damageScaleA * (skillLevel - 1)) / 10000;
}

var __heartPropCache = {};
var _getHeartProps = function(heartId, hearLvl) {
    var heartLvlId = heartId + hearLvl;
    var heartProps = __heartPropCache[heartLvlId];
    if (heartProps) return heartProps;
    heartProps = [];
    for (var i = 0; i <= hearLvl; i++) {
        var heartStuntLvlData = c_heartStuntLvl[heartId + i];
        if (!heartStuntLvlData) continue;
        if (!heartStuntLvlData.addProperty) continue;
        heartProps.push(heartStuntLvlData.addProperty);
    }
    __heartPropCache[heartLvlId] = heartProps;
    return heartProps;
};