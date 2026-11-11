const WebSocketClient = require('./wsc');

//var url = 'ws://127.0.0.1/ws';
var wsclient = new WebSocketClient();
//wsclient.open(url);
var isConnected = false;
wsclient.onopen = function(e){
	console.error("WebSocketClient connected:" );
	//this.send("Hello World !");
	isConnected = true;
}
wsclient.onmessage = function(data){
	console.error('onmessage:',data);
}
wsclient.onerror = function(e){
	console.error('onerror:',e);
	isConnected = false;
}
wsclient.onclose = function(e){
	console.error('onclose:',e);
	isConnected = false;
}
wsclient.send = function(data, cb){
	if (!isConnected) {
		console.error("WebSocketClient lost connection, send fail");
        console.error("[OSSBI LOST],", data);
		return cb && cb('not open');
	}
	//console.error("wsclient.send:", data);
	this.instance.send(data, function(err, data){
		cb && cb(err);
	});
}
module.exports = wsclient;