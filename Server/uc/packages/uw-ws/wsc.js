const WebSocket = require('ws');

function WebSocketClient(){
    this.number = 0;    // Message number
    this.autoReconnectInterval = 5*1000;    // ms
}
WebSocketClient.prototype.open = function(url){
    this.url = url;
    this.instance = new WebSocket(this.url);
    this.instance.on('open',()=>{
        this.onopen();
    });
    this.instance.on('message',(data)=>{
        this.onmessage(data);
    });
    this.instance.on('close',(e)=>{
        switch (e.code){
        case 1000:  // CLOSE_NORMAL
            console.error("WebSocket: closed");
            break;
        default:    // Abnormal closure
            this.reconnect(e);
            break;
        }
        this.onclose(e);
    });
    this.instance.on('error',(e)=>{
        switch (e.code){
        case 'ECONNREFUSED':
            this.reconnect(e);
            break;
        default:
            this.onerror(e);
            break;
        }
    });
}
WebSocketClient.prototype.send = function(data,option){
    try{
        this.instance.send(data,option);
    }catch (e){
        this.instance.emit('error',e);
    }
}
WebSocketClient.prototype.reconnect = function(e){
    console.error(`WebSocketClient: retry in ${this.autoReconnectInterval}ms`,e);
        this.instance.removeAllListeners();
    var that = this;
    setTimeout(function(){
        console.error("WebSocketClient: reconnecting...");
        that.open(that.url);
    },this.autoReconnectInterval);
}
WebSocketClient.prototype.onopen = function(e){ console.error("WebSocketClient: open",arguments); }
WebSocketClient.prototype.onmessage = function(data){  console.error("WebSocketClient: message",arguments);  }
WebSocketClient.prototype.onerror = function(e){    console.error("WebSocketClient: error",arguments);    }
WebSocketClient.prototype.onclose = function(e){    console.error("WebSocketClient: closed",arguments);   }


module.exports = WebSocketClient;
