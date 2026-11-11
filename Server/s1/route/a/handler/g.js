/**
 * Created by Sara on 2015/12/3.
 */
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var c_prop = uwData.c_prop;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var guildBiz = require("uw-guild").guildBiz;
var ds = require("uw-ds").ds;
var uwClient = require("uw-db").uwClient;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var taskBiz = require("uw-task").taskBiz;
var userBiz = require("uw-user").userBiz;
var chatBiz = require("uw-chat").chatBiz;

var proto = module.exports;

/**
 * 获取公会数据
 * @iface getInfo
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.a = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    guildBiz.getInfo(uwClient,userId,function(err,data){
        if(err) return next(null,wrapResult(err));
        var exData = new ds.ExGuildData();
        exData.isGuild = data[0];
        exData.guildPersonalData = data[1];
        exData.guildData = data[2]; 
        exData.isOpenBoss = 0;
        if(data[3]) exData.chairmanName = data[3];
        if(data[4]) exData.rank = data[4];
        if(data[5]) exData.isOpenBoss = data[5];
        // exData.isOpenGuildWar = data[6];
        // exData.cfgData = data[7];
        next(null,wrapResult(null,exData,dsNameConsts.ExGuildData));
    });
};

/**
 * 创建公会
 * @iface establishGuild
 * @args {name:"公会名称"}
 * @param args
 * @param session
 * @param next
 */
proto.b = function (args, session, next) {
    var argsKeys = iface.a_guild_establishGuild_args;
    var userId = session.get(consts.session.userId); 
    var name = args[argsKeys.name];
    //接口调用
    guildBiz.establishGuild(uwClient,userId,name,function(err,data){
        if (err) return next(null,wrapResult(err));
        var costDiamond = data[2];
        var taskOpt = {};
        // if(costDiamond>0){
        //     // gameRecordSerial.add(userId,function(cb1){
        //     //     gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.establishGuild,costDiamond, cb1);
        //     // });

        //     taskOpt[c_prop.cTaskTypeKey.consumeSum1] = costDiamond;
        //     taskOpt[c_prop.cTaskTypeKey.consumeSum2] = costDiamond;
        // }
        taskOpt[c_prop.cTaskTypeKey.guild] = 1;
        taskBiz.setTaskValues(uwClient,userId,taskOpt,function() {});  
        var exData = new ds.ExGuildData();
        exData.guildData = data[0]; 
        exData.userData = data[1];
        exData.guildPersonalData = data[3];
        next(null,wrapResult(null,exData,dsNameConsts.ExGuildData));
    });
};

/**
 * 搜索公会
 * @iface seekGuild
 * @args {guildId:"公会id"}
 * @param args
 * @param session
 * @param next
 */
proto.c = function (args, session, next) {
    var argsKeys = iface.a_guild_seekGuild_args;
    var guildId = args[argsKeys.guildId];
    //接口调用
    guildBiz.seekGuild(uwClient,guildId,function(err,data){
        if (err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.GuildEntity));
    });
};

/**
 * 申请加入公会
 * @iface joinGuild
 * @args {guildId:"公会id"}
 * @param args
 * @param session
 * @param next
 */
proto.d = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_guild_joinGuild_args;
    var guildId = args[argsKeys.guildId];
    //接口调用
    guildBiz.joinGuild(uwClient,userId,guildId,function(err,data){
        if (err) return next(null,wrapResult(err));
        var exData = new ds.ExGuildData();
        exData.isJoin = data[0];
        exData.guildData = data[1];
        exData.guildPersonalData = data[2];
        next(null,wrapResult(null,exData,dsNameConsts.ExGuildData));
    });
};

/**
 * 获取申请列表
 * @iface getAppliedMembers
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.e = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    guildBiz.getAppliedMembers(uwClient,userId,function(err,data){
        if (err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.UserEntity));
    });
};

/**
 * 申请列表管理
 * @iface appliedMembersSet
 * @args {tUserId:"要设置用户id",isConsent:"是否同意"}
 * @param args
 * @param session
 * @param next
 */
