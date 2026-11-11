<?php
require('../include/init.inc.php');
$method = $selectServer = $startTime = $endTime = $dayNum = $bossType = '';
$search = $outPut = 0;
$title = $data = $outArr = $theNewOut = array();

extract($_REQUEST, EXTR_IF_EXISTS);

$begin = $startTime = $startTime ? $startTime : '';
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$bossTypeList = [
    13 => '天命',
    14 => '中立',
    2 => '全民',
    18 => '深渊',
    16 => '异界',
];

$serversInfo = GameServerInfo::getAllServer();
$gameServerArr = $servers = [];
foreach ($serversInfo as $row) {
    $servers[$row['serverId']] = $row;
    $gameServerArr[] = $row['serverId'];
}
$firstTime = $servers[1]['serverDate'];

$serverDiv = Help::getServerInput($selectServer);
$selectServers = Help::getSelectedServers($gameServerArr, $selectServer);
$selectIds = $selectServers['selectId'];

if ($search == 1) {
    $title = [
        'day' => '开服天数',
        'serverNum' => '达成服务器数',
        'lvl' => 'boss等级',
        'avgNum' => '平均击杀个数',
        'nextAvgNum' => '次日平均击杀个数',
//    'allNum' => 'all个数',
//    'allTime' => 'all用时',
        'avgTime' => '平均用时',
//        'nextAvgTime' => '次日平均用时',
        'avgUsers' => '平均参与人数',
//        'nextAvgUsers' => '次日平均参与人数',
        'avgCombat' => '平均最高战力',
//        'nextAvgCombat' => '次日平均最高战力',
        'avgKill' => '平均死亡数',
//        'nextAvgKill' => '次日平均死亡数',
    ];
    $titleKey = array_keys($title);

    $diff = Help::getDifferentDays($firstTime, $endTime);
    for ($i = 0; $i < $diff; $i++) {
        foreach ($selectIds as $sid) {
            $openTime = $servers[$sid]['serverDate'];
            $oneDiff = Help::getDifferentDays($openTime, $endTime);
            if ($oneDiff >= $i) {
                $outArr[$i]['serverArray'][] = $sid;
                $outArr[$i]['serverNum']++;
            }
        }
    }

    $params = [
        'servers' => $selectIds,
        'start' => $startTime,
        'end' => $endTime,
        'bossType' => $bossType,
        'groupBy' => 'server_id,day,boss_id'
    ];
    $bossData = GameBoss::getBossByServer($params);

    if ($bossData) {
        foreach ($bossData as $b) {
            $theTime = $b['day'];
            $serverId = $b['server_id'];
            $openTime = $servers[$serverId]['serverDate'];

            $oneDiff = Help::getDifferentDays($openTime, $theTime . ' 23:59:59');//日期格式不统一，会产生-1

            if (isset($outArr[$oneDiff])) {
                $lvl = $CONFIG_BOSS_LEVEL[$b['boss_id']]['level'];
                $data[$oneDiff][$lvl]['allNum'] += $b['allNum'];
                $data[$oneDiff][$lvl]['allTime'] += $b['allTime'];
                $data[$oneDiff][$lvl]['allUsers'] += $b['users'];
                $data[$oneDiff][$lvl]['allCombat'] += $b['allCombat'];
                $data[$oneDiff][$lvl]['allKill'] += $b['allKill'];
                $data[$oneDiff][$lvl]['lvl'] = $lvl;
                $lastDiff = $oneDiff - 1;
                if (isset($data[$lastDiff])) {
                    $data[$lastDiff][$lvl]['nextNum'] += $b['allNum'];
                    $data[$lastDiff][$lvl]['nextTime'] += $b['allTime'];
                    $data[$lastDiff][$lvl]['nextUsers'] += $b['users'];
                    $data[$lastDiff][$lvl]['nextCombat'] += $b['allCombat'];
                    $data[$lastDiff][$lvl]['nextKill'] += $b['allKill'];
                }
            }
        }
    }

    ksort($outArr);
    foreach ($outArr as $k => $v) {
        if ($data[$k]) {
            foreach ($data[$k] as $lv => $item) {
                $nextDay = $k + 1;
                $theNewOut[] = [
                    'day' => $nextDay,
                    'serverNum' => $v['serverNum'],
                    'lvl' => $lv,
                    'allNum' => $item['allNum'],
                    'allTime' => $item['allTime'],
                    'avgNum' => sprintf("%.2f", $item['allNum'] / $v['serverNum']),
                    'avgTime' => sprintf("%.2f", $item['allTime'] / $item['allNum']),
                    'avgUsers' => sprintf("%.2f", $item['allUsers'] / $item['allNum']),
                    'avgCombat' => sprintf("%.2f", $item['allCombat'] / $item['allNum']),
                    'avgKill' => sprintf("%.2f", $item['allKill'] / $item['allNum']),
                    'nextAvgNum' => sprintf("%.2f", $item['nextNum'] / $outArr[$nextDay]['serverNum']),
                    'nextAvgTime' => sprintf("%.2f", $item['nextTime'] / $item['nextNum']),
                    'nextAvgUsers' => sprintf("%.2f", $item['nextUsers'] / $item['nextNum']),
                    'nextAvgCombat' => sprintf("%.2f", $item['nextCombat'] / $item['nextNum']),
                    'nextAvgKill' => sprintf("%.2f", $item['nextKill'] / $item['nextNum']),
                ];
            }
        }

    }
}

