<?php
if(!defined('ACCESS')) {exit('Access denied.');}

class GameCopyProgress extends GameBase {
//| uw_copy_progress | CREATE TABLE `uw_copy_progress` (
//`id` int(11) NOT NULL AUTO_INCREMENT,
//  `userId` int(11) NOT NULL COMMENT '用户id',
//  `copyType` int(2) DEFAULT NULL COMMENT '副本类型',
//  `pCopyId` int(11) NOT NULL COMMENT '主副本id',
//  `winningStreak` int(4) DEFAULT '0' COMMENT '连胜',
//  `pTime` datetime DEFAULT NULL COMMENT '主副本挑战时间',
//  `copyObj` text COMMENT '已通关子副本列表{子副本id:节点,子副本id:节点...}',
//  `refreshTime` datetime DEFAULT NULL COMMENT '最后一次通关子副本时间',
//  `timeArr` text COMMENT '子副本挑战时间列',
//  `copyStar` text COMMENT '子副本星级',
//  `finished` int(1) DEFAULT '0' COMMENT '主副本是否已经通过',
//  `isPickAward` varchar(256) DEFAULT NULL COMMENT '是否领取通关奖励[0,0,1]',
//  `isPickChests` varchar(256) DEFAULT NULL COMMENT '是否领取通关宝箱[0,0,1]',
//  `timesPerDay` text COMMENT '子副本剩余次数',
//  `resetCounts` text COMMENT '购买次数{id:次数,id:次数...}',
//  `resetTime` datetime DEFAULT NULL COMMENT '购买时间',
//  `readObj` text COMMENT '查看数据{副本id:是否阅读}',
//  PRIMARY KEY (`id`,`userId`),
//  KEY `uw_copy_progress_uid` (`userId`)
//) ENGINE=InnoDB AUTO_INCREMENT=272974 DEFAULT CHARSET=utf8 COMMENT='副本进度' |

    private static $table_name = 'uw_copy_progress';      // 副本进度表

    private static $columns =  array('id','userId','copyType','pCopyId','winningStreak','pTime','copyObj','refreshTime','timeArr','copyStar','finished','isPickAward','isPickChests','timesPerDay','resetCounts','resetTime','readObj');

    public static function getTableName(){
        return self::$table_name;
    }

    public static function count($serverId, $params)
    {
        $db = self::__instance2($serverId);
        $sub_condition = [];
        if (isset($params['copyType'])) {
            $sub_condition['copyType'] = $params['copyType'];
        }
        if(empty($sub_condition)){
            $condition = [];
        }else{
            $condition["AND"] = $sub_condition;
        }
        return $db->count(self::getTableName(), ['id'], $condition);
    }

    //设置副本进度
    public static function updateCopyProgress($uid,$update_data,$copyType = 0) {
        if (! $update_data || ! is_array ( $update_data )) {
            return false;
        }
        $db=self::__instance();

        $condition=array();
        $sub_condition = array();

        $sub_condition['copyType'] = $copyType;
        $sub_condition['userId'] = $uid;

        if(empty($sub_condition)){
            $condition = array();
        }else{
            $condition["AND"] = $sub_condition;
        }

        $id = $db->update ( self::getTableName(), $update_data, $condition );
        return $id;
    }

    //获取副本进度
    public static function getCopyProgressByUid($uid,$copyType = 0) {
        if (! $uid || ! is_numeric ( $uid )) {
            return false;
        }
        $db=self::__instance();

        $condition=array();
        $sub_condition = array();

        if (is_numeric($copyType)) {
            $sub_condition['copyType'] = $copyType;
        }
        if (is_array($copyType)) {
            $sub_condition['copyType'] = $copyType;
        }

        $sub_condition['userId'] = $uid;

        if(empty($sub_condition)){
            $condition = array();
        }else{
            $condition["AND"] = $sub_condition;
        }

        $list = $db->select ( self::getTableName(), self::$columns, $condition );
        if ($list) {
            if (is_numeric($copyType)) {
                return $list[0];
            } else {
                return $list;
            }
        }
        return array ();
    }

    public static function getList($serverId, $columns = [], $subCondition = [])
    {
        $db = self::__instance2($serverId);
        if (empty($columns)) {
            $columns = self::$columns;
        }
        $condition["AND"] = $subCondition;

        $list = $db->select(self::getTableName(), $columns, $condition);
        return $list;
    }

    public static function getProgressObjUsers($serverId, $params = [])
    {
        $db = self::__instance2($serverId);
        $sql = "select a.guan,count(a.userId) as num from(select  userId, SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING_INDEX(copyObj,',',-1),'\"',2),'\"',-1)+0 guan 
                from " . self::getTableName() . " where copyObj != '{}' ";
        $copyType = $params['copyType'];
        if (is_numeric($copyType)) {
            $sql .= " and copyType = $copyType";
        }
        $sql .= " order by guan desc)a group by a.guan;";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getProgressStarUsers($serverId, $params = [])
    {
        $db = self::__instance2($serverId);
        $sql = "select a.guan,count(a.userId) as num from(select  userId, SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING_INDEX(copyStar,',',-1),'\"',2),'\"',-1)+0 guan 
                from " . self::getTableName() . " where copyStar != '{}' ";
        $copyType = $params['copyType'];
        if (is_numeric($copyType)) {
            $sql .= " and copyType = $copyType";
        }
        $sql .= " order by guan desc)a group by a.guan;";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    /**
     * 获取爬塔人数
     * @param $serverId
     * @param array $params
     * @return mixed
     */
    public static function getTotalUserNum($serverId, $params = [])
    {
        $db = self::__instance2($serverId);
        $sql = "select a.guan,count(a.userId) as num from(select  userId, SUBSTRING_INDEX(SUBSTRING_INDEX(copyObj,',\"',-1),'\":',1)+0 guan 
                from " . self::getTableName() . " where copyObj != '{}' ";
        $copyType = $params['copyType'];
        if (is_numeric($copyType)) {
            $sql .= " and copyType = $copyType";
        }
        $sql .= " order by guan desc)a group by a.guan;";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    /**
     * 获取爬塔人id
     * @param $serverId
     * @param array $params
     * @return mixed
     */
    public static function getTotalUsers($serverId, $params = [])
    {
        $db = self::__instance2($serverId);
        $sql = "select  userId, SUBSTRING_INDEX(SUBSTRING_INDEX(copyObj,',\"',-1),'\":',1)+0 guan 
                from " . self::getTableName() . " where copyObj != '{}' ";
        $copyType = $params['copyType'];
        if (is_numeric($copyType)) {
            $sql .= " and copyType = $copyType";
        }
        $sql .= " order by guan desc";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }
}