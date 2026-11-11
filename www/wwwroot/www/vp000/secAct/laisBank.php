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

if ($search == 1) {
    $title = [
        'server' => '区服',
        'personNum' => '债券真实购买人数',
        '30' => '30人档位购买人数',
        '60' => '60人档位购买人数',
        '120' => '120人档位购买人数',
        '200' => '200人档位购买人数',
    ];
    $titleKey = array_keys($title);
    $params = [];
    foreach ($selectIds as $sid) {
        $data = GameUser::getActivity($sid, $params);
        if ($data) {
            foreach ($data as $value) {
                $uid = $value['id'];
                $activity = json_decode($value['activity'], true);
                if ($activity['2003']) {//莱斯银行  0购买时间 1领奖天数 3购买人数达标后领的奖
                    if (isset($activity['2003'][0])) {
                        $theOutArray[$sid]['personNum'] ++;
                    }
                    if (isset($activity['2003'][2])) {
                        $rewardNum = sizeof($activity['2003'][2]);
                        if ($rewardNum == 1) {
                            $theOutArray[$sid]['30'] ++;
                        }
                        if ($rewardNum == 2) {
                            $theOutArray[$sid]['60'] ++;
                        }
                        if ($rewardNum == 3) {
                            $theOutArray[$sid]['120'] ++;
                        }
                        if ($rewardNum == 4) {
                            $theOutArray[$sid]['200'] ++;
                        }
                    }
                }
            }
        }
    }

    foreach ($theOutArray as $sid => $out) {
        $outArr[$sid]['server'] = $sid;
        $outArr[$sid]['personNum'] = $out['personNum'];
        $outArr[$sid]['30'] = $out['30'];
        $outArr[$sid]['60'] = $out['60'];
        $outArr[$sid]['120'] = $out['120'];
        $outArr[$sid]['200'] = $out['200'];
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
Template::display('secAct/laisBank.tpl');

