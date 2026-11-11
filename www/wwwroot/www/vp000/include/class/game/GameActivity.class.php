<?php
if (!defined('ACCESS')) {
    exit('Access denied.');
}

class GameActivity extends GameBase
{
    private static $table_name = 'uw_activity';      // 活动列表

    private static $columns = array('id', 'title', 'fullTitle', '`type`', 'iconType', 'tiIconType', 'startTime', 'endTime', 'items', 'randomHeroes', 'exValues', 'exValues2', 'exValues3', 'content', 'isOpen', 'sort', 'exData', 'note', 'templateId');

    public static function getTableName()
    {
        return self::$table_name;
    }

    public static function getUpdateServerTime()
    {
        return [
            99999 => [0 => '2018-09-04 00:00:00', 1 => '2018-09-26 00:00:00', 2 => '2018-10-18 00:00:00'],//
            10006 => [0 => '2018-09-04 00:00:00', 1 => '2018-09-26 00:00:00', 2 => '2018-10-18 00:00:00'],//
            10012 => [0 => '2018-09-04 00:00:00', 1 => '2018-09-26 00:00:00', 2 => '2018-10-18 00:00:00'],//
            10007 => [0 => '2018-09-04 00:00:00', 1 => '2018-09-26 00:00:00', 2 => '2018-10-18 00:00:00'],//
            10008 => [0 => '2018-09-04 00:00:00', 1 => '2018-09-20 00:00:00', 2 => '2018-10-18 00:00:00'],//
            10009 => [0 => '2018-09-04 00:00:00', 1 => '2018-09-26 00:00:00', 2 => '2018-10-18 00:00:00'],//
            10010 => [0 => '2018-09-04 00:00:00', 1 => '2018-09-26 00:00:00', 2 => '2018-10-18 00:00:00'],//
            10011 => [0 => '2018-09-14 00:00:00', 1 => '2018-09-30 00:00:00', 2 => '2018-10-18 00:00:00'],//

            10013 => [0 => '2018-09-06 00:00:00', 1 => '2018-09-27 00:00:00', 2 => '2018-10-18 00:00:00'],//
            10014 => [0 => '2018-09-04 00:00:00', 1 => '2018-09-27 00:00:00', 2 => '2018-10-18 00:00:00'],//
            10015 => [0 => '2018-09-04 00:00:00', 1 => '2018-09-26 00:00:00', 2 => '2018-10-18 00:00:00'],//
            10016 => [0 => '2018-09-04 00:00:00', 1 => '2018-09-27 00:00:00', 2 => '2018-10-18 00:00:00'],//
        ];
    }

