var async = require("async");
var userDao = require("uw-user").userDao;
var scriptUtils = require("./scriptUtils");


// 1973    开瓶器 打开后可获得一瓶红酒和高级开瓶器，只要300彩钻即可开启。
// 1974    高级开瓶器   打开后可获得两瓶红酒和超级开瓶器，只要1000彩钻即可开启。
// 1975    超级开瓶器   打开后可获得四瓶红酒和至尊开瓶器，只要2000彩钻即可开启。
// 1976    至尊开瓶器   打开后可获得八瓶红酒和一扎威士忌，只要4000彩钻即可开启。
// 1977    一扎威士忌   打开后可获得一瓶威士忌和一桶威士忌，只要6000彩钻即可开启。
// 1978    一桶威士忌   打开后可获得两瓶威士忌，只要12000彩钻即可开启。

var check = function(serverData, sClient, cb) {
    var checkItems = {
        '1973': 1,
        '1974': 1,
        '1975': 1,
        '1976': 1,
        '1977': 1,
        '1978': 1
    };
    userDao.list(sClient, " accountId > 0 and robotId = 0 ", [], function(err, userList) {
        if (err) return cb(err);
        var tempArr = []
        async.map(userList, function(userData, cb1) {
            var bag = userData.bag;
            var have = false;
            var showObj = {};
            var haveItems = {};
            for (var itemId in bag) {
                if (checkItems[itemId]) {
                    have = true;
                    haveItems[itemId] = bag[itemId];
                }
            }
            if (have) {
                console.error('=====have====');
                showObj.userId = userData.id;
                showObj.haveItems = haveItems;
                tempArr.push(showObj);
            }
            cb1(null)
        }, function(err, data) {
            if (err) return cb(err);
            console.error(tempArr);
            return cb(null,tempArr.length);
        });
    });
};

// scriptUtils.runByServerIds([76], check);
scriptUtils.runAllServers(check);
