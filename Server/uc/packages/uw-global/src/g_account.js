/**
 * Created by Administrator on 17-11-24.
 */
// var uwClient = require("uw-db").uwClient;
// var async = require('async');
//var logger = require('uw-log').getLogger("uw-logger", __filename);
var uwData = require("uw-data");
var c_prop = uwData.c_prop;
var exports = module.exports;
var loginClient = null;
var accountDao = null;
var rankDao = null;
var client = null;
var checkRequire = function(){
	loginClient = loginClient || require("uw-db").loginClient;
    client = client || require("uw-db").uwClient;
	accountDao = accountDao || require("uw-account").accountDao;
    rankDao = rankDao || require("uw-rank").rankDao;
}
//账号缓存
var __accountCache = {};
var __rankFirstCache = {};
// var AccountData = function(){
//     this.name = null;//账号 || openid
//     this.channelId = null;//渠道ID
// };
var __biCache = {};   // 存是否发送过bi的判断

//获得账号信息
exports.getAccount = function(accountId,cb){
    if (accountId == 0){
        return cb(null);
    }
	checkRequire();
    var data = __accountCache[accountId];
    if(data) return cb(null,data);

    //console.log("getAccount getAccount getAccount getAccount getAccount:", accountId);
    accountDao.selectCols(loginClient,"name,channelId,sdkChannelId",{id:accountId},function(err,accountData){
        if(err) return cb(err);
        __accountCache[accountId] = accountData;
        return cb(null,accountData);
    });
};

//获取排行榜第一
exports.getRankFirst = function(rankType,cb){
    checkRequire();
    var data = __rankFirstCache[rankType];
    if(data)return cb(null,data);
    // exports.setRankFirst(rankType,function(err,rankData){
    //     if(err) return cb(err);
    //     return cb(null,rankData);
    // });
}


//设置战力榜第一
exports.setRankFirst = function(rankType,cb){
    checkRequire();
    var rankCondition = "ORDER BY rankValue DESC,id ASC limit 1";
    //便于扩展
    switch(rankType){
        case c_prop.rankTypeKey.combatRank:
            rankCondition = "ORDER BY rankValue DESC,id ASC limit 1";
            break;
    }
    rankDao.list(client,"rankType = ? " + rankCondition,[rankType],function(err,rankData){
        if(err) return cb(err);
        __rankFirstCache[rankType] = rankData[0];
        cb(null,rankData[0]);
    });
}

// 设置已发送BI Install
exports.setBiInstall = function(accountId){
    __biCache[accountId] = 1; 
}

// 获得已发送BI Install
exports.getBiInstall = function(accountId){ 
    return  __biCache[accountId];
} 
