/**
 * Created by Sara on 2016/1/11.
 */
var guildDao = require("uw-guild").guildDao;
var guildPersonalDao = require("uw-guild").guildPersonalDao;
var uwData= require("uw-data");
var c_prop = uwData.c_prop;
var uwClient = require("uw-db").uwClient;
var mainClient = require("uw-db").mainClient;
var async = require("async");
var exports = module.exports;

exports.refresh = function(cb){
    guildDao.listCols(uwClient,"id,viceChairmanId", " viceChairmanId is not null and viceChairmanId != '[]'",[],function(err,guildList) {
        if (err) return cb(err);
        async.map(guildList,function(guildData,cb1){
            _checkGuild(guildData,cb1);
        },function(err,data){
            if (err) return cb(err);
            cb(null,guildList.length);
        });
    });
};

var _checkGuild = function(guildData,cb){
    //修正公会副会长数据异常问题
    var guildId = guildData.id;
    var viceChairmanId = guildData.viceChairmanId||[];
    if(viceChairmanId.length > 0){
        async.map(viceChairmanId,function(userId,cb1){
            _checkPerson(guildData,userId,viceChairmanId,cb1);
        },cb);
    }else{
        cb();
    }
};

var _checkPerson = function(guildData,userId,viceChairmanId,cb){
    guildPersonalDao.selectCols(uwClient," guildId,position ",{userId:userId},function(err, guildPersonalData){
        if (err) return cb(err);
        var isUp = false;
        if(!guildPersonalData){
            for(var j = 0;j<viceChairmanId.length;j++){
                if(viceChairmanId[j]==userId){
                    guildData.viceChairmanId.splice(j--, 1);
                    isUp = true;
                }
            }
        }else if(guildPersonalData.guildId != guildData.id){
            for(var j = 0;j<viceChairmanId.length;j++){
                if(viceChairmanId[j]==userId){
                    guildData.viceChairmanId.splice(j--, 1);
                    isUp = true;
                }
            }
        }else{
            if(guildPersonalData.position != c_prop.guildPostKey.viceChairman){
                for(var j = 0;j<viceChairmanId.length;j++){
                    if(viceChairmanId[j]==userId){
                        guildData.viceChairmanId.splice(j--, 1);
                        isUp = true;
                    }
                }
            }
        }
        if(isUp){
            guildDao.update(uwClient,{viceChairmanId:guildData.viceChairmanId},{id: guildData.id},cb);
        }else{
            cb();
        }
    });
}

exports.refresh(function(err,data){
    if (err) return console.log(err);
    console.log("执行完毕!");
    console.log("一共[%s]条数据!",data);
    setTimeout(function(){
        process.exit(0);
    },1000);
});