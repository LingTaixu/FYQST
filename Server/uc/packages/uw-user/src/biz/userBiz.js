/**
 * Created by Administrator on 2014/5/9.
 */
var uwData = require("uw-data");
var c_game = uwData.c_game;
var c_lvl = uwData.c_lvl;
var c_hero = uwData.c_hero;
var c_genuineQi = uwData.c_genuineQi;
var c_demonLotus = uwData.c_demonLotus;
var t_itemLogic = uwData.t_itemLogic;
var t_collector = uwData.t_collector;
var t_itemAttribute = uwData.t_itemAttribute;
var c_prop = uwData.c_prop;
var c_vip = uwData.c_vip;
var c_open = uwData.c_open;
var c_reward = uwData.c_reward;
var c_task = uwData.c_task;
var t_talismanSkill = uwData.t_talismanSkill;
var t_copy = uwData.t_copy;
var t_item = uwData.t_item;
var t_copyLoot = uwData.t_copyLoot;
var t_monster = uwData.t_monster;
var t_medal = uwData.t_medal;
var t_medalLvl = uwData.t_medalLvl;
var c_bossOther = uwData.c_bossOther;
var c_infiniteMaze = uwData.c_infiniteMaze;
//var c_giftPack = uwData.c_giftPack;
var t_heroStar = uwData.t_heroStar;
var t_hero = uwData.t_hero;
var t_elfWaking = uwData.t_elfWaking;
var t_elfWakingLvl = uwData.t_elfWakingLvl;
var formula = require("uw-formula");
var consts = uwData.consts;
var c_msgCode = uwData.c_msgCode;
var UserEntity = require('uw-entity').UserEntity;
var project = require('uw-config').project;
var async = require("async");
var getMsg = require("uw-utils").msgFunc(__filename);
var commonUtils = require("uw-utils").commonUtils;
var propUtils = require("uw-utils").propUtils;
var shopBiz = require("uw-shop").shopBiz;
var mainClient = require("uw-db").mainClient;
var loginClient = require("uw-db").loginClient;
var taskBiz = require("uw-task").taskBiz;
var g_chat = require("uw-global").g_chat;
var g_data = require("uw-global").g_data;
var g_boss = require("uw-global").g_boss;
var g_buff = require("uw-global").g_buff;
var g_guild = require("uw-global").g_guild;
var g_lootConfig = require("uw-global").g_lootConfig;
var g_fakeData = require("uw-global").g_fakeData;
var g_cache = require("uw-global").g_cache;
var ds = require("uw-ds").ds;
var exports = module.exports;
var refreshUtils = require("uw-utils").refreshUtils;
var t_medalHelp = uwData.t_medalHelp;
var biHlBiz = require("uw-log").biHlBiz;
var biHlObj = require("uw-log").biHlObj;
var ossObj = require("uw-log").ossObj;
var ossBiz = require("uw-log").ossBiz;
var sdkBiz = require("uw-sdk").sdkBiz;
var g_hybridData = require("uw-global").g_hybridData;
var g_cache = require("uw-global").g_cache;
var uwClient = require("uw-db").uwClient;
var serverUtils = require("uw-utils").serverUtils;

var userDao = null;
var userUtils = null;
var rankBiz = null;
var accountBiz = null;
var accountDao = null;
var mailBiz = null;
var heroBiz = null;
var copyBiz = null;
var pkOutDao = null;
var rechargeBiz = null;
var copyProgressDao = null;
var heroDao = null;
var heroPropHelper = null;
var lotteryDao = null;
var taskDao = null;
var itemBiz = null;
var arenaDao = null;
var serverInfoDao = null;
var guildPersonalBiz = null;
var guildBiz = null;
//var bonusBiz = null;
var bossBiz = null;
var chatBiz = null;
var fightUtils = null;
var guildPersonalDao = null;
var demonLotusDao = null;
var treasureBiz = null;
var medalSerial = null;
var pkOutBiz = null;
var taskBiz = null;
var reissueBiz = null;
var giftRefreshHour = 21;
var activityBiz = null;
var bossUtils = null;
var battlesGroupBiz = null;
var checkRequire = function() {
    userDao = userDao || require("uw-user").userDao;
    userUtils = userUtils || require("uw-user").userUtils;
    rankBiz = rankBiz || require("uw-rank").rankBiz;
    accountBiz = accountBiz || require("uw-account").accountBiz;
    accountDao = accountDao || require("uw-account").accountDao;
    mailBiz = mailBiz || require("uw-mail").mailBiz;
    heroBiz = heroBiz || require("uw-hero").heroBiz;
    copyBiz = copyBiz || require("uw-copy").copyBiz;
    pkOutBiz = pkOutBiz || require("uw-pkOut").pkOutBiz;
    pkOutDao = pkOutDao || require("uw-pkOut").pkOutDao;
    rechargeBiz = rechargeBiz || require("uw-recharge").rechargeBiz;
    heroDao = heroDao || require("uw-hero").heroDao;
    heroPropHelper = heroPropHelper || require('uw-hero').heroPropHelper;
    copyProgressDao = copyProgressDao || require('uw-copy').copyProgressDao;
    lotteryDao = lotteryDao || require("uw-lottery").lotteryDao;
    taskDao = taskDao || require("uw-task").taskDao;
    taskBiz = taskBiz || require("uw-task").taskBiz;
    itemBiz = itemBiz || require("uw-item").itemBiz;
    arenaDao = arenaDao || require("uw-arena").arenaDao;
    serverInfoDao = serverInfoDao || require("uw-server-info").serverInfoDao;
    guildPersonalBiz = guildPersonalBiz || require("uw-guild").guildPersonalBiz;
    guildBiz = guildBiz || require("uw-guild").guildBiz;
    //bonusBiz = bonusBiz || require("uw-bonus-share").bonusBiz;
    bossBiz = bossBiz || require("uw-boss").bossBiz;
    chatBiz = chatBiz || require("uw-chat").chatBiz;
    fightUtils = fightUtils || require("uw-fight").fightUtils;
    guildPersonalDao = guildPersonalDao || require("uw-guild").guildPersonalDao;
    demonLotusDao = demonLotusDao || require("uw-demon-lotus").demonLotusDao;
    treasureBiz = treasureBiz || require("uw-treasure").treasureBiz;
    medalSerial = medalSerial || require('uw-serial').medalSerial;
    reissueBiz = reissueBiz || require('uw-activity').reissueBiz;
    activityBiz = activityBiz || require("uw-activity").activityBiz;
    bossUtils = bossUtils || require("uw-boss").bossUtils;
    battlesGroupBiz = battlesGroupBiz || require("uw-battles-group").battlesGroupBiz;
};

Number.tempId2Job = function(tempId) {
    return tempId.toString()[0] * 1;
};
/**
 * 获取用户初始信息
 * @param client
 * @param accountId
 * @param loginKey
 * @param serverIndexId
 * @param cb
 */
exports.getInitData = function(client, accountId, loginKey, serverIndexId, opt, cb) {
    checkRequire();  
    accountDao.select(loginClient, { id: accountId },   function(err, accountData) {
        if (err) return cb(err); 
         //   userData = data[1];
        //韩国版防沉迷
        var needKick = _isKrNeedKick(accountData);
        if (needKick) return cb(getMsg(c_msgCode.krLoginLimit));

        if (!accountData || accountData.loginKey.indexOf(loginKey) <= -1) return cb(getMsg(c_msgCode.accountValFail)); //账号验证出错
        if (accountData.status == consts.accountStatus.lock || accountData.status == consts.accountStatus.lockDevice) return cb(getMsg(c_msgCode.accountLockout)); //

         async.parallel([
                function(cb1){
                    // 重新登录先取内存
                    var gamePlayer = g_cache.getGamePlayerInCacheByAccountId(accountId);
                    if(gamePlayer){
                        //console.error("gamePlayer in in cache", accountId);
                        gamePlayer.reuse();
                        return cb1(null,gamePlayer.userData);
                    }else{
                        userDao.select(client, { accountId: accountId, serverIndexId: serverIndexId }, cb1);
                    }
                }
            ], function(err, data){
                if (err) return cb(err);
                var userData = data[0];
                if (!userData) return cb(null, [accountData]);

                userUtils.fixUserData(userData);
                userData.exData[c_prop.userExDataKey.loginIP] = opt.ip;
                userData.exData[c_prop.userExDataKey.uaInfo] = opt.ua;

                //console.log("userBiz.getInitData:", opt);
                serverInfoDao.select(loginClient, { serverId: userData.serverId }, function(err, serverData) {
                    if (!serverData || serverData.status == consts.serverStatus.closed) return cb(getMsg(c_msgCode.serverMaintain)); //服务器维护中...
                    accountData.exData[c_prop.accountExDataKey.lastLoginServer] = userData.serverId;
                    var updateAcc = {
                        exData: accountData.exData
                    };
                    accountDao.update(loginClient, updateAcc, { id: accountId }, function(err, up) {
                        console.log(err);
                    });
                    _handleAndGetData(client, accountData, userData, cb);
                });
                
        });

    });
};

//处理并且获得数据
var _handleAndGetData = function(client, accountData, userData, cb) {
    _handleData(client, userData, function(err, handleDataX) {
        if (err) return cb(err);
        _getOtherData(client, accountData, userData, function(err, otherData) {
            if (err) return cb(err);
            cb(null, [accountData, otherData[2], otherData[1], otherData[0]]);
        });
    });
};

//处理数据
var _handleData = function(client, userData, cb) {
    async.series([
        function(cb1) {
            //实际上是创建普通副本
            copyBiz.getInfo(client, userData.id, c_prop.copyTypeKey.normal, cb1);
        },
        // function(cb1){
        //     //
        //    exports.offlineEarnings(client,userData,cb1);
        // },
        function(cb1) {
            guildPersonalBiz.initGuildIdToGlobal(client, userData.id, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        //var offLineData = data[1];
        //cb(null,[offLineData]);
        cb(null, null);
    });
};
//获取其他数据
var _getOtherData = function(client, accountData, userData, cb) {
    var userId = userData.id;
    async.parallel([
        function(cb1) {
            rechargeBiz.getInfo(client, userId, cb1);
        },
        /*function(cb1){
         arenaRecordBiz.getHasNotRead(client,userId,cb1);
         },
         function(cb1){
         arenaRecordBiz.getHasNotReadArena(client,userId,cb1);
         },*/
        function(cb1) {
            copyProgressDao.list(client, { userId: userId }, cb1);
        },
        function(cb1) {
            let gamePlayer = g_cache.getGamePlayerInCache(userData.id);
            if(gamePlayer){
                return cb1(null, gamePlayer.heroListData);
            }else{
                heroBiz.calAndGetHeroList(client, userData, cb1);
            }
        },
        function(cb1) {
            pkOutDao.select(client, { userId: userId }, cb1);
        },
        function(cb1) {
            lotteryDao.select(client, { userId: userId }, cb1);
        },
        function(cb1) {
            let gamePlayer = g_cache.getGamePlayerInCache(userData.id);
            if(gamePlayer){
                return cb1(null, gamePlayer.taskData);
            }else{
                taskBiz.getTaskInfoForLogin(client, userId, cb1);
            }
            //taskDao.select(client,{userId:userId},cb1);
        },
        function(cb1) {
            arenaDao.select(client, { userId: userId }, cb1);
        },
        function(cb1) {
            guildPersonalDao.selectCols(client, "guildId", { userId: userId }, cb1);
        },
        function(cb1) {
            demonLotusDao.selectCols(client, "advanceLvl", { userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var rechargeData = data[0],
            copyProgressList = data[1],
            heroList = data[2],
            pkOut = data[3],
            lottery = data[4],
            task = data[5],
            arena = data[6],
            gp = data[7],
            demonLotusData = data[8];

        var gamePlayer = g_cache.getGamePlayerInCache(userData.id);
        if (!gamePlayer) {
            gamePlayer = g_cache.initGamePlayer(userData, accountData, task, heroList);
        } else {
            userData = gamePlayer.userData || userData;
            heroList = gamePlayer.heroListData || heroList;
            task = gamePlayer.taskData || task;
            gamePlayer.reuse();
        }

        gamePlayer.accountData = accountData; // 取最新的
        _handleSdk(client, gamePlayer);

        var guildId = (gp && gp.guildId) ? gp.guildId : 0; //可能没有加过公会
        if (guildId) {
            var guildData = g_guild.getGuild(guildId);
            if (guildData) {
                guildData.lastLgTime = new Date();
                g_guild.setGuild(guildData.id, guildData);
            }
        }
        g_data.setGuildId(userId, guildId);
        // if(userData.isKing){  // 去掉王城霸主的通知
        //     if(userData.lastUpdateTime.getSecondsBetween(new Date())>c_game.king[5]){
        //         chatBiz.addSysData(51,[userData.nickName]);
        //     }
        // }
        g_hybridData.getRankFirst(c_prop.rankTypeKey.combatRank, function(err, rankData) {
            // if(err) return cb(err); 
            if (rankData && userId == rankData.userId) {
                //console.log(userData.serverId + "服战力榜第一  "+userData.nickName+"  大佬降临奥多姆大陆，非战斗人员赶紧撤离！！");
                chatBiz.addSysData(1000, [userData.serverId, userData.nickName]);
            }
        });
        //修正名字，有些名字是空的或者因为字符问题为空
        if (!userData.nickName || userData.nickName == ("s" + userData.serverIndexId + ".")) {
            userData.nickName = "s" + userData.serverIndexId + "." + userData.id;
        }
        if (!userData.exData[c_prop.userExDataKey.genuineQi] && c_genuineQi[userData.lvl]) {
            userData.exData[c_prop.userExDataKey.genuineQi] = [new Date()];
            var genuLimit = 0;
            var advanceLvl = 0;
            if (demonLotusData) advanceLvl = demonLotusData.advanceLvl;
            var genqiAccLimit = parseInt(c_demonLotus[advanceLvl].genqiAccLimit);
            genuLimit = parseInt(c_genuineQi[userData.lvl].genuLimit) + genqiAccLimit; //真气上限
            userData.genuineQi = genuLimit;
        }
        // _recordSevenLoginActivityDays(userData);
        _recordLoginDays(userData);
        reissueBiz.reissueActivityReward(client, userData);
        userUtils.synPataPower(userData); //登录时算下爬塔体力 20180810
        // 离线经验
        exports.offlineEarnings(client, userData, heroList, function(err, offLineData) {

            userData.lastUpdateTime = new Date();
            gamePlayer.setUserDataDirty();
            //userDao.update(client,userData,{id:userId},function(err,data){ 
            // if (err) return cb(err);
            g_data.setUserLvl(userId, userData.lvl);
            //g_data.setAccountId(userId, userData.accountId);
            g_data.setPreLootTime(userId, null);
            bossBiz.exitAllFight(client, userId, function() {});
            var lootTypeArr = g_lootConfig.getLootTypeArr();
            cb(null, [
                [rechargeData, copyProgressList, heroList, pkOut, lottery, task, arena, lootTypeArr],
                [offLineData],
                userData
            ]);
            // });

        });
    });
};


/**
 * 获取WS 角色信息
 * @param client
 * @param accountId
 * @param loginKey
 * @param serverIndexId
 * @param cb
 */
exports.getWSRoleData = function(client, accountId, loginKey, serverIndexId, cb) {
    checkRequire();
    // async.parallel([
    //     function(cb1){
    //         accountDao.select(loginClient,{id:accountId},cb1);
    //     },
    //     function(cb1){
    //         userDao.select(client,{accountId:accountId,serverIndexId:serverIndexId},cb1);
    //     }
    // ],function(err,data){

    userDao.selectCols(client, "id", { accountId: accountId, serverIndexId: serverIndexId }, function(err, wsUserData) {
        if (err) return ("账号验证出错");
        g_cache.getGamePlayer(client, wsUserData.id, function(err, gamePlayer) {
            if (err) return cb(err);
            var accountData = gamePlayer.accountData,
                userData = gamePlayer.userData;
            //console.log("getWSRoleData:", accountId, loginKey, serverIndexId, userData);
            if (!accountData || accountData.loginKey.indexOf(loginKey) <= -1) return cb("账号验证出错");
            if (!userData) return cb(null, []);
            if (accountData.status == consts.accountStatus.lock || accountData.status == consts.accountStatus.lockDevice) return cb(getMsg(c_msgCode.accountLockout)); //

            var heroData = gamePlayer.getHeroByJob(userData.iconId);
            var upUserData = {
                id: userData.id,
                nickName: userData.nickName,
                lvl: userData.lvl,
                magicLvl: userData.magicLvl,
                iconId: userData.iconId,
                medalTitle: userData.medalTitle,
                achieveLvl: userData.achieveLvl,

                rebirthLvl: userData.rebirthLvl,
                noble: userData.noble
            };

            var oldTempId = heroData.tempId;
            heroData.tempId = userData.iconId; // 替换成icon的皮肤
            // locHero.propArr = heroPropHelper.calHeroProp(userData, locHero);
            // locHero.combat = heroPropHelper.calCombat(userData, locHero);
            var zsheroData = gamePlayer.getHeroByJob(1);
            var clientNeedEquipBag = userUtils.getClientNeedEquipBag(userData, zsheroData);
            // var clientNeedEquipBag = userUtils.filterOutAngelDemonEquipBag(userData.equipBag);
            var fightData = [userData.lvl, clientNeedEquipBag, userData.nickName, userData.isKing, userData.blueDiamond, userData.rebirthLvl, userData.medalTitle, userData.propertyData, userData.cup, userData.achieveLvl, userData.noble, userData.iconId, userData.buff, userData.magicLvl];

            cb(null, [upUserData, heroData, fightData]);
            heroData.tempId = oldTempId;

            // heroBiz.calAndGetHero(client,userData, userData.iconId, function(err, heroData){
            //     if (err) return cb(err);
            //     cb(null, [userData, heroData[0], heroData[1]])
            // });
        });
    });
};

exports.getWSRoleData2 = function(client, userId, cb) {
    checkRequire();

    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        var userData = gamePlayer.userData;
        var heroData = gamePlayer.getHeroByJob(userData.iconId);
        var upUserData = {
            id: userData.id,
            nickName: userData.nickName,
            lvl: userData.lvl,
            magicLvl: userData.magicLvl,
            iconId: userData.iconId,
            medalTitle: userData.medalTitle,
            achieveLvl: userData.achieveLvl,

            rebirthLvl: userData.rebirthLvl,
            noble: userData.noble
        };

        var oldTempId = heroData.tempId;
        heroData.tempId = userData.iconId; // 替换成icon的皮肤
        // locHero.propArr = heroPropHelper.calHeroProp(userData, locHero);
        // locHero.combat = heroPropHelper.calCombat(userData, locHero);
        // var clientNeedEquipBag = userUtils.filterOutAngelDemonEquipBag(userData.equipBag);
        var zsheroData = gamePlayer.getHeroByJob(1);
        var clientNeedEquipBag = userUtils.getClientNeedEquipBag(userData, zsheroData);
        var fightData = [userData.lvl, clientNeedEquipBag, userData.nickName, userData.isKing, userData.blueDiamond, userData.rebirthLvl, userData.medalTitle, userData.propertyData, userData.cup, userData.achieveLvl, userData.noble, userData.iconId, userData.buff, userData.magicLvl];

        cb(null, [upUserData, heroData, fightData]);
        heroData.tempId = oldTempId;
    });

    // userDao.select(client,{id:userId},function(err, userData){
    //     heroBiz.calAndGetHero(client,userData, userData.iconId, function(err, heroData){
    //         if (err) return cb(err);
    //         cb(null, [userData, heroData[0], heroData[1]])
    //     });  
    // });
};

/**
 * 获取WS 角色信息
 * @param client
 * @param accountId
 * @param loginKey
 * @param serverIndexId
 * @param cb
 */
exports.getFakeWSUserList = function(client, userId, num, cb) {
    checkRequire();
    // 获得id列表
    if (num > 50) num = 50;
    userDao.getUserDataList(client, userId, num, function(err, userList) {
        // map
        async.map(userList, function(userData, cb1) {
            // userData.equipBag = userData.equipBag || "{}";
            // userData.equipBag = JSON.parse(userData.equipBag);
            var upUserData = {
                id: userData.id,
                nickName: userData.nickName,
                lvl: userData.lvl,
                magicLvl: userData.magicLvl,
                iconId: userData.iconId,
                medalTitle: userData.medalTitle,
                achieveLvl: userData.achieveLvl,

                rebirthLvl: userData.rebirthLvl,
                noble: userData.noble
            };
            heroBiz.calAndGetHero(client, userData, userData.iconId, function(err, heroData) {
                if (err) return cb1(err);
                if (!heroData) return cb1(null, [upUserData]);
                return cb1(null, [upUserData, heroData[0], heroData[1]]);
            });

        }, function(err, wsUserList) {
            if (err) return cb(err);
            return cb(null, wsUserList);
        });
    })

};

//// 获得玩家在战斗服务器里的数据 ///
exports.getBattleUser = function(client, accountId, serverIndexId, loginKey, cb) {
    checkRequire();

    userDao.selectCols(client, "id", { accountId: accountId, serverIndexId: serverIndexId }, function(err, wsUserData) {
        if (err) return cb("账号验证出错");
        g_cache.getGamePlayer(client, wsUserData.id, function(err, gamePlayer) {
            if (err) return cb(err);
            var accountData = gamePlayer.accountData,
                userData = gamePlayer.userData;
            //console.log("getWSRoleData:", accountId, loginKey, serverIndexId, userData);
            if (!accountData || accountData.loginKey.indexOf(loginKey) <= -1) return cb("账号验证出错");
            if (!userData) return cb(null, []);
            if (accountData.status == consts.accountStatus.lock || accountData.status == consts.accountStatus.lockDevice) return cb(getMsg(c_msgCode.accountLockout)); //

            var upUserData = {
                id: userData.id,
                nickName: userData.nickName,
                lvl: userData.lvl,
                magicLvl: userData.magicLvl,
                iconId: userData.iconId,
                medalTitle: userData.medalTitle,
                achieveLvl: userData.achieveLvl,

                rebirthLvl: userData.rebirthLvl,
                noble: userData.noble
            };
            var exData = {};
            exData[c_prop.userExDataKey.HJBossData] = userData.exData[c_prop.userExDataKey.HJBossData];
            exData[c_prop.userExDataKey.wbHurtAward] = userData.exData[c_prop.userExDataKey.wbHurtAward];
            upUserData.exData = exData;

            heroBiz.getPkList(client, userData, function(err, showData) {
                guildBiz.getGuildSimpleInfo(client, userData.id, function(e1, guildData) {
                    // showData[2][1] = {};
                    // showData[2][1] = userUtils.filterOutAngelDemonEquipBag(showData[2][1]);
                    var zsheroData = gamePlayer.getHeroByJob(1);
                    var clientNeedEquipBag = userUtils.getClientNeedEquipBag(userData, zsheroData);
                    showData[2][1] = clientNeedEquipBag;
                    return cb(null, [upUserData, showData, guildData]);
                });
            });
        });
    });
};

//// 获得玩家在战斗服务器里的数据 ///
exports.getWsBattleRoleData = function(client, userId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var accountData = gamePlayer.accountData,
            userData = gamePlayer.userData;

        var upUserData = {
            id: userData.id,
            nickName: userData.nickName,
            lvl: userData.lvl,
            magicLvl: userData.magicLvl,
            iconId: userData.iconId,
            medalTitle: userData.medalTitle,
            achieveLvl: userData.achieveLvl,

            rebirthLvl: userData.rebirthLvl,
            noble: userData.noble
        };
        var exData = {};
        exData[c_prop.userExDataKey.HJBossData] = userData.exData[c_prop.userExDataKey.HJBossData];
        upUserData.exData = exData;
        heroBiz.getPkList(client, userData, function(err, showData) {
            guildBiz.getGuildSimpleInfo(client, userData.id, function(e1, guildData) {
                // showData[2][1] = {};
                // showData[2][1] = userUtils.filterOutAngelDemonEquipBag(showData[2][1]);
                var zsheroData = gamePlayer.getHeroByJob(1);
                var clientNeedEquipBag = userUtils.getClientNeedEquipBag(userData, zsheroData);
                showData[2][1] = clientNeedEquipBag;
                return cb(null, [upUserData, showData, guildData]);
            });
        });
    });
};



// // 是否为天命基金用户
// exports.isTMJZUser = function(client, userId, cb) {
//     checkRequire();
//     userDao.select(client, { id: userId }, function(err, userData) {
//         var receiveData = userData.activity[1083] || [];
//         //领取次数
//         var receiveCount = receiveData[0] || 0;

//         //已经领取过
//         if (receiveCount > 0) return cb(err, true);
//         return cb(err, false);
//     });
// }

exports.enterZhongLiBoss = function(client, userId, bossId, cb) {
    checkRequire();

    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb("no user");
        if (!_canEnterBoss(gamePlayer.userData, bossId)) {
            return cb("enter limited");
        }
        var userData = gamePlayer.userData;
        var reNum = userUtils.getZhongLiBossNum(userData);
        var enterItemNum = userData.bag[c_prop.spItemIdKey.zhongLiTessera] || 0;
        var costType = 0;
        if (reNum[0] > 0) {
            userUtils.costZhongLiBossNum(userData);
            costType = 1;
        } else {
            if (userData.bag[c_prop.spItemIdKey.zhongLiTessera] && userData.bag[c_prop.spItemIdKey.zhongLiTessera] > 0) {
                userUtils.delBag(userData, c_prop.spItemIdKey.zhongLiTessera, 1, c_prop.itemCostTypeKey.other);
                costType = 2;
            }
        }

        if (costType == 0) return cb(getMsg(c_msgCode.noFrequency)); //没有次数了

        var updateUser = {
            exData: userData.exData
        };
        // console.error('==============recordCarnivalValue===================',c_prop.carnivalTaskTypeKey.zhongLi);
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);

        // 打中立Boss
        guildBiz.checkGuildGift(client, userId, 2, 1, function(err, data) {});

        activityBiz.recordCarnivalValue(client, userId, c_prop.carnivalTaskTypeKey.zhongLi, 1, function() {});
        activityBiz.recordLachelFitnessValue(client, userId, c_prop.lachelActTaskTypeKey.zhongLiNum, 1, null, function() {});
        activityBiz.recordTurntableValue(client, userId, c_prop.turntableTypeKey.zhongLiNum, 1, null, function() {});
        taskBiz.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.zhongLiNum, 1, function() {});
        taskBiz.setTaskValue(client, userId, c_prop.cTaskTypeKey.enterZLBossNum, 1, function() {});

        var reData = new ds.ExUserData();
        reData.userData = updateUser;
        if (costType == 2) {
            reData.delBagItems = {};
            reData.delBagItems[c_prop.spItemIdKey.zhongLiTessera] = 1;
        }
        return cb(null, reData);
    });
};

