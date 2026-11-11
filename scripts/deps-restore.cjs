'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const archives = require('../vendor/npm/archives.json');

// These helpers are normally bundled inside the published cmdjs tarball.
// Preserve a verified local fallback in case a mirror strips nested modules.
for (const archive of archives) {
    const file = path.join(root, archive.file);
    const digest = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    if (digest !== archive.sha256) throw new Error(`Archive checksum mismatch: ${archive.file}`);
}

const visited = new Set();
function restore(archive, target) {
    if (process.argv.includes('--check')) throw new Error(`Missing bundled module: ${target}`);
    fs.mkdirSync(target, { recursive: true });
    const result = spawnSync('tar', ['-xzf', path.join(root, archive.file), '--strip-components=1', '-C', target], { stdio: 'inherit' });
    if (result.status !== 0) throw new Error(`Cannot restore ${archive.name}`);
    console.log(`Restored ${archive.name}@${archive.version} from ${archive.file}`);
}
for (const archive of archives.filter(item => item.sources)) {
    for (const source of archive.sources) {
        const parts = source.split('/');
        const load = createRequire(path.join(root, 'Server', parts[1], 'package.json'));
        const installed = path.dirname(load.resolve(`${parts[3]}/package.json`));
        for (const target of [path.join(root, source), path.join(installed, ...parts.slice(4))]) {
            if (!fs.existsSync(path.join(target, 'index.js'))) restore(archive, target);
        }
    }
}
for (const service of ['s1', 'uc']) {
    const requireService = createRequire(path.join(root, 'Server', service, 'package.json'));
    const directory = path.dirname(requireService.resolve('cmdjs/package.json'));
    if (visited.has(directory)) continue;
    visited.add(directory);
    for (const archive of archives.filter(item => !item.sources)) {
        const target = path.join(directory, 'src/node_modules', archive.name);
        const manifest = path.join(target, 'package.json');
        if (fs.existsSync(manifest)) {
            const installed = JSON.parse(fs.readFileSync(manifest, 'utf8'));
            if (installed.name !== archive.name || installed.version !== archive.version) {
                throw new Error(`Unexpected cmdjs helper version: ${manifest}`);
            }
            continue;
        }
        restore(archive, target);
    }
}
console.log('Dependency fallback archives and bundled helpers verified.');
