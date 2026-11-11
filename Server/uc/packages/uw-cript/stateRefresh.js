/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Sara on 2015/11/12.
 */
var mainClient =  require("uw-db").mainClient;
var mailBiz = require("uw-mail").mailBiz;
var demonLotusDao = require("uw-demon-lotus").demonLotusDao;

var async = require("async");
var exports = module.exports;var scriptUtils = require("./scriptUtils");

var check = function(serverData,sClient,cb){
    demonLotusDao.listCols(sClient,"id,lvl", " 1=1",[],function(err,demonLotusList) {
        if (err) return cb(err);
        async.mapLimit(demonLotusList,200,function(demonLotusData,cb1){
            var lvl = parseInt(demonLotusData.lvl);
            demonLotusData.lvl = lvl*5;
            demonLotusDao.update(sClient,{lvl:demonLotusData.lvl},{id: demonLotusData.id},cb1);
        },function(err,data){
            if (err) return cb(err);
            cb(null,demonLotusList.length);
        });
    });
};

scriptUtils.runAllServers(check);
