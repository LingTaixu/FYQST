const utils = require("../utils/utils.js");
const project = require('uw-config').project;
const dsNameConsts = require("uw-data").dsNameConsts;
const iface = require("uw-data").iface;
const adminKey = process.env.FYQST_ADMIN_KEY || require('../../config/crypt.json').adminKey;
const commanPara = '&s=0&c=0&ak=' + encodeURIComponent(adminKey);
const logger = require('uw-log').getLogger("uw-logger", __filename);
const ds = require("uw-ds").ds;
const querystring = require('querystring');
const wrapResult = require('uw-utils').wrapResultFunc(__filename);

var serverList = {};
var __serverInfo = {}; // 本服的服务器信息
var exports = module.exports;

exports.mailEvent = {
    bossReward: 1, // boss奖励
    guildBattleResult: 2 // 公会战结果
};

exports.init = function(cb) {
    _reqList(cb);
};

exports.authCity = function(accountId, serverId, loginKey, cb) {
    let reqpara = {};
    reqpara[iface.admin_ws_authCity_args.accountId] = accountId;
    reqpara[iface.admin_ws_authCity_args.loginKey] = loginKey;
    reqpara[iface.admin_ws_authCity_args.serverIndexId] = serverId;
    _reqForGame(serverId, iface.admin_ws_authCity, reqpara, function(err, data) {
        if (err) return cb(err);
        if (!data.userData) return cb("no user");
        let userData = data.userData;
        return cb(null, [userData, wrapResult(null, data, dsNameConsts.WSRoleData)]);
    });
};

exports.authBattle = function(accountId, serverId, loginKey, cb) {
    let reqpara = {};
    reqpara[iface.admin_ws_authBattle_args.accountId] = accountId;
    reqpara[iface.admin_ws_authBattle_args.loginKey] = loginKey;
    reqpara[iface.admin_ws_authBattle_args.serverIndexId] = serverId;
    _reqForGame(serverId, iface.admin_ws_authBattle, reqpara, function(err, data) {
        if (err) return cb(err);
        if (data.m) return cb("verify fail");

        let showData = data[1];
        let showHeroData = new ds.ShowHeroData();
        showHeroData.heroList = showData[0];
        showHeroData.otherDataList = showData[1]; //[[衣服显示id,武器显示id,翅膀显示id],..]
        showHeroData.fightData = showData[2];
        data[1] = wrapResult(null, showHeroData, dsNameConsts.ShowHeroData);
        data[3] = showHeroData.heroList;
        return cb(err, data);
    });
};

exports.reloadCityUser = function(userId, serverId, cb) {
    let reqpara = {};
    reqpara[iface.admin_ws_getWsRoleData_args.userId] = userId;
    _reqForGame(serverId, iface.admin_ws_getWsRoleData, reqpara, function(err, data) {
        if (err) return cb(err);
        let userData = data.userData;
        return cb(null, [userData, wrapResult(null, data, dsNameConsts.WSRoleData)]);
    });
};

exports.reloadBattleUser = function(userId, serverId, cb) {
    let reqpara = {};
    reqpara[iface.admin_ws_getWsBattleRoleData_args.userId] = userId;
    _reqForGame(serverId, iface.admin_ws_getWsBattleRoleData, reqpara, function(err, data) {
        if (err) return cb(err);

        let showData = data[1];
        let showHeroData = new ds.ShowHeroData();
        showHeroData.heroList = showData[0];
        showHeroData.otherDataList = showData[1]; //[[衣服显示id,武器显示id,翅膀显示id],..]
        showHeroData.fightData = showData[2];
        data[1] = wrapResult(null, showHeroData, dsNameConsts.ShowHeroData);
        data[3] = showHeroData.heroList;
        return cb(err, data);
    });
};

// exports.updateUserInfo = function(serverId, userId, cb) {
//     let reqpara = {};
//     reqpara[iface.admin_ws_getWsRoleData_args.userId] = userId; 
//     _reqForGame(serverId, iface.admin_ws_getWsRoleData, reqpara, cb);
// }  

exports.addGodnessExp = function(userId, sec, serverId, cb) {
    let reqpara = {};
    reqpara[iface.admin_ws_addGodnessExp_args.userId] = userId;
    reqpara[iface.admin_ws_addGodnessExp_args.sec] = sec;
    _reqForGame(serverId, iface.admin_ws_addGodnessExp, reqpara, cb);
};

