<?php
require('../include/init.inc.php');
define('EOL',(PHP_SAPI == 'cli') ? PHP_EOL : '<br />');
ini_set('memory_limit','8024M');

$method = $startTime = $endTime = '';
$search = 0;
$selectIds = $outArr = $cache_user = $cache_recharge = $accountLogin = $oldAccountLogin = $newAccountLogin = $accountAllPay = array();
$ltvArray = $chargePersonNum = $oldAccountChargePersonNum = $newAccountChargePersonNum = $newRole = array();
$selectServer = '';
extract($_REQUEST, EXTR_IF_EXISTS);

$startTime = $startTime ? $startTime : date('Y-m-d 00:00:00', time() - 86400 * 7);
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$ltvDay = [1, 3, 5, 7, 11, 14, 21, 30];
$title = [
    'date' => '日期',
    'regNum' => '注册人数',
    'oldAccountLogin' => '老账号活跃',
    'allAccountLogin' => '总账号活跃',
    'chargePersonNum' => '充值账号',
    'newRole' => '新号创角',
    'newRate' => '转化率',
    'payDau' => '活跃用户付费率',
    'totalChargeNum' => '充值金额',
    'newAccountChargeNum' => '新号充值',
    'newAccountChargePersonNum' => '新充值账号',
    'newChargeNum' => '新充值次数',
    'oldAccountChargeNum' => '老号充值',
    'oldAccountChargePersonNum' => '老充值账号',
    'oldChargeNum' => '老充值次数',
    'arpu' => 'arpu',
    'arppu' => 'arppu值',
    'r2' => '次留',
    'r3' => '三留',
    'r7' => '七留',
    'r14' => '十四留',
    'ltv1' => 'ltv1',
    'ltv3' => 'ltv3',
    'ltv5' => 'ltv5',
    'ltv7' => 'ltv7',
    'ltv11' => 'ltv11',
    'ltv14' => 'ltv14',
    'ltv21' => 'ltv21',
    'ltv30' => 'ltv30',
    'zhushoubi' => '总注收比',
];

