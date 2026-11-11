/**
 * Created by Administrator on 2014/6/7.
 */
var exports = module.exports;
var uwClient = require("uw-db").uwClient;
var logger = require("uw-log").getLogger("uw-logger",__filename);
var async = require("async");
var rankBiz = require("uw-rank").rankBiz; 
var g_hybridData = require("uw-global").g_hybridData;
exports.run = function(cfg){
 	g_hybridData.loadRankFirst(function(){});
}; 

exports.runOnce = function(){
    exports.run();
};
