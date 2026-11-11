/**
 * Created by Sara on 2015/11/12.
 */
var userDao = require("uw-user").userDao;
var accountDao = require("uw-account").accountDao;
var uwData = require("uw-data");
var c_prop = uwData.c_prop;
var uwClient = require("uw-db").uwClient;
var mainClient = require("uw-db").mainClient;
var async = require("async");
var exports = module.exports;

exports.check = function(cb){
    // var userIds = require("./userIds.json");
    // userDao.listCols(uwClient,"id,equipBag,bag,diamond,gold"," id in (?) ",[userIds],function(err,userList){
    //     if(err) return console.log(err);
    //     async.map(userList,function(userData,cb1){
    //         //35	终级经验丹
    //         //30	羽毛
    //         //10	攻击宝石
    //         //19	升星石
    //         //18	强化石

    //         /*
    //          金币：90870000
    //          元宝：43980
    //          羽毛：3150
    //          强化石：1725
    //          传承武器ID：700023   700024  700025
    //          */
    //         //金币保底 100000 元宝200 羽毛保底 50 强化石不保底 传承武器全扣掉

    //         if(userData.gold>100000){
    //             userData.gold -= 90870000;
    //             if(userData.gold<100000) userData.gold = 100000;
    //         }

    //         if(userData.diamond>200){
    //             userData.diamond -= 43980;
    //             if(userData.diamond<200) userData.diamond = 200;
    //         }

    //         _delBag(userData.bag,30,3150,50);
    //         //_delBag(userData.bag,35,999,100);
    //         _delBag(userData.bag,18,1725,0);
    //         //_delBag(userData.bag,19,1200,100);

    //         _delEquipBag(userData.equipBag,700023);
    //         _delEquipBag(userData.equipBag,700024);
    //         _delEquipBag(userData.equipBag,700025);

    //         userDao.update(uwClient,{diamond:userData.diamond,bag:userData.bag,equipBag:userData.equipBag},{id: userData.id},cb1);
    //     },function(err,data){
    //         if (err) return console.log(err);
    //         console.log("执行完毕!");
    //         console.log("一共[%s]条数据!",userList.length);
    //     });
    // });
};

var _delBag = function(bag,itemId,num,min){
    min = min ||0;
    var ownItemCount = bag[itemId]||0;
    if(min&&ownItemCount<min) return;
    var reItemCount = ownItemCount - num;
    if(min){
        if(reItemCount<min){
            reItemCount = min;
        }
    }
    bag[itemId] = reItemCount;

    if (reItemCount <= 0) delete bag[itemId];
    return bag;
};

var _delEquipBag = function(equipBag,itemId){
    for(var key in equipBag){
        var locEquipData = equipBag[key];
        var locItemId = locEquipData[0];
        var locIsUse = locEquipData[3];
        if(locIsUse) continue;
        if(locItemId==itemId){
            delete equipBag[key];
        }
    }
    return equipBag;
};

exports.check();