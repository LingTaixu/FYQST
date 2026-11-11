 
var commonUtils = require("uw-utils").commonUtils;
var clickAccountDao = require("./../dao/clickAccountDao.js"); 
var loginClient = require("uw-db").loginClient;

var exports = module.exports;

exports.addClickAwyAccount = function(channelId, openId, sdkData, url, cb) {
    var now = new Date().toFormat("YYYY-MM-DD HH24:MI:SS");
    var sessionData = {
        channelId :channelId,
        openId : openId,
        sdkData: sdkData || '',
        url : url || '',
        createTime: now,
    };
    clickAccountDao.insert(loginClient, sessionData, function(err, data) {
            if(err) return cb(err);
            cb(null);
    });
};

exports.addClickAccount = function(channelId, openId, sdkData, url, cb) {
  
    //先检查当前用户是否存在, 如果存在则更新，不存在就创建新数据
    clickAccountDao.select(loginClient, 'channelId = ? and openId = ? ', [channelId, openId], function(err, sessionData) {
        console.log(err);
        if (err) return cb(err);
        console.log(sessionData);
        if (!sessionData) {
            var now = new Date().toFormat("YYYY-MM-DD HH24:MI:SS");
            sessionData = {
                channelId :channelId,
                openId : openId,
                sdkData: sdkData,
                url : url,
                createTime: now,
            }
 
            clickAccountDao.insert(loginClient, sessionData, function(err, data) {
                if(err) return cb(err);
                cb(null);
             });
        } else {
            cb(null);
        }
    })
};


exports.addClickAccount2 = function(channelId, openId, sdkData, url, tm, cb) {
  
    //先检查当前用户是否存在, 如果存在则更新，不存在就创建新数据
    clickAccountDao.select(loginClient, 'channelId = ? and openId = ? ', [channelId, openId], function(err, sessionData) {
        console.log(err);
        if (err) return cb(err);
        console.log(sessionData);
        if (!sessionData) {
            var now =  tm; //new Date().toFormat("YYYY-MM-DD HH24:MI:SS");
            sessionData = {
                channelId :channelId,
                openId : openId,
                sdkData: sdkData,
                url : url,
                createTime: now,
            }
 
            clickAccountDao.insert(loginClient, sessionData, function(err, data) {
                if(err) return cb(err);
                cb(null);
             });
        } else {
            cb(null);
        }
    })
};

exports.updateClickAccountTime = function(channelId, openId, tm, cb) {
  
    var updateData = {
            createTime:tm
        }; 

    clickAccountDao.update(loginClient,updateData,{channelId :channelId, openId: openId},cb);
};
