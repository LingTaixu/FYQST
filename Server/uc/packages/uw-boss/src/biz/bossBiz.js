/**
 * Created by Administrator on 2014/5/16.
 */

var async = require("async");

var propUtils = require("uw-utils").propUtils;
var uwData = require("uw-data");
var c_msgCode = uwData.c_msgCode;
var getMsg = require("uw-utils").msgFunc(__filename);
var TreasureEntity = require("uw-entity").TreasureEntity;
var consts = uwData.consts;
var c_chatSys = uwData.c_chatSys;
var c_bossParameter = uwData.c_bossParameter;
var c_bossHurtRate = uwData.c_bossHurtRate;
var c_prop = uwData.c_prop;
var c_game = uwData.c_game;
//var c_vip = uwData.c_vip;
var t_otherBuff = uwData.t_otherBuff;
var t_monster = uwData.t_monster;
var t_item = uwData.t_item;
var c_bossCSWorld = uwData.c_bossCSWorld;
var exports = module.exports;
var g_boss = require("uw-global").g_boss;
var g_data = require("uw-global").g_data;
var g_guild = require("uw-global").g_guild;
var g_incognito = require("uw-global").g_incognito;
var g_server = require("uw-global").g_server;
var ds = require("uw-ds").ds;
var userDao = require("uw-user").userDao;
var mailBiz = require("uw-mail").mailBiz;
var mailDao = require("uw-mail").mailDao;
var userUtils = require("uw-user").userUtils;
var bossDao = require("../dao/bossDao");
var bossUtils = require("./bossUtils");
var BossEntity = require("uw-entity").BossEntity;
var chatBiz = require("uw-chat").chatBiz;
var heroDao = require("uw-hero").heroDao;
var heroPropHelper = require("uw-hero").heroPropHelper;
var guildPersonalDao = require("uw-guild").guildPersonalDao
var mainClient = require("uw-db").mainClient;
var accountDao = require("uw-account").accountDao;
var c_bossWorld = uwData.c_bossWorld;
var c_bossTeam = uwData.c_bossTeam;
var treasureDao = require("uw-treasure").treasureDao;
var treasureBiz = require("uw-treasure").treasureBiz;
var loginClient = require("uw-db").loginClient;
var formula = require("uw-formula");
var fightUtils = require("uw-fight").fightUtils;
var bossRecordDao = require("../dao/bossRecordDao");
var BossRecordEntity = require("uw-entity").BossRecordEntity;
var c_recharge = uwData.c_recharge;
var c_shop = uwData.c_shop;
var taskBiz = require("uw-task").taskBiz;
var guildBiz = require("uw-guild").guildBiz;
var g_cache = require("uw-global").g_cache;
var copyBiz = require('uw-copy').copyBiz;
var activityBiz = require("uw-activity").activityBiz;
var ossObj = require("uw-log").ossObj;
var ossBiz = require("uw-log").ossBiz;
var heroBiz = require("uw-hero").heroBiz;
var shopBiz = require("uw-shop").shopBiz;
var battlesGroupBiz = require("uw-battles-group").battlesGroupBiz;
var worldBossRecordBiz = require("uw-wboss").worldBossRecordBiz;

//检验boss列表
exports.checkBossList = function(client, cb) {
    _initGuildBossList(client, function(err, data) {
        if (err) return cb(err);
        _initWorldBossList(client, function(err, data) {
            if (err) return cb(err);
            _initTeamBossList(client, function() {
                bossDao.list(client, " 1=1 ", [], function(err, dataList) {
                    if (err) return cb(err);
                    async.map(dataList, function(bossData, cb1) {
                        var updateData = {};
                        if (bossData.status == consts.bossStatus.open || bossData.status == consts.bossStatus.prize) {
                            updateData.status = consts.bossStatus.closed;
                        }

                        if (bossData.type == c_prop.worldBossTypeKey.world) {
                            _checkOpenWorldBoss(client, bossData.bossId, bossData.deathTime, bossData.originBossId);
                            if (g_boss.getBossObj(bossData.bossId).isOpen()) {
                                updateData.status = consts.bossStatus.open;
                                updateData.startTime = new Date();
                            }
                        }

                        if (bossData.type == c_prop.worldBossTypeKey.team) {
                            _checkOpenTeamBoss(client, bossData.bossId);
                            if (g_boss.getBossObj(bossData.bossId).isOpen()) {
                                updateData.status = consts.bossStatus.open;
                                updateData.startTime = new Date();
                            }
                        }

                        if (!bossData.limitStartTime) {
                            updateData.limitStartTime = (new Date()).addDays(-10);
                        }
                        if (!bossData.limitEndTime) {
                            updateData.limitEndTime = (new Date()).addDays(-1);
                        }

                        if (!bossData.originBossId) {
                            updateData.originBossId = bossData.bossId;
                        }

                        if (Object.keys(updateData).length > 0) {
                            bossDao.update(client, updateData, " id = ? ", [bossData.id], cb1);
                        } else {
                            cb1();
                        }
                    }, cb);
                });
            });

        })
    });
};

//获取boss列表
exports.getGuildBossList = function(client, cb) {
    bossDao.list(client, " type = ? ", [c_prop.worldBossTypeKey.guild], function(err, dataList) {
        if (err) return cb(err);
        var otherData = {};
        //如果状态
        for (var i = 0; i < dataList.length; i++) {
            var locData = dataList[i];
            delete locData["resultData"];
            //没内存数据，但是，状态没正常
            var g_bossObj = g_boss.getBossObj(locData.bossId);
            var g_bossData = g_bossObj.getBossData();
            //locData["status"] = g_bossObj.getBossData().status;
            //[行会id,行会名称，是否上锁]
            if (g_bossObj.isOpen()) {
                otherData[g_bossData.bossId] = [g_bossData.callUserGuildId, g_bossData.callUserGuildName, g_bossData.isLock];
            } else {
                otherData[g_bossData.bossId] = [];
            }
        }
        return cb(null, [dataList, otherData]);
    });
};

//获取boss列表
exports.getWorldBossList = function(client, cb) {
    bossDao.list(client, " type = ? ", [c_prop.worldBossTypeKey.world], function(err, dataList) {
        if (err) return cb(err);
        var otherData = {};
        //如果状态
        for (var i = 0; i < dataList.length; i++) {
            var locData = dataList[i];
            var g_bossObj = g_boss.getBossObj(locData.bossId);
            //locData["status"] = g_bossObj.getBossData().status;
            delete locData["resultData"];
        }
        return cb(null, [dataList, otherData]);
    });
};

// 获得组队boss列表
exports.getTeamBossList = function(client, cb) {
    bossDao.list(client, " type = ? ", [c_prop.worldBossTypeKey.team], function(err, dataList) {
        if (err) return cb(err);
        var otherData = {};
        //如果状态
        for (var i = 0; i < dataList.length; i++) {
            var locData = dataList[i];
            var bossId = locData["bossId"];
            var g_bossObj = g_boss.getBossObj(locData.bossId);
            var userDic = g_bossObj.getAllUserData() || {};
            var userIds = Object.keys(userDic);
            //locData["status"] = g_bossObj.getBossData().status;
            locData["startTime"] = g_bossObj.getBossData().startTime;
            locData["endTime"] = g_bossObj.getBossData().endTime;
            locData["resultData"] = userIds.length; // 组队副本表示参与人数
            //delete locData["resultData"]; 
        }
        return cb(null, [dataList, otherData]);
    });
};


/**
 * 开启boss
 * @param client
 * @param userId
 * @param bossId
 * @param isLock
 * @param cb
 */
