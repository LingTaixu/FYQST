import { resolve } from "node:path";

export function identifier(value: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value))
    throw new Error("无效的数据库标识符");
  return "`" + value + "`";
}
const csv = (value: string) =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
export const config = {
  host: process.env.ADMIN_HOST || "127.0.0.1",
  port: Number(process.env.ADMIN_PORT || 8090),
  dbUrl:
    process.env.ADMIN_DB_URL ||
    "mysql://fyqst:pwd123456@127.0.0.1:3306/ttf_ly_osadmin",
  adminDb: decodeURIComponent(
    new URL(
      process.env.ADMIN_DB_URL || "mysql://localhost/ttf_ly_osadmin",
    ).pathname.slice(1),
  ),
  loginDb: process.env.ADMIN_LOGIN_DB || "ttf_ly_login",
  mainDb: process.env.ADMIN_MAIN_DB || "ttf_ly_main",
  logDb: process.env.ADMIN_LOG_DB || "ttf_ly_gamelog",
  gameDatabases: csv(process.env.ADMIN_GAME_DATABASES || "ttf_ly_game1"),
  gameOrigins: csv(process.env.ADMIN_GAME_ORIGINS || "http://127.0.0.1:20001"),
  origins: csv(
    process.env.ADMIN_ORIGINS ||
      "http://127.0.0.1:8080,http://localhost:8080,http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:8090",
  ),
  gameKey:
    process.env.ADMIN_GAME_KEY || "JAGAHSAAJDF1FRHGAHAJKASKL34TSAFDSDFGA335",
  secureCookie: process.env.ADMIN_SECURE_COOKIE === "true",
  webRoot: resolve(import.meta.dir, "../../web/dist"),
};
for (const db of [
  config.adminDb,
  config.loginDb,
  config.mainDb,
  config.logDb,
  ...config.gameDatabases,
])
  identifier(db);
export function table(db: string, name: string) {
  return `${identifier(db)}.${identifier(name)}`;
}
export const A = (name: string) => table(config.adminDb, name);
export const L = (name: string) => table(config.loginDb, name);
export const M = (name: string) => table(config.mainDb, name);
export const GLog = (name: string) => table(config.logDb, name);
