/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Sara on 2015/11/12.
 */
var mainClient =  require("uw-db").mainClient;

var userDao = require("uw-user").userDao;
var GuildWarRecordEntity = require("uw-entity").GuildWarRecordEntity;
var guildWarRecordDao = require("uw-guild-war").guildWarRecordDao;

var async = require("async");
var exports = module.exports;var scriptUtils = require("./scriptUtils");

var serverArr = [88,84,80,75,68,61,53,44];

var check = function(serverData,sClient,cb){
    if(serverArr.indexOf(serverData.serverId)<=-1) return cb(null,0);

    var guildWarRecordData = new GuildWarRecordEntity();
    guildWarRecordData.recordData = {};
    guildWarRecordData.recordTime = new Date("2016-5-20 20:59:57");
    guildWarRecordData.lastRankData = {"1":{"guildArr":[],"userArr":[],"chairArr":[]},"2":{"guildArr":[],"userArr":[],"chairArr":[]},"3":{"guildArr":[],"userArr":[],"chairArr":[]}};
    guildWarRecordDao.insert(sClient,guildWarRecordData,function(err,data){
        if(err) return cb(err);
        cb(null,1);
    });
};

scriptUtils.runAllServers(check);
