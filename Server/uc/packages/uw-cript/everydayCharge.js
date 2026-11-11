/**
 * Created by John on 2016/5/23.
 */
/**
 * Created by Sara on 2015/11/12.
 */
var userDao = require("uw-user").userDao;
var accountDao = require("uw-account").accountDao;
var uwData =  require("uw-data");
var c_prop = uwData.c_prop;
var uwClient = require("uw-db").uwClient;
var mainClient = require("uw-db").mainClient;
var async = require("async");
var exports = module.exports;

exports.check = function(cb){
    var everydayIds = require("./everydayId.json");
    userDao.listCols(uwClient,"id,nickName,activity","vip > 0 ",[],function(err,userList){
        if(err) return console.log(err);
        async.mapLimit(userList,50,function(userData,cb1){
            var name = userData.nickName;
            var str = name.split(".");
            var everydayId = parseInt(everydayIds[str[0]]);
            if(!everydayId){
                return cb1(null);
            }
            userData.activity[107] = userData.activity[everydayId];
            userDao.update(uwClient,{activity:userData.activity},{id: userData.id},cb1);
        },function(err,data){
            if (err) return console.log(err);
            console.log("执行完毕!");
            console.log("一共[%s]条数据!",userList.length);
        });
    });
};


exports.check();