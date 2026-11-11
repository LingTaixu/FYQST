/**
 * Created by John on 2016/4/7.
 */
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var uwClient = require("uw-db").uwClient;
var ds = require("uw-ds").ds;
var c_prop = uwData.c_prop;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var g_coffers = require("uw-global").g_coffers;
var chatBiz = require("uw-chat").chatBiz;
var project = require("uw-config").project;
var g_chat = require("uw-global").g_chat;
var proto = module.exports;

/**
 * ·¢ËÍ¿ç·þÏûÏ¢£¨Ð¡À®°È£©
 * @iface serversChat
 * @args {nickName:"",vip:"",content:"",isGM:"",guildName:"",medalTitle:"",isLittleHorn:"",achieveLvl:"",rebirthLvl:"",nobleLevel:"",userId:"",iconId:"",isPublic:"",type:"",sysMsgArgs:"",sysMsgId:""}
 * @param args
 * @param session
 * @param next
 * @returns [nickName]
 */
proto.a = function(args, session, next) {
    var argsKeys = iface.admin_chat_serversChat_args;
    var nickName = args[argsKeys.nickName];
    var vip = args[argsKeys.vip];
    var content = args[argsKeys.content];
    var isGM = args[argsKeys.isGM];
    var guildName = args[argsKeys.guildName];
    var medalTitle = args[argsKeys.medalTitle];
    var isLittleHorn = args[argsKeys.isLittleHorn];

    var achieveLvl = args[argsKeys.achieveLvl];
    var rebirthLvl = args[argsKeys.rebirthLvl];
    var nobleLevel = args[argsKeys.nobleLevel];
    var userId = args[argsKeys.userId];
    var iconId = args[argsKeys.iconId];
    var isPublic = args[argsKeys.isPublic];
    //type 在跨服频道显示系统消息 sysMsgArgs 系统消息通知参数
    var type = args[argsKeys.type];
    var sysMsgArgs = args[argsKeys.sysMsgArgs];
    var sysMsgId = args[argsKeys.sysMsgId];
    if (type && type == c_prop.chatTypeKey.sys) {
        g_chat.addSysData(sysMsgId, sysMsgArgs);
    } else {
        chatBiz.addServersChat(nickName, vip, content, isGM, guildName, medalTitle, isLittleHorn, achieveLvl, rebirthLvl, nobleLevel, userId,iconId, isPublic);
    }
    
    next(null, wrapResult(null, project.serverId));
};

/**
 * @iface GMCommand
 * @args {content:""}
 * @param args
 * @param session
 * @param next
 * @returns []
 */
proto.b = function(args, session, next) {
    var argsKeys = iface.admin_chat_GMCommand_args;
    var content = args[argsKeys.content];
    console.log("content...", content);
    var cc = content.replace(/\s+/g, " ").split(" ");
    chatBiz.gmPassWord(uwClient, 0, cc, function(err, data) {});
    // chatBiz.addServersChat(nickName, vip, content, isGM, guildName, medalTitle, isLittleHorn);
    next(null, wrapResult(null, project.serverId));
};

/**
 * @iface Scripts
 * @args {content:""}
 * @param args
 * @param session
 * @param next
 * @returns [nickName]
 */
proto.c = function(args, session, next) {
    var argsKeys = iface.admin_chat_Scripts_args;
    var content = args[argsKeys.content];
    console.log("content...", content);
    var cc = content.replace(/\s+/g, " ").split(" ");

    // open process to handle scripts

    // chatBiz.addServersChat(nickName, vip, content, isGM, guildName, medalTitle, isLittleHorn);
    next(null, wrapResult(null, project.serverId));
};