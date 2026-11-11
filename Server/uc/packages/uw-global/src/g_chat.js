/**
 * Created by Administrator on 2015/9/18.
 */
var ds = require("uw-ds").ds;
var uwData = require("uw-data");
var c_prop = uwData.c_prop;
var c_game = uwData.c_game;
var c_chatSys = uwData.c_chatSys;


//聊天缓存
var chatListCache = [];
var uid = 0;
var lastSysMsgid = 0; //-1;
var intervalIds = [];

var gid = {};
var chatGuildCache = {}; //{guildId:[],guildId:[],...}

var isSending = false; //

/**
 * 增加系统消息
 * @param id
 * @param args
 */
exports.addSysData = function(id, args) {
    uid++;
    // console.error('addSysData--->',id,args);
    var chatData = new ds.ChatData();
    chatData.uniqueId = uid;
    chatData.type = c_prop.chatTypeKey.sys;
    chatData.sysArgs = [id].concat(args);
    // _pushChatData(new ds.ChatData(uid, c_prop.chatTypeKey.sys, [id].concat(args)));
    _pushChatData(chatData);
    _updateSend();
};

/**
 * 增加系统消息
 * @param id
 * @param args
 */
exports.addLotteryData = function(id, args) {
    uid++;
    var chatData = new ds.ChatData();
    chatData.uniqueId = uid;
    chatData.type = c_prop.chatTypeKey.lottery;
    chatData.sysArgs = [id].concat(args);
    // _pushChatData(new ds.ChatData(uid, c_prop.chatTypeKey.lottery, [id].concat(args)));
    _pushChatData(chatData);
    _updateSend();
};

/**
 * 增加公会探宝消息
 * @param id
 * @param args
 */
exports.addGuildLotteryData = function(id, args) {
    uid++;
    var chatData = new ds.ChatData();
    chatData.uniqueId = uid;
    chatData.type = c_prop.chatTypeKey.guildLottery;
    chatData.sysArgs = [id].concat(args);
    // _pushChatData(new ds.ChatData(uid, c_prop.chatTypeKey.guildLottery, [id].concat(args)));
    _pushChatData(chatData);
    _updateSend();
};

/**
 * 增加用户消息
 * @param userName
 * @param vip
 * @param content
 * @param isGM
 * @param guildName
 */
exports.addUserData = function(userName, vip, content, isGM, guildName, medalTitle, isLittleHorn, achieveLvl, rebirthLvl, nobleLevel, userId, iconId, isPublic) {
    uid++;
    var medal = 0;
    if (medalTitle && medalTitle != 0) medal = medalTitle;
    var returnArr = [userName, vip, content, isGM, guildName, medal, isLittleHorn, achieveLvl, rebirthLvl, nobleLevel, userId, iconId];
    var chatData = new ds.ChatData();
    chatData.uniqueId = uid;
    chatData.type = c_prop.chatTypeKey.user;
    chatData.userArgs = returnArr;
    chatData.isPublic = isPublic;
    // _pushChatData(new ds.ChatData(uid, c_prop.chatTypeKey.user, null, returnArr));
    _pushChatData(chatData);
    _updateSend();
};

// 增加跨服用户消息 
exports.addServersChatData = function(userName, vip, content, isGM, guildName, medalTitle, isLittleHorn, achieveLvl, rebirthLvl, nobleLevel, userId, iconId, isPublic) {
    uid++;
    var medal = 0;
    if (medalTitle && medalTitle != 0) medal = medalTitle;
    var returnArr = [userName, vip, content, isGM, guildName, medal, isLittleHorn, achieveLvl, rebirthLvl, nobleLevel, userId, iconId];
    //console.error('g_chat ---addServersChatData ',userName, vip, content, isGM, guildName, medal, isLittleHorn, achieveLvl, rebirthLvl, nobleLevel);
    var chatData = new ds.ChatData();
    chatData.uniqueId = uid;
    chatData.type = c_prop.chatTypeKey.servers;
    chatData.userArgs = returnArr;
    chatData.isPublic = isPublic;
    // _pushChatData(new ds.ChatData(uid, c_prop.chatTypeKey.servers, null, returnArr));
    _pushChatData(chatData);
    _updateSend();
};

/**
 * 增加公会消息
 * @param guildId
 * @param userName
 * @param vip
 * @param position
 * @param content
 */
exports.addGuildData = function(guildId, userName, vip, position, content, medalTitle, guildEnnoble, userId, iconId, isPublic, shareFightType, shareBossId) {
    if (!gid[guildId]) gid[guildId] = 0;
    gid[guildId] += 1;
    var medal = 0;
    if (medalTitle && medalTitle != 0) medal = medalTitle;
    var returnArr = [userName, vip, position, content, medal, guildEnnoble, userId, iconId, shareFightType, shareBossId];
    //console.error('g_chat --- addGuildData',userName, vip, position, content, medal, guildEnnoble);
    var chatData = new ds.ChatData();
    chatData.uniqueId = gid[guildId];
    chatData.type = c_prop.chatTypeKey.guild;
    chatData.guildArgs = returnArr;
    chatData.isPublic = isPublic;
    // _pushChatGuildData(guildId, new ds.ChatData(gid[guildId], c_prop.chatTypeKey.guild, null, null, null, returnArr));
    _pushChatGuildData(guildId, chatData);
};

/**
 * 获取列表
 * @returns [ds.ChatData]
 */
exports.getList = function() {
    return chatListCache;
};

/**
 * 获取公会列表
 * @returns [ds.ChatData]
 */
exports.getGuildList = function(guildId) {
    return chatGuildCache[guildId] || [];
};

/**
 * 获取当前的uid
 * @returns {number}
 */
exports.getCurUID = function() {
    return uid;
};

/**
 * 获取当前的gid
 * @returns {number}
 */
exports.getCurGID = function(guildId) {
    return gid[guildId] || 0;
};

/**
 * 获取当前系统消息id
 */
exports.getLastSysMsgId = function() {
    return lastSysMsgid;
};

exports.setLastSysMsgId = function(id) {
    lastSysMsgid = id;
};

exports.calIntervalData = function() {
    for (var i = 0; i < intervalIds.length; i++) {
        var locId = intervalIds[i];
        var locData = c_chatSys[locId];
        exports.addSysData(locId, locData.arg || []);
    }
};


var _pushChatData = function(chatData) {
    chatListCache.push(chatData);
    _limitCacheLength();
};

var _pushChatGuildData = function(guildId, chatData) {
    if (!chatGuildCache[guildId]) chatGuildCache[guildId] = [];
    chatGuildCache[guildId].push(chatData);
    _limitGuildCacheLength(guildId);
};


var _initIntervalIds = function() {
    for (var key in c_chatSys) {
        var locData = c_chatSys[key];

        if (locData.type == 1) {
            intervalIds.push(locData.id);
        }
    }
};

var _limitCacheLength = function() {
    if (chatListCache.length > 500) { //c_game.chatCfg[2]
        chatListCache.shift();
    }
};

var _limitGuildCacheLength = function(guildId) {
    if (chatGuildCache[guildId].length > c_game.chatCfg[2]) {
        chatGuildCache[guildId].shift();
    }
};


var _updateSend = function() {
    return; // 注释掉 by liuqiang
    if (isSending) return;
    isSending = true;
    setTimeout(_sendNewMsg, 500);
};

var _sendNewMsg = function() {
    isSending = false;
};

_initIntervalIds();