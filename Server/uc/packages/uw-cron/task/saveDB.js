var exports = module.exports;
var uwClient = require("uw-db").uwClient;
var logger = require("uw-log").getLogger("uw-logger",__filename);
 

var g_cache = require("uw-global").g_cache; 
exports.run = function(cfg){
    g_cache.checkPlayers(uwClient); 
};

exports.runOnce = function(){

};

if(require.main == module){
    exports.run();
}