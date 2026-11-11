var exports = module.exports;
var uwData = require("uw-data");
var consts = uwData.consts;
var httpUtils = require("./httpUtils");
var cryptUtils = require("./cryptUtils");
var cryptCfg = require("uw-config").crypt;
var project = require("uw-config").project;
var querystring = require('querystring');

var mainClient = null;
var gameConfigDao = null;
var gameConfigBiz = null;
var checkRequire = function() {
    mainClient = mainClient || require("uw-db").mainClient;
    gameConfigDao = gameConfigDao || require("uw-game-config").gameConfigDao;
    gameConfigBiz = gameConfigBiz || require("uw-game-config").gameConfigBiz;
}
require("date-utils");

exports.requestServer = function(route, arg, serverHost, serverPort, cb) {
    if (!serverHost || !serverPort) return cb(getMsg(c_msgCode.portNotConfig)); //端口或者主机没配置
    route = cryptUtils.enCharCode(cryptCfg.cryptKey, route);
    arg = cryptUtils.enCharCode(cryptCfg.cryptKey, JSON.stringify(arg));
    ///?r=h.s.f&a={"_0":2,"t":1449038356846}&s=undefined&c=0&
    var params = '/?r=' + route + '&a=' + arg + '&c=1&ak=' + cryptCfg.adminKey;
    var options = {
        host: serverHost,
        port: serverPort,
        path: params,
        method: 'GET'
    };
    if (project.isHttps) {
        // console.error('requestServer===https============+>',options);
        httpUtils.requestHttps(options, "", function(err, data) {
            if (err) return cb(err);
            data = JSON.parse(data);
            cb(data.m, data.v);
        });
    } else {
        // console.error('requestServer=====http==========+>',options);
        httpUtils.requestHttp(options, "", function(err, data) {
            if (err) return cb(err);
            data = JSON.parse(data);
            cb(data.m, data.v);
        });
    }
};

exports.requestRankServer = function(method, params, cb) {
    if (!method) return cb(null);
    checkRequire();

    gameConfigBiz.getRankServer(mainClient, function(err, rankServerCfg) {
        if (err) return cb(err);
        var serverHost = rankServerCfg.rankServerHost;//'192.168.28.186';
        var serverPort = rankServerCfg.rankServerPort;//7010;
        if(!serverHost || !serverPort) {
            console.error('获取跨服排行服务器 配置失败:serverHost,serverPort',serverHost,serverPort);
            return cb(null);
        }
        params = JSON.stringify(params);
        //params = querystring.escape(params);
        console.error('params===>', params);
        var path = "/" + method;
        var options = {
            host: serverHost,
            port: serverPort,
            path: path,
            method: 'POST',
            headers: {
                "Content-Type": 'application/json',
                "Content-Length": Buffer.byteLength(params)
            }
        };
//        console.error('requestRankServer===>', options);
        httpUtils.requestHttp(options, params, function(err, data) {
            if (err) return cb(err);
            data = JSON.parse(data);
            // console.error("after parse requestRankServer typeof data==data=>",typeof data,data);
            cb(null, data);
        });
    });
}