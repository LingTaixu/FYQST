import { config, GLog, L, M, table } from "./config";
import { db, pageQuery, serverContext } from "./db";
import { requirePermission, type Actor } from "./auth";
import { dateTime, HttpError } from "./validation";
import { gameCall } from "./game";

async function exists(name: string) {
  const [row] = await db.unsafe(
    "SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema=? AND table_name=?",
    [config.logDb, name],
  );
  return Number(row.n) > 0;
}
function range(url: URL) {
  const today = new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);
  const ago = new Date(Date.now() - 6 * 86400000 + 8 * 3600000)
    .toISOString()
    .slice(0, 10);
  const start = dateTime(
    `${url.searchParams.get("start") || ago} 00:00:00`,
    "开始日期",
  );
  const endDay = dateTime(
    `${url.searchParams.get("end") || today} 00:00:00`,
    "结束日期",
  );
  const startMs = new Date(start.replace(" ", "T") + "+08:00").getTime(),
    endMs = new Date(endDay.replace(" ", "T") + "+08:00").getTime();
  if (endMs < startMs || endMs - startMs > 90 * 86400000)
    throw new HttpError(400, "日期范围应为 1 至 91 天");
  const end = new Date(endMs + 86400000 + 8 * 3600000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  const days = Array.from(
    { length: Math.round((endMs - startMs) / 86400000) + 1 },
    (_, i) =>
      new Date(startMs + i * 86400000 + 8 * 3600000).toISOString().slice(0, 10),
  );
  return { start, end, days };
}
export async function dashboard(actor: Actor, url: URL) {
  requirePermission(actor, "reports.summary");
  const { game, server } = await serverContext(
    url.searchParams.get("server") || 1,
  );
  const results = await Promise.all([
    db.unsafe(
      `SELECT COUNT(*) AS players,COALESCE(MAX(lvl),0) AS maxLevel,COALESCE(MAX(combat),0) AS maxCombat FROM ${game("uw_user")} WHERE accountId<>0 AND robotId=0`,
    ),
    db.unsafe(
      `SELECT COALESCE(SUM(IF(gmStatus=0,goodsPrice,0)),0) AS revenue,COUNT(DISTINCT IF(gmStatus=0,userId,NULL)) AS payers,COUNT(*) AS orders FROM ${M("uw_recharge_request")} WHERE serverId=? AND status>=1`,
      [server.id],
    ),
    db.unsafe(
      `SELECT COUNT(*) AS pending FROM ${table(config.adminDb, "check_mail")} WHERE isChecked=0 AND serverId=?`,
      [server.id],
    ),
  ]);
  let online: unknown = null;
  try {
    online = await gameCall(server.id, "admin.ops.b", {});
  } catch {
    /* Report unavailability without guessing an online count. */
  }
  return {
    ...results[0][0],
    ...results[1][0],
    ...results[2][0],
    online,
    serverTime: new Date().toISOString(),
  };
}
export async function report(actor: Actor, kind: string, url: URL) {
  const permissions: Record<string, string> = {
    daily: "reports.summary",
    pay: "reports.pay",
    levels: "reports.levels",
    progress: "reports.progress",
    guide: "reports.guide",
    retention: "reports.retention",
    goods: "reports.goods",
  };
  if (!permissions[kind]) throw new HttpError(404, "报表不存在");
  requirePermission(actor, permissions[kind]);
  const { game, server } = await serverContext(
    url.searchParams.get("server") || 1,
  );
  if (kind === "levels")
    return pageQuery(
      db,
      game("uw_user"),
      "id,nickName,lvl,vip,combat",
      "accountId<>0 AND robotId=0",
      [],
      "lvl DESC,combat DESC,id",
      url,
    );
  if (kind === "pay")
    return pageQuery(
      db,
      `(SELECT userId,MAX(accountId) AS accountId,SUM(goodsPrice) AS revenue,COUNT(*) AS orders,MAX(addTime) AS lastPay FROM ${M("uw_recharge_request")} WHERE serverId=? AND status>=1 AND gmStatus=0 GROUP BY userId) p`,
      "p.*",
      "1=1",
      [server.id],
      "revenue DESC,userId",
      url,
    );
  if (kind === "progress") {
    const rows = await db.unsafe(
      `SELECT p.copyType,p.pCopyId,COUNT(*) AS players FROM ${game("uw_copy_progress")} p JOIN ${game("uw_user")} u ON u.id=p.userId WHERE u.accountId<>0 AND u.robotId=0 GROUP BY p.copyType,p.pCopyId ORDER BY p.copyType,p.pCopyId LIMIT 1000`,
    );
    return {
      rows: [...rows],
      note: "当前关卡分布快照，非历史流失率。最多显示 1000 组。",
    };
  }
  const { start, end, days } = range(url);
  if (kind === "goods") {
    const rows = await db.unsafe(
      `SELECT goodsId,COUNT(*) AS orders,COUNT(DISTINCT userId) AS payers,SUM(goodsPrice) AS revenue FROM ${M("uw_recharge_request")} WHERE serverId=? AND status>=1 AND gmStatus=0 AND addTime>=? AND addTime<? GROUP BY goodsId ORDER BY revenue DESC LIMIT 1000`,
      [server.id, start, end],
    );
    return { rows: [...rows] };
  }
  if (kind === "guide") {
    const rows = await db.unsafe(
      `SELECT install_step,install_step_name,COUNT(DISTINCT account_name) AS accounts FROM ${GLog("gameinstall_log")} WHERE created>=? AND created<? GROUP BY install_step,install_step_name ORDER BY CAST(install_step AS UNSIGNED) LIMIT 200`,
      [start, end],
    );
    return {
      rows: [...rows],
      note: "原始引导日志不含区服字段，因此此报表为所有区服合计。",
    };
  }
  const loginName = `login_log_${Number(server.id)}`;
  const hasLogin = await exists(loginName);
  const loginTable = GLog(loginName);
  if (kind === "retention") {
    if (!hasLogin)
      return {
        rows: [],
        available: false,
        note: `当前数据库没有 ${loginName} 历史登录表，无法计算次日、三日和七日留存。`,
      };
    const rows = await db.unsafe(
      `SELECT DATE_FORMAT(u.createTime,'%Y-%m-%d') AS day,COUNT(DISTINCT u.id) AS players,COUNT(DISTINCT IF(DATEDIFF(l.created,u.createTime)=1,u.id,NULL)) AS day2,COUNT(DISTINCT IF(DATEDIFF(l.created,u.createTime)=2,u.id,NULL)) AS day3,COUNT(DISTINCT IF(DATEDIFF(l.created,u.createTime)=6,u.id,NULL)) AS day7 FROM ${game("uw_user")} u LEFT JOIN ${loginTable} l ON l.user_id=u.id AND l.created>=u.createTime AND l.created<DATE_ADD(u.createTime,INTERVAL 8 DAY) WHERE u.accountId<>0 AND u.robotId=0 AND u.createTime>=? AND u.createTime<? GROUP BY day ORDER BY day`,
      [start, end],
    );
    return {
      rows: [...rows],
      note: "最近创建角色的留存窗口可能尚未结束，数值会继续变化。",
    };
  }
  const [roles, pays, logins] = await Promise.all([
    db.unsafe(
      `SELECT DATE_FORMAT(createTime,'%Y-%m-%d') AS day,COUNT(*) AS roles FROM ${game("uw_user")} WHERE accountId<>0 AND robotId=0 AND createTime>=? AND createTime<? GROUP BY day`,
      [start, end],
    ),
    db.unsafe(
      `SELECT DATE_FORMAT(addTime,'%Y-%m-%d') AS day,COUNT(DISTINCT IF(gmStatus=0,userId,NULL)) AS payers,SUM(IF(gmStatus=0,goodsPrice,0)) AS revenue,SUM(IF(gmStatus=1,goodsPrice,0)) AS gmRevenue FROM ${M("uw_recharge_request")} WHERE serverId=? AND status>=1 AND addTime>=? AND addTime<? GROUP BY day`,
      [server.id, start, end],
    ),
    hasLogin
      ? db.unsafe(
          `SELECT DATE_FORMAT(created,'%Y-%m-%d') AS day,COUNT(DISTINCT user_id) AS active FROM ${loginTable} WHERE created>=? AND created<? GROUP BY day`,
          [start, end],
        )
      : Promise.resolve([]),
  ]);
  const rows = days.map((day) => {
    const r = roles.find((r: any) => r.day === day),
      p = pays.find((r: any) => r.day === day),
      l = logins.find((r: any) => r.day === day);
    const revenue = Number(p?.revenue || 0),
      payers = Number(p?.payers || 0),
      active = hasLogin ? Number(l?.active || 0) : null;
    return {
      day,
      roles: Number(r?.roles || 0),
      revenue,
      gmRevenue: Number(p?.gmRevenue || 0),
      payers,
      active,
      arpu: active ? (revenue / active).toFixed(2) : null,
      arppu: payers ? (revenue / payers).toFixed(2) : null,
    };
  });
  return {
    rows,
    note: hasLogin
      ? "真实充值与 GM 模拟充值分别统计。"
      : `当前缺少 ${loginName} 历史登录表，活跃人数与 ARPU 显示为空；真实充值排除 GM 订单。`,
  };
}
