/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Sara on 2015/11/12.
 */


var mailDao = require("uw-mail").mailDao;
var async = require("async");
var scriptUtils = require("../scriptUtils");
var mailBiz = require("uw-mail").mailBiz;
var uwData= require("uw-data");
var c_prop =  uwData.c_prop;
var c_guildWarReward = uwData.c_guildWarReward;

var guildWarRecordDao;

var checkRequire = function(){
    guildWarRecordDao = require("uw-guild-war").guildWarRecordDao;

};
var ignoreGuildArr1 = [[10000,789,1],[10059,2,6],[10000,12,9],[10061,2,11],[10010,481,16],[10010,132,19],[10055,3,20],[10060,75,22],[10050,66,24],[10000,7,25],[10062,3,27],[10000,578,28]];
var ignoreGuildArr2 =    [[20001,3,2]];
var ignoreGuildArr3 =     [[47,116,1],[13,577,2],[27,586,4],[70,29,5],[32,553,6],[63,14,7],[1,946,8],[72,18,9],[1,29,10],[75,1,11],[52,3,12],[2,256,13],[1,205,14],[21,1167,15],[5,926,16],[38,454,17],[38,256,18],[21,767,19],[1,17,20],[1,88,21],[65,14,22],[1,97,23],[21,777,24],[1,216,25],[21,1,26],[62,3,27],[1,16,28],[73,3,29],[72,2,30],[32,1,31],[13,36,32],[27,256,33],[13,702,34]];
var ignoreGuildArr4 =     [[145,12,2],[116,93,3],[130,101,5],[140,4,6],[125,9,8],[144,1,9],[148,1,12],[126,76,13],[128,107,14],[142,6,15],[141,64,16],[123,11,17],[118,22,18],[150,3,19],[146,3,20],[124,49,21],[145,119,22],[128,3,23],[126,46,25],[142,1,26]];
var ignoreGuildArr5 =    [[109,5,1],[88,5,2],[87,10,3],[115,3,4],[97,92,5],[77,10,6],[76,72,7],[110,18,8],[98,7,9],[112,9,10],[78,28,11],[111,11,12],[100,2,13],[82,15,14],[103,5,15],[90,8,16],[83,9,17],[79,5,18],[94,38,19],[83,3,20],[83,175,21],[96,21,22],[81,12,23],[102,5,24],[112,12,25],[114,17,26],[98,3,27],[77,2,28],[97,5,29],[110,10,30],[111,5,31],[88,12,32]];
var ignoreGuildArr6 =    [[206,7,6],[222,1,17],[204,1,22]];
var ignoreGuildArr7 =     [[168,2,3],[176,3,7],[196,13,10],[167,1,16],[174,1,17],[189,2,20],[165,6,26],[170,153,27],[190,1,28],[173,2,29],[160,23,30],[164,11,39],[163,6,40],[165,5,42]];

var ignoreGuildArr = [];
/*
ignoreGuildArr = ignoreGuildArr.concat(ignoreGuildArr1);
ignoreGuildArr = ignoreGuildArr.concat(ignoreGuildArr2);
ignoreGuildArr = ignoreGuildArr.concat(ignoreGuildArr3);
ignoreGuildArr = ignoreGuildArr.concat(ignoreGuildArr4);
ignoreGuildArr = ignoreGuildArr.concat(ignoreGuildArr5);
ignoreGuildArr = ignoreGuildArr.concat(ignoreGuildArr6);
ignoreGuildArr = ignoreGuildArr.concat(ignoreGuildArr7);
*/

var sendServersArr = [10000,20001,30001,1,76,117,156,244];

var exports = module.exports;

var _isIgnore = function(serverId,guildId,guildName){
    //console.log(serverId,guildId,guildName);
    var ret = 0;
    for(var k = 0;k<ignoreGuildArr.length;k++){
        var locData = ignoreGuildArr[k];
        if(locData[0]==serverId&&locData[1]==guildId){
            ret = 1;
            break;
        }
    }
    return ret;
};

