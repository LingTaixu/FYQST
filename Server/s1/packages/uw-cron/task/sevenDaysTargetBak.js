/**
 * Created by Administrator on 2015/12/28.
 */
var exports = module.exports;
var uwClient = require("uw-db").uwClient;
var logger = require("uw-log").getLogger("uw-logger",__filename);

var sevenDaysTargetBiz = require("uw-fiveDaysTarget").sevenDaysTargetBiz;
exports.run = function(cfg){
    sevenDaysTargetBiz.sqlTargetBak(uwClient, null, function(err){
        if(err) return console.log(err);
    })
};

exports.runOnce = function(){

};

// var test = function(i){
// 	console.log("test:", i);
// 	//for(var i = 1; i <= 7; i++){
// 		sevenDaysTargetBiz.sqlTargetBak(uwClient, i, function(err){
//         	if(err) return logger.error(err);
// 			sevenDaysTargetBiz.sendRankAward(uwClient, i, function(err1){
// 	        	if(err1) return logger.error(err1);
// 	    	});
//     	});
// 	//}
// }

// test(4);