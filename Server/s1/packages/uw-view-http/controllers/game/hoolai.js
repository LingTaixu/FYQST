var logger = require('uw-log').getLogger("uw-pay", __filename);
// var httpUtils = require("uw-utils").httpUtils;
// var clickAccountBiz = require("uw-account").clickAccountBiz;
exports.config = {
	method: "get"
};
var channelId = 10013;
exports.handler = function(req, res, next) {
	logger.info("[login] %s", req.url);

	var ip = req.ip; 
	if(true){ 
  		return res.render("hoolai", {
			cid: channelId
		});
	} else {
		return res.render("maintain");
	}
};