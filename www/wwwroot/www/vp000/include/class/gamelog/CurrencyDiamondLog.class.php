<?php
if (!defined('ACCESS')) {
    exit('Access denied.');
}

class CurrencyDiamondLog extends GameLogBase
{
    private static $table_name = 'currency_diamond_log';

    private static $columns = array('id', 'server_id', 'sub_op', 'user_id', 'lvl', 'type', 'num', 'item_id', 'item_name', 'item_num', 'rtime', 'created');

    private static $HOUR_SEC = 3600;

    public static function getTableName($server_id)
    {
        return self::$table_name . "_" . $server_id;
    }

    public static function getDiamondByDay($serverId, $params = [])
    {
        $db = self::__instance();
        $sql = "SELECT sum(num) as allNum,COUNT(DISTINCT user_id) as userNum,DATE_FORMAT(created,'%Y-%m-%d') as day,sub_op FROM " . self::getTableName($serverId)
            . " WHERE user_id IS NOT NULL ";

        $subOp = $params['sub_op'];
        if (!empty($subOp)) {
            $sql .= " and sub_op = '$subOp'";
        }
        $userId = $params['userId'];
        if (!empty($userId)) {
            $sql .= " and user_id = $userId";
        }
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and created >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and created < '$endTime'";
        }

        $sql .= " group by day,sub_op ";

        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getDataByItemId($serverId, $params = [])
    {
        $db = self::__instance();
        $sql = "SELECT count(id) as times,count(DISTINCT user_id) as users,sum(item_num) as nums,item_id,sub_op FROM " . self::getTableName($serverId)
            . " WHERE user_id IS NOT NULL and item_id != 0 ";

        $subOp = $params['sub_op'];
        if (!empty($subOp)) {
            $sql .= " and sub_op = '$subOp'";
        }

        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and created >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and created < '$endTime'";
        }
        $sql .= " GROUP BY item_id ORDER BY item_id";

        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getDataByUser($serverId, $params = [])
    {
        $db = self::__instance();
        $sql = "SELECT id,user_id,lvl,num,item_num,item_id,sub_op,type,created FROM " . self::getTableName($serverId)
            . " WHERE user_id IS NOT NULL and item_id != 0 ";

        $subOp = $params['sub_op'];
        if (!empty($subOp)) {
            $sql .= " and sub_op = '$subOp'";
        }

        $userId = $params['user_id'];
        if (!empty($userId)) {
            $sql .= " and user_id = '$userId'";
        }
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and created >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and created < '$endTime'";
        }
        $sql .= " ORDER BY created desc";

        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }
}