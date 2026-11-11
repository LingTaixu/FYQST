<?php
if(!defined('ACCESS')) {exit('Access denied.');}
ini_set('memory_limit', '8024M');
//ini_set('max_execution_time', '0');

class GameAccount extends LoginBase {
    private static $table_name = 'uw_account';      // 账号表
//CREATE TABLE `uw_account` (
//`id` int(11) NOT NULL AUTO_INCREMENT COMMENT '序号',
//`name` varchar(50) DEFAULT NULL COMMENT '账号名',
//`email` varchar(64) DEFAULT NULL COMMENT '邮箱',
//`pwd` varchar(64) DEFAULT NULL COMMENT '密码',
//`deviceId` varchar(100) DEFAULT NULL COMMENT '机器码，设备唯一号',
//`status` int(2) DEFAULT '0' COMMENT '账号状态  0正常 ，1普通封号，2设备封号 3 测试账号  4 GM账号',
//`channelId` int(11) DEFAULT '0' COMMENT '渠道id',
//`sdkData` text COMMENT 'sdk数据',
//`exData` text COMMENT '扩展数据',
//`createTime` datetime DEFAULT NULL COMMENT '创建时间',
//`createIP` varchar(50) DEFAULT NULL COMMENT '创建ip',
//`lastUpdateTime` datetime DEFAULT NULL COMMENT '最后修改时间',
//`loginCount` int(11) DEFAULT '0',
//`loginKey` varchar(500) DEFAULT NULL COMMENT '登陆值',
//`userServers` text COMMENT '有角色的服务器组',
//`rechargeCom` varchar(100) DEFAULT NULL COMMENT '充值补偿',
//`sdkChannelId` varchar(20) DEFAULT NULL COMMENT 'sdk渠道号',
//`bendExpireAt` datetime DEFAULT NULL COMMENT '禁言过期时间',
//`bendType` int(11) DEFAULT '0' COMMENT '禁言类型，第一位为普通',
//PRIMARY KEY (`id`),
//KEY `uw_account_name` (`name`)
//) ENGINE=InnoDB AUTO_INCREMENT=442 DEFAULT CHARSET=utf8mb4 COMMENT='游戏-账号'
    private static $columns =  array('id', 'name', 'email', 'pwd', 'deviceId', 'status', 'channelId', 'sdkData', 'exData', 'createTime','createIP','lastUpdateTime','loginCount','loginKey','userServers','rechargeCom','sdkChannelId','bendExpireAt','bendType');

    public static function getTableName(){
        return self::$table_name;
    }

    public static function  count($type = null){
        $db=self::__instance();
        $condition=array();
        $sub_condition = array();
        if($type == 1){//封号
            $sub_condition['status'] = [1,2];
            $condition["OR"] = $sub_condition;
        }elseif($type ==2){
            $sub_condition["bendExpireAt[<>]"] = [date("Y-m-d h:i:s"), date("Y-m-d", mktime(0, 0, 0, 1, 1, 2217))];
            $condition["AND"] = $sub_condition;
        }
        $num = $db->count ( self::getTableName(),$condition);
        return $num;
    }

    public static function getList($type = null, $start,$page_size){
        $db=self::__instance();
        $ret = array();
        $condition=array();
        $sub_condition = array();
//        if($type == 1){//封号
//            $sql = "select * from ".self::getTableName()." where status = 1 or status = 2  order by id desc";
//        }elseif($type == 2){
//            $time = date("Y-m-d h:i:s");
//            $sql = "select * from ".self::getTableName()." where bendExpireAt > '$time'  order by id desc";
//            $sub_condition['bendExpireAt'] = 1;
//        }
        //var_dump("getList Type:".$type);
        if($type == 1){//封号
            $sub_condition['status'] = [1,2];
            $condition["OR"] = $sub_condition;
        }elseif($type ==2){
            $sub_condition['bendType[>]'] = 0;
            $sub_condition["bendExpireAt[<>]"] = [date("Y-m-d h:i:s"), date("Y-m-d", mktime(0, 0, 0, 1, 1, 2217))];
            $condition["AND"] = $sub_condition;
        }
        $condition["ORDER"]=" id desc";
        $condition['LIMIT']=array($start,$page_size);
        $list = $db->select ( self::getTableName(), self::$columns, $condition);

        if ($list) {
            //$statusCfg = [0=>'正常',1=>'普通封号',2=>'设备封号', 3=>'测试账号',  4=>'GM账号'];
            global $BAN_STATUS_TYPE;
            foreach ($list as $k=>$v){
                //$v['status'] = $BAN_STATUS_TYPE[$v['status']];
                self::setAccountBanInfo($v);
                $ret[] = $v;
            }
        }
        return $ret;
    }

    public static function getAccount()
    {
        $db=self::__instance();
        $sql = "select id,channelId,DATE_FORMAT(createTime,'%Y-%m-%d') day,sdkChannelId,userServers,name from " . self::getTableName();
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        $data = array();
        foreach ($list as $row) {
            $data[$row['id']] =  $row;
        }
        return $data;
    }

    public static function getAccountForAllTotal()
    {
        $db=self::__instance();
        $sql = "select id,DATE_FORMAT(createTime,'%Y-%m-%d') day from " . self::getTableName();
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        $data = array();
        foreach ($list as $row) {
            $data[$row['id']] =  $row;
        }
        return $data;
    }

