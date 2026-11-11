/**
 * Created by Sara on 2015/5/28.
 */

var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var uwClient = require("uw-db").uwClient;
var ds = require("uw-ds").ds;
var c_prop = uwData.c_prop;
var g_guild = require("uw-global").g_guild;
var proto = module.exports;
var guildBiz = require("uw-guild").guildBiz;


/**
 * 获取缓存信息
 * @iface getCache
 * @args
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.a = function (args, session, next) {
    var g_guildData = g_guild.getCache();
    next(null,wrapResult(null,g_guildData));
};

/**
 * 获取某个行会数据
 * @iface getGuildById
 * @args {id:"id"}
 * @param args
 * @param session
 * @param next
 * @returns 缓存信息
 */
proto.b = function (args, session, next) {
    var argsKeys = iface.admin_guild_getGuildById_args ;
    var id = args[argsKeys.id]||0;
    var g_guildData = g_guild.getGuild(id);
    next(null,wrapResult(null,g_guildData));
};

/**
 * 修改某个公会内存值
 * @iface updateCache
 * @args {id:"id",data:"数据内容"}
 * @param args
 * @param session
 * @param next
 * @returns
 */
proto.c = function (args, session, next) {
    var argsKeys = iface.admin_guild_updateCache_args ;
    var id = args[argsKeys.id]||0;
    if(!id) return  next(null,wrapResult(null,null));
    var data = args[argsKeys.data]||{}; 
    
    console.error("g_guildData data:", data, typeof data);
    var g_guildData = g_guild.getGuild(id);
    for(var key in data){
        var value =  data[key];
        console.error("key:", key);
        switch(key){
            // case 'wareHouse':
            //     console.error("wareHouse:", key, value);
            //     value = JSON.parse(value);
            //     break;
            case 'lvl':
            case 'addUpAct':
            case 'todayHyd':
            case 'weekHyd':
            case 'fuli':
                value = parseInt(value);
                break;
        }
        if(g_guildData.hasOwnProperty(key)){
             console.error('key--->',key,'value--->',value,typeof value);
            g_guildData[key] = value;
        }
    }
    console.error("g_guildData:", g_guildData);
    g_guild.setGuild(id,g_guildData);
    next(null,wrapResult(null,g_guildData));
};

/**
 * 获取僵尸公会
 * @iface getZombieGuild
 * @args
 * @param args
 * @param session
 * @param next
 * @returns
 */
proto.d = function(args, session, next){
    var nowTime = new Date();
    var guildList = g_guild.getCache();
    var returnArr = [];
    if(!guildList) return returnArr;
    for(var key in guildList){
        var data = guildList[key];
        if(!data) continue;
        var guildData = data.guild;
        var lastLgTime = guildData.lastLgTime;
        if(lastLgTime){
            var dayCount = countDay(lastLgTime,nowTime);
            if(dayCount > 15) returnArr.push([guildData.id,guildData.name,guildData.lvl]);
        }else{
            guildData.lastLgTime = nowTime;
            g_guild.setGuild(guildData.id,guildData);
        }
    }
    next(null,wrapResult(null,returnArr));
};

/**
 * 清除僵尸公会
 * @iface clearZombieGuild
 * @args {id:"id",data:"[[],[],[],...]"}
 * @param args
 * @param session
 * @param next
 * @returns
 */
proto.e = function(args, session, next){
    var argsKeys = iface.admin_guild_clearZombieGuild_args;
    var id = args[argsKeys.id]||0;
    if(!id) return  next(null,wrapResult(null,null));
    var data = args[argsKeys.data]||[];

    g_guild.clearGuild(data);

    next(null,wrapResult(null,data));
};

/**
 * 会长弹劾
 * @iface chairmanImpeach
 * @args
 * @param args
 * @param session
 * @param next
 * @returns
 */
proto.f = function(args, session, next){
    guildBiz.chairmanImpeach(uwClient,function(){});
    next(null,wrapResult(null,"执行成功"));
};

//返回时间天数差
var countDay = function(start,end){
    var dif = end.getTime() - start.getTime();
    var day = Math.floor(dif / (1000 * 60 * 60 * 24));
    return day;
};