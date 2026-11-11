<?php

require ('../include/init.inc.php');
$uid = $nick ="";
extract ( $_GET, EXTR_IF_EXISTS );

$playInfo = GameUser::getRoleByUid($uid);

Template::assign ( '_GET', $_GET);
Template::assign ( 'player_info', $playInfo);
Template::display ( 'user/role_profile.tpl' );