exports.openBoss = function(client, userId, bossId, isLock, cb) {
    if (g_boss.getBossObj(bossId).isOpen()) {
        return cb(getMsg(c_msgCode.bossHasCall)); //boss已经召唤！
    }
    var bossParameterData = c_bossParameter[bossId];
    if (!bossParameterData) return cb(getMsg(c_msgCode.noBossInfo)); // 不存在该Boss数据！
    var t_monsterData = t_monster[bossId];
    async.parallel([
        function(cb1) {
            bossDao.select(client, { bossId: bossId }, cb1);
        },
        function(cb1) {
            g_cache.getGamePlayer(client, userId, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[1];
        var bossData = data[0],
            userData = gamePlayer.userData;
        if (!bossData) return cb(getMsg(c_msgCode.noBossInfo)); // 不存在该Boss数据！

        if (bossData.isLimit) {
            var startTime = new Date(bossData.limitStartTime);
            var endTime = new Date(bossData.limitEndTime);
            var nowDate = new Date();
            if (nowDate.isBefore(startTime) || nowDate.isAfter(endTime)) {
                return cb(getMsg(c_msgCode.timeOutCantCall));
            }

            var day = nowDate.getDay();
            if (bossData.week > 0) {
                if (bossData.week == 7 && day != 0) {
                    return cb(getMsg(c_msgCode.bossSleep)); // Boss正在休息!
                } else if (bossData.week != day) {
                    return cb(getMsg(c_msgCode.bossSleep)); // Boss正在休息!
                }
            }
        }

        if (userData.lvl < bossParameterData.fightLvl || userData.lvl > bossParameterData.maxLvl) return cb(getMsg(c_msgCode.noLvlSummonBoss, bossParameterData.fightLvl, bossParameterData.maxLvl));

        //修改数据库
        if (bossData.status == consts.bossStatus.open) return cb(getMsg(c_msgCode.bossHasCall)); //boss已经召唤！
        if (bossData.prize == consts.bossStatus.prize) return cb(getMsg(c_msgCode.inSettlement)); //结算中！

        //判断公会等级
        var myGuildId = g_data.getGuildId(userId);
        var myGuild = g_guild.getGuild(myGuildId);
        var openLvl = bossParameterData.openLvl;
        if (!myGuild || myGuild.lvl < openLvl) return cb(getMsg(c_msgCode.allianceNonstandard)); //行会等级不足!

        if (_hasGuildFightingBoss(myGuildId)) return cb(getMsg(c_msgCode.oneAllianceOneBoss)); //同一个行会同时只能召唤1个boss!

        //Boss正在休息
        var nowDate = new Date();
        if (nowDate.isBefore(bossUtils.getOpenStartTime()) || nowDate.isAfter(bossUtils.getOpenEndTime())) {
            return cb(getMsg(c_msgCode.bossSleep)); // Boss正在休息!
        }

        //判断元宝
        //summonCost
        var costDiamond = 0;
        var delItems = {};

        var openCd = bossUtils.getOpenCd(bossData, bossId);

        var isRepeat = 0;
        if (openCd > 0) {
            if (!bossParameterData.repeat) return cb(getMsg(c_msgCode.killAndCding)); //已被击杀,cd中!

            //消耗元宝复活
            isRepeat = 1;
            /**
             * 清除BOSS CD花费
             * @param a 当前BOSS等级
             * @param b 剩余CD时间（秒）
             * @param c 今日秒CD次数
             */
            var repeatCount = bossUtils.getRepeatCount(bossData);
            var repeatCost = formula.calGuildBossRepeat(t_monsterData.level, openCd, repeatCount);
            repeatCost = parseInt(repeatCost);
            costDiamond += repeatCost;

        }

        var summonCost = bossParameterData.summonCost;

        //判断上锁
        if (isLock && !bossParameterData.isLimit) {
            //if(!c_vip[userData.vip].isLock) return cb("vip不足");
            costDiamond += c_game.newBossCfg[2];
        }

        var itemId = parseInt(summonCost[0]);
        var itemNum = parseInt(summonCost[1]);

        if (itemId == c_prop.spItemIdKey.diamond) {
            //不是复活才召唤
            //if(!isRepeat){
            costDiamond += itemNum;
            //}
        } else {
            var ownNum = userData.bag[itemId] || 0;
            if (ownNum < itemNum) return cb(getMsg(c_msgCode.noDiamond));
            delItems[itemId] = itemNum;
        }

        if (_hasFightingBoss()) { //&&!isRepeat){
            costDiamond += c_game.newBossCfg[1];
        }

        if (userData.diamond < costDiamond || costDiamond < 0) {
            return cb(getMsg(c_msgCode.noDiamond));
        }
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.openBoss);


        if (delItems[itemId]) {
            userUtils.delBag(userData, itemId, delItems[itemId], c_prop.itemCostTypeKey.callBoss);
        }

        if (isRepeat) {
            bossUtils.addRepeatCount(bossData);
        }

        bossData.startTime = new Date();
        bossData.status = consts.bossStatus.open;

        bossData.callArr.push([userId, userData.nickName, (new Date()).toFormat("YYYY-MM-DD HH24:MI:SS")]);
        if (bossData.callArr.length > 10) bossData.callArr.shift();

        var bossOpt = {};
        bossOpt.originHp = t_monsterData.maxHp;
        bossOpt.curHp = t_monsterData.maxHp;
        /*        bossOpt.originHp = 500000000;
                bossOpt.curHp = 500000000;*/
        bossOpt.bossId = bossId; //boss的id
        bossOpt.bossName = t_monsterData.name;
        bossOpt.startTime = new Date();
        //bossOpt.endTime = (new Date()).addHours(2);
        bossOpt.callUserId = userId; //召唤者id
        bossOpt.callUserName = userData.nickName; //召唤者名字
        bossOpt.callUserIcon = userData.iconId;
        bossOpt.callUserGuildName = myGuild.name; //召唤者公会名
        bossOpt.callUserGuildId = myGuildId; //召唤者公会id
        bossOpt.type = c_prop.worldBossTypeKey.guild;
        bossOpt.isLock = isLock;
        bossOpt.originBossId = bossId; //boss的id
        bossOpt.isRepeat = isRepeat;

        var updateUser = {
            diamond: userData.diamond,
            giveDiamond: userData.giveDiamond,
            buyDiamond: userData.buyDiamond
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        var updateBossData = {
            startTime: bossData.startTime,
            status: bossData.status,
            repeatTime: bossData.repeatTime,
            repeatCount: bossData.repeatCount,
            callArr: bossData.callArr
        };
        async.parallel([
            function(cb1) {
                bossDao.update(client, updateBossData, { bossId: bossId }, cb1);
            }
        ], function(err, data) {
            if (err) return cb(err);
            g_boss.getBossObj(bossId).openBoss(bossOpt, function() {
                _setTimeOver(client, bossId);
            });
            //第一个%s：公会名
            //第二个%s：玩家名
            //第三个%s：世界BOSS名字
            chatBiz.addSysData(34, [bossOpt.callUserGuildName, bossOpt.callUserName, t_monsterData.name]);
            cb(null, [bossData, updateUser, costDiamond, delItems]);
        });
    });
};

//进入boss系统
exports.enter = function(client, userId, bossId, cb) {
    if (!g_boss.getBossObj(bossId).isOpen()) {
        return cb(getMsg(c_msgCode.bossClose)); //boss未开启
    }
    _getGUserData(client, userId, bossId, function(err, b_userData) {
        if (err) return cb(err);
        //todo 判断cd
        //返回boss信息
        var g_bossData = g_boss.getBossObj(bossId).getBossData();

        var inspireEndTime = new Date();
        var inspireNum = 0;
        var myGuildId = g_data.getGuildId(userId);
        var myGuild = g_guild.getGuild(myGuildId);

        if (g_bossData.isLock) {
            if (myGuildId != g_bossData.callUserGuildId) return cb(getMsg(c_msgCode.bossOnlock)); //boss已经上锁，不是同一个行会无法挑战
        }

        // 本公会召唤出来的boss
        if (myGuild && g_bossData.callUserGuildId == myGuildId && g_bossData.type == c_prop.worldBossTypeKey.guild) {
            var b_guildData = g_boss.getBossObj(bossId).getGuildData(myGuildId);
            inspireEndTime = b_guildData.inspireEndTime;
            inspireNum = b_guildData.inspireNum;
        }

        if (g_bossData.type == c_prop.worldBossTypeKey.team || g_bossData.type == c_prop.worldBossTypeKey.world) {
            inspireEndTime = b_userData.inspireEndTime;
            inspireNum = b_userData.inspireNum;
        }
        //判断是否上锁

        var bossData = new ds.BossData();
        bossData.originHp = g_bossData.originHp; //原始生命值
        bossData.curHp = g_bossData.curHp; //当前hp
        bossData.bossId = g_bossData.bossId; //boss的id
        bossData.startTime = g_bossData.startTime; //开始时间
        bossData.endTime = g_bossData.endTime; //结束时间
        if (g_bossData.type == c_prop.worldBossTypeKey.team || g_bossData.type == c_prop.worldBossTypeKey.world)
            bossData.inspireHurt = t_otherBuff[11].addHurt; //伤害加成,固定值
        else
            bossData.inspireHurt = t_otherBuff[1].addHurt; //伤害加成,固定值

        bossData.inspireEndTime = inspireEndTime; //鼓舞结束时间
        bossData.inspireNum = inspireNum; //鼓舞次数
        bossData.myHurt = b_userData.hurt; //我的伤害
        bossData.myRank = b_userData.rank; //我的排名
        bossData.myGuildName = b_userData.guildName; //我的公会名
        bossData.callUserName = g_bossData.callUserName; //召唤者名字
        bossData.callUserGuildName = g_bossData.callUserGuildName; //召唤者公会id
        bossData.lastExitTime = g_boss.getUserObj(userId).lastExitTime;
        bossData.myKey = b_userData.myKey;
        bossData.type = g_bossData.type;
        bossData.isOver = g_bossData.isOver;
        bossData.isRepeat = g_bossData.isRepeat;
        bossData.callUserId = g_bossData.callUserId;
        bossData.callUserGuildId = g_bossData.callUserGuildId; //召唤者公会id
        bossData.callUserIcon = g_bossData.callUserIcon;
        bossData.mySpireNum = b_userData.inspireNum || 0; // 个人鼓舞次数

        // 个人boss
        if (g_bossData.isPersonal) {
            bossData.curHp = g_bossData.originHp - g_boss.getBossObj(bossId).getUserHurt(userId);
        }

        cb(null, bossData);
    });
};

//开始战斗
exports.startFight = function(client, userId, bossId, manyNum, cb) {
    var g_bossData = g_boss.getBossObj(bossId).getBossData();

    if (g_bossData.isOver) return cb(getMsg(c_msgCode.isOver)); //已经结束!

    if (g_bossData.bossId != bossId) return cb(getMsg(c_msgCode.bossSleep)); // Boss正在休息!
    _getGUserData(client, userId, bossId, function(err, b_userData) {
        if (err) return cb(err);
        var exitCd = c_game.worldBossCfg[1];
        exitCd = exitCd - 5; //加个误差
        //判断cd中
        if (g_bossData.type != c_prop.worldBossTypeKey.team && g_boss.getUserObj(userId).lastExitTime && g_boss.getUserObj(userId).lastExitTime.clone().addSeconds(exitCd).isAfter(new Date())) {
            return cb(getMsg(c_msgCode.cding)); //cd中.noFrequency.....
        }

        async.parallel([
            function(cb1) {
                // userDao.selectCols(client,"id ,lvl,nickName,iconId,vip,bag,exData,counts,countsRefreshTime"," id = ?",[userId] ,cb1);
                g_cache.getGamePlayer(client, userId, cb1);
            } //,
            // function(cb1){
            //     heroDao.list(client, {userId: userId},cb1);
            // }
        ], function(err, data) {
            if (err) return cb(err);
            var gamePlayer = data[0];
            var mUserData = gamePlayer.userData; //,heroList = data[1];
            var heroList = gamePlayer.heroListData;
            var t_monsterData = t_monster[g_bossData.bossId];

            if (g_bossData.type == c_prop.worldBossTypeKey.guild) {
                var bossParameterData = c_bossParameter[g_bossData.bossId];
                if (mUserData.lvl < bossParameterData.fightLvl || mUserData.lvl > bossParameterData.maxLvl) return cb(getMsg(c_msgCode.noLvlchallengeBoss, bossParameterData.fightLvl, bossParameterData.maxLvl));
            } else if (g_bossData.type == c_prop.worldBossTypeKey.team && b_userData.isFirstStart == 1 && !g_bossData.isPersonal) {

                var reNum = userUtils.getTeamBossNum(mUserData);
                var enterItemNum = mUserData.bag[c_prop.spItemIdKey.teamBossTessera] || 0;
                if (reNum[0] <= 0 && enterItemNum <= 0) {
                    return cb(getMsg(c_msgCode.noFrequency)); //没有次数了
                }

                // var enterTeamBossNum = userUtils.getTodayCount(mUserData, c_prop.userRefreshCountKey.enterTeamBossNum);
                // var buyTeamBossNum = userUtils.getTodayCount(mUserData, c_prop.userRefreshCountKey.buyTeamBossNum);
                // if (enterTeamBossNum >= 5 + buyTeamBossNum){
                //     return cb("没有次数了");
                // } 
            }

            //记住最大伤害
            for (var i = 0; i < heroList.length; i++) {
                var locHero = heroList[i];
                var locMaxHurt = heroPropHelper.getDamageMaxAHit(locHero, t_monsterData, mUserData.lvl);
                if (g_bossData.type == c_prop.worldBossTypeKey.team || g_bossData.type == c_prop.worldBossTypeKey.world) {
                    locMaxHurt = locMaxHurt * (1 + t_otherBuff[11].addHurt / 10000);
                    locMaxHurt = parseInt(locMaxHurt);
                    b_userData.heroMaxHurt[locHero.id] = locMaxHurt * 100; // 不限制伤害，因为鼓舞叠加伤害 
                } else {
                    locMaxHurt = locMaxHurt * (1 + t_otherBuff[1].addHurt / 10000);
                    locMaxHurt = parseInt(locMaxHurt);
                    b_userData.heroMaxHurt[locHero.id] = locMaxHurt * 100; //临时加两倍
                }
            }
            b_userData.heroMaxHurt[-1] = 100000;
            //todo 判断cd
            b_userData.isStartFight = 1;
            g_boss.getBossObj(bossId).setUserData(userId, b_userData);
            var myGuildId = g_data.getGuildId(userId);
            _enterGuild(userId, myGuildId, bossId);

            if (g_bossData.type == c_prop.worldBossTypeKey.guild && b_userData.isFirstStart == 1) {
                // userDao.selectCols(client, "id,lvl,nickName,iconId,vip,counts,countsRefreshTime", "id = ?", [userId], function (err, userData) {
                // if(err) return cb(err);

                if (g_bossData.callUserGuildId != myGuildId) {
                    var num = userUtils.getTodayCount(mUserData, c_prop.userRefreshCountKey.enterBoss);
                    var numLimit = c_game.worldBossCfg[9];
                    if (num >= numLimit) return cb(getMsg(c_msgCode.noBossTime));
                    userUtils.addTodayCount(mUserData, c_prop.userRefreshCountKey.enterBoss, 1);
                }

                var updateUser = {
                    counts: mUserData.counts,
                    countsRefreshTime: mUserData.countsRefreshTime
                };
                gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);

                //userDao.update(client,updateUser,{id:mUserData.id},function(err,data){
                //if(err) return cb(err);
                b_userData.isFirstStart = 0;

                var bossData = new ds.BossData();
                bossData.isFirstEnter = 0;
                var exBossData = new ds.ExBossData();
                exBossData.bossData = bossData;
                exBossData.userData = updateUser;
                cb(null, exBossData);
                //});
                // });
            } else if (g_bossData.type == c_prop.worldBossTypeKey.team && b_userData.isFirstStart == 1 && !g_bossData.isPersonal) {
                var reNum = userUtils.getTeamBossNum(mUserData);
                var enterItemId = c_prop.spItemIdKey.teamBossTessera; // 全民召唤劵
                var costType = 0;
                var delBagItems = {};

                //全民boss多倍进入
                manyNum = manyNum || 1;
                if (reNum[0] >= manyNum) {
                    userUtils.costTeamBossNum(mUserData, manyNum);
                    costType = 1;
                } else if (mUserData.bag[enterItemId] && (mUserData.bag[enterItemId] + reNum[0]) >= manyNum) {
                    userUtils.costTeamBossNum(mUserData, reNum[0]);
                    let needEnterItemNum = manyNum - reNum[0];
                    userUtils.delBag(mUserData, enterItemId, needEnterItemNum, c_prop.itemCostTypeKey.other);
                    costType = 2;
                    delBagItems[enterItemId] = needEnterItemNum;
                }
                //console.error("========manyNum=========",manyNum);
                //end 全民boss多倍进入

                // if (reNum[0] > 0) {
                //     userUtils.costTeamBossNum(mUserData);
                //     costType = 1;
                // } else {
                //     if (mUserData.bag[enterItemId] && mUserData.bag[enterItemId] > 0) {
                //         userUtils.delBag(mUserData, enterItemId, 1, c_prop.itemCostTypeKey.other);
                //         costType = 2;
                //         delBagItems[enterItemId] = 1;
                //     }
                // }
                gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(delBagItems));

                if (costType == 0) return cb(getMsg(c_msgCode.noFrequency)); //没有次数了

                //记录全民boss多倍进入次数
                b_userData.manyNum = manyNum;

                //userUtils.addTodayCount(mUserData, c_prop.userRefreshCountKey.enterTeamBossNum, 1);
                var updateUser = {
                    exData: mUserData.exData,
                    // bag : mUserData.bag
                    // counts:mUserData.counts,
                    // countsRefreshTime:mUserData.countsRefreshTime
                };
                activityBiz.recordCarnivalValue(client, userId, c_prop.carnivalTaskTypeKey.teamBoss, manyNum, function() {});
                activityBiz.recordLachelFitnessValue(client, userId, c_prop.lachelActTaskTypeKey.teamBossNum, manyNum, null, function() {});

                //userDao.update(client,updateUser,{id:mUserData.id},function(err,data){
                //if(err) return cb(err);
                b_userData.isFirstStart = 0;

                var bossData = new ds.BossData();
                bossData.isFirstEnter = 0;
                var exBossData = new ds.ExBossData();
                exBossData.bossData = bossData;
                exBossData.userData = updateUser;
                if (costType == 2) {
                    exBossData.delBagItems = delBagItems;
                }
                cb(null, exBossData);
                //});
            } else {
                var bossData = new ds.BossData();
                bossData.isFirstEnter = 0;

                var exBossData = new ds.ExBossData();
                exBossData.bossData = bossData;
                cb(null, exBossData);
            }

        });
    });

};

//离开战斗
exports.exitFight = function(client, userId, bossId, cb) {
    var g_userObj = g_boss.getUserObj(userId);
    g_userObj.lastExitTime = new Date();
    g_boss.setUserObj(userId, g_userObj);

    if (!g_boss.getBossObj(bossId).hasUserData(userId)) return cb(null);
    var userData = g_boss.getBossObj(bossId).getUserData(userId);
    if (!userData.isStartFight) return cb(null);
    userData.isStartFight = false;

    // 判断userlist是否全部退出
    if (g_boss.getBossObj(bossId).getBossData().type == c_prop.worldBossTypeKey.team && !g_boss.getBossObj(bossId).hasUserFight()) {
        g_boss.getBossObj(bossId).getBossData().isActive = false; // 不活跃
    }

    g_boss.getBossObj(bossId).setUserData(userId, userData);
    cb(null);
};