    public static function getActivityList()
    {
        return [
            1 => ['id' => 1, 'weekNum' => 0, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],
            2 => ['id' => 2, 'weekNum' => 2, 'weekStart' => 1, 'days' => 7, 'old' => 0, 'dayType' => 1],
            3 => ['id' => 3, 'weekNum' => 3, 'weekStart' => 1, 'days' => 7, 'old' => 1, 'dayType' => 1],
            30 => ['id' => 30, 'weekNum' => 0, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],
            32 => ['id' => 32, 'weekNum' => 0, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],
            33 => ['id' => 33, 'weekNum' => 0, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],
            34 => ['id' => 34, 'weekNum' => 0, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],
            101 => ['id' => 101, 'weekNum' => 1, 'weekStart' => 3, 'days' => 3, 'old' => 0, 'dayType' => 1],
            102 => ['id' => 102, 'weekNum' => 2, 'weekStart' => 1, 'days' => 7, 'old' => 1, 'dayType' => 1],
            1077 => ['id' => 1077, 'weekNum' => 0, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],//
            1078 => ['id' => 1078, 'weekNum' => 0, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],
            1080 => ['id' => 1080, 'weekNum' => 0, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],
            1081 => ['id' => 1081, 'weekNum' => 0, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],
            1082 => ['id' => 1082, 'weekNum' => 0, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],
            1083 => ['id' => 1083, 'weekNum' => 0, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],
            1085 => ['id' => 1085, 'weekNum' => 0, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],
            1086 => ['id' => 1086, 'weekNum' => 0, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],
            1087 => ['id' => 1087, 'weekNum' => 0, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],
            1088 => ['id' => 1088, 'weekNum' => 1, 'weekStart' => 1, 'days' => 8, 'old' => 0, 'dayType' => 1],
            1089 => ['id' => 1089, 'weekNum' => 0, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],//
            1090 => ['id' => 1090, 'weekNum' => 1, 'weekStart' => 1, 'days' => 7, 'old' => 0, 'dayType' => 1],
            1091 => ['id' => 1091, 'weekNum' => 0, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],//
            1092 => ['id' => 1092, 'weekNum' => 1, 'weekStart' => 1, 'days' => 7, 'old' => 0, 'dayType' => 1],
            1093 => ['id' => 1093, 'weekNum' => 0, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],
            1094 => ['id' => 1094, 'weekNum' => 0, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],
            1095 => ['id' => 1095, 'weekNum' => 0, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],
            1096 => ['id' => 1096, 'weekNum' => 0, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],
            1097 => ['id' => 1097, 'weekNum' => 1, 'weekStart' => 1, 'days' => 14, 'old' => 0, 'dayType' => 1],
            2001 => ['id' => 2001, 'weekNum' => 2, 'weekStart' => 1, 'days' => 7, 'old' => 0, 'dayType' => 1],
            2002 => ['id' => 2002, 'weekNum' => 2, 'weekStart' => 1, 'days' => 7, 'old' => 0, 'dayType' => 1],
            2003 => ['id' => 2003, 'weekNum' => 2, 'weekStart' => 1, 'days' => 14, 'old' => 0, 'dayType' => 1],
            2004 => ['id' => 2004, 'weekNum' => 1, 'weekStart' => 1, 'days' => 18, 'old' => 0, 'dayType' => 1],
            2005 => ['id' => 2005, 'weekNum' => 2, 'weekStart' => 1, 'days' => 7, 'old' => 0, 'dayType' => 1],
            3001 => ['id' => 3001, 'weekNum' => 3, 'weekStart' => 5, 'days' => 1, 'old' => 1, 'dayType' => 1],
            3002 => ['id' => 3002, 'weekNum' => 3, 'weekStart' => 5, 'days' => 0, 'old' => 1, 'dayType' => 1],//变永久
            3003 => ['id' => 3003, 'weekNum' => 3, 'weekStart' => 5, 'days' => 0, 'old' => 1, 'dayType' => 1],//变永久
            3004 => ['id' => 3004, 'weekNum' => 3, 'weekStart' => 5, 'days' => 3, 'old' => 1, 'dayType' => 1],
            3005 => ['id' => 3005, 'weekNum' => 3, 'weekStart' => 5, 'days' => 1, 'old' => 1, 'dayType' => 1],
            3092 => ['id' => 3092, 'weekNum' => 2, 'weekStart' => 1, 'days' => 7, 'old' => 0, 'dayType' => 1],
            3093 => ['id' => 3093, 'weekNum' => 3, 'weekStart' => 1, 'days' => 7, 'old' => 1, 'dayType' => 1],
            3094 => ['id' => 3094, 'weekNum' => 1, 'weekStart' => 1, 'days' => 7, 'old' => 0, 'dayType' => 1],
            3095 => ['id' => 3095, 'weekNum' => 2, 'weekStart' => 1, 'days' => 7, 'old' => 0, 'dayType' => 1],
            3101 => ['id' => 3101, 'weekNum' => 1, 'weekStart' => 1, 'days' => 7, 'old' => 0, 'dayType' => 1],
            3102 => ['id' => 3102, 'weekNum' => 2, 'weekStart' => 1, 'days' => 7, 'old' => 0, 'dayType' => 1],
            3103 => ['id' => 3103, 'weekNum' => 3, 'weekStart' => 1, 'days' => 14, 'old' => 1, 'dayType' => 1],
            3111 => ['id' => 3111, 'weekNum' => 1, 'weekStart' => 3, 'days' => 5, 'old' => 0, 'dayType' => 1],
            3112 => ['id' => 3112, 'weekNum' => 2, 'weekStart' => 1, 'days' => 7, 'old' => 0, 'dayType' => 1],
            3121 => ['id' => 3121, 'weekNum' => 1, 'weekStart' => 1, 'days' => 7, 'old' => 0, 'dayType' => 1],
            3122 => ['id' => 3122, 'weekNum' => 2, 'weekStart' => 1, 'days' => 7, 'old' => 0, 'dayType' => 1],
            4021 => ['id' => 4021, 'weekNum' => 4, 'weekStart' => 1, 'days' => 0, 'old' => 0, 'dayType' => 1],
            2021 => ['id' => 2021, 'weekNum' => 4, 'weekStart' => 1, 'days' => 14, 'old' => 1, 'dayType' => 1],
            2035 => ['id' => 2035, 'weekNum' => 6, 'weekStart' => 1, 'days' => 14, 'old' => 1, 'dayType' => 1],
            2049 => ['id' => 2049, 'weekNum' => 8, 'weekStart' => 1, 'days' => 14, 'old' => 1, 'dayType' => 1],
            2063 => ['id' => 2063, 'weekNum' => 10, 'weekStart' => 1, 'days' => 14, 'old' => 1, 'dayType' => 1],
            28 => ['id' => 28, 'weekNum' => 5, 'weekStart' => 1, 'days' => 7, 'old' => 1, 'dayType' => 1],
            42 => ['id' => 42, 'weekNum' => 7, 'weekStart' => 1, 'days' => 7, 'old' => 1, 'dayType' => 1],
            56 => ['id' => 56, 'weekNum' => 9, 'weekStart' => 1, 'days' => 7, 'old' => 1, 'dayType' => 1],
            70 => ['id' => 70, 'weekNum' => 11, 'weekStart' => 1, 'days' => 7, 'old' => 1, 'dayType' => 1],
            2011 => ['id' => 2011, 'weekNum' => 0, 'weekStart' => 1, 'days' => 7, 'old' => 1, 'dayType' => 2, 'start' => "2018-10-01 00:00:00", 'oldServerTime' => '2018-09-17 00:00:00'],
            3010 => ['id' => 3010, 'weekNum' => 0, 'weekStart' => 1, 'days' => 3, 'old' => 1, 'dayType' => 2, 'start' => '2018-10-03 00:00:00', 'oldServerTime' => '2018-09-10 00:00:00'],
            3011 => ['id' => 3011, 'weekNum' => 0, 'weekStart' => 1, 'days' => 3, 'old' => 1, 'dayType' => 2, 'start' => '2018-10-03 00:00:00', 'oldServerTime' => '2018-09-10 00:00:00'],
        ];
    }

