/**
 * Created by Administrator on 2017/11/30.
 */

var uwData = require("uw-data");
var c_prop = uwData.c_prop;
var t_achieve = uwData.t_achieve;
var c_msgCode = uwData.c_msgCode;
var t_talismanSkill = uwData.t_talismanSkill;
var c_game = uwData.c_game;
var getMsg = require("uw-utils").msgFunc(__filename);
var userUtils = require("uw-user").userUtils;
var async = require("async");
var heroPropHelper = require("uw-hero").heroPropHelper;
var propUtils = require("uw-utils").propUtils;
var g_cache = require("uw-global").g_cache;
var exports = module.exports;

var userDao = null;
var userBiz = null;
var heroDao = null;
var chatBiz = null;
var taskBiz = null;
var checkRequire = function() {
    userBiz = userBiz || require("uw-user").userBiz;
    userDao = userDao || require("uw-user").userDao;
    heroDao = heroDao || require("uw-hero").heroDao;
    chatBiz = chatBiz || require("uw-chat").chatBiz;
    taskBiz = taskBiz || require("uw-task").taskBiz;
};
/**
 * 成就段位升级
 * @param client
 * @param userId
 * @param cb
 */
exports.levelUp = function(client, userId, cb) {
    checkRequire();
    // userDao.select(client, {id: userId}, function(err, userData){
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var achieveLvl = userData.achieveLvl;
        var achieveExp = userData.achieveExp;
        // var nextAchieveLvl = achieveLvl+1;
        var achieveData = t_achieve[achieveLvl];
        if (!achieveData) return cb(getMsg(c_msgCode.noPlot));
        var needLvl = achieveData.lvl;
        if (needLvl > userData.lvl) return cb(getMsg(c_msgCode.unableToAchieve));
        if (achieveData.star != 10) return cb(getMsg(c_msgCode.unenoughStarToAchieve));
        var needExp = achieveData.exp;
        if (achieveExp < needExp) return cb(getMsg(c_msgCode.noExperience));

        // 段位升级
        var nextAchieveData = t_achieve[achieveLvl + 1];
        if (!nextAchieveData) return cb(getMsg(c_msgCode.unableToAchieve));

        //先升一个段位
        achieveExp -= needExp;
        achieveLvl++;
        // 触发技能
        if (nextAchieveData.skillId) {
            exports.addAchieveSkill(userData, nextAchieveData.skillId);
        }

        //星级 提升到下个段位的满星为止
        var nextDuan = nextAchieveData.achieveLvl;
        var t_achieveKeysArr = Object.keys(t_achieve);

        for (var i = achieveLvl; i < t_achieveKeysArr.length; i++) {
            var curCfg = t_achieve[t_achieveKeysArr[i]];
            if (curCfg.achieveLvl > nextDuan) break;
            if (achieveExp < curCfg.exp) break;
            if (curCfg.star == 10) break;
            // console.log('userData.achieveExp',userData.achieveExp);
            achieveExp -= curCfg.exp;
            achieveLvl++;
        }
        userData.achieveLvl = achieveLvl;
        userData.achieveExp = achieveExp;
        //计算成就星级 end

        //记录成就等级（紧急委托任务）
        taskBiz.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.achieveLvl, achieveLvl, function() {});

        var heroList = gamePlayer.heroListData;
        // heroDao.list(client," userId = ? order by id asc",[userId],function(err,heroList) {
        //if(err) return cb(err);
        for (var i = 0; i < heroList.length; i++) {
            var locHero = heroList[i];
            locHero.propArr = heroPropHelper.calHeroProp(userData, locHero);
            locHero.combat = heroPropHelper.calCombat(userData, locHero);

            var upHeroData = {
                propArr: locHero.propArr,
                combat: locHero.combat
            };
            gamePlayer.setHeroDataDirty(locHero.id);
            //heroDao.update(client,upHeroData,{id: locHero.id}, function(err,data){console.log(err);});
        }

        var updateUserData = {
            achieveLvl: userData.achieveLvl,
            achieveExp: userData.achieveExp,
            exData: userData.exData
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.achieve);

        var duan = t_achieve[userData.achieveLvl].achieveLvl;
        _addSysChat(userData, duan);
        userBiz.setMedalValue(client, userId, c_prop.medalLootTypeKey.achieveLvl, duan, function() {});
        return cb(null, [updateUserData, heroList]);
        // });

    });
}

exports.addAchieveSkill = function(userData, skillId) {

    // 触发技能  
    if (skillId && t_talismanSkill[skillId]) {

        userData.exData = userData.exData || {};

        var type = t_talismanSkill[skillId].type;
        if (type != c_prop.talismanSkillTypeKey.property) { //记录到exData
            if (!userData.exData[c_prop.userExDataKey.talismanSkill]) userData.exData[c_prop.userExDataKey.talismanSkill] = {};
            if (!userData.exData[c_prop.userExDataKey.talismanSkill][type]) userData.exData[c_prop.userExDataKey.talismanSkill][type] = [];

            if (userData.exData[c_prop.userExDataKey.talismanSkill][type].indexOf(skillId) == -1) {
                userData.exData[c_prop.userExDataKey.talismanSkill][type].push(skillId);
            }
        }

        if (!userData.exData[c_prop.userExDataKey.achieveSkill])
            userData.exData[c_prop.userExDataKey.achieveSkill] = [];
        if (userData.exData[c_prop.userExDataKey.achieveSkill].indexOf(skillId) == -1) {
            userData.exData[c_prop.userExDataKey.achieveSkill].push(skillId);
        }
    }

}

var _addSysChat = function(userData, duan) {
    checkRequire();
    var sysMsgId = 0;
    if (duan == 1) {
        sysMsgId = 110;
    } else if (duan == 2) {
        sysMsgId = 145;
    } else if (duan == 3) {
        sysMsgId = 136;
    } else if (duan == 4) {
        sysMsgId = 137;
    } else if (duan == 5) {
        sysMsgId = 138;
    } else if (duan == 6) {
        sysMsgId = 139;
    } else if (duan == 7) {
        sysMsgId = 140;
    } else if (duan == 8) {
        sysMsgId = 151;
    }

    if (sysMsgId > 0)
        chatBiz.addSysData(sysMsgId, [userData.nickName]);
}