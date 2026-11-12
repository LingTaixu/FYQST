const { describe, test, expect } = require('bun:test');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(new URL('../deploy/server/gateway.js', import.meta.url), 'utf8');
function gateway() {
    const window = {};
    vm.runInNewContext(source, {
        window, URL, location: { origin: 'http://example.test', href: 'http://example.test/game.html' }
    });
    return window.FyqstGateway;
}
describe('public server gateway', () => {
    test('HTTP calls preserve protocol arguments while using the website origin', () => {
        const g = gateway();
        const params = '/?r=c.n.a&a=%7B%7D&s=abc%2Bdef&c=0';
        expect(g.http(9901, params)).toBe('http://example.test/_api/login' + params);
        expect(g.http('20001', params)).toBe('http://example.test/_api/game' + params);
        expect(() => g.http(3306, params)).toThrow();
    });
    test('city keeps its namespace and authentication query on a separate transport path', () => {
        const options = { query: { accountId: 123, loginKey: 'private' } };
        const result = gateway().socket('http://127.0.0.1:10001/city', options);
        expect(result).toBe('http://example.test/city');
        expect(options.path).toBe('/_socket/city');
        expect(options.query.loginKey).toBe('private');
        expect(options.forceNew).toBe(true);
    });
    test('battle and guild battle keep separate Socket.IO connections', () => {
        for (const ns of ['battle', 'guildbattle']) {
            const options = {};
            expect(gateway().socket('http://127.0.0.1:9001/' + ns, options)).toBe('http://example.test/' + ns);
            expect(options.path).toBe('/_socket/battle');
            expect(options.forceNew).toBe(true);
        }
    });
});