//离开所有战斗
exports.exitAllFight = function(client, userId, cb) {
    var bossCache = g_boss.getBossCache();
    for (var key in bossCache) {
        var locBossId = key;
        if (!g_boss.getBossObj(locBossId).hasUserData(userId)) continue;
        var userData = g_boss.getBossObj(locBossId).getUserData(userId);
        if (!userData.isStartFight) continue;
        userData.isStartFight = false;
        if (g_boss.getBossObj(locBossId).getBossData().type == c_prop.worldBossTypeKey.team && !g_boss.getBossObj(locBossId).hasUserFight()) {
            g_boss.getBossObj(locBossId).getBossData().isActive = false; // 不活跃
        }
        var g_userObj = g_boss.getUserObj(userId);
        g_userObj.lastExitTime = new Date();
        g_boss.setUserObj(userId, g_userObj);

        g_boss.getBossObj(locBossId).setUserData(userId, userData);
    }
    cb(null);
};

//清除cd
exports.clearFightCd = function(client, userId, cb) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var costDiamond = c_game.worldBossCfg[2];
        if (userData.diamond < costDiamond || costDiamond < 0) {
            return cb(getMsg(c_msgCode.noDiamond));
        }

        userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.clearBossCd);
        var g_userObj = g_boss.getUserObj(userId);
        g_userObj.lastExitTime = (new Date()).addDays(-10); //设置为很久之前
        g_boss.setUserObj(userId, g_userObj);

        var updateUser = {
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
        cb(null, [updateUser, costDiamond]);
    });
};


//造成伤害
exports.hurt = function(client, userId, bossId, hurtDic, isEnd, mData, hurtArr, cb) {
    var g_bossData = g_boss.getBossObj(bossId).getBossData();
    if (g_bossData.isPersonal) {
        _hurtPersonal(client, userId, bossId, hurtDic, isEnd, mData, hurtArr, cb);
    } else if (g_bossData.type == c_prop.worldBossTypeKey.team) {
        _hurtTeamBoss(client, userId, bossId, hurtDic, isEnd, mData, hurtArr, cb);
    } else {
        _hurt(client, userId, bossId, hurtDic, isEnd, mData, hurtArr, cb);
    }
};

var _hurtPersonal = function(client, userId, bossId, hurtDic, isEnd, mData, hurtArr, cb) {
    //userDao.select(client, {id:userId}, function(err, userDbData){
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        //var userDbData = gamePlayer.userData;
        var bossData = new ds.BossData();

        var g_bossData = g_boss.getBossObj(bossId).getBossData();
        if (!g_boss.getBossObj(bossId).isOpen() || !g_bossData) {
            bossData.isOver = 1;
            return cb(null, [bossData, null]);
        }
        var userData = g_boss.getBossObj(bossId).getUserData(userId);
        if (!userData.isStartFight) return cb(getMsg(c_msgCode.notInBattle)); //未进入战斗!

        //临时去掉
        /*
         var getMdata = bossUtils.mData(userData.myKey, hurtDic,isEnd);
         if(getMdata!=mData) return cb("数据错误!");
         */

        var curHp = g_bossData.originHp;
        if (curHp <= userData.hurtBossHp) {
            bossData.curHp = g_bossData.curHp;
            bossData.myHurt = userData.hurt; //我的伤害
            bossData.myRank = userData.rank; //我的伤害
            bossData.isOver = 1;
            return cb(null, [bossData, null]);
        }

        var hurtBossHp = 0;
        if (!userData.lastHurtTime) {
            userData.lastHurtTime = new Date();
        } else {
            var difActiveTime = userData.lastHurtTime.clone().getMillisecondsBetween(new Date());
            if (difActiveTime > 2000) { // 超过2秒认为离线，boss不扣血
                userData.lastHurtTime = new Date();
            } else {
                hurtBossHp = Math.floor(difActiveTime / 1000.0 * g_bossData.originHp / c_bossTeam[bossId].aliveInterval);
                userData.lastHurtTime = new Date();
            }
        }
        userData.hurtBossHp += hurtBossHp;

        var hurtData = _calHurt(hurtDic, hurtArr, userData.heroMaxHurt);
        var hurt = hurtData[0];
        var curHurt = hurtData[1];
        /*
         if (g_bossData.endTime.isBefore(new Date())) {
         return cb("boss活动已经结束!");
         }
         */

        //不是最后一下
        // if(!isEnd){
        //     //5秒限制,防加速
        //     if(!userData.lastHurtTime){
        //         userData.lastHurtTime = new Date();
        //     }else{
        //         var difMilliseconds = userData.lastHurtTime.clone().getMillisecondsBetween(new Date());
        //         if(difMilliseconds<2.5*1000){
        //             hurt = 0;
        //             curHurt = 0;
        //         }
        //     }
        // }

        //userData.lastHurtTime = new Date();   
        userData.hurt += hurt;
        curHp = g_bossData.originHp - userData.hurtBossHp;

        if (curHp <= 0) {
            curHp = 0;
            bossData.isOver = 1;
            _overPersonalBoss(client, bossId, userId, function() {});
        }

        bossData.curHp = curHp; //
        bossData.myHurt = userData.hurt; //我的伤害
        bossData.myRank = 1; //我的伤害
        userData.myKey = 0 | Math.random() * 1000; //字符串
        bossData.myKey = userData.myKey; //字符串
        return cb(null, [bossData, null]);

    });
};

var _overPersonalBoss = function(client, bossId, userId, cb) {
    var g_bossData = g_boss.getBossObj(bossId).getBossData();
    _sendPersonalTeamAward(client, g_bossData, userId, cb);
};

var _hurt = function(client, userId, bossId, hurtDic, isEnd, mData, hurtArr, cb) {
    //userDao.select(client, {id:userId}, function(err, userDbData){
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userDbData = gamePlayer.userData;
        var bossData = new ds.BossData();

        var g_bossData = g_boss.getBossObj(bossId).getBossData();
        if (!g_boss.getBossObj(bossId).isOpen() || !g_bossData) {
            bossData.isOver = 1;
            return cb(null, [bossData, null]);
        }
        var userData = g_boss.getBossObj(bossId).getUserData(userId);
        if (!userData.isStartFight) return cb(getMsg(c_msgCode.notInBattle)); //未进入战斗!

        //临时去掉
        /*
         var getMdata = bossUtils.mData(userData.myKey, hurtDic,isEnd);
         if(getMdata!=mData) return cb("数据错误!");
         */

        // todo: 这里可以校验伤害最大值
        var hurtData = _calHurt(hurtDic, hurtArr, userData.heroMaxHurt);
        var hurt = hurtData[0];
        var curHurt = hurtData[1];
        /*
         if (g_bossData.endTime.isBefore(new Date())) {
         return cb("boss活动已经结束!");
         }
         */

        //不是最后一下
        if (!isEnd) {
            //5秒限制,防加速
            if (!userData.lastHurtTime) {
                userData.lastHurtTime = new Date();
            } else {
                var difMilliseconds = userData.lastHurtTime.clone().getMillisecondsBetween(new Date());
                if (difMilliseconds < 2.5 * 1000) {
                    hurt = 0;
                    curHurt = 0;
                }
            }
        }

        userData.lastHurtTime = new Date();

        var items = {};
        var treasureEntity = new TreasureEntity();
        var lootTreasureNum = 0;
        if (g_bossData.isOver) {
            bossData.curHp = g_bossData.curHp;
            bossData.myHurt = userData.hurt; //我的伤害
            bossData.myRank = userData.rank; //我的伤害
            bossData.isOver = 1;
            return cb(null, [bossData, null]);
        } else {

            g_bossData.curHp -= curHurt;
            userData.hurt += hurt;
            if (g_bossData.curHp <= 0) {
                g_bossData.curHp = 0;
                g_bossData.killUserId = userId; //击杀人的id
                g_bossData.killUserName = userData.userName; //击杀人的名字
                g_bossData.deathTime = new Date(); //死亡时间
                bossData.isOver = 1;
                chatBiz.addSysData(40, [g_bossData.bossName, userData.userName]); //40 哇哈哈，干得漂亮，大家推倒了BOSS%s！%s补了最后一刀！

                var bossCfgData = c_bossWorld[bossId];
                treasureEntity.userId = userId;

                if (g_bossData.type == c_prop.worldBossTypeKey.world && bossCfgData) {
                    var treasureItem = bossCfgData.treasureAward;
                    if (treasureItem && treasureItem.length == 2) {
                        items[treasureItem[0]] = treasureItem[1];
                        lootTreasureNum = treasureItem[1];
                        treasureEntity.treasureId = treasureItem[0];
                        treasureEntity.openTime = new Date();
                        var treasureItemName = t_item[treasureItem[0]].name;
                        var color = t_item[treasureItem[0]].color;
                        chatBiz.addSysData(74, [color, treasureItemName, userDbData.nickName]);

                    }
                }
                _overBoss(client, bossId, 1, function() {});
            }
            _sendMsg(35, g_bossData); //35 BOSS%s只剩%s生命值了，大家用力！！
            _sendMsg(38, g_bossData); //38 BOSS%s已受伤，剩余%s生命值！

            var bagItem = {};
            if (g_bossData.type == c_prop.worldBossTypeKey.world) {
                var addNum = _sendTreasureMsg(74, g_bossData, userDbData, bossId, items, treasureEntity);
                lootTreasureNum += addNum;
            }

            bossData.curHp = g_bossData.curHp; //
            bossData.myHurt = userData.hurt; //我的伤害
            bossData.myRank = userData.rank; //我的伤害
            userData.myKey = 0 | Math.random() * 1000; //字符串
            bossData.myKey = userData.myKey; //字符串

            var itemsArr = userUtils.saveItems(userDbData, items, c_prop.itemGetTypeKey.worldBoss);
            if (Object.keys(itemsArr[0]).length > 0) bagItem = propUtils.mergerProp(bagItem, itemsArr[0]);
            if (g_bossData.curHp <= 0 || treasureEntity.userId) {
                // var updateUser = { 
                //     bag : userDbData.bag,
                //     exData:userDbData.exData
                // };
                if (Object.keys(bagItem).length > 0) {
                    gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
                } else {
                    gamePlayer.setUserDataDirty(g_cache.UDDirtyType.exdata);
                }
                async.parallel([
                    // function(cb1){
                    //     userDao.update(client, updateUser, {id:userId},cb1);
                    // },
                    function(cb1) {
                        if (g_bossData.type == c_prop.worldBossTypeKey.world) {
                            var insertList = [];
                            for (var i = 0; i < lootTreasureNum; i++) {
                                insertList.push(treasureEntity);
                            }
                            treasureDao.insertList(client, insertList, function(err, data) {
                                if (err) return cb1(err);
                                var insertId = data.insertId;
                                var affectedRows = data.affectedRows;
                                for (var i = 0; i < affectedRows; i++) {
                                    var newO = _cloneOBj(treasureEntity);
                                    newO.id = i + insertId;
                                    newO.openTime = new Date();
                                    newO.item = null;
                                    g_incognito.setTreasureInfoById(newO.id, newO);
                                    g_incognito.setTreasureOpenTimeOut(newO);
                                }
                                cb1(null);
                            });
                        } else {
                            cb1(null);
                        }
                    }
                ], function(err, data) {
                    if (err) return cb(err);
                    if (g_bossData.type == c_prop.worldBossTypeKey.world) {
                        treasureBiz.insertTreasureRecord(client, c_prop.treasureRecordTypeKey.getTreasure, userDbData, treasureEntity.treasureId, {}, function(err, data2) {
                            if (err) {
                                console.log(err)
                            }
                        });
                    }
                    return cb(null, [bossData, bagItem])
                });
            } else {
                return cb(null, [bossData, null]);
            }
        }
    });
};

