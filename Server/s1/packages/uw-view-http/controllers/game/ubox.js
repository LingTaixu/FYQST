var logger = require('uw-log').getLogger("uw-pay", __filename);
var clickAccountBiz = require("uw-account").clickAccountBiz;
exports.config ={
    method:"get"
};
var channelId = 10007;
exports.handler = function(req, res,next){
	logger.info("[login] %s",  req.url);

	// if (req.query.zmcon != "c883c779e060967bf2e51d5b9d005098"){
	// 	return;
	// }

	var useWhite = false;
	if(useWhite){
		var whiteList = [];
		if (whiteList.indexOf(req.query.openid) != -1){
			res.render("ubox",{cid: channelId});
		}else{
			res.end('游戏更新中');
		}	
	}else{

	}

	//记录点击用户 
	clickAccountBiz.addClickAccount(channelId, req.query.openid, req.query.zmcon, req.url, function(err, data){
    	res.render("ubox",{cid: channelId});
	});
	//res.render("maintain",{});
};
