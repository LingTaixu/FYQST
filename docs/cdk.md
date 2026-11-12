# 礼包码（CDK）生成与账号绑定

## 两套兑换码系统

| 系统 | 数据表 | 状态 |
| --- | --- | --- |
| 旧 PHP GM 后台 | `gmdbyzf.cdkey`（`cdkey` / `status` / `isuse` / `qu` / `binduser`） | 入口 `/cdk/` 仍存在，但 `/vp000/` 新后台已停用旧 PHP 后台；`binduser` 是**兑换后**回写的角色名，不是预先绑定 |
| 新运营后台 | `ttf_ly_main.uw_coupon` | 当前使用，以下均指这套 |

`gmdbyzf.user` 是旧 GM 登录账号；`gmdbyzf.gmlog` 是旧后台操作日志。两者与游戏兑换无关。

## 生成方式

后台「内容与奖励 → 礼包码 → 批量生成礼包码」（`POST /vp000/api/operations/gift-generate`）：

- 兑换码：`randomBytes(12).toString("hex")`，即 24 位小写十六进制，碰撞概率可忽略。
- 写入 `ttf_ly_main.uw_coupon`，关键字段：
  - `name` 礼包名称（同类限领一次时按 `name` 判重）
  - `code` 兑换码
  - `type` 0 = 同类只可领一次，1 = 无限制
  - `startTime` / `endTime` 生效与截止时间
  - `items` 奖励 `{物品ID:数量}`（金币 99、钻石 200）
  - `period` 同类领取周期（天），0 表示不限制
  - `isUsed` 是否已领取，`userId` / `accountId` / `serverId` 兑换时回写
  - `isNew` = 1，使用新兑换码机制
  - `bindAccountId` 绑定账号 ID，0 表示不限制

## 兑换流程

客户端请求 `a.co.a` → `Server/s1/route/a/handler/co.js` → `uw-coupon` 的 `couponBiz.use()`：

1. 按 `code` 查 `uw_coupon`，不存在即返回「兑换码不存在」。
2. **绑定校验**：`bindAccountId` 非 0 且与当前登录账号不一致，返回「兑换码不存在」（不暴露该码是否存在）。
3. 校验生效时间、是否已使用。
4. `period` 限制：同一 `name` 在周期内不可重复领取（记录在玩家 `record.coupon`）。
5. 渠道限制：`channelId` / `channelIds` 与账号 `sdkChannelId` 比对。
6. 同类限领：`type=0` 时写入 `uw_user_coupon`（`codeName` + `userId`），重复领取返回「已兑换过此类奖励」。
7. 奖励通过邮件发放（`mailTypeKey.coupon`），随后回写 `isUsed=1`、`userId`、`accountId`、`serverId`。

## 账号绑定

绑定字段是 `uw_coupon.bindAccountId`（账号 ID，即 `ttf_ly_login.uw_account.id`，不是角色 ID）。同一账号下的角色都能兑换，其他账号一律失败。

- **生成时绑定**：「批量生成礼包码」表单里的「绑定账号」选择器，可直接搜索账号名或 ID。
- **生成后绑定**：礼包码列表勾选若干条 →「绑定账号」，选择账号即可；选「不绑定」提交则解除绑定。只能改动未使用的码（`isUsed=0`）。
- 后台接口校验绑定的账号必须存在（`ttf_ly_login.uw_account`），否则返回「绑定的账号不存在」。
- 数据库迁移：管理员服务启动时若缺少该列会自动执行 `ALTER TABLE ttf_ly_main.uw_coupon ADD COLUMN bindAccountId ...`；`Server/sql/ttf_ly_main.sql` 也已包含该列。

## 相关接口

| 接口 | 说明 |
| --- | --- |
| `GET /vp000/api/items?q=钻石&limit=20` | 按名称或 ID 搜索物品，供奖励选择器使用 |
| `GET /vp000/api/items?ids=99,200` | 回显已选物品名称 |
| `GET /vp000/api/accounts?q=账号` | 按账号名或 ID 搜索账号，供绑定使用 |
| `POST /vp000/api/operations/gift-generate` | 生成礼包码，可带 `bindAccountId` |
| `POST /vp000/api/operations/gift-bind` | 将已生成的码绑定/解绑到账号，`bindAccountId=0` 为解绑 |
