/**
 * Created by Sara on 2016/7/2.
 */
var mainClient =  require("uw-db").mainClient;
var mailBiz = require("uw-mail").mailBiz;
var userDao = require("uw-user").userDao;
var MailEntity = require("uw-entity").MailEntity;

var async = require("async");
var exports = module.exports;var scriptUtils = require("./scriptUtils");

var awardItems = {
    "6":{"109000":1,"209000":1,"309000":1},
    "7":{"320":70,"109000":1,"209000":1,"309000":1},
    "8":{"11":100,"12":100,"17":100,"320":70,"109000":1,"209000":1,"309000":1},
    "9":{"110000":1,"52":20000,"10990":1,"11":100,"12":100,"17":100,"320":70,"109000":1,"209000":1,"309000":1},
    "10":{"210000":1,"110000":1,"52":20000,"10990":1,"11":100,"12":100,"17":100,"320":70,"109000":1,"209000":1,"309000":1},
    "11":{"310000":1,"56":20000,"210000":1,"110000":1,"52":20000,"10990":1,"11":100,"12":100,"17":100,"320":70,"109000":1,"209000":1,"309000":1},
    "12":{"116000":1,"216000":1,"316000":1,"310000":1,"56":20000,"210000":1,"110000":1,"52":20000,"10990":1,"11":100,"12":100,"17":100,"320":70,"109000":1,"209000":1,"309000":1}
};

var check = function(serverData,sClient,cb){
    userDao.listCols(sClient,"id,vip", " vip >= 6 and vip <= 12",[],function(err,userList) {
        if (err) return cb(err);

        var max = 1000;//分1000一批插入
        var groupList = [];
        var tempCount = 0;
        var tempList = [];
        var title = 'VIP补偿';
        var content = '新版本VIP奖励补偿如下';
        for(var i = 0;i<userList.length;i++){
            var locUser = userList[i];
            var items = awardItems[locUser.vip];
            if(items){
                //发送邮件
                var mailEntity = new MailEntity();
                mailEntity.userId = locUser.id;//"用户id"
                mailEntity.type = 0;//"类型"
                mailEntity.fromName = "系统消息";//"发送者"
                mailEntity.title = title;//"标题"
                mailEntity.content = content;//"内容"
                mailEntity.replaceArgs = [];//"内容"
                mailEntity.items = items;//"附件物品"
                mailEntity.delHours = 1;//"操作后几小时删除"
                mailEntity.delTime = null;//"删除时间"
                mailEntity.expireTime = (new Date()).addDays(10);//"过期时间"
                mailEntity.isPicked = 0;//"是否提取物品"
                mailEntity.isRead = 0;//"是否阅读"
                mailEntity.addTime = new Date();
                tempList.push(mailEntity);

                if(tempCount>=max){
                    tempCount = 0;
                    groupList.push(tempList.concat([]));
                    tempList.length =0;
                }
                tempCount++;
            }
        }
        if(tempList.length >0){
            groupList.push(tempList.concat([]));
        }

        async.mapLimit(groupList,1, function (group, cb1) {
            mailBiz.addMailByList(sClient,group,cb1);
        }, function(err,data){
            if(err) return cb(err);
            cb(null,userList.length);
        });
    });
};

scriptUtils.runAllServers(check);
