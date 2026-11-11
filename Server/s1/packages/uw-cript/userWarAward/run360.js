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

var ignoreGuildArr =[];

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
                if(locC.serverId!=serverData.serverId) continue;
                var locGuildId = locGuild[j].guildId;
                if(_isIgnore(locC.serverId,locGuildId,locGuild[j].guildName)) continue;
                var locChairItems = getAwardItems(locGroupId,locC.rank,2);
                var locMail = mailBiz.createEntityByType(locC.userId, c_prop.mailTypeKey.guildWarRank2, [c_prop.guildGroup[locGroupId], locC.rank], locChairItems);
                tempList.push(locMail);
            }

            var locUserArr = locLastRankData.userArr||[];
            for(var j = 0;j<locUserArr.length;j++){
                var locU = locUserArr[j];
                if(locU.serverId!=serverData.serverId) continue;
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