var _hurtTeamBoss = function(client, userId, bossId, hurtDic, isEnd, mData, hurtArr, cb) {
    //userDao.select(client, {id:userId}, function(err, userDbData){
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userDbData = gamePlayer.userData;
        var bossData = new ds.BossData();

        var g_bossData = g_boss.getBossObj(bossId).getBossData();
        if (!g_boss.getBossObj(bossId).isOpen() || !g_bossData) {
            bossData.isOver = 1;
            return cb(null, [bossData, null]);
        }
        var userData = g_boss.getBossObj(bossId).getUserData(userId);
        if (!userData.isStartFight) return cb(getMsg(c_msgCode.notInBattle)); //未进入战斗!

        var hurtData = _calHurt(hurtDic, hurtArr, userData.heroMaxHurt);
        var hurt = hurtData[0];
        var curHurt = hurtData[1];
        /*
         if (g_bossData.endTime.isBefore(new Date())) {
         return cb("boss活动已经结束!");
         }
         */
        //console.log("_hertTeamBoss:", new Date());
        //不是最后一下
        if (!isEnd) {
            //5秒限制,防加速
            if (!userData.lastHurtTime) {
                userData.lastHurtTime = new Date();
            } else {
                var difMilliseconds = userData.lastHurtTime.clone().getMillisecondsBetween(new Date());
                // if(difMilliseconds<2.5*1000){   // 2.5
                //     hurt = 0;
                //     curHurt = 0;
                // }
            }
        }

        userData.lastHurtTime = new Date();
        var hurtBossHp = 0;
        if (!g_bossData.isActive) {
            g_bossData.isActive = true;
            g_bossData.lastActvieTime = new Date();
        } else {
            var difActiveTime = g_bossData.lastActvieTime.clone().getMillisecondsBetween(new Date());
            if (difActiveTime > 2000) { // 超过2秒认为离线，boss不扣血
                g_bossData.isActive = true;
                g_bossData.lastActvieTime = new Date();
            } else {
                hurtBossHp = Math.floor(difActiveTime / 1000.0 * g_bossData.originHp / c_bossTeam[bossId].aliveInterval);
                g_bossData.lastActvieTime = new Date();
                //console.log("hurtBossHp:", bossId,g_bossData.originHp,c_bossTeam[bossId].aliveInterval, hurtBossHp,difActiveTime);
            }
        }

        var items = {};
        var lootTreasureNum = 0;
        if (g_bossData.isOver) {
            bossData.curHp = g_bossData.curHp;
            bossData.myHurt = userData.hurt; //我的伤害
            bossData.myRank = userData.rank; //我的伤害
            bossData.isOver = 1;
            return cb(null, [bossData, null]);
        } else {

            g_bossData.curHp -= hurtBossHp;
            userData.hurt += hurt;
            if (g_bossData.curHp <= 0) {
                g_bossData.curHp = 0;
                g_bossData.killUserId = userId; //击杀人的id
                g_bossData.killUserName = userData.userName; //击杀人的名字
                g_bossData.deathTime = new Date(); //死亡时间
                bossData.isOver = 1;

                //113 [ubb color=red]%s[/ubb]达到30级，在全民副本中成功KO %s，获得成吨经验，连升十级！！
                var userFirstData = userDbData.exData[c_prop.userExDataKey.firstData] || {};
                if (!userFirstData[c_prop.firstDataKey.teamBoss]) {
                    chatBiz.addSysData(113, [userDbData.nickName, g_bossData.bossName]);
                    userFirstData[c_prop.firstDataKey.teamBoss] = 1;
                    userDbData.exData[c_prop.userExDataKey.firstData] = userFirstData;
                }

                var bossCfgData = c_bossWorld[bossId];

                //if (g_bossData.type ==c_prop.worldBossTypeKey.team){
                var fstHurt = exports.getFirstHurtRank(bossId);
                _insertBossRecord(client, 2, fstHurt, bossId, function() {});
                //}
                _overBoss(client, bossId, 1, function() {});
            }
            var bagItem = {};
            bossData.curHp = g_bossData.curHp; //
            bossData.myHurt = userData.hurt; //我的伤害
            bossData.myRank = userData.rank; //我的伤害
            userData.myKey = 0 | Math.random() * 1000; //字符串
            bossData.myKey = userData.myKey; //字符串
            //console.log("teamBossCurHp:", bossId, bossData.curHp);

            var itemsArr = userUtils.saveItems(userDbData, items, c_prop.itemGetTypeKey.worldBoss);
            if (Object.keys(itemsArr[0]).length > 0) bagItem = propUtils.mergerProp(bagItem, itemsArr[0]);
            if (g_bossData.curHp <= 0) {
                // var updateUser = {
                //     bag : userDbData.bag,
                //     exData:userDbData.exData
                // };
                if (Object.keys(bagItem).length > 0) {
                    gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
                } else {
                    gamePlayer.setUserDataDirty(g_cache.UDDirtyType.exdata);
                }

                //userDao.update(client, updateUser, {id:userId},function(err, data){
                // if(err) return cb(err);
                return cb(null, [bossData, bagItem]);
                //});
            } else {
                return cb(null, [bossData, null]);
            }
        }
    });
};

var _sendMsg = function(msgId, g_bossData) {
    var c_chatSysData = c_chatSys[msgId];
    for (var i = 0; i < c_chatSysData.arg.length; i++) {
        var locArg = c_chatSysData.arg[i];
        if (g_bossData.curHp < g_bossData.originHp * locArg / 100 && g_bossData.sendNoHpMsgArr.indexOf(locArg) < 0) {
            g_bossData.sendNoHpMsgArr.push(locArg);
            chatBiz.addSysData(msgId, [g_bossData.bossName, locArg]);
            break;
        }
    }
};

var _sendTreasureMsg = function(msgId, g_bossData, userData, bossId, items, treasureEntity) {
    var c_chatSysData = c_chatSys[msgId];
    var addNum = 0
    for (var i = 0; i < c_chatSysData.arg.length; i++) {
        var locArg = c_chatSysData.arg[i];
        if (g_bossData.curHp < g_bossData.originHp * locArg / 100 & g_bossData.sendTreasureMsgArr.indexOf(locArg) < 0) {
            g_bossData.sendTreasureMsgArr.push(locArg);
            var bossCfgData = c_bossWorld[bossId];
            if (!bossCfgData) return;
            var item = bossCfgData.treasurePercentAward;
            var num = items[item[0]] || 0;
            items[item[0]] = num + item[1];
            addNum += item[1];
            var treasureItemName = t_item[item[0]].name;
            var color = t_item[item[0]].color;
            treasureEntity.userId = userData.id;
            treasureEntity.treasureId = item[0];
            treasureEntity.openTime = new Date();
            chatBiz.addSysData(msgId, [color, treasureItemName, userData.nickName]);
        }
    }
    return addNum;
}


var _calHurt = function(hurtDic, hurtArr, heroMaxHurt) {
    var hurt = 0;
    var curHurt = 0;
    hurtDic = hurtDic || {};
    hurtArr = hurtArr || [0, 0];
    var curHurtCount = hurtArr[0];
    var curHurtNum = hurtArr[1];
    var tempHurtCount = 0;
    var tempHurtNum = 0;
    //console.log("hurtDic:",hurtDic);
    //console.log("hurtArr:",hurtArr);
    for (var key in hurtDic) {
        var locHeroData = hurtDic[key] || [0, 0];
        var locHurt = locHeroData[0] || 0;
        var locNum = locHeroData[1] || 0;
        var locCurHurt = locHeroData[2] || 0;

        locHurt = parseInt(locHurt) || 0;
        locNum = parseInt(locNum) || 0;

        tempHurtCount += locHurt;
        tempHurtNum += locNum;

        if (locHurt <= 0 || locNum <= 0) continue;

        var locSingleHurt = locHurt / locNum;

        var locMaxHurt = heroMaxHurt[key] || 0;
        if (locSingleHurt > locMaxHurt) {
            locHurt = locMaxHurt * locNum;
            locCurHurt = locMaxHurt * locNum;
        }
        hurt += locHurt;
        curHurt += locCurHurt;
    }

    if (curHurtCount != tempHurtCount || curHurtNum != tempHurtNum) {
        hurt = 0;
        curHurt = 0;
    }

    hurt = hurt < 0 ? 0 : hurt;
    curHurt = curHurt < 0 ? 0 : curHurt;
    return [hurt, curHurt];
};


exports.getBossResult = function(client, userId, bossId, originBossId, cb) {
    var bossObj = g_boss.getBossObj(bossId);
    if (bossObj.isPersonal()) {

        var g_bossData = bossObj.getBossData();
        var userData = bossObj.getUserData(userId);
        var curHp = g_bossData.originHp;
        if (curHp <= userData.hurtBossHp) {
            var bossResult = new ds.BossResult();
            bossResult.isWin = 1; //是否胜利
            bossResult.totalHurt = userData.hurt; //累计伤害
            bossResult.myHurtRank = 1; //我的伤害排名 
            bossResult.killTotalTime = 30; //击杀耗时
            // bossResult.firstHurtName = "xxxx";//伤害第一的名字
            // bossResult.killUserName = "xxxx";//最后一击的名字
            bossResult.bossId = bossId;
            bossResult.items = userData.locItems;
            console.log("getBossResult:", bossResult);
            return cb(null, bossResult);
        }
        return cb(getMsg(c_msgCode.bossNotDie)); //boss未死亡!
    }

    if (bossObj.isOpen()) {
        var userData = bossObj.getUserData(userId);
        var g_bossData = bossObj.getBossData();
        var bossResult = new ds.BossResult();
        if (g_bossData.curHp > 0) {
            bossResult.isWin = 0; //是否胜利
        } else {
            bossResult.isWin = 1; //是否胜利
        }

        bossResult.totalHurt = userData.hurt; //累计伤害
        bossResult.myHurtRank = userData.rank; //我的伤害排名
        if (g_bossData.type == c_prop.worldBossTypeKey.guild) {
            bossResult.hurtGold = bossUtils.getHurtGold(g_bossData.bossId, userData.hurt); //伤害奖励
            var locItems = {};
            //第一名奖励 二到五名奖励  六到10名奖励
            //rankAward1    rankAward2  rankAward3
            if (userData.rank == 1) {
                locItems = bossUtils.getAwardItems(g_bossData.bossId, c_prop.bossAwardTypeKey.rankAward1);
            }
            if (userData.rank >= 2 && userData.rank <= 5) {
                locItems = bossUtils.getAwardItems(g_bossData.bossId, c_prop.bossAwardTypeKey.rankAward2);
            }
            if (userData.rank >= 6 && userData.rank <= 10) {
                locItems = bossUtils.getAwardItems(g_bossData.bossId, c_prop.bossAwardTypeKey.rankAward3);
            }
            bossResult.items = locItems[1];
        } else if (g_bossData.type == c_prop.worldBossTypeKey.world) {
            bossResult.hurtGold = 0;
            var locItems = bossUtils.getWorldAwardItems(bossId, c_prop.bossAwardTypeKey.hurtAward, bossResult.isWin, userData.rank);
            bossResult.items = locItems[1];
        } else if (g_bossData.type == c_prop.worldBossTypeKey.team) {
            bossResult.items = userData.locItems;
        }

        bossResult.killTotalTime = g_bossData.startTime.getSecondsBetween(new Date()); //击杀耗时
        var firstUserData = _getFirstRankUser(bossId);
        if (firstUserData) {
            bossResult.firstHurtName = firstUserData.userName; //伤害第一的名字
        }
        bossResult.killUserName = g_bossData.killUserName; //最后一击的名字
        bossResult.bossId = g_bossData.bossId;
        cb(null, bossResult);
    } else {
        bossDao.select(client, { originBossId: originBossId }, function(err, bossData) {
            if (err) return (err);
            var bossSaveResult = bossData.resultData;
            var hurtDic = bossSaveResult.hurtDic;
            var myHurtData = hurtDic[userId] || [0, 0];
            var myHurt = myHurtData[0];
            var myRank = myHurtData[1];
            var bossResult = new ds.BossResult();
            bossResult.isWin = bossSaveResult.isWin; //是否胜利
            bossResult.totalHurt = myHurt; //累计伤害
            bossResult.myHurtRank = myRank; //我的伤害排名

            if (bossData.type == c_prop.worldBossTypeKey.guild) {
                bossResult.hurtGold = bossUtils.getHurtGold(bossData.bossId, myHurt); //伤害奖励
                var locItems = {};
                //第一名奖励 二到五名奖励  六到10名奖励
                //rankAward1    rankAward2  rankAward3
                if (myRank == 1) {
                    locItems = bossUtils.getAwardItems(bossData.bossId, c_prop.bossAwardTypeKey.rankAward1);
                }
                if (myRank >= 2 && myRank <= 5) {
                    locItems = bossUtils.getAwardItems(bossData.bossId, c_prop.bossAwardTypeKey.rankAward2);
                }
                if (myRank >= 6 && myRank <= 10) {
                    locItems = bossUtils.getAwardItems(bossData.bossId, c_prop.bossAwardTypeKey.rankAward3);
                }
                bossResult.items = locItems[1];
            } else if (bossData.type == c_prop.worldBossTypeKey.world) {
                bossResult.hurtGold = 0;
                var locItems = bossUtils.getWorldAwardItems(bossId, c_prop.bossAwardTypeKey.hurtAward, bossResult.isWin, myRank);
                bossResult.items = locItems[1];
            } else if (bossData.type == c_prop.worldBossTypeKey.team) {
                //bossResult.items = userData.locItems;
            }

            bossResult.killTotalTime = bossSaveResult.killTotalTime; //击杀耗时
            bossResult.firstHurtName = bossSaveResult.firstHurtName; //伤害第一的名字
            bossResult.killUserName = bossSaveResult.killUserName; //最后一击的名字
            bossResult.bossId = bossData.bossId;
            cb(null, bossResult);
        });

        /*        var bossResult = new ds.BossResult();
                cb(null, bossResult);*/
    }
};


exports.getResultData = function(client, userId, originBossId, cb) {
    bossDao.select(client, { originBossId: originBossId }, function(err, bossData) {
        if (err) return (err);
        var resultData = bossData.resultData;
        var userIds = [];
        //获取用户名
        var rank10 = resultData.rank10 || [];
        for (var i = 0; i < rank10.length; i++) {
            if (i < 5) {
                userIds.push(rank10[i]);
            }
        }
        var callUserId = resultData.callUserId;
        if (callUserId) userIds.push(callUserId);

        _getUserNamesData(client, userIds, function(err, userNamesData) {
            if (err) return (err);
            var reData = [];
            reData[0] = userNamesData[rank10[0]];
            reData[1] = userNamesData[rank10[1]];
            reData[2] = userNamesData[rank10[2]];
            reData[3] = userNamesData[rank10[3]];
            reData[4] = userNamesData[rank10[4]];

            var bossResultData = new ds.BossResultData();
            bossResultData.rank5 = [];
            for (var i = 0; i < rank10.length; i++) {
                if (i < 7) {
                    bossResultData.rank5.push(userNamesData[rank10[i]] || "无");
                }
            }
            bossResultData.callUserName = userNamesData[callUserId] || "无"; //召唤者
            bossResultData.callGuildName = resultData.callGuildName || "无"; //召唤公会
            bossResultData.firstHurtName = resultData.firstHurtName || "无"; //伤害第一的名字
            bossResultData.killUserName = resultData.killUserName || "无"; //最后一击的名字
            var hurtDic = resultData.hurtDic || {};
            var myHurt = hurtDic[userId] || [];
            bossResultData.myHurt = myHurt[0] || 0; //我的伤害
            bossResultData.isWin = resultData.isWin;
            cb(null, bossResultData);
        });
    });
};

