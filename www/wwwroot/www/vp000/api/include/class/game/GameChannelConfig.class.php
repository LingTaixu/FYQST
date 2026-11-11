<?php
if (!defined('ACCESS')) {
    exit('Access denied.');
}

class GameChannelConfig extends MainBase
{
    private static $table_name = 'uw_channel_config';      // 信息

    private static $columns = array('id', 'channelId', 'sdkChannelId', 'channelName', 'sdkChannelName', 'channelDesc');

    public static function getTableName()
    {
        return self::$table_name;
    }

    public static function getList($params = [])
    {
        $db = self::__instance();
        $sql = "select id,channelId,sdkChannelId,channelName,sdkChannelName,channelDesc from " . self::getTableName() . " where 1=1 ";
        $id = $params['id'];
        if (!empty($id)) {
            $sql .= " and id = $id";
        }
        $sql .= " order by id";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function addData($data)
    {
        if (!$data || !is_array($data)) {
            return false;
        }
        $db = self::__instance();
        $id = $db->insert(self::getTableName(), $data);
        return $id;
    }

    public static function updateDataById($id, $data)
    {
        if (!$data || !is_array($data)) {
            return false;
        }
        $db = self::__instance();
        $condition = array("id" => $id);
        $result = $db->update(self::getTableName(), $data, $condition);
        return $result;
    }
}