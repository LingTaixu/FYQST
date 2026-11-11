<?php
if(!defined('ACCESS')) {exit('Access denied.');}
/**
 * Created by PhpStorm.
 * User: mmobay1710
 * Date: 2018/8/14
 * Time: 下午7:06
 */

class SpanServersChatGroup extends MainBase {
    private static $table_name = 'uw_servers_group';//跨服聊天分组表

    private static $columns =  array('id', '`type`', '`name`', 'serverArr', 'isDelete', '`case`');

    public static function getTableName(){
        return self::$table_name;
    }

    public static function  count($type = null){
        $db=self::__instance();
        $condition=array();
        $sub_condition = array();
        if($type != ""){
            $sub_condition['type'] = $type;
            $condition["AND"] = $sub_condition;
        }
        $num = $db->count ( self::getTableName(),$condition);
        return $num;
    }

    public static function getList($params = []){
        $type = $params['type'];
        $start = $params['pageStart'];
        $page_size = $params['pageSize'];

        $db=self::__instance();
        $condition=array();
        $sub_condition = array();

        if($type && $type != ''){
            $sub_condition['type'] = $type;
        }
        if(!empty($sub_condition)){
            $condition["AND"] = $sub_condition;
        }

        $condition["ORDER"]=" id desc";
        if(!empty($start) && !empty($page_size)){
            $condition['LIMIT']=array($start,$page_size);
        }
        $list = $db->select ( self::getTableName(), self::$columns, $condition);
        return $list;
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

    public static function openServer($serverId){
        if(!is_numeric($serverId)) return;
        $params = [
            'type' => 1,
        ];
        $groupList = self::getList($params);
        $eachGroupNum = 2;
        foreach ($groupList as $k=>$row){
            $serverArr =json_decode($row['serverArr'],true);
            if(count($serverArr) < $eachGroupNum && !in_array($serverId,$serverArr)) {
                $id = $row['id'];
                array_push($serverArr,$serverId);
                $update_data['serverArr'] = json_encode($serverArr);
                $result =self::update($id,$update_data);
                return $result;
            }
        }

        //没有可以分配的组时 则新增一个组
        $serverArr = [$serverId];
        $input_data = array ('type'=> 1,'`name`' => '新增分组', 'serverArr' => json_encode($serverArr));
        $result =self::add($input_data);
        return $result;
    }
}