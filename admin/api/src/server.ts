import { config } from "./config";
import { db, migrate } from "./db";
import { app } from "./app";

await migrate();
const server = Bun.serve({
  hostname: config.host,
  port: config.port,
  maxRequestBodySize: 131072,
  fetch(request, server) {
    return app(request, server.requestIP(request)?.address || "local");
  },
});
console.log(
  `Bun TypeScript admin: http://${server.hostname}:${server.port}/vp000/`,
);
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, async () => {
    await server.stop();
    await db.close();
    process.exit(0);
  });
