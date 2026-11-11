<?php
require('../include/init.inc.php');
$method = $selectServer = $startTime = $endTime = $dayNum = '';
$search = 0;
$data = $outArr = $cache_user = array();

extract($_REQUEST, EXTR_IF_EXISTS);

$begin = $startTime = $startTime ? $startTime : '';
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$title = [
    'day' => '开服天数',
    'serverNum' => '达成服务器数',
    'totalChargeNum' => '充值金额',
    'chargePersonNum' => '当日充值人数',
    'payRate' => '平均付费率',
    'arpu' => 'arpu',
    'arppu' => 'arppu值',
    'csb' => '当日创收比',
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
//    $allParam = [
//        'servers' => $selectIds,
//    ];
//    $allInfo = RechargeRequest::getAllInfo($allParam);
//    $allPayRole = $allInfo[0]['num'];
//    $allPayPrice = $allInfo[0]['allPrice'];
    $diff = Help::getDifferentDays($firstTime, $endTime);
    for ($i = 0; $i < $diff; $i++) {
        foreach ($selectIds as $sid) {
            $openTime = $servers[$sid]['serverDate'];
            $oneDiff = Help::getDifferentDays($openTime, $endTime);
            if ($oneDiff > $i) {
                $outArr[$i]['serverArray'][] = $sid;
                $outArr[$i]['serverNum'] ++;

            }
        }
    }

    $params = [
        'servers' => $selectIds,
        'start' => $startTime,
        'end' => $endTime,
    ];

    //充值人数
    $payUsers = RechargeRequest::getPayUsers($params);
    foreach ($payUsers as $row) {
        $sid = $row['serverId'];
        $openTime = $servers[$sid]['serverDate'];
        $price = $row['allPrice'];
        $payday = $row['day'];
//        $accountId = $row['accountId'];

        $daysDiff = Help::getDifferentDays($openTime, $payday . ' 23:59:59');//日期格式不统一，会产生-1
        if ($daysDiff >= 0) {
            $data[$daysDiff][$sid]['chargePersonNum'] ++;
            $data[$daysDiff][$sid]['totalChargeNum'] += $price;
            $outArr[$daysDiff]['chargePersonNum'] ++;
            $outArr[$daysDiff]['totalChargeNum'] += $price;
        }
    }

    foreach ($selectIds as $sid) {
        $openTime = $servers[$sid]['serverDate'];
        //创角
        $users = GameUser::getUserByDate($sid, $params);
        foreach ($users as $row) {
            $userCreate = $row['createTime'];
            //首日创角
            if (strtotime($startTime) <= strtotime($openTime) && strtotime($openTime) < strtotime($endTime)) {
                $daysDiff = Help::getDifferentDays($openTime, $userCreate);
                if (isset($outArr[$daysDiff])) {
                    $outArr[$daysDiff]['firstUsers'] ++;
                }
            }

            $cache_user[$row['id']] = $row;
        }
        //登录人数
        $loginData = GameLogin::getLoginUsers($sid, $params);
        foreach ($loginData as $row) {
            $loginDay = $row['day'];//登录日期
            $userId = $row['user_id'];//登录uid
//            $accountId = $cache_user[$userId]['accountId'];

            $daysDiff = Help::getDifferentDays($openTime, $loginDay . ' 23:59:59');//日期格式不统一，会产生-1
            if (!isset($data[$daysDiff][$sid]['loginUser'])) $data[$daysDiff][$sid]['loginUser'] = [];
            if ($daysDiff >= 0) {
                if (!isset($data[$daysDiff][$sid]['loginUser'][$userId])) {
                    $data[$daysDiff][$sid]['loginUser'][$userId] = 1;
                    $outArr[$daysDiff]['loginUserNum'] ++;
                }
            }
        }
    }

    ksort($data);
    $payRate = $arpu = $arppu = array();
    foreach ($data as $dayKey => $dayItem) {
        foreach ($dayItem as $sidItem) {
            if (!empty($sidItem['loginUser']) && $sidItem['chargePersonNum']) {
                $payRate[$dayKey]['sum'] += $sidItem['chargePersonNum'];
                $payRate[$dayKey]['count'] += count($sidItem['loginUser']);
                $arpu[$dayKey]['sum'] += $sidItem['totalChargeNum'];
                $arpu[$dayKey]['count'] += count($sidItem['loginUser']);
            }
            if ($sidItem['chargePersonNum']) {
                $arppu[$dayKey]['sum'] += $sidItem['totalChargeNum'];
                $arppu[$dayKey]['count'] += $sidItem['chargePersonNum'];
            }
        }
    }

    ksort($outArr);
    foreach ($outArr as $k => &$v) {
        if ($data[$k]) {
            $v['day'] = $k + 1;
            $v['payRate'] = sprintf("%.4f", $payRate[$k]['sum'] / $payRate[$k]['count']) * 100;
            $v['arpu'] = sprintf("%.2f", $arpu[$k]['sum'] / $arpu[$k]['count']);
            $v['arppu'] = sprintf("%.2f", $arppu[$k]['sum'] / $arppu[$k]['count']);
            $v['csb'] =$v['firstUsers'] ? sprintf("%.2f", $v['totalChargeNum'] / $v['firstUsers']) : 0;
        }
    }
}

if ($search == 2) {
    $fileName = '开服运营数据';
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
Template::display('statistics/dayPayData.tpl');

