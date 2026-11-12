# FYQST 本地游戏项目

基于 Egret 的浏览器游戏，包含 Bun 游戏后端、PHP 登录网站、**Vite + React + TypeScript 运营后台**和 MariaDB 数据库。`vp000` 的 API 使用 **Bun + TypeScript**，不需要 Node.js。当前配置面向 **WSL 本地运行**，服务地址统一为 `127.0.0.1`；游戏音乐与音效默认关闭，客户端不会下载音频。

Linux 公网服务器的 Nginx、systemd、数据库及同源网关部署方式见 [服务器部署说明](deploy/server/README.md)。

## 环境与首次运行

已在 WSL Debian 13、Bun 1.4.4、PHP 8.4、MariaDB 11.8 上验证。WSL 需要启用 systemd，并可运行 `systemctl --user`。

在 WSL 终端进入项目根目录：

```bash
sudo apt-get update
sudo apt-get install -y curl unzip tar python3 mariadb-server php-cli php-mysql php-curl php-mbstring php-xml php-zip
curl -fsSL https://bun.sh/install | bash -s 'bun-v1.4.4'
export PATH="$HOME/.bun/bin:$PATH"

bun install --frozen-lockfile
sudo bash scripts/init-db.sh
bun run admin:build
bun run deps:check
bun run content:audit
bun test ./tests
bun run start
```

Windows 浏览器打开 `http://127.0.0.1:8080/`。附带 SQL 的游戏测试账号为 `52gmsy` / `123456`；登录页支持新账号自动注册。新运营后台位于 `http://127.0.0.1:8080/vp000/`，沿用原管理员账号、密码及权限组；GM 入口为 `/gm/`，CDK 入口为 `/cdk/`。后台账号与游戏账号独立，创建管理员的方法见[后台迁移说明](docs/admin-migration.md)。

数据库初始化脚本只向空库导入 SQL，保留现有表和玩家数据，并更新本地区服地址。它会配置本项目所需的 MariaDB 旧 SQL 兼容选项。本地数据库账号为 `fyqst`，密码为 `pwd123456`；这些配置仅用于本地环境。

## 常用操作

```bash
bun run start          # 启动七个游戏服务、Bun TypeScript API 和 PHP 网站
bun run status         # 查看各端口是否就绪
bun run restart        # 保存游戏数据后重启
bun run stop           # 保存游戏数据后停止，通常需要约 20 秒
bun test ./tests       # 配置、依赖、HTTP、WebSocket 和音频策略测试
bun run deps:check     # 检查内部模块和压缩备份校验值
bun run content:audit  # 检查源码资源和数据库中的历史推广内容
bun run admin:build    # 构建 React 后台，并生成 Brotli / gzip 文件
bun run admin:restart  # 单独重启后台 API
bun run admin:check    # 前端及 API 的 TypeScript 类型检查
bun run admin:test     # 后台单元测试
ADMIN_INTEGRATION=1 bun run admin:test  # 临时数据的数据库集成测试
```

启动脚本使用 systemd 用户服务 `fyqst-local.service`，关闭当前终端后仍可运行。日志在 `Server/startlog/`，本地 PID、备份和验证记录在 `.local/`。WSL 重启后先确认 MariaDB 已运行：`sudo systemctl start mariadb`。Bun 不在默认路径时可执行 `BUN_BIN=/绝对路径/bun bash scripts/local.sh start`。

## 项目组成

```text
Server/
  runtime/            Bun 配置、HTTP 启动和版本清单公共实现
  uc/                 登录、版本及回调服务
    packages/uw-*/    公共服务业务源码
  s1/                 一区游戏、城市、战斗及日志服务
    packages/uw-*/    一区业务源码
  sql/                七个数据库的初始 SQL
admin/
  api/                Bun + TypeScript 运营 API，原生 Bun SQL
  web/                Vite + React + TypeScript 后台页面
  shared/             前后端共享类型
www/wwwroot/www/      Egret 客户端、PHP 登录网站、GM 和 CDK
scripts/              本地启动、数据库初始化、内容清理、依赖恢复
tests/                Bun 自动化测试
patches/              Socket.IO / Engine.IO 的 Bun 兼容补丁
vendor/npm/           无法独立下载的内部模块压缩包及 SHA-256 清单
deploy/               Nginx 音频禁传配置与 Linux 服务器部署脚本
docs/                 依赖清点、兼容性和带宽说明
package.json          根工作区、命令和补丁配置
bun.lock              提交到 Git 的依赖锁文件
```