exports.enterTianMingBoss = function(client, userId, bossId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb("no user");
        if (!_canEnterBoss(gamePlayer.userData, bossId)) {
            return cb("enter limited");
        }
        return cb(null, {});
    });
};

exports.enterHJBoss = function(client, userId, bossId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb("no user");

        //紧急委托任务   记录参与异界boss次数
        taskBiz.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.yijieNum, 1, function() {});

        if (!_canEnterBoss(gamePlayer.userData, bossId)) {
            return cb("enter limited");
        }

        // 是否为开服第3天（含) 以后

        return cb(null, {});
    });
};

exports.enterCSTianMingBoss = function(client, userId, bossId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb("no user");
        if (!_canEnterBoss(gamePlayer.userData, bossId)) {
            return cb("enter limited");
        }
        // 是否为开服第3天（含) 以后
        return cb(null, {});
    });
};

var _canEnterBoss = function(userData, bossId) {
    var c_bossOtherCfg = c_bossOther[bossId];
    if (!c_bossOtherCfg.cond) return true;
    for (var i = 0; i < c_bossOtherCfg.cond.length; i++) {
        var k = c_bossOtherCfg.cond[i][0];
        var v = c_bossOtherCfg.cond[i][1];
        if (k == 1) {
            if (userData.lvl < v) {
                return false;
            }
        } else if (k == 2) {
            // 公会等级
        } else if (k == 3) {
            if (!userUtils.isTMFundUser(userData)) {
                return false;
            }
        } else if (k == 4) {
            if (userData.rebirthLvl < v) {
                return false;
            }
        }
    }
    return true;
};

var _addHJBossChestNum = function(client, userId, groupType, cb) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(null);
        var userData = gamePlayer.userData;

        //紧急委托任务   记录异界boss夺宝次数
        taskBiz.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.yijieDuoBao, 1, function() {});
        activityBiz.recordTurntableValue(client, userId, c_prop.turntableTypeKey.yijieDuoBao, 1, null, function() {});

        userUtils.addHJBossChestNum(userData, groupType);
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.exdata);
        var updateUser = {
            exData: userData.exData
        };

        var reData = new ds.ExUserData();
        reData.userData = updateUser;
        return cb(null, reData);
    });
};

var _addHJBossOwnNum = function(client, userId, groupType, cb) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(null);
        var userData = gamePlayer.userData;
        userUtils.addHJBossOwnNum(userData, groupType);
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.exdata);

        var updateUser = {
            exData: userData.exData
        };
        var reData = new ds.ExUserData();
        reData.userData = updateUser;
        return cb(null, reData);
    });
};

exports.addHJBossNum = function(client, userId, type, groupType, cb) {
    console.error("addHJBossNum:", userId, type, groupType);
    checkRequire();
    if (type == 2) {
        _addHJBossChestNum(client, userId, groupType, cb);
    } else if (type == 1) {
        _addHJBossOwnNum(client, userId, groupType, cb);
    }
};

exports.killBoss = function(client, userId, userName, type, bossId, isOwner, cb) {
    console.error("killBoss:", userId, type, bossId);
    checkRequire();
    var mailId = 0;
    var awardItems = {};
    var awardArr = bossUtils.getBossOtherAwardItems(bossId);
    var ownerLootItems = []; //BOSS的归属者获得的所有奖励物品（包括屠龙远征活动掉落的物品）
    switch (type) {
        case 13: // 天命
            heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.tianMingNum, 1);
            if (isOwner) { //归属奖
                mailId = 74;
                awardItems = awardArr[1];
                ownerLootItems = awardArr[2].concat([]);
            } else { //参与奖
                mailId = 73;
                awardItems = awardArr[0];
            }
            break;
        case 14: // 中立
            heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.zhongLiNum, 1);
            guildBiz.guildGrown(client, userId, userName, 6, function(err, data) {
                if (err) return cb(err);
            });

            if (isOwner) {
                taskBiz.setTaskValue(client, userId, c_prop.cTaskTypeKey.killZLBossNum, 1, function() {});
                mailId = 76;
                awardItems = awardArr[1];
                ownerLootItems = awardArr[2].concat([]);
            } else {
                mailId = 75;
                awardItems = awardArr[0];
            }

            //是否在屠龙远征队活动期间内
            var killDragonAct = g_cache.getActivityDataByType_InTime(c_prop.activityTypeKey.killDragon);
            // console.error('is  in   killDragonAct ============');
            if (killDragonAct) {
                var killDragonLootItems = bossUtils.getBossOtherAwardItems_killDragonAct(bossId, isOwner);
                var getAcItems = killDragonLootItems[0];
                if (isOwner) {
                    ownerLootItems = ownerLootItems.concat(killDragonLootItems[1]);
                }

                // console.error('killDragonLootItems',killDragonLootItems);
                awardItems = propUtils.mergerProp(awardItems, getAcItems);
            }
            activityBiz.recordTurntableValue(client, userId, c_prop.turntableTypeKey.zhongLiAscriptionNum, 1, null, function() {});
            // console.error('awardItems',awardItems);
            break;
        case 16: // 异界
            g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
                if (err) return cb(err);
                userUtils.checkHeroEntranceTask(gamePlayer, c_game.heroTask[2], 1);
            });
            if (isOwner) { //归属奖
                mailId = 93;
                awardItems = awardArr[1];
                ownerLootItems = awardArr[2].concat([]);
            }
            activityBiz.recordTurntableValue(client, userId, c_prop.turntableTypeKey.yijieNum, 1, null, function() {});
            break;
        case 17: //天命(跨服)
            if (isOwner) { //归属奖
                mailId = 74;
                awardItems = awardArr[1];
                ownerLootItems = awardArr[2].concat([]);
            } else { //参与奖
                mailId = 73;
                awardItems = awardArr[0];
            }
            break;
        case 18: //世界BOSS(跨服) 长连已处理
            break;
        default:
            return cb("killBoss:unknown msg type : " + type);
    }
    if (mailId && awardItems && JSON.stringify(awardItems) != "{}") {
        exports.noticeAddItem(client, userId, type, awardItems, bossId, function(err, data) {});
        mailBiz.addByType(client, userId, mailId, [t_monster[bossId].name], awardItems, function(err, data) {});
    }
    if (isOwner) {
        //console.error('userBiz  killBoss ownerLootItems',ownerLootItems);
        return cb(null, ownerLootItems);
    }
    return cb(null);
};

exports.noticeAddItem = function(client, userId, type, items, bossId, cb) {
    checkRequire();
    //console.log("noticeAddItem:", userId, type, items);
    g_cache.getGamePlayer_UserData(client, userId, function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData;

        var itemIdArr = Object.keys(items);
        //屏蔽深渊门票、深渊卡箱、深渊魔石、传承精华、史莱姆糖果、A型充电宝、S型充电宝
        var ignoreItemIds = ['2007', '2015', '950', '39', '56', '54', '53'];
        var ignoreItemIds2 = ['2007', '2015', '950', '39', '56', '54', '53'];
        itemIdArr.forEach(function(itemId) {
            if (type == 13) { //天命
                if (ignoreItemIds.indexOf(itemId) < 0) {
                    chatBiz.addSysData(146, [userData.nickName, t_item[itemId].color, t_item[itemId].name]);
                    chatBiz.addSysData(152, [userData.nickName, t_item[itemId].color, t_item[itemId].name]);
                }
                if (ignoreItemIds2.indexOf(itemId) < 0) {
                    //掉落记录
                    copyBiz.addCopyLootRecord(client, userId, userData.nickName, c_prop.copyTypeKey.tianMing, bossId, itemId);
                }
            } else if (type == 14) { // 中立
                if (ignoreItemIds.indexOf(itemId) < 0) {
                    chatBiz.addSysData(147, [userData.nickName, t_item[itemId].color, t_item[itemId].name]);
                    chatBiz.addSysData(153, [userData.nickName, t_item[itemId].color, t_item[itemId].name]);
                }
                if (ignoreItemIds2.indexOf(itemId) < 0) {
                    //掉落记录
                    copyBiz.addCopyLootRecord(client, userId, userData.nickName, c_prop.copyTypeKey.zhongLi, bossId, itemId);
                }
            } else if (type == 16) { // 幻境
                if (ignoreItemIds.indexOf(itemId) < 0) {
                    chatBiz.addSysData(182, [userData.nickName, t_item[itemId].color, t_item[itemId].name]);
                    chatBiz.addSysData(183, [userData.nickName, t_item[itemId].color, t_item[itemId].name]);
                    //异界boss掉落极品道具，在跨服频道显示系统消息
                    //只发 觉醒·艾依尔、觉醒·温蒂尔、觉醒·贝露丹迪、盟约之翼、誓言之心、S级人物果实 的跨服通知
                    var ignoreItemIds3 = ['100242', '100243', '100244', '2034', '2043', '5004'];
                    if (ignoreItemIds3.indexOf(itemId) >= 0) {
                        chatBiz.addSysData(188, [userData.nickName, t_item[itemId].color, t_item[itemId].name]);
                    }
                }
                if (ignoreItemIds2.indexOf(itemId) < 0) {
                    //掉落记录
                    copyBiz.addCopyLootRecord(client, userId, userData.nickName, c_prop.copyTypeKey.yijie, bossId, itemId);
                }
            }
        });

        return cb(null, null);

    });
};

// 获得玩家信息
exports.getUserInfo = function(client, userId, cb) {
    checkRequire();
    g_cache.getGamePlayer_UserData(client, userId, function(err, data) {
        if (err) return cb(null);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData;
        var updateUserData = {
            id: userId,
            nickName: gamePlayer.userData.nickName
        };

        return cb(null, updateUserData);
    });
};

// 玩家参加女神活动 
exports.enterGodness = function(client, userId, cb) {
    checkRequire();

    heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.goddessNum, 1);
    return cb(null, null);
};

// cost
// exports.costDiamond = function(client, userId, diamond, cb){

//    userDao.select(client, { id: userId }, function(err, userData) {
//         if (err) return cb(err);

//         if (userData.diamond < diamond) return cb(getMsg(c_msgCode.noDiamond));//钻石不足;

//         //钻石扣除
//         userUtils.reduceDiamond(userData, diamond, consts.diamondConsumeType.user_7, "");

//         //需要更新的数据
//         var updateData = {
//             diamond: userData.diamond,
//             giveDiamond: userData.giveDiamond,
//             buyDiamond: userData.buyDiamond 
//         };
//         userDao.update(client, updateData, { id: userId }, function(err, data) {
//             if (err) return cb(err);
//             console.log("userBiz.costDiamond return:", updateData);
//             cb(null, [updateData, diamond]);
//         });
//     }); 
// }

/**
 * 获取用户布阵信息
 * @param client
 * @param userId
 * @param cb
 */
exports.getHeroEmbattle = function(client, userId, cb) {
    checkRequire();
    //userDao.select(client,{id:userId},function(err,userData){
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var heroEmbattle = userData.heroEmbattle;
        cb(null, heroEmbattle);
    });
};

/**
 * 保存用户布阵信息
 * @param client
 * @param userId
 * @param HeroEmbattle
 * @param cb
 */
exports.setHeroEmbattle = function(client, userId, heroEmbattle, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        userData.heroEmbattle = heroEmbattle;
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        cb(null, null);
    });

    // userDao.update(client,{heroEmbattle:heroEmbattle},{id:userId},function(err,data){
    //     if(err) return cb(err);
    //     cb(null,heroEmbattle);
    // });
};

var _getUniqueNickName = function(client, name, newName, index, cb) {
    var index = index || 1;
    if (index > 10) {
        newName = name + '' + (new Date().getTime()) % 10000;
        console.error('createUser---sameUserName---newName==>', newName);
        return cb(null, newName);
    }
    userDao.select(client, { nickName: newName }, function(err, data) {
        if (err) return cb(err);
        if (!data) return cb(null, newName);
        newName = name + '' + index;
        console.error('createUser---sameUserName---newName==>', newName);
        index++;
        _getUniqueNickName(client, name, newName, index, cb);
    });
}
/**
 *
 * @param client
 * @param accountId
 * @param name
 * @param heroTempId
 * @param sex
 * @param serverIndexId
 * @param cb
 */
