<?php
// The bundled website predates PHP 7. This adapter is loaded by the local router.
if (!function_exists('mysql_connect')) {
    mysqli_report(MYSQLI_REPORT_OFF);
    define('MYSQL_ASSOC', MYSQLI_ASSOC);
    define('MYSQL_NUM', MYSQLI_NUM);
    define('MYSQL_BOTH', MYSQLI_BOTH);

    function mysql_connect($host = '127.0.0.1', $user = '', $password = '', $newLink = false, $flags = 0) {
        $port = 3306;
        if (strpos($host, ':') !== false) {
            list($host, $port) = explode(':', $host, 2);
        }
        $link = mysqli_connect($host, $user, $password, null, (int)$port);
        if ($link) $GLOBALS['fyqst_mysql_link'] = $link;
        return $link;
    }
    function mysql_select_db($database, $link = null) {
        return mysqli_select_db($link ?: $GLOBALS['fyqst_mysql_link'], $database);
    }
    function mysql_query($query, $link = null) {
        return mysqli_query($link ?: $GLOBALS['fyqst_mysql_link'], $query);
    }
    function mysql_fetch_array($result, $type = MYSQL_BOTH) {
        return $result ? mysqli_fetch_array($result, $type) : false;
    }
    function mysql_fetch_assoc($result) {
        return $result ? mysqli_fetch_assoc($result) : false;
    }
    function mysql_fetch_row($result) {
        return $result ? mysqli_fetch_row($result) : false;
    }
    function mysql_num_rows($result) {
        return $result ? mysqli_num_rows($result) : 0;
    }
    function mysql_error($link = null) {
        return mysqli_error($link ?: $GLOBALS['fyqst_mysql_link']);
    }
    function mysql_real_escape_string($value, $link = null) {
        return mysqli_real_escape_string($link ?: $GLOBALS['fyqst_mysql_link'], $value);
    }
    function mysql_insert_id($link = null) {
        return mysqli_insert_id($link ?: $GLOBALS['fyqst_mysql_link']);
    }
    function mysql_affected_rows($link = null) {
        return mysqli_affected_rows($link ?: $GLOBALS['fyqst_mysql_link']);
    }
    function mysql_free_result($result) { return mysqli_free_result($result); }
    function mysql_close($link = null) {
        return mysqli_close($link ?: $GLOBALS['fyqst_mysql_link']);
    }
}
