/**
 * Created by Administrator on 2014/5/16.
 */
var uwData = require("uw-data");
var c_game = uwData.c_game;
var c_prop = uwData.c_prop;
var c_lottery = uwData.c_lottery;
var c_shop = uwData.c_shop;
//var c_vip = uwData.c_vip;
var c_lvl = uwData.c_lvl;
var c_guildLvl = uwData.c_guildLvl;
var c_guildFuncCfg = uwData.c_guildFuncCfg;
var t_itemLogic = uwData.t_itemLogic;
var consts = uwData.consts;
var c_msgCode = uwData.c_msgCode;
var t_item = uwData.t_item;
var c_open = uwData.c_open;
var c_guildGift = uwData.c_guildGift;
var c_guildGrown = uwData.c_guildGrown;
var async = require("async");
var getMsg = require("uw-utils").msgFunc(__filename);
var chatBiz = null;
var GuildEntity = require('uw-entity').GuildEntity;
var MailEntity = require("uw-entity").MailEntity;
var GuildPersonalEntity = require('uw-entity').GuildPersonalEntity;
var GuildGiftBoxEntity = require('uw-entity').GuildGiftBoxEntity;
var GuildBattleRecordEntity = require('uw-entity').GuildBattleRecordEntity;
var g_data = require("uw-global").g_data;
var g_cache = require("uw-global").g_cache;
var logger = require('uw-log').getLogger("uw-route", __filename);
var userDao = null;
var userUtils = null;
var propUtils = null;
var guildDao = null;
var guildPersonalDao = null;
var guildGiftBoxDao = null;
var guildBattleRecordDao = null;
var itemBiz = null;
var commonUtils = null;
var guildUtils = null;
var rankDao = null;
var g_guild = null;
var gameCommonBiz = null;
var mailBiz = null;
var formula = require("uw-formula");
var heroBiz = null;
var taskBiz = null;
var mailDao = null;
var checkRequire = function() {
    userDao = userDao || require("uw-user").userDao;
    userUtils = userUtils || require("uw-user").userUtils;
    propUtils = propUtils || require("uw-utils").propUtils;
    guildDao = guildDao || require("../dao/guildDao.js");
    guildPersonalDao = guildPersonalDao || require("../dao/guildPersonalDao.js");
    guildGiftBoxDao = guildGiftBoxDao || require("../dao/guildGiftBoxDao.js");
    guildBattleRecordDao = guildBattleRecordDao || require("../dao/guildBattleRecordDao.js");
    itemBiz = itemBiz || require("uw-item").itemBiz;
    commonUtils = commonUtils || require("uw-utils").commonUtils;
    guildUtils = guildUtils || require("./guildUtils.js");
    rankDao = rankDao || require("uw-rank").rankDao;
    g_guild = g_guild || require("uw-global").g_guild;
    gameCommonBiz = gameCommonBiz || require("uw-game-common").gameCommonBiz;
    chatBiz = chatBiz || require("uw-chat").chatBiz;
    mailBiz = mailBiz || require("uw-mail").mailBiz;
    heroBiz = heroBiz || require("uw-hero").heroBiz;
    taskBiz = taskBiz || require("uw-task").taskBiz;
    mailDao = mailDao || require("uw-mail").mailDao;
};

var ds = require("uw-ds").ds;

var exports = module.exports;

/**
 * 获取行会数据
 * @param client
 * @param userId
 * @param cb
 */
exports.getInfo = function(client, userId, cb) {
    checkRequire();
    _getRecordData(client, userId, function(err, guildPersonalData) {
        if (err) return cb(err);
        var guildId = guildPersonalData.guildId;
        g_data.setGuildId(userId, guildId);
        g_data.setGuildEnnoble(userId.userId, guildPersonalData.ennoble);
        // var isOpenGuildWar = 0;  
        //cfg 数据["行会战开战星期","行会战开始结束时间","可报名时间星期","可报名时间"]
        //var gCfg = g_gameConfig.getData();
        //[开始月，开始日，开始时间，结束月，结束日，结束时间]
        //[开始月，开始日，开始时间，结束时间]
        // var cfgData = [gCfg.guildWarSign, gCfg.guildWarOpen];
        if (guildId) {
            //有行会
            var guildData = g_guild.getGuild(guildPersonalData.guildId);
            if (!guildData) {
                guildPersonalDao.update(client, { guildId: 0 }, { id: guildPersonalData.id }, function() {});
                return cb(getMsg(c_msgCode.gildUnexist)); //行会已经不存在
            }
            var bGPChanged = guildUtils.calRefreshGuildPersonalData(guildPersonalData);
            var bGChanged = guildUtils.calRefreshGuildData(guildData);
            async.parallel([
                function(cb1) {
                    userDao.selectCols(client, " nickName ", { id: guildData.chairmanId }, cb1);
                },
                function(cb1) {
                    exports.getGuildRank(client, guildId, cb1);
                },
                function(cb1) {
                    gameCommonBiz.getInfo(client, cb1);
                },
                function(cb1) {
                    userDao.selectCols(client, " lvl ", { id: userId }, cb1);
                }
            ], function(err, data) {
                if (err) return cb(err);
                var isOpenBoss = data[2].isOpenBoss;
                g_data.setGuildChange(userId, 0);
                var userData = data[3];

                // 兼容老玩家数据            
                var b1 = _fixGuildPersionalGift(guildPersonalData);
                var b2 = guildUtils.checkGuildGiftData(guildPersonalData, 1, userData.lvl);
                var b3 = guildUtils.checkGuildGiftData(guildPersonalData, 3, guildPersonalData.ennoble);
                if (bGPChanged || b1 || b2 || b3) {
                    _updateGuildPersonalData(client, guildPersonalData);
                }
                if (bGChanged) {
                    g_guild.setGuild(guildData.id, guildData);
                }

                cb(null, [true, guildPersonalData, guildData, data[0].nickName, data[1], isOpenBoss]);
            });
        } else {
            async.parallel([
                function(cb1) {
                    exports.getGuildList(client, userId, cb1);
                },
                function(cb1) {
                    gameCommonBiz.getInfo(client, cb1);
                }
            ], function(err, data) {
                if (err) return cb(err);
                var dataList = data[0];
                dataList.sort(function() {
                    return 0.5 - Math.random();
                }); //打乱数组顺序
                var isOpenBoss = data[1].isOpenBoss;
                g_data.setGuildChange(userId, 0);

                cb(null, [false, guildPersonalData, dataList, null, null, isOpenBoss]);
            });
        }
    });
};

//获取行会排名
exports.getGuildRank = function(client, guildId, cb) {
    rankDao.select(client, " userId = ? and rankType = ?", [guildId, c_prop.rankTypeKey.guildRank], function(err, rankData) {
        if (err) return cb(err);
        if (rankData) { //排行榜存在数据
            rankDao.count(client, " rankType = ? and id <= ?", [c_prop.rankTypeKey.guildRank, rankData.id], function(err, rankCount) {
                if (err) return cb(err);
                cb(null, rankCount);
            });
        } else { //排行榜不存在数据
            guildDao.count(client, " lvl >= (SELECT lvl FROM uw_guild WHERE id = ?) ", [guildId], function(err, rankCount) {
                if (err) return cb(err);
                cb(null, rankCount);
            });
        }
    });
};

//会长弹劾
exports.chairmanImpeach = function(client, cb) {
    checkRequire();
    var guildList = [];
    var guildCache = g_guild.getCache() || {};
    for (var key in guildCache) {
        var guildData = guildCache[key].guild;
        if (guildData) {
            var cosGuildData = JSON.parse(JSON.stringify(guildData));
            if (cosGuildData.lastExpelTime) cosGuildData.lastExpelTime = new Date(cosGuildData.lastExpelTime);
            if (cosGuildData.resetTime) cosGuildData.lastExpelTime = new Date(cosGuildData.resetTime);
            if (cosGuildData.lastLgTime) cosGuildData.lastExpelTime = new Date(cosGuildData.lastLgTime);
            guildList.push(cosGuildData);
        }
    }

    async.mapLimit(guildList, 1, function(guild, cb1) {
        _checkChairman(client, guild, cb1);
    }, function(err, data) {
        if (err) return cb(err);
        cb(null);
    });
};

var _checkChairman = function(client, guildData, cb) {
    checkRequire();
    userDao.selectCols(client, "id,nickName,lastUpdateTime", "id = ? ", [guildData.chairmanId], function(err, chairmanData) {
        if (err) return cb(err);
        if (!chairmanData) return cb(null);
        var dayCount = c_game.guildSet[13];
        if (!chairmanData.lastUpdateTime || chairmanData.lastUpdateTime.getDaysBetween(new Date()) < dayCount) {
            return cb(null);
        }
        var viceChairmanId = guildData.viceChairmanId || [];
        guildPersonalDao.listCols(client, "userId,guildAct", " guildId = ? and userId != ? order by guildAct desc ", [guildData.id, guildData.chairmanId], function(err, guildPersonalList) {
            if (err) return cb(err);
            var userIdArr = [];
            var guildActObj = {};
            var allArr = [guildData.chairmanId];
            for (var i = 0; i < guildPersonalList.length; i++) {
                var guildPersonalData = guildPersonalList[i];
                if (!guildPersonalData.userId) continue;
                // if (userIdArr.length < 20) 
                userIdArr.push(guildPersonalData.userId);
                allArr.push(guildPersonalData.userId);
                guildActObj[guildPersonalData.userId] = guildPersonalData.guildAct;
            }
            if (userIdArr.length <= 0) return cb(null);


            userDao.listCols(client, "id,nickName,lvl,vip", " id in (?) and ( TO_DAYS( lastUpdateTime ) = TO_DAYS(NOW()) OR (TO_DAYS( NOW( ) ) - TO_DAYS( lastUpdateTime ) <= 1))", [userIdArr], function(err, userList) {
                if (err) return cb(err);
                if (userList.length <= 0) return cb(null);
                var userData = userList[0];
                var maxAct = guildActObj[userList[0].id];
                var viceChairman_maxAct = 0;
                // if (act == 0) return cb(null);
                for (var i = 1; i < userList.length; i++) {
                    var cosUserData = userList[i];
                    if (viceChairmanId.indexOf(cosUserData.id) > -1) {
                        //副会长优先 副会长也要比下贡献
                        if (guildActObj[cosUserData.id] > viceChairman_maxAct) {
                            userData = cosUserData;
                            viceChairman_maxAct = guildActObj[cosUserData.id];
                        }
                        continue;
                    }
                    if (guildActObj[cosUserData.id] > maxAct) {
                        maxAct = guildActObj[cosUserData.id];
                        userData = cosUserData;
                    } else if (guildActObj[cosUserData.id] == maxAct) {
                        if (cosUserData.lvl > userData.lvl) userData = cosUserData;
                    }
                }
                if (!userData) return cb(null);
                //设置行会个人数据
                async.parallel([
                    function(cb1) {
                        guildPersonalDao.update(client, { position: c_prop.guildPostKey.rankFile }, { userId: guildData.chairmanId }, cb1);
                    },
                    function(cb1) {
                        guildPersonalDao.update(client, { position: c_prop.guildPostKey.chairman }, { userId: userData.id }, cb1);
                    }
                ], function(err, data) {
                    if (err) return cb(err);
                    //发送邮件通知
                    var tempList = [];
                    var name = userData.nickName;
                    for (var i = 0; i < allArr.length; i++) {
                        var mailUserId = allArr[i];
                        var type = 0;
                        var parameter = [];
                        if (mailUserId == guildData.chairmanId) { //降职通知
                            type = c_prop.mailTypeKey.impeachFall;
                            parameter = [dayCount, name];
                        } else if (mailUserId == userData.id) { //升职通知
                            type = c_prop.mailTypeKey.impeachUp;
                            parameter = [chairmanData.nickName, dayCount];
                        } else { //会长更换通知
                            type = c_prop.mailTypeKey.impeachAll;
                            parameter = [chairmanData.nickName, dayCount, name];
                        }
                        var locMail = mailBiz.createEntityByType(mailUserId, type, parameter, {});
                        locMail.addTime = new Date();
                        tempList.push(locMail);
                    }
                    mailBiz.addMailByList(client, tempList, function() {});
                    //设置行会数据
                    guildData.chairmanId = userData.id;

                    for (var i = 0; i < viceChairmanId.length; i++) {
                        if (viceChairmanId[i] == guildData.chairmanId || viceChairmanId[i] == userData.id) viceChairmanId.splice(i--, 1);
                    }
                    guildData.viceChairmanId = viceChairmanId;
                    g_data.setGuildChange(userData.id, 1);
                    g_guild.setGuild(guildData.id, guildData);
                    cb(null);
                });
            });
        });
    });
};