proto.f = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_guild_appliedMembersSet_args;
    var tUserId = args[argsKeys.tUserId];
    var isConsent = args[argsKeys.isConsent];
    //接口调用
    guildBiz.appliedMembersSet(uwClient,userId,tUserId,isConsent,function(err,data){
        if (err) return next(null,wrapResult(err));

        // 成员加入成功
        if (data[4]){
            taskBiz.setTaskValue(uwClient,tUserId,c_prop.cTaskTypeKey.guild,1,function() {});
            //加入公会（紧急委托任务）
            taskBiz.setEntrustTaskValue(uwClient, tUserId, c_prop.entrustTaskTypeKey.hasGuild, 1, function() {});
            //在公会频道显示玩家加入公会系统消息
            userBiz.getUserInfo(uwClient,tUserId,function(err,data) {
                if (err) return next(null,wrapResult(err));
                //console.error("========nickName=========",data.nickName);
                chatBiz.addSysData(187, [data.nickName]);
            });
        }

        var exData = new ds.ExGuildData();
        exData.guildData = data[0];
        exData.guildPersonalData = data[1];
        exData.isAtherGuild = data[2];
        exData.isMembersMax = data[3];
        next(null,wrapResult(null,exData,dsNameConsts.ExGuildData));
    });
};

/**
 * 工会设置
 * @iface guildSetting
 * @args {joinCon:"加入条件",joinLvl:"加入最低等级"}
 * @param args
 * @param session
 * @param next
 */
proto.g = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_guild_guildSetting_args;
    var joinCon = args[argsKeys.joinCon];
    var joinLvl = args[argsKeys.joinLvl];
    //接口调用
    guildBiz.guildSetting(uwClient,userId,joinCon,joinLvl,function(err,data){
        if (err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.GuildEntity));
    });
};

/**
 * 退会
 * @iface exitGuild
 * @args
 * @param args
 * @param session
 * @param next
 */
proto.h = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    guildBiz.exitGuild(uwClient,userId,function(err,data){
        if (err) return next(null,wrapResult(err));
        var exData = new ds.ExGuildData();
        exData.guildData = data[0];
        exData.guildPersonalData = data[1];
        exData.dissolveId = data[2];
        next(null,wrapResult(null,exData,dsNameConsts.ExGuildData));
        taskBiz.setTaskValue(uwClient,userId,c_prop.cTaskTypeKey.guild,0,function(){});
    });
};

/**
 * 修改公告
 * @iface setNotice
 * @args {notice:"公告"}
 * @param args
 * @param session
 * @param next
 */
proto.i = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_guild_setNotice_args;
    var notice = args[argsKeys.notice];
    //接口调用
    guildBiz.setNotice(uwClient,userId,notice,function(err,data){
        if (err) return next(null,wrapResult(err));
        var exData = new ds.ExGuildData();
        exData.guildData = data[0];
        exData.guildPersonalData = data[1];
        next(null,wrapResult(null,exData,dsNameConsts.ExGuildData));
    });
};

/**
 * 抽奖
 * @iface lottery
 * @args {count:"次数"}
 * @param args
 * @param session
 * @param next
 */
proto.j = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_guild_lottery_args;
    var count = args[argsKeys.count];
    count = parseInt(count);
    if (count != 1 && count != 10 && count != 100) return next(null, wrapResult("异常!"));

    //接口调用
    guildBiz.lottery(uwClient,userId,count,function(err,data){
        if (err) return next(null,wrapResult(err));
        taskBiz.setTaskValue(uwClient,userId,c_prop.cTaskTypeKey.guildLottery,1,function(){});
        var exData = new ds.ExGuildData();
        exData.userData = data[0];
        exData.guildPersonalData = data[1];
        exData.items = data[2];
        exData.bagItems = data[3];
        exData.equipBagItems = data[4];
        exData.delBagItems = data[5];
        next(null,wrapResult(null,exData,dsNameConsts.ExGuildData));
    });
};

/**
 * 爵位
 * @iface setEnnoble
 * @args {targetUserId:"成员id",ennobleType:"爵位类型"}
 * @param args
 * @param session
 * @param next
 */
proto.k = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_guild_setEnnoble_args;
    var targetUserId = args[argsKeys.targetUserId];
    var ennobleType = args[argsKeys.ennobleType];
    //接口调用
    guildBiz.setEnnoble(uwClient,userId,targetUserId,ennobleType,function(err,data){
        if (err) return next(null,wrapResult(err));
        var exData = new ds.ExGuildData();
        exData.guildData = data[0];
        if(userId==targetUserId) exData.guildPersonalData = data[1];
        next(null,wrapResult(null,exData,dsNameConsts.ExGuildData));
    });
};

/**
 * 公会礼盒列表
 * @iface getGitfBoxList
 * @args 
 * @param args
 * @param session
 * @param next
 */
