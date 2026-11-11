<?php

require ('../include/init.inc.php');
require('./handler.php');

$serverid = $prior = $interval = $msgid = $loopnum = $reason = $content = "";
extract ( $_GET, EXTR_IF_EXISTS );

$current_user_info = UserSession::getSessionInfo();
$opid = $current_user_info['user_id'];
$opname = $current_user_info['user_name'];
$optime = time();
$op = "mail2";
$zoneId = 1;
$ret=opMailToUserList($zoneId,$serverid,$_GET);
//PlayerOpLog::addLog("", "", "",$serverId,$op,$opid,$opname,$optime,$reason,$content);
echo json_encode($ret);