exports.createUser = function(client, accountId, name, heroTempId, sex, serverIndexId, shareKey, opt, cb) {
    checkRequire();
    if (!accountId) return cb(getMsg(c_msgCode.accountEmpty)); //账号值为空
    async.series([
        function(cb1) {
            userDao.select(client, { accountId: accountId, serverIndexId: serverIndexId }, cb1);
        },
        function(cb1) {
            accountDao.select(loginClient, { id: accountId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var userData = data[0],
            accountData = data[1];
        if (userData) return cb(null, [userData, null]);
        if (name.indexOf(" ") >= 0) return cb(getMsg(c_msgCode.roleNotBlank)); //角色名不能包含空格
        if (name.indexOf("\n") >= 0 || name.indexOf("\\n") >= 0 || name.indexOf("\r") >= 0 || name.indexOf("\\r") >= 0 || name.indexOf("\"") >= 0) return cb(getMsg(c_msgCode.roleNotEnter)); //角色名不能包含回车换行或双引号
        name = name.replace("\\n", "");
        name = name.replace("\n", "");
        name = name.replace("\\r", "");
        name = name.replace("\r", "");
        name = name.replace("\"", "");
        name = "s" + serverIndexId + "." + name;
        _getUniqueNickName(client, name, name, 1, function(err, name) {
            // userDao.select(client, { nickName: name }, function(err, data) {
            if (err) return cb(err);
            // if (data) return cb(getMsg(c_msgCode.sameUserName)); //角色名已经被占用
            //如果不存在则创建一个用户
            var userEntity = new UserEntity();

            //userEntity.signName = _getRandomSignName();
            /** 账号id **/
            userEntity.accountId = accountId;
            /*账号id*/
            /** 昵称 **/
            userEntity.nickName = name;
            /*昵称*/
            //userEntity.nickName = "s" +serverIndexId +"."+ name;/*昵称*/
            /** 金币 **/
            userEntity.gold = 0;
            /*金币*/
            /** 总钻石 **/
            //todo 临时999999
            userEntity.diamond = 0;
            /*钻石*/
            /** 绑定钻石 **/
            userEntity.giveDiamond = 0;
            /*绑定钻石，即送的钻石*/
            /** 非绑定钻石 **/
            userEntity.buyDiamond = 0;
            /*非绑定钻石，即购买的钻石*/
            /** 背包（只存放静态物品） **/
            userEntity.bag = { "2003": 1 };
            /*背包(只存放静态物品，格式：{&quot;物品id&quot;:数量,&quot;物品id&quot;:数量.............})*/
            /** 等级 **/
            userEntity.lvl = 1;
            /*等级(不同于英雄等级)*/
            /** 经验 **/

            userEntity.expc = 0;
            /*经验*/
            /** 体力 **/
            userEntity.strength = c_game.power[0];
            /*体力*/
            /** VIP等级 **/
            userEntity.vip = 0;
            /*VIP等级*/
            /** VIP积分 **/
            userEntity.vipScore = 0;
            /*VIP积分*/
            /** 荣誉值 **/
            userEntity.honor = 0;
            /*荣誉值*/

            /** 扩展数据 **/
            userEntity.exData = {};
            /*刷新数据
                         {key:value}
                         具体看c_prop的userExData*/
            /** 战力 **/
            userEntity.combat = 0;
            /*战力*/
            /** 成就数据 **/
            userEntity.honorData = null;
            /*成就数据
                         {&quot;id&quot;:[是否完成，是否领取],&quot;id&quot;:[是否完成，是否领取],..........}*/

            /** 刷新次数数据 **/
            userEntity.counts = null;
            /*刷新数据

                         /** 刷新次数数据 **/
            userEntity.countsRefreshTime = null;
            /*刷新数据

                         {key:value}
                         具体看c_prop的userRefreshCount*/
            /** 头像 **/
            userEntity.iconId = heroTempId; //getIconId(heroTempId,sex) ;/**/
            /** 签到数据 **/
            userEntity.sign = [];
            /*签到数据,[签到次数,最近一次签到时间]*/
            /** 活动数据 **/
            userEntity.activity = {};
            userEntity.lastUpdateTime = new Date();
            userEntity.createTime = new Date();
            userEntity.sdkChannelId = accountData.sdkChannelId;
            userEntity.channelId = accountData.channelId;

            userEntity.serverId = project.serverId;
            userEntity.serverIndexId = serverIndexId;
            userEntity.equipBag = {};
            userEntity.medalData = {};
            userEntity.propertyData = {};
            userEntity.heroData = {};
            // userEntity.heroData[heroTempId] = { t:Math.floor(Date.now()/1000)};
            //exports.initHeroStar(userEntity, heroTempId, function() {});
            userEntity.buff = {};
            userEntity.cybLvl = 1;
            userEntity.cybExp = 0;
            userEntity.medalExData = {};
            userEntity.redPointData = {};
            userEntity.cup = 0;
            userEntity.capsuleData = {};
            userEntity.loginDays = [];
            userEntity.employData = {};
            userEntity.noble = [];
            userEntity.magicLvl = 0;

            userDao.insert(client, userEntity, function(err, data) {
                if (err) return cb(err);
                userEntity.id = data.insertId;
                //lvl ,equipBag, id,rebirthLvl,medalData,isKing,propertyData

                async.parallel([
                    function(cb1) {
                        heroBiz.createByTempId(client, userEntity, heroTempId, sex, 0, cb1);
                    },
                    function(cb1) {
                        // 初始化pkOut
                        pkOutBiz.initPkOutEnemy(client, userEntity.id, cb1);
                    },
                    function(cb1) {
                        taskBiz.getTaskInfoForLogin(client, userEntity.id, cb1);
                    }
                ], function(err, data) {
                    if (err) return cb(err);
                    var heroData = data[0];
                    var taskData = data[2];
                    // 创建角色初始化gamePlayer, 因为外层有任务处理
                    var gamePlayer = g_cache.initGamePlayer(userEntity, accountData, taskData, [heroData]);

                    exports.initHeroStar(gamePlayer.userData, heroTempId, function() {});
                    // heroBiz.activeHeroTask(userEntity.id, heroTempId);
                    gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);

                    accountBiz.addUserServer(mainClient, accountId, project.serverId, userEntity.id, client, function() {});

                    // BI
                    var biObj = new biHlObj.counterRoleChoiceObj(userEntity.accountId, userEntity.id, userEntity.lvl, userEntity.nickName);
                    biHlBiz.HlCounterBi(biObj, userEntity.serverIndexId, userEntity.id, accountData, opt.ip, function(err, data) {});

                    var oObj = new ossObj.ossCreateRole(userEntity.accountId, userEntity.id, userEntity.nickName, accountData.channelId, accountData.sdkChannelId);
                    ossBiz.WriteOss(oObj);

                    cb(null, [userEntity, heroData, accountData]);
                });
            });
        });
    });
};

/**
 * 改名字
 * @param client
 * @param name
 * @param userId
 * @param heroTempId
 * @param cb
 */
exports.changeName = function(client, name, userId, cb) {
    checkRequire();
    //userDao.select(client,{id:userId},function(err,userData){
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(null);
        var userData = gamePlayer.userData;

        var bag = userData.bag;
        var needItemsId = 2003; //改名卡
        if (!bag[needItemsId] || bag[needItemsId] < 1) return cb(getMsg(c_msgCode.noChangeNameCard)); //改名卡不足

        if (name.indexOf(" ") >= 0) return cb(getMsg(c_msgCode.roleNotBlank)); //角色名不能包含空格
        if (name.indexOf("\n") >= 0 || name.indexOf("\\n") >= 0 || name.indexOf("\r") >= 0 || name.indexOf("\\r") >= 0 || name.indexOf("\"") >= 0 || name.indexOf("\\") >= 0 || name.indexOf("\t") >= 0 ||
            name.indexOf("/") >= 0 || name.indexOf("\b") >= 0 || name.indexOf("\f") >= 0 ||
            name.indexOf("'") >= 0 || name.indexOf("\'") >= 0 || name.indexOf(".") >= 0 || name.indexOf(";") >= 0 || name.indexOf(",") >= 0) return cb(getMsg(c_msgCode.roleNotEnter)); //角色名不能包含回车换行或双引号
        name = name.replace("\\n", "");
        name = name.replace("\n", "");
        name = name.replace("\\r", "");
        name = name.replace("\r", "");
        name = name.replace("\"", "");
        //限制长度
        var nameLength = commonUtils.getStringLength(name);
        if (nameLength > 10) return cb(getMsg(c_msgCode.roleNameOutLenght)); //长度超出啦
        //过滤敏感字符
        if (commonUtils.checkFuckWord(name)) return cb(getMsg(c_msgCode.sensitiveInRoleName));
        name = "s" + userData.serverId + "." + name;

        userDao.select(client, { nickName: name }, function(err, data) {
            if (err) return cb(err);
            if (data) return cb(getMsg(c_msgCode.roleNameUsed)); //已经存在该名字

            var delBagItems = {};
            delBagItems[needItemsId] = 1;

            userUtils.delBag(userData, needItemsId, 1, c_prop.itemCostTypeKey.use);
            userData.nickName = name;
            var updateData = {
                nickName: userData.nickName
            };
            gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
            // userDao.update(client, updateData, {id:userId},function(err,data){
            if (err) return cb(err);
            cb(null, [updateData, delBagItems]);
            // });
        });
    });
};

/**
 * 同步信息
 * @param client
 * @param sendData
 * @param userId
 * @param cb
 */
exports.syncData = function(client, sendData, userId, cb) {
    checkRequire();
    var isChat = 0;
    var isGuildChat = 0;
    var isRedEnvelope = 0;
    var isTask = 0;
    var isDealPk = 0;
    var isKefu = 0; //是否有客服消息
    var isSysMsg = 0;
    var isRankDealPk = 0;
    var isBePkKill = 0;
    var isInspire = 0;
    var openBossIds = [];
    var guildWarIsOpen = 0;

    var lastId = sendData[0];
    var taskUpdateId = sendData[1];
    var kefuId = sendData[2];
    var sysMsgId = sendData[3];
    var inspireNum = sendData[4];
    var redLastId = sendData[5];
    var guildLastId = sendData[6];
    var guildId = sendData[7];

    g_cache.activePlayer(userId);

    var curChatUID = g_chat.getCurUID();
    if (lastId != curChatUID) {
        isChat = 1;
    }

    var curChatGID = g_chat.getCurGID(guildId);
    if (guildLastId != curChatGID) {
        isGuildChat = 1;
    }

    // var curRedEnvelopeUID = g_redEnvelope.getCurUID();
    // if (redLastId != curRedEnvelopeUID) {
    //     isRedEnvelope = 1;
    // }

    //todo 请求数据库太频繁，先注释掉
    //var curTaskUpdateId = g_data.getTaskUpdateId(userId);
    //if(taskUpdateId!=curTaskUpdateId){
    //    isTask = 1;
    //}

    //紧急委托任务数据是否变化了
    var isEntrustTasksChange = g_data.getEntrustTasksChange(userId);
    if (isEntrustTasksChange) {
        g_data.setEntrustTasksChange(userId, 0);
    }

    var hasDealPk = g_data.getHasDealPk(userId);
    if (hasDealPk) {
        isDealPk = 1;
    }

    var bePkKill = g_data.getBePkKill(userId);
    if (bePkKill) {
        isBePkKill = 1;
    }

    //暂未实现
    isKefu = 0;

    if (sysMsgId != g_chat.getLastSysMsgId()) {
        isSysMsg = 1;
    }

    var hasRankDealPk = g_data.getHasRankDealPk(userId);
    if (hasRankDealPk) {
        isRankDealPk = 1;
    }

    var isGuildChange = g_data.getGuildChange(userId);
    //todo 临时注释
    /*
    if(inspireNum != bossBiz.getInspireNum(userId,null)){
        isInspire = 1;
    }

    if(g_boss.isOpen()){
        var bossData = g_boss.getBossData();
        if(!bossData.isOver)
            isBossOpen = 1;
    }*/
    var openBossData = g_boss.getOpenBossIds();
    openBossIds = openBossData[0];
    var teamBossData = openBossData[1];

    var buffArr = fightUtils.getBuffArr();


    var exData = new ds.AsyncData();
    exData.chat = isChat;
    exData.task = isTask;
    exData.pkDeal = isDealPk;
    exData.rankPkDeal = isRankDealPk;

    //hd {
    exData.kefu = isKefu;
    exData.sysMsg = isSysMsg;
    //hd }

    exData.bePkKill = isBePkKill;
    exData.inspire = isInspire;
    exData.isBossOpen = openBossIds;
    exData.redEnvelope = isRedEnvelope;
    exData.buffArr = buffArr;
    exData.guildChat = isGuildChat;
    exData.isGuildChange = isGuildChange;
    exData.isEntrustTasksChange = isEntrustTasksChange;
    exData.guildWarIsOpen = guildWarIsOpen;
    exData.fakeData = g_fakeData.getFakeDataCache();
    var activeWorldBoss = g_boss.getActiveWorldBossObj();
    if (activeWorldBoss) {
        exData.wbShopInfo = activeWorldBoss.getShopInfo(userId);
    }
    exData.teamBossData = teamBossData;
    // 在线时长 
    var ip = sendData[18];
    var curTime = new Date();
    var lastOnlineTime = g_data.getLastOnlineTime(userId);
    if (lastOnlineTime) {
        if (lastOnlineTime.clone().getMillisecondsBetween(curTime) >= 180 * 1000) {
            g_data.setLastOnlineTime(userId, curTime);
            _sendOnlineData(userId, ip);
            activityBiz.recordTurntableValue(client, userId, c_prop.turntableTypeKey.onlineTime, 1, null, function() {});
        }

    } else {
        g_data.setLastOnlineTime(userId, curTime);
        _sendOnlineData(userId, ip);
    }
    g_data.setBeatTime(userId, curTime);
    cb(null, exData);
};

var _isKrNeedKick = function(accountData) {
    // return true;// for test
    //isadult=1 成年。  isadult=2 未满16周岁，需限制其登陆。
    if (!accountData || !accountData.sdkData || accountData.sdkData.isadult != 2) return false;
    var now = new Date();
    var sTime = now.clone().clearTime(); //0点
    var eTime = sTime.clone().addHours(6);
    if (now.isBefore(sTime) || now.isAfter(eTime)) return false;
    return true;
}

//踢人
var _kickOut = function(accountId, serverIndexId, cb) {
    var sessionManager = require("uw-route").sessionManager;
    var session = sessionManager.getSessionByAccountId(accountId, serverIndexId);
    // console.error('_kickOut---->',accountId,serverIndexId,session);
    if (session)
        session.isKick = 1;
    return cb(getMsg(c_msgCode.krLoginLimit));
};
/**
 * 同步信息2
 * @param client
 * @param userId
 * @param cb
 */
exports.syncData2 = function(client, userId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);

        var userData = gamePlayer.userData;
        var accountData = gamePlayer.accountData;
        //韩国版防沉迷
        var needKick = _isKrNeedKick(accountData);
        if (needKick) return _kickOut(accountData.id, userData.serverId, cb);
        //记录登录数据
        _recordLoginDays(userData);
        reissueBiz.reissueActivityReward(client, userData);
        userData.lastUpdateTime = new Date();
        userUtils.synPataPower(userData);

        gamePlayer.active();
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        //gamePlayer.setUserDataDirty();
        //userDao.update(client,{lastUpdateTime:new Date()},{id:userId},function(){});

        var asyncData2 = new ds.AsyncData2();
        asyncData2.lastUpdateTime = new Date(); //最后更新时间
        asyncData2.lootTypeArr = g_lootConfig.getLootTypeArr(); //掉落的类型组
        asyncData2.power = userData.strength;
        asyncData2.lastPowerTime = userData.strengthReTime;
        cb(null, asyncData2);
    });
};

//记录登录日期array
var _recordLoginDays = function(userData) {
    var loginDays = userData.loginDays || [];
    //暂时先记30天的登录日期 主要活动需要用
    if (loginDays.length > 0) {
        var lastLoginDay = loginDays[loginDays.length - 1];
        lastLoginDay = new Date(lastLoginDay);
        //今天已经记录过 
        // console.error('lastLoginDay',lastLoginDay);
        // console.error('new Date()',new Date());
        if (Date.equalsDay(lastLoginDay, new Date())) {
            // console.error('今天已经记录过 今天已经记录过 今天已经记录过 ？？',lastLoginDay,new Date());
            return;
        }
    }

    var today = Date.today().getTime(); //今日0点的时间戳
    loginDays.push(today);
    if (loginDays.length > 30) {
        loginDays.shift();
    }
    // console.error('asdfadasdfasdasdasdasdasdasdasdasdasd',loginDays);
    userData.loginDays = loginDays;
};

/**
 * 心跳处理
 * @param client
 * @param userId
 * @param cb
 */
exports.beat = function(client, userId, ip, cb) {
    checkRequire();

    // 在线时长
    var curTime = new Date();
    var lastOnlineTime = g_data.getLastOnlineTime(userId);
    if (lastOnlineTime) {
        if (lastOnlineTime.clone().getMillisecondsBetween(curTime) >= 180 * 1000) {
            g_data.setLastOnlineTime(userId, curTime);
            _sendOnlineData(userId, ip);
        }

    } else {
        g_data.setLastOnlineTime(userId, curTime);
        _sendOnlineData(userId, ip);
    }
    cb(null, null);
};

/**
 * 购买金币
 * @param client
 * @param userId
 * @param cb
 */
exports.buyGold = function(client, userId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var buyData = _getBuyGoldData(userData);
        var getGold = buyData[0],
            costDiamond = buyData[1]; //,buyCount = buyData[2],maxCount = buyData[3];

        //if (buyCount >= maxCount) return cb(getMsg(c_msgCode.cantUseMax, buyCount));//购买次数不能超过限制

        //判断被扣除钻石
        if (userData.diamond < costDiamond || costDiamond < 0) return cb(getMsg(c_msgCode.noDiamond)); //钻石不足

        //改变次数
        userUtils.addTodayCount(userData, c_prop.userRefreshCountKey.buyGold, 1);
        //扣除钻石
        if (costDiamond > 0) {
            userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.buyGold);
        }

        //增加的金币
        if (getGold > 0) {
            userUtils.addCurrency(userData, c_prop.currencyTypeKey.gold, getGold, c_prop.itemGetTypeKey.buyGold);
        }

        //需要更新的数据
        var updateData = {};
        updateData.diamond = userData.diamond; //砖石
        updateData.giveDiamond = userData.giveDiamond;
        updateData.buyDiamond = userData.buyDiamond;
        updateData.gold = userData.gold; //金币
        updateData.counts = userData.counts;
        updateData.countsRefreshTime = userData.countsRefreshTime;

        //gamePlayer.setUserDataDirty()
        userDao.update(client, updateData, { id: userId }, function(err, data) {
            if (err) return cb(err);
            cb(null, [updateData, null, costDiamond]);
        });
    });
};

/**
 * 购买凌云石
 * @param client
 * @param userId
 * @param cb
 */
exports.buyLingyun = function(client, userId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var items = {};
        var getLingyun = c_game.buyLingyunCfg[0] || 0;
        if (getLingyun <= 0) return cb(getMsg(c_msgCode.abnormalData)); //数据异常");
        items["56"] = getLingyun;
        var buyCount = userUtils.getTodayCount(userData, c_prop.userRefreshCountKey.buyLingyun);
        var costDiamond = 999999;
        var cosArr = c_game.buyLingyunCfg[1].split(";") || [];
        var lastArr = cosArr[cosArr.length - 1].split(",") || [];
        if ((buyCount + 1) >= lastArr[0]) {
            costDiamond = parseInt(lastArr[1]) / 10 * getLingyun;
        } else {
            for (var i = 0; i < cosArr.length; i++) {
                var costDiaArr = cosArr[i].split(",") || [];
                if (costDiaArr[0] && costDiaArr[1]) {
                    if ((buyCount + 1) <= costDiaArr[0]) {
                        costDiamond = parseInt(costDiaArr[1]) / 10 * getLingyun;
                        break;
                    }
                }
            }
        }
        // var maxCount = c_vip[userData.vip].buyLingyunCount;
        // if (buyCount >= maxCount) return cb(getMsg(c_msgCode.cantBusMax));//购买次数不能超过限制

        //判断被扣除钻石
        if (userData.diamond < costDiamond || costDiamond < 0) return cb(getMsg(c_msgCode.noDiamond)); //钻石不足

        //改变次数
        userUtils.addTodayCount(userData, c_prop.userRefreshCountKey.buyLingyun, 1);
        //扣除钻石
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.buyLingyun);

        //增加凌云石
        var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.shop);

        //需要更新的数据
        var updateData = {
            gold: userData.gold,
            honor: userData.honor,
            diamond: userData.diamond,
            prestige: userData.prestige,
            giveDiamond: userData.giveDiamond,
            buyDiamond: userData.buyDiamond,
            counts: userData.counts,
            countsRefreshTime: userData.countsRefreshTime
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        cb(null, [updateData, costDiamond, items]);
    });
};

/**********************************************************/
var getIconId = function(heroTempId, sex) {
    var iconId = 1;
    if (heroTempId == c_prop.heroJobKey.zs) {
        if (sex == c_prop.sexKey.male) {
            iconId = c_prop.roleIconKey.zs_nan;
        } else {
            iconId = c_prop.roleIconKey.zs_nv;
        }
    }

    if (heroTempId == c_prop.heroJobKey.fs) {
        if (sex == c_prop.sexKey.male) {
            iconId = c_prop.roleIconKey.fs_nan;
        } else {
            iconId = c_prop.roleIconKey.fs_nv;
        }
    }

    if (heroTempId == c_prop.heroJobKey.ds) {
        if (sex == c_prop.sexKey.male) {
            iconId = c_prop.roleIconKey.ds_nan;
        } else {
            iconId = c_prop.roleIconKey.ds_nv;
        }
    }

    return iconId;
};

/**
 * 获取购买金币获得数量和所需钻石
 * @returns [得到金币，消耗元宝，已经购买次数，最大购买次数]
 */
var _getBuyGoldData = function(userData) {
    var lvl = userData.lvl;
    var buyCount = userUtils.getTodayCount(userData, c_prop.userRefreshCountKey.buyGold);
    var zengLiang = c_game.goldBuySet[0];
    var jiShu = c_lvl[lvl].buyGoldMult;
    var getGold = formula.calBuyGold(buyCount + 1, zengLiang, jiShu);
    var costDiamond = formula.calBuyGoldDiamond(buyCount + 1);
    //var maxCount = _getBuyGoldMaxCount(userData);
    return [getGold, costDiamond, buyCount]; //[getGold,costDiamond,buyCount,maxCount];
};

//获取每天可以购买的次数
// var _getBuyGoldMaxCount = function(userData) {
//     var vip = userData.vip;
//     var maxCount = c_vip[vip].goldCount;//获取该玩家的最大购买次数
//     return maxCount;
// };

/**
 * 红点提示
 * @param client
 * @param userId
 * @return [成就是否有红点（0/1），挑战是否有红点（0/1）]  1为有红点
 */
exports.getRedPoint = function(client, userId, cb) {
    checkRequire();
    //userDao.select(client,{id:userId},function(err,userData){
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var redDot = [];
        var redDotHo = 0;
        var redDotPk = 0;
        var nowTime = new Date();
        var honorData = userData.honorData;
        var arenaData = userData.arenaData;
        var combat = userUtils.calCombat(userData); //战斗力计算
        //判断有无成就可以领取
        for (var key in honorData) {
            if (honorData[key][1] === 0) {
                redDotHo = 1;
                break;
            }
        }
        //判断排位赛有开启，并且有次数、不在cd
        if (combat >= c_game.pkCfg[4]) {
            if (arenaData[0] > 0) { //挑战次数大于0
                if (!arenaData[1] || nowTime.isAfter(new Date(arenaData[1]))) {
                    redDotPk = 1;
                }
            }
        }
        redDot[0] = redDotHo;
        redDot[1] = redDotPk;
        cb(null, redDot);
    });
};

