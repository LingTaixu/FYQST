# WSL 本地运行（Bun）

JavaScript 游戏后端使用 Bun，包含登录、版本、回调、游戏、城市、战斗和日志七个服务。PHP 登录网站和管理后台继续通过 PHP 运行，数据库使用本地 MariaDB。网站目录为 `www/wwwroot/www`，公共服务位于 `Server/uc`，一区位于 `Server/s1`。

## 环境

- WSL Debian，启用 systemd 和用户服务。
- Bun 1.4.4 或更新版本；本次验证使用 1.4.4，安装路径为 `~/.bun/bin/bun`。
- PHP 8.4，mysqli、curl、mbstring、xml、zip 扩展。
- MariaDB，以及启动脚本使用的 Python 3。
- MariaDB 地址 `127.0.0.1:3306`，项目账号 `fyqst`，本地密码 `pwd123456`。

业务源码已迁入 `Server/s1/packages/uw-*`、`Server/uc/packages/uw-*`，由 Bun 工作区安装。首次运行先执行 `bun install --frozen-lockfile`；node_modules 是生成目录，不需要提交到 Git。无法独立下载的内部模块已保留源码及带校验的压缩包，详见 [依赖恢复说明](docs/dependencies.md)。

## 启动和停止

在项目根目录的 WSL 终端中执行：

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun run start
bun run status
bun run restart
bun run stop
```

也可以使用 `bash Server/s.sh` 启动，`bash Server/t.sh` 停止，或 `bash scripts/local.sh {start|stop|restart|status}`。如果 Bun 安装在其他位置，使用 `BUN_BIN=/绝对路径/bun bash scripts/local.sh start`；该路径会传递给 systemd 用户服务。

启动脚本注册 `fyqst-local.service`，由 WSL 的 systemd 用户服务管理进程，关闭当前终端后服务继续运行。游戏服停止时先保存玩家数据，通常需要约 20 秒。日志位于 `Server/startlog/`，PID 文件位于 `.local/run/`。

Windows 浏览器访问 `http://127.0.0.1:8080/`。数据库附带测试账号 `52gmsy` / `123456`；登录页面也支持输入新账号及 6–15 位密码自动注册。管理后台入口 `/vp000/`，GM 入口 `/gm/`，CDK 入口 `/cdk/`。

| 服务 | 端口 |
| --- | --- |
| PHP 网站 | 8080 |
| 主登录 | 9901 |
| 版本与资源清单 | 9902 |
| 回调后台 | 9903 |
| 游戏一区 HTTP | 20001 |
| 城市 Socket.IO | 10001 |
| 战斗 Socket.IO | 9001 |
| 日志 | 7000 |

## 在新的 WSL 环境中配置

安装 Bun 后，将其加入 PATH，再安装系统依赖并初始化数据库：

```bash
sudo apt-get update
sudo apt-get install -y mariadb-server php-cli php-mysql php-curl php-mbstring php-xml php-zip python3
bun --version
bun install --frozen-lockfile
sudo bash scripts/init-db.sh
bun run deps:check
bun run content:audit
bun run start
```

`init-db.sh` 安装 `scripts/mariadb-local.cnf`，启用旧 SQL 默认值兼容及不区分表名大小写。该配置用于本项目本地 MariaDB 实例。脚本仅向空数据库导入 SQL，重复执行会保留已有表和玩家数据，同时将一区连接地址更新为本地地址。

若使用旧数据库，先执行 `bun run content:clean` 清理历史推广文本，再执行 `bun run content:audit`。附带 SQL 的公告已同步清理。WSL 重启后如数据库未运行，先执行 `sudo systemctl start mariadb`。

前端版本清单及服务器地址已改为 `127.0.0.1`。旧 PHP 的 `mysql_*` 调用由 `scripts/router.php` 加载 `scripts/mysql-compat.php`，通过 mysqli 兼容。管理后台已修复 PHP 8 的 Medoo 参数顺序、字符串索引和 Smarty 异常属性兼容问题。

## Bun 迁移与代码调整

- `Server/runtime/config.cjs` 在各服务进程内生成配置，避免启动时反复写入共享 JSON 文件；模板参数使用 JSON 转义，关闭 SQL 调试输出。
- `Server/runtime/reset.cjs` 合并重复启动代码，HTTP 使用 Bun 兼容的原生接口，支持 OPTIONS 请求和监听失败退出。
- `Server/runtime/manifests.cjs` 按数字比较版本号，启动时读取并缓存资源清单，隔离 QA 与正式清单。
- 游戏服支持 SIGINT/SIGTERM 保存数据后退出，关闭期间的新 HTTP 请求返回 503。
- 数据库参数格式化不再依赖输入对象自身的 `hasOwnProperty` 方法。
- 修复旧 Socket.IO 在添加子命名空间认证时误删根握手包的问题；Engine.IO 按帧类型还原 Bun WebSocket 的文本 Buffer，保留二进制帧。

公众号推广公告、礼包名称、邮件文案和前端关注入口已清理，客户端资源版本已刷新。保留已有道具 ID、奖励数据及协议编号，避免影响玩家存档。内部协议标识可能仍保留历史拼音名称。

## 检查与备份

```bash
bun test ./tests
bun run deps:check
bun run content:audit
```

测试覆盖配置隔离及转义、版本排序与缓存、推广内容清理、实际 Express HTTP/CORS 请求，以及带认证中间件的 Socket.IO WebSocket 直连、回执和二进制数据往返。清理工具扫描源码资源与七个数据库的文本字段；`content:audit` 发现待处理内容时返回非零退出码，`content:clean` 执行修改并备份。

使用 Bun 1.4.4 验证配置、依赖解析、HTTP、认证 WebSocket 和音频加载策略。Windows Chromium 使用测试账号验证登录进入一区、推广入口关闭、城市和战斗实时连接。当前依赖重建及带宽验证见 [依赖说明](docs/dependencies.md) 和 [音频说明](docs/bandwidth.md)。

修改业务代码请编辑 packages，停止服务后运行 `bun install --force --frozen-lockfile` 刷新安装副本，再启动。静音策略不下载任何游戏音频；本地 PHP 对旧 MP3 等音频 URL 返回零正文 204，原始 MP3 已排除 Git 上传。生产 Nginx 需另外应用 `deploy/nginx-bandwidth.conf`。

数据库迁移前完整备份位于 `.local/backups/bun-migration/databases.sql`；原始配置、源码及修改行分别保存在 `.local/backups/bun-migration/files/`、`.local/backups/content-source/` 和 `.local/backups/content/`。这些备份有意保留原始内容，便于恢复，运行服务不使用它们。

本次已验证本地 HTTP 服务。可选 HTTPS/HTTP2 模式未做端到端验证。管理后台已验证登录页可访问，未逐项验证后台操作。原项目未附带 7010 端口的跨服排行榜服务，该部分仍缺少对应服务源码。
