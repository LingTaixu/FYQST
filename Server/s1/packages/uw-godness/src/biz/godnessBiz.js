/**
 * Created by Administrator on 2015/9/16.
 */
var exports = module.exports; 
var commonUtils = require("uw-utils").commonUtils; 
var propUtils = require("uw-utils").propUtils; 
var async = require("async"); 
var g_data = require("uw-global").g_data; 
var uwData = require("uw-data");
var c_prop = uwData.c_prop;
var ds = require("uw-ds").ds;
var logger = require('uw-log').getLogger("uw-logger", __filename);
var c_msgCode = uwData.c_msgCode;
var consts = uwData.consts;
var getMsg = require("uw-utils").msgFunc(__filename);

var userDao = null;
var userBiz = null;
var userUtils = null;  
var godnessBiz = null;
var fightUtils = null;
var checkRequire = function(){
    userDao = userDao || require("uw-user").userDao;
    userBiz = userBiz || require("uw-user").userBiz;
    userUtils = userUtils || require("uw-user").userUtils; 
    godnessBiz = godnessBiz || require("uw-godness").godnessBiz;  
    fightUtils= fightUtils || require("uw-fight").fightUtils;  
};
 
// 女神之光结束，发送奖励
exports.godnessReward = function(client,rewardList,cb){
    checkRequire(); 
   // console.log("godnessReward",rewardList);
    logger.error("GodnessReward:",JSON.stringify(rewardList));
     var itemId = 55;  // B充电宝
     async.map(rewardList, function(reward, cb1) {
        var userId = reward[0];
        var num = reward[1];
        var items = {};
        items[itemId] = num;
        userDao.select(client, { id: userId }, function(err ,userData){
            userUtils.saveItems(userData, items, c_prop.itemGetTypeKey.godnessAct);
            var updateData = { 
                bag: userData.bag, 
                genuineQi: userData.genuineQi
            };
            logger.error("GodnessReward User:%s,%s",userId,num);
            userDao.update(client, updateData, { id: userId }, cb1);
        });
     }, function(err, data){
        cb(null,null);
     }) 
};

// 生成女神礼包
exports.godnessGift = function(client, userId, giftId, cb){
    g_data.addGodnessGift(userId, giftId); 
   // console.log("add godnessGift",userId,giftId, g_data.getGodnessGift(userId));
    cb(null, null);
};

// 玩家领取女神礼包
exports.getGodnessGift = function(client, userId, giftId, cb){
    checkRequire(); 
  
    if (!g_data.hasGodnessGift(userId, giftId)){
        return cb(getMsg(c_msgCode.giftLose));//礼包已失效
    }
     
    // 有一次奖励的机会
    g_data.deleteGodnessGift(userId, giftId);
    logger.error("GodnessGift User:%s,%s",userId,giftId);
     userDao.select(client,{id:userId},function(err, userData){
        var rewardId = 2000;  // 写死
        var tmpLoots = fightUtils.getLootItems(rewardId);
        var tmpArray = {};
         for(var j = 0; j < tmpLoots.length; j++){
            tmpArray[tmpLoots[j][0]] = tmpArray[tmpLoots[j][0]] || 0;
            tmpArray[tmpLoots[j][0]] = tmpLoots[j][1];
         } 

        var bagItems = {};
        var itemsArr = userUtils.saveItems(userData, tmpArray, c_prop.itemGetTypeKey.godnessGift);
        if(Object.keys(itemsArr[0]).length>0) bagItems = propUtils.mergerProp(bagItems,itemsArr[0]);
        var updateData = {  
            bag:userData.bag
        };

         userDao.update(client,updateData,{id:userId},function(err, data){
            if (err) return cb(err);
            delete updateData.bag;
            return cb(null, [updateData, bagItems]);
         });

     });
};
