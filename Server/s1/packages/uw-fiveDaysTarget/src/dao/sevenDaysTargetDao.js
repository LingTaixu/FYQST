/**
 * Created by Administrator on 2015/12/15.
 */
var BaseDao = require("uw-db").BaseDao;
var util = require("util");
var uwData = require("uw-data");
var c_prop = uwData.c_prop;
var async = require("async");
var getMsg = require("uw-utils").msgFunc(__filename);
var c_msgCode = uwData.c_msgCode;

function Dao() {
    BaseDao.call(this);
    this.Entity = require('uw-entity').FiveDaysTargetEntity;
    this.castCols = {
        items: BaseDao.CAST_OBJECT
    };
    //++++++++++++++++++begin++++++++++++++++++++++
    //
    this.getRankListTop = function(client, rankType, top, cb) {
        var strSql = "";
        switch (rankType) {
            case c_prop.rankTypeKey.rebirthlvlRank:
                //小队评级排行榜
                strSql = "SELECT a.* FROM (SELECT id userId,nickName userName,iconId,lvl userLvl,rebirthLvl rankValue,? rankType,vip pkWinCount FROM uw_user WHERE rebirthLvl != '' AND rebirthLvl IS NOT NULL GROUP BY userId ORDER BY rankValue DESC,rebirthExp DESC, createTime ASC LIMIT ?)a where rankValue > 0";
                break;
            case c_prop.rankTypeKey.partnerCombatRank:
                //伙伴战力排行榜
                strSql = "SELECT a.* FROM (SELECT T2.id userId,T2.nickName userName,T2.iconId,T2.lvl userLvl,SUM(T1.partnerCombat) rankValue,? rankType,T2.vip pkWinCount FROM uw_hero T1 INNER JOIN uw_user T2 ON T1.userId = T2.id WHERE T1.partnerCombat != '' AND T1.partnerCombat IS NOT NULL GROUP BY T1.userId ORDER BY rankValue DESC,T2.createTime ASC LIMIT ?)a where rankValue > 0 ";
                break;
            case c_prop.rankTypeKey.holyCombatRank:
                //深渊装备战力排行帮
                strSql = "SELECT a.* FROM (SELECT T2.id userId,T2.nickName userName,T2.iconId,T2.lvl userLvl,SUM(T1.holyCombat) rankValue,? rankType,T2.vip pkWinCount FROM uw_hero T1 INNER JOIN uw_user T2 ON T1.userId = T2.id WHERE T1.holyCombat != '' AND T1.holyCombat IS NOT NULL GROUP BY T1.userId ORDER BY rankValue DESC,T2.createTime ASC LIMIT ?)a where rankValue > 0 ";
                break;

            case c_prop.rankTypeKey.talismanCombatRank:
                //宠物总战力
                strSql = "SELECT a.* FROM (SELECT T2.id userId,T2.nickName userName,T2.iconId,T2.lvl userLvl,SUM(T1.talismanCombat) rankValue,? rankType,T2.vip pkWinCount FROM uw_hero T1 INNER JOIN uw_user T2 ON T1.userId = T2.id WHERE T1.talismanCombat != '' AND T1.talismanCombat IS NOT NULL GROUP BY T1.userId ORDER BY rankValue DESC,SUM(T1.talismanCombat) DESC,T2.createTime ASC LIMIT ?)a where rankValue > 0 "; //WHERE rankValue >=240000";
                break;
            case c_prop.rankTypeKey.lvlRank:
                strSql = "SELECT a.* FROM (SELECT id AS userId, nickName AS userName, iconId, lvl AS userLvl, lvl AS rankValue, ? AS rankType, vip AS pkWinCount FROM uw_user WHERE accountId != 0 ORDER BY lvl DESC,combat DESC,createTime ASC LIMIT ?)a where rankValue > 0 "; //WHERE rankValue >=100";
                break;
            case c_prop.rankTypeKey.achieveRank:
                strSql = "SELECT a.* FROM (SELECT id AS userId, nickName AS userName, iconId, lvl AS userLvl, achieveLvl AS rankValue, ? AS rankType, achieveExp AS pkWinCount FROM uw_user WHERE accountId != 0 AND (achieveLvl>=4 OR (achieveLvl=3 AND achieveExp>=595)) ORDER BY achieveLvl DESC,achieveExp DESC,lvl DESC,combat DESC,createTime ASC LIMIT ?)a";
                break;
            case c_prop.rankTypeKey.paTaRank:
                strSql = "SELECT a.* FROM (SELECT id AS userId, nickName AS userName, iconId, lvl AS userLvl, highPaTa AS rankValue, ? AS rankType, vip AS pkWinCount FROM uw_user WHERE accountId != 0 ORDER BY highPaTa DESC,combat DESC,createTime ASC LIMIT ?)a where rankValue > 0 "; // WHERE rankValue >=50";
                break;
            case c_prop.rankTypeKey.combatRank:
                strSql = "SELECT a.* FROM (SELECT id AS userId, nickName AS userName, iconId, lvl AS userLvl, combat AS rankValue, ? AS rankType, vip AS pkWinCount FROM uw_user WHERE accountId != 0 ORDER BY combat DESC,lvl DESC,createTime ASC LIMIT ?)a WHERE rankValue > 0  "; //rankValue >=2000000";
                break;
            case c_prop.rankTypeKey.wingRank:
                // strSql = "SELECT a.* FROM (SELECT T2.id userId, T2.nickName userName, T2.iconId, T2.lvl userLvl, SUM(SUBSTRING_INDEX(SUBSTRING_INDEX(T1.wingArr,',',2),',',-1)+0) rankValue, ? rankType, T2.vip pkWinCount FROM uw_hero T1 INNER JOIN uw_user T2 ON T1.userId = T2.id WHERE T1.wingArr != '[]' AND T1.wingArr IS NOT NULL GROUP BY T1.userId ORDER BY rankValue DESC, SUM(SUBSTRING_INDEX(SUBSTRING_INDEX(wingArr,',',3),',',-1)+0) DESC, T2.createTime ASC LIMIT ?)a ";
                strSql = "SELECT a.* FROM (SELECT T2.id userId, T2.nickName userName, T2.iconId, T2.lvl userLvl, SUM(T1.wingCombat) rankValue, ? rankType, T2.vip pkWinCount FROM uw_hero T1 INNER JOIN uw_user T2 ON T1.userId = T2.id WHERE T1.wingArr != '[]' AND T1.wingArr IS NOT NULL GROUP BY T1.userId ORDER BY rankValue DESC, T2.createTime ASC LIMIT ?)a where rankValue > 0 "; //WHERE rankValue >=120000";
                break;
            case c_prop.rankTypeKey.arenaRank:
                strSql = "SELECT a.* FROM ( SELECT T2.id userId, T2.nickName userName, T2.iconId, T2.lvl userLvl, T1.rank rankValue, ? rankType, T2.vip pkWinCount FROM uw_arena T1 INNER JOIN uw_user T2 ON T1.userId = T2.id WHERE 1=1 ORDER BY T1.rank ASC LIMIT ?)a"; //WHERE T2.accountId != 0
                break;
            case c_prop.rankTypeKey.gemRank:
                strSql = "SELECT a.* FROM (SELECT T2.id userId, T2.nickName userName, T2.iconId, T2.lvl userLvl, SUM(T1.gemSumLvl) rankValue, ? rankType, T2.vip pkWinCount FROM uw_hero T1 INNER JOIN uw_user T2 ON T1.userId = T2.id WHERE 1=1 GROUP BY T1.userId ORDER BY rankValue DESC, T2.createTime ASC LIMIT ?)a where rankValue > 0 "; //  WHERE rankValue >=72";   
                break;
            case c_prop.rankTypeKey.realmRank:
                //符文等级
                strSql = "SELECT a.* FROM (SELECT T2.id userId,T2.nickName userName,T2.iconId,T2.lvl userLvl,SUM(T1.realmLvl) rankValue,? rankType,T2.vip pkWinCount FROM uw_hero T1 INNER JOIN uw_user T2 ON T1.userId = T2.id WHERE T1.realmLvl != '' AND T1.realmLvl IS NOT NULL GROUP BY T1.userId ORDER BY rankValue DESC,SUM(T1.realmLvl) DESC,T2.createTime ASC LIMIT ?)a where rankValue > 0 ";
                break;
            case c_prop.rankTypeKey.heroNumRank:
                //人物收集
                strSql = "SELECT a.* FROM (SELECT id AS userId, nickName AS userName, iconId, lvl AS userLvl, heroNum AS rankValue, ? AS rankType, vip AS pkWinCount FROM uw_user WHERE accountId != 0 ORDER BY heroNum DESC,combat DESC,lvl DESC,createTime ASC LIMIT ?)a where rankValue > 0 "; //WHERE rankValue >=100";
                break;
                // case c_prop.rankTypeKey.guildRank:
                // {
                //     strSql = "SELECT a.* FROM ( SELECT T2.id  userId, T2.nickName userName, T2.iconId, T2.lvl  userLvl, T1.lvl rankValue, ? rankType, T2.vip pkWinCount,T2.combat combat FROM uw_guild T1 INNER JOIN uw_user T2 ON T1.chairmanId = T2.id WHERE T2.accountId != 0 ORDER BY T1.lvl DESC,T2.combat DESC,T1.id ASC LIMIT ?)a";
                //     break;
                // }
            default:
                return cb(null, []);
                break;
        }
        //console.error('getRankListTopgetRankListTopgetRankListTop',strSql,rankType);
        client.query(strSql, [rankType, top], cb);
    };
    // 0:c_prop.rankTypeKey.lvlRank,
    // 1:c_prop.rankTypeKey.achieveRank,
    // 2:c_prop.rankTypeKey.talismanCombatRank,
    // 3:c_prop.rankTypeKey.paTaRank,
    // 4:c_prop.rankTypeKey.arenaRank,
    // 5:c_prop.rankTypeKey.combatRank,
    // 6:c_prop.rankTypeKey.combatRank
    this.getRankListTopBak = function(client, rankType, top, cb) {
        var strSql = "";
        switch (rankType) {
            case c_prop.rankTypeKey.rebirthlvlRank:
                //小队评级排行榜
                strSql = "SELECT a.* FROM (SELECT id userId,nickName userName,iconId,lvl userLvl,rebirthLvl rankValue,? rankType,vip pkWinCount FROM uw_user_bak WHERE rebirthLvl != '' AND rebirthLvl IS NOT NULL GROUP BY userId ORDER BY rankValue DESC,rebirthExp DESC, createTime ASC LIMIT ?)a where rankValue > 0";
                break;
            case c_prop.rankTypeKey.partnerCombatRank:
                //伙伴战力排行榜
                strSql = "SELECT a.* FROM (SELECT T2.id userId,T2.nickName userName,T2.iconId,T2.lvl userLvl,SUM(T1.partnerCombat) rankValue,? rankType,T2.vip pkWinCount FROM uw_hero_bak T1 INNER JOIN uw_user_bak T2 ON T1.userId = T2.id WHERE T1.partnerCombat != '' AND T1.partnerCombat IS NOT NULL GROUP BY T1.userId ORDER BY rankValue DESC,T2.createTime ASC LIMIT ?)a where rankValue > 0 ";
                break;
            case c_prop.rankTypeKey.holyCombatRank:
                //深渊装备战力排行帮
                strSql = "SELECT a.* FROM (SELECT T2.id userId,T2.nickName userName,T2.iconId,T2.lvl userLvl,SUM(T1.holyCombat) rankValue,? rankType,T2.vip pkWinCount FROM uw_hero_bak T1 INNER JOIN uw_user_bak T2 ON T1.userId = T2.id WHERE T1.holyCombat != '' AND T1.holyCombat IS NOT NULL GROUP BY T1.userId ORDER BY rankValue DESC,T2.createTime ASC LIMIT ?)a where rankValue > 0 ";
                break;

            case c_prop.rankTypeKey.talismanCombatRank:
                //宠物总战力
                strSql = "SELECT a.* FROM (SELECT T2.id userId,T2.nickName userName,T2.iconId,T2.lvl userLvl,SUM(T1.talismanCombat) rankValue,? rankType,T2.vip pkWinCount FROM uw_hero_bak T1 INNER JOIN uw_user_bak T2 ON T1.userId = T2.id WHERE T1.talismanCombat != '' AND T1.talismanCombat IS NOT NULL GROUP BY T1.userId ORDER BY rankValue DESC,SUM(T1.talismanCombat) DESC,T2.createTime ASC LIMIT ?)a WHERE rankValue > 0";
                break;
            case c_prop.rankTypeKey.lvlRank:
                strSql = "SELECT a.* FROM (SELECT id AS userId, nickName AS userName, iconId, lvl AS userLvl, lvl AS rankValue, ? AS rankType, vip AS pkWinCount FROM uw_user_bak WHERE accountId != 0 ORDER BY lvl DESC,combat DESC,createTime ASC LIMIT ?)a WHERE rankValue > 0";
                break;
            case c_prop.rankTypeKey.achieveRank:
                strSql = "SELECT a.* FROM (SELECT id AS userId, nickName AS userName, iconId, lvl AS userLvl, achieveLvl AS rankValue, ? AS rankType, achieveExp AS pkWinCount FROM uw_user_bak WHERE accountId != 0 AND (achieveLvl>=4 OR (achieveLvl=3 AND achieveExp>=595)) ORDER BY achieveLvl DESC,achieveExp DESC,lvl DESC,combat DESC,createTime ASC LIMIT ?)a";
                break;
            case c_prop.rankTypeKey.paTaRank:
                strSql = "SELECT a.* FROM (SELECT id AS userId, nickName AS userName, iconId, lvl AS userLvl, highPaTa AS rankValue, ? AS rankType, vip AS pkWinCount FROM uw_user_bak WHERE accountId != 0 ORDER BY highPaTa DESC,combat DESC,createTime ASC LIMIT ?)a WHERE rankValue > 0";
                break;
                /////
            case c_prop.rankTypeKey.combatRank:
                strSql = "SELECT a.* FROM (SELECT id AS userId, nickName AS userName, iconId, lvl AS userLvl, combat AS rankValue, ? AS rankType, vip AS pkWinCount FROM uw_user_bak WHERE accountId != 0 ORDER BY combat DESC,lvl DESC,createTime ASC LIMIT ?)a WHERE rankValue > 0";
                break;
            case c_prop.rankTypeKey.wingRank: //TODO 变成算战力的
                // strSql = "SELECT a.* FROM (SELECT T2.id userId, T2.nickName userName, T2.iconId, T2.lvl userLvl, SUM(SUBSTRING_INDEX(SUBSTRING_INDEX(T1.wingArr,',',2),',',-1)+0) rankValue, ? rankType, T2.vip pkWinCount FROM uw_hero_bak T1 INNER JOIN uw_user_bak T2 ON T1.userId = T2.id WHERE T1.wingArr != '[]' AND T1.wingArr IS NOT NULL GROUP BY T1.userId ORDER BY rankValue DESC, SUM(SUBSTRING_INDEX(SUBSTRING_INDEX(wingArr,',',3),',',-1)+0) DESC, T2.createTime ASC LIMIT ?)a ";
                strSql = "SELECT a.* FROM (SELECT T2.id userId, T2.nickName userName, T2.iconId, T2.lvl userLvl, SUM(T1.wingCombat) rankValue, ? rankType, T2.vip pkWinCount FROM uw_hero_bak T1 INNER JOIN uw_user_bak T2 ON T1.userId = T2.id WHERE T1.wingArr != '[]' AND T1.wingArr IS NOT NULL GROUP BY T1.userId ORDER BY rankValue DESC, T2.createTime ASC LIMIT ?)a WHERE rankValue > 0";
                break;
            case c_prop.rankTypeKey.arenaRank:
                strSql = "SELECT a.* FROM ( SELECT T2.id userId, T2.nickName userName, T2.iconId, T2.lvl userLvl, T1.rank rankValue, ? rankType, T2.vip pkWinCount FROM uw_arena_bak T1 INNER JOIN uw_user_bak T2 ON T1.userId = T2.id WHERE 1=1 ORDER BY T1.rank ASC LIMIT ?)a"; //WHERE T2.accountId != 0
                break;
            case c_prop.rankTypeKey.gemRank:
                strSql = "SELECT a.* FROM (SELECT T2.id userId, T2.nickName userName, T2.iconId, T2.lvl userLvl, SUM(T1.gemSumLvl) rankValue, ? rankType, T2.vip pkWinCount FROM uw_hero_bak T1 INNER JOIN uw_user_bak T2 ON T1.userId = T2.id WHERE 1=1 GROUP BY T1.userId ORDER BY rankValue DESC, T2.createTime ASC LIMIT ?)a WHERE rankValue > 0";
                break;
            case c_prop.rankTypeKey.realmRank:
                //符文榜
                strSql = "SELECT a.* FROM (SELECT T2.id userId,T2.nickName userName,T2.iconId,T2.lvl userLvl,SUM(T1.realmLvl) rankValue,? rankType,T2.vip pkWinCount FROM uw_hero_bak T1 INNER JOIN uw_user_bak T2 ON T1.userId = T2.id WHERE T1.realmLvl != '' AND T1.realmLvl IS NOT NULL GROUP BY T1.userId ORDER BY rankValue DESC,SUM(T1.realmLvl) DESC,T2.createTime ASC LIMIT ?)a where rankValue > 0";
                break;
            case c_prop.rankTypeKey.heroNumRank:
                //人物收集数
                strSql = "SELECT a.* FROM (SELECT id AS userId, nickName AS userName, iconId, lvl AS userLvl, heroNum AS rankValue, ? AS rankType, vip AS pkWinCount FROM uw_user_bak WHERE accountId != 0 ORDER BY heroNum DESC,combat DESC,createTime ASC LIMIT ?)a where rankValue > 0  "; //WHERE rankValue >=100";
                break;
                // case c_prop.rankTypeKey.guildRank:
                // {
                //     strSql = "SELECT a.* FROM ( SELECT T2.id  userId, T2.nickName userName, T2.iconId, T2.lvl  userLvl, T1.lvl rankValue, ? rankType, T2.vip pkWinCount,T2.combat combat FROM uw_guild_bak T1 INNER JOIN uw_user T2 ON T1.chairmanId = T2.id WHERE T2.accountId != 0 ORDER BY T1.lvl DESC,T2.combat DESC,T1.id ASC LIMIT ?)a";
                //     break;
                // }
            default:
                return cb(null, []);
                break;
        }
        client.query(strSql, [rankType, top], cb);
    };

    this.getCurTaskValue = function(client, userId, taskType, cb) {
        var strSql = "";
        switch (taskType) {
            case c_prop.cTaskType.wing:
                strSql = "SELECT  SUM(SUBSTRING_INDEX(SUBSTRING_INDEX(T1.wingArr,',',2),',',-1)+0) rankValue FROM uw_hero T1 INNER JOIN uw_user T2 ON T1.userId = T2.id WHERE T1.wingArr != '[]' AND T1.wingArr IS NOT NULL AND T2.id = ?";
                break;
            case c_prop.cTaskTypeKey.guild:
                strSql = "SELECT  COUNT(*) as count, guildId FROM uw_guild_personal WHERE userId = ?";
                break;
        }
        client.query(strSql, [userId], cb);
    }

    //复制竞技场表数据
    this.sqlTargetBak = function(client, day, cb) {
        console.error('---------------------------备份表sqlTargetBak---------------------------', '第' + day + '天');
        var strSql = "";
        switch (day) {
            case 1: //宝石等级榜
            case 2: //符文等级榜
            case 3: //守护精灵榜
            case 4: //小队评级 //竞技榜
            case 5: //宠物榜
            case 6: //伙伴战力 // 人物收集
            case 7: //深渊装备战力 //战力榜
                async.parallel([
                    function(cb1) {
                        client.query("TRUNCATE TABLE uw_user_bak", cb1);
                    },
                    function(cb1) {
                        client.query("TRUNCATE TABLE uw_hero_bak", cb1);
                    }
                ], function(err, data) {
                    if (err) return cb(err);
                    async.parallel([
                        function(cb1) {
                            strSql = "INSERT INTO uw_user_bak (id, accountId, iconId, nickName, lvl, expc, combat, vip, vipScore, exData, createTime, achieveLvl, achieveExp,highPaTa,heroNum,rebirthLvl,rebirthExp) SELECT id, accountId, iconId, nickName, lvl, expc, combat, vip, vipScore, exData, createTime, achieveLvl, achieveExp,highPaTa,heroNum,rebirthLvl,rebirthExp FROM uw_user";
                            // client.query("INSERT INTO uw_user_bak SELECT id, accountId, iconId, nickName, lvl, expc, combat, vip, vipScore, exData, createTime, achieveLvl, achieveExp,highPaTa,heroNum,rebirthLvl,rebirthExp FROM uw_user", cb1);
                            client.query(strSql, cb1);
                        },
                        function(cb1) {
                            // client.query("INSERT INTO uw_hero_bak SELECT id, userId, wingArr, wingSumLvl, gemSumLvl, realmSumLvl,talismanCombat,wingCombat,realmLvl,partnerCombat,holyCombat FROM uw_hero", cb1);
                            strSql = "INSERT INTO uw_hero_bak (id, userId, wingArr, wingSumLvl, gemSumLvl, realmSumLvl,talismanCombat,wingCombat,realmLvl,partnerCombat,holyCombat) SELECT id, userId, wingArr, wingSumLvl, gemSumLvl, realmSumLvl,talismanCombat,wingCombat,realmLvl,partnerCombat,holyCombat FROM uw_hero";
                            client.query(strSql, cb1);
                        }
                    ], function(err, data) {
                        cb(null)
                    })
                });
                break;
            // case 4: //小队评级 //竞技榜
            //     client.query("TRUNCATE TABLE uw_user_bak", function(err) {
            //         if (err) return cb(err);
            //         // client.query("INSERT INTO uw_user_bak SELECT id, accountId, iconId, nickName, lvl, expc, combat, vip, vipScore, exData, createTime, achieveLvl, achieveExp,highPaTa,heroNum,rebirthLvl,rebirthExp FROM uw_user", cb);
            //         strSql = "INSERT INTO uw_user_bak (id, accountId, iconId, nickName, lvl, expc, combat, vip, vipScore, exData, createTime, achieveLvl, achieveExp,highPaTa,heroNum,rebirthLvl,rebirthExp) SELECT id, accountId, iconId, nickName, lvl, expc, combat, vip, vipScore, exData, createTime, achieveLvl, achieveExp,highPaTa,heroNum,rebirthLvl,rebirthExp FROM uw_user";
            //         client.query(strSql, cb);
            //     })
            //     break;
            default:
                cb(getMsg(c_msgCode.actTimeOut)); //活动时间已过
        }
    };
};

util.inherits(Dao, BaseDao);
module.exports = new Dao();