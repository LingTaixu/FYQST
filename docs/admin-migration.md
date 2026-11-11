# vp000 运营后台迁移说明

新后台只替换 `vp000`，前端为 Vite + React + TypeScript，API 使用 Bun + TypeScript，直接连接现有 MariaDB。Egret 游戏画面、原有七个 Bun 游戏服务、PHP 登录网站、GM 和 CDK 保留。后台 API 不需要 Node.js，也没有引入 Express；代码中的 `node:crypto`、`node:path` 等由 Bun 的兼容模块提供。

## 运行与开发

在 WSL 项目根目录执行：

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun install --frozen-lockfile
bun run admin:build
bun run restart
bun run status
```

正式访问入口是 `http://127.0.0.1:8080/vp000/`，API 位于同一地址的 `/vp000/api/`。PHP 本地路由只负责代理该前缀，不执行后台 PHP。Bun API 监听 `127.0.0.1:8090`，也能直接访问 `http://127.0.0.1:8090/vp000/`。游戏和后台由 systemd 用户服务 `fyqst-local.service` 持有，日志分别在 `Server/startlog/` 中，后台日志为 `adminApi.log`。

修改 API 后执行 `bun run admin:restart`，可以只重启后台 API，并将新进程继续交给 systemd 管理。前端更新执行 `bun run admin:build` 即可，Bun 直接读取新的构建文件。

前端、API 可分别开发：

```bash
bun run admin:web             # Vite，http://127.0.0.1:5173/vp000/
bun run admin:dev             # Bun --watch API
bun run admin:check           # 两个工作区的 TypeScript 类型检查
bun run admin:test            # 单元测试；数据库集成测试默认跳过
ADMIN_INTEGRATION=1 bun run admin:test
# 加上真实游戏接口验收，需要游戏服务已经启动：
ADMIN_INTEGRATION=1 ADMIN_GAME_INTEGRATION=1 bun run admin:test
```

开发 API 前需释放正式服务占用的 8090 端口，可以先执行 `bun run stop`。也可通过 `ADMIN_PORT` 为开发 API 选择不同端口，并调整 Vite 代理目标。`bun run admin:build` 会重新生成 dist，并预压缩为 Brotli 和 gzip；构建后的页面不需要 Vite 开发服务。

API 配置模板是 `admin/api/.env.example`，复制为同目录 `.env` 后修改。统一启动脚本以 `admin/api` 为工作目录，Bun 会加载该文件。测试从根目录执行时，应通过环境变量提供自定义数据库配置。`.env` 不进入 Git。区服数据库和游戏服务地址必须分别出现在 `ADMIN_GAME_DATABASES`、`ADMIN_GAME_ORIGINS` 中；只从数据库读取区服配置不能绕过这些限制。

Nginx 部署同时引用 `deploy/nginx-admin.conf` 和 `deploy/nginx-bandwidth.conf`。HTTPS 部署设置 `ADMIN_SECURE_COOKIE=true`，并把实际站点 origin 加入 `ADMIN_ORIGINS`。`/vp000/` 前缀由 Bun 接管，旧 `.php` 路径返回 410 或认证错误，不再保留可以绕过新权限的 PHP 接口。

## 管理员和权限

沿用 `ttf_ly_osadmin.osa_user`、`osa_user_group` 及菜单 ID 权限。现有管理员密码没有重置；首次成功登录会将 MD5 密码升级为 Argon2id。权限组 1 保留超级管理员权限，其他组按原菜单 ID 映射。新增密码至少 12 位。

如不知道旧账号密码，可创建一个单独的本地管理员，不影响已有账号：

```bash
read -rs -p '新管理员密码: ' ADMIN_PASSWORD
export ADMIN_PASSWORD
bun run admin:user -- ops-local
unset ADMIN_PASSWORD
```

CLI 不覆盖已有账号。确需重设指定管理员密码时才加 `--reset`：`bun run admin:user -- admin --reset`。创建及重设会写入审计日志。无需修改游戏账号 `chenss` 或任何玩家数据。

会话使用随机令牌、HttpOnly / SameSite Cookie，数据库只存令牌散列，有效期 8 小时。停用账号、改密码会使旧会话失效；组权限每次请求重新读取。写接口要求允许的 Origin、CSRF Token 和幂等标识，登录有失败频率限制。数据库值使用参数绑定，表名、字段名、操作和游戏接口均为服务端白名单；没有任意 SQL、任意函数或 Shell 执行入口。

## 业务覆盖

