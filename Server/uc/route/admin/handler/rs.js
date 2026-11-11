/**
 * Created by wupeng on 2018/09/17.
 */
var proto = module.exports;
var logger = require("uw-log").getLogger("uw-logger", __filename);
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var ds = require("uw-ds").ds;

var uwData = require("uw-data");
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;

var userBiz = require("uw-user").userBiz;
var uwClient = uwClient || require("uw-db").uwClient;
 
/**
 * 无限迷宫 发送排名奖励 rankServer调
 * @iface sendMazeRankReward
 * @args  {rankList:"rankList"}
 * @param args
 * @param session
 * @param next
 */
proto.a = function(args, session, next) {
    var argsKeys = iface.admin_rs_sendMazeRankReward_args;
    // console.error("typeof args ==>",typeof args);
    console.error("admin_rs_a args ======>",args);
    // var rankList = args[argsKeys.rankList];
    // var rankList = JSON.parse(args);
    // console.error("typeof rankList ==>",typeof rankList);
    // console.error("rankList ==>",rankList);

    var rankList = args;
    userBiz.sendMazeRankReward(uwClient, rankList, function(err, data) {
        if(err) return console.error('sendMazeRankReward error:',err);
    })
    next(null,wrapResult(null,null));
};