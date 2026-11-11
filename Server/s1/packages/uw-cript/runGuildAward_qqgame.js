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
var MailEntity =  require("uw-entity").MailEntity;
var exports = module.exports;
var guildWarRecordDao = require("uw-guild-war").guildWarRecordDao;


var awardQQGameCfg  = [[192,19],[195,1],[199,16]];//[[serverId,行会id]]
var itemsCfg = {
    "7":{"1481":25,"1426":25,"1517":50,"320":100},
    "19":{"1481":50,"1426":50,"1517":100,"320":200},
    "1":{"1481":30,"1426":30,"1516":60,"321":120},
    "16":{"1481":40,"1426":40,"1516":80,"321":160}
};

/*
 圣灵206服	战神殿	升星石中宝箱 	25	1481
 206	7	白银特戒箱   	25	1426
 碎片宝箱（中）	50	1517
 紫色羽毛箱 	100	320

 QQ游戏大厅53服	傲视九重天	升星石中宝箱 	50	1481
 192	19	白银特戒箱   	50	1426
 碎片宝箱（中）	100	1517
 紫色羽毛箱 	200	320

 QQ游戏大厅56服	傲视ん天下	升星石中宝箱	30	1481
 195	1	白银特戒箱   	30	1426
 碎片宝箱（大）	60	1516
 橙色羽毛箱	120	321

 QQ游戏大厅59服	称霸五十九	升星石中宝箱	40	1481
 199	16	白银特戒箱   	40	1426
 碎片宝箱（大）	80	1516
 橙色羽毛箱	160	321

 */
var curServerArrCfg = awardQQGameCfg;
var check = function(serverData,sClient,cb){
    var curGuildId = 0;
    for(var i = 0;i<curServerArrCfg.length;i++){
        var locServerCfg = curServerArrCfg[i];
        if(locServerCfg[0]==serverData.serverId){
            curGuildId = locServerCfg[1];
            break;
        }
    }

    if(!curGuildId) return cb(null,0);

    guildWarRecordDao.selectCols(sClient,"id,recordData"," 1=1 order by recordTime desc",[],function(err,data){
        if(err) return cb(err);
        if(!data) return cb(null,0);
        if(!data.recordData) return  cb(null,0);
        var serverGuildWarObj = data.recordData[serverData.serverId];
        if(!serverGuildWarObj) return  cb(null,0);
        var _guildWarUserDic =  serverGuildWarObj._guildWarUserDic||{};
        var tempList = [];

        //发送行会参与奖
        for(var key in _guildWarUserDic){
            var locUserWar = _guildWarUserDic[key];
            if(locUserWar.guildId!=curGuildId) continue;
            var locGuildWarItems = itemsCfg[curGuildId];

            if(!locGuildWarItems) continue;
            //发送邮件
            var mailEntity = new MailEntity();
            mailEntity.userId = locUserWar.userId;//"用户id"
            mailEntity.type = 0;//"类型"
            mailEntity.fromName = "系统消息";//"发送者"
            mailEntity.title = "组别调整奖励";//"标题"
            mailEntity.content = "组别调整奖励";//"内容"
            mailEntity.replaceArgs = [];//"内容"
            mailEntity.items = locGuildWarItems;//"附件物品"
            mailEntity.delHours = 24;//"操作后几小时删除"
            mailEntity.delTime = null;//"删除时间"
            mailEntity.expireTime = (new Date()).addDays(5);//"过期时间"
            mailEntity.isPicked = 0;//"是否提取物品"
            mailEntity.isRead = 0;//"是否阅读"
            mailEntity.addTime = new Date();
            tempList.push(mailEntity);
        }

        if (tempList.length <= 0) return cb(null,0);
        mailDao.insertList(sClient, tempList, function (err, data) {
            if (err) return cb(err);
            cb(null,tempList.length);
        });

    });
};


scriptUtils.runAllServers(check);
