/**
 * Created by Sara on 2015/11/12.
 */
var robotUtils = require("uw-utils").robotUtils;

var async = require("async");
var exports = module.exports;

exports.refresh = function(cb){
    robotUtils.createRobot(cb);
};

exports.refresh(function(){});
