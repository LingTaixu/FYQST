/**
 * Created by liuqiang on 2018/1/24.
 */

// 提供 wserver 内部服务器 接口

var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var ds = require("uw-ds").ds;
var c_prop = uwData.c_prop;
var userBiz = require("uw-user").userBiz;
var guildBiz = require("uw-guild").guildBiz;
var rankBiz = require("uw-rank").rankBiz;
var serverInfoBiz = require("uw-server-info").serverInfoBiz;
var heroBiz = require("uw-hero").heroBiz;
var taskBiz = require("uw-task").taskBiz;
var mailDao = require("uw-mail").mailDao;
var bossBiz = require("uw-boss").bossBiz;
var worldBossRecordBiz = require("uw-wboss").worldBossRecordBiz;
var battlesGroupBiz = require("uw-battles-group").battlesGroupBiz;
var proto = module.exports;
var logger = require("uw-log").getLogger("uw-logger", __filename);

var uwClient = null;
var loginClient = null;
var mainClient = null;
var checkMainRequire = function() {
    loginClient = loginClient || require("uw-db").loginClient;
    mainClient = mainClient || require("uw-db").mainClient;
};

var checkGameRequire = function() {
    loginClient = loginClient || require("uw-db").loginClient;
    mainClient = mainClient || require("uw-db").mainClient;
    uwClient = uwClient || require("uw-db").uwClient;
}

/**
 * 身份认证 (City)
 * @iface authCity
 * @args {accountId:"账号id",loginKey:"登录key",serverIndexId:"登录Id"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.a = function(args, session, next) {
    var argsKeys = iface.admin_ws_authCity_args;
    var accountId = args[argsKeys.accountId];
    var loginKey = args[argsKeys.loginKey];
    var serverIndexId = args[argsKeys.serverIndexId];
    checkGameRequire();
    userBiz.getWSRoleData(uwClient, accountId, loginKey, serverIndexId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var wsRoleData = new ds.WSRoleData();
        wsRoleData.userData = data[0];
        // var userData = data[0];
        // wsRoleData.userData.id = userData.id;
        // wsRoleData.userData.nickName = userData.nickName;
        // wsRoleData.userData.lvl = userData.lvl;
        // wsRoleData.userData.iconId = userData.iconId;
        // wsRoleData.userData.medalTitle = userData.medalTitle;
        // wsRoleData.userData.achieveLvl = userData.achieveLvl;

        // wsRoleData.userData.rebirthLvl = userData.rebirthLvl;
        // wsRoleData.userData.noble = userData.noble;
        wsRoleData.hero = data[1];
        wsRoleData.fightData = data[2];
        //next(null, wrapResult(null, wsRoleData, dsNameConsts.WSRoleData));
        next(null, wsRoleData);
    });

};

/**
 * 身份认证 (Battle)
 * @iface authBattle
 * @args {accountId:"账号id",loginKey:"登录key",serverIndexId:"登录Id"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.a1 = function(args, session, next) {
    var argsKeys = iface.admin_ws_authBattle_args;
    var accountId = args[argsKeys.accountId];
    var loginKey = args[argsKeys.loginKey];
    var serverIndexId = args[argsKeys.serverIndexId];
    checkGameRequire();
    userBiz.getBattleUser(uwClient, accountId, serverIndexId, loginKey, function(err, data) {
        if (err) return next(null, wrapResult(err));
        // let showData = data[2];
        // let showHeroData = new ds.ShowHeroData();
        // showHeroData.heroList = showData[0];
        // showHeroData.otherDataList = showData[1]; //[[衣服显示id,武器显示id,翅膀显示id],..]
        // showHeroData.fightData = showData[2];
        // data[2] = wrapResult(null,showHeroData,dsNameConsts.ShowHeroData);
        next(null, data);
    });

};

/**
 * 获取玩家最新WsRoleData数据
 * @iface getWsRoleData
 * @args {userId:"角色Id"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.a2 = function(args, session, next) {
    var argsKeys = iface.admin_ws_getWsRoleData_args;
    var userId = args[argsKeys.userId];
    checkGameRequire();
    userBiz.getWSRoleData2(uwClient, userId, function(err, data) {
        if (err) return next(null, null);
        var wsRoleData = new ds.WSRoleData();
        // wsRoleData.userData = {};
        // var userData = data[0];
        // wsRoleData.userData.id = userData.id;
        // wsRoleData.userData.nickName = userData.nickName;
        // wsRoleData.userData.lvl = userData.lvl;
        // wsRoleData.userData.iconId = userData.iconId;
        // wsRoleData.userData.medalTitle = userData.medalTitle;
        // wsRoleData.userData.achieveLvl = userData.achieveLvl;

        // wsRoleData.userData.rebirthLvl = userData.rebirthLvl;
        // wsRoleData.userData.noble = userData.noble;
        wsRoleData.userData = data[0];
        wsRoleData.hero = data[1];
        wsRoleData.fightData = data[2];
        //next(null, wrapResult(null, wsRoleData, dsNameConsts.WSRoleData));
        next(null, wsRoleData);
    });
};

/**
 * 获取玩家最新WsRoleData数据
 * @iface getWsBattleRoleData
 * @args {userId:"角色Id"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.a3 = function(args, session, next) {
    var argsKeys = iface.admin_ws_getWsBattleRoleData_args;
    var userId = args[argsKeys.userId];
    checkGameRequire();
    userBiz.getWsBattleRoleData(uwClient, userId, function(err, data) {
        if (err) return next(null, null);
        next(null, data);
    });
};


/**
 * 获得服务器列表
 * @iface serverList
 * @args
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.b = function(args, session, next) {
    checkMainRequire();
    serverInfoBiz.getList(loginClient, 1, function(err, serverList) {
        if (err) return next(null, wrapResult(err));
        for (var i = 0; i < serverList.length; i++) {
            var server = serverList[i];
            propUtils.delProp(server, ["dbLink"]);
            propUtils.delProp(server, ["outLink"]);
            propUtils.delProp(server, ["host2"]);
            propUtils.delProp(server, ["port2"]);
            propUtils.delProp(server, ["isNew"]);
            propUtils.delProp(server, ["appId"]);
            propUtils.delProp(server, ["sort"]);
            propUtils.delProp(server, ["status"]);
            propUtils.delProp(server, ["isClose"]);
            propUtils.delProp(server, ["name"]);
            propUtils.delProp(server, ["mergerName"]);
            propUtils.delProp(server, ["closeExplain"]);
            propUtils.delProp(server, ["indexId"]);
            propUtils.delProp(server, ["serverId"]);
            propUtils.delProp(server, ["serverDate"]);
        }
        next(null, serverList);
    });

};

/**
 * 获得服务器信息
 * @iface getServerInfo
 * @args {serverId:"服务器Id"}
 * @param args
 * @param session
 * @param next
 * @returns serverData
 */
