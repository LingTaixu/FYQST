<?php

require ('../include/init.inc.php');
$user_name = $class_name ="";
extract ( $_GET, EXTR_IF_EXISTS );

$playerinfolist = array();
if($class_name == 'uid'){  // 玩家内部账号
    $uid = $user_name;
    $p = GameUser::getRoleByAccountid($uid);
    $playerinfolist[] = $p;
}else if($class_name == 'charid'){
    $charid = $user_name;
    $p =  GameUser::getRoleByUid($charid);
    $playerinfolist[] = $p;
}else if($class_name == 'charname'){
    $name = $user_name;
    $p = GameUser::getUserByNick($name);
    $playerinfolist[] =  $p;
}

$ret = [];
foreach ($playerinfolist as $k=>$playerInfo){
    $uid = $playerInfo['id'];
    $accountId = $playerInfo['accountId'];
    $playerInfo['openId'] = GameAccount::getInfoById($accountId)['name'];
    $playerInfo['pwd'] = GameAccount::getInfoById($accountId)['pwd'];
    $ret[$k] = $playerInfo;
}
$loginUrl = getGameUrl();
Template::assign ( '_GET', $_GET);
Template::assign ( 'player_info', $ret);
Template::assign("loginUrl", $loginUrl);
Template::assign ( 'queryoptionlist', $GAMEPLAYER_QUERY_TYPE );
Template::display ( 'user/role_login.tpl' );