//更新引导
exports.updateGuide = function(client, userId, guideId, cb) {

    checkRequire();
    // userDao.selectCols(client, "serverIndexId, accountId,lvl, exData", {id:userId}, function(err,userData) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(null);
        var userData = gamePlayer.userData;
        userData.exData = userData.exData || {};
        userData.exData[c_prop.userExDataKey.guide] = guideId;
        var updateData = {
            exData: userData.exData
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.exdata);
        //userDao.update(client,updateData,{id:userId},function(err,data){
        //if(err) return cb(err);

        if (guideId.toString().indexOf('_') > 0) {
            //console.log("请求的引导号是-------------------------"+guideId);
            var guideCfg = {
                10000: [1, '第一关BOSS挑战'],
                10001: [2, '穿装备'],
                10002: [3, '第二关BOSS挑战'],
                10005: [4, '强化装备'],
                10007: [5, '宠物拉霸'],
                10013: [6, '守护精灵'],
                10011: [7, 'PK'],
                10015: [8, '史莱姆逆袭'],
                10017: [9, '符文系统'],
                10079: [10, '组队副本'],
                10019: [11, '装备升星'],
                10023: [12, '守卫女神'],
                10025: [13, '宝石升级'],
                10027: [14, '公会'],
                10021: [15, '竞技场'],
                10077: [16, '佣兵'],
                10029: [17, '第二职业'],
                10009: [18, '宠物升级'],
                10033: [19, '探险系统'],
                10031: [20, '女仆咖啡店'],
                10081: [21, '第三职业'],
                10035: [22, '星灵契约'],
                10037: [23, '小队评级']
            };
            var mainGuide = guideId.split("_")[0]; //主引导号
            var childGuide = guideId.split("_")[1]; //子引导号
            var family = childGuide == 10000 ? "最后一次点击" : ("第" + childGuide + "次点击");

            // BI
            if (guideCfg[mainGuide]) {
                var biObj = new biHlObj.counterGuideObj(userData.accountId, userId, userData.lvl, childGuide, guideCfg[mainGuide][1], guideCfg[mainGuide][1] + family);
                biHlBiz.HlCounterBi(biObj, userData.serverIndexId, userId, gamePlayer.accountData, userData.exData[c_prop.userExDataKey.loginIP], function(err, data) {});
            }
        }
        cb(null, updateData);
        // });
    });

};

exports.updateGuideExt = function(client, userId, k, v, cb) {
    checkRequire();
    //userDao.selectCols(client, "exData", {id:userId}, function(err,userData) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(null);
        var userData = gamePlayer.userData;
        userData.exData = userData.exData || {};
        var guildExt = userData.exData[c_prop.userExDataKey.guideExt] || {};
        guildExt[k] = v;
        userData.exData[c_prop.userExDataKey.guideExt] = guildExt;
        var updateData = {
            exData: userData.exData
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.exdata);
        //userDao.update(client,updateData,{id:userId},function(err,data){
        //if(err) return cb(err);
        cb(null, updateData);
        //});
    });

};

//更新自动挑战
exports.setAutoFight = function(client, userId, isAuto, cb) {
    _updateExData(client, userId, c_prop.userExDataKey.autoFight, isAuto, cb);
};

//更新时间报错次数
exports.setTimeError = function(client, userId, cb) {
    //checkRequire();
    cb(null, {});
    // userDao.selectCols(client, "exData", {id:userId}, function(err,userData) {
    //     if (err) return cb(null);
    //     var timeErrorNum = userData.exData[c_prop.userExDataKey.timeError]||0;
    //     timeErrorNum++;
    //     userData.exData[c_prop.userExDataKey.timeError] = timeErrorNum;
    //     var updateData ={
    //         exData:userData.exData
    //     };
    //     userDao.update(client,updateData,{id:userId},function(err,data){
    //         if(err) return cb(err);
    //         cb(null,updateData);
    //     });
    // });
};

//更新tap值
exports.updateTap = function(client, userId, num, cb) {
    checkRequire();
    userDao.updateTap(client, userId, num, cb);
};

exports.updatePopUp = function(client, userId, popUp, cb) {
    _updateExData(client, userId, c_prop.userExDataKey.newPopUp, popUp, cb);
};

// 设置玩家IconId
exports.setIcon = function(client, userId, iconId, cb) {
    checkRequire();
    //userDao.selectCols(client, "iconId, heroData", {id:userId}, function(err,userData) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(null);
        var userData = gamePlayer.userData;
        userData.heroData = userData.heroData || {};
        if (!userData.heroData[iconId])
            return cb(getMsg(c_msgCode.noThisFriend)); //你还没有拥有该伙伴
        userData.iconId = iconId;
        var updateData = {
            iconId: iconId
        };
        userDao.update(client, updateData, { id: userId }, function(err, data) {
            if (err) return cb(err);
            cb(null, updateData);
        });
    });
};

// 设置爱微游实名认证
exports.setAwyVerify = function(client, userId, cb) {

    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(null);
        var userData = gamePlayer.userData;

        userData.exData = userData.exData || {};
        _checkAwyData(userData);

        userData.exData[c_prop.userExDataKey.awyData].verify[0] = 1;
        var updateData = {
            exData: userData.exData
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.exdata);
        cb(null, updateData);
    });
};

exports.awyShare = function(client, userId, cb) {

    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;

        userData.exData = userData.exData || {};
        _checkAwyData(userData);
        // console.log("AWYSHARE:", userData.exData);
        // 是否可以分享
        var lastShareTime = userData.exData[c_prop.userExDataKey.awyData].share[2];
        if (typeof lastShareTime == "string") {
            lastShareTime = new Date(lastShareTime);
        }

        var sec = parseInt(c_game.sdkShareCfg[4]);
        if (lastShareTime.clone().addSeconds(sec).isAfter(new Date()))
            return cb(null, { exData: userData.exData });

        // 过了2个小时后分享才有效
        userData.exData[c_prop.userExDataKey.awyData].share[2] = new Date();
        userData.exData[c_prop.userExDataKey.awyData].share[1] = new Date();
        userData.exData[c_prop.userExDataKey.awyData].share[0]++;

        var updateData = {
            exData: userData.exData
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.exdata);
        cb(null, updateData);
    });
};

exports.getAwyShareReward = function(client, userId, idx, cb) {
    if (idx < 0 || idx > 2) return cb('不能领取');
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(null);
        var userData = gamePlayer.userData;

        userData.exData = userData.exData || {};
        _checkAwyData(userData);

        if (userData.exData[c_prop.userExDataKey.awyData].share[0] < idx + 1) {
            return cb('不能领取');
        }
        var rewards = userData.exData[c_prop.userExDataKey.awyData].share[3];
        if (rewards[idx] == 1) {
            return cb('已领取');
        }
        rewards[idx] = 1;

        // 获取掉落包
        var shareCfg = c_game.sdkShareCfg[2].split(";")[idx];
        var rCfg = shareCfg.split(":");

        var logicItems = {};
        logicItems[rCfg[0]] = parseInt(rCfg[1]);
        var getDiamond = 0;
        if (logicItems[c_prop.spItemIdKey.diamond]) {
            getDiamond = logicItems[c_prop.spItemIdKey.diamond];
        }
        //获得物品
        var bagItems = {};
        // var equipBagItems = {};
        var itemsArr = userUtils.saveItems(userData, logicItems, c_prop.itemGetTypeKey.guildWeekHydChest);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        //if(Object.keys(itemsArr[1]).length>0) equipBagItems = propUtils.mergerProp(equipBagItems,itemsArr[1]);

        //更新
        var updateData = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            exData: userData.exData
            //bag: userData.bag 
        };

        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);

        cb(null, [updateData, bagItems, getDiamond]);
    });
};

exports.getAwyVerifyReward = function(client, userId, cb) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(null);
        var userData = gamePlayer.userData;

        userData.exData = userData.exData || {};
        _checkAwyData(userData);

        if (userData.exData[c_prop.userExDataKey.awyData].verify[0] != 1) {
            return cb('不能领取');
        }

        if (userData.exData[c_prop.userExDataKey.awyData].verify[1] == 1) {
            return cb('已领取');
        }

        userData.exData[c_prop.userExDataKey.awyData].verify[1] = 1;

        // 获取掉落包
        var chestId = c_game.sdkShareCfg[0];
        var logicItems = itemBiz.calLogicItems(chestId); //随机的物品
        var getDiamond = 0;
        if (logicItems[c_prop.spItemIdKey.diamond]) {
            getDiamond = logicItems[c_prop.spItemIdKey.diamond];
        }

        //获得物品
        var bagItems = {};
        // var equipBagItems = {};
        var itemsArr = userUtils.saveItems(userData, logicItems, c_prop.itemGetTypeKey.guildWeekHydChest);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        //if(Object.keys(itemsArr[1]).length>0) equipBagItems = propUtils.mergerProp(equipBagItems,itemsArr[1]);

        //更新
        var updateData = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            exData: userData.exData
            //bag: userData.bag 
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);

        cb(null, [updateData, bagItems, getDiamond]);
    });
};

exports.setFocus = function(client, userId, ret, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;

        userData.exData = userData.exData || {};
        _checkAwyData(userData);

        // 已领取奖励
        if (userData.exData[c_prop.userExDataKey.awyData].focus[1] == 0) {
            _sendFocusReward(client, userId);
        }
        userData.exData[c_prop.userExDataKey.awyData].focus = [1, 1];
        var updateData = {
            exData: userData.exData
        };
        // 设置分享成功
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.exdata);

        // 设置对应账号关注成功
        var accountData = gamePlayer.accountData;
        accountData.sdkData['focus'] = ret;

        accountBiz.setFocus(client, accountData.id, ret, function() {
            cb(null, updateData);
        });
    });
};

//更新杀戮榜今天挑战赢
exports.setTodayRankWin = function(client, userId, eid, cb) {
    userDao.selectCols(client, "exData", " id = ?", [userId], function(err, userData) {
        if (err) return cb(err);
        var winData = userData.exData[c_prop.userExDataKey.todayRankWin] || [];
        var time = winData[0];
        if (!time) time = new Date();
        var timeDate = new Date(time);
        var eids = winData[1] || [];
        if (!(new Date()).equalsDay(timeDate)) {
            time = new Date();
            eids = [];
        }
        if (eids.indexOf(eid) <= -1) {
            eids.push(eid);
        }
        winData = [time, eids];

        _updateExData(client, userId, c_prop.userExDataKey.todayRankWin, winData, cb);
    });
};

/**
 * 获取绑定手机的url
 * @param mainClient
 * @param accountId
 * @param cb
 */

// exports.getBindPhoneUrl = function(mainClient, accountId, cb){
//     accountDao.selectCols(loginClient,"name","id=?",[accountId],function(err, accountData){
//         if(err) return cb(err);
//         var hgameBiz = require('uw-sdk').hgameBiz;
//         hgameBiz.getBindPhoneUrl(accountData.name, function(err, data){
//             if(err) return cb(err);
//             cb(null, data)
//         })
//     });
// };


/**
 * 保存桌面成功
 * @param client
 * @param userId
 * @param type
 * @param cb
 */
// exports.saveDeskSuccess = function(client,userId,type,cb){
//     checkRequire();
//     userDao.select(client,{id:userId},function(err,userData){
//         if(err) return cb(err);
//         var items = null;
//         var mailType = null;
//         if(type==c_prop.userRecordTypeKey.saveDesk){
//             //判断今日次数
//             var saveDeskCount = userData.record[c_prop.userRecordTypeKey.saveDesk]||0;
//             if(saveDeskCount>=1) return cb(getMsg(c_msgCode.collectSuccess));
//             userData.record[c_prop.userRecordTypeKey.saveDesk] = 1;

//             items = commonUtils.strToObj(c_game.otherReward[0]);

//             mailType = c_prop.mailTypeKey.saveDesk;
//         }
//         if(type==c_prop.userRecordTypeKey.linkShare){
//             //判断今日次数
//             var saveDeskCount = userData.record[c_prop.userRecordTypeKey.linkShare]||0;
//             if(saveDeskCount>=5) return cb(null,{});
//             saveDeskCount++;
//             userData.record[c_prop.userRecordTypeKey.linkShare] = saveDeskCount;
//             items = {};
//             items[c_prop.spItemIdKey.diamond] = 60;
//             mailType = c_prop.mailTypeKey.linkShare;
//         }
//         if(type==c_prop.userRecordTypeKey.bindPhone){
//             var saveDeskCount = userData.record[c_prop.userRecordTypeKey.bindPhone]||0;
//             if(saveDeskCount) return cb(null,{});
//             saveDeskCount = 1;
//             userData.record[c_prop.userRecordTypeKey.bindPhone] = saveDeskCount;
//             items = {};
//             items = commonUtils.strToObj(c_game.otherReward[1]);
//             //items[c_prop.spItemIdKey.diamond] = 60;
//             mailType = c_prop.mailTypeKey.bindPhone;
//         }

//         var updateUser = {
//             record:userData.record
//         };

//         async.parallel([
//             function(cb1){
//                 userDao.update(client,updateUser,{id:userId},cb1);
//             },
//             function(cb1){
//                 if(items){
//                     mailBiz.addByType(client, userId, mailType, null, items, cb1);
//                 }else{
//                     cb1();
//                 }
//             }
//         ],function(err,data){
//             if(err) return cb(err);
//             cb(null,updateUser);
//         });

//     });
// };

/**
 * 购买背包格子
 * @param client
 * @param userId
 * @param cb
 */
exports.buyBagGrid = function(client, userId, cb) {
    return cb(getMsg(c_msgCode.functionClose)); //功能已关闭
    // checkRequire();
    // userDao.select(client,{id:userId},function(err,userData) {
    //     if (err) return cb(err);
    //     var equipBagBuyCount = userData.equipBagBuyCount||0;        //购买次数
    //     var cosDiamond = formula.callBuyEquipBag(equipBagBuyCount);     //消耗钻石
    //     if(userData.diamond < cosDiamond) return cb(getMsg(c_msgCode.noDiamond));//钻石不足;
    //     var addCount = c_game.equipBagCfg[1] ; //+ c_vip[userData.vip].addEquipBag;     //购买加的格数

    //     //次数添加
    //     userData.equipBagBuyCount = equipBagBuyCount + 1;
    //     //扣除钻石
    //     userUtils.reduceDiamond(userData,cosDiamond);

    //     //更新
    //     var updateData = {
    //         diamond: userData.diamond,
    //         buyDiamond:userData.buyDiamond,
    //         giveDiamond:userData.giveDiamond,
    //         equipBagBuyCount:userData.equipBagBuyCount
    //     };
    //     userDao.update(client,updateData,{id:userId},function (err,data) {
    //         if(err) return cb(err);
    //         cb(null,[updateData,cosDiamond]);
    //     });
    // });
};

/**
 * 计算离线收益
 * @param client
 * @param userData
 * @param cb
 */
exports.offlineEarnings = function(client, userData, heroList, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            copyProgressDao.select(client, { userId: userData.id, copyType: c_prop.copyTypeKey.normal }, cb1);
        },
        // function(cb1){
        //     heroDao.list(client, {userId: userData.id}, cb1);
        // }
    ], function(err, data) {
        if (err) return cb(err);
        var copyProgressData = data[0]; //,heroList = data[1];
        var returnArr = [0, 0, 0, 0, 0, 0, []]; //[离线时间（）秒、获得经验、获得金币、装备等级、件数、自动getCHe件数、[[id,铜宝箱件数]、[id,银宝箱件数]、[id,金宝箱件数]]]
        var nowTime = new Date();
        var lastUpdateTime = userData.lastUpdateTime; //更新时间
        if (!lastUpdateTime) return cb(null, returnArr);
        var offlineDed = c_game.offlineCfg[0]; //离线N秒后开始进入离线时间
        var offlineLimit1 = c_game.offlineCfg[1]; //离线0至8小时时间(秒)（100%经验）
        var offlineLimit2 = c_game.offlineCfg[2]; //离线8至24小时获得经验（秒）（80%经验）
        var second = (nowTime.getTime() - lastUpdateTime.getTime()) / 1000;
        second = second - offlineDed;
        if (second < 0) return cb(null, returnArr);
        var addGold = 0; //获得金币
        var addExp = 0; //获得经验
        var addEquipCount = 0 //获得装备数量
        var equipItems = {};
        var equipGold = 0; //超出装备转化金币
        if (second > 0) {
            returnArr[0] = parseInt(second);
            if (second > offlineLimit2) second = offlineLimit2;

            //旧数据
            var copyObj = copyProgressData.copyObj || {};
            var copyId = 100001;
            if (commonUtils.getLastKey(copyObj)) copyId = parseInt(commonUtils.getLastKey(copyObj));
            // copyId = copyId > 14401 ? 14401 : copyId;
            copyId = t_copy[copyId] ? copyId : (t_copy[copyId - 1] ? (copyId - 1) : 100001);
            // var copyRealIndex = copyId >= 10001 ? (copyId - 9001) : copyId;
            copyId = copyId < 100001 ? 100001 : copyId;
            var copyRealIndex = copyId - 100000;

            var onlineLootData = userData.onlineLootData;
            var perExpc = onlineLootData[0],
                perGold = onlineLootData[1],
                perMonsterSec = onlineLootData[2],
                hasCount = onlineLootData[3];
            var addRate1 = 0.85;
            var addRate2 = 0.7;
            var monsterTotal = 3; //一波怪的数量
            var aMonsterTime = 0; //击杀一波怪所需秒数

            //todo
            if (false) {
                addExp = parseInt(perExpc * second * addRate1);
                addGold = parseInt(perGold * second * addRate1);
            } else {
                var offlineGold = parseInt((parseInt(t_copyLoot[t_copy[copyId].loot[0]].moneyMin) + parseInt(t_copyLoot[t_copy[copyId].loot[0]].moneyMax)) / 2);
                //var offlineExp = parseInt(t_monster[t_copy[copyId].randMonsters[0]].userExp);
                addGold = formula.callOfflineGold(offlineGold, userData.lvl, second); //a:当前所在的普通关卡ID;b:领主等级;c:离线时间(秒)

                var heroDps = 0;
                var tMonster = t_monster[t_copy[copyId].randMonsters[0]]; //当前怪物表数据
                monsterTotal = t_copy[copyId].randMonsters.length; //t_copy[copyId].monsterTotal;     //一波怪的数量
                for (var i = 0; i < heroList.length; i++) {
                    var locHero = heroList[i];
                    heroDps += heroPropHelper.getDamagePerSec(locHero, tMonster, userData.lvl);
                }
                var findMonsterSec = 3; //每波怪寻怪时间
                var sumHp = monsterTotal * tMonster.maxHp; //一波怪总血量
                aMonsterTime = sumHp / heroDps + findMonsterSec; //击杀一波怪所需秒数

                if (aMonsterTime < 3) aMonsterTime = 3;
                //addExp = parseInt((second/aMonsterTime)*(monsterTotal*tMonster.userExp));
                //addExp = parseInt(formula.callOfflineExp((monsterTotal*tMonster.userExp)/aMonsterTime,second));
                var secondExp = (monsterTotal * tMonster.userExp) / aMonsterTime;
                if (second <= offlineLimit1) {
                    addExp = secondExp * second * addRate1;
                } else {

                    var outSeconds = second - offlineLimit1;
                    addExp = secondExp * offlineLimit1 * addRate1;
                    addExp += secondExp * outSeconds * addRate2;
                }
            }

            //addExp = formula.callOfflineExp(offlineExp,userData.lvl,second);        //todo a:当前所在的普通关卡ID;b:领主等级;c:离线时间(秒)
            var equipCount = formula.callOfflineEquipCount(second); //获得装备数量
            var equipLvl = formula.callEquipLvl(copyRealIndex); //获得装备等级
            equipLvl = equipLvl > userData.lvl ? (Math.floor(userData.lvl / 10) * 10) : equipLvl;
            returnArr[3] = equipLvl;
            var residualSpace = userUtils.getEquipBagResGrid(userData); //剩余空间
            if (residualSpace < 0) residualSpace = 0;
            addEquipCount = equipCount;
            if (addEquipCount > residualSpace) {
                addEquipCount = residualSpace; //如果大于剩余空间取空间数量
                //剩余装备转换金币
                equipGold = (equipCount - residualSpace) * formula.callEquipTraGold(copyRealIndex);
                returnArr[5] = equipCount - residualSpace;
            }
            returnArr[4] = addEquipCount;

            for (var i = 0; i < addEquipCount; i++) {
                var tempId = formula.callOfflineEquipId(equipLvl);
                var cou = equipItems[tempId] || 0;
                equipItems[tempId] = cou + 1;
            }

            //等级宝箱
            if (t_copyLoot[t_copy[copyId].loot[0]].exItems) {
                var exItems = t_copyLoot[t_copy[copyId].loot[0]].exItems;
                for (var i = 0; i < exItems.length; i++) {
                    var chestsNum = 0;
                    var exItemsId = exItems[i][0];
                    if (parseInt(exItemsId / 100) == 51) {
                        chestsNum = formula.calCuChests(second / 60); //铜箱子
                    }
                    if (parseInt(exItemsId / 100) == 52) {
                        chestsNum = formula.calAgChests(second / 60); //银箱子
                    }
                    if (parseInt(exItemsId / 100) == 53) {
                        chestsNum = formula.calAuChests(second / 60); //金箱子
                    }
                    if (exItemsId == 1545 || exItemsId == 1550 || exItemsId == 1551) { //宝箱钥匙
                        chestsNum = Math.round(second / aMonsterTime * monsterTotal * (exItems[i][2] / 10000));
                    }
                    if (chestsNum > 0) {
                        equipItems[exItemsId] = chestsNum;
                        returnArr[6].push([exItemsId, chestsNum]);
                    }
                }
            }
            //集字活动 离线掉落
            //var jiZiActivityData = g_cache.getActivityDataByType_InTime(c_prop.activityTypeKey.setTheWord);
            var jiZiActivityDataList = g_cache.getActivityListByType_InTime(c_prop.activityTypeKey.setTheWord);
            for (let i = 0; i < jiZiActivityDataList.length; i++) {
                jiZiActivityData = jiZiActivityDataList[i];
                if (jiZiActivityData && jiZiActivityData.exValues2 && jiZiActivityData.exValues2[1] && jiZiActivityData.exValues2[1].length > 0) {
                    //var itemArr = [1983, 1984, 1985];
                    var itemArr = jiZiActivityData.exValues2[1];
                    itemArr.forEach(function(itemId) {
                        var itemNum = 0;
                        var calSecond = second;
                        //获取天降活动掉落的羽毛数量
                        switch (itemId) {
                            case 1500104:
                                itemNum = formula.calBaiYuMaoNum(calSecond / 60); //白色羽毛
                                break;
                            case 1500105:
                                itemNum = formula.calJinYuMaoNum(calSecond / 60); //金色羽毛
                                break;
                            case 1500106:
                                itemNum = formula.calHongYuMaoNum(calSecond / 60); //红色羽毛
                                break;
                            case 1500107:
                                itemNum = formula.calCaiYuMaoNum(calSecond / 60); //彩色羽毛
                                break;
                            case 1500108:
                                itemNum = formula.calHeiYuMaoNum(calSecond / 60); //黑色羽毛
                                break;
                        }
                        if (second > offlineLimit1) {
                            calSecond = offlineLimit1 + Math.ceil((second - offlineLimit1) * 80 / 100); //超过8小时 取80%
                        }
                        switch (itemId) {
                            case 1983:
                                itemNum = formula.calTieJianNum(calSecond / 60); //铁剑
                                break;
                            case 1984:
                                itemNum = formula.calMuDunNum(calSecond / 60); //木盾
                                break;
                            case 1985:
                                itemNum = formula.calJunQiNum(calSecond / 60); //军旗
                                break;
                        }
                        if (itemNum > 0) {
                            equipItems[itemId] = itemNum;
                            returnArr[6].push([itemId, itemNum]);
                        }
                    });
                    // console.error('returnArr[6]--->',returnArr[6]);
                }
            }
            //集字活动 离线掉落 end

            //vip加成
            //var offlineGoldAdd = c_vip[userData.vip].offlineGoldAdd;
            //var offlineExpAdd = c_vip[userData.vip].offlineExpAdd;
            //if(offlineGoldAdd > 0) addGold = addGold*(offlineGoldAdd + 100)/100;
            //if(offlineExpAdd > 0) addExp = addExp*(offlineGoldAdd + 100)/100;


            //技能影响
            var skillPro = 0;
            var exData = userData.exData || {};
            if (exData[c_prop.userExDataKey.talismanSkill] && exData[c_prop.userExDataKey.talismanSkill][c_prop.talismanSkillTypeKey.exp]) {
                var skillArr = exData[c_prop.userExDataKey.talismanSkill][c_prop.talismanSkillTypeKey.exp];
                for (var i = 0; i < skillArr.length; i++) {
                    var skillId = skillArr[i];
                    if (t_talismanSkill[skillId]) {
                        skillPro += parseInt(t_talismanSkill[skillId].effect[0][0]);
                    }
                }
            }
            addExp = addExp * (skillPro / 10000 + 1);
        }

        returnArr[1] = parseInt(addExp);
        returnArr[2] = parseInt(addGold);
        if (addGold > 0) userUtils.addCurrency(userData, c_prop.currencyTypeKey.gold, addGold, c_prop.itemGetTypeKey.offlineEarning);
        if (equipGold > 0) userUtils.addCurrency(userData, c_prop.currencyTypeKey.gold, equipGold, c_prop.itemGetTypeKey.offlineEarning);

        userUtils.addUserExpc(userData, addExp);

        userUtils.saveItems(userData, equipItems, c_prop.itemGetTypeKey.offlineEarning, null, true);
        cb(null, returnArr);
    });
};

