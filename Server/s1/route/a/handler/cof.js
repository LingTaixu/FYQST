/**
 * Created by Sara on 2015/5/28.
 */

var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var coffersBiz = require("uw-coffers").coffersBiz;
var uwClient = require("uw-db").uwClient;
var ds = require("uw-ds").ds;
var c_prop = uwData.c_prop;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;
var mainClient = require("uw-db").mainClient;
var proto = module.exports;

/**
 * 获取数据
 * @iface getInfo
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.CoffersEntity
 */
proto.a = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    coffersBiz.getInfo(uwClient,userId ,function(err,data){
        if(err) return next(null,wrapResult(err));
        delete data["defeseRecordArr"];
        delete data["lootRecordArr"];
        next(null,wrapResult(null,data,dsNameConsts.CoffersEntity));
    })
};

/**
 * 建设国库
 * @iface build
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.ExCoffers
 */
proto.b = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    coffersBiz.build(uwClient,userId ,function(err,data){
        if(err) return next(null,wrapResult(err));
        var exCoffers = new ds.ExCoffers();
        exCoffers.coffers = data[0];
        exCoffers.userData = data[1];
        exCoffers.addBuildValue = data[2];
        exCoffers.addGold = data[3];
        next(null,wrapResult(null,exCoffers,dsNameConsts.ExCoffers));
    })
};

/**
 * 激励
 * @iface addBuff
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.ExCoffers
 */
proto.b1 = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    coffersBiz.addBuff(uwClient,userId ,function(err,data){
        if(err) return next(null,wrapResult(err));
        var exCoffers = new ds.ExCoffers();
        exCoffers.coffers = data[0];
        exCoffers.userData = data[1];
        exCoffers.addBuffExpc = data[2];
        exCoffers.delBagItems = data[3];
        next(null,wrapResult(null,exCoffers,dsNameConsts.ExCoffers));
    })
};

/**
 * 获取英雄记录掠夺记录
 * @iface getLootRecordArr
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.CoffersRecord
 */
proto.c = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    /*
    var reArr = [];
    for(var i = 0;i<50;i++){
        var c = new ds.CoffersRecord();
        c.isWin = 1;//是否胜利
        c.time = new Date();//时间
        c.attackName = "超神哥"+i;//攻击玩家名
        c.serverName = "服务器"+i;//服务器名称
        c.door = 0|(Math.random()*5);//门
        c.defeseName = "菊爆队长"+i;//防守玩家名
        c.recource = 100000;//得到的金币
        reArr.push(c);
    }
    //接口调用
    next(null,wrapResult(null,reArr,dsNameConsts.CoffersRecord));
    */

    //接口调用
    coffersBiz.getLootRecordArr(uwClient,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.CoffersRecord));
    });
};

/**
 * 获取防守记录
 * @iface getDefeseRecord
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.CoffersRecord
 */
proto.c1 = function (args, session, next) {
    var userId = session.get(consts.session.userId);
/*    var reArr = [];
    for(var i = 0;i<50;i++){
        var c = new ds.CoffersRecord();
        c.isWin = 0|(Math.random()*2);//是否胜利
        c.time = new Date();//时间
        c.attackName = "超神哥"+i;//攻击玩家名
        c.serverName = "服务器"+i;//服务器名称
        c.door = 0|(Math.random()*5);//门
        c.defeseName = "菊爆队长"+i;//防守玩家名
        c.recource = 100000;//得到的金币
        reArr.push(c);
    }
    //接口调用
    next(null,wrapResult(null,reArr,dsNameConsts.CoffersRecord));
 */
    //接口调用
    coffersBiz.defeseRecordArr(uwClient,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.CoffersRecord));
    });
};

/**
 * 获取己方守卫数据
 * @iface getDefeseData
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.CofferUser
 */
proto.d = function (args, session, next) {
    var userId = session.get(consts.session.userId);
/*    var reArr = [];
    for(var i = 0;i<4;i++){
        var c = new ds.CofferUser();
        c.userId = i+1;//用户id
        c.serverId = i+1;//服务器id
        c.door = i;//门
        c.rankType = 0|(Math.random()*4);//头衔类型
        c.icon = (0|(Math.random()*3))+1;//头像
        c.lvl = 100;//等级
        c.vip = 12;//vip
        c.name = "超神哥"+i;//名字
        c.combat = 1200000;//战力
        c.isLoot = 0|(Math.random()*2);//是否掠夺
        c.isBreak = 0|(Math.random()*2);//是否击破
        reArr.push(c);
    }
    return next(null,wrapResult(null,reArr,dsNameConsts.CofferUser));*/
    //接口调用
    coffersBiz.getDefeseData(uwClient,userId ,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.CofferUser));
    });
};

/**
 * 获取敌方守卫数据
 * @iface getEnemyDefeseData
 * @args {serverId:"服务器id"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExDefenceData
 */
proto.d1 = function (args, session, next) {
    var userId = session.get(consts.session.userId);
/*    var reArr = [];
    for(var i = 0;i<4;i++){
        var c = new ds.CofferUser();
        c.userId = i+1;//用户id
        c.serverId = i+1;//服务器id
        c.door = i;//门
        c.rankType = 0|(Math.random()*4);//头衔类型
        c.icon = (0|(Math.random()*3))+1;//头像
        c.lvl = 100;//等级
        c.vip = 12;//vip
        c.name = "超神哥"+i;//名字
        c.combat = 1200000;//战力
        c.isLoot = 0|(Math.random()*2);//是否掠夺
        c.isBreak = 0|(Math.random()*2);//是否击破
        reArr.push(c);
    }
    return next(null,wrapResult(null,reArr,dsNameConsts.CofferUser));*/
    var argsKeys = iface.a_coffers_getEnemyDefeseData_args;
    var serverId = args[argsKeys.serverId];
    //接口调用
    coffersBiz.getEnemyDefeseData(uwClient,userId,serverId ,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.ExDefenceData));
    });
};

