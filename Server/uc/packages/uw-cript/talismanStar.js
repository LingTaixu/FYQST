/**
 * Created by Sara on 2016/3/31.
 */
var mainClient =  require("uw-db").mainClient;
var MailEntity = require("uw-entity").MailEntity;
var mailDao = require("uw-mail").mailDao;
var mailBiz = require("uw-mail").mailBiz;
var heroDao = require("uw-hero").heroDao;
var uwData= require("uw-data");
var t_talismanStar = uwData.t_talismanStar;

var async = require("async");
var exports = module.exports;var scriptUtils = require("./scriptUtils");

var check = function(serverData,sClient,cb){
    //if(serverData.status != 1)  return cb(null,0);
    heroDao.listCols(sClient, "id,userId,talismanData", " talismanData IS NOT NULL AND talismanData != '{}'",[], function(err,heroList){
        if(err) return cb(err);
        var userObj = {};
        for(var i = 0; i < heroList.length; i++){
            var heroData = heroList[i];
            var userId = heroData.userId;
            var talismanData = heroData.talismanData;       //法宝数据{法宝id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...},临时资质],法宝id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...},临时资质],....}
            if(!userObj[userId]) userObj[userId] = {};
            for(var key in talismanData){
                var star = parseInt(talismanData[key][3])||0;
                if(star >= 1){
                    star -= 1;
                    for(var j = 0; j <= star; j++){
                        var needItems = t_talismanStar[(parseInt(key) + parseInt(j))].needItems;
                        if(needItems[0] && needItems[0][0]){
                            var itemId = needItems[0][0];
                            var count = parseInt(needItems[0][1]);
                            if(count >= 5000) count = count/100;

                            if(!userObj[userId][itemId]) userObj[userId][itemId] = 0;
                            userObj[userId][itemId] += parseInt(count*99*1.2);
                        }
                    }
                }
            }
        }
        var tempList = [];var mailList = [];
        var max = 1000;//分1000一批插入
        var tempCount = 0;
        for(var key in userObj){
            if(Object.keys(userObj[key]).length>0){
                //发送邮件
                var mailEntity = new MailEntity();
                mailEntity.userId = key;//"用户id"
                mailEntity.type = 0;//"类型"
                mailEntity.fromName = "系统消息";//"发送者"
                mailEntity.title = "法宝升星凌云石补偿";//"标题"
                mailEntity.content = "法宝升星凌云石补偿";//"内容"
                mailEntity.replaceArgs = [];//"内容"
                mailEntity.items = userObj[key];//"附件物品"
                mailEntity.delHours = 1;//"操作后几小时删除"
                mailEntity.delTime = null;//"删除时间"
                mailEntity.expireTime = (new Date()).addDays(10);//"过期时间"
                mailEntity.isPicked = 0;//"是否提取物品"
                mailEntity.isRead = 0;//"是否阅读"
                mailEntity.addTime = new Date();
                tempList.push(mailEntity);

                if(tempCount>=max){
                    tempCount = 0;
                    mailList.push(tempList.concat([]));
                    tempList.length =0;
                }
                tempCount++;
            }
        }
        if(tempList.length >0){
            mailList.push(tempList.concat([]));
        }
        async.mapLimit(mailList,1, function (mail, cb1) {
            mailBiz.addMailByList(sClient,mail,cb1);
        }, function(err,data){
            if(err) return cb(err);
            cb(null,tempList.length);
        });
    });
};

scriptUtils.runAllServers(check);


