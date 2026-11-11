/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Sara on 2015/11/12.
 */

var guildWarRecordDao = require("uw-guild-war").guildWarRecordDao;
var data1 =  require("./360/data1.json");
var async = require("async");
var scriptUtils = require("../scriptUtils");

var data1Server = [17,16,15,14,13,12,11,10,9,8,7,6,5,4,1,18];

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
