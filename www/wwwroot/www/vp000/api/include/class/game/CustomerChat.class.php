<?php
if(!defined('ACCESS')) {exit('Access denied.');}

class CustomerChat extends MainBase
{
    private static $table_name = 'customer_chat_logs';      // 提问玩家用户账号

    private static $columns =  array('id', 'gamerole_id', 'admin_id','nickname', 'game_id', 'area', '`group`', 'role_id', 'open_id', 'vip_level', 'content', 'created');

    public static function getTableName(){
        return self::$table_name;
    }

    public static function  count($gamerole_id){

        $db=self::__instance();
        $condition=array();
        $sub_condition = array();

        if($gamerole_id != ""){
            $sub_condition['gamerole_id'] = $gamerole_id;
        }else{
            return 0;
        }

        if(empty($sub_condition)){
            $condition = array();
        }else{
            $condition["AND"] = $sub_condition;
        }

        $num = $db->count ( self::getTableName(),$condition);
        return $num;
    }

    public static function getList($gamerole_id,$start,$page_size)
    {
        $db = self::__instance();
        $condition = array();

        $sub_condition = array();

        if ($gamerole_id != "")
            $sub_condition['gamerole_id'] = $gamerole_id;

        if (!empty($sub_condition)) {
            $condition["AND"] = $sub_condition;
        }

        $condition["ORDER"] = " created desc";
        $condition['LIMIT'] = array($start, $page_size);

        $list = $db->select(self::getTableName(), self::$columns, $condition);
        $ret = array();
        if ($list) {
            $ret = array();
            foreach ($list as $k => $v) {
                $row = $v;
                if ($v['admin_id'] == 0){
                    $row['sender'] = $v["nickname"];
                }else{
                    $row['sender'] = "客服";
                }
                $ret[] = $row;
            }
            return $ret;
        }

        return array();
    }

    public static function kefuChat($data){
        if (! $data || ! is_array ( $data )) {
            return false;
        }
        $db=self::__instance();
        $id = $db->insert ( self::getTableName(), $data );
        return $id;
    }
}