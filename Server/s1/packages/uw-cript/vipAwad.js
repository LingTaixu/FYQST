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

var awardItems = {
    "12":{"10180":1},
    "13":{"10180":3},
    "14":{"10180":8},
    "15":{"10180":16},
    "16":{"10180":28},
    "17":{"10180":44},
    "18":{"10180":64},
    "19":{"10180":88},
    "20":{"10180":142}
};

var check = function(serverData,sClient,cb){
    userDao.listCols(sClient,"id,lvl,vip", " vip >= ?",[12],function(err,userList) {
        if (err) return cb(err);

        var max = 1000;//分1000一批插入
        var groupList = [];
        var tempCount = 0;
        var tempList = [];
        var title = 'VIP勋章补偿';
        var content = '新版本VIP奖励新增勋章，勋章补偿如下';
        for(var i = 0;i<userList.length;i++){
            var locUser = userList[i];
            var items = awardItems[locUser.vip];
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
