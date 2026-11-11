
var appServer = null;
var ns = null;
var exports = module.exports;

exports.appInit = function(s, ns) {
	exports.appServer = s;
	exports.ns = ns;

	const worldMapModule = require('./worldmap.js');
	worldMapModule.init(); 
	const bossModule = require('./boss.js');
	bossModule.init(); 
	const areaModule = require('./area.js');
	areaModule.init();
	var ws = require('uw-ws');
	
	const chestModule = require('./chest.js');
	// start  
	worldMapModule.run();
} 

// //  关播给所有玩家
// exports.broadcast = function(protocol, data){
// 	exports.appServer.io.of(exports.ns).emit(protocol, data);
// }

exports.appServer = appServer;
exports.ns = ns;