proto.b1 = function(args, session, next) {
    checkMainRequire();
    var argsKeys = iface.admin_ws_getServerInfo_args;
    var serverId = args[argsKeys.serverId];
    serverInfoBiz.getServerInfo(loginClient, serverId, function(err, serverData) {
        if (err) return next(null, wrapResult(err));
        propUtils.delProp(serverData, ["dbLink"]);
        propUtils.delProp(serverData, ["outLink"]);
        propUtils.delProp(serverData, ["host2"]);
        propUtils.delProp(serverData, ["port2"]);
        propUtils.delProp(serverData, ["isNew"]);
        propUtils.delProp(serverData, ["appId"]);
        propUtils.delProp(serverData, ["sort"]);
        propUtils.delProp(serverData, ["status"]);
        propUtils.delProp(serverData, ["isClose"]);
        propUtils.delProp(serverData, ["area"]);
        propUtils.delProp(serverData, ["name"]);
        propUtils.delProp(serverData, ["mergerName"]);
        propUtils.delProp(serverData, ["closeExplain"]);
        propUtils.delProp(serverData, ["indexId"]);
        propUtils.delProp(serverData, ["serverId"]); 
        next(null, serverData);
    });
};

/**
 * 获得服务器信息
 * @iface getServerInfoByBattleId
 * @args {battleId:"战斗分组Id"}
 * @param args
 * @param session
 * @param next
 * @returns serverData
 */
