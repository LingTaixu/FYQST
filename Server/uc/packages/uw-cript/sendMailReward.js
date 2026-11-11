/**
 * Created by Administrator on 2016/2/16.
 */
//var mainClient =  require("uw-db").mainClient;
var async = require("async");
var mailBiz = require("uw-mail").mailBiz;
var userDao = require("uw-user").userDao;
var MailEntity = require("uw-entity").MailEntity;
var uwClient = require("uw-db").uwClient;

var awardItems = {
    "18":"1000",
    "99":"100000",
    "1807":"1"
};
// var awardItems = {
//         "200":1000
//     };
var check = function(uwClient,cb){
    userDao.listCols(uwClient,"id,lvl", " robotId = 0 ",[],function(err,userList) {
        if (err) return cb(err);

        var max = 1000;//分1000一批插入
        var groupList = [];
        var tempCount = 0;
        var tempList = [];
          var title = '2018.01.11服务器更新公告';
          var content = '亲爱的玩家大人：\
  我们刚刚完成了对服务器的升级，【重点】优化了游戏性能,送上一份薄礼，祝您游戏愉快！！';
       // var title = "庆祝绯雨上线一周";
       // var content = '感谢您一直以来的大力支持，为了庆祝游戏上线一周，特发1000钻石表达谢意~';

        for(var i = 0;i<userList.length;i++){
            var locUser = userList[i];
            console.log("sendReward to user:", locUser.id, locUser.lvl);
            var items = awardItems;
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
            mailBiz.addMailByList(uwClient,group,cb1);
        }, function(err,data){
            if(err) return cb(err);
            cb(null,userList.length);
        });
    });
};

check(uwClient, function(err, data){
    console.log("sendMailReward finish!",data);
    process.exit(0);
});
 

