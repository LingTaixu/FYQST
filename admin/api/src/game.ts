import { createRequire } from "node:module";
import { config } from "./config";
import { serverContext, type Query } from "./db";
import { HttpError } from "./validation";
import type { Row } from "../../shared/types";

const require = createRequire(import.meta.url);
export const rechargeProducts: Record<
  string,
  Row
> = require("../../../Server/s1/packages/uw-data/temp/c_recharge.js");
export async function gameCall(
  serverId: unknown,
  route: "admin.ops.a" | "admin.ops.b" | "admin.ops.c",
  args: Row,
  q?: Query,
) {
  const { server } = await serverContext(serverId, q);
  const origin = `http://${server.host}:${server.port}`;
  if (!config.gameOrigins.includes(origin))
    throw new HttpError(422, "游戏服务地址尚未加入 ADMIN_GAME_ORIGINS 配置");
  const url = new URL("/", origin);
  url.search = new URLSearchParams({
    r: route,
    a: JSON.stringify(args),
    s: "0",
    c: "0",
    ak: config.gameKey,
  }).toString();
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error("HTTP");
    const data = (await response.json()) as Row;
    if (data.m && Number(data.m) !== 0) throw new Error("game response");
    return Object.hasOwn(data, "v") ? data.v : data;
  } catch {
    throw new HttpError(502, "游戏服务未完成操作，请检查服务状态后再查询结果");
  }
}
