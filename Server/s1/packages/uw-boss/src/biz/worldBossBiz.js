/**
 * Created by Administrator on 2015/12/25.
 */

var async = require("async");
var getMsg = require("uw-utils").msgFunc(__filename);
var propUtils = require("uw-utils").propUtils;
var uwData = require("uw-data");
var c_msgCode = uwData.c_msgCode;
var consts = uwData.consts;
var c_chatSys = uwData.c_chatSys;
var c_bossParameter = uwData.c_bossParameter;
var c_bossHurtRate = uwData.c_bossHurtRate;
var c_prop = uwData.c_prop;
var c_game = uwData.c_game;
var t_otherBuff = uwData.t_otherBuff;
var t_monster = uwData.t_monster;
var c_bossWorld = uwData.c_bossWorld;
var exports = module.exports;
var g_boss = require("uw-global").g_boss;
var g_data = require("uw-global").g_data;
var g_guild = require("uw-global").g_guild;
var ds = require("uw-ds").ds;
var userDao = require("uw-user").userDao;
var mailBiz = require("uw-mail").mailBiz;
var mailDao = require("uw-mail").mailDao;
var userUtils = require("uw-user").userUtils;
var bossDao = require("../dao/bossDao");
var bossUtils = require("./bossUtils");
var BossEntity = require("uw-entity").BossEntity;
var chatBiz  =  require("uw-chat").chatBiz;
var heroDao = require("uw-hero").heroDao;
var heroPropHelper = require("uw-hero").heroPropHelper;
var guildPersonalDao = require("uw-guild").guildPersonalDao;
var mainClient = require("uw-db").mainClient;
var accountDao = require("uw-account").accountDao;



/**
 * 初始化boss
 * @param bossId
 */
exports.initBoss = function (bossId) {
    if (g_boss.getBossObj(bossId).getBossData()) {
        return ;
    }
    var t_monsterData = t_monster[bossId];

    var bossOpt = {};
    bossOpt.originHp = t_monsterData.maxHp;
    bossOpt.curHp = t_monsterData.maxHp;
    /*        bossOpt.originHp = 500000000;
     bossOpt.curHp = 500000000;*/
    bossOpt.bossId = bossId;//boss的id
    bossOpt.bossName = t_monsterData.name;
    bossOpt.startTime = new Date();
    bossOpt.type = c_prop.worldBossTypeKey.world;
    g_boss.getBossObj(bossId).initWorldBoss(bossOpt);
};