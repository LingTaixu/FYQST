/**
 * Created by Administrator on 2016/3/2.
 */


var BossObj = null;
var c_prop = null;  
var checkRequire = function(){
    var uwData = require("uw-data");
    BossObj = require("uw-boss").BossObj;
    c_prop = uwData.c_prop;
};


var __bossCache = {};

var __userObjDic = {};

var UserObj = function(){
    this.lastExitTime = null;//ÉÏÒ»´ÎÍË³öÕ½¶·Ê±¼ä
};

//»ñÈ¡boss¿ªÆô×´Ì¬
exports.getOpenBossIds = function(){
    var reIds = [];
    var teamBossData = {};
    for(var key in __bossCache){
        var locBossId = parseInt(key);
        var locBossObj = __bossCache[key];
        if(locBossObj.isOpen()){
            var bossData = locBossObj.getBossData();
            if(!bossData.isOver){
                reIds.push(locBossId);
                
                if(bossData.type == c_prop.worldBossTypeKey.team){
                    teamBossData[locBossId] = bossData.curHp;
                }    
            }else{
                if(bossData.type == c_prop.worldBossTypeKey.team){
                    teamBossData[locBossId] = 0;
                } 
            }
        }
    }
    return [reIds, teamBossData];
};

//»ñÈ¡bossÊµÀý
exports.getBossObj = function(bossId){
    checkRequire();
    var bossObj = __bossCache[bossId];
    if(!bossObj) {
        bossObj = new BossObj();
        bossObj.initBossId(bossId);
    }
    __bossCache[bossId] = bossObj;
    return bossObj;
};

//»ñÈ¡boss»º´æ
exports.getBossCache = function(){
    return __bossCache;
};

//»ñÈ¡ÓÃ»§Êý¾Ý
exports.getUserObj = function (userId) {
    var userObj = __userObjDic[userId];
    if (!userObj) {
        userObj = new UserObj();
        __userObjDic[userId] = userObj;
    }
    return userObj;
};

//»ñÈ¡ÓÃ»§Êý¾Ý
exports.setUserObj = function (userId,userObj) {
    __userObjDic[userId] = userObj;
};

// 获得活跃世界boss数据
exports.getActiveWorldBossObj = function(){
    checkRequire();
    for(var key in __bossCache){
        var locBossId = parseInt(key);
        var locBossObj = __bossCache[key];
        if(locBossObj.isOpen() && locBossObj.getBossData().type == c_prop.worldBossTypeKey.world){
            // 现阶段只有一个世界boss, 跳出
            return locBossObj;
        }
    }
    return null;
};

