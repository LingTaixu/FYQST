'use strict';
const fs = require('fs');
const path = require('path');

function compareVersions(left, right) {
    const parts = name => path.basename(name, '.json').replace(/^manifest/, '').split('.').map(Number);
    const a = parts(left), b = parts(right);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const delta = (a[i] || 0) - (b[i] || 0);
        if (delta) return delta;
    }
    return 0;
}

function createManifestStore(directory, { exclude = [], history = 5 } = {}) {
    const files = fs.readdirSync(directory)
        .filter(file => /^manifest\d+(?:\.\d+)*\.json$/.test(file) && !exclude.includes(file))
        .sort(compareVersions).slice(-history);
    if (!files.length) throw new Error(`No release manifests in ${directory}`);
    const read = file => JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
    const manifests = files.map(read);
    const latest = structuredClone(manifests[manifests.length - 1]);
    latest.project.resRefreshs = Object.assign({}, ...manifests.map(item => item.project.resRefreshs));
    const qaCache = new Map();
    return {
        latest: () => latest,
        forQA(file, host, port) {
            if (!/^manifest\d+(?:\.\d+)*\.json$/.test(file)) throw new Error('Invalid QA manifest name');
            const key = JSON.stringify([file, host, port]);
            if (!qaCache.has(key)) {
                const qa = read(file);
                qa.project.resRefreshs = { ...latest.project.resRefreshs, ...qa.project.resRefreshs };
                Object.assign(qa.project, { httpHost: host, httpPort: port, isqa: true });
                qaCache.set(key, qa);
            }
            return qaCache.get(key);
        }
    };
}

module.exports = { compareVersions, createManifestStore };