var _useCommonItem = function(client, userId, itemId, count, cb) {
    var itemsArr = [];
    var bagItems = {};
    var delBagItems = {};
    var equipBagItems = {};
    var expSum = 0;
    var rebirthExpSum = 0;
    var genuineQi = 0;
    var costObj = {};
    var items = {};
    var mailItems = {};
    var getDiamond = 0;
    var nobleNum = 0;

    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        if (itemId == 100233) { // 加贵族积分点数
            if (!userData.noble || userData.noble[2] != 1) {
                return cb(getMsg(c_msgCode.needNoble));
            }

            var oldLvl = userUtils.getNobleLevel(userData.noble);

            // 一个箱子加一点
            userData.noble[1] = userData.noble[1] || 0;
            userData.noble[1] += count;

            var newLvl = userUtils.getNobleLevel(userData.noble);
            if (newLvl > oldLvl) {
                __addNobleSysData(userData.nickName, newLvl);
            }

            if (newLvl > 0) {
                // 主动设一次，可以用这种方式修正对应任务数据
                taskBiz.setTaskValue(client, userId, c_prop.cTaskTypeKey.nobleLvl, newLvl, function() {});
            }
            nobleNum = count;
        } else if (itemId == 100235) { // 扣groupType=1的疲劳值(减少已完成次数)
            var groupType = 1;
            var exData = userData.exData;
            var hjBossGroupData = userUtils.getHJBossGroupData(userData, groupType);
            if (!hjBossGroupData.num) return cb(getMsg(c_msgCode.noTired)); //无疲劳不需要使用
            count = count > hjBossGroupData.num ? hjBossGroupData.num : count;

            hjBossGroupData.num = hjBossGroupData.num - count;
            hjBossGroupData.num = hjBossGroupData.num < 0 ? 0 : hjBossGroupData.num; //防止负数
        }
        //扣除宝箱 
        userUtils.delBag(userData, itemId, count, c_prop.itemCostTypeKey.openChest);
        delBagItems[itemId] = count;

        //更新
        var updateData = {
            lvl: userData.lvl,
            magicLvl: userData.magicLvl,
            expc: userData.expc,
            gold: userData.gold,
            exData: userData.exData
        };
        if (nobleNum > 0) {
            updateData.noble = userData.noble;
        }
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        return cb(null, [updateData, false, bagItems, delBagItems, equipBagItems, expSum, getDiamond, rebirthExpSum, genuineQi, userData.buff, nobleNum]);
    });
};

/**
 * 打开背包宝箱
 * @param client
 * @param userId
 * @param chestId
 * @param count
 * @param index
 * @param cb
 */
exports.getBagChest = function(client, userId, chestId, count, index, cb) {
    checkRequire();
    count = parseInt(count);
    if (count <= 0 || !t_item[chestId]) return cb(getMsg(c_msgCode.chestAbnormal)); //打开背包宝箱异常

    // 通用使用物品
    if (t_item[chestId].type == c_prop.itemTypeKey.commonUseItem) {
        return _useCommonItem(client, userId, chestId, count, cb);
    }

    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            demonLotusDao.select(client, { userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            demonLotusData = data[1];

        var level = t_item[chestId].level || 1;
        if (level > userData.lvl) return cb(getMsg(c_msgCode.noLvlUse), level);
        // var levelVip = t_item[chestId].vip || 0;
        // if (levelVip > userData.vip) return cb(getMsg(c_msgCode.vipItemRequire), levelVip);
        var bag = userData.bag;
        if (!bag[chestId] || bag[chestId] < count) return cb(getMsg(c_msgCode.chestUnenough)); //宝箱数量不足
        var itemsArr = [];
        var bagItems = {};
        var delBagItems = {};
        var equipBagItems = {};
        var expSum = 0;
        var rebirthExpSum = 0;
        var genuineQi = 0;
        //同步真气
        var costObj = {};
        // var genuineQiArr = userUtils.calGenuineQi(userData,demonLotusData);
        // var oldGenuineQi =  genuineQiArr[0];

        var items = {};
        //var mailItems = {};
        var getDiamond = 0;
        var nobleNum = 0;
        var isMail = false;

        // buff类物品
        if (t_itemLogic[chestId].chestType == c_prop.chestTypeKey.buff) {
            userUtils.addBuffItem(userData, chestId, count);
            var buffId = t_itemLogic[chestId].create[0][0];
        } else if (chestId == 100233) { // 加贵族积分点数
            if (!userData.noble || userData.noble[2] != 1) {
                return cb("你需要加入贵族俱乐部才能使用该道具");
            }

            var oldLvl = userUtils.getNobleLevel(userData.noble);

            // 一个箱子加一点
            userData.noble[1] = userData.noble[1] || 0;
            userData.noble[1] += count;

            var newLvl = userUtils.getNobleLevel(userData.noble);
            if (newLvl > oldLvl) {
                __addNobleSysData(userData.nickName, newLvl);
            }

            if (newLvl > 0) {
                // 主动设一次，可以用这种方式修正对应任务数据
                taskBiz.setTaskValue(client, userId, c_prop.cTaskTypeKey.nobleLvl, newLvl, function() {});
            }
            nobleNum = count;
        } else if (t_itemLogic[chestId].chestType == c_prop.chestTypeKey.choose) {
            //可选宝箱   打开宝箱选择物品的index，从0开始
            var itemIndex = index || 0;
            var createDate = t_itemLogic[chestId].create;
            if (createDate && createDate.length < itemIndex) return cb(getMsg(c_msgCode.chestAbnormal)); //打开背包宝箱异常
            items[createDate[itemIndex][0]] = createDate[itemIndex][1];
        } else if (t_itemLogic[chestId].chestType == c_prop.chestTypeKey.commonUseItem) {

        } else {
            for (var i = 0; i < count; i++) {
                var logicItems = itemBiz.calLogicItems(chestId); //宝箱随机的物品
                if (t_itemLogic[chestId].chestType == c_prop.chestTypeKey.equipLvl) {
                    var equipLvlObj = {};
                    for (var key in logicItems) {
                        var equipLvlId = parseInt(key);
                        var equipLvl = parseInt(formula.calEquipLvlCfg(userData.lvl));
                        equipLvlObj[(equipLvlId + equipLvl)] = logicItems[key];
                    }
                    logicItems = equipLvlObj;
                }
                if (logicItems[c_prop.spItemIdKey.genuineQi]) {
                    if (!costObj[chestId]) costObj[chestId] = 0;
                    costObj[chestId] += 1;
                }
                items = propUtils.mergerProp(items, logicItems);
            }
        }
        //var equipBagResGrid = userUtils.getEquipBagResGrid(userData); //装备背包剩余格数
        for (var key in items) {
            if (key == c_prop.spItemIdKey.diamond) getDiamond += items[key];
            // if (t_item[key].type == c_prop.itemTypeKey.equip) { //装备需要判断背包是否有空间
            //     if (items[key] <= equipBagResGrid) {
            //         equipBagResGrid -= items[key];
            //     } else {
            //         mailItems[key] = items[key] - equipBagResGrid;
            //         items[key] = equipBagResGrid;
            //         equipBagResGrid = 0;
            //         if (items[key] == 0) delete items[key];
            //     }
            // }

            if (_isTreasureChest(chestId)) {
                treasureBiz.insertTreasureRecord(client, c_prop.treasureRecordTypeKey.openTreasure, userData, chestId, items, function(err, insertData) {
                    if (err) return console.log(err);
                });
                if (t_item[key].color >= 5) {
                    chatBiz.addSysData(76, [t_item[chestId].name, userData.nickName, t_item[key].color, t_item[key].name]);
                }
            }
        }
        //获得物品
        itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.openChest);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);
        if (Object.keys(itemsArr[5]).length > 0) isMail = true;
        expSum = itemsArr[2];
        rebirthExpSum = itemsArr[3];
        genuineQi = itemsArr[4];

        //是否需要钥匙
        if (t_itemLogic[chestId].needItems) {
            var needItems = t_itemLogic[chestId].needItems;
            var needItemsId = needItems[0];
            var needItemsNum = needItems[1] * count;
            if (!bag[needItemsId] || bag[needItemsId] < needItemsNum) return cb(getMsg(c_msgCode.noOpenTool)); //开启所需道具不足
            delBagItems[needItemsId] = needItemsNum;
            userUtils.delBag(userData, needItemsId, needItemsNum, c_prop.itemCostTypeKey.openChest);
        }
        //扣除宝箱 
        userUtils.delBag(userData, chestId, count, c_prop.itemCostTypeKey.openChest);
        delBagItems[chestId] = count;

        if (_isJinChest(chestId)) {
            chatBiz.addSysData(141, [userData.nickName, count]); //黄金箱
        } else if (_isYinChest(chestId)) {
            chatBiz.addSysData(142, [userData.nickName, count]); //白银箱
        }

        //var bag = userData.bag;
        //var medalData = userData.medalData;
        //for(var key in t_medal){
        //    if(!medalData[t_medal[key].id] && bag[t_medal[key].id] && bag[t_medal[key].id] > 0 ){
        //        userData.medalData[t_medal[key].id] = [parseInt(t_medal[key].id)*100];
        //        userData.bag[t_medal[key].id] -= 1;
        //        bagItems[t_medal[key].id] -= 1;
        //        if(userData.bag[t_medal[key].id] == 0) delete userData.bag[t_medal[key].id];
        //        if(bagItems[t_medal[key].id] == 0) delete bagItems[t_medal[key].id];
        //    }
        //}

        //更新
        var updateData = {
            lvl: userData.lvl,
            magicLvl: userData.magicLvl,
            expc: userData.expc,
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            prestige: userData.prestige,
            rebirthExp: userData.rebirthExp,
            genuineQi: userData.genuineQi,
            medalData: userData.medalData,
            exData: userData.exData,
            buff: userData.buff,
            cybExp: userData.cybExp,
            jxExp: userData.jxExp
        };
        if (nobleNum > 0) {
            updateData.noble = userData.noble;
        }

        gamePlayer.setUserDataDirty();

        return cb(null, [updateData, isMail, bagItems, delBagItems, equipBagItems, expSum, getDiamond, rebirthExpSum, genuineQi, userData.buff, nobleNum]);
    });
};

/**
 * 激活战印
 * @param client
 * @param userId
 * @param warPrintedId
 * @param cb
 */
exports.activeMedal = function(client, userId, warPrintedId, cb) {
    checkRequire();
    if (!t_medal[warPrintedId]) return cb(getMsg(c_msgCode.abnormalData)); //数据异常
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var delBagItems = {};
        var medalData = userData.medalData;
        if (medalData[warPrintedId] && !medalData[warPrintedId][1]) return cb(getMsg(c_msgCode.haveMedal)); //已拥有该称号
        var bag = userData.bag;
        if (!bag[warPrintedId] || bag[warPrintedId] <= 0) return cb(getMsg(c_msgCode.noMedal)); //还未拥有该称号
        if (userData.lvl < t_item[warPrintedId].level) return cb(getMsg(c_msgCode.NoLvlOpen));
        //添加称号数据
        var time = t_medal[warPrintedId].time || 0;
        if (time > 0) {
            let currentDate = new Date();
            let tmp = medalData[warPrintedId] || [];
            let lastTime = tmp[1] || 0;
            if (lastTime > currentDate.getTime()) {
                lastTime += time * 1000;
            } else {
                lastTime = currentDate.getTime() + time * 1000;
            }
            userData.medalData[warPrintedId] = [parseInt(warPrintedId) * 100, lastTime];
        } else {
            userData.medalData[warPrintedId] = [parseInt(warPrintedId) * 100];
        }
        delBagItems[warPrintedId] = 1;
        userUtils.delBag(userData, warPrintedId, 1, c_prop.itemCostTypeKey.medal);
        if (time == 0) { //限时称号暂时不计入称号数量
            userData.medalNum += 1; //记录勋章数量 用于排行榜
            heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.medalNum, 1);
        }
        _activeMedelBi(userData, warPrintedId);
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        return cb(null, [userData.medalData, delBagItems]);
    });
};

var _activeMedelBi = function(userData, warPrintedId) {
    if (t_medal[warPrintedId]) {
        var biObj = new biHlObj.milestoneObj(userData.accountId, "achieve", t_medal[warPrintedId].name, "roleid=" + userData.id);
        biHlBiz.HlMilestoneBi(biObj, userData.serverIndexId, userData.id, null, userData.exData[c_prop.userExDataKey.loginIP], function(err, data) {});
    }
};

/**
 * 修改战印头衔
 * @param client
 * @param userId
 * @param cb
 */
exports.setMedalTitle = function(client, userId, warPrintedId, cb) {
    checkRequire();
    if (!t_medal[warPrintedId]) return cb(getMsg(c_msgCode.abnormalData)); //数据异常
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var medalData = userData.medalData;
        if (!medalData[warPrintedId]) return cb(getMsg(c_msgCode.noMedal)); //还未拥有该称号

        //修改
        userData.medalTitle = warPrintedId;
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        return cb(null, [userData.medalTitle]);
        // var updateData = {
        //     medalTitle:userData.medalTitle
        // };
        // userDao.update(client, updateData, {id: userId}, function(err,data){
        //     if (err) return cb(err);
        //     return cb(null, [userData.medalTitle]);
        // });
    });
};

/**
 * 获取战印榜
 * @param client
 * @param userId
 * @param cb
 */
exports.getWarPrintedList = function(client, userId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var bag = userData.bag;
        var medalData = userData.medalData;
        var delBagItems = {};
        var isUpdata = false;
        var cup = userData.cup || 0;
        var capsule = userData.capsuleData || {};

        if (isUpdata) {
            for (var key in t_medal) {
                if (!medalData[t_medal[key].id] && bag[t_medal[key].id] && bag[t_medal[key].id] > 0) {
                    userData.medalData[t_medal[key].id] = [parseInt(t_medal[key].id) * 100];
                    userUtils.delBag(userData, t_medal[key].id, 1, c_prop.itemCostTypeKey.medal);
                    delBagItems[t_medal[key].id] = 1;
                }
            }
            gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
            return cb(null, [userData.medalData, isUpdata, delBagItems, cup, capsule]);
        } else {
            cb(null, [userData.medalData, isUpdata, delBagItems, cup, capsule]);
        }
    });
};

/**
 * 战印强化
 * @param client
 * @param userId
 * @param warPrintedId
 * @param cb
 */
exports.warPrintedStrength = function(client, userId, warPrintedId, cb) {
    checkRequire();
    if (!t_medal[warPrintedId]) return cb(getMsg(c_msgCode.abnormalData)); //数据异常
    //userDao.select(client,{id:userId}, function(err,userData) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        //userDao.selectCols(client, "id,lvl,bag,medalData"," id = ? ",[userId], function(err,userData) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var delBagItems = {};
        var bag = userData.bag;
        var medalData = userData.medalData;
        if (!medalData[warPrintedId]) return cb(getMsg(c_msgCode.abnormalData)); //数据异常
        var strengthLvl = medalData[warPrintedId][0];
        var nextMedalLvlId = strengthLvl + 1;
        if (!t_medalLvl[nextMedalLvlId]) return cb(getMsg(c_msgCode.medalMax)); //已强化到最高级
        var reqItems = t_medalLvl[nextMedalLvlId].reqItems || []; //所需物品
        var needLvl = t_medalLvl[nextMedalLvlId].needLvl || 999;
        if (userData.lvl < needLvl) return cb(getMsg(c_msgCode.NoLvlOpen));


        //判断合成材料
        for (var i = 0, li = reqItems.length; i < li; i++) {
            var reqCfg = reqItems[i];
            var key = reqCfg[0];
            var num = reqCfg[1];
            var ownCount = bag[key] || 0; //拥有所需合成材料的数量
            if (!ownCount || ownCount < num) return cb(getMsg(c_msgCode.materialUnenough)); //材料不足
        }

        var costMedalItem = 0;
        //扣除材料
        for (var i = 0, li = reqItems.length; i < li; i++) {
            var reqCfg = reqItems[i];
            var key = reqCfg[0];
            var num = reqCfg[1];
            delBagItems[key] = num;
            userUtils.delBag(userData, key, num, c_prop.itemCostTypeKey.medal);
            if (key == 52) // 声望之羽
                costMedalItem = num;
        }

        //加强化等级
        medalData[warPrintedId][0] = nextMedalLvlId;
        //称号强化次数（紧急委托任务）
        taskBiz.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.upMedal, 1, function() {});

        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        // userDao.update(client,updateData,{id:userId},function(err,data){
        //     if(err) return cb(err);
        return cb(null, [userData.medalData, delBagItems, costMedalItem]);
        //});
    });
};

