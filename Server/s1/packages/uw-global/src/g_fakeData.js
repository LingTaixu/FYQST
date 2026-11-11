/**
 * Created by Administrator on 14-9-25.
 */
var uwClient = require("uw-db").uwClient;  
var gameCommonBiz ;
exports.run = function(){
    var fakeTypeArr = [c_prop.fakeDataTypeKey.payUserNum,c_prop.fakeDataTypeKey.payDSGiftNum,c_prop.fakeDataTypeKey.payTmFundNum,c_prop.fakeDataTypeKey.payWeekCardNum,c_prop.fakeDataTypeKey.payMonthCardNum];
    gameCommonBiz.cronUpdateFakeData(uwClient, fakeTypeArr, function(err){
        if(err) return console.log(err);
         console.log("updateFakeData over!!!!!!");
        }
    );
};

var checkRequire = function(){
   gameCommonBiz = gameCommonBiz || require("uw-game-common").gameCommonBiz;
};

//fakeData缓存
var __fakeCache = {}; 

/**
 * 初始化
 */
exports.init = function (cb) {
    checkRequire();
    gameCommonBiz.getInfo(uwClient, function(err, data){
        if(err) return cb(err);
        __fakeCache = data.fakeData; 
        cb(null);
    });
};

//获得fakeCache
exports.getFakeDataCache = function(){
    // console.error('getFakeDataCache========',__fakeCache);
    return __fakeCache;
};
 
exports.updateFakeDataCache = function(fakeData){ 
    // console.error('updateFakeDataCache========',fakeData);
    __fakeCache = fakeData;
} 
 