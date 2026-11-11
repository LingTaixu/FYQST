<?php

require ('../include/init.inc.php');
require('./handler.php');

$serverid =  $subject = $op =  $content = $name = "";
extract ( $_GET, EXTR_IF_EXISTS );

$current_user_info = UserSession::getSessionInfo();
$opid = $current_user_info['user_id'];
$opname = $current_user_info['user_name'];
$optime = time();
$msg = $content;
if($op == "broadcast"){

}

//PlayerOpLog::addLog("", "", "",$serverId,$op,$opid,$opname,$optime,$reason,$content);
echo json_encode($ret);
