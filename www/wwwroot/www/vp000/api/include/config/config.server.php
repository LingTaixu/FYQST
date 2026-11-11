<?php
//    $SERVER_LIST = array(
//        0=>"所有服务器",
//        1=>"1服",
//        2=>"2服"
//    );
    $PLATFORM_LIST = array(
        "10006" => "联运",
	"10012" => "华为",
    );
    $DATABASE_LIST =  array(
        "10006" => array(
                "master_db" => array (
                    'server' => '127.0.0.1',
                    'port' => '3306',
                    'username' => 'fyqst',
                    'password' => 'pwd123456',
                    'db_name' => 'ttf_ly_main',
                    'gs_name'=>'MASTER'
                ),
                "login_db" => array (
                    'server' => '127.0.0.1',
                    'port' => '3306',
                    'username' => 'fyqst',
                    'password' => 'pwd123456',
                    'db_name' => 'ttf_ly_login',
                    'gs_name'=>'LOGIN'
                ),
                "log_db" => array (
                    'server' => '127.0.0.1',
                    'port' => '3306',
                    'username' => 'fyqst',
                    'password' => 'pwd123456',
                    'db_name' => 'ttf_ly_gamelog',
                    'gs_name'=>'GAMELOG'
                ),
        ),
	"10012" => array(
                "master_db" => array (
                    'server' => '127.0.0.1',
                    'port' => '3306',
                    'username' => 'fyqst',
                    'password' => 'pwd123456',
                    'db_name' => 'ttf_ly_main',
                    'gs_name'=>'MASTER'
                ),
                "login_db" => array (
                    'server' => '127.0.0.1',
                    'port' => '3306',
                    'username' => 'fyqst',
                    'password' => 'pwd123456',
                    'db_name' => 'ttf_ly_login',
                    'gs_name'=>'LOGIN'
                ),
                "log_db" => array (
                    'server' => '127.0.0.1',
                    'port' => '3306',
                    'username' => 'fyqst',
                    'password' => 'pwd123456',
                    'db_name' => 'ttf_ly_gamelog',
                    'gs_name'=>'GAMELOG'
                ),
        )
    );
    $GMT_DB = array (
        'server' => '127.0.0.1',
        'port' => '3306',
        'username' => 'fyqst',
        'password' => 'pwd123456',
        'db_name' => 'ttf_ly_osadmin'
    );

    function getDBAddress($database){
        global $DATABASE_LIST;
        global $GMT_DB;
        $platform = '10006';
        //$platform = $platform=='' ? array_keys($DATABASE_LIST)[0] : $platform;
        //$serverId = UserSession::getUserServerId();
        $serverId = $serverId=='' ? 1 : $serverId;
        //echo $database.'---'.$serverId.'---'.$platform.'<br/>';
        if ($database == OSA_DB_ID){
            return $GMT_DB;
        }
        if ($database == OSA_MAIN_ID){
            return $DATABASE_LIST[$platform]['master_db'];
        }
        if ($database == OSA_lOGIN_ID){
            return $DATABASE_LIST[$platform]['login_db'];
        }
        if ($database == OSA_GAMELOG_ID){
            return $DATABASE_LIST[$platform]['log_db'];
        }
        // 不再处理游戏库的链接 （读ttf_login.uw_server_info表））
        //return  $DATABASE_LIST[$platform]['server_db'][$serverId];
    }

    function getGameDBAddress($database, $id){
	$platform = '10006';
        //$platform = UserSession::getUserPlatform();
        if (!isset($id) || $id == 0|| $id == ''){
            $serverId =UserSession::getUserServerId();
        }else{
            $serverId = $id;
        }
        $serverId = $serverId=='' ? 1 : $serverId;
        $serverList = GameServerInfo::getServerList();
       // var_dump($serverList);
        return $serverList[$serverId];
    }

    function getServerListByPlatform(){
        //global $DATABASE_LIST;
        //$platform = UserSession::getUserPlatform();
        $serverlist = GameServerInfo::getServerList();
        $serverarr = array();
        foreach($serverlist as $k => $v){
            $serverarr[$k] = $v['gs_name'];
        }

        return $serverarr;
    }

    function getGameServiceUrl($serverId){
        global $DATABASE_LIST;
	$platform = '10006';
        //$platform = UserSession::getUserPlatform();
        $serverList = GameServerInfo::getServerList();
        return $serverList[$serverId]["service_url"];
    }

    function getGameServerIdByName($serverName){
        global $DATABASE_LIST;
        $platform = UserSession::getUserPlatform();
        foreach($DATABASE_LIST[$platform]["server_db"] as $k => $v){
            if ($v['gs_name'] == $serverName){
                return $k;
            }
        }
    }

    function getServerName($serverId){
        return "s".$serverId;
    }

    function getCityServerName($serverId){
        return "cs".$serverId;
    }

    function getGameDBName($serverId){
        return "ttf_ly_game".$serverId;
    }

   function getGameDBLink($serverId){
        $dbname = getGameDBName($serverId);
        return "server=127.0.0.1;database=".$dbname.";uid=fyqst;pwd=pwd123456;charset=utf8;port=3306";
    }

    function getPM2WebUrl(){
        return ["http://192.168.0.101:9615/","http://123.207.91.176:9615/","http://10.104.222.139:9615/","http://10.104.234.72:9615/","http://10.104.134.122:9615/","http://10.104.69.127:9615/","http://10.104.79.194:9615/"];
    }

    function getServerUidRange($serverId){
        $serverId = intval($serverId);
     return $serverId * 100000;
    }

//    function getGameServiceUrl2($platform, $serverId){
//        global $DATABASE_LIST;
//        return $DATABASE_LIST[$platform]["server_db"][$serverId]["service_url"];
//    }
