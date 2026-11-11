<?php
/*
 * 给用户发送新闻 / 邮件
 */
require ('../include/init.inc.php');
$uid = $user ="";
extract ( $_GET, EXTR_IF_EXISTS );

$playInfo = GameUser::getRoleByUid($uid);
Template::assign ( '_GET', $_GET);
Template::assign ( 'player_info', $playInfo);
Template::display ( 'user/role_mail2.tpl');