$serversInfo = GameServerInfo::getAllServer();
foreach ($serversInfo as $row) {
    $selectIds[] = $row['serverId'];
}
print_r($selectIds);
if ($search) {
    $cache_account = GameAccount::getAccount();

    $params = [
        'start' => $startTime,
        'end' => $endTime,
    ];
    //注册人数
    $regData = GameAccount::getRegsByDate($params);
    foreach ($regData as $row) {
        $outArr[$row['regDate']]['regNum'] = $row['num'];
    }
    //支付
    $payAccount = RechargeRequest::getPriceByDay();
    foreach ($payAccount as $row) {
        $price = $row['goodsPrice'];
        $cache_recharge[$row['accountId']] += $price;
        $accountCreate = $cache_account[$row['accountId']]['day'];

        if (strtotime($row['day']) >= strtotime($startTime) && strtotime($row['day']) < strtotime($endTime)) {
            if ($row['day'] > $accountCreate) {
                //老号
                if (!in_array($row['accountId'], $oldAccountChargePersonNum[$row['day']])) {
                    $oldAccountChargePersonNum[$row['day']][] = $row['accountId'];
                }
                $outArr[$row['day']]['oldAccountChargeNum'] += $price;
                $outArr[$row['day']]['oldChargeNum'] ++;
            } else {
                //新号
                if (!in_array($row['accountId'], $newAccountChargePersonNum[$row['day']])) {
                    $newAccountChargePersonNum[$row['day']][] = $row['accountId'];
                }
                $outArr[$row['day']]['newAccountChargeNum'] += $price;
                $outArr[$row['day']]['newChargeNum'] ++;
            }
            //充值账号数
            if (!in_array($row['accountId'], $chargePersonNum[$row['day']])) {
                $chargePersonNum[$row['day']][] = $row['accountId'];
            }

            $outArr[$row['day']]['totalChargeNum'] += $price;
        }

        $daysDiff = Help::getDifferentDays($accountCreate, $row['day']);
        $ltvArray[$accountCreate][$daysDiff + 1] += $price;
    }

    foreach ([13] as $sid) {
        //创角
        echo $sid.EOL;
        $users = GameUser::getUserByDate($sid);
        foreach ($users as $row) {
            $cache_user[$row['id']] = $row;
            $accountCreated = $cache_account[$row['accountId']]['day'];
            if (strtotime($accountCreated) == strtotime($row['theDate'])) {
                if (!in_array($row['accountId'], $newRole[$accountCreated])) {
                    $newRole[$accountCreated][] = $row['accountId'];
                }
            }
        }
        //总账号活跃
        $logParams = [
            'start' => $startTime,
            'end' => date('Y-m-d 00:00:00', strtotime($endTime) + 86400 * 15),//有14天后登录留存，做个预留
        ];
        $loginUsers = GameLogin::getLoginUsers($sid, $logParams);

        foreach ($loginUsers as $row) {

            $loginDay = $row['day'];//登录日期
            $userId = $row['user_id'];//登录日期
            $accountId = $cache_user[$userId]['accountId'];
            $accountCrt = $cache_account[$accountId]['day'];
            if (!isset($accountLogin[$loginDay])) $accountLogin[$loginDay] = [];
            if (!isset($newAccountLogin[$loginDay])) $newAccountLogin[$loginDay] = [];
            if (!isset($oldAccountLogin[$loginDay])) $oldAccountLogin[$loginDay] = [];
            if ($accountId) {
                if (!in_array($accountId, $accountLogin[$loginDay])) {
                    $accountLogin[$loginDay][] = $accountId;
                }
                if ($loginDay > $accountCrt) {
                    //老号
                    if (!in_array($accountId, $oldAccountLogin[$loginDay])) {
                        $oldAccountLogin[$loginDay][] = $accountId;
                    }
                    $daysDiff = Help::getDifferentDays($accountCrt, $loginDay);
                    switch ($daysDiff) {
                        case 1://次留
                            $outArr[$accountCrt]['liucun2']++;
                            break;
                        case 2://三留
                            $outArr[$accountCrt]['liucun3']++;
                            break;
                        case 6://七留
                            $outArr[$accountCrt]['liucun7']++;
                            break;
                        case 13://十四留
                            $outArr[$accountCrt]['liucun14']++;
                            break;
                    }
                } else {
                    //新号
                    if (strtotime($accountCrt) >= strtotime($startTime) && strtotime($accountCrt) < strtotime($endTime)) {
                        if (!in_array($accountId, $newAccountLogin[$accountCrt])) {
                            $newAccountLogin[$accountCrt][] = $accountId;
                            $accountAllPay[$accountCrt] += $cache_recharge[$accountId];
                        }
                    }
                }
            }

            // Echo memory usage
            echo date('H:i:s') , ' Current memory usage: ' , (memory_get_usage(true) / 1024 / 1024) , " MB" , EOL;


            // Echo memory peak usage
            echo date('H:i:s') , " Peak memory usage: " , (memory_get_peak_usage(true) / 1024 / 1024) , " MB" , EOL;
        }
    }

exit();
    ksort($outArr);

    $allTotalChargeNum = $allRegNum = $allCreateRoleNum = 0;
    foreach ($outArr as $k => &$v) {
        if (strtotime($k) >= strtotime($startTime) && strtotime($k) < strtotime($endTime)) {
            $v['date'] = $k;
            $v['oldAccountLogin'] = sizeof($oldAccountLogin[$k]);
            $v['newAccountLoginNum'] = sizeof($newAccountLogin[$k]);
            $v['chargePersonNum'] = sizeof($chargePersonNum[$k]);
            $v['newAccountChargePersonNum'] = sizeof($newAccountChargePersonNum[$k]);
            $v['oldAccountChargePersonNum'] = sizeof($oldAccountChargePersonNum[$k]);
            $v['newRole'] = sizeof($newRole[$k]);
            $v['newRate'] = $v['regNum'] == 0 ? 0 : sprintf("%.4f", $v['newRole'] / $v['regNum']) * 100;
            $v['allAccountLogin'] = $v['regNum'] + $v['oldAccountLogin'];
            $v['payDau'] = $v['allAccountLogin'] == 0 ? 0 : sprintf("%.4f", $v['chargePersonNum'] / $v['allAccountLogin']) * 100;
            $v['arpu'] = $v['allAccountLogin'] == 0 ? 0 : sprintf("%.2f", $v['totalChargeNum'] / $v['allAccountLogin']);
            $v['arppu'] = $v['chargePersonNum'] == 0 ? 0 : sprintf("%.2f", $v['totalChargeNum'] / $v['chargePersonNum']);
            $v['r2'] = $v['regNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun2'] / $v['regNum']) * 100;
            $v['r3'] = $v['regNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun3'] / $v['regNum']) * 100;
            $v['r7'] = $v['regNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun7'] / $v['regNum']) * 100;
            $v['r14'] = $v['regNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun14'] / $v['regNum']) * 100;
            foreach ($ltvDay as $dayNum) {
                $allChv = 0;
                foreach ($ltvArray[$k] as $chk => $chv) {
                    $allChv += $chv;
                    if ($dayNum == $chk) {
                        $outKey = 'ltv' . $dayNum;
                        $v[$outKey] = $v['regNum'] == 0 ? 0 : sprintf("%.2f", $allChv / $v['regNum']);
                    }
                }
            }
            $v['zhushoubi'] = $v['regNum'] == 0 ? 0 : sprintf("%.2f", $accountAllPay[$k] / $v['regNum']);
        } else {
            unset($outArr[$k]);//超出查询范围的删了
            continue;
        }
    }
    krsort($outArr);
}

if ($search == 2) {
    $fileName = '全服运营数据';
    Help::writeExcel($fileName, $title, $outArr);
    die();
}

// 设置模板变量
$group_options = UserGroup::getGroupForOptions();
$group_options[0] = "全部";
ksort($group_options);

Template::assign('title', $title);
Template::assign('startTime', $startTime);
Template::assign('endTime', $endTime);
Template::assign('outArr', $outArr);
Template::assign('group_options', $group_options);
Template::assign('_GET', $_GET);
Template::assign('page_html', $page_html);
Template::display('statistics/allTotalData.tpl');

