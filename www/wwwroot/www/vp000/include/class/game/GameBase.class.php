<?php
if(!defined('ACCESS')) {exit('Access denied.');}
class GameBase {
    protected static $table_prefix = OSA_TABLE_PREFIX;
    protected static $db_container = array();

    // serverId取 sesssion里的serverid
    public static function __instance($database=OSA_NWNY_ID){
        $id = UserSession::getUserServerId();
        $dbkey = self::__dbKey($id, $database);
        if( @self::$db_container[$dbkey]  == null ){
            self::$db_container[$dbkey] = new Medoo2( $database,$id);
            return self::$db_container[$dbkey];
        }
        return self::$db_container[$dbkey];
    }

    // serverId 由上层逻辑来控制，可以操作不同db
    public static function __instance2($id, $database=OSA_NWNY_ID){
        $dbkey = self::__dbKey($id, $database);
        //var_dump($dbkey);
        if( @self::$db_container[$dbkey]  == null ){
            self::$db_container[$dbkey] = new Medoo2( $database,$id);
            return self::$db_container[$dbkey];
        }
        return self::$db_container[$dbkey];
    }

    public static  function __dbKey($id, $database){
        return $database."__".$id;
    }
}