proto.b2 = function(args, session, next) {
    checkMainRequire();
    var argsKeys = iface.admin_ws_getServerInfoByBattleId_args;
    var battleId = args[argsKeys.battleId];

    battlesGroupBiz.getServerIds(mainClient, battleId, function(err, serverIds){
        if (err) return next(null, wrapResult(err));
        serverInfoBiz.getServerInfos(loginClient, serverIds, function(err1, serverList) {
            if (err1) return next(null, wrapResult(err1));
            for (var i = 0; i < serverList.length; i++) {  
                var serverData = serverList[i];
                propUtils.delProp(serverData, ["dbLink"]);
                propUtils.delProp(serverData, ["outLink"]);
                propUtils.delProp(serverData, ["host2"]);
                propUtils.delProp(serverData, ["port2"]);
                propUtils.delProp(serverData, ["isNew"]);
                propUtils.delProp(serverData, ["appId"]);
                propUtils.delProp(serverData, ["sort"]);
                propUtils.delProp(serverData, ["status"]);
                propUtils.delProp(serverData, ["isClose"]);
                propUtils.delProp(serverData, ["area"]);
                propUtils.delProp(serverData, ["name"]);
                propUtils.delProp(serverData, ["mergerName"]);
                propUtils.delProp(serverData, ["closeExplain"]);
                propUtils.delProp(serverData, ["indexId"]);
                propUtils.delProp(serverData, ["serverId"]);
                propUtils.delProp(serverData, ["serverDate"]);
            }
            next(null, serverList);
        });
    });



};

