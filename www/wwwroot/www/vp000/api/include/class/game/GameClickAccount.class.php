<?php
if (!defined('ACCESS')) {
    exit('Access denied.');
}

class GameClickAccount extends LoginBase
{
    private static $table_name = 'uw_click_account';      // 服务器列表信息

    private static $columns = array('id', 'channelId', 'openId', 'sdkData', 'url', 'createTime');

    public static function getTableName()
    {
        return self::$table_name;
    }

    public static function getClicks($params = [])
    {
        $db = self::__instance();
        $sql = "select DATE_FORMAT(createTime,'%Y-%m-%d') as theDate,count(id) as num from " . self::$table_name . " where 1=1";
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and createTime >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and createTime < '$endTime'";
        }
        $sql .= " group by theDate";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }
}