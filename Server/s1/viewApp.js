/**
 * Created by Administrator on 2015/5/23.
 */
require('./reset.js').resetView();
var viewHttp = require("uw-view-http");
viewHttp.run();

// Uncaught exception handler
process.on('uncaughtException', function (err) {
    console.error("222222222222222");
    //输入语法报错到日志
    var logger = require('uw-log').getLogger("uw-sys-error", __filename);
    logger.error(' Caught exception: ' + err.stack);
    logger.error("\n");
});