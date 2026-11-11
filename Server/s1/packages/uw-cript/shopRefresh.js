/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Sara on 2015/11/12.
 */

var serverInfoDao =  require("uw-server-info").serverInfoDao;
var serverInfoBiz =  require("uw-server-info").serverInfoBiz;
var shopDao = require("uw-shop").shopDao;
var uwData= require("uw-data");
var c_recharge =  uwData.c_recharge;
var c_prop =  uwData.c_prop;
var mainClient =  require("uw-db").mainClient;
var mailBiz = require("uw-mail").mailBiz;

var async = require("async");
var exports = module.exports;

exports.check = function(cb){
    serverInfoDao.list(mainClient,{},function(err,serverList){
        if(err) return cb(err);
        var allRecord = 0;
        async.mapLimit(serverList,100,function(serverData,cb1){
                serverCheck(serverData,function(err,num){
                    if(err) {
                        cb1(err);
                    }else{
                        console.log("服务器【%s】成功执行",serverData.serverId);
                        allRecord+=1;
                        cb1(null);
                    }
                });
            },function(err,data){
                if(err) return cb(err);
                cb(null,allRecord);
            });
    });
};

var serverCheck = function(serverData,cb){
    serverInfoBiz.getServerClient(serverData.serverId, function (err, sClient) {
        if(err) return cb(err);
        shopDao.del(sClient,{id:1},cb);
    });
};

exports.check(function(err,allRecord){
    if(err){
        console.error("执行错误:");
        console.error(err);
    }else{
        console.log("全部执行成功!一共（%s）条",allRecord);
    }
});
