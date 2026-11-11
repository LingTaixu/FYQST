/**
 * Created by Sara on 2015/11/12.
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
    guildDao.listCols(uwClient,"id,guildPopulation,ennobleData", " 1=1",[],function(err,guildList) {
        if (err) return cb(err);
        async.mapLimit(guildList,100,function(guildData,cb1){
            var id = guildData.id;
            guildPersonalDao.listCols(uwClient,"id,ennoble", " guildId = ?",[id],function(err,guildPersonalList) {
                if (err) return console.log(err);
                var obj = {};
                for(var i=0;i<guildPersonalList.length;i++){
                    var ennoble = guildPersonalList[i].ennoble;
                    if(!obj[ennoble]) obj[ennoble] = 0;
                    obj[ennoble] +=1;
                }
                if(JSON.stringify(obj) != JSON.stringify(guildData.ennobleData) || guildData.guildPopulation !=guildPersonalList.length){
                    guildData.guildPopulation = guildPersonalList.length;
                    guildData.ennobleData=obj;
                    guildDao.update(uwClient,{guildPopulation:guildData.guildPopulation,ennobleData:guildData.ennobleData},{id: id},cb1);
                }else{cb1(null);}
            });
        },function(err,data){
            if (err) return console.log(err);
            console.log("执行完毕!");
            console.log("一共[%s]条数据!",guildList.length);
        });
    });
};


exports.refresh(function(){});