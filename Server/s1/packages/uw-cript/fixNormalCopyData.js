var async = require("async");
var userDao = require("uw-user").userDao;
var copyProgressDao = copyProgressDao || require('uw-copy').copyProgressDao;
var scriptUtils = require("./scriptUtils");
var commonUtils = require("uw-utils").commonUtils;
/*
 *   修复推图挂机关卡数据    改成了第一关ID是 100001
 */

var check = function(serverData, sClient, cb) {
    copyProgressDao.list(sClient, " copyObj != '{}' AND copyObj IS NOT NULL AND copyType = 0", [], function(err, dataList) {
        if (err) return cb(err);
        async.map(dataList, function(copyData, cb1) {
            var copyObj = copyData.copyObj;
            var isPickAward = copyData.isPickAward || [0];
            var copyId = null;
            if (commonUtils.getLastKey(copyObj)) copyId = parseInt(commonUtils.getLastKey(copyObj));
            if (!copyId) return cb1(null);
            var needUp = false;
            var updateData = {};
            var newId = _toNewCopyId(copyId);
            if (newId != copyId) {
            	needUp = true;
            	copyObj = {};
            	copyObj[newId] = 1;
            	updateData.copyObj = copyObj;
            }
            
            if(isPickAward && isPickAward[0]){
            	var newId = _toNewCopyId(isPickAward[0]);
            	// console.error('isPickAward[0] ===> newId:',isPickAward[0],newId);
            	if (newId != isPickAward[0]) {
            		needUp = true;
            		isPickAward[0] = newId;
            		updateData.isPickAward = isPickAward;
            	}
            }

            if (!needUp) {
                // console.error("=======copyData:",copyData,"不需要更新======="); 
                return cb1(null);
            }

            copyProgressDao.update(sClient, updateData, { id: copyData.id }, function(err, data) {
                if (err) return cb1(err);
                return cb1(null);
            });
        }, function(err, data) {
            if (err) return cb(err);
            return cb(null);
        });
    });
};
var _toNewCopyId = function(oldId) {
	oldId = oldId*1;
    var newId = oldId;
    if (oldId >= 1 && oldId <= 999) {
        newId = oldId + 100000;
    } else if (oldId >= 10001 && oldId <= 14402) {
        newId = oldId - 9001 + 100000;
    }
    return newId;
}

scriptUtils.runAllServers(check);
//scriptUtils.runByServerIds([1],check);