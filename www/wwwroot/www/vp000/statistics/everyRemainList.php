<?php
require('../include/init.inc.php');
ini_set('memory_limit', '8024M');
ini_set('max_execution_time', '90');
$method = $startTime = $endTime = '';
$search = 0;
$selectIds = $outArr = $cache_user = $ltvArray = $servers = array();
$selectServer = '';
extract($_REQUEST, EXTR_IF_EXISTS);

$lvlArr = [30, 60, 80, 90];
$ltvDay = [1, 2, 3];
$title = [
    'server' => '服务器',
    'openDay' => '日期',
    'newRole' => '首日创角',
    'lvl30' => '超过30级用户',
    'lvl60' => '超过60级用户',
    'lvl80' => '超过80级用户',
    'lvl90' => '超过90级用户',
    'ltv1' => 'ltv1',
    'ltv2' => 'ltv2',
    'ltv3' => 'ltv3',
    'r2' => '次留',
    'r3' => '3留',
    'r4' => '4留',
    'r5' => '5留',
    'r6' => '6留',
    'r7' => '7留',
    'r8' => '8留',
    'r9' => '9留',
    'r10' => '10留',
    'r11' => '11留',
];

//$startMemory = memory_get_usage(true);
//$startTimeTTT = microtime(TRUE);

$serversInfo = GameServerInfo::getAllServer();
$gameServerArr = [];
foreach ($serversInfo as $row) {
    $servers[$row['serverId']] = $row;
    $gameServerArr[] = $row['serverId'];
}
$serverDiv = Help::getServerInput($selectServer);
$selectServers = Help::getSelectedServers($gameServerArr, $selectServer);
$selectIds = $selectServers['selectId'];

if ($search) {
    foreach ($selectIds as $sid) {
        $openTime = $servers[$sid]['serverDate'];
        $outArr[$sid]['openDay'] = $openTime;
        $outArr[$sid]['openDayStr'] = date('Y-m-d', strtotime($openTime));
        //创角
        $params = [
            'start' => $openTime,
            'end' => date('Y-m-d 00:00:00', strtotime($openTime) + 86400 * 1)
        ];
        $users = GameUser::getUserByDate($sid, $params);
        foreach ($users as $row) {
            $lvl = $row['lvl'];
            $outArr[$sid]['newRole']++;
            $cache_user[$row['id']] = $row;
            $cache_user[$row['id']]['serverId'] = $sid;
            foreach ($lvlArr as $l) {
                if ($lvl >= $l) {
                    $lk = 'lvl' . $l;
                    $outArr[$sid][$lk]++;
                }
            }
        }
        //总账号活跃
        $remainParams = [
            'start' => $openTime,
            'end' => date('Y-m-d 00:00:00', strtotime($openTime) + 86400 * 15),//有14天后登录留存，做个预留
        ];
        $retainData = GameLogin::getRetain($sid, $remainParams);
        foreach ($retainData as $row) {
            //找出角色创建时间
            $useCreateDay = $cache_user[$row['user_id']]['theDate'];
            $loginDay = $row['day'];

            if (!empty($useCreateDay) && $loginDay > $useCreateDay) {
                //次留  三留	七留	 十四留
                $daysDiff = Help::getDifferentDays($useCreateDay, $loginDay);
                switch ($daysDiff) {
                    case 1://次留
                        $outArr[$sid]['liucun2']++;
                        break;
                    case 2://三留
                        $outArr[$sid]['liucun3']++;
                        break;
                    case 3://4留
                        $outArr[$sid]['liucun4']++;
                        break;
                    case 4://5留
                        $outArr[$sid]['liucun5']++;
                        break;
                    case 5://6留
                        $outArr[$sid]['liucun6']++;
                        break;
                    case 6://七留
                        $outArr[$sid]['liucun7']++;
                        break;
                    case 7://8留
                        $outArr[$sid]['liucun8']++;
                        break;
                    case 8://9留
                        $outArr[$sid]['liucun9']++;
                        break;
                    case 9://10留
                        $outArr[$sid]['liucun10']++;
                        break;
                    case 10://11留
                        $outArr[$sid]['liucun11']++;
                        break;
                }
            }
        }
//        $costTime = microtime(TRUE) - $startTimeTTT;
//        $costM = (memory_get_usage(true) - $startMemory)/ 1024 / 1024;
//        echo $sid.'耗时：'.$costTime.'秒   内存使用:'.$costM. " MB<br />";
    }

    ksort($outArr);

    $param = [
        'servers' => $selectIds
    ];
    $payTotal = RechargeRequest::getPriceByDay($param);
    foreach ($payTotal as $row) {
        $theDate = $row['day'];
        $useCreateDay = $cache_user[$row['userId']]['theDate'];
        $serverId = $cache_user[$row['userId']]['serverId'];
        $price = $row['goodsPrice'];
        //要开服当日的
        if ($outArr[$serverId]['openDayStr'] == $useCreateDay) {
            $daysDiff = Help::getDifferentDays($useCreateDay, $row['day']);
            $ltvArray[$serverId][$daysDiff + 1] += $price;
        }
    }

    $allTotalChargeNum = $allRegNum = $allCreateRoleNum = 0;
    foreach ($outArr as $k => &$v) {
        $v['server'] = $k;
        $v['r2'] = $v['newRole'] == 0 ? 0 : sprintf("%.4f", $v['liucun2'] / $v['newRole']) * 100;
        $v['r3'] = $v['newRole'] == 0 ? 0 : sprintf("%.4f", $v['liucun3'] / $v['newRole']) * 100;
        $v['r4'] = $v['newRole'] == 0 ? 0 : sprintf("%.4f", $v['liucun4'] / $v['newRole']) * 100;
        $v['r5'] = $v['newRole'] == 0 ? 0 : sprintf("%.4f", $v['liucun5'] / $v['newRole']) * 100;
        $v['r6'] = $v['newRole'] == 0 ? 0 : sprintf("%.4f", $v['liucun6'] / $v['newRole']) * 100;
        $v['r7'] = $v['newRole'] == 0 ? 0 : sprintf("%.4f", $v['liucun7'] / $v['newRole']) * 100;
        $v['r8'] = $v['newRole'] == 0 ? 0 : sprintf("%.4f", $v['liucun8'] / $v['newRole']) * 100;
        $v['r9'] = $v['newRole'] == 0 ? 0 : sprintf("%.4f", $v['liucun9'] / $v['newRole']) * 100;
        $v['r10'] = $v['newRole'] == 0 ? 0 : sprintf("%.4f", $v['liucun10'] / $v['newRole']) * 100;
        $v['r11'] = $v['newRole'] == 0 ? 0 : sprintf("%.4f", $v['liucun11'] / $v['newRole']) * 100;
        foreach ($ltvDay as $dayNum) {
            $allChv = 0;
            foreach ($ltvArray[$k] as $chk => $chv) {
                $allChv += $chv;
                if ($dayNum == $chk) {
                    $outKey = 'ltv' . $dayNum;
                    $v[$outKey] = $v['newRole'] == 0 ? 0 : sprintf("%.2f", $allChv / $v['newRole']);
                }
            }
        }
    }
}

if ($search == 2) {
    $fileName = '各服留存数据';
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
Template::display('statistics/everyRemainList.tpl');

