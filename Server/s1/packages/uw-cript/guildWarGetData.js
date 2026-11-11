/**
 * Created by Administrator on 2016/2/16.
 */

var guildWarRecordDao = require("uw-guild-war").guildWarRecordDao;
var cmdJs = require('cmdjs');
var fs = cmdJs.fs2;
var path = cmdJs.path2;

var async = require("async");
var exports = module.exports;
var scriptUtils = require("./scriptUtils");
var strUtils = cmdJs.strUtils;
var outDir = path.join(__dirname, "guildWarData");

var check = function(serverData,sClient,cb){
    //if(serverData.status != 1)  return cb(null,0);
    guildWarRecordDao.select(sClient,"recordTime>? ",[(new Date()).clearTime()],function(err,guildWarRecordData) {
        if (err) return cb(err);
        if(!guildWarRecordData) return cb(null,0);
        fs.mkdirSync2(outDir);//创建目录
        var filePath = path.join(outDir, "server"+serverData.serverId+".json");
        var contentData = {};
        contentData.serverId = serverData.serverId;
        contentData.recordData = guildWarRecordData.recordData;
        fs.writeFileSync(filePath, JSON.stringify(contentData));//copy if it`s a file
        cb(null,1);
    });

};

scriptUtils.runAllServers(check);
