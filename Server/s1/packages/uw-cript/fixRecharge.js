/**
 * Created by Administrator on 2016/2/16.
 */
//var mainClient =  require("uw-db").mainClient;
var async = require("async");
var mainClient = require("uw-db").mainClient;
var rechargeRequestDao = require("uw-recharge").rechargeRequestDao;
var RechargeRequestEntity = require("uw-entity").RechargeRequestEntity;
var MailEntity = require("uw-entity").MailEntity;
var uwClient = require("uw-db").uwClient;
var uwData =  require("uw-data");
var c_recharge = uwData.c_recharge;
 
var check = function(uwClient,cb){
    rechargeRequestDao.list(mainClient," status in (0,1,2)",[],function(err,rechargeList) {
        if (err) return cb(err);
        for(var i=0;i<rechargeList.length;i++){
            var locData = rechargeList[i];
            var id = locData.id;
            var goodsId = locData.goodsId;
            var goodsPrice = c_recharge[goodsId].cost;
            var feeMoney = goodsPrice*100;//分
            if(locData.status == 0)feeMoney =0;
            var updateData = {
                goodsPrice:goodsPrice,
                feeMoney:feeMoney
            }
            rechargeRequestDao.update(mainClient,updateData,{ id: id },function(err,data){
                if(err) return cb(err);
                console.log(new Date());
                console.log('更新uw_recharge_request',id,'goodsPrice',goodsPrice,'feeMoney',feeMoney);
                cb(null,data);
            });
        }
        
    }); 
};

check(uwClient, function(err, data){
    console.log("fixRecharge finish!");
    //process.exit(0);
});
 

