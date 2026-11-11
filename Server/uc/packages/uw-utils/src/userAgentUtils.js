var exports = module.exports;
var useragent = require('useragent');

exports.getUserAgent = function(req) {
    var agent = useragent.parse(req.headers['user-agent']);
    var brower_version = agent.toVersion();
    var browser_name = agent.toAgent();
    browser_name = browser_name.split(brower_version)[0].trim();
    var device = agent.device.toString() + "_" + agent.os.toString();
    device = device.replace(/ /g,"_");
    var ua = "browser_name:" + browser_name + ";" + "os_name:" + device + ";" + "brower_version:" + brower_version;
    return ua; 
};