proto.l = function (args, session, next) {
    var userId = session.get(consts.session.userId); 
    //接口调用
    guildBiz.getGitfBoxList(uwClient,userId,function(err,giftBoxList){
        if (err) return next(null,wrapResult(err));
        next(null,wrapResult(null,giftBoxList,dsNameConsts.GuildGiftBoxEntity));
    });
};

/**
 * 领取公会礼盒
 * @iface getGitfBox
 * @args {id:"礼盒id"}
 * @param args
 * @param session
 * @param next
 */
proto.m = function (args, session, next) {
    var userId = session.get(consts.session.userId); 
    var argsKeys = iface.a_guild_getGitfBox_args;
    var id = args[argsKeys.id];
    //接口调用
    guildBiz.getGitfBox(uwClient,userId, id, function(err,data){
        if (err) return next(null,wrapResult(err));

        // var getDiamond = data[5];
        // if(getDiamond>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setDiamondRecord(uwClient,userId,c_prop.diamondGetTypeKey.guildGiftBox,getDiamond, cb1);
        //     });
        // }

        var exData = new ds.ExGuildData();
        exData.userData = data[0];
        exData.guildPersonalData = data[2];
        exData.bagItems = data[3];
        exData.delBagItems = data[4];
        next(null,wrapResult(null,exData,dsNameConsts.ExGuildData));
    });
};

/**
 * 请求公会仓库
 * @iface getWareHouse
 * @args 
 * @param args
 * @param session
 * @param next
 */
proto.n = function (args, session, next) {
    var userId = session.get(consts.session.userId);  
    //接口调用
    guildBiz.getWareHouse(uwClient,userId, function(err,data){
        if (err) return next(null,wrapResult(err));

        var exData = new ds.ExGuildData();
        exData.guildData = data; 
        next(null,wrapResult(null,exData,dsNameConsts.ExGuildData));
    });
};

/**
 * 请求分配仓库物品
 * @iface dealWareHouse
 * @args {idx:"物品下标",targetUserId:"目标玩家ID",targetUserName:"目标玩家名"}
 * @param args
 * @param session
 * @param next
 */
proto.o = function (args, session, next) {
    var userId = session.get(consts.session.userId); 
    var argsKeys = iface.a_guild_dealWareHouse_args; 
    var idx = args[argsKeys.idx];
    var targetUserId = args[argsKeys.targetUserId];
    var targetUserName = args[argsKeys.targetUserName];

    //接口调用
    guildBiz.dealWareHouse(uwClient,userId, idx,targetUserId,targetUserName, function(err,data){
        if (err) return next(null,wrapResult(err));
        var exData = new ds.ExGuildData();
        exData.guildData = data; 
        next(null,wrapResult(null,exData,dsNameConsts.ExGuildData));
    });
};


/**
 * 行会战上届排行
 * @iface getScoreRankListByType
 * @args {type:"排行类型"}
 * @param args
 * @param session
 * @param next
 */
proto.p = function (args, session, next) {
    var userId = session.get(consts.session.userId); 
    var argsKeys = iface.a_guild_getScoreRankListByType_args; 
    var type = args[argsKeys.type];
    //接口调用
    guildBiz.getScoreRankListByType(uwClient,type, function(err,data){
        if (err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.GuildBattleRecordEntity)); 
    });
};


/**
 * 行会战每日探索抽奖
 * @iface explore
 * @args {index:"索引号"}
 * @param args
 * @param session
 * @param next
 * @returns [ds.ExUserData]
 */
proto.q = function(args, session, next){
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_guild_explore_args;
    var index = args[argsKeys.index];
    guildBiz.explore(uwClient, userId, index ,function(err,data){
        if(err) return next(null,wrapResult(err,null));

        var exData = new ds.ExUserData();
        exData.userData = data[0]; 
        exData.bagItems = data[1];
        exData.equipBagItems = data[2];
        // exData.delBagItems = data[3]; 
        next(null, wrapResult(null, exData, dsNameConsts.ExUserData));
    });
};

/**
 * 行会战每日探索生成奖库
 * @iface refreshExplore
 * @args
 * @param args
 * @param session
 * @param next
 * @returns [ds.ExUserData]
 */
proto.r = function(args, session, next){
    var userId = session.get(consts.session.userId); 
    guildBiz.refreshExplore(uwClient, userId,function(err,data){
        if(err) return next(null,wrapResult(err,null));

        var exData = new ds.ExGuildData();
        exData.userData = data[0];
        exData.guildPersonalData = data[1];
        exData.delBagItems = data[2];
        next(null,wrapResult(null,exData,dsNameConsts.ExGuildData));
    });
};