<?php
if(!defined('ACCESS')) {exit('Access denied.');}

class GameHero extends GameBase
{
    private static $table_name = 'uw_hero';      // 角色表

    private static $columns = array('id', 'userId', 'tempId', 'quality', 'intensifyArr', 'starArr', 'gemArr', 'wingArr', 'expc',
        'lvl', 'equipData', 'skillLvlArr', 'propArr', 'realmLvl', 'realmArr', 'sex', 'combat', 'refineArr', 'starTopArr', 'talismanAdorn', 'talismanData', 'talismanFg',
        'wingSumLvl', 'gemSumLvl', 'realmSumLvl', 'fightSort', 'soulArr', 'wearSoulId', 'talismanNum', 'talismanCombat', 'wingCombat','holyArr');

    public static function getTableName()
    {
        return self::$table_name;
    }

    public static function count($serverId)
    {
        $db = self::__instance2($serverId);
        return $db->count(self::getTableName());
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

    public static function updateData($uid, $update_data){
        if (! $update_data || ! is_array ( $update_data )) {
            return false;
        }
        $db=self::__instance();
        $condition=array("userId"=>$uid);
        $id = $db->update ( self::getTableName(), $update_data, $condition );
        return $id;
    }

    public static function getHeroNum($uid){
        $db=self::__instance();
        $condition=array("userId"=>$uid);
        $num = $db->count ( self::getTableName(), $condition );
        return $num;
    }
    // 增加测试英雄
    public static function addTestHero($heroData){
        $db=self::__instance();
        $id = $db->insert ( self::getTableName(), $heroData);
        return $id;
    }
}