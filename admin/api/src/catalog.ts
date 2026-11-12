import { createRequire } from "node:module";
import { L } from "./config";
import { db } from "./db";

const require = createRequire(import.meta.url);
type ItemDef = {
  id: number;
  name: string;
  note?: string;
  type?: number;
  count?: number;
};
const table: Record<string, ItemDef> = require(
  "../../../Server/s1/packages/uw-data/temp/t_item.js",
);
const prop = require("../../../Server/s1/packages/uw-data/temp/c_prop.js");
const typeLabels: Record<string, string> = prop.itemType || {};
const typeName = (type: number) =>
  (typeLabels[String(type)] || "").split(",")[1] || "道具";

export type Item = {
  id: number;
  name: string;
  note: string;
  type: number;
  typeName: string;
  max: number;
};
const all: Item[] = Object.values(table)
  .filter((item) => item && item.id > 0 && item.name)
  .map((item) => ({
    id: item.id,
    name: item.name,
    note: String(item.note || "")
      .replace(/\[\/br\]/g, " ")
      .slice(0, 80),
    type: item.type ?? 0,
    typeName: typeName(item.type ?? 0),
    max: item.count || 0,
  }));
// 运营最常用的两种货币排在最前，方便空搜索时直接选择。
const pinned = [99, 200];
const ordered = [
  ...all.filter((item) => pinned.includes(item.id)),
  ...all.filter((item) => !pinned.includes(item.id)),
];

export function searchItems(query: string, ids: number[], limit: number): Item[] {
  if (ids.length) {
    const wanted = new Set(ids);
    return ordered.filter((item) => wanted.has(item.id));
  }
  const q = query.trim();
  if (!q) return ordered.slice(0, limit);
  const numeric = /^\d+$/.test(q) ? Number(q) : 0;
  const lower = q.toLowerCase();
  const hits: { score: number; item: Item }[] = [];
  for (const item of ordered) {
    let score = 0;
    if (numeric && item.id === numeric) score = 100;
    else if (item.name === q) score = 90;
    else if (numeric && String(item.id).startsWith(q)) score = 70;
    else if (item.name.includes(q)) score = 50;
    else if (item.name.toLowerCase().includes(lower)) score = 40;
    if (score) hits.push({ score, item });
  }
  hits.sort((a, b) => b.score - a.score || a.item.id - b.item.id);
  return hits.slice(0, limit).map((hit) => hit.item);
}

export function itemTypeName(id: number) {
  return typeName(id);
}

export async function searchAccounts(query: string, limit: number) {
  const q = query.trim();
  if (!q)
    return [
      ...(await db.unsafe(
        `SELECT id,name,status FROM ${L("uw_account")} ORDER BY id DESC LIMIT ?`,
        [limit],
      )),
    ];
  const escaped = q.replace(/[\\%_]/g, (ch) => "\\" + ch);
  const numeric = /^\d+$/.test(q) ? Number(q) : 0;
  return [
    ...(await db.unsafe(
      `SELECT id,name,status FROM ${L("uw_account")} WHERE name LIKE ? OR id=? ORDER BY (name=?) DESC, id DESC LIMIT ?`,
      [`%${escaped}%`, numeric, q, limit],
    )),
  ];
}
