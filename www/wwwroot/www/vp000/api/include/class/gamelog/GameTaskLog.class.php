<?php
if(!defined('ACCESS')) {exit('Access denied.');}
class GameTaskLog extends GameLogBase{

    private static $table_name = 'task_log';

    private static $columns = array('id', 'created', 'server_id', 'rtime', 'user_id','nick_name', 'lvl','task_type','c_task_type','task_id','task_name');

    private static $HOUR_SEC = 3600;

    public static function getTableName($server_id){
        //return self::$table_name;
        return self::$table_name."_".$server_id;
    }

//    public static function getLastTaskListByUids($server_id, $start,$page_size, $uids) {
//
//        //select c_task_type, user_id, nick_name, max(task_id), max(created) from task_log where task_type= 'achieve' group by c_task_type, user_id, nick_name;
//        $db=self::__instance();
//        $sql = "select last_task_id,count(user_id) from (select c_task_type, user_id, nick_name, max(task_id) as last_task_id, max(created) as last_created from task_log where task_type= 'achieve' group by c_task_type, user_id, nick_name) as tmp where  tmp.last_created > '2017-12-30 17:53:51' group by  tmp.last_task_id";
//
//        $list = $db->query ( $sql )->fetchAll();
//        $ret = array();
//        if ($list) {
//            foreach($list as $k=>$v){
//                $row = array();
//                $row["level"] = $v["lvl"];
//                $row["num"] = $v["num"];
//                $ret[] = $row;
//            }
//            return $ret;
//        }
//        return $ret;
//    }

    public static function getLastAchiveTaskList($server_id, $interday) {
        $inday = intval($interday);
        $inday = -$inday;
        $db=self::__instance();
//        $sql = "select c_task_type, user_id, nick_name, last_task_id, last_created from (
//select c_task_type, user_id, nick_name, max(task_id) as last_task_id, max(created) as last_created from task_log where task_type= 'achieve' group by c_task_type, user_id, nick_name
//) as last_tasklog where last_created <  ADDDATE(NOW(), $inday)";
        $sql = "select last_task_id,count(user_id) as num from (select c_task_type, user_id, nick_name, max(task_id) as last_task_id, max(created) as last_created from ".self::getTableName($server_id)." where task_type= 'achieve' group by c_task_type, user_id, nick_name) as tmp where  tmp.last_created  < ADDDATE(NOW(), $inday) group by  tmp.last_task_id";

        $list = $db->query ( $sql )->fetchAll();
        $ret = array();
        if ($list) {
            foreach($list as $k=>$v){
                $row = array();
                $row["task_id"] = $v["last_task_id"];
                $row["num"] = $v["num"];
                $ret[] = $row;
            }
            return $ret;
        }
        return $ret;
    }
}