/**
 * 获取真气值
 * @param client
 * @param userId
 * @param cb
 */
exports.getGenuineQi = function(client, userId, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            //userDao.selectCols(client,"id,lvl,genuineQi,exData",{id:userId},cb1);
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            demonLotusDao.selectCols(client, "advanceLvl", { userId: userId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            demonLotusData = data[1];
        if (!userData.exData[c_prop.userExDataKey.genuineQi] && c_genuineQi[userData.lvl]) {
            userData.exData[c_prop.userExDataKey.genuineQi] = [new Date()];
            var genuLimit = 0;
            var advanceLvl = 0;
            if (demonLotusData) advanceLvl = demonLotusData.advanceLvl;
            var genqiAccLimit = parseInt(c_demonLotus[advanceLvl].genqiAccLimit);
            genuLimit = parseInt(c_genuineQi[userData.lvl].genuLimit) + genqiAccLimit; //真气上限
            userData.genuineQi = genuLimit;
        }

        var updateData = {
            exData: userData.exData,
            genuineQi: userData.genuineQi
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        // userDao.update(client, updateData, {id: userId}, function (err, data) {
        //     if (err) return cb(err);
        cb(null, updateData);
        //});
    });
};

exports.updateCombat = function(client, userId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        heroBiz.recomputeHeroPropCombat(gamePlayer);

        var userData = gamePlayer.userData;
        var heroList = gamePlayer.heroListData;
        // heroBiz.calAndGetHeroListNotUpdate(client,userData,function(err,heroList){
        //if (err) return cb(err);
        var allCombat = 0;
        var maxCombat = 0;
        var newMedalList = [];
        for (var i = 0; i < heroList.length; i++) {
            var locHero = heroList[i];
            var locCombat = locHero.combat;
            allCombat += locCombat;
            if (locCombat > maxCombat) {
                maxCombat = locCombat;
            }
            var job = Number.tempId2Job(locHero.tempId);
            switch (job) {
                case c_prop.heroJobKey.zs:
                    exports.setMedalValueInUserData(client, userData, c_prop.medalLootTypeKey.zsCombat, locCombat, newMedalList);
                    break;
                case c_prop.heroJobKey.fs:
                    exports.setMedalValueInUserData(client, userData, c_prop.medalLootTypeKey.fsCombat, locCombat, newMedalList);
                    break;
                case c_prop.heroJobKey.ds:
                    exports.setMedalValueInUserData(client, userData, c_prop.medalLootTypeKey.gsCombat, locCombat, newMedalList);
                    break;
                case c_prop.heroJobKey.ys:
                    exports.setMedalValueInUserData(client, userData, c_prop.medalLootTypeKey.qsCombat, locCombat, newMedalList);
                    break;
            }
        }

        // 批量邮件
        var mailList = [];
        for (var i = 0; i < newMedalList.length; i++) {
            var medalId = newMedalList[i];
            var mailItems = {};
            mailItems[medalId] = 1;
            var medalCfg = t_medal[medalId];
            var mailEntity = mailBiz.createEntityByType(userId, c_prop.mailTypeKey.giveMedal, [medalCfg.outputWay], mailItems);
            mailList.push(mailEntity);
        }
        mailBiz.addMailByList(client, mailList, function(err, data) {});

        userData.combat = allCombat;
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);

        //userDao.update(client, {combat:allCombat, medalExData : userData.medalExData, medalDoneData : userData.medalDoneData}, {id: userId}, cb);
        taskBiz.setTaskValue(client, userId, c_prop.cTaskTypeKey.combat, maxCombat, function() {});
        //战斗力（紧急委托任务）
        taskBiz.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.userCombat, allCombat, function() {});
        cb(null);
        // });
    });
};


/**
 * 领取玩吧礼包
 * @param client
 * @param userId
 * @param os
 * @param gitfId
 * @param cb
 */
// exports.getWanbaGift = function(client,userId,os,giftId,cb) {
//     checkRequire();
//     userDao.select(client,{id:userId},function(err,userData){
//         if(err) return cb(err);
//         var items = {};
//         var bagItems = {};
//         var equipBagItems = {};
//         var code = 1;
//         var message = "";
//         var now = new Date();
//         var refreshDate = now.clone().setHours(giftRefreshHour, 0, 0, 0);
//         //判断今日次数
//         var wanbaGiftData = userData.record[c_prop.userRecordTypeKey.wanbaGift]||{};
//         var getGiftDate = now;
//         os = os.toLowerCase();
//         if(wanbaGiftData[os]){
//             getGiftDate = new Date(wanbaGiftData[os]);
//         }else {
//             getGiftDate = new Date(0);
//         }
//         var diffDay = getGiftDate.clone().clearTime().getDaysBetween(now.clone().clearTime());
//         if (diffDay <0 || getGiftDate.isAfter(now)){//未来
//             message = "亲，你提前消费了，你怎么做到的";
//             logger.error(message);
//             return cb(null, [-1,message,null]);
//         }else if (diffDay == 0){//当天
//             if(getGiftDate.isBefore(refreshDate) && now.isAfter(refreshDate)){
//                 code = 0;
//             }
//         }else if (diffDay == 1){//隔一天
//             if(getGiftDate.isBefore(refreshDate) || now.isAfter(refreshDate)){
//                 code = 0;
//             }
//         }else {//隔好几天
//             code = 0
//         }
//         if(code == 1){
//             return cb(null, [code,message,null]);
//         }
//         wanbaGiftData[os] = now;
//         userData.record[c_prop.userRecordTypeKey.wanbaGift] = wanbaGiftData;
//         var giftData = c_giftPack[giftId];
//         if(!giftData){
//             return cb(null, [-1, "giftId 有误", null]);
//         }
//         for (var index in giftData.content){
//             var itemData = giftData.content[index];
//             items[itemData[0]] = itemData[1];
//         }

//         var itemsArr = userUtils.saveItems(userData,items,c_prop.itemGetTypeKey.other);
//         if(Object.keys(itemsArr[0]).length>0) bagItems = propUtils.mergerProp(bagItems,itemsArr[0]);
//         if(Object.keys(itemsArr[1]).length>0) equipBagItems = propUtils.mergerProp(equipBagItems,itemsArr[1]);

//         var getGold = userUtils.getNumOfItems(items,c_prop.itemTypeKey.gold);
//         var getDiamond = userUtils.getNumOfItems(items,c_prop.itemTypeKey.diamond);
//         //var bag = userData.bag;
//         //var medalData = userData.medalData;
//         //for(var key in t_medal){
//         //    var medalId = t_medal[key].id;
//         //    if(!medalData[medalId] && bag[medalId] && bag[medalId] > 0 ){
//         //        userData.medalData[medalId] = [parseInt(medalId)*100];
//         //        userData.bag[medalId] -= 1;
//         //        bagItems[medalId] -= 1;
//         //        if(userData.bag[medalId] == 0) delete userData.bag[medalId];
//         //        if(bagItems[medalId] == 0) delete bagItems[medalId];
//         //    }
//         //}
//         var updateUser = {      //gold,diamond,buyDiamond,giveDiamond,bag,equipBag,prestige
//             gold: userData.gold,
//             diamond: userData.diamond,
//             buyDiamond: userData.buyDiamond,
//             giveDiamond: userData.giveDiamond,
//             bag: userData.bag,
//             equipBag: userData.equipBag,
//             prestige: userData.prestige,
//             medalData:userData.medalData,
//             record:userData.record
//         };

//         async.parallel([
//             function(cb1){
//                 userDao.update(client,updateUser,{id:userId},cb1);
//             }
//         ],function(err,data){
//             if(err) return cb(err);
//             delete updateUser.bag;
//             delete updateUser.equipBag;
//             return cb(null, [code, "", updateUser,getGold,getDiamond,bagItems,equipBagItems]);
//         });
//     });
// };


exports.updateSetting = function(client, userId, catNoVipChat, autoBuyLittleHorn, hideChatSys, hideChatWorld, hideChatGuild, hideDanmu, cb) {
    checkRequire();
    //userDao.select(client,{id:userId},function(err,userData){
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var exData = userData.exData || {};
        //console.log('--------------------------',catNoVipChat,autoBuyLittleHorn,hideChatSys,hideChatWorld,hideChatGuild);
        exData[c_prop.userExDataKey.catNoVipChat] = catNoVipChat;
        exData[c_prop.userExDataKey.autoBuyLittleHorn] = autoBuyLittleHorn;
        exData[c_prop.userExDataKey.hideChatSys] = hideChatSys;
        exData[c_prop.userExDataKey.hideChatWorld] = hideChatWorld;
        exData[c_prop.userExDataKey.hideChatGuild] = hideChatGuild;
        exData[c_prop.userExDataKey.hideDanmu] = hideDanmu;
        //console.log('============================',exData);
        userData.exData = exData;
        var upUserData = {
            exData: userData.exData
        }
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.exdata);
        //userDao.update(client,upUserData,{id:userId},function(err, data){
        //if(err) return cb(err);
        return cb(null, upUserData);
        //})
    });
};

exports.updateItems4Bag = function(client, userId, ItemId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var bag = userData.bag || {};
        var updateBag = {};
        updateBag[ItemId] = bag[ItemId] || 0;
        cb(null, updateBag);
    });
};

exports.syncUserInfo = function(client, userId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var updateUser = {
            // bag: userData.bag,
            noble: userData.noble
        };
        cb(null, updateUser);
    });
};

// 购买组队boss次数
exports.buyTeamBossNum = function(client, userId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var buyCount = userUtils.getTodayCount(userData, c_prop.userRefreshCountKey.buyTeamBossNum);
        var costDiamond = formula.calBuyTeamBoss(buyCount + 1);
        //判断被扣除钻石
        if (userData.diamond < costDiamond || costDiamond < 0) return cb(getMsg(c_msgCode.noDiamond)); //钻石不足

        //改变次数
        userUtils.addTodayCount(userData, c_prop.userRefreshCountKey.buyTeamBossNum, 1);
        //扣除钻石
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.buyTeamBossNum);

        //需要更新的数据
        var updateData = {
            diamond: userData.diamond,
            counts: userData.counts,
            countsRefreshTime: userData.countsRefreshTime
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        cb(null, [updateData, costDiamond]);
    });
};

exports.followTeamBoss = function(client, userId, id, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var exData = userData.exData || {};
        var followData = exData[c_prop.userExDataKey.followTeamBoss] || [];

        if (followData.indexOf(id) == -1) {
            followData.push(id);
        }
        exData[c_prop.userExDataKey.followTeamBoss] = followData;
        userData.exData = exData;

        //需要更新的数据
        var updateData = {
            exData: userData.exData,
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.exdata);
        cb(null, [updateData]);
    });
};

exports.unfollowTeamBoss = function(client, userId, id, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var exData = userData.exData || {};
        var followData = exData[c_prop.userExDataKey.followTeamBoss] || [];
        var idx = followData.indexOf(id);
        if (idx != -1) {
            followData.splice(idx, 1);
        }
        exData[c_prop.userExDataKey.followTeamBoss] = followData;
        userData.exData = exData;

        //需要更新的数据
        var updateData = {
            exData: userData.exData,
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.exdata);
        cb(null, [updateData]);
    });
};

exports.followZhongLiBoss = function(client, userId, id, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var exData = userData.exData || {};
        var followData = exData[c_prop.userExDataKey.followZLBoss] || [];

        if (followData.indexOf(id) == -1) {
            followData.push(id);
        }
        exData[c_prop.userExDataKey.followZLBoss] = followData;
        userData.exData = exData;

        //需要更新的数据
        var updateData = {
            exData: userData.exData,
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.exdata);
        cb(null, [updateData]);
    });
};

exports.unfollowZhongLiBoss = function(client, userId, id, cb) {
    checkRequire();
    //userDao.select(client,{id:userId},function(err,userData){
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var exData = userData.exData || {};
        var followData = exData[c_prop.userExDataKey.followZLBoss] || [];
        var idx = followData.indexOf(id);
        if (idx != -1) {
            followData.splice(idx, 1);
        }
        exData[c_prop.userExDataKey.followZLBoss] = followData;
        userData.exData = exData;

        //需要更新的数据
        var updateData = {
            exData: userData.exData,
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.exdata);
        cb(null, [updateData]);
    });
};

// 增加女神经验
exports.addGodnessExp = function(client, userId, sec, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var addUpExpc = c_lvl[userData.lvl].goldnessExp;
        addUpExpc = addUpExpc * sec;
        //console.log("BEFORE addGodnessExp:", userData.lvl, userData.expc, addUpExpc, sec);
        userUtils.addUserExpc(userData, addUpExpc);
        //console.log("AFTER addGodnessExp:", userData.lvl, userData.expc );
        //需要更新的数据
        var updateData = {
            lvl: userData.lvl,
            magicLvl: userData.magicLvl,
            expc: userData.expc,
            strength: userData.strength
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        cb(null, [updateData]);
    });
};

// 增加礼包
exports.addWChest = function(client, userId, chestId, isOpen, cb) {
    checkRequire();
    console.error("addWChest:", userId, chestId);
    //userDao.select(client,{id:userId},function(err,userData){
    //userDao.selectCols(client, "id,bag,lvl,expc"," id = ? ",[userId], function(err,userData) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var items = {};
        if (isOpen) {
            var logicItems = itemBiz.calLogicItems(chestId); //宝箱随机的物品
            items = propUtils.mergerProp(items, logicItems);
        } else {
            items[chestId] = 1;
        }
        userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.shop);
        //需要更新的数据
        var updateData = {
            lvl: userData.lvl,
            magicLvl: userData.magicLvl,
            expc: userData.expc
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);

        cb(null, [updateData, items]);
    });
};

/**
 * 通过tempId(iconId) 初始化英雄升星数据
 * @param client
 * @param userData
 * @param cb
 */
exports.initHeroStar = function(userData, tempId, cb) {
    checkRequire();
    if (userData.heroData[tempId]) return;
    var heroData = userData.heroData;
    var exData = userData.exData;
    if (Array.isArray(heroData[tempId])) return;
    var heroStarId = (tempId + '000') * 1; //skillId
    var t_heroStarCfg = t_heroStar[heroStarId];
    if (!t_heroStarCfg || !t_heroStarCfg.skillId) {
        return cb(getMsg(c_msgCode.configError)); //配置错误
    }
    var skillId = t_heroStarCfg.skillId;
    //英雄数据{法宝id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...}]}
    var t = Math.floor(Date.now() / 1000);
    // heroData[tempId] = [0,0,0,10,{"1":skillId},t];
    heroData[tempId] = [0, 0, 0, 10, {}, t, 0, 0];

    // 更新heroSum
    userData.heroNum = Object.keys(heroData).length;

    var type = t_talismanSkill[skillId].type;
    if (type != c_prop.talismanSkillTypeKey.property) { //记录到exData
        if (!exData[c_prop.userExDataKey.talismanSkill]) exData[c_prop.userExDataKey.talismanSkill] = {};
        if (!exData[c_prop.userExDataKey.talismanSkill][type]) exData[c_prop.userExDataKey.talismanSkill][type] = [];
        exData[c_prop.userExDataKey.talismanSkill][type].push(skillId);
    }

    var userId = userData.id;
    heroBiz.activeHeroTask(userId, tempId);
    //勋章成就  解锁角色(职业的皮肤)
    exports.setMedalValue(uwClient, userId, c_prop.medalLootTypeKey.clearHeroSkin, userData.heroNum, function() {});
    //累计拥有XX个英雄 累计拥有XX个SSR英雄
    taskBiz.setTaskValue(uwClient, userId, c_prop.cTaskTypeKey.heroSkinNum, userData.heroNum, function() {});
    if (t_hero[tempId].talismanstar == 3) {
        taskBiz.setTaskValue(uwClient, userId, c_prop.cTaskTypeKey.heroSkinSSRNum, 1, function() {});
    }
};


exports.relive = function(client, userId, type, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var costValue = 100;
        if (userData.diamond < costValue) {
            return cb(getMsg(c_msgCode.noDiamond));
        }

        userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costValue, c_prop.diamondCostTypeKey.relive);

        //需要更新的数据
        var updateData = {
            diamond: userData.diamond,
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        cb(null, [updateData, costValue]);
    });
};

exports.inspireWorldBoss = function(client, userId, bossId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);

        var userData = gamePlayer.userData;
        var costDiamond = c_game.worldBossCfg[10];
        if (userData.diamond < costDiamond || costDiamond < 0) {
            return cb(getMsg(c_msgCode.noDiamond));
        }

        userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.inspire);

        //需要更新的数据
        var updateData = {
            diamond: userData.diamond,
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        cb(null, [updateData]);
    });
};

exports.wbHurt = function(client, userId, hurt, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);

        var userData = gamePlayer.userData;
        var wbHurtData = userUtils.getWBHurtAwardData(userData);
        wbHurtData.hurt = hurt;
        userData.exData[c_prop.userExDataKey.wbHurtAward] = wbHurtData;

        //console.error("wbHurtYYY:", wbHurtData, hurt);

        //需要更新的数据
        var updateData = {
            exData: userData.exData,
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.exData);
        cb(null, [updateData]);
    });
};
/******************************************************************************************************/

//判断是否是秘宝宝箱
var _isTreasureChest = function(chestId) {
    var itemId = parseInt(chestId);
    if (itemId > 7000 && itemId < 8000) {
        return true;
    }
    return false;
}

//判断是否 黄金箱
var _isJinChest = function(chestId) {
    var itemId = parseInt(chestId);
    if (itemId >= 5301 && itemId <= 5320) {
        return true;
    }
    return false;
}
//判断是否 白银箱
var _isYinChest = function(chestId) {
    var itemId = parseInt(chestId);
    if (itemId >= 5201 && itemId <= 5220) {
        return true;
    }
    return false;
}

/**
 * 计算购买金币暴击
 * @returns {number}
 * @private
 */
var _calBuyGoldCrit = function() {
    var buyGoldCfg = commonUtils.strToObj(c_game.goldBuySet[1]);
    var critNum = 1;
    var random = Math.random() * 10000;
    for (var key in buyGoldCfg) {
        var locRange = parseInt(key);
        if (random < locRange) {
            critNum = buyGoldCfg[key];
            break;
        }
    }
    return critNum;
};


//更新扩展数据
var _updateExData = function(client, userId, key, value, cb) {
    checkRequire();
    //userDao.selectCols(client, "exData", {id:userId}, function(err,userData) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(null);
        var userData = gamePlayer.userData;
        userData.exData[key] = value;
        var updateData = {
            exData: userData.exData
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.exdata);
        //userDao.update(client,updateData,{id:userId},function(err,data){
        //if(err) return cb(err);
        cb(null, updateData);
        //});
    });
};

/******************************************************************************************************/
//勋章成就完成数据记录接口
exports.setMedalValue = function(client, userId, lootType, count, cb) {
    checkRequire();
    //medalSerial.add(userId,function(cb1){
    _setMedalValue(client, userId, lootType, count, function(err, data) {
        cb(err, data);
        //cb1(err,data);
    });
    //});
}
/**
 * 记录勋章成就的数值并在达成条件时发放勋章邮件
 * @param client
 * @param userId
 * @param lootType 勋章获取类型
 * @param args   条件参数数组
 * @param cb
 */
