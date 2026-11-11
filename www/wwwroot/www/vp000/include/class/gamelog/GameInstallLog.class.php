<?php
if (!defined('ACCESS')) {
    exit('Access denied.');
}

class GameInstallLog extends GameLogBase
{
    private static $table_name = 'gameinstall_log';

    private static $columns = array('id', 'account_name', 'user_level', 'install_step', 'install_step_name', 'channel_id', 'ip', 'rtime', 'created');

    public static function getTableName()
    {
        return self::$table_name;
    }

    public static function getFirstCreate($params = [])
    {
        $db = self::__instance();
        $sql = "SELECT count(distinct ip) as ipNum,install_step,install_step_name,created FROM " . self::getTableName()
            . " WHERE user_level in (0,1) ";
        $step = $params['step'];
        if (!empty($step) && is_array($step)) {
            $serStr = join(',', $step);
            $sql .= " and install_step in ($serStr)";
        }
        $start = $params['start'];
        if (!empty($start)) {
            $sql .= " and created>='$start'";
        }
        $end = $params['end'];
        if (!empty($end)) {
            $sql .= " and created<'$end'";
        }
        $sql .= " GROUP BY install_step";

        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getDataByIp($params = [])
    {
        $db = self::__instance();
        $sql = "SELECT ip,install_step,install_step_name,created FROM " . self::getTableName()
            . " WHERE user_level in (0,1) ";
        $step = $params['step'];
        if (!empty($step) && is_array($step)) {
            $serStr = join(',', $step);
            $sql .= " and install_step in ($serStr)";
        }
        $start = $params['start'];
        if (!empty($start)) {
            $sql .= " and created>='$start'";
        }
        $end = $params['end'];
        if (!empty($end)) {
            $sql .= " and created<'$end'";
        }
        $sql .= " GROUP BY ip";

        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }
}