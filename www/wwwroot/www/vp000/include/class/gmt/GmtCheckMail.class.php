<?php
if(!defined('ACCESS')) {exit('Access denied.');}

class GmtCheckMail extends Base {
//CREATE TABLE `check_mail` (
//`id` int(11) NOT NULL AUTO_INCREMENT COMMENT '序号',
//`userId` int(11) DEFAULT NULL COMMENT '用户id',
//`type` int(4) DEFAULT NULL COMMENT '类型',
//`platform` varchar(50) DEFAULT NULL COMMENT '平台',
//`serverId` int(11) DEFAULT '0' COMMENT '区服',
//`fromName` varchar(50) DEFAULT NULL COMMENT '发送者',
//`title` varchar(50) DEFAULT NULL COMMENT '标题',
//`content` text COMMENT '内容',
//`replaceArgs` varchar(100) DEFAULT NULL COMMENT '替换值',
//`items` text COMMENT '附件物品',
//`isPicked` int(2) DEFAULT '0' COMMENT '是否提取物品',
//`isRead` int(2) DEFAULT '0' COMMENT '是否阅读',
//`delHours` int(6) DEFAULT NULL COMMENT '操作后几小时删除',
//`delTime` datetime DEFAULT NULL COMMENT '删除时间',
//`expireTime` datetime DEFAULT NULL COMMENT '过期时间',
//`addTime` datetime DEFAULT NULL COMMENT '添加时间',
//`isDelete` int(2) DEFAULT '0',
//`taskId` int(11) NOT NULL DEFAULT '0',
//`isChecked` int(2) DEFAULT '0' COMMENT '是否通过审核',
//PRIMARY KEY (`id`),
//KEY `uw_mail_uid` (`userId`)
//) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4 COMMENT='邮件'
    private static $table_name = 'check_mail';      // 邮件表

    private static $columns =  array('id', 'userId', 'nickName','type','platform', 'serverId','fromName', 'title', 'content', 'replaceArgs', 'items', 'isPicked',
        'isRead','delHours','delTime','expireTime','addTime','isDelete','taskId','isChecked');

    public static function getTableName(){
        return self::$table_name;
    }

    public static function insertMail($data) {
        if (! $data || ! is_array ( $data )) {
            return false;
        }
        $db=self::__instance();
        $id = $db->insert ( self::getTableName(), $data );
        return $id;
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
    public static function update($id,$data) {

        if (! $data || ! is_array ( $data )) {
            return false;
        }
        $db=self::__instance();
        $condition=array("id"=>$id);

        $result = $db->update ( self::getTableName(), $data, $condition );
        return $result;
    }

    public static function  count($uid,$platform,$serverId){
        $db=self::__instance();
        $condition=array();
        $sub_condition = array();

        if($platform != ""){
            $sub_condition['platform'] = $platform;
        }
        if($serverId != ""){
            $sub_condition['serverId'] = $serverId;
        }
        if($uid != ""){
            $sub_condition['userId'] = $uid;
        }

        if(empty($sub_condition)){
            $condition = array();
        }else{
            $condition["AND"] = $sub_condition;
        }

        $num = $db->count ( self::getTableName(),$condition);
        return $num;
    }

    public static function getMailList($uid,$platform,$serverId, $start,$page_size){
        $db=self::__instance();
        $condition=array();
        $sub_condition = array();
        if($platform != ""){
            $sub_condition['platform'] = $platform;
        }
        if($serverId != ""){
            $sub_condition['serverId'] = $serverId;
        }
        if($uid != ""){
            $sub_condition['userId'] = $uid;
        }


        if(empty($sub_condition)){
            $condition = array();
        }else{
            $condition["AND"] = $sub_condition;
        }

        $condition["ORDER"]=" id desc";
        $condition['LIMIT']=array($start,$page_size);

        $list = $db->select ( self::getTableName(), self::$columns, $condition);
        $ret = array();
        global $CONFIG_MAIL, $CONFIG_ITEM;
        if ($list) {
            $ret = array();
            $checkedCfg = ['未审核','<span style="color:green">已审核通过</span>','<span style="color:red">审核未通过</span>'];
            foreach($list as $k=>$v){
                $row = $v;
                $mail = $CONFIG_MAIL[$v['type']];
                if(isset($mail)){
                    $row['fromName'] = $mail['fromName'];
                    $row['title'] =  $mail['title'];
                    $replaceArgs =  json_decode($row['replaceArgs'], true);
                    $content = vsprintf($mail['content'],  $replaceArgs);
                    $row['content'] = $content;
                }

                $items = json_decode($row['items'], true);
                $bagInfo = array();
                foreach($items as $k=>$v){
                    $item = $CONFIG_ITEM[$k]['name']." * ".$v;
                    $bagInfo[] = $item;
                }
                $bags = join("|",$bagInfo);
                $row['items'] = $bags;
                $row['isChecked'] =$checkedCfg[$row['isChecked']];
                $ret[] = $row;
            }

            return $ret;
        }

        return array ();
    }

}