exports.addWChest = function(userId, chestId, serverId, isOpen, cb) {
    let reqpara = {};
    reqpara[iface.admin_ws_addWChest_args.userId] = userId;
    reqpara[iface.admin_ws_addWChest_args.chestId] = chestId;
    reqpara[iface.admin_ws_addWChest_args.isOpen] = isOpen;
    _reqForGame(serverId, iface.admin_ws_addWChest, reqpara, function(err, exUserData) {
        //console.log("addWChest resp:", exUserData);
        return cb(err, wrapResult(null, exUserData, dsNameConsts.ExUserData), exUserData.bagItems);
    });
};

//exports.getServer = function(id, cb) {
    //console.log("getServer:", serverList);
//    if (id == 0) return cb(null, {});
//    if (__serverInfo.id) return cb(null, __serverInfo);
//    _reqServerInfoById(id, cb);
//};

// 获得最新的时间
exports.getServerNew = function(id, cb) {
    if (id == 0) return cb(null, {});
    _reqServerInfoById(id, cb);
};

exports.getServer = function(id, cb) {
    //console.log("getServer:", serverList);
    if (id == 0) return cb(null, {});
    if (!serverList[id]) {
        _reqList(function(err, dataList) {
            if (err) return cb(null, null);
            return cb(null, dataList[id]);
        })
    } else {
        return cb(null, serverList[id]);
    }
};

// // 获得最新的时间
// exports.getServerNew = function(id, cb){
//     if (id == 0) return cb(null, {});
//      _reqList(function(err, dataList) {
//         if (err) return cb(null, null);
//         return cb(null, dataList[id]);
//     });
// };

exports.getFakeUserList = function(userId, num, serverId, cb) {
    let reqpara = {};
    reqpara[iface.admin_ws_fakeRoleList_args.userId] = userId;
    reqpara[iface.admin_ws_fakeRoleList_args.num] = num;
    _reqForGame(serverId, iface.admin_ws_fakeRoleList, reqpara, cb);
};

exports.noticeAddItem = function(userId, type, items, bossId, serverId) {
    let reqpara = {};
    reqpara[iface.admin_ws_noticeAddItem_args.userId] = userId;
    reqpara[iface.admin_ws_noticeAddItem_args.type] = type;
    reqpara[iface.admin_ws_noticeAddItem_args.items] = items;
    reqpara[iface.admin_ws_noticeAddItem_args.bossId] = bossId;
    _reqForGame(serverId, iface.admin_ws_noticeAddItem, reqpara, function(err, data) {});
};

exports.killBoss = function(userId, userName, bossId, bossType, isOwner, serverId, cb) {
    let reqpara = {};
    reqpara[iface.admin_ws_killBoss_args.userId] = userId;
    reqpara[iface.admin_ws_killBoss_args.userName] = querystring.escape(userName);
    reqpara[iface.admin_ws_killBoss_args.bossId] = bossId;
    reqpara[iface.admin_ws_killBoss_args.type] = bossType;
    reqpara[iface.admin_ws_killBoss_args.isOwner] = isOwner;
    // reqpara[iface.admin_ws_killBoss_args.awardArr] = awardArr;
    _reqForGame(serverId, iface.admin_ws_killBoss, reqpara, cb);
};

exports.enterWBoss = function(userId, bossType, bossId, serverId, cb) {
    let reqpara = {};
    reqpara[iface.admin_ws_enterWBoss_args.userId] = userId;
    reqpara[iface.admin_ws_enterWBoss_args.bossType] = bossType;
    reqpara[iface.admin_ws_enterWBoss_args.bossId] = bossId;
    _reqForGame(serverId, iface.admin_ws_enterWBoss, reqpara, cb);
};

exports.addHJBossNum = function(userId, costType, bossId, groupType, serverId, cb) {
    let reqpara = {};
    reqpara[iface.admin_ws_addHJBossNum_args.userId] = userId;
    reqpara[iface.admin_ws_addHJBossNum_args.type] = costType;
    reqpara[iface.admin_ws_addHJBossNum_args.bossId] = bossId;
    reqpara[iface.admin_ws_addHJBossNum_args.groupType] = groupType;
    _reqForGame(serverId, iface.admin_ws_addHJBossNum, reqpara, function(err, exUserData) {
        if (err) return cb(err);
        return cb(null, [exUserData.userData, wrapResult(null, exUserData, dsNameConsts.ExUserData)]);
    });
};

//女神之光参与次数（一天记一次）
exports.joinGodnessNum = function(userId, serverId) {
    let reqpara = {};
    reqpara[iface.admin_ws_enterGodness_args.userId] = userId;
    _reqForGame(serverId, iface.admin_ws_enterGodness, reqpara, function(err, data) {});
};

