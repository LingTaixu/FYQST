<?php
require('../include/init.inc.php');
$method = $selectServer = $startTime = $endTime = $dayNum = '';
$search = $outPut = $allPerson = 0;
$data = $outArr = $theOutArray = $cache_user = $title = array();

extract($_REQUEST, EXTR_IF_EXISTS);

$begin = $startTime = $startTime ? $startTime : '';
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$configTask = [
    '9100001' => ['name' => '登录有礼', 'day' => 1, 'complete' => 0],
    '9100002' => ['name' => '登录有礼', 'day' => 1, 'complete' => 0],
    '9100003' => ['name' => '登录有礼', 'day' => 1, 'complete' => 0],
    '9100004' => ['name' => '登录有礼', 'day' => 1, 'complete' => 0],
    '9100005' => ['name' => '登录有礼', 'day' => 1, 'complete' => 1],
    '9100006' => ['name' => '挑战全民boss', 'day' => 1, 'complete' => 0],
    '9100007' => ['name' => '挑战全民boss', 'day' => 1, 'complete' => 0],
    '9100008' => ['name' => '挑战全民boss', 'day' => 1, 'complete' => 0],
    '9100009' => ['name' => '挑战全民boss', 'day' => 1, 'complete' => 0],
    '9100010' => ['name' => '挑战全民boss', 'day' => 1, 'complete' => 0],
    '9100011' => ['name' => '挑战全民boss', 'day' => 1, 'complete' => 0],
    '9100012' => ['name' => '挑战全民boss', 'day' => 1, 'complete' => 0],
    '9100013' => ['name' => '挑战全民boss', 'day' => 1, 'complete' => 0],
    '9100014' => ['name' => '挑战全民boss', 'day' => 1, 'complete' => 1],
    '9100015' => ['name' => '经验试炼', 'day' => 1, 'complete' => 0],
    '9100016' => ['name' => '经验试炼', 'day' => 1, 'complete' => 0],
    '9100017' => ['name' => '经验试炼', 'day' => 1, 'complete' => 0],
    '9100018' => ['name' => '经验试炼', 'day' => 1, 'complete' => 0],
    '9100019' => ['name' => '经验试炼', 'day' => 1, 'complete' => 0],
    '9100020' => ['name' => '经验试炼', 'day' => 1, 'complete' => 1],
    '9100021' => ['name' => '金币消耗', 'day' => 2, 'complete' => 0],
    '9100022' => ['name' => '金币消耗', 'day' => 2, 'complete' => 0],
    '9100023' => ['name' => '金币消耗', 'day' => 2, 'complete' => 0],
    '9100024' => ['name' => '金币消耗', 'day' => 2, 'complete' => 0],
    '9100025' => ['name' => '金币消耗', 'day' => 2, 'complete' => 0],
    '9100026' => ['name' => '金币消耗', 'day' => 2, 'complete' => 0],
    '9100027' => ['name' => '金币消耗', 'day' => 2, 'complete' => 1],
    '9100028' => ['name' => '挑战中立boss', 'day' => 2, 'complete' => 0],
    '9100029' => ['name' => '挑战中立boss', 'day' => 2, 'complete' => 0],
    '9100030' => ['name' => '挑战中立boss', 'day' => 2, 'complete' => 0],
    '9100031' => ['name' => '挑战中立boss', 'day' => 2, 'complete' => 0],
    '9100032' => ['name' => '挑战中立boss', 'day' => 2, 'complete' => 0],
    '9100033' => ['name' => '挑战中立boss', 'day' => 2, 'complete' => 1],
    '9100034' => ['name' => '探险宝库', 'day' => 2, 'complete' => 0],
    '9100035' => ['name' => '探险宝库', 'day' => 2, 'complete' => 0],
    '9100036' => ['name' => '探险宝库', 'day' => 2, 'complete' => 0],
    '9100037' => ['name' => '探险宝库', 'day' => 2, 'complete' => 0],
    '9100038' => ['name' => '探险宝库', 'day' => 2, 'complete' => 0],
    '9100039' => ['name' => '探险宝库', 'day' => 2, 'complete' => 0],
    '9100040' => ['name' => '探险宝库', 'day' => 2, 'complete' => 1],
    '9100041' => ['name' => '累计充值', 'day' => 3, 'complete' => 0],
    '9100042' => ['name' => '累计充值', 'day' => 3, 'complete' => 0],
    '9100043' => ['name' => '累计充值', 'day' => 3, 'complete' => 0],
    '9100044' => ['name' => '累计充值', 'day' => 3, 'complete' => 0],
    '9100045' => ['name' => '累计充值', 'day' => 3, 'complete' => 0],
    '9100046' => ['name' => '累计充值', 'day' => 3, 'complete' => 0],
    '9100047' => ['name' => '累计充值', 'day' => 3, 'complete' => 1],
    '9100048' => ['name' => '竞技挑战', 'day' => 3, 'complete' => 0],
    '9100049' => ['name' => '竞技挑战', 'day' => 3, 'complete' => 0],
    '9100050' => ['name' => '竞技挑战', 'day' => 3, 'complete' => 0],
    '9100051' => ['name' => '竞技挑战', 'day' => 3, 'complete' => 0],
    '9100052' => ['name' => '竞技挑战', 'day' => 3, 'complete' => 0],
    '9100053' => ['name' => '竞技挑战', 'day' => 3, 'complete' => 0],
    '9100054' => ['name' => '竞技挑战', 'day' => 3, 'complete' => 1],
    '9100055' => ['name' => '佣兵雇佣', 'day' => 3, 'complete' => 0],
    '9100056' => ['name' => '佣兵雇佣', 'day' => 3, 'complete' => 0],
    '9100057' => ['name' => '佣兵雇佣', 'day' => 3, 'complete' => 0],
    '9100058' => ['name' => '佣兵雇佣', 'day' => 3, 'complete' => 0],
    '9100059' => ['name' => '佣兵雇佣', 'day' => 3, 'complete' => 0],
    '9100060' => ['name' => '佣兵雇佣', 'day' => 3, 'complete' => 1],
    '9100061' => ['name' => '钻石消耗', 'day' => 4, 'complete' => 0],
    '9100062' => ['name' => '钻石消耗', 'day' => 4, 'complete' => 0],
    '9100063' => ['name' => '钻石消耗', 'day' => 4, 'complete' => 0],
    '9100064' => ['name' => '钻石消耗', 'day' => 4, 'complete' => 0],
    '9100065' => ['name' => '钻石消耗', 'day' => 4, 'complete' => 0],
    '9100066' => ['name' => '钻石消耗', 'day' => 4, 'complete' => 0],
    '9100067' => ['name' => '钻石消耗', 'day' => 4, 'complete' => 1],
    '9100068' => ['name' => '深渊派对', 'day' => 4, 'complete' => 0],
    '9100069' => ['name' => '深渊派对', 'day' => 4, 'complete' => 0],
    '9100070' => ['name' => '深渊派对', 'day' => 4, 'complete' => 0],
    '9100071' => ['name' => '深渊派对', 'day' => 4, 'complete' => 0],
    '9100072' => ['name' => '深渊派对', 'day' => 4, 'complete' => 0],
    '9100073' => ['name' => '深渊派对', 'day' => 4, 'complete' => 0],
    '9100074' => ['name' => '深渊派对', 'day' => 4, 'complete' => 1],
    '9100075' => ['name' => '金币试炼', 'day' => 4, 'complete' => 0],
    '9100076' => ['name' => '金币试炼', 'day' => 4, 'complete' => 0],
    '9100077' => ['name' => '金币试炼', 'day' => 4, 'complete' => 0],
    '9100078' => ['name' => '金币试炼', 'day' => 4, 'complete' => 0],
    '9100079' => ['name' => '金币试炼', 'day' => 4, 'complete' => 0],
    '9100080' => ['name' => '金币试炼', 'day' => 4, 'complete' => 1],
    '9100081' => ['name' => '行会捐赠', 'day' => 5, 'complete' => 0],
    '9100082' => ['name' => '行会捐赠', 'day' => 5, 'complete' => 0],
    '9100083' => ['name' => '行会捐赠', 'day' => 5, 'complete' => 0],
    '9100084' => ['name' => '行会捐赠', 'day' => 5, 'complete' => 0],
    '9100085' => ['name' => '行会捐赠', 'day' => 5, 'complete' => 0],
    '9100086' => ['name' => '行会捐赠', 'day' => 5, 'complete' => 0],
    '9100087' => ['name' => '行会捐赠', 'day' => 5, 'complete' => 1],
    '9100088' => ['name' => '野外pk', 'day' => 5, 'complete' => 0],
    '9100089' => ['name' => '野外pk', 'day' => 5, 'complete' => 0],
    '9100090' => ['name' => '野外pk', 'day' => 5, 'complete' => 0],
    '9100091' => ['name' => '野外pk', 'day' => 5, 'complete' => 0],
    '9100092' => ['name' => '野外pk', 'day' => 5, 'complete' => 0],
    '9100093' => ['name' => '野外pk', 'day' => 5, 'complete' => 1],
    '9100094' => ['name' => '乐透抽奖', 'day' => 5, 'complete' => 0],
    '9100095' => ['name' => '乐透抽奖', 'day' => 5, 'complete' => 0],
    '9100096' => ['name' => '乐透抽奖', 'day' => 5, 'complete' => 0],
    '9100097' => ['name' => '乐透抽奖', 'day' => 5, 'complete' => 0],
    '9100098' => ['name' => '乐透抽奖', 'day' => 5, 'complete' => 0],
    '9100099' => ['name' => '乐透抽奖', 'day' => 5, 'complete' => 0],
    '9100100' => ['name' => '乐透抽奖', 'day' => 5, 'complete' => 1],
];

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

