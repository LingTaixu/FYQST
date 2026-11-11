var clickAccountBiz = require("uw-account").clickAccountBiz; 
var async = require("async");
var check = function(cb){
    var clickAccLit = require("./clickAccount.json");
  
 	    async.mapLimit(clickAccLit,1,function(info,cb1){
 	    	var openid = info[0];
   	 		var zmcon = 'c883c779e060967bf2e51d5b9d005098';
	 		var url =  info[3];
	 		var tm = info[1];
	 		// 记录点击用户 
			clickAccountBiz.addClickAccount2(10006, openid, zmcon, url, tm, cb1);
        },function(err,data){
            cb(null);
        });
     
};

var updateCreateTime = function(cb){
    var clickAccLit = require("./clickAccount.json");
  
 	    async.mapLimit(clickAccLit,1,function(info,cb1){
 	    	var openid = info[0]; 
	 		var tm = info[1];
	 		// 记录点击用户 
			clickAccountBiz.updateClickAccountTime(10006, openid,  tm, cb1);
        },function(err,data){
            cb(null);
        });
     
};

updateCreateTime(function(err,data){
    if(err){
        console.error("执行失败");
        console.error(err);
    }else{
        console.log("执行成功");
    }
    process.exit(0);

});
