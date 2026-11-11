<?php
require('../include/init.inc.php');
$method = $selectServer = $startTime = $endTime = $dayNum = '';
$search = $outPut = $allPerson = 0;
$data = $outArr = $theOutArray = $cache_user = $title = array();

extract($_REQUEST, EXTR_IF_EXISTS);

$begin = $startTime = $startTime ? $startTime : '';
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

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

$gear = 4;
$box = 5;
if ($search == 1) {
    $title = [
        'server' => '区服',
        'personNum' => '参与人数',
    ];
    for ($i = 1; $i <= $gear; $i++) {
        $title[$i] = "累计{$i}档领取数";
        $title[$i . 'rate'] = "{$i}档占参与占比";
    }
    $titleKey = array_keys($title);
    $params = [];
    foreach ($selectIds as $sid) {
        $data = GameUser::getActivity($sid, $params);
        if ($data) {
            foreach ($data as $value) {
                $uid = $value['id'];
                $activity = json_decode($value['activity'], true);
                if ($activity['2002']) {//神宠
                    if (!empty($activity['2002'][0])) {
                        $theOutArray[$sid]['personNum']++;
                    }
                    if (isset($activity['2002'][0])) {
                        $rewardNum = sizeof($activity['2002'][0]);
                        $theOutArray[$sid][$rewardNum]++;
                    }
                }
            }
        }
    }

    foreach ($theOutArray as $sid => $out) {
        $outArr[$sid]['server'] = $sid;
        $outArr[$sid]['personNum'] = $out['personNum'];
        for ($i = 1; $i <= $gear; $i++) {
            //充值1挡的包含充值2，3，4挡的
            for ($j = 1; $j <= $gear; $j++) {
                if ($i <= $j) {
                    $outArr[$sid][$i] += $theOutArray[$sid][$j];
                }
            }
            $outArr[$sid][$i . 'rate'] = $out['personNum'] == 0 ? 0 : sprintf("%.4f", $outArr[$sid][$i] / $out['personNum']) * 100;
        }
    }
}

if ($search == 2) {
    $title = [
        'task' => '连续充箱子数',
        'personNum' => '达成人数',
    ];
    $titleKey = array_keys($title);
    for ($i = 1; $i <= $box; $i++) {
        $outArr[$i]['task'] = $i;
        $outArr[$i]['personNum'] = 0;
    }
    $params = [];
    foreach ($selectIds as $sid) {
        $data = GameUser::getActivity($sid, $params);
        if ($data) {
            foreach ($data as $value) {
                $uid = $value['id'];
                $activity = json_decode($value['activity'], true);
                if ($activity['2002']) {//神宠
                    if (isset($activity['2002'][2])) {
                        $rewardNum = sizeof($activity['2002'][2]);
                        $theOutArray[$rewardNum]['personNum']++;
                    }
                }
            }
        }
    }

    foreach ($theOutArray as $rewardNum => $out) {
        if ($outArr[$rewardNum]) {
            //充值1挡的包含充值2，3，4挡的
            for ($i = 1; $i <= $box; $i++) {
                if ($i <= $rewardNum) {
                    $outArr[$i]['personNum'] += $out['personNum'];
                }
            }
        }
    }
}

if ($search && $outPut == 1) {
    $fileName = '莱斯银行数据';
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
Template::display('secAct/godPetFetter.tpl');

