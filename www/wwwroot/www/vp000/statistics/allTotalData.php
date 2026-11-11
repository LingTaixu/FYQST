<?php
require('../include/init.inc.php');
define('EOL', (PHP_SAPI == 'cli') ? PHP_EOL : '<br />');
ini_set('memory_limit', '8024M');
ini_set('max_execution_time', '210');

$startMemory = memory_get_usage(true);
$startTimeTTT = microtime(TRUE);
$method = $startTime = $endTime = '';
$search = 0;
$selectIds = $outArr = $cache_user = $cache_recharge = $accountLogin = $oldAccountLogin = $newAccountLogin = $accountAllPay = array();
$ltvArray = $chargePersonNum = $oldAccountChargePersonNum = $newAccountChargePersonNum = $newRole = $channel = $sdkChannel = $gameChannelArr = $gameSdkChannelArr = array();
$selectServer = '';
extract($_REQUEST, EXTR_IF_EXISTS);

$startTime = $startTime ? $startTime : date('Y-m-d 00:00:00', time() - 86400 * 7);
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$startTimeStamp = strtotime($startTime);
$endTimeStamp = strtotime($endTime);
$startStr = date('Y-m-d', $startTimeStamp);
$endStr = date('Y-m-d', $endTimeStamp);

$ltvDay = [1, 3, 5, 7, 11, 14, 21, 30];
$title = [
    'date' => '日期',
    'allAccountLogin' => '总账号活跃',
    'oldAccountLogin' => '老账号活跃',
    'regNum' => '注册人数',
    'newRole' => '新号创角',
    'newRate' => '转化率',
    'r2' => '次留',
    'r3' => '三留',
    'r7' => '七留',
//    'r14' => '十四留',
    'totalChargeNum' => '充值金额',
    'payDau' => '活跃用户付费率',
    'arpu' => 'arpu',
    'arppu' => 'arppu值',
    'newAccountChargePersonNum' => '新充值账号',
    'newChargeNum' => '新充值次数',
    'newAccountChargeNum' => '新号充值',
    'oldAccountChargePersonNum' => '老充值账号',
    'oldChargeNum' => '老充值次数',
    'oldAccountChargeNum' => '老号充值',
//    'chargePersonNum' => '充值账号',
    'ltv1' => 'ltv1',
    'ltv3' => 'ltv3',
    'ltv5' => 'ltv5',
    'ltv7' => 'ltv7',
    'ltv11' => 'ltv11',
    'ltv14' => 'ltv14',
    'ltv21' => 'ltv21',
    'ltv30' => 'ltv30',
//    'zhushoubi' => '总注收比',
];

$serversInfoById = [];
$serversInfo = GameServerInfo::getAllServer();
foreach ($serversInfo as $row) {
    $selectIds[] = $row['serverId'];
    $serversInfoById[$row['id']] = $row;
}

//渠道选项
$channelList = GameChannelConfig::getList();
$channelDiv = '';
$sdkChannelDiv = '';

if (isset($PLATFORM_LIST)) {
    $channelDiv = Help::getChannelSelect($PLATFORM_LIST, $channel, 'channel');
}
if ($channelList) {
    foreach ($channelList as $row) {
        $channelId = $row['channelId'];
        $sdkChannelId = $row['sdkChannelId'];
        if ($channelId == 10006) {
            $gameSdkChannelArr[$sdkChannelId] = $row['channelDesc'];
        }
    }
    $sdkChannelDiv = Help::getChannelSelect($gameSdkChannelArr, $sdkChannel, 'sdkChannel');
}
if (empty($channel) || !in_array('10006', $channel)) {
    $sdkChannel = [];
}

