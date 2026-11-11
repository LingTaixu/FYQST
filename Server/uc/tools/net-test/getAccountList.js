/**
 * Created by Administrator on 2015/12/2.
 */
var mainClient = require("uw-db").mainClient;
var loginClient = require("uw-db").loginClient;
var accountDao = require("uw-account").accountDao;
var uwClient = require("uw-db").uwClient;
var userDao = require("uw-user").userDao;
var arguments = process.argv.splice(2);
var indexData = arguments[0];
var startIndex = 0;
var endIndex = 300;
if(indexData){
    startIndex = parseInt(indexData.split(",")[0]) ||0;
    endIndex = parseInt(indexData.split(",")[1])||300;
}



var gen = function(cb){
    userDao.listCols(uwClient,"accountId"," robotId = 0 order by lvl desc limit ?,?",[startIndex,endIndex-startIndex],function(err, userList){
        if(err) return cb(err);
        var accountIds = [];
        for(var i = 0;i<userList.length;i++){
            var locUser = userList[i];
            accountIds.push(locUser.accountId);
        }

        accountDao.listCols(loginClient,"name,pwd,channelId"," id in (?)",[accountIds],function(err,accountIdList){
            if(err) return cb(err);
            var accountDataList = [];
            for(var i = 0;i<accountIdList.length;i++){
                var locAccount = accountIdList[i];
                accountDataList.push([locAccount.name,locAccount.pwd,locAccount.channelId]);
            }
            var cmdJs = require('cmdjs');
            var fs = cmdJs.fs2;
            fs.writeFileSync("accountCfg"+startIndex+"-"+endIndex+".json", JSON.stringify(accountDataList));
            cb(null);
        });
    });
};

gen(function(err,data){
    if(err){
        console.error("执行失败");
        console.error(err);
    }else{
        console.log("执行成功");
    }
    process.exit(0);
});