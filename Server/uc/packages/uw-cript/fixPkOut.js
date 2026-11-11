var async = require("async"); 
var uwClient = require("uw-db").uwClient; 
 
var pkOutBiz = require("uw-pkOut").pkOutBiz;
var userDao  =  require("uw-user").userDao;
var check = function(uwClient,cb){
    userDao.list(uwClient, " accountId > 0 and robotId = 0 ", [], function(err,userList){
        if(err) return cb(err);
        // 初始化pkOut
        async.map(userList, function(userData, cb1) {
            pkOutBiz.initPkOutEnemy(uwClient, userData.id, function(){
                console.error('initPkOutEnemy-->',userData.id,userData.nickName);
                cb1();
            });
        }, function(err, data) {
             
        });
        
    });
};

check(uwClient, function(err, data){
    console.log("fixPkout finish!");
    //process.exit(0);
});
 

