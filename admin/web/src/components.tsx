import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type { Field, Row } from "../../shared/types";
import { display, localDate } from "./api";

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v3" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18M7 16v-4m5 4V7m5 9v-6" />
      </>
    ),
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    arrow: <path d="m9 5 7 7-7 7" />,
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 6 6" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7a9 9 0 1 0 1 8M20 3v5h-5" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    logout: (
      <>
        <path d="M9 5H4v14h5m5-14 7 7-7 7M8 12h13" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    book: (
      <>
        <path d="M4 3h15v18H4zM8 7h7M8 11h7M8 15h4" />
      </>
    ),
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    coin: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M15 8h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9m3-10v12" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.book}
    </svg>
  );
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <span className="spinner" />
      正在读取数据…
    </div>
  );
}
export function Empty({
  message = "暂无符合条件的记录",
}: {
  message?: string;
}) {
  return (
    <div className="empty">
      <Icon name="book" size={36} />
      <strong>{message}</strong>
      <p>可以调整筛选条件后重新查询。</p>
    </div>
  );
}
export function Alert({ children }: { children: ReactNode }) {
  return (
    <div className="alert" role="alert">
      {children}
    </div>
  );
}
export function Modal({
  title,
  subtitle,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => {
      dialog.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={"modal " + (wide ? "wide" : "")}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button className="icon-button" aria-label="关闭" onClick={onClose}>
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Form({
  fields,
  initial = {},
  submit = "保存",
  onSave,
  onCancel,
}: {
  fields: Field[];
  initial?: Row;
  submit?: string;
  onSave: (data: Row) => Promise<void>;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<Row>(() =>
    Object.fromEntries(
      fields.map((f) => [
        f.key,
        initial[f.key] ?? f.default ?? (f.type === "number" ? 0 : ""),
      ]),
    ),
  );
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const prefix = useId();
  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      await onSave(values);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save}>
      <div className="form-grid">
        {fields.map((f) => (
          <label
            className={
              "form-field " +
              (["textarea", "json"].includes(f.type || "") ? "full" : "")
            }
            key={f.key}
            htmlFor={prefix + f.key}
          >
            <span>
              {f.label}
              {f.required && <em> *</em>}
            </span>
            {f.choices ? (
              <select
                id={prefix + f.key}
                value={String(values[f.key])}
                onChange={(e) =>
                  setValues({ ...values, [f.key]: e.target.value })
                }
              >
                {Object.entries(f.choices).map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </select>
            ) : f.type === "json" || f.type === "textarea" ? (
              <textarea
                id={prefix + f.key}
                required={f.required}
                rows={f.type === "json" ? 4 : 3}
                className={f.type === "json" ? "code" : ""}
                maxLength={f.max || 50000}
                value={
                  typeof values[f.key] === "object"
                    ? JSON.stringify(values[f.key], null, 2)
                    : values[f.key]
                }
                onChange={(e) =>
                  setValues({ ...values, [f.key]: e.target.value })
                }
              />
            ) : (
              <input
                id={prefix + f.key}
                required={f.required}
                type={
                  f.type === "datetime"
                    ? "datetime-local"
                    : f.type === "number"
                      ? "number"
                      : f.type === "password"
                        ? "password"
                        : "text"
                }
                min={f.min ?? 0}
                max={f.max}
                maxLength={f.max}
                autoComplete={f.type === "password" ? "new-password" : "off"}
                value={
                  f.type === "datetime"
                    ? localDate(values[f.key])
                    : values[f.key]
                }
                onChange={(e) =>
                  setValues({ ...values, [f.key]: e.target.value })
                }
              />
            )}
          </label>
        ))}
      </div>
      {error && <Alert>{error}</Alert>}
      <div className="form-actions">
        {onCancel && (
          <button
            type="button"
            className="button"
            disabled={busy}
            onClick={onCancel}
          >
            取消
          </button>
        )}
        <button className="button primary" disabled={busy} type="submit">
          {busy ? "正在提交…" : submit}
        </button>
      </div>
    </form>
  );
}
export function DataTable({
  rows,
  columns,
  onRow,
  selected,
  onSelect,
}: {
  rows: Row[];
  columns: { key: string; label: string }[];
  onRow?: (row: Row) => void;
  selected?: Set<number>;
  onSelect?: (id: number) => void;
}) {
  if (!rows.length) return <Empty />;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {onSelect && <th aria-label="选择" />}
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
            {onRow && <th />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || row.user_id || row.op_id || i}>
              {onSelect && (
                <td>
                  <input
                    type="checkbox"
                    aria-label={`选择 ${row.id}`}
                    checked={selected?.has(Number(row.id)) || false}
                    onChange={() => onSelect(Number(row.id))}
                  />
                </td>
              )}
              {columns.map((c, n) => (
                <td
                  key={c.key}
                  title={display(row[c.key], c.key)}
                  className={n === 0 ? "identifier" : ""}
                >
                  {n === 0 && onRow ? (
                    <button className="table-link" onClick={() => onRow(row)}>
                      {display(row[c.key], c.key)}
                    </button>
                  ) : isStatus(c.key) ? (
                    <span
                      className={
                        "badge " +
                        (Number(row[c.key]) === 1
                          ? "green"
                          : Number(row[c.key]) === 2
                            ? "red"
                            : "")
                      }
                    >
                      {statusLabel(row[c.key], c.key)}
                    </span>
                  ) : (
                    display(row[c.key], c.key)
                  )}
                </td>
              ))}
              {onRow && (
                <td>
                  <button
                    className="icon-button"
                    aria-label="查看详情"
                    onClick={() => onRow(row)}
                  >
                    <Icon name="arrow" size={16} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function isStatus(key: string) {
  return [
    "isOpen",
    "isChecked",
    "isRead",
    "isPicked",
    "isUsed",
    "isClose",
  ].includes(key);
}
function statusLabel(v: unknown, k: string) {
  if (k === "isChecked")
    return ["待审核", "已通过", "已驳回"][Number(v)] || String(v);
  return Number(v) === 1 ? "是" : "否";
}
export function Detail({ row }: { row: Row }) {
  return (
    <dl className="details">
      {Object.entries(row).map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>
            {typeof value === "string" && /^[\[{]/.test(value) ? (
              <pre>{pretty(value)}</pre>
            ) : (
              display(value, key)
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
function pretty(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}
