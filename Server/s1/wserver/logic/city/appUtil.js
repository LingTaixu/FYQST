var appServer = null;
var ns = null;
var exports = module.exports;

exports.appInit = function(s, ns) {
	exports.appServer = s;
	exports.ns = ns;
	const worldMapModule = require('./worldmap.js');
	worldMapModule.init(); 
	const godNessModule = require('./godness.js');
	//godNessModule.init(worldMapModule); 
	const chestModule = require('./chest.js');
  	const playerModule = require('./player.js'); 
  	//console.log("city.appInit:", playerModule.playerManager);
	// start 
	worldMapModule.run();
} 

exports.appServer = appServer;
exports.ns = ns;