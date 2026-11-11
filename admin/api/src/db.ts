import { SQL } from "bun";
import { A, L, config, table } from "./config";
import { HttpError, integer } from "./validation";

export const db = new SQL(config.dbUrl, {
  max: 6,
  idleTimeout: 20,
  connectionTimeout: 10,
});
export type Query = Pick<SQL, "unsafe">;
export async function migrate() {
  // Additive migrations only: existing users, roles and player tables stay intact.
  await db.unsafe(`CREATE TABLE IF NOT EXISTS ${A("fyqst_admin_session")} (
    token_hash CHAR(64) PRIMARY KEY, user_id INT NOT NULL, csrf CHAR(64) NOT NULL,
    expires_at BIGINT NOT NULL, password_tag CHAR(64) NOT NULL, INDEX(expires_at), INDEX(user_id)
  ) ENGINE=InnoDB`);
  await db.unsafe(`CREATE TABLE IF NOT EXISTS ${A("fyqst_admin_request")} (
    request_key VARCHAR(100) PRIMARY KEY, user_id INT NOT NULL, fingerprint CHAR(64) NOT NULL,
    response MEDIUMTEXT, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`);
  await db.unsafe(
    `DELETE FROM ${A("fyqst_admin_session")} WHERE expires_at < ?`,
    [Date.now()],
  );
  // Successful request keys are retained: retrying an old reward must never resend it.
}
export async function serverContext(value: unknown, q: Query = db) {
  const id = integer(value, "区服", 1);
  const [server] = await q.unsafe(
    `SELECT id,name,area,serverId,dbLink,host,port,isClose FROM ${L("uw_server_info")} WHERE id=?`,
    [id],
  );
  if (!server) throw new HttpError(404, "区服不存在");
  const database = /(?:^|;)database=([^;]+)/i.exec(server.dbLink || "")?.[1];
  if (!database || !config.gameDatabases.includes(database))
    throw new HttpError(422, "区服数据库尚未加入 ADMIN_GAME_DATABASES 配置");
  return { server, database, game: (name: string) => table(database, name) };
}
export async function audit(
  q: Query,
  user: string,
  action: string,
  target: string,
  detail: unknown,
) {
  await q.unsafe(
    `INSERT INTO ${A("osa_sys_log")} (user_name,action,class_name,class_obj,result,op_time) VALUES (?,?,?,?,?,?)`,
    [
      user.slice(0, 32),
      action,
      "BunAdmin",
      target.slice(0, 32),
      JSON.stringify(detail),
      Math.floor(Date.now() / 1000),
    ],
  );
}
export async function pageQuery(
  q: Query,
  source: string,
  columns: string,
  where: string,
  args: unknown[],
  order: string,
  url: URL,
) {
  const page = integer(url.searchParams.get("page") || 1, "页码", 1, 100000);
  const pageSize = integer(
    url.searchParams.get("pageSize") || 20,
    "每页条数",
    1,
    100,
  );
  const [count] = await q.unsafe(
    `SELECT COUNT(*) AS total FROM ${source} WHERE ${where}`,
    args,
  );
  const rows = await q.unsafe(
    `SELECT ${columns} FROM ${source} WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`,
    [...args, pageSize, (page - 1) * pageSize],
  );
  return { rows: [...rows], total: Number(count.total), page, pageSize };
}