/**
* 获取服务器列表状态
* @iface getServerArr
* @args
* @param args
* @param session
* @param next
* @returns ds.CoffersServer
*/
proto.e = function (args, session, next) {
    var userId = session.get(consts.session.userId);
/*
    var reArr = [];
    for(var i = 0;i<5;i++){
        var c = new ds.CoffersServer();
        c.serverName = "太初第"+i+"服";//服务器名
        c.serverId = i+1;//服务器id
        c.resource = 100000;//国库储量
        c.isLootArr = [];
        c.isLootArr[0] = 0|(Math.random()*2);
        c.isLootArr[1] = 0|(Math.random()*2);
        c.isLootArr[2] = 0|(Math.random()*2);
        c.isLootArr[3] = 0|(Math.random()*2);
        c.isBreakArr = [];
        c.isBreakArr[0] = 0|(Math.random()*2);
        c.isBreakArr[1] = 0|(Math.random()*2);
        c.isBreakArr[2] = 0|(Math.random()*2);
        c.isBreakArr[3] = 0|(Math.random()*2);
        reArr.push(c);
    }
    //接口调用
    return next(null,wrapResult(null,reArr,dsNameConsts.CoffersServer));
*/

    coffersBiz.getServerArr(mainClient,userId ,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.CoffersServer));
    });
};


/**
 * 战斗开始
 * @iface fightStart
 * @args {serverId:"服务器id",door:"门类型"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExCoffers
 */
proto.f = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_coffers_fightStart_args;
    var serverId = args[argsKeys.serverId];
    var door = args[argsKeys.door];
    coffersBiz.fightStart(uwClient, userId, serverId, door,function(err,data){
        if(err) return next(null,wrapResult(err));
        var exCoffers = new ds.ExCoffers();
        exCoffers.userData = data[0];//用户数据
        exCoffers.heroList = data[1];
        exCoffers.otherDataList = data[2]; //[[衣服显示id,武器显示id,翅膀显示id],..]
        exCoffers.fightData = data[3];//["敌方用户等级"]
        exCoffers.status = data[4];//状态
        next(null,wrapResult(null,exCoffers,dsNameConsts.ExCoffers));
    });
};

/**
 * 挑战结束
 * @iface fightEnd
 * @args {serverId:"服务器id",door:"门类型",isWin:"是否胜利",fightData:"战斗数据"}
 * @param args
 * @param session
 * @param next
 * @returns ds.FightResult
 */
proto.f2 = function (args, session, next) {
/*    var f = new ds.FightResult();
    f.winStatus = 0|(Math.random()*3);//1：胜利，2：失败
    f.attackMember = ["超神哥",1000000,1];//攻击方信息 [名字,战力,头像id]
    f.beAttackMember = ["菊爆哥",2000000,2];//被攻击方信息 [名字,战力,头像id]
    f.coffersPerson = 100000;//个人收益增加
    f.coffersCommon = 10000000;//国库储量增加
    f.coffersStatus = 0|(Math.random()*2);//掠夺状态，0：正常，1：已经掠夺过，2：已经被捷足先登
    return next(null,wrapResult(null,f,dsNameConsts.FightResult));*/
    var argsKeys = iface.a_coffers_fightEnd_args;
    var serverId = args[argsKeys.serverId];
    var door = args[argsKeys.door];
    var isWin = args[argsKeys.isWin];
    var fightData = args[argsKeys.fightData];
    var userId = session.get(consts.session.userId);

    coffersBiz.fightEnd(uwClient, userId, serverId, door, isWin,function (err, data) {
        if (err) return next(null, wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.FightResult));
    });
};


/**
 * 战斗开始
 * @iface fightCoffersStart
 * @args {serverId:"服务器id"}
 * @param args
 * @param session
 * @param next
 * @returns ds.ExCoffers
 */
proto.g = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var argsKeys = iface.a_coffers_fightStart_args;
    var serverId = args[argsKeys.serverId];
    coffersBiz.fightCoffersStart(uwClient, userId, serverId, function(err,data){
        if(err) return next(null,wrapResult(err));
        var exCoffers = new ds.ExCoffers();
        exCoffers.userData = data[0];//用户数据
        exCoffers.coffersLvl = data[1];//用户数据
        next(null,wrapResult(null,exCoffers,dsNameConsts.ExCoffers));
    });
};

/**
 * 挑战结束
 * @iface fightCoffersEnd
 * @args {hurt:"伤害数据",serverId:"serverId",fightData:"战斗数据"}
 * @param args
 * @param session
 * @param next
 * @returns ds.FightResult
 */
proto.g1 = function (args, session, next) {
    var argsKeys = iface.a_coffers_fightCoffersEnd_args;
    var hurt = args[argsKeys.hurt];
    var serverId = args[argsKeys.serverId];
    var fightData = args[argsKeys.fightData];
    var userId = session.get(consts.session.userId);

    coffersBiz.fightCoffersEnd(uwClient, userId, hurt, serverId, function (err, data) {
        if (err) return next(null, wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.FightResult));
    });
};
