var async = require("async");
var scriptUtils = require("./scriptUtils");
var userBiz = require("uw-user").userBiz;
var userDao = require("uw-user").userDao;
var heroDao = require('uw-hero').heroDao;
var heroPropHelper = require('uw-hero').heroPropHelper; 

var uwData= require("uw-data");
var c_prop =  uwData.c_prop; 

var exports = module.exports;
 
var check = function(serverData,sClient,cb){ 

    userDao.list(sClient, ' robotId = 0 and accountId > 0', [], function(err, userList){

        async.map(userList, function(userData, cb1){
            
            heroDao.list(sClient," userId = ? order by id asc",[userData.id],function(err,heroList) {
                async.map(heroList, function(heroData, cb2){
                    var wingCombat = heroPropHelper.calHeroWingCombat(userData, heroData); 

                    var upHeroData = { 
                        wingCombat:wingCombat
                    };
                    heroDao.update(sClient, upHeroData, { id: heroData.id }, cb2);
                }, function(err, data){
                    if (err) return cb1(err);
                    return cb1(null);
                })
            })
        },function(err, data){
            if(err) return cb(err);
            return cb(null, userList.length);
        });
    }); 
};

scriptUtils.runAllServers(check);