if ($search == 2) {
    $title = [
        'day' => '开服天数',
        'serverNum' => '达成服务器数',
        'avgNum' => '平均击杀个数',
        'nextAvgNum' => '次日平均击杀个数',
        'avgTime' => '平均用时',
        'nextAvgTime' => '次日平均用时',
        'avgUsers' => '平均参与人数',
        'nextAvgUsers' => '次日平均参与人数',
        'avgCombat' => '平均最高战力',
        'nextAvgCombat' => '次日平均最高战力',
        'avgKill' => '平均死亡数',
        'nextAvgKill' => '次日平均死亡数',
    ];
    $titleKey = array_keys($title);

    $diff = Help::getDifferentDays($firstTime, $endTime);
    for ($i = 0; $i < $diff; $i++) {
        foreach ($selectIds as $sid) {
            $openTime = $servers[$sid]['serverDate'];
            $oneDiff = Help::getDifferentDays($openTime, $endTime);
            if ($oneDiff >= $i) {
                $outArr[$i]['serverArray'][] = $sid;
                $outArr[$i]['serverNum']++;
            }
        }
    }

    $params = [
        'servers' => $selectIds,
        'start' => $startTime,
        'end' => $endTime,
        'bossType' => $bossType,
        'groupBy' => 'server_id,day'
    ];
    $bossData = GameBoss::getBossByServer($params);

    if ($bossData) {
        foreach ($bossData as $b) {
            $theTime = $b['day'];
            $serverId = $b['server_id'];
            $openTime = $servers[$serverId]['serverDate'];
            $oneDiff = Help::getDifferentDays($openTime, $theTime . ' 23:59:59');//日期格式不统一，会产生-1

            if (isset($outArr[$oneDiff])) {
                $data[$oneDiff]['allNum'] += $b['allNum'];
                $data[$oneDiff]['allTime'] += $b['allTime'];
                $data[$oneDiff]['allUsers'] += $b['users'];
                $data[$oneDiff]['allCombat'] += $b['allCombat'];
                $data[$oneDiff]['allKill'] += $b['allKill'];
                $data[$oneDiff]['bossNum'] = $b['bossNum'];
                $lastDiff = $oneDiff - 1;
                if (isset($data[$lastDiff])) {
                    $data[$lastDiff]['nextNum'] += $b['allNum'];
                    $data[$lastDiff]['nextTime'] += $b['allTime'];
                    $data[$lastDiff]['nextUsers'] += $b['users'];
                    $data[$lastDiff]['nextCombat'] += $b['allCombat'];
                    $data[$lastDiff]['nextKill'] += $b['allKill'];
                    $data[$lastDiff]['bossNum'] += $b['bossNum'];
                }
            }
        }
    }

    ksort($outArr);
    foreach ($outArr as $k => $item) {
        if ($data[$k]) {
            $nextDay = $k + 1;
            $theNewOut[] = [
                'day' => $nextDay,
                'serverNum' => $item['serverNum'],
                'allNum' => $data[$k]['allNum'],
                'allTime' => $data[$k]['allTime'],
                'avgNum' => sprintf("%.2f", $data[$k]['allNum'] / $item['serverNum']),
                'avgTime' => sprintf("%.2f", $data[$k]['allTime'] / $data[$k]['allNum']),
                'avgUsers' => sprintf("%.2f", $data[$k]['allUsers'] / $data[$k]['allNum']),
                'avgCombat' => sprintf("%.2f", $data[$k]['allCombat'] / $data[$k]['allNum']),
                'avgKill' => sprintf("%.2f", $data[$k]['allKill'] / $data[$k]['allNum']),
                'nextAvgNum' => sprintf("%.2f", $data[$k]['nextNum'] / $outArr[$nextDay]['serverNum']),
                'nextAvgTime' => sprintf("%.2f", $data[$k]['nextTime'] / $data[$k]['nextNum']),
                'nextAvgUsers' => sprintf("%.2f", $data[$k]['nextUsers'] / $data[$k]['nextNum']),
                'nextAvgCombat' => sprintf("%.2f", $data[$k]['nextCombat'] / $data[$k]['nextNum']),
                'nextAvgKill' => sprintf("%.2f", $data[$k]['nextKill'] / $data[$k]['nextNum']),
            ];
        }

    }
}

if ($outPut == 1) {
    if ($theNewOut) {
        $fileName = '开服boss数据';
        Help::writeExcel($fileName, $title, $theNewOut);
    }
    die();
}

// 设置模板变量
$group_options = UserGroup::getGroupForOptions();
$group_options[0] = "全部";
ksort($group_options);

Template::assign('serverDiv', $serverDiv);
Template::assign('title', $title);
Template::assign('boss_type_list', $bossTypeList);
Template::assign('startTime', $startTime);
Template::assign('endTime', $endTime);
Template::assign('outArr', $theNewOut);
Template::assign('group_options', $group_options);
Template::assign('_GET', $_GET);
Template::assign('page_html', $page_html);
Template::display('statistics/dayBoss.tpl');