/**
 * 女神之光增加经验
 * @iface addGodnessExp
 * @args {userId:"玩家id",sec:'时间'}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.c = function(args, session, next) {
    var argsKeys = iface.admin_ws_addGodnessExp_args;
    var userId = args[argsKeys.userId];
    var sec = args[argsKeys.sec];
    checkGameRequire();
    userBiz.addGodnessExp(uwClient, userId, sec, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var exUserData = new ds.ExUserData();
        exUserData.userData = data[0]
        return next(null, wrapResult(null, exUserData, dsNameConsts.ExUserData));
    });
};

/**
 * 拾取宝箱
 * @iface addWChest
 * @args  {userId:"用户id", chestId:"宝箱id", isOpen:"0 不开 1 开启"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.d = function(args, session, next) {
    var argsKeys = iface.admin_ws_addWChest_args;
    var userId = args[argsKeys.userId];
    var chestId = args[argsKeys.chestId];
    var isOpen = args[argsKeys.isOpen];
    checkGameRequire();
    userBiz.addWChest(uwClient, userId, chestId, isOpen, function(err, data) {
        if (err) return next(null, wrapResult(err));

        var reData = new ds.ExUserData();
        reData.userData = data[0];
        reData.bagItems = data[1];
        return next(null, reData);
        // return next(null, wrapResult(null, reData, dsNameConsts.ExUserData));
    });
};

/**
 * 玩家fakeRoleList列表
 * @iface fakeRoleList
 * @args  {userId:"用户id", num:"用户数量"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.e = function(args, session, next) {
    var argsKeys = iface.admin_ws_fakeRoleList_args;
    var userId = args[argsKeys.userId];
    var num = args[argsKeys.num];
    checkGameRequire();
    userBiz.getFakeWSUserList(uwClient, userId, num, function(err, dataList) {
        if (err) return next(null, wrapResult(err));

        var wsData = new ds.WSRoleList();
        wsData.roleList = [];
        for (var i = 0; i < dataList.length; i++) {
            var data = dataList[i];
            var wsRoleData = new ds.WSRoleData();
            wsRoleData.userData = data[0]
            // wsRoleData.userData = {};
            // var userData = data[0];

            if (!data[1] || !data[2]) continue;

            // wsRoleData.userData.id = userData.id;
            // wsRoleData.userData.nickName = userData.nickName;
            // wsRoleData.userData.lvl = userData.lvl;
            // wsRoleData.userData.iconId = userData.iconId;
            // wsRoleData.userData.medalTitle = userData.medalTitle;
            // wsRoleData.userData.achieveLvl = userData.achieveLvl;
            wsRoleData.hero = data[1];
            wsRoleData.fightData = data[2];
            wsData.roleList.push(wsRoleData);
        }
        next(null, wrapResult(null, wsData, dsNameConsts.WSRoleList));
    });
};

/**
 * 通知用户获得物品(不加玩家数据，只供其他处理)
 * @iface noticeAddItem
 * @args  {userId:"用户id", type:"获取途径", items:"获得物品", bossId:"bossId"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.f = function(args, session, next) {
    var argsKeys = iface.admin_ws_noticeAddItem_args;
    var userId = args[argsKeys.userId];
    var type = args[argsKeys.type];
    var items = args[argsKeys.items];
    var bossId = args[argsKeys.bossId];
    // logger.error("noticeAddItem:", args);
    checkGameRequire();
    userBiz.noticeAddItem(uwClient, userId, type, items, bossId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        return next(null, null);
    });
};

/**
 * 通知用户击杀中立Boss/天命Boss
 * @iface killBoss
 * @args  {userId:"用户id", userName:"用户名", bossId:"bossId", type:"boss类型 14 中立 13 天命 16异界", isOwner:"0 不是归属 1 是归属"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.g = function(args, session, next) {
    var argsKeys = iface.admin_ws_killBoss_args;
    var userId = args[argsKeys.userId];
    var userName = args[argsKeys.userName];
    var bossId = args[argsKeys.bossId];
    var type = args[argsKeys.type] || 0;
    var isOwner = args[argsKeys.isOwner] || 0;
    // var awardArr = args[argsKeys.awardArr];
    //logger.error(userId + " killBoss:" + type);
    checkGameRequire();
    userBiz.killBoss(uwClient, userId, userName, type, bossId, isOwner, function(err, data) {
        if (err) return next(null, wrapResult(err));
        //console.error('ws g =admin_ws_killBoss=============>',data);
        return next(null, data);
    });
};

/**
 * 进入WBoss
 * @iface enterWBoss
 * @args  {userId:"用户id", bossId:"bossId", bossType:"bossType"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.h = function(args, session, next) {
    var argsKeys = iface.admin_ws_enterWBoss_args;
    var userId = args[argsKeys.userId];
    var bossId = args[argsKeys.bossId];
    var bossType = args[argsKeys.bossType];
    checkGameRequire();
    if (bossType == 14) { // 中立
        userBiz.enterZhongLiBoss(uwClient, userId, bossId, function(err, exUserData) {
            if (err) {
                //console.error("enterZhongLiBoss:", err);
                var ret = {
                    errcode: 1
                };
                return next(null, ret);
            }
            let data = wrapResult(null, exUserData, dsNameConsts.ExUserData);
            return next(null, data);
        });
    } else if (bossType == 13) { // 天命
        userBiz.enterTianMingBoss(uwClient, userId, bossId, function(err, exUserData) {
            if (err) {
                //console.error("enterTianMingBoss:", err);
                var ret = {
                    errcode: 1
                };
                return next(null, ret);
            }
            let data = wrapResult(null, exUserData, dsNameConsts.ExUserData);
            return next(null, data);
        });
    } else if (bossType == 16) { // 幻境boss
        userBiz.enterHJBoss(uwClient, userId, bossId, function(err, exUserData) {
            if (err) {
                //console.error("enterHJBoss:", err);
                var ret = {
                    errcode: 1
                };
                return next(null, ret);
            }
            let data = wrapResult(null, exUserData, dsNameConsts.ExUserData);
            return next(null, data);
        });
    } else if (bossType == 17) { // 跨服天命
        userBiz.enterCSTianMingBoss(uwClient, userId, bossId, function(err, exUserData) {
            if (err) {
                //console.error("enterCSZhongLiBoss:", err);
                var ret = {
                    errcode: 1
                };
                return next(null, ret);
            }
            let data = wrapResult(null, exUserData, dsNameConsts.ExUserData);
            return next(null, data);
        });
    } else {
        return next(null, null);
    }
};

/**
 * 获得玩家信息
 * @iface getUserInfo
 * @args  {userId:"用户id"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.i = function(args, session, next) {
    var argsKeys = iface.admin_ws_getUserInfo_args;
    var userId = args[argsKeys.userId];
    checkGameRequire();
    userBiz.getUserInfo(uwClient, userId, function(err, userData) {
        if (err) return next(null);
        return next(null, userData);
    });
};


/**
 * 通知公会战结果
 * @iface guildBattleResult
 * @args  {gres:"结果数据", ures:""}
 * @param args
 * @param session
 * @param next
 * @returns
 */