var _getUserNamesData = function(client, userIds, cb) {
    var userNamesData = {};
    if (userIds.length <= 0) return cb(null, userNamesData);
    userDao.listCols(client, "id,nickName", "id in (?)", [userIds], function(err, userList) {
        if (err) return (err);
        for (var i = 0; i < userList.length; i++) {
            var locUserData = userList[i];
            userNamesData[locUserData.id] = locUserData.nickName;
        }
        cb(null, userNamesData);
    });
};

//鼓舞
exports.inspire = function(client, userId, bossId, cb) {
    var bossData = g_boss.getBossObj(bossId).getBossData();
    if (bossData.type == c_prop.worldBossTypeKey.team || bossData.type == c_prop.worldBossTypeKey.world) {
        _inspireTeamBoss(client, userId, bossId, cb);
    } else {
        _inspireGuildBoss(client, userId, bossId, cb);
    }
};

//获取鼓舞列表
exports.getInspireRecordArr = function(client, userId, bossId, cb) {
    var myGuildId = g_data.getGuildId(userId);
    var myGuild = g_guild.getGuild(myGuildId);
    if (!myGuild) return cb(null, []);
    var b_guildData = g_boss.getBossObj(bossId).getGuildData(myGuildId);
    cb(null, b_guildData.inspireRecordArr);
};

//获取鼓舞次数
exports.getInspireNum = function(userId, bossId) {
    if (!g_boss.getBossObj(bossId).isOpen()) return 0;

    var myGuildId = g_data.getGuildId(userId);
    var myGuild = g_guild.getGuild(myGuildId);
    if (!myGuild) return 0;
    var b_guildData = g_boss.getBossObj(bossId).getGuildData(myGuildId);
    return b_guildData.inspireNum;
};

//获取鼓舞
exports.syncInspire = function(client, userId, bossId, cb) {
    var myGuildId = g_data.getGuildId(userId);
    var myGuild = g_guild.getGuild(myGuildId);
    if (!myGuild) return cb(null, {});

    var b_guildData = g_boss.getBossObj(bossId).getGuildData(myGuildId);
    var reBossData = {
        inspireEndTime: b_guildData.inspireEndTime,
        inspireNum: b_guildData.inspireNum
    };
    cb(null, reBossData);
};

//获取第一名
exports.getFirstHurtRank = function(bossId) {
    var locUserData = _getFirstRankUser(bossId);
    if (!locUserData) {
        var locR = new ds.BossHurtRank();
        locR.userId = 0;
        locR.rank = 0; //排行
        locR.icon = 0; //头像id
        locR.userName = "无"; //用户名
        locR.guildName = "无"; //公会名
        locR.hurt = 0; //伤害
        locR.vip = 0; //头像id
        return locR;
    } else {
        var locR = new ds.BossHurtRank();
        locR.userId = locUserData.userId;
        locR.rank = locUserData.rank; //排行
        locR.icon = locUserData.icon; //头像id
        locR.userName = locUserData.userName; //用户名
        locR.guildName = locUserData.guildName; //公会名
        locR.hurt = locUserData.hurt; //伤害
        locR.vip = locUserData.vip; //头像id
        return locR;
    }
};

//获取前20伤害排名
exports.getHurtRankList = function(bossId, userId) {

    var bossObj = g_boss.getBossObj(bossId);
    if (bossObj.isPersonal()) { // 个人boss
        var locUserData = bossObj.getUserData(userId);
        if (locUserData) {
            var reList = [];
            var locR = new ds.BossHurtRank();
            locR.userId = locUserData.userId;
            locR.rank = 1; //排行
            locR.icon = locUserData.icon; //头像id
            locR.userName = locUserData.userName; //用户名
            locR.guildName = locUserData.guildName; //公会名
            locR.hurt = locUserData.hurt; //伤害
            locR.vip = locUserData.vip; //伤害
            reList.push(locR);
            return reList;
        } else {
            return [];
        }

    } else {
        var list = g_boss.getBossObj(bossId).getRankUserList();
        if (list.length <= 0) return [];
        var reList = [];
        for (var i = 0; i < 20; i++) {
            var locUserData = list[i];
            if (!locUserData) continue;
            var locR = new ds.BossHurtRank();
            locR.userId = locUserData.userId;
            locR.rank = locUserData.rank; //排行
            locR.icon = locUserData.icon; //头像id
            locR.userName = locUserData.userName; //用户名
            locR.guildName = locUserData.guildName; //公会名
            locR.hurt = locUserData.hurt; //伤害
            locR.vip = locUserData.vip; //伤害
            reList.push(locR);
        }
        return reList;
    }
};

// 设置boss死亡后玩家的boss任务
var _addBossTask = function(client, bossData, resultData, isWin, cb) {

    if (!isWin || bossData.bossId == 300000) {
        return cb(null);
    }
    var cTaskType = 0;
    if (bossData.type == c_prop.worldBossTypeKey.world) {
        cTaskType = c_prop.cTaskTypeKey.worldBoss;
    } else if (bossData.type == c_prop.worldBossTypeKey.team) {
        cTaskType = c_prop.cTaskTypeKey.teamBoss;
    } else {
        return cb(null);
    }
    var mapUser = Object.keys(resultData.hurtDic);
    async.map(mapUser, function(locUserId, cb1) {
        if (locUserId > 0) {
            var taskOpt = {};
            taskOpt[cTaskType] = bossData.bossId;
            if (cTaskType == c_prop.cTaskTypeKey.teamBoss) {
                var userData = g_boss.getBossObj(bossData.bossId).getUserData(locUserId);
                //全民boss多倍进入
                var manyNum = userData.manyNum || 1;
                taskOpt[c_prop.cTaskTypeKey.teamBossNum] = manyNum;
            }
            taskBiz.setTaskValues(client, locUserId, taskOpt, cb1);
        } else {
            cb1(null);
        }
    }, cb);
};

/**
 * 发送boss奖励
 * @param client
 * @param resultData
 * @param isWin
 * @param cb
 */
exports.sendAward = function(client, bossData, resultData, isWin, cb) {
    bossData.status = consts.bossStatus.prize;
    if (bossData.type == c_prop.worldBossTypeKey.guild) {
        _sendGuildAwardEx(client, bossData, resultData, isWin, cb);
    } else if (bossData.type == c_prop.worldBossTypeKey.world) {
        _sendWorldAward(client, bossData, resultData, isWin, cb);
    } else if (bossData.type == c_prop.worldBossTypeKey.team) {
        _sendTeamAward(client, bossData, resultData, isWin, cb);
    } else {
        cb();
    }
};

exports.openWorldBoss = function(client, originBossId, cb) {
    bossDao.select(client, { originBossId: originBossId }, function(err, bossData) {
        if (err) return cb(err);
        var updateBossData = {
            startTime: new Date(),
            status: consts.bossStatus.open
        };
        _openWorldBoss(client, bossData.bossId, bossData.originBossId);
        bossDao.update(client, updateBossData, { id: bossData.id }, cb);
    });
};

exports.preWorldMsg = function(bossId, minutes) {
    var t_monsterData = t_monster[bossId];
    chatBiz.addSysData(73, [t_monsterData.name, minutes]);
};

// cron 检查组队boss 重新open
exports.teamBossCheck = function(client, bossId, cb) {
    _checkOpenTeamBoss(client, bossId);
    //bossDao.listCols(client, "bossId,type,originBossId", " type = ? ", [c_prop.worldBossTypeKey.team], function (err, bossList) {
    //if (err) return cb(err);
    //var ownBossIds = []; 
    // for (var j = 0; j < bossList.length; j++) {
    //     var locBoss = bossList[j];  
    //     _checkOpenTeamBoss(client, locBoss.bossId);   
    // }

    // }); 
};

exports.getBossRecord = function(client, type, bossId, cb) {
    var condition = " ORDER BY id DESC limit 5";
    bossRecordDao.list(client, "recordType = ? and  bossId = ?" + condition, [type, bossId], function(err, hisList) {
        if (err) return cb(err);
        cb(null, hisList);
    });
};

exports.canEnter = function(client, userId, bossId, cb) {
    var g_bossData = g_boss.getBossObj(bossId).getBossData();
    if (g_bossData.isOver) return cb(getMsg(c_msgCode.isOver)); //已经结束!
    if (g_bossData.type != c_prop.worldBossTypeKey.team) return cb(getMsg(c_msgCode.notTeamBoss)); //非组队boss!
    if (g_boss.getBossObj(bossId).hasUserData(userId)) {
        cb(null, 1);
    } else {
        cb(null, 0);
    }
}

// 是否可买世界boss的商品
exports.isCanBuyWbShopItem = function(userId, rechargeId) {
    //console.log("isCanBuyWbShopItem:", userId, rechargeId);
    var activeWorldBoss = g_boss.getActiveWorldBossObj();
    if (!activeWorldBoss) {
        //console.log("isCanBuyWbShopItem activeWorldBoss is null");
        return false;
    }
    return activeWorldBoss.canBuyShopItem(userId, rechargeId);
};

// 购买世界boss的商品
exports.buyWbShopItem = function(client, userId, rechargeId, nickName, cb) {
    var activeWorldBoss = g_boss.getActiveWorldBossObj();
    if (!activeWorldBoss) {
        return cb(null);
    }
    if (!activeWorldBoss.buyShopItem(userId, rechargeId)) {
        return cb(null);
    }
    var myGuildId = g_data.getGuildId(userId);
    var myGuild = g_guild.getGuild(myGuildId);
    if (!myGuild) return cb(null);

    var b_guildData = activeWorldBoss.getGuildData(myGuildId);
    var rechargeInfo = c_shop[rechargeId];
    if (!rechargeInfo) return cb(null);

    var fightUserNum = b_guildData.fightUserIds.length;
    var diamond = Math.floor(rechargeInfo.shareDiamond / fightUserNum);

    var tempList = [];
    for (var i = 0; i < fightUserNum; i++) {
        var memUId = b_guildData.fightUserIds[i];
        var rewardItem = {};
        rewardItem[200] = diamond;
        var locMail = mailBiz.createEntityByType(memUId, 69, [nickName], rewardItem);
        tempList.push(locMail);
    }

    if (tempList.length <= 0) return cb(null);
    mailDao.insertList(client, tempList, function(err, data) {
        if (err) return cb(err);
        cb(null, tempList.length);
    });
};

// 世界Boss的开启时间 
exports.getWbInfo = function(client, userId, cb) {
    var serverDate = g_server.getOpenServerDate();
    var firstWbOpenTime = serverDate.clone().clearTime().addDays(1).addHours();
    var startTime = bossUtils.getWorldOpenStartTime(140001);
};

// 世界boss 掉落 钥匙
exports.addWorldLuckyAward = function(client, userId, bossId, type, cb) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        console.error("addWorldLuckyAward:", userId, bossId, type);
        var c_bossCSWorldData = c_bossCSWorld[bossId];
        var TreasureId = 6001;
        var TreasureNum = 1;
        var items = {};
        if (type == 0) {
            for (var i = 0; i < c_bossCSWorldData.luckyAward.length; ++i) {
                if (c_bossCSWorldData.luckyAward[i][0] == TreasureId) {
                    TreasureNum = c_bossCSWorldData.luckyAward[i][1];
                } else {
                    items[c_bossCSWorldData.luckyAward[i][0]] = c_bossCSWorldData.luckyAward[i][1];
                }
            }
            // }else{
            //     for(var i = 0; i < c_bossCSWorldData.lastLuckyAward.length; ++i){
            //         if (c_bossCSWorldData.lastLuckyAward[i][0] == TreasureId){
            //             TreasureNum = c_bossCSWorldData.lastLuckyAward[i][1];
            //         }else{
            //             items[c_bossCSWorldData.lastLuckyAward[i][0]] = c_bossCSWorldData.lastLuckyAward[i][1];
            //         }
            //     }   
        }

        // // 发送邮件
        // if(Object.keys(items).length > 0){
        //      mailBiz.addByType(client, userId, c_prop.mailTypeKey.worldBossWin, [t_monsterData.name], items, function() {});
        // }

        var treasureEntity = new TreasureEntity();
        treasureEntity.userId = userId;
        treasureEntity.treasureId = TreasureId;
        treasureEntity.openTime = new Date();
        var color = t_item[TreasureId].color;
        var treasureItemName = t_item[TreasureId].name;
        chatBiz.addSysData(74, [color, treasureItemName, userData.nickName]);

        var insertList = [];
        for (var i = 0; i < TreasureNum; ++i) {
            insertList.push(treasureEntity);
        }
        treasureDao.insertList(client, insertList, function(err1, data) {
            if (err1) return;
            var insertId = data.insertId;
            var affectedRows = data.affectedRows;
            for (var i = 0; i < affectedRows; i++) {
                var newO = _cloneOBj(treasureEntity);
                newO.id = i + insertId;
                newO.openTime = new Date();
                newO.item = null;
                g_incognito.setTreasureInfoById(newO.id, newO);
                g_incognito.setTreasureOpenTimeOut(newO);
            }

            treasureBiz.insertTreasureRecord(client, c_prop.treasureRecordTypeKey.getTreasure, userData, treasureEntity.treasureId, {}, function(err2, data2) {
                if (err2) {
                    console.log(err2);
                }
            });
        });

        cb(null, []);
    });
};

