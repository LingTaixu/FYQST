/**
 * Created by Administrator on 2014/5/16.
 */

var async = require("async");
var getMsg = require("uw-utils").msgFunc(__filename);
var gameCommonDao = require("./../dao/gameCommonDao");
var GameCommonEntity = require('uw-entity').GameCommonEntity;
var uwData = require("uw-data");
var t_copy = uwData.t_copy;
var c_prop = uwData.c_prop;
var exports = module.exports;

var chatBiz;
var g_fakeData;
var checkRequire = function(){
    chatBiz = chatBiz || require("uw-chat").chatBiz;
    g_fakeData = g_fakeData || require('uw-global').g_fakeData;
};

//计算最高副本
exports.calHighCopyId = function(client, userName,copyId ,cb){
    checkRequire();
    exports.getInfo(client,function(err,commonData){
        if(err) return cb(err);
        if(commonData.highCopyId>=copyId) return cb(null);
        commonData.highCopyId = copyId;
        var copyName = t_copy[copyId].name;
        //第一个%s：玩家名
        //第二个%s：普通副本名
        chatBiz.addSysData(15,[userName,copyName,copyId]);
        gameCommonDao.update(client, {highCopyId: commonData.highCopyId}, {id: commonData.id}, cb);
    });
};

/**
 * 获取数据
 * @param client
 * @param cb
 */
exports.getInfo = function (client, cb) {
    gameCommonDao.select(client, "1=1",[], function (err, commonData) {
        if (err) return cb(err);
        if (commonData) return cb(null, commonData);
        var commonEntity = new GameCommonEntity();
        gameCommonDao.insert(client, commonEntity, function (err, data) {
            if (err) return cb(err);
            commonEntity.id = data.insertId;
            cb(null, commonEntity);
        });
    });
};

/**
* 增加 addNum 假数据
*/
exports.updateFakeData = function(client, fakeType, addNum,cb){
    checkRequire();
    exports.getInfo(client,function(err,commonData){
        if(err) return cb(null); // 不返回错误 
        if (fakeType == c_prop.fakeDataTypeKey.payDSGiftNum || fakeType == c_prop.fakeDataTypeKey.payTmFundNum ){
            _addFakeData(commonData,c_prop.fakeDataTypeKey.payUserNum, addNum);
        }
        _addFakeData(commonData,fakeType, addNum);

        g_fakeData.updateFakeDataCache(commonData.fakeData);
        gameCommonDao.update(client, {fakeData: commonData.fakeData}, {id: commonData.id}, function(){});
        cb(null);
    });
};
 
// 给cron的调用函数
exports.cronUpdateFakeData = function(client, fakeArr, cb){
    checkRequire();
    exports.getInfo(client,function(err,commonData){
        if(err) return cb(err);
        for (var i = 0; i < fakeArr.length; ++i){   
            // 随机增加值
            var addNum = _getRandomOne();
            _addFakeData(commonData, fakeArr[i], addNum);
        }
        g_fakeData.updateFakeDataCache(commonData.fakeData);
        gameCommonDao.update(client, {fakeData: commonData.fakeData}, {id: commonData.id}, cb);
    });
};

var _addFakeData = function(commonData, fakeType, addNum){
    if (commonData.fakeData[fakeType]){
        commonData.fakeData[fakeType] = commonData.fakeData[fakeType] + addNum;
    }else{
        commonData.fakeData[fakeType] = addNum;
    }
}; 

var _getRandomOne = function(){
    var arr = [0,1,2];
    var arrIndex = Math.floor(Math.random() * arr.length);
    return arr[arrIndex];
};
