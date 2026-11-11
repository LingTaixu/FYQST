
var projectCfg = require("uw-config").project;
var io = require('socket.io-client');
var wsclient = null;

//module.exports.WSClient = wsclient;

var init = function(){
	//console.log("uw-ws.init",projectCfg);
	if(projectCfg.logHost && projectCfg.logPort){	
		var url = 'ws://'+projectCfg.logHost+':'+projectCfg.logPort;		
		//console.log("open ws url", url);
		module.exports.WSClient = wsclient = io(url, {
		  	path: '/oss'
		});

		wsclient.on('connect', function () {
		    console.error("wsclient onConnect:", url);
		});
	}
};

if(!wsclient){
	init();
}