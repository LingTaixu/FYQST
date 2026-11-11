import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { brotliCompressSync, constants } from "node:zlib";

const root = resolve(import.meta.dir, "../admin/web");
const child = Bun.spawn([process.execPath, "--bun", "run", "build"], {
  cwd: root,
  stdout: "inherit",
  stderr: "inherit",
});
if ((await child.exited) !== 0) process.exit(1);
async function compress(dir: string) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = resolve(dir, entry.name);
    if (entry.isDirectory()) await compress(file);
    else if (/\.(js|css|html|svg|json)$/.test(file)) {
      const bytes = await Bun.file(file).bytes();
      await Bun.write(file + ".gz", Bun.gzipSync(bytes, { level: 9 }));
      await Bun.write(
        file + ".br",
        brotliCompressSync(bytes, {
          params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
        }),
      );
    }
  }
}
await compress(resolve(root, "dist"));
console.log("已生成 Brotli / gzip 静态资源");
