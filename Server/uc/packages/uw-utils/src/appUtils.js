/**
 * Created by Administrator on 14-9-29.
 */
var exports = module.exports;
var createDirUtils =require("./createDirUtils");
var logger = require('uw-log');
var log4jsCfg = require("uw-config").log4js;
var log4js_serverCfg = require('uw-config').log4js_server;
var projectConfig = require('uw-config').project;
var moCron = require('uw-cron');
var g_guild = require('uw-global').g_guild; 
var g_incognito = require("uw-global").g_incognito;
var g_fakeData = require("uw-global").g_fakeData;
var g_cache = require("uw-global").g_cache;
var g_server = require("uw-global").g_server;
var g_boss = require("uw-global").g_boss;
var async = require('async');
var robotUtils = require('./robotUtils');
var uwClient = require('uw-db').uwClient;
var mainClient = require('uw-db').mainClient; 

var bossBiz;
var clusterBiz;   
var lootConfigBiz;
var checkRequire = function(){
    bossBiz = bossBiz || require("uw-boss").bossBiz;
    clusterBiz = clusterBiz || require('uw-cluster').clusterBiz;   
    lootConfigBiz = lootConfigBiz || require("uw-loot-config").lootConfigBiz;
};


exports.before = function(){
    checkRequire();
    var str_log4js_serverCfg = JSON.stringify(log4js_serverCfg);
    var workerId = clusterBiz.getWorkerId();
    str_log4js_serverCfg = str_log4js_serverCfg.replace(/workId/g,workerId);
    var new_log4js_serverCfg = JSON.parse(str_log4js_serverCfg);
    //创建log日志目录
    createDirUtils.createLogDir([new_log4js_serverCfg.appenders]);
    logger.configure(new_log4js_serverCfg);
};

/**
 * 服务器启动初始化
 */
exports.initServer = function(cb){
    checkRequire();
    async.series([
        function(cb1){
            lootConfigBiz.init(cb1);
        },
        function(cb1){
            g_guild.init(cb1);
        },
        function(cb1){
            g_guild.initBattleRecord(cb1);
        },
        function(cb1){
            robotUtils.checkRobot(cb1);
        },
        function(cb1){
            bossBiz.checkBossList(uwClient,cb1);
        },
        function(cb1){
            g_server.initServerDate(cb1);
        },  
        function(cb1){
            g_incognito.init(cb1);
        },  
        function(cb1){
            g_fakeData.init(cb1);
        } 
    ],function(err,data) {
        if (err) return cb(err);
        //定时器
        moCron.runJobs();//定时器
 
        cb();
    });
};
 

exports.stopServer = function(cb){
    g_cache.savePlayersToDB();

    // 超时停服完毕
    setTimeout(function(){
        cb && cb(null);   
    }, projectConfig.stopInterval * 1000);
}