
(function(window) {
    //
    var sys_protocols = [
        'connect',
        'disconnect',
        'error',
        'connect_error',
        'connect_timeout',
        'reconnect',
        'reconnect_attempt',
        'reconnecting',
        'reconnect_error',
        'reconnect_failed'
    ];

    //
    var clients = {};
    //
    function Client(url) {
        this.url = url;
    }
    //
    var p = Client.prototype;
    /**
     *
     */
    p.connect = function(url, option) {
        if (this.socket && url ==this.url) {return;}
        option = option || {};
        this.url = url;
        if(this.socket){
            this.socket.close();
        }
        this.socket = io(url, option);
        this.bindHandlers(option.protocols || []);
    };
    /**
     *
     */
    p.bindHandlers = function(protocols) {
        var self = this;
        protocols.forEach(function(prot) {
            self.socket.on(prot, function(data) {
                self.onEvent(prot, data);
            });
        });
    };
    /**
     *
     */
    p.onEvent = function(se, data) {
        // console.log('get  ', this.socket.id, se, data);
        if (sys_protocols.includes(se)) {
            data = null;
        }
        postMessage({
            msg: se,
            id: this.socket.id,
            res: data
        },this.name);
        if (se == 'connect') {
            clients[this.socket.id] = this;
            // console.log('connect ',this.socket.id);
        } else if (se == 'disconnect') {
            delete clients[this.socket.id];
        }
    };
    /**
     *
     */
    p.emit = function(msg, data) {
        // console.log('send ', msg, JSON.stringify(data));
        this.socket.emit(msg, data);
    };
    /**
     *
     */
    p.close = function() {
        // console.log('disconnect');
        this.socket.close();
    };
    function doRequest(data) {
        var op = data.op;
        var client;
        if (op == 'connect') {
            client = new Client();
            client.name=data.name;
            client.connect(data.url, data.option);
        } else {
            client = clients[data.id];
            if (client && client[op]) {
                client[op].call(client, data.msg, data.req);
            }
        }
    }
    function postMessage(data,name) {
        mo.emitter.emit('message_'+name,{data:data});
    }
    // Client.get=function (name) {
    //     return clients[name];
    // };
    Client.doRequest = doRequest;
    window.Client = Client;

})(window);