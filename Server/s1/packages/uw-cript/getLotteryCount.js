/**
 * Created by Sara on 2015/11/12.
 */
var userDao = require("uw-user").userDao;
var accountDao = require("uw-account").accountDao;
var uwData= require("uw-data");
var c_prop = uwData.c_prop;
var uwClient = require("uw-db").uwClient;
var mainClient = require("uw-db").mainClient;
var async = require("async");
var exports = module.exports;

exports.check = function(cb){
    userDao.listCols(uwClient,"id,activity","1=1",[],function(err,userList){
        if(err) return console.log(err);
        var num1 = 0;
        var num10 = 0;
        for(var i = 0;i<userList.length;i++){
            var locUser = userList[i];
            var locData = locUser.activity[34]||[];
            var locNum1 = locData[1]||0;
            num1+=locNum1;
            var locNum10 = locData[10]||0;
            num10+=locNum10;
        }
        console.log("单抽总次数:",num1);
        console.log("十连抽总次数:",num10);
    });
};


exports.check();