<?php
if(!defined('ACCESS')) {exit('Access denied.');}

class ChatLogs extends GameLogBase
{
    private static $table_name = 'chat_log';      // 聊天监控表
//CREATE TABLE `chat_logs` (
//  `id` int(11) NOT NULL AUTO_INCREMENT,
//  `userId` int(11) NOT NULL,
//  `accountId` int(11) NOT NULL,
//  `nickName` varchar(50) NOT NULL DEFAULT '' COMMENT '角色名称',
//  `serverId` int(11) NOT NULL DEFAULT '0',
//  `type` int(11) NOT NULL DEFAULT '0',
//  `content` varchar(255) NOT NULL DEFAULT '' COMMENT '消息内容',
//  `chatTime` int(11) NOT NULL DEFAULT '0',
//  `created`  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
//  PRIMARY KEY (`id`),
//  KEY `idx_userId` (`serverId`,`userId`),
//  KEY `idx_name` (`serverId`,`nickName`)
//) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

    private static $columns =  array('id', 'user_id', 'account_id','account', 'nick_name', 'server_id', 'type', 'content', 'rtime', 'created');

    public static function getTableName(){
        return self::$table_name;
    }

    public static function  count($serverIdArr,$chat_type,$startTime,$endTime,$uid){
        $db=self::__instance();
        $condition=array();
        $sub_condition = array();
        if($chat_type != ""){
            $sub_condition['type'] = $chat_type;
        }
        if(!empty($startTime)){
            $sub_condition['rtime[>=]'] = $startTime;
        }
        if(!empty($endTime)){
            $sub_condition['rtime[<=]'] = $endTime;
        }
        if(!empty($uid)){
            $sub_condition['user_id'] = $uid;
        }
        if(is_array($serverIdArr) && count($serverIdArr) > 0){
            $sub_condition["OR"]['server_id'] = $serverIdArr;
        }

        if(!empty($sub_condition)){
            $condition["AND"] = $sub_condition;
        }
        $num = $db->count ( self::getTableName(),$condition);
        return $num;
    }

    public static function getList($serverIdArr,$chat_type,$startTime,$endTime,$uid, $start,$page_size){
        $db=self::__instance();

        $condition=array();
        $sub_condition = array();
        if($chat_type != "")
            $sub_condition['type'] = $chat_type;
        if(!empty($uid)){
            $sub_condition['user_id'] = $uid;
        }
        if(!empty($startTime)){
            $sub_condition['rtime[>=]'] = $startTime;
        }
        if(!empty($endTime)){
            $sub_condition['rtime[<=]'] = $endTime;
        }
        if(is_array($serverIdArr) && count($serverIdArr) > 0){
            $sub_condition["OR"]['server_id'] = $serverIdArr;
        }

        if(!empty($sub_condition)){
            $condition["AND"] = $sub_condition;
        }

        $condition["ORDER"]=" id desc";
        $condition['LIMIT']=array($start,$page_size);
        //var_dump($condition);
        $list = $db->select ( self::getTableName(), self::$columns, $condition);
        //var_dump($list);
        $ret = array();

        if ($list) {
            global $CHAT_TYPE;
            $serverIdArr = getServerListByPlatform();
            foreach ($list as $k=>$v){
                $v['type']= $CHAT_TYPE[$v['type']];
                $v['serverId']= $serverIdArr[$v['server_id']];
                $v['chatTime'] = date("Y-m-d H:i:s",$v['rtime']);
                $v['account']= $v['account'] ;
                $v['nickName']= $v['nick_name'] ;
                $v['userId'] = $v['user_id'];
                $ret[] =$v;
            }
        }
        return $ret;
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
}