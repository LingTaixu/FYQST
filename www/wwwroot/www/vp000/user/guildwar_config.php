<?php

require ('../include/init.inc.php');
$signOpen = $signEnd = $warOpen = $warEnd = "";
extract ( $_REQUEST,  EXTR_IF_EXISTS );
//var_dump($_REQUEST);exit(0);
if (Common::isPost ()) {

    if($signOpen=="" || $signEnd =="" || $warOpen ==""|| $warEnd =="" ){

        OSAdmin::alert("error",ErrorMessage::NEED_PARAM);
    }else{
        $result = GuildWarConfig::updateDate ( $signOpen,$signEnd,$warOpen, $warEnd);

        if ($result>=0) {
            $current_user=UserSession::getSessionInfo();
            $ip = Common::getIp();
            $update_data['ip']=$ip;
            //SysLog::addLog ( UserSession::getUserName(), 'MODIFY', 'User' , $user_id, json_encode($update_data) );
            Common::exitWithSuccess ('更新完成','user/guildwar_config.php');
        } else {

            OSAdmin::alert("error");
        }
    }
}

$cfg = GuildWarConfig::getConfig();
Template::assign ( 'GuildWarCfg', $cfg);
Template::display ( 'user/guildwar_config.tpl' );