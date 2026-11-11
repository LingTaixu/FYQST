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
    //会长7天不登录-》副会长7天不登陆-》爵位最高，24小时内有贡献值-》不转让
    async.parallel([
        function(cb1){
            userDao.selectCols(client,"id,lastUpdateTime","id = ? ",[guildData.chairmanId],cb1);
        },
        function(cb1){
            if(!guildData.viceChairmanId||guildData.viceChairmanId.length<=0) {
                cb1(null,[]);
            }else{
                userDao.listCols(client,"id,lastUpdateTime","id in (?) ",[guildData.viceChairmanId],cb1);
            }
        },
        function(cb1){
            guildPersonalDao.selectCols(client,"userId"," position = 3 and guildId = ? and actLastTime > ? order by  ennoble desc ",[guildData.id, (new Date()).addHours(-24)],cb1);
        }
    ],function(err,data){
        if(err) return cb(err);
        var chairUser = data[0];
        var viceChairArr = data[1];
        var ennobleUser = data[2];//爵位
        if(guildData.id==386){
            var a= 1;
        }
        if(!chairUser.lastUpdateTime || chairUser.lastUpdateTime.getDaysBetween(new Date())<7){
            return cb(null,0);
        }

        //如果副会长7天内
        var viceChairId = null;
        for(var i = 0;i<viceChairArr.length;i++){
            var locChair = viceChairArr[i];
            if(locChair.lastUpdateTime.getDaysBetween(new Date())<7){
                viceChairId = locChair.id;
                break;
            }
        }

        if(viceChairId){
            //副会长
            //换会长，副会长
            //换职位
            _changeViceChair(client, guildData,guildData.chairmanId,viceChairId,cb);
        }else{
            //爵位优先
            if(ennobleUser){
                _changePersonPosition(client, guildData,guildData.chairmanId,ennobleUser.userId,cb)
            }else{
                cb(null,0);
            }
        }
    });
};

var _changeViceChair = function(client, guildData,chairId,viceChairId,cb){
/*
    1	会长
    2	副会长
    3	会员
    */
    //更新行会信息
    guildData.chairmanId = viceChairId;
    for(var i = 0;i<guildData.viceChairmanId.length;i++){
        var locId = guildData.viceChairmanId[i];
        if(locId==viceChairId){
            guildData.viceChairmanId[i] = chairId;
        }
    }
    guildDao.update(client,{chairmanId:guildData.chairmanId,viceChairmanId:guildData.viceChairmanId},{id:guildData.id},function(err,data){
        if(err) return cb(err);
        async.parallel([
            function(cb1){
                guildPersonalDao.update(client,{position:1},{userId:viceChairId},cb1);
            },
            function(cb1){
                guildPersonalDao.update(client,{position:2},{userId:chairId},cb1);
            }
        ],function(err,data){
            if(err) return cb(err);
            cb(null,1);
        })
    });

    //更新
    //guildPersonalDao
};

var _changePersonPosition = function(client, guildData,chairId,personId,cb){
    guildDao.update(client,{chairmanId:personId},{id:guildData.id},function(err,data){
        if(err) return cb(err);
        async.parallel([
            function(cb1){
                guildPersonalDao.update(client,{position:1},{userId:personId},cb1);
            },
            function(cb1){
                guildPersonalDao.update(client,{position:3},{userId:chairId},cb1);
            }
        ],function(err,data){
            if(err) return cb(err);
            cb(null,1);
        })
    });
};

scriptUtils.runAllServers(check);
