/**
 * Created by Administrator on 2014/6/7.
 */
var exports = module.exports;
var uwClient = require("uw-db").uwClient;
var logger = require("uw-log").getLogger("uw-logger",__filename);
var async = require("async");
var rankBiz = require("uw-rank").rankBiz;
var guildPersonalBiz = require("uw-guild").guildPersonalBiz;
var g_hybridData = require("uw-global").g_hybridData;
exports.run = function(cfg){
	rankBiz.updateUserRanks(uwClient, function(err){
        if(err) return console.log(err);
     	// 更新完毕后更新玩家的公会名称
	     async.parallel([
	        function(cb1){
	            rankBiz.getUserIdList(uwClient, cb1);
	        },
	        function(cb1){
	            guildPersonalBiz.getAllGuildUsers(uwClient, cb1);
	        }
	    	],function(err,data){
	    		var userIdList = data[0];
	    		var userGuilds = data[1];	 
	 
	    		//  效率低, 需要重新考虑
	    		var strSql = "";
	    		var sqlArr = [];
	    		var j = 0;
	    		for(var i = 0; i < userIdList.length; i++){
	    			var userId = userIdList[i].userId;
	    			var guildName = userGuilds[userId];
	    			if (guildName && guildName != ''){
		    			strSql += "update uw_user_rank set guildName='" + guildName + "' where userId = " + userId + ";";
			    		//console.log(strSql);
			    		j++;
			    		if (j  >=  1000){
			    			//uwClient.query(strSql,[],function(err,data){});
			    			 sqlArr.push(strSql);
			    			strSql = "";
			    			j = 0;
			    		}
	    			}	    			
	    		}  
	    		//console.error("strSql:", strSql);
	    		if(strSql != ""){
	    			sqlArr.push(strSql);
	    			//uwClient.query(strSql,[],function(err,data){});
	    		}


                async.map(sqlArr, function (sql, cb1) {
                    uwClient.query(sql,[],cb1); 
                }, function(){
                     g_hybridData.loadRankFirst(function(){});
                });
	    	});
         
   });

}; 

exports.runOnce = function(){
    exports.run();
};
 