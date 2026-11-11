# 依赖恢复与 Bun 兼容性说明

检查日期：2026-11-11。运行环境为 WSL Debian 13、Bun 1.4.4。目标是让 GitHub 下载后的项目能够按清单重建依赖，同时保留旧项目实际使用的业务代码和协议。

## 原项目问题与处理

原项目把业务源码直接放在 `Server/s1/node_modules/uw-*` 和 `Server/uc/node_modules/uw-*`，没有完整的工作区依赖清单。每个服务有 83 个业务目录和 84 个顶层第三方包。直接忽略 node_modules 会漏掉业务源码，直接覆盖安装也会丢失原有修改。

现已将两套业务源码分别保存到 `Server/{s1,uc}/packages/`，补齐缺失的 package.json，并校正目录名与清单名称不一致的包。`uw-cript`、`uw-data`、`uw-ws` 原来缺少清单；其余名称修正包括 uw-cache、uw-formula、uw-friend、uw-monitor、uw-monitor-http、uw-server-info、uw-test、uw-utils。没有版本的本地业务包使用 `0.0.1` 作为项目内部版本，不表示它们曾在 npm 发布。

根 package.json 定义 Bun 工作区、命令和兼容补丁；两个服务的 package.json 将所有顶层第三方包固定到原版本，将业务包声明为 `file:./packages/uw-*`。`bun.lock` 固定实际解析出的间接依赖，`bunfig.toml` 指定 npm 官方 registry 和 hoisted 安装方式。

安装前的原始依赖完整保存在本机 `.local/backups/github-preparation/original-dependencies/`，不参与运行，也不上传 Git。

## 能否重新下载原版本

通过 npm registry API 逐项查询，84 个顶层第三方包的原版本均可获得，因此没有为它们强制更换主要版本。全部名称、版本、查询状态、tarball 和完整性信息见 `dependencies-inventory.json`。

递归清点还发现了无法独立获取的内部包：

| 模块 | 结果 | 保留方案 |
| --- | --- | --- |
| logger@0.1.0 | 独立版本不可用；cmdjs@0.0.14 发布包内自带 | 原始代码压缩归档，安装后检查，缺失时自动恢复 |
| str-utils@0.1.0 | npm 无可用发布版本；cmdjs 内自带 | 同上 |
| uwa-middleware | npm 查询 404；原目录没有版本清单 | 保留 monitor/view 两个实现于各业务包 lib/，改为相对导入，并分别归档 |
| uwa-tools | npm 查询 404；原目录没有版本清单 | 保留于各业务包 lib/ 并归档 |

曾下载 logger@0.0.1 检查替代兼容性：它导出 `Logger`、`createLogger`，原项目需要 `initLogger`、`setLvl`，接口不兼容，因此继续保留原内部版本。uwa 模块没有可供替换的同名发布版本；monitor 和 view 的 middleware 源码不同，分别保存，避免错误合并。

原清单中的 `$@0.0.1`、`simple-app@0.1.0`、`test@0.0.1` 来自样例或模板，`mo-test@0.0.1` 是业务包 uw-test 的错误清单名称，均不作为 npm 运行依赖安装。

`vendor/npm/` 共保存 5 份小型 `.tgz` 压缩包：logger、str-utils、middleware 的两个变体、uwa-tools。`archives.json` 记录 SHA-256、字节数和用途。压缩包可随 Git 上传，无需把完整 node_modules 打包上传。`postinstall` 自动检查归档完整性和内部模块，`bun run deps:check` 只检查不修改。

## 安装与开发

```bash
bun install --frozen-lockfile
bun run deps:check
bun test ./tests
```

业务源码以 `file:` 方式复制安装到服务的 node_modules 中。修改 packages 后，停止服务并刷新安装副本：

```bash
bun run stop
bun install --force --frozen-lockfile
bun test ./tests
bun run start
```

不要在 node_modules 中维护业务代码或手动修改第三方包。添加依赖或升级版本时更新对应服务 package.json 和根 bun.lock，并重新执行兼容性验证。不要把测试通过理解为所有旧工具、所有后台操作、所有支付渠道均已验证。

根 `trustedDependencies: []` 禁止自动执行旧依赖的原生构建脚本。全新安装报告阻止了 7 个依赖 postinstall；已验证的 HTTP、WebSocket 和游戏路径使用 Bun 或可用的 JavaScript 实现。不要为了消除提示直接放行所有原生构建脚本。

## 兼容补丁与间接版本

`patches/socket.io@2.0.4.patch` 修复子命名空间认证中间件误删根 CONNECT 握手的问题；`patches/engine.io@3.1.4.patch` 仅在 WebSocket 明确为文本帧时将 Bun Buffer 转回 UTF-8，保留二进制帧。根 `patchedDependencies` 使补丁在新安装时自动生效。补丁后的相同版本第三方 JavaScript 与旧目录比对未发现额外源码差异。

由于旧树没有锁文件，间接依赖会按旧包声明的版本范围重新解析；例如 content-type 从 1.0.2 解析为 1.0.5、moment 从 2.14.1 解析为 2.31.0。原有重复版本也可能合并。变化清单见 `dependency-resolution-changes.json`；以后由 bun.lock 固定，不会每次安装重新选择。

## 验证范围

- 在独立目录从零安装，验证锁文件安装和 Socket.IO 补丁，然后将实际运行目录切换到重建的依赖。
- 临时移除隔离环境中的 cmdjs 内部 helper，验证从压缩包恢复及 logger、str-utils 的原接口。
- 检查两个服务全部已声明依赖的解析版本、本地包入口和 uwa middleware 接口。
- 自动化测试覆盖角色配置隔离、转义、版本排序和缓存、推广清理、真实 Express HTTP/CORS、认证 Socket.IO WebSocket 及二进制回执、静音加载。
- Windows Chromium 验证账号登录并进入一区，同时检查脚本异常、失败请求、实时连接与音频策略。具体结果见带宽文档和本机 `.local/` 验证记录。

2026-11-11 最终结果：独立目录从零执行 `bun install --frozen-lockfile` 成功；隔离安装和实际项目目录均为 **11 项测试通过、879 次断言、0 项失败**。5 份归档逐一模拟缺失恢复，恢复后的源码和安装副本与备份字节一致。实际七个 Bun 服务和 PHP 网站全部启动，城市 `/city` 与战斗 `/battle` 的 WebSocket 直连均通过真实登录认证。源码资源和七个数据库的推广检查均为 0 项。

项目未附带跨服排行榜 7010 服务；可选 HTTPS/HTTP2、历史脚本和管理后台全部功能不在本次完整验证范围内。
