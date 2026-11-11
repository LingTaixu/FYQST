const guildBiz = require("uw-guild").guildBiz;
const c_game = require("uw-data").c_game;
const c_prop = require("uw-data").c_prop;

/*
*	gameServer 里一些帮助函数
*/

var exports = module.exports;

exports.isReviveHero = function(heroData){
    if (heroData.equipData && heroData.equipData[5]){       // 是否有水结晶
        return true;
    }
    return false;
};

exports.getHJBossData = function(userData, groupType) {

    // HJBossData : 格式 {groupType: {tm: 时间戳, num: 已夺宝次数, cnum: 已夺宝箱数目}}
    if (!userData.exData[c_prop.userExDataKey.HJBossData]) {
        userData.exData[c_prop.userExDataKey.HJBossData] = {};
        var tmNow = Math.floor(new Date().getTime());
        userData.exData[c_prop.userExDataKey.HJBossData][groupType] = {
            tm:tmNow,
            num:0,
            cnum:0
        }; 
    }else{
        if(!userData.exData[c_prop.userExDataKey.HJBossData][groupType]){
            var tmNow = Math.floor(new Date().getTime());
            userData.exData[c_prop.userExDataKey.HJBossData][groupType] = {
                tm:tmNow,
                num:0,
                cnum:0
            };      
        }else{
            var t = userData.exData[c_prop.userExDataKey.HJBossData][groupType].tm;
            if (!new Date().equalsDay(new Date(t))){    // 不是同一天，重置
                userData.exData[c_prop.userExDataKey.HJBossData][groupType] = {
                    tm:tmNow,
                    num:0,
                    cnum:0
                }; 
            }
        }
    }
 
   return userData.exData[c_prop.userExDataKey.HJBossData]; 
};

exports.getHJBossGroupData = function(userData, groupType){
    var hjBossData =  exports.getHJBossData(userData,groupType);
    return hjBossData[groupType];
};

exports.canOwnBoss = function(userData, groupType){
	var maxNum = c_game.worldBossCfg[16] || 3; 
    var hjBossGroupData = exports.getHJBossGroupData(userData,groupType);
    if (hjBossGroupData.num >= maxNum) return false;
    return true;
};

exports.canPickHJBossChest = function(userData, groupType){
    var maxNum = c_game.worldBossCfg[15] || 3; 
    var hjBossGroupData = exports.getHJBossGroupData(userData,groupType);
    if (hjBossGroupData.cnum >= maxNum) return false;
    return true;
};

exports.addHJBossOwnNum = function(userData, groupType) {
    var maxNum = c_game.worldBossCfg[16] || 3; 
    var hjBossGroupData = exports.getHJBossGroupData(userData,groupType);
    if (hjBossGroupData.num >= maxNum) return false;
    hjBossGroupData.num += 1;
    userData.exData[c_prop.userExDataKey.HJBossData][groupType] = hjBossGroupData;
    return true;
};

exports.addHJBossChestNum = function(userData, groupType) {
    var maxNum = c_game.worldBossCfg[15] || 3; 
    var hjBossGroupData = exports.getHJBossGroupData(userData,groupType);
    if (hjBossGroupData.cnum >= maxNum) return false;
    hjBossGroupData.cnum += 1;
    userData.exData[c_prop.userExDataKey.HJBossData][groupType] = hjBossGroupData;
    return true;
};