var exports = module.exports;
var uwClient = require("uw-db").uwClient;
var logger = require("uw-log").getLogger("uw-logger",__filename);
var async = require("async");
var rankBiz = require("uw-rank").rankBiz;
var guildPersonalDao = require("uw-guild").guildPersonalDao;
var guildDao = require("uw-guild").guildDao;
var scriptUtils = require("./scriptUtils");

var g_hybridData = require("uw-global").g_hybridData;
var exports = module.exports;
 
var check = function(serverData,sClient,cb){ 
    
    rankBiz.updateUserRanks(sClient, function(err){
        if(err) return console.log(err);
        // 更新完毕后更新玩家的公会名称
         async.parallel([
            function(cb1){
                rankBiz.getUserIdList(sClient, cb1);
            },
            function(cb1){
                guildPersonalDao.listCols(sClient, "userId, guildId", " 1=1 ", [], cb1);
            },
            function(cb1){
                guildDao.listCols(sClient, " id,name ", " 1 = 1 ", [], cb1);
             }
            ],function(err,data){
                var userIdList = data[0];
                var userGuilds = data[1];    
                var guildIds = data[2];
                var guildsMap = {};
                var userGuildsMap = {};
                for(var i = 0; i < guildIds.length; i++){
                    guildsMap[guildIds[i].id] = guildIds[i].name;
                }
                for(var i = 0; i < userGuilds.length; i++){
                    userGuildsMap[userGuilds[i].userId] = userGuilds[i].guildId;
                }
 
                var sqlArr = [];
                var strSql = "";
                var j = 0;
                for(var i = 0; i < userIdList.length; i++){
                    var userId = userIdList[i].userId;
                    var guildId = userGuildsMap[userId];
                    var guildName = guildsMap[guildId] || '';
                    //console.error("guildInfo:",guildId, guildName);
                    if (guildName && guildName != ''){
                        strSql += "update uw_user_rank set guildName='" + guildName + "' where userId = " + userId + ";"; 
                        //console.error("strSql:",strSql);
                        j++;
                        if (j  >=  1000){
                            sqlArr.push(strSql);
                            //sClient.query(strSql,[],function(err,data){});
                            strSql = "";
                            j = 0;
                        }
                    }                   
                }  
                //console.error("strSql:", strSql);
                if(strSql != ""){
                    sqlArr.push(strSql);
                    //sClient.query(strSql,[],function(err,data){});
                }

                async.map(sqlArr, function (sql, cb1) {
                    sClient.query(sql,[],cb1); 
                }, function(){
                    cb();
                });
            });
         
   });
};

scriptUtils.runAllServers(check);
// var servers = [];
// var i = 1;
// for(var j = 0; j < 10; ++j){
//     var idx = j+10*i;
//     servers.push(idx);
// }
// scriptUtils.runByServerIds(servers,check);
