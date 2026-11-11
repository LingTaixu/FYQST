/**
 * Created by Administrator on 2015/12/15.
 */
var exports = module.exports;
var uwClient = require("uw-db").uwClient;
var logger = require("uw-log").getLogger("uw-logger",__filename);

var reissueBiz = require("uw-activity").reissueBiz;
exports.run = function(cfg){
    reissueBiz.sendSevenLoginAward(uwClient, null, function(err){
        if(err) return logger.error(err);
    });
};

exports.runOnce = function(){

};

// var test = function(){
// 	for(var i = 1; i <= 7; i++){
// 		sevenDaysTargetBiz.sendRankAward(uwClient, i, function(err){
//         	if(err) return logger.error(err);
//     	});
// 	}
// }

// test();