proto.j = function(args, session, next) {
    var argsKeys = iface.admin_ws_guildBattleResult_args;
    var guildRes = args[argsKeys.gres];
    var userRes = args[argsKeys.ures];
    checkGameRequire();
    guildBiz.noticeGuildBattleResult(uwClient, guildRes, userRes, function(err, data) {
        if (err) return next(null);
        return next(null, data);
    });
};

/**
 * 获得公会战个人积分宝箱
 * @iface getPReward
 * @args  {userId:"uid",idx:"索引值"}
 * @param args
 * @param session
 * @param next
 * @returns
 */
proto.k = function(args, session, next) {
    var argsKeys = iface.admin_ws_getPReward_args;
    var userId = args[argsKeys.userId];
    var idx = args[argsKeys.idx];
    checkGameRequire();
    guildBiz.getPReward(uwClient, userId, idx, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var reData = new ds.ExUserData();
        reData.bagItems = data[0];
        return next(null, wrapResult(null, reData, dsNameConsts.ExUserData));
    });
};

/**
 * 获得公会战战力前8的公会
 * @iface getGuildCombatRank8
 * @args
 * @param args
 * @param session
 * @param next
 * @returns
 */
proto.l = function(args, session, next) {
    checkGameRequire();
    rankBiz.getGuildCombatRank8(uwClient, function(err, data) {
        if (err) return next(null, null);
        return next(null, data);
    });
};

/**
 * 玩家参加女神之关(一次活动只通知一次)
 * @iface enterGodness
 * @args  {userId:"用户id"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.m = function(args, session, next) {
    var argsKeys = iface.admin_ws_enterGodness_args;
    var userId = args[argsKeys.userId];
    // console.error("ws.m--------->",userId);
    checkGameRequire();
    userBiz.enterGodness(uwClient, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        return next(null, null);
    });
};

/**
 * 幻境boss增加次数 
 * @iface addHJBossNum
 * @args {userId:"用户id", bossId:"bossId", groupType:"boss组别", type:"类型 1  幻境boss增加归属 2 幻境boss增加夺宝"}
 * @param args
 * @param session
 * @param next
 * @returns
 */
proto.n = function(args, session, next) {
    var argsKeys = iface.admin_ws_addHJBossNum_args;
    var userId = args[argsKeys.userId];
    var groupType = args[argsKeys.groupType];
    //var bossId = args[argsKeys.bossId];
    if (!Number.isInteger(groupType)) {
        return next(null, null);
    }

    var type = args[argsKeys.type];
    checkGameRequire();
    userBiz.addHJBossNum(uwClient, userId, type, groupType, function(err, exUserData) {
        if (err) return next(null, wrapResult(err));
        //let data = wrapResult(null, exUserData, dsNameConsts.ExUserData);
        return next(null, exUserData);
    });
};

/**
 * 增加邮件
 * @iface addMails
 * @args {e:"事件", mailList:"邮件列表"}
 * @param args
 * @param session
 * @param next
 * @returns
 */
proto.o = function(args, session, next) {
    var argsKeys = iface.admin_ws_addMails_args;
    var mailList = args[argsKeys.mailList];
    var e = args[argsKeys.e];
    console.error("addMails:", e, mailList);
    checkGameRequire();
    // 时间串 2018-08-10T06:18:50.861Z 格式插入 mysql datetime 会报错 ER_TRUNCATED_WRONG_VALUE    
    mailList.forEach(function(e) {
        e.expireTime = new Date(e.expireTime);
        e.addTime = new Date(e.addTime);
    });

    mailDao.insertList(uwClient, mailList, function(err, data) {
        //console.log("addMails Result:", err, data);
    });
    return next(null, null);
};


