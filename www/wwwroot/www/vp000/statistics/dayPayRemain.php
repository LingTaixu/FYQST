<?php
require('../include/init.inc.php');
$method = $selectServer = $startTime = $endTime = $dayNum = $bossType = '';
$search = 0;
$payUser = $outArr = $cache_recharge = $dayPayUser = array();

extract($_REQUEST, EXTR_IF_EXISTS);

$begin = $startTime = $startTime ? $startTime : '';
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$title = [
    'day' => '开服天数',
    'serverNum' => '达成服务器数',
    'newRole' => '新创角',
    'payUser' => '付费人数',
    'r2' => '付费次留',
    'r3' => '付费3留',
    'r4' => '付费4留',
    'r5' => '付费5留',
    'r6' => '付费6留',
    'r7' => '付费7留',
    'r8' => '付费8留',
    'r9' => '付费9留',
    'r10' => '付费10留',
    'r14' => '付费14留',
    'r30' => '付费30留',
];
$titleKey = array_keys($title);

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

if ($search) {
    $diff = Help::getDifferentDays($firstTime, $endTime);
    for ($i = 0; $i < $diff; $i++) {
        foreach ($selectIds as $sid) {
            $openTime = $servers[$sid]['serverDate'];
            $oneDiff = Help::getDifferentDays($openTime, $endTime);
            if ($oneDiff > $i) {
                $outArr[$i]['serverArray'][] = $sid;
                $outArr[$i]['serverNum']++;
            }
        }
    }

    $params = [
        'servers' => $selectIds,
        'start' => $startTime,
        'end' => $endTime,
    ];
    $recharge = RechargeRequest::getPayUsers($params);
    if ($recharge) {
        foreach ($recharge as $r) {
            if (!isset($cache_recharge[$r['userId']])) {
                $cache_recharge[$r['userId']] = $r;
            }
            if (strtotime($r['day']) < strtotime($cache_recharge[$r['userId']]['day'])) {
                $cache_recharge[$r['userId']] = $r;
            }
            $openTime = $servers[$r['serverId']]['serverDate'];
            $daysDiff = Help::getDifferentDays($openTime, $r['day'] . ' 23:59:59');//日期格式不统一，会产生-1
            if ($daysDiff >= 0) {
                $dayPayUser[$daysDiff][$r['userId']] = 1;
                $outArr[$daysDiff]['payUser'] ++;
            }
        }
    }
    $payUser = array_keys($cache_recharge);

    foreach ($selectIds as $sid) {
        $openTime = $servers[$sid]['serverDate'];
        //首日创角
        $firstParams = [
            'start' => $startTime,
            'end' => $endTime,
        ];
        $users = GameUser::getUserByDate($sid, $firstParams);
        foreach ($users as $row) {
            $cache_user[$row['id']] = $row;
            //找出角色创建时间
            $useCreateDay = $row['createTime'];
            //和outArr key有关的,取开服时间
            $daysDiff = Help::getDifferentDays($openTime, $useCreateDay);
            if (isset($outArr[$daysDiff])) {
                $outArr[$daysDiff]['newRole'] ++;
            }
        }

        //登录人数
        $params = [
            'servers' => $selectIds,
            'start' => $startTime,
            'end' => date('Y-m-d 00:00:00', strtotime($endTime) + 86400 * 30),//有30天后登录留存，做个预留
            'users' => $payUser
        ];
        $loginData = GameLogin::getRetain($sid, $params);
        foreach ($loginData as $row) {
            $loginDay = $row['day'];//登录日期
            $userId = $row['user_id'];//登录uid
            //找出角色首付时间
            $useJoin = $cache_recharge[$row['user_id']]['day'];

            $daysDiff = Help::getDifferentDays($useJoin, $loginDay);
            if ($daysDiff >= 0) {
                foreach ($dayPayUser as $diff => $userArr) {
                    if (isset($userArr[$userId])) {
                        $ok = 'retain' . ($daysDiff + 1);
                        $outArr[$diff][$ok] ++;
                    }
                }
            }
        }
    }

    ksort($outArr);
    foreach ($outArr as $k => &$v) {
        $v['day'] = $k + 1;
        $v['r2'] = $v['payUser'] == 0 ? 0 : sprintf("%.4f", $v['retain2'] / $v['payUser']) * 100;;
        $v['r3'] = $v['payUser'] == 0 ? 0 : sprintf("%.4f", $v['retain3'] / $v['payUser']) * 100;;
        $v['r4'] = $v['payUser'] == 0 ? 0 : sprintf("%.4f", $v['retain4'] / $v['payUser']) * 100;;
        $v['r5'] = $v['payUser'] == 0 ? 0 : sprintf("%.4f", $v['retain5'] / $v['payUser']) * 100;;
        $v['r6'] = $v['payUser'] == 0 ? 0 : sprintf("%.4f", $v['retain6'] / $v['payUser']) * 100;;
        $v['r7'] = $v['payUser'] == 0 ? 0 : sprintf("%.4f", $v['retain7'] / $v['payUser']) * 100;;
        $v['r8'] = $v['payUser'] == 0 ? 0 : sprintf("%.4f", $v['retain8'] / $v['payUser']) * 100;;
        $v['r9'] = $v['payUser'] == 0 ? 0 : sprintf("%.4f", $v['retain9'] / $v['payUser']) * 100;;
        $v['r10'] = $v['payUser'] == 0 ? 0 : sprintf("%.4f", $v['retain10'] / $v['payUser']) * 100;;
        $v['r14'] = $v['payUser'] == 0 ? 0 : sprintf("%.4f", $v['retain14'] / $v['payUser']) * 100;;
        $v['r30'] = $v['payUser'] == 0 ? 0 : sprintf("%.4f", $v['retain30'] / $v['payUser']) * 100;;
    }
}

if ($search == 2) {
    $fileName = '开服付费留存数据';
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
Template::display('statistics/dayPayRemain.tpl');

