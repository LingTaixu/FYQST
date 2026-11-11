<?php
require('../include/init.inc.php');
ini_set('memory_limit', '8024M');
ini_set('max_execution_time', '90');
$method = $startTime = $endTime = '';
$search = 0;
$selectIds = $outArr = $cache_user = $cache_recharge = $data = array();
$selectServer = '';
extract($_REQUEST, EXTR_IF_EXISTS);

$roleRecharge = $oldAllPay = $newAllPay = $newAccountLogin = $oldAccountLogin = $newRole = $oldRole = [];
$startTime = $startTime ? $startTime : '';
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$startTimeStamp = strtotime($startTime);
$endTimeStamp = strtotime($endTime);
$startStr = date('Y-m-d', $startTimeStamp);
$endStr = date('Y-m-d', $endTimeStamp);

$title = [
    'date' => '日期',
    'newRole' => '新号创角',
    'oldRole' => '老号创角',
    'newChangeRate' => '新号充值率',
    'oldChangeRate' => '老号充值率',
//    'newArpu' => '新号arpu',
    'newArppu' => '新号arppu',
    'oldArppu' => '老号arppu',
    'newAccountChargePersonNum' => '新号充值',
    'newPayTimes' => '新号充值次数',
    'newAccountChargeNum' => '新号充值金额',
    'oldAccountChargePersonNum' => '老号充值',
    'oldPayTimes' => '老号充值次数',
    'oldAccountChargeNum' => '老号充值金额',
    'newAccountChargePersonNum1' => '新号充值',
    'newOver1' => '新号1次以上付费率',
    'new1' => '新号充值1次',
    'new2' => '新号充值2次',
    'new3' => '新号充值3次',
    'new4' => '新号充值4次',
    'new5' => '新号充值5次',
    'oldAccountChargePersonNum1' => '老号充值',
    'oldOver1' => '老号1次以上付费率',
    'old1' => '老号充值1次',
    'old2' => '老号充值2次',
    'old3' => '老号充值3次',
    'old4' => '老号充值4次',
    'old5' => '老号充值5次',
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
    $cache_account = GameAccount::getAccount();

    $params = [
        'servers' => $selectIds,
        'start' => $startTime,
        'end' => $endTime,
    ];
    //支付
    $payAccount = RechargeRequest::getPayAccounts($params);

    foreach ($payAccount as $row) {
        $times = $row['times'];
        $price = $row['goodsPrice'];
        $payTime = $row['day'];
        $accountCreate = $cache_account[$row['accountId']]['day'];

        $diff = Help::getDifferentDays($accountCreate, $payTime);
        if ($diff > 0) {
            $old = 'old' . $times;
            $outArr[$payTime][$old] ++;
        } else {
            $new = 'new' . $times;
            $outArr[$payTime][$new] ++;
        }
    }

    $payTotal = RechargeRequest::getPayUsers($params);
    foreach ($payTotal as $row) {
        $theDate = $row['day'];
        if (!isset($outArr[$theDate]['oldAccountChargeNum'])) $outArr[$theDate]['oldAccountChargeNum'] = 0;
        if (!isset($outArr[$theDate]['newAccountChargeNum'])) $outArr[$theDate]['newAccountChargeNum'] = 0;
        //充值表缓存
        $accountCreate = $cache_account[$row['accountId']]['day'];
        $cache_recharge[$row['userId']][] = $row;
        $price = $row['allPrice'];
        $times = $row['times'];
        $roleRecharge[$row['userId']] += $price;
        $outArr[$theDate]['totalChargeNum'] += $price;
        if ($row['day'] > $cache_account[$row['accountId']]['day']) {
            //老号
            $outArr[$row['day']]['oldAccountChargePersonNum']++;
            $outArr[$row['day']]['oldAccountChargeNum'] += $price;
            $outArr[$row['day']]['oldPayTimes'] += $times;
        } else {
            //新号
            $outArr[$row['day']]['newAccountChargePersonNum']++;
            $outArr[$row['day']]['newAccountChargeNum'] += $price;
            $outArr[$row['day']]['newPayTimes'] += $times;
        }
        if ($row['day'] >= $startStr && $row['day'] <=  $endStr) {
            $outArr[$row['day']]['totalChargeNum'] += $price;
        }
    }

    foreach ($selectIds as $sid) {
//        $openTime = $servers[$sid]['serverDate'];
//        $allTotalParam = [
//            'start' => $openTime,
//            'end' => $endTime,
//        ];
        $users = GameUser::getUserByDateForAllTotal($sid, $allTotalParam);

        foreach ($users as $row) {
            $cache_user[$row['id']] = $row;
            $accountCreated = $cache_account[$row['accountId']]['day'];
            if ($accountCreated == $row['theDate']) {
                if (!isset($newRole[$accountCreated][$row['accountId']])) {
                    $newRole[$accountCreated][$row['accountId']] = 1;
                }
            } else {
                if (!isset($oldRole[$accountCreated][$row['accountId']])) {
                    $oldRole[$accountCreated][$row['accountId']] = 1;
                }
            }
        }

        $loginUsers = GameLogin::getLoginUsersForAllTotal($sid, $params);
        foreach ($loginUsers as $row) {
            $loginDay = $row['day'];//登录日期
            $userId = $row['user_id'];
            $accountId = $cache_user[$userId]['accountId'];
            $accountCrt = $cache_account[$accountId]['day'];
            if (!isset($accountLogin[$loginDay])) $accountLogin[$loginDay] = [];
            if (!isset($newAccountLogin[$loginDay])) $newAccountLogin[$loginDay] = [];
            if (!isset($oldAccountLogin[$loginDay])) $oldAccountLogin[$loginDay] = [];
            if ($accountId) {
                if (!isset($accountLogin[$loginDay][$accountId])) {
                    $accountLogin[$loginDay][$accountId] = 1;
                }
                if ($loginDay > $accountCrt) {
                    //老号
                    if (!isset($oldAccountLogin[$loginDay][$accountId])) {
                        $oldAccountLogin[$loginDay][$accountId] = 1;
                    }
                } else {
                    //新号
                    if ($accountCrt >= $startTime && $accountCrt < $endTime) {
                        if (!isset($newAccountLogin[$accountCrt][$accountId])) {
                            $newAccountLogin[$accountCrt][$accountId] = 1;
                        }
                    }
                }
            }
        }
    }

    ksort($outArr);

    $allTotalChargeNum = $allRegNum = $allCreateRoleNum = $allNewRole = $allOldRole = 0;
    foreach ($outArr as $k => &$v) {
        if ($k >= $startStr && $k <= $endStr) {
            $v['newAccountChargePersonNum1'] = $v['newAccountChargePersonNum'];
            $v['oldAccountChargePersonNum1'] = $v['oldAccountChargePersonNum'];
            $v['date'] = $k;
            $v['newRole'] = sizeof($newRole[$k]);
            $v['oldRole'] = sizeof($oldRole[$k]);
            $allNewRole += $v['newRole'];
            $allOldRole += $v['oldRole'];
            $v['newChangeRate'] = $allNewRole == 0 ? 0 : sprintf("%.4f", $v['newAccountChargePersonNum'] / $allNewRole) * 100;
            $v['oldChangeRate'] = $allOldRole == 0 ? 0 : sprintf("%.4f", $v['oldAccountChargePersonNum'] / $allOldRole) * 100;
            $newLoginNum = sizeof($newAccountLogin[$k]);
            $oldLoginNum = sizeof($oldAccountLogin[$k]);
            $v['newArpu'] = !$newLoginNum ? 0 : sprintf("%.2f", $v['newAccountChargeNum'] / $newLoginNum);
            $v['oldArpu'] = !$oldLoginNum ? 0 : sprintf("%.2f", $v['oldAccountChargeNum'] / $oldLoginNum);
            $v['newArppu'] = $v['newAccountChargePersonNum'] == 0 ? 0 : sprintf("%.2f", $v['newAccountChargeNum'] / $v['newAccountChargePersonNum']);
            $v['oldArppu'] = $v['oldAccountChargePersonNum'] == 0 ? 0 : sprintf("%.2f", $v['oldAccountChargeNum'] / $v['oldAccountChargePersonNum']);
            $v['newOver1'] = $v['newAccountChargePersonNum'] == 0 ? 0 : 100 - sprintf("%.4f", $v['new1'] / $v['newAccountChargePersonNum']) * 100;
            $v['oldOver1'] = $v['oldAccountChargePersonNum'] == 0 ? 0 : 100 - sprintf("%.4f", $v['old1'] / $v['oldAccountChargePersonNum']) * 100;
        } else {
            unset($outArr[$k]);//超出查询范围的删了
            continue;
        }
    }
    krsort($outArr);
}
if ($search == 2) {
    $fileName = '付费次数数据';
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
Template::display('statistics/payTimes.tpl');

