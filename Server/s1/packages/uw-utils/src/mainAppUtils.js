/*
*	mainApp 初始
*/
var exports = module.exports;

var serverInfoBiz;

var checkRequire = function(){
    serverInfoBiz = serverInfoBiz || require("uw-server-info").serverInfoBiz;
};

/**
 * 服务器启动初始化
 */
exports.initServer = function(cb){
    checkRequire();
    __getServerList();
    setInterval(__getServerList, 180 * 1000); // 
    return cb(null);
};

var __getServerList = function(){
 	serverInfoBiz.getCurrServerListFromDB(function(){});
};