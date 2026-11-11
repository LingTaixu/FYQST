/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Sara on 2015/11/12.
 */


var mailDao = require("uw-mail").mailDao;

var async = require("async");
var scriptUtils = require("./scriptUtils");
var mailBiz = require("uw-mail").mailBiz;
var uwData= require("uw-data");
var c_prop =  uwData.c_prop;
var c_guildWarReward = uwData.c_guildWarReward;


var exports = module.exports;


var guildWarRecordDao;
var checkRequire = function(){
    guildWarRecordDao = require("uw-guild-war").guildWarRecordDao;
};

//recordData数据结构

//{"serverId":{_guildWarDic:{},_guildWarUserDic:{}}}


var check = function(serverData,sClient,cb){
    checkRequire();

    guildWarRecordDao.selectCols(sClient,"id,lastRankData"," 1=1 order by recordTime desc",[],function(err,data){
        if(err) return cb(err);
        if(!data) return cb(null,0);
        if(!data.lastRankData) return  cb(null,0);
        var mailList = [];
        var mailCount = 0;


        async.mapLimit(mailList,1, function (mail, cb1) {
            if(mail.length<=0) return cb1();
            var usr = mail[0].userId;
            mailDao.selectCols(sClient,"id"," userId = ? and type = ?",[usr,c_prop.mailTypeKey.guildWarRank1],function(err,mailData){
                if(err) return cb1(err);
                if(mailData){
                    async.setImmediate(function () {
                        cb1();
                    });
                }else{
                    mailCount += mail.length;
                    mailBiz.addMailByList(sClient,mail,cb1);
                }
            });
        }, function(err,data){
            if(err) return cb(err);
            cb(null,mailCount);
        });

    });
};

var _send = function(serverData,sClient,guildWar,rank,firstUserId,cb){
    mailDao.selectCols(sClient,"id","",[],function(){

    });
};

var _getFirstUserId = function(tempList,tempArr,serverId){

};


var _getRank = function(groupId,guildId,serverId){

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
