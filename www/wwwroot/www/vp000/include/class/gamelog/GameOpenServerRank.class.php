<?php
if (!defined('ACCESS')) {
    exit('Access denied.');
}

class GameOpenServerRank extends GameLogBase
{
    private static $table_name = 'openserverrank_log';

    private static $columns = array('id', 'server_id', 'user_id', 'lvl', 'regTime', 'pay_total', 'rank_score', 'type', 'day_num', 'data', 'rtime', 'created');

    public static function getTableName()
    {
        return self::$table_name;
    }

    public static function getRank($params = [])
    {
        $db = self::__instance();
        $sql = "SELECT id,server_id,user_id,lvl,type,day_num,DATE_FORMAT(created,'%Y-%m-%d') as day,rank_score FROM " . self::getTableName()
            . " WHERE user_id IS NOT NULL ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and server_id in ($serStr)";
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
        $sql .= " ORDER BY day_num,rank_score desc,type ";

        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }
}