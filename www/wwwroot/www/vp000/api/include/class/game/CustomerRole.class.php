<?php
if(!defined('ACCESS')) {exit('Access denied.');}

class CustomerRole extends MainBase
{
    private static $table_name = 'customer_game_roles';      // 提问玩家用户账号
    /*
     * CREATE TABLE `customer_game_roles` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `game_id` int(11) NOT NULL DEFAULT '0',
      `area` varchar(64) NOT NULL DEFAULT '',
      `group` varchar(64) NOT NULL DEFAULT '',
      `role_id` varchar(255) NOT NULL DEFAULT '' COMMENT '角色id',
      `open_id` varchar(64) NOT NULL DEFAULT '',
      `user_id` bigint(18) NOT NULL DEFAULT '0',
      `nickname` varchar(100) NOT NULL DEFAULT '' COMMENT '角色名称',
      `vip_level` int(11) NOT NULL DEFAULT '0' COMMENT 'vip等级',
      `status` int(11) NOT NULL DEFAULT '0',
      `created` datetime NOT NULL,
      `updated` datetime NOT NULL,
      `solve_msg` text COMMENT '处理意见',
      PRIMARY KEY (`id`),
      UNIQUE KEY `uql_game_area_group_role` (`game_id`,`area`,`group`,`role_id`)
    ) ENGINE=InnoDB
     */

    private static $columns =  array('id', 'game_id', 'area','role_id', 'open_id', 'user_id', 'nickname', 'vip_level', 'status', 'created', 'updated', 'solve_msg');

    public static function getTableName(){
        return self::$table_name;
    }

    public static function  count(){
        $db=self::__instance();
        $num = $db->count ( self::getTableName());
        return $num;
    }

    public static function getList($start,$page_size){
        $db = self::__instance();
        $condition = array();
        $condition["ORDER"] = " updated desc";
        $condition['LIMIT'] = array($start, $page_size);
        $list = $db->select(self::getTableName(), self::$columns, $condition);

        if ($list) {
            $ret = array();
            foreach($list as $k=>$v){
                $row = $v;
                if ($v['status'] == 0){
                    $row['statusName'] = "玩家提问等待客服处理";
                }else {
                    $row['statusName'] = "客服已回答";
                }
                // $row["country"] = $COUNTRY_NAME[$row["country"]];
                // $row["nickname"] = iconv("GBK","UTF-8",$v["nickname"]);
                $ret[] = $row;
            }
            return $ret;
        }
        return array ();
    }

    public static function getGameRole($id){
        $db = self::__instance();
        $condition = array();
        $condition["id"] = $id;
        $result = $db->select(self::getTableName(), self::$columns, $condition);
        if($result){
            return $result[0];
        }
        return array();
    }

    public static function updateGameRole($id,  $update_data) {
        if (! $update_data || ! is_array ( $update_data )) {
            return false;
        }
        $db=self::__instance();
        $condition=array("id"=>$id);
        $id = $db->update ( self::getTableName(), $update_data, $condition );
        return $id;
    }
}