var async = require("async");
var exports = module.exports;
var scriptUtils = require("./scriptUtils");
var sevenDaysTargetBiz = require("uw-fiveDaysTarget").sevenDaysTargetBiz;
var arenaBiz = require("uw-arena").arenaBiz;

var run = function(serverData, sClient, cb) {
	arenaBiz.sqlArenaBak(sClient, function(err){
        if(err) return cb(err);
        console.log("备份竞技场数据完成");
        sevenDaysTargetBiz.sqlTargetBak(sClient, null, function(err){
	        if(err) return console.log(err);
	        console.log("备份新服竞赛所需备份表完成");
	        sevenDaysTargetBiz.sendRankAward(sClient, null, function(err){
		        if(err) return logger.error(err);
		        console.log("新服竞赛奖励发送成功");

		        cb(null, '执行完毕');
		    });
	    })
    })

	
};
// scriptUtils.runByServerIds([1],run);
// scriptUtils.runByServerIds([58,59,60,61,62,63,64],run);
scriptUtils.runByServerIds([8,9,10,11,12,14,16,17,18,19,20,21,22,23,24,25,26,28,29,30,31,32,33,34,35,36],run);
