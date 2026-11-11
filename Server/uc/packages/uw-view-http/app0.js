var projectConfig = require('uw-config').project;
var watchFile = require('./src/watchFile');
var net = require('net');
var appUtils = require("uw-utils").appUtils;
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
var sserver = null;
// projectConfig.isHttps = false;
// if(projectConfig.isHttps){

var https = require('https');
var path = require('path');
var fs = require('fs');
//var http2 = require('spdy');
//console.error("xxxxx");

sserver = https.createServer({
    key: fs.readFileSync(path.resolve(__dirname, '../../data/m.sanguoh5.com.key'), 'utf8'),
    cert: fs.readFileSync(path.resolve(__dirname, '../../data/m.sanguoh5.com.crt'), 'utf8')
}, app);

var http = require('http');
server = http.createServer(app);

var httpPort = 0;
var httpsPort = 0;
server.listen(httpPort);
sserver.listen(httpsPort);
httpPort = server.address().port;
httpsPort = sserver.address().port;
console.log("httpPort:", httpPort, "; httpsPort:", httpsPort);

app.disable('etag');
app.set('cache', false);

app.engine('.html', require('ejs').__express);
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mvc.init(app, { verbose: !module.parent }); //mvc



net.createServer(function(socket) {

    socket.once('data', function(buf) {
        //console.log(buf[0]);
        // https数据流的第一位是十六进制“16”，转换成十进制就是22
        var address = buf[0] === 22 ? httpsPort : httpPort;
        //创建一个指向https或http服务器的链接
        var proxy = net.createConnection(address, function() {
            proxy.write(buf);
            //反向代理的过程，tcp接受的数据交给代理链接，代理链接服务器端返回数据交由socket返回给客户端
            socket.pipe(proxy).pipe(socket);
        });



        socket.on('end', function() {
            proxy.end();
        });
        socket.on('close', function() {
            proxy.end();
        });
        socket.on('error', function(err) {
            proxy.end();
        });
        
        proxy.on('end', function() {
            socket.end();
        });
        proxy.on('close', function() {
            socket.end();
        });
        proxy.on('error', function(err) {
            socket.end();
        });
    });
    // socket.setTimeout(1000 * 3,function() {
    //     console.log('客户端在' + 3 + 's内未通信，将断开连接...');
    // });
    socket.on('error', function(err) {
        console.log(err);
        //socket.close();
    });
    // socket.on('timeout', function() {
    //     socket.end();
    // });  
}).listen(projectConfig.viewHttpPort);

//server.listen(projectConfig.viewHttpPort);
// if(projectConfig.isHttps){
//  console.error('[uw-view-http] start https://%s:%s', projectConfig.viewHttpHost, projectConfig.viewHttpPort);
// }else{
//  console.error('[uw-view-http] start http://%s:%s', projectConfig.viewHttpHost, projectConfig.viewHttpPort);
// }

// Uncaught exception handler
process.on('uncaughtException', function(err) {
    //输入语法报错到日志
    var logger = require('uw-log').getLogger("uw-sys-error", __filename);
    logger.error(' Caught exception: ' + err.stack);
    logger.error("\n");
});