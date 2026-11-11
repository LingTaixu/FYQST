/**
 * Created by John on 2016/6/4.
 */
var uwData = require("uw-data");
var userDao = require("uw-user").userDao;
var userSurveyDao = require("../dao/userSurveyDao")
var async = require("async");
var getMsg = require("uw-utils").msgFunc(__filename);
var c_msgCode = uwData.c_msgCode;
var project = require('uw-config').project;
var UserSurveyEntity = require("uw-entity").UserSurveyEntity;
var mainClient = require("uw-db").mainClient;
var g_cache =require("uw-global").g_cache;
var activityDao = null;
var checkRequire = function () {
    activityDao = activityDao || require("uw-activity").activityDao;
}

var exports = module.exports = {};
/***
 * 上报用户调研数据
 *
 */
exports.report= function(client,activityId,userId,report, cb) {
    checkRequire();
};