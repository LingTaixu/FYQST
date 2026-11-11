<?php
require('../include/init.inc.php');
$method = $selectServer = $startTime = $endTime = '';
$search = 0;
$allArr = $outArr = $allRechargeArr = $cache_user = $cache_recharge = array();
extract($_REQUEST, EXTR_IF_EXISTS);

$startTime = $startTime ? $startTime : '';
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$title = [
    'day' => '日期',
    'goodsType' => '充值类型',
    'times' => '购买次数',
    'users' => '首充人数',
    'goodsPrice' => '单价',
    'avgLvl' => '平均等级',
];
$titleKey = array_keys($title);

$serversInfo = GameServerInfo::getAllServer();
$gameServerArr = [];
foreach ($serversInfo as $row) {
    $gameServerArr[] = $row['serverId'];
}
$serverDiv = Help::getServerInput($selectServer);
$selectServers = Help::getSelectedServers($gameServerArr, $selectServer);
$selectIds = $selectServers['selectId'];

if ($search) {
    $params = [
        'servers' => $selectIds,
        'start' => $startTime,
        'end' => $endTime,
    ];
    $recharge = RechargeRequest::getFirstByGoods($params);
    if ($recharge) {
        foreach ($recharge as $rec) {
            $day = $rec['theDay'];
            $rechargeId = $rec['rechargeId'];
            $allArr[$day][$rechargeId]['times'] += $rec['theTimes'];
            $allArr[$day][$rechargeId]['users']++;
            $allArr[$day][$rechargeId]['allPrice'] += $rec['thePrice'];
            $allArr[$day][$rechargeId]['allLvl'] += $rec['theLvl'];
            ksort($allArr[$day]);
        }
    }

    krsort($allArr);
    if ($allArr) {
        foreach ($allArr as $day => $recItem) {
            foreach ($recItem as $rechargeId => $value) {
                $outArr[] = [
                    'day' => $day,
                    'goodsType' => $CONFIG_RECHARGE[$rechargeId]['name'] ? $CONFIG_RECHARGE[$rechargeId]['name'] : $rechargeId,
                    'times' => $value['times'],
                    'users' => $value['users'],
                    'goodsPrice' => $CONFIG_RECHARGE[$rechargeId]['cost'] ? $CONFIG_RECHARGE[$rechargeId]['cost'] : 0,
                    'avgLvl' => round($value['allLvl'] / $value['times'])
                ];
            }
        }
    }
}

if ($search == 2) {
    $fileName = '首冲明细数据';
    Help::writeExcel($fileName, $title, $outArr);
    die();
}

// 设置模板变量
$group_options = UserGroup::getGroupForOptions();
$group_options[0] = "全部";
ksort($group_options);

Template::assign('serverDiv', $serverDiv);
Template::assign('title', $title);
Template::assign('startTime', $startTime);
Template::assign('endTime', $endTime);
Template::assign('outArr', $outArr);
Template::assign('group_options', $group_options);
Template::assign('_GET', $_GET);
Template::assign('page_html', $page_html);
Template::display('statistics/firstPayDetail.tpl');

