/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Sara on 2015/11/12.
 */

var mailDao = require("uw-mail").mailDao;
var MailEntity = require("uw-entity").MailEntity;
var uwData = require("uw-data");
var c_prop=  uwData.c_prop;
var async = require("async");
var exports = module.exports;
var scriptUtils = require("./scriptUtils");

var c_challengeCupRankReward = {
    "1" : {id:1,name:'第1名',rangeStart:1,rangeEnd:1,gold:1000000,reward:[[43,50],[41,100]]},
    "2" : {id:2,name:'第2名',rangeStart:2,rangeEnd:2,gold:800000,reward:[[43,40],[41,80]]},
    "3" : {id:3,name:'第3名',rangeStart:3,rangeEnd:3,gold:500000,reward:[[43,30],[41,50]]},
    "4" : {id:4,name:'第4-21名',rangeStart:4,rangeEnd:21,gold:400000,reward:[[7,5]]},
    "5" : {id:5,name:'第22-50名',rangeStart:22,rangeEnd:50,gold:300000,reward:[[7,4]]},
    "6" : {id:6,name:'第51-100名',rangeStart:51,rangeEnd:100,gold:200000,reward:[[7,3]]},
    "7" : {id:7,name:'第101-9999名',rangeStart:101,rangeEnd:200,gold:100000,reward:[[7,2]]}
}

var check = function(serverData,sClient,cb){
    /*

     9	王城霸主
     10	守擂排名奖励
     11	擂台赛参与奖
     30
     */

    mailDao.list(sClient,"type in( ?) and addTime>? and addTime <? ",[[9,10,11,30],new Date("2016-06-16 12:00:00"),new Date("2016-06-16 23:00:00")],function(err,dataList){
        if (err) return cb(err);
        async.map(dataList,function(mailData,cb1){
            var locRank = mailData.replaceArgs[0];

            var updateData = null;
            if(mailData.type == 10){
                var locItems = _getRewardData(locRank);
                 updateData = {
                    isPicked:0,
                    isRead:0,
                    isDelete:0,
                    delTime:null,
                    items:locItems
                };
            }else{
                updateData = {
                    isPicked:0,
                    isRead:0,
                    isDelete:0,
                    delTime:null
                };
            }

            mailDao.update(sClient,updateData,{id:mailData.id},function(err,data) {
                if (err) return cb(err);
                cb1(null,1);
            });
        },function(err,data){
            if (err) return cb(err);
            cb(null,dataList.length);
        });
    });

};


/**
 *取得相应排名的奖励
 * @param rank
 * @private
 */
var _getRewardData = function(rank) {
    var items = {};
    var curData  = null;
    for(var i=1; i <= 10; i++) {
        var locData = c_challengeCupRankReward[i];
        if (!locData) break;
        if(rank>=locData.rangeStart&&rank<=locData.rangeEnd){
            curData = locData;
            break;
        }
    }
    if (curData&&locData.reward) {
        for(var i = 0;i<locData.reward.length;i++){
            var locReward = locData.reward[i];
            var itemId = locReward[0];
            var itemNum = locReward[1];
            var locOldNum = items[itemId]||0;
            items[itemId] = locOldNum+itemNum;
        }
    }

    if(locData.gold){
        items[c_prop.spItemIdKey.gold] = locData.gold;
    }

    return items;
};


scriptUtils.runAllServers(check);


