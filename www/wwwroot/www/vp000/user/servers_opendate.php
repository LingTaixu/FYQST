<?php

require ('../include/init.inc.php');
$serverIdArr = $serverDate = '';
extract ( $_POST, EXTR_IF_EXISTS );

if (Common::isPost ()) {
    if($serverIdArr=="" || $serverDate =="" ){
        OSAdmin::alert("error",ErrorMessage::NEED_PARAM);
    }else{
        foreach ($serverIdArr as $serverId){
            $update_data = array ('serverDate' => $serverDate );
            $result = GameServerInfo::update ( $serverId,$update_data );
            GameActivity::openServer($serverId, $serverDate);
        }
        $current_user=UserSession::getSessionInfo();
        $ip = Common::getIp();
        $update_data['ip']=$ip;
        //SysLog::addLog ( UserSession::getUserName(), 'MODIFY', 'User' , $user_id, json_encode($update_data) );
        Common::exitWithSuccess ('服务器时间设置完成','user/servers_opendate.php');
    }
}

$serverlist = getServerListByPlatform();
Template::assign ( 'serverlist', $serverlist );
Template::display ( 'user/servers_opendate.tpl' );