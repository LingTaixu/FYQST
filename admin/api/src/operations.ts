import { randomBytes } from "node:crypto";
import { A, L, M, identifier } from "./config";
import { db, audit, serverContext, type Query } from "./db";
import { requirePermission, idempotent, type Actor } from "./auth";
import {
  attachments,
  dateTime,
  HttpError,
  integer,
  now,
  object,
  text,
  validateFields,
} from "./validation";
import { gameCall, rechargeProducts } from "./game";
import { mysqlDate } from "./time";
import type { Field, Row } from "../../shared/types";

export const playerFields: Field[] = [
  { key: "gold", label: "金币", type: "number" },
  { key: "diamond", label: "钻石", type: "number" },
  { key: "lvl", label: "等级", type: "number", min: 1, max: 999 },
  ...[
    "rebirthLvl",
    "rebirthExp",
    "achieveLvl",
    "achieveExp",
    "cybLvl",
    "cybExp",
    "jxLvl",
    "jxExp",
    "highPaTa",
    "magicLvl",
  ].map((key) => ({ key, label: key, type: "number" as const })),
];
export async function playerDetail(actor: Actor, url: URL, id: string) {
  requirePermission(actor, "players.read");
  const { game } = await serverContext(url.searchParams.get("server") || 1);
  const uid = integer(id, "角色 ID", 1);
  const [player] = await db.unsafe(
    `SELECT accountId FROM ${game("uw_user")} WHERE id=? AND accountId<>0 AND robotId=0`,
    [uid],
  );
  if (!player) throw new HttpError(404, "角色不存在");
  const [account] = await db.unsafe(
    `SELECT id,name,status,bendType,bendExpireAt,channelId FROM ${L("uw_account")} WHERE id=?`,
    [player.accountId],
  );
  const progress = await db.unsafe(
    `SELECT id,copyType,pCopyId,copyObj,finished FROM ${game("uw_copy_progress")} WHERE userId=?`,
    [uid],
  );
  return { account: account || null, progress: [...progress] };
}
export async function perform(
  request: Request,
  actor: Actor,
  action: string,
  url: URL,
  raw: unknown,
) {
  const body = object(raw),
    serverId = integer(url.searchParams.get("server") || 1, "区服", 1);
  if (action === "player-update") {
    requirePermission(actor, "players.write");
    const userId = integer(body.userId, "角色 ID", 1),
      changes = validateFields(body.changes, playerFields, false);
    const { game } = await serverContext(serverId);
    const [player] = await db.unsafe(
      `SELECT id FROM ${game("uw_user")} WHERE id=? AND accountId<>0 AND robotId=0`,
      [userId],
    );
    if (!player) throw new HttpError(404, "角色不存在");
    return idempotent(request, actor, body, async (tx) => {
      const result = await gameCall(
        serverId,
        "admin.ops.a",
        {
          userId,
          changes,
        },
        tx,
      );
      if (!result?.applied)
        throw new HttpError(
          502,
          "游戏服务尚未载入新版运营接口，请重启游戏服务",
        );
      await audit(tx, actor.user.name, "PLAYER_UPDATE", `player:${userId}`, {
        serverId,
        changes,
      });
      return {
        message: "已应用到游戏缓存，将按游戏保存周期写入数据库",
        result,
      };
    });
  }
  if (action === "player-progress") {
    requirePermission(actor, "players.progress");
    const { game } = await serverContext(serverId);
    const userId = integer(body.userId, "角色 ID", 1),
      copyType = integer(body.copyType, "关卡类型", 0, 100),
      progress = integer(body.progress, "关卡进度", 1, 99999);
    return idempotent(request, actor, body, async (tx) => {
      const result = await tx.unsafe(
        `UPDATE ${game("uw_copy_progress")} SET copyObj=? WHERE userId=? AND copyType=?`,
        [JSON.stringify({ [progress + 100000]: 1 }), userId, copyType],
      );
      if (!result.affectedRows) throw new HttpError(404, "没有匹配的关卡记录");
      await audit(tx, actor.user.name, "PLAYER_PROGRESS", `player:${userId}`, {
        serverId,
        copyType,
        progress,
      });
      return { message: "关卡数据已更新" };
    });
  }
  if (action === "account")
    return accountOperation(request, actor, body, serverId);
  if (action === "mail-compose")
    return composeMail(request, actor, body, serverId);
  if (action === "mail-review") return reviewMail(request, actor, body);
  if (action === "gift-generate") return generateGifts(request, actor, body);
  if (action === "recharge")
    return simulateRecharge(request, actor, body, serverId);
  throw new HttpError(404, "操作不存在");
}
async function accountOperation(
  request: Request,
  actor: Actor,
  body: Row,
  serverId: number,
) {
  const operation = text(body.operation, "操作", 30);
  if (
    ![
      "ban",
      "unban",
      "mute",
      "unmute",
      "shadow",
      "whitelist",
      "unwhitelist",
      "kick",
    ].includes(operation)
  )
    throw new HttpError(400, "账号操作无效");
  requirePermission(
    actor,
    operation.includes("whitelist")
      ? "whitelist.write"
      : operation === "kick"
        ? "players.kick"
        : "bans.write",
  );
  const accountId = integer(body.accountId, "账号 ID", 1);
  const expiry =
    operation === "mute" ? dateTime(body.expiresAt, "禁言截止时间") : null;
  if (expiry && expiry <= now())
    throw new HttpError(400, "禁言截止时间必须晚于当前时间");
  return idempotent(request, actor, body, async (tx) => {
    const [account] = await tx.unsafe(
      `SELECT id FROM ${L("uw_account")} WHERE id=? FOR UPDATE`,
      [accountId],
    );
    if (!account) throw new HttpError(404, "账号不存在");
    const updates: Record<string, Row> = {
      ban: { status: 1 },
      unban: { status: 0 },
      mute: { bendType: 1, bendExpireAt: expiry },
      unmute: { bendType: 0, bendExpireAt: null },
      shadow: { bendType: 3, bendExpireAt: null },
      whitelist: { status: 3 },
      unwhitelist: { status: 0 },
    };
    // A ban is not reported as complete if the selected game service cannot kick the session.
    if (operation === "kick" || operation === "ban")
      await gameCall(
        serverId,
        "admin.ops.c",
        {
          accountId,
          serverIndexId: serverId,
        },
        tx,
      );
    const changes = updates[operation];
    if (changes)
      await tx.unsafe(
        `UPDATE ${L("uw_account")} SET ${Object.keys(changes)
          .map((k) => `${identifier(k)}=?`)
          .join(",")} WHERE id=?`,
        [...Object.values(changes), accountId],
      );
    await audit(
      tx,
      actor.user.name,
      "ACCOUNT_" + operation.toUpperCase(),
      `account:${accountId}`,
      { serverId, expiresAt: expiry },
    );
    return { message: "账号操作已完成" };
  });
}
async function composeMail(
  request: Request,
  actor: Actor,
  body: Row,
  serverId: number,
) {
  const broadcast = body.broadcast === true;
  requirePermission(actor, broadcast ? "mails.broadcast" : "mails.compose");
  const { game } = await serverContext(serverId);
  const title = text(body.title, "标题", 50),
    content = text(body.content, "正文", 20000),
    fromName = text(body.fromName || "运营团队", "发件人", 50);
  const items = attachments(body.items || {}),
    days = integer(body.days || 30, "有效天数", 1, 365);
  const expires = new Date(Date.now() + days * 86400000 + 8 * 3600000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  const uid = broadcast ? 0 : integer(body.userId, "角色 ID", 1);
  return idempotent(request, actor, body, async (tx) => {
    const [count] = await tx.unsafe(
      `SELECT COUNT(*) AS n FROM ${game("uw_user")} WHERE accountId<>0 AND robotId=0${broadcast ? "" : " AND id=?"}`,
      broadcast ? [] : [uid],
    );
    const n = Number(count.n);
    if (!n) throw new HttpError(404, "没有可收件的真实角色");
    if (n > 50000)
      throw new HttpError(422, "单批邮件超过 50000 人，请按区服分批发送");
    await tx.unsafe(
      `INSERT INTO ${A("check_mail")} (userId,type,platform,serverId,fromName,title,content,replaceArgs,items,delHours,expireTime,addTime,nickName,isChecked)
      SELECT id,0,'local',?,?,?,?,'[]',?,24,?,?,nickName,0 FROM ${game("uw_user")} WHERE accountId<>0 AND robotId=0${broadcast ? "" : " AND id=?"}`,
      [
        serverId,
        fromName,
        title,
        content,
        items,
        expires,
        now(),
        ...(broadcast ? [] : [uid]),
      ],
    );
    await audit(tx, actor.user.name, "MAIL_DRAFT", `server:${serverId}`, {
      title,
      recipients: n,
      userId: uid,
      broadcast,
      items: JSON.parse(items),
    });
    return { message: `已创建 ${n} 封待审核邮件`, recipients: n };
  });
}
async function reviewMail(request: Request, actor: Actor, body: Row) {
  requirePermission(actor, "mails.review");
  if (!Array.isArray(body.ids) || body.ids.length < 1 || body.ids.length > 100)
    throw new HttpError(400, "一次请选择 1 至 100 封邮件");
  const ids = [
    ...new Set(body.ids.map((v: unknown) => integer(v, "邮件 ID", 1))),
  ].sort((a, b) => a - b);
  const approve = body.approve === true;
  return idempotent(request, actor, body, async (tx) => {
    let count = 0;
    for (const id of ids) {
      const [mail] = await tx.unsafe(
        `SELECT * FROM ${A("check_mail")} WHERE id=? FOR UPDATE`,
        [id],
      );
      if (!mail || Number(mail.isChecked) !== 0) continue;
      if (approve) {
        const { game } = await serverContext(mail.serverId, tx);
        if (
          !mail.expireTime ||
          new Date(
            mysqlDate(mail.expireTime).replace(" ", "T") + "+08:00",
          ).getTime() <= Date.now()
        )
          throw new HttpError(400, `邮件 ${id} 已过期，请驳回后重新创建`);
        const [user] = await tx.unsafe(
          `SELECT id FROM ${game("uw_user")} WHERE id=? AND accountId<>0 AND robotId=0`,
          [mail.userId],
        );
        if (!user) throw new HttpError(404, `邮件 ${id} 的收件角色不存在`);
        await tx.unsafe(
          `INSERT INTO ${game("uw_mail")} (userId,type,fromName,title,content,replaceArgs,items,delHours,expireTime,addTime) VALUES (?,?,?,?,?,?,?,?,?,?)`,
          [
            mail.userId,
            mail.type,
            mail.fromName,
            mail.title,
            mail.content,
            mail.replaceArgs,
            mail.items,
            mail.delHours,
            mail.expireTime,
            now(),
          ],
        );
      }
      await tx.unsafe(`UPDATE ${A("check_mail")} SET isChecked=? WHERE id=?`, [
        approve ? 1 : 2,
        id,
      ]);
      count++;
    }
    await audit(
      tx,
      actor.user.name,
      approve ? "MAIL_APPROVE" : "MAIL_REJECT",
      "mail-review",
      { ids, count },
    );
    return { message: `已${approve ? "投递" : "驳回"} ${count} 封邮件`, count };
  });
}
async function generateGifts(request: Request, actor: Actor, body: Row) {
  requirePermission(actor, "gifts.create");
  const count = integer(body.count, "生成数量", 1, 1000),
    name = text(body.name, "礼包名称", 20),
    content = text(body.content || "", "说明", 200, false);
  const start = dateTime(body.startTime, "开始时间"),
    end = dateTime(body.endTime, "结束时间");
  if (end <= start) throw new HttpError(400, "结束时间必须晚于开始时间");
  const items = attachments(body.items || {}),
    type = integer(body.type || 0, "礼包类型", 0, 1),
    period = integer(body.period || 0, "有效周期", 0, 3650);
  return idempotent(request, actor, body, async (tx) => {
    const codes = Array.from({ length: count }, () =>
      randomBytes(12).toString("hex"),
    );
    const tuples = codes.map(() => "(?,?,?,?,?,?,?,?,?,0,1)").join(",");
    const values = codes.flatMap((code) => [
      name,
      content,
      code,
      type,
      start,
      end,
      items,
      period,
      0,
    ]);
    await tx.unsafe(
      `INSERT INTO ${M("uw_coupon")} (name,content,code,type,startTime,endTime,items,period,serverId,isUsed,isNew) VALUES ${tuples}`,
      values,
    );
    await audit(tx, actor.user.name, "GIFT_GENERATE", "gifts", {
      name,
      count,
      items: JSON.parse(items),
    });
    return { message: `已生成 ${count} 个礼包码`, codes };
  });
}
async function simulateRecharge(
  request: Request,
  actor: Actor,
  body: Row,
  serverId: number,
) {
  requirePermission(actor, "recharge.create");
  const userId = integer(body.userId, "角色 ID", 1),
    productId = integer(body.productId, "商品 ID", 1);
  const product = rechargeProducts[productId];
  if (!product) throw new HttpError(400, "充值商品不存在");
  const { game } = await serverContext(serverId);
  return idempotent(request, actor, body, async (tx) => {
    const [player] = await tx.unsafe(
      `SELECT id,accountId,serverIndexId,lvl,channelId,sdkChannelId FROM ${game("uw_user")} WHERE id=? AND accountId<>0 AND robotId=0`,
      [userId],
    );
    if (!player) throw new HttpError(404, "角色不存在");
    const order = `SM${Date.now()}${randomBytes(6).toString("hex")}`;
    const result = await tx.unsafe(
      `INSERT INTO ${M("uw_recharge_request")} (accountId,userId,serverId,rechargeId,status,addTime,goodsId,orderNo,gmStatus,lvl,goodsPrice,feeMoney,channelId,sdkChannelId) VALUES (?,?,?,?,1,?,?,?,1,?,?,0,?,?)`,
      [
        player.accountId,
        userId,
        serverId,
        productId,
        now(),
        String(productId),
        order,
        player.lvl,
        product.cost,
        String(player.channelId || 0),
        player.sdkChannelId || "",
      ],
    );
    await audit(tx, actor.user.name, "RECHARGE_SIMULATE", `player:${userId}`, {
      serverId,
      productId,
      order,
    });
    return {
      message: "GM 充值订单已创建，等待游戏服务发货",
      id: Number(result.lastInsertRowid),
      order,
    };
  });
}
export async function guildMembers(actor: Actor, url: URL, id: string) {
  requirePermission(actor, "guilds.read");
  const { game } = await serverContext(url.searchParams.get("server") || 1);
  const rows = await db.unsafe(
    `SELECT p.userId,u.nickName,u.lvl,u.combat,p.position,p.addUpAct,p.joinTime FROM ${game("uw_guild_personal")} p LEFT JOIN ${game("uw_user")} u ON p.userId=u.id WHERE p.guildId=? ORDER BY p.position,p.userId LIMIT 200`,
    [integer(id, "行会 ID", 1)],
  );
  return { rows: [...rows] };
}
