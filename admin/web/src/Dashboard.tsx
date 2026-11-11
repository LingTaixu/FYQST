import { useEffect, useState } from "react";
import type { Bootstrap, Row } from "../../shared/types";
import { api, query } from "./api";
import { Alert, Icon, Loading } from "./components";
export function Dashboard({
  boot,
  server,
  navigate,
}: {
  boot: Bootstrap;
  server: number;
  navigate: (page: string) => void;
}) {
  const [data, setData] = useState<Row>(),
    [error, setError] = useState("");
  const permitted = boot.permissions.includes("reports.summary");
  useEffect(() => {
    if (!permitted) return;
    const ac = new AbortController();
    setData(undefined);
    setError("");
    api("/dashboard" + query(server), { signal: ac.signal })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => ac.abort();
  }, [server, permitted]);
  const info = boot.servers.find((s) => Number(s.id) === server);
  const cards = [
    { key: "players", label: "累计角色", unit: "人", icon: "users" },
    { key: "revenue", label: "累计真实充值", unit: "元", icon: "coin" },
    { key: "payers", label: "付费角色", unit: "人", icon: "chart" },
    { key: "pending", label: "待审核邮件", unit: "封", icon: "mail" },
  ];
  return (
    <>
      <div className="welcome">
        <div>
          <span className="eyebrow">OPERATIONS OVERVIEW</span>
          <h2>你好，{boot.user.displayName}</h2>
          <p>从这里了解区服运行情况，处理今日运营事务。</p>
        </div>
        <div className="welcome-mark">
          <Icon name="shield" size={58} />
        </div>
      </div>
      {error && <Alert>{error}</Alert>}
      {permitted && !data && !error ? (
        <Loading />
      ) : permitted && data ? (
        <>
          <div className="stats-grid">
            {cards.map((c) => (
              <article className="stat" key={c.key}>
                <div className="stat-label">
                  {c.label}
                  <Icon name={c.icon} />
                </div>
                <div className="stat-value">
                  {Number(data[c.key] || 0).toLocaleString()}
                  <small>{c.unit}</small>
                </div>
                <span className="muted">
                  {c.key === "revenue"
                    ? "不含 GM 模拟订单"
                    : info?.area || "当前区服"}
                </span>
              </article>
            ))}
          </div>
          <div className="dashboard-grid">
            <section className="panel">
              <div className="panel-title">
                <h3>常用工作台</h3>
                <span className="muted">快速进入</span>
              </div>
              <div className="quick-grid">
                {[
                  {
                    key: "players",
                    title: "角色管理",
                    desc: "查找角色与账号状态",
                    icon: "users",
                  },
                  {
                    key: "compose",
                    title: "发送邮件",
                    desc: "撰写通知与奖励邮件",
                    icon: "mail",
                  },
                  {
                    key: "mail-review",
                    title: "邮件审核",
                    desc: "审核并投递奖励",
                    icon: "check",
                  },
                  {
                    key: "reports",
                    title: "数据报表",
                    desc: "查询充值和角色数据",
                    icon: "chart",
                  },
                ]
                  .filter((x) =>
                    x.key === "compose"
                      ? boot.permissions.some((p) =>
                          ["mails.compose", "mails.broadcast"].includes(p),
                        )
                      : x.key === "reports"
                        ? boot.permissions.some((p) => p.startsWith("reports."))
                        : boot.resources.some((r) => r.key === x.key),
                  )
                  .map((x) => (
                    <button
                      className="quick-card"
                      key={x.key}
                      onClick={() => navigate(x.key)}
                    >
                      <span className="quick-icon">
                        <Icon name={x.icon} />
                      </span>
                      <div>
                        <strong>{x.title}</strong>
                        <p>{x.desc}</p>
                      </div>
                      <Icon name="arrow" size={16} />
                    </button>
                  ))}
              </div>
            </section>
            <section className="panel">
              <div className="panel-title">
                <h3>当前区服</h3>
                <span className="badge green">本地运行</span>
              </div>
              <dl className="server-facts">
                <div>
                  <dt>区服名称</dt>
                  <dd>
                    {info?.name} · {info?.area}
                  </dd>
                </div>
                <div>
                  <dt>开放状态</dt>
                  <dd>{Number(info?.isClose) === 1 ? "维护中" : "开放"}</dd>
                </div>
                <div>
                  <dt>最高等级</dt>
                  <dd>Lv. {Number(data.maxLevel || 0)}</dd>
                </div>
                <div>
                  <dt>最高战力</dt>
                  <dd>{Number(data.maxCombat || 0).toLocaleString()}</dd>
                </div>
                <div>
                  <dt>在线人数</dt>
                  <dd>
                    {data.online?.available
                      ? data.online.online
                      : "当前服务未提供计数"}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </>
      ) : null}
      <div className="notice-strip">
        <Icon name="book" />
        <div>
          <strong>运营数据直接来自现有数据库</strong>
          <p>
            邮件需经过审核后发送；真实充值与 GM
            订单分开统计。页面按需读取，无自动轮询和音频请求。
          </p>
        </div>
      </div>
    </>
  );
}
