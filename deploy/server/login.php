<?php
declare(strict_types=1);
session_set_cookie_params(['httponly' => true, 'samesite' => 'Strict', 'path' => '/']);
session_start();
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /', true, 303);
    exit;
}
$name = $_POST['username'] ?? '';
$password = $_POST['passwd'] ?? '';
if (!is_string($name) || !is_string($password) ||
    !preg_match('/\A[A-Za-z0-9_]{3,32}\z/', $name) || strlen($password) < 6 || strlen($password) > 72) {
    http_response_code(400);
    exit('账号需为 3–32 位字母、数字或下划线，密码需为 6–72 位。');
}
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
try {
    $db = new mysqli('127.0.0.1', 'fyqst', getenv('FYQST_DB_PASSWORD'), 'account', 3306);
    $db->set_charset('utf8mb4');
    $stmt = $db->prepare('SELECT id,pass FROM account WHERE user=? LIMIT 1');
    $stmt->bind_param('s', $name);
    $stmt->execute();
    $record = $stmt->get_result()->fetch_assoc();
    if ($record) {
        $stored = (string)$record['pass'];
        $valid = preg_match('/\A[a-f0-9]{32}\z/i', $stored)
            ? hash_equals(strtolower($stored), md5($password))
            : password_verify($password, $stored);
        if (!$valid) {
            http_response_code(401);
            exit('账号或密码错误，请返回登录页面重试。');
        }
    } else {
        // Existing game account hashes remain unchanged for legacy compatibility.
        $hash = md5($password);
        $stmt = $db->prepare('INSERT INTO account (user,pass) VALUES (?,?)');
        $stmt->bind_param('ss', $name, $hash);
        $stmt->execute();
    }
    session_regenerate_id(true);
    $_SESSION['user'] = $name;
    $time = (new DateTimeImmutable('today', new DateTimeZone('Asia/Shanghai')))->getTimestamp();
    $sign = md5('account='.$name.'&time='.$time.'&key='.getenv('FYQST_SDK_KEY'));
    header('Location: /game.html?'.http_build_query(['account'=>$name,'time'=>$time,'sign'=>$sign]), true, 303);
} catch (Throwable $error) {
    error_log('FYQST login: '.$error->getMessage());
    http_response_code(503);
    echo '登录服务暂时不可用，请稍后重试。';
}
