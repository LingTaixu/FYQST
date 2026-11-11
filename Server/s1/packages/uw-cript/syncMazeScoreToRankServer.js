var async = require("async");
var uwData = require("uw-data");
var c_prop = uwData.c_prop;
var userDao = require("uw-user").userDao;
var scriptUtils = require("./scriptUtils");
var battlesGroupBiz = battlesGroupBiz || require("uw-battles-group").battlesGroupBiz;
var serverUtils = require("uw-utils").serverUtils;
var mainClient = require("uw-db").mainClient;
/*
*   同步gameServer所有玩家迷宫积分 到 rankServer服
*/

var check = function(serverData, sClient, cb) { 
    async.parallel([
        function(cb1) {
            userDao.list(sClient, " accountId > 0 and robotId = 0", [], cb1);
        },
        function(cb1) {
            battlesGroupBiz.getCSBossServer(mainClient, cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var userList = data[0];
        var battlesGroupData = data[1];
        if(!battlesGroupData)return cb('无battlesGroup数据  serverData==>',serverData);
        var battleId = battlesGroupData.battleId;

        var method = 'saveUserMazeScore';
        var execNum = 0;
        async.map(userList, function(userData, cb2) {
            var userId = userData.id;

            var exData = userData.exData || {};
            var infiniteMazeData = exData[c_prop.userExDataKey.infiniteMazeData] || [];
            var mazeScore = infiniteMazeData[1] || 0;
            if(!mazeScore) return cb2(null);
             
            var params = {};
            params.battleId = battleId;
            params.serverId = userData.serverId;
            params.userId = userData.id;
            params.nickName = userData.nickName;
            params.lvl = userData.lvl;
            params.iconId = userData.iconId;
            params.score = mazeScore;
            params.magicLvl = userData.magicLvl;
            execNum++;
            serverUtils.requestRankServer(method, params, cb2);
        }, function(err, data) {
            if (err) return cb(err);
            return cb(null,execNum);
        });
    });
};

scriptUtils.runAllServers(check);
// scriptUtils.runByServerIds([1],check);
