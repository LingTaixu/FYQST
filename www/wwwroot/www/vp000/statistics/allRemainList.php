<?php
require('../include/init.inc.php');
$method = $startTime = $endTime = '';
$search = 0;
$selectIds = $outArr = $cache_user = $cache_recharge = $accountLogin = $oldAccountLogin = $newAccountLogin = $accountAllPay = $chargePersonNum = array();
$selectServer = '';
extract($_REQUEST, EXTR_IF_EXISTS);

$startTime = $startTime ? $startTime : date('Y-m-d 00:00:00', time() - 86400 * 7);
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$title = [
    'date' => '日期',
    'regNum' => '注册人数',
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

$serversInfo = GameServerInfo::getAllServer();
foreach ($serversInfo as $row) {
    $selectIds[] = $row['serverId'];
}

if ($search) {
    $params = [
        'start' => $startTime,
        'end' => $endTime,
    ];
    $cache_account = GameAccount::getAccount();

    //注册人数
    $regData = GameAccount::getRegsByDate($params);
    foreach ($regData as $row) {
        $outArr[$row['regDate']]['regNum'] = $row['num'];
    }

    foreach ($selectIds as $sid) {
        //创角
        $users = GameUser::getUserByDate($sid);
        foreach ($users as $row) {
            $cache_user[$row['id']] = $row;
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
                if (!isset($accountLogin[$loginDay][$accountId])) {
                    $accountLogin[$loginDay][$accountId] = 1;
                }
                if ($loginDay > $accountCrt) {
                    //老号
//                    if (!in_array($accountId, $oldAccountLogin[$loginDay])) {
//                        $oldAccountLogin[$loginDay][] = $accountId;
//                    }
                    if (!isset($oldAccountLogin[$loginDay][$accountId])) {
                        $oldAccountLogin[$loginDay][$accountId] = 1;
                    }
                    $daysDiff = Help::getDifferentDays($accountCrt, $loginDay);
                    switch ($daysDiff) {
                        case 1://次留
                            $outArr[$accountCrt]['liucun2']++;
                            break;
                        case 2://3留
                            $outArr[$accountCrt]['liucun3']++;
                            break;
                        case 3://4留
                            $outArr[$accountCrt]['liucun4']++;
                            break;
                        case 4://5留
                            $outArr[$accountCrt]['liucun5']++;
                            break;
                        case 5://6留
                            $outArr[$accountCrt]['liucun6']++;
                            break;
                        case 6://7留
                            $outArr[$accountCrt]['liucun7']++;
                            break;
                        case 7://8留
                            $outArr[$accountCrt]['liucun8']++;
                            break;
                        case 8://9留
                            $outArr[$accountCrt]['liucun9']++;
                            break;
                        case 9://10留
                            $outArr[$accountCrt]['liucun10']++;
                            break;
                        case 10://11留
                            $outArr[$accountCrt]['liucun11']++;
                            break;
                    }
                } else {
                    //新号
                    if (strtotime($accountCrt) >= strtotime($startTime) && strtotime($accountCrt) < strtotime($endTime)) {
                        if (!isset($newAccountLogin[$accountCrt][$accountId])) {
                            $newAccountLogin[$accountCrt][$accountId] = 1;
                            $accountAllPay[$accountCrt] += $cache_recharge[$accountId];
                        }
                    }
                }
            }
        }
    }

    ksort($outArr);

    $allTotalChargeNum = $allRegNum = $allCreateRoleNum = 0;
    foreach ($outArr as $k => &$v) {
        if (strtotime($k) >= strtotime($startTime) && strtotime($k) < strtotime($endTime)) {
            $v['date'] = $k;
            $v['r2'] = $v['regNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun2'] / $v['regNum']) * 100;
            $v['r3'] = $v['regNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun3'] / $v['regNum']) * 100;
            $v['r4'] = $v['regNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun4'] / $v['regNum']) * 100;
            $v['r5'] = $v['regNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun5'] / $v['regNum']) * 100;
            $v['r6'] = $v['regNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun6'] / $v['regNum']) * 100;
            $v['r7'] = $v['regNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun7'] / $v['regNum']) * 100;
            $v['r8'] = $v['regNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun8'] / $v['regNum']) * 100;
            $v['r9'] = $v['regNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun9'] / $v['regNum']) * 100;
            $v['r10'] = $v['regNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun10'] / $v['regNum']) * 100;
            $v['r11'] = $v['regNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun11'] / $v['regNum']) * 100;
        } else {
            unset($outArr[$k]);//超出查询范围的删了
            continue;
        }
    }
    krsort($outArr);
}

if ($search == 2) {
    $fileName = '全服留存数据';
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
Template::display('statistics/allRemainList.tpl');