业务源码已从旧 `node_modules/uw-*` 迁入两个服务的 `packages/`，由 `file:` 依赖安装。**修改业务源码请编辑 packages，不要编辑安装生成的 node_modules。** 修改后停止服务，执行 `bun install --force --frozen-lockfile`，再启动，以刷新安装副本。两个服务的业务代码存在差异，需要按实际服务分别修改。

| 服务 | 本地端口 | 作用 |
| --- | --- | --- |
| PHP 网站 | 8080 | 登录、客户端资源及后台反向代理 |
| adminApi | 8090 | Bun TypeScript API 与构建后的 React 后台 |
| mainApp | 9901 | 主登录 |
| versionApp | 9902 | 版本和资源清单 |
| viewApp | 9903 | 渠道回调 |
| serverApp | 20001 | 一区游戏 HTTP |
| cityserver | 10001 | 城市 Socket.IO |
| battleserver | 9001 | 战斗 Socket.IO |
| logApp | 7000 | 游戏日志 |

MariaDB 使用 `127.0.0.1:3306`。七个数据库为 `account`、`gmdbyzf`、`ttf_ly_login`、`ttf_ly_main`、`ttf_ly_game1`、`ttf_ly_gamelog`、`ttf_ly_osadmin`。

## 依赖、音频与 GitHub

两个游戏服务分别声明 84 个固定版本的顶层第三方依赖及 83 个本地业务包；新后台的 React、Vite、TypeScript 等固定版本由各自 package.json 和根 bun.lock 管理。内部 uwa 模块已保存在业务包的 `lib/` 中；无法独立获取的内部包还提供压缩备份。新机器使用 `bun install --frozen-lockfile` 恢复，不需要上传整个 node_modules。

客户端通过静音加载适配关闭音乐和音效网络请求，旧音频 URL 在本地 PHP 服务返回 204、正文为零字节。原始 12 个 MP3 仍保留在当前磁盘，但已通过 `.gitignore` 排除上传。使用 Nginx 部署时需应用 `deploy/nginx-bandwidth.conf`，详见带宽文档。

Git 应包含源码、各层 package.json、bun.lock、patches、vendor 压缩包和文档；`.gitignore` 已排除 node_modules、运行日志、本地备份、私钥和 MP3。渠道支付私钥不随仓库发布，启用相应渠道时需自行配置。

2026-11-11 已验证锁文件安装、5 份内部模块归档恢复、原游戏自动化回归和新后台类型检查及数据库集成测试。后台测试覆盖登录、权限、公告、邮件并发审批、礼包、模拟充值及游戏缓存适配；数据库测试数据会清理。客户端保持音频零传输。

- [依赖恢复与兼容性说明](docs/dependencies.md)
- [Bun TypeScript 后台使用、迁移与功能对照](docs/admin-migration.md)
- [礼包码（CDK）生成与账号绑定](docs/cdk.md)
- [游戏内每日奖励悬浮入口](docs/daily-reward.md)
- [音频与低带宽策略](docs/bandwidth.md)
- [WSL 配置、迁移与故障排查](README.local.md)
- [完整原始依赖清单](docs/dependencies-inventory.json)
- [间接依赖版本变化](docs/dependency-resolution-changes.json)

## 当前边界

公众号推广公告、文案及前端关注入口已清理，保留协议和道具 ID 以兼容玩家数据。旧数据库可先运行 `bun run content:clean` 再检查，清理过程会备份修改内容。

当前库缺少历史登录日志表，后台对留存、活跃及 ARPU 的缺失数据明确提示；关卡统计为当前分布。旧后台的远程 PM2、任意脚本和修改系统时钟入口改由 WSL 运维；便签和 Smarty 主题不再使用。详细功能边界见后台迁移说明。可选 HTTPS/HTTP2 未做端到端验证。原项目未附带 7010 端口的跨服排行榜服务源码，该功能仍不完整。依赖保留了与旧项目兼容的版本，Bun 安装时的旧包弃用提示不代表完整升级已经完成。
