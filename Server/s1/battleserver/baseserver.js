/**
 * socket server base
 *
 *a wrapper for io.socket,the goal:
 *easy to start
 *scalable 
 *Proactor model base
 *author: Jack Liu
 */
const http = require('http');
const https = require('https');
const io = require('socket.io');
const fs = require('fs');
const path = require('path');

//for testing 
function sleep(time, callback) {
    var stop = new Date().getTime();
    while (new Date().getTime() < stop + time) {;
    }
    callback();
}

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

class Server {
     constructor() {
        this.nspHandler = {};
     }
    //
    // get io(){
    //     return this.io;
    // }
    _clients(ns, cb) {
        ns = ns || '/';
        this.io.of(ns).clients(cb);
    }
    init(config, isHttps) {
        config = { 
            path: '/',
            serveClient: false,
            // below are engine.IO options
            // pingInterval: 5000 * 200,
            // pingTimeout: 15000 * 200,
            cookie: false
        };
        this.config = config;
        if(isHttps){
            const https_options = {
                  key: fs.readFileSync(path.resolve(__dirname, '../data/m.sanguoh5.com.key'), 'utf8'),  
                  cert: fs.readFileSync(path.resolve(__dirname, '../data/m.sanguoh5.com.crt'), 'utf8') 
            };

            this.server = https.createServer(https_options);
        }else{
            this.server = http.createServer();
        }
        this.io = io(this.server, config);

        // nsp
        let keys = Object.keys(this.nspHandler);
        keys.forEach((k) =>{
            this.acceptClients(k);
        }) 
    }
    start(port, cb) { 
        cb = cb || function() {
            console.log('server listening on *:' + port);
        };
        this.server.listen(port, cb);
    }
    stop() {
        this.io.close();
    }
    emit(msg, data, ns) {
        ns = ns || '/';
        this.io.of(ns).emit(msg, data);
    }
    acceptClients(ns) {
        ns = ns || '/';
        var np = this.io.of(ns);
        var self = this;
        var nspHandler = self.nspHandler[ns]; 
        np.use((socket, next) => {
            var query = socket.handshake.query;
            //console.log("middleware socket:",socket.id,query);
            nspHandler.isValidSocket(socket, query, this, next);
        });

        np.on('connection', function(socket) {
            //console.log(ns + "  connecting...");
            self.accept(socket, ns);
        });
        return np;
    }
    accept(socket, ns) {
        var self = this;
        //console.log('client connect ', socket.id);
        var nspFunc = this.nspHandler[ns];
        //console.log('nspFunc ', nspFunc);
        var keys = Object.keys(nspFunc); // Object.getOwnPropertyNames(self.constructor.prototype);
        if (nspFunc.onconnect) {
            nspFunc.onconnect(socket);
        }
        keys.forEach(function(pc) {
            var pre = pc.substr(0, 2);
            if (pre == 'on') {
                var h = nspFunc[pc];
                if (h instanceof Function) {
                    //console.log('setup handle', pc);
                    socket.on(pc.substr(2), function(data) {
                        h.call(self, socket, data);
                    });
                }
            }

        });
    }
}

module.exports = Server;