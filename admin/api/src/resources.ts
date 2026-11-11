import type { Field, ResourceMeta } from "../../shared/types";
import { A, L, M, GLog, identifier } from "./config";
import { db, serverContext, pageQuery, audit } from "./db";
import { allowed, requirePermission, idempotent, type Actor } from "./auth";
import { HttpError, integer, validateFields, now, object } from "./validation";

type Resource = Omit<ResourceMeta, "canCreate" | "canEdit" | "canDelete"> & {
  table: string;
  db: "admin" | "main" | "login" | "game" | "log";
  read: string;
  create?: string;
  write?: string;
  remove?: string;
  search?: string[];
  fixed?: string;
  defaults?: Record<string, unknown>;
  order?: string;
  detail?: string[];
};
const f = (
  key: string,
  label: string,
  type: Field["type"] = "text",
  opts: Partial<Field> = {},
): Field => ({ key, label, type, ...opts });
const n = (key: string, label: string, opts: Partial<Field> = {}) =>
  f(key, label, "number", opts);
const j = (key: string, label: string, value = "{}") =>
  f(key, label, "json", { default: value });
const d = (key: string, label: string, required = false) =>
  f(key, label, "datetime", { required });
const toggle = (key: string, label: string) =>
  n(key, label, { default: 0, choices: { 0: "关闭", 1: "开启" } });
const cols = (entries: string) =>
  entries.split(",").map((s) => {
    const [key, label] = s.split(":");
    return { key, label };
  });
