<?php
/**
 * 每日奖励领取接口（游戏内悬浮图标使用）。
 *
 * 绑定进入者的登录 token（ttf_ly_login.uw_account.loginKey），
 * 每个账号每天可领取一次 998 充值档位 10 份，奖励一次性通过邮件发放。
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

const DAILY_PRODUCT_ID = 7;      // c_recharge[7]：2000000 钻石，998 元档
const DAILY_COUNT = 10;          // 每个账号每天 10 份
const DAILY_DIAMONDS = 2000000;  // 单份钻石数量
const DAILY_DIAMONDS_ITEM = 200; // 钻石道具 ID
const DAILY_POINTS = 2000000;    // 单份积分数量
const DAILY_POINTS_ITEM = 1809;  // 积分道具 ID
const DAILY_GIFT_BOX = 10015;    // 至尊礼盒道具 ID（每份 1 个）

function fail(int $status, string $message, array $extra = []): void
{
    http_response_code($status);
    echo json_encode(['ok' => false, 'error' => $message] + $extra, JSON_UNESCAPED_UNICODE);
    exit;
}

function input(): array
{
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
        $raw = file_get_contents('php://input');
        if ($raw !== '' && $raw !== false) {
            $json = json_decode($raw, true);
            if (is_array($json)) return $json;
        }
        return $_POST;
    }
    return $_GET;
}

function connect(string $database): mysqli
{
    $db = new mysqli('127.0.0.1', 'fyqst', getenv('FYQST_DB_PASSWORD'), $database, 3306);
    $db->set_charset('utf8mb4');
    return $db;
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$input = input();
$accountId = filter_var($input['accountId'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
$loginKey = $input['loginKey'] ?? '';
$userId = filter_var($input['userId'] ?? 0, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0, 'default' => 0]]);
if (!$accountId) fail(400, '缺少有效的账号信息，请重新登录游戏');
if (!is_string($loginKey) || !preg_match('/\A[A-Za-z0-9]{8,32}\z/', $loginKey)) {
    fail(401, '登录凭证无效，请重新登录游戏');
}

$game = null;
$main = null;
try {
    $login = connect('ttf_ly_login');
    $stmt = $login->prepare('SELECT id,name,status,loginKey FROM uw_account WHERE id=? LIMIT 1');
    $stmt->bind_param('i', $accountId);
    $stmt->execute();
    $account = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$account) fail(401, '账号不存在，请重新登录游戏');
    if (!in_array((int)$account['status'], [0, 3], true)) fail(403, '账号已被限制，无法领取');
    $keys = json_decode((string)$account['loginKey'], true);
    if (!is_array($keys) || !in_array($loginKey, $keys, true)) {
        fail(401, '登录凭证已失效，请重新登录游戏');
    }

    // 角色：优先使用前端传入、且属于该账号的真实角色；否则取最近创建的角色。
    $game = connect('ttf_ly_game1');
    if ($userId) {
        $stmt = $game->prepare('SELECT id,serverId,nickName,lvl,channelId,sdkChannelId FROM uw_user WHERE id=? AND accountId=? LIMIT 1');
        $stmt->bind_param('ii', $userId, $accountId);
    } else {
        $stmt = $game->prepare('SELECT id,serverId,nickName,lvl,channelId,sdkChannelId FROM uw_user WHERE accountId=? ORDER BY id DESC LIMIT 1');
        $stmt->bind_param('i', $accountId);
    }
    $stmt->execute();
    $player = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$player) fail(404, '该账号还没有角色，请先进入游戏创建角色');

    $main = connect('ttf_ly_main');
    $main->query('CREATE TABLE IF NOT EXISTS `fyqst_daily_reward` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `accountId` INT NOT NULL,
        `userId` INT NOT NULL,
        `serverId` INT NOT NULL DEFAULT 0,
        `claimDate` DATE NOT NULL,
        `token` VARCHAR(32) NOT NULL DEFAULT \'\',
        `productId` INT NOT NULL DEFAULT 0,
        `count` INT NOT NULL DEFAULT 0,
        `items` VARCHAR(500) NOT NULL DEFAULT \'\',
        `ip` VARCHAR(64) NOT NULL DEFAULT \'\',
        `createTime` DATETIME NOT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `uniq_account_day` (`accountId`,`claimDate`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT=\'每日998充值奖励领取记录\'');

    $today = (new DateTimeImmutable('now', new DateTimeZone('Asia/Shanghai')))->format('Y-m-d');
    $stmt = $main->prepare('SELECT id,count FROM fyqst_daily_reward WHERE accountId=? AND claimDate=? LIMIT 1');
    $stmt->bind_param('is', $accountId, $today);
    $stmt->execute();
    $claimed = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    $product = ['id' => DAILY_PRODUCT_ID, 'name' => '2000000钻石', 'cost' => 998, 'count' => DAILY_COUNT];
    // 每份 998 档位：200 万钻石 + 200 万积分 + 1 个至尊礼盒（道具 10015 是 ID，不是数量）。
    $items = [
        (string)DAILY_DIAMONDS_ITEM => DAILY_DIAMONDS * DAILY_COUNT,
        (string)DAILY_POINTS_ITEM => DAILY_POINTS * DAILY_COUNT,
        (string)DAILY_GIFT_BOX => DAILY_COUNT,
    ];
    $itemsJson = json_encode($items, JSON_UNESCAPED_UNICODE);

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        echo json_encode([
            'ok' => true,
            'claimed' => (bool)$claimed,
            'claimDate' => $today,
            'product' => $product,
            'account' => ['id' => (int)$account['id'], 'name' => $account['name']],
            'player' => ['id' => (int)$player['id'], 'nickName' => $player['nickName']],
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($claimed) fail(409, '今天已经领取过了，明天再来吧', ['claimed' => true, 'claimDate' => $today]);

    $ip = substr((string)($_SERVER['REMOTE_ADDR'] ?? ''), 0, 64);
    $mailId = 0;
    $claimId = 0;
    try {
        $main->begin_transaction();
        $stmt = $main->prepare('INSERT INTO fyqst_daily_reward (accountId,userId,serverId,claimDate,token,productId,count,items,ip,createTime) VALUES (?,?,?,?,?,?,?,?,?,NOW())');
        $serverId = (int)$player['serverId'];
        $playerId = (int)$player['id'];
        $productId = DAILY_PRODUCT_ID;
        $count = DAILY_COUNT;
        $stmt->bind_param('iiississs', $accountId, $playerId, $serverId, $today, $loginKey, $productId, $count, $itemsJson, $ip);
        $stmt->execute();
        $claimId = (int)$main->insert_id;
        $stmt->close();

        $game->begin_transaction();
        $stmt = $game->prepare('INSERT INTO uw_mail (userId,type,fromName,title,content,replaceArgs,items,isPicked,isRead,delHours,expireTime,addTime) VALUES (?,0,?,?,?,\'[]\',?,0,0,168,DATE_ADD(NOW(), INTERVAL 30 DAY),NOW())');
        $fromName = '每日奖励';
        $title = '每日998充值奖励';
        $content = '已发放 ' . DAILY_COUNT . ' 份 998 充值档位奖励（每份 200 万钻石、200 万积分、1 个至尊礼盒），请查收附件。';
        $stmt->bind_param('issss', $playerId, $fromName, $title, $content, $itemsJson);
        $stmt->execute();
        $mailId = (int)$game->insert_id;
        $stmt->close();

        // 写入 10 条充值记录：累计充值、首充等活动都按 uw_recharge 统计，
        // 与真实 998 购买一致（payMoney=998，rechargeId=7）。
        $stmt = $game->prepare('INSERT INTO uw_recharge (userId,rechargeId,diamond,rechargeTime,effTime,channelId,transId,currency,ip,payMoney,userLvl) VALUES (?,?,?,NOW(),NOW(),?,?,?,?,?,?)');
        $rechargeId = DAILY_PRODUCT_ID;
        $diamond = DAILY_DIAMONDS;
        $channelId = (int)($player['channelId'] ?? 0);
        $currency = 'CNY';
        $payMoney = 998;
        $userLvl = (int)($player['lvl'] ?? 0);
        $rechargeIds = [];
        for ($i = 0; $i < DAILY_COUNT; $i++) {
            $transId = 'DY' . $claimId . '-' . ($i + 1);
            $stmt->bind_param('iiiisssii', $playerId, $rechargeId, $diamond, $channelId, $transId, $currency, $ip, $payMoney, $userLvl);
            $stmt->execute();
            $rechargeIds[] = (int)$game->insert_id;
        }
        $stmt->close();
        $game->commit();
        $main->commit();
    } catch (Throwable $error) {
        @$game->rollback();
        @$main->rollback();
        if ($error->getCode() === 1062 || str_contains($error->getMessage(), 'Duplicate entry')) {
            fail(409, '今天已经领取过了，明天再来吧', ['claimed' => true, 'claimDate' => $today]);
        }
        throw $error;
    }

    echo json_encode([
        'ok' => true,
        'claimed' => true,
        'claimDate' => $today,
        'claimId' => $claimId,
        'mailId' => $mailId,
        'rechargeCount' => count($rechargeIds),
        'count' => DAILY_COUNT,
        'items' => $items,
        'product' => $product,
        'player' => ['id' => (int)$player['id'], 'nickName' => $player['nickName']],
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $error) {
    error_log('FYQST daily reward: ' . $error->getMessage());
    fail(503, '领取服务暂时不可用，请稍后重试');
}
