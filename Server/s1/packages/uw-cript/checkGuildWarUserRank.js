/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Sara on 2015/11/12.
 */



var async = require("async");
var scriptUtils = require("./scriptUtils");
var mainClient = require("uw-db").mainClient;
var ds = require("uw-ds").ds;
var guildWarRecordDao;
var guildGroupDao;
var serverInfoBiz;
var guildWarUtils;
var checkRequire = function(){
    guildWarRecordDao = require("uw-guild-war").guildWarRecordDao;
    guildGroupDao = require("uw-guild-war").guildGroupDao;
    serverInfoBiz = require("uw-server-info").serverInfoBiz;
    guildWarUtils = require("uw-guild-war").guildWarUtils;
};

var exports = module.exports;

var check = function(serverData,sClient,cb){
    checkRequire();
    guildGroupDao.list(mainClient,{},function(err,guildGroupList){
        if(err) return cb(err);
        var serverArr = [];
        for(var i = 0;i<guildGroupList.length;i++){
            var locCoffers = guildGroupList[i];
            if(locCoffers.serverArr.indexOf(parseInt(serverData.serverId) )>-1){
                serverArr = locCoffers.serverArr;
                break;
            }
        }
        if(serverArr.length<=0) return cb(null,0);

        var allUserArrDic = {};
        async.mapLimit(serverArr,1,function(locServerId,cb1){
            getGuildWarUserDic(locServerId,function(err,_guildWarUserDic){
                if(_guildWarUserDic){
                    for(var key in _guildWarUserDic){
                        var locUser = _guildWarUserDic[key];
                        var gUserArr = allUserArrDic[locUser.groupId]||[];
                        gUserArr.push(locUser);
                        allUserArrDic[locUser.groupId] = gUserArr;
                    }
                    return cb1();
                }else{
                    return cb1();
                }
            });
        },function(err,data){
            if(err) return cb(err);
            var lastUserRankData = {};
            for(var i = 1;i<=3;i++){
                var locUserArr = allUserArrDic[i]||[];
                guildWarUtils.sortUserRankList(locUserArr);
                lastUserRankData[i] = calRankData(locUserArr);
            }
            checkData(serverData,sClient,lastUserRankData,cb);
        });
    })
};

var calRankData = function(allUserArr){
    var rankList = [];
    for(var i = 0;i<allUserArr.length;i++){
        var locUserWar = allUserArr[i];
        var d = new ds.GuildWarUserRank();
        d.rank = locUserWar.rank;//排名
        d.userId = locUserWar.userId;//玩家id
        d.userName = locUserWar.userName;//玩家名
        d.vip = locUserWar.vip;//玩家vip
        d.iconId = locUserWar.iconId;//玩家头像
        d.guildName = locUserWar.guildName;//行会名
        d.points = locUserWar.points;//行会点数
        d.serverId = locUserWar.serverId;//服务器id
        rankList.push(d);
    }
    return rankList;
};

var getGuildWarUserDic = function(serverId,cb){
    serverInfoBiz.getServerClient(serverId, function (err, sClient) {
        if(err) return cb(err);
        if(!sClient) return cb(null,{});
        guildWarRecordDao.selectCols(sClient,"id,recordData"," 1=1 order by recordTime desc",[],function(err,data){
            if(err) return cb(err);
            if(!data||!data.recordData) return cb(null,{});
            var serverRecord = data.recordData[serverId]||{};
            return cb(null,serverRecord._guildWarUserDic||{});
        });
    });
};

var checkData = function(serverData,sClient,lastUserRankData,cb){
    guildWarRecordDao.selectCols(sClient,"id,lastRankData"," 1=1 order by recordTime desc",[],function(err,data){
        if(err) return cb(err);
        if(!data) return cb(null,0);
        if(!data.lastRankData) return  cb(null,0);
        for(var i = 1;i<=3;i++){
            var locRankObj = data.lastRankData[i]||{};
            locRankObj.userArr = lastUserRankData[i];
            data.lastRankData[i] = locRankObj;
        }
        guildWarRecordDao.update(sClient,{lastRankData:data.lastRankData},{id:data.id},function(err,data){
            if(err) return cb(err);
            cb(null,1);
        });
    });
};

scriptUtils.runAllServers(check);
