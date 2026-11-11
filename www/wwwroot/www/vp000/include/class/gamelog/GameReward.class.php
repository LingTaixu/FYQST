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

    public static function count($params = [])
    {
        $db = self::__instance();
        $condition = array();
        $sub_condition = array();
        $serverId = $params['servers'];
        if (!empty($serverId)) {
            $sub_condition['server_id'] = $serverId;
        }
        $uid = $params['uid'];
        if (!empty($uid)) {
            $sub_condition['user_id'] = $uid;
        }

        if (empty($sub_condition)) {
            $condition = array();
        } else {
            $condition["AND"] = $sub_condition;
        }

        $num = $db->count(self::getTableName(), $condition);
        return $num;
    }

    public static function getList($params = [])
    {
        $db = self::__instance();
        $sql = "SELECT id,server_id,user_id,type,DATE_FORMAT(created,'%Y-%m-%d') as day,reward_id,created,data,lvl FROM " . self::getTableName()
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
        $start = $params['start'];
        if (!empty($start)) {
            $sql .= " and created>='$start'";
        }
        $end = $params['end'];
        if (!empty($end)) {
            $sql .= " and created<'$end'";
        }
        $uid = $params['uid'];
        if (!empty($uid)) {
            $sql .= " and user_id=$uid";
        }
        $sql .= " ORDER BY created desc ";

        $pageStart = $params['pageStart'];
        $pageSize = $params['pageSize'];
        if (!empty($pageSize)) {
            $sql .= " limit $pageStart,$pageSize";
        }

        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
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