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
$tasklist = array();

$platform = UserSession::getUserPlatform();
$serverId = UserSession::getUserServerId();
$tasklist = GameTaskLog::getLastAchiveTaskList($serverId, $interday);

Template::assign ( 'task_info', $tasklist);
Template::assign ( '_GET', $_GET);
Template::assign ( 'serverid_list', $serverlist );
Template::display ( 'user/task_lose.tpl' );
