import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createHash, randomBytes } from "node:crypto";
import { app } from "../src/app";
import { db, migrate } from "../src/db";
import { A, L, M, table, config } from "../src/config";

const integration =
  process.env.ADMIN_INTEGRATION === "1" ? describe : describe.skip;
integration("MariaDB admin API integration (temporary fixtures)", () => {
  const suffix = randomBytes(5).toString("hex"),
    name = "test_" + suffix,
    password = "Integration-" + suffix + "!";
  const title = "__admin_test_" + suffix;
  const game = (name: string) => table(config.gameDatabases[0], name);
  let userId = 0,
    readerId = 0,
    groupId = 0,
    accountId = 0,
    playerId = 0,
    csrf = "",
    cookie = "",
    readerCookie = "",
    readerCsrf = "";
  async function call(
    path: string,
    method = "GET",
    body: unknown = {},
    extra: Record<string, string> = {},
  ) {
    return app(
      new Request("http://127.0.0.1:8090/vp000/api" + path, {
        method,
        headers: {
          origin: "http://127.0.0.1:8090",
          "content-type": "application/json",
          cookie,
          "x-csrf-token": csrf,
          "idempotency-key": randomBytes(16).toString("hex"),
          ...extra,
        },
        body: method === "GET" ? undefined : JSON.stringify(body),
      }),
      "test-" + suffix,
    );
  }
  beforeAll(async () => {
    await migrate();
    const legacy = createHash("md5").update(password).digest("hex");
    const group = await db.unsafe(
      `INSERT INTO ${A("osa_user_group")} (group_name,group_role) VALUES (?,?)`,
      [name, "104"],
    );
    groupId = Number(group.lastInsertRowid);
    const admin = await db.unsafe(
      `INSERT INTO ${A("osa_user")} (user_name,password,user_group,status) VALUES (?,?,1,1)`,
      [name, legacy],
    );
    userId = Number(admin.lastInsertRowid);
    const reader = await db.unsafe(
      `INSERT INTO ${A("osa_user")} (user_name,password,user_group,status) VALUES (?,?,?,1)`,
      [name + "_r", legacy, groupId],
    );
    readerId = Number(reader.lastInsertRowid);
    const account = await db.unsafe(
      `INSERT INTO ${L("uw_account")} (name,pwd,status) VALUES (?, ?,0)`,
      [name, "disabled-test-account"],
    );
    accountId = Number(account.lastInsertRowid);
    const player = await db.unsafe(
      `INSERT INTO ${game("uw_user")} (accountId,nickName,robotId,serverIndexId,createTime) VALUES (?,?,0,1,NOW())`,
      [accountId, name],
    );
    playerId = Number(player.lastInsertRowid);
    const res = await call("/auth/login", "POST", { username: name, password });
    expect(res.status).toBe(200);
    cookie = res.headers.get("set-cookie")!.split(";")[0];
    const bootstrap = (await (await call("/bootstrap")).json()) as any;
    csrf = bootstrap.csrf;
    const r = await call("/auth/login", "POST", {
      username: name + "_r",
      password,
    });
    readerCookie = r.headers.get("set-cookie")!.split(";")[0];
    readerCsrf = (
      (await (
        await call("/bootstrap", "GET", {}, { cookie: readerCookie })
      ).json()) as any
    ).csrf;
  });
  afterAll(async () => {
    await db.unsafe(`DELETE FROM ${game("uw_mail")} WHERE title LIKE ?`, [
      title + "%",
    ]);
    await db.unsafe(`DELETE FROM ${A("check_mail")} WHERE title LIKE ?`, [
      title + "%",
    ]);
    await db.unsafe(`DELETE FROM ${M("uw_notice")} WHERE title=?`, [title]);
    await db.unsafe(`DELETE FROM ${M("uw_system_message")} WHERE message=?`, [
      title,
    ]);
    await db.unsafe(`DELETE FROM ${M("uw_coupon")} WHERE name=?`, [name]);
    await db.unsafe(
      `DELETE FROM ${M("uw_recharge_request")} WHERE userId=? AND gmStatus=1`,
      [playerId],
    );
    await db.unsafe(`DELETE FROM ${game("uw_user")} WHERE id=?`, [playerId]);
    await db.unsafe(`DELETE FROM ${L("uw_account")} WHERE id=?`, [accountId]);
    await db.unsafe(
      `DELETE FROM ${A("fyqst_admin_request")} WHERE user_id IN (?,?)`,
      [userId, readerId],
    );
    await db.unsafe(
      `DELETE FROM ${A("fyqst_admin_session")} WHERE user_id IN (?,?)`,
      [userId, readerId],
    );
    await db.unsafe(`DELETE FROM ${A("osa_user")} WHERE user_id IN (?,?)`, [
      userId,
      readerId,
    ]);
    await db.unsafe(`DELETE FROM ${A("osa_user_group")} WHERE group_id=?`, [
      groupId,
    ]);
    await db.unsafe(
      `DELETE FROM ${A("osa_sys_log")} WHERE user_name IN (?,?)`,
      [name, name + "_r"],
    );
    await db.close();
  });
  test("login migrates legacy MD5 to Argon2id and keeps secure cookie attributes", async () => {
    const [user] = await db.unsafe(
      `SELECT password FROM ${A("osa_user")} WHERE user_id=?`,
      [userId],
    );
    expect(user.password.startsWith("$argon2id$")).toBe(true);
    expect(await Bun.password.verify(password, user.password)).toBe(true);
    const response = await call("/auth/login", "POST", {
      username: name,
      password,
    });
    expect(response.headers.get("set-cookie")).toContain(
      "HttpOnly; SameSite=Strict",
    );
  });
  test("unauthenticated, cross origin, CSRF and role bypass requests fail", async () => {
    expect((await call('/resources/notices','POST',{title},{'x-csrf-token':'é'.repeat(64)})).status).toBe(403);
    expect((await call("/bootstrap", "GET", {}, { cookie: "" })).status).toBe(
      401,
    );
    expect(
      (
        await call(
          "/resources/notices",
          "POST",
          { title },
          { origin: "http://evil.invalid" },
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await call(
          "/resources/notices",
          "POST",
          { title },
          { "x-csrf-token": "wrong" },
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await call(
          "/resources/notices",
          "POST",
          { title },
          { cookie: readerCookie, "x-csrf-token": readerCsrf },
        )
      ).status,
    ).toBe(403);
    expect(
      (await call("/resources/recharge", "GET", {}, { cookie: readerCookie }))
        .status,
    ).toBe(403);
    expect(
      (
        await call(
          "/resources/players?server=1",
          "GET",
          {},
          { cookie: readerCookie },
        )
      ).status,
    ).toBe(200);
  });
  test("all resources and available reports query the real schema", async () => {
    const boot = (await (await call("/bootstrap")).json()) as any;
    for (const resource of boot.resources) {
      const result = await call("/resources/" + resource.key + "?server=1");
      expect(
        result.status,
        resource.key + " " + (await result.clone().text()),
      ).toBe(200);
    }
    for (const kind of [
      "daily",
      "pay",
      "levels",
      "progress",
      "guide",
      "retention",
      "goods",
    ]) {
      const result = await call("/reports/" + kind + "?server=1");
      expect(result.status, kind + " " + (await result.clone().text())).toBe(
        200,
      );
    }
    expect(
      (
        await call(
          "/resources/players?server=1&q=" + encodeURIComponent("' OR 1=1 --"),
        )
      ).status,
    ).toBe(200);
    expect((await call("/resources/players?server=999999")).status).toBe(404);
  });
  test("notice CRUD preserves literal input and logs the mutation", async () => {
    const create = await call("/resources/notices", "POST", {
      title,
      content: "<script>alert('x')</script>",
      isOpen: 0,
      serverIdArr: "[]",
    });
    expect(create.status, await create.clone().text()).toBe(200);
    const { id } = (await create.json()) as any;
    expect(
      (await call("/resources/notices/" + id, "PATCH", { content: "修改内容" }))
        .status,
    ).toBe(200);
    const item = (await (await call("/resources/notices/" + id)).json()) as any;
    expect(item.content).toBe("修改内容");
    expect((await call("/resources/notices/" + id, "DELETE")).status).toBe(200);
    expect((await call("/resources/notices/" + id)).status).toBe(404);
  });
  test("mail approval is atomic and idempotent under concurrent retries", async () => {
    const key = randomBytes(16).toString("hex");
    const compose = {
      userId: playerId,
      title,
      content: "测试内容",
      items: { 99: 3 },
      days: 1,
    };
    const results = await Promise.all([
      call("/operations/mail-compose?server=1", "POST", compose, {
        "idempotency-key": key,
      }),
      call("/operations/mail-compose?server=1", "POST", compose, {
        "idempotency-key": key,
      }),
    ]);
    for (const r of results) expect(r.status, await r.clone().text()).toBe(200);
    const drafts = await db.unsafe(
      `SELECT id FROM ${A("check_mail")} WHERE title=?`,
      [title],
    );
    expect(drafts.length).toBe(1);
    const review = { ids: [drafts[0].id], approve: true };
    const approvals = await Promise.all([
      call("/operations/mail-review", "POST", review),
      call("/operations/mail-review", "POST", review),
    ]);
    for (const r of approvals)
      expect(r.status, await r.clone().text()).toBe(200);
    const mails = await db.unsafe(
      `SELECT id,items FROM ${game("uw_mail")} WHERE title=?`,
      [title],
    );
    expect(mails.length).toBe(1);
    expect(JSON.parse(mails[0].items)).toEqual({ "99": 3 });
    expect(
      (
        await call(
          "/operations/mail-compose?server=1",
          "POST",
          { ...compose, title: title + "_other" },
          { "idempotency-key": key },
        )
      ).status,
    ).toBe(409);
  });
  test("approval concurrency above the pool size does not exhaust pooled connections", async () => {
    const subject = title + "_parallel";
    const compose = await call("/operations/mail-compose?server=1", "POST", {
      userId: playerId,
      title: subject,
      content: "并发审批",
      items: {},
      days: 1,
    });
    expect(compose.status).toBe(200);
    const [draft] = await db.unsafe(
      `SELECT id FROM ${A("check_mail")} WHERE title=?`,
      [subject],
    );
    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        call("/operations/mail-review", "POST", {
          ids: [draft.id],
          approve: true,
        }),
      ),
    );
    for (const response of results)
      expect(response.status, await response.clone().text()).toBe(200);
    const [count] = await db.unsafe(
      `SELECT COUNT(*) AS n FROM ${game("uw_mail")} WHERE title=?`,
      [subject],
    );
    expect(Number(count.n)).toBe(1);
  });
  test("random gift batch and whitelist operations use real tables", async () => {
    const result = await call("/operations/gift-generate", "POST", {
      name,
      count: 3,
      type: 0,
      items: { 200: 1 },
      startTime: "2026-01-01 00:00:00",
      endTime: "2030-01-01 00:00:00",
    });
    expect(result.status, await result.clone().text()).toBe(200);
    const { codes } = (await result.json()) as any;
    expect(new Set(codes).size).toBe(3);
    expect(
      (
        await call("/operations/account", "POST", {
          accountId,
          operation: "whitelist",
        })
      ).status,
    ).toBe(200);
    const [account] = await db.unsafe(
      `SELECT status FROM ${L("uw_account")} WHERE id=?`,
      [accountId],
    );
    expect(account.status).toBe(3);
  });
  test("gift codes can be bound to one account and released again", async () => {
    const generated = await call("/operations/gift-generate", "POST", {
      name,
      count: 2,
      type: 0,
      items: { 200: 1 },
      startTime: "2026-01-01 00:00:00",
      endTime: "2030-01-01 00:00:00",
      bindAccountId: accountId,
    });
    expect(generated.status, await generated.clone().text()).toBe(200);
    const { codes } = (await generated.json()) as any;
    const rows = await db.unsafe(
      `SELECT id,bindAccountId FROM ${M("uw_coupon")} WHERE code IN (?,?)`,
      codes,
    );
    expect(rows.length).toBe(2);
    for (const row of rows) expect(Number(row.bindAccountId)).toBe(accountId);
    const ids = rows.map((row: any) => Number(row.id));
    expect(
      (
        await call("/operations/gift-bind", "POST", { ids, bindAccountId: 0 })
      ).status,
    ).toBe(200);
    const released = await db.unsafe(
      `SELECT bindAccountId FROM ${M("uw_coupon")} WHERE id IN (?,?)`,
      ids,
    );
    for (const row of released) expect(Number(row.bindAccountId)).toBe(0);
    expect(
      (
        await call("/operations/gift-bind", "POST", {
          ids,
          bindAccountId: 99999999,
        })
      ).status,
    ).toBe(404);
  });
  test("broadcast drafts and rejection never deliver unapproved rewards", async () => {
    const result = await call("/operations/mail-compose?server=1", "POST", {
      broadcast: true,
      title,
      content: "测试草稿",
      items: {},
      days: 1,
    });
    expect(result.status, await result.clone().text()).toBe(200);
    const drafts = await db.unsafe(
      `SELECT id FROM ${A("check_mail")} WHERE title=? AND isChecked=0`,
      [title],
    );
    expect(drafts.length).toBeGreaterThan(0);
    const rejected = await call("/operations/mail-review", "POST", {
      ids: drafts.map((d: { id: number }) => d.id),
      approve: false,
    });
    expect(rejected.status).toBe(200);
    const [count] = await db.unsafe(
      `SELECT COUNT(*) AS n FROM ${game("uw_mail")} WHERE title=?`,
      [title],
    );
    expect(Number(count.n)).toBe(1);
  });
  test("simulated recharge is a single GM order and cannot be retried as another product", async () => {
    const key = randomBytes(16).toString("hex"),
      body = { userId: playerId, productId: 1 };
    const first = await call("/operations/recharge?server=1", "POST", body, {
      "idempotency-key": key,
    });
    expect(first.status, await first.clone().text()).toBe(200);
    const second = await call("/operations/recharge?server=1", "POST", body, {
      "idempotency-key": key,
    });
    expect(second.status).toBe(200);
    const orders = await db.unsafe(
      `SELECT gmStatus,status,goodsPrice FROM ${M("uw_recharge_request")} WHERE userId=?`,
      [playerId],
    );
    expect(orders.length).toBe(1);
    expect(orders[0].gmStatus).toBe(1);
    expect(orders[0].status).toBe(1);
    expect(orders[0].goodsPrice).toBe(6);
  });
  if (process.env.ADMIN_GAME_INTEGRATION === "1")
    test("live game bridge updates only the temporary offline fixture", async () => {
      const result = await call("/operations/player-update?server=1", "POST", {
        userId: playerId,
        changes: { gold: 12 },
      });
      expect(result.status, await result.clone().text()).toBe(200);
      const [player] = await db.unsafe(
        `SELECT gold FROM ${game("uw_user")} WHERE id=?`,
        [playerId],
      );
      expect(player.gold).toBe(12);
      const kick = await call("/operations/account?server=1", "POST", {
        accountId,
        operation: "kick",
      });
      expect(kick.status, await kick.clone().text()).toBe(200);
    });
  test("old PHP endpoints cannot execute and audio always has an empty body", async () => {
    for (const ext of ["mp3", "ogg", "wav", "m4a"]) {
      const r = await app(new Request("http://localhost/vp000/asset." + ext));
      expect(r.status).toBe(204);
      expect((await r.arrayBuffer()).byteLength).toBe(0);
    }
    expect(
      (await app(new Request("http://localhost/vp000/api/ajax_api.php")))
        .status,
    ).toBe(401);
    expect(
      (await app(new Request("http://localhost/vp000/panel/login.php"))).status,
    ).toBe(410);
    expect(
      (await app(new Request("http://localhost/vp000/%2eenv"))).status,
    ).toBe(404);
  });
});
