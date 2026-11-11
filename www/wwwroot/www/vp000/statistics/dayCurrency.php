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
    'rechargeGet' => '氪金产出量',
    'allGet' => '总产出量',
    'avgGet' => '平均产出量',
    'allCost' => '消耗量',
    'serverHave' => '总存量',
    'avgHave' => '平均存量',
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
                $outArr[$i]['serverNum'] ++;
            }
        }
    }

    foreach ($selectIds as $sid) {
        $openTime = $servers[$sid]['serverDate'];
        $params = [
            'start' => $startTime,
            'end' => $endTime,
        ];
        $curData = CurrencyDiamondLog::getDiamondByDay($sid, $params);
        if ($curData) {
            foreach ($curData as $cur) {
                $theTime = $cur['day'];
                $sub = $cur['sub_op'];
                $oneDiff = Help::getDifferentDays($openTime, $theTime . ' 23:59:59');//日期格式不统一，会产生-1
                if (isset($outArr[$oneDiff])) {
                    if ($sub == 'cost') {
                        $outArr[$oneDiff]['allCost'] += $cur['allNum'];
                    }
                    if ($sub == 'get') {
                        $outArr[$oneDiff]['allGet'] += $cur['allNum'];
                    }
                }
            }
        }

        //登录人数
        $loginData = GameLogin::getLoginUsers($sid, $params);
        foreach ($loginData as $row) {
            $loginDay = $row['day'];//登录日期
            $userId = $row['user_id'];//登录uid
//            $accountId = $cache_user[$userId]['accountId'];

            $daysDiff = Help::getDifferentDays($openTime, $loginDay . ' 23:59:59');//日期格式不统一，会产生-1
            if ($daysDiff >= 0) {
                $outArr[$daysDiff]['loginUserNum'] ++;
            }
        }
    }

    $params = [
        'servers' => $selectIds,
        'start' => $startTime,
        'end' => $endTime,
    ];
    $recharge = RechargeRequest::getPayByServer($params);
    if ($recharge) {
        foreach ($recharge as $rec) {
            $serverId = $rec['serverId'];
            $price = $rec['allPrice'];
            $num = $rec['allNum'];
            $payTime = $rec['day'];
            $openTime = $servers[$serverId]['serverDate'];
            $daysDiff = Help::getDifferentDays($openTime, $payTime . ' 23:59:59');//日期格式不统一，会产生-1
            if ($daysDiff >= 0) {
                $outArr[$daysDiff]['rechargeGet'] += $price * $num;
            }
        }
    }

    ksort($outArr);
    $theHave = 0;
    foreach ($outArr as $k => &$v) {
        $v['day'] = $k + 1;
        $v['avgGet'] = sprintf("%.2f", $v['allGet'] / $v['loginUserNum']);
        $v['allHave'] = $v['allGet'] + $v['rechargeGet'] + $theHave - $v['allCost'];
        $v['serverHave'] = sprintf("%.2f", $v['allHave'] / $v['serverNum']);
        $v['avgHave'] = sprintf("%.2f", $v['allHave'] / $v['loginUserNum']);
        $theHave = $v['allHave'];
    }
}

if ($search == 2) {
    $fileName = '开服购买数据';
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
Template::display('statistics/dayCurrency.tpl');

