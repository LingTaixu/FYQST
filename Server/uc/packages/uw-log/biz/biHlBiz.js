/**
 * 胡莱BI接口
 */  
var g_cache;
var sdkBiz ;
var project = require("uw-config").project;
var querystring = require("querystring");
var channelConfigBiz = require("uw-channel-config").channelConfigBiz;
var WSClient = null; 

var exports = module.exports;
 
// 客户端 -> version -> HooLai
exports.HlGameInfoBi = function(obj, serverId, userIp, cb){
    if(obj.value <= 3){
        _recordClientBi("GameInfo", obj, serverId, userIp, cb);
    }else{  
        _recordClientBi("GameInfo2", obj, serverId, userIp, cb);        // 不发给胡莱的BI
    }
};

// Gameserver
exports.HlInstallBi = function(obj, serverId, accountInfo, userIp, cb){
	_recordBi("Install", obj, serverId, 0, accountInfo, userIp, cb);
};

exports.HlPaymentBi = function(obj, serverId,  userId, accountInfo, userIp, cb){
    //_recordBi("Dau", obj, serverId,  userId, userIp, cb);
	 _recordBi("Payment", obj, serverId,  userId, accountInfo, userIp, cb);
};

exports.HlDauBi = function(obj, serverId,  userId, accountInfo, userIp, cb){
	_recordBi("Dau", obj, serverId,  userId, accountInfo, userIp, cb);
};

exports.HlEconomyBi = function(obj, serverId,  userId, accountInfo, userIp, cb){
	_recordBi("Economy", obj, serverId,  userId, accountInfo, userIp, cb);
};

exports.HlCounterBi = function(obj, serverId,  userId, accountInfo, userIp, cb){

	_recordBi("Counter", obj, serverId,  userId, accountInfo, userIp, cb);
};
 
exports.HlMilestoneBi = function(obj, serverId, userId,  accountInfo, userIp, cb){
	_recordBi("Milestone", obj, serverId,  userId, accountInfo,  userIp, cb);
};
 
exports.HlBeatBi = function(obj, serverId,  userId, accountInfo, userIp, cb){
    obj.clientid = project.serverId;
    _recordBi("Beat", obj, serverId,  userId, accountInfo, userIp, cb);
};

// 赋值平台数据
var _assign = function(metric, obj, account, cb){

    // sdkBiz = sdkBiz || require('uw-sdk').sdkBiz; 
     // var channelName = sdkBiz.channelName(account);
    // if (account)
    //     obj.userid = channelName + "_" + account.name;
    // else {
    //     if (obj.accountName && obj.accountName != "")
    //         obj.userid = channelName + "_" + obj.accountName;
    //     else
    //         obj.userid = "0";
    // }
    // if (obj.userid == "0") return;

    channelConfigBiz.getGameConfigById(account.channelId, account.sdkChannelId, function(err, channelInfo){
        if(err) return cb(null);
        var channelName = "unknown";
        if(channelInfo){ 
            if(!channelInfo.sdkChannelId){
                channelName = channelInfo.channelName;
            }else if(channelInfo.sdkChannelName){
                channelName = channelInfo.sdkChannelName;
            }else if(channelInfo.channelName){
                channelName = channelInfo.channelName;
            } 
        }else{
            console.error("[BI] channel %s %s NOT CONFIG", account.channelId, account.sdkChannelId);
        }
        if(!channelName){
            channelName = "unknown";
        }

        if (account.channelId == '10013' || account.channelId == '10018') {
            obj.userid = account.name;
        } else {
            obj.userid = channelName + "_" + account.name;
        }

        switch(metric){
            // case "GameInfo":
            //     obj.extra = "download_from:" + channelName;
            //     break;
            case "Install":
                obj.creative = channelName;
                break;
            case "Payment":
                obj.provider = channelName;
                break;
            case "Dau":
                obj.creative = channelName;
                break;
            case "Economy":
                if (account.channelId == '10013' || account.channelId == '10018') {
                    if (account.sdkData) {
                        obj.udid = account.sdkData.udid;
                        obj.productId = account.sdkData.productId;
                    }
                }
                break;
            case "Counter":
                obj.extra = "download_from:" + channelName;
                break;
            case "Milestone":
                break;
            case "Beat":
                obj.creative = channelName;
                break;
        }
        return cb(null, obj); 
    });
};

function biEnvelope(metric, clientid, ip, ds, jsonString, productId){
    this.op = "hl_bi";
    this.snid = project.snid;
    this.gameid = project.gameId;
    this.metric = metric;
    this.clientid = clientid;
    this.ip = ip;
    this.ds = ds;
    this.jsonString = jsonString;

    //  转服务器ID给胡莱
    this.clientid = this.clientid || 0;
    if (this.clientid != 0 && this.clientid != '0')
        this.clientid = parseInt(this.clientid) + parseInt(project.biSID);
    // if(parseInt(project.biSID) == 0){
    //     this.snid = 666;
    //     this.gameid = 950;   // 957   //  默认值
        if (productId){
            this.gameid = parseInt(productId);
        }
   // }
}

var _recordBi = function(metric, obj, serverId, userId, accountInfo, userIp, cb){
 
    serverId = serverId || project.serverId;
    g_cache = g_cache || require("uw-global").g_cache; 
    WSClient = WSClient || require("uw-ws").WSClient;
    var ds = (new Date()).toFormat("YYYY-MM-DD");  
     var account = {};  
    
    if(accountInfo){
        account = accountInfo;
    }else{
        var  gamePlayer = g_cache.getGamePlayerInCache(userId); 
         if (!gamePlayer) { 
            return cb('no user'); 
        }   
        account = gamePlayer.accountData;
    };
   
    if(account)
        _assign(metric, obj, account,function(err, objData){  
            var productId = objData.productId;
            delete objData.productId;
            var jsonString = JSON.stringify(objData); 
            jsonString = querystring.escape(jsonString);
            var biObj = new biEnvelope(metric, serverId, userIp, ds, jsonString, productId);
            //console.error("_recordBi:", JSON.stringify(biObj));
            WSClient.send(JSON.stringify(biObj));
            cb && cb();
        });
     
};

var _recordClientBi = function(metric, obj, serverId, userIp, cb){  
    var ds = (new Date()).toFormat("YYYY-MM-DD");  
    WSClient = WSClient || require("uw-ws").WSClient;
     // var account = {
     //    name : obj.accountName,
     //    channelId : obj.channelId,
     //    sdkChannelId: obj.sdkChannelId 
     // };
 
    //_assign(metric, obj, account);

    var jsonString = JSON.stringify(obj); 
    jsonString = querystring.escape(jsonString);
    var biObj = new biEnvelope(metric, serverId, userIp, ds, jsonString);
    //console.log("_recordBi:", JSON.stringify(biObj));
    WSClient.send(JSON.stringify(biObj));
    cb();
};
