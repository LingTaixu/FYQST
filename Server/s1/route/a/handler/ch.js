/**
 * Created by Sara on 2015/5/28.
 */

var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var commonUtils = require('uw-utils').commonUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var c_game = uwData.c_game;
var c_msgCode = uwData.c_msgCode;
var chatBiz = require("uw-chat").chatBiz;
var uwClient = require("uw-db").uwClient;
var ds = require("uw-ds").ds;
var c_prop = uwData.c_prop;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var taskBiz = require("uw-task").taskBiz;
var getMsg = require("uw-utils").msgFunc(__filename);
var accountDao = require("uw-account").accountDao;
var mainClient = require("uw-db").mainClient;
var loginClient = require("uw-db").loginClient;

var id = 0;
var gmPsaawords = { "/踢人": true, "/禁言": true, "/封号": true };

var proto = module.exports;

/**
 * 获取最新的聊天记录
 * @iface getNewList
 * @args {lastId:"最后一条的唯一id",guildId:"公会id",guildLastId:"最后一条公会的唯一id"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ChatData
 */
proto.a = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_chat_getNewList_args;
    var lastId = args[argsKeys.lastId];
    var guildId = args[argsKeys.guildId];
    var guildLastId = args[argsKeys.guildLastId];
    var data = chatBiz.getNewList(uwClient, userId, lastId, guildId, guildLastId);
    var allChatData = new ds.AllChatData();
    allChatData.worldChat = data[0];
    allChatData.guildChat = data[1];
    allChatData.isOri = data[2];
    allChatData.guildId = data[3];
    next(null, wrapResult(null, allChatData, dsNameConsts.AllChatData));
};

/**
 * 获取最新的系统消息记录
 * @iface getNewSysMsgList
 * @args {lastId:"最后一条的唯一id"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ChatData
 */
proto.hda = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_chat_getNewSysMsgList_args;
    var lastId = args[argsKeys.lastId];
    chatBiz.getNewSysMsgList(mainClient, lastId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.ChatData));
    });
};

/**
 * 发送聊天
 * @iface sendData
 * @args {content:"聊天内容",lastId:"最后一条的唯一id",type:"聊天类型",guildId:"公会id",guildLastId:"公会最后一条的唯一id",isLittleHorn:"true",shareFightType:"",shareBossId:""}
 * @param args
 * @param session
 * @param next
 * @returns ds.ChatData
 */
proto.b = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    var accountId = session.get(consts.session.accountId);
    var isGM = session.get(consts.session.isGM);
    var argsKeys = iface.a_chat_sendData_args;
    var content = args[argsKeys.content];
    var lastId = args[argsKeys.lastId];
    var type = args[argsKeys.type];
    var guildId = args[argsKeys.guildId];
    var guildLastId = args[argsKeys.guildLastId];
    var isLittleHorn = args[argsKeys.isLittleHorn];
    var shareFightType = args[argsKeys.shareFightType];
    var shareBossId = args[argsKeys.shareBossId];

    if (!shareBossId) {
        if (!content) return next(null, wrapResult(getMsg(c_msgCode.noWord)));
        //限制长度
        var contentLength = commonUtils.getStringLength(content);
        if (contentLength > c_game.chatCfg[3]) return next(null, wrapResult(getMsg(c_msgCode.wordTooLong))); //"长度超出啦！"
        //过滤敏感字符
        if (commonUtils.checkFuckWord(content)) return next(null, wrapResult(getMsg(c_msgCode.wordIllegal)));

        var cc = content.replace(/\s+/g, " ").split(" ");
        if (isGM && cc.length >= 2 && gmPsaawords[cc[0]]) {
            chatBiz.gmPassWord(uwClient, userId, cc, function(err, data) {
                if (err) return next(null, wrapResult(err));
                var dataList = chatBiz.getNewList(uwClient, userId, lastId);
                next(null, wrapResult(null, dataList, dsNameConsts.ChatData));
            });
            return;
        }
    } else {
        content = null;
    }

    //检查是否禁言
    accountDao.selectCols(loginClient, "name,bendExpireAt, bendType", { id: accountId }, function(err, accountData) {
        if (err) return next(null, wrapResult(err));
        var expireAt = Date.parse(accountData.bendExpireAt);
        if (expireAt && expireAt > Date.now() && (accountData.bendType & 1)) {
            return next(null, wrapResult(getMsg(c_msgCode.wordBeBend)));
        }
        var ispublic = accountData.bendType == 3 ? 0 : 1; //1-公开，0-仅自己可见

        chatBiz.addChatData(uwClient, userId, content, isGM, type, guildId, isLittleHorn, accountData.name, ispublic, shareFightType, shareBossId, function(err, data) {
            if (err) return next(null, wrapResult(err));
            var dataArr = chatBiz.getNewList(uwClient, userId, lastId, guildId, guildLastId);
            var allChatData = new ds.AllChatData();
            allChatData.worldChat = dataArr[0];
            allChatData.guildChat = dataArr[1];
            allChatData.isOri = data[0];
            allChatData.guildId = data[1];
            allChatData.userData = data[2];
            allChatData.delBagItems = data[3];
            var costDiamond = data[4];

            var taskOpt = {};
            next(null, wrapResult(null, allChatData, dsNameConsts.AllChatData));
            taskOpt[c_prop.cTaskTypeKey.chat] = 1;
            taskBiz.setTaskValues(uwClient, userId, taskOpt, function() {});
        });

    });
};