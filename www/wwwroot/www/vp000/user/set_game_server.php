<?php
require('../include/init.inc.php');
$method = $platform_id = $server_id = '';
extract ( $_REQUEST, EXTR_IF_EXISTS );
$current_user_info = UserSession::getSessionInfo();
$user_id = $current_user_info['user_id'];
$shortcuts = $current_user_info['shortcuts'];
if($method=="set_platform"){
    if(!isset($DATABASE_LIST[$platform_id])){
        $ret = json_encode(array("result"=>"0","msg"=>"选择平台失败!".UserSession::getUserPlatform().'---'.UserSession::getUserServerId()));
    }else{
        $_SESSION[UserSession::SESSION_NAME]['platform']=$platform_id;
        if(UserSession::getUserPlatform() != ''){
            $ret = json_encode(array("result"=>"1","msg"=>"选择平台成功".UserSession::getUserPlatform().'---'.UserSession::getUserServerId()));
            //UserSession::reload();
        }else{
            $ret = json_encode(array("result"=>"0","msg"=>"选择平台失败!".UserSession::getUserPlatform().'---'.UserSession::getUserServerId()));
        }
    }
    echo $ret;
}else if($method=="set_server"){
    $_SESSION[UserSession::SESSION_NAME]['serverId']=$server_id;
    if(UserSession::getUserServerId() != ''){
        $ret = json_encode(array("result"=>"1","msg"=>"选择区服成功:".UserSession::getUserPlatform().'---'.UserSession::getUserServerId()));
        //UserSession::reload();
    }else{
        $ret = json_encode(array("result"=>"0","msg"=>"选择区服失败!".UserSession::getUserPlatform().'---'.UserSession::getUserServerId()));
    }
    echo $ret;
}


//$rand=rand(0,10000);
//$back_url=$_SERVER['HTTP_REFERER']."#".$rand;
//header("Location:$back_url");