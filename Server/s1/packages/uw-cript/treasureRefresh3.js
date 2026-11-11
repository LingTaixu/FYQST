/**
 * Created by John on 2016/4/28.
 */
var userDao = require("uw-user").userDao;;
var treasureRecordDao= require("uw-treasure").treasureRecordDao;
var treasureDao = require("uw-treasure").treasureDao;
var treasureBiz = require("uw-treasure").treasureBiz;
var TreasureEntity = require("uw-entity").TreasureEntity;
var uwData = require("uw-data");
var c_prop = uwData.c_prop;
var t_item = uwData.t_item;
var t_treasure = uwData.t_treasure;
var async = require("async");
var exports = module.exports;
var scriptUtils = require("./scriptUtils");
var g_incognito = require("uw-global").g_incognito;
var mailBiz = require("uw-mail").mailBiz;
var check = function(serverData,sClient,cb) {
    treasureRecordDao.listCols(sClient, "userId", "recordType IN (1,2) GROUP BY userId ",[], function(err, userIdList){
        if(err) return cb(err);
        async.mapLimit(userIdList,50,function(userIdArr, cb1){
            var userId = userIdArr.userId;
            async.parallel([
                function(cb2){
                    userDao.selectCols(sClient, "id,bag", "id = ?",[userId], cb2);
                },
                function(cb2){
                    treasureDao.listCols(sClient, "userId, treasureId", "isDelete = 0 and userId = ?", [userId], cb2)
                }
            ], function(err, data){
                if(err) return cb1(err);
                var userData = data[0];
                var treasureList = data[1];
                if(!userData){
                    return cb1(null, 0);
                }
                var treasureMap = {};
                var treasurelength = 0;
                if(treasureList){
                    treasurelength = treasureList.length;
                }
                for(var i=0; i<treasurelength; i++){
                    var num = treasureMap[treasureList[i].treasureId] || 0;
                    treasureMap[treasureList[i].treasureId] = num + 1;
                }
                var bag = userData.bag;
                var delBag = {};
                for(var key in bag){
                    var itemId = parseInt(key);
                    if(itemId > 6000 && itemId < 7000){
                        var insertList = [];
                        var treasureNum = treasureMap[itemId] || 0;
                        var num = bag[key] - treasureNum;
                        if(num > 0){
                            _compose(sClient, itemId, num, userId);
                        }
                        delBag[key] = num;
                    }
                }
                var delNum = 0;
                for(var key in delBag){
                    var locNum = userData.bag[key];
                    locNum -= delBag[key];
                    if(locNum <= 0) {
                        delete userData.bag[key];
                    }else {
                        userData.bag[key] = locNum;
                    }
                    delNum++;
                }
                if(!delNum){
                    return cb1(null, 0);
                }
                var updateUser = {
                    bag: userData.bag
                }
                userDao.update(sClient, updateUser,{id:userId},function(err, data){
                    if(err) return cb1(err);
                    cb1(null, 1);
                });
            })
        },function(err, up){
            if(err) return cb(err);
            var num = 0;
            for(var index in up){
                num += up[index];
            }
            cb(null, num)
        });
    });
};

var _cloneOBj = function(obj) {
    var newO = {};
    if(obj instanceof Array){
        newO = [];
    }
    for(var key in obj){
        var val = obj[key];
        newO[key] = typeof val === 'object' ? arguments.callee(val) : val;
    }
    return newO;
};

var _compose = function(client,itemId, num, userId){
    var itemIdArr = t_treasure[itemId].items;
    var needNum = 0;
    var chestId = 0;
    while(num > 0) {
        for (var i = 0; i < itemIdArr.length; i++) {
            needNum = itemIdArr[i][0];
            if (num >= needNum) {
                num -= needNum;
                var items = {};
                chestId = itemIdArr[i][1];
                items[chestId] = 1;
                mailBiz.addByType(client, userId, c_prop.mailTypeKey.treasureOpen, [t_item[chestId].name], items, function (err, mailData) {
                    if (err) console.log(err);
                });
                break
            }
        }
    }
}

scriptUtils.runAllServers(check);