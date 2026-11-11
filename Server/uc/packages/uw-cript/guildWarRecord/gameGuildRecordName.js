/**
 * Created by Sara on 2015/11/12.
 */
var gameRecordDao = require("uw-game-record").gameRecordDao;
var uwData= require("uw-data");
var c_prop = uwData.c_prop;

var userDao = require("uw-user").userDao;
var MailEntity = require("uw-entity").MailEntity;
var cmdJs = require('cmdjs');
var fs = cmdJs.fs2;
var path = cmdJs.path2;


var dataDir = path.join(__dirname, "data");

var scriptUtils = require("../scriptUtils");

var async = require("async");
var exports = module.exports;

var check = function(serverData,sClient,cb){
    gameRecordDao.listCols(sClient,"id,userId,costDiamondRecord", " recordTime >= ? and recordTime <=?",[new Date("2016-05-07 00:00:00"), new Date("2016-05-07 23:59:59") ],function(err,gameRecordList) {
        if (err) return cb(err);
        if(gameRecordList.length<=0) return cb(null,0);
        //gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.clearGuildWarCd,costDiamond,cb1);
        var logData = {};
        var userIds = [];
        for(var i = 0;i<gameRecordList.length;i++){
            var locData = gameRecordList[i];
            var costDiamond1 = locData.costDiamondRecord[c_prop.diamondCostTypeKey.clearGuildWarCd]||0;
            var costDiamond2 = locData.costDiamondRecord[c_prop.diamondCostTypeKey.inspireGuildWar]||0;
            if(costDiamond1<=0&&costDiamond2<=0) continue;
            logData[locData.userId] = [costDiamond1,costDiamond2];
            userIds.push(locData.userId);
        }
        saveLog(serverData,sClient,userIds,logData,cb)
    });
};

var saveLog = function(serverData,sClient,userIds,data,cb){
    var content = "";
    content += "用户id|用户名|cd元宝|鼓舞元宝";
    content += "\r\n";
    content += "\r\n";
    var filePath = path.join(dataDir, _getServerName(serverData) +"("+serverData.id+").txt");
    if(userIds.length<=0){
        fs.writeFileSync(filePath, content);//copy if it`s a file
        return cb(null,0);
    }
    userDao.listCols(sClient,"id,nickName"," id in (?) ", [userIds], function(err,userList){
        if (err) return cb(err);
        for(var i = 0;i<userList.length;i++){
            var locUser = userList[i];
            var locContent = "";
            locContent+= locUser.id;
            locContent+="|";
            locContent+= locUser.nickName;
            locContent+="|";
            locContent+= data[locUser.id][0]||0;
            locContent+="|";
            locContent+= data[locUser.id][1]||0;
            content+=locContent +"\r\n";
        }
        fs.writeFileSync(filePath, content);//copy if it`s a file
        cb(null,userList.length)
    });

};

var _getServerName = function(serverData){
    return serverData.mergerName?serverData.mergerName:(serverData.name+"-"+serverData.area);
};

scriptUtils.runAllServers(check);