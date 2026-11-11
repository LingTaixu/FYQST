/**
 * Created by liuqiang on 2018/1/24.
 */

// 提供 GMTool 工具 接口

var g_cache = require("uw-global").g_cache;
var g_guild = require('uw-global').g_guild;
var uwData = require("uw-data");
var c_prop = uwData.c_prop;
var proto = module.exports;
var uwClient = require("uw-db").uwClient;
var guildBiz = require("uw-guild").guildBiz;

/**
 * 修改玩家数据
 * @iface gmCommand
 * @args {data:"接口内容"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.a = function(args, session, next) {
    console.error("gm.js modifyUser", args);
    var userId = args['userId'];
    // 找到玩家
    var gamePlayer = g_cache.getGamePlayerInCache(userId);
    if (!gamePlayer) {
        return next(null, null);
    }
    var userData = gamePlayer.userData;
    if (args.diamond != null) userData.diamond = parseInt(args.diamond);
    if (args.gold != null) userData.gold = parseInt(args.gold);
    if (args.lvl != null) userData.lvl = parseInt(args.lvl);
    if (args.rebirthLvl != null) userData.rebirthLvl = parseInt(args.rebirthLvl);
    if (args.rebirthExp != null) userData.rebirthExp = parseInt(args.rebirthExp);
    if (args.achieveLvl != null) userData.achieveLvl = parseInt(args.achieveLvl);
    if (args.achieveExp != null) userData.achieveExp = parseInt(args.achieveExp);
    if (args.cybLvl != null) userData.cybLvl = parseInt(args.cybLvl);
    if (args.cybExp != null) userData.cybExp = parseInt(args.cybExp);
    if (args.jxLvl != null) userData.jxLvl = parseInt(args.jxLvl);
    if (args.jxExp != null) userData.jxExp = parseInt(args.jxExp);
    if (args.highPaTa != null) userData.highPaTa = parseInt(args.highPaTa);
    if (args.fatigue != null) {
        if (userData.exData[c_prop.userExDataKey.syData]) {
            userData.exData[c_prop.userExDataKey.syData][0] = parseInt(args.fatigue);
        } else {
            userData.exData[c_prop.userExDataKey.syData] = [parseInt(args.fatigue), new Date()];
        }
    }
    gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
    next(null, null);
};

/**
 * 修改公会会长
 * @iface setGuildChairman
 * @args {data:"接口内容"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.a1 = function(args, session, next) {
    console.error("gm.js modifyGuild Chairman", args);
    var userId = args['userId'];
    var guildId = args['guildId'];
    guildBiz.gmt_setChairman(uwClient, userId, guildId, function(err, data) {
        if (err) return next(err);
        return next(null, data);
    });
};


/**
 * 重载当前最新公会战战斗数据
 * @iface reloadGB
 * @args  
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.b = function(args, session, next) {
    console.error("gm.js reloadGB", args);
    g_guild.initBattleRecord(function() {});
    next(null, null);
};

/**
 * 重载当前最新公会战战斗数据
 * @iface sendAwardGB
 * @args  
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.c = function(args, session, next) {
    console.error("gm.js sendAwardGB", args);
    guildBiz.noticeGuildBattleResult(uwClient, function(err, data) {
        if (err) return next(null);
        return next(null, data);
    });
};