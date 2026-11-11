/**
 * Created by Administrator on 2015/5/23.
 */
require('./reset.js').resetGuildWar();
require('date-utils');
var appUtils =require("uw-utils").appUtils;
appUtils.before();
var express = require('express');
var sessionManager = require('uw-route').sessionManager;
var route = require('uw-route');

var projectConfig = require('uw-config').project;

var _startApp = function(){

    /*

     //初始化session
     sessionManager.init({
     expireTime:  60 * 60, //过期时间（秒） ，设置1小时
     secret: "kshh1d23hsdas",//默认key值
     gcTime: 12 * 60 * 60//回收时间，秒
     });
     */

    var app = express();

//设置跨域访问
    app.all('*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
        res.header("Content-Type", "application/json;charset=utf-8");
        next();
    });

//自定义的路由器中间件
    app.use(route.route());
//请求处理中间件
    app.get('/', route.request());


    app.listen(projectConfig.guildWarHttpPort);
    console.error("http://127.0.0.1:"+projectConfig.guildWarHttpPort);

};

appUtils.initGuildWar(function(err){
    if(err){
        console.error(err);
        console.error("服务器启动失败！");
        return;
    }
    _startApp();
});

// Uncaught exception handler
process.on('uncaughtException', function (err) {
    //输入语法报错到日志
    var logger = require('uw-log').getLogger("uw-sys-error", __filename);
    logger.error(' Caught exception: ' + err.stack);
    logger.error("\n");
});
