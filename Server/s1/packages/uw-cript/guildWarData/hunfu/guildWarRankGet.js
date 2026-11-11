/**
 * Created by Administrator on 2016/2/16.
 */


var mainClient = require("uw-db").mainClient;
var guildWarUtils = require("uw-guild-war").guildWarUtils;
var cmdJs = require('cmdjs');
var fs = cmdJs.fs2;
var path = cmdJs.path2;


var async = require("async");
var ds = require("uw-ds").ds;
var awardData =require("./award/award.json");
var exports = module.exports;
var scriptUtils = require("../../scriptUtils");
var strUtils = cmdJs.strUtils;
var outDir = path.join(__dirname, "out");
var outRankDir = path.join(__dirname, "outRank");
var outUserRankDir = path.join(__dirname, "outUserRank");
var outChairRankDir = path.join(__dirname, "outChairRank");

var outNotAwardDir = path.join(__dirname, "outNotAward");
var dataDir = path.join(__dirname, "data\\server");

var groupServerName1 = "QQ浏览器行会战分组";
var serverArr1 = [10000,10010,10018,10019,10020,10021,10022,10023,10024,10025,10026,10027,10028,10029,10030,10031,10032,10033,10034,10035,10036,10037,10038,10039,10040,10041,10042,10043,10044,10045,10046,10047,10048,10049,10050,10051,10052,10053,10054,10055,10056,10057,10058,10059,10060,10061,10062,10063,10064,10065,10066,10067,10068,10069,10070,10071,10072,10073,10075,10074,10076];

var groupServerName2 = "快玩行会战分组";
var serverArr2 = [20001,20002,20003,20004,20005,20006,20007];

var groupServerName3 = "光芒行会战分组";
var serverArr3 = [30001,30002,30003,30004,30005,30006,30007,30008,30009,30010];

var groupServerName4 = "混服分组1-75";
var serverArr4 = [1,75,74,73,72,71,70,69,68,67,66,65,64,63,62,61,60,59,58,57,56,55,54,53,52,51,50,49,48,47,46,45,44,38,32,27,21,13,5,2];

var groupServerName5 = "混服分组第二组76-115";
var serverArr5 = [76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115];

var groupServerName6 = "混服分组第三组116-155";
var serverArr6 = [117,116,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155];

var groupServerName7 = "混服分组第四组156-196";
var serverArr7 = [156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,200];

var groupServerName8 = "混服分组第五组197-224";
var serverArr8 = [244,243,242,241,240,239,238,237,236,235,234,233,232,231,230,229,228,227,226,225,224,223,222,221,220,219,218,217,216,215,214,213,212,211,210,209,208,207,206,205,204,203,202,201,200,199,198,197];


var serverAll = [];
serverAll =  serverAll.concat(serverArr1);
serverAll =  serverAll.concat(serverArr2);
serverAll =  serverAll.concat(serverArr3);
serverAll =  serverAll.concat(serverArr4);
serverAll =  serverAll.concat(serverArr5);
serverAll =  serverAll.concat(serverArr6);
serverAll =  serverAll.concat(serverArr7);
serverAll =  serverAll.concat(serverArr8);


var groupServerName = groupServerName6;
var serverArr = serverArr6;

