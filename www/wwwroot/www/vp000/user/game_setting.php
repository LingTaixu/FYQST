<?php

require ('../include/init.inc.php');
$bj_time = "";
extract ( $_REQUEST, EXTR_IF_EXISTS );

date_default_timezone_set("Asia/Shanghai");

if (Common::isPost ()) {

    if($bj_time =="" ){
        OSAdmin::alert("error",ErrorMessage::NEED_PARAM);
    }else{
        $cmd = "sudo date -s '$bj_time'";
        system($cmd);
        Common::exitWithSuccess ('修改完成','user/game_setting.php');
    }
}

$info = array();
$info ['bj_time'] = gmdate ( "Y-m-d H:i:s", time () + 8 * 3600 );

Template::assign ( '_GET', $_GET);
Template::assign ( 'info', $info);
Template::display ( 'user/game_setting.tpl' );