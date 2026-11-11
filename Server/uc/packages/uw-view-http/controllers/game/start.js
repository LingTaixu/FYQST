var logger = require('uw-log').getLogger("uw-pay", __filename);
var clickAccountBiz = require("uw-account").clickAccountBiz;
exports.config ={
    method:"get"
};
var channelId = 10006;
exports.handler = function(req, res,next){
	logger.info("[login] %s",  req.url); 
 
	var httpsChannel = ['6e8c2fd8cd9ad2da1817290a3865366a','a947559c2f7cf8134351dd37fac47b24',
	'3617d2cf790f2a22ca0c2f6709556d54','74ab9282e77c523f0fce3badfa77e249', 
	'e744b6a98b71a24163fd1f54d0f20a0f', 'c7628110320715e9150fb06a5d5277a4',
	'7331e868ad7ea14dbc216e23b8622981', '6ae6dd7378108ed919bb816edd9abca3','a8c289af5e34f800dd1f0a2a2d6aac86'];

	if (httpsChannel.indexOf(req.query.zmcon) == -1){
		res.render("ly",{cid: channelId, tt: new Date().getTime()});
	}else{
		res.render("lys",{cid: channelId, tt: new Date().getTime()});
	}
};
