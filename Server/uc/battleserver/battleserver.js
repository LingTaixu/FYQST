require('../reset.js').resetBattleServer();
var projectConfig = require('uw-config').project;
var cmdJs = require('cmdjs');
var path = require('path');
require('date-utils');
var fs = cmdJs.fs2;
var base = require('./baseserver.js');
 
class Server extends base {
    constructor() {
        super();
        this.installHandlers('./handlers');
    }
    installHandlers(dir) {
        var self = this;
        fs.walkDirSync(dir, ['.js'], function(filePath) {
            var h = require('./' + filePath);
            var nsp = "/" + path.basename(filePath, ".js");  
            //console.log('install handler ', filePath,nsp);
            self.nspHandler[nsp] = self.nspHandler[nsp] || {};
            // Object.assign(Server.prototype, h);
            var keys = Object.getOwnPropertyNames(h.prototype);
           // console.log(keys.join(','));
            keys.forEach(function(k) {
                if (k != 'constructor') {
                    self.nspHandler[nsp][k] = h.prototype[k];
                }
            });
        });

        //console.log("installHanlder:", self.nspHandler);
    }
    init(cfg, isHttps) {
        super.init(cfg, isHttps);
         //
         //var self =this;
        // _sub_constructors.forEach(function(sct) {
        //     sct.call(self);
        // });
        let nsps = Object.keys(this.nspHandler);
        nsps.forEach((ns) => {
            this.nspHandler[ns].__init__.call(this, ns);
        });
    } 
};

//==========start================// 
var server = new Server(); 
server.init(null, projectConfig.isHttps);
server.start(projectConfig.battleServerPort);
process.on('uncaughtException', function(err) {
    //输入语法报错到日志
    var logger = require('uw-log').getLogger("uw-sys-error", __filename);
    logger.error(' Caught exception: ' + err.stack);
    logger.error("\n");
});