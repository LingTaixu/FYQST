'use strict';
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { createRequire } = require('node:module');
const root = process.env.FYQST_ROOT;
if (!root || !process.env.FYQST_DB_PASSWORD || !process.env.FYQST_ADMIN_KEY) {
    throw new Error('Missing FYQST deployment environment');
}

// Keep connection details out of Git and reduce the old 60-connection pools.
for (const app of ['uc', 's1']) {
    const dir = path.join(root, 'Server', app);
    for (const file of fs.readdirSync(path.join(dir, 'env-cfg'))) {
        if (!file.endsWith('.js')) continue;
        const cfg = require(path.join(dir, 'env-cfg', file));
        for (const key of ['serverCnn', 'mainCnn', 'kefuCnn', 'loginCnn']) {
            if (cfg[key]) Object.assign(cfg[key], {
                host: '127.0.0.1', user: 'fyqst',
                password: process.env.FYQST_DB_PASSWORD, maxCnnNum: 6
            });
        }
    }
    require(path.join(dir, 'config/crypt.json')).adminKey = process.env.FYQST_ADMIN_KEY;
}

// The original HTTP and Socket.IO applications omit the listen host.
// Limit these listeners to loopback without changing the source checkout.
const listen = http.Server.prototype.listen;
http.Server.prototype.listen = function (port, ...args) {
    if (typeof port === 'number' || (typeof port === 'string' && /^\d+$/.test(port))) {
        if (typeof args[0] !== 'string') args.unshift('127.0.0.1');
    }
    return listen.call(this, port, ...args);
};

// The public asset copy has two gateway calls; invalidate their old resource tags.
const manifests = require(path.join(root, 'Server/runtime/manifests.cjs'));
const createStore = manifests.createManifestStore;
manifests.createManifestStore = function (...args) {
    const store = createStore(...args);
    for (const name of ['game2.min.js', 'all.min.js']) {
        store.latest().project.resRefreshs['libs/modules/' + name] = 'server-gateway-v1';
    }
    return store;
};

// Configure the login process before loading SDK modules that capture uw-config.
// Preload microtasks run before the entry file, so SDKs must not load there.
const runtime = require(path.join(root, 'Server/runtime/config.cjs'));
const configure = runtime.configure;
runtime.configure = function (directory, filename) {
    const result = configure(directory, filename);
    if (path.resolve(directory) === path.join(root, 'Server/uc') && filename === 'main_cfg.js') {
        const appRequire = createRequire(path.join(root, 'Server/uc/package.json'));
        appRequire('uw-sdk').soeasyBiz.appKey = process.env.FYQST_SDK_KEY;
    }
    return result;
};
