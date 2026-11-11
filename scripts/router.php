<?php
// Local PHP server: retain legacy mysql_* callers through mysqli.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if ($path !== '/' && preg_match('/(?:^|\/)[.]/', rawurldecode($path))) {
    http_response_code(404);
    exit;
}
// Never send audio payloads, including Range requests and stale client URLs.
if (preg_match('/\.(?:mp3|ogg|oga|wav|m4a|aac|flac|opus|weba)(?:$|\/)/i', rawurldecode($path))) {
    http_response_code(204);
    header('Cache-Control: public, max-age=31536000, immutable');
    header('X-Audio-Policy: disabled');
    exit;
}
require_once __DIR__ . '/mysql-compat.php';
return false;