| 原后台功能 | 新入口与行为 |
| --- | --- |
| 首页 | 运营概览：角色数、真实充值、付费角色、待审核邮件、在线会话 |
| 角色管理 / profile / 详情 | 角色管理：分页、搜索、背包和扩展 JSON、账号及关卡详情 |
| 玩家数值修改 | 角色详情 → 修改角色；支持金币、钻石、等级、转生和相关成长数值 |
| 关卡修改 | 角色详情 → 修改关卡，按原 `copyObj` 规则更新 |
| 封禁 / 禁言 / 踢人 / 白名单 | 角色详情、封禁与禁言、白名单中的账号状态操作 |
| 玩家邮件 / 月卡邮件 / 积分邮件 | 撰写邮件：按原道具 ID 提供奖励；全部提交审核 |
| 全服邮件 | 撰写邮件选择当前区服所有真实角色；机器人不接收 |
| 邮件审核 / 邮件列表 | 审核可按页选择、批量通过或驳回；玩家邮件查看已投递记录 |
| 登录公告 / 系统广播 | 对应页面创建、编辑、删除及展示时间配置 |
| 活动 / 公共活动 | 对应页面维护活动字段与原协议 JSON |
| 礼包码 / 下载 | 批量生成随机码，下载本批次 CSV 或导出列表当前页 |
| 行会 / 成员 | 行会列表与详情内成员查询 |
| 聊天 / 道具获得日志 | 聊天记录、奖励记录，按区服分页查询 |
| 模拟充值 | 充值明细 → 模拟充值，创建 `gmStatus=1` 订单，由游戏原逻辑发货 |
| 充值 / 购买 / 抽奖 / Boss 统计 | 充值明细、物品购买、抽奖记录、Boss 记录，以及数据报表 |
| 日报 / 等级排行 / 付费排行 | 数据报表：按日聚合、排行榜、商品统计、CSV 导出 |
| 引导 / 关卡 / 留存 | 数据报表：引导步骤、当前关卡分布及有历史登录表时的留存 |
| 管理员 / 权限组 / 操作记录 | 管理员、权限组、菜单权限对照、操作审计 |
| 旧服务器 / 战斗进程管理 | 使用 WSL 的统一 start / stop / restart / status；区服页面管理开放与维护状态 |

角色数值通过新增的 `Server/s1/route/admin/handler/ops.js` 小型适配接口操作。已载入的玩家修改游戏缓存并标记待保存，默认约 5 秒落库；未载入的角色只更新相应数据库字段。它继续使用游戏服务现有的管理员密钥过滤器，密钥不会发给浏览器。API 不再用独立 SQL 连接覆盖在线玩家的整行记录。

账号封禁影响整个账号，踢出操作作用于当前所选区服。原 `bendType=1` 表示限时禁言，3 表示自己可见；白名单沿用 `status=3`。在线人数是游戏缓存中尚未过期且未踢出的认证会话数，并非独立心跳统计。

邮件先写 `check_mail`，通过审核才写 `uw_mail`。审核时锁定草稿，在同一 MariaDB 事务内完成投递、状态更新和审计，重复或并发审核不会重复投递。一次最多审核 100 封，广播草稿单区最多 50000 人；礼包单批最多 1000 个。较小批次控制接口占用和结果大小。幂等记录保留成功操作的结果，浏览器在网络失败后重试同一表单会继续使用相同标识。

## 数据库与旧实现

启动只新增 `ttf_ly_osadmin` 中的两张 InnoDB 表：

- `fyqst_admin_session`：会话散列、CSRF、到期时间和密码指纹。
- `fyqst_admin_request`：写操作幂等标识及成功结果。

现有业务表、管理员和玩家数据不重建。游戏 DATETIME 原本存储上海时间的字面值，Bun SQL 将 DATETIME 解码为 UTC Date；新 API 显式保留原字面时间，避免读回、编辑和邮件到期判断出现 8 小时偏移。写入业务时间也显式使用上海时间，不依赖连接的 UTC `NOW()`。

旧后台完整目录备份在本机 `.local/backups/admin-rewrite/vp000-php.tar.gz`，Git 基线提交 `1b99257` 也保留原始文件。新运行路径不包含 Smarty、旧通用 AJAX API 及后台 PHP 文件。

以下历史能力有明确边界：

- 当前库没有 `login_log_1` 历史登录表，活跃、ARPU 和留存显示缺失说明，不能补算不存在的历史数据。关卡报表是当前分布，不能冒充历史流失率。
- `gameinstall_log` 不含区服字段，引导统计明确展示所有区服合计。
- 原 PM2 远程控制、任意脚本、通过 `sudo date -s` 改主机时间均不迁入 Web API。服务生命周期由 WSL 命令管理，系统时钟由操作系统维护。
- 管理页中旧菜单仅作权限 ID 对照；新增 React 页面和接口在代码中注册，不能通过数据库菜单 URL 执行任意程序。旧便签和 Smarty 主题不再使用。
- 当前支持列表中的玩家数值修改；昵称、整包 JSON 和行会会长等高耦合修改暂不开放写入口。原库中这些数据仍可查询。

## 带宽与验证

前端使用按页面动态导入，无外部字体、CDN、音频及自动轮询。构建生成带内容散列的资源名，静态文件支持 Brotli / gzip、ETag 和一年不可变缓存；API 使用 gzip、分页和按需详情。CSV 仅导出本批次或当前页，并处理电子表格公式前缀。

游戏原有音频零传输策略保留，新 Bun 服务也对音频 URL 返回 204 / 零正文，页面 CSP 禁止媒体加载。原 MP3 和所有 node_modules 继续被 Git 忽略。

自动化测试覆盖登录密码升级、权限与 CSRF 拦截、参数校验、实际数据库资源查询、公告 CRUD、并发邮件审批、广播草稿驳回、礼包生成、GM 订单幂等和游戏缓存适配。数据库测试使用临时管理员、权限组、账号及角色，结束后清除测试数据，不重置既有管理员或玩家。另行通过浏览器验证页面与实际操作，并重新运行原游戏的依赖、WebSocket 和音频回归检查。
