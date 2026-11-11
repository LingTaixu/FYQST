<?php
require('../include/init.inc.php');
$method = $selectServer = $startTime = $endTime = $dayNum = '';
$search = 0;
$data = $outArr = $loginArr = $cache_user = $cache_recharge = array();

extract($_REQUEST, EXTR_IF_EXISTS);

$begin = $startTime = $startTime ? $startTime : '';
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$secondAct = [
    2 => '7日登录活动',
    2005 => '奥多姆大陆（嘉年华）',
    2002 => '神宠的羁绊',
    2003 => '莱斯银行的风投业务',
    2004 => '炼金术师的等价交换',
    2001 => '女神的私人报答',
];
$title = [
    'task' => '任务名称',
    'personNum' => '人数',
    'loginNum' => '第二周登录',
    'logRate' => '占活跃人数占比',
    'payAvg' => '参与玩家平均充值金额',
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
    $params = [
        'servers' => $selectIds
    ];
    $recharge = RechargeRequest::getPayUsers($params);
    if ($recharge) {
        foreach ($recharge as $r) {
            if (!isset($cache_recharge[$r['userId']])) {
                $cache_recharge[$r['userId']] = $r;
            }
        }
    }
    $params = [];
    foreach ($selectIds as $sid) {
        $openTime = $servers[$sid]['serverDate'];

        $data = GameUser::getActivity($sid, $params);
        if ($data) {
            foreach ($data as $value) {
                $uid = $value['id'];
                $activity = json_decode($value['activity'], true);
                foreach ($secondAct as $actId => $actName) {
                    if ($activity[$actId]) {//嘉年华等
                        $outArr[$actId]['task'] = $actName;
                        $outArr[$actId]['personNum']++;
                        if (isset($cache_recharge[$uid])) {
                            $outArr[$actId]['payAll'] += $cache_recharge[$uid]['allPrice'];
                        }
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
        $out['loginNum'] = sizeof($loginArr);
        $out['logRate'] = $out['personNum'] == 0 ? 0 : sprintf("%.4f", $out['personNum'] / $out['loginNum']) * 100;
        $out['payAvg'] = $out['personNum'] == 0 ? 0 : sprintf("%.2f", $out['payAll'] / $out['personNum']);
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
Template::display('secAct/secondAct.tpl');

