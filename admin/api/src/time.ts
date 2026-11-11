// Existing game DATETIME columns store Asia/Shanghai wall time. Bun SQL decodes
// their wire values as UTC Dates; preserve the wall clock instead of shifting it.
export function mysqlDate(value: Date | string): string {
  return value instanceof Date
    ? value.toISOString().slice(0, 19).replace("T", " ")
    : value;
}
export function legacyDates(value: unknown): unknown {
  if (value instanceof Date) return mysqlDate(value);
  if (Array.isArray(value)) return value.map(legacyDates);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, legacyDates(item)]),
    );
  return value;
}
