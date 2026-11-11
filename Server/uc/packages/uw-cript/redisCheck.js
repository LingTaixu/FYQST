/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Sara on 2015/11/12.
 */
var mainClient =  require("uw-db").mainClient;
var gameConfigDao = require("uw-game-config").gameConfigDao;
var redisHelper =  require("uw-db").redisHelper;

var async = require("async");
var exports = module.exports;var scriptUtils = require("./scriptUtils");

var check = function(serverData,sClient,cb){
    gameConfigDao.select(mainClient,{},function(err,gameConfigData) {
        if (err) return cb(err);
        var cfg = {
            name :"server1",
            host:gameConfigData.guildWarHost,
            port:gameConfigData.guildWarPort
        };
        var client = redisHelper.getClient(cfg);
        client.set("test","test",function(err,data){
            if (err) return cb(err);
            client.get("test",function(err,data){
                if (err) return cb(err);
                if(data)
                    cb(null,1);
                else
                    cb(null,0);
            });
        });
    });
};

scriptUtils.runCurServer(check);
