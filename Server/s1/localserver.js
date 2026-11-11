// var express = require('express');
// var app = express();
// // process.argv.forEach(function(p){
// // 	console.log(p);
// // });


var express = require('express'); // 椤圭洰鏈嶅姟绔娇鐢╡xpress妗嗘灦  
var app = express();  
var path = require('path');  
var fs = require('fs');  
  
//浣跨敤nodejs鑷甫鐨刪ttp銆乭ttps妯″潡  
var http = require('http');  
var https = require('https');  
  
//鏍规嵁椤圭洰鐨勮矾寰勫鍏ョ敓鎴愮殑璇佷功鏂囦欢  
var privateKey  = fs.readFileSync(path.join(__dirname, './certificate/server.key'), 'utf8');  
var certificate = fs.readFileSync(path.join(__dirname, './certificate/server.crt'), 'utf8');  
var credentials = {key: privateKey, cert: certificate};  
  
var httpServer = http.createServer(app);  
var httpsServer = https.createServer(credentials, app);  
  
//鍙互鍒嗗埆璁剧疆http銆乭ttps鐨勮闂鍙ｅ彿  
var PORT = 8000;  
var SSLPORT = 8001;  
  
//鍒涘缓http鏈嶅姟鍣? 
httpServer.listen(PORT, function() {  
    console.log('HTTP Server is running on: http://localhost:%s', PORT);  
});  
  
//鍒涘缓https鏈嶅姟鍣? 
httpsServer.listen(SSLPORT, function() {  
    console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);  
});  

if (process.argv.length > 2) {
    console.log('run as release');

    app.use(express.static('../www/release'));
} else {
    console.log('run as dev');
    app.use(express.static('../www/client'));
}

// app.get('/hello',function(req,res){
// 	res.end('hello,hello');
// });
// // var http = require('http').Server(app);
// // var io = require('socket.io')(http);
// // io.on('connection', function(socket) {
// //     console.log('a user connected');
// //     socket.on('disconnect', function() {
// //         console.log('user disconnected');
// //     });
// //     socket.on('message', function(msg) {
// //         console.log('message: ' + msg);
// //         socket.emit('news', msg);
// //     });
// // });
// //
// var server = app.listen(3000, function() {
//     var host = server.address().address;
//     var port = server.address().port;

//     console.log('app listening at http://%s:%s', host, port);
// });