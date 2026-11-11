<?php

require ('../include/init.inc.php');
$id = $bendExpireAt = $status = "";
extract ( $_REQUEST, EXTR_IF_EXISTS );

date_default_timezone_set("Asia/Shanghai");

if (Common::isPost ()) {
    $input_data = array ('`status`' => $status);
    if(!empty($bendExpireAt)){
        $input_data['bendExpireAt']=$bendExpireAt;
    }
    //var_dump($input_data);
    $result = GameAccount::update ($id, $input_data );

    if ($result>=0) {
        //SysLog::addLog ( UserSession::getUserName(), 'UPDATE', 'GameNotice' ,$id, json_encode($input_data) );
        Common::exitWithSuccess ('操作完成','user/role_ban.php?id='.$id);
    }else{
        OSAdmin::alert("error");
    }
}

$info = GameAccount::getInfoById($id);
GameAccount::setAccountBanInfo($info);

//$info ['bj_time'] = gmdate ( "Y-m-d H:i:s", time () + 8 * 3600 );
Template::assign("_POST" ,$_POST);
Template::assign ( '_GET', $_GET);
Template::assign ( 'info', $info);
Template::assign ( 'banStatusList', $BAN_STATUS_TYPE);

Template::display ( 'user/role_ban.tpl' );