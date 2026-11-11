import { useEffect, useState } from "react";
import type { Bootstrap, Row } from "../../shared/types";
import { api, downloadCsv, query } from "./api";
import { Alert, DataTable, Icon, Loading } from "./components";
const types = [
  ["daily", "运营日报", "summary"],
  ["pay", "付费排行", "pay"],
  ["levels", "等级排行", "levels"],
  ["goods", "充值商品", "goods"],
  ["progress", "关卡分布", "progress"],
  ["guide", "引导步骤", "guide"],
  ["retention", "玩家留存", "retention"],
];
const labels: Record<string, string> = {
  day: "日期",
  roles: "新增角色",
  revenue: "真实充值金额",
  gmRevenue: "模拟充值金额",
  payers: "付费角色",
  active: "活跃角色",
  arpu: "ARPU",
  arppu: "ARPPU",
  userId: "角色 ID",
  accountId: "账号 ID",
  orders: "订单数",
  lastPay: "最后付费",
  id: "角色 ID",
  nickName: "角色名",
  lvl: "等级",
  vip: "VIP",
  combat: "战力",
  goodsId: "商品 ID",
  copyType: "关卡类型",
  pCopyId: "当前关卡",
  players: "角色数",
  install_step: "引导步骤",
  install_step_name: "步骤名称",
  accounts: "账号数",
  day2: "次日留存人数",
  day3: "三日留存人数",
  day7: "七日留存人数",
};
export function Reports({ boot, server }: { boot: Bootstrap; server: number }) {
  const available = types.filter((t) =>
    boot.permissions.includes("reports." + t[2]),
  );
  const [kind, setKind] = useState(available[0]?.[0] || "daily"),
    [data, setData] = useState<Row>(),
    [error, setError] = useState(""),
    [page, setPage] = useState(1);
  const [start, setStart] = useState(
      new Date(Date.now() - 6 * 86400000).toLocaleDateString("en-CA"),
    ),
    [end, setEnd] = useState(new Date().toLocaleDateString("en-CA"));
  const [filter, setFilter] = useState({ start, end }),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    const ac = new AbortController();
    setData(undefined);
    setError("");
    api("/reports/" + kind + query(server, { ...filter, page }), {
      signal: ac.signal,
    })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => ac.abort();
  }, [server, kind, filter, page, revision]);
  const columns = (data?.rows?.[0] ? Object.keys(data.rows[0]) : []).map(
    (key) => ({ key, label: labels[key] || key }),
  );
  return (
    <section className="panel">
      <div className="tabs" role="tablist">
        {available.map(([key, title]) => (
          <button
            role="tab"
            aria-selected={kind === key}
            className={kind === key ? "active" : ""}
            key={key}
            onClick={() => {
              setKind(key);
              setPage(1);
            }}
          >
            {title}
          </button>
        ))}
      </div>
      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setFilter({ start, end });
          setRevision((v) => v + 1);
        }}
      >
        <label>
          开始日期
          <input
            aria-label="开始日期"
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label>
          结束日期
          <input
            aria-label="结束日期"
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
        <button className="button primary" type="submit">
          查询
        </button>
        <button
          className="button"
          type="button"
          disabled={!data?.rows?.length}
          onClick={() => downloadCsv("运营报表.csv", data!.rows)}
        >
          导出当前页
        </button>
      </form>
      {error ? (
        <Alert>{error}</Alert>
      ) : !data ? (
        <Loading />
      ) : (
        <>
          {data.note && <div className="inline-note">{data.note}</div>}
          <DataTable columns={columns} rows={data.rows || []} />
          {data.total !== undefined && (
            <div className="pagination">
              <span>共 {data.total} 条</span>
              <div>
                <button
                  className="button"
                  disabled={page === 1}
                  onClick={() => setPage((v) => v - 1)}
                >
                  上一页
                </button>
                <span>
                  {page} /{" "}
                  {Math.max(1, Math.ceil(data.total / (data.pageSize || 20)))}
                </span>
                <button
                  className="button"
                  disabled={page * (data.pageSize || 20) >= data.total}
                  onClick={() => setPage((v) => v + 1)}
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
