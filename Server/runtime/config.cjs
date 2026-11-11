'use strict';

const fs = require('fs');
const path = require('path');
const configs = new Map();

function renderTemplate(root, name, values) {
    const file = path.join(root, 'template/config', name);
    const template = fs.readFileSync(file, 'utf8');
    return JSON.parse(template.replace(/\$\{(\w+)\}/g, (_, key) => {
        if (!Object.hasOwn(values, key)) throw new Error(`Missing config value: ${key}`);
        // Placeholders inside JSON strings must remain escaped.
        return JSON.stringify(String(values[key])).slice(1, -1);
    }));
}

function configure(root, filename = 'server_cfg.js') {
    root = path.resolve(root);
    const defaults = require(path.join(root, 'env-cfg/server_cfg.js'));
    const cfg = { ...defaults, ...require(path.join(root, 'env-cfg', filename)) };
    const projectValues = {
        mainHttpPort: cfg.mainHttpPort ?? '',
        mainHttpHost: cfg.mainHttpHost ?? '127.0.0.1',
        serverHttpPort: cfg.serverHttpPort ?? '',
        viewHttpPort: cfg.viewHttpPort ?? '',
        versionHttpPort: cfg.versionHttpPort ?? '',
        cityServerPort: cfg.cityServerPort ?? '',
        battleServerPort: cfg.battleServerPort ?? '',
        logHost: cfg.logHost ?? '127.0.0.1',
        logPort: cfg.logPort ?? 7000,
        serverId: cfg.id ?? '',
        gameId: cfg.gameId ?? 0,
        saveDBInterval: cfg.saveDBInterval ?? 5,
        stopInterval: cfg.stopInterval ?? 25,
        biSID: cfg.biSID ?? 0,
        battleId: cfg.battleId ?? 0,
        snid: cfg.snid ?? 0
    };
    const db = {};
    for (const name of ['uwCnn', 'mainCnn', 'kefuCnn', 'loginCnn']) {
        const source = name === 'uwCnn' ? cfg.serverCnn : cfg[name];
        db[name] = { name, dbModule: 'mysql', ...source, debug: false };
    }
    const config = {
        project: renderTemplate(root, 'project.json.template5', projectValues),
        db,
        log4js: require(path.join(root, 'config/log4js.json')),
        log4js_server: renderTemplate(root, 'log4js_server.json.template2', {
            basePath: cfg.log.basePath,
            levels: cfg.log.levels
        }),
        crypt: require(path.join(root, 'config/crypt.json')),
        configDir: path.join(root, 'config/')
    };
    configs.set(root, config);
    return config;
}

function get(root) {
    root = path.resolve(root);
    return configs.get(root) || configure(root);
}

module.exports = { configure, get, renderTemplate };
