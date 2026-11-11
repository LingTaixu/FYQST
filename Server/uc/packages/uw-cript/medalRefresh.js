/**
 * Created by Sara on 2016/3/31.
 */
var mainClient =  require("uw-db").mainClient;
var MailEntity = require("uw-entity").MailEntity;
var mailDao = require("uw-mail").mailDao;
var mailBiz = require("uw-mail").mailBiz;

var async = require("async");
var exports = module.exports;var scriptUtils = require("./scriptUtils");

var check = function(serverData,sClient,cb){
    //if(serverData.status != 1)  return cb(null,0);
    var userXlsx = {"1":{"id":1,"serverId":22,"userId":2679,"itemsId":{"10200":1,"10210":10,"10220":101}},"2":{"id":2,"serverId":9,"userId":2303,"itemsId":{"10210":10,"10220":101}},"3":{"id":3,"serverId":22,"userId":2705,"itemsId":{"10210":10,"10220":101}},"4":{"id":4,"serverId":26,"userId":2565,"itemsId":{"10210":10,"10220":101}},"5":{"id":5,"serverId":1,"userId":8522,"itemsId":{"10210":10,"10220":101}},"6":{"id":6,"serverId":9,"userId":2368,"itemsId":{"10210":10,"10220":101}},"7":{"id":7,"serverId":9,"userId":3211,"itemsId":{"10210":10,"10220":101}},"8":{"id":8,"serverId":22,"userId":2284,"itemsId":{"10210":10,"10220":101}},"9":{"id":9,"serverId":23,"userId":2883,"itemsId":{"10210":10,"10220":101}},"10":{"id":10,"serverId":9,"userId":2545,"itemsId":{"10210":10,"10220":101}},"11":{"id":11,"serverId":1,"userId":8609,"itemsId":{"10220":101}},"12":{"id":12,"serverId":21,"userId":4865,"itemsId":{"10220":101}},"13":{"id":13,"serverId":20,"userId":2853,"itemsId":{"10220":101}},"14":{"id":14,"serverId":20,"userId":3577,"itemsId":{"10220":101}},"15":{"id":15,"serverId":26,"userId":2381,"itemsId":{"10220":101}},"16":{"id":16,"serverId":1,"userId":6973,"itemsId":{"10220":101}},"17":{"id":17,"serverId":9,"userId":3884,"itemsId":{"10220":101}},"18":{"id":18,"serverId":21,"userId":4550,"itemsId":{"10220":101}},"19":{"id":19,"serverId":1,"userId":4462,"itemsId":{"10220":101}},"20":{"id":20,"serverId":21,"userId":2365,"itemsId":{"10220":101}},"21":{"id":21,"serverId":9,"userId":5973,"itemsId":{"10220":101}},"22":{"id":22,"serverId":9,"userId":7702,"itemsId":{"10220":101}},"23":{"id":23,"serverId":9,"userId":7501,"itemsId":{"10220":101}},"24":{"id":24,"serverId":9,"userId":8373,"itemsId":{"10220":101}},"25":{"id":25,"serverId":23,"userId":2478,"itemsId":{"10220":101}},"26":{"id":26,"serverId":1,"userId":8312,"itemsId":{"10220":101}},"27":{"id":27,"serverId":22,"userId":3749,"itemsId":{"10220":101}},"28":{"id":28,"serverId":9,"userId":4482,"itemsId":{"10220":101}},"29":{"id":29,"serverId":26,"userId":2286,"itemsId":{"10220":101}},"30":{"id":30,"serverId":1,"userId":8899,"itemsId":{"10220":101}},"31":{"id":31,"serverId":9,"userId":8534,"itemsId":{"10220":101}},"32":{"id":32,"serverId":1,"userId":10647,"itemsId":{"10220":101}},"33":{"id":33,"serverId":19,"userId":2336,"itemsId":{"10220":101}},"34":{"id":34,"serverId":1,"userId":5862,"itemsId":{"10220":101}},"35":{"id":35,"serverId":1,"userId":8669,"itemsId":{"10220":101}},"36":{"id":36,"serverId":21,"userId":2403,"itemsId":{"10220":101}},"37":{"id":37,"serverId":9,"userId":3340,"itemsId":{"10220":101}},"38":{"id":38,"serverId":25,"userId":3215,"itemsId":{"10220":101}},"39":{"id":39,"serverId":1,"userId":14445,"itemsId":{"10220":101}},"40":{"id":40,"serverId":9,"userId":8512,"itemsId":{"10220":101}},"41":{"id":41,"serverId":1,"userId":13155,"itemsId":{"10220":101}},"42":{"id":42,"serverId":9,"userId":8229,"itemsId":{"10220":101}},"43":{"id":43,"serverId":9,"userId":8181,"itemsId":{"10220":101}},"44":{"id":44,"serverId":9,"userId":9885,"itemsId":{"10220":101}},"45":{"id":45,"serverId":25,"userId":2281,"itemsId":{"10220":101}},"46":{"id":46,"serverId":25,"userId":2367,"itemsId":{"10220":101}},"47":{"id":47,"serverId":25,"userId":2482,"itemsId":{"10220":101}},"48":{"id":48,"serverId":1,"userId":6770,"itemsId":{"10220":101}},"49":{"id":49,"serverId":1,"userId":15106,"itemsId":{"10220":101}},"50":{"id":50,"serverId":1,"userId":19455,"itemsId":{"10220":101}},"51":{"id":51,"serverId":21,"userId":2392,"itemsId":{"10220":50}},"52":{"id":52,"serverId":9,"userId":6040,"itemsId":{"10220":50}},"53":{"id":53,"serverId":20,"userId":2511,"itemsId":{"10220":50}},"54":{"id":54,"serverId":26,"userId":2344,"itemsId":{"10220":50}},"55":{"id":55,"serverId":25,"userId":2386,"itemsId":{"10220":50}},"56":{"id":56,"serverId":22,"userId":6070,"itemsId":{"10220":50}},"57":{"id":57,"serverId":19,"userId":2295,"itemsId":{"10220":50}},"58":{"id":58,"serverId":1,"userId":15970,"itemsId":{"10220":50}},"59":{"id":59,"serverId":25,"userId":2290,"itemsId":{"10220":50}},"60":{"id":60,"serverId":25,"userId":6392,"itemsId":{"10220":50}},"61":{"id":61,"serverId":1,"userId":8048,"itemsId":{"10220":50}},"62":{"id":62,"serverId":9,"userId":2801,"itemsId":{"10220":50}},"63":{"id":63,"serverId":25,"userId":2488,"itemsId":{"10220":50}},"64":{"id":64,"serverId":25,"userId":4874,"itemsId":{"10220":50}},"65":{"id":65,"serverId":24,"userId":2392,"itemsId":{"10220":50}}};
    var tempList = [];var mailList = [];
    var max = 1000;//分1000一批插入
    var tempCount = 0;
    for(var key in userXlsx){
        var userObj = userXlsx[key];
        if(userObj.serverId==serverData.serverId){
            var items = userObj.itemsId;
            var userId = userObj.userId;
            //发送邮件
            var mailEntity = new MailEntity();
            mailEntity.userId = userId;//"用户id"
            mailEntity.type = 0;//"类型"
            mailEntity.fromName = "系统消息";//"发送者"
            mailEntity.title = "杀戮之夜活动奖励";//"标题"
            mailEntity.content = "杀戮之夜活动奖励";//"内容"
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
};

scriptUtils.runAllServers(check);


