/**
 * Created by Administrator on 2016/2/16.
 */
//var mainClient =  require("uw-db").mainClient;
var async = require("async");
var mailBiz = require("uw-mail").mailBiz;
var userDao = require("uw-user").userDao;
var accountDao = require("uw-account").accountDao; 
var rechargeRequestDao = require("uw-recharge").rechargeRequestDao; 
var uwClient = require("uw-db").uwClient;
var loginClient = require("uw-db").loginClient;
var querystring = require("querystring");
var fs = require("fs");
var util = require('util');
var scriptUtils = require("./scriptUtils");
var snid = 168;
var gameid=106; 

var getChannelName = function(){
    return "awy";
};

var startTime = new Date('2018-05-23 00:00:00');
var endTime = new Date('2018-05-28 23:59:59');

var writeFileHead=function(){
    var head = "userid,clientid,source,affiliate,creative,family,genus,from_userid,installDate,installTime,extra,udid,roleid\n";
    fs.writeFileSync("install.csv",head,"utf8");

    head = "userid,clientid,source,affiliate,creative,family,genus,ip,from_uid,date,time,extra,udid,roleid\n";
    fs.writeFileSync("dau.csv",head,"utf8");

    // head = "userid,clientid,amount,currency,provider,ip,transactionid,status,kingdom,phylum,value2,extra,paymentDate,paymentTime,udid,roleid\n";
    // fs.writeFileSync("pay.csv",head,"utf8");
};

writeFileHead();

var check = function(serverData,uwClient,cb){

    async.parallel([
        function(cb1) { 
           accountDao.list(loginClient, "",[], cb1);
        },
        function(cb1) {
            userDao.list(uwClient, " robotId = 0 and (createTime >? and createTime<?) ",[startTime, endTime], cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var accountList = data[0];
        var userList = data[1];
        //console.log("userList:", userList);
        for(var i = 0;i<userList.length;i++){
            var userData = userList[i];
            var accountData = _getAccountData(accountList, userData.accountId);
            _installBiLog(userData, accountData);
            _dauBiLog(userData, accountData);

        }

        return cb(null);
    });
};

var checkPayment = function(cb){

    async.parallel([
        function(cb1) { 
            accountDao.list(loginClient, "",[], cb1);
        },
        function(cb1) {
           rechargeRequestDao.list(mainClient, " status > 0 and (addTime >? and addTime<?) ",[startTime, endTime], cb1);
        }
    ], function(err, data) {
        if (err) return cb(err);
        var accountList = data[0];
        var payList = data[1];
        //console.log("userList:", userList);
        for(var i = 0;i<payList.length;i++){
            var payData = payList[i];
            var accountData = _getAccountData(accountList, payData.accountId);
            _payBiLog(payData, accountData);
        }

        return cb(null);
    });
};

var _payBiLog = function(payData, accountData){

      var jsonData = {};
      var payTime = new Date(payData.addTime);
      var ds = payTime.toFormat("YYYY-MM-DD");  
      var userid = getChannelName() + "_" + accountData.name;
      var clientid= payData.serverId + 10000;  
      var amount = payData.goodsPrice;
      var currency = 'RMB';
      var provider = getChannelName();
      var ip = '';
      var transactionid =payData.transId || payData.orderNo;
      var status = 'success';
      var kingdom = '';
      var phylum = '';
      var value2 = payData.rechargeId;
      var extra = 'user_level:'+payData.lvl || 30;
      var paymentDate = payTime.toFormat("YYYY-MM-DD");
      var paymentTime = payTime.toFormat("HH24:MI:SS");
      var udid = '';
      var roleid = payData.userId;
      var str = util.format("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",userid,clientid,  amount,currency,provider,ip,transactionid,status,kingdom,phylum,value2,extra,paymentDate,paymentTime,udid,roleid);        
      fs.writeFileSync("pay.csv",str,{encoding:"utf8", flag:'a+'});
};

var _dauBiLog = function(userData, accountData){
    var exData = userData.exData || {}; 
    var ip = exData[26] || '';
    var ua = exData[27] || '';
    var jsonData = {};
    var regTime = new Date(userData.createTime);
    var userid = getChannelName() + "_" + accountData.name;
    var clientid = userData.serverId + 10000;
    var source = '';
    var affiliate = '';
    var creative = getChannelName();
    var family = '';
    var genus = '';
    var ip = ip;
    var from_uid = '';
    var date = regTime.toFormat("YYYY-MM-DD");
    var time  = regTime.toFormat("HH24:MI:SS");
    var extra = ua; 
    var udid = '';
    var roleid = userData.id;
    var str = util.format("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",userid, clientid, source, affiliate, creative,family,genus,ip,from_uid,date,time,extra,udid,roleid);     
    fs.writeFileSync("dau.csv",str,{encoding:"utf8", flag:'a+'});
    //  loginDays
    console.log("userData.loginDays:", userData.loginDays);
    var loginDays = userData.loginDays;
    for(var i = 0; i < loginDays.length; i++){
        var loginTime = loginDays[i];
        var loginDate = new Date(loginTime);
        if (loginTime > endTime.getTime()) {
            continue;
        }
        if ( regTime.equalsDay(loginDate)) {
            continue;
        }
        //console.log("loginDate:", loginDate); 
        var date = loginDate.toFormat("YYYY-MM-DD");
        var time  = loginDate.toFormat("HH24:MI:SS"); 
        var str = util.format("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",userid, clientid, source, affiliate, creative,family,genus,ip,from_uid,date,time,extra,udid,roleid);     
        fs.writeFileSync("dau.csv",str,{encoding:"utf8", flag:'a+'});
    } 
};

var _installBiLog = function(userData, accountData){
    var exData = userData.exData || {}; 
    var ip = exData[26] || '';
    var ua = exData[27] || '';
    var jsonData = {};
    var regTime = new Date(userData.createTime); 

    var userid = getChannelName() + "_" + accountData.name;
    var clientid = userData.serverId + 10000;
    var source = '';
    var affiliate = '';
    var creative = getChannelName();
    var family = '';
    var genus = '';
    var from_userid = ip;
    var installDate = regTime.toFormat("YYYY-MM-DD");
    var installTime  = regTime.toFormat("HH24:MI:SS");
    var extra = ua; 
    var udid = '';
    var roleid = userData.id;
    var str = util.format("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",userid, clientid, source, affiliate,  creative,family,genus,from_userid,installDate,installTime,extra,udid,roleid);     
    fs.writeFileSync("install.csv",str,{encoding:"utf8", flag:'a+'});
};

var _getAccountData = function(accountList, accId){
    for(var i = 0; i < accountList.length; i++){
        var accountData = accountList[i]; 
        if(accountData.id == accId)
            return accountData;
    }
};

// check(uwClient, function(err, data){
//     console.log("BI finish!",data);
//     process.exit(0);
// });

scriptUtils.runAllServers(check);

// checkPayment(function(err, data){
//     console.log("BI finish!",data);
//     process.exit(0);
// });

