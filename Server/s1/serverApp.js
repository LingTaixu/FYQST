var cluster = require('cluster');
var reset = require('./reset.js');
reset.resetServer();
require('date-utils');
var appUtils = require("uw-utils").appUtils;
appUtils.before();
var sessionManager = require('uw-route').sessionManager;
var route = require('uw-route');
var loginFilter = require('uw-route').loginFilter;
var adminFilter = require('uw-route').adminFilter;
var requestWorkers = require('uw-route').requestWorkers;
var projectConfig = require('uw-config').project;
var g_common = require('uw-global').g_common;
g_common.appIsHttp = true;
var robotUtils = require('uw-utils').robotUtils;
var isStop = false; // 停服
var httpServer;

var _startApp = function() {
    //初始化session
    sessionManager.init({
        expireTime: 60 * 60, //过期时间（秒） ，设置1小时
        secret: "kshh1d23hsdas", //默认key值
        gcTime: 12 * 60 * 60 //回收时间，秒
    });
    var serverType =  projectConfig.isHttps;  // 用这个字段
    var app = reset.createApp(serverType,projectConfig.serverHttpPort);
    httpServer = app.locals.server;
  
    console.error("start server finish! listen", projectConfig.serverHttpPort);
    //自定义的路由器中间件
    app.use(route.route({ isSession: 1 }));
    //过滤登陆 中间件
    app.use(function(req, res, next) {
        if (isStop) return res.status(503).json({m:"Server is stopping"});
        next(null);
    });
    app.use(loginFilter({ routeList: ["a"] }));
    app.use(adminFilter({ routeList: ["admin"] }));
    //请求处理中间件
    app.get('/', route.request());
};

if (cluster.isMaster) {
    appUtils.initServer(function(err) {
        if (err) {
            console.error(err);
            console.error("服务器启动失败！");
            process.exit(1);
        }
        _startApp();
    });
}
// Uncaught exception handler
process.on('uncaughtException', function(err) {
    //输入语法报错到日志
    var logger = require('uw-log').getLogger("uw-sys-error", __filename);
    logger.error(' Caught exception: ' + err.stack);
    logger.error("\n");
});

//刷新策划数据
process.on('SIGUSR1', () => {
    console.error('Received SIGUSR1. Reload uw-data/temp config!');
    flushUwData();
});
process.on('SIGUSR2', () => {
    console.error('Received SIGUSR2. StopServer !!!');
    stopServer();
});
process.on('SIGTERM', stopServer);
process.on('SIGINT', () => {
    console.error('Received SIGINT. StopServer !!!');
    stopServer();
});

function flushUwData() {
    var ud = require('uw-data');
    ud.flush();
}

function stopServer() {
    if (isStop) return;
    isStop = true;
    if (httpServer) httpServer.close();
    console.error("STOP:", isStop);
    appUtils.stopServer(function(err, data) {
        console.error("programe EXIT!");
        process.exit();
    });
}
