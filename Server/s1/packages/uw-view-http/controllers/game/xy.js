var logger = require('uw-log').getLogger("uw-pay", __filename);
var clickAccountBiz = require("uw-account").clickAccountBiz;
exports.config ={
    method:"get"
};
var channelId = 10009;
exports.handler = function(req, res,next){
	logger.info("[login] %s",  req.url); 
 

	// var useWhite = false;
	// if(useWhite){
	// 	var whiteList = [];
	// 	if (whiteList.indexOf(req.query.openid) != -1){
	// 		res.render("start",{cid: channelId});
	// 	}else{
	// 		res.end('游戏更新中');
	// 	}	
	// }else{

	// }

	//记录点击用户  
    res.render("start",{cid: channelId});
	 
	//res.render("maintain",{});
};
