<?php
error_reporting(0);
header("Content-type: text/html; charset=utf-8");
ini_set('date.timezone','Asia/Shanghai');
session_start();
$quarr = array (
 '1' => array (
  'db_ip' => '127.0.0.1',
  'db_port' => 3306,
  'db_user' => 'fyqst',
  'db_pswd' => 'pwd123456',
  'db_name' => 'ttf_ly_game1',
  'prefix' => 's1',
  'name'=>'绯雨骑士团一区',
  'hidde'=>false
 ),
 '2' => array (
  'db_ip' => '127.0.0.1',
  'db_port' => 3306,
  'db_user' => 'fyqst',
  'db_pswd' => 'pwd123456',
  'db_name' => 'ttf_ly_game2',
  'prefix' => 's2',
  'name'=>'绯雨骑士团二区',
  'hidde'=>true
 ),

);
/*
 * 邮件字符串相关
 */
$code = array (
 'title' => '绯雨骑士团系统邮件',
 'msg_head' => '谢谢您的支持，这是系统给您的邮件，请注意查收。'
);
/*
 数据库连接
 */
$conn = @mysql_connect ( '127.0.0.1', 'fyqst', 'pwd123456' ) or die ( "数据库连接失败,请联系管理员！" );
mysql_select_db ( 'ttf_ly_game1', $conn );
mysql_query ( "SET NAMES utf8" );
$gmcode='123456';
function poststr($str){
 if(isset($_POST[$str])){
  return $_POST[$str];
 }
die("this link server do not exist".$str);
}
function http_post_data($url, $data_string) {
 $ch = curl_init ();
 curl_setopt ( $ch, CURLOPT_POST, 1 );
 curl_setopt ( $ch, CURLOPT_URL, $url . $data_string );
 curl_setopt ( $ch, CURLOPT_HTTPHEADER, array (
  "Content-Type: application/x-www-form-urlencoded",
  "Content-Length: 0",
  "Connection: Keep-Alive"
 ) );
 curl_setopt ( $ch, CURLOPT_TIMEOUT, 3 );
 ob_start ();
 $data = curl_exec ( $ch );
 curl_close ( $ch );
 return $data;
}