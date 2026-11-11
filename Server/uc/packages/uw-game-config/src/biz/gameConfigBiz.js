/**
 * Created by wupeng on 2018/09/18.
 */

var async = require("async"); 
var getMsg = require("uw-utils").msgFunc(__filename);
var gameConfigDao = require("./../dao/gameConfigDao");
var GameConfigEntity = require('uw-entity').GameConfigEntity;
var uwData = require("uw-data");
var exports = module.exports;

var checkRequire = function(){
};

var RANKSERVERCACHE_INTERVAL = 600000; // 缓存间隔 600秒
var rankServercache = {};
exports.getRankServer = function (client, cb) {
    var nowTime = new Date().getTime();
    if(rankServercache && rankServercache.saveTime && nowTime - rankServercache.saveTime < RANKSERVERCACHE_INTERVAL){
        // console.error('======================getCSBossServer  from  rankServercache============');
        return cb(null, rankServercache.rankServerCfg);
    }
    gameConfigDao.list(client,{},function(err,dataList){
        if(err) return cb(null);
        if(dataList.length > 0){
            var locServers = dataList[0];
            rankServercache.rankServerCfg = locServers;
            rankServercache.saveTime = new Date().getTime();
            return cb(null, locServers);
        }
        cb("no RankServer");
    });
};