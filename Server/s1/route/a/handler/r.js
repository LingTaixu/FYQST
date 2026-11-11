/**
 * Created by Sara on 2015/8/10.
 */
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var c_prop = uwData.c_prop;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var rankBiz = require("uw-rank").rankBiz;
var ds = require("uw-ds").ds;
var uwClient = require("uw-db").uwClient;

var proto = module.exports;

/**
 * 获取排行榜
 * @iface getRankList
 * @args {rankType:"排行类型"}
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 * @returns ds.UserRankEntity
 */
proto.a = function (args, session, next) {
    var argsKeys = iface.a_rank_getRankList_args;
    var rankType = args[argsKeys.rankType];
    //接口调用
    rankBiz.getRankList(uwClient, rankType, function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.UserRankEntity));
    });
};

/**
 * 获取个人排行榜
 * @iface getUserRank
 * @args {rankType:"排行类型"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserRankData
 */
proto.b = function (args, session, next) {
    var argsKeys = iface.a_rank_getUserRank_args;
    var userId = session.get(consts.session.userId);
    var rankType = args[argsKeys.rankType];
    //接口调用
    rankBiz.getUserRank(uwClient, userId, rankType, function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.ExUserRankData));
    });
};

/**
 * 获取排行榜数据
 * @iface allRankArr
 * @args {rankType:"排行类型"}
 * @param args
 * @param session
 * @param next
 * @returns 【个人排名，个人排行数据，所有排行数据】
 */
proto.c = function (args, session, next) {
    var argsKeys = iface.a_rank_allRankArr_args;
    var userId = session.get(consts.session.userId);
    var rankType = args[argsKeys.rankType];
    //接口调用
    rankBiz.allRankArr(uwClient, userId, rankType, function(err,data){
        if(err) return next(null,wrapResult(err));
        var exData = new ds.ExUserRankData();
        exData.userRank = data[0];
        exData.userRankData = data[1];
        exData.userRankList = data[2];
        exData.guildName = data[3];
        next(null,wrapResult(null,exData,dsNameConsts.ExUserRankData));
    });
};

/**
 * 获取公会相关排行榜数据
 * @iface getGuildRank
 * @args {rankType:"排行类型"}
 * @param args
 * @param session
 * @param next
 * @returns 【所有排行数据,公会名称{}】
 */
proto.d = function (args, session, next) {
    var argsKeys = iface.a_rank_getGuildRank_args;
    var rankType = args[argsKeys.rankType];
    //接口调用
    rankBiz.getGuildRank(uwClient, rankType, function(err,data){
        if(err) return next(null,wrapResult(err));
        var exData = new ds.ExUserRankData();
        exData.userRankList = data[0];
        exData.guildName = data[1];
        next(null,wrapResult(null,exData,dsNameConsts.ExUserRankData));
    });
};