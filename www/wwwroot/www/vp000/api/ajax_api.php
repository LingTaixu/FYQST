<?php

require ('../include/init.inc.php');
require('./handler.php');

$data = $op = "";
extract ( $_REQUEST, EXTR_IF_EXISTS );
$current_user_info = UserSession::getSessionInfo();
$opid = $current_user_info['user_id'];
$opname = $current_user_info['user_name'];
$optime = time();

//$playerinfo = GameUser::getRoleByUid($uid);
//$op是函数名
$ret = $op($data);

//$msg = json_encode($_GET);
//PlayerOpLog::addLog($charId, $userId, $charname,$serverId,$op,$opid,$opname,$optime,$reason,$msg);

/*$retArary = $_REQUEST;
$retArary["ret"] = $ret;*/
//$retArray["ret"] = $ret;
//$retArray["msg"] = $msg;
echo json_encode($ret);