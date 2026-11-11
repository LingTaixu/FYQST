'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const net = require('net');
const { createRequire } = require('module');
const { configure } = require('./config.cjs');

module.exports = function createReset(root) {
    const requireApp = createRequire(path.join(root, 'app.js'));
    const reset = {
        HttpApp: 0, HttpsApp: 1, Http2App: 2, HttpAndsApp: 3, HttpAnd2App: 4,
        resetMain: () => configure(root, 'main_cfg.js'),
        resetView: () => configure(root, 'view_cfg.js'),
        resetVersion: () => configure(root, 'version_cfg.js'),
        resetServer: p => configure(root, p ? `server_cfg_${p}.js` : 'server_cfg.js'),
        resetCityServer: p => configure(root, p ? `cityserver_cfg_${p}.js` : 'cityserver_cfg.js'),
        resetBattleServer: () => configure(root, 'battleserver_cfg.js')
    };

    function secureServer(app, http2 = false) {
        const options = {
            key: fs.readFileSync(path.join(root, 'data/m.sanguoh5.com.key')),
            cert: fs.readFileSync(path.join(root, 'data/m.sanguoh5.com.crt'))
        };
        if (http2) {
            return require('http2').createSecureServer({ ...options, allowHTTP1: true }, app);
        }
        return https.createServer(options, app);
    }

    reset.createApp = function(type, port, noJson) {
        const app = requireApp('express')();
        app.all('*', (req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'X-Requested-With');
            res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
            res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.header('Expires', '-1');
            res.header('Pragma', 'no-cache');
            if (!noJson) res.header('Content-Type', 'application/json;charset=utf-8');
            if (req.method === 'OPTIONS') return res.sendStatus(204);
            next();
        });
        const listen = server => {
            server.on('error', error => {
                console.error(error);
                process.exit(1);
            });
            return server;
        };
        let server;
        if (type === reset.HttpApp) server = http.createServer(app);
        else if (type === reset.HttpsApp || type === reset.Http2App) {
            server = secureServer(app, type === reset.Http2App);
        } else if (type === reset.HttpAndsApp || type === reset.HttpAnd2App) {
            const plain = listen(http.createServer(app));
            const secure = listen(secureServer(app, type === reset.HttpAnd2App));
            plain.listen(0, '127.0.0.1');
            secure.listen(0, '127.0.0.1');
            server = net.createServer(socket => {
                socket.once('data', buffer => {
                    const target = buffer[0] === 22 ? secure : plain;
                    const proxy = net.connect(target.address().port, '127.0.0.1', () => {
                        proxy.write(buffer);
                        socket.pipe(proxy).pipe(socket);
                    });
                    socket.on('error', () => proxy.destroy());
                    socket.on('close', () => proxy.destroy());
                    proxy.on('error', () => socket.destroy());
                    proxy.on('close', () => socket.destroy());
                });
            });
        } else throw new Error(`Unknown HTTP server type: ${type}`);
        listen(server).listen(Number(port));
        app.locals.server = server;
        console.log(`HTTP service listening on ${port}`);
        return app;
    };
    return reset;
};
