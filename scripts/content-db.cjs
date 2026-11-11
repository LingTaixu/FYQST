'use strict';

const fs = require('fs');
const path = require('path');
const { createRequire } = require('node:module');
const requireGame = createRequire(path.resolve(__dirname, '../Server/s1/package.json'));
const mysql = requireGame('mysql');
const { terms, pattern, cleanValue } = require('./lib/content-policy.cjs');
const schemas = ['account', 'gmdbyzf', 'ttf_ly_login', 'ttf_ly_main', 'ttf_ly_game1', 'ttf_ly_gamelog', 'ttf_ly_osadmin'];
const apply = process.argv.includes('--apply');
const check = process.argv.includes('--check');
const connection = mysql.createConnection({
    ...require('../Server/s1/env-cfg/server_cfg.js').mainCnn,
    charset: 'utf8mb4', multipleStatements: false
});
const query = (sql, params = []) => new Promise((resolve, reject) => {
    connection.query(sql, params, (error, rows) => error ? reject(error) : resolve(rows));
});
const quote = mysql.escapeId;

async function main() {
    const columns = await query(`SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, COLUMN_KEY, DATA_TYPE
        FROM information_schema.COLUMNS WHERE TABLE_SCHEMA IN (?)
        ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION`, [schemas]);
    const tables = new Map();
    for (const column of columns) {
        const key = `${column.TABLE_SCHEMA}.${column.TABLE_NAME}`;
        if (!tables.has(key)) tables.set(key, { schema: column.TABLE_SCHEMA, name: column.TABLE_NAME, primary: [], text: [] });
        const table = tables.get(key);
        if (column.COLUMN_KEY === 'PRI') table.primary.push(column.COLUMN_NAME);
        if (/char|text|json|enum|set/.test(column.DATA_TYPE)) table.text.push(column.COLUMN_NAME);
    }
    const changes = [];
    for (const table of tables.values()) {
        if (!table.text.length) continue;
        const tableName = `${quote(table.schema)}.${quote(table.name)}`;
        const selected = [...new Set([...table.primary, ...table.text])].map(quote).join(', ');
        const where = table.text.map(col => `${quote(col)} REGEXP ?`).join(' OR ');
        const rows = await query(`SELECT ${selected} FROM ${tableName} WHERE ${where}`, table.text.map(() => terms.join('|')));
        for (const row of rows) {
            const values = {};
            for (const col of table.text) {
                if (typeof row[col] !== 'string' || !pattern.test(row[col])) continue;
                const cleaned = cleanValue(row[col]);
                if (pattern.test(cleaned)) {
                    throw new Error(`Content requires manual review: ${tableName}.${quote(col)}`);
                }
                if (cleaned !== row[col]) values[col] = cleaned;
            }
            if (Object.keys(values).length) {
                if (!table.primary.length) throw new Error(`Cannot safely update table without primary key: ${tableName}`);
                changes.push({ table: tableName, primary: Object.fromEntries(table.primary.map(col => [col, row[col]])), before: Object.fromEntries(Object.keys(values).map(col => [col, row[col]])), after: values });
            }
        }
    }
    console.log(JSON.stringify({ mode: apply ? 'apply' : 'audit', rows: changes.length,
        matches: changes.map(change => ({ table: change.table, primary: change.primary, columns: Object.keys(change.after) })) }, null, 2));
    if (apply && changes.length) {
        const directory = path.resolve(__dirname, '../.local/backups/content');
        fs.mkdirSync(directory, { recursive: true });
        const backup = path.join(directory, `${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
        fs.writeFileSync(backup, JSON.stringify(changes, null, 2), { flag: 'wx' });
        await query('START TRANSACTION');
        try {
            for (const change of changes) {
                const predicates = Object.keys(change.primary).map(col => `${quote(col)} <=> ?`).join(' AND ');
                // Match original content too, avoiding overwriting concurrent edits.
                const original = Object.keys(change.before).map(col => `${quote(col)} <=> ?`).join(' AND ');
                const updated = await query(`UPDATE ${change.table} SET ? WHERE ${predicates} AND ${original}`,
                    [change.after, ...Object.values(change.primary), ...Object.values(change.before)]);
                if (updated.affectedRows !== 1) throw new Error(`Row changed during cleanup: ${change.table}`);
            }
            await query('COMMIT');
            console.log(`Updated ${changes.length} rows. Backup: ${backup}`);
        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }
    }
    if (check && changes.length) process.exitCode = 1;
}

main().catch(error => { console.error(error); process.exitCode = 1; })
    .finally(() => connection.end());