//获取各种开启时间
var project = require("uw-config").project;
exports.getVariousOpenDate = function(client, cb) {
    var serverDate = g_server.getOpenServerDate();
    var now = new Date();
    //serverDate = new Date(serverDate);
    var data = new ds.OpenTimeData();


    data.serverOpenTime = serverDate;
    data.worldBossOpenTime = bossUtils.getWorldOpenStartTime(140001); //开服第二天 每天晚上9点
    data.guildBattleOpenTime = now.clone().clearTime().addHours(20).addMinutes(0); //开服第三天 每周日晚上八点


    var daysBetween = serverDate.clone().clearTime().getDaysBetween(now.clone().clearTime());
    if (daysBetween < 1) data.worldBossOpenTime.addDays(1);

    if (daysBetween < 2) {
        data.guildBattleOpenTime.addDays(2 - daysBetween);
        //==2时不变
    } else if (daysBetween > 2) {
        var weekDay = now.clone().getDay(); //周几
        if (weekDay != 0) { //不是周日
            data.guildBattleOpenTime.addDays(7 - weekDay);
        }
    }
    return cb(null, data);
};

exports.getWBHurtAward = function(client, userId, idx, cb) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var wbHurtData = userUtils.getWBHurtAwardData(userData);

        var lst = c_game.worldBossCfg[18].split(",");
        var itemLst = c_game.worldBossCfg[19].split(";");
        if (idx < 0 || i >= lst.length) {
            return cb(getMsg(c_msgCode.paramsError));
        }
        if (wbHurtData.award[idx] == 1) {
            return cb(getMsg(c_msgCode.hasReward));
        }
        var bagItem = {};

        // hurt
        var needHurt = parseInt(lst[idx]);
        // if (wbHurtData.hurt < needHurt) {
        //     return cb(getMsg(c_msgCode.nonstandard)); 
        // }
        var rewardItems = itemLst[idx];
        var itemArr = rewardItems.split(",");
        for (var i = 0; i < itemArr.length; i++) {
            var it = itemArr[i].split(":");
            bagItem[parseInt(it[0])] = parseInt(it[1]);
        }

        wbHurtData.award[idx] = 1;
        userData.exData[c_prop.userExDataKey.wbHurtAward] = wbHurtData;
        userUtils.saveItems(userData, bagItem, c_prop.itemGetTypeKey.worldBoss);

        var updateUser = {
            gold: userData.gold,
            exData: userData.exData
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.bag);
        return cb(null, [updateUser, bagItem]);
    });
};

exports.wbPersonAward = function(client, userId, bossId, rank, cb) {
    heroBiz.checkAndUpdateHeroTask(userId, c_prop.cHeroTaskKey.worldBoss, 1);
    taskBiz.setTaskValue(client, userId, c_prop.cTaskTypeKey.worldBossNum, 1, function() {});
    if (rank >= 10) return cb(null);
    var t_monsterData = t_monster[bossId];
    console.error("bossBiz:wbPersonAward:", userId, bossId, rank);
    var items = _getWBPersonAwardItems(bossId, rank);
    mailBiz.addByType(client, userId, c_prop.mailTypeKey.worldBossWin, [t_monsterData.name, rank + 1], items, function() {});
    cb(null);
};

exports.wbGuildAward = function(client, guildId, bossId, rank, cb) {
    console.error("bossBiz:wbGuildAward:", guildId, bossId, rank);
    var guild = g_guild.getGuild(guildId);
    if (!guild) {
        console.error("bossBiz:wbGuildAward guild isnot exists:", guildId);
        return cb(null);
    }
    var items = _getWBGuildAwardItems(bossId, rank);
    var t_monsterData = t_monster[bossId];
    // 查询所有公会用户
    guildPersonalDao.getMemberIdList(client, guildId, function(err, memberList) {
        if (err) return;
        var mailList = [];
        memberList.forEach(function(member) {
            var locMail = mailBiz.createEntityByType(member.userId, 94, [t_monsterData.name, rank + 1], items);
            mailList.push(locMail);
        });
        mailDao.insertList(client, mailList, function(err, data) {
            if (err) return;
        });
    });

    cb(null);
};

exports.wbLastShotAward = function(client, userId, bossId, cb) {
    console.error("bossBiz:wbLastShotAward:", userId, bossId);
    var t_monsterData = t_monster[bossId];
    var awardItem = c_bossCSWorld[bossId].lastShotAward;
    var items = {};
    for (var i = 0; i < awardItem.length; i++) {
        items[awardItem[i][0]] = awardItem[i][1];
    }
    mailBiz.addByType(client, userId, c_prop.mailTypeKey.worldBossLastKill, [t_monsterData.name], items, function() {});
    cb(null);
};

exports.wbShopBuy = function(client, userId, bossId, goodsId, cb) {
    console.error("bossBiz:wbShopBuy:", userId, bossId, goodsId);
    shopBiz.buyWbShopItem(client, userId, goodsId, function(err, data) {
        if (err) return cb(err);
        return cb(null, data);
    });
};

exports.getWBResult = function(client, cb) {
    battlesGroupBiz.getCSBossServer(client, function(err, data) {
        if (err) return cb(err);
        //console.log("getWBResult::", data);
        worldBossRecordBiz.getWBBattleResult(client, data.battleId, cb);
    });
};

var _getWBPersonAwardItems = function(bossId, rank) {
    var key = "rankAward" + (rank + 1);
    var awardItem = c_bossCSWorld[bossId][key];
    var items = {};
    for (var i = 0; i < awardItem.length; i++) {
        items[awardItem[i][0]] = awardItem[i][1];
    }
    return items;
};

var _getWBGuildAwardItems = function(bossId, rank) {
    var keys = ["guildAward1st", "guildAward2nd", "guildAward3rd"];
    var idx = 0;
    if (rank < 20) {
        idx = 0;
    } else if (rank < 50) {
        idx = 1;
    } else {
        idx = 2;
    }
    var key = keys[idx];
    var awardItem = c_bossCSWorld[bossId][key];
    var items = {};
    for (var i = 0; i < awardItem.length; i++) {
        items[awardItem[i][0]] = awardItem[i][1];
    }
    return items;
};

// 公会boss鼓舞
var _inspireGuildBoss = function(client, userId, bossId, cb) {
    var myGuildId = g_data.getGuildId(userId);
    var myGuild = g_guild.getGuild(myGuildId);
    if (!myGuild) {
        return cb(getMsg(c_msgCode.noAllianceToInspire)); //加入公会才能鼓舞
    }
    var g_bossData = g_boss.getBossObj(bossId).getBossData();
    if (g_bossData.callUserGuildId != myGuildId) return cb(getMsg(c_msgCode.unableToInspire)); //该Boss不属于你的公会,不能鼓舞

    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var costDiamond = c_game.worldBossCfg[3];
        if (userData.diamond < costDiamond || costDiamond < 0) {
            return cb(getMsg(c_msgCode.noDiamond));
        }
        userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.inspire);

        var b_guildData = g_boss.getBossObj(bossId).getGuildData(myGuildId);
        var inspireEndTime = b_guildData.inspireEndTime;
        if (inspireEndTime.isBefore(new Date())) {
            inspireEndTime = new Date();
        }
        var conTime = t_otherBuff[1].conTime;
        inspireEndTime.addSeconds(conTime);
        b_guildData.inspireEndTime = inspireEndTime;
        b_guildData.inspireNum += 1;
        b_guildData.inspireRecordArr.push(userData.nickName);
        if (b_guildData.inspireRecordArr.length > 20) {
            b_guildData.inspireRecordArr.shift();
        }

        g_boss.getBossObj(bossId).setGuildData(b_guildData.guildId, b_guildData);
        var g_userData = g_boss.getBossObj(bossId).getUserData(userId);
        chatBiz.addSysData(39, [g_userData.guildName, userData.nickName]);
        g_userData.inspireNum += 1; // 行会boss增加个人鼓舞次数,供客户端判断扣钻石

        var updateUser = {
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);

        var updateBossData = {
            inspireEndTime: inspireEndTime,
            inspireNum: b_guildData.inspireNum,
            mySpireNum: g_userData.inspireNum
        };
        return cb(null, [updateUser, updateBossData, costDiamond]);
    });
}

// 组队boss鼓舞
var _inspireTeamBoss = function(client, userId, bossId, cb) {

    //userDao.selectCols(client, "id,diamond,buyDiamond,giveDiamond,nickName", "id = ?", [userId], function (err, userData) {
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        if (err) return cb(err);
        var userData = gamePlayer.userData;
        var costDiamond = c_game.worldBossCfg[10];
        if (userData.diamond < costDiamond || costDiamond < 0) {
            return cb(getMsg(c_msgCode.noDiamond));
        }

        var b_userData = g_boss.getBossObj(bossId).getUserData(userId);
        if (b_userData.inspireNum >= c_game.worldBossCfg[17]) {
            return cb(getMsg(c_msgCode.inspireMax)); //鼓舞次数已达最大次数
        }

        userUtils.costCurrency(userData, c_prop.currencyTypeKey.diamond, costDiamond, c_prop.diamondCostTypeKey.inspire);

        var inspireEndTime = b_userData.inspireEndTime;
        if (inspireEndTime.isBefore(new Date())) {
            inspireEndTime = new Date();
        }
        var conTime = t_otherBuff[11].conTime;
        inspireEndTime.addSeconds(conTime);
        b_userData.inspireEndTime = inspireEndTime;
        b_userData.inspireNum += 1;

        var updateUser = {
            diamond: userData.diamond,
            buyDiamond: userData.buyDiamond,
            giveDiamond: userData.giveDiamond
        };
        gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);

        var updateBossData = {
            inspireEndTime: inspireEndTime,
            inspireNum: b_userData.inspireNum,
            mySpireNum: b_userData.inspireNum
        };
        //userDao.update(client, updateUser, {id: userId}, function (err, data) {
        //if (err) return cb(err);
        return cb(null, [updateUser, updateBossData, costDiamond]);
        //})
    });
}

var _openWorldBoss = function(client, bossId, originBossId) {
    var t_monsterData = t_monster[bossId];
    var bossOpt = {};
    bossOpt.originHp = t_monsterData.maxHp;
    bossOpt.curHp = t_monsterData.maxHp;
    /*    bossOpt.originHp = 50000;
        bossOpt.curHp = 50000;*/
    bossOpt.bossId = bossId; //boss的id
    bossOpt.bossName = t_monsterData.name;
    bossOpt.startTime = new Date();
    bossOpt.type = c_prop.worldBossTypeKey.world;
    bossOpt.originBossId = originBossId;
    //bossOpt.status = consts.bossStatus.open;
    chatBiz.addSysData(72, [t_monsterData.name]);
    chatBiz.addSysData(133, [t_monsterData.name]);
    g_boss.getBossObj(bossId).openWorldBoss(bossOpt, function() {
        _setTimeOver(client, bossId);
    });
};

var _sendGuildAwardEx = function(client, bossData, resultData, isWin, cb) {

    guildPersonalDao.getMemberIdList(client, bossData.callUserGuildId, function(err, memberList) {
        if (err) return cb(err);
        _sendGuildAward(client, bossData, resultData, isWin, memberList, cb)
    });
}