exports.gmt_setChairman = function(client, userId, guildId, cb) {
    checkRequire();
    var guildData = g_guild.getGuild(guildId);
    if (!guildData) return cb(null);
    var viceChairmanId = guildData.viceChairmanId || [];
    var chairmanId = guildData.chairmanId;
    if (!chairmanId) return cb(null);
    async.parallel([
        function(cb1) {
            userDao.selectCols(client, "id,nickName,lastUpdateTime", "id = ? ", [userId], cb1);
        },
        function(cb1) {
            userDao.selectCols(client, "id,nickName,lastUpdateTime", "id = ? ", [chairmanId], cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var userData = data[0];
        var chairmanData = data[1];
        if (!userData || !chairmanData) return cb(null);
        guildPersonalDao.selectCols(client, "userId,guildId,position", "userId = ? ", [userId], function(err, guildPersonalData) {
            if (err) return cb(err);
            if (!guildPersonalData) return cb(null);
            if (guildPersonalData.guildId != guildId) return cb(null);
            if (guildPersonalData.position == c_prop.guildPostKey.chairman) return cb("已经是会长"); 
            //设置行会个人数据
            async.parallel([
                function(cb1) {
                    guildPersonalDao.update(client, { position: c_prop.guildPostKey.rankFile }, { userId: guildData.chairmanId }, cb1);
                },
                function(cb1) {
                    guildPersonalDao.update(client, { position: c_prop.guildPostKey.chairman }, { userId: userData.id }, cb1);
                }
            ], function(err, data) {
                if (err) return cb(err);
                // console.error("发送邮件通知");
                //发送邮件通知
                var tempList = [];
                var name = userData.nickName;
                guildPersonalDao.listCols(client, "userId", " guildId = ? ", [guildData.id], function(err, guildPersonalList) {
                    // for (var i = 0; i < guildPersonalList.length; i++) {
                    //     var mailUserId = guildPersonalList[i].userId;
                    //     var type = 0;
                    //     var parameter = [];
                    //     if (mailUserId == guildData.chairmanId) { //降职通知
                    //         type = c_prop.mailTypeKey.impeachFall;
                    //         parameter = [dayCount, name];
                    //     } else if (mailUserId == userData.id) { //升职通知
                    //         type = c_prop.mailTypeKey.impeachUp;
                    //         parameter = [chairmanData.nickName, dayCount];
                    //     } else { //会长更换通知
                    //         type = c_prop.mailTypeKey.impeachAll;
                    //         parameter = [chairmanData.nickName, dayCount, name];
                    //     }
                    //     var locMail = mailBiz.createEntityByType(mailUserId, type, parameter, {});
                    //     locMail.addTime = new Date();
                    //     tempList.push(locMail);
                    // }
                    // console.error("tempList=====>", tempList);
                    // mailBiz.addMailByList(client, tempList, function() {});
                    //设置行会数据
                    guildData.chairmanId = userData.id;

                    for (var i = 0; i < viceChairmanId.length; i++) {
                        if (viceChairmanId[i] == guildData.chairmanId || viceChairmanId[i] == userData.id) viceChairmanId.splice(i--, 1);
                    }
                    guildData.viceChairmanId = viceChairmanId;
                    g_data.setGuildChange(userData.id, 1);
                    g_guild.setGuild(guildData.id, guildData);
                    console.error("gm.js modifyGuild Chairman success！guildId:",guildData.id,"chairmanId:",guildData.chairmanId);
                    cb(null,'success');
                });

            });
        });
    });

    
}
/**
 * 创建行会
 * @param client
 * @param userId
 * @param name
 * @param cb
 */
exports.establishGuild = function(client, userId, name, cb) {
    checkRequire();
    var openCon = c_open.guild.lvlRequired;
    async.parallel([
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        },
        function(cb1) {
            _getRecordData(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var userData = gamePlayer.userData,
            guildPersonalData = data[1];
        if (userData.lvl < openCon) return cb(getMsg(c_msgCode.canotOpenNoLvl)); //等级未达到开启条件
        if (guildPersonalData.guildId) return cb(getMsg(c_msgCode.haveGild)); //已有行会

        var lastQuitGuildTime = guildPersonalData.lastQuipGuildTime;
        if (lastQuitGuildTime) {
            //var quitGuildCount = guildUtils.getTodayExitGuild(guildPersonalData);
            //var quitGuildCd = formula.calQuitGuildCfg(quitGuildCount);
            // var quitGuildCd = parseInt(c_game.guildSet[5])*60*60;
            // var joinTime = lastQuitGuildTime.getTime() + quitGuildCd*1000;
            // //todo 临时去掉cd判断
            // if(new Date(joinTime) > new Date()) return cb(getMsg(c_msgCode.gildQuitWaiting));//退会等待中
            if (_inQuitGuildCd(lastQuitGuildTime)) {
                return cb(getMsg(c_msgCode.gildQuitWaiting)); //退会等待中
            }
        }

        //限制长度
        var nameLength = commonUtils.getStringLength(name);
        if (nameLength <= 0) return cb(getMsg(c_msgCode.guildNameIsNull)); //长度超出啦
        if (nameLength > 12) return cb(getMsg(c_msgCode.guildNameTooLong)); //长度超出啦
        //过滤敏感字符
        if (commonUtils.checkFuckWord(name)) return cb(getMsg(c_msgCode.guildNameIllegal));
        if (name.indexOf(" ") >= 0) return cb(getMsg(c_msgCode.nameNotBlank)); //名称不能包含空格
        if (name.indexOf("\n") >= 0 || name.indexOf("\\n") >= 0 || name.indexOf("\r") >= 0 || name.indexOf("\\r") >= 0 || name.indexOf("\"") >= 0) return cb(getMsg(c_msgCode.nameNotEnter)); //名称不能包含回车换行或双引号
        name = name.replace("\\n", "");
        name = name.replace("\n", "");
        name = name.replace("\\r", "");
        name = name.replace("\r", "");
        name = name.replace("\"", "");

        guildDao.select(client, { name: name }, function(err, guildData) {
            if (err) return cb(err);
            if (guildData) return cb(getMsg(c_msgCode.guildNameSame));
            var needDiamond = c_game.guildSet[1];
            if (userData.diamond < needDiamond || needDiamond < 0) return cb(getMsg(c_msgCode.noDiamond));

            //扣除元宝
            userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, needDiamond, c_prop.diamondCostTypeKey.establishGuild);

            //创建公会（紧急委托任务）
            taskBiz.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.hasGuild, 1, function() {});

            var guildEntity = new GuildEntity();
            guildEntity.name = name;
            guildEntity.chairmanId = userId;
            guildEntity.viceChairmanId = [];
            guildEntity.guildPopulation = 1;
            guildEntity.addUpAct = 0;
            guildEntity.joinCon = c_prop.guildJoinConKey.can;
            guildEntity.joinLvl = 1;
            guildEntity.lvl = 1;
            guildEntity.appliedMembers = [];
            guildEntity.ennobleData = {};
            guildEntity.todayHyd = 0;
            guildEntity.weekHyd = 0;
            guildEntity.todayHydRefreshTime = new Date();
            guildEntity.weekHydRefreshTime = new Date();
            guildEntity.wareHouse = {};

            var updateData = {
                diamond: userData.diamond
            };
            gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
            async.parallel([
                function(cb1) {
                    guildDao.insert(client, guildEntity, cb1);
                }
            ], function(err, upData) {
                if (err) return cb(err);
                var insertData = upData[0];
                guildEntity.id = insertData.insertId;

                g_guild.setGuild(guildEntity.id, guildEntity);

                guildPersonalData.guildId = guildEntity.id;
                guildPersonalData.position = c_prop.guildPostKey.chairman;
                guildPersonalData.ennoble = c_prop.ennobleTypeKey.civilian;
                guildPersonalData.joinTime = new Date();

                guildUtils.checkGuildGiftData(guildPersonalData, 4, guildPersonalData.ennoble);

                var updateGuildPersonalData = {
                    guildId: guildPersonalData.guildId,
                    position: guildPersonalData.position,
                    viceTime: guildPersonalData.viceTime,
                    ennoble: guildPersonalData.ennoble,
                    joinTime: guildPersonalData.joinTime,
                    todayAct: guildPersonalData.todayAct,
                    exitGuildCount: guildPersonalData.exitGuildCount,
                    lotteryCount: guildPersonalData.lotteryCount,
                    actLastTime: guildPersonalData.actLastTime,
                    noticeCount: guildPersonalData.noticeCount,
                    addUpAct: guildPersonalData.addUpAct,
                    actData: guildPersonalData.actData,
                    guildAct: guildPersonalData.guildAct,
                    giftData: guildPersonalData.giftData,
                    weekHydChests: guildPersonalData.weekHydChests,
                    todayHydChests: guildPersonalData.todayHydChests,
                    weekRefreshTime: guildPersonalData.weekRefreshTime,
                    fuliChests: guildPersonalData.fuliChests,
                    actCrit: guildPersonalData.actCrit
                };
                guildPersonalDao.update(client, updateGuildPersonalData, { id: guildPersonalData.id }, function(err, upGuildPersonalData) {
                    if (err) return cb(err);
                    g_data.setGuildId(userId, guildEntity.id);
                    chatBiz.addSysData(144, [userData.nickName, name, guildEntity.id]);
                    cb(null, [guildEntity, updateData, needDiamond, upGuildPersonalData, userData.nickName]);
                });
            });
        });
    });
};

/**
 * 搜索行会
 * @param client
 * @param guildId
 * @param cb
 */
exports.seekGuild = function(client, guildId, cb) {
    checkRequire();
    var guildData = g_guild.getGuild(guildId);
    cb(null, guildData);
};

/**
 * 申请加入行会
 * @param client
 * @param userId
 * @param guildId
 * @param cb
 */
exports.joinGuild = function(client, userId, guildId, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            _getRecordData(client, userId, cb1);
        },
        function(cb1) {
            // userDao.select(client,{id:userId},cb1);
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[1];
        var guildPersonalData = data[0],
            userData = gamePlayer.userData;
        var guildData = g_guild.getGuild(guildId);
        if (!guildData) return cb(getMsg(c_msgCode.gildUnexist)); //行会已经不存在
        if (guildPersonalData.guildId) return cb(getMsg(c_msgCode.inGild)); //您已经在一个行会中
        if (guildData.joinCon == c_prop.guildJoinConKey.cannot) return cb(getMsg(c_msgCode.gildRefuse)); //该行会拒绝任何人加入
        if (userData.lvl < guildData.joinLvl) return cb(getMsg(c_msgCode.NoLvlOpen)); //等级不足

        var guildMan = c_lvl[guildData.lvl].guildMan;
        var lastQuitGuildTime = guildPersonalData.lastQuipGuildTime;
        if (lastQuitGuildTime) {
            //var quitGuildCount = guildUtils.getTodayExitGuild(guildPersonalData);
            //var quitGuildCd = formula.calQuitGuildCfg(quitGuildCount);
            // var quitGuildCd = parseInt(c_game.guildSet[5])*60*60;
            // var joinTime = lastQuitGuildTime.getTime() + quitGuildCd*1000;
            // //todo 临时去掉cd判断
            // if(new Date(joinTime) > new Date()) return cb(getMsg(c_msgCode.gildQuitWaiting));//退会等待中
            if (_inQuitGuildCd(lastQuitGuildTime)) {
                return cb(getMsg(c_msgCode.gildQuitWaiting)); //退会等待中
            }
        }
        if (guildData.guildPopulation >= guildMan) return cb(getMsg(c_msgCode.applicationMax));

        var isJoin = false;
        if (guildData.joinCon == c_prop.guildJoinConKey.verify) { //需要验证
            if (guildData.appliedMembers.indexOf(guildId) < 0) guildData.appliedMembers.push(userId);
            if (guildPersonalData.appliedMsg.indexOf(guildId) < 0) guildPersonalData.appliedMsg.push(guildId);
        } else { //直接加入
            isJoin = true;
            guildData.guildPopulation += 1;
            guildPersonalData.guildId = guildId;
            guildPersonalData.position = c_prop.guildPostKey.rankFile;
            guildPersonalData.ennoble = c_prop.ennobleTypeKey.civilian;
            guildPersonalData.joinTime = new Date();

            //加入公会（紧急委托任务）
            taskBiz.setEntrustTaskValue(client, userId, c_prop.entrustTaskTypeKey.hasGuild, 1, function() {});
            //在公会频道显示玩家加入公会系统消息
            chatBiz.addSysData(187, [userData.nickName]);
        }

        var updateGuildData = {
            appliedMembers: guildData.appliedMembers,
            guildPopulation: guildData.guildPopulation
        };
        var updateGuildPersonalData = {
            guildId: guildPersonalData.guildId,
            position: guildPersonalData.position,
            viceTime: guildPersonalData.viceTime,
            todayAct: guildPersonalData.todayAct,
            actLastTime: guildPersonalData.actLastTime,
            addUpAct: guildPersonalData.addUpAct,
            appliedMsg: guildPersonalData.appliedMsg,
            ennoble: guildPersonalData.ennoble,
            joinTime: guildPersonalData.joinTime,
            exitGuildCount: guildPersonalData.exitGuildCount,
            lotteryCount: guildPersonalData.lotteryCount,
            noticeCount: guildPersonalData.noticeCount,
            actData: guildPersonalData.actData,
            guildAct: guildPersonalData.guildAct,
            giftData: guildPersonalData.giftData,
            weekHydChests: guildPersonalData.weekHydChests,
            todayHydChests: guildPersonalData.todayHydChests,
            weekRefreshTime: guildPersonalData.weekRefreshTime,
            fuliChests: guildPersonalData.fuliChests,
            actCrit: guildPersonalData.actCrit
        };
        g_guild.setGuild(guildData.id, guildData);
        async.parallel([
            function(cb1) {
                guildPersonalDao.update(client, updateGuildPersonalData, { id: guildPersonalData.id }, cb1);
            }
        ], function(err, upData) {
            if (err) return cb(err);
            cb(null, [isJoin, updateGuildData, updateGuildPersonalData]);
        });
    });
};

