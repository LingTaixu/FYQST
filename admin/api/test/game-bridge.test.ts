import { describe, expect, test } from "bun:test";
import vm from "node:vm";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../../../Server/s1/route/admin/handler/ops.js", import.meta.url),
  "utf8",
);
function bridge(cached: boolean) {
  const user = { id: 1, accountId: 10, robotId: 0, serverIndexId: 1, gold: 5 };
  let dirty = 0,
    stored: unknown;
  const player = { userData: user, setUserDataDirty: () => dirty++ };
  const session = { expireTime: new Date(Date.now() + 100000), isKick: 0 };
  const exports: Record<string, Function> = {};
  const modules: Record<string, unknown> = {
    "uw-global": {
      g_cache: {
        getGamePlayerInCache: () => (cached ? player : null),
        GamePlayerList: () => (cached ? { 1: player } : {}),
        UDDirtyType: { noTwoBag: 1 },
      },
    },
    "uw-db": { uwClient: {} },
    "uw-route": { sessionManager: { getSessionByAccountId: () => session } },
    "uw-user": {
      userDao: {
        selectCols: (_a: unknown, _b: unknown, _c: unknown, cb: Function) =>
          cb(null, user),
        update: (_a: unknown, data: unknown, _c: unknown, cb: Function) => {
          stored = data;
          cb(null);
        },
      },
    },
  };
  vm.runInNewContext(source, {
    require: (name: string) => modules[name],
    exports,
    Date,
    Number,
    Object,
    Error,
  });
  const call = (fn: string, args: unknown) =>
    new Promise<any>((resolve, reject) =>
      exports[fn](args, {}, (err: unknown, result: unknown) =>
        err ? reject(err) : resolve(result),
      ),
    );
  return {
    call,
    user,
    session,
    get dirty() {
      return dirty;
    },
    get stored() {
      return stored;
    },
  };
}
describe("game cache bridge", () => {
  test("online updates change game cache and mark it dirty", async () => {
    const game = bridge(true);
    const response = await game.call("a", { userId: 1, changes: { gold: 20 } });
    expect(response.storage).toBe("game-cache");
    expect(game.user.gold).toBe(20);
    expect(game.dirty).toBe(1);
    expect(game.stored).toBeUndefined();
  });
  test("offline updates persist only the allowlisted fields", async () => {
    const game = bridge(false);
    const response = await game.call("a", { userId: 1, changes: { gold: 20 } });
    expect(response.storage).toBe("database");
    expect(game.stored).toEqual({ gold: 20 });
    await expect(
      game.call("a", { userId: 1, changes: { accountId: 2 } }),
    ).rejects.toThrow();
    await expect(
      game.call("a", { userId: 1, changes: { gold: -1 } }),
    ).rejects.toThrow();
  });
  test("counts authenticated sessions and kicks without arbitrary commands", async () => {
    const game = bridge(true);
    expect((await game.call("b", {})).online).toBe(1);
    expect(
      (await game.call("c", { accountId: 10, serverIndexId: 1 })).kicked,
    ).toBe(true);
    expect((await game.call("b", {})).online).toBe(0);
  });
});
