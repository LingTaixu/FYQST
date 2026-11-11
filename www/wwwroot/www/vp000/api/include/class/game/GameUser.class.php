<?php
ini_set('memory_limit', '8024M');
//ini_set('max_execution_time', '0');
if(!defined('ACCESS')) {exit('Access denied.');}

class GameUser extends GameBase {
    private static $table_name = 'uw_user';      // 角色表

    private static $columns =  array('id', 'accountId', 'nickName', 'gold', 'diamond','giveDiamond','buyDiamond', 'lvl','lastUpdateTime', 'createTime',
        'vipScore','dScore','signName','prestige','sdkChannelId','serverIndexId','expc', 'combat', 'vip', 'honor','bag','equipBag','exData','genuineQi',
        'propertyData','heroData','medalExData','medalDoneData','rebirthLvl','rebirthExp','highPaTa','employData','achieveLvl','achieveExp','cybLvl','cybExp','jxLvl','jxExp','heroNum','channelId');

    public static function getTableName(){
        return self::$table_name;
    }

    public static function  count($serverId, $params = []){
        $db=self::__instance2($serverId);
        $sub_condition = array();
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sub_condition['createTime[>=]'] = $startTime;
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sub_condition['createTime[<]'] = $endTime;
        }
        $isUser = $params['isUser'];
        if (!empty($isUser)) {
            $sub_condition['accountId[!]'] = 0;
            $sub_condition['robotId'] = 0;
        }
        $condition = array();
        if (!empty($sub_condition)) {
            $condition["AND"] = $sub_condition;
        }
        return $db->count(self::getTableName(), 'id', $condition);
    }

    public static function getUserList($serverId, $params = []) {
        $db = self::__instance2($serverId);
        $sql = "select id,accountId,createTime,serverId,nickName,lvl,combat,channelId,sdkChannelId from uw_user where accountId !=0 and robotId=0 ";
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and createTime >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and createTime < '$endTime'";
        }
        $sql .= " order by createTime desc ";
        $pageNo = $params['pageNo'];
        $pageSize = $params['pageSize'];
        if ($pageSize) {
            $sql .= " limit $pageNo,$pageSize";
        }
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    // 通过昵称查询角色基本信息
    public static  function getUserByNick($nick){
        if (! $nick) {
            return false;
        }
        $db=self::__instance();
        $condition['nickName'] = $nick;
        $list = $db->select ( self::getTableName(), self::$columns, $condition );
        if ($list) {
            $ret = array();
            foreach($list as $k=>$v){
                $row = $v;
                $ret[] = $row;
            }
            //var_dump($ret[0]);
            return $ret[0];
        }
        return array ();
    }

    // 通过游戏角色uid查询角色基本信息
    public static function getRoleByUid($id){
        if (! $id || ! is_numeric ( $id )) {
            return false;
        }
        $db=self::__instance();
        $condition['id'] = $id;
        $list = $db->select ( self::getTableName(), self::$columns, $condition );
        if ($list) {
            $ret = array();
            foreach($list as $k=>$v){
                $row = $v;
                $ret[] = $row;
            }
            return $ret[0];
        }
        return array ();
    }

    public static function getServerRoleByUid($serverId, $id)
    {
        if (!$id) {
            return false;
        }
        $db = self::__instance2($serverId);
        $condition['id'] = $id;
        $list = $db->select(self::getTableName(), self::$columns, $condition);
        if ($list) {
            $ret = array();
            foreach ($list as $k => $v) {
                $ret[$v['id']] = $v;
            }
            return $ret;
        }
        return array();
    }

    // 通过游戏账号uid查询角色基本信息
    public static function getRoleByAccountid($accId){
        if (! $accId || ! is_numeric ( $accId )) {
            return false;
        }
        $db=self::__instance();
        $condition['accountId'] = $accId;
        $list = $db->select ( self::getTableName(), self::$columns, $condition );
        if ($list) {
            $ret = array();
            foreach($list as $k=>$v){
                $row = $v;
                $ret[] = $row;
            }
            return $ret[0];
        }
        return array ();
    }

    public static function getServerRoleByAccountId($serverId, $accountId)
    {
        if (!$accountId) {
            return false;
        }
        $db = self::__instance2($serverId);
        $condition['accountId'] = $accountId;
        $list = $db->select(self::getTableName(), self::$columns, $condition);
        if ($list) {
            $ret = array();
            foreach ($list as $k => $v) {
                $ret[$v['accountId']] = $v;
            }
            return $ret;
        }
        return array();
    }

    public static function updateRoleInfo($uid,$update_data) {
        if (! $update_data || ! is_array ( $update_data )) {
            return false;
        }
        $db=self::__instance();
        $condition=array("id"=>$uid);
        $id = $db->update ( self::getTableName(), $update_data, $condition );
        return $id;
    }

    public static function getLoseUser($interday) {

        $inday = intval($interday);
        $inday = -$inday;
        $db=self::__instance();
        $sql = "select id, lastUpdateTime, nickName, lvl from ".self::getTableName()." where accountId != 0 and lastUpdateTime < ADDDATE(NOW(), $inday);";
        $list = $db->query ( $sql )->fetchAll();
        $ret = array();

        if ($list) {
            foreach($list as $k=>$v){
                $row = array();
                $row["char_id"] = $v["id"];
                $row["logout_time"] = $v["lastUpdateTime"];
                $row["name"] = $v["nickName"];
                $row["level"] = $v["lvl"];
                $ret[] = $row;
            }
            return $ret;
        }
        return $ret;
    }

    public static function getLoseLv( $interday) {
        $inday = intval($interday);
        $inday = -$inday;
        $db=self::__instance();
        $sql = " select count(*) as num, lvl from ".self::getTableName()." where accountId != 0 and lastUpdateTime < ADDDATE(NOW(), $inday) group by lvl;";
        $list = $db->query ( $sql )->fetchAll();
        $ret = array();
        if ($list) {
            foreach($list as $k=>$v){
                $row = array();
                $row["level"] = $v["lvl"];
                $row["num"] = $v["num"];
                $ret[] = $row;
            }
            return $ret;
        }
        return $ret;
    }

    public static function getRelUserList($serverId) {
        $db=self::__instance2($serverId);
        $sub_condition['accountId[!]'] = 0;
        $condition["AND"] = $sub_condition;
        $condition["ORDER"]=" id desc";

        $list = $db->select ( self::getTableName(), ['id'], $condition);

        $ret = array();

        if ($list) {
            $ret = $list;
        }
        return $ret;
    }

    //  查看 uw_user 表里的 AUTO_INCREMENT 起始段
    public static function getAutoIncrementId($serverId){
        $db=self::__instance2($serverId);
        $db_name = getGameDBName($serverId);
        $sql = "select auto_increment as incId from information_schema.tables where table_schema='".$db_name."' and table_name='uw_user'";
        $list = $db->query($sql)->fetchAll();
        if ($list){
            return $list[0]['incId'];
        }
    }

    public static function checkRobotInUser($serverId){
        $db=self::__instance2($serverId);
        $sql = "select count(id) as num from ".self::getTableName()."  where accountId = 0 and robotId > 0";
        $list = $db->query($sql)->fetchAll();
        if ($list){
            return $list[0]['num'];
        }
    }

    public static function checkRobotInPkOut($serverId){
        $db=self::__instance2($serverId);
        $sql = "select count(id) as num from uw_pkout";
        $list = $db->query($sql)->fetchAll();
        if ($list){
            return $list[0]['num'];
        }
    }

    public static function checkRobotInArena($serverId){
        $db=self::__instance2($serverId);
        $sql = "select count(id) as num from uw_arena";
        $list = $db->query($sql)->fetchAll();
        if ($list){
            return $list[0]['num'];
        }
    }

    public static function getRolesByUids($serverId, $uids)
    {
        $db = self::__instance2($serverId);
        $table = self::getTableName();
        $sql = "select id,accountId,nickName,gold from {$table} where 1=1 ";
        if (!empty($uids)) {
            if (is_array($uids)) {
                $uidStr = join(',', $uids);
                $sql .= " and id in ($uidStr)";
            }
        }
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        $data = array();
        if ($list) {
            foreach ($list as $item) {
                $uid = $item['id'];
                $data[$uid] = $item;
            }
        }
        return $data;
    }

    public static function getAllUsersByDate($serverId, $params = [])
    {
        $db = self::__instance2($serverId);
        $sql = "select DATE_FORMAT(createTime,'%Y-%m-%d') as theDate,count(id) as num,serverId from uw_user where accountId !=0 ";
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

    public static function getUserByDate($serverId, $params = [])
    {
        $db = self::__instance2($serverId);
        $sql = "select id,accountId,DATE_FORMAT(createTime,'%Y-%m-%d') as theDate,createTime,lastUpdateTime,nickName,lvl from uw_user where accountId !=0";
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and createTime >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and createTime < '$endTime'";
        }
        $channels = $params['channels'];
        if ($channels && is_array($channels)) {
            $str = join(',', $channels);
            if ($str) {
                $sql .= " and channelId in ($str)";
            }
        }
        $sdkChannels = $params['sdkChannels'];
        if ($sdkChannels && is_array($sdkChannels)) {
            $str = join(',', $sdkChannels);
            if ($str) {
                $sql .= " and sdkChannelId in ($str)";
            }
        }
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
//        $result = $db->query($sql);
//        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
//            yield $row;
//        }
    }

    public static function getUserByDateForAllTotal($serverId, $params = [])
    {
        $db = self::__instance2($serverId);
        $sql = "select id,accountId,DATE_FORMAT(createTime,'%Y-%m-%d') as theDate from uw_user where accountId !=0";
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and createTime >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and createTime < '$endTime'";
        }
        $channels = $params['channels'];
        if ($channels && is_array($channels)) {
            $str = join(',', $channels);
            if ($str) {
                $sql .= " and channelId in ($str)";
            }
        }
        $sdkChannels = $params['sdkChannels'];
        if ($sdkChannels && is_array($sdkChannels)) {
            $str = join(',', $sdkChannels);
            if ($str) {
                $sql .= " and sdkChannelId in ($str)";
            }
        }
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
//        $result = $db->query($sql);
//        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
//            yield $row;
//        }
    }

    public static function getExData($serverId, $params = [])
    {
        $db = self::__instance2($serverId);
        $sql = "select id,accountId,lvl,DATE_FORMAT(createTime,'%Y-%m-%d %H:%i:%s') day,lastUpdateTime,nickName,exData from uw_user where accountId !=0";
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and createTime >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and createTime < '$endTime'";
        }
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getUserByLastTime($serverId, $params = [])
    {
        $db = self::__instance2($serverId);
        $sql = "select id,accountId,DATE_FORMAT(createTime,'%Y-%m-%d') as createDay,lastUpdateTime,serverId,nickName,lvl,diamond,highPaTa,achieveLvl,achieveExp,combat,activity 
        from uw_user where accountId !=0 ";
        $lastTime = $params['lastTime'];
        if ($lastTime) {
            $sql .= " and UNIX_TIMESTAMP(lastUpdateTime) < $lastTime";
        }
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and createTime >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and createTime < '$endTime'";
        }
        $sql .= " group by createDay,id order by createTime asc";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function updateRoleInfoByApi($serverId, $params)
    {
        $serviceUrl = getGameServiceUrl($serverId);
//        $p = [
//            "_0" => json_encode($params)
//        ];
        $para = json_encode($params);
        $url = $serviceUrl."/?r=admin.gm.a&a=".$para."&s=0&c=0&ak=".GAME_SERVER_ADMKEY;
        Common::curlGet($url);
    }
}
