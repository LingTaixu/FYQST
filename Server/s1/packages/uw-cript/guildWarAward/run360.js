/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Sara on 2015/11/12.
 */


var mailDao = require("uw-mail").mailDao;
var guildArr =  require("./360/guildArr.json");
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


var exports = module.exports;

var check = function(serverData,sClient,cb){
    checkRequire();
    guildWarRecordDao.selectCols(sClient,"id,recordData"," 1=1 order by recordTime desc",[],function(err,data){
        if(err) return cb(err);
        if(!data) return cb(null,0);
        if(!data.recordData) return  cb(null,0);
        var serverGuildWarObj = data.recordData[serverData.serverId];
        if(!serverGuildWarObj) return  cb(null,0);
        var _guildWarUserDic =  serverGuildWarObj._guildWarUserDic||{};
        var _guildWarDic =  serverGuildWarObj._guildWarDic||{};
        var tempList = [];
        for(var i = 0;i<guildArr.length;i++){
            var locGuildData = guildArr[i];
            var locServerId = locGuildData[0];
            var locGuildId = locGuildData[1];
            var locRank = locGuildData[2];
            if(locServerId==serverData.serverId){
                //发送行会参与奖
                for(var key in _guildWarUserDic){
                    var locUserWar = _guildWarUserDic[key];
                    if(locUserWar.guildId!=locGuildId) continue;
                    var locGuildWarItems = getAwardItems(locUserWar.groupId,locRank,1);
                    if(!locGuildWarItems) continue;
                    var locMail = mailBiz.createEntityByType(locUserWar.userId, c_prop.mailTypeKey.guildWarRank1, [c_prop.guildGroup[locUserWar.groupId],locRank], locGuildWarItems);
                    tempList.push(locMail);
                }
                //发送行会会长奖
                var locGuildWar = _guildWarDic[locGuildId];
                if(locGuildWar&&locGuildWar.groupId&&locRank<=10){
                    //会长
                    var locChairItems = getAwardItems(locGuildWar.groupId, locRank, 2);
                    if (locChairItems){
                        var locChairId = locGuildWar.chairmanData[0];
                        var locMail = mailBiz.createEntityByType(locChairId, c_prop.mailTypeKey.guildWarRank2, [c_prop.guildGroup[locGuildWar.groupId], locRank], locChairItems);
                        tempList.push(locMail);
                    }
                }
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
