<?php
if(!defined('ACCESS')) {exit('Access denied.');}
//| uw_notice | CREATE TABLE `uw_notice` (
//`id` int(11) NOT NULL AUTO_INCREMENT COMMENT '序号',
//  `title` varchar(50) DEFAULT NULL COMMENT '标题',
//  `content` text COMMENT '内容',
//  `serverIdArr` text COMMENT '服务器id组,[]长度为0时为全服',
//  `isOpen` int(2) DEFAULT '0' COMMENT '是否开启,0：不开启，1：开启',
//  `updateTime` datetime DEFAULT NULL COMMENT '更新时间',
//  `iconType` int(2) DEFAULT '0' COMMENT 'icon类型',
//  `noticeTime` datetime DEFAULT NULL COMMENT '公告时间',
//  `startTime` datetime DEFAULT NULL COMMENT '开始时间',
//  `endTime` datetime DEFAULT NULL COMMENT '结束时间',
//  `sort` int(6) DEFAULT '0' COMMENT '排序',
//  `exData` text COMMENT '公告额外信息',
//  PRIMARY KEY (`id`)
//) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8 COMMENT='公告' |

//   iconType=3 公告通知
//	iconType=2 活动咨询
//	iconType=4 跨服战况
class GameNotice extends MainBase {
    private static $table_name = 'uw_notice';      // 公告表

    private static $columns =  array('id', 'title','content','serverIdArr', 'isOpen', 'updateTime', 'iconType', 'noticeTime', 'startTime', 'endTime', 'sort', 'exData');

    public static function getTableName(){
        return self::$table_name;
    }

    public static function  count($iconType = null){
        $db=self::__instance();
        $condition=array();
        $sub_condition = array();

        if($iconType != ""){
            $sub_condition['iconType'] = $iconType;
        }

        if(empty($sub_condition)){
            $condition = array();
        }else{
            $condition["AND"] = $sub_condition;
        }

        $num = $db->count ( self::getTableName(),$condition);
        return $num;
    }

    public static function getNoticeList($iconType = null, $start,$page_size){
        $db=self::__instance();

        $condition=array();
        $sub_condition = array();
        if($iconType != "")
            $sub_condition['iconType'] = $iconType;

        if(empty($sub_condition)){
            $condition = array();
        }else{
            $condition["AND"] = $sub_condition;
        }

        $condition["ORDER"]=" id desc";
        $condition['LIMIT']=array($start,$page_size);

        $list = $db->select ( self::getTableName(), self::$columns, $condition);

        $ret = array();

        if ($list) {
            global $GAMENOTICE_QUERY_TYPE;
            $isOpenConfig = [0=>'不开启',1=>'开启'];
            foreach ($list as $k=>$v){
                $v['iconType'] = $GAMENOTICE_QUERY_TYPE[$v['iconType']];
                $v['isOpen'] = $isOpenConfig[$v['isOpen']];
                $ret[] = $v;
            }
        }
        return $ret;
    }
    public static function getNoticeById($id) {
        if (! $id || ! is_numeric ( $id )) {
            return false;
        }
        $db=self::__instance();
        $condition = array("id" => $id);
        $result = $db->select ( self::getTableName(), self::$columns,$condition );
        if($result){
            $result[0]["serverIdArr"] = json_decode($result[0]["serverIdArr"]);
            return $result[0];
        }
        return array();
    }

    public static function delNotice($id) {
        if (! $id || ! is_numeric ( $id )) {
            return false;
        }
        $db=self::__instance();
        $condition = array("id" => $id);
        $result = $db->delete ( self::getTableName(), $condition );
        return $result;
    }

    public static function addNotice($data) {
        if (! $data || ! is_array ( $data )) {
            return false;
        }
        $db=self::__instance();
        $id = $db->insert ( self::getTableName(), $data );
        return $id;
    }

    public static function updateNotice($id,$data) {

        if (! $data || ! is_array ( $data )) {
            return false;
        }
        $db=self::__instance();
        $condition=array("id"=>$id);
//        echo self::getTableName();
//        echo '<br />';
//        var_dump($data);
//        echo '<br />';
//        var_dump($condition);
//        echo '<br />';
//        exit();
        $result = $db->update ( self::getTableName(), $data, $condition );
        return $result;
    }

}
