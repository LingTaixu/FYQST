<?php
if (!defined('ACCESS')) {
    exit('Access denied.');
}

class GameLaba extends GameLogBase
{
    private static $table_name = 'laba_log';

    private static $columns = array('id', 'server_id', 'user_id', 'lvl', 'type', 'laba_num', 'cost_item_num', 'cost_diamond', 'data', 'rtime', 'created');

    public static function getTableName()
    {
        return self::$table_name;
    }

    public static function getDataByDay($params = [])
    {
        $db = self::__instance();
        $sql = "SELECT DATE_FORMAT(created,'%Y-%m-%d') as day,count(id) as times,count(DISTINCT user_id) as users,laba_num FROM " . self::getTableName()
            . " WHERE user_id IS NOT NULL ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and server_id in ($serStr)";
        }
        $labaNum = $params['labaNum'];
        if (!empty($labaNum)) {
            $sql .= " and laba_num=$labaNum";
        }
        $start = $params['start'];
        if (!empty($start)) {
            $sql .= " and created>='$start'";
        }
        $end = $params['end'];
        if (!empty($end)) {
            $sql .= " and created<'$end'";
        }
        $sql .= " GROUP BY day ORDER BY day DESC";

        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }
}