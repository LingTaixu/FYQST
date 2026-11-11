<?php
if (!defined('ACCESS')) {
    exit('Access denied.');
}

class CurrencyDScoreLog extends GameLogBase
{
    private static $table_name = 'currency_dscore_log';

    private static $columns = array('id', 'server_id', 'sub_op', 'user_id', 'lvl', 'type', 'para', 'num', 'item_id', 'item_num', 'rtime', 'created');

    private static $HOUR_SEC = 3600;

    public static function getTableName($server_id)
    {
        return self::$table_name . "_" . $server_id;
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
        $itemId = $params['itemIds'];
        if (!empty($itemId)) {
            $serStr = join(',', $itemId);
            $sql .= " and item_id in ($serStr)";
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


    public static function getDataByUserId($serverId, $params = [])
    {
        $db = self::__instance();
        $sql = "SELECT sum(num) dscores,user_id,type,item_id,sub_op FROM " . self::getTableName($serverId)
            . " WHERE user_id IS NOT NULL ";

        $subOp = $params['sub_op'];
        if (!empty($subOp)) {
            $sql .= " and sub_op = '$subOp'";
        }
        $type = $params['type'];
        if (!empty($itemId)) {
            $sql .= " and type = '$type'";
        }
        $itemId = $params['itemIds'];
        if (!empty($itemId)) {
            $serStr = join(',', $itemId);
            $sql .= " and item_id in ($serStr)";
        }
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and created >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and created < '$endTime'";
        }
        $sql .= " GROUP BY user_id ";

        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }
}