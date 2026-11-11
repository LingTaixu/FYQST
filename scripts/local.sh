#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
RUN="$ROOT/.local/run"
LOG="$ROOT/Server/startlog"
mkdir -p "$RUN" "$LOG"
APP_NAMES=(logApp mainApp versionApp viewApp serverApp cityserver battleserver web)
APP_DIRS=(s1 uc uc uc s1 s1/wserver s1/battleserver ../www/wwwroot/www)
APP_PORTS=(7000 9901 9902 9903 20001 10001 9001 8080)

ensure_unit() {
    local unit_dir="$HOME/.config/systemd/user" unit bun_env
    bun_env=${BUN_BIN//\\/\\\\}
    bun_env=${bun_env//\"/\\\"}
    bun_env=${bun_env//%/%%}
    mkdir -p "$unit_dir"
    unit="$unit_dir/fyqst-local.service"
    cat > "$unit" <<UNIT
[Unit]
Description=Fyqst local game services

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$ROOT
Environment=FYQST_SYSTEMD=1
Environment=TZ=Asia/Shanghai
Environment="BUN_BIN=$bun_env"
ExecStart=/usr/bin/bash "$ROOT/scripts/local.sh" start
ExecStop=/usr/bin/bash "$ROOT/scripts/local.sh" stop
ExecStopPost=/usr/bin/bash "$ROOT/scripts/local.sh" stop
TimeoutStartSec=300
TimeoutStopSec=60
KillMode=control-group
UNIT
    systemctl --user daemon-reload
}

load_runtime() {
    BUN_BIN="${BUN_BIN:-$HOME/.bun/bin/bun}"
    if [[ ! -x "$BUN_BIN" ]]; then
        echo '缺少 Bun，请安装后将 BUN_BIN 指向 Bun 可执行文件。' >&2
        exit 1
    fi
    "$BUN_BIN" -e 'if (Bun.semver.satisfies(Bun.version, ">=1.4.4") === false) process.exit(1)' || {
        echo '需要 Bun 1.4.4 或更新版本。' >&2; exit 1;
    }
    export TZ=Asia/Shanghai
}

is_running() {
    local name=$1 pid entry expected
    [[ -f "$RUN/$name.pid" ]] || return 1
    read -r pid < "$RUN/$name.pid"
    [[ "$pid" =~ ^[0-9]+$ ]] || return 1
    kill -0 "$pid" 2>/dev/null || return 1
    # A stale PID must never stop an unrelated application.
    [[ "$(readlink -f "/proc/$pid/cwd")" == "$ROOT"/* ]] || return 1
    entry=$(tr '\0' ' ' < "/proc/$pid/cmdline")
    expected="$name.js"
    [[ "$name" == web ]] && expected="$ROOT/scripts/router.php"
    [[ "$entry" == *"$expected"* ]]
}

port_open() {
    python3 - "$1" <<'PY'
import socket, sys
try:
    with socket.create_connection(('127.0.0.1', int(sys.argv[1])), timeout=.3): pass
except OSError:
    sys.exit(1)
PY
}

start() {
    load_runtime
    command -v php >/dev/null
    php -r 'exit(extension_loaded("mysqli") ? 0 : 1);'
    mariadb-admin --protocol=tcp -h127.0.0.1 -ufyqst -ppwd123456 ping >/dev/null 2>&1 || {
        echo '数据库尚未就绪，请先运行 sudo systemctl start mariadb；首次运行还需 sudo bash scripts/init-db.sh。' >&2
        exit 1
    }
    for i in "${!APP_NAMES[@]}"; do
        local name=${APP_NAMES[$i]} port=${APP_PORTS[$i]} dir
        dir=$(cd "$ROOT/Server/${APP_DIRS[$i]}" && pwd)
        if is_running "$name"; then
            if port_open "$port"; then
                echo "$name 已运行（$port）"
                continue
            fi
            echo "$name 进程存在但端口未就绪，请检查 $LOG/$name.log" >&2
            exit 1
        fi
        if port_open "$port"; then
            echo "端口 $port 已被占用，无法启动 $name。" >&2
            exit 1
        fi
        if [[ "$name" == web ]]; then
            (cd "$dir" && exec nohup php -d display_errors=0 -d log_errors=1 -d error_reporting=22527 -S 127.0.0.1:8080 -t "$dir" "$ROOT/scripts/router.php") > "$LOG/$name.log" 2>&1 < /dev/null &
        else
            (cd "$dir" && exec nohup "$BUN_BIN" "$name.js") > "$LOG/$name.log" 2>&1 < /dev/null &
        fi
        echo "$!" > "$RUN/$name.pid"
        local ready=0
        for ((n=0; n<120; n++)); do
            if port_open "$port"; then ready=1; break; fi
            if ! is_running "$name"; then break; fi
            sleep 0.5
        done
        if (( ready == 0 )); then
            tail -35 "$LOG/$name.log" >&2
            echo "$name 启动失败，查看 $LOG/$name.log" >&2
            exit 1
        fi
        echo "$name 已启动（$port）"
    done
    echo '访问 http://127.0.0.1:8080/'
}

stop() {
    for ((i=${#APP_NAMES[@]}-1; i>=0; i--)); do
        local name=${APP_NAMES[$i]} pid
        if is_running "$name"; then
            read -r pid < "$RUN/$name.pid"
            if [[ "$name" == serverApp ]]; then
                kill -INT "$pid"
                for ((n=0; n<35; n++)); do
                    if ! is_running "$name"; then break; fi
                    sleep 1
                done
            fi
            if is_running "$name"; then kill -TERM "$pid"; fi
            for ((n=0; n<20; n++)); do
                if ! is_running "$name"; then break; fi
                sleep 0.1
            done
            if is_running "$name"; then
                echo "$name 尚未退出，保留 PID 文件以便重试。" >&2
                return 1
            fi
            echo "$name 已停止"
        fi
        rm -f "$RUN/$name.pid"
    done
}

status() {
    for i in "${!APP_NAMES[@]}"; do
        local name=${APP_NAMES[$i]}
        if is_running "$name" && port_open "${APP_PORTS[$i]}"; then
            echo "$name: 运行中（${APP_PORTS[$i]}）"
        else
            echo "$name: 未就绪"
        fi
    done
}

# Let the WSL user service own the processes so terminal exit cannot reap them.
if [[ "${FYQST_SYSTEMD:-0}" != 1 ]]; then
    case "${1:-start}" in
        start|restart)
            load_runtime
            ensure_unit
            systemctl --user "${1:-start}" fyqst-local.service
            status
            echo '访问 http://127.0.0.1:8080/'
            exit ;;
        stop)
            if systemctl --user is-active --quiet fyqst-local.service; then
                systemctl --user stop fyqst-local.service
            else
                stop
            fi
            exit ;;
    esac
fi

case "${1:-start}" in
    start) start ;;
    stop) stop ;;
    restart) stop; start ;;
    status) status ;;
    *) echo '用法：bash scripts/local.sh {start|stop|restart|status}' >&2; exit 1 ;;
esac
