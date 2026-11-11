import { describe, expect, test } from "bun:test";
import {
  attachments,
  dateTime,
  integer,
  validateFields,
} from "../src/validation";
import { identifier } from "../src/config";
import { allowed, type Actor } from "../src/auth";
import { legacyDates, mysqlDate } from "../src/time";
import { selectEncoding } from "../src/encoding";
const actor: Actor = {
  user: {
    id: 1,
    name: "reader",
    displayName: "reader",
    group: "reader",
    superAdmin: false,
  },
  role: new Set([104]),
  tokenHash: "",
  csrf: "",
};
describe("admin boundary validation", () => {
  test("compressed responses respect disabled and preferred encodings", () => {
    expect(selectEncoding("br, gzip", ["br", "gzip"])).toBe("br");
    expect(selectEncoding("br;q=0,gzip;q=1", ["br", "gzip"])).toBe("gzip");
    expect(selectEncoding("gzip;q=0", ["gzip"])).toBeUndefined();
  });
  test("legacy DATETIME values preserve the China wall clock", () => {
    const wire = new Date("2026-11-11T20:30:00Z");
    expect(mysqlDate(wire)).toBe("2026-11-11 20:30:00");
    expect(legacyDates({ time: wire, rows: [{ end: wire }] })).toEqual({
      time: "2026-11-11 20:30:00",
      rows: [{ end: "2026-11-11 20:30:00" }],
    });
    expect(() => dateTime("2026-02-30 00:00:00", "时间")).toThrow();
  });
  test("SQL identifiers and numeric IDs cannot inject queries", () => {
    expect(identifier("ttf_ly_game1")).toBe("`ttf_ly_game1`");
    for (const value of ["x; DROP TABLE x", "a.b", "`a`", "1abc", "a b"])
      expect(() => identifier(value)).toThrow();
    for (const value of ["1 OR 1=1", "", "1.2", null, true, -1, Infinity])
      expect(() => integer(value, "ID", 1)).toThrow();
  });
  test("fields reject arbitrary columns and invalid JSON", () => {
    const fields = [
      { key: "title", label: "标题", required: true, max: 5 },
      { key: "items", label: "附件", type: "json" as const },
    ];
    expect(() => validateFields({ password: "hack" }, fields, false)).toThrow(
      "不支持",
    );
    expect(() => validateFields({ title: "abcdef" }, fields, true)).toThrow();
    expect(() =>
      validateFields({ title: "ok", items: "invalid" }, fields, true),
    ).toThrow();
    expect(
      validateFields({ title: "标题", items: '{"99":2}' }, fields, true).items,
    ).toBe('{"99":2}');
    expect(() => attachments({ "99": -1 })).toThrow();
    expect(() => attachments({ "1 OR 1=1": 1 })).toThrow();
  });
  test("read access never grants editing, reward approval or unrelated reports", () => {
    expect(allowed(actor, "players.read")).toBe(true);
    for (const p of [
      "players.write",
      "mails.review",
      "system.write",
      "reports.recharge",
    ])
      expect(allowed(actor, p)).toBe(false);
    expect(
      allowed(
        { ...actor, user: { ...actor.user, superAdmin: true } },
        "system.write",
      ),
    ).toBe(true);
  });
  test("date fields require calendar date and time", () => {
    expect(dateTime("2026-11-11T16:00", "时间")).toBe("2026-11-11 16:00:00");
    expect(() => dateTime("$(date)", "时间")).toThrow();
    expect(() => dateTime("2026-13-11 00:00:00", "时间")).toThrow();
  });
});