var _setMedalValue = function(client, userId, lootType, count, cb) {

    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        if (!c_prop.medalLootType[lootType]) return cb(getMsg(c_msgCode.noKindOfMedal)); //没有此类型的勋章成就
        userData.medalExData = userData.medalExData || {};
        var medalExData = userData.medalExData; //勋章成就 完成数据  {"子类型":数量,"子类型":数量,...}
        userData.medalDoneData = userData.medalDoneData || [];
        var medalDoneData = userData.medalDoneData; //已经发放过的
        //var count = Array.isArray(args)?args[0]||args;
        //记录累加型的  
        if (lootType == c_prop.medalLootTypeKey.equipSmelt || lootType == c_prop.medalLootTypeKey.clearHero || lootType == c_prop.medalLootTypeKey.encounter ||
            lootType == c_prop.medalLootTypeKey.wing || lootType == c_prop.medalLootTypeKey.rankFighting || lootType == c_prop.medalLootTypeKey.petNum) {
            var value = medalExData[lootType] || 0;
            userData.medalExData[lootType] = value + count;
        }
        //记录最高值型的 （0  1  2  3  5  10 4 9 12 13）
        if (lootType == c_prop.medalLootTypeKey.heroGem || lootType == c_prop.medalLootTypeKey.personLvl || lootType == c_prop.medalLootTypeKey.skillLvl ||
            lootType == c_prop.medalLootTypeKey.equipStrength || lootType == c_prop.medalLootTypeKey.equipUpStar || lootType == c_prop.medalLootTypeKey.gemUp ||
            lootType == c_prop.medalLootTypeKey.combat || lootType == c_prop.medalLootTypeKey.closeTollGate || lootType == c_prop.medalLootTypeKey.equipCopy ||
            lootType == c_prop.medalLootTypeKey.hell || lootType == c_prop.medalLootTypeKey.state || lootType == c_prop.medalLootTypeKey.guild ||
            lootType == c_prop.medalLootTypeKey.zsCombat || lootType == c_prop.medalLootTypeKey.fsCombat || lootType == c_prop.medalLootTypeKey.gsCombat ||
            lootType == c_prop.medalLootTypeKey.qsCombat || lootType == c_prop.medalLootTypeKey.heartLayer || lootType == c_prop.medalLootTypeKey.paTa ||
            lootType == c_prop.medalLootTypeKey.jxLvl || lootType == c_prop.medalLootTypeKey.cybLvl || lootType == c_prop.medalLootTypeKey.achieveLvl ||
            lootType == c_prop.medalLootTypeKey.clearHeroSkin) {
            var value = medalExData[lootType] || 0;
            if (count > value) {
                userData.medalExData[lootType] = count;
            }
            // else{
            //     //新值不大于老值 不做处理
            //     return cb();
            // }
        }
        var giveMedalIds = _getGiveMedals(userData, lootType, userData.medalExData[lootType]);
        for (var medalId in giveMedalIds) {
            //console.log("\033[45;37m 可以发放的勋章ID列表可以发放的勋章ID列表可以发放的勋章ID列表可以发放的勋章ID列表可以发放的勋章ID列表 \033[0m"+medalId);                 
            var mailItems = {};
            mailItems[medalId] = giveMedalIds[medalId];
            var medalCfg = t_medal[medalId];
            mailBiz.addByType(client, userId, c_prop.mailTypeKey.giveMedal, [medalCfg.outputWay], mailItems, function() {});
            //不重复产出的类型 发一次后就不发了
            if (!t_medal[medalId].isLoop) {
                medalDoneData.push(parseInt(medalId));
            }
            //TODO 记录发邮件日志
        }

        //更新
        userData.medalDoneData = medalDoneData;
        var updateData = {
            medalExData: userData.medalExData,
            medalDoneData: userData.medalDoneData
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.medal);

        // userDao.update(client,updateData,{id:userId},function(err,data){
        //     if(err) return cb(err);
        cb(null, updateData);
        //});
    });
};


/**
 * 记录勋章成就的数值 ,只修改 userData里的 medalExData. medalDoneData, 不做数据库修改
 * @param client
 * @param userId
 * @param lootType 勋章获取类型
 * @param args   条件参数数组
 * @param newMedals 是输出参数 需要发奖的medalId列表
 */
exports.setMedalValueInUserData = function(client, userData, lootType, count, newMedals) {
    if (!c_prop.medalLootType[lootType]) return;
    userData.medalExData = userData.medalExData || {};
    userData.medalDoneData = userData.medalDoneData || [];
    //var count = Array.isArray(args)?args[0]||args;
    //记录累加型的  
    if (lootType == c_prop.medalLootTypeKey.equipSmelt || lootType == c_prop.medalLootTypeKey.clearHero || lootType == c_prop.medalLootTypeKey.encounter ||
        lootType == c_prop.medalLootTypeKey.wing || lootType == c_prop.medalLootTypeKey.rankFighting || lootType == c_prop.medalLootTypeKey.petNum) {
        var value = userData.medalExData[lootType] || 0;
        userData.medalExData[lootType] = value + count;
    }
    //记录最高值型的 （0  1  2  3  5  10 4 9 12 13）
    if (lootType == c_prop.medalLootTypeKey.heroGem || lootType == c_prop.medalLootTypeKey.personLvl || lootType == c_prop.medalLootTypeKey.skillLvl ||
        lootType == c_prop.medalLootTypeKey.equipStrength || lootType == c_prop.medalLootTypeKey.equipUpStar || lootType == c_prop.medalLootTypeKey.gemUp ||
        lootType == c_prop.medalLootTypeKey.combat || lootType == c_prop.medalLootTypeKey.closeTollGate || lootType == c_prop.medalLootTypeKey.equipCopy ||
        lootType == c_prop.medalLootTypeKey.hell || lootType == c_prop.medalLootTypeKey.state || lootType == c_prop.medalLootTypeKey.guild ||
        lootType == c_prop.medalLootTypeKey.zsCombat || lootType == c_prop.medalLootTypeKey.fsCombat || lootType == c_prop.medalLootTypeKey.gsCombat ||
        lootType == c_prop.medalLootTypeKey.qsCombat || lootType == c_prop.medalLootTypeKey.heartLayer || lootType == c_prop.medalLootTypeKey.paTa ||
        lootType == c_prop.medalLootTypeKey.jxLvl || lootType == c_prop.medalLootTypeKey.cybLvl || lootType == c_prop.medalLootTypeKey.achieveLvl ||
        lootType == c_prop.medalLootTypeKey.clearHeroSkin) {
        var value = userData.medalExData[lootType] || 0;
        if (count > value) {
            userData.medalExData[lootType] = count;
        }
        // else{
        //     //新值不大于老值 不做处理
        //     return cb();
        // }
    }
    var giveMedalIds = _getGiveMedals(userData, lootType, userData.medalExData[lootType] || 0);
    for (var medalId in giveMedalIds) {
        newMedals.push(medalId);
        userData.medalDoneData.push(parseInt(medalId));
    }
};

//判断是否有数据，无数据插入一条
// var _getRecordData = function(client,userId,cb){
//     userDao.select(client,{id:userId},function(err,userData) {
//         if(err) return cb(err);
//         cb(null,userData);        
//     });
// };
//获取哪些勋章可以发放
var _getGiveMedals = function(userData, lootType, count) {
    var giveMedalIds = {};
    userData.medalDoneData = userData.medalDoneData || []; //已经发放过的
    var medalDoneData = userData.medalDoneData;
    var medals = t_medalHelp[lootType];
    if (!medals || medals.length <= 0) return {};
    medals.forEach(function(medalId, index) {
        var medalCfg = t_medal[medalId];
        if (medalDoneData.indexOf(parseInt(medalId)) != -1 && medalCfg.isLoop == 0) {
            return;
        }
        if (count >= medalCfg.targetValue) {
            giveMedalIds[medalCfg.id] = 1;
        }
    });
    return giveMedalIds;
};

var _sendOnlineData = function(userId, ip) {

    var gamePlayer = g_cache.getGamePlayerInCache(userId);
    if (gamePlayer) {
        var obj = new biHlObj.beatObj(gamePlayer.getAccount(), ip);
        biHlBiz.HlBeatBi(obj, null, userId, gamePlayer.accountData, ip, function(err, data) {});
    }
};

var _handleSdk = function(client, gamePlayer) {
    // 爱微游 
    if (gamePlayer.getChannelId() == 10010 || gamePlayer.getChannelId() == 10006 || gamePlayer.getChannelId() == 10011) {
        if (!gamePlayer.accountData.sdkData) {
            return;
        }
        var userData = gamePlayer.userData;
        userData.exData = userData.exData || {};
        _checkAwyData(userData);

        var awyData = userData.exData[c_prop.userExDataKey.awyData];
        if (gamePlayer.accountData.sdkData['focus'] == 1) {
            if (awyData.focus[1] == 0) {

                // 发送关注邮件
                _sendFocusReward(client, gamePlayer.userData.id);
                awyData.focus[1] = 1;
            }
            awyData.focus[0] = 1;
        }

        if (gamePlayer.accountData.sdkData['verify'] == 1) {
            awyData.verify[0] = 1;
        }
    }

};

var _sendFocusReward = function(client, userId) {
    mailBiz = mailBiz || require("uw-mail").mailBiz;

    // 获取掉落包
    var chestId = c_game.sdkShareCfg[1];
    var logicItems = itemBiz.calLogicItems(chestId); //随机的物品
    var getDiamond = 0;
    if (logicItems[c_prop.spItemIdKey.diamond]) {
        getDiamond = logicItems[c_prop.spItemIdKey.diamond];
    }

    mailBiz.addByType(client, userId, 78, [], logicItems, function(err, data) {});
};

var _checkAwyData = function(userData) {
    if (!userData.exData[c_prop.userExDataKey.awyData]) {
        userData.exData[c_prop.userExDataKey.awyData] = {
            focus: [0, 0],
            verify: [0, 0],
            share: [0, new Date(), new Date().addDays(-1), [0, 0, 0]]
        };
    }
    if (!userData.exData[c_prop.userExDataKey.awyData].share) {
        userData.exData[c_prop.userExDataKey.awyData].share = [0, new Date(), new Date().addDays(-1), [0, 0, 0]];
    }

    var shareDay = userData.exData[c_prop.userExDataKey.awyData].share[1];
    if (typeof shareDay == "string") {
        shareDay = new Date(shareDay);
    }

    // 过了一天重新算
    if (!shareDay.equalsDay(new Date())) {
        userData.exData[c_prop.userExDataKey.awyData].share = [0, new Date(), new Date().addDays(-1), [0, 0, 0]];
    }
};

//战士达到100W战力发勋章测试
//exports.setMedalValue(require("uw-db").uwClient,70974,c_prop.medalLootTypeKey.zsCombat,1100000,function(err, data){console.log(err)});
//星座达到指定层
//exports.setMedalValue(require("uw-db").uwClient,70974,c_prop.medalLootTypeKey.heartLayer,25,function(err, data){console.log(err)});

/**
 * 升级奖杯
 * @param client
 * @param userId
 * @param cb
 */
exports.upgradeCup = function(client, userId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        userData.cup = userData.cup || 0;
        var currentCup = userData.cup;

        if (!t_collector[currentCup + 1] || t_collector[currentCup + 1].exp > _countCupValue(userData.medalData)) {
            return cb(getMsg(c_msgCode.noMedal));
        }

        //修改
        userData.cup = currentCup + 1;
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);

        return cb(null, [userData.cup]);
    });
};

var _countCupValue = function(medalData) {
    var total = 0;
    for (var key in medalData) {
        var locMedalId = parseInt(key);
        var t_medalData = t_medal[locMedalId];
        total += t_medalData.cupValue || 0;
    }
    return total;
};

/**
 * 使用胶囊
 * @param client
 * @param userId
 * @param capsuleId
 * @param cb
 */
exports.useCapsule = function(client, userId, capsuleId, cb) {
    checkRequire();
    if (!t_itemAttribute[capsuleId] || t_itemAttribute[capsuleId].type != 1) return cb(getMsg(c_msgCode.protocolError));
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        userData.capsuleData = userData.capsuleData || {};
        var useNum = userData.capsuleData[capsuleId] || 0;
        if (useNum + 1 > t_itemAttribute[capsuleId].limit) {
            return cb(getMsg(c_msgCode.noItem));
        }
        var bag = userData.bag || {};
        if (!bag[capsuleId] || bag[capsuleId] < 1) {
            return cb(getMsg(c_msgCode.noItem));
        }
        var delItems = {};
        userUtils.delBag(userData, capsuleId, 1, c_prop.itemCostTypeKey.useCapsule);
        delItems[capsuleId] = 1;
        //修改
        userData.capsuleData[capsuleId] = useNum + 1;
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        return cb(null, [userData.capsuleData, delItems]);
    });
};

/**
 * 领取英雄入口任务奖励
 * @param client
 * @param userId
 * @param taskId
 * @param cb
 */
exports.receiveHeroEntranceTask = function(client, userId, taskId, cb) {
    if (!c_task[taskId]) return cb(getMsg(c_msgCode.protocolError));
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        let userData = gamePlayer.userData;
        userData.exData[c_prop.userExDataKey.heroEntranceTask] = userData.exData[c_prop.userExDataKey.heroEntranceTask] || {};
        let exData = userData.exData[c_prop.userExDataKey.heroEntranceTask];
        if (!exData || exData[taskId] != 1) return cb(getMsg(c_msgCode.protocolError));
        exData[taskId] = 2;

        let bagItems = {};
        let rewardId = c_task[taskId].rewardId;
        let itemsArr = userUtils.saveItems(userData, c_reward[rewardId].rewardItems, c_prop.itemGetTypeKey.other);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);

        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        let updateUserData = {
            exData: userData.exData
        };

        return cb(null, [updateUserData, bagItems]);
    });
};

/**
 * 获取扩展字段信息
 * @param client
 * @param userId
 * @param cb
 */
exports.getExData = function(client, userId, cb) {
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        let userData = gamePlayer.userData;
        let updateUserData = {
            exData: userData.exData
        };

        return cb(null, updateUserData);
    });
};

/**
 * 购买月卡和周卡
 * @param client
 * @param userId
 * @param cardId
 * @param cb
 */
exports.buyMonthlyOrWeekCard = function(client, userId, cardId, cb) {
    if (cardId != c_prop.rechargeIdKey.month && cardId != c_prop.rechargeIdKey.week) return cb(getMsg(c_msgCode.protocolError));
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        let userData = gamePlayer.userData;
        let cost = 0;
        if (cardId == c_prop.rechargeIdKey.month) {
            cost = c_game.mouthlycard[0];
        } else if (cardId == c_prop.rechargeIdKey.week) {
            cost = c_game.mouthlycard[1];
        }
        let spItemId = c_prop.spItemIdKey.dScore;
        userData.bag = userData.bag || {};
        let bag = userData.bag;
        let own = bag[spItemId] || 0;
        let delBag = {};
        if (own < cost) return cb(getMsg(c_msgCode.noIntegral));
        userUtils.delBag(userData, spItemId, cost, c_prop.itemCostTypeKey.other);
        delBag[spItemId] = cost;
        let exData = userData.exData || {};
        if (cardId == c_prop.rechargeIdKey.month) {
            userUtils.addMonthCardBuff(userData);
            userUtils.addCurrency(userData, c_prop.currencyTypeKey.diamond, c_game.mouthlycard[2], c_prop.itemGetTypeKey.other);
            let buyMonthlyCardNum = exData[c_prop.userExDataKey.monthlycardbuyNum] || 0;
            exData[c_prop.userExDataKey.monthlycardbuyNum] = buyMonthlyCardNum + 1;
            if (buyMonthlyCardNum == 0) {
                chatBiz.addSysData(103, [userData.nickName]);
            }
            taskBiz.setTaskValue(client, userId, c_prop.cTaskTypeKey.buyMonthCard, 1, function() {});
        } else if (cardId == c_prop.rechargeIdKey.week) {
            userUtils.addWeekCardBuff(userData);
            userUtils.addCurrency(userData, c_prop.currencyTypeKey.diamond, c_game.mouthlycard[3], c_prop.itemGetTypeKey.other);
            let buyWeekCardNum = exData[c_prop.userExDataKey.weeklycardbuyNum] || 0;
            exData[c_prop.userExDataKey.weeklycardbuyNum] = buyWeekCardNum + 1;
            if (buyWeekCardNum == 0) {
                chatBiz.addSysData(104, [userData.nickName]);
            }
            taskBiz.setTaskValue(client, userId, c_prop.cTaskTypeKey.buyWeekCard, 1, function() {});
        }
        userData.exData = exData;
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(delBag));
        let updateUser = {
            buff: userData.buff,
            diamond: userData.diamond,
            exData: userData.exData
        };

        return cb(null, [updateUser, delBag]);
    })
};


/**
 * 激活贵族
 * @param client
 * @param userId
 * @param activityId
 * @param cb
 */
exports.activeNoble = function(client, userId, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        let gamePlayer = data[0];
        let userData = gamePlayer.userData;

        if (!userData.noble || (Array.isArray(userData.noble) && userData.noble.length === 0)) {
            __initNobleData(userData);
        }
        let nobleData = userData.noble;
        if (nobleData[2]) return cb(getMsg(c_msgCode.isActivate));
        let spItemId = c_prop.spItemIdKey.dScore;
        userData.bag = userData.bag || {};
        let bag = userData.bag;
        let own = bag[spItemId] || 0;
        let delBag = {};
        if (own < c_game.vip[0]) return cb(getMsg(c_msgCode.noIntegral));
        userUtils.delBag(userData, spItemId, c_game.vip[0], c_prop.itemCostTypeKey.other);
        delBag[spItemId] = c_game.vip[0];
        //[消耗积分数，登录获得点数，是否激活，免费点数获得时间，{贵族等级:每日福利领取时间}，[已购买礼包贵族等级IDs], 每日登录时的贵族等级(用来处理戴老板的蛋疼需求), 每日首次登录时间]
        nobleData[2] = 1;
        nobleData[1] += 1; //c_game.vip[2]  初始激活不给5点给1点 by 戴权
        nobleData[3] = new Date();
        nobleData[6] = 1;
        nobleData[7] = new Date();

        chatBiz.addSysData(168, [userData.nickName]);
        chatBiz.addSysData(169, [userData.nickName]);
        var newLvl = userUtils.getNobleLevel(nobleData);
        taskBiz.setTaskValue(client, userId, c_prop.cTaskTypeKey.nobleLvl, newLvl, function() {});
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);

        let updateUser = {
            noble: userData.noble
        };

        return cb(null, [updateUser, delBag]);
    })
};

/**
 * 贵族登录检测
 * @param client
 * @param userId
 */
exports.nobleLogin = function(client, userId) {
    checkRequire();
    async.parallel([
        function(cb) {
            g_cache.getGamePlayer(client, userId, cb);
        }
    ], function(err, data) {
        if (err) return;
        let gamePlayer = data[0];
        let userData = gamePlayer.userData;
        let changed = false;
        // console.error('nobleLogin-------1111-------->',userData.noble);
        if (!userData.noble || (Array.isArray(userData.noble) && userData.noble.length === 0)) {
            changed = true;
            __initNobleData(userData);
            // console.error('__initNobleData--------------->',userData.noble);
        }
        let nobleData = userData.noble;
        let isActivate = nobleData[2];

        let oldLvl = userUtils.getNobleLevel(nobleData);
        if (isActivate) {
            if (!nobleData[3] || !new Date(nobleData[3]).isToday()) {
                nobleData[3] = new Date();
                nobleData[1] += c_game.vip[2];
                changed = true;
            }
            if (!new Date(nobleData[7]).isToday()) {
                nobleData[7] = new Date();
                // console.error('nobleLogin-----2---------->',nobleData);
                nobleData[6] = userUtils.getNobleLevel(nobleData);
                changed = true;
            }
        }

        let newLvl = userUtils.getNobleLevel(nobleData);
        if (newLvl > oldLvl) {
            taskBiz.setTaskValue(client, userId, c_prop.cTaskTypeKey.nobleLvl, newLvl, function() {});
            __addNobleSysData(userData.nickName, newLvl);
        }
        if (changed) {
            gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        }
    })
};

/**
 * 贵族奖励领取
 * @param client
 * @param userId
 */
exports.nobleReceive = function(client, userId, type, nobleLevel, cb) {
    checkRequire();
    //type 领取的类型,0为日常, 1为VIP购买 
    if (type != 0 && type != 1) return cb(getMsg(c_msgCode.paramsError));

    async.parallel([
        function(cb) {
            g_cache.getGamePlayer(client, userId, cb);
        }
    ], function(err, data) {
        if (err) return;
        let gamePlayer = data[0];
        let userData = gamePlayer.userData;
        //[消耗积分数，登录获得点数，是否激活，免费点数获得时间，{贵族等级:每日福利领取时间}，[已购买礼包贵族等级IDs], 每日登录时的贵族等级(用来处理戴老板的蛋疼需求), 每日首次登录时间]
        let nobleData = userData.noble;
        if (!nobleData || !nobleData[2]) return cb(getMsg(c_msgCode.nonstandard));
        let curNobleLevel = userUtils.getNobleLevel(nobleData);
        if (curNobleLevel == 0 || nobleLevel == 0 || curNobleLevel < nobleLevel) return cb(getMsg(c_msgCode.nonstandard));
        let items = {};
        let rewardId = null;
        switch (type) {
            case 0: //0为日常
                if (nobleLevel < nobleData[6]) return cb(getMsg(c_msgCode.nonstandard));
                let dailyRewards = nobleData[4];
                rewardId = c_game.vip[4].split(",")[nobleLevel - 1];
                if (dailyRewards[nobleLevel] && new Date(dailyRewards[nobleLevel]).isToday()) return cb(getMsg(c_msgCode.nonstandard));
                dailyRewards[nobleLevel] = new Date();
                break;
            case 1: //1为购买贵族礼包
                let rewardAndCost = c_game.vip[5].split(",")[nobleLevel - 1].split(":") || [];
                let costDiamond = parseInt(rewardAndCost[1]);
                if (userData.diamond < costDiamond || costDiamond < 0) return cb(getMsg(c_msgCode.noDiamond));
                rewardId = rewardAndCost[0];
                if (nobleData[5].indexOf(nobleLevel) != -1) return cb(getMsg(c_msgCode.hasReward));
                nobleData[5].push(nobleLevel);
                userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.activity);
                break;
        }
        userData.noble = nobleData;

        let c_rewardData = c_reward[rewardId];
        if (c_rewardData.prestige > 0) {
            userUtils.addCurrency(userData, c_prop.currencyTypeKey.prestige, c_rewardData.prestige, c_prop.itemGetTypeKey.noble);
        }
        if (c_rewardData.gold > 0) {
            userUtils.addCurrency(userData, c_prop.currencyTypeKey.gold, c_rewardData.gold, c_prop.itemGetTypeKey.noble);
        }
        if (c_rewardData.diamond > 0) {
            userUtils.addCurrency(userData, c_prop.currencyTypeKey.diamond, c_rewardData.diamond, c_prop.itemGetTypeKey.noble);
        }
        items = c_rewardData.rewardItems;
        var itemsArr = [];
        var bagItems = {};
        var equipBagItems = {};

        itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.event);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);

        var updateData = {
            gold: userData.gold,
            honor: userData.honor,
            diamond: userData.diamond,
            prestige: userData.prestige,
            giveDiamond: userData.giveDiamond,
            buyDiamond: userData.buyDiamond,
            heroData: userData.heroData,
            noble: userData.noble
        };
        gamePlayer.setUserDataDirty();

        cb(null, [updateData, bagItems, equipBagItems]);
    });
};

