import { afterEach, expect, test } from "bun:test";
import { api, setCsrf } from "../admin/web/src/api";

const originalFetch = globalThis.fetch;
const cryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto")!;
const getRandomValues = crypto.getRandomValues.bind(crypto);
afterEach(() => {
  globalThis.fetch = originalFetch;
  Object.defineProperty(globalThis, "crypto", cryptoDescriptor);
  setCsrf("");
});

test("admin GET works without generating a write key", async () => {
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: { getRandomValues() { throw new Error("GET must not need randomness"); } },
  });
  globalThis.fetch = (async (_url, options) => {
    expect(options?.method).toBe("GET");
    expect(options?.headers).toEqual({});
    return Response.json({ ok: true });
  }) as typeof fetch;
  expect(await api("/bootstrap")).toEqual({ ok: true });
});

test("HTTP admin writes use secure random keys without randomUUID and reuse them on retry", async () => {
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: { getRandomValues },
  });
  setCsrf("csrf-probe");
  const keys: string[] = [];
  globalThis.fetch = (async (_url, options) => {
    const headers = new Headers(options?.headers);
    expect(options?.method).toBe("POST");
    expect(headers.get("X-CSRF-Token")).toBe("csrf-probe");
    const key = headers.get("Idempotency-Key")!;
    expect(key).toMatch(/^[0-9a-f]{32}$/);
    keys.push(key);
    if (keys.length === 1) throw new Error("Network interrupted");
    return Response.json({ ok: true });
  }) as typeof fetch;
  const write = () => api("/test-write", { method: "post", body: { value: 1 } });
  await expect(write()).rejects.toThrow("Network interrupted");
  await write();
  await write();
  expect(keys[1]).toBe(keys[0]);
  expect(keys[2]).not.toBe(keys[0]);
});
