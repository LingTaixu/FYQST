var async = require("async");
var scriptUtils = require("./scriptUtils");
var userBiz = require("uw-user").userBiz;
var userDao = require("uw-user").userDao;
var guildPersonalDao = require("uw-guild").guildPersonalDao;
var uwData= require("uw-data");
var c_prop =  uwData.c_prop; 



var exports = module.exports;
 
var check = function(serverData,sClient,cb){ 
    guildPersonalDao.listCols(sClient,"userId, addUpAct "," addUpAct > 0 ",[],function(err,guildPersonList){
        if(err) return cb(err);
        if(!guildPersonList || guildPersonList.length <= 0) return cb(null,0);
        async.map(guildPersonList, function (guildPersonData, cb1) {

            userDao.selectCols(sClient,"bag "," id = ? ",[guildPersonData.userId],function(err,userData){
                if(err) return cb1(err);
                
                userData.bag = userData.bag || {};
                if(userData.bag[c_prop.spItemIdKey.guildAct])
                    userData.bag[c_prop.spItemIdKey.guildAct] += guildPersonData.addUpAct;
                else
                    userData.bag[c_prop.spItemIdKey.guildAct] = guildPersonData.addUpAct;

                var updateData = {
                    bag:userData.bag 
                }
                userDao.update(sClient,updateData,{ id: guildPersonData.userId },function(err,data){
                    if(err) return cb1(err);
                    console.log(new Date());
                    console.error('更新uw_user',guildPersonData.userId,' guildAct Item :',guildPersonData.addUpAct);
                    cb1(null,data);
                });
            });
        }, function(err,data){
            if(err) return cb(err);
            cb(null, guildPersonList.length);
        });
    });
};

scriptUtils.runAllServers(check);