    public static function count()
    {
        $db = self::__instance();
        return $db->count(self::getTableName());
    }

    public static function getList($start = 0, $page_size = 0)
    {
        $db = self::__instance();
        $condition = array();
        $condition["ORDER"] = " type,id asc";
        if ($page_size) {
            $condition['LIMIT'] = array($start, $page_size);
        }
        $list = $db->select(self::getTableName(), self::$columns, $condition);
        return $list;
    }

    public static function getActivityById($id)
    {
        $db = self::__instance();
        $condition = array();
        $condition['id'] = $id;
        $list = $db->select(self::getTableName(), self::$columns, $condition);
        if ($list) {
            return $list[0];
        }
        return array();
    }

    public static function insert($data, $sid = 0)
    {
        if (!$data || !is_array($data)) {
            return false;
        }
        if ($sid) {
            $db = self::__instance2($sid);
        } else {
            $db = self::__instance();
        }
        $result = $db->insert(self::getTableName(), $data);
        return $result;
    }

    public static function update($id, $data)
    {
        if (!$data || !is_array($data)) {
            return false;
        }
        $db = self::__instance();
        $condition = array("id" => $id);

        $result = $db->update(self::getTableName(), $data, $condition);
        return $result;
    }

    public static function updateByServerId($serverId, $id, $data)
    {
        if (!$data || !is_array($data)) {
            return false;
        }
        $db = self::__instance2($serverId);
        $condition = array("id" => $id);
        $result = $db->update(self::getTableName(), $data, $condition);
        return $result;
    }

