import { describe, test, expect } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { createRequire } from 'node:module';
const { configure, renderTemplate } = require('../Server/runtime/config.cjs');
const { compareVersions, createManifestStore } = require('../Server/runtime/manifests.cjs');
const { cleanText, cleanValue, pattern } = require('../scripts/lib/content-policy.cjs');
const root = path.resolve(import.meta.dir, '..');
const requireGame = createRequire(path.join(root, 'Server/s1/package.json'));

describe('process configuration', () => {
    test('roles retain separate configuration without overwriting shared files', () => {
        const serverRoot = path.join(root, 'Server/s1');
        const files = ['db.json', 'project.json', 'log4js_server.json'].map(file => path.join(serverRoot, 'config', file));
        const before = files.map(file => fs.readFileSync(file, 'utf8'));
        const game = configure(serverRoot, 'server_cfg.js');
        const city = configure(serverRoot, 'cityserver_cfg.js');
        expect(game.project.serverHttpPort).toBe('20001');
        expect(game.project.cityServerPort).toBe('');
        expect(city.project.cityServerPort).toBe('10001');
        expect(game.db.mainCnn.database).toBe('ttf_ly_main');
        expect(city.db.uwCnn.database).toBe('ttf_ly_game1');
        expect(game.db.uwCnn.debug).toBe(false);
        expect(files.map(file => fs.readFileSync(file, 'utf8'))).toEqual(before);
    });

    test('quoted log paths remain valid JSON', () => {
        const result = renderTemplate(path.join(root, 'Server/s1'), 'log4js_server.json.template2', {
            basePath: 'logs/"quoted"\\path', levels: 'ERROR'
        });
        expect(result.appenders[1].filename).toContain('"quoted"\\path');
    });
});

describe('release manifests', () => {
    test('numeric ordering and cached resource merging handle two digit releases', () => {
        const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'fyqst-manifests-'));
        const write = (version, resources) => fs.writeFileSync(path.join(directory, `manifest${version}.json`),
            JSON.stringify({ game: ['game.js'], project: { version, resRefreshs: resources } }));
        try {
            write('2.9.0', { 'old.png': 'v1', 'shared.png': 'old' });
            write('2.10.0', { 'shared.png': 'new' });
            write('2.11.0', { 'qa.png': 'qa' });
            const store = createManifestStore(directory, { exclude: ['manifest2.11.0.json'] });
            expect(store.latest().project.version).toBe('2.10.0');
            expect(store.latest().project.resRefreshs).toEqual({ 'old.png': 'v1', 'shared.png': 'new' });
            const qa = store.forQA('manifest2.11.0.json', '127.0.0.1', 9901);
            expect(qa.project.isqa).toBe(true);
            expect(store.latest().project.isqa).toBeUndefined();
            expect(() => store.forQA('../config.json', 'x', 1)).toThrow();
            fs.unlinkSync(path.join(directory, 'manifest2.10.0.json'));
            expect(store.latest().project.version).toBe('2.10.0');
            expect(compareVersions('manifest2.10.json', 'manifest2.9.json')).toBeGreaterThan(0);
        } finally { fs.rmSync(directory, { recursive: true, force: true }); }
    });
});

describe('promotion cleanup', () => {
    test('removes promotion paragraphs while retaining the actual announcement', () => {
        const result = cleanText('欢迎来到游戏！\n\n关注公众号 echeverra 获取奖励\n\n尽情体验游戏的快乐吧！');
        expect(result).toBe('欢迎来到游戏！\n\n尽情体验游戏的快乐吧！');
        expect(pattern.test(result)).toBe(false);
    });

    test('nested JSON preserves IDs, inventory quantities, booleans and nulls', () => {
        const result = JSON.parse(cleanValue(JSON.stringify({ id: 1992, name: '关注公众号宝箱',
            items: [[200, 100], [18, 100]], extra: [null, false, { content: '关注公众微信号奖励' }] })));
        expect(result).toEqual({ id: 1992, name: '福利宝箱', items: [[200, 100], [18, 100]],
            extra: [null, false, { content: '福利奖励' }] });
    });

    test('unrelated JSON is returned byte for byte', () => {
        const original = '{ "id": 1, "count": 10, "mail": "公会奖励" }';
        expect(cleanValue(original)).toBe(original);
    });
});

test('Bun serves existing Express routes and CORS preflight', async () => {
    const reset = require('../Server/runtime/reset.cjs')(path.join(root, 'Server/s1'));
    const app = reset.createApp(reset.HttpApp, 0);
    const server = app.locals.server;
    app.get('/', (req, res) => res.json({ ok: true }));
    try {
        if (!server.listening) await once(server, 'listening');
        const url = `http://127.0.0.1:${server.address().port}/`;
        const response = await fetch(url);
        expect(await response.json()).toEqual({ ok: true });
        expect(response.headers.get('access-control-allow-origin')).toBe('*');
        expect((await fetch(url, { method: 'OPTIONS' })).status).toBe(204);
    } finally { await new Promise(resolve => server.close(resolve)); }
});

test('authenticated Socket.IO namespaces support direct WebSocket and acknowledgements', async () => {
    const server = require('node:http').createServer();
    const io = requireGame('socket.io')(server, { serveClient: false });
    io.of('/verified').use((socket, next) => next()).on('connection', socket => {
        socket.on('probe', (value, acknowledge) => acknowledge(value));
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const connect = requireGame('socket.io-client');
    const socket = connect(`http://127.0.0.1:${server.address().port}/verified`, {
        transports: ['websocket'], forceNew: true, reconnection: false
    });
    let timer;
    try {
        const value = await new Promise((resolve, reject) => {
            timer = setTimeout(() => reject(new Error('WebSocket namespace handshake timed out')), 2000);
            socket.on('connect_error', reject);
            socket.on('error', reject);
            socket.on('connect', () => socket.emit('probe', { ok: true, bytes: Buffer.from([0, 1, 255]) }, resolve));
        });
        expect(value.ok).toBe(true);
        expect(Array.from(new Uint8Array(value.bytes))).toEqual([0, 1, 255]);
        expect(socket.io.engine.transport.name).toBe('websocket');
    } finally {
        clearTimeout(timer);
        socket.close();
        await new Promise(resolve => io.close(resolve));
    }
});
