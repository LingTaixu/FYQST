import { A } from "./config";
import { audit, db, migrate } from "./db";
import { text } from "./validation";

const name = text(process.argv[2], "管理员账号", 50);
const password = process.env.ADMIN_PASSWORD || "";
if (password.length < 12 || password.length > 256)
  throw new Error("请通过 ADMIN_PASSWORD 环境变量提供 12 至 256 位密码");
await migrate();
const hash = await Bun.password.hash(password, { algorithm: "argon2id" });
await db.begin(async (tx) => {
  const [existing] = await tx.unsafe(
    `SELECT user_id FROM ${A("osa_user")} WHERE user_name=? FOR UPDATE`,
    [name],
  );
  if (existing && !process.argv.includes("--reset"))
    throw new Error("管理员已存在；显式加 --reset 才会修改其密码");
  if (existing) {
    await tx.unsafe(`UPDATE ${A("osa_user")} SET password=? WHERE user_id=?`, [
      hash,
      existing.user_id,
    ]);
    await tx.unsafe(`DELETE FROM ${A("fyqst_admin_session")} WHERE user_id=?`, [
      existing.user_id,
    ]);
  } else {
    await tx.unsafe(
      `INSERT INTO ${A("osa_user")} (user_name,password,real_name,user_group,status) VALUES (?,?,?,1,1)`,
      [name, hash, name],
    );
  }
  await audit(
    tx,
    "local-cli",
    existing ? "ADMIN_PASSWORD_RESET" : "ADMIN_CREATE",
    name,
    {},
  );
});
await db.close();
console.log("管理员已保存：" + name);