const activityFields = [
  f("title", "标题", "text", { required: true, max: 50 }),
  f("fullTitle", "完整标题", "text", { max: 50 }),
  n("type", "活动类型"),
  n("iconType", "图标类型"),
  n("tiIconType", "标题图标"),
  d("startTime", "开始时间", true),
  d("endTime", "结束时间", true),
  toggle("isOpen", "开启"),
  n("sort", "排序"),
  j("items", "奖励"),
  j("exValues", "扩展值", "[]"),
  j("exValues2", "扩展值 2", "[]"),
  j("exValues3", "扩展值 3", "[]"),
  j("exData", "扩展数据"),
  f("randomHeroes", "随机英雄", "textarea", { max: 500 }),
  f("content", "内容", "textarea", { max: 20000 }),
  f("note", "备注", "textarea", { max: 5000 }),
  n("templateId", "模板 ID"),
];
export const resources: Resource[] = [
  {
    key: "players",
    title: "角色管理",
    section: "玩家与社区",
    description: "查询角色、查看背包与关卡；通过详情进行运营操作。",
    id: "id",
    db: "game",
    table: "uw_user",
    read: "players.read",
    fixed: "accountId<>0 AND robotId=0",
    search: ["id", "accountId", "nickName"],
    columns: cols(
      "id:角色 ID,nickName:角色名,accountId:账号 ID,lvl:等级,vip:VIP,gold:金币,diamond:钻石,combat:战力,createTime:创建时间",
    ),
    fields: [],
    detail: [
      "bag",
      "equipBag",
      "exData",
      "heroData",
      "rebirthLvl",
      "rebirthExp",
      "achieveLvl",
      "achieveExp",
      "cybLvl",
      "cybExp",
      "jxLvl",
      "jxExp",
      "magicLvl",
      "highPaTa",
      "lastUpdateTime",
    ],
  },
  {
    key: "bans",
    title: "封禁与禁言",
    section: "玩家与社区",
    description: "封禁、禁言和白名单均使用现有游戏账号状态。",
    id: "id",
    db: "login",
    table: "uw_account",
    read: "bans.read",
    search: ["id", "name"],
    fixed: "(status IN (1,2) OR bendType<>0)",
    columns: cols(
      "id:账号 ID,name:账号,status:状态,bendType:禁言类型,bendExpireAt:禁言到期,createTime:注册时间",
    ),
    fields: [],
  },
  {
    key: "whitelist",
    title: "白名单",
    section: "玩家与社区",
    description: "状态为 3 的账号可以访问维护中的区服。",
    id: "id",
    db: "login",
    table: "uw_account",
    read: "whitelist.read",
    fixed: "status=3",
    search: ["id", "name"],
    columns: cols("id:账号 ID,name:账号,channelId:渠道,status:状态"),
    fields: [],
  },
  {
    key: "chat",
    title: "聊天记录",
    section: "玩家与社区",
    description: "按区服查询聊天日志，手动刷新以节省带宽。",
    id: "id",
    db: "log",
    table: "chat_log",
    read: "chat.read",
    search: ["nick_name", "account", "content", "user_id"],
    columns: cols(
      "id:ID,user_id:角色 ID,nick_name:角色名,content:内容,type:类型,created:时间",
    ),
    fields: [],
  },
  {
    key: "guilds",
    title: "行会",
    section: "玩家与社区",
    description: "查询行会资料；详情内可查看成员。",
    id: "id",
    db: "game",
    table: "uw_guild",
    read: "guilds.read",
    search: ["id", "name"],
    columns: cols(
      "id:行会 ID,name:行会名,lvl:等级,chairmanId:会长 ID,guildPopulation:人数,addUpAct:活跃度,notice:公告",
    ),
    fields: [],
  },
  {
    key: "mails",
    title: "玩家邮件",
    section: "内容与奖励",
    description: "查看已发送邮件。新邮件统一进入审核队列。",
    id: "id",
    db: "game",
    table: "uw_mail",
    read: "mails.read",
    search: ["userId", "title"],
    columns: cols(
      "id:邮件 ID,userId:角色 ID,title:标题,fromName:发件人,isRead:已读,isPicked:已领取,addTime:发送时间,expireTime:到期时间",
    ),
    fields: [],
    detail: ["content", "items", "isDelete"],
  },
  {
    key: "mail-review",
    title: "邮件审核",
    section: "内容与奖励",
    description: "审核和投递在同一数据库事务中完成，重复审核不会重复发奖。",
    id: "id",
    db: "admin",
    table: "check_mail",
    read: "mails.review",
    search: ["userId", "title", "nickName"],
    columns: cols(
      "id:审核 ID,serverId:区服,userId:角色 ID,nickName:角色名,title:标题,isChecked:审核状态,addTime:申请时间",
    ),
    fields: [],
    detail: ["content", "items", "expireTime"],
  },
  {
    key: "notices",
    title: "登录公告",
    section: "内容与奖励",
    description: "编辑登录页公告及展示时间。区服数组 [] 表示全部区服。",
    id: "id",
    db: "main",
    table: "uw_notice",
    read: "notices.read",
    create: "notices.create",
    write: "notices.write",
    remove: "notices.write",
    search: ["title"],
    columns: cols(
      "id:ID,title:标题,isOpen:开启,iconType:图标类型,sort:排序,startTime:开始,endTime:结束",
    ),
    fields: [
      f("title", "标题", "text", { required: true, max: 50 }),
      f("content", "公告内容", "textarea", { required: true, max: 20000 }),
      j("serverIdArr", "区服 ID 数组", "[]"),
      toggle("isOpen", "开启"),
      n("iconType", "图标类型", { default: 3 }),
      n("sort", "排序"),
      d("noticeTime", "公告时间"),
      d("startTime", "开始时间"),
      d("endTime", "结束时间"),
    ],
    defaults: { exData: "{}" },
  },
  {
    key: "messages",
    title: "系统广播",
    section: "内容与奖励",
    description: "发送定时跑马灯或即时广播；状态 0 等待游戏服务发送。",
    id: "id",
    db: "main",
    table: "uw_system_message",
    read: "messages.read",
    create: "messages.create",
    write: "messages.write",
    remove: "messages.write",
    search: ["message"],
    columns: cols(
      "id:ID,serverId:区服,message:内容,type:类型,status:状态,times:次数,sendTime:发送时间",
    ),
    fields: [
      n("serverId", "目标区服（0 全部）", { default: 0 }),
      f("message", "消息", "textarea", { required: true, max: 255 }),
      n("type", "类型", {
        default: 1,
        choices: { 1: "跑马灯", 2: "即时广播" },
      }),
      f("color", "颜色", "text", { default: "#ffffff", max: 45 }),
      n("size", "字号", { default: 16, min: 8, max: 48 }),
      n("times", "次数", { default: 1, min: 1, max: 100 }),
      n("interval", "间隔（秒）", { default: 60, min: 5, max: 86400 }),
      d("sendTime", "发送时间", true),
      d("expireTime", "过期时间", true),
    ],
    defaults: { status: 0 },
  },
  {
    key: "activities",
    title: "区服活动",
    section: "内容与奖励",
    description: "活动 JSON 保持原协议格式，修改后由游戏服务按原周期读取。",
    id: "id",
    db: "game",
    table: "uw_activity",
    read: "activities.read",
    create: "activities.create",
    write: "activities.write",
    remove: "activities.write",
    search: ["id", "title"],
    columns: cols(
      "id:ID,title:标题,type:类型,isOpen:开启,startTime:开始,endTime:结束,sort:排序",
    ),
    fields: activityFields,
  },
  {
    key: "public-activities",
    title: "公共活动",
    section: "内容与奖励",
    description: "管理公共活动与模板，沿用现有活动字段。",
    id: "id",
    db: "main",
    table: "uw_public_activity",
    read: "activities.read",
    create: "activities.create",
    write: "activities.write",
    remove: "activities.write",
    search: ["id", "title"],
    columns: cols(
      "id:ID,title:标题,type:类型,isOpen:开启,startTime:开始,endTime:结束",
    ),
    fields: [
      ...activityFields,
      j("serverArr", "区服数组", "[]"),
      toggle("isTemplate", "模板"),
      f("templateName", "模板名称", "text", { max: 50 }),
      toggle("isAnyTimeValid", "永久有效"),
    ],
  },
  {
    key: "gifts",
    title: "礼包码",
    section: "内容与奖励",
    description: "批量生成随机礼包码，生成后可下载本批次 CSV。",
    id: "id",
    db: "main",
    table: "uw_coupon",
    read: "gifts.read",
    search: ["name", "code"],
    columns: cols(
      "id:ID,name:名称,code:兑换码,type:类型,isUsed:已使用,userId:领取角色,startTime:开始,endTime:到期",
    ),
    fields: [],
    detail: ["items", "content", "serverId", "channelIds", "period"],
  },
  {
    key: "recharge",
    title: "充值明细",
    section: "数据与报表",
    description: "查看订单状态；模拟充值仅创建 GM 订单并由现有服务发货。",
    id: "id",
    db: "main",
    table: "uw_recharge_request",
    read: "reports.recharge",
    search: ["orderNo", "accountId", "userId"],
    columns: cols(
      "id:ID,userId:角色 ID,goodsId:商品,goodsPrice:金额,status:状态,gmStatus:GM 订单,orderNo:订单号,addTime:创建时间",
    ),
    fields: [],
  },
  {
    key: "buy-log",
    title: "物品购买",
    section: "数据与报表",
    description: "商城购买与货币消耗日志。",
    id: "id",
    db: "log",
    table: "buy_log",
    read: "reports.buy",
    search: ["user_id", "item_name"],
    columns: cols(
      "id:ID,user_id:角色 ID,item_name:物品,item_num:数量,currency_type:货币类型,currency_num:消耗,created:时间",
    ),
    fields: [],
  },
  {
    key: "lottery-log",
    title: "抽奖记录",
    section: "数据与报表",
    description: "宠物拉霸等抽奖消费记录。",
    id: "id",
    db: "log",
    table: "lottery_log",
    read: "reports.lottery",
    search: ["user_id"],
    columns: cols(
      "id:ID,user_id:角色 ID,type:类型,lottery_num:次数,cost_item_num:道具消耗,cost_score:积分消耗,created:时间",
    ),
    fields: [],
    detail: ["data"],
  },
  {
    key: "boss-log",
    title: "Boss 记录",
    section: "数据与报表",
    description: "Boss 击杀、参与人数与战力日志。",
    id: "id",
    db: "log",
    table: "boss_log",
    read: "reports.boss",
    search: ["boss_id"],
    columns: cols(
      "id:ID,boss_id:Boss ID,boss_type:类型,kill_num:击杀数,user_num:人数,max_combat:最高战力,created:时间",
    ),
    fields: [],
  },
  {
    key: "reward-log",
    title: "奖励记录",
    section: "数据与报表",
    description: "玩家道具获得日志。",
    id: "id",
    db: "log",
    table: "reward_log",
    read: "rewards.read",
    search: ["user_id", "reward_id"],
    columns: cols(
      "id:ID,user_id:角色 ID,type:类型,reward_id:奖励 ID,data:奖励数据,created:时间",
    ),
    fields: [],
  },
  {
    key: "servers",
    title: "区服管理",
    section: "系统管理",
    description:
      "编辑区服开放状态、开服时间与维护说明。服务进程由 WSL 启动命令管理。",
    id: "id",
    db: "login",
    table: "uw_server_info",
    read: "servers.read",
    write: "system.write",
    search: ["name", "area"],
    columns: cols(
      "id:ID,name:名称,area:大区,serverId:游戏服,status:状态,isClose:维护,serverDate:开服时间",
    ),
    fields: [
      f("name", "名称", "text", { required: true, max: 32 }),
      f("area", "大区", "text", { max: 32 }),
      n("status", "状态", {
        choices: { 0: "未开放", 1: "正常", 2: "火爆", 3: "维护" },
      }),
      toggle("isNew", "新服"),
      toggle("isClose", "维护"),
      f("closeExplain", "维护说明", "text", { max: 100 }),
      n("sort", "排序"),
      d("serverDate", "开服时间", true),
    ],
  },
  {
    key: "admin-users",
    title: "管理员",
    section: "系统管理",
    description: "管理账号状态与分组。密码使用 Argon2id。",
    id: "user_id",
    db: "admin",
    table: "osa_user",
    read: "system.read",
    create: "system.write",
    write: "system.write",
    search: ["user_name", "real_name"],
    columns: cols(
      "user_id:ID,user_name:账号,real_name:姓名,user_group:权限组,status:启用,login_time:上次登录,login_ip:登录 IP",
    ),
    fields: [
      f("user_name", "账号", "text", { required: true, max: 50 }),
      f("real_name", "姓名", "text", { max: 255 }),
      n("user_group", "权限组 ID", { required: true, min: 1 }),
      n("status", "启用", { default: 1, choices: { 0: "停用", 1: "启用" } }),
      f("email", "邮箱", "text", { max: 255 }),
      f("user_desc", "说明", "textarea", { max: 255 }),
      f("password", "密码（编辑时留空保留）", "password", { max: 256 }),
    ],
  },
  {
    key: "groups",
    title: "权限组",
    section: "系统管理",
    description: "使用旧菜单 ID 的逗号列表设置权限，组 1 为超级管理员。",
    id: "group_id",
    db: "admin",
    table: "osa_user_group",
    read: "system.read",
    create: "system.write",
    write: "system.write",
    search: ["group_name"],
    columns: cols(
      "group_id:ID,group_name:名称,group_role:菜单权限 ID,group_desc:说明",
    ),
    fields: [
      f("group_name", "组名称", "text", { required: true, max: 32 }),
      f("group_role", "菜单 ID（逗号分隔）", "textarea", {
        required: true,
        max: 5000,
      }),
      f("group_desc", "说明", "text", { max: 64 }),
    ],
  },
  {
    key: "menus",
    title: "菜单权限对照",
    section: "系统管理",
    description: "查询旧菜单 ID，用于权限组配置。",
    id: "menu_id",
    db: "admin",
    table: "osa_menu_url",
    read: "system.read",
    search: ["menu_name", "menu_url"],
    columns: cols(
      "menu_id:菜单 ID,menu_name:名称,menu_url:原路径,module_id:模块,is_show:显示,online:启用",
    ),
    fields: [],
  },
  {
    key: "audit",
    title: "操作审计",
    section: "系统管理",
    description: "记录登录、修改、发奖与审批的操作者和结果。",
    id: "op_id",
    db: "admin",
    table: "osa_sys_log",
    read: "system.read",
    search: ["user_name", "action", "class_obj"],
    columns: cols(
      "op_id:ID,user_name:管理员,action:操作,class_obj:目标,op_time:时间",
    ),
    fields: [],
    detail: ["result"],
  },
];
export function metadata(actor: Actor): ResourceMeta[] {
  return resources
    .filter((r) => allowed(actor, r.read))
    .map((r) => ({
      key: r.key,
      title: r.title,
      section: r.section,
      description: r.description,
      id: r.id,
      columns: r.columns,
      fields: r.fields,
      canCreate: !!r.create && allowed(actor, r.create),
      canEdit: !!r.write && allowed(actor, r.write),
      canDelete: !!r.remove && allowed(actor, r.remove),
    }));
}
export function getResource(key: string) {
  const r = resources.find((r) => r.key === key);
  if (!r) throw new HttpError(404, "资源不存在");
  return r;
}
async function source(r: Resource, url: URL) {
  if (r.db === "game")
    return (await serverContext(url.searchParams.get("server") || 1)).game(
      r.table,
    );
  return { admin: A, login: L, main: M, log: GLog }[r.db](r.table);
}
export async function resourceGet(
  actor: Actor,
  key: string,
  url: URL,
  id?: string,
) {
  const r = getResource(key);
  requirePermission(actor, r.read);
  const src = await source(r, url);
  const fields = [
    ...new Set([
      ...r.columns.map((c) => c.key),
      ...r.fields.map((f) => f.key),
      ...(r.detail || []),
    ]),
  ].filter((k) => k !== "password");
  const args: unknown[] = [];
  let where = r.fixed || "1=1";
  if (r.db === "log") {
    where += " AND server_id=?";
    args.push(integer(url.searchParams.get("server") || 1, "区服", 1));
  }
  if (r.key === "recharge" || r.key === "mail-review") {
    where += " AND serverId=?";
    args.push(integer(url.searchParams.get("server") || 1, "区服", 1));
  }
  if (id) {
    where += ` AND ${identifier(r.id)}=?`;
    args.push(integer(id, "ID", 1));
    const [row] = await db.unsafe(
      `SELECT ${fields.map(identifier).join(",")} FROM ${src} WHERE ${where}`,
      args,
    );
    if (!row) throw new HttpError(404, "记录不存在");
    return row;
  }
  const search = url.searchParams.get("q")?.trim();
  if (search && r.search?.length) {
    if (search.length > 200) throw new HttpError(400, "搜索内容过长");
    where +=
      " AND (" +
      r.search.map((k) => `${identifier(k)} LIKE ?`).join(" OR ") +
      ")";
    args.push(...r.search.map(() => `%${search.replace(/[\\%_]/g, "\\$&")}%`));
  }
  if (r.key === "mail-review" && url.searchParams.has("status")) {
    where += " AND isChecked=?";
    args.push(integer(url.searchParams.get("status"), "审核状态", 0, 2));
  }
  return pageQuery(
    db,
    src,
    r.columns.map((c) => identifier(c.key)).join(","),
    where,
    args,
    r.order || `${identifier(r.id)} DESC`,
    url,
  );
}
export async function resourceWrite(
  request: Request,
  actor: Actor,
  key: string,
  url: URL,
  body: unknown,
  id?: string,
) {
  const r = getResource(key),
    creating = !id,
    deleting = request.method === "DELETE";
  const permission = deleting ? r.remove : creating ? r.create : r.write;
  if (!permission) throw new HttpError(405, "此资源不支持该操作");
  requirePermission(actor, permission);
  const src = await source(r, url);
  const input = object(body);
  const data = deleting ? {} : validateFields(input, r.fields, creating);
  if (key === "notices" && data.serverIdArr) {
    const ids = JSON.parse(data.serverIdArr);
    if (!Array.isArray(ids)) throw new HttpError(400, "区服 ID 必须为数组");
    ids.forEach((v) => integer(v, "区服 ID", 1));
  }
  if (
    key === "groups" &&
    data.group_role &&
    !/^\d+(,\d+)*$/.test(data.group_role)
  )
    throw new HttpError(400, "菜单权限必须为逗号分隔的数字");
  if (key === "admin-users") {
    if (data.password) {
      if (data.password.length < 12)
        throw new HttpError(400, "管理员密码至少 12 个字符");
      data.password = await Bun.password.hash(data.password, {
        algorithm: "argon2id",
      });
    } else {
      delete data.password;
      if (creating) throw new HttpError(400, "新管理员需要密码");
    }
  }
  return idempotent(request, actor, input, async (tx) => {
    let recordId = id ? integer(id, "ID", 1) : 0;
    if (recordId) {
      const [existing] = await tx.unsafe(
        `SELECT ${identifier(r.id)}${key === "admin-users" ? ",user_group,status" : ""} FROM ${src} WHERE ${identifier(r.id)}=? FOR UPDATE`,
        [recordId],
      );
      if (!existing) throw new HttpError(404, "记录不存在");
      if (key === "groups" && recordId === 1)
        throw new HttpError(400, "超级管理员组不可修改");
      if (
        key === "admin-users" &&
        Number(existing.user_group) === 1 &&
        (data.status === 0 || (data.user_group && data.user_group !== 1))
      )
        throw new HttpError(400, "超级管理员不可停用或移出超级组");
      if (
        key === "admin-users" &&
        recordId === actor.user.id &&
        data.status === 0
      )
        throw new HttpError(400, "不可停用当前账号");
    }
    if (key === "admin-users" && data.user_group) {
      const [group] = await tx.unsafe(
        `SELECT group_id FROM ${A("osa_user_group")} WHERE group_id=?`,
        [data.user_group],
      );
      if (!group) throw new HttpError(400, "权限组不存在");
    }
    if (key === "notices") data.updateTime = now();
    if (key === "messages") {
      data.lastUpdateTime = now();
      if (creating) data.createTime = now();
    }
    if (deleting)
      await tx.unsafe(`DELETE FROM ${src} WHERE ${identifier(r.id)}=?`, [
        recordId,
      ]);
    else if (creating) {
      const values = { ...r.defaults, ...data };
      const result = await tx.unsafe(
        `INSERT INTO ${src} (${Object.keys(values).map(identifier).join(",")}) VALUES (${Object.keys(
          values,
        )
          .map(() => "?")
          .join(",")})`,
        Object.values(values),
      );
      recordId = Number(result.lastInsertRowid);
    } else {
      await tx.unsafe(
        `UPDATE ${src} SET ${Object.keys(data)
          .map((k) => `${identifier(k)}=?`)
          .join(",")} WHERE ${identifier(r.id)}=?`,
        [...Object.values(data), recordId],
      );
    }
    if (
      key === "admin-users" &&
      !creating &&
      (data.password || data.status === 0)
    )
      await tx.unsafe(
        `DELETE FROM ${A("fyqst_admin_session")} WHERE user_id=?`,
        [recordId],
      );
    const safe = { ...data };
    if (safe.password) safe.password = "[已更新]";
    await audit(
      tx,
      actor.user.name,
      deleting ? "DELETE" : creating ? "CREATE" : "UPDATE",
      `${key}:${recordId}`,
      safe,
    );
    return { id: recordId, message: "已保存" };
  });
}
