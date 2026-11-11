/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Sara on 2015/11/12.
 */

var guildWarRecordDao = require("uw-guild-war").guildWarRecordDao;
var data1 =  require("./qqgame/data1.json");
var async = require("async");
var scriptUtils = require("../scriptUtils");


var data1Server = [240,239,238,237,236,235,233,232,231,229,215,214,213,212,211,210,209,208,207,206,205,204,203,202,201,200,199,198,196,195,194,193,192,191,190,189,188,187,186,185,184,183,181,180,179,178,177,176,175,174,173,172,171,170,169,161,160,159,158,157,156,155,154,153,152,151,150,149,148,147,140,131,241,242,243];

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
