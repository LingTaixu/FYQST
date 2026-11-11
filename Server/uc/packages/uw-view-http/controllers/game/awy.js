var logger = require('uw-log').getLogger("uw-pay", __filename);
// var httpUtils = require("uw-utils").httpUtils;
var clickAccountBiz = require("uw-account").clickAccountBiz;
exports.config = {
	method: "get"
};
var getClientIp = function(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.ip ||
        req.connection.socket.remoteAddress;
}; 
var channelId = 10010;
exports.handler = function(req, res, next) {
	logger.info("[login] %s", req.url);

	var ip = getClientIp(req).replace(/::ffff:/, '');
	// //记录点击用户 
	// clickAccountBiz.addClickAwyAccount(channelId, req.query.token, ip || '', req.url, function(err, data){
 //    	//res.render("ly",{cid: channelId, tt: new Date().getTime()});
	// });

	//console.log("IP:", ip);
	//if (ip.includes("183.63.111.186") || ip.includes("202.121.132.10")) {
	// if(true){ 
 //  		return res.render("awy", {
	// 		cid: channelId
	// 	});
	// } else {
	// 	return res.render("maintain");
	// }
	//console.log("req:", req._parsedOriginalUrl.search); 
	res.redirect("https://fimg0.sanguoh5.com/ttf/awy.html"+ req._parsedOriginalUrl.search||'');

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
	//res.render("awy",{cid: channelId});

	//res.render("maintain",{});
};