/**
 * Created by Administrator on 2014/6/10.
 */  
var channelConfigDao = require("./../dao/channelConfigDao");
var mainClient = require("uw-db").mainClient;
var g_channelConfig = {};
 
var exports = module.exports;
 

var channelKey = function(channelId, sdkChannelId){
    var key = channelId;
    if (sdkChannelId && sdkChannelId.trim() != ''){
        key = channelId + "_" + sdkChannelId;
    }
    return key;
};

//获取列表
exports.getList = function(mainClient,cb){ 
    channelConfigDao.list(mainClient," 1 = 1 ",[],cb);
};
 
exports.getGameConfigById = function(channelId, sdkChannelId,  cb){

    var ck = channelKey(channelId, sdkChannelId);
    if (!g_channelConfig[ck]){

        channelConfigDao.list(mainClient," 1 = 1 ",[],function(err, data){
            if(err) return cb(err);

            g_channelConfig = {};

            for(var i = 0; i < data.length; i++){
                var v = data[i];
                var key = channelKey(v.channelId, v.sdkChannelId);
                g_channelConfig[key] = {                      
                    channelId: v.channelId,                  
                    sdkChannelId: v.sdkChannelId,                
                    channelName: v.channelName,
                    sdkChannelName: v.sdkChannelName  
                };
            }

            return cb(null, g_channelConfig[ck]);
        });

    }else{
        return cb(null, g_channelConfig[ck]);
    }
};
