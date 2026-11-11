<?php
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
    $USE_HTTPS=false;
    function getDBAddress($database){
        global $DATABASE_LIST;
        global $GMT_DB;
        $platform = UserSession::getUserPlatform();
        //$platform = $platform=='' ? array_keys($DATABASE_LIST)[0] : $platform;
        $serverId = UserSession::getUserServerId();
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
        $platform = UserSession::getUserPlatform();
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
        global $DATABASE_LIST,$USE_HTTPS;
        $platform = UserSession::getUserPlatform();
        $serverList = GameServerInfo::getServerList();
	$url = "";
        if($USE_HTTPS){
            $url =  "https://";
        }else{
            $url = "http://";
        }
        return $url.$serverList[$serverId]["service_url"];
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

    function getBattleServerName($serverId){
        return "bs".$serverId;
    }

    function getGameDBName($serverId){
        return "ttf_ly_game".$serverId;
    }

   function getGameDBLink($serverId){
        $dbname = getGameDBName($serverId);
        return "server=127.0.0.1;database=".$dbname.";uid=fyqst;pwd=pwd123456;charset=utf8;port=3306";
    }

    function getPM2WebUrl(){
        return ["http://103.37.45.81:9615/","http://10.104.249.17:9615/","http://10.104.196.60:9615/","http://10.104.207.121:9615/","http://10.104.9.160:9615/","http://123.207.91.176:9615/","http://10.104.222.139:9615/","http://10.104.234.72:9615/","http://10.104.134.122:9615/","http://10.104.69.127:9615/","http://10.104.79.194:9615/","http://10.104.14.51:9615/","http://10.104.38.214:9615/"];
    }

    function getPM2BattleWebUrl(){
        return ["http://103.37.45.81:9615/","http://10.104.249.17:9615/","http://10.104.196.60:9615/","http://10.104.207.121:9615/","http://10.104.9.160:9615/","http://123.207.91.176:9615/","http://10.104.222.139:9615/","http://10.104.234.72:9615/","http://10.104.134.122:9615/","http://10.104.69.127:9615/","http://10.104.79.194:9615/","http://10.104.14.51:9615/","http://10.104.38.214:9615/"];
    }

    function getServerUidRange($serverId){
        $serverId = intval($serverId);
     return $serverId * 100000;
    }

    function getGameUrl(){
        return  "http://127.0.0.1:8080/game.html";
    }


//    function getGameServiceUrl2($platform, $serverId){
//        global $DATABASE_LIST;
//        return $DATABASE_LIST[$platform]["server_db"][$serverId]["service_url"];
//    }
