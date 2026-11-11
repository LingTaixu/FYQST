<?php

require ('../include/init.inc.php');
$user_name = $class_name ="";
extract ( $_GET, EXTR_IF_EXISTS );

$playerinfolist = array();
if($class_name == 'uid'){  // 玩家内部账号
    $uid = $user_name;
    $playerinfo = GameUser::getRoleByAccountid($uid);

}else if($class_name == 'charid'){
    $charid = $user_name;
    $playerinfo =  GameUser::getRoleByUid($charid);

}else if($class_name == 'charname'){
    $name = $user_name;
    $playerinfo = GameUser::getUserByNick($name);
}
$uid = $playerinfo['id'];

Template::assign ( '_GET', $_GET);
Template::assign ( 'playerinfo', $playerinfo);
Template::assign ( 'card_type', $INTEGRAL_TYPE);

Template::assign ( 'queryoptionlist', $GAMEPLAYER_QUERY_TYPE );
Template::display ( 'user/role_integral_mail.tpl' );