var check = function(serverData,sClient,cb){
    if(sendServersArr.indexOf(serverData.serverId)<=-1) return cb(null,0);
    checkRequire();
    guildWarRecordDao.selectCols(sClient,"id,lastRankData"," 1=1 order by recordTime desc",[],function(err,data){
        if(err) return cb(err);
        if(!data) return cb(null,0);
        if(!data.lastRankData) return  cb(null,0);

        var tempList = [];
        for(var i = 1;i<=5;i++){
            var locGroupId = i;
            var locLastRankData = data.lastRankData[locGroupId]||{};
            var locChairArr = locLastRankData.chairArr||[];
            var locGuild = locLastRankData.guildArr||[];
            for(var j = 0;j<locChairArr.length;j++){
                var locC = locChairArr[j];
                var locGuildId = locGuild[j].guildId;
                if(_isIgnore(locC.serverId,locGuildId,locGuild[j].guildName)) continue;
                var locChairItems = getAwardItems(locGroupId,locC.rank,2);
                var locMail = mailBiz.createEntityByType(locC.userId, c_prop.mailTypeKey.guildWarRank2, [c_prop.guildGroup[locGroupId], locC.rank], locChairItems);
                tempList.push(locMail);
            }

            var locUserArr = locLastRankData.userArr||[];
            for(var j = 0;j<locUserArr.length;j++){
                var locU = locUserArr[j];
                var loUItems = getAwardItems(locGroupId,locU.rank,2);
                var locMail = mailBiz.createEntityByType(locU.userId, c_prop.mailTypeKey.guildWarRank2, [c_prop.guildGroup[locGroupId], locU.rank], loUItems);
                tempList.push(locMail);

            }
        }

        if (tempList.length <= 0) return cb(null,0);

        mailDao.insertList(sClient, tempList, function (err, data) {
            if (err) return cb(err);
            cb(null,tempList.length);
        });

    });
};

/**
 * 获取奖励
 * @param groupId
 * @param rank
 * @param type 1、行会 2、会长 3、个人
 * @returns {{}}
 */
var getAwardItems = function(groupId,rank,type){
    /*
     diamond	1	钻石
     wGold	2	白金
     hGold	3	黄金
     silver	4	白银
     copper	5	黄铜
     */

    var rewardData = null;
    for(var key in c_guildWarReward){
        var locData = c_guildWarReward[key];
        if(rank>=locData.rangeBeg&&rank<=locData.rangeEnd){
            rewardData = locData;
            break;
        }
    }
    if(!rewardData) return null;
    //钻石奖励物品	钻石组会长奖励	钻石组个人奖励	白金组奖励	白金组会长奖励	白金组个人奖励	黄金组奖励	黄金组会长奖励	黄金组个人奖励	白银组奖励	白银组会长奖励	白银组个人奖励	青铜组奖励	青铜组会长奖励	青铜组个人奖励
    //diamond	diamondSp	diamondUser	wgold	wgoldSp	wgoldUser	hgold	hgoldSp	hgoldUser	silver	silverSp	silverUser	copper	copperSp	copperUser
    var itemArr = [];
    switch (groupId){
        case c_prop.guildGroupKey.diamond:
            if (type == 1) {
                itemArr = rewardData.diamond
            } else if (type == 2) {
                itemArr = rewardData.diamondSp
            } else if (type == 3) {
                itemArr = rewardData.diamondUser
            }
            break;
        case c_prop.guildGroupKey.wGold:
            if (type == 1) {
                itemArr = rewardData.wgold
            } else if (type == 2) {
                itemArr = rewardData.wgoldSp
            } else if (type == 3) {
                itemArr = rewardData.wgoldUser
            }
            break;
        case c_prop.guildGroupKey.hGold:
            if (type == 1) {
                itemArr = rewardData.hgold
            } else if (type == 2) {
                itemArr = rewardData.hgoldSp
            } else if (type == 3) {
                itemArr = rewardData.hgoldUser
            }
            break;
        case c_prop.guildGroupKey.silver:
            if (type == 1) {
                itemArr = rewardData.silver
            } else if (type == 2) {
                itemArr = rewardData.silverSp
            } else if (type == 3) {
                itemArr = rewardData.silverUser
            }
            break;
        case c_prop.guildGroupKey.copper:
            if (type == 1) {
                itemArr = rewardData.copper
            } else if (type == 2) {
                itemArr = rewardData.copperSp
            } else if (type == 3) {
                itemArr = rewardData.copperUser
            }
            break;
    }
    var reItems = {};
    for(var i=0;i<itemArr.length;i++){
        var locItemId = itemArr[i][0];
        var locItemNum = itemArr[i][1];
        locItemNum = parseInt(locItemNum)||0;
        if(locItemNum<=0) continue;
        reItems[locItemId] = locItemNum;
    }
    return reItems;
};

scriptUtils.runAllServers(check);
