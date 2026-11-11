<?php
require ('../include/init.inc.php');
$serverId = $type = $color = $size  = $times = $interval = $sendTime = $expireTime = $message = '';
extract ( $_POST, EXTR_IF_EXISTS );

if (Common::isPost ()) {
    if($serverId=="" || $type=="" || $color =="" || $size =="" || $times =="" || $interval =="" || $sendTime =="" || $expireTime =="" || $message =="" ){

        OSAdmin::alert("error",ErrorMessage::NEED_PARAM);
    }else{
        //'status'=>$status,
        $input_data = array ('serverId' => $serverId, '`type`' => $type, 'color' => $color, 'size' => $size, 'times' => $times, '`interval`' => $interval, 'sendTime' => $sendTime, 'expireTime' => $expireTime, 'message' => $message );
        $id = GameMessage::addMessage ( $input_data );

        if ($id) {
            SysLog::addLog ( UserSession::getUserName(), 'ADD', 'GameMessage' ,$id, json_encode($input_data) );
            Common::exitWithSuccess ('添加成功','user/game_message.php');
        }else{
            OSAdmin::alert("error");
        }
    }
}

Template::assign("_POST" ,$_POST);
Template::assign ( 'queryoptionlist', $GAMEMESSAGE_QUERY_TYPE );
$serverlist = getServerListByPlatform();
array_unshift($serverlist, '所有服务器');
Template::assign ( 'serverlist', $serverlist );
Template::display ( 'user/game_message_add.tpl' );
