var logger = require('uw-log').getLogger("uw-pay", __filename);
// var httpUtils = require("uw-utils").httpUtils;
// var clickAccountBiz = require("uw-account").clickAccountBiz;
exports.config = {
	method: "get"
};
var channelId = 10019;
exports.handler = function(req, res, next) {
	logger.info("[login] %s", req.url);

	var ip = req.ip; 
	if(true){ 
  		return res.render("sm_ios", {
			cid: channelId
		});
	} else {
		return res.render("maintain");
	}
};