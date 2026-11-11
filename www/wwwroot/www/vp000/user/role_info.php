<?php
require ('../include/init.inc.php');
$uid = $nick = "";
extract ( $_REQUEST,  EXTR_IF_EXISTS );

$playInfo = GameUser::getRoleByUid($uid);

Template::assign ( '_GET', $_GET);
Template::assign ( 'player_info', $playInfo);
Template::display ( 'user/role_info.tpl' );