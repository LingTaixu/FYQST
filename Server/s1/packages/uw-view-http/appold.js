var projectConfig = require('uw-config').project;
var watchFile = require('./src/watchFile');
var appUtils =require("uw-utils").appUtils;
appUtils.before();
/**
 * Module dependencies.
 */
require("date-utils");
var express = require('express');
var bodyParser = require('body-parser');
var mvc = require('./lib/uwa-middleware').mvc;

var app = module.exports = express(); 
var server = null;
projectConfig.isHttps = true;
if(projectConfig.isHttps){

    var https = require('https'); 
    var path = require('path');
    var fs = require('fs');
    var http2 = require('spdy');

    server = http2.createServer({  
      key: fs.readFileSync(path.resolve(__dirname, '../../data/m.sanguoh5.com.key'), 'utf8'),  
      cert: fs.readFileSync(path.resolve(__dirname, '../../data/m.sanguoh5.com.crt'), 'utf8')  
    }, app); 
}else{
   var http = require('http'); 
   server = http.createServer(app); 
}

app.disable('etag');
app.set('cache', false);

app.engine('.html', require('ejs').__express);
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mvc.init(app, { verbose: !module.parent });//mvc

server.listen(projectConfig.viewHttpPort);
if(projectConfig.isHttps){
	console.error('[uw-view-http] start https://%s:%s', projectConfig.viewHttpHost, projectConfig.viewHttpPort);
}else{
	console.error('[uw-view-http] start http://%s:%s', projectConfig.viewHttpHost, projectConfig.viewHttpPort);
}

// Uncaught exception handler
process.on('uncaughtException', function (err) {
    //输入语法报错到日志
    var logger = require('uw-log').getLogger("uw-sys-error", __filename);
    logger.error(' Caught exception: ' + err.stack);
    logger.error("\n");
});
