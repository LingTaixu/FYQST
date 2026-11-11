
var pomelo = require('pomelo');
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var uwData = require("uw-data");
var c_msgCode = uwData.c_msgCode;
var consts  = uwData.consts;
module.exports = function() {
	return new Filter();
};

var Filter = function() {
};

/**
 * 过滤器
 */
Filter.prototype.before = function(msg, session, next){
    var accountId = session.get(consts.session.accountId);
    if(!accountId){
        return next(new Error('session.accountId 为空'), wrapResult(c_msgCode.noLogin));
    }
    next();
};