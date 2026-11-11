/**
 * Created by Sara on 2015/11/12.
 */
var userDao = require("uw-user").userDao;
var accountDao = require("uw-account").accountDao;
var uwData= require("uw-data");
var c_prop = uwData.c_prop;
var uwClient = require("uw-db").uwClient;
var mainClient = require("uw-db").mainClient;
var loginClient = require("uw-db").loginClient;
var async = require("async");
var exports = module.exports;

exports.refresh = function(cb){
    userDao.listCols(uwClient,"id,accountId,createTime", " accountId != 0",[],function(err,userList) {
        if (err) return cb(err);
        async.map(userList,function(userData,cb1){
            var accountId = userData.accountId;
            accountDao.select(loginClient,{id:accountId},function(err, accountData){
                if (err) return console.log(err);
                if(!accountData) return cb1();
                userData.createTime = accountData.createTime;
                userDao.update(uwClient,{createTime:userData.createTime},{id: userData.id},cb1);
            });
        },function(err,data){
            if (err) return console.log(err);
            console.log("执行完毕!");
            console.log("一共[%s]条数据!",userList.length);
        });
    });
};