/**
 * 贵族积分消耗检测
 * @param client
 * @param userId
 * @param value
 */
exports.nobleCost = function(client, userId, value) {
    if (value <= 0) return;
    checkRequire();
    async.parallel([
        function(cb) {
            g_cache.getGamePlayer(client, userId, cb);
        }
    ], function(err, data) {
        if (err) return;
        let gamePlayer = data[0];
        let userData = gamePlayer.userData;
        // let nobleData = userData.noble;
        // if (!nobleData || !nobleData[2]) return;
        if (!userData.noble || (Array.isArray(userData.noble) && userData.noble.length === 0)) {
            __initNobleData(userData);
        }
        let nobleData = userData.noble;

        let oldLvl = userUtils.getNobleLevel(nobleData);
        nobleData[0] += value;
        let newLvl = userUtils.getNobleLevel(nobleData);
        if (newLvl > oldLvl) { //未激活时 newLvl oldLvl 都是0 不影响
            taskBiz.setTaskValue(client, userId, c_prop.cTaskTypeKey.nobleLvl, newLvl, function() {});
            __addNobleSysData(userData.nickName, newLvl);
        }

        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
    })
};

var __addNobleSysData = function(nickName, nobleLvl) {
    checkRequire();
    switch (nobleLvl) {
        case 5:
            chatBiz.addSysData(170, [nickName]);
            chatBiz.addSysData(171, [nickName]);
            break;
        case 6:
            chatBiz.addSysData(172, [nickName]);
            chatBiz.addSysData(173, [nickName]);
            break;
        case 7:
            chatBiz.addSysData(174, [nickName]);
            chatBiz.addSysData(175, [nickName]);
            break;
        case 8:
            chatBiz.addSysData(176, [nickName]);
            chatBiz.addSysData(177, [nickName]);
            break;
        case 9:
            chatBiz.addSysData(178, [nickName]);
            chatBiz.addSysData(179, [nickName]);
            break;
        case 10:
            chatBiz.addSysData(180, [nickName]);
            chatBiz.addSysData(181, [nickName]);
            break;
    }
};

var __initNobleData = function(userData) {
    //[消耗积分数，登录获得点数，是否激活，免费点数获得时间，{贵族等级:每日福利领取时间}，[已购买礼包贵族等级IDs], 每日登录时的贵族等级(用来处理戴老板的蛋疼需求), 每日首次登录时间]
    var nobleData = [0, 0, 0, 0, {},
        [], 0, new Date()
    ];
    // nobleData[0] = 0;
    // nobleData[1] = 0;
    // nobleData[2] = 0;
    // nobleData[3] = 0;
    // nobleData[4] = {};
    // nobleData[5] = [];
    // nobleData[6] = 0;
    // nobleData[7] = new Date();
    userData.noble = nobleData;
};

//========================================================精灵觉醒========================================================

/**
 * 精灵觉醒激活
 * @param client
 * @param userId
 * @param elfId
 * @param cb
 */
exports.elfWakingActivate = function(client, userId, elfId, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData;
        if (!userData.bag) userData.bag = {};
        var bag = userData.bag;
        var delBagItems = {};
        var elfWakingData = userData.elfWakingData || {};
        //console.error("=========elfWakingData==========",elfWakingData);
        if (elfWakingData[elfId]) return cb(getMsg(c_msgCode.isActivate)); //已激活

        //console.error("=========elfId==========",elfId);
        var wakingData = t_elfWaking[elfId];
        if (!wakingData) return cb(getMsg(c_msgCode.configError)); //配置异常;

        if (wakingData.target && t_elfWakingLvl[elfWakingData[wakingData.target[0]]].lvl < wakingData.target[1]) {
            return cb(getMsg(c_msgCode.nonstandard)); //觉醒条件未满足;
        }

        var reqItems = bag[wakingData.reqItems[0]] || 0; //精灵觉醒道具数量
        //console.error("=========reqItems,wakingData.reqItems[1]==========",reqItems,wakingData.reqItems[1]);
        if (reqItems < wakingData.reqItems[1]) return cb(getMsg(c_msgCode.materialUnenough)); //觉醒材料数量不足;
        delBagItems[wakingData.reqItems[0]] = wakingData.reqItems[1];
        userUtils.delBag(userData, wakingData.reqItems[0], wakingData.reqItems[1], c_prop.itemCostTypeKey.elfWaking);

        elfWakingData[elfId] = elfId;

        //console.error("=========elfWakingData,userData.elfWakingData==========",elfWakingData,userData.elfWakingData);
        //更新英雄属性propArr
        var heroList = gamePlayer.heroListData;
        for (var i = 0; i < heroList.length; i++) {
            var locHero = heroList[i];
            locHero.propArr = heroPropHelper.calHeroProp(userData, locHero);
            locHero.combat = heroPropHelper.calCombat(userData, locHero);

            var upHeroData = {
                propArr: locHero.propArr,
                combat: locHero.combat
            };
            gamePlayer.setHeroDataDirty(locHero.id);
        }
        //更新
        var upUserData = {
            elfWakingData: elfWakingData
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(delBagItems));
        cb(null, [upUserData, heroList, delBagItems]);
    });
};

/**
 * 精灵觉醒升级
 * @param client
 * @param userId
 * @param elfId
 * @param cb
 */
exports.elfWakingUpgrade = function(client, userId, elfId, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData;
        if (!userData.bag) userData.bag = {};
        var bag = userData.bag;
        var delBagItems = {};
        var elfWakingData = userData.elfWakingData || {};
        if (!elfWakingData[elfId]) return cb(getMsg(c_msgCode.noActivate)); //未激活

        var lvlId = elfWakingData[elfId];
        //console.error("=========lvlId==========",lvlId);
        var wakingLvlData = t_elfWakingLvl[lvlId];
        if (!wakingLvlData) return cb(getMsg(c_msgCode.configError)); //配置异常;
        if (!wakingLvlData.nextId) return cb(getMsg(c_msgCode.lvMax)); //觉醒精灵已满级;

        var reqItems = bag[wakingLvlData.cost[0]] || 0; //精灵觉醒升级道具数量
        if (reqItems < wakingLvlData.cost[1]) return cb(getMsg(c_msgCode.materialUnenough)); //升级材料数量不足;
        delBagItems[wakingLvlData.cost[0]] = wakingLvlData.cost[1];
        userUtils.delBag(userData, wakingLvlData.cost[0], wakingLvlData.cost[1], c_prop.itemCostTypeKey.elfWaking);

        elfWakingData[elfId] = wakingLvlData.nextId;

        //console.error("=========elfWakingData==========",elfWakingData);

        //更新英雄属性propArr
        var heroList = gamePlayer.heroListData;
        for (var i = 0; i < heroList.length; i++) {
            var locHero = heroList[i];
            locHero.propArr = heroPropHelper.calHeroProp(userData, locHero);
            locHero.combat = heroPropHelper.calCombat(userData, locHero);

            var upHeroData = {
                propArr: locHero.propArr,
                combat: locHero.combat
            };
            gamePlayer.setHeroDataDirty(locHero.id);
        }
        //更新
        var upUserData = {
            elfWakingData: elfWakingData
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(delBagItems));
        cb(null, [upUserData, heroList, delBagItems]);
    });
};

/**
 * 精灵觉醒现身
 * @param client
 * @param userId
 * @param elfId
 * @param isAppear  //是否现身  否：false 是：true
 * @param cb
 */
exports.elfWakingAppear = function(client, userId, elfId, isAppear, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData;
        if (!userData.bag) userData.bag = {};
        var bag = userData.bag;
        var delBagItems = {};
        var elfWakingData = userData.elfWakingData || {};
        var elfWakingAppear = userData.elfWakingAppear || 0;
        if (!elfWakingData[elfId]) return cb(getMsg(c_msgCode.isActivate)); //未激活

        var lvlId = elfWakingData[elfId];
        var wakingLvlData = t_elfWakingLvl[lvlId];
        if (!wakingLvlData) return cb(getMsg(c_msgCode.abnormalData)); //数据异常;

        if (isAppear) {
            elfWakingAppear = elfId;
        } else {
            elfWakingAppear = 0;
        }

        userData.elfWakingAppear = elfWakingAppear;
        // console.error("=========userData.elfWakingAppear,elfId,isAppear==========",userData.elfWakingAppear,elfId,isAppear);
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        //更新
        var upUserData = {
            elfWakingAppear: elfWakingAppear
        };
        cb(null, [upUserData]);
    });
};

/*************************************************无限迷宫****************************************************/

/**
 * 初始化无限迷宫数据
 * @param client
 * @param userId
 * @param cb
 */
exports.initInfiniteMazeData = function(client, userId, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData;
        if (userData.exData && (!userData.exData[c_prop.userExDataKey.infiniteMazeData])) {
            __refreshMazeData(userData);
        }
        //清除上赛季积分
        var updateScoreTime = userData.exData[c_prop.userExDataKey.infiniteMazeData][2];
        if (updateScoreTime) {
            updateScoreTime = new Date(updateScoreTime);
            var seasonTimeArr = __getMazeSeasonStartAndEnd();
            if (updateScoreTime.isBefore(seasonTimeArr[0]) || updateScoreTime.isAfter(seasonTimeArr[1])) {
                __cleanMazeScore(userData);
            }
        }
        var upUserData = {
            exData: userData.exData
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.exdata);
        return cb(null, upUserData);
    });
};

//获取迷宫跨服排行列表
exports.getMazeRankList = function(client, userId, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData;
        battlesGroupBiz.getCSBossServer(mainClient, function(err, data) {
            if (err) return cb(err);
            var method = 'getUserMazeRank';
            var params = {};
            params.battleId = data.battleId;
            params.serverId = userData.serverId;
            params.userId = userData.id;
            serverUtils.requestRankServer(method, params, function(err, data) {
                if (err) return cb(err);
                var myRank = data.rank;
                var myScore = data.score;
                var rankList = [];
                //{nickName: "s2.gui:de48", lvl: 200, magicLvl: 2, iconId: 101, score: 175}
                data.topList.forEach(function(item, index) {
                    var rank = new ds.Rank();
                    rank.rank = index + 1;
                    rank.name = item.nickName;
                    rank.lvl = item.lvl;
                    rank.magicLvl = item.magicLvl;
                    rank.iconId = item.iconId;
                    rank.score = item.score;
                    rankList.push(rank);
                })

                //console.error('getMazeRankList===>',data);
                return cb(null, [myRank, myScore, rankList]);
            });
        });
    });

}

//发送迷宫排名奖励
exports.sendMazeRankReward = function(client, rankList, cb) {
    checkRequire();
    var max = 1000;
    var groupList = [];
    var tempCount = 0;
    var tempList = [];
    var mazeCfg = c_game.infiniteMaze;
    var rewardCfg = mazeCfg[0].split(',');
    var needRankCfg = mazeCfg[1].split(',');
    var needScoreCfg = mazeCfg[2].split(',');

    battlesGroupBiz.getCSBossServer(mainClient, function(err, data) {
        if (err) return cb(err);
        var battleId = data.battleId;
        for (let i = 0; i < rankList.length; i++) {
            var locRankData = rankList[i];
            if (locRankData.battleId != battleId) continue;
            var userRank = locRankData.rank;
            var userId = locRankData.userId;
            var userScore = locRankData.score;
            var items = {};

            //获取排名对应的奖励 ID
            var rewardId = 0;
            //先按名次从低到高找  再按所需积分从高到低找
            for (let j = needRankCfg.length - 1; j >= 0; j--) {
                if (userRank >= needRankCfg[j]) {
                    //找出此玩家排名对应档位
                    for (let k = j; k < needScoreCfg.length; k++) {
                        if (userScore >= needScoreCfg[k]) {
                            rewardId = rewardCfg[k];
                            break;
                        }
                    }
                    break;
                }
            }
            if (!rewardId) continue;

            var c_rewardData = c_reward[rewardId];
            items = c_rewardData.rewardItems;
            //c_prop.mailTypeKey.temp7day
            var mailEntity = mailBiz.createEntityByType(locRankData.userId, 96, [userScore, userRank], items);
            mailEntity.addTime = new Date();
            tempList.push(mailEntity);
            if (tempCount >= max) {
                tempCount = 0;
                groupList.push(tempList.concat([]));
                tempList.length = 0;
            }
            tempCount++;

            // oObj = new ossObj.ossOpenServerRank(locRankData.userId, locRankData.userLvl, 0, 0, locRankData.rankValue * 1, rewardId * 1, day, JSON.stringify(c_rewardData.rewardItems));
            // ossBiz.WriteOss(oObj);
        }
        if (tempList.length > 0) {
            groupList.push(tempList.concat([]));
        }
        console.error("sendMazeRankReward  mail groupList ====>", groupList);
        async.map(groupList, function(group, cb1) {
            mailBiz.addMailByList(client, group, cb1);
        }, cb);
    });


}

/**
 * 无限迷宫开门
 * @param client
 * @param userId
 * @param cb
 */
exports.openMazeDoor = function(client, userId, doorId, cb) {
    checkRequire();
    if (!__isInMazeTime()) return cb(getMsg(c_msgCode.notOpen, c_game.infiniteMaze[3], c_game.infiniteMaze[4])); //活动未开启
    var cfgInfo = c_infiniteMaze[doorId];
    if (!cfgInfo) return cb(getMsg(c_msgCode.paramsError)); //参数错误
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData;
        userData.bag = userData.bag || {};
        var exData = userData.exData || {};
        var infiniteMazeData = exData[c_prop.userExDataKey.infiniteMazeData] || [];
        var doorData = infiniteMazeData[0] || [];
        if (doorData.indexOf(doorId) == -1) return cb(getMsg(c_msgCode.paramsError)); //参数错误
        var needItems = cfgInfo.needItems;

        var delBagItems = {};
        for (var i = 0; i < needItems.length; i++) {
            var needItemId = needItems[i][0];
            var needItemNum = needItems[i][1];
            //console.error('needItemId,needItemNum,userData.bag[needItemId]====>', needItemId, needItemNum, userData.bag[needItemId]);
            if (!userData.bag[needItemId] || userData.bag[needItemId] < needItemNum) return cb(getMsg(c_msgCode.materialUnenough)); //材料不足
            delBagItems[needItemId] = needItemNum;
        }

        //清除上赛季积分
        var updateScoreTime = infiniteMazeData[2];
        if (updateScoreTime) {
            updateScoreTime = new Date(updateScoreTime);
            var seasonTimeArr = __getMazeSeasonStartAndEnd();
            if (updateScoreTime.isBefore(seasonTimeArr[0]) || updateScoreTime.isAfter(seasonTimeArr[1])) {
                __cleanMazeScore(userData);
            }
        }

        //扣钥匙
        for (var key in delBagItems) {
            userUtils.delBag(userData, key, delBagItems[key], c_prop.itemCostTypeKey.openChest);
        }
        var successRate = cfgInfo.successRate;
        var isSuccess = Math.random() * 10000 <= successRate; //是否开启成功

        var bagItems = {};
        var equipBagItems = {};
        var items = {};
        if (isSuccess) {
            //获得物品
            var getItemsArr = commonUtils.getLeft2RightRandomArray(cfgInfo.items);
            items = commonUtils.kvArr2KvObj(getItemsArr);

            var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.copy);
            if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
            if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);

            //重置 门数据
            __refreshMazeData(userData);
        }

        var getScore = isSuccess ? cfgInfo.successScore : cfgInfo.failScore;
        __addMazeScore(client, userData, getScore, function(err, data) {
            if (err) console.error('__addMazeScore requestRankServer fail!', err);
        });

        var upUserData = {
            exData: userData.exData
        };
        return cb(null, [upUserData, bagItems, equipBagItems, delBagItems, getScore, isSuccess, items]);
    });
};

var __addMazeScore = function(client, userData, getScore, cb) {
    checkRequire();
    //记录获得积分
    var exData = userData.exData || {};
    var infiniteMazeData = exData[c_prop.userExDataKey.infiniteMazeData] || [];
    var score = infiniteMazeData[1] || 0;
    var totalScore = parseInt(score) + parseInt(getScore);
    infiniteMazeData[1] = totalScore;
    infiniteMazeData[2] = new Date();
    exData[c_prop.userExDataKey.infiniteMazeData] = infiniteMazeData;
    userData.exData = exData;

    battlesGroupBiz.getCSBossServer(mainClient, function(err, data) {
        if (err) return cb(err);
        var method = 'saveUserMazeScore';
        var params = {};
        params.battleId = data.battleId;
        params.serverId = userData.serverId;
        params.userId = userData.id;
        params.nickName = userData.nickName;
        params.lvl = userData.lvl;
        params.iconId = userData.iconId;
        params.score = totalScore;
        params.magicLvl = userData.magicLvl;
        serverUtils.requestRankServer(method, params, cb);
    });
}

var __cleanMazeScore = function(userData) {
    var exData = userData.exData || {};
    var infiniteMazeData = exData[c_prop.userExDataKey.infiniteMazeData] || [];
    infiniteMazeData[1] = 0;
    exData[c_prop.userExDataKey.infiniteMazeData] = infiniteMazeData;
    userData.exData = exData;
}


//刷新无限迷宫门
var __refreshMazeData = function(userData) {
    var exData = userData.exData || {};
    var lvl = userData.lvl;
    var awardPool = {};
    var weightArr1 = [],
        weightArr2 = [],
        weightArr3 = [];
    for (var i in c_infiniteMaze) {
        var curInfo = c_infiniteMaze[i];
        if (lvl >= curInfo.minLvl && lvl <= curInfo.maxLvl) {
            awardPool[i] = curInfo;
            weightArr1.push([curInfo.id, curInfo.rate1]);
            weightArr2.push([curInfo.id, curInfo.rate2]);
            weightArr3.push([curInfo.id, curInfo.rate3]);
        }
    }

    var door1 = commonUtils.getWeightRandomValue(weightArr1);
    var door2 = commonUtils.getWeightRandomValue(weightArr2);
    var door3 = commonUtils.getWeightRandomValue(weightArr3);
    if (!door1 || !door2 || !door3) {
        console.error('无限迷宫生成门错误==door1==door2==door3==>', door1, door2, door3);
        return;
    }
    var tempArr = [door1, door2, door3];
    commonUtils.breakArray(tempArr); //打乱顺序
    var infiniteMazeData = exData[c_prop.userExDataKey.infiniteMazeData] || [];
    infiniteMazeData[0] = tempArr;
    infiniteMazeData[1] = infiniteMazeData[1] || 0;
    exData[c_prop.userExDataKey.infiniteMazeData] = infiniteMazeData;
    userData.exData = exData;
}

//是否在迷宫有效时间内
var __isInMazeTime = function() {
    var now = new Date();

    var startTime = c_game.infiniteMaze[3];
    var startArr = startTime.split(':');
    var startHour = parseInt(startArr[0]);
    var startMinute = parseInt(startArr[1]);

    var endTime = c_game.infiniteMaze[4];
    var endArr = endTime.split(':');
    var endHour = parseInt(endArr[0]);
    var endMinute = parseInt(endArr[1]);

    var sTime = now.clone().clearTime().addHours(startHour).addMinutes(startMinute);
    var eTime = now.clone().clearTime().addHours(endHour).addMinutes(endMinute);

    if (now.isAfter(sTime) && now.isBefore(eTime)) return true;
    return false;
}

//根据当前时间获取 无限迷宫 赛季开始时间 赛季结束时间
var __getMazeSeasonStartAndEnd = function(AddWeekCount) {
    AddWeekCount = AddWeekCount || 0; //本赛季
    //一天的毫秒数
    var millisecond = 1000 * 60 * 60 * 24;
    //获取当前时间
    var currentDate = new Date().clone().clearTime();
    //相对于当前日期AddWeekCount个周的日期
    currentDate = new Date(currentDate.getTime() + (millisecond * 7 * AddWeekCount));
    //返回date是一周中的某一天
    var week = currentDate.getDay();
    //减去的天数
    var minusDay = week != 0 ? week - 1 : 6;
    //获得当前周的第一天
    var currentWeekFirstDay = new Date(currentDate.getTime() - (millisecond * minusDay));
    //获得当前周的最后一天
    var currentWeekLastDay = new Date(currentWeekFirstDay.getTime() + (millisecond * 7));
    //起止日期数组
    var startStop = [];
    startStop.push(currentWeekFirstDay);
    startStop.push(currentWeekLastDay);
    return startStop;
}