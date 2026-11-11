/**
 * Created by Administrator on 2015/12/1.
 */

var arguments = process.argv.splice(2);
var indexData = arguments[0];
var startIndex = 0;
var endIndex = 300;
if(indexData){
    startIndex = parseInt(indexData.split(",")[0]) ||0;
    endIndex = parseInt(indexData.split(",")[1])||300;
}



var accountDataList = require("./accountCfg"+startIndex+"-"+endIndex+".json");
var commonCfg = require("./commonCfg.json");
var http = require("http");


var mainHost = commonCfg.mainHost;
var mainPort = commonCfg.mainPort;

var serverHost = commonCfg.serverHost;
var serverPort = commonCfg.serverPort;

var lootDic = {};


var start = function(){
    var vTime = 100;
    for(var i = 0;i<accountDataList.length;i++){
        var locAccount = accountDataList[i];
        delayLogin(locAccount[0],locAccount[1],locAccount[2],i*vTime,i);
    }
};

var delayLogin = function(name,pwd,channelId,time,index){
    setTimeout(function(){
        login(name,pwd,channelId);
        console.log("第%s个玩家开始登陆",index);
    },time);
};

var login  = function(name,pwd,channelId){
    //r=h.a.a&a={"_0":"oldma1","_1":"111111","_2":99999,"t":1449038356762}&s=undefined&c=0
    var route = "h.a.a";
    var args = {};
    args["_0"] = name;
    args["_1"] = pwd;
    args["_2"] = channelId;
    requestMain(route,args,function(err,data){
        if(err) return console.error(err);
        var v = data.v;
        connectServer(function(err,sessionId){
            if(err) return console.error(err);
            console.log("sessionId:",sessionId);
            var accountId = v["1"]["1"];

            console.log(accountId,v["2"]);
            enterGame(accountId,v["2"],sessionId,function(err,data){
                if(err) return console.error(err);
                if(!data){
                    return console.error("accountId:",accountId)
                }
                if(err) return console.error(err);
                fight(accountId,sessionId,function(){});
            });
        });
    });
};

var connectServer = function(cb){
    var route = "c.n.a";
    var args = {};
    requestServer(route,args,null,function(err,data){
        console.log("err,data");
        console.log(err,data)
        if(err) return cb(err);
        //{"唯一id":[[物品id,物品数量],..]}
        cb(null,data.v[0]);
    });
};

var enterGame = function(accountId,loginKey,sessionId,cb){
    var route = "c.a.a";
    var args = {};
    args["_0"] = accountId;
    args["_1"] = loginKey;
    args["_2"] = 1;
    requestServer(route,args,sessionId,function(err,data){
        if(err) return cb(err);
        //{"唯一id":[[物品id,物品数量],..]}
        cb(null,data.v);
    });
};

var fight = function(accountId, sessionId,cb){
    setInterval(function(){
        getAndInitNextLoot(accountId ,sessionId,function(err,uid){
            if(err) return cb(err);
            pickLoot(sessionId,1,uid,function(err,data){
                if(!err){
                    console.log("捡取成功！");
                }
            })
        });
    },5000);
};

var getAndInitNextLoot = function(accountId,sessionId,cb){
    var lootData = lootDic[accountId];
    if(lootData){
        if(Object.keys(lootData).length>0){
            var lastKey = Object.keys(lootData)[0];
            delete lootData[lastKey];
            return cb(null,lastKey);
        }
    }
    var route = "a.fi.c";
    var args = {};
    args["_0"] = 1;
    args["_1"] = 0;
    requestServer(route,args,sessionId,function(err,data){
        if(err) return cb(err);
        lootDic[accountId] = data.v;
        var lootData = lootDic[accountId];
        if(lootData){
            if(Object.keys(lootData).length>0){
                var lastKey = Object.keys(lootData)[0];
                delete lootData[lastKey];
                return cb(null,lastKey);
            }
        }else{
            cb(null,null);
        }

    });
};

var pickLoot = function(sessionId,copyId,uid,cb){
    var route = "a.fi.a";
    var args = {};
    args["_0"] = copyId;
    args["_1"] = [uid];
    requestServer(route,args,sessionId,function(err,data){
        if(err) return cb(err);
        //{"唯一id":[[物品id,物品数量],..]}
        cb(null,data.v);
    });
};

var requestMain = function(route, arg, cb){
    var params = '/?r='+route+'&a='+JSON.stringify(arg)+'&s=&c=0';
    var options = {
        host: mainHost,
        port: mainPort,
        path: params,
        method: 'GET'
    };

    requestHttp(options,"",function(err,data){
        if(err) return cb(err);
        cb(null,JSON.parse(data));
    });
};

var requestServer = function(route, arg, sessionId, cb){
    ///?r=h.s.f&a={"_0":2,"t":1449038356846}&s=undefined&c=0
    var params = '/?r='+route+'&a='+JSON.stringify(arg)+'&s='+sessionId+'&c=0';
    var options = {
        host: serverHost,
        port: serverPort,
        path: params,
        method: 'GET'
    };

    requestHttp(options,"",function(err,data){
        if(err) return cb(err);
        console.log(data);
        cb(null,JSON.parse(data));
    });
};
// Uncaught exception handler
process.on('uncaughtException', function (err) {
    console.error(' Caught exception: ' + err.stack);
});

/**
 * 请求http
 * @param options
 var options = {
        host: 'buy.itunes.apple.com',
        port: 443,
        path: "/verifyReceipt/",
        method: 'POST'
    };
 * @param writeData
 * @param cb
 */
var requestHttp = function(options,writeData,cb){
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        var str = "";
        res.on('data', function (chunk) {
            str+=chunk;
        });
        res.on('end', function () {
            console.log(str)
            cb(null,str);
        });
    });
    req.on('error', function(e) {
        cb(e.message);
    });
    req.write(writeData);
    req.end();
};


start();