exports.getUserInfo = function(userId, serverId, cb) {
    let reqpara = {};
    reqpara[iface.admin_ws_getUserInfo_args.userId] = userId;
    _reqForGame(serverId, iface.admin_ws_getUserInfo, reqpara, cb);
};

exports.guildBattleResult = function(guildRes, userRes, serverId, cb) {
    let reqpara = {};
    reqpara[iface.admin_ws_guildBattleResult_args.gres] = guildRes;
    reqpara[iface.admin_ws_guildBattleResult_args.ures] = userRes;
    _reqForGame(serverId, iface.admin_ws_guildBattleResult, reqpara, cb);
};

exports.getPReward = function(userId, idx, serverId, cb) {
    let reqpara = {};
    reqpara[iface.admin_ws_getPReward_args.userId] = userId;
    reqpara[iface.admin_ws_getPReward_args.idx] = idx;
    _reqForGame(serverId, iface.admin_ws_getPReward, reqpara, cb);
};

// 活动公会战公会信息
exports.getGuildCombatRank8 = function(serverId, cb) {
    let reqpara = {};
    _reqForGame(serverId, iface.admin_ws_getGuildCombatRank8, reqpara, cb);
};

exports.writeMails = function(serverId, ev, mailList, cb) {
    let reqpara = {};
    console.error("mailList:", ev, mailList);
    reqpara[iface.admin_ws_addMails_args.e] = ev;
    reqpara[iface.admin_ws_addMails_args.mailList] = mailList;
    _reqForGame(serverId, iface.admin_ws_addMails, reqpara, cb);
};

var _reqServerInfoById = function(serverId, cb) {
    let reqpara = {};
    reqpara[iface.admin_ws_getServerInfo_args.serverId] = serverId;
    _reqForMaster(iface.admin_ws_getServerInfo, reqpara, function(err, serverInfo) {
        if (err) return cb && cb(err);
        //logger.info("_reqList:", svrList);
        __serverInfo = {};
        __serverInfo.id = serverInfo.id;
        __serverInfo.host = serverInfo.host;
        __serverInfo.port = serverInfo.port;
        __serverInfo.serverDate = serverInfo.serverDate;
        logger.info("SERVERINFO:", JSON.stringify(__serverInfo));
        cb && cb(null, __serverInfo);
    });
};


var _reqList = function(cb) {
    _reqForMaster(iface.admin_ws_serverList, {}, function(err, svrList) {
		logger.info('err',err);
        if (err) return cb && cb(err);
        //logger.info("_reqList:", svrList);
        serverList = {};
        svrList.forEach(function(v) {
            serverList[v.id] = {
                id: v.id, // 游戏serverId
                host: v.host, // 游戏服务器ip
                port: v.port, // 游戏服务器port
                serverDate: v.serverDate // 开服时间
            };
        });
        logger.info("SERVERLIST:", JSON.stringify(serverList));
        cb && cb(null, serverList);
    });
};

var _reqForGame = function(serverId, k, para, cb) {
    exports.getServer(serverId, function(err, server) {
        if (!server) return cb("no server");

        let reqpara = JSON.stringify(para || {});
        reqpara = querystring.escape(reqpara);
        let params = '/?r=' + k + '&a=' + reqpara + commanPara;
        let options = {
            host: server.host,
            port: server.port,
            path: params,
            method: 'GET',
            headers: {
                "Content-Type": 'application/json;charset=utf-8'
            },
			rejectUnauthorized: false,
        };
		//console.log("_reqForGame:",project.isHttps, params, options);
        if (project.isHttps) {
            utils.requestHttps(options, "", cb);
        } else {
            utils.requestHttp(options, "", cb);
        }

    });
}

var _reqForMaster = function(k, para, cb) {
    let reqpara = JSON.stringify(para || {});
    reqpara = querystring.escape(reqpara);
    let params = '/?r=' + k + '&a=' + reqpara + commanPara;
    let options = {
        host: project.mainHttpHost,
        port: project.mainHttpPort,
        path: params,
        method: 'GET',
        headers: {
            "Content-Type": 'application/json;charset=utf-8'
        },
		rejectUnauthorized: false,
    };
    //console.log("_reqForMaster:",project.isHttps, params, options);
    if (project.isHttps) {
        utils.requestHttps(options, "", cb);
    } else {
        utils.requestHttp(options, "", cb);
    }
}
