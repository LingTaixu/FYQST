/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Sara on 2015/11/12.
 */

var serverInfoDao =  require("uw-server-info").serverInfoDao;
var serverInfoBiz =  require("uw-server-info").serverInfoBiz;

var mainClient =  require("uw-db").mainClient;
var loginClient =  require("uw-db").loginClient;
var project =  require("uw-config").project;

var async = require("async");
var exports = module.exports;


/**
 * 执行所有服
 *
 * 使用方式：
 * runAllServers(function(serverData,sClient,cb){
 *  cb(null,100);
 * });
 * @param script
 */
var runAllServers = function(script){
    serverInfoDao.list(loginClient," 1=1 group by id ",[],function(err,serverList){
        if(err){
            console.error("执行错误:");
            console.error(err);
        }else{
            _runServers(serverList,script);
        }
    });
};

/**
 * 执行指定某些服
 *
 * 使用方式：
 * runByServerIds([1,2,3],function(serverData,sClient,cb){
 *  cb(null,100);
 * });
 *
 * @param serverIds
 * @param script
 */
var runByServerIds = function(serverIds,script){
    serverInfoDao.list(loginClient," serverId in (?)  group by id ",[serverIds],function(err,serverList){
        if(err){
            console.error("执行错误:");
            console.error(err);
        }else{
            _runServers(serverList,script);
        }
    });
};

/**
 * 执行当前
 *
 * 使用方式：
 * runCurServer(function(serverData,sClient,cb){
 *  cb(null,100);
 * });
 *
 * @param script
 */
var runCurServer = function(script){
    serverInfoDao.list(loginClient," serverId in (?)  group by serverId ",[project.serverId],function(err,serverList){
        if(err){
            console.error("执行错误:");
            console.error(err);
        }else{
            _runServers(serverList,script);
        }
    });
};

var _runServers = function(serverList,script){
    var allRecord = 0;
    async.mapLimit(serverList,1,function(serverData,cb1){
        _runScript(serverData,script,function(err,num){
            if(err) {
                cb1(err);
            }else{
                console.log("服务器【%s】成功执行，共（%s）条",serverData.serverId,num);
                allRecord+=num;
                cb1(null);
            }
        });
    },function(err,data){
        if(err){
            console.error("执行错误:");
            console.error(err);
        }else{
            console.log("全部执行成功!一共（%s）条",allRecord);
        }
        setTimeout(function(){
            process.exit(0);
        },100);
    });
};

var _runScript = function(serverData,script,cb){
    serverInfoBiz.getServerClient(serverData.serverId, function (err, sClient) {
        if(err) return cb(err);
        if(!sClient) return cb(null,0);
        script(serverData,sClient,cb);
    });
};


exports.runAllServers = runAllServers;//执行所有服
exports.runByServerIds = runByServerIds;//执行某些服
exports.runCurServer = runCurServer;//执行当前服