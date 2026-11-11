var exports = module.exports;
var uwClient = require("uw-db").uwClient;
var logger = require("uw-log").getLogger("uw-logger", __filename);
var uwData = require("uw-data");
var c_prop = uwData.c_prop;

var g_data = require("uw-global").g_data;
var gameCommonBiz = require("uw-game-common").gameCommonBiz;
exports.run = function(cfg) {

    // 没有玩家在线，不在执行fakaData
    if (g_data.getOnlineNum() <= 0) {
        return;
    }

    var fakeTypeArr = [c_prop.fakeDataTypeKey.payUserNum, c_prop.fakeDataTypeKey.payDSGiftNum, c_prop.fakeDataTypeKey.payTmFundNum, c_prop.fakeDataTypeKey.payDiamondNum, c_prop.fakeDataTypeKey.payGoldNum];
    gameCommonBiz.cronUpdateFakeData(uwClient, fakeTypeArr, function(err) {
        if (err) return console.log(err);
        //console.log("updateFakeData over!!!!!!");
    });
};

exports.runHour = function(cfg) {
    // 没有玩家在线，不在执行fakaData
    if (g_data.getOnlineNum() <= 0) {
        return;
    }

    var fakeTypeArr = [c_prop.fakeDataTypeKey.payLaisBankNum];
    gameCommonBiz.cronUpdateFakeData(uwClient, fakeTypeArr, function(err) {
        if (err) return console.log(err);
        //console.log("updateFakeData over!!!!!!");
    });
};

exports.runOnce = function() {

};

if (require.main == module) {
    exports.run();
}