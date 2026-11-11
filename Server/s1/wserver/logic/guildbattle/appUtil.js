
var appServer = null;
var ns = null;
var exports = module.exports;
const battleModule = require('./battle.js');
const projectConfig = require('uw-config').project;
const w2g = require('../../utils/w2g.js');

exports.appInit = function(s, ns) {
	exports.appServer = s;
	exports.ns = ns;
	
	battleModule.init();

 	syncServerOpenDate();
    setInterval(syncServerOpenDate, 600 * 1000);//120

	const worldMapModule = require('./worldmap.js');
	worldMapModule.init(); 

	const npcModule = require('./npc.js');
	npcModule.init();  

	const guildModule = require('./guilduser.js');
	guildModule.init();  
	
	const chestModule = require('./chest.js');
	// start 
	worldMapModule.run();
};

var syncServerOpenDate = function(){ 
/*
	w2g.getServerNew(projectConfig.serverId, (err, server)=>{
		if (err) {
			console.error("serverList get Error",err);
			return;
		}
		if(server){
			battleModule.battleMgr.setServerDate(new Date(server.serverDate));
		}else{
			console.log("getServer no data:", projectConfig.serverId);
		}
	});
*/
// 服务器信息,要手动改
var server={};
server.id = 1;
server.host = '101.43.194.154';
server.port = 10001;
server.serverDate = '2023-08-05 14:00:00';
		if(server){
			battleModule.battleMgr.setServerDate(new Date(server.serverDate));
		}else{
			console.log("getServer no data:", projectConfig.serverId);
		}
};

// //  关播给所有玩家
// exports.broadcast = function(protocol, data){
// 	exports.appServer.io.of(exports.ns).emit(protocol, data);
// }

exports.appServer = appServer;
exports.ns = ns;