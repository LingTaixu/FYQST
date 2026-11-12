var async = require("async");
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var uwData = require("uw-data");
var c_msgCode = uwData.c_msgCode;
var c_prop = uwData.c_prop;
var t_hero = uwData.t_hero;

var uwClient = require("uw-db").uwClient;
var g_common = require('uw-global').g_common;
var pomelo = require("pomelo");
var project = require("uw-config").project;
var proto = module.exports;
var iface = uwData.iface;
var consts = uwData.consts; 
var ds = require("uw-ds").ds;
var dsNameConsts = uwData.dsNameConsts;
var getMsg = require("uw-utils").msgFunc(__filename);
var propUtils = require("uw-utils").propUtils;
var dispatchUtils = require("uw-utils").dispatchUtils;
var userBiz = require("uw-user").userBiz;
var taskBiz = require("uw-task").taskBiz;
var sdkBiz = require("uw-sdk").sdkBiz;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var sessionManager = require("uw-route").sessionManager;
var UserData = require('uw-gameobj').UserData;
var bonusBiz = require('uw-bonus-share').bonusBiz;
var biHlBiz = require("uw-log").biHlBiz;
var biHlObj = require("uw-log").biHlObj;
var ossBiz = require("uw-log").ossBiz;
var ossObj = require("uw-log").ossObj;
var chatBiz = require("uw-chat").chatBiz; 
var mailBiz = require('uw-mail').mailBiz;
var activityBiz = require('uw-activity').activityBiz;
var accountBiz = require('uw-account').accountBiz;
var g_server = require("uw-global").g_server;

/**
 * 验证常规登录,成功返回null
 * @iface enterGame
 * @args {accountId:"账号id",loginKey:"登录key",serverIndexId:"登录key"}
 * @param args
 * @param session
 * @param next
 */
proto.a = function(args, session, next) {
    var argsKeys = iface.c_account_enterGame_args;
    var accountId = args[argsKeys.accountId];
    var loginKey = args[argsKeys.loginKey];
    var serverIndexId = args[argsKeys.serverIndexId];
    var opt = {
        ip: session.get(consts.session.ip),
        ua: session.get(consts.session.ua)
    }
    userBiz.getInitData(uwClient, accountId, loginKey, serverIndexId, opt, function(err, data) {
        if (err) return next(null, wrapResult(err));
        var userData = data[1];
        if (!userData) {


            session.set(consts.session.accountId, accountId);
            session.set(consts.session.serverIndexId, serverIndexId);

            session.pushAll(function() {
                if (err) return next(null, wrapResult(err));
                return next(null, wrapResult(null));
            });


        } else {
            _handleLogin(session, data, next);
        }
    });
};

/**
 * 创建用户
 * @iface createUser
 * @args {name:"名字",heroTempId:"模板id ",sex:"性别 ",serverIndexId:"登录key",shareKey:"可能的分红模块的分享key", loginKey:"", accountId:""}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExUserData
 */
