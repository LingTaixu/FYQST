
var async = require("async");
var getMsg = require("uw-utils").msgFunc(__filename);
var battlesGroupDao = require("./../dao/battlesGroupDao");
var project = require("uw-config").project;
var exports = module.exports;

var BATTLESGROUPCACHE_INTERVAL = 20000; // 缓存间隔 20秒
var battlesGroupCache = {};
exports.getCSBossServer = function (client, cb) {
    var serverId = project.serverId;
    var nowTime = new Date().getTime();
    if(battlesGroupCache && battlesGroupCache.saveTime && nowTime - battlesGroupCache.saveTime < BATTLESGROUPCACHE_INTERVAL){
        // console.error('======================getCSBossServer  from  battlesGroupCache============');
        return cb(null, battlesGroupCache.battlesGroupCfg);
    }
    battlesGroupDao.list(client,{},function(err,serversList){
        if(err) return cb(null);
        for(var i = 0;i<serversList.length;i++){
            var locServers = serversList[i];
            if(locServers.serverArr.indexOf(parseInt(serverId))>-1){
                battlesGroupCache.battlesGroupCfg = locServers;
                battlesGroupCache.saveTime = new Date().getTime();
                return cb(null, locServers);
            }
        }
        cb("no server");
    });
};

exports.getServerIds = function (client, battleId, cb) {
    battlesGroupDao.select(client,{battleId:battleId},function(err,server){
        if(err) return cb(null, []);
        var arr = server.serverArr || [];
        cb(null, arr);
    });
};
