#!/usr/bin/env bash
# 诊断 egret 事件池污染（u.$initTo is not a function）
# 用法：bash scripts/diag-touch-error.sh
set -euo pipefail
ROOT=/srv/fyqst/.local/public
echo "== engine-guard.js 是否部署 =="
ls -l "$ROOT/js/engine-guard.js" 2>/dev/null || echo "未部署"
echo
echo "== game.html 是否引用 =="
grep -n "engine-guard" "$ROOT/game.html" || echo "未引用"
echo
echo "== 服务端是否可访问 =="
curl -s -o /dev/null -w "engine-guard.js -> %{http_code} (cache: %{header_json})\n" "http://127.0.0.1/js/engine-guard.js?v=20261112-1" 2>/dev/null | head -c 200 || true
echo
echo "== 线上引擎与磁盘一致性 =="
curl -s --compressed "http://127.0.0.1/libs/modules/engine.min.js?v=6" -o /tmp/_eng.js
diff -q /tmp/_eng.js "$ROOT/libs/modules/engine.min.js" && echo "engine.min.js 一致"
echo
echo "== 浏览器端排查步骤 =="
cat <<'TIP'
1) 控制台查看是否有 [engine-guard] 开头的告警，它会说明丢弃了多少个非法事件对象
2) 执行 fyqstEngineGuard.stats()          -> 查看池大小与丢弃计数
3) 执行 fyqstEngineGuard.enableDebug(true) -> 开启详细堆栈（持久化到 localStorage）
4) 复现点击后执行 fyqstEngineGuard.lastPoison() -> 查看污染对象来源堆栈
5) 关闭调试：fyqstEngineGuard.enableDebug(false)
TIP