/**
 * 获取申请列表
 * @param client
 * @param guildId
 * @param cb
 */
exports.getAppliedMembers = function(client, userId, cb) {
    checkRequire();
    guildPersonalDao.select(client, { userId: userId }, function(err, guildPersonalData) {
        if (err) return cb(err);
        if (!guildPersonalData.guildId) return cb(getMsg(c_msgCode.outGuild));
        if (c_guildFuncCfg[guildPersonalData.position].agreeApp == 0) return cb(getMsg(c_msgCode.noPower)); //没有权限
        var guildData = g_guild.getGuild(guildPersonalData.guildId);
        if (!guildData) return cb(getMsg(c_msgCode.outGuild));

        var appliedMembers = guildData.appliedMembers;
        if (appliedMembers.length <= 0) return cb(null, []);
        userDao.listCols(client, " id,lvl,nickName,combat,vip ", " id in (?) ", [appliedMembers], function(err, userList) {
            cb(null, userList);
        });
    });
};

/**
 * 申请列表管理
 * @param client
 * @param userId
 * @param tUserId
 * @param isConsent
 * @param cb
 */
exports.appliedMembersSet = function(client, userId, tUserId, isConsent, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            guildPersonalDao.selectCols(client, " guildId,position ", { userId: userId }, cb1);
        },
        function(cb1) {
            _getRecordData(client, tUserId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var guildPersonalData = data[0],
            tGuildPersonalData = data[1];

        var lastQuitGuildTime = tGuildPersonalData.lastQuipGuildTime;
        if (lastQuitGuildTime) {
            // var quitGuildCd = parseInt(c_game.guildSet[5])*60*60;
            // var joinTime = lastQuitGuildTime.getTime() + quitGuildCd*1000;
            // if(isConsent && (new Date(joinTime) > new Date())) return cb(getMsg(c_msgCode.gildQuitWaiting));//退会等待中
            if (isConsent && _inQuitGuildCd(lastQuitGuildTime)) {
                return cb(getMsg(c_msgCode.gildQuitWaiting)); //退会等待中
            }
        }

        var isSucc = false;
        if (!guildPersonalData.guildId) return cb(getMsg(c_msgCode.outGuild));
        var otherGuildEntered = false; //是否已加入其它行会
        var membersMax = false; //是否满员
        if (tGuildPersonalData.guildId) otherGuildEntered = true;
        var guildData = g_guild.getGuild(guildPersonalData.guildId);
        if (!guildData) return cb(getMsg(c_msgCode.outGuild));
        if (c_guildFuncCfg[guildPersonalData.position].agreeApp == 0) return cb(getMsg(c_msgCode.noPower)); //权限不足");
        var guildMan = c_lvl[guildData.lvl].guildMan;
        var guildPopulation = guildData.guildPopulation;
        if (guildPopulation >= guildMan) membersMax = true;
        if (isConsent && !otherGuildEntered && !membersMax) { //同意
            guildData.guildPopulation += 1;
            tGuildPersonalData.guildId = guildPersonalData.guildId;
            tGuildPersonalData.position = c_prop.guildPostKey.rankFile;
            tGuildPersonalData.ennoble = c_prop.ennobleTypeKey.civilian;
            tGuildPersonalData.joinTime = new Date();
            isSucc = true;
        }
        commonUtils.arrayRemoveObject(guildData.appliedMembers, tUserId);
        commonUtils.arrayRemoveObject(tGuildPersonalData.appliedMsg, guildPersonalData.guildId);

        var updateGuildData = {
            appliedMembers: guildData.appliedMembers,
            guildPopulation: guildData.guildPopulation
        };
        var updateGuildPersonalData = {
            guildId: tGuildPersonalData.guildId,
            position: tGuildPersonalData.position,
            viceTime: tGuildPersonalData.viceTime,
            //todayAct: tGuildPersonalData.todayAct,
            //actLastTime: tGuildPersonalData.actLastTime,
            //addUpAct: tGuildPersonalData.addUpAct,
            appliedMsg: tGuildPersonalData.appliedMsg,
            ennoble: tGuildPersonalData.ennoble,
            joinTime: tGuildPersonalData.joinTime
        };
        g_guild.setGuild(guildData.id, guildData);
        async.parallel([
            function(cb1) {
                guildPersonalDao.update(client, updateGuildPersonalData, { id: tGuildPersonalData.id }, cb1);
            }
        ], function(err, upData) {
            if (err) return cb(err);
            g_data.setGuildId(tUserId, guildPersonalData.guildId);
            g_data.setGuildChange(tUserId, 1);
            cb(null, [updateGuildData, updateGuildPersonalData, otherGuildEntered, membersMax, isSucc]);
        });
    });
};

/**
 * 工会设置
 * @param client
 * @param userId
 * @param joinCon
 * @param joinLvl
 * @param cb
 */
exports.guildSetting = function(client, userId, joinCon, joinLvl, cb) {
    checkRequire();
    guildPersonalDao.select(client, { userId: userId }, function(err, guildPersonalData) {
        if (err) return cb(err);
        if (!guildPersonalData.guildId) return cb(getMsg(c_msgCode.outGuild));
        if (c_guildFuncCfg[guildPersonalData.position].setGuild == 0) return cb(getMsg(c_msgCode.noPower)); //没有权限
        var guildData = g_guild.getGuild(guildPersonalData.guildId);
        if (!guildData) return cb(getMsg(c_msgCode.outGuild));
        guildData.joinCon = joinCon;
        guildData.joinLvl = joinLvl;
        var updateGuildData = {
            joinCon: guildData.joinCon,
            joinLvl: guildData.joinLvl
        };
        g_guild.setGuild(guildData.id, guildData);
        cb(null, updateGuildData);
    });
};

/**
 * 修改公告
 * @param client
 * @param userId
 * @param notice
 * @param cb
 */