if ($search) {
    $cache_account = GameAccount::getAccountForAllTotal();
    $params = [
        'start' => $startTime,
        'end' => $endTime,
        'channels' => $channel,
        'sdkChannels' => $sdkChannel
    ];
//    $costTime = microtime(TRUE) - $startTimeTTT;
//    $costM = (memory_get_usage(true) - $startMemory)/ 1024 / 1024;
//    echo '0耗时：'.$costTime.'秒   内存使用:'.$costM. " MB<br />";exit;
    //注册人数
    $regData = GameAccount::getRegsByDate($params);

    foreach ($regData as $row) {
        $outArr[$row['regDate']]['regNum'] = $row['num'];
    }
//    $costTime = microtime(TRUE) - $startTimeTTT;
//    $costM = (memory_get_usage(true) - $startMemory)/ 1024 / 1024;
//    echo '1耗时：'.$costTime.'秒   内存使用:'.$costM. " MB<br />";
    //支付
    $payParam = [
        'start' => $startTime,
        'end' => $endTime,
        'channels' => $channel,
        'sdkChannels' => $sdkChannel
    ];
    $payAccount = RechargeRequest::getPriceByDayForAllTotal($payParam);

    foreach ($payAccount as $row) {
        $price = $row['goodsPrice'];
        $cache_recharge[$row['accountId']] += $price;
        $accountCreate = $cache_account[$row['accountId']]['day'];

        if ($row['day'] >= $startStr && $row['day'] <= $endStr) {
            if ($row['day'] > $accountCreate) {
                //老号
                if (!isset($oldAccountChargePersonNum[$row['day']][$row['accountId']])) {
                    $oldAccountChargePersonNum[$row['day']][$row['accountId']] = 1;
                }
                $outArr[$row['day']]['oldAccountChargeNum'] += $price;
                $outArr[$row['day']]['oldChargeNum']++;
            } else {
                //新号
                if (!isset($newAccountChargePersonNum[$row['day']][$row['accountId']])) {
                    $newAccountChargePersonNum[$row['day']][$row['accountId']] = 1;
                }
                $outArr[$row['day']]['newAccountChargeNum'] += $price;
                $outArr[$row['day']]['newChargeNum']++;
            }
            //充值账号数
            if (!isset($chargePersonNum[$row['day']][$row['accountId']])) {
                $chargePersonNum[$row['day']][$row['accountId']] = 1;
            }

            $outArr[$row['day']]['totalChargeNum'] += $price;
        }

        $daysDiff = Help::getDifferentDays($accountCreate, $row['day']);
        $ltvArray[$accountCreate][$daysDiff + 1] += $price;
    }
    unset($payAccount);

//    $costTime = microtime(TRUE) - $startTimeTTT;
//    $costM = (memory_get_usage(true) - $startMemory)/ 1024 / 1024;
//    echo '2耗时：'.$costTime.'秒   内存使用:'.$costM. " MB<br />";exit;
    foreach ($selectIds as $sid) {
        $cache_user = [];
        //创角
        $userParam = [
            'start' => $serversInfoById[$sid]['serverDate'],
            'end' => $endTime,
            'channels' => $channel,
            'sdkChannels' => $sdkChannel
        ];
        $users = GameUser::getUserByDateForAllTotal($sid, $userParam);

        foreach ($users as $row) {
            $cache_user[$row['id']] = $row;
            $accountCreated = $cache_account[$row['accountId']]['day'];
            if ($accountCreated == $row['theDate']) {
//            if (strtotime($accountCreated) == strtotime($row['theDate'])) {
                if (!isset($newRole[$accountCreated][$row['accountId']])) {
                    $newRole[$accountCreated][$row['accountId']] = 1;
                }
            }
        }

        //总账号活跃
        $logParams = [
            'start' => $startTime,
            'end' => date('Y-m-d 00:00:00', strtotime($endTime) + 86400 * 15),//有14天后登录留存，做个预留
            'channels' => $channel,
            'sdkChannels' => $sdkChannel
        ];
        $table = GameLogin::showTable($sid);
        //查表是否存在
        if ($table) {
            $loginUsers = GameLogin::getLoginUsersForAllTotal($sid, $logParams);
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

                    if (strtotime($loginDay) > strtotime($accountCrt)) {
                        //老号
                        if (!isset($oldAccountLogin[$loginDay][$accountId])) {
                            $oldAccountLogin[$loginDay][$accountId] = 1;
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
//                    echo $accountCrt.'---'.$startTime.'<br/>';
//                    if($accountCrt > $startTime)echo '$accountCrt > $startTime'.'<br/>';
//                    if (strtotime($accountCrt) >= $startTimeStamp && strtotime($accountCrt) < $endTimeStamp) {
                        if ($accountCrt >= $startTime && $accountCrt < $endTime) {
                            if (!isset($newAccountLogin[$accountCrt][$accountId])) {
                                $newAccountLogin[$accountCrt][$accountId] = 1;
                                $accountAllPay[$accountCrt] += $cache_recharge[$accountId];
                            }
                        }
                    }
                }
            }
        }
    }

//    $costTime = microtime(TRUE) - $startTimeTTT;
//    $costM = (memory_get_usage(true) - $startMemory)/ 1024 / 1024;
//    echo '3耗时：'.$costTime.'秒   内存使用:'.$costM. " MB<br />";
//    echo 'OK';
//    exit();
    ksort($outArr);

    $allTotalChargeNum = $allRegNum = $allCreateRoleNum = 0;
    foreach ($outArr as $k => &$v) {
        if ($k >= $startStr && $k <= $endStr) {
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
//            $v['r14'] = $v['regNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun14'] / $v['regNum']) * 100;
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
//            $v['zhushoubi'] = $v['regNum'] == 0 ? 0 : sprintf("%.2f", $accountAllPay[$k] / $v['regNum']);
        } else {
            unset($outArr[$k]);//超出查询范围的删了
            continue;
        }
    }
    krsort($outArr);

    $cache_account = $cache_user = $oldAccountLogin = $newAccountLogin = $chargePersonNum = $newAccountChargePersonNum = $oldAccountChargePersonNum = null;//用完及时销毁
//    system('sync && echo 3 > /proc/sys/vm/drop_caches');
}

if ($search == 2) {
    $fileName = '全服运营数据';
    Help::writeExcel($fileName, $title, $outArr);
    die();
}
//$costTime = microtime(TRUE) - $startTimeTTT;
//$costM = (memory_get_usage(true) - $startMemory)/ 1024 / 1024;
//echo '耗时：'.$costTime.'秒   内存使用:'.$costM. " MB";
//exit();
// 设置模板变量
$group_options = UserGroup::getGroupForOptions();
$group_options[0] = "全部";
ksort($group_options);

Template::assign('channelDiv', $channelDiv);
Template::assign('sdkChannelDiv', $sdkChannelDiv);
Template::assign('title', $title);
Template::assign('startTime', $startTime);
Template::assign('endTime', $endTime);
Template::assign('outArr', $outArr);
Template::assign('group_options', $group_options);
Template::assign('_GET', $_GET);
Template::assign('page_html', $page_html);
Template::display('statistics/allTotalData.tpl');

