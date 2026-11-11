var verDir = './versions';  // 平台
var reset = require('./reset.js');
reset.resetVersion();
require('date-utils');
var fs = require('fs');
var userAgentUtils = require("uw-utils").userAgentUtils;
var projectConfig = require('uw-config').project; 
var httpUtils = require('uw-utils').httpUtils;
var biHlBiz = require("uw-log").biHlBiz;
var biHlObj = require("uw-log").biHlObj;
var logger = require('uw-log').getLogger("uw-ver", __filename);

//当前发布的qa版本，同步和客户端更新
var curDoQA=5;
var curQAVersionFile = "manifest1.8.2.json";        // 只能留一个QA的版本文件
var isLimi=false; 
var QAMainAppHost = "test.sanguoh5.com";
var QAMainAppPort = 9901;


var channelConfig = {}; 
var getChannelConfig = function(channelId, sdkChannelId, cb) {
    //console.log("getServer:", serverList);
    if (channelId == 0) return cb(null, {});
    var key = channelKey(channelId, sdkChannelId);
    if (!channelConfig[key]) {
        _reqList(function(err, dataList) {
            if (err) return cb(null, null);
            return cb(null, dataList[key]);
        })
    } else {
        return cb(null, channelConfig[key]);
    }
};

var channelKey = function(channelId, sdkChannelId){
    var key = channelId;
    if (sdkChannelId && sdkChannelId.trim() != ''){
        key = channelId + "_" + sdkChannelId;
    }
    return key;
};

var getChannelName = function(channelInfo){
    // channel  
    if (!channelInfo)  return "unknown";
   
    if(!channelInfo.sdkChannelId){
        return channelInfo.channelName;
    }

    if(channelInfo.sdkChannelName){
        return channelInfo.sdkChannelName;
    }
    if(channelInfo.channelName){
        return channelInfo.channelName;
    
    }
    return "unknown";
};

var _reqList = function(cb) {
    _reqForMaster("h.s.h0", {}, function(err, data) {
        if (err) return cb && cb(err);
        var channelConfigData = JSON.parse(data);
        //logger.info("_reqList:", svrList);
        channelConfig = {};
        channelConfigData.forEach(function(v) {
            var key = channelKey(v.channelId, v.sdkChannelId);
            channelConfig[key] = {
                id: v.id,                        
                channelId: v.channelId,                  
                sdkChannelId: v.sdkChannelId,                
                channelName: v.channelName,
                sdkChannelName: v.sdkChannelName  
            };
        });
        logger.info("ChannelList:",JSON.stringify(channelConfig));
        cb && cb(null, channelConfig);
    });
};

var _reqForMaster = function(k, para, cb){ 
    let params = '/?r='+k+'&a='+JSON.stringify(para || {});
    let options = {
        host: projectConfig.mainHttpHost,
        port: projectConfig.mainHttpPort,
        path: params,
        method: 'GET',            
        headers: {
           "Content-Type": 'application/json'
        },
    };
    //console.log("_reqForMaster:", params, options);
        if(projectConfig.isHttps){
            httpUtils.requestHttps(options, "", cb);
        }
        else{
            httpUtils.requestHttp(options, "", cb);
        }
};

var getClientIp = function(req) {
    return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress || 
    req.ip;
};
// Load and merge release manifests once; use numeric version ordering.
var manifestStore = require('../runtime/manifests.cjs').createManifestStore(verDir, {
    exclude: [curQAVersionFile]
});
function getManifest() { return manifestStore.latest(); }
function getManifest_LimiForQA() {
    return manifestStore.forQA(curQAVersionFile, QAMainAppHost, QAMainAppPort);
}

//use  http and https
var serverType = projectConfig.isHttps;  // 用这个字段
var app = reset.createApp(serverType,projectConfig.versionHttpPort);

console.error("start server finish! listen", projectConfig.versionHttpPort);
// 获取版本更新列表
app.get('/manifest', function(req, res) { 
    if(isLimi && req.query.doqa == curDoQA){
        res.json(getManifest_LimiForQA("0.0.0",req.query.doqa)); 
    }else{
        res.json(getManifest("0.0.0"));     // 全部返回给客户端，不取客户端的版本号
    }
});

// 处理客户端BI通知信息
app.get('/bi', function(req, res) {
    //BI 
    var biObj = new biHlObj.gameInfoObj();
    if (req.query.accountName && req.query.accountName != "")
        biObj.accountName = req.query.accountName;
    
    if (req.query.userInfo){ 
        var userInfo = JSON.parse(req.query.userInfo); 
        if(userInfo){
            biObj.accountName = userInfo.userdata.uid;    
            biObj.sdkChannelId = userInfo.common.sdkindx;
        }
    } 
    biObj.channelId = req.query.channelId || 99999;
    biObj.userid = req.query.accountId || 0;
    if(!biObj.accountName){
        biObj.accountName = biObj.userid;
    }

    var ccfg = getChannelConfig(biObj.channelId, biObj.sdkChannelId, function(err, ccfg){
        
        var channelName = getChannelName(ccfg);
        biObj.userid = channelName + "_" + biObj.accountName;
        biObj.gameinfo = "loading";  
        biObj.value = req.query.value;
        biObj.user_level = req.query.user_level;
        biObj.kingdom = req.query.kingdom;
        biObj.family = req.query.family;
        biObj.extra = "download_from:" + channelName;
        var ip = getClientIp(req).replace(/::ffff:/, '');
        var serverIndexId = req.query.serverId || req.query.clientid|| 0;
        //serverIndexId = 1;
        biHlBiz.HlGameInfoBi(biObj, serverIndexId, ip,function(err, data){});  
     
        //BI end
        res.end('');

    });

});
app.get('/log', function(req,res) {

    var logger = require('uw-log').getLogger("uw-sys-error", __filename);
    logger.error(JSON.stringify(req.query));
    logger.error("\n");

    res.end('');
});

app.get('/guidelog', function(req,res) {
   var now = new Date().toDBString();
   var strMsg = now +  "," + req.query.UID + "," + req.query.token + "," +req.query.step + "," +req.query.kingdom + "," +req.query.num 
 
    fs.appendFile('./ttf_progress.log', strMsg + '\n',(err) => {
      if (err) throw err;
      //console.log('The "data to append" appended success!');
    });
    res.end('');
});
