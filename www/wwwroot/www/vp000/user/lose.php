<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/1/9
 * Time: 22:32
 */

require ('../include/init.inc.php');
$interday = "";
extract ( $_GET, EXTR_IF_EXISTS );
//$serverid = $serverid == ""?"1":$serverid;
$interday = $interday == ""?"0":$interday;
$_GET["interday"] = $interday;
$loserlist = array();
$loserlist = GameUser::getLoseUser( $interday);
$lvlist = GameUser::getLoseLv(  $interday);

Template::assign ( 'loser_info', $loserlist);
Template::assign ( 'lv_info', $lvlist);
Template::assign ( '_GET', $_GET);
Template::assign ( 'serverid_list', $serverlist );
Template::display ( 'user/lose.tpl' );