if ($search == 1) {
    $title = [
        'day' => '天数',
        'task' => '任务名称',
        'personNum' => '人数',
        'completeRate' => '全部完成人数占比',
        'numAvg' => '平均完成个数',
    ];
    $titleKey = array_keys($title);
    $params = [];
    foreach ($selectIds as $sid) {
        $data = GameUser::getActivity($sid, $params);
        if ($data) {
            foreach ($data as $value) {
                $uid = $value['id'];
                $activity = json_decode($value['activity'], true);
                if ($activity['2005']) {//嘉年华
                    $reward = $activity['2005'][1];
                    if ($reward) {
                        foreach ($reward as $taskId => $v) {
                            if (isset($configTask[$taskId])) {
                                $taskName = $configTask[$taskId]['name'];//登录有礼
                                $outArr[$taskName]['day'] = $configTask[$taskId]['day'];
                                $outArr[$taskName]['task'] = $taskName;
                                $outArr[$taskName]['person'][$uid] = 1;
                                $outArr[$taskName]['num']++;
                                if ($configTask[$taskId]['complete'] == 1) {
                                    $outArr[$taskName]['complete']++;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    foreach ($outArr as &$out) {
        $out['personNum'] = sizeof($out['person']);
        $out['completeRate'] = $out['personNum'] == 0 ? 0 : sprintf("%.4f", $out['complete'] / $out['personNum']) * 100;
        $out['numAvg'] = $out['personNum'] == 0 ? 0 : sprintf("%.2f", $out['num'] / $out['personNum']);
    }

    array_multisort(array_column($outArr, 'day'), SORT_ASC, $outArr);
}

if ($search == 2) {
    $title = [
        'taskNum' => '达成数',
        'personNum' => '完成人数',
        'completeRate' => '完成人数占全部人数占比',
    ];
    $titleKey = array_keys($title);

    for ($i = 10; $i <= 100; $i += 10) {
        $outArr[$i] = [
            'taskNum' => $i,
            'personNum' => 0,
            'completeRate' => 0,
        ];
    }

    $params = [];
    foreach ($selectIds as $sid) {
        $data = GameUser::getActivity($sid, $params);
        if ($data) {
            foreach ($data as $value) {
                $uid = $value['id'];
                $activity = json_decode($value['activity'], true);
                if ($activity['2005']) {//嘉年华
                    $reward = $activity['2005'][1];
                    if ($reward) {
                        $allPerson++;
                        $num = sizeof($reward);
                        $taskNum = intval($num / 10) * 10;
                        if (isset($outArr[$taskNum])) {
                            $outArr[$taskNum]['personNum'] ++;
                        }
                    }
                }
            }
        }
    }

    foreach ($outArr as &$out) {
        $out['completeRate'] = $allPerson == 0 ? 0 : sprintf("%.4f", $out['personNum'] / $allPerson) * 100;
    }
}

if ($search && $outPut == 1) {
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
Template::display('secAct/carnival.tpl');

