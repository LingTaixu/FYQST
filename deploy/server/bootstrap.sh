#!/usr/bin/env bash
set -euo pipefail
(( EUID == 0 )) || { echo '请使用 root 执行。' >&2; exit 1; }
PUBLIC_HOST=${1:?用法：bash deploy/server/bootstrap.sh 公网IP或域名}
ROOT=/srv/fyqst
for app in nginx mariadb php-fpm8.3 python3; do
    command -v "$app" >/dev/null || { echo "请先安装 $app。" >&2; exit 1; }
done
if [[ ! -d "$ROOT/.git" && -d /root/FYQST/.git && ! -L /root/FYQST ]]; then
    mv /root/FYQST "$ROOT"
    ln -s "$ROOT" /root/FYQST
fi
[[ -d "$ROOT/.git" ]] || { echo "请先将仓库放在 $ROOT。" >&2; exit 1; }
id fyqst >/dev/null 2>&1 || useradd --system --create-home --home-dir /var/lib/fyqst --shell /usr/sbin/nologin fyqst
install -d -m 755 /usr/local/lib/fyqst
if [[ ! -x /usr/local/lib/fyqst/bun ]]; then
    install -m 755 "${BUN_BIN:-/root/.bun/bin/bun}" /usr/local/lib/fyqst/bun
fi
install -d -o fyqst -g fyqst -m 750 /var/lib/fyqst/sessions
mkdir -p "$ROOT/Server/s1/logs" "$ROOT/Server/uc/logs" "$ROOT/.local"
chmod 755 "$ROOT" /var/lib/fyqst
if systemctl is-active --quiet fyqst.target; then
    systemctl stop fyqst.target
fi
if [[ ! -f /etc/fyqst/credentials.json ]]; then
    cat > /etc/mysql/mariadb.conf.d/65-fyqst-server.cnf <<'CNF'
[mariadb]
innodb_buffer_pool_size=128M
innodb_log_buffer_size=8M
max_connections=100
key_buffer_size=8M
table_open_cache=256
CNF
    bash "$ROOT/scripts/init-db.sh"
fi
# This 2 GB host has swap enabled but originally disabled normal swapping.
printf 'vm.swappiness=20\n' > /etc/sysctl.d/90-fyqst-memory.conf
sysctl -p /etc/sysctl.d/90-fyqst-memory.conf
cd "$ROOT"
/usr/local/lib/fyqst/bun install --frozen-lockfile
/usr/local/lib/fyqst/bun run admin:build
chown -R fyqst:fyqst "$ROOT"
python3 deploy/server/configure.py "$PUBLIC_HOST"
php-fpm8.3 -t
nginx -t
systemctl daemon-reload
systemctl enable --now mariadb nginx php8.3-fpm fyqst.target
systemctl reload php8.3-fpm nginx
echo "游戏入口：http://$PUBLIC_HOST/"
echo "运营后台：http://$PUBLIC_HOST/vp000/"
echo '管理员信息：/etc/fyqst/credentials.json（仅 root 可读）'
