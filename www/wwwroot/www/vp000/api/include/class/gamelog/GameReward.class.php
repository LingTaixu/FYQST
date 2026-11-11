<?php
if (!defined('ACCESS')) {
    exit('Access denied.');
}

class GameReward extends GameLogBase
{
    private static $table_name = 'reward_log';

    private static $columns = array('id', 'server_id', 'user_id', 'lvl', 'type', 'reward_id', 'data', 'rtime', 'created');

    public static function getTableName()
    {
        return self::$table_name;
    }

    public static function getDataByDay($params = [])
    {
        $db = self::__instance();
        $sql = "SELECT id,server_id,user_id,type,DATE_FORMAT(created,'%Y-%m-%d') as day,reward_id FROM " . self::getTableName()
            . " WHERE user_id IS NOT NULL ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and server_id in ($serStr)";
        }
        $type = $params['type'];
        if (!empty($type) && is_array($type)) {
            $serStr = join(',', $type);
            $sql .= " and type in ($serStr)";
        }
        $dayNum = $params['dayNum'];
        if (!empty($dayNum)) {
            $sql .= " and day_num=$dayNum";
        }
        $start = $params['start'];
        if (!empty($start)) {
            $sql .= " and created>='$start'";
        }
        $end = $params['end'];
        if (!empty($end)) {
            $sql .= " and created<'$end'";
        }
        $sql .= " ORDER BY day,user_id ";

        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }
}