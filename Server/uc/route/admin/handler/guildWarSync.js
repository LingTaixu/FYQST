/**
 * Created by Sara on 2015/5/28.
 */

var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var proto = module.exports;

/**
 * 添加服务器
 * @iface getSyncServer
 * @args {curServerData:"[serverGroupId,serverId,serverHost,serverPort]"}
 * @param args
 * @param session
 * @param next
 * @returns 0
 */
proto.a = function (args, session, next) {
    var data = {}; 
    next(null,wrapResult(null,data));
};
