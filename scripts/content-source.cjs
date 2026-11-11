'use strict';

const fs = require('fs');
const path = require('path');
const { pattern, replacements } = require('./lib/content-policy.cjs');
const root = path.resolve(__dirname, '..');
const apply = process.argv.includes('--apply');
const changes = [];
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const roots = ['Server/sql', 'Server/s1/packages/uw-data', 'Server/uc/packages/uw-data', 'www/wwwroot/www'];

function sanitize(source) {
    let result = source;
    // Preserve the announcement row and its other fields; remove only promotion paragraphs.
    result = result.replace(/(?:游戏 CDK )?关注公众号 echeverra[^\\\n]*(?:\\n){2}/g, '')
        .replace(/更多游戏推荐[：:]\s*https?:\/\/echeverra\.cn\/[^\\\n]*(?:\\n){2}/g, '');
    // Remove the actual menu item in both the normal and combined game bundles.
    result = result.replace(/\{\s*type:\s*g_consts\.FMB_FOCUS,\s*name:\s*["'][^"']*["'],\s*source:\s*["']ico_focus["'],\s*redkey:\s*gc\.c_prop\.pointRedKey\.guanzhugongzhonghao,\s*needLvl:\s*\d+,\s*sort:\s*\d+\s*\},\s*/g, '');
    result = result.replace(/(\.canFocus\s*=\s*function\s*\(\)\s*\{)\s*return[^{}]*?(\})/g, '$1 return !1 $2');
    for (const [from, to] of replacements) result = result.split(from).join(to);
    for (const term of ['微信公众号', '公众微信号', '关注公众号', '公众微信', '微信公众', '公众帐号', '微信号', '关注微信', '公众号']) {
        result = result.split(term).join('福利');
    }
    if (pattern.test(result)) throw new Error('Promotion content needs manual review after cleanup');
    return result;
}

function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (['compiled', 'cache', 'logs'].includes(entry.name)) continue;
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) { visit(file); continue; }
        if (!/\.(?:js|json|php|sql|txt|css|html|tpl)$/i.test(entry.name)) continue;
        const bytes = fs.readFileSync(file);
        const source = bytes.toString('utf8');
        if (!pattern.test(source) && !source.includes('.canFocus') && !source.includes('FMB_FOCUS')) continue;
        if (!Buffer.from(source).equals(bytes)) throw new Error(`Non-UTF8 source requires manual review: ${file}`);
        const updated = sanitize(source);
        if (updated === source) continue;
        const relative = path.relative(root, file);
        changes.push(relative);
        if (apply) {
            const backup = path.join(root, '.local/backups/content-source', stamp, relative);
            fs.mkdirSync(path.dirname(backup), { recursive: true });
            fs.writeFileSync(backup, bytes, { flag: 'wx' });
            fs.writeFileSync(file, updated);
        }
    }
}

for (const directory of roots) visit(path.join(root, directory));
console.log(JSON.stringify({ mode: apply ? 'apply' : 'audit', files: changes.length, matches: changes }, null, 2));
if (process.argv.includes('--check') && changes.length) process.exitCode = 1;
