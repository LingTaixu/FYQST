/**
 * Created by Administrator on 2015/5/23.
 */
require('./reset.js').resetMonitor();
var monitorHttp = require("uw-monitor-http");
monitorHttp.run();

// Uncaught exception handler
process.on('uncaughtException', function (err) {
    //输入语法报错到日志
    var logger = require('uw-log').getLogger("uw-sys-error", __filename);
    logger.error(' Caught exception: ' + err.stack);
    logger.error("\n");
});