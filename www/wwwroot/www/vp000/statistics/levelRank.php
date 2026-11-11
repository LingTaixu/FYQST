<?php
require('../include/init.inc.php');
$method = $dayNum = '';
$search = $allPayRole = $allPayPrice = 0;
$outArr = $cache_user = $servers = array();
$chooseServer = '';
extract($_REQUEST, EXTR_IF_EXISTS);

$dayList = [
    1 => 1,
    2 => 2,
    3 => 3,
    4 => 4,
    5 => 5,
    6 => 6,
    7 => 7,
    8 => 8,
    9 => 9,
    10 => 10,
    11 => 11,
    12 => 12,
    13 => 13,
    14 => 14,
];
$title = [
    'server_id' => '服务器',
    'day_num' => '天数',
    'user_id' => '用户id',
//    'accountId' => '账号id',
    'nickName' => '用户名',
    'lvl' => '等级',
];
$titleKey = array_keys($title);

$serversInfo = GameServerInfo::getAllServer();
$gameServerArr = [];
foreach ($serversInfo as $row) {
    $servers[$row['serverId']] = $row;
    $gameServerArr[] = $row['serverId'];
}
$serverSelect = Help::getServerSelect($gameServerArr, $chooseServer);
$selectServers = Help::getSelectedServers($gameServerArr, $chooseServer);
$selectIds = $selectServers['selectId'];

$serversInfo = GameServerInfo::getAllServer();
foreach ($serversInfo as $row) {
    $selectIds[] = $row['serverId'];
}

if ($search) {
    print_r($selectIds);exit;

    krsort($outArr);
}

if ($search == 2) {
    $fileName = '等级排行数据';
    Help::writeExcel($fileName, $title, $outArr);
    die();
}

// 设置模板变量
$group_options = UserGroup::getGroupForOptions();
$group_options[0] = "全部";
ksort($group_options);

Template::assign('serverSelect', $serverSelect);
Template::assign('dayList', $dayList);
Template::assign('title', $title);
Template::assign('startTime', $startTime);
Template::assign('endTime', $endTime);
Template::assign('outArr', $outArr);
Template::assign('group_options', $group_options);
Template::assign('_GET', $_GET);
Template::assign('page_html', $page_html);
Template::display('statistics/levelRank.tpl');

