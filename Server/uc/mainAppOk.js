var reset = require('./reset.js');
reset.resetMain();
require('date-utils');
var appUtils = require("uw-utils").appUtils;
appUtils.before();
var sessionManager = require('uw-route').sessionManager;
var route = require('uw-route');
var projectConfig = require('uw-config').project;
var fs = require('fs');
//初始化session
sessionManager.init({
    expireTime: 60, //过期时间（秒） ，设置1小时
    secret: "kshh1d23hsdas", //默认key值
    gcTime: 5 * 60 //回收时间，秒
});
//use  http and http2
var serverType = 3; // projectConfig.isHttps;  // 用这个字段
var app = reset.createApp(serverType,projectConfig.mainHttpPort);

console.error("sever start at:" + projectConfig.mainHttpPort);
//自定义的路由器中间件
app.use(route.route({ isSession: 1 }));
//请求处理中间件
app.get('/', route.request());

// Uncaught exception handler
process.on('uncaughtException', function(err) {
    //输入语法报错到日志
    var logger = require('uw-log').getLogger("uw-sys-error", __filename);
    logger.error(' Caught exception: ' + err.stack);
    logger.error("\n");
});
