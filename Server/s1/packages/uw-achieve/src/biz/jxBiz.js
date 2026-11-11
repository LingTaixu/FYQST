/**
 * Created by Administrator on 2017/11/30.
 */

var uwData = require("uw-data");
var c_prop = uwData.c_prop;
var t_junxian = uwData.t_junxian;
var c_msgCode = uwData.c_msgCode;
var c_game = uwData.c_game;
var getMsg = require("uw-utils").msgFunc(__filename);
var userUtils = require("uw-user").userUtils;
var async = require("async");
var heroPropHelper = require("uw-hero").heroPropHelper;
var propUtils = require("uw-utils").propUtils;
var g_cache =require("uw-global").g_cache;
var exports = module.exports;

var userDao = null;
var heroDao = null;
var userBiz = null;
var taskBiz = null;
var checkRequire = function(){
    userBiz = userBiz || require("uw-user").userBiz;
    userDao = userDao || require("uw-user").userDao;
    heroDao = heroDao || require("uw-hero").heroDao;  
    taskBiz = taskBiz || require("uw-task").taskBiz;  
    
};
/**
 * 军衔升级
 * @param client
 * @param userId
 * @param cb
 */
exports.levelUp = function(client, userId, cb) {
    checkRequire();
    //userDao.select(client, {id: userId}, function(err, userData){
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer){
        if(err) return cb(err);
        var userData = gamePlayer.userData;
        var jxLvl = userData.jxLvl;
        var jxExp = userData.jxExp;
        var jxData = t_junxian[jxLvl];
        if (!t_junxian[jxLvl + 1]){
            return cb(getMsg(c_msgCode.jxMaxed));
        }

        if(jxData) {
            var needExp = jxData.exp;
            if(jxExp >= needExp) {
                jxExp -= needExp;
                jxLvl++;
                userData.jxLvl = jxLvl;
                userData.jxExp = jxExp;
                var heroList = gamePlayer.heroListData;
                //heroDao.list(client," userId = ? order by id asc",[userId],function(err,heroList) {
                    //if(err) return cb(err);
                    for(var i = 0;i<heroList.length;i++) {
                        var locHero = heroList[i];
                        locHero.propArr = heroPropHelper.calHeroProp(userData, locHero);
                        locHero.combat = heroPropHelper.calCombat(userData, locHero);

                        var upHeroData = {
                            propArr:locHero.propArr,
                            combat:locHero.combat
                        };
                        gamePlayer.setHeroDataDirty(locHero.id);
                        //heroDao.update(client,upHeroData,{id: locHero.id}, function(err,data){console.log(err);});
                    }
                    //军衔达到XX级
                    taskBiz.setTaskValue(client,userId,c_prop.cTaskTypeKey.jxLvl, userData.jxLvl,function(){});
                    userBiz.setMedalValue(client, userId, c_prop.medalLootTypeKey.jxLvl, userData.jxLvl, function(err, data){});

                    var updateUserData = {
                        jxLvl: userData.jxLvl,
                        jxExp: userData.jxExp
                    }
                    gamePlayer.setUserDataDirty(g_cache.UDDirtyType.achieve);
                    return cb(null, [updateUserData, heroList]);
               // });

            }else {
                return cb(getMsg(c_msgCode.noExp));//经验不足
            }
        } 
    });
}
 