var _sendGuildAward = function(client, bossData, resultData, isWin, memberList, cb) {
    if (!isWin) return cb();
    var insertList = [];

    var bossParameterData = c_bossParameter[bossData.bossId];

    //行会boss奖励
    //前十排名奖
    for (var i = 0; i < resultData.rank10.length; i++) {
        var locRank = i + 1;
        var locUserId = resultData.rank10[i];
        var locReplaceArgs = [locRank];
        var locItems = {};
        //第一名奖励 二到五名奖励  六到10名奖励
        //rankAward1    rankAward2  rankAward3
        if (locRank == 1) {
            locItems = bossUtils.getAwardItems(bossData.bossId, c_prop.bossAwardTypeKey.rankAward1);
        }
        if (locRank >= 2 && locRank <= 5) {
            locItems = bossUtils.getAwardItems(bossData.bossId, c_prop.bossAwardTypeKey.rankAward2);
        }
        if (locRank >= 6 && locRank <= 10) {
            locItems = bossUtils.getAwardItems(bossData.bossId, c_prop.bossAwardTypeKey.rankAward3);
        }
        if (locRank >= 11 && locRank <= 20) {
            locItems = bossUtils.getAwardItems(bossData.bossId, c_prop.bossAwardTypeKey.rankAward4);
        }
        //c_prop.bossAwardTypeKey.rankAward1
        var mailType = c_prop.mailTypeKey.rankAward;
        if (bossParameterData && bossParameterData.isLimit) {
            mailType = c_prop.mailTypeKey.rankAwardLimit;
        }
        var locMail = mailBiz.createEntityByType(locUserId, mailType, locReplaceArgs, locItems[0]);
        insertList.push(locMail);
    }
    //召唤者id 
    var callItems = bossUtils.getAwardItems(bossData.bossId, c_prop.bossAwardTypeKey.summonAward)[0];
    var mailType = c_prop.mailTypeKey.summonAward;
    if (bossParameterData && bossParameterData.isLimit) {
        mailType = c_prop.mailTypeKey.summonAwardLimit;
    }
    var locMail = mailBiz.createEntityByType(bossData.callUserId, mailType, [], callItems);
    insertList.push(locMail);

    //公会id (公会所有人都有奖励)
    var guildItems = bossUtils.getAwardItems(bossData.bossId, c_prop.bossAwardTypeKey.guildAward)[0];

    //for(var i = 0 ;i<resultData.guildUserIds.length;i++){
    for (var i = 0; i < memberList.length; i++) {
        //var locUserId = resultData.guildUserIds[i];
        var locUserId = memberList[i].userId;
        //c_prop.bossAwardTypeKey.rankAward1
        var mailType = c_prop.mailTypeKey.guildAward;
        if (bossParameterData && bossParameterData.isLimit) {
            mailType = c_prop.mailTypeKey.guildAwardLimit;
        }
        var locMail = mailBiz.createEntityByType(locUserId, mailType, [bossData.callUserName], guildItems);
        insertList.push(locMail);
    }

    //伤害数据
    for (var key in resultData.hurtDic) {
        var locUserId = key;
        heroBiz.checkAndUpdateHeroTask(locUserId, c_prop.cHeroTaskKey.TimeBoss, 1);
        var locData = resultData.hurtDic[key];
        var locHurt = locData[0];
        var locHurtItems = bossUtils.getAwardItems(bossData.bossId, c_prop.bossAwardTypeKey.hurtAward, locHurt)[0];
        //c_prop.bossAwardTypeKey.rankAward1
        var mailType = c_prop.mailTypeKey.hurtAward;
        if (bossParameterData && bossParameterData.isLimit) {
            mailType = c_prop.mailTypeKey.hurtAwardLimit;
        }
        var locMail = mailBiz.createEntityByType(locUserId, mailType, [locHurt], locHurtItems);
        insertList.push(locMail);
    }

    //最后一击
    var killItems = bossUtils.getAwardItems(bossData.bossId, c_prop.bossAwardTypeKey.lastShotAward)[0];
    var mailType = c_prop.mailTypeKey.killAward;
    if (bossParameterData && bossParameterData.isLimit) {
        mailType = c_prop.mailTypeKey.killAwardLimit;
    }
    var locMail = mailBiz.createEntityByType(bossData.killUserId, mailType, [], killItems);
    insertList.push(locMail);

    mailDao.insertList(client, insertList, function(err, data) {
        if (err) return cb(err);
        cb(null);
    });
};

var _sendWorldAward = function(client, bossData, resultData, isWin, cb) {
    var insertList = [];
    var t_monsterData = t_monster[bossData.bossId];
    //伤害奖
    for (var key in resultData.hurtDic) {
        var locUserId = key;
        heroBiz.checkAndUpdateHeroTask(locUserId, c_prop.cHeroTaskKey.worldBoss, 1);
        var locData = resultData.hurtDic[key];
        var locHurt = locData[0];
        var locRank = locData[1];
        var locHurtItems = bossUtils.getWorldAwardItems(bossData.bossId, c_prop.bossAwardTypeKey.hurtAward, isWin, locRank)[0];
        //c_prop.bossAwardTypeKey.rankAward1
        if (isWin) {
            var locMail = mailBiz.createEntityByType(locUserId, c_prop.mailTypeKey.worldBossWin, [t_monsterData.name, locRank], locHurtItems);
            insertList.push(locMail);
        } else {
            var locMail = mailBiz.createEntityByType(locUserId, c_prop.mailTypeKey.worldBossLose, [t_monsterData.name, locRank], locHurtItems);
            insertList.push(locMail);
        }
    }

    if (isWin) {
        //最后一击
        var killItems = bossUtils.getWorldAwardItems(bossData.bossId, c_prop.bossAwardTypeKey.lastShotAward)[0];
        var locMail = mailBiz.createEntityByType(bossData.killUserId, c_prop.mailTypeKey.worldBossLastKill, [t_monsterData.name], killItems);
        insertList.push(locMail);
    }
    mailDao.insertList(client, insertList, function(err, data) {
        if (err) return cb(err);
        cb(null);
    });
};

var _sendTeamAward = function(client, bossData, resultData, isWin, cb) {
    var insertList = [];
    var t_monsterData = t_monster[bossData.bossId];

    //伤害奖
    for (var key in resultData.hurtDic) {
        var locUserId = key;
        heroBiz.checkAndUpdateHeroTask(locUserId, c_prop.cHeroTaskKey.teamBoss, 1);
        var locData = resultData.hurtDic[key];
        var locHurt = locData[0];
        var locRank = locData[1];
        var userData = g_boss.getBossObj(bossData.bossId).getUserData(locUserId);
        //全民boss多倍进入
        var manyNum = userData.manyNum || 1;
        manyNum = manyNum * 1;
        var lootsArr = bossUtils.getTeamRankAwardItems(bossData.bossId, locRank, manyNum);
        var locHurtItems = lootsArr[0];
        var expAward = lootsArr[2];
        userData.locItems = lootsArr[1]; //propUtils.mergerProp(userData.locItems,locHurtItems); 

        var mailId = locRank == 1 ? 70 : 68;
        var locMail = mailBiz.createEntityByType(locUserId, mailId, [t_monsterData.name, locRank], locHurtItems);
        insertList.push(locMail);

        // 全民Boss的跑马灯  
        var itemIdArr = Object.keys(locHurtItems);
        //屏蔽深渊门票、深渊卡箱、深渊魔石、传承精华、史莱姆糖果
        var ignoreItemIds = ['2007', '2015', '950', '39', '56'];
        var ignoreItemIds2 = ['2007', '2015', '950', '39', '56'];
        itemIdArr.forEach(function(itemId) {
            // 获得物品的公告
            if (ignoreItemIds.indexOf(itemId) < 0) {
                chatBiz.addSysData(148, [userData.userName, t_item[itemId].color, t_item[itemId].name]);
                chatBiz.addSysData(154, [userData.userName, t_item[itemId].color, t_item[itemId].name]);
            }
            if (ignoreItemIds2.indexOf(itemId) < 0) {
                //掉落记录
                copyBiz.addCopyLootRecord(client, locUserId, userData.userName, c_prop.copyTypeKey.teamBoss, bossData.bossId, itemId);
            }
        });
        _teamBossAwardExp(client, locUserId, expAward, function() {});
    }

    mailDao.insertList(client, insertList, function(err, data) {
        if (err) return cb(err);
        cb(null);
    });
};

var _sendPersonalTeamAward = function(client, bossData, paraUserId, cb) {
    var insertList = [];
    var t_monsterData = t_monster[bossData.bossId];
    var userData = g_boss.getBossObj(bossData.bossId).getUserData(paraUserId);
    //console.log("_sendPersonalTeamAward:", bossData, userData);
    if (userData.locItems) cb(getMsg(c_msgCode.hasReward)); //已领取过
    userData.locItems = {};

    var mapUser = {};
    var expAward = 0; // 经验是一样的
    //伤害奖
    var lootsArr = bossUtils.getTeamRankAwardItems(bossData.bossId, 1, 1);
    var locHurtItems = lootsArr[0];
    expAward = lootsArr[2];
    userData.locItems = lootsArr[1]; //propUtils.mergerProp(userData.locItems,locHurtItems);
    //userData.locItems[87] = expAward;   
    //console.log("_sendPersonalTeamAward:", userData.locItems);
    var locMail = mailBiz.createEntityByType(paraUserId, 70, [t_monsterData.name, 1], locHurtItems);
    insertList.push(locMail);
    mapUser[paraUserId] = paraUserId;
    mapUser[0] = 0;
    async.map(mapUser, function(userId, cb1) {
        if (userId == 0) { // 发送邮件
            mailDao.insertList(client, insertList, function(err, data) {
                if (err) return cb1(err);
                cb1(null);
            });
        } else { // 增加经验
            _teamBossAwardExp(client, userId, expAward, cb1);
        }

    }, cb);
};

var _teamBossAwardExp = function(client, userId, exp, cb) {
    //userDao.select(client,{id:userId},function(err,userData){
    g_cache.getGamePlayer_UserData(client, userId, function(err, data) {
        if (err) return cb(err);
        var gamePlayer = data[0];
        var isInCache = data[1];
        var userData = gamePlayer.userData;
        var userExp = exp;
        var userExpRate = fightUtils.getBuffExpcRate();
        // var userAddExpRate = fightUtils.getSelfBuffAddExpcRate(userData);
        // userExpRate += userAddExpRate;
        userExp = userExp * userExpRate;
        //console.log("_teamBossAwardExp old:", userId,",",userData.expc,",",userExp);
        userUtils.addUserExpc(userData, userExp);

        if (isInCache) {
            gamePlayer.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
            cb(null);
        } else {
            var updateUser = {
                lvl: userData.lvl,
                magicLvl: userData.magicLvl,
                expc: userData.expc,
                rebirthExp: userData.rebirthExp,
                infuseExpc: userData.infuseExpc,
                strength: userData.strength
            };
            //console.log("_teamBossAwardExp succ:", userId,",",updateUser);
            userDao.update(client, updateUser, { id: userId }, function() {
                if (err) return cb(err);
                cb(null);
            });
        }
    });
};

var _enterGuild = function(userId, myGuildId, bossId) {
    var g_bossData = g_boss.getBossObj(bossId).getBossData();
    // if(g_bossData.callUserGuildId!=myGuildId) return ; // todo 注释掉 liuqiang
    var b_guildData = g_boss.getBossObj(bossId).getGuildData(myGuildId);
    if (b_guildData.fightUserIds.indexOf(userId) > -1) return;
    b_guildData.fightUserIds.push(userId);
    //console.log("_enterGuild:", b_guildData.fightUserIds);
};

var _getGUserData = function(client, userId, bossId, cb) {
    if (!g_boss.getBossObj(bossId).hasUserData(userId)) {
        g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
            //userDao.selectCols(client, "id,lvl,nickName,iconId,vip", "id = ?", [userId], function (err, data) {
            if (err) return cb(err);
            data = gamePlayer.userData;
            var userData = g_boss.getBossObj(bossId).getUserData(userId);
            userData.userName = data.nickName;
            userData.icon = data.iconId;
            userData.vip = data.vip;
            userData.key = Date.now();
            var myGuildId = g_data.getGuildId(userId);
            var myGuild = g_guild.getGuild(myGuildId);
            if (myGuild) {
                userData.guildName = myGuild.name;
            }
            userData.combat = data.combat;
            cb(null, userData);
        });
    } else {
        var userData = g_boss.getBossObj(bossId).getUserData(userId);
        cb(null, userData)
    }
};


