# 游戏内「每日奖励」悬浮入口

## 功能

- `game.html` 右下角常驻一个悬浮按钮 🎁，点击打开「每日奖励 · 998 充值」窗口。
- 窗口读取当前登录态（`gd.accountCtrl`）的 **账号 ID + loginKey**，把它作为领取凭证（token）提交给服务端。
- 每个账号每天可领取 **10 份 998 充值档位**，服务端一次性写入邮件发放，第二天 0 点（北京时间）重置。
- 未进入游戏（还在登录界面）时按钮可点，但窗口会提示「请先进入游戏」。
- **领取后悬浮按钮自动隐藏**：成功领取后 1.8 秒关闭窗口并隐藏按钮；刷新页面重新登录时，进游戏后约 1 秒内会向服务端确认状态并再次隐藏。
- **次日 0 点（北京时间）自动恢复**：页面不关闭的情况下到 0 点 5 秒按钮自动出现；重新进入游戏同样会恢复显示。

## 998 档位来源

数据库中**没有**独立的 998 活动或礼包，998 是充值商品档位（`Server/s1/packages/uw-data/temp/c_recharge.js`）：

| 商品 ID | 名称 | 价格 | 内容 |
| --- | --- | --- | --- |
| 7 | 2000000钻石 | ¥998 | 200 万钻石 + 200 万积分（道具 1809）+ 1 个至尊礼盒（道具 10015，进公会） |
| 23 | 9980钻石 | ¥998 | 9980 钻石 + 40020 额外钻石 |

每日奖励采用商品 7，10 份合并为一封邮件：

```json
{"200": 20000000, "1809": 20000000, "10015": 10}
```

## 领取流程

1. 客户端 `POST /daily.php`，JSON：`{accountId, loginKey, userId}`。
2. 服务端校验 `ttf_ly_login.uw_account.loginKey`（JSON 数组，最多 3 个历史 key）是否包含该 loginKey，并检查账号状态（0 正常 / 3 白名单）。
3. 解析角色：优先使用传入且属于该账号的角色，否则取最近创建的角色。
4. `ttf_ly_main.fyqst_daily_reward` 以 `(accountId, claimDate)` 唯一键防重复，重复领取返回 409。
5. 领取记录、游戏邮件、充值记录在事务中写入：
   - `ttf_ly_game1.uw_mail`：钻石/积分/礼盒（`delHours=168`，30 天过期）；
   - `ttf_ly_game1.uw_recharge`：10 条 `rechargeId=7`、`payMoney=998` 的充值记录，`transId=DY<领取ID>-<序号>`。**累计充值、首充、每日氪金等活动都按这张表统计**，所以领取后活动进度会 +9980 元。
6. `GET /daily.php?accountId=&loginKey=` 返回当天是否已领取，用于窗口展示。

## 部署位置

| 文件 | 说明 |
| --- | --- |
| `www/wwwroot/www/js/daily-reward.js` | 悬浮图标与窗口（纯 DOM，不依赖游戏引擎） |
| `www/wwwroot/www/game.html` | 引入 `js/daily-reward.js` |
| `deploy/server/daily.php` | 领取接口，Nginx `location = /daily.php` 转给 PHP-FPM |
| `deploy/server/nginx.conf` | 新增 `/daily.php` 反向代理（与 `/game.php` 同池） |

修改 `game.html` 后需要同步 `.local/public/game.html` 及其 `.gz` 预压缩文件（`configure.py` 会整体重新生成）。

## 活动开启

本次同时把两个活动表全部置为开启并延长到 2099 年：

```sql
UPDATE ttf_ly_main.uw_public_activity SET isOpen=1, endTime='2099-12-31 23:59:59';
UPDATE ttf_ly_game1.uw_activity       SET isOpen=1, endTime='2099-12-31 23:59:59';
```

游戏服启动时加载活动数据，修改后需要重启 `fyqst-game.service`。