proto.b = function(args, session, next) {
    var argsKeys = iface.c_account_createUser_args;
    //var accountId = session.get(consts.session.accountId);
    var name = args[argsKeys.name];
    var heroTempId = args[argsKeys.heroTempId] || 1;
    var sex = args[argsKeys.sex] || 0;
    var serverIndexId = args[argsKeys.serverIndexId] || 0;
    var shareKey = args[argsKeys.shareKey] || '';
    var accountId = args[argsKeys.accountId] || 0;
    var loginKey = args[argsKeys.loginKey] || 0;

    var sessionAccountId = session.get(consts.session.accountId);
    //console.error("sessionAccountId:", sessionAccountId);
    // 验证accountId和loginKey
    accountBiz.verifyLoginKey(accountId, loginKey, sessionAccountId, function(err){

        if(err) return next(err);

        // 设置session
        if(accountId > 0){
            session.set(consts.session.accountId, accountId);
        }
        session.set(consts.session.serverIndexId, serverIndexId);
 
        var ip = session.get(consts.session.ip);
        var ua = session.get(consts.session.ua);

        if (name == null || name == "") return next(null, wrapResult("角色名不能为空！"));
        if (name.indexOf(" ") >= 0) return next(null, wrapResult("角色名不能包含空格！")); 
        if (name.indexOf("\n") >= 0 || name.indexOf("\\n") >= 0 || name.indexOf("\r") >= 0 || name.indexOf("\\r") >= 0|| name.indexOf("\\") >= 0|| name.indexOf("\t") >= 0  || name.indexOf("\"") >= 0
        || name.indexOf("/") >= 0|| name.indexOf("\b") >= 0||  name.indexOf("\f") >= 0
        || name.indexOf("'") >= 0|| name.indexOf("\'") >= 0|| name.indexOf(".") >= 0 || name.indexOf(";") >= 0|| name.indexOf(",") >= 0) return next(null, wrapResult("角色名不能有空格或非法字符！"));  //角色名不能包含回车换行或双引号
     
        //接口调用
        userBiz.createUser(uwClient, accountId, name, heroTempId, sex, serverIndexId, shareKey, { ip: ip, ua: ua }, function(err, data) {
            if (err) return next(null, wrapResult(err));
            var userData = data[0];
            var heroData = data[1];
            var accountData = data[2];
            var updateUserData = {
                id :userData.id,
                nickName: userData.nickName,
                serverId : userData.serverId             
            }
            next(null, wrapResult(null, updateUserData, dsNameConsts.UserEntity));

            // 注册创角色BI
            var biObj = new biHlObj.installObj(accountId, '', '',  ip,  ua);
            biHlBiz.HlInstallBi(biObj, project.serverId, accountData,  ip, function(err, data) {});
    
            if (userData && heroData) {
                taskBiz.setTaskValue(uwClient, userData.id, c_prop.cTaskTypeKey.clearHero, 1, function() {});
                // //累计拥有XX个英雄 累计拥有XX个SSR英雄
                // taskBiz.setTaskValue(uwClient,userData.id, c_prop.cTaskTypeKey.heroSkinNum,1,function(){});
                // if(t_hero[heroTempId].talismanstar == 3){
                //     taskBiz.setTaskValue(uwClient,userData.id,c_prop.cTaskTypeKey.heroSkinSSRNum, 1,function(){});
                // }
                //勋章成就  解锁职业
                userBiz.setMedalValue(uwClient, userData.id, c_prop.medalLootTypeKey.clearHero, 1, function() {});
                //勋章成就  解锁角色(职业的皮肤)
                // userBiz.setMedalValue(uwClient, userData.id, c_prop.medalLootTypeKey.clearHeroSkin, 1, function(){});
                //玩家首次登录游戏
                //console.log('wanjiashoucidenglu',userData.nickName);
                chatBiz.addSysData(108, [userData.nickName]);

                // 新注册玩家发邮件 channelId = 10008 
                var channelId = accountData.channelId;

                if (channelId == 10008) {
                    var mailItem = {};
                    mailItem[1809] = 1000;
                    mailItem[1807] = 10;
                    mailBiz.addByType(uwClient, userData.id, 91, [], mailItem, function() {});
                }
            }
        });
    })
};
 

/**
 * 获取第三方用户信息
 * @iface getThirdUserInfo
 * @args {}
 * @isWorker 1
 * @param args
 * @param session
 * @param next
 */
proto.hda = function(args, session, next) {
    var accountId = session.get(consts.session.accountId);
    //console.error("accountId:", accountId);
    sdkBiz.getSdkData(accountId, function(err, accountData) {
        if (err) return next(null, wrapResult(err));
        var sdkData = accountData.sdkData;
        if (sdkData && sdkData.nickname && sdkData.avatar && sdkData.is_real) {
            delete(sdkData.id);
            delete(sdkData.channelid);
            delete(sdkData.open_id);
            return next(null, wrapResult(null, sdkData, dsNameConsts.sdkData));
        }
        return next(null, wrapResult(null, null));
    });
};


