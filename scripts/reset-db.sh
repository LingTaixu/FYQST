#!/usr/bin/env bash
# 清空全部业务数据，保留表结构与运行所需的静态配置。
# 用法：sudo bash scripts/reset-db.sh
# 管理员账号不在此脚本内创建，清空后使用 `bun run admin:user -- <账号>` 新建。
set -euo pipefail
ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
DBS=(account gmdbyzf ttf_ly_login ttf_ly_main ttf_ly_game1 ttf_ly_gamelog ttf_ly_osadmin)

if (( EUID != 0 )); then
    exec sudo bash "$0" "$@"
fi
MYSQL=(mariadb)

# 使用部署时生成的真实数据库口令（/etc/fyqst/credentials.json），本地开发回退到 pwd123456。
DB_PASSWORD=${FYQST_DB_PASSWORD:-}
if [[ -z "$DB_PASSWORD" && -r /etc/fyqst/credentials.json ]]; then
    DB_PASSWORD=$(python3 -c "import json;print(json.load(open('/etc/fyqst/credentials.json'))['db_password'])" 2>/dev/null || true)
fi
DB_PASSWORD=${DB_PASSWORD:-pwd123456}

# 清空后仍需保留的配置表：游戏运行、区服列表、道具/活动/商店定义。
declare -A KEEP=(
    [ttf_ly_login]="uw_server_info"
    [ttf_ly_main]="uw_game_config uw_battles_group uw_servers_group uw_channel_config uw_public_activity uw_loot_config"
    [ttf_ly_game1]="uw_activity uw_boss uw_game_common"
    [ttf_ly_osadmin]="osa_user_group osa_menu_url osa_module osa_system"
)

backup_dir="$ROOT/.local/backups/db-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir"
chown fyqst:fyqst "$ROOT/.local/backups" 2>/dev/null || true
for db in "${DBS[@]}"; do
    mariadb-dump --single-transaction --routines --events --databases "$db" > "$backup_dir/$db.sql"
done
echo "已备份到 $backup_dir"

for db in "${DBS[@]}"; do
    "${MYSQL[@]}" -e "DROP DATABASE IF EXISTS \`$db\`; CREATE DATABASE \`$db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
    # 这些是 MySQL 5.x 的旧 dump，包含零日期等旧默认值。
    { printf "SET SESSION sql_mode='NO_ENGINE_SUBSTITUTION';\n"; cat "$ROOT/Server/sql/$db.sql"; } | "${MYSQL[@]}" "$db"
    echo "已重建 $db"
done

# 逐表清空（TRUNCATE 重置自增 ID），保留 KEEP 中的配置表。
for db in "${DBS[@]}"; do
    keep=" ${KEEP[$db]:-} "
    tables=$("${MYSQL[@]}" -Nse "SELECT table_name FROM information_schema.tables WHERE table_schema='$db'")
    for table in $tables; do
        [[ "$keep" == *" $table "* ]] && continue
        "${MYSQL[@]}" -e "TRUNCATE TABLE \`$db\`.\`$table\`"
    done
done
echo "已清空业务数据表"

"${MYSQL[@]}" -e "DROP TABLE IF EXISTS ttf_ly_osadmin.fyqst_admin_session, ttf_ly_osadmin.fyqst_admin_request"

# 恢复本机部署所需的连接配置。
"${MYSQL[@]}" <<SQL
UPDATE ttf_ly_login.uw_server_info
SET host='127.0.0.1', port='20001', host2='127.0.0.1', port2='10001',
    dbLink='server=127.0.0.1;database=ttf_ly_game1;uid=fyqst;pwd=${DB_PASSWORD};charset=utf8;port=3306'
WHERE id=1;
UPDATE ttf_ly_main.uw_battles_group SET battleHost='127.0.0.1';
UPDATE ttf_ly_main.uw_game_config SET rankServerHost='127.0.0.1' WHERE id=1;
CREATE USER IF NOT EXISTS 'fyqst'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS 'fyqst'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
SQL
for db in "${DBS[@]}"; do
    "${MYSQL[@]}" -e "GRANT ALL PRIVILEGES ON \`$db\`.* TO 'fyqst'@'127.0.0.1'; GRANT ALL PRIVILEGES ON \`$db\`.* TO 'fyqst'@'localhost';"
done
"${MYSQL[@]}" -e "FLUSH PRIVILEGES"
echo "数据清空完成；管理员账号请用 bun run admin:user 创建。"
