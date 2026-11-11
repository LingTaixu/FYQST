<?php
require('../include/init.inc.php');
$method = $selectServer = $startTime = $endTime = $dayNum = '';
$search = 0;
$data = $outArr = $loginArr = $cache_user = $cache_recharge = array();

extract($_REQUEST, EXTR_IF_EXISTS);

$begin = $startTime = $startTime ? $startTime : '';
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$packageList = [
    1994 => '高阶称号礼包',
    1995 => '神宠达成礼包',
    1996 => '乐透大奖礼包',
];
$title = [
    'name' => '礼包名称',
    'personNum' => '购买人数',
    'payAvg' => '占付费玩家占比',
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
    $params = [];
    $recharge = RechargeRequest::getPayUsers($params);
    if ($recharge) {
        foreach ($recharge as $r) {
            if (!isset($cache_recharge[$r['userId']])) {
                $cache_recharge[$r['userId']] = $r;
            }
        }
    }
    $params = [
        'itemIds' => array_keys($packageList)
    ];
    foreach ($selectIds as $sid) {
        $openTime = $servers[$sid]['serverDate'];

        $data = CurrencyDScoreLog::getDataByItemId($sid, $params);
        if ($data) {
            foreach ($data as $value) {
                foreach ($packageList as $actId => $actName) {
                    if ($actId == $value['item_id']) {
                        $outArr[$actId]['name'] = $actName;
                        $outArr[$actId]['personNum'] += $value['users'];
                    }
                }
            }
        }

        //登录人数
        $params = [
            'start' => $openTime,
            'end' => date('Y-m-d 00:00:00', strtotime($openTime) + 86400 * 8),
        ];
        $loginData = GameLogin::getRetain($sid, $params);
        foreach ($loginData as $row) {
            $loginDay = $row['day'];//登录日期
            $userId = $row['user_id'];//登录uid
            $loginArr[$userId] = 1;
        }
    }

    foreach ($outArr as &$out) {
        $out['payNum'] = sizeof($cache_recharge);
        $out['payAvg'] = $out['personNum'] == 0 ? 0 : sprintf("%.4f", $out['personNum'] / $out['payNum']) * 100;
    }

//    array_multisort(array_column($outArr, 'day'), SORT_ASC, $outArr);
}

if ($search == 2) {
    $fileName = '嘉年华数据';
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
Template::display('secAct/alchemistExchange.tpl');

