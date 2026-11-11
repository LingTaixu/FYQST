<?php
error_reporting(E_ALL);
require('../include/init.inc.php');
$method = $user_id = $selectServer = $orderByName = $orderByType = '';
$search = 0;
$outArr = $rechargeRank = $cache_user = $chooseChannel = array();
extract($_REQUEST, EXTR_IF_EXISTS);

$orderByList = [
    SORT_DESC => '从高到低',
    SORT_ASC => '从低到高',
];
$title = [
    'serverId' => '服务器',
    'avgCombat' => '前十名平均战力',
    'avgLvl' => '前十名平均等级',
    'maxCombat' => '第一名战力',
    'maxLvl' => '第一名等级',
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
        'limit' => 10
    ];
    foreach ($selectIds as $sid) {
        $users = GameUser::getAvgCombatInfo($sid, $params);
        if ($users) {
            foreach ($users as &$u) {
                $u['serverId'] = $sid;
            }
            $outArr[$sid] = $users[0];
        } else {
            $outArr[$sid] = [];
        }
    }

    array_multisort(array_column($outArr, $orderByName), intval($orderByType), $outArr);
}

Template::assign('serverDiv', $serverDiv);
Template::assign('orderByList', $orderByList);
Template::assign('title', $title);
Template::assign('outArr', $outArr);
Template::assign('_GET', $_GET);
Template::display('user/servers_combat.tpl');