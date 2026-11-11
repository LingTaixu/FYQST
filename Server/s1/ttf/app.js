const http = require('http');

const server = http.createServer();

const WebSocket = require('ws');

const wss = new WebSocket.Server({
    //port: 8080,
    server: server,
    perMessageDeflate: {
        zlibDeflateOptions: { // See zlib defaults.
            chunkSize: 1024,
            memLevel: 7,
            level: 3,
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        // Other options settable:
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        clientMaxWindowBits: 10, // Defaults to negotiated value.
        serverMaxWindowBits: 10, // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for perf.
        threshold: 1024, // Size (in bytes) below which messages
        // should not be compressed.
    }
});

wss.on('connection', function connection(ws) {

    ws.on('message', function(message) {
        console.log('received: %s', message);
        response(ws, JSON.parse(message));
    });

    console.log('client coming', ws.readyState);
    // let hello = {
    //     msg: 'hello'
    // };
    // ws.send(JSON.stringify(hello));
});



const iface = require('./iface');
// console.log(iface);
// const client_g = http.createClient(24000, '192.168.28.231');
// const client_s = http.createClient(24200, '192.168.28.231');

// private m_respKey_msgCode = 'm';
//         private m_respKey_msgArgs = 'a';
//         private m_respKey_value ='v';
//         private m_httpKey_route = "r";
//         private m_httpKey_args = "a";
//         private m_httpKey_sessionId = "s";
//         private m_httpKey_handler = "h";
//获取http的参数
let httpSessionId;
const gc = {
    iface: iface
};

function _getHttpParams(route, args) {
    // console.log('_getHttpParams', args);
    var params = "/?";
    params += "r=" + route; //TODO
    params += "&a=" + JSON.stringify(args); //TODO
    params += "&s=" + httpSessionId || ""; //TODO
    params += "&c=0"; //TODO
    return params;
};

const mo = {
    requestWaiting4Http: function(iface, args, cb, target) {
        let url = 'http://192.168.28.231:24000' + _getHttpParams(iface, args);
        this.request(url, cb);
    },
    request4Http: function(iface, args, cb, target) {
        let url = 'http://192.168.28.231:24000' + _getHttpParams(iface, args);
        console.log('request ', url);
        this.request(url, cb);
    },
    request4Game: function(iface, args, cb, target) {
        let url = 'http://192.168.28.231:24200' + _getHttpParams(iface, args);
        console.log('request ', url);
        this.request(url, cb);
    },
    requestWaiting4Game: function(iface, args, cb, target) {
        let url = 'http://192.168.28.231:24200' + _getHttpParams(iface, args);
        console.log('request ', url);
        this.request(url, cb);
    },
    request: function(url, cb) {
        http.get(url, function(res) {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];

            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`);
            } else if (!/^application\/json/.test(contentType)) {
                error = new Error('Invalid content-type.\n' +
                    `Expected application/json but received ${contentType}`);
            }
            if (error) {
                console.error(error.message);
                // consume response data to free up memory
                res.resume();
                return;
            }

            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    console.log(parsedData);
                    // process.nextTick(function(){

                    // });
                    cb(parsedData);
                } catch (e) {
                    console.error(e.message);
                }
            });
        });
    }

};


function response(ws, data) {

    let rid = data.rid;
    let iface = data.iface;
    let args = data.args;

    if (iface == "h.a.a1" || iface == "h.a.a") {
        console.log('recieve iface', iface);
        login(args['_0'], args['_1'], args['_2'], function(res) {
            console.log('ws login back',res);
            let data = {};
            data.rid = rid;
            data.iface = iface;
            data.res = res;
            ws.send(JSON.stringify(data));
        });
        return;
    }

    mo.request4Game(iface, args, function(res) {

        let data = {};
        data.rid = rid;
        data.iface = iface;
        data.res = res;
        ws.send(JSON.stringify(data));
    });
}



function connect(isServer,cb) {
    let rq = null;
    if (isServer) {
        rq = mo.request4Http;

        mo.request4Http(gc.iface.c_net_connect, {}, function(data) {

            // httpSessionId = data.v[0];

            // serverCryptKey = data[1];


            server.listen(8080);
            console.log('server start at ', 8080);
            console.log('=============ser session id', httpSessionId, JSON.stringify(data));
            // login('dasdas', 'dasdas', 99999);


        });
    } else {
        // rq=mo.request4Game;
        mo.request4Game(gc.iface.c_net_connect, {}, function(data) {

            httpSessionId = data.v[0];

            console.log('=============game session id', httpSessionId, JSON.stringify(data));
            cb();

        });
    }

}

connect(true);

function login(name, pwd, channelId,cb) {


    var argsObj = gc.iface.h_account_login_args,
        args = {};
    args[argsObj.name] = name;
    args[argsObj.pwd] = pwd;
    args[argsObj.channelId] = channelId;

    console.log('login server');
    mo.request4Http(gc.iface.h_account_login, args, function(data) {

        // console.log('login', JSON.stringify(data));
        if (data.v) {
            console.log('connect game');
            connect(false,function(){
                console.log('back login');
                cb(data);
            });
        }


    });
}

function enterGame() {
    var argsObj = gc.iface.c_account_enterGame_args,
        args = {};
    args[argsObj.accountId] = 8603;
    args[argsObj.loginKey] = 'ncqelzylfhrsufok';
    args[argsObj.serverIndexId] = 1;

    mo.request4Game(gc.iface.c_account_enterGame, args, function(loginData) {

        console.log('entergame', JSON.stringify(loginData));
    });
}