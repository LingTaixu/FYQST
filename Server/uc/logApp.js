/**
 *
 */
var express = require('express');
var app = express();
//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
app.get('/log', function(req,res) {

    var logger = require('uw-log').getLogger("uw-sys-error", __filename);
    logger.error(JSON.stringify(req.query));
    logger.error("\n");

    res.end('');
});
app.listen(24002);
console.error("sever start at:" +24002);
// Uncaught exception handler
process.on('uncaughtException', function(err) {
    //输入语法报错到日志
    var logger = require('uw-log').getLogger("uw-sys-error", __filename);
    logger.error(' Caught exception: ' + err.stack);
    logger.error("\n");
});