/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Sara on 2015/11/12.
 */


var guildDao = require("uw-guild").guildDao;
var guildPersonalDao = require("uw-guild").guildPersonalDao;

var uwData= require("uw-data");
var c_recharge =  uwData.c_recharge;
var c_prop =  uwData.c_prop;
var mainClient =  require("uw-db").mainClient;

var userDao = require("uw-user").userDao;

var async = require("async");
var scriptUtils = require("./scriptUtils");

var exports = module.exports;

var check = function(serverData,sClient,cb){
    guildDao.list(sClient," lvl>=15 ",[],function(err,guildList){
        if(err) return cb(err);
        var effectNum = 0;
        async.mapLimit(guildList,5,function(guildData,cb1){
            _checkGuildChair(sClient,guildData,function(err,data){
                effectNum+=data;
                cb1();
            });
        },function(err,data){
            cb(null,effectNum);
        });
    });
};

var _checkGuildChair = function(client,guildData,cb){
    //假如会长id对不上，修正
    guildPersonalDao.listCols(client,"userId"," position = 1 and guildId = ? ",[guildData.id],function(err,personList){
        if(err) return cb(err);
        var num = 0;
        async.map(personList,function(locPerson,cb1){
            if(locPerson.userId!=guildData.chairmanId){
                num++;
                if(guildData.viceChairmanId.indexOf(locPerson.userId)>-1){
                    guildPersonalDao.update(client,{position:2},{userId:locPerson.userId},cb1);
                }else{
                    guildPersonalDao.update(client,{position:3},{userId:locPerson.userId},cb1);
                }
            }else{
                cb1();
            }
        },function(err,data){
            if(err) return cb(err);
            if(num>0)
                cb(null,1);
            else
                cb(null,0);
        });
    });
};


scriptUtils.runAllServers(check);
