<?php
require('../include/init.inc.php');
$method = $startTime = $endTime = '';
$search = $allPayRole = $allPayPrice = 0;
$outArr = $totalArr = array();
$chooseServer = $selectServer = '';
extract($_REQUEST, EXTR_IF_EXISTS);

//$startTime = $startTime ? $startTime : date('Y-m-d 00:00:00', time() - 86400 * 7);
//$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$totalTitle = [
    'allPrice' => "总金额"
];
$title = [
    'month' => '月份',
    'total' => '总收入',
];
$titleKey = array_keys($title);

if ($search) {
    $params = [
        'startTime' => $startTime,
        'endTime' => $endTime,
    ];
    $outArr = RechargeRequest::getPriceByMonth($params);
    if ($outArr) {
        foreach ($outArr as $out) {
            $totalArr[0]['allPrice'] += $out['total'];
        }
    }
}

if ($search == 2) {
    $fileName = '月收入数据';
    Help::writeExcel($fileName, $title, $outArr);
    die();
}

Template::assign('serverDiv', $serverDiv);
Template::assign('title', $title);
Template::assign('totalTitle', $totalTitle);
Template::assign('startTime', $startTime);
Template::assign('endTime', $endTime);
Template::assign('totalArr', $totalArr);
Template::assign('outArr', $outArr);
Template::assign('_GET', $_GET);
Template::display('statistics/monthIncome.tpl');