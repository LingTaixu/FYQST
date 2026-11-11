<?php
if (!defined('ACCESS')) {
    exit('Access denied.');
}

class GameBoss extends GameLogBase
{
    private static $table_name = 'boss_log';

    private static $columns = array('id', 'server_id', 'boss_id', 'boss_type', 'born_time', 'first_fight_time', 'max_combat',
        'dead_time', 'end_time', 'kill_num', 'user_num', 'rtime', 'created');

    public static function getTableName()
    {
        return self::$table_name;
    }

    public static function getData($params = [])
    {
        $db = self::__instance();
        $sql = "SELECT server_id,boss_id,boss_type,born_time,first_fight_time,max_combat,dead_time,kill_num,user_num FROM " . self::getTableName()
            . " WHERE (dead_time - first_fight_time) > 0 ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and server_id in ($serStr)";
        }
        $start = $params['startTime'];
        if (!empty($start)) {
            $sql .= " and born_time>='$start'";
        }
        $end = $params['endTime'];
        if (!empty($end)) {
            $sql .= " and born_time<'$end'";
        }
        $bossType = $params['bossType'];
        if (!empty($bossType)) {
            $sql .= " and boss_type=$bossType";
        }
        $sql .= " ORDER BY born_time desc";

        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    /*
     * 算每个服务器，每boss，每天，数量
     */
    public static function getBossByServer($params = [])
    {
        $db = self::__instance();
        $sql = "select DATE_FORMAT(created,'%Y-%m-%d') as day,count(1) as allNum,sum(dead_time-first_fight_time) as allTime,sum(user_num) as users,
        sum(kill_num) as allKill,sum(max_combat) as allCombat,server_id,boss_type,boss_id,count(DISTINCT boss_id) as bossNum from " . self::getTableName() . " where (dead_time - first_fight_time) > 0 and  user_num > 0 ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and server_id in ($serStr)";
        }
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and created >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and created < '$endTime'";
        }
        $bossType = $params['bossType'];
        if (!empty($bossType)) {
            $sql .= " and boss_type=$bossType";
        }
        $groupBy = $params['groupBy'];
        if (!empty($groupBy)) {
            if (is_array($groupBy)) {
                $groupStr = join(',', $groupBy);
                $sql .= " group by $groupStr ";//server_id,day,boss_id
            } else {
                $sql .= " group by $groupBy ";
            }
        }

        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }
}