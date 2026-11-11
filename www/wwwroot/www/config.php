<?php
	error_reporting(0);
	session_start();
	date_default_timezone_set("PRC");
	header("Content-type: text/html; charset=utf8");
	$interval=0;
	$db_host='127.0.0.1';
	$db_username='fyqst';//数据库帐号
	$db_password='pwd123456';//数据库密码
	$dbport = 3306;
	$dbaccount='account';  //账号注册地址
	$dbpay='ttf_ly_main';
	$dbgame='ttf_ly_game1';
	$gmdb = "gmdbyzf";	//后台数据库名称
	$appKey = "QQ436043762";//秘钥
	$conn = @mysql_connect($db_host,$db_username,$db_password,$dbport) or die ("could not connect mysql");
	$user_IP = ($_SERVER["HTTP_VIA"]) ? $_SERVER["HTTP_X_FORWARDED_FOR"] : $_SERVER["REMOTE_ADDR"];
	$user_IP = ($user_IP) ? $user_IP : $_SERVER["REMOTE_ADDR"];
?>
