var exports = module.exports; 

var g_server = require("uw-global").g_server; 
exports.run = function(cfg){
    g_server.initServerDate(function(){}); 
};

if(require.main == module){
    exports.run();
}