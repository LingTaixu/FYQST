<?php
if(!defined('ACCESS')) {exit('Access denied.');}

class GameServerInfo extends LoginBase {
    private static $table_name = 'uw_server_info';      // 服务器列表信息

    private static $columns =  array('id', 'name', 'mergerName', 'area',  'host','port', 'isNew', 'status', 'dbLink', 'sort','appId','serverId','indexId','isClose','closeExplain','serverDate','outLink');

    public static function getTableName(){
        return self::$table_name;
    }

    public static function  count(){
        $db=self::__instance();
        $num = $db->count ( self::getTableName());
        return $num;
    }

    public static function getList($start,$page_size){
        $db=self::__instance();
         $condition=array();

        $condition["ORDER"]=" id desc";
        $condition['LIMIT']=array($start,$page_size);
        $list = $db->select ( self::getTableName(), self::$columns, $condition);
        return $list;
    }

    public static function getListByServerId($serverId, $start,$page_size){
        $db=self::__instance();
        $condition=array();
        $condition["serverId"] = $serverId;
        $condition["ORDER"]=" id desc";
        $condition['LIMIT']=array($start,$page_size);
        $list = $db->select ( self::getTableName(), self::$columns, $condition);
        return $list;
    }

    // 新建一个服务器,规则固定
    public static function  newServer($openDate,$host){
        $db=self::__instance();
        $maxId = $db->max(self::getTableName(), "id");
        $condition["id"] = $maxId;
//        $list = $db->select ( self::getTableName(), self::$columns, $condition);
//        $host = "fs3.sanguoh5.com";
//        $host2 = "fs3.sanguoh5.com";
        $host2 = $host;
//        if ($list){
//            $host =  $list[0]["host"];
//            $host2 = $list[0]["host"];
//        }

        $newId = intval($maxId) + 1;
        $area = $newId."服";
        $port = 20000+$newId;
        $port2 = 10000+$newId;
        $dbLink = "server=127.0.0.1;database=ttf_awy_game".$newId.";uid=root;pwd=root;charset=utf8;port=3306";
        $server_data = [
            "id"=>$newId,
            "name"=>"绯雨",
            "area"=>$area,
            "host"=>$host,
            "port"=>$port,
            "host2"=>$host2,
            "port2"=>$port2,
            "isNew"=>1,
            "status"=>2,
            "dbLink"=>$dbLink,
            "sort"=>$newId,
            "serverId"=>$newId,
            "indexId"=>$newId,
            "isClose"=>0,
            "serverDate"=>$openDate
        ];
        $id = $db->insert ( self::getTableName(), $server_data );
        return $id;
    }

    // 获得最新的服务器时间
    public static function getLastServerDate(){
        $db=self::__instance();
        $maxId = $db->max(self::getTableName(), "id");
        $condition["id"] = $maxId;
        $list = $db->select ( self::getTableName(), self::$columns, $condition);
        if ($list){
            return $list[0]["serverDate"];
        }
    }

    public static  function  getServerById($id){
        $db=self::__instance();
        $condition=array();
        $condition['id']=$id;
        $list = $db->select ( self::getTableName(), self::$columns, $condition);
        if($list){
            return $list[0];
        }
        return array();
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

    public static function parseDbLink($dbLinkStr) {
        $serverArr = explode(';',$dbLinkStr);
        $serverTempArr = array();
        foreach ($serverArr as $i => $v) {
            $tempArr = explode('=', $v);
            $serverTempArr[$tempArr[0]] = $tempArr[1];
        }
        return $serverTempArr;
    }

    public static  function getServerList(){
        $db=self::__instance();
        $list = $db->select (self::getTableName(), self::$columns);
        $ret = array();
        if($list){
            // 拿出dbLink里面的server，database，
            foreach ($list as $k=>$row) {
                $dbLinkStr = $row["dbLink"];
                $serverId = $row["serverId"];
                $serverArr = self::parseDbLink($dbLinkStr);

                $serverTempArr = array(
                    'server' => $serverArr['server'],
                    'port' => $serverArr['port'],
                    'username' => $serverArr['uid'],
                    'password' => $serverArr['pwd'],
                    'db_name' => $serverArr['database'],
                    'gs_name'=> $row['name']."-".$row['area'],
                    "service_url" => "http://".$row['host'].":".$row['port'] //"http://127.0.0.1:24200"
                );

                $ret[$serverId] = $serverTempArr;
            }
        }
        return $ret;
    }

    public static function checkGameDB($id){
        $db=self::__instance();

        $db_name = getGameDBName($id);
        $sql = "show databases;";
        $list = $db->query($sql)->fetchAll();

        foreach($list as $d){
            if ($d['Database'] == $db_name){
                return true;
            }
        }
        return false;
    }

    /**
     * 获取开服的服务器列表
     * @return mixed
     */
    public static function getAllServer()
    {
        $db = self::__instance();
        $sql = "select id,serverId,serverDate from " . self::$table_name . " where serverDate < now()";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    /**
     * 获取所以服务器列表
     * @return mixed
     */
    public static function getEveryServer()
    {
        $db = self::__instance();
        $sql = "select id,serverId,serverDate from " . self::$table_name . " where 1=1";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

}
