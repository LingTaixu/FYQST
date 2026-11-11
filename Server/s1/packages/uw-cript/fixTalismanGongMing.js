var async = require("async");
var userDao = require("uw-user").userDao;
var heroDao = heroDao || require("uw-hero").heroDao;
var heroPropHelper = heroPropHelper || require('uw-hero').heroPropHelper;
var scriptUtils = require("./scriptUtils");
var uwData = require("uw-data");
var t_talisman = uwData.t_talisman;

var t_talismanRes = uwData.t_talismanRes;
var t_talismanSkill = uwData.t_talismanSkill;
var c_prop = uwData.c_prop;

/*
 *   修复宠物共鸣
 */

var check = function(serverData, sClient, cb) {
    userDao.list(sClient, " accountId > 0 and robotId = 0", [], function(err, userList) {
        if (err) return cb(err);
        async.map(userList, function(userData, cb1) {
            var exData = userData.exData || {};
            var needUpUserData = false;
            heroDao.list(sClient, " userId = ? order by id asc", [userData.id], function(err, heroList) {
                let haveTalismans = {};
                heroList.forEach(function(heroData) {
                    let talismanData = heroData.talismanData || {};
                    for (let talismanId in talismanData) {
                        haveTalismans[talismanId] = 1;
                    }
                });
                async.map(heroList, function(locHeroData, cb2) {
                    //记录法宝共鸣
                    locHeroData.talismanFg = locHeroData.talismanFg || {};
                    var talismanFg = locHeroData.talismanFg;
                    var isUp = false;

                    for (let talismanId in haveTalismans) {
                        var talisman = t_talisman[talismanId];
                        var trumpIdResonance = talisman.resonance; //所属共鸣编号组 [46,44,45]

                        for (let i = 0; i < trumpIdResonance.length; i++) {
                            var resonanceId = trumpIdResonance[i];
                            if (!t_talismanRes[resonanceId]) break;
                            var locTalismanFg = talismanFg[resonanceId] || []; //[0,1,...]
                            //console.log(talismanId,trumpIdResonance);
                            var locResonance = t_talismanRes[resonanceId].resonance; //[法宝id,法宝id，。。。]

                            var tempId2Job = Number.tempId2Job(locHeroData.tempId);
                            if (t_talisman[locResonance[0]].job == tempId2Job) {
                                for (var j = 0; j < locResonance.length; j++) {
                                    if (!locTalismanFg[j]) { //还未激活
                                        if (haveTalismans[locResonance[j]]) {
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
                                        needUpUserData = true;
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
                        var upHeroData = {
                            propArr: locHeroData.propArr,
                            combat: locHeroData.combat,
                            talismanFg: locHeroData.talismanFg
                        };
                        heroDao.update(sClient, upHeroData, { id: locHeroData.id }, cb2);
                    } else {
                        cb2(null);
                    }

                }, function(err, data) {
                    if (err) return cb1(err);
                    if (needUpUserData) {
                        var upUserData = {
                            exData: exData
                        };
                        userDao.update(sClient, upUserData, { id: userData.id }, function(err, data) {
                            if (err) return cb1(err);
                            cb1(null, data);
                        });
                    }else{
                        return cb1(null);
                    }
                })
            });

        }, function(err, data) {
            if (err) return cb(err);
            return cb(null, userList.length);
        });

    });
};
scriptUtils.runAllServers(check);
//scriptUtils.runByServerIds([1], check);