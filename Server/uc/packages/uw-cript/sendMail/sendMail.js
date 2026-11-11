/**
 * Created by Administrator on 2016/1/5.
 */
var arguments = process.argv.splice(2);
var sIndex = arguments[0];
var project = require("uw-config").project;
var mailDataArr = require("./s"+project.serverId+".json");

var mailBiz = require("uw-mail").mailBiz;
var mailDao = require("uw-mail").mailDao;
var MailEntity = require("uw-entity").MailEntity;
var uwClient = require("uw-db").uwClient;
var uwData= require("uw-data");
var c_prop = uwData.c_prop;

var sendMail = function(cb){
    var insertList = [];
    var title = '饿了么充值返利发放';
    var content = '饿了么充值返利发放';
    for(var i = 0;i<mailDataArr.length;i++){
        var locData = mailDataArr[i];
        var locUserId = locData[0];
        var items = locData[1];
/*
        var locItem = {};
        locItem[c_prop.spItemIdKey.diamond] = locDiamond;
*/

        var mailEntity = new MailEntity();
        mailEntity.userId = locUserId;//"用户id"
        mailEntity.type = 0;//"类型"
        mailEntity.fromName = "系统消息";//"发送者"
        mailEntity.title = title;//"标题"
        mailEntity.content = content;//"内容"
        mailEntity.replaceArgs = [];//"内容"
        mailEntity.items = items;//"附件物品"
        mailEntity.delHours = 0;//"操作后几小时删除"
        mailEntity.delTime = null;//"删除时间"
        mailEntity.expireTime = (new Date()).addDays(10);//"过期时间"
        mailEntity.isPicked = 0;//"是否提取物品"
        mailEntity.isRead = 0;//"是否阅读"
        mailEntity.addTime = new Date();

        insertList.push(mailEntity);
    }
    mailDao.insertList(uwClient, insertList, function (err, data) {
        if (err) return cb(err);
        cb(null,insertList.length);
    });
};

sendMail(function(err,data){
    if(err) {
        console.error("执行失败!")
        console.error(err);
    }else {
        console.log("执行完毕!");
        console.log("一共[%s]条数据!",data);
    }
    setTimeout(function(){
        process.exit(0);
    },100);
});

