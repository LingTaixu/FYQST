/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Sara on 2015/11/12.
 */

var mailDao = require("uw-mail").mailDao;
var MailEntity = require("uw-entity").MailEntity;
var uwData =  require("uw-data");
var c_prop =  uwData.c_prop;
var async = require("async");
var exports = module.exports;var scriptUtils = require("./scriptUtils");

var check = function(serverData,sClient,cb){
    mailDao.del(sClient," type = ? or type = ?",[c_prop.mailTypeKey.guildWarRank2,c_prop.mailTypeKey.guildWarRank2],function(err,userList) {
        if (err) return cb(err);
        cb(null,1);
    });
};

scriptUtils.runAllServers(check);
