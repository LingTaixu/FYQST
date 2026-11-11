<?php
if (!defined('ACCESS')) {
    exit('Access denied.');
}

class GameCurrencyLog extends GameLogBase
{
    private static $table_name = 'currency_log';

    private static $columns = array('id', 'server_id', 'sub_op', 'currency', 'user_id', 'lvl', 'type', 'num', 'item_id', 'item_name', 'item_num', 'rtime', 'created');

    private static $HOUR_SEC = 3600;

    public static function getTableName($server_id)
    {
        return self::$table_name . "_" . $server_id;
    }

    public static function getCurrencyList($serverId, $currency = [], $params = [])
    {
        $db = self::__instance();
        $sql = "SELECT sub_op,currency,user_id,lvl,type,num,item_id,item_num,rtime,created FROM " . self::getTableName($serverId)
            . " WHERE user_id IS NOT NULL ";

        if (!empty($currency)) {
            if (is_array($currency)) {
                $currencyStr = join("','", $currency);
                $sql .= " and currency in ('$currencyStr')";
            }
        }
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

        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getCurrencyByDay($serverId, $currency = [], $params = [])
    {
        $db = self::__instance();
        $sql = "SELECT sum(num) as allNum,COUNT(DISTINCT user_id) as userNum,DATE_FORMAT(created,'%Y-%m-%d') as day,currency,sub_op FROM " . self::getTableName($serverId)
            . " WHERE user_id IS NOT NULL ";

        if (!empty($currency)) {
            if (is_array($currency)) {
                $currencyStr = join("','", $currency);
                $sql .= " and currency in ('$currencyStr')";
            }
        }
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

        $sql .= " group by day,currency,sub_op ";

        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getDataByItemId($serverId, $currency = [], $params = [])
    {
        $db = self::__instance();
        $sql = "SELECT count(id) as times,count(DISTINCT user_id) as users,sum(item_num) as nums,item_id,currency,sub_op FROM " . self::getTableName($serverId)
            . " WHERE user_id IS NOT NULL ";

        if (!empty($currency)) {
            if (is_array($currency)) {
                $currencyStr = join("','", $currency);
                $sql .= " and currency in ('$currencyStr')";
            }
        }
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
}