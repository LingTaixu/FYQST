<?php
ini_set('memory_limit', '8024M');

//ini_set('max_execution_time', '0');

class GameLogin extends GameLogBase
{
    private static $table_name = 'login_log';

    private static $columns = array('id', 'server_id', 'user_id', 'nick_name', 'lvl', 'rtime', 'created', 'channel_id', 'sdk_channel_id');

    private static $HOUR_SEC = 3600;

    public static function getTableName($server_id)
    {
        return self::$table_name . "_" . $server_id;
    }

    public static function showTable($server_id)
    {
        $db = self::__instance();
        $sql = "show tables like '" . self::getTableName($server_id) . "';";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getLogin($server_id, $params = [])
    {
        $db = self::__instance();
        $sql = "SELECT day,count(user_id) AS num FROM (SELECT DATE_FORMAT(created,'%Y-%m-%d') as day,count(*),user_id FROM " . self::getTableName($server_id)
            . " WHERE user_id IS NOT NULL ";
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and created >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and created < '$endTime'";
        }
        $sql .= " GROUP BY day,user_id) AS tmp GROUP BY day ORDER BY day ASC";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getLoginUsers($server_id, $params = [])
    {
        $db = self::__instance();
        $sql = "SELECT DATE_FORMAT(created,'%Y-%m-%d') as day,user_id,channel_id,sdk_channel_id FROM " . self::getTableName($server_id)
            . " WHERE user_id IS NOT NULL ";
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and created >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and created < '$endTime'";
        }
        $channels = $params['channels'];
        if (!empty($channels) && is_array($channels)) {
            $str = join(',', $channels);
            if ($str) {
                $sql .= " and channel_id in ($str)";
            }
        }
        $sdkChannels = $params['sdkChannels'];
        if (!empty($sdkChannels) && is_array($sdkChannels)) {
            $str = join(',', $sdkChannels);
            if ($str) {
                $sql .= " and sdk_channel_id in ($str)";
            }
        }
        $sql .= " GROUP BY day,user_id ORDER BY day ASC";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getLoginUsersForAllTotal($server_id, $params = [])
    {
        $db = self::__instance();
        $sql = "SELECT DATE_FORMAT(created,'%Y-%m-%d') as day,user_id FROM " . self::getTableName($server_id)
            . " WHERE user_id IS NOT NULL ";
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and created >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and created < '$endTime'";
        }
        $channels = $params['channels'];
        if ($channels && is_array($channels)) {
            $str = join(',', $channels);
            if ($str) {
                $sql .= " and channel_id in ($str)";
            }
        }
        $sdkChannels = $params['sdkChannels'];
        if ($sdkChannels && is_array($sdkChannels)) {
            $str = join(',', $sdkChannels);
            if ($str) {
                $sql .= " and sdk_channel_id in ($str)";
            }
        }
        $sql .= " GROUP BY day,user_id ORDER BY day ASC ";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getRetain($server_id, $params = [])
    {
        $db = self::__instance();
        $sql = "SELECT DATE_FORMAT(created,'%Y-%m-%d') as day,created,count(user_id) as loginNum,user_id FROM " . self::getTableName($server_id)
            . " WHERE user_id IS NOT NULL ";
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and created >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and created < '$endTime'";
        }
        $channels = $params['channels'];
        if ($channels && is_array($channels)) {
            $str = join(',', $channels);
            $sql .= " and channel_id in ($str)";
        }
        $sdkChannels = $params['sdkChannels'];
        if ($sdkChannels && is_array($sdkChannels)) {
            $str = join(',', $sdkChannels);
            $sql .= " and sdk_channel_id in ($str)";
        }
        $sql .= " GROUP BY day,user_id";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }
}