var logger = require('uw-log').getLogger("uw-pay", __filename);
var clickAccountBiz = require("uw-account").clickAccountBiz;
exports.config ={
    method:"get"
};
//var channelId = 10007;
exports.handler = function(req, res,next){
	logger.info("[login] %s",  req.url); 
 
 	res.redirect("https://fimg0.sanguoh5.com/tuyou/ty.html"+ req._parsedOriginalUrl.search||'');
	//res.render("ly",{cid: channelId}); 
	//res.render("lys",{cid: channelId});
 
	// var useWhite = false;
	// if(useWhite){
	// 	var whiteList = [];
	// 	if (whiteList.indexOf(req.query.openid) != -1){
	// 		res.render("ly",{cid: channelId, tt: new Date().getTime()});
	// 	}else{
	// 		res.end('游戏更新中');
	// 	}	
	// }else{

	// }

	// //记录点击用户 
	// clickAccountBiz.addClickAccount(channelId, req.query.openid, req.query.zmcon, req.url, function(err, data){
 //    	res.render("ly",{cid: channelId, tt: new Date().getTime()});
	// });
	//res.render("maintain",{});
};
