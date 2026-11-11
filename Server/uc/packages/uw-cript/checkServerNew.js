/**
 *  服务器配置 uw_server_info 状态监测脚本,修改新服 为非新服
 */

var loginClient =  require("uw-db").loginClient; 
var serverInfoBiz = require("uw-server-info").serverInfoBiz
 
var async = require("async");  

var check = function(cb){
    console.log("%s 开始执行服务器New状态监测", new Date().toLocaleString());
    serverInfoBiz.getList(loginClient, true, function(err, serverList){

        var lastServerId = 1;
        lastServerId = serverList[serverList.length - 1].id;

        async.mapLimit(serverList,1,function(info,cb1){
            var serverDate = info.serverDate.clearTime().getTime();
            var tmNow = new Date().clearTime().getTime();
            if (tmNow - serverDate >= 86400 * 1000 && info.id != lastServerId){
                serverInfoBiz.updateServerStateNew(loginClient, info.id, 0, cb1); 
            }else{
                cb1(null); 
            } 
        },function(err,data){
            cb(null);
        });     
    });
};

check(function(err,data){
    if(err){
        console.error(err);
    }else{
       //console.log("执行成功");
    }
    console.log("%s 结束执行服务器New状态监测", new Date().toLocaleString());
    process.exit(0);

});