var _overBoss = function(client, bossId, isWin, cb) {
    var rank10 = []; //前十
    var callUserId = null; //召唤者id
    var guildUserIds = []; //公会id
    var hurtDic = {}; //伤害数据


    var g_bossData = g_boss.getBossObj(bossId).getBossData();
    if (g_bossData.isOver) return cb();
    var endPrize = 9;
    var bossType = g_bossData.type;
    var curNow = 0;
    var curTeamEnd = 0;
    if (bossType == c_prop.worldBossTypeKey.team) {
        endPrize = 60; // 60秒后回调
        curNow = new Date();
        curTeamEnd = (new Date()).addSeconds(c_bossTeam[bossId].refreshInterval);
    } else if (bossType == c_prop.worldBossTypeKey.world) {
        endPrize = 660; // 11分钟 todo 暂时
    } else {
        endPrize = c_game.worldBossCfg[8];
    }
    setTimeout(function() {

        bossDao.update(client, { status: 0 }, { originBossId: g_bossData.originBossId }, function(err) {
            g_boss.getBossObj(bossId).reset();
            if (bossType == c_prop.worldBossTypeKey.team) { // 组队boss 重置时间
                var tmpbossData = g_boss.getBossObj(bossId).getBossData();
                tmpbossData.endTime = curNow;
                tmpbossData.startTime = curTeamEnd; // 下次开始时间
                //console.log("teamBoss_endTime :", tmpbossData, tmpbossData.startTime);
            }
        });
    }, (endPrize - 5) * 1000);

    g_bossData.isOver = 1;

    g_boss.getBossObj(bossId).calDpsRank();

    var list = g_boss.getBossObj(bossId).getRankUserList();
    for (var i = 0; i < 20; i++) {
        var locUserData = list[i];
        if (!locUserData) continue;
        rank10.push(locUserData.userId);
    }

    callUserId = g_bossData.callUserId;
    var g_guildData = g_boss.getBossObj(bossId).getGuildData(g_bossData.callUserGuildId);
    guildUserIds = g_guildData.fightUserIds.concat([]);

    var userNum = 0;
    var maxCombat = 0;
    var allUserData = g_boss.getBossObj(bossId).getAllUserData();
    for (var key in allUserData) {
        var locUserId = parseInt(key);
        var locUserData = allUserData[key];
        if (locUserData.hurt > 0) {
            hurtDic[locUserId] = [locUserData.hurt, locUserData.rank];
        }
        userNum++;
    }

    var saveData = new ds.BossSaveResult();
    saveData.rank10 = rank10; //前十
    saveData.callUserId = callUserId; //召唤者id
    saveData.guildUserIds = guildUserIds; //公会id
    saveData.hurtDic = hurtDic; //伤害数据
    saveData.callGuildName = g_bossData.callUserGuildName;
    var updateBoss = {};
    /** 结束时间 **/
    updateBoss.endTime = new Date();
    /*结束时间*/
    //console.log("Boss Die:", bossId);
    /** 击杀人的id **/
    updateBoss.killUserId = g_bossData.killUserId;
    /*击杀人的id*/
    updateBoss.deathBossId = bossId;
    if (isWin) {
        /** 死亡时间 **/
        updateBoss.deathTime = new Date();
        /*死亡时间*/
        var nextBossId = g_bossData.bossId + 1;
        if (c_bossWorld[nextBossId]) {
            updateBoss.bossId = nextBossId;
        }
        //第一个%s：世界BOSS名字
        //第二个%s：伤害第一的玩家名
        var firstRank = exports.getFirstHurtRank(bossId);
        //组队BOSS不报
        if (g_bossData.type != c_prop.worldBossTypeKey.team) {
            chatBiz.addSysData(36, [g_bossData.bossName, firstRank.userName]);
        }
    } else {
        var nextBossId = g_bossData.bossId - 1;
        if (c_bossWorld[nextBossId]) {
            updateBoss.bossId = nextBossId;
            updateBoss.deathBossId = nextBossId;
        }
        //组队BOSS不报
        if (g_bossData.type != c_prop.worldBossTypeKey.team && g_bossData.type != c_prop.worldBossTypeKey.world) {
            chatBiz.addSysData(37, [g_bossData.bossName]);
        }

    }

    /** 状态 **/
    updateBoss.status = 2;
    /*状态 0:未开启 1:开启中*/
    /** 最后一次是否胜利 **/
    updateBoss.lastIsWin = isWin;
    /*最后一次是否胜利*/
    /** 结算数据 **/
    updateBoss.resultData = saveData;
    /*结算数据*/
    /** 是否结算奖励 **/
    updateBoss.isPrize = 0;
    /*是否结算奖励*/

    saveData.isWin = isWin; //是否胜利
    saveData.killTotalTime = g_bossData.startTime.getSecondsBetween(new Date()); //击杀耗时
    var firstUserData = _getFirstRankUser(bossId);
    if (firstUserData) {
        saveData.firstHurtName = firstUserData.userName; //伤害第一的名字
        maxCombat = firstUserData.combat || 0;
    }

    saveData.killUserName = g_bossData.killUserName; //最后一击的名字

    // 组队boss里 记录结束时间
    if (g_bossData.type == c_prop.worldBossTypeKey.team) {

        var stTime = Math.floor(g_bossData.startTime.getTime() / 1000);
        var dtTime = 0;
        var cuTime = Math.floor((new Date()).getTime() / 1000);
        if (isWin) {
            dtTime = cuTime;
        }
        var oObj = new ossObj.ossBoss(stTime, g_bossData.type, g_bossData.bossId, stTime, dtTime, cuTime, userNum, maxCombat, 0);
        ossBiz.WriteOss(oObj);

        g_bossData.endTime = curNow;
        g_bossData.startTime = curTeamEnd; // 下次开始时间
        //console.log("teamBoss_endTime :", g_bossData, g_bossData.startTime);

        updateBoss.startTime = g_bossData.startTime;
        updateBoss.endTime = g_bossData.endTime;
        //console.log('akjhfkjahsfk',firstUserData.userName,g_bossData.bossName);
        //组队BOSS第一名
        chatBiz.addSysData(106, [firstUserData.userName, g_bossData.bossName]);
    }

    _addBossTask(client, g_bossData, updateBoss.resultData, isWin, function(err, data) {});

    // if (isWin && bossType == c_prop.worldBossTypeKey.guild) {
    //     var allUserData = g_boss.getBossObj(bossId).getAllUserData();
    //     for (var key in allUserData) {
    //         var locUserId = parseInt(key);
    //         var locUserData = allUserData[key];
    //         // guildBiz.guildGrown(client, locUserId, locUserData.userName, 6, function(err, data){});  
    //     }
    // }

    bossDao.update(client, updateBoss, { originBossId: g_bossData.originBossId }, function(err) {
        if (err) return cb(err);
        exports.sendAward(client, g_bossData, updateBoss.resultData, isWin, function(err) {
            if (err) return cb(err);
            bossDao.update(client, { isPrize: 1 }, { originBossId: g_bossData.originBossId }, function(err) {
                if (err) return cb(err);
                cb(null);
            });
        });
    });
};

var _initGuildBossList = function(client, cb) {
    var bossIDList = bossUtils.getGuildBossIds();
    bossDao.listCols(client, "bossId,type", " type = ? ", [c_prop.worldBossTypeKey.guild], function(err, bossList) {
        if (err) return cb(err);
        var ownBossIds = [];
        for (var j = 0; j < bossList.length; j++) {
            var locBoss = bossList[j];
            ownBossIds.push(locBoss.bossId);
        }

        var insertList = [];
        for (var i = 0; i < bossIDList.length; i++) {
            var locBossId = bossIDList[i];
            if (ownBossIds.indexOf(locBossId) == -1) {
                var bossParameterData = c_bossParameter[locBossId];
                if (!bossParameterData.isOpen) continue;

                var bossEntity = new BossEntity();
                bossEntity.bossId = locBossId;
                bossEntity.startTime = null;
                bossEntity.endTime = null;
                bossEntity.killUserId = null;
                bossEntity.deathTime = null;
                bossEntity.type = c_prop.worldBossTypeKey.guild;
                bossEntity.originBossId = locBossId;

                if (bossParameterData.isLimit) {
                    bossEntity.isLimit = 1;
                    if (bossParameterData.startTime) {
                        bossEntity.limitStartTime = new Date(bossParameterData.startTime);
                    }
                    if (bossParameterData.endTime) {
                        bossEntity.limitEndTime = new Date(bossParameterData.endTime);
                    }
                }
                bossEntity.week = bossParameterData.week;
                insertList.push(bossEntity);
            }
        }

        if (insertList.length > 0) {
            bossDao.insertList(client, insertList, cb);
        } else {
            cb();
        }
    });
};


var _initWorldBossList = function(client, cb) {
    var bossIDList = bossUtils.getWorldBossIds();
    bossDao.listCols(client, "bossId,type,originBossId", " type = ? ", [c_prop.worldBossTypeKey.world], function(err, bossList) {
        if (err) return cb(err);
        var ownBossIds = [];
        for (var j = 0; j < bossList.length; j++) {
            var locBoss = bossList[j];
            ownBossIds.push(locBoss.originBossId);
        }

        var insertList = [];
        for (var i = 0; i < bossIDList.length; i++) {
            var locBossId = bossIDList[i];
            if (ownBossIds.indexOf(locBossId) == -1) {
                var bossEntity = new BossEntity();
                bossEntity.bossId = locBossId;
                bossEntity.startTime = null;
                bossEntity.endTime = null;
                bossEntity.killUserId = null;
                bossEntity.deathTime = null;
                bossEntity.type = c_prop.worldBossTypeKey.world;
                bossEntity.originBossId = locBossId;

                var bossParameterData = c_bossWorld[locBossId];
                if (bossParameterData.isLimit) bossEntity.isLimit = 1;
                insertList.push(bossEntity);
            }
        }

        if (insertList.length > 0) {
            bossDao.insertList(client, insertList, cb);
        } else {
            cb();
        }
    });
};


var _initTeamBossList = function(client, cb) {
    var bossIDList = bossUtils.getTeamBossIds();
    bossDao.listCols(client, "id,bossId,type,originBossId", " type = ? ", [c_prop.worldBossTypeKey.team], function(err, bossList) {
        if (err) return cb(err);
        var ownBossIds = [];
        var delList = [];
        for (var j = 0; j < bossList.length; j++) {
            var locBoss = bossList[j];
            ownBossIds.push(locBoss.originBossId);
            if (bossIDList.indexOf(locBoss.bossId) == -1) { //如配置表里已删除 则删除数据库中
                // console.error(locBoss);
                delList.push(locBoss.id);
            }
        }

        var insertList = [];
        for (var i = 0; i < bossIDList.length; i++) {
            var locBossId = bossIDList[i];
            if (ownBossIds.indexOf(locBossId) == -1) {
                var bossEntity = new BossEntity();
                bossEntity.bossId = locBossId;
                bossEntity.startTime = null;
                bossEntity.endTime = null;
                bossEntity.killUserId = null;
                bossEntity.deathTime = null;
                bossEntity.type = c_prop.worldBossTypeKey.team;
                bossEntity.originBossId = locBossId;

                insertList.push(bossEntity);
            }
        }
        if (delList.length > 0) {
            delList.forEach(function(id) {
                // console.error('del bossId ',id);
                bossDao.del(client, { id: id }, function() {});
            });
        }
        if (insertList.length > 0) {
            bossDao.insertList(client, insertList, cb);
        } else {
            cb();
        }
    });
};

var _getFirstRankUser = function(bossId) {
    var list = g_boss.getBossObj(bossId).getRankUserList();
    if (list.length <= 0) return null;
    var locUserData = list[0];
    return locUserData;
};

var _setTimeOver = function(client, bossId) {
    _overBoss(client, bossId, 0, function() {});
};

var _hasFightingBoss = function() {
    var bossCache = g_boss.getBossCache();
    for (var key in bossCache) {
        var locBossObj = bossCache[key];
        //只找在战斗的 行会BOSS(包括限时BOSS)
        if (locBossObj.getBossData().type != c_prop.worldBossTypeKey.guild) continue;
        if (!locBossObj.isOpen()) continue;
        if (!locBossObj.getBossData().isOver) return true;
    }
    return false;
};

var _hasGuildFightingBoss = function(guildId) {
    var bossCache = g_boss.getBossCache();
    for (var key in bossCache) {
        var locBossObj = bossCache[key];
        if (!locBossObj.isOpen()) continue;
        if (locBossObj.getBossData().isOver) continue;
        if (guildId && guildId == locBossObj.getBossData().callUserGuildId) {
            return true;
        }
    }
    return false;
};

/**
 * 初始化世界boss
 */
var _checkOpenWorldBoss = function(client, bossId, deathTime, originBossId) {
    deathTime = deathTime || (new Date()).addDays(-1);
    if (deathTime.equalsDay(new Date())) return;
    var startOpenTime = bossUtils.getWorldOpenStartTime(bossId);
    var endOpenTime = bossUtils.getWorldOpenEndTime(bossId);
    if ((new Date()).isAfter(startOpenTime) && (new Date()).isBefore(endOpenTime)) {
        _openWorldBoss(client, bossId, originBossId);
    }
};

/**
 * 初始化组队boss
 */
var _checkOpenTeamBoss = function(client, bossId) {

    var bossObj = g_boss.getBossObj(bossId);
    if (!bossObj._bossData || !bossObj._bossData.endTime) { // 第一次初始化
        //console.log("_checkOpenTeamBoss FirstInit:",bossId);
        _openTeamBoss(client, bossId, bossId);
    } else {
        // 计算时间，已经超过了5分钟
        var nowTime = new Date();
        if (nowTime.getTime() - bossObj._bossData.endTime.getTime() > (c_bossTeam[bossId].refreshInterval - 5) * 1000) {
            // 开boss
            //console.log("_checkOpenTeamBoss need reopen:",bossId);
            _openTeamBoss(client, bossId, bossId);
        }
    }
};

var _openTeamBoss = function(client, bossId, originBossId) {
    //console.log("_openTeamBoss:",bossId);
    var t_monsterData = t_monster[bossId];
    var bossOpt = {};
    bossOpt.originHp = t_monsterData.maxHp;
    bossOpt.curHp = t_monsterData.maxHp;

    bossOpt.bossId = bossId; //boss的id
    bossOpt.bossName = t_monsterData.name;
    bossOpt.startTime = new Date();
    bossOpt.endTime = (new Date()).addYears(1); // 结束时间记录成1年后结束的时间
    bossOpt.type = c_prop.worldBossTypeKey.team;
    bossOpt.status = consts.bossStatus.open;
    bossOpt.originBossId = originBossId;
    g_boss.getBossObj(bossId).openTeamBoss(bossOpt, function() {
        //_setTimeOver(client,bossId);
    });
};

/***
 * 插入组队boss的奖励记录
 */
var _insertBossRecord = function(client, recordType, rankUserData, bossId, cb) {
    var recordEntity = new BossRecordEntity();
    recordEntity.recordType = recordType;
    recordEntity.bossId = bossId;
    recordEntity.userId = rankUserData.userId;
    recordEntity.userName = rankUserData.userName;
    recordEntity.guildName = rankUserData.guildName;
    recordEntity.recordDate = new Date();
    recordEntity.killValue = rankUserData.hurt;
    bossRecordDao.insert(client, recordEntity, cb);
};

var _cloneOBj = function(obj) {
    var newO = {};
    if (obj instanceof Array) {
        newO = [];
    }
    for (var key in obj) {
        var val = obj[key];
        newO[key] = typeof val === 'object' ? arguments.callee(val) : val;
    }
    return newO;
}


/*if(require.main = module){
    var treasureDao = require("uw-treasure").treasureDao;
    var uwClient = require("uw-db").uwClient;
    var insertList = [];
    var treasureEntity = new TreasureEntity();
    for(var i=0; i<4; i++){
        insertList.push(treasureEntity);
    }

    treasureDao.insertList(uwClient, insertList, function(err, dataList){
        if(err) return cb(err);
        var insertId = dataList.insertId;
        var affectedRows = dataList.affectedRows;
        var newList = {};
        for(var i = 0; i<affectedRows; i++){
            var newO = _cloneOBj(treasureEntity);
            newO.id = i+insertId;
            newList[newO.id] = newO;
        }

        //cb(null);
    })
}*/