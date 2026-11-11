/**
 * Created by Administrator on 2015/3/10.
 */
var g_data = require("uw-global").g_data;
var ossObj = require("uw-log").ossObj;
var ossBiz = require("uw-log").ossBiz;

var exports = module.exports;

exports.run = function(bossId){
	// 在线人数
	var num = g_data.getOnlineNum();
 	var oObj = new ossObj.ossOnlineNum(num);
 	ossBiz.WriteOss(oObj);
};

exports.runOnce = function(){

};