<?php
require ('../include/init.inc.php');
$buyGoodsList = RechargeRequest::getBuyGoodsList ();
Template::assign ( 'buyGoodsList', $buyGoodsList );
Template::assign ( '_GET', $_GET );
Template::display ( 'user/sta_buy_goods.tpl' );
