var async = require("async"); 
var taskDao = require("uw-task").taskDao;
var userDao = require("uw-user").userDao;
var gameRecordDao = require("uw-game-record").gameRecordDao;
var scriptUtils = require("./scriptUtils");

/*
*   修复每日 
*/
var check = function(serverData, sClient, cb) { 
    gameRecordDao.list(sClient, " recordTime = ?", [new Date().clearTime()], function(err, recList) {
        if (err) return cb(err);
        async.map(recList, function(gameRecordData, cb1) {
        	var id = gameRecordData.id;

            var costDiamondRecord = gameRecordData.costDiamondRecord;
            for(var costType in costDiamondRecord){
                if (typeof costDiamondRecord[costType] == "string"){
                    console.error("costDiamondRecord : ",costDiamondRecord[costType]);
                    costDiamondRecord[costType] = 5000;
                }
            }
            gameRecordData.costDiamondRecord = costDiamondRecord;

            var costGoldRecord = gameRecordData.costGoldRecord;
            for(var costType in costGoldRecord){
                if (typeof costGoldRecord[costType] == "string"){
                    console.error("costGoldRecord : ",costGoldRecord[costType]);
                    costGoldRecord[costType] = 50000;
                }
            }

            var getDiamondRecord = gameRecordData.getDiamondRecord;
            for(var costType in getDiamondRecord){
                if (typeof getDiamondRecord[costType] == "string"){
                    console.error("getDiamondRecord : ",getDiamondRecord[costType]);
                    getDiamondRecord[costType] = 1000;
                }
            }

            var updateData = {
                costDiamondRecord:costDiamondRecord,
                costGoldRecord:costGoldRecord,
                getDiamondRecord:getDiamondRecord
            };
            gameRecordDao.update(sClient, updateData,{id:id}, function(err) {
            	if (err) return cb1(err);
            	return cb1(null);   
            });
        }, function(err, data) {
            if (err) return cb(err);
            return cb(null);
        });
    });
};
 
scriptUtils.runByServerIds([1],check);
