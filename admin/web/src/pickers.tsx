import { useEffect, useRef, useState } from "react";
import { api } from "./api";
import type { Row } from "../../shared/types";

type Item = {
  id: number;
  name: string;
  note: string;
  type: number;
  typeName: string;
  max: number;
};
type Account = { id: number; name: string; status: number };

function useSearch<T>(
  url: (query: string) => string,
  pick: (data: Row) => T[],
) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<T[]>([]);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | undefined>(undefined);
  useEffect(() => {
    const timer = setTimeout(() => {
      controller.current?.abort();
      const ac = new AbortController();
      controller.current = ac;
      api<Row>(url(query), { signal: ac.signal })
        .then((data) => {
          setRows(pick(data));
          setError("");
        })
        .catch((e) => {
          if (e.name !== "AbortError") setError(e.message);
        });
    }, 200);
    return () => clearTimeout(timer);
    // url/pick are stable closures over local state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);
  return { query, setQuery, rows, error };
}

/**
 * 物品选择：按名称或 ID 搜索后加入奖励列表，再逐项填写数量。
 * 结果按 { 物品 ID: 数量 } 交给后台，与邮件附件、礼包码的 items 字段一致。
 */
export function ItemPicker({
  value,
  onChange,
}: {
  value: Row;
  onChange: (value: Row) => void;
}) {
  const selected: Record<string, number> = value || {};
  const ids = Object.keys(selected).filter((id) => Number(id) > 0);
  const [open, setOpen] = useState(false);
  const [names, setNames] = useState<Record<string, Item>>({});
  const search = useSearch<Item>(
    (q) => `/items?limit=20&q=${encodeURIComponent(q)}`,
    (data) => (data.items || []) as Item[],
  );
  useEffect(() => {
    if (!ids.length) return;
    let live = true;
    api<Row>(`/items?ids=${ids.join(",")}`)
      .then((data) => {
        if (!live) return;
        setNames((current) => {
          const next = { ...current };
          for (const item of data.items || []) next[item.id] = item;
          return next;
        });
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
    // 只在选择集合变化时补全名称。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);
  const update = (next: Record<string, number>) => onChange(next);
  const add = (item: Item) => {
    update({ ...selected, [item.id]: selected[item.id] || 1 });
    search.setQuery("");
    setOpen(false);
  };
  const remove = (id: string) => {
    const next = { ...selected };
    delete next[id];
    update(next);
  };
  const total = ids.reduce((sum, id) => sum + Number(selected[id] || 0), 0);
  return (
    <div className="item-picker">
      <div className="item-search">
        <input
          placeholder="搜索物品名称或输入物品 ID"
          value={search.query}
          onChange={(e) => {
            search.setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          autoComplete="off"
        />
        {open && search.query && (
          <ul className="item-options" role="listbox">
            {search.rows.map((item) => (
              <li key={item.id}>
                <button type="button" onMouseDown={() => add(item)}>
                  <span className="item-id">{item.id}</span>
                  <span className="item-name">{item.name}</span>
                  <span className="item-type">{item.typeName}</span>
                </button>
              </li>
            ))}
            {!search.rows.length && (
              <li className="item-empty">
                {search.error || "没有匹配的物品"}
              </li>
            )}
          </ul>
        )}
      </div>
      {ids.length > 0 && (
        <div className="item-rows">
          {ids.map((id) => (
            <div className="item-row" key={id}>
              <span className="item-id">{id}</span>
              <span className="item-name">{names[id]?.name || "读取中…"}</span>
              <input
                type="number"
                min={1}
                max={100000000}
                required
                value={selected[id]}
                onChange={(e) =>
                  update({ ...selected, [id]: Number(e.target.value) })
                }
                aria-label={`物品 ${id} 数量`}
              />
              <button
                type="button"
                className="icon-button"
                aria-label={`移除 ${names[id]?.name || id}`}
                onClick={() => remove(id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="picker-hint">
        {ids.length
          ? `已选 ${ids.length} 种，合计 ${total} 件`
          : "搜索并选择物品，再填写发放数量"}
      </p>
    </div>
  );
}

/**
 * 账号选择：用于把兑换码绑定到指定账号，0 表示不绑定。
 */
export function AccountPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<Account>();
  const search = useSearch<Account>(
    (q) => `/accounts?limit=20&q=${encodeURIComponent(q)}`,
    (data) => (data.accounts || []) as Account[],
  );
  useEffect(() => {
    if (!value) {
      setChosen(undefined);
      return;
    }
    api<Row>(`/accounts?limit=20&q=${value}`)
      .then((data) => {
        const found = (data.accounts || []).find(
          (account: Account) => account.id === value,
        );
        if (found) setChosen(found);
      })
      .catch(() => undefined);
  }, [value]);
  return (
    <div className="item-picker">
      <div className="item-search">
        <input
          placeholder="搜索账号名称或 ID，留空表示不绑定"
          value={search.query}
          onChange={(e) => {
            search.setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          autoComplete="off"
        />
        {open && search.query && (
          <ul className="item-options" role="listbox">
            {search.rows.map((account) => (
              <li key={account.id}>
                <button
                  type="button"
                  onMouseDown={() => {
                    onChange(account.id);
                    setChosen(account);
                    search.setQuery("");
                    setOpen(false);
                  }}
                >
                  <span className="item-id">{account.id}</span>
                  <span className="item-name">{account.name}</span>
                  <span className="item-type">
                    {Number(account.status) === 0 ? "正常" : "已封禁"}
                  </span>
                </button>
              </li>
            ))}
            {!search.rows.length && (
              <li className="item-empty">
                {search.error || "没有匹配的账号"}
              </li>
            )}
          </ul>
        )}
      </div>
      <div className="item-rows">
        <div className="item-row">
          <span className="item-id">{value || "—"}</span>
          <span className="item-name">
            {value ? chosen?.name || "读取中…" : "不绑定账号，任何账号均可兑换"}
          </span>
          {value > 0 && (
            <button
              type="button"
              className="icon-button"
              aria-label="解除绑定"
              onClick={() => onChange(0)}
            >
              ×
            </button>
          )}
        </div>
      </div>
      <p className="picker-hint">
        绑定后只有该账号可以兑换这批礼包码；解绑后恢复为不限账号。
      </p>
    </div>
  );
}
