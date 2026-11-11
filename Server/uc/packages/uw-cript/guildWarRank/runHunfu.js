/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Sara on 2015/11/12.
 */

var guildWarRecordDao = require("uw-guild-war").guildWarRecordDao;
var data1 =  require("./hunfu/data1.json");
var data2 =  require("./hunfu/data2.json");
var data3 =  require("./hunfu/data3.json");
var data4 =  require("./hunfu/data4.json");
var data5 =  require("./hunfu/data5.json");
var data6 =  require("./hunfu/data6.json");
var data7 =  require("./hunfu/data7.json");
var data8 =  require("./hunfu/data8.json");


var async = require("async");
var scriptUtils = require("../scriptUtils");


var groupServerName1 = "QQ浏览器行会战分组";
var data1Server = [10000,10010,10018,10019,10020,10021,10022,10023,10024,10025,10026,10027,10028,10029,10030,10031,10032,10033,10034,10035,10036,10037,10038,10039,10040,10041,10042,10043,10044,10045,10046,10047,10048,10049,10050,10051,10052,10053,10054,10055,10056,10057,10058,10059,10060,10061,10062,10063,10064,10065,10066,10067,10068,10069,10070,10071,10072,10073,10075,10074,10076];

var groupServerName2 = "快玩行会战分组";
var data2Server = [20001,20002,20003,20004,20005,20006,20007];

var groupServerName3 = "光芒行会战分组";
var data3Server = [30001,30002,30003,30004,30005,30006,30007,30008,30009,30010];

var groupServerName4 = "混服分组1-75";
var data4Server = [1,75,74,73,72,71,70,69,68,67,66,65,64,63,62,61,60,59,58,57,56,55,54,53,52,51,50,49,48,47,46,45,44,38,32,27,21,13,5,2];

var groupServerName5 = "混服分组第二组76-115";
var data5Server = [76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115];

var groupServerName6 = "混服分组第三组116-155";
var data6Server = [117,116,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155];

var groupServerName7 = "混服分组第四组156-196";
var data7Server = [156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,200];

var groupServerName8 = "混服分组第五组197-224";
var data8Server = [244,243,242,241,240,239,238,237,236,235,234,233,232,231,230,229,228,227,226,225,224,223,222,221,220,219,218,217,216,215,214,213,212,211,210,209,208,207,206,205,204,203,202,201,200,199,198,197];


var exports = module.exports;

var check = function(serverData,sClient,cb){
    guildWarRecordDao.selectCols(sClient,"id,lastRankData"," 1=1 order by recordTime desc",[],function(err,data){
        if(err) return cb(err);
        if(!data) return cb(null,0);
         var lastRankData = null;
        if(data1Server.indexOf(serverData.serverId)>-1){
            lastRankData = data1;
        }
        if(data2Server.indexOf(serverData.serverId)>-1){
            lastRankData = data2;
        }
        if(data3Server.indexOf(serverData.serverId)>-1){
            lastRankData = data3;
        }
        if(data4Server.indexOf(serverData.serverId)>-1){
            lastRankData = data4;
        }
        if(data5Server.indexOf(serverData.serverId)>-1){
            lastRankData = data5;
        }
        if(data6Server.indexOf(serverData.serverId)>-1){
            lastRankData = data6;
        }
        if(data7Server.indexOf(serverData.serverId)>-1){
            lastRankData = data7;
        }
        if(data8Server.indexOf(serverData.serverId)>-1){
            lastRankData = data8;
        }
        if(!lastRankData) return cb(null,0);
        guildWarRecordDao.update(sClient,{lastRankData:lastRankData},function(err,data){
            if(err) return cb(err);
            cb(null,1);
        });
    });
};


scriptUtils.runAllServers(check);
