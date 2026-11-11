var verDir = './versions';  // 平台
var reset = require('./reset.js');
reset.resetVersion();
var fs = require('fs');
var userAgentUtils = require("uw-utils").userAgentUtils;
var projectConfig = require('uw-config').project; 
var httpUtils = require('uw-utils').httpUtils;
var biHlBiz = require("uw-log").biHlBiz;
var biHlObj = require("uw-log").biHlObj;
var logger = require('uw-log').getLogger("uw-ver", __filename);

String.prototype.trim=function(){
　　return this.replace(/(^\s*)|(\s*$)/g, "");
};

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
}

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
// 版本manifest cache
var cacheMap = {};

var curFileList = [];
curFileList = walk(verDir);
curFileList.sort(compareVer);

function walk(path){
	fileList = [];	
	var dirList = fs.readdirSync(path);
	dirList.forEach(function(item){
		if(fs.statSync(path + '/' + item).isDirectory()){
			walk(path + '/' + item);
		}else{
			if (item.indexOf("manifest") === 0 && item.indexOf(".json") != -1){
				fileList.push(item);	
			}
		}
	}); 
	return fileList;
}

function compareVer(name1, name2){
    var va1 = name1.slice(8,-5).split(".");
    var va2 = name2.slice(8,-5).split(".");
    var len = Math.max(va1.length, va2.length);
    for (var i = 0; i < len; i++){
        if(parseInt(va1[i]) == parseInt(va2[i])) continue;
        return parseInt(va1[i]) > parseInt(va2[i]) ? true : false;
    }
    return false;
}

function getManifest(ver){
    //console.log('getManifest',ver,verDir);
 	// var fileList=walk( verDir);
 	// fileList.sort(compareVer);
 	var fileVer = "manifest"+ver+".json";
 	var lastFile = curFileList[curFileList.length - 1];
 	//console.log(lastFile);
 	if (cacheMap[fileVer + "_" + lastFile]){
 		return cacheMap[fileVer + "_" + lastFile];
 	}
    //console.log("fileList:", curFileList);
    var manifest =fs.readFileSync( verDir + "/" + lastFile);
    manifest = JSON.parse(manifest);

   // if(ver != "1.0.0"){

        // 只取最新20版本
        var allNum = curFileList.length - 5;
        if (allNum > 0){
            curFileList.splice(0, allNum);
        }

        for (var i = 0; i < curFileList.length; i++){
            // if (compareVer(fileVer, fileList[i])){
            //     continue;
            // }
            var manifest1 =fs.readFileSync(verDir + "/" + curFileList[i]);
            manifest1 = JSON.parse(manifest1);

            for (var k in manifest1.project.resRefreshs) {
                manifest.project.resRefreshs[k] = manifest1.project.resRefreshs[k];
            }
        }    
    //}
 	 
  	cacheMap[fileVer + "_" + lastFile] = manifest;
 	return manifest;
} 

//use  http and https
var app = reset.createApp(reset.HttpAndsApp,projectConfig.versionHttpPort);

console.error("start server finish! listen", projectConfig.versionHttpPort);
// 获取版本更新列表
app.get('/manifest', function(req, res) { 
    res.json(getManifest("0.0.0"));     // 全部返回给客户端，不取客户端的版本号
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
    var now = '|' + new Date().getTime();
    console.log("guidelog:",req.query.data);
    // fs.appendFile('/data/logs/guide_record.log',  req.query.data + now + '\n',(err) => {
    //   if (err) throw err;
    //   console.log('The "data to append" appended success!');
    // });
    res.end('');
});
