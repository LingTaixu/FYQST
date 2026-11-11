import { test, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dir, '..');

for (const service of ['s1', 'uc']) {
    test(`${service}: every declared dependency resolves to its pinned or local version`, () => {
        const manifestFile = path.join(root, 'Server', service, 'package.json');
        const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
        const load = createRequire(manifestFile);
        for (const [name, version] of Object.entries(manifest.dependencies)) {
            const installed = load(`${name}/package.json`);
            expect(installed.name).toBe(name);
            if (version.startsWith('file:')) {
                const source = JSON.parse(fs.readFileSync(path.resolve(path.dirname(manifestFile), version.slice(5), 'package.json'), 'utf8'));
                expect(installed.version).toBe(source.version);
                if (source.main) expect(fs.existsSync(load.resolve(name))).toBe(true);
            } else {
                expect(installed.version).toBe(version);
            }
        }
        const helpers = path.join(path.dirname(load.resolve('cmdjs/package.json')), 'src/node_modules');
        const logger = load(path.join(helpers, 'logger'));
        expect(typeof logger.initLogger).toBe('function');
        expect(typeof logger.setLvl).toBe('function');
        const utils = load(path.join(helpers, 'str-utils'));
        expect(typeof utils.format).toBe('function');
        expect(typeof utils.formatPlaceholder).toBe('function');
        for (const parent of ['uw-monitor-http', 'uw-view-http']) {
            const directory = path.dirname(load.resolve(`${parent}/package.json`));
            expect(typeof load(path.join(directory, 'lib/uwa-middleware')).mvc.init).toBe('function');
            expect(fs.existsSync(path.join(directory, 'lib/uwa-tools/index.js'))).toBe(true);
        }
    });
}