var guildWarGroupAllDic = {"1":[],"2":[],"3":[],"4":[],"5":[]};
var userWarGroupAllDic = {"1":[],"2":[],"3":[],"4":[],"5":[]};
var run = function(){
    for(var i = 0;i<serverArr.length;i++){
        var locServerId = serverArr[i];
        var content = fs.readFileSync(dataDir+locServerId+".json").toString();
        var jContent = JSON.parse(content);
        var recordData =jContent.recordData[locServerId];
        var locGroupDic = recordData._guildWarGroupDic;

        _pushGroup(locGroupDic,1);
        _pushGroup(locGroupDic,2);
        _pushGroup(locGroupDic,3);
        _pushGroup(locGroupDic,4);
        _pushGroup(locGroupDic,5);

        var locUserGroupDic = recordData._guildWarUserGroupDic;
        _pushUser(locUserGroupDic,1);
        _pushUser(locUserGroupDic,2);
        _pushUser(locUserGroupDic,3);
        _pushUser(locUserGroupDic,4);
        _pushUser(locUserGroupDic,5);
    }
    _writeGroup(guildWarGroupAllDic[1],"钻石组");
    _writeGroup(guildWarGroupAllDic[2],"白金组");
    _writeGroup(guildWarGroupAllDic[3],"黄金组");
    _writeGroup(guildWarGroupAllDic[4],"白银组");
    _writeGroup(guildWarGroupAllDic[5],"黄铜组");


    var r1 =  _getRankData(guildWarGroupAllDic[1],userWarGroupAllDic[1],"钻石组");
    var r2 =  _getRankData(guildWarGroupAllDic[2],userWarGroupAllDic[2],"白金组");
    var r3 =  _getRankData(guildWarGroupAllDic[3],userWarGroupAllDic[3],"黄金组");
    var r4 =  _getRankData(guildWarGroupAllDic[4],userWarGroupAllDic[4],"白银组");
    var r5 =  _getRankData(guildWarGroupAllDic[5],userWarGroupAllDic[5],"黄铜组");
    var rankData = {"1":r1,"2":r2,"3":r3,"4":r4,"5":r5};
    writeRank(JSON.stringify(rankData));

    writeChairRank(r1,"钻石组");
    writeChairRank(r2,"白金组");
    writeChairRank(r3,"黄金组");
    writeChairRank(r4,"白银组");
    writeChairRank(r5,"黄铜组");

    writeUserRank(r1,"钻石组");
    writeUserRank(r2,"白金组");
    writeUserRank(r3,"黄金组");
    writeUserRank(r4,"白银组");
    writeUserRank(r5,"黄铜组");
};

var _pushGroup = function(locGroupDic,groupId){
    var group1Arr = guildWarGroupAllDic[groupId];
    var locGroup1Arr = locGroupDic[groupId]||[];
    group1Arr = group1Arr.concat(locGroup1Arr);
    guildWarGroupAllDic[groupId] = group1Arr;
};

var _pushUser = function(locUserDic,groupId){
    var group1Arr = userWarGroupAllDic[groupId];
    var locGroup1Arr = locUserDic[groupId]||[];
    group1Arr = group1Arr.concat(locGroup1Arr);
    userWarGroupAllDic[groupId] = group1Arr;
};


var _writeGroup = function(guildWarList,groupName){
    guildWarUtils.sortGuildWarRankList(guildWarList);
    var content = "";
     content += "排名|行会名|点数|剩余门|行会id|服务器名|发送奖励的排名";
    content += "\r\n";
    content += "\r\n";
    var notAwardGuildArr = [];

    for(var i = 0;i<guildWarList.length;i++){
        var locGuildWar = guildWarList[i];
        var locContent = "";
        locContent+=locGuildWar.rank;
        locContent+="|";
        locContent+=locGuildWar.guildName;
        locContent+="|";
        locContent+=locGuildWar.points;
        locContent+="|";
        locContent+=locGuildWar.doorLives;
        locContent+="|";
        locContent+=locGuildWar.guildId;
        locContent+="|";
        locContent+=locGuildWar.serverName;
        locContent+="|";
        var awardRank = getAwardRank(locGuildWar.serverId,locGuildWar.guildId);
        locContent+= awardRank||"无";
        locContent+="|";
        content+=locContent +"\r\n";

        if(!awardRank){
            notAwardGuildArr.push([locGuildWar.serverId,locGuildWar.guildId,locGuildWar.rank]);
        }
    }
    write(groupName,content);
    writeNotAward(JSON.stringify(notAwardGuildArr));
};

var write = function(groupName,data){
    var filePath = path.join(outDir, groupServerName+"("+groupName+").txt");
    fs.writeFileSync(filePath, data);//copy if it`s a file
};

var writeNotAward = function(data){
    var filePath = path.join(outNotAwardDir, groupServerName+".txt");
    fs.writeFileSync(filePath, data);//copy if it`s a file
};


