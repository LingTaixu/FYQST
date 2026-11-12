# 引擎事件池污染修复（u.$initTo is not a function）

## 现象

浏览器控制台反复报：

```
Uncaught TypeError: u.$initTo is not a function
    at n.dispatchTouchEvent (engine.min.js?v=6:1868:19)
    ...
    at s.onTapCircle (game3.min.js?v=local-bun-20261111-1:48169:34)
```

发生在触摸 begin / move / end 时，表现为点击失灵、新手引导「点击圆圈」步骤卡住。

## 根因

`engine.min.js` 里事件对象是**池化复用**的：

```js
// Event.create
e.create = function (t, e, i, n) {
    var r = t.eventPool;
    if (r || (r = t.eventPool = []), r.length) {
        var o = r.pop();                     // 直接取出复用
        o.$type = e; ... return o
    }
    return new t(e, i, n)
};
// Event.release
e.release = function (t) {
    t.clean();
    (t.constructor || Object.getPrototypeOf(t).constructor).eventPool.push(t)
};
```

`TouchEvent.dispatchTouchEvent`（engine.min.js:1868）：

```js
var u = t.Event.create(n, i, r, o);   // n 应为 TouchEvent
u.$initTo(s, a, h);                    // ← 若 u 不是 TouchEvent，这里抛错
```

只要 `egret.TouchEvent.eventPool` 里混入任意一个**非 TouchEvent 对象**（例如业务代码 `new egret.Event(egret.TouchEvent.TOUCH_TAP)` 后被释放进触摸池），之后每次触摸都会把它 pop 出来，抛出 `u.$initTo is not a function`。

`game3.min.js` 的引导逻辑 `onTapCircle` 正是以「派发 TouchEvent 常量」的方式模拟点击，所以这条路径最先暴露问题。

### 本地复现（Node + vm 加载真实引擎）

| 场景 | 结果 |
| --- | --- |
| 池干净，20 次触摸循环 | 0 错误 |
| 池中混入 1 个普通 `egret.Event` | 第 1 次触摸即 `u.$initTo is not a function` |

## 修复

新增 `js/engine-guard.js`，在 `engine.min.js` 之后、游戏代码之前加载，做三件事：

1. **`Event.create` 加类型校验**：从池中弹出对象时校验 `$initTo` 与 `instanceof`，不合格直接丢弃，继续取下一个；池空则走 `new`。
2. **`Event.release` 加归属校验**：只有当事件确实是该类（或子类）实例时才推入对应池，否则丢弃并记录来源堆栈，绝不污染。
3. **`dispatchTouchEvent` 兜底**：万一仍抛 `$initTo` 错误，自动清理池中非法对象并重试一次，保证玩家点击不中断。

### 部署文件

| 文件 | 说明 |
| --- | --- |
| `www/wwwroot/www/js/engine-guard.js` | 源文件（随仓库管理） |
| `.local/public/js/engine-guard.js` | nginx 实际服务副本 |
| `.local/public/js/engine-guard.js.gz` | gzip_static 副本 |
| `www/wwwroot/www/game.html` | 第 227 行插入 `<script src="js/engine-guard.js?v=20261112-1">` |
| `.local/public/game.html` + `.gz` | 同上（第 228 行） |
| `deploy/server/nginx.conf` + `/etc/nginx/sites-available/fyqst` | 为 `engine-guard.js` 加 `Cache-Control: no-cache, must-revalidate` |

注意：修改 `game.html` 后必须重新生成 `.local/public/game.html.gz`，否则 `gzip_static` 会返回旧内容：

```bash
gzip -9 -c .local/public/game.html > .local/public/game.html.gz
chown fyqst:fyqst .local/public/game.html.gz
```

同理，改 `engine-guard.js` 后要更新 `.gz`。

## 排查工具

```bash
bash /srv/fyqst/scripts/diag-touch-error.sh
```

浏览器控制台可用接口：

| 调用 | 作用 |
| --- | --- |
| `fyqstEngineGuard.stats()` | 查看两个池大小、是否已打补丁、累计丢弃数 |
| `fyqstEngineGuard.enableDebug(true)` | 开启详细日志（写入 localStorage，刷新后保持） |
| `fyqstEngineGuard.lastPoison()` | 查看最近一个被判定为「污染」的事件的来源堆栈 |
| `fyqstEngineGuard.sanitize()` | 手动清池 |

日志统一以 `[engine-guard]` 前缀输出到 `console.warn`。

## 验证

1. `curl -s http://<host>/game.html | grep engine-guard` 应能看到脚本标签；
2. 玩家刷新进入游戏，控制台无 `$initTo` 报错，点击 / 引导圆圈正常；
3. 若 `fyqstEngineGuard.stats().dropped > 0`，说明确实存在污染源，用 `lastPoison()` 的堆栈定位到具体业务模块后再做根治。