exports.setNotice = function(client, userId, notice, cb) {
    checkRequire();
    guildPersonalDao.select(client, { userId: userId }, function(err, guildPersonalData) {
        if (err) return cb(err);
        if (!guildPersonalData.guildId) return cb(getMsg(c_msgCode.outGuild));
        if (c_guildFuncCfg[guildPersonalData.position].changeNotice == 0) return cb(getMsg(c_msgCode.noPower)); //没有权限
        var guildData = g_guild.getGuild(guildPersonalData.guildId);
        if (!guildData) return cb(getMsg(c_msgCode.outGuild));

        if (notice.replace(/[^\x00-\xFF]/g, '**').length > 60) return cb(getMsg(c_msgCode.noticeTooLong));
        var count = guildUtils.getTodayNotice(guildPersonalData);
        if (count > 30) return cb(getMsg(c_msgCode.noticeMax));
        guildUtils.addTodayNotice(guildPersonalData, 1);
        guildData.notice = notice;
        var updateGuildData = {
            notice: guildData.notice
        };
        var updateGpData = {
            actData: guildPersonalData.actData,
            todayAct: guildPersonalData.todayAct,
            exitGuildCount: guildPersonalData.exitGuildCount,
            lotteryCount: guildPersonalData.lotteryCount,
            actLastTime: guildPersonalData.actLastTime,
            noticeCount: guildPersonalData.noticeCount
        };
        g_guild.setGuild(guildData.id, guildData);
        async.parallel([
            function(cb1) {
                guildPersonalDao.update(client, updateGpData, { id: guildPersonalData.id }, cb1);
            }
        ], function(err, upData) {
            if (err) return cb(err);
            cb(null, [updateGuildData, updateGpData]);
        });
    });
};

/**
 * 退会
 * @param client
 * @param userId
 * @param cb
 */
exports.exitGuild = function(client, userId, cb) {
    checkRequire();
    guildPersonalDao.select(client, { userId: userId }, function(err, guildPersonalData) {
        if (err) return cb(err);
        if (!guildPersonalData.guildId) return cb(getMsg(c_msgCode.outGuild));
        var guildData = g_guild.getGuild(guildPersonalData.guildId);
        if (!guildData) return cb(getMsg(c_msgCode.outGuild));
        var guildId = guildData.id;
        if (c_guildFuncCfg[guildPersonalData.position].quitGuild == 0) { //会长
            //行会战开启期间，无法退出行会和解散行会

            if (guildData.guildPopulation > 1) return cb(getMsg(c_msgCode.cantGdisband));
            guildPersonalData.guildId = 0;
            guildPersonalData.position = c_prop.guildPostKey.rankFile;
            guildPersonalData.guildAct = 0;
            guildPersonalData.ennoble = c_prop.ennobleTypeKey.civilian;
            guildPersonalData.lastQuipGuildTime = new Date();
            if (guildPersonalData.outMsg.indexOf(guildId) < 0) guildPersonalData.outMsg.push(guildId);
            guildUtils.addTodayExitGuild(guildPersonalData, 1);
            var updateGuildPersonalData = {
                noticeCount: guildPersonalData.noticeCount,
                actData: guildPersonalData.actData,
                lotteryCount: guildPersonalData.lotteryCount,
                guildId: guildPersonalData.guildId,
                position: guildPersonalData.position,
                viceTime: guildPersonalData.viceTime,
                todayAct: guildPersonalData.todayAct,
                actLastTime: guildPersonalData.actLastTime,
                addUpAct: guildPersonalData.addUpAct,
                outMsg: guildPersonalData.outMsg,
                exitGuildCount: guildPersonalData.exitGuildCount,
                guildAct: guildPersonalData.guildAct,
                ennoble: guildPersonalData.ennoble,
                lastQuipGuildTime: guildPersonalData.lastQuipGuildTime
            };
            async.parallel([
                function(cb1) {
                    guildDao.del(client, { id: guildData.id }, cb1);
                    g_guild.delGuildInCache(guildData.id);
                },
                function(cb1) {
                    guildPersonalDao.update(client, updateGuildPersonalData, { id: guildPersonalData.id }, cb1);
                }
            ], function(err, upData) {
                if (err) return cb(err);
                g_data.setGuildId(userId, null);
                g_data.setGuildEnnoble(userId, null);
                cb(null, [{}, updateGuildPersonalData, guildId]);
            });
        } else { //成员
            //行会战开启期间，无法退出行会和解散行会

            var ennoble = guildPersonalData.ennoble;
            if (ennoble) {
                guildData.ennobleData[ennoble] -= 1;
                if (guildData.ennobleData[ennoble] < 0) guildData.ennobleData[ennoble] = 0;
            }
            //if(guildPersonalData.position == c_prop.guildPostKey.viceChairman) commonUtils.arrayRemoveObject(guildData.viceChairmanId, guildPersonalData.userId);
            var viceChairmanId = guildData.viceChairmanId || [];
            for (var i = 0; i < viceChairmanId.length; i++) {
                if (viceChairmanId[i] == guildPersonalData.userId) viceChairmanId.splice(i, 1);
            }
            guildPersonalData.guildId = 0;
            guildPersonalData.position = c_prop.guildPostKey.rankFile;
            guildPersonalData.guildAct = 0;
            guildPersonalData.ennoble = c_prop.ennobleTypeKey.civilian;
            guildPersonalData.lastQuipGuildTime = new Date();
            if (guildPersonalData.outMsg.indexOf(guildId) < 0) guildPersonalData.outMsg.push(guildId);
            guildUtils.addTodayExitGuild(guildPersonalData, 1);
            guildData.guildPopulation -= 1;
            if (guildData.guildPopulation < 1) guildData.guildPopulation = 1;

            var updateGuildData = {
                guildPopulation: guildData.guildPopulation,
                viceChairmanId: guildData.viceChairmanId,
                ennobleData: guildData.ennobleData
            };
            var updateGuildPersonalData = {
                actData: guildPersonalData.actData,
                lotteryCount: guildPersonalData.lotteryCount,
                noticeCount: guildPersonalData.noticeCount,
                guildId: guildPersonalData.guildId,
                position: guildPersonalData.position,
                viceTime: guildPersonalData.viceTime,
                todayAct: guildPersonalData.todayAct,
                actLastTime: guildPersonalData.actLastTime,
                addUpAct: guildPersonalData.addUpAct,
                outMsg: guildPersonalData.outMsg,
                exitGuildCount: guildPersonalData.exitGuildCount,
                guildAct: guildPersonalData.guildAct,
                lastQuipGuildTime: guildPersonalData.lastQuipGuildTime,
                ennoble: guildPersonalData.ennoble
            };

            g_guild.setGuild(guildData.id, guildData);

            async.parallel([
                function(cb1) {
                    guildPersonalDao.update(client, updateGuildPersonalData, { id: guildPersonalData.id }, cb1);
                }
            ], function(err, upData) {
                if (err) return cb(err);

                g_data.setGuildId(userId, null);

                cb(null, [updateGuildData, updateGuildPersonalData, 0]);
            });
        }
    });
};

/**
 * 抽奖
 * @param client
 * @param userId
 * @param cb
 */
exports.lottery = function(client, userId, count, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            // guildPersonalDao.select(client,{userId:userId},cb1);
            _getRecordData(client, userId, cb1);
        },
        function(cb1) {
            //userDao.select(client,{id:userId}, cb1);
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[1];
        var guildPersonalData = data[0],
            userData = gamePlayer.userData;
        if (!guildPersonalData.guildId) return cb(getMsg(c_msgCode.outGuild));
        //var lotteryCount = guildUtils.getTodayLottery(guildPersonalData);
        //if (lotteryCount >= c_vip[userData.vip].guildLotteryCount) return cb(getMsg(c_msgCode.noTreasure));
        var guildData = g_guild.getGuild(guildPersonalData.guildId);
        if (!guildData) cb(getMsg(c_msgCode.outGuild));
        if (guildData.lvl < c_game.guildSet[8]) return cb(getMsg(c_msgCode.noGuildLevel));

        guildUtils.calRefreshGuildPersonalData(guildPersonalData);
        var items = {};

        //必掉金币
        // var willFall = {};
        // willFall[c_prop.spItemIdKey.gold] = parseInt(c_game.lotteryWillFall[0])*parseInt(count);
        // items = propUtils.mergerProp(items,willFall);

        var cosAct = 0; //消耗贡献值
        for (var i = 0; i < count; i++) {
            items = propUtils.mergerProp(items, _getLotteryObj(userData.lvl, guildData.lvl));
            cosAct += c_game.guildAct[2]; //消耗贡献值
        }

        var costItemId = c_prop.spItemIdKey.guildAct;
        var num = userData.bag[costItemId] || 0;
        if (cosAct > num) {
            return cb(getMsg(c_msgCode.ctrbUnenough)); //贡献值不足
        }

        userUtils.delBag(userData, costItemId, cosAct, c_prop.itemCostTypeKey.compound2);

        //if (guildPersonalData.addUpAct < cosAct) return cb(getMsg(c_msgCode.ctrbUnenough));//贡献值不足

        //获得物品
        var delBagItems = {};
        delBagItems[costItemId] = cosAct;

        var bagItems = {};
        var equipBagItems = {};
        var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetType.guildLottery);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);

        //贡献值扣除
        guildPersonalData.addUpAct -= cosAct;
        //guildUtils.addTodayLottery(guildPersonalData, 1);


        for (var key in items) {
            var locItemData = t_item[key];
            chatBiz.addSysData(32, [userData.nickName, locItemData.name, locItemData.color]);
        }

        heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.guildExplore, count);

        //更新
        var updateData = {
            gold: userData.gold,
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond,
            prestige: userData.prestige
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(delBagItems, equipBagItems));
        var updateGpData = {
            todayAct: guildPersonalData.todayAct,
            exitGuildCount: guildPersonalData.exitGuildCount,
            lotteryCount: guildPersonalData.lotteryCount,
            actLastTime: guildPersonalData.actLastTime,
            noticeCount: guildPersonalData.noticeCount,
            addUpAct: guildPersonalData.addUpAct,
            actData: guildPersonalData.actData,
            guildAct: guildPersonalData.guildAct,
            giftData: guildPersonalData.giftData,
            weekHydChests: guildPersonalData.weekHydChests,
            todayHydChests: guildPersonalData.todayHydChests,
            weekRefreshTime: guildPersonalData.weekRefreshTime,
            fuliChests: guildPersonalData.fuliChests,
            actCrit: guildPersonalData.actCrit
            //lotteryCount: guildPersonalData.lotteryCount
        };
        async.parallel([
            function(cb1) {
                guildPersonalDao.update(client, updateGpData, { id: guildPersonalData.id }, cb1);
            }
        ], function(err, data1) {
            if (err) return cb(err);
            return cb(null, [updateData, updateGpData, items, bagItems, equipBagItems, delBagItems]);
        });
    });
};

/**
 * 爵位
 * @param client
 * @param userId
 * @param targetUserId
 * @param ennobleType
 * @param cb
 */
