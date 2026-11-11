<?php
require ('../include/init.inc.php');
$serverDate = '';
extract ( $_POST, EXTR_IF_EXISTS );

if (Common::isPost ()) {
    $exist = User::getUserByName($user_name);
    if($exist){
        OSAdmin::alert("error",ErrorMessage::NAME_CONFLICT);
    }else if($serverDate=="" ){
        OSAdmin::alert("error",ErrorMessage::NEED_PARAM);
    }else{
        $lastServerId = GameServerInfo::getLastServerId();
        $m = MachineInfo::getMachine($lastServerId + 1);
        if(!$m){
	    Common::exitWithSuccess (ErrorMessage::SERVER_NOTCONFIG_MACHINE,'user/server_list.php');
            return;
        }
        $host = $m['host'];
        $serverId = GameServerInfo::newServer($serverDate, $host);
        // $input_data['password']="";
        //SysLog::addLog ( UserSession::getUserName(), 'ADD', 'User' ,$user_id, json_encode($input_data) );

        // 新开服
        Utils::createNewServer($serverId);

        // 修正活动时间, 开服时间
        GameActivity::openServer($serverId, $serverDate);

        Common::exitWithSuccess ('服务器添加成功','user/server_list.php');

    }
}

$lastDay = GameServerInfo::getLastServerDate();
$newDay = date('Y-m-d H:i:s',strtotime('+1 day',strtotime($lastDay)));

Template::assign ( 'newDay', $newDay );
Template::display ( 'user/server_add.tpl' );
