# Linux 服务器部署

部署目录 `/srv/fyqst`，原 `/root/FYQST` 可保留为指向它的符号链接。Ubuntu 24.04 需要 Nginx、MariaDB、PHP 8.3 FPM/CLI 及 mysqli、curl、mbstring、xml、zip。Bun 使用项目验证的版本，放到 `/usr/local/lib/fyqst/bun`，服务使用独立 `fyqst` 用户。

浏览器只访问 Nginx 的 80 端口。`/_api/login/`、`/_api/game/`、`/_version/` 分别代理登录、游戏和版本服务；`/_socket/city/`、`/_socket/battle/` 代理城市及战斗 WebSocket。所有 Bun 服务与 MariaDB 监听回环地址，`/vp000/` 代理 Bun TypeScript 后台。GM、CDK、测试 PHP 和支付入口不公开；运营操作使用新后台。

`configure.py <公网 IP 或域名>` 生成主机环境、PHP-FPM 池、systemd 单元及 Nginx 配置，并复制和压缩网站资源。前端只在生成副本中接入同源网关，游戏协议与 Socket.IO 命名空间保持原样。`preload.cjs` 向旧服务注入数据库、内部管理密钥和回环监听配置。城市与战斗服务的内部请求也读取 `FYQST_ADMIN_KEY`，本地未设置时使用既有 `config/crypt.json`，避免轮换密钥后实时连接认证失败。后台请求标识使用 `crypto.getRandomValues`，兼容当前 HTTP 入口。

首次安装前先运行根目录的 `scripts/init-db.sh`，只向空库导入已有 SQL。部署脚本随后生成独立数据库密码、游戏内部管理密钥及网页登录签名密钥，保存在 `/etc/fyqst/credentials.json`（root 可读）；服务环境在 `/etc/fyqst/environment`。创建超级管理员 `ops`；首次部署停用 SQL 附带的默认 `admin`，现有玩家和密码保留。不要把这些文件提交到 Git。

也可在安装上述系统依赖后执行 `bash deploy/server/bootstrap.sh 公网IP或域名`，完成首次配置和启动；重复执行会先停服保存数据，再安装依赖、构建和更新运行配置。需要代理下载依赖时，在该命令前提供 `HTTP_PROXY`、`HTTPS_PROXY`。初始 SQL 已导入后不再重跑数据库初始化。服务按端口就绪顺序启动，使用 Bun 的 `--smol` 模式和较小数据库连接池，适合当前约 2 GB 内存环境；已有交换空间使用 swappiness 20。

首次配置前执行 `bun install --frozen-lockfile`、`bun run admin:build`。确保 `/srv/fyqst/Server/{s1,uc}/logs`、`/var/lib/fyqst/sessions` 存在且属于 `fyqst`；`fyqst` 需要读取仓库、写运行日志的权限。配置生成后验证并启动：

```bash
php-fpm8.3 -t
nginx -t
systemctl daemon-reload
systemctl enable --now fyqst.target nginx mariadb php8.3-fpm
systemctl reload php8.3-fpm nginx
```

日常运维：

```bash
systemctl status 'fyqst-*.service' --no-pager
journalctl -u fyqst-game -n 80 --no-pager
systemctl restart fyqst-admin  # 只重启运营 API
systemctl stop fyqst.target   # 等待游戏保存玩家数据
systemctl start fyqst.target
cat /etc/fyqst/credentials.json
```

只查看 `ops` 登录密码，无需输出数据库密钥：

```bash
python3 -c "import json; print(json.load(open('/etc/fyqst/credentials.json'))['admin_password'])"
```

更新前备份数据库，停止游戏，再拉代码、安装依赖、构建后台、重新生成部署配置并启动；重跑配置会保留现有密钥与 ops 密码。数据库初始化脚本会还原本地示例连接参数，因此日常更新不要重跑它。PHP 登录使用预处理查询；新后台仍使用既有会话、权限和 CSRF 校验。

当前入口使用 HTTP。配置域名与 TLS 后需同步将 `/etc/fyqst/environment` 的 `ADMIN_ORIGINS` 改为 HTTPS 站点并启用 `ADMIN_SECURE_COOKIE=true`，PHP 登录会话也需开启 Secure Cookie，再重启相应服务。音频一律返回空正文 204，文本资源预生成 gzip，后台另有 Brotli，图片使用浏览器缓存。

2026-11-11 部署到 `124.71.188.106` 后，36 项回归与数据库集成测试通过。公网浏览器已验证角色登录、城市及战斗命名空间认证、后台管理员登录与退出，音频下载请求为零。Git 下载使用已存在的本机 HTTP 代理 `127.0.0.1:7890`。七个业务库的部署后备份位于 `/var/backups/fyqst/20261111-215309.sql.gz`，仅 root 可读；服务已配置开机启动。首次进入游戏仍需下载图片资源，低带宽下需要等待。
