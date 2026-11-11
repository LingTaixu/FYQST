<?php
/**
 * Created by PhpStorm.
 * User: xuzha
 * Date: 2018/9/13
 * Time: 下午 04:09
 */
$key = "YT4HPK";
if ($_POST){
    $order_id = $_POST['order_id'];
    $amount = $_POST['amount'];
    $extract_info = $_POST['extract_info'];
    $sign = $_POST['sign'];
    $psign = md5("amount=$amount&extract_info=$extract_info&order_id=$order_id&key=$key");
    if ($sign !=$psign){
        exit("");
    }
	//$extract_info为服务端订单ID
    $conn = mysqli_connect('127.0.0.1','fyqst','pwd123456','ttf_ly_main',3306);
    $conn->query("set names utf8");
	$conn->query("UPDATE uw_recharge_request SET status='1' WHERE orderNo='$extract_info'");
    exit("OK");
}