var _getRankData = function(guildWarList,userWarList){
    guildWarUtils.sortGuildWarRankList(guildWarList);

    var allRank = new ds.GuildWarAllRank();
    var guildArr = [];
    var chairArr = [];
    var userArr = [];
    for(var i = 0;i<guildWarList.length;i++){
        var locGuildWar = guildWarList[i];
        var d = new ds.GuildWarRank();
        d.rank = locGuildWar.rank;//排名
        d.guildId = locGuildWar.guildId;//行会id
        d.guildName = locGuildWar.guildName;//行会名称
        d.points = locGuildWar.points;//积分
        d.serverId = locGuildWar.serverId;//服务器id
        guildArr.push(d);

        if(locGuildWar.rank>10){
            continue;
        }

        var d1 = new ds.GuildWarUserRank();
        var chairmanData = locGuildWar.chairmanData;////会长数据 [会长id,会长名称，会长vip,会长头像]
        d1.rank = locGuildWar.rank;//排名
        d1.userId = chairmanData[0];//玩家id
        d1.userName = chairmanData[1];//玩家名
        d1.vip = chairmanData[2];//玩家vip
        d1.iconId = chairmanData[3];//玩家头像
        d1.guildName = locGuildWar.guildName;//行会名
        d1.points = locGuildWar.points;//行会点数
        d1.serverId = locGuildWar.serverId;//服务器id
        chairArr.push(d1);
    }

    guildWarUtils.sortUserRankList(userWarList);

    for(var i = 0;i<userWarList.length;i++){
        var locUserWar = userWarList[i];
        if(locUserWar.rank>10){
            continue;
        }
        var d = new ds.GuildWarUserRank();
        d.rank = locUserWar.rank;//排名
        d.userId = locUserWar.userId;//玩家id
        d.userName = locUserWar.userName;//玩家名
        d.vip = locUserWar.vip;//玩家vip
        d.iconId = locUserWar.iconId;//玩家头像
        d.guildName = locUserWar.guildName;//行会名
        d.points = locUserWar.points;//行会点数
        d.serverId = locUserWar.serverId;//服务器id
        userArr.push(d);
    }

    allRank.guildArr = guildArr;//行会排行
    allRank.chairArr = chairArr;//会长排行
    allRank.userArr = userArr;//个人排行
    return allRank;
};

var writeRank = function(data){
    var filePath = path.join(outRankDir, groupServerName+".txt");
    fs.writeFileSync(filePath, data);//copy if it`s a file
};

var writeChairRank = function(allRank,groupName){
    var content = "";
    content += "排名|用户名|点数|行会名|服务器id";
    content += "\r\n";
    content += "\r\n";
    for(var i = 0; i<allRank.chairArr.length; i++){
        var locC = allRank.chairArr[i];
        var locContent = "";
        locContent+= locC.rank;
        locContent+="|";
        locContent+= locC.userName;
        locContent+="|";
        locContent+= locC.points;
        locContent+="|";
        locContent+= locC.guildName;
        locContent+="|";
        locContent+= locC.serverId;
        locContent+="|";
        content+=locContent +"\r\n";
    }
    var filePath = path.join(outChairRankDir, groupServerName+"("+groupName+").txt");
    fs.writeFileSync(filePath, content);//copy if it`s a file
};


var writeUserRank = function(allRank,groupName){

    var content = "";
    content += "排名|用户名|点数|服务器id";
    content += "\r\n";
    content += "\r\n";
    for(var i = 0; i<allRank.userArr.length; i++){
        var locC = allRank.userArr[i];
        var locContent = "";
        locContent+= locC.rank;
        locContent+="|";
        locContent+= locC.userName;
        locContent+="|";
        locContent+= locC.points;
        locContent+="|";
        locContent+= locC.serverId;
        locContent+="|";
        content+=locContent +"\r\n";
    }

    var filePath = path.join(outUserRankDir, groupServerName+"("+groupName+").txt");
    fs.writeFileSync(filePath, content);//copy if it`s a file
};


var getAwardRank = function(serverId,guildId){
    var awardRank = 0;
    for(var key in awardData){
        var locAward = awardData[key];
        if(locAward["1"]!=serverId||locAward["2"]!=guildId) continue;
        var locRankData = locAward["5"]||[];
        locRankData = locRankData[0]||[];
        awardRank = locRankData[1];
    }
    return awardRank;
};

run();

