<?php
if(!defined('ACCESS')) {exit('Access denied.');}
class GameOnlineNumLog extends GameLogBase{

    private static $table_name = 'onlinenum_log';

    private static $columns = array('id', 'created', 'server_id', 'rtime', 'num');

    private static $HOUR_SEC = 3600;

    public static function getTableName($server_id){
        //return self::$table_name;
        return self::$table_name."_".$server_id;
    }

    // 最后时间
    public static function lastTime ($server_id){
        $db=self::__instance();
        $sub_condition = array();
        if($server_id != ''){
            $sub_condition['server_id[=]']=$server_id;
        }

        if(empty($sub_condition)){
            $condition = array();
        }else{
            $condition["AND"] = $sub_condition;
        }
        $column = "rtime";
        return $db->max( self::getTableName($server_id),$column, $condition);
    }

    public static function count ($server_id,  $lasttime){
        $db=self::__instance();
        $sub_condition = array();
        if($server_id != ''){
            $sub_condition['server_id[=]']=$server_id;
        }
        if($lasttime != ''){
            $sub_condition['rtime[>]']=$lasttime - self::$HOUR_SEC;
        }

        if(empty($sub_condition)){
            $condition = array();
        }else{
            $condition["AND"] = $sub_condition;
        }

        $num = $db->count ( self::getTableName($server_id),$condition);
        return $num;
    }
    public static function getOnlineNum($server_id, $start,$page_size, $lasttime) {

        $db=self::__instance();

        $condition=array();
        $sub_condition = array();

        if($server_id != ""){
            $sub_condition['server_id'] = $server_id;
        }
        if($lasttime != ''){
            $sub_condition['rtime[>]']=$lasttime - self::$HOUR_SEC;
        }
        if(empty($sub_condition)){
            $condition = array();
        }else{
            $condition["AND"] = $sub_condition;
        }

        $condition["ORDER"]=" created desc";
        $condition['LIMIT']=array($start,$page_size);

        $list = $db->select ( self::getTableName($server_id), self::$columns, $condition);
        if(!empty($list)){
/*            foreach ($list as &$item){
                $item["c_op_time"] = date("Y-m-d H:i:s",$item["c_op_time"]);
                $item["minute"] = $v["YMinute"];
            }*/
            return array_reverse($list);
        }

        if ($list) {
            return $list;
        }
        return array ();
    }

    public static function getMaxOnline($serverId, $params = [])
    {
        $db = self::__instance();
        $sql = "select id,created,server_id,rtime,MAX(num) as maxNum from " . self::getTableName($serverId) . " where 1=1 ";
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and created >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and created < '$endTime'";
        }
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

}