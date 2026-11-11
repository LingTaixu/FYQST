/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Sara on 2015/11/12.
 */
var mainClient =  require("uw-db").mainClient;
var mailBiz = require("uw-mail").mailBiz;
var userDao = require("uw-user").userDao;
var MailEntity = require("uw-entity").MailEntity;

var async = require("async");
var exports = module.exports;var scriptUtils = require("./scriptUtils");

var check = function(serverData,sClient,cb){
    userDao.listCols(sClient,"id,lvl", " sdkChannelId = ?",[100191],function(err,userList) {
        if (err) return cb(err);

        var max = 1000;//分1000一批插入
        var groupList = [];
        var tempCount = 0;
        var tempList = [];
        var title = '登录补偿';
        var content = '登录补偿';
        for(var i = 0;i<userList.length;i++){
            var locUser = userList[i];
            var items = {"200":500,"2":5};
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
