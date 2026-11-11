#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
if (( EUID != 0 )); then
    exec sudo bash "$0"
fi
if ! cmp -s "$ROOT/scripts/mariadb-local.cnf" /etc/mysql/mariadb.conf.d/60-fyqst-local.cnf; then
    install -m 644 "$ROOT/scripts/mariadb-local.cnf" /etc/mysql/mariadb.conf.d/60-fyqst-local.cnf
    systemctl restart mariadb
else
    systemctl start mariadb
fi
for db in account gmdbyzf ttf_ly_login ttf_ly_main ttf_ly_game1 ttf_ly_gamelog ttf_ly_osadmin; do
    mariadb -e "CREATE DATABASE IF NOT EXISTS \`$db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
    count=$(mariadb -Nse "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$db'")
    if [[ "$count" == 0 ]]; then
        # These MySQL 5.x dumps contain zero dates and legacy defaults.
        { printf "SET SESSION sql_mode='NO_ENGINE_SUBSTITUTION';\n"; cat "$ROOT/Server/sql/$db.sql"; } | mariadb "$db"
        echo "已导入 $db"
    else
        echo "保留现有数据库 $db（$count 张表）"
    fi
done
mariadb <<'SQL'
CREATE USER IF NOT EXISTS 'fyqst'@'127.0.0.1' IDENTIFIED BY 'pwd123456';
CREATE USER IF NOT EXISTS 'fyqst'@'localhost' IDENTIFIED BY 'pwd123456';
SQL
for db in account gmdbyzf ttf_ly_login ttf_ly_main ttf_ly_game1 ttf_ly_gamelog ttf_ly_osadmin; do
    mariadb -e "GRANT ALL PRIVILEGES ON \`$db\`.* TO 'fyqst'@'127.0.0.1'; GRANT ALL PRIVILEGES ON \`$db\`.* TO 'fyqst'@'localhost';"
done
mariadb <<'SQL'
UPDATE ttf_ly_login.uw_server_info
SET host='127.0.0.1', port='20001', host2='127.0.0.1', port2='10001',
    dbLink='server=127.0.0.1;database=ttf_ly_game1;uid=fyqst;pwd=pwd123456;charset=utf8;port=3306'
WHERE id=1;
UPDATE ttf_ly_main.uw_battles_group SET battleHost='127.0.0.1' WHERE id=1;
UPDATE ttf_ly_main.uw_game_config SET rankServerHost='127.0.0.1' WHERE id=1;
SQL
echo '本地数据库初始化完成。'
