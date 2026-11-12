import { useState } from "react";
import type { Bootstrap, Field, Row } from "../../shared/types";
import { api, downloadCsv, query } from "./api";
import { Form, Icon } from "./components";
const date = (offset = 0) =>
  new Date(Date.now() + offset + 8 * 3600000).toISOString().slice(0, 16);
export const actionTitles: Record<string, string> = {
  "mail-compose": "撰写运营邮件",
  "gift-generate": "批量生成礼包码",
  "gift-bind": "绑定礼包码到账号",
  recharge: "模拟充值",
  account: "账号状态操作",
  "player-update": "修改角色数据",
  "player-progress": "修改关卡进度",
};
export function ActionForm({
  kind,
  boot,
  server,
  initial = {},
  onDone,
}: {
  kind: string;
  boot: Bootstrap;
  server: number;
  initial?: Row;
  onDone: (message: string) => void;
}) {
  const [codes, setCodes] = useState<string[]>([]);
  const fields: Record<string, Field[]> = {
    "mail-compose": [
      {
        key: "broadcast",
        label: "收件范围",
        type: "number",
        default: 0,
        choices: {
          ...(boot.permissions.includes("mails.compose")
            ? { 0: "指定角色" }
            : {}),
          ...(boot.permissions.includes("mails.broadcast")
            ? { 1: "当前区服全部真实角色" }
            : {}),
        },
      },
      {
        key: "userId",
        label: "角色 ID（全服邮件填 0）",
        type: "number",
        default: 0,
      },
      {
        key: "fromName",
        label: "发件人",
        default: "运营团队",
        max: 50,
        required: true,
      },
      { key: "title", label: "邮件标题", required: true, max: 50 },
      {
        key: "content",
        label: "邮件正文",
        type: "textarea",
        required: true,
        max: 20000,
      },
      {
        key: "items",
        label: "奖励附件（金币 99 / 钻石 200，可搜索物品并填写数量）",
        type: "items",
        default: {},
      },
      {
        key: "days",
        label: "有效天数",
        type: "number",
        default: 30,
        min: 1,
        max: 365,
      },
    ],
    "gift-generate": [
      { key: "name", label: "礼包名称", required: true, max: 20 },
      {
        key: "count",
        label: "数量",
        type: "number",
        default: 10,
        min: 1,
        max: 1000,
      },
      {
        key: "type",
        label: "兑换限制",
        type: "number",
        default: 0,
        choices: { 0: "同类只可领一次", 1: "无限制" },
      },
      {
        key: "period",
        label: "有效周期（天，0 沿用固定时间）",
        type: "number",
        default: 0,
        min: 0,
        max: 3650,
      },
      {
        key: "startTime",
        label: "开始时间",
        type: "datetime",
        default: date(),
        required: true,
      },
      {
        key: "endTime",
        label: "结束时间",
        type: "datetime",
        default: date(30 * 86400000),
        required: true,
      },
      {
        key: "items",
        label: "礼包奖励（金币 99 / 钻石 200，可搜索物品并填写数量）",
        type: "items",
        default: {},
      },
      {
        key: "bindAccountId",
        label: "绑定账号（绑定后仅该账号可兑换）",
        type: "account",
        default: 0,
      },
      { key: "content", label: "礼包说明", type: "textarea", max: 200 },
    ],
    "gift-bind": [
      {
        key: "bindAccountId",
        label: "绑定账号（选择账号后仅该账号可兑换；留空解除绑定）",
        type: "account",
        default: 0,
      },
    ],
    recharge: [
      {
        key: "userId",
        label: "角色 ID",
        type: "number",
        min: 1,
        required: true,
      },
      {
        key: "productId",
        label: "充值商品",
        type: "number",
        default: boot.rechargeProducts[0]?.id || 1,
        choices: Object.fromEntries(
          boot.rechargeProducts.map((p) => [
            p.id,
            `${p.id} · ${p.name} / ¥${p.cost}`,
          ]),
        ),
      },
    ],
    account: [
      {
        key: "accountId",
        label: "账号 ID",
        type: "number",
        min: 1,
        required: true,
      },
      {
        key: "operation",
        label: "操作",
        default: "mute",
        choices: Object.fromEntries([
          ...(boot.permissions.includes("bans.write")
            ? [
                ["ban", "封禁账号"],
                ["unban", "解除封禁"],
                ["mute", "限时禁言"],
                ["unmute", "解除禁言"],
                ["shadow", "仅自己可见聊天"],
              ]
            : []),
          ...(boot.permissions.includes("players.kick")
            ? [["kick", "踢出当前区服"]]
            : []),
          ...(boot.permissions.includes("whitelist.write")
            ? [
                ["whitelist", "加入白名单"],
                ["unwhitelist", "移出白名单"],
              ]
            : []),
        ]),
      },
      {
        key: "expiresAt",
        label: "禁言截止（仅限时禁言使用）",
        type: "datetime",
        default: date(2 * 3600000),
      },
    ],
    "player-update": boot.playerFields,
    "player-progress": [
      {
        key: "userId",
        label: "角色 ID",
        type: "number",
        min: 1,
        required: true,
      },
      {
        key: "copyType",
        label: "关卡类型",
        type: "number",
        default: 1,
        min: 0,
        max: 100,
      },
      {
        key: "progress",
        label: "关卡进度（不含 100000 前缀）",
        type: "number",
        min: 1,
        max: 99999,
        required: true,
      },
    ],
  };
  if (codes.length)
    return (
      <div className="success-result">
        <Icon name="check" size={40} />
        <h3>已生成 {codes.length} 个礼包码</h3>
        <p>可下载此批次的兑换码，历史记录保存在礼包码列表。</p>
        <button
          className="button primary"
          onClick={() =>
            downloadCsv(
              "礼包码.csv",
              codes.map((code) => ({ code })),
            )
          }
        >
          下载本批次 CSV
        </button>
        <button className="button" onClick={() => onDone("礼包码已生成")}>
          完成
        </button>
      </div>
    );
  const selectedFields =
    fields[kind]?.map((f) =>
      kind === "mail-compose" &&
      f.key === "broadcast" &&
      !boot.permissions.includes("mails.compose")
        ? { ...f, default: 1 }
        : f,
    ) || [];
  return (
    <>
      <div className="inline-note">
        {kind === "gift-generate"
          ? "礼包码为随机 24 位十六进制串；选择绑定账号后，只有该账号兑换有效。"
          : kind === "mail-compose"
            ? "所有运营邮件均进入审核队列。附件按物品选择后填写数量，金币 99、钻石 200。"
            : kind === "player-update"
            ? "修改会应用到游戏缓存，由游戏服务按原保存周期落库。请先确认角色 ID 和当前区服。"
            : kind === "recharge"
              ? "此操作创建 GM 模拟订单，会实际发放游戏商品，报表将其单独统计。"
              : kind === "account"
                ? "封禁会踢出所选区服；禁言与白名单沿用游戏账号状态规则。"
                : "请确认内容和生效时间后提交。"}
      </div>
      <Form
        fields={selectedFields}
        initial={initial}
        submit={kind === "mail-compose" ? "提交审核" : "确认提交"}
        onSave={async (data) => {
          const body =
            kind === "mail-compose"
              ? { ...data, broadcast: Number(data.broadcast) === 1 }
              : kind === "gift-bind"
                ? {
                    ids: initial.ids || [],
                    bindAccountId: Number(data.bindAccountId) || 0,
                  }
                : kind === "player-update"
                  ? {
                      userId: initial.id,
                      changes: Object.fromEntries(
                        Object.entries(data).filter(
                          ([k, v]) => String(v) !== String(initial[k] ?? ""),
                        ),
                      ),
                    }
                  : data;
          const result = await api("/operations/" + kind + query(server), {
            method: "POST",
            body,
          });
          if (result.codes) {
            setCodes(result.codes);
            return;
          }
          onDone(result.message);
        }}
      />
    </>
  );
}
