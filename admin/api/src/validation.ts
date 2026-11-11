import type { Field, Row } from "../../shared/types";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function integer(
  value: unknown,
  label: string,
  min = 0,
  max = 2147483647,
): number {
  if (typeof value !== "number" && typeof value !== "string")
    throw new HttpError(400, `${label}必须为整数`);
  const n =
    typeof value === "string" && value.trim() === "" ? NaN : Number(value);
  if (!Number.isSafeInteger(n) || n < min || n > max)
    throw new HttpError(400, `${label}必须为 ${min} 至 ${max} 的整数`);
  return n;
}
export function text(
  value: unknown,
  label: string,
  max: number,
  required = true,
): string {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (required && !value.trim())
  )
    throw new HttpError(
      400,
      `${label}${required ? "不能为空且" : ""}最多 ${max} 个字符`,
    );
  return value.trim();
}
export function object(value: unknown): Row {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new HttpError(400, "请求内容必须是对象");
  return value as Row;
}
export function json(value: unknown, label: string): string {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (parsed === null || typeof parsed !== "object") throw new Error();
    const result = JSON.stringify(parsed);
    if (result.length > 50000) throw new Error();
    return result;
  } catch {
    throw new HttpError(
      400,
      `${label}必须是有效的 JSON 对象或数组（最多 50 KB）`,
    );
  }
}
export function dateTime(value: unknown, label: string): string {
  const s = text(value, label, 19).replace("T", " ");
  const full = s.length === 16 ? `${s}:00` : s;
  const ms = new Date(full.replace(" ", "T") + "+08:00").getTime();
  if (
    !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(full) ||
    !Number.isFinite(ms) ||
    full.slice(0, 4) < "1970" ||
    new Date(ms + 8 * 3600000).toISOString().slice(0, 19).replace("T", " ") !==
      full
  )
    throw new HttpError(400, `${label}时间格式错误`);
  return full;
}
export function validateFields(
  data: unknown,
  fields: Field[],
  creating: boolean,
): Row {
  const input = object(data),
    output: Row = {};
  const allowed = new Set(fields.map((f) => f.key));
  for (const key of Object.keys(input))
    if (!allowed.has(key)) throw new HttpError(400, `不支持修改字段：${key}`);
  for (const f of fields) {
    let value = input[f.key];
    if (value === undefined && creating) value = f.default;
    if (value === undefined) {
      if (creating && f.required)
        throw new HttpError(400, `${f.label}不能为空`);
      continue;
    }
    if ((value === "" || value === null) && !f.required) {
      output[f.key] =
        f.type === "number"
          ? (f.default ?? 0)
          : f.type === "datetime"
            ? null
            : "";
      continue;
    }
    if (f.choices && !Object.hasOwn(f.choices, String(value)))
      throw new HttpError(400, `${f.label}选项无效`);
    output[f.key] =
      f.type === "number"
        ? integer(value, f.label, f.min ?? 0, f.max ?? 2147483647)
        : f.type === "datetime"
          ? dateTime(value, f.label)
          : f.type === "json"
            ? json(value, f.label)
            : f.type === "password"
              ? (text(value, f.label, f.max ?? 255, f.required), value)
              : text(value, f.label, f.max ?? 255, f.required);
  }
  if (!Object.keys(output).length) throw new HttpError(400, "没有可保存的字段");
  if (output.startTime && output.endTime && output.startTime >= output.endTime)
    throw new HttpError(400, "结束时间必须晚于开始时间");
  return output;
}
export const now = () =>
  new Date(Date.now() + 8 * 3600000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
export function attachments(value: unknown): string {
  const data = object(
    typeof value === "string" ? JSON.parse(json(value, "附件")) : value,
  );
  if (Object.keys(data).length > 30) throw new HttpError(400, "附件最多 30 种");
  for (const [id, count] of Object.entries(data)) {
    integer(id, "物品 ID", 1);
    data[id] = integer(count, "附件数量", 1, 100000000);
  }
  return JSON.stringify(data);
}
