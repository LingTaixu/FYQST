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
// The operations console is served exclusively by Bun; legacy PHP cannot run here.
$decoded = rawurldecode($path);
if ($decoded === '/vp000' || strpos($decoded, '/vp000/') === 0) {
    if (intval($_SERVER['CONTENT_LENGTH'] ?? 0) > 131072) {
        http_response_code(413);
        exit;
    }
    $headers = [];
    foreach (getallheaders() as $key => $value) {
        if (in_array(strtolower($key), ['host', 'connection', 'content-length', 'transfer-encoding'])) continue;
        $headers[] = $key . ': ' . $value;
    }
    $proxy = curl_init('http://127.0.0.1:8090' . $_SERVER['REQUEST_URI']);
    curl_setopt_array($proxy, [
        CURLOPT_CUSTOMREQUEST => $_SERVER['REQUEST_METHOD'],
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => in_array($_SERVER['REQUEST_METHOD'], ['POST','PATCH','DELETE']) ? file_get_contents('php://input') : null,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 2,
        CURLOPT_TIMEOUT => 45,
        CURLOPT_HEADERFUNCTION => function ($handle, $line) {
            if (preg_match('/^HTTP\/\S+\s+(\d+)/', $line, $match)) http_response_code(intval($match[1]));
            elseif (strpos($line, ':') !== false) {
                $name = strtolower(trim(explode(':', $line, 2)[0]));
                if (!in_array($name, ['connection','transfer-encoding','content-length'])) header(trim($line), false);
            }
            return strlen($line);
        },
    ]);
    $body = curl_exec($proxy);
    if ($body === false) {
        http_response_code(503);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Bun 运营后台未运行，请执行 bun run restart'], JSON_UNESCAPED_UNICODE);
    } else { echo $body; }
    curl_close($proxy);
    exit;
}
require_once __DIR__ . '/mysql-compat.php';
return false;
