<?php
require('../include/init.inc.php');
$method = $user_id = $selectServer = $startTime = $endTime = $bossType = '';
$page_no = $row_count = $search = 0;
$outArr = $rechargeRank = $cache_user = array();
extract($_REQUEST, EXTR_IF_EXISTS);

$startTime = $startTime ? $startTime : date('Y-m-d 00:00:00', time() - 86400 * 7);
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$bossTypeList = [
    13 => '天命',
    14 => '中立',
    2 => '全民',
    18 => '深渊',
    16 => '异界',
    17 => '跨服天命',
];
$title = [
//    'born_time_str' => '刷新时刻',
//    'server_id' => '服务器',
//    'boss_type_str' => 'boss类型',
//    'boss_level' => 'boss等级',
//    'kill_time' => '击杀用时(秒)',
//    'user_num' => '参与人数',
//    'max_combat' => '参与的最高战力',
//    'kill_num' => '玩家被击杀次数',

    'day' => '战斗日期',
    'boss_type_str' => 'boss类型',
    'boss_level' => 'boss等级',
    'boss_id' => 'bossID',
    'allNum' => '战斗次数',
    'kill_time_avg' => '平均击杀用时(秒)',
    'users' => '总参与人数',
    'max_combat_avg' => '平均参与的最高战力',
    'kill_num_avg' => '玩家平均被击杀次数',
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
        'bossType' => $bossType,
        'start' => $startTime,
        'end' => $endTime,
        'groupBy' => ['day', 'boss_id']
    ];
    $outArr = GameBoss::getBossByServer($params);
    if ($outArr) {
        foreach ($outArr as &$out) {
            $out['boss_type_str'] = $bossTypeList[$out['boss_type']] ? $bossTypeList[$out['boss_type']] : $out['boss_type'];
//            $out['born_time_str'] = date('Y-m-d H:i:s', $out['born_time']);
            $out['boss_level'] = $CONFIG_BOSS_LEVEL[$out['boss_id']]['level'];

            $out['kill_time_avg'] = $out['allNum'] == 0 ? 0 : sprintf("%.2f", $out['allTime'] / $out['allNum']);
            $out['max_combat_avg'] = $out['allNum'] == 0 ? 0 : sprintf("%.2f", $out['allCombat'] / $out['allNum']);
            $out['kill_num_avg'] = $out['allNum'] == 0 ? 0 : sprintf("%.2f", $out['allKill'] / $out['allNum']);
        }
    }
}

if ($search == '2') {
    $file_name = 'boss击杀统计';
    Help::writeExcel($file_name, $title, $outArr);
    exit();
}

Template::assign('serverDiv', $serverDiv);
Template::assign('title', $title);
Template::assign('startTime', $startTime);
Template::assign('endTime', $endTime);
Template::assign('boss_type_list', $bossTypeList);
Template::assign('outArr', $outArr);
Template::assign('_GET', $_GET);
Template::display('statistics/bossStatistic.tpl');
