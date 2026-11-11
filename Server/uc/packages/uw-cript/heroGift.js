/**
 * Created by Sara on 2016/3/31.
 */
var userDao = require("uw-user").userDao;
var g_cache = require("uw-global").g_cache;

var async = require("async");
var exports = module.exports;
var scriptUtils = require("./scriptUtils");

var changeErrorGift = function(serverData, sClient, cb) {
    userDao.listCols(sClient, "id, heroData", "1=1", [], function(err, userList) {
        if (err) return cb(err);
        async.map(userList, function(userData, cb1) {
            _checkAndChangeErrorGift(sClient, userData, cb1);
        }, function(err, data) {
            if (err) return cb(err);
            console.log("更新完成");
            cb(null, userList.length);
        });
    })
};

var _checkAndChangeErrorGift = function(client, userData, cb) {
    let heroData = userData.heroData;
    if (!heroData || !heroData[108] || !heroData[108][6] || heroData[108][6] == 0 || (heroData[108][6] >= 5801 && heroData[108][6] <= 6000)) return cb(null);
    heroData[108][6] = 5801;
    userDao.update(client, { heroData: userData.heroData }, { id: userData.id }, cb);
};

scriptUtils.runAllServers(changeErrorGift);
