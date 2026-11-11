<?php
require('../include/init.inc.php');
$method = $selectServer = $startTime = $endTime = $dayNum = '';
$search = 0;
$data = $outArr = $theOutArray = $cache_user = array();

extract($_REQUEST, EXTR_IF_EXISTS);

$begin = $startTime = $startTime ? $startTime : '';
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$title = [
    'day' => '开服天数',
    'serverNum' => '达成服务器数',
    'goodsId' => '商品id',
    'name' => '商品名称',
    'price' => '商品单价',
    'num' => '购买数量',
    'users' => '购买人数',
    'allPrice' => '购买金额',
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
    $diff = Help::getDifferentDays($firstTime, $endTime);
    for ($i = 0; $i < $diff; $i++) {
        foreach ($selectIds as $sid) {
            $openTime = $servers[$sid]['serverDate'];
            $oneDiff = Help::getDifferentDays($openTime, $endTime);
            if ($oneDiff > $i) {
                $outArr[$i]['serverArray'][] = $sid;
                $outArr[$i]['serverNum'] ++;
            }
        }
    }

    $params = [
        'servers' => $selectIds,
        'start' => $startTime,
        'end' => $endTime,
    ];
    $recharge = RechargeRequest::getPayByServer($params);
    if ($recharge) {
        foreach ($recharge as $rec) {
            $goodsId = $rec['rechargeId'];
//            foreach ($CONFIG_PAY_INFO as $key => $payInfo) {
//                if (isset($payInfo[10010][$goodsId])) {
//                    $goodsId = $key;
//                }
//            }

            $serverId = $rec['serverId'];
            $price = $rec['allPrice'];
            $num = $rec['allNum'];
            $payTime = $rec['day'];
            $openTime = $servers[$serverId]['serverDate'];
            $daysDiff = Help::getDifferentDays($openTime, $payTime . ' 23:59:59');//日期格式不统一，会产生-1
            if ($daysDiff >= 0) {
                $cfg_new = $CONFIG_RECHARGE[$goodsId];
                $goodsName = $cfg_new['name'];
                $data[$daysDiff][$goodsId]['name'] = $goodsName;
                $data[$daysDiff][$goodsId]['goodsId'] = $goodsId;
                $data[$daysDiff][$goodsId]['price'] = $cfg_new['cost'];
                $data[$daysDiff][$goodsId]['num'] += $num;
                $data[$daysDiff][$goodsId]['users'] += $rec['users'];
                $data[$daysDiff][$goodsId]['allPrice'] += $price;
            }
        }
    }

    ksort($data);
    $theOutArray = [];
    foreach ($data as $diff => $dayItem) {
        foreach ($dayItem as $gid => $goodItem) {
            $theOutArray[] = [
                'day' => $diff + 1,
                'serverNum' => $outArr[$diff]['serverNum'],
                'goodsId' => $goodItem['goodsId'],
                'name' => $goodItem['name'],
                'price' => $goodItem['price'],
                'num' => $goodItem['num'],
                'users' => $goodItem['users'],
                'allPrice' => $goodItem['allPrice'],
            ];
        }
    }

}

if ($search == 2) {
    $fileName = '开服购买数据';
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
Template::assign('outArr', $theOutArray);
Template::assign('group_options', $group_options);
Template::assign('_GET', $_GET);
Template::assign('page_html', $page_html);
Template::display('statistics/dayBuyGoods.tpl');

