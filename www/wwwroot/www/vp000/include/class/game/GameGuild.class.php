<?php
if(!defined('ACCESS')) {exit('Access denied.');}

class GameGuild extends GameBase {
    private static $table_name = 'uw_guild';      // 角色表

    private static $columns =  array('id', 'name', 'chairmanId', 'viceChairmanId', 'lvl', 'todayHyd', 'weekHyd', 'fuli','wareHouse');

    public static function getTableName(){
        return self::$table_name;
    }

    public static function count($params = [])
    {
        $db = self::__instance();
        $condition = array();
        $sub_condition = array();

//        $type = $params['type'];
//        if (!empty($type)) {
//            $sub_condition['type'] = $type;
//        }

        if (!empty($sub_condition)) {
            $condition["AND"] = $sub_condition;
        }
        $num = $db->count(self::getTableName(), $condition);
        return $num;
    }

    public static function getList($params = [])
    {
        $db = self::__instance();
        $sql = "select id,name,lvl,todayHyd,weekHyd,fuli,wareHouse from " . self::getTableName() . " where 1=1 ";
        $id = $params['id'];
        if (!empty($id)) {
            $sql .= " and id = $id";
        }
        $pageStart = $params['pageStart'];
        $pageSize = $params['pageSize'];
        $sql .= " order by id ";
        if ($pageStart) {
            $sql .= " limit $pageStart, $pageSize";
        }
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    // 通过昵称查询角色基本信息
    public static  function getGuildById($id){
        if (! $id) {
            return false;
        }
        $db=self::__instance();
        $condition['id'] = $id;
        $list = $db->select ( self::getTableName(), self::$columns, $condition );
        if ($list) {
            $ret = array();
            foreach($list as $k=>$v){
                $row = $v;
                //$row["country"] = $COUNTRY_NAME[$row["country"]];
                // $row["nickname"] = iconv("GBK","UTF-8",$v["nickname"]);
                $ret[] = $row;
            }
            return $ret[0];
        }
        return array ();
    }

    public static function updateGuildInfo($id,  $update_data) {
        if (! $update_data || ! is_array ( $update_data )) {
            return false;
        }
        $db=self::__instance();
        $condition=array("id"=>$id);
        $id = $db->update ( self::getTableName(), $update_data, $condition );
        return $id;
    }
}