exports.setEnnoble = function(client, userId, targetUserId, ennobleType, cb) {
    ennobleType = parseInt(ennobleType);
    checkRequire();
    async.parallel([
        function(cb1) {
            guildPersonalDao.select(client, { userId: userId }, cb1);
        },
        function(cb1) {
            guildPersonalDao.select(client, { userId: targetUserId }, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var mPersonalData = data[0],
            tPersonalData = data[1];
        if (!mPersonalData.guildId) return cb(getMsg(c_msgCode.outGuild));
        var guildData = g_guild.getGuild(mPersonalData.guildId);
        if (!guildData) return cb(getMsg(c_msgCode.outGuild));
        if (mPersonalData.guildId != tPersonalData.guildId) return cb(getMsg(c_msgCode.notInSameGild)); //该玩家不在同一个行会
        if (c_guildFuncCfg[mPersonalData.position].setEnnoble == 0) return cb(getMsg(c_msgCode.noPower)); //没有权限
        var ennobleCountObj = {};
        var ennobleCount = c_guildLvl[guildData.lvl].ennobleCount; //[亭长,庶长,轻骑,游骑,校尉,都尉,男爵,子爵,伯爵,侯爵,公爵,王爵]
        for (var i = 0; i < ennobleCount.length; i++) {
            ennobleCountObj[ennobleCount[i][0]] = ennobleCount[i][1];
        }

        if (ennobleType == c_prop.ennobleTypeKey.civilian) {
            var oldEnnoble = tPersonalData.ennoble;
            if (oldEnnoble) {
                var oldEnnobleCount = guildData.ennobleData[oldEnnoble] || 0;
                if (oldEnnobleCount > 0) {
                    oldEnnobleCount--;
                    guildData.ennobleData[oldEnnoble] = oldEnnobleCount;
                }
            }
            //设置爵位
            tPersonalData.ennoble = c_prop.ennobleTypeKey.civilian;
        } else {
            if (!ennobleCountObj[ennobleType]) return cb(getMsg(c_msgCode.allianceNonstandard)); //行会等级不足!
            var nowCount = 0;
            var allowCount = ennobleCountObj[ennobleType];
            //人数判断
            if (!guildData.ennobleData) guildData.ennobleData = {};
            if (guildData.ennobleData[ennobleType]) nowCount = guildData.ennobleData[ennobleType];
            if (nowCount >= allowCount) return cb(getMsg(c_msgCode.noPosition));

            var memberLvl = _getRankFileLvl(tPersonalData.guildAct);
            if (memberLvl == 0 && ennobleType != c_prop.ennobleTypeKey.civilian) return cb(getMsg(c_msgCode.noMemberLv));
            var ennobleCon = c_lvl[memberLvl].ennobleCon;
            if (ennobleCon.indexOf(ennobleType) < 0) return cb(getMsg(c_msgCode.noMemberLv));

            if (tPersonalData.ennoble != ennobleType) {
                var oldEnnoble = tPersonalData.ennoble;
                if (oldEnnoble) {
                    var oldEnnobleCount = guildData.ennobleData[oldEnnoble] || 0;
                    if (oldEnnobleCount > 0) {
                        oldEnnobleCount--;
                        guildData.ennobleData[oldEnnoble] = oldEnnobleCount;
                    }
                }
                //设置爵位
                tPersonalData.ennoble = ennobleType;
                if (guildData.ennobleData[ennobleType]) {
                    guildData.ennobleData[ennobleType] = nowCount + 1;
                } else {
                    guildData.ennobleData[ennobleType] = 1;
                }
            }
        }

        guildUtils.checkGuildGiftData(tPersonalData, 4, tPersonalData.ennoble);
        var updateTPersonal = {
            ennoble: tPersonalData.ennoble,
            giftData: tPersonalData.giftData
        };
        var updateGuild = {
            ennobleData: guildData.ennobleData
        };
        g_guild.setGuild(guildData.id, guildData);
        g_data.setGuildEnnoble(tPersonalData.userId, tPersonalData.ennoble);


        guildPersonalDao.update(client, updateTPersonal, { id: tPersonalData.id }, function(err, data) {
            if (err) return cb(err);
            var returnArr = [];
            returnArr.push(updateGuild);
            if (userId == targetUserId) returnArr.push(updateTPersonal);
            cb(null, returnArr);
        });
    });
};

//获取行会列表
exports.getGuildList = function(client, userId, cb) {
    checkRequire();
    //userDao.select(client,{id:userId},function(err,userData){
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var lvl = userData.lvl;
        guildDao.listCols(client, " id,lvl,name,guildPopulation ", " joinCon != ? AND joinLvl <= ? ", [c_prop.guildJoinConKey.cannot, lvl], function(err, guildData) {
            if (err) return cb(err);
            if (!guildData) {
                cb(null, []);
            } else {
                cb(null, guildData);
            }
        });
    });
};

// 公会礼包
/* type = 1 等级 
 * type = 2 打行会boss
 * type = 3 行会捐献
 * type = 4 行会爵位
 * type = 5 小队评级
 * 
 */
exports.checkGuildGift = function(client, userId, type, value, cb) {
    checkRequire();
    _getRecordData(client, userId, function(err, guildPersonalData) {
        if (err) return cb(err);

        var bChanged = false;
        var giftData = guildPersonalData.giftData || {};
        var giftIdKeys = Object.keys(giftData);
        for (var i = 0; i < giftIdKeys.length && i < 20; i++) {
            var id = giftIdKeys[i];
            if (c_guildGift[id].type == type) {
                if (type == 2) {
                    if (giftData[id][0] == 0) {
                        bChanged = true;
                        giftData[id][0] = 1;
                    }
                } else if (type == 1 || type == 4 || type == 5) {
                    if (c_guildGift[id].targetValue <= value && giftData[id][0] == 0) {
                        bChanged = true;
                        giftData[id][0] = 1;
                    }
                } else if (type == 3) {
                    if (c_guildGift[id].targetValue == value && giftData[id][0] == 0) {
                        bChanged = true;
                        giftData[id][0] = 1;
                    }
                }
            }
        }
        guildPersonalData.giftData = giftData;

        if (bChanged) {
            var updateGuildPersonalData = {
                giftData: guildPersonalData.giftData
            };

            guildPersonalDao.update(client, updateGuildPersonalData, { id: guildPersonalData.id }, cb);
        } else {
            cb(null);
        }
    });
}

// 公会个人成长
exports.guildGrown = function(client, userId, userName, gid, cb) {
    checkRequire();
    var guildGrownData = c_guildGrown[gid];
    if (!guildGrownData) return cb(getMsg(c_msgCode.abnormalData)); //数据异常");
    _getRecordData(client, userId, function(err, guildPersonalData) {
        if (err) return cb(err);
        var guildId = guildPersonalData.guildId;
        g_data.setGuildId(userId, guildId);
        g_data.setGuildEnnoble(userId.userId, guildPersonalData.ennoble);
        if (!guildId) return cb(null, [null, null]);
        var guildData = g_guild.getGuild(guildPersonalData.guildId);

        //判断次数
        var num = guildUtils.getGrownNum(guildData, gid);
        if (num >= guildGrownData.num) return cb(null, [null, null]);

        //增加次数
        guildUtils.addGrownNum(guildData, gid, 1);
        var ret = guildUtils.addGuildHyd(guildData, parseInt(guildGrownData.hyd));
        if (ret[1]) { // 补刀奖

            var mailItems = {};
            mailItems[c_game.guildGrownCfg[2]] = 1;
            mailBiz.addByType(client, userId, 72, [], mailItems, function() {});
            guildData.hydLuckyName = userName;
        }

        var updateGuildPersonal = {};

        var updateGuild = {
            addUpAct: guildData.addUpAct,
            lvl: guildData.lvl,
            todayHyd: guildData.todayHyd,
            weekHyd: guildData.weekHyd,
            todayHydRefreshTime: guildData.todayHydRefreshTime,
            weekHydRefreshTime: guildData.weekHydRefreshTime,
            hydData: guildData.hydData,
            hydLuckyName: guildData.hydLuckyName
        };
        g_guild.setGuild(guildData.id, guildData);
        cb(null, [updateGuild, updateGuildPersonal, guildGrownData.hyd]);
    });
}

// 行会礼盒列表
exports.getGitfBoxList = function(client, userId, cb) {
    checkRequire();
    _getRecordData(client, userId, function(err, guildPersonalData) {
        if (err) return cb(err);
        var guildId = guildPersonalData.guildId;
        g_data.setGuildId(userId, guildId);
        g_data.setGuildEnnoble(userId.userId, guildPersonalData.ennoble);
        if (!guildId) return cb(getMsg(c_msgCode.noGuild)); //没有公会
        var guildData = g_guild.getGuild(guildPersonalData.guildId);
        guildGiftBoxDao.list(client, " guildId =? and endTime >= ?", [guildId, new Date()], function(err, giftBoxList) {
            //guildGiftBoxDao.getGiftBoxList(client, guildId, new Date(), function(err, giftBoxList){
            if (err) return cb(err);
            //console.log("giftBoxList:", giftBoxList);
            return cb(null, giftBoxList);
        });
    });
};

