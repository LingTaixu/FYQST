import type { Row } from "../../shared/types";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
let csrf = "";
const pendingWrites = new Map<string, string>();
export const setCsrf = (value: string) => {
  csrf = value;
};
export async function api<T = Row>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    signal?: AbortSignal;
    key?: string;
  } = {},
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const fingerprint =
    method + " " + path + " " + JSON.stringify(options.body ?? {});
  // getRandomValues also works on HTTP deployments without randomUUID.
  const key =
    method === "GET"
      ? ""
      : options.key ||
        pendingWrites.get(fingerprint) ||
        Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
          byte.toString(16).padStart(2, "0"),
        ).join("");
  if (method !== "GET") pendingWrites.set(fingerprint, key);
  const response = await fetch("/vp000/api" + path, {
    method,
    credentials: "same-origin",
    signal: options.signal,
    headers:
      method === "GET"
        ? {}
        : {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrf,
            "Idempotency-Key": key,
          },
    body: method === "GET" ? undefined : JSON.stringify(options.body ?? {}),
  });
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 401 && path !== "/auth/login")
      window.dispatchEvent(new Event("admin:unauthorized"));
    throw new ApiError(response.status, result.error || "请求失败");
  }
  pendingWrites.delete(fingerprint);
  return result as T;
}
export const query = (server: number, values: Row = {}) =>
  "?" +
  new URLSearchParams({
    server: String(server),
    ...Object.fromEntries(
      Object.entries(values)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => [k, String(v)]),
    ),
  });
export function display(value: unknown, key = ""): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  if (key === "login_time" || key === "op_time")
    return new Date(Number(value) * 1000).toLocaleString("zh-CN", {
      hour12: false,
    });
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:/.test(value))
    return new Date(value).toLocaleString("zh-CN", { hour12: false });
  return String(value);
}
export function localDate(value: unknown): string {
  if (!value) return "";
  const s = String(value);
  if (s.endsWith("Z"))
    return new Date(new Date(s).getTime() + 8 * 3600000)
      .toISOString()
      .slice(0, 16);
  return s.replace(" ", "T").slice(0, 16);
}
export function downloadCsv(name: string, rows: Row[]) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const cell = (v: unknown) =>
    '"' +
    String(v ?? "")
      .replace(/^[=+@\-\t\r]/, "'$&")
      .replace(/"/g, '""') +
    '"';
  const text =
    "\uFEFF" +
    [
      keys.map(cell).join(","),
      ...rows.map((row) => keys.map((k) => cell(row[k])).join(",")),
    ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
