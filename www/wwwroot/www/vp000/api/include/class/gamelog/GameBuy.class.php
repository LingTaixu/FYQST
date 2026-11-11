<?php
if (!defined('ACCESS')) {
    exit('Access denied.');
}

class GameBuy extends GameLogBase
{
    private static $table_name = 'buy_log';

    private static $columns = array('id', 'server_id', 'user_id', 'lvl', 'shop_type', 'currency_type', 'currency_num', 'goods_id', 'item_id', 'item_name', 'item_num', 'rtime', 'created');

    public static function getTableName()
    {
        return self::$table_name;
    }

    public static function getDataByItemId($params = [])
    {
        $db = self::__instance();
        $sql = "SELECT count(id) as times,count(DISTINCT user_id) as users,sum(item_num) as nums,item_id,item_name,currency_type FROM " . self::getTableName()
            . " WHERE user_id IS NOT NULL ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and server_id in ($serStr)";
        }
        $start = $params['start'];
        if (!empty($start)) {
            $sql .= " and created>='$start'";
        }
        $end = $params['end'];
        if (!empty($end)) {
            $sql .= " and created<'$end'";
        }
        $sql .= " GROUP BY item_id ORDER BY item_id";

        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getTimesByDay($params = [])
    {
        $db = self::__instance();
        $sql = "SELECT count(id) as times,DATE_FORMAT(created,'%Y-%m-%d') as day,user_id,currency_type FROM " . self::getTableName()
            . " WHERE user_id IS NOT NULL ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and server_id in ($serStr)";
        }
        $users = $params['users'];
        if (!empty($users) && is_array($users)) {
            $serStr = join(',', $users);
            $sql .= " and user_id in ($serStr)";
        }
        $shopType = $params['shop_type'];
        if (!empty($shopType)) {
            $sql .= " and shop_type=$shopType ";
        }
        $start = $params['start'];
        if (!empty($start)) {
            $sql .= " and created>='$start'";
        }
        $end = $params['end'];
        if (!empty($end)) {
            $sql .= " and created<'$end'";
        }
        $sql .= " GROUP BY day,user_id,currency_type";

        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getTimesByServer($params = [])
    {
        $db = self::__instance();
        $sql = "SELECT count(id) as times,DATE_FORMAT(created,'%Y-%m-%d') as day,user_id,server_id,currency_type FROM " . self::getTableName()
            . " WHERE user_id IS NOT NULL ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and server_id in ($serStr)";
        }
        $users = $params['users'];
        if (!empty($users) && is_array($users)) {
            $serStr = join(',', $users);
            $sql .= " and user_id in ($serStr)";
        }
        $shopType = $params['shop_type'];
        if (!empty($shopType)) {
            $sql .= " and shop_type=$shopType ";
        }
        $start = $params['start'];
        if (!empty($start)) {
            $sql .= " and created>='$start'";
        }
        $end = $params['end'];
        if (!empty($end)) {
            $sql .= " and created<'$end'";
        }
        $sql .= " GROUP BY day,user_id,currency_type";

        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }
}