// 领取礼盒
exports.getGitfBox = function(client, userId, id, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            _getRecordData(client, userId, cb1);
        },
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[1];
        var guildPersonalData = data[0],
            userData = gamePlayer.userData;

        if (err) return cb(err);
        var guildId = guildPersonalData.guildId;
        g_data.setGuildId(userId, guildId);
        g_data.setGuildEnnoble(userId.userId, guildPersonalData.ennoble);
        if (!guildId) return cb(getMsg(c_msgCode.noGuild)); //没有公会
        var guildData = g_guild.getGuild(guildPersonalData.guildId);

        guildGiftBoxDao.select(client, { id: id, guildId: guildId }, function(err, guildGiftBoxData) {
            if (err) return cb(err);
            if (!guildGiftBoxData) return cb(getMsg(c_msgCode.giftBoxUnexist)); //礼盒不存在

            guildGiftBoxData.recvers = guildGiftBoxData.recvers || [];
            if (guildGiftBoxData.recvers.indexOf(userId) != -1) {
                return cb(getMsg(c_msgCode.hasReward)); //已领取过
            }

            var needNum = 0;
            var giftArr = c_game.guildGiftBoxCfg[0].split(";");
            for (var i = 0; i < giftArr.length; i++) {
                var ids = giftArr[i].split(",");
                if (ids[0] == guildGiftBoxData.giftBoxId) {
                    needNum = parseInt(ids[1]);
                    break;
                }
            }

            if (needNum <= 0) {
                return cb(getMsg(c_msgCode.giftBoxConfigError)); //礼盒配置不对
            }

            var costItemId = c_prop.spItemIdKey.guildAct;
            var num = userData.bag[costItemId] || 0;
            if (needNum > num) {
                return cb(getMsg(c_msgCode.noItem)); //道具不足
            }

            userUtils.delBag(userData, costItemId, needNum, c_prop.itemCostTypeKey.guildGiftBox);

            // // 消耗贡献度
            // if (guildPersonalData.addUpAct < cosAct){
            //     return cb("贡献值不够");
            // }
            //guildPersonalData.addUpAct -= cosAct;

            guildGiftBoxData.recvers.push(userId);

            var logicItems = itemBiz.calLogicItems(guildGiftBoxData.giftBoxId); //随机的物品
            var getDiamond = 0;
            if (logicItems[c_prop.spItemIdKey.diamond]) {
                getDiamond = logicItems[c_prop.spItemIdKey.diamond];
            }
            //获得物品
            var delBagItems = {};
            delBagItems[costItemId] = needNum;

            var bagItems = {};
            // var equipBagItems = {};
            var itemsArr = userUtils.saveItems(userData, logicItems, c_prop.itemGetTypeKey.guildGiftBox);
            if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);

            var updateData = {
                recvers: guildGiftBoxData.recvers
            };
            guildUtils.calRefreshGuildPersonalData(guildPersonalData);
            //更新
            var updateUserData = {
                gold: userData.gold,
                diamond: userData.diamond,
                buyDiamond: userData.buyDiamond,
                giveDiamond: userData.giveDiamond,
                prestige: userData.prestige
            };
            gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
            var updateGpData = {
                todayAct: guildPersonalData.todayAct,
                exitGuildCount: guildPersonalData.exitGuildCount,
                lotteryCount: guildPersonalData.lotteryCount,
                actLastTime: guildPersonalData.actLastTime,
                noticeCount: guildPersonalData.noticeCount,
                addUpAct: guildPersonalData.addUpAct,
                actData: guildPersonalData.actData,
                guildAct: guildPersonalData.guildAct,
                giftData: guildPersonalData.giftData,
                weekHydChests: guildPersonalData.weekHydChests,
                todayHydChests: guildPersonalData.todayHydChests,
                weekRefreshTime: guildPersonalData.weekRefreshTime,
                fuliChests: guildPersonalData.fuliChests,
                actCrit: guildPersonalData.actCrit
            };
            async.parallel([
                function(cb1) {
                    guildPersonalDao.update(client, updateGpData, { id: guildPersonalData.id }, cb1);
                },
                function(cb1) {
                    guildGiftBoxDao.update(client, updateData, { id: id }, cb1);
                }
            ], function(err, data1) {
                if (err) return cb(err);
                return cb(null, [updateUserData, updateData, updateGpData, bagItems, delBagItems, getDiamond]);
            });

        });
    });
};

// 发送礼盒
exports.sendGiftBox = function(client, userId, userName, giftBoxId, cb) {
    checkRequire();
    _getRecordData(client, userId, function(err, guildPersonalData) {
        if (err) return cb(err);
        var guildId = guildPersonalData.guildId;
        g_data.setGuildId(userId, guildId);
        g_data.setGuildEnnoble(userId.userId, guildPersonalData.ennoble);
        if (!guildId) return cb(getMsg(c_msgCode.noGuild)); //没有公会
        var guildData = g_guild.getGuild(guildPersonalData.guildId);

        var guildGiftBoxData = new GuildGiftBoxEntity();
        guildGiftBoxData.guildId = guildId;
        guildGiftBoxData.giftBoxId = giftBoxId;
        guildGiftBoxData.userId = userId;
        guildGiftBoxData.userName = userName;
        guildGiftBoxData.sendTime = new Date();
        guildGiftBoxData.endTime = (new Date()).addHours(24);
        guildGiftBoxData.recvers = [];

        guildGiftBoxDao.insert(client, guildGiftBoxData, function(err, data) {
            if (err) return cb(err);
            guildGiftBoxData.id = data.insertId;
            cb(null, guildGiftBoxData);
        });
    });
};

// 查公会id和名称
exports.getGuildSimpleInfo = function(client, userId, cb) {
    checkRequire();
    guildPersonalDao.select(client, { userId: userId }, function(err, guildPersonalData) {
        if (err) return cb(null, [0, '', 0, 0]);
        if (!guildPersonalData) return cb(null, [0, '', 0, 0]);
        if (guildPersonalData.guildId <= 0) {
            return cb(null, [0, '', 0, 0]);
        }
        var guildData = g_guild.getGuild(guildPersonalData.guildId);
        if (!guildData) return cb(null, [0, '', 0]);
        return cb(null, [guildData.id, guildData.name, guildData.lvl, guildData.chairmanId]);
        // guildDao.select(client, { id: guildPersonalData.guildId }, function(err, guildData) {
        //     if (err || !guildData) return cb(null, [0, '', 0]);
        //     return cb(null, [guildData.id, guildData.name, guildData.lvl, guildData.chairmanId]);
        // })
    });
};

// 获得公会仓库
exports.getWareHouse = function(client, userId, cb) {
    checkRequire();
    guildPersonalDao.select(client, { userId: userId }, function(err, guildPersonalData) {
        if (err) return cb(err);
        if (!guildPersonalData.guildId) return cb(getMsg(c_msgCode.noGuild));
        if (guildPersonalData.position != c_prop.guildPostKey.chairman) return cb(getMsg(c_msgCode.noPower)); //没有权限

        var guildData = g_guild.getGuild(guildPersonalData.guildId);
        var data = {
            wareHouse: guildData.wareHouse
        };
        if (!guildData) return cb(getMsg(c_msgCode.noGuild));
        return cb(null, data);
    });
};

// 处理公会仓库
exports.dealWareHouse = function(client, userId, idx, targetUserId, targetUserName, cb) {
    checkRequire();
    async.parallel([
        function(cb1) {
            _getRecordData(client, userId, cb1);
        },
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var guildPersonalData = data[0];
        var gamePlayer = data[1];
        var userData = gamePlayer.userData;

        if (!guildPersonalData.guildId) return cb(getMsg(c_msgCode.noGuild));
        if (guildPersonalData.position != c_prop.guildPostKey.chairman) return cb(getMsg(c_msgCode.noPower)); //没有权限

        var guildData = g_guild.getGuild(guildPersonalData.guildId);
        if (!guildData) return cb(getMsg(c_msgCode.noGuild));

        var wareHouse = guildData.wareHouse || {}; //公会仓库
        //{"1":[10001,1]},"2":[10001,1]}    maxId = parseInt(commonUtils.getLastKey(wareHouse)) + 1;
        if (!wareHouse[idx]) return cb(getMsg(c_msgCode.invalidData)); //无效的数据

        var mailItems = {};
        mailItems[wareHouse[idx][0]] = wareHouse[idx][1];
        // mailItems = propUtils.mergerProp(mailItems, wareHouse[idx]);
        //只会发一种物品给一个人
        // console.error('dealWareHouse--->',mailItems);
        if (JSON.stringify(mailItems) != "{}") {
            mailBiz.addByType(client, targetUserId, c_prop.mailTypeKey.dealWareHouse, [], mailItems, function() {});
        }
        var itemInfo = t_item[wareHouse[idx][0]];
        chatBiz.addSysData(163, [userData.nickName, itemInfo.id, itemInfo.color, itemInfo.name, targetUserName]);
        delete wareHouse[idx];
        guildData.wareHouse = wareHouse;
        g_guild.setGuild(guildData.id, guildData);
        return cb(null, guildData);
    });
};

var _addItem2GuildWareHouse = function(guild, itemId, itemNum) {
    guild.wareHouse = guild.wareHouse || {};
    if (Array.isArray(guild.wareHouse)) {
        guild.wareHouse = {};
    }
    var maxId = 1;
    if (guild.wareHouse != null && JSON.stringify(guild.wareHouse) != "{}") maxId = parseInt(commonUtils.getLastKey(guild.wareHouse)) + 1;
    guild.wareHouse[maxId] = [itemId, itemNum];
    // guild.wareHouse[maxId][itemId] = itemNum;
};

//行会战 获取上届 0个人积分排行 1行会积分排行 
exports.getScoreRankListByType = function(client, type, cb) {
    checkRequire();
    //guildBattleRecordDao.select(client, " 1=1 order by id desc", [], function(err, record) {
    guildBattleRecordDao.getLastRecord(client, function(err, record) {
        if (err) return cb(err);
        var updateRecord = {};
        if (type == 0) {
            updateRecord.battleUser = [];
            if (record) {
                updateRecord.battleUser = record.battleUser || [];
            }
        } else {
            updateRecord.battleGuild = [];
            if (record) {
                updateRecord.battleGuild = record.battleGuild || [];
            }
        }
        return cb(null, updateRecord);
    });
};

exports.noticeGuildBattleResult = function(client, guildRes, userRes, cb) {
    checkRequire();
    exports.recoreGuildBattleResult(client, guildRes, userRes, function(err, data) {
        if (err) return cb(err);
        exports.guildBattleResult(client, guildRes, userRes, cb);
    });
};

// exports.noticeGuildBattleResult = function(client, cb) {
//     checkRequire();
//     guildBattleRecordDao.getLastRecord(client, function(err, record) {
//         //guildBattleRecordDao.select(client, " 1=1 order by id desc", [], function(err, record) {
//         if (err) return cb(err);
//         if (!record) {
//             console.error("noticeGuildBattleResult no record");
//             return cb(null);
//         }
//         exports.guildBattleResult(client, record.battleGuild, record.battleUser, cb);
//     });
// };

exports.guildBattleResult = function(client, guildRes, userRes, cb) {
    logger.error("[GUILDBATTLE] guildBattleResult:", guildRes, userRes);
    checkRequire();
    // 公会排名 
    for (var i = 0; i < guildRes.length; i++) {
        if (i == 0) {
            //  胜利奖
            _sendGuildBattleWinnerAward(client, guildRes[i]);
            // 会长的占领奖励
            _sendGuildBattleChairmanAward(client, guildRes[i]);
            // 胜利行会增加礼盒
            _sendGuildBattleGiftBox(client, guildRes[i]);

            g_guild.checkAndSetBattleRecord(guildRes[i].guildId, new Date());

            _noticeGuildBattleEnd(guildRes[i].guildId);
        } else {
            // 参与奖
            _sendGuildBattleParticipateAward(client, guildRes[i], i);
        }

        // 公会排行奖励，如公会仓库
        if (0 <= i && i <= 2) {
            var rewardItems = _getGuildBattleRankReward(i);
            var guild = g_guild.getGuild(guildRes[i].guildId);
            //  加入公会仓库
            rewardItems.forEach(function(e) {
                _addItem2GuildWareHouse(guild, e[0], e[1]);
            });
            logger.error("[GUILDBATTLE] addGuildWareHouse:", guild.id, rewardItems, guild.wareHouse);
            g_guild.setGuild(guild.id, guild);
        }
    }
    // 玩家排名
    var tempList = [];
    for (var i = 0; i < userRes.length; i++) {
        heroBiz.checkAndUpdateHeroTask(userRes[i].userId, c_prop.cHeroTaskKey.guildBattleNum, 1);
        if (i > 9) continue;
        var items = _getGuildBattlePersonalRankReward(i);
        var locMail = mailBiz.createEntityByType(userRes[i].userId, 86, [i + 1], items);
        locMail.addTime = new Date();
        tempList.push(locMail);
    }

    mailBiz.addMailByList(client, tempList, function() {});
    cb(null, { ret: 0 });
};

