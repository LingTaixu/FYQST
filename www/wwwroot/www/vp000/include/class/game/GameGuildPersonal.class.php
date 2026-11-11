<?php
if(!defined('ACCESS')) {exit('Access denied.');}

class GameGuildPersonal extends GameBase {
    private static $table_name = 'uw_guild_personal';      // 角色表

    private static $columns =  array('id', 'userId', 'guildId', 'position', 'addUpAct', 'joinTime');

    public static function getTableName(){
        return self::$table_name;
    }

    public static function getList($serverId, $columns = [], $condition = [])
    {
        $db = self::__instance2($serverId);
        if (empty($columns)) {
            $columns = self::$columns;
        }
        $list = $db->select(self::getTableName(), $columns, $condition);
        return $list;
    }

    // 通过昵称查询角色基本信息
    public static  function getGuildIdByUid($uid){
        if (! $uid) {
            return false;
        }
        $db=self::__instance();
        $condition['userId'] = $uid;
        $list = $db->select ( self::getTableName(), self::$columns, $condition );
        if ($list) {
            $ret = array();
            foreach($list as $k=>$v){
                $row = $v;
                $ret[] = $row;
            }
            return $ret[0];
        }
        return array ();
    }

    public static function updateGuildInfo($id, $uid, $update_data) {
        if (! $update_data || ! is_array ( $update_data )) {
            return false;
        }
        $db=self::__instance();
        $condition=array();
        $sub_condition=array("guildId"=>$id, "userId" => $uid);

        if(empty($sub_condition)){
            $condition = array();
        }else{
            $condition["AND"] = $sub_condition;
        }

        $id = $db->update ( self::getTableName(), $update_data, $condition );
        return $id;
    }

    public static function getDataJoinUser($serverId, $params = [])
    {
        $db = self::__instance2($serverId);
        $sql = "select g.id,g.userId,g.guildId,g.position,g.addUpAct,g.joinTime,u.nickName,ug.name as guildName from " . self::getTableName() . " g left join 
        uw_user u on g.userId = u.id left join uw_guild ug on g.guildId = ug.id where 1=1 ";
        $id = $params['guildId'];
        if (!empty($id)) {
            $sql .= " and g.guildId = $id";
        }

        $sql .= " order by g.position ";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function updateInfoByApi($serverId, $params)
    {
        $serviceUrl = getGameServiceUrl($serverId);
//        $p = [
//            "_0" => json_encode($params)
//        ];
        $para = json_encode($params);
        $url = $serviceUrl."/?r=admin.gm.a1&a=".$para."&s=0&c=0&ak=".GAME_SERVER_ADMKEY;
        return Common::curlGet($url);
    }
}