var _handleLogin = function(session, data, next) {

    var accountData = data[0],
        userData = data[1],
        handleData = data[2],
        otherData = data[3];
    var rechargeData = otherData[0],
        copyProgressList = otherData[1],
        heroList = otherData[2],
        pkOut = otherData[3],
        lottery = otherData[4],
        task = otherData[5],
        arena = otherData[6],
        lootTypeArr = otherData[7],
        offLineData = handleData[0];

    _initSession(session, accountData, userData, function() {
        var loginData = new ds.LoginData();
        loginData.user = userData;
        loginData.rechargeData = rechargeData;
        loginData.copyProgressList = copyProgressList;
        loginData.heroList = heroList;
        loginData.pkOut = pkOut;
        loginData.lottery = lottery;
        loginData.task = task;
        loginData.offLineData = offLineData;
        loginData.arenaData = arena;
        loginData.lootTypeArr = lootTypeArr;
        //记录登陆次数
        gameRecordSerial.add(userData.id, function(cb1) {
            gameRecordBiz.setLoginCount(uwClient, userData.id, cb1);
        });

        userBiz.nobleLogin(uwClient, userData.id);

        // BI
        var serverId = session.get(consts.session.serverIndexId);
        var biObj = new biHlObj.dauObj(userData.accountId, userData.id, session.get(consts.session.ip), session.get(consts.session.ua));
        biHlBiz.HlDauBi(biObj, serverId, userData.id, accountData, biObj.ip, function(err, data) {});

        // OSS
        var channelId = userData.channelId;
        var sdkChannelId = userData.sdkChannelId;
        var oObj = new ossObj.ossLogin(userData.id, userData.nickName, userData.lvl, channelId, sdkChannelId);
        ossBiz.WriteOss(oObj);

        taskBiz.setTaskValue(uwClient, userData.id, c_prop.cTaskTypeKey.loginGame, 0, function() {});
        activityBiz.recordLachelFitnessValue(uwClient,userData.id, c_prop.lachelActTaskTypeKey.loginNum, 1, null, function(){});
        taskBiz.setEntrustTaskValue(uwClient, userData.id, c_prop.entrustTaskTypeKey.loginNum, g_server.betweenOpenDateDays() + 1, function() {});
        // _remoteAddUser(session, userData, accountData,  function( err,data){
        //     if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, loginData, dsNameConsts.LoginData));
        //});
    });

};


/**
 * --------------------------------------------------局部方法-------------------------------------------------------------------
 */

var _isPomeloReady = function() {
    // 本地部署以 mainApp.js 直接跑 http，没有 pomelo app；此时只能走 http session 分支
    return !!(pomelo.app && pomelo.app.get);
};

var _initSession = function(session, accountData, userData, cb) {
    if (g_common.appIsHttp || !_isPomeloReady()) {
        session.set(consts.session.accountId, accountData.id);
        session.set(consts.session.serverIndexId, userData.serverIndexId);
        session.set(consts.session.isGM, accountData.status == consts.accountStatus.gm ? 1 : 0);
        sessionManager.bindUid(accountData.id, session.id, userData.serverIndexId);
        session.set(consts.session.userId, userData.id);
        cb();
    } else {
        _checkHasLogin(session, accountData.id, function() {
            //session.frontendId
            var areaId = dispatchUtils.getArea().id;
            var ip = session.__session__.__socket__.remoteAddress.ip;
            _initLoginSession(session, accountData.id, userData.id, 0, areaId, ip, function(err, data) {
                if (err) return cb(err);
                cb();
            });
        });
    }
};

/**
 * 判断是否已经登录，如果已经登录则踢出在线的账号
 * @param session
 * @param uid
 * @param cb
 * @returns {*}
 */
var _checkHasLogin = function(session, uid, cb) {
    if (!_isPomeloReady()) return cb();
    var sessionService = pomelo.app.get('sessionService');
    var u = sessionService.getByUid(uid);
    if (!u) return cb();
    sessionService.kick(uid, function(err) {
        cb();
    });
};

/**
 * 初始化session,如果没有创建账号，则在创建账号的时候初始化userId
 * @param session
 * @param accountId
 * @param userId
 * @param serverId
 * @param areaId
 * @param ip
 * @param cb
 */
var _initLoginSession = function(session, accountId, userId, serverId, areaId, ip, cb) {

    session.bind(accountId);
    session.set(consts.session.accountId, accountId);
    session.set(consts.session.serverId, serverId);
    session.set(consts.session.ip, ip);

    session.set(consts.session.areaId, areaId);
    if (userId) {
        session.set(consts.session.userId, userId);
    }
    session.on('closed', _onUserLeave);
    session.pushAll(cb);
};

var _remoteAddUser = function(session, userData, accountData, cb) {
    if (g_common.appIsHttp) return cb();
    var ip = session.__session__.__socket__.remoteAddress.ip;
    var uData = new UserData();
    uData.id = userData.id;
    uData.sid = session.frontendId; //
    uData.aid = accountData.id; //账号id
    uData.loginTime = Date.now();
    uData.ip = ip; //ip

    if (!_isPomeloReady()) return cb();
    pomelo.app.rpc.a.userRemote.addUser(session, uData, function(err, data) {
        if (err) return cb(err);
        cb();
    });
};


/**
 * 断开链接时，会调用下面的代码
 * @param session
 * @param reason
 */
var _onUserLeave = function(session, reason) {
    if (!session || !session.uid) {
        return;
    }
    var userId = session.get(consts.session.userId);
    if (!userId) return;
    if (!_isPomeloReady()) return;
    pomelo.app.rpc.a.userRemote.removeUser(session, userId, function() {

    });
};