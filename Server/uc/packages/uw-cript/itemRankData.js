/**
 * Created by Sara on 2016/3/31.
 */
var mainClient =  require("uw-db").mainClient;
var userDao = require("uw-user").userDao;
var mailDao = require("uw-mail").mailDao;
var guildDao = require("uw-guild").guildDao;
var guildPersonalDao = require("uw-guild").guildPersonalDao;

var async = require("async");
var exports = module.exports;
var scriptUtils = require("./scriptUtils");

var check = function(serverData,sClient,cb){
    if(serverData.status != 1)  return cb(null,0);
    var newTime = new Date("2016-06-13 00:00:00");             //{itemId:{1:[数量，id，nickName，vip，lvl]}}
    userDao.listCols(sClient,"id,bag,lvl,vip,nickName", " lastUpdateTime >= ? ",[newTime],function(err,userList) {
        if (err) return cb(err);
        getRankData(userList,function(err,data){
            var cmdJs = require('cmdjs');
            var fs = cmdJs.fs2;
            fs.writeFileSync("rankData/server" + serverData.serverId +".txt", data);
            cb(null,1);
        });
    });
};

var getRankData = function(userList,cb){
    for(var i = 0;i <userList.length;i++){
        var userData = userList[i];
        userData.item10 = userData.bag[10]||0;
        userData.item18 = userData.bag[18]||0;
        userData.item19 = userData.bag[19]||0;
        userData.item3 = userData.bag[3]||0;
        userData.item30 = userData.bag[30]||0;
        userData.item35 = userData.bag[35]||0;
        userData.item39 = userData.bag[39]||0;
        userData.item1551 = userData.bag[1551]||0;
    }

    //async.mapLimit(userList,10,function(userData,cb1){
    //
    //
    //    userData.item10 = userData.bag[10]||0;
    //    userData.item18 = userData.bag[18]||0;
    //    userData.item19 = userData.bag[19]||0;
    //    userData.item3 = userData.bag[3]||0;
    //    userData.item30 = userData.bag[30]||0;
    //    userData.item35 = userData.bag[35]||0;
    //    userData.item39 = userData.bag[39]||0;
    //    userData.item1551 = userData.bag[1551]||0;
    //    cb1();
    //},function(err,data){
    //    if(err) return cb(err);
        var tempData = "";
        /*
         10	攻击宝石
         18	强化石
         19	升星石
         3	麻痹碎片
         30	羽毛
         35	终级经验丹
         39	传承符
         1551	金钥匙
         */

        tempData+="攻击宝石" +"\r\n";
        tempData+=_getDataStr(_getTop10(10,userList));
        tempData+="强化石" +"\r\n";
        tempData+=_getDataStr(_getTop10(18,userList));
        tempData+="升星石" +"\r\n";
        tempData+=_getDataStr(_getTop10(19,userList));
        tempData+="麻痹碎片" +"\r\n";
        tempData+=_getDataStr(_getTop10(3,userList));
        tempData+="羽毛" +"\r\n";
        tempData+=_getDataStr(_getTop10(30,userList));
        tempData+="终级经验丹" +"\r\n";
        tempData+=_getDataStr(_getTop10(35,userList));
        tempData+="传承符" +"\r\n";
        tempData+=_getDataStr(_getTop10(39,userList));
        tempData+="金钥匙" +"\r\n";
        tempData+=_getDataStr(_getTop10(1551,userList));

        cb(null,tempData);
    //});
};

var _getDataStr = function(list){
    var str = "";
    for(var i = 0;i<list.length;i++){
        str+= JSON.stringify(list[i]) +"\r\n";
    }
    return str;
}

var _getTop10 = function(itemId,userList){
    _sortList(itemId,userList);
    var tempList = [];
    for(var i = 0;i<10;i++){
        var locUser = userList[i];
        if(!locUser) continue;
        var locData = {};
        locData.id = locUser.id;
        locData.nickName = locUser.nickName;
        locData.lvl = locUser.lvl;
        locData.vip = locUser.vip;
        locData["item"+itemId] = locUser["item"+itemId];

        tempList.push(locData);
    }
    return tempList;
};

var _sortList = function(itemId,list){
    //数据结构：[id,伤害]
    list.sort(function (a, b) {
        return a["item"+itemId] > b["item"+itemId] ? -1 : 1;
    });
    return list;
}

var addCmdjs = function(sClient,mail,cb){
    var userId = mail.userId;
    var type = mail.type;
    var replaceArgs = mail.replaceArgs;
    async.parallel([
        function(cb1){
            guildPersonalDao.selectCols(sClient," id,userId,guildId ",{userId:userId},cb1);
        },
        function(cb1){
            userDao.selectCols(sClient," id,serverId ",{id:userId},cb1);
        }
    ],function(err,data){
        if (err) return cb(err);
        var gpData = data[0],userData = data[1];
        var guildId = gpData.guildId;
        var serverId = userData.serverId;
        var cmdJs = require('cmdjs');
        var fs = cmdJs.fs2;
        try {
            var hunhefu = require("./wbWar2.json");
        }
        catch (e) {
            fs.writeFileSync("wbWar2.json", JSON.stringify({}));
        }
        var hunhefu = require("./wbWar2.json");
        if(guildId){
            guildDao.selectCols(sClient," id,name ",{id:guildId},function(err,guildData){
                if(err) return cb(err);
                var name = guildData.name;
                var wugonghui = hunhefu[name]||{};
                if(!wugonghui["1"]) wugonghui["1"] = serverId;
                if(!wugonghui["2"]) wugonghui["2"] = guildId;
                if(type == 45) {
                    if(!wugonghui["5"]) wugonghui["5"] = [replaceArgs];
                }
                if(type == 46) {
                    if(!wugonghui["6"]) wugonghui["6"] = [replaceArgs];
                }
                if(!wugonghui[type]) wugonghui[type] = [];
                if(wugonghui[type].indexOf(userId) == -1) wugonghui[type].push(userId);
                hunhefu[name] = wugonghui;
                fs.writeFileSync("wbWar2.json", JSON.stringify(hunhefu));

                cb();
            });
        }else{
            var wugonghui = hunhefu["-1"]||{};
            if(!wugonghui["2"]) wugonghui["2"] = guildId;
            if(type == 45) {
                if(!wugonghui["5"]) wugonghui["5"] = [replaceArgs];
            }
            if(type == 46) {
                if(!wugonghui["6"]) wugonghui["6"] = [replaceArgs];
            }
            if(!wugonghui[type]) wugonghui[type] = [];
            if(wugonghui[type].indexOf([userId,serverId]) == -1) wugonghui[type].push([userId,serverId]);
            hunhefu["-1"] = wugonghui;
            fs.writeFileSync("wbWar2.json", JSON.stringify(hunhefu));

            async.setImmediate(function () {
                cb();
            });
        }
    });
};

scriptUtils.runAllServers(check);


