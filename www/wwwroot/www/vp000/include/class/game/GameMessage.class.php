<?php
if(!defined('ACCESS')) {exit('Access denied.');}

class GameMessage extends MainBase {
    private static $table_name = 'uw_system_message';      // 系统消息表
//CREATE TABLE `uw_system_message` (
//`id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID',
//`serverId` int(11) DEFAULT '0' COMMENT '默认为0，所有服务器',
//`message` varchar(255) NOT NULL COMMENT '公告内容',
//`type` tinyint(4) NOT NULL DEFAULT '1' COMMENT '公告类型： \n1 marquee 跑马灯公告\n2 即时公告',
//`color` varchar(45) DEFAULT '#000000' COMMENT '字体颜色',
//`size` int(11) DEFAULT '16' COMMENT '字体大小',
//`status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '状态0未发送，1已发送',
//`times` int(11) DEFAULT '1' COMMENT '显示次数',
//`interval` int(11) DEFAULT '60' COMMENT '间隔时间秒为单位',
//`sendTime` datetime DEFAULT NULL,
//`expireTime` datetime DEFAULT NULL,
//`createTime` datetime DEFAULT NULL,
//`lastUpdateTime` datetime DEFAULT NULL,
//PRIMARY KEY (`id`)
//) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8 |
    private static $columns =  array('id', 'serverId', 'message', 'type', 'color', 'size', 'status', 'times', '`interval`', 'sendTime','expireTime','createTime','lastUpdateTime');

    public static function getTableName(){
        return self::$table_name;
    }

    public static function  count($type = null){
        $db=self::__instance();
        $condition=array();
        $sub_condition = array();

        if($type != ""){
            $sub_condition['type'] = $type;
        }

        if(empty($sub_condition)){
            $condition = array();
        }else{
            $condition["AND"] = $sub_condition;
        }

        $num = $db->count ( self::getTableName(),$condition);
        return $num;
    }

    public static function getMessageList($type = null, $start,$page_size){
        $db=self::__instance();

        $condition=array();
        $sub_condition = array();
        if($type != "")
            $sub_condition['type'] = $type;

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
            global $GAMEMESSAGE_QUERY_TYPE;
            $statusConfig = [0=>'未发送',1=>'已发送'];
            foreach ($list as $k=>$v){
                if($v['serverId'] == 0 ){
                    $v['serverId'] = '全服';
                }else{
                    $v['serverId'] = $v['serverId'].'服';
                }
                $v['type'] = $GAMEMESSAGE_QUERY_TYPE[$v['type']];//'公告类型： \n1 marquee 跑马灯公告\n2 即时公告',
                $v['status'] = $statusConfig[$v['status']];//'状态0未发送，1已发送',
                $ret[] = $v;
            }
        }
        return $ret;
    }
    public static function getMessageById($id) {
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

    public static function delMessage($id) {
        if (! $id || ! is_numeric ( $id )) {
            return false;
        }
        $db=self::__instance();
        $condition = array("id" => $id);
        $result = $db->delete ( self::getTableName(), $condition );
        return $result;
    }

    public static function addMessage($data) {
        if (! $data || ! is_array ( $data )) {
            return false;
        }
        $db=self::__instance();
        $id = $db->insert ( self::getTableName(), $data );
        return $id;
    }

    public static function updateMessage($id,$data) {

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
