<?php
require('../include/init.inc.php');
ini_set('memory_limit', '8024M');
ini_set('max_execution_time', '180');
$method = $startTime = $endTime = '';
$search = $allPayRole = $allPayPrice = 0;
$outArr = $cache_user = $serverDatePayUsers = $createRoleRecharge = $oldAccountLogin = $newRoleLogin = $newAllPay = $ltvArray = array();
$chooseServer = $selectServer = '';
extract($_REQUEST, EXTR_IF_EXISTS);

$startMemory = memory_get_usage(true);
$startTimeTTT = microtime(TRUE);
$startTime = $startTime ? $startTime : date('Y-m-d 00:00:00', time() - 86400 * 7);
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$ltvDay = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
$title = [
    'date' => '日期',
    'createRoleNum' => '总创角',
    'oldAccountCreateRoleNum' => '老号创角',
    'newAccountCreateRoleNum' => '新号创角',
//    'rate' => '转化率',
    'loginNum' => '登录人数',
    'oldUserloginNum' => '老用户',
    'activeRechargePersonNum' => '活跃付费用户',
    'chargePersonNum' => '充值人数',
    'payDau' => '活跃用户付费率',
    'totalChargeNum' => '充值金额',
    'newAccountChargeNum' => '新账号充值',
    'newAccountChargePersonNum' => '新充值人数',
    'oldAccountChargeNum' => '老账号充值',
    'arpu' => 'arpu',
    'arppu' => 'arppu值',
    'r2' => '次留',
    'r3' => '三留',
    'r7' => '七留',
    'r14' => '十四留',
    'firstCsb' => '首日创收比',
    'ltv1' => 'ltv1',
    'ltv2' => 'ltv2',
    'ltv3' => 'ltv3',
    'ltv4' => 'ltv4',
    'ltv5' => 'ltv5',
    'ltv6' => 'ltv6',
    'ltv7' => 'ltv7',
    'ltv8' => 'ltv8',
    'ltv9' => 'ltv9',
    'ltv10' => 'ltv10',
    'ltv11' => 'ltv11',
    'ltv12' => 'ltv12',
    'ltv13' => 'ltv13',
    'ltv14' => 'ltv14',
    'chuangshoubi' => '总创收比',
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
    $cache_account = GameAccount::getAccount($selectIds);

    $allParam = [
        'servers' => $selectIds,
    ];
    $allInfo = RechargeRequest::getAllInfo($allParam);
    $allPayRole = $allInfo[0]['num'];
    $allPayPrice = $allInfo[0]['allPrice'];

//    $costTime = microtime(TRUE) - $startTimeTTT;
//    $costM = (memory_get_usage(true) - $startMemory)/ 1024 / 1024;
//    echo '0耗时：'.$costTime.'秒   内存使用:'.$costM. " MB<br />";exit;

    $params = [
        'servers' => $selectIds,
        'start' => $startTime,
        'end' => $endTime,
    ];
    //充值人数
    $payUsers = RechargeRequest::getPayUsers($params);
    if ($payUsers) {
        foreach ($payUsers as $row) {
            $price = $row['allPrice'];
            $outArr[$row['day']]['chargePersonNum']++;
            $serverDatePayUsers[$row['serverId']][$row['day']][$row['userId']] += $price;
        }
    }
//    $costTime = microtime(TRUE) - $startTimeTTT;
//    $costM = (memory_get_usage(true) - $startMemory)/ 1024 / 1024;
//    echo '0耗时：'.$costTime.'秒   内存使用:'.$costM. " MB<br />";exit;

    $cache_user = [];
    foreach ($selectIds as $sid) {
        //总创角
        $allRoles = GameUser::getAllUsersByDate($sid, $params);
        foreach ($allRoles as $row) {
            $outArr[$row['theDate']]['createRoleNum'] += $row['num'];
        }
        //创角
        $users = GameUser::getUserByDate($sid);
        foreach ($users as $row) {
            $theDate = $row['theDate'];
            if (!isset($outArr[$theDate]['oldAccountCreateRoleNum'])) $outArr[$theDate]['oldAccountCreateRoleNum'] = 0;
            if (!isset($outArr[$theDate]['newAccountCreateRoleNum'])) $outArr[$theDate]['newAccountCreateRoleNum'] = 0;
            $cache_user[$row['id']] = $row;
            if ($theDate > $cache_account[$row['accountId']]['day']) {
                //老号
                $outArr[$theDate]['oldAccountCreateRoleNum']++;
                if (isset($serverDatePayUsers[$sid][$theDate][$row['id']])) {
                    $createRoleRecharge[$theDate] += $serverDatePayUsers[$sid][$theDate][$row['id']];
                }
            } else {
                //新号
                $outArr[$theDate]['newAccountCreateRoleNum']++;
            }
        }
        //登录人数
        $exist = GameLogin::showTable($sid);
        if ($exist) {
            $loginData = GameLogin::getLogin($sid, $params);
            if ($loginData) {
                foreach ($loginData as $row) {
                    $outArr[$row['day']]['loginNum'] += $row['num'];
                }
            }
        }
    }

//    $costTime = microtime(TRUE) - $startTimeTTT;
//    $costM = (memory_get_usage(true) - $startMemory)/ 1024 / 1024;
//    echo '0耗时：'.$costTime.'秒   内存使用:'.$costM. " MB<br />";exit;

    //充值金额
    $cache_recharge = [];
    $roleRecharge = [];
    $rechargeParams = [
        'servers' => $selectIds,
        'start' => $startTime,
        'end' => date('Y-m-d 00:00:00', strtotime($endTime) + 86400 * sizeof($ltvDay)),//有14天后登录留存，做个预留
    ];
    $payTotal = RechargeRequest::getPriceByDay($rechargeParams);
    foreach ($payTotal as $row) {
        $theDate = $row['day'];
        if (!isset($outArr[$theDate]['oldAccountChargeNum'])) $outArr[$theDate]['oldAccountChargeNum'] = 0;
        if (!isset($outArr[$theDate]['newAccountChargeNum'])) $outArr[$theDate]['newAccountChargeNum'] = 0;
        //充值表缓存
        $accountCreate = $cache_account[$row['accountId']]['day'];
        $cache_recharge[$row['userId']][] = $row;
        $price = $row['goodsPrice'];
        $roleRecharge[$row['userId']] += $price;
        $outArr[$theDate]['totalChargeNum'] += $price;
        if (strtotime($row['day']) > strtotime($cache_account[$row['accountId']]['day'])) {
            //老号
            $outArr[$row['day']]['oldAccountChargePersonNum']++;
            $outArr[$row['day']]['oldAccountChargeNum'] += $price;
        } else {
            //新号
            $outArr[$row['day']]['newAccountChargePersonNum']++;
            $outArr[$row['day']]['newAccountChargeNum'] += $price;
        }
//        if ($row['day'] >= $startStr && $row['day'] <=  $endStr) {
//            $outArr[$row['day']]['totalChargeNum'] += $price;
//        }
        $daysDiff = Help::getDifferentDays($accountCreate, $row['day']);
        $ltvArray[$accountCreate][$daysDiff + 1] += $price;
    }


    //老号|新号|活跃付费用户|次留  三留	七留	 十四留
    $remainParams = [
        'start' => $startTime,
        'end' => date('Y-m-d 00:00:00', strtotime($endTime) + 86400 * 15),//有14天后登录留存，做个预留
    ];
    foreach ($selectIds as $sid) {
        $exist = GameLogin::showTable($sid);
        if (empty($exist)) {
            continue;
        }
        $retainData = GameLogin::getRetain($sid, $remainParams);
        foreach ($retainData as $row) {
            if (!isset($outArr[$row['day']]['oldUserloginNum'])) $outArr[$row['day']]['oldUserloginNum'] = 0;
            if (!isset($outArr[$row['day']]['newUserloginNum'])) $outArr[$row['day']]['newUserloginNum'] = 0;
            if (!isset($newRoleLogin[$row['day']])) $newRoleLogin[$row['day']] = [];
            //找出角色创建时间
            $useCreateDay = $cache_user[$row['user_id']]['theDate'];
            $loginDay = $row['day'];
            //活跃付费用户
            if (!empty($cache_recharge[$row['user_id']])) {
                foreach ($cache_recharge[$row['user_id']] as $recharge_row) {
                    if ($loginDay >= $recharge_row['day']) {
                        $outArr[$loginDay]['activeRechargePersonNum']++;
                        break;
                    }
                }
            }

            if ($loginDay > $useCreateDay) {
                //老号
                $outArr[$loginDay]['oldUserloginNum']++;
                //次留  三留	七留	 十四留
                //echo '<br />'.'登录日期'.$loginDay.'玩家创建时间'.$useCreateDay;
                $daysDiff = Help::getDifferentDays($useCreateDay, $loginDay);
                //echo '<br />'.$daysDiff;
                switch ($daysDiff) {
                    case 1://次留
                        $outArr[$useCreateDay]['liucun2']++;
                        break;
                    case 2://三留
                        $outArr[$useCreateDay]['liucun3']++;
                        break;
                    case 3://4留
                        $outArr[$useCreateDay]['liucun4']++;
                        break;
                    case 4://5留
                        $outArr[$useCreateDay]['liucun5']++;
                        break;
                    case 5://6留
                        $outArr[$useCreateDay]['liucun6']++;
                        break;
                    case 6://七留
                        $outArr[$useCreateDay]['liucun7']++;
                        break;
                    case 13://十四留
                        $outArr[$useCreateDay]['liucun14']++;
                        break;
                }
            } else {
                //新号
                $outArr[$loginDay]['newUserloginNum']++;
                if (strtotime($useCreateDay) >= strtotime($startTime) && strtotime($useCreateDay) < strtotime($endTime)) {
//                if (!in_array($row['user_id'], $newRoleLogin[$useCreateDay])) {
//                    $newRoleLogin[$useCreateDay][] = $row['user_id'];
//                    $newAllPay[$useCreateDay] += $roleRecharge[$row['user_id']];
//                }
                    if (!isset($newAccountLogin[$useCreateDay][$accountId])) {
                        $newAccountLogin[$useCreateDay][$accountId] = 1;
//                        $newAllPay[$useCreateDay] += $roleRecharge[$row['user_id']];
                    }
                }
            }
        }
    }

    ksort($outArr);
    foreach ($outArr as $k => &$v) {
        if (strtotime($k) >= strtotime($startTime) && strtotime($k) < strtotime($endTime)) {
            $v['date'] = $k;
            $v['oldAccountLogin'] = sizeof($oldAccountLogin[$k]);
            $v['oldUserlogin'] = sizeof($v['oldUserlogin']);
//            $v['rate'] = $v['regNum'] == 0 ? 0 : sprintf("%.4f", $v['newAccountCreateRoleNum'] / $v['regNum']) * 100;
            $v['payDau'] = $v['loginNum'] == 0 ? 0 : sprintf("%.4f", $v['chargePersonNum'] / $v['loginNum']) * 100;
            $v['arpu'] = $v['loginNum'] == 0 ? 0 : sprintf("%.2f", $v['totalChargeNum'] / $v['loginNum']);
            $v['arppu'] = $v['chargePersonNum'] == 0 ? 0 : sprintf("%.2f", $v['totalChargeNum'] / $v['chargePersonNum']);
            $v['r2'] = $v['newUserloginNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun2'] / $v['newUserloginNum']) * 100;
            $v['r3'] = $v['newUserloginNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun3'] / $v['newUserloginNum']) * 100;
            $v['r7'] = $v['newUserloginNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun7'] / $v['newUserloginNum']) * 100;
            $v['r14'] = $v['newUserloginNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun14'] / $v['newUserloginNum']) * 100;
            $v['firstCsb'] = $v['newAccountCreateRoleNum'] == 0 ? 0 : sprintf("%.2f", $v['newAccountChargeNum'] / $v['newAccountCreateRoleNum']);
            foreach ($ltvDay as $dayNum) {
                $allChv = 0;
                foreach ($ltvArray[$k] as $chk => $chv) {
                    $allChv += $chv;
                    if ($dayNum == $chk) {
                        $outKey = 'ltv' . $dayNum;
                        $v[$outKey] = $v['newUserloginNum'] == 0 ? 0 : sprintf("%.2f", $allChv / $v['newUserloginNum']);
                    }
                }
            }
            $daysDiff = Help::getDifferentDays($k, date('Y-m-d', time()));
            $chk = $daysDiff < sizeof($ltvDay) ? $daysDiff : sizeof($ltvDay);
            for ($i = 2; $i <= $chk; $i ++) {
                $outKey = 'ltv' . $i;
                if (!isset($v[$outKey])) {
                    $lastOutKey = 'ltv' . ($i - 1);
                    $v[$outKey] = $v[$lastOutKey];
                }
            }

            $v['chuangshoubi'] = $v['newAccountCreateRoleNum'] == 0 ? 0 : sprintf("%.2f", $v['newAccountChargeNum'] / $v['newAccountCreateRoleNum']);
        } else {
            unset($outArr[$k]);//超出查询范围的删了
            continue;
        }
    }
    krsort($outArr);
}

if ($search == 2) {
    $fileName = '各服运营数据';
    Help::writeExcel($fileName, $title, $outArr);
    die();
}

// 设置模板变量
$group_options = UserGroup::getGroupForOptions();
$group_options[0] = "全部";
ksort($group_options);

Template::assign('serverDiv', $serverDiv);
//Template::assign('serverSelect', $serverSelect);
Template::assign('title', $title);
Template::assign('startTime', $startTime);
Template::assign('endTime', $endTime);
Template::assign('allPayRole', $allPayRole);
Template::assign('allPayPrice', $allPayPrice);
Template::assign('outArr', $outArr);
Template::assign('group_options', $group_options);
Template::assign('_GET', $_GET);
Template::assign('page_html', $page_html);
Template::display('statistics/everyTotalData.tpl');

