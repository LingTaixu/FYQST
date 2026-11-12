import { resolve, sep } from "node:path";
import { existsSync } from "node:fs";
import { A, L, config } from "./config";
import { db } from "./db";
import {
  allowed,
  authenticate,
  checkOrigin,
  cookie,
  csrfCheck,
  login,
  logout,
  permissionMenus,
} from "./auth";
import { getResource, metadata, resourceGet, resourceWrite } from "./resources";
import {
  guildMembers,
  perform,
  playerDetail,
  playerFields,
} from "./operations";
import { rechargeProducts } from "./game";
import { searchAccounts, searchItems } from "./catalog";
import { dashboard, report } from "./reports";
import { HttpError } from "./validation";
import { legacyDates } from "./time";
import { selectEncoding } from "./encoding";

const security = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "same-origin",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; media-src 'none'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
};
function response(
  request: Request,
  value: unknown,
  status = 200,
  extra: Record<string, string> = {},
) {
  const data = JSON.stringify(legacyDates(value), (_, v) =>
    typeof v === "bigint" ? Number(v) : v,
  );
  const headers = new Headers({
    ...security,
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...extra,
  });
  if (
    data.length > 1024 &&
    selectEncoding(request.headers.get("accept-encoding"), ["gzip"])
  ) {
    headers.set("Content-Encoding", "gzip");
    headers.set("Vary", "Accept-Encoding");
    return new Response(Bun.gzipSync(data), { status, headers });
  }
  return new Response(data, { status, headers });
}
export async function app(request: Request, ip = "local"): Promise<Response> {
  const url = new URL(request.url);
  try {
    let path: string;
    try {
      path = decodeURIComponent(url.pathname);
    } catch {
      throw new HttpError(400, "路径编码无效");
    }
    if (/(?:^|\/)\./.test(path)) throw new HttpError(404, "页面不存在");
    if (/\.(mp3|ogg|oga|wav|m4a|aac|flac|opus|weba)(?:$|\/)/i.test(path))
      return new Response(null, {
        status: 204,
        headers: {
          "X-Audio-Policy": "disabled",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    if (path === "/vp000/api/health" && request.method === "GET")
      return response(request, {
        ok: true,
        runtime: "Bun",
        version: Bun.version,
      });
    if (!path.startsWith("/vp000/api/"))
      return await staticFile(request, url, path);
    if (!["GET", "POST", "PATCH", "DELETE"].includes(request.method))
      throw new HttpError(405, "请求方法不受支持");
    const write = request.method !== "GET";
    if (write) checkOrigin(request);
    let body: unknown = {};
    if (write) {
      if (!request.headers.get("content-type")?.includes("application/json"))
        throw new HttpError(415, "请使用 JSON 请求");
      const raw = await request.text();
      if (raw.length > 131072) throw new HttpError(413, "请求内容过大");
      try {
        body = JSON.parse(raw);
      } catch {
        throw new HttpError(400, "JSON 格式错误");
      }
    }
    if (path === "/vp000/api/auth/login" && request.method === "POST") {
      const token = await login(request, body, ip);
      return response(request, { ok: true }, 200, {
        "Set-Cookie": cookie(token),
      });
    }
    const actor = await authenticate(request);
    if (write) csrfCheck(request, actor);
    if (path === "/vp000/api/auth/logout" && request.method === "POST") {
      await logout(actor);
      return response(request, { ok: true }, 200, {
        "Set-Cookie": cookie("", true),
      });
    }
    if (path === "/vp000/api/bootstrap" && request.method === "GET") {
      const servers = await db.unsafe(
        `SELECT id,name,area,serverId,isClose FROM ${L("uw_server_info")} ORDER BY sort,id`,
      );
      return response(request, {
        user: actor.user,
        csrf: actor.csrf,
        resources: metadata(actor),
        servers: [...servers],
        permissions: Object.keys(permissionMenus).filter((p) =>
          allowed(actor, p),
        ),
        playerFields,
        rechargeProducts: Object.values(rechargeProducts).map((p) => ({
          id: p.id,
          name: p.name,
          cost: p.cost,
        })),
      });
    }
    if (path === "/vp000/api/items" && request.method === "GET") {
      if (
        !["mails.compose", "mails.broadcast", "gifts.read", "gifts.create"].some(
          (permission) => allowed(actor, permission),
        )
      )
        throw new HttpError(403, "当前管理员没有此操作权限");
      const limit = pageLimit(url.searchParams.get("limit"));
      const ids = (url.searchParams.get("ids") || "")
        .split(",")
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0)
        .slice(0, 60);
      return response(request, {
        items: searchItems(url.searchParams.get("q") || "", ids, limit),
      });
    }
    if (path === "/vp000/api/accounts" && request.method === "GET") {
      if (
        !["players.read", "mails.compose", "mails.broadcast", "gifts.create"].some(
          (permission) => allowed(actor, permission),
        )
      )
        throw new HttpError(403, "当前管理员没有此操作权限");
      return response(request, {
        accounts: await searchAccounts(
          url.searchParams.get("q") || "",
          pageLimit(url.searchParams.get("limit")),
        ),
      });
    }
    if (path === "/vp000/api/dashboard" && request.method === "GET")
      return response(request, await dashboard(actor, url));
    const resource = /^\/vp000\/api\/resources\/([a-z-]+)(?:\/(\d+))?$/.exec(
      path,
    );
    if (resource) {
      getResource(resource[1]);
      if (request.method === "GET")
        return response(
          request,
          await resourceGet(actor, resource[1], url, resource[2]),
        );
      if (
        (request.method === "POST" && resource[2]) ||
        (request.method !== "POST" && !resource[2])
      )
        throw new HttpError(405, "请求方法与资源路径不匹配");
      return response(
        request,
        await resourceWrite(
          request,
          actor,
          resource[1],
          url,
          body,
          resource[2],
        ),
      );
    }
    const operation = /^\/vp000\/api\/operations\/([a-z-]+)$/.exec(path);
    if (operation && request.method === "POST")
      return response(
        request,
        await perform(request, actor, operation[1], url, body),
      );
    const detail = /^\/vp000\/api\/(players|guilds)\/(\d+)$/.exec(path);
    if (detail && request.method === "GET")
      return response(
        request,
        detail[1] === "players"
          ? await playerDetail(actor, url, detail[2])
          : await guildMembers(actor, url, detail[2]),
      );
    const reporting = /^\/vp000\/api\/reports\/([a-z-]+)$/.exec(path);
    if (reporting && request.method === "GET")
      return response(request, await report(actor, reporting[1], url));
    throw new HttpError(404, "接口不存在");
  } catch (error) {
    const expected = error instanceof HttpError;
    if (!expected)
      console.error(
        "[admin]",
        error instanceof Error ? error.message : "Unknown error",
      );
    const conflict =
      (error as any)?.errno === 1062 || (error as any)?.code === "ER_DUP_ENTRY";
    return response(
      request,
      {
        error: expected
          ? error.message
          : conflict
            ? "数据已存在，请检查重复账号或编号"
            : "服务器未完成请求，请检查后台日志",
      },
      expected ? error.status : conflict ? 409 : 500,
    );
  }
}
function pageLimit(value: string | null) {
  const limit = Number(value || 30);
  if (!Number.isInteger(limit) || limit < 1) return 30;
  return Math.min(limit, 100);
}
async function staticFile(request: Request, url: URL, path: string) {  if (!["GET", "HEAD"].includes(request.method))
    throw new HttpError(405, "请求方法不受支持");
  if (path === "/vp000") return Response.redirect(new URL("/vp000/", url), 302);
  if (!path.startsWith("/vp000/")) throw new HttpError(404, "页面不存在");
  const relative = path.slice("/vp000/".length);
  // Legacy PHP URLs cannot execute PHP or bypass the new API permission checks.
  if (/\.(php|inc|sql|log|ini|env|ts|map)$/i.test(relative))
    throw new HttpError(410, "旧 PHP 后台已停用，请访问 /vp000/");
  let filePath = resolve(config.webRoot, relative || "index.html");
  if (!filePath.startsWith(config.webRoot + sep))
    throw new HttpError(404, "文件不存在");
  if (!(await Bun.file(filePath).exists())) {
    if (relative.includes(".")) throw new HttpError(404, "文件不存在");
    filePath = resolve(config.webRoot, "index.html");
  }
  let file = Bun.file(filePath);
  if (!(await file.exists()))
    throw new HttpError(503, "后台前端尚未构建，请执行 bun run admin:build");
  const headers = new Headers({
    ...security,
    "Content-Type": file.type,
    "Cache-Control": relative.startsWith("assets/")
      ? "public, max-age=31536000, immutable"
      : "no-cache",
    Vary: "Accept-Encoding",
  });
  const encoding = selectEncoding(request.headers.get("accept-encoding"), [
    "br",
    "gzip",
  ]);
  if (encoding === "br" && existsSync(filePath + ".br")) {
    file = Bun.file(filePath + ".br");
    headers.set("Content-Encoding", "br");
  } else if (encoding === "gzip" && existsSync(filePath + ".gz")) {
    file = Bun.file(filePath + ".gz");
    headers.set("Content-Encoding", "gzip");
  }
  const etag = `"${file.size}-${file.lastModified}"`;
  headers.set("ETag", etag);
  if (request.headers.get("if-none-match") === etag)
    return new Response(null, { status: 304, headers });
  return new Response(request.method === "HEAD" ? null : file, { headers });
}
