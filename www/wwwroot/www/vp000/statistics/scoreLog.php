<?php
require('../include/init.inc.php');
$method = $user_id = $selectServer = $startTime = $endTime = '';
$page_no = $row_count = $search = 0;
$outArr = $data = array();
extract($_REQUEST, EXTR_IF_EXISTS);

$startTime = $startTime ? $startTime : date('Y-m-d 00:00:00', time() - 86400 * 7);
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$title = [
    'item_id' => '商品id',
    'item_name' => '商品名称',
    'times' => '购买次数',
    'users' => '购买人数',
    'nums' => '购买总数',
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
    foreach ($selectIds as $sid) {
        $params = [
            'sub_op' => 'cost',
            'start' => $startTime,
            'end' => $endTime,
        ];
        $data = CurrencyDScoreLog::getDataByItemId($sid, $params);
        if ($data) {
            foreach ($data as $val) {
                $item = $val['item_id'];
                $itemName = $CONFIG_ITEM_INFO[$val['item_id']]['name'];
                if (empty($itemName)) {
                    $itemName = $CONFIG_ITEM_LOGIC[$val['item_id']]['type'];
                }
                $outArr[$item]['item_id'] = $item;
                $outArr[$item]['item_name'] = $itemName;
                $outArr[$item]['times'] += $val['times'];
                $outArr[$item]['users'] += $val['users'];
                $outArr[$item]['nums'] += $val['nums'];
            }
        }
    }

}

if ($search == 2) {
    $fileName = '积分购买数据';
    Help::writeExcel($fileName, $title, $outArr);
    die();
}

if ($search == 3) {
    $fileName = '积分购买用户数据';
    $title = [
        'userId' => '用户id',
//        'user_name' => '用户名称',
        'allPrice' => '总金额',
        'sumPrice' => '充值金额',
        'dscores' => '获得积分',
    ];
    $params = [
        'startTime' => $startTime,
        'endTime' => $endTime,
    ];
    $outArr = RechargeRequest::getSumPriceByUser($params);

    $allPrice = [];
    $allArr = RechargeRequest::getSumPriceByUser();
    foreach ($allArr as $all) {
        $allPrice[$all['userId']] = $all;
    }

    $dscores = [];

    foreach ($selectIds as $sid) {
        $params = [
            'sub_op' => 'get',
            'type' => 25,
            'start' => $startTime,
            'end' => $endTime,
        ];
        $data = CurrencyDScoreLog::getDataByUserId($sid, $params);
        foreach ($data as $d) {
            $dscores[$d['user_id']] = $d;
        }
    }
    foreach ($outArr as &$out) {
        $uid = $out['userId'];
        if (isset($dscores[$uid])) {
            $out['dscores'] = $dscores[$uid]['dscores'];
        }
        if (isset($allPrice[$uid])) {
            $out['allPrice'] = $allPrice[$uid]['sumPrice'];
        }
    }

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
Template::assign('page_no', $page_no);
Template::assign('page_html', $page_html);
Template::display('statistics/scoreLog.tpl');

