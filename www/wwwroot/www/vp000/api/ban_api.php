<?php

require ('../include/init.inc.php');
require('./handler.php');

$accounts = $op = "";
extract ( $_POST, EXTR_IF_EXISTS );

$current_user_info = UserSession::getSessionInfo();
$opid = $current_user_info['user_id'];
$opname = $current_user_info['user_name'];
$optime = time();

$acclist = array_keys($accounts);
$uidlist = array_values($accounts);

switch(strval($op)){
    case "bendAccountList":
        $ret = bendAccountList($acclist);
        break;
    case "sealAccountList":
        $ret = sealAccountList($acclist);

        foreach ($acclist as $v){
            kickOffByAccount($v);
        }
//        foreach ($uidlist as $v){
//            // $v = [角色id,服务器id]
//            kickOff(getGameServerIdByName($v[1]), $v[0]);
//        }
        break;
    default:break;
}
//PlayerOpLog::addLog("", "", "",$serverId,$op,$opid,$opname,$optime,$reason,$content);
echo json_encode($ret);
