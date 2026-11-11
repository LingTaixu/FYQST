<?php
require ('../include/init.inc.php');
$id = $serverId = $type = $color = $size  = $times = $interval = $sendTime = $expireTime = $message = '';
extract ( $_REQUEST, EXTR_IF_EXISTS );

Common::checkParam($id);
$info = GameMessage::getMessageById ( $id );

if(empty($info)){
    Common::exitWithError(ErrorMessage::USER_NOT_EXIST,"user/game_message.php");
}
if (Common::isPost ()) {
    if($serverId=="" || $type=="" || $color =="" || $size =="" || $times =="" || $interval =="" || $sendTime =="" || $expireTime =="" || $message =="" ){

        OSAdmin::alert("error",ErrorMessage::NEED_PARAM);
    }else{
        $input_data = array ('serverId' => $serverId, '`type`' => $type, 'color' => $color, 'size' => $size, 'times' => $times, '`interval`' => $interval, 'sendTime' => $sendTime, 'expireTime' => $expireTime, 'message' => $message );
        $result = GameMessage::updateMessage ($id, $input_data );

        if ($result>=0) {
            SysLog::addLog ( UserSession::getUserName(), 'UPDATE', 'GameMessage' ,$id, json_encode($input_data) );
            Common::exitWithSuccess ('更新完成','user/game_message.php');
        }else{
            OSAdmin::alert("error");
        }
    }
}

Template::assign("_POST" ,$_POST);
Template::assign ( 'info', $info );
Template::assign ( 'queryoptionlist', $GAMEMESSAGE_QUERY_TYPE );
$serverlist = getServerListByPlatform();
array_unshift($serverlist, '所有服务器');
Template::assign ( 'serverlist', $serverlist );
Template::display ( 'user/game_message_modify.tpl' );