    public static function getInfoById($id) {
        if (! $id || ! is_numeric ( $id )) {
            return false;
        }
        $db=self::__instance();
        $condition = array("id" => $id);
        $result = $db->select ( self::getTableName(), self::$columns,$condition );
        if($result){
            return $result[0];
        }
        return array();
    }
    public static function getInfoByAccount($account) {
        if (! $account  ) {
            return false;
        }
        $db=self::__instance();
        $condition = array("name" => $account);
        $result = $db->select ( self::getTableName(), self::$columns,$condition );
        if($result){
            return $result[0];
        }
        return array();
    }

    public static function delById($id) {
        if (! $id || ! is_numeric ( $id )) {
            return false;
        }
        $db=self::__instance();
        $condition = array("id" => $id);
        $result = $db->delete ( self::getTableName(), $condition );
        return $result;
    }

    public static function add($data) {
        if (! $data || ! is_array ( $data )) {
            return false;
        }
        $db=self::__instance();
        $id = $db->insert ( self::getTableName(), $data );
        return $id;
    }

    public static function update($id,$data) {

        if (! $data || ! is_array ( $data )) {
            return false;
        }
        $db=self::__instance();
        $condition=array("id"=>$id);

        $result = $db->update ( self::getTableName(), $data, $condition );
        return $result;
    }

    public static function bendAccountList($accounts) {
        if (! $accounts || ! is_array ( $accounts )) {
            return false;
        }
        $accounts = "('".join("','",$accounts)."')";
        $sql = "UPDATE uw_account SET bendType=1,  bendExpireAt = DATE_ADD(NOW(),INTERVAL 2 HOUR ) WHERE name IN ".$accounts;
        $db=self::__instance();
        $result = $db->exec($sql);
        return $result;
    }

    public static function removeBendByAccId($accid) {
        if (! $accid ) {
            return false;
        }
        $sql = "UPDATE uw_account SET bendType=0,  bendExpireAt = NULL  WHERE id = $accid ";
        $db=self::__instance();
        $result = $db->exec($sql);
        return $result;
    }

    //解除禁言
    public static function removeBend($accounts) {
        if (! $accounts || ! is_array ( $accounts )) {
            return false;
        }
        $accounts = "('".join("','",$accounts)."')";
        $sql = "UPDATE uw_account SET bendType=0, bendExpireAt = NOW()  WHERE name IN ".$accounts;
        echo json_encode($sql);
        $db=self::__instance();
        $result = $db->exec($sql);
        return $result;
    }

    public static function sealAccountList ($accounts) {
        if (! $accounts || ! is_array ( $accounts )) {
            return false;
        }
        $accounts = "('".join("','",$accounts)."')";
        $sql = "UPDATE uw_account SET status = 1  WHERE name IN ".$accounts;
        $db=self::__instance();
        $result = $db->exec($sql);
        return $result;
    }

    public static function removeSeal ($accounts) {
        if (! $accounts || ! is_array ( $accounts )) {
            return false;
        }
        $accounts = "('".join("','",$accounts)."')";
        $sql = "UPDATE uw_account SET status = 0  WHERE name IN ".$accounts;
        $db=self::__instance();
        $result = $db->exec($sql);
        return $result;
    }

    public static function setAccountBanInfo(&$info){
        if ($info['status'] == 1 || $info['status'] == 2){
            $info["statusName"] = "已封停";
        }else{
            $info["statusName"] = "正常";
        }

        $tmNow = time();
        $bendExpire = strtotime($info['bendExpireAt']);

        if ($info['bendType'] != 1 && $tmNow < $bendExpire){
            $info["bendName"] = "已禁言";
        }else{
            $info["bendName"] = "正常";
        }
    }

    // 获得白名单用户 status  = 3
    public static function getWhiteList() {

        $db=self::__instance();
        $condition = array("status" => 3);
        $list = $db->select ( self::getTableName(), self::$columns,$condition );
        return $list;
    }

    // 设置白名单用户
    public static function setWhiteList($account, $channelId, $status) {
        $db=self::__instance();
        $sql = "UPDATE uw_account SET status = '$status'  WHERE name = '$account' and channelId = '$channelId'";
        $db=self::__instance();
        $result = $db->exec($sql);
        return $result;
    }

    /**
     * @param array $params
     * @return mixed
     */
    public static function getRegsByDate($params = [])
    {
        $db=self::__instance();
        $sql = "select DATE_FORMAT(createTime,'%Y-%m-%d') as regDate,count(id) as num from uw_account where 1=1";
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
        if (!empty($sdkChannels) && is_array($sdkChannels)) {
            $str = join(',', $sdkChannels);
            if ($str) {
                $sql .= " and sdkChannelId in ($str)";
            }
        }
        $sql .= " group by regDate";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);

        return $list;
    }

    /**
     * 根据渠道，时间查注册
     * @param array $params
     * @return mixed
     */
    public static function getRegsByDateChannel($params = [])
    {
        $db=self::__instance();
        $sql = "select DATE_FORMAT(createTime,'%Y-%m-%d') as regDate,count(id) as num,channelId,sdkChannelId from uw_account where 1=1";
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
            $sql .= " and channelId in ($str)";
        }
        $sdkChannels = $params['sdkChannels'];
        if ($sdkChannels && is_array($sdkChannels)) {
            $str = join(',', $sdkChannels);
            $sql .= " and sdkChannelId in ($str)";
        }
        $sql .= " group by channelId,sdkChannelId,regDate";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);

        return $list;
    }
}
