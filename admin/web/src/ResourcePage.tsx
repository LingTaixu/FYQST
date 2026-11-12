import { useEffect, useState } from "react";
import type {
  Bootstrap,
  PageData,
  ResourceMeta,
  Row,
} from "../../shared/types";
import { api, downloadCsv, query } from "./api";
import {
  Alert,
  DataTable,
  Detail,
  Form,
  Icon,
  Loading,
  Modal,
} from "./components";
import { ActionForm, actionTitles } from "./Actions";

export function ResourcePage({
  resource: r,
  boot,
  server,
  notify,
}: {
  resource: ResourceMeta;
  boot: Bootstrap;
  server: number;
  notify: (message: string) => void;
}) {
  const [data, setData] = useState<PageData>(),
    [error, setError] = useState(""),
    [search, setSearch] = useState(""),
    [q, setQ] = useState(""),
    [page, setPage] = useState(1),
    [status, setStatus] = useState("0"),
    [revision, setRevision] = useState(0);
  const [modal, setModal] = useState<
      "create" | "detail" | "edit" | "delete" | string | null
    >(null),
    [detail, setDetail] = useState<Row>(),
    [extra, setExtra] = useState<Row>(),
    [detailError, setDetailError] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set()),
    [busy, setBusy] = useState(false);
  const prefix = "/resources/" + r.key;
  const refresh = () => {
    setRevision((v) => v + 1);
    setSelected(new Set());
  };
  useEffect(() => {
    const ac = new AbortController();
    setError("");
    setData(undefined);
    setSelected(new Set());
    api<PageData>(
      prefix +
        query(server, {
          q,
          page,
          ...(r.key === "mail-review" ? { status } : {}),
        }),
      { signal: ac.signal },
    )
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => ac.abort();
  }, [prefix, server, q, page, status, revision, r.key]);
  async function show(row: Row) {
    setModal("detail");
    setDetail(undefined);
    setExtra(undefined);
    setDetailError("");
    try {
      const d = await api(prefix + "/" + row[r.id] + query(server));
      setDetail(d);
      if (r.key === "players" || r.key === "guilds")
        setExtra(await api("/" + r.key + "/" + row[r.id] + query(server)));
    } catch (e) {
      setDetailError((e as Error).message);
    }
  }
  const done = (message: string) => {
    notify(message);
    setModal(null);
    refresh();
  };
  async function review(approve: boolean, ids = [...selected]) {
    if (busy) return;
    setBusy(true);
    try {
      const result = await api("/operations/mail-review" + query(server), {
        method: "POST",
        body: { ids, approve },
      });
      done(result.message);
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setBusy(false);
    }
  }
  const has = (p: string) => boot.permissions.includes(p);
  const custom =
    r.key === "gifts" && has("gifts.create")
      ? "gift-generate"
      : r.key === "recharge" && has("recharge.create")
        ? "recharge"
        : (r.key === "whitelist" && has("whitelist.write")) ||
            (r.key === "bans" && has("bans.write"))
          ? "account"
          : null;
  const fieldInitial = detail
    ? Object.fromEntries(
        r.fields.map((f) => [f.key, detail[f.key] ?? f.default ?? ""]),
      )
    : {};
  return (
    <>
      <section className="panel">
        <div className="toolbar">
          <form
            className="search-box"
            onSubmit={(e) => {
              e.preventDefault();
              setQ(search);
              setPage(1);
              refresh();
            }}
          >
            <Icon name="search" size={18} />
            <input
              aria-label="搜索记录"
              placeholder="搜索 ID、名称或关键词…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="button" type="submit">
              查询
            </button>
          </form>
          {r.key === "mail-review" && (
            <select
              aria-label="审核状态"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="0">待审核</option>
              <option value="1">已通过</option>
              <option value="2">已驳回</option>
            </select>
          )}
          <div className="toolbar-right">
            <button
              className="icon-button bordered"
              aria-label="刷新数据"
              onClick={refresh}
            >
              <Icon name="refresh" size={18} />
            </button>
            {r.key === "gifts" && has("gifts.export") && (
              <button
                className="button"
                onClick={() =>
                  downloadCsv("礼包码当前页.csv", data?.rows || [])
                }
                disabled={!data?.rows.length}
              >
                导出当前页
              </button>
            )}
            {custom && (
              <button
                className="button primary"
                onClick={() => {
                  setDetail(undefined);
                  setModal(custom);
                }}
              >
                <Icon name="plus" size={16} />
                {actionTitles[custom]}
              </button>
            )}
            {r.canCreate && (
              <button
                className="button primary"
                onClick={() => {
                  setDetail(undefined);
                  setModal("create");
                }}
              >
                <Icon name="plus" size={16} />
                新增
              </button>
            )}
            {r.key === "mails" &&
              (has("mails.compose") || has("mails.broadcast")) && (
                <button
                  className="button primary"
                  onClick={() => setModal("mail-compose")}
                >
                  撰写邮件
                </button>
              )}
          </div>
        </div>
        {r.key === "mail-review" && status === "0" && !!data?.rows.length && (
          <div className="batch-toolbar">
            <button
              className="text-button"
              onClick={() =>
                setSelected(
                  selected.size === data.rows.length
                    ? new Set()
                    : new Set(data.rows.map((row) => Number(row.id))),
                )
              }
            >
              选择本页
            </button>
            <span>已选 {selected.size} 封</span>
            <button
              className="button primary small"
              disabled={!selected.size || busy}
              onClick={() => {
                setModal("approve-batch");
              }}
            >
              审核通过
            </button>
            <button
              className="button small"
              disabled={!selected.size || busy}
              onClick={() => {
                setModal("reject-batch");
              }}
            >
              驳回
            </button>
          </div>
        )}
        {r.key === "gifts" && has("gifts.create") && !!data?.rows.length && (
          <div className="batch-toolbar">
            <button
              className="text-button"
              onClick={() =>
                setSelected(
                  selected.size === data.rows.length
                    ? new Set()
                    : new Set(data.rows.map((row) => Number(row.id))),
                )
              }
            >
              选择本页
            </button>
            <span>已选 {selected.size} 个礼包码</span>
            <button
              className="button primary small"
              disabled={!selected.size || busy}
              onClick={() => setModal("gift-bind")}
            >
              绑定账号
            </button>
          </div>
        )}
        {error && <Alert>{error}</Alert>}
        {!data && !error ? (
          <Loading />
        ) : data ? (
          <>
            <DataTable
              rows={data.rows}
              columns={r.columns}
              onRow={show}
              selected={selected}
              onSelect={
                (r.key === "mail-review" && status === "0") ||
                (r.key === "gifts" && has("gifts.create"))
                  ? (id) =>
                      setSelected((old) => {
                        const next = new Set(old);
                        if (next.has(id)) next.delete(id);
                        else next.add(id);
                        return next;
                      })
                  : undefined
              }
            />
            <div className="pagination">
              <span>
                共 <strong>{data.total}</strong> 条记录 · 每页 {data.pageSize}{" "}
                条
              </span>
              <div>
                <button
                  className="button"
                  disabled={page === 1}
                  onClick={() => setPage((v) => v - 1)}
                >
                  上一页
                </button>
                <span>
                  {page} / {Math.max(1, Math.ceil(data.total / data.pageSize))}
                </span>
                <button
                  className="button"
                  disabled={page * data.pageSize >= data.total}
                  onClick={() => setPage((v) => v + 1)}
                >
                  下一页
                </button>
              </div>
            </div>
          </>
        ) : null}
      </section>
      {modal === "detail" && (
        <Modal title={r.title + "详情"} onClose={() => setModal(null)} wide>
          {detailError && <Alert>{detailError}</Alert>}
          {!detail && !detailError ? (
            <Loading />
          ) : (
            detail && (
              <>
                <div className="detail-actions">
                  {r.canEdit && (
                    <button
                      className="button primary"
                      onClick={() => setModal("edit")}
                    >
                      编辑记录
                    </button>
                  )}
                  {r.canDelete && (
                    <button
                      className="button danger"
                      onClick={() => setModal("delete")}
                    >
                      删除记录
                    </button>
                  )}
                  {r.key === "players" && (
                    <>
                      {has("players.write") && (
                        <button
                          className="button"
                          onClick={() => setModal("player-update")}
                        >
                          修改角色
                        </button>
                      )}
                      {has("players.progress") && (
                        <button
                          className="button"
                          onClick={() => setModal("player-progress")}
                        >
                          修改关卡
                        </button>
                      )}
                      {has("mails.compose") && (
                        <button
                          className="button"
                          onClick={() => setModal("mail-compose")}
                        >
                          发送邮件
                        </button>
                      )}
                      {(has("bans.write") || has("players.kick")) && (
                        <button
                          className="button"
                          onClick={() => setModal("account")}
                        >
                          账号状态操作
                        </button>
                      )}
                    </>
                  )}
                  {r.key === "mail-review" &&
                    Number(detail.isChecked) === 0 && (
                      <>
                        <button
                          className="button primary"
                          disabled={busy}
                          onClick={() => {
                            setSelected(new Set([Number(detail.id)]));
                            setModal("approve-batch");
                          }}
                        >
                          审核通过
                        </button>
                        <button
                          className="button"
                          disabled={busy}
                          onClick={() => {
                            setSelected(new Set([Number(detail.id)]));
                            setModal("reject-batch");
                          }}
                        >
                          驳回
                        </button>
                      </>
                    )}
                </div>
                <Detail row={detail} />
                {extra && (
                  <>
                    <h3>{r.key === "guilds" ? "行会成员" : "账号与关卡"}</h3>
                    {r.key === "guilds" ? (
                      <DataTable
                        rows={extra.rows || []}
                        columns={[
                          { key: "userId", label: "角色 ID" },
                          { key: "nickName", label: "角色名" },
                          { key: "lvl", label: "等级" },
                          { key: "position", label: "职位" },
                        ]}
                      />
                    ) : (
                      <Detail row={extra} />
                    )}
                  </>
                )}
              </>
            )
          )}
        </Modal>
      )}
      {(modal === "create" || modal === "edit") && (
        <Modal
          title={(modal === "create" ? "新增" : "编辑") + r.title}
          onClose={() => setModal(null)}
          wide
        >
          <Form
            key={modal}
            fields={r.fields}
            initial={modal === "edit" ? fieldInitial : {}}
            onCancel={() => setModal(null)}
            onSave={async (values) => {
              await api(
                prefix +
                  (modal === "edit" ? "/" + detail![r.id] : "") +
                  query(server),
                { method: modal === "edit" ? "PATCH" : "POST", body: values },
              );
              done("记录已保存");
            }}
          />
        </Modal>
      )}
      {modal === "delete" && (
        <Modal title="删除记录" onClose={() => setModal(null)}>
          <p>
            确认删除 {r.title} #{detail?.[r.id]}？此操作会修改数据库。
          </p>
          <Form
            fields={[]}
            submit="确认删除"
            onCancel={() => setModal(null)}
            onSave={async () => {
              await api(prefix + "/" + detail![r.id] + query(server), {
                method: "DELETE",
              });
              done("记录已删除");
            }}
          />
        </Modal>
      )}
      {(modal === "approve-batch" || modal === "reject-batch") && (
        <Modal
          title={modal === "approve-batch" ? "审核通过并投递" : "驳回邮件"}
          onClose={() => setModal(null)}
        >
          <p>
            确认{modal === "approve-batch" ? "投递" : "驳回"}选中的{" "}
            {selected.size} 封邮件？
            {modal === "approve-batch" ? "通过后奖励将可被玩家领取。" : ""}
          </p>
          <Form
            fields={[]}
            submit="确认"
            onCancel={() => setModal(null)}
            onSave={async () => {
              await review(modal === "approve-batch");
            }}
          />
        </Modal>
      )}
      {modal && actionTitles[modal] && (
        <Modal
          title={actionTitles[modal]}
          subtitle={
            "当前区服：" +
            (boot.servers.find((s) => Number(s.id) === server)?.area || server)
          }
          onClose={() => setModal(null)}
          wide
        >
          <ActionForm
            kind={modal}
            boot={boot}
            server={server}
            initial={
              modal === "player-update"
                ? detail
                : modal === "account"
                  ? {
                      accountId:
                        extra?.account?.id || detail?.accountId || detail?.id,
                    }
                  : modal === "mail-compose" || modal === "player-progress"
                    ? { userId: detail?.id || 0 }
                    : modal === "gift-bind"
                      ? { ids: [...selected] }
                      : {}
            }
            onDone={done}
          />
        </Modal>
      )}
    </>
  );
}
