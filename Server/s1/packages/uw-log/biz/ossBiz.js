/**
 * OSS 运营支持系统
 */   
var project = require("uw-config").project;
var querystring = require("querystring");
var WSClient = null;  
var exports = module.exports;

exports.WriteOss = function(obj){
    WSClient = WSClient || require("uw-ws").WSClient;
    var serverId = project.serverId || 1;
    obj.serverId = parseInt(serverId);
    if(WSClient)
        WSClient.send(JSON.stringify(obj));
    return;
};