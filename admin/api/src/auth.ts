import { createHash, timingSafeEqual, randomBytes } from "node:crypto";
import { A, config } from "./config";
import { audit, db, type Query } from "./db";
import { HttpError, object, text } from "./validation";
import type { Row, SessionUser } from "../../shared/types";

export const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const cookieName = "fyqst_admin";
const lifetime = 8 * 3600000;
export type Actor = {
  user: SessionUser;
  role: Set<number>;
  tokenHash: string;
  csrf: string;
};
export const permissionMenus: Record<string, number[]> = {
  "players.read": [104, 105, 127],
  "players.write": [106],
  "players.progress": [150],
  "bans.read": [119],
  "bans.write": [120, 122],
  "players.kick": [120],
  "mails.read": [109],
  "mails.compose": [107, 125, 126],
  "mails.broadcast": [131],
  "mails.review": [123],
  "messages.read": [112],
  "messages.create": [113],
  "messages.write": [114],
  "notices.read": [115],
  "notices.create": [116],
  "notices.write": [117],
  "activities.read": [133],
  "activities.create": [149],
  "activities.write": [134],
  "gifts.read": [128],
  "gifts.create": [129],
  "gifts.export": [130],
  "guilds.read": [111, 194, 195],
  "chat.read": [121],
  "rewards.read": [184],
  "whitelist.read": [155],
  "whitelist.write": [155],
  "recharge.create": [158],
  "servers.read": [118, 110],
  "reports.summary": [142, 145, 146],
  "reports.pay": [141],
  "reports.levels": [172],
  "reports.goods": [132],
  "reports.progress": [151],
  "reports.guide": [143],
  "reports.retention": [144],
  "reports.recharge": [153, 157],
  "reports.buy": [148],
  "reports.lottery": [147],
  "reports.boss": [154],
};
export function allowed(actor: Actor, permission: string): boolean {
  return (
    actor.user.superAdmin ||
    (permissionMenus[permission] || []).some((id) => actor.role.has(id))
  );
}
export function requirePermission(actor: Actor, permission: string) {
  if (!allowed(actor, permission))
    throw new HttpError(403, "当前管理员没有此操作权限");
}
export function cookie(token: string, clear = false) {
  return `${cookieName}=${token}; Path=/vp000/; HttpOnly; SameSite=Strict; Max-Age=${clear ? 0 : lifetime / 1000}${config.secureCookie ? "; Secure" : ""}`;
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || !config.origins.includes(origin))
    throw new HttpError(403, "请求来源不受信任");
}
const attempts = new Map<string, { count: number; until: number }>();
export async function login(request: Request, body: unknown, ip: string) {
  checkOrigin(request);
  const input = object(body);
  const name = text(input.username, "管理员账号", 50);
  if (
    typeof input.password !== "string" ||
    !input.password ||
    input.password.length > 256
  )
    throw new HttpError(400, "密码长度无效");
  const password = input.password;
  const keys = [`ip:${ip}`, `user:${name.toLowerCase()}`];
  const time = Date.now();
  for (const [key, value] of attempts)
    if (value.until < time) attempts.delete(key);
  for (const key of keys)
    if ((attempts.get(key)?.count || 0) >= 10)
      throw new HttpError(429, "登录尝试过多，请在 15 分钟后重试");
  for (const key of keys) {
    const item = attempts.get(key) || { count: 0, until: time + 900000 };
    item.count++;
    attempts.set(key, item);
  }
  const [record] = await db.unsafe(
    `SELECT u.*,g.group_name FROM ${A("osa_user")} u JOIN ${A("osa_user_group")} g ON g.group_id=u.user_group WHERE u.user_name=? LIMIT 1`,
    [name],
  );
  const stored = String(record?.password || "");
  let valid = false;
  if (/^[a-f0-9]{32}$/i.test(stored))
    valid = timingSafeEqual(
      Buffer.from(stored.toLowerCase()),
      Buffer.from(createHash("md5").update(password).digest("hex")),
    );
  else if (stored.startsWith("$argon2") || stored.startsWith("$2"))
    valid = await Bun.password.verify(password, stored);
  if (!valid || Number(record?.status) !== 1) {
    await audit(db, name, "LOGIN_FAILED", "auth", { ip });
    throw new HttpError(401, "账号或密码错误，或账号已停用");
  }
  const token = randomBytes(32).toString("hex"),
    csrf = randomBytes(32).toString("hex");
  const upgraded = /^[a-f0-9]{32}$/i.test(stored)
    ? await Bun.password.hash(password, { algorithm: "argon2id" })
    : stored;
  await db.begin(async (tx) => {
    const [current] = await tx.unsafe(
      `SELECT password,status FROM ${A("osa_user")} WHERE user_id=? FOR UPDATE`,
      [record.user_id],
    );
    if (current?.password !== stored || Number(current.status) !== 1)
      throw new HttpError(401, "账号状态已更新，请重新登录");
    await tx.unsafe(
      `UPDATE ${A("osa_user")} SET password=?,login_time=?,login_ip=? WHERE user_id=?`,
      [upgraded, Math.floor(time / 1000), ip.slice(0, 32), record.user_id],
    );
    await tx.unsafe(
      `DELETE FROM ${A("fyqst_admin_session")} WHERE user_id=? AND expires_at<?`,
      [record.user_id, time],
    );
    await tx.unsafe(
      `INSERT INTO ${A("fyqst_admin_session")} (token_hash,user_id,csrf,expires_at,password_tag) VALUES (?,?,?,?,?)`,
      [hash(token), record.user_id, csrf, time + lifetime, hash(upgraded)],
    );
    await audit(tx, name, "LOGIN", "auth", { ip });
  });
  keys.forEach((key) => attempts.delete(key));
  return token;
}
export async function authenticate(request: Request): Promise<Actor> {
  const raw = request.headers
    .get("cookie")
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(cookieName + "="))
    ?.slice(cookieName.length + 1);
  if (!raw || !/^[0-9a-f]{64}$/.test(raw))
    throw new HttpError(401, "请先登录运营后台");
  const tokenHash = hash(raw);
  const [r] = await db.unsafe(
    `SELECT s.csrf,s.password_tag,u.user_id,u.user_name,u.real_name,u.user_group,u.password,g.group_name,g.group_role FROM ${A("fyqst_admin_session")} s JOIN ${A("osa_user")} u ON u.user_id=s.user_id JOIN ${A("osa_user_group")} g ON g.group_id=u.user_group WHERE s.token_hash=? AND s.expires_at>? AND u.status=1`,
    [tokenHash, Date.now()],
  );
  if (!r || r.password_tag !== hash(r.password))
    throw new HttpError(401, "登录已过期，请重新登录");
  return {
    user: {
      id: r.user_id,
      name: r.user_name,
      displayName: r.real_name || r.user_name,
      group: r.group_name,
      superAdmin: Number(r.user_group) === 1,
    },
    role: new Set(
      String(r.group_role || "")
        .split(",")
        .map(Number),
    ),
    tokenHash,
    csrf: r.csrf,
  };
}
export function csrfCheck(request: Request, actor: Actor) {
  checkOrigin(request);
  const supplied = request.headers.get("x-csrf-token") || "";
  if (
    !/^[a-f0-9]{64}$/.test(supplied) ||
    !timingSafeEqual(Buffer.from(supplied), Buffer.from(actor.csrf))
  )
    throw new HttpError(403, "请求验证已失效，请刷新页面");
}
export async function logout(actor: Actor) {
  await db.unsafe(
    `DELETE FROM ${A("fyqst_admin_session")} WHERE token_hash=?`,
    [actor.tokenHash],
  );
}
export async function idempotent<T>(
  request: Request,
  actor: Actor,
  body: Row,
  action: (tx: Query) => Promise<T>,
): Promise<T> {
  const key = request.headers.get("idempotency-key");
  if (!key || !/^[a-zA-Z0-9_-]{16,80}$/.test(key))
    throw new HttpError(400, "操作缺少有效的幂等标识，请刷新后重试");
  const scoped = `${actor.user.id}:${key}`;
  const fingerprint = hash(
    `${request.method} ${new URL(request.url).pathname}${new URL(request.url).search}\n${JSON.stringify(body)}`,
  );
  return await db.begin(async (tx) => {
    await tx.unsafe(
      `INSERT IGNORE INTO ${A("fyqst_admin_request")} (request_key,user_id,fingerprint) VALUES (?,?,?)`,
      [scoped, actor.user.id, fingerprint],
    );
    const [saved] = await tx.unsafe(
      `SELECT fingerprint,response FROM ${A("fyqst_admin_request")} WHERE request_key=? FOR UPDATE`,
      [scoped],
    );
    if (saved.fingerprint !== fingerprint)
      throw new HttpError(409, "幂等标识已用于其他操作");
    if (saved.response) return JSON.parse(saved.response) as T;
    const result = await action(tx);
    await tx.unsafe(
      `UPDATE ${A("fyqst_admin_request")} SET response=? WHERE request_key=?`,
      [JSON.stringify(result), scoped],
    );
    return result;
  });
}
