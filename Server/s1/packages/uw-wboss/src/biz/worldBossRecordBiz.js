/**
 * Created by Administrator on 2015/12/25.
 */

var async = require("async");
var getMsg = require("uw-utils").msgFunc(__filename);
var propUtils = require("uw-utils").propUtils;
var uwData = require("uw-data");
var c_msgCode = uwData.c_msgCode;
var consts = uwData.consts;
var c_chatSys = uwData.c_chatSys;
var c_bossParameter = uwData.c_bossParameter;
var c_bossHurtRate = uwData.c_bossHurtRate;
var c_prop = uwData.c_prop;
var c_game = uwData.c_game;
var t_otherBuff = uwData.t_otherBuff;
var t_monster = uwData.t_monster;
var c_bossWorld = uwData.c_bossWorld;

var WorldBossRecordEntity = require("uw-entity").WorldBossRecordEntity;
var worldBossRecordDao = require("../dao/worldBossRecordDao.js");

var exports = module.exports;
 
exports.wbBattleResult = function (client, battleId, bossId, resultData, cb) {
    console.error("wbBattleResult:", battleId, bossId, resultData);
    var entity = new WorldBossRecordEntity();
    entity.battleId = battleId;
    entity.bossId = bossId;
    entity.resultData = resultData;
    entity.recordTime = new Date();
    worldBossRecordDao.insert(client, entity, function(err, data){
    	console.log("insert :", err, data);
    });
    cb(null);
};

exports.getWBBattleResult = function (client, battleId, cb) {
   // console.error("getWBBattleResult:", battleId);
    worldBossRecordDao.getLastBattleResult(client, battleId, function(err, data){
    	if(err) return cb(err);
    	if(!data) return cb(null, null);
    	return cb(null, data[0]);
    });  
};