exports.sendGuildBattleWareHouseReward = function(client, cb) {
    checkRequire();
    guildBattleRecordDao.getLastRecord(client, function(err, record) {
        if (err) return cb(err);
        if (!record) {
            console.error("noticeGuildBattleResult no record");
            return cb(null);
        }

        async.map([0, 1, 2], function(idx, cb1) {
            if (!record.battleGuild[idx]) return cb1(null);
            var guildId = record.battleGuild[idx].guildId;
            var rewardItems = _getGuildBattleRankReward(idx);
            guildDao.select(client, { id: guildId }, function(err, guildData) {
                if (err) return;
                //  加入公会仓库
                rewardItems.forEach(function(e) {
                    _addItem2GuildWareHouse(guildData, e[0], e[1]);
                });
                logger.error("[GUILDBATTLE] addGuildWareHouse:", guildData.id, rewardItems, guildData.wareHouse);
                guildDao.update(client, { wareHouse: guildData.wareHouse }, { id: guildData.id }, cb1);

            });
        }, function(err, data) {
            if (err) return cb(err);
            return cb(null);
        });
    });
};

// 发送公会战奖励（给脚本用)
exports.sendGuildBattleResultForScript = function(client, cb) {
    checkRequire();
    guildBattleRecordDao.getLastRecord(client, function(err, record) {
        //guildBattleRecordDao.select(client, " 1=1 order by id desc", [], function(err, record) {
        if (err) return cb(err);
        if (!record) {
            console.error("noticeGuildBattleResult no record");
            return cb(null);
        }
        exports.guildBattleResultForScript(client, record.battleGuild, record.battleUser, cb);
    });
};

//发送公会战奖励（给脚本用)
exports.guildBattleResultForScript = function(client, guildRes, userRes, cb) {
    console.error("[GUILDBATTLE] guildBattleResult:", guildRes, userRes);
    checkRequire();
    // 公会排名 
    for (var i = 0; i < guildRes.length; i++) {
        if (i == 0) {
            //  胜利奖
            _sendGuildBattleWinnerAward(client, guildRes[i]);
            // 会长的占领奖励
            _sendGuildBattleChairmanAward(client, guildRes[i]);
            // 胜利行会增加礼盒
            _sendGuildBattleGiftBox(client, guildRes[i]);

        } else {
            // 参与奖
            _sendGuildBattleParticipateAward(client, guildRes[i], i);
        }

        // // 公会排行奖励，如公会仓库
        // if (0 <= i && i <= 2) {
        //     var rewardItems = _getGuildBattleRankReward(i);
        //     var guild = g_guild.getGuild(guildRes[i].guildId);
        //     //  加入公会仓库
        //     rewardItems.forEach(function(e) {
        //         _addItem2GuildWareHouse(guild, e[0], e[1]);
        //     });
        //     console.error("[GUILDBATTLE] addGuildWareHouse:", guild.id, rewardItems, guild.wareHouse); 
        // }
    }
    // 玩家排名
    var tempList = [];
    for (var i = 0; i < userRes.length; i++) {
        if (i > 9) continue;
        var items = _getGuildBattlePersonalRankReward(i);
        var locMail = mailBiz.createEntityByType(userRes[i].userId, 86, [i + 1], items);
        locMail.addTime = new Date();
        tempList.push(locMail);
    }

    mailBiz.addMailByList(client, tempList, function() {});
    cb(null, { ret: 0 });
};

var _noticeGuildBattleEnd = function(guildId) {
    var guild = g_guild.getGuild(guildId);
    if (!guild) {
        return;
    }
    chatBiz.addSysData(162, [guild.name, guild.name]);
};

exports.getPReward = function(client, userId, idx, cb) {
    if (idx < 0 || idx >= 5) return cb("idx err");
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var cfg = c_game.guildBattleCfg[3].split(";")[idx];
        var items = {};
        var itemCfg = cfg.split(",");
        items[parseInt(itemCfg[1])] = parseInt(itemCfg[2]);
        userUtils.saveItems(gamePlayer.userData, items, c_prop.itemGetTypeKey.guildBattleBox);
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        cb(null, [items]);
    });
};

exports.preGuildBattleMsg = function(minutes) {
    checkRequire();
    if (minutes) {
        chatBiz.addSysData(160, []);
        chatBiz.addSysData(164, []);
    } else {
        chatBiz.addSysData(161, []);
        chatBiz.addSysData(165, []);
    }
};

//生成 每日探索 奖品数据
exports.refreshExplore = function(client, userId, cb) {
    checkRequire();
    var now = new Date();
    async.parallel([
        function(cb1) {
            _getRecordData(client, userId, cb1);
        },
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var guildPersonalData = data[0];
        var gamePlayer = data[1];
        var userData = gamePlayer.userData;

        var battleRecord = g_guild.getBattleRecord();
        if (!battleRecord || !battleRecord.guildId || guildPersonalData.guildId != battleRecord.guildId) return cb("遗迹争夺战获胜行会才能探索"); //该物品已被抽取过

        var guildExploreData = userData.exData[c_prop.userExDataKey.guildExplore] || {};
        if (guildExploreData.refreshTime) {
            var refreshTime = new Date(guildExploreData.refreshTime); //刷新时间;
            if (refreshTime.equalsDay(now)) return cb(null, [{}, {}, {}]);
        }

        var costCfg = c_game.guildBattleCfg[6];
        var costArr = costCfg.split(":");
        var costItemId = costArr[0] * 1; //c_prop.spItemIdKey.guildAct;
        var costNum = costArr[1] * 1;

        var num = userData.bag[costItemId] || 0;
        if (costNum > num) {
            return cb(getMsg(c_msgCode.ctrbUnenough)); //贡献值不足
        }
        // if (guildPersonalData.addUpAct < costNum) return cb(getMsg(c_msgCode.ctrbUnenough));//贡献值不足

        userUtils.delBag(userData, costItemId, costNum, c_prop.itemCostTypeKey.guildExplore);

        //扣除贡献
        var delBagItems = {};
        delBagItems[costItemId] = costNum;

        //贡献值扣除
        // guildPersonalData.addUpAct -= cosAct;

        var cfgArr = c_game.guildBattleCfg[7].split(";");
        cfgArr.forEach(function(str, index) {
            cfgArr[index] = str.split(",");
        });
        // console.error('cfgArr',cfgArr);
        var items = commonUtils.getWeightArray(cfgArr, 6);
        // console.error('items',items);
        guildExploreData.items = items;
        guildExploreData.refreshTime = now;
        guildExploreData.reciiveArr = [];
        userData.exData[c_prop.userExDataKey.guildExplore] = guildExploreData;

        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        var updateData = {
            exData: userData.exData
        };
        var updateGpData = {
            addUpAct: guildPersonalData.addUpAct
        };
        async.parallel([
            function(cb1) {
                guildPersonalDao.update(client, updateGpData, { id: guildPersonalData.id }, cb1);
            }
        ], function(err, data1) {
            if (err) return cb(err);
            return cb(null, [updateData, updateGpData, delBagItems]);
        });
    });
}

//公会战每日探索
exports.explore = function(client, userId, index, cb) {
    if (index < 0 || index > 5) return cb(getMsg(c_msgCode.paramsError)); //参数错误!
    checkRequire();
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        // {"items":[],"refreshTime":"","reciiveArr":[]}
        // [[{id:物品id,num:物品数量}}],[宝箱领取标识],刷新时间,抽奖有效]
        var guildExploreData = userData.exData[c_prop.userExDataKey.guildExplore];
        if (!guildExploreData) return cb(getMsg(c_msgCode.cannotReward)); //不可领取
        guildExploreData.reciiveArr = guildExploreData.reciiveArr || [];
        if (guildExploreData.reciiveArr && guildExploreData.reciiveArr[index] == 1) return cb(getMsg(c_msgCode.hasChosen)); //该物品已被抽取过

        var count = 0;
        guildExploreData.reciiveArr.forEach(function(data) {
            if (data == 1) count++;
        })
        if (count >= 3) {
            return cb(getMsg(c_msgCode.rewardEnd)); //奖励已领取结束
        }

        guildExploreData.reciiveArr[index] = 1;

        var itemArr = guildExploreData.items;
        var itemCfg = itemArr[index];

        //var logicItems = itemBiz.calLogicItems(chestId);        //宝箱随机的物品
        var items = {};
        items[itemCfg[0]] = itemCfg[1];

        var bagItems = {};
        var equipBagItems = {};
        var itemsArr = userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.guildExplore);
        if (Object.keys(itemsArr[0]).length > 0) bagItems = propUtils.mergerProp(bagItems, itemsArr[0]);
        if (Object.keys(itemsArr[1]).length > 0) equipBagItems = propUtils.mergerProp(equipBagItems, itemsArr[1]);

        var updateData = {
            exData: userData.exData
        };
        gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems, equipBagItems));

        return cb(null, [updateData, bagItems, equipBagItems]);
    });
};

// 分享钻石给公会玩家
exports.shareDiamond = function(client, userId, userName, rechargeId, cb) {
    checkRequire();
    _getRecordData(client, userId, function(err, guildPersonalData) {
        if (err) return cb(err);
        var guildId = guildPersonalData.guildId;
        var myGuild = g_guild.getGuild(guildId);
        if (!myGuild) return cb(null);
        var rechargeInfo = c_shop[rechargeId];
        if (!rechargeInfo) return cb(null);
        if (!rechargeInfo.shareDiamond) return cb(null);
        guildPersonalDao.getPersonUserListByOffTime(client, guildId, 10, function(err, memberList) {
            if (err) return cb(err);
            var mailList = [];
            if (memberList.length == 0) return cb(null);
            var diamond = Math.floor(rechargeInfo.shareDiamond / memberList.length);
            memberList.forEach(function(member) {
                var rewardItem = {};
                rewardItem[200] = diamond;
                var locMail = mailBiz.createEntityByType(member.userId, 69, [userName], rewardItem);
                mailList.push(locMail);
            });
            mailDao.insertList(client, mailList, function(err, data) {
                if (err) return cb(null);
            });
        });

    });
};

/*****************************************************************************************************/
exports.recoreGuildBattleResult = function(client, guildRes, userRes, cb) {
    logger.error("_recoreGuildBattleResult:", guildRes, userRes);
    checkRequire();
    var winnerGuild = guildRes[0] || {};
    var recordEntity = new GuildBattleRecordEntity();
    recordEntity.battleGuild = guildRes;
    recordEntity.battleUser = userRes;
    recordEntity.guildId = winnerGuild.guildId || 0;
    recordEntity.guildName = winnerGuild.guildName || '';
    recordEntity.chairmanId = winnerGuild.chairmanId || 0;
    recordEntity.chairmanName = winnerGuild.chairmanName || '';
    recordEntity.recordTime = new Date();
    guildBattleRecordDao.insert(client, recordEntity, function(err, data) {
        if (err) return cb(err);
        return cb(null);
    });
};

var _getGuildBattlePersonalRankReward = function(idx) {
    var cfg = c_game.guildBattleCfg[2].split(";")[idx];
    var items = {};
    var itemCfg = cfg.split(",");
    for (var i = 0; i < itemCfg.length; i++) {
        var it = itemCfg[i].split(":");
        items[parseInt(it[0])] = parseInt(it[1]);
    }
    return items;
};

var _getGuildBattleRankReward = function(idx) {
    var cfg = c_game.guildBattleCfg[1].split(";")[idx];
    var items = [];
    var itemCfg = cfg.split(",");
    for (var i = 0; i < itemCfg.length; i++) {
        var it = itemCfg[i].split(":");
        var num = parseInt(it[1]);
        if (num > 10) {
            num = 10;
        }
        for (var j = 0; j < num; ++j) {
            items.push([parseInt(it[0]), 1]);
        }
    }
    return items;
};

var _sendGuildBattleGiftBox = function(client, guildInfo) {
    var giftBoxId = parseInt(c_game.guildBattleCfg[8]);
    exports.sendGiftBox(client, guildInfo.chairmanId, guildInfo.chairmanName, giftBoxId, function() {});
};

var _sendGuildBattleWinnerAward = function(client, guildInfo) {
    // var guild = g_guild.getGuild(guildInfo.guildId);
    // if (!guild) return;
    var tempList = [];
    var items = _getGuildBattleCommonRItems(4);
    logger.error("[GUILDBATTLE] _sendGuildBattleWinnerAward:", guildInfo, items);
    guildPersonalDao.getMemberIdList(client, guildInfo.guildId, function(err, userList) {
        if (err) return;
        logger.error("[GUILDBATTLE] _sendGuildBattleWinnerAward memberList:", userList, items);

        userList.forEach(function(user) {
            var locMail = mailBiz.createEntityByType(user.userId, 88, [], items);
            locMail.addTime = new Date();
            tempList.push(locMail);
        });
        mailBiz.addMailByList(client, tempList, function() {});
    });
};

var _sendGuildBattleParticipateAward = function(client, guildInfo, i) {
    // var guild = g_guild.getGuild(guildInfo.guildId);
    // if (!guild) return;
    var tempList = [];
    var items = _getGuildBattleCommonRItems(5);
    logger.error("_sendGuildBattleParticipateAward:", guildInfo, items);
    guildPersonalDao.getMemberIdList(client, guildInfo.guildId, function(err, userList) {
        if (err) return;

        userList.forEach(function(user) {
            var locMail = mailBiz.createEntityByType(user.userId, 89, [i + 1], items);
            locMail.addTime = new Date();
            tempList.push(locMail);
        });
        mailBiz.addMailByList(client, tempList, function() {});
    });
};

var _getGuildBattleCommonRItems = function(idx) {
    var cfg = c_game.guildBattleCfg[idx].split(",");
    var items = {};
    cfg.forEach(function(c) {
        var it = c.split(":");
        var itemId = parseInt(it[0]);
        var itemNum = parseInt(it[1]);
        if (items[itemId]) {
            items[itemId] += itemNum;
        } else {
            items[itemId] = itemNum;
        }
    });
    return items;
};

var _sendGuildBattleChairmanAward = function(client, guildInfo) {
    logger.error("[GUILDBATTLE] _sendGuildBattleChairmanAward:", guildInfo);
    var items = _getGuildBattleCommonRItems(0);
    mailBiz.addByType(client, guildInfo.chairmanId, c_prop.mailTypeKey.presidentAward, [], items, function() {});
};

/*****************************************************************************************************/

//判断是否有数据，无数据插入一条
var _getRecordData = function(client, userId, cb) {
    guildPersonalDao.select(client, { userId: userId }, function(err, guildPersonalData) {
        if (err) return cb(err);
        if (!guildPersonalData) { //如果不存在该用户数据则插入一条
            var guildPersonalEntity = new GuildPersonalEntity();
            guildPersonalEntity.userId = userId;
            guildPersonalEntity.outMsg = [];
            guildPersonalEntity.ennoble = c_prop.ennobleTypeKey.civilian;
            guildPersonalEntity.actLastTime = new Date();
            _fixGuildPersionalGift(guildPersonalEntity);
            guildPersonalEntity.weekHydChests = [0, 0, 0];
            guildPersonalEntity.todayHydChests = [0, 0, 0, 0, 0];
            guildPersonalEntity.fuliChests = [0, 0, 0];
            guildPersonalEntity.weekRefreshTime = new Date();
            guildPersonalEntity.actCrit = 0;

            guildPersonalDao.insert(client, guildPersonalEntity, function(err, data) {
                if (err) return cb(err);
                guildPersonalEntity.id = data.insertId;
                cb(null, guildPersonalEntity);
            });
        } else {
            cb(null, guildPersonalData);
        }
    });
};

// 更新GuildPersonalData
var _updateGuildPersonalData = function(client, guildPersonalData) {
    var updateGuildPersonalData = {
        todayAct: guildPersonalData.todayAct,
        exitGuildCount: guildPersonalData.exitGuildCount,
        lotteryCount: guildPersonalData.lotteryCount,
        actLastTime: guildPersonalData.actLastTime,
        noticeCount: guildPersonalData.noticeCount,
        addUpAct: guildPersonalData.addUpAct,
        actData: guildPersonalData.actData,
        guildAct: guildPersonalData.guildAct,
        giftData: guildPersonalData.giftData,
        weekHydChests: guildPersonalData.weekHydChests,
        todayHydChests: guildPersonalData.todayHydChests,
        weekRefreshTime: guildPersonalData.weekRefreshTime,
        fuliChests: guildPersonalData.fuliChests,
        actCrit: guildPersonalData.actCrit
    }

    guildPersonalDao.update(client, updateGuildPersonalData, { id: guildPersonalData.id }, function(err, data) {});
};

var _fixGuildPersionalGift = function(guildPersonalData) {
    var bChanged = false;
    //if(guildPersonalData.guildId <= 0) return bChanged;
    if (!guildPersonalData.giftData || JSON.stringify(guildPersonalData.giftData) == "{}") {
        guildPersonalData.giftData = {};
        var keys = Object.keys(c_guildGift);
        for (var i = 0; i < keys.length; i++) {
            var id = keys[i];
            var guildGift = c_guildGift[id];
            if (guildGift) {
                guildPersonalData.giftData[id] = [0, 0];
            }
        }
        bChanged = true;
    }
    return bChanged;
};

// var _checkGuildGift = function(guildPersonalData, type, value){

//     var giftData = guildPersonalData.giftData || {};
//     var giftIdKeys = Object.keys(giftData);
//     var bChanged = false;
//     for(var i = 0; i < giftIdKeys.length && i < 20; i++){
//         var id = giftIdKeys[i];
//         if (c_guildGift[id].type == type){
//             if (type == 2){
//                 if (giftData[id][0] == 0){
//                     bChanged = true;
//                     giftData[id][0] = 1;
//                 }
//             }else if (type == 1 || type == 2 || type == 4){
//                 if (c_guildGift[id].targetValue <= value && giftData[id][0] == 0){
//                     bChanged = true;
//                     giftData[id][0] = 1;
//                 }
//             }else if(type == 3){
//                 if (c_guildGift[id].targetValue == value && giftData[id][0] == 0){
//                     bChanged = true;
//                     giftData[id][0] = 1;
//                 }
//             }
//         }
//     } 
//     guildPersonalData.giftData = giftData;
//     return bChanged;
// }

//输出指定范围内的随机数的随机整数
var _getRandomNumber = function(start, end) {
    var choice = end - start + 1;
    return Math.floor(Math.random() * choice + start);
};

//判断权重获得抽奖物品
var _weigh = function(secArr, returnObj, lvl) {
    //获得随机区间的权重总数
    var weightNum = 0; //权重总数
    var weight = 0;
    var weightIdArr = []; //随机库id
    for (var i = secArr[0]; i <= secArr[1]; i++) {
        var lotteryData = c_lottery[i];
        if (!lotteryData) break;
        if (lvl < lotteryData.needLvl) continue;
        if (lvl >= lotteryData.surpassLvl && lotteryData.surpassLvl != 0) continue;
        weightNum = weightNum + lotteryData.rate;
        weightIdArr.push(i);
    }
    //随机物品以及对应数量
    var eventRandomNum = _getRandomNumber(1, weightNum);
    for (var i = 0; i < weightIdArr.length; i++) {
        var locWeightId = weightIdArr[i];
        var lotteryData = c_lottery[locWeightId];
        weight = weight + lotteryData.rate;
        if (weight >= eventRandomNum) {
            returnObj[lotteryData.itemId] = _getRandomNumber(lotteryData.minNum, lotteryData.maxNum);
            break;
        }
    }
}

//获取抽奖所得物品id  {"id":数量,"id":数量,...}
var _getLotteryObj = function(lvl, guildLvl) {
    var returnObj = {};
    //var pro1 = c_game.lotteryCfg[0];     //普通抽奖 库1概率
    var count = 1; //普通抽奖所得数量
    for (var j = 0; j < count; j++) {
        //var randomNum = _getRandomNumber(1, 10000);
        //if (randomNum <= pro1) {}
        var secArr = [];
        if (guildLvl >= 5 && guildLvl < 15) secArr = c_game.guildAct[3].split(",");
        if (guildLvl >= 15 && guildLvl < 30) secArr = c_game.guildAct[4].split(",");
        if (guildLvl >= 30) secArr = c_game.guildAct[5].split(",");
        _weigh(secArr, returnObj, lvl);
    }
    return returnObj;
}

//计算会员等级
var _getRankFileLvl = function(guildAct) {
    var returnLvl = 0;
    if (guildAct < c_lvl[1].rankFileNeedAct) return returnLvl;
    for (var i = 30; i >= 1; i--) {
        if (guildAct >= c_lvl[i].rankFileNeedAct) {
            returnLvl = i;
            break;
        }
    }
    return returnLvl;
}

// 是否在退会cd中 （退出时间 天数 是否小于 当前时间的天数)
var _inQuitGuildCd = function(lastQuitGuildTime) {
    if (!lastQuitGuildTime) return false;

    //var quitGuildCd = parseInt(c_game.guildSet[5])*60*60;
    //var joinTime = lastQuitGuildTime.getTime() + quitGuildCd*1000;
    var tmNow = new Date();
    var okTime = lastQuitGuildTime.clearTime().addDays(1);
    if (tmNow.compareTo(okTime) >= 0) return false;

    return true;
}