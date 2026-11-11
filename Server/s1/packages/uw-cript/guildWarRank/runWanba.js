/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Sara on 2015/11/12.
 */

var guildWarRecordDao = require("uw-guild-war").guildWarRecordDao;
var data1 =  require("./wb/data1.json");
var async = require("async");
var scriptUtils = require("../scriptUtils");

var data1Server = [28,27,26,25,24,23,22,21,20,19,9,1,29];

var exports = module.exports;

var check = function(serverData,sClient,cb){
    guildWarRecordDao.selectCols(sClient,"id,lastRankData"," 1=1 order by recordTime desc",[],function(err,data){
        if(err) return cb(err);
        if(!data) return cb(null,0);
         var lastRankData = null;
        if(data1Server.indexOf(serverData.serverId)>-1){
            lastRankData = data1;
        }
        if(!lastRankData) return cb(null,0);
        guildWarRecordDao.update(sClient,{lastRankData:lastRankData},function(err,data){
            if(err) return cb(err);
            cb(null,1);
        });
    });
};


scriptUtils.runAllServers(check);
