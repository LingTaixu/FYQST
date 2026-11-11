/**
 * Created by Sara on 2015/11/12.
 */
var gameRecordDao = require("uw-game-record").gameRecordDao;
var uwData= require("uw-data");
var c_prop = uwData.c_prop;

var mailBiz = require("uw-mail").mailBiz;
var mailDao = require("uw-mail").mailDao;
var userDao = require("uw-user").userDao;
var MailEntity = require("uw-entity").MailEntity;

var scriptUtils = require("./scriptUtils");

var async = require("async");
var exports = module.exports;

var check = function(serverData,sClient,cb){
    gameRecordDao.listCols(sClient,"id,userId,costDiamondRecord", " recordTime >= ? and recordTime <=?",[new Date("2016-05-07 00:00:00"), new Date("2016-05-07 23:59:59") ],function(err,gameRecordList) {
        if (err) return cb(err);
        if(gameRecordList.length<=0) return cb(null,0);
        //gameRecordBiz.setCostDiamondRecord(uwClient,userId,c_prop.diamondCostTypeKey.clearGuildWarCd,costDiamond,cb1);
        var title = '行会战个人鼓舞消耗元宝返还';
        var content = '行会战个人鼓舞消耗元宝返还';
        var tempList = [];

        for(var i = 0;i<gameRecordList.length;i++){
            var locData = gameRecordList[i];
            var costDiamond = locData.costDiamondRecord[c_prop.diamondCostTypeKey.inspireGuildWar]||0;
            if(costDiamond<=0) continue;
            var items = {"200":costDiamond};
            //发送邮件
            var mailEntity = new MailEntity();
            mailEntity.userId = locData.userId;//"用户id"
            mailEntity.type = 0;//"类型"
            mailEntity.fromName = "系统消息";//"发送者"
            mailEntity.title = title;//"标题"
            mailEntity.content = content;//"内容"
            mailEntity.replaceArgs = [];//"内容"
            mailEntity.items = items;//"附件物品"
            mailEntity.delHours = 24;//"操作后几小时删除"
            mailEntity.delTime = null;//"删除时间"
            mailEntity.expireTime = (new Date()).addDays(10);//"过期时间"
            mailEntity.isPicked = 0;//"是否提取物品"
            mailEntity.isRead = 0;//"是否阅读"
            mailEntity.addTime = new Date();
            tempList.push(mailEntity);
        }
        if(tempList.length<=0) return cb(null,0);
        mailDao.insertList(sClient, tempList, function (err, data) {
            if (err) return cb(err);
            cb(null,tempList.length);
        });
    });
};

scriptUtils.runAllServers(check);