/**
 * 世界boss 钥匙掉落
 * @iface addWorldLuckyAward
 * @args  {userId:"用户id", bossId:"世界bossId", type:"0 幸运奖 1 最终幸运奖"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.p = function(args, session, next) {
    var argsKeys = iface.admin_ws_addWorldLuckyAward_args;
    var userId = args[argsKeys.userId];
    var bossId = args[argsKeys.bossId];
    var type = args[argsKeys.type];
    checkGameRequire();
    bossBiz.addWorldLuckyAward(uwClient, userId, bossId, type, function(err, data) {
        if (err) return next(null, wrapResult(err));

        var reData = new ds.ExUserData();
        reData.userData = data[0];
        reData.bagItems = data[1];
        return next(null, reData);
    });
};

/**
 * 世界boss鼓舞
 * @iface inspire
 * @args  {userId:"用户id", bossId:"世界bossId"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.q = function(args, session, next) {
    var argsKeys = iface.admin_ws_inspire_args;
    var userId = args[argsKeys.userId];
    var bossId = args[argsKeys.bossId];
    checkGameRequire();
    userBiz.inspireWorldBoss(uwClient, userId, bossId, function(err, data) {
        if (err) {
            var ret = {
                errcode: 1
            };
            return next(null, ret);
        }

        var reData = new ds.ExUserData();
        reData.userData = data[0];
        return next(null, reData);
    });
};

/**
 * 世界boss伤害值
 * @iface wbHurt
 * @args  {userId:"用户id", hurt:"伤害值"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.r = function(args, session, next) {
    var argsKeys = iface.admin_ws_wbHurt_args;
    var userId = args[argsKeys.userId];
    var hurt = args[argsKeys.hurt];
    checkGameRequire();
    userBiz.wbHurt(uwClient, userId, hurt, function(err, data) {
        var reData = new ds.ExUserData();
        reData.userData = data[0];
        return next(null, reData);
    });
};

/**
 * 世界boss 个人奖励
 * @iface wbPersonAward
 * @args  {userId:"用户id", bossId:"世界bossId", rank:"排名值 从0开始"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.s = function(args, session, next) {
    var argsKeys = iface.admin_ws_wbPersonAward_args;
    var userId = args[argsKeys.userId];
    var bossId = args[argsKeys.bossId];
    var rank = args[argsKeys.rank];
    checkGameRequire();
    bossBiz.wbPersonAward(uwClient, userId, bossId, rank, function(err, data) {
        return next(null, null);
    });
};

/**
 * 世界boss 公会奖励
 * @iface wbGuildAward
 * @args  {guildId:"公会id", bossId:"世界bossId", rank:"排名值 从0开始"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.s1 = function(args, session, next) {
    var argsKeys = iface.admin_ws_wbGuildAward_args;
    var guildId = args[argsKeys.guildId];
    var bossId = args[argsKeys.bossId];
    var rank = args[argsKeys.rank];
    checkGameRequire();
    bossBiz.wbGuildAward(uwClient, guildId, bossId, rank, function(err, data) {
        return next(null, null);
    });
};

/**
 * 世界boss 最后一击奖励
 * @iface wbLastShotAward
 * @args  {userId:"用户id", bossId:"世界bossId"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.s2 = function(args, session, next) {
    var argsKeys = iface.admin_ws_wbLastShotAward_args;
    var userId = args[argsKeys.userId];
    var bossId = args[argsKeys.bossId];
    checkGameRequire();
    bossBiz.wbLastShotAward(uwClient, userId, bossId, function(err, data) {
        return next(null, null);
    });
};

/**
 * 世界boss商店购买物品
 * @iface wbShopBuy
 * @args  {userId:"用户id", bossId:"bossId", goodsId:"商品id"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.t = function(args, session, next) {
    var argsKeys = iface.admin_ws_wbShopBuy_args;
    var userId = args[argsKeys.userId];
    var bossId = args[argsKeys.bossId];
    var goodsId = args[argsKeys.goodsId];
    checkGameRequire();
    bossBiz.wbShopBuy(uwClient, userId, bossId, goodsId, function(err, data) {
        if (err) {
            var ret = {
                errcode: 1
            };
            return next(null, ret);
        }
        var reData = new ds.ExUserData();
        reData.userData = data[0];
        reData.bagItems = data[1];
        reData.delBagItems = data[2];
        return next(null, reData);
    });
};

/**
 * 世界boss战斗结果
 * @iface wbBattleResult
 * @args  {battleId:"战斗ID", bossId:"bossId", resultData:"战斗结果"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.u = function(args, session, next) {
    var argsKeys = iface.admin_ws_wbBattleResult_args;
    var battleId = args[argsKeys.battleId];
    var bossId = args[argsKeys.bossId];
    var resultData = args[argsKeys.resultData];
    checkMainRequire();
    worldBossRecordBiz.wbBattleResult(mainClient, battleId, bossId, resultData, function(err, data) {
        return next(null, null);
    });
};