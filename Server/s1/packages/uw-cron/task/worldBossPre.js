/**
 * Created by Administrator on 2015/3/10.
 */
var bossBiz = require("uw-boss").bossBiz;
var uwData= require("uw-data");
var c_prop = uwData.c_prop;
var uwClient = require("uw-db").uwClient;
var g_boss = require("uw-global").g_boss;
var g_server = require("uw-global").g_server;
var logger = require("uw-log").getLogger("uw-logger",__filename);

var exports = module.exports;

exports.run = function(bossId,minutes){

	if(g_server.betweenOpenDateDays() > 0) {
    	bossBiz.preWorldMsg(bossId,minutes);
    }

};


exports.runOnce = function(){

};