<?php
require('../include/init.inc.php');
ini_set('memory_limit', '8024M');
ini_set('max_execution_time', '90');
$method = $selectServer = $startTime = $endTime = '';
$search = 0;
$servers = $allArr = $outArr = $avgArr = $allRechargeArr = $cache_user = $cache_account = $firstUser = array();
extract($_REQUEST, EXTR_IF_EXISTS);

$startTime = $startTime ? $startTime : '';
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$dayNo = [1, 2];
$avgTitle = [
    'gun' => '滚服玩家占比',
    'dayNum1' => '平均首次付费天数（开服天数）',
    'lvl1' => '平均首次付费等级',
    'dayNum2' => '平均2次付费天数（开服天数）',
    'lvl2' => '平均2次付费等级',
];
$title = [
    'id' => '序号',
    'userId' => '角色id',
    'nickName' => '角色名称',
    'isGun' => '是否滚服玩家',
    'dayNum1' => '首次付费天数（开服天数）',
    'lvl1' => '首次付费等级',
//    'goods1' => '首次付费商品名称',
    'dayNum2' => '2次付费天数（开服天数）',
    'lvl2' => '2次付费等级',
//    'goods2' => '2次付费商品名称',
];
$titleKey = array_keys($title);

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
    $cache_account = GameAccount::getAccount();

    $params = [
        'servers' => $selectIds,
        'start' => $startTime,
        'end' => $endTime,
    ];
    $firstPay = RechargeRequest::getFirst($params);

    if ($firstPay) {
        foreach ($firstPay as $val) {
            $firstUser[] = $val['userId'];
            $firstAccount[] = $val['accountId'];
        }
    }
//    print_r(join(',', $firstAccount));exit;
    $params['users'] = $firstUser;
    $data = RechargeRequest::getDetail($params);
    if ($data) {
        foreach ($data as $val) {
            $uid = $val['userId'];
            $serverId = $val['serverId'];
            $openTime = $servers[$serverId]['serverDate'];
            $payTime = $val['addTime'];
            $allArr[$uid]['count']++;
            $count = $allArr[$uid]['count'];
            $allArr[$uid]['data'][$count] = [
                'lvl' => $val['lvl'],
                'rechargeId' => $val['rechargeId'],
                'dayNum' => Help::getDifferentDays($openTime, $payTime),
            ];
        }
    }

    foreach ($selectIds as $sid) {
        $openTime = $servers[$sid]['serverDate'];
        //首日创角
        $firstParams = [
            'start' => $openTime,
            'end' => $endTime,
        ];
        $users = GameUser::getUserByDate($sid, $firstParams);
        foreach ($users as $row) {
            $cache_user[$row['id']] = $row;
            $cache_user[$row['id']]['server'] = $sid;
        }
    }

    $id = 1;
    if ($allArr) {
        foreach ($allArr as $uid => $value) {
            foreach ($value['data'] as $dayNum => $item) {
                $outArr[$uid]['id'] = $id;
                $outArr[$uid]['userId'] = $uid;
                $outArr[$uid]['nickName'] = $cache_user[$uid]['nickName'];

                $accountId = $cache_user[$uid]['accountId'];
                $useServer = $cache_account[$accountId]['userServers'];
                $useServer = json_decode($useServer, true);
                $outArr[$uid]['isGun'] = 0;
                if (isset($useServer[0]) && $useServer[0] != $cache_user[$uid]['server']) {
                    $outArr[$uid]['isGun'] = 1;
                    if (!isset($avgArr['gunArr'][$uid])) {
                        $avgArr['gunArr'][$uid] = 1;
                    }
                }

                $dayNumKey = 'dayNum' . $dayNum;
                $lvlKey = 'lvl' . $dayNum;
                $goodsKey = 'goods' . $dayNum;
                $outArr[$uid][$dayNumKey] = $item['dayNum'];
                $outArr[$uid][$lvlKey] = $item['lvl'];
                $outArr[$uid][$goodsKey] = $item['rechargeId'];

                if (is_numeric($item['dayNum'])) {
                    if (in_array($dayNum, $dayNo)) {
                        $key = 'allDay' . $dayNum;
                        $avgArr[$key] += $item['dayNum'];
                        $key = 'countDay' . $dayNum;
                        $avgArr[$key] += 1;
                        $key = 'allLvl' . $dayNum;
                        $avgArr[$key] += $item['lvl'];
                        $key = 'countLvl' . $dayNum;
                        $avgArr[$key] += 1;
                    }
                }
            }
            $id++;
        }

        $avgArr['gun'] = $id == 0 ? 0 : sprintf("%.4f", sizeof($avgArr['gunArr']) / $id) * 100;
        foreach ($dayNo as $dayNum) {
            $avgArr['dayNum' . $dayNum] = $avgArr['countDay' . $dayNum] == 0 ? 0 : sprintf("%.2f", $avgArr['allDay' . $dayNum] / $avgArr['countDay' . $dayNum]);
            $avgArr['lvl' . $dayNum] = $avgArr['countLvl' . $dayNum] == 0 ? 0 : sprintf("%.2f", $avgArr['allLvl' . $dayNum] / $avgArr['countLvl' . $dayNum]);
        }
    }

}

if ($search == 2) {
    $fileName = '开服首冲明细数据';
    Help::writeExcel($fileName, $title, $outArr);
    die();
}

// 设置模板变量
$group_options = UserGroup::getGroupForOptions();
$group_options[0] = "全部";
ksort($group_options);

Template::assign('serverDiv', $serverDiv);
Template::assign('avgTitle', $avgTitle);
Template::assign('title', $title);
Template::assign('startTime', $startTime);
Template::assign('endTime', $endTime);
Template::assign('outArr', $outArr);
Template::assign('avgArr', $avgArr);
Template::assign('group_options', $group_options);
Template::assign('_GET', $_GET);
Template::assign('page_html', $page_html);
Template::display('statistics/dayFirstPay.tpl');