    // 设置开服活动的时间
    public static function openServer($serverId, $openTime)
    {
        if (!$serverId) {
            return false;
        }
        $activityList = self::getActivityList();

        $db = self::__instance2($serverId);
//        $openTime = "2018-09-04 00:00:00";
        // 取到天数
        $result = false;
        foreach ($activityList as $a) {
            $isOpen = "";
            $opTimestamp = strtotime($openTime);
            $startTime = $endDate = '';
            $actId = $a['id'];
            $dayType = $a['dayType'];
            $weekNum = $a['weekNum'];
            $weekStart = $a['weekStart'];
            $days = $a['days'];
            $oldNeed = $a['old'];

            $channelId = UserSession::getUserPlatform();
            $updateList = self::getUpdateServerTime();

            if ($dayType == 1) {
                if ($weekNum == 0) {
                    $tmStart = $opTimestamp + ($weekStart - 1) * 86400;
                    $startTime = date('Y-m-d 00:00:00', $tmStart);
                    $endDate = "2099-01-01 00:00:00";// 2000天
                }
                if ($weekNum == 1) {
                    $tmStart = $opTimestamp + (($weekNum - 1) * 7 + $weekStart - 1) * 86400;
                    $startTime = date('Y-m-d 00:00:00', $tmStart);
                    $tmEnd = $tmStart + ($days - 1) * 86400;
                    $endDate = date('Y-m-d 23:59:59', $tmEnd);
                }
                if ($weekNum == 2) {
                    $tmStart = $opTimestamp + (($weekNum - 1) * 7 + $weekStart - 1) * 86400;
                    $startTime = date('Y-m-d 00:00:00', $tmStart);
                    $tmEnd = $tmStart + ($days - 1) * 86400;
                    $endDate = date('Y-m-d 23:59:59', $tmEnd);
                }
                if ($weekNum == 3) {
                    $updateServerTime = $updateList[$channelId][0];//9月4号更新针对老服的修改

                    $dayDiff = Help::getDifferentDays($openTime, $updateServerTime);
                    if ($dayDiff > 13) {//老服特殊处理
                        if ($actId == 3 || $actId == 3093) {
                            $startTime = $updateServerTime;
                            $tmStart = strtotime($startTime);
                            $tmEnd = $tmStart + ($days - 1) * 86400;
                            $endDate = date('Y-m-d 23:59:59', $tmEnd);// 结束
                        } else {
                            $monday = self::getWeekDayStr($opTimestamp);
                            $tmStart = $monday + ($weekStart - 1) * 86400;;//两周后的第一个周一
                            $startTime = date('Y-m-d 00:00:00', $tmStart);
                            $tmStart = strtotime($startTime);
                            $tmEnd = $tmStart + ($days - 1) * 86400;
                            $endDate = date('Y-m-d 23:59:59', $tmEnd);// 结束
                        }
                    } else {
                        $openTime14 = $opTimestamp + 13 * 86400;//开服后第14天00：00：00
                        $tmStart = strtotime('next monday', $openTime14) + ($weekStart - 1) * 86400;;//两周后的第一个周一
                        $startTime = date('Y-m-d 00:00:00', $tmStart);
                        $tmEnd = $tmStart + ($days - 1) * 86400;
                        $endDate = date('Y-m-d 23:59:59', $tmEnd);// 结束
                    }
                }
                if (in_array($actId, [2021, 2035, 2049, 28, 42, 56])) {
                    $updateServerTime = $updateList[$channelId][1];//9月20号更新针对新活动修改
                    $tmStart = $opTimestamp + ($weekNum * 7 + $weekStart - 1) * 86400;
                    $monday = self::getWeekDayStr($tmStart);
                    $tmStart = $monday + ($weekStart - 1) * 86400;;//两周后的第一个周一
                    $startTime = date('Y-m-d 00:00:00', $tmStart);
                    if ($tmStart < strtotime($updateServerTime)) {
                        $isOpen = 0;
                        $endDate = $startTime;
                    } else {
                        $tmEnd = $tmStart + ($days - 1) * 86400;
                        $endDate = date('Y-m-d 23:59:59', $tmEnd);// 结束
                    }
                }
                if (in_array($actId, [2063, 70])) {
                    $updateServerTime = $updateList[$channelId][1];//9月19号更新针对新活动修改
                    $tmStart = $opTimestamp + ($weekNum * 7 + $weekStart - 1) * 86400;
                    $monday = self::getWeekDayStr($tmStart);
                    $tmStart = $monday + ($weekStart - 1) * 86400;;//两周后的第一个周一
                    $startTime = date('Y-m-d 00:00:00', $tmStart);
                    if ($tmStart < strtotime($updateServerTime)) {
                        $startTime = $updateServerTime;
                        $tmStart = strtotime($startTime);
                    }
                    $isOpen = 1;
                    $tmEnd = $tmStart + ($days - 1) * 86400;
                    $endDate = date('Y-m-d 23:59:59', $tmEnd);// 结束
                }
                if ($actId == 4021) {
                    $tmStart = $opTimestamp + ($weekNum * 7 + $weekStart - 1) * 86400;
                    $tmStart = self::getWeekDayStr($tmStart);
                    $startTime = date('Y-m-d 00:00:00', $tmStart);
                    $tmEnd = $tmStart + ($days - 1) * 86400;
                    $endDate = date('Y-m-d 23:59:59', $tmEnd);
                }
                if ($actId == 102) {
                    $updateServerTime = $updateList[$channelId][1];//9月20号更新针对老服的修改

                    $openTime8 = strtotime($openTime) + 7 * 86400;//开服后第8天00：00：00

                    if ($openTime8 < strtotime($updateServerTime)) {//老服特殊处理
                        $startTime = $updateServerTime;
                        $tmStart = strtotime($startTime);
                        $tmEnd = $tmStart + ($days - 1) * 86400;
                        $endDate = date('Y-m-d 23:59:59', $tmEnd);// 结束
                    } else {
                        $startTime = date('Y-m-d 00:00:00', $openTime8);
                        $tmStart = strtotime($startTime);
                        $tmEnd = $tmStart + ($days - 1) * 86400;
                        $endDate = date('Y-m-d 23:59:59', $tmEnd);
                    }
                }
                //10月18日第三次更新
                //开服8~~满14天的本周日
                if (in_array($actId, [3092, 3095, 3112, 3122])) {
                    $startTime7 = strtotime($startTime) + ($days - 1) * 86400;//活动后第7天00：00：00
                    $tmEnd = self::getWeekDayStr($startTime7, 7);
                    $endDate = date('Y-m-d 23:59:59', $tmEnd);
                }
                //判断如果根据左边算出的开始时间小于更新日，则以更新日为第一天，持续14天
                if (in_array($actId, [3103])) {
                    $updateServerTime = $updateList[$channelId][2];//10月18日更新针对老服的修改
                    $tmStart = $opTimestamp + (($weekNum - 1) * 7 + $weekStart - 1) * 86400;
                    $startTime = date('Y-m-d 00:00:00', $tmStart);
                    $tmEnd = $tmStart + ($days - 1) * 86400;
                    $endDate = date('Y-m-d 23:59:59', $tmEnd);// 结束
                    if ($tmStart < strtotime($updateServerTime)) {
                        $startTime = $updateServerTime;
                        $tmStart = strtotime($startTime);
                        $tmEnd = $tmStart + ($days - 1) * 86400;
                        $endDate = date('Y-m-d 23:59:59', $tmEnd);
                    }
                }
                //直接关
                if (in_array($actId, [3093, 4021])) {
                    $isOpen = 0;
                }
                //判断更新日该活动是否正开启，如果正开启，则不关闭，否则直接关
                if (in_array($actId, [3, 28, 42, 56, 70, 3001, 2021, 2035, 2049, 2063, 3004, 3005])) {
                    $updateServerTime = $updateList[$channelId][2];//10月18日更新针对老服的修改
                    if ($startTime <= $updateServerTime && $updateServerTime <= $endDate) {
                        $isOpen = 1;
                    } else {
                        $isOpen = 0;
                    }
                }
                //判断更新日该活动是否正开启，并处于周5、周6、周日，如果是，则将活动日期变为更新当日~本周日23:59:59
                if (in_array($actId, [3002, 3003])) {
                    $updateServerTime = $updateList[$channelId][2];//10月18日更新针对老服的修改
                    $usTime = strtotime($updateServerTime);
                    $isOpen = 0;
                    if (strtotime($startTime) <= $usTime) {//永久活动，如果开启则...
                        $weekNum = date('w', $usTime);
                        if (in_array($weekNum, [0, 5, 6])) {
                            $isOpen = 1;
                            $days = 1;//改成非永久，设为非0
                            $startTime = $updateServerTime;
                            $tmStart = strtotime($startTime);
                            $tmEnd = self::getWeekDayStr($tmStart, 7);
                            $endDate = date('Y-m-d 23:59:59', $tmEnd);
                        }
                    }
                }
            }
            //全服统一活动
            if ($dayType == 2) {
                if ($oldNeed == 1) {
                    $startTime = $a['start'];
                    $tmStart = strtotime($startTime);
                    $tmEnd = $tmStart + ($days - 1) * 86400;
                    $endDate = date('Y-m-d 23:59:59', $tmEnd);

                    $oldServerTime = $a['oldServerTime'];
                    if ($opTimestamp >= strtotime($oldServerTime)) {
                        $isOpen = 0;
                    }
                }
            }

            //days 0 代表永久
            if ($days == 0) {
                $endDate = "2099-01-01 00:00:00";// 永久
            }
            if ($startTime && $endDate) {
                $condition = array("id" => $actId);
                $data = array(
                    'startTime' => $startTime,
                    'endTime' => $endDate
                );
                if (is_numeric($isOpen)) {
                    $data['isOpen'] = $isOpen;
                }

//                print_r($activityList[$actId]);
//                print_r('--->');
//                print_r($data);
//                print_r("<br/>");
                $result = $db->update(self::getTableName(), $data, $condition);
            }
        }

        return $result;
    }

    // 活动开服活动信息
    public static function getOpenActivity($serverId)
    {
        $db = self::__instance2($serverId);
        $condition = array("type" => [6, 49, 50, 23]);

        $list = $db->select(self::getTableName(), self::$columns, $condition);
        return $list;
    }

    public static function getServerActivity($serverId, $params = [])
    {
        $db = self::__instance2($serverId);
        $condition = array();
        $id = $params['id'];
        if ($id) {
            $condition['id'] = $id;
        }
        $list = $db->select(self::getTableName(), self::$columns, $condition);
        if ($list) {
            return $list[0];
        }
        return array();
    }

    private static function getWeekDayStr($day, $w = 1, $str = 0)
    {
        if (!is_numeric($day)) {
            $day = strtotime($day);
        }
        $weekDay = ($day - ((date('w', $day) == 0 ? 7 : date('w', $day)) - $w) * 24 * 3600);
        if ($str) {
            return date('Y-m-d 00:00:00', $weekDay);
        } else {
            return $weekDay;
        }
    }
}
