<?php
require('../include/init.inc.php');
$method = $selectServer = $startTime = $endTime = $dayNum = '';
$allNum = $allPrice = $search = 0;
$title = $outArr = array();

extract($_REQUEST, EXTR_IF_EXISTS);

$startTime = $startTime ? $startTime : '';
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
        'goodsId' => '商品ID',
        'goodsName' => '商品名',
        'goodsPrice' => '单价',
        'count' => '购买数量',
        'numRate' => '数量占比',
        'totalNum' => '金额',
        'priceRate' => '金额占比',
    ];
    $params = [
        'servers' => $selectIds,
        'start' => $startTime,
        'end' => $endTime,
    ];
    $outArr = RechargeRequest::getBuyGoodsList($params);
}
if ($search == 2) {
    $title = [
        'goodsId' => '商品ID',
        'goodsName' => '商品名',
        'count' => '购买数量',
        'numRate' => '数量占比',
        'totalNum' => '金额',
        'priceRate' => '金额占比',
    ];
    $params = [
        'servers' => $selectIds,
        'start' => $startTime,
        'end' => $endTime,
    ];
    $buyGoodsList = RechargeRequest::getGoodsByRechargeId($params);
    if ($buyGoodsList) {
        foreach ($buyGoodsList as $row) {
            $theId = $row['rechargeId'];
            $cfg_new = $CONFIG_RECHARGE[$theId];
            $goodsId = $theId;
            $goodsName = $cfg_new['name'];
            $cost = $cfg_new['cost'];

            if (in_array($goodsId, [41, 44, 45])) {
                $goodsName = '投食礼包';
                $outArr[$goodsName]['goodsId'] = '';
                $outArr[$goodsName]['goodsName'] = $goodsName;
                $outArr[$goodsName]['goodsPrice'] = $cost;
                $outArr[$goodsName]['count'] += $row['allCount'];
                $allNum += $row['allCount'];
                $outArr[$goodsName]['totalNum'] += $row['sumPrice'];
                $allPrice += $row['sumPrice'];
            } else if ($goodsId >= 61 && $goodsId <= 78 || $goodsId == 87) {
                $goodsName = '优选礼包';
                $outArr[$goodsName]['goodsId'] = '';
                $outArr[$goodsName]['goodsName'] = $goodsName;
                $outArr[$goodsName]['goodsPrice'] = $cost;
                $outArr[$goodsName]['count'] += $row['allCount'];
                $allNum += $row['allCount'];
                $outArr[$goodsName]['totalNum'] += $row['sumPrice'];
                $allPrice += $row['sumPrice'];
            } else {
                $outArr[$goodsId]['goodsId'] = $goodsId;
                $outArr[$goodsId]['goodsName'] = $goodsName;
                $outArr[$goodsId]['goodsPrice'] = $cost;
                $outArr[$goodsId]['count'] += $row['allCount'];
                $allNum += $row['allCount'];
                $outArr[$goodsId]['totalNum'] += $row['sumPrice'];
                $allPrice += $row['sumPrice'];
            }
        }

        foreach ($outArr as $goodsId => $value) {
            $outArr[$goodsId]['numRate'] = $allNum == 0 ? 0 : sprintf("%.4f", $value['count'] / $allNum) * 100;
            $outArr[$goodsId]['priceRate'] = $allPrice == 0 ? 0 : sprintf("%.4f", $value['totalNum'] / $allPrice) * 100;
        }
    }
}
if ($search == 3) {
    $title = [
        'goodsId' => '商品ID',
        'goodsName' => '商品名',
        'count' => '购买数量',
        'numRate' => '数量占比',
        'totalNum' => '金额',
        'priceRate' => '金额占比',
    ];
    $params = [
        'servers' => $selectIds,
        'start' => $startTime,
        'end' => $endTime,
    ];
    $buyGoodsList = RechargeRequest::getGoodsByRechargeId($params);
    if ($buyGoodsList) {
        foreach ($buyGoodsList as $row) {
            $theId = $row['rechargeId'];
            $cfg_new = $CONFIG_RECHARGE[$theId];
            $goodsId = $theId;
            $goodsName = $cfg_new['name'];
            $cost = $cfg_new['cost'];

            if (in_array($goodsId, [41, 44, 45])) {
                $outArr[$goodsId]['goodsId'] = $goodsId;
                $outArr[$goodsId]['goodsName'] = $goodsName;
                $outArr[$goodsId]['goodsPrice'] = $cost;
                $outArr[$goodsId]['count'] += $row['allCount'];
                $allNum += $row['allCount'];
                $outArr[$goodsId]['totalNum'] += $row['sumPrice'];
                $allPrice += $row['sumPrice'];
            }
        }
        foreach ($outArr as $goodsId => $value) {
            $outArr[$goodsId]['numRate'] = $allNum == 0 ? 0 : sprintf("%.4f", $value['count'] / $allNum) * 100;
            $outArr[$goodsId]['priceRate'] = $allPrice == 0 ? 0 : sprintf("%.4f", $value['totalNum'] / $allPrice) * 100;
        }
    }
}
if ($search == 4) {
    $title = [
        'goodsName' => '商品名',
        'count' => '购买数量',
        'numRate' => '数量占比',
        'totalNum' => '金额',
        'priceRate' => '金额占比',
    ];
    $params = [
        'servers' => $selectIds,
        'start' => $startTime,
        'end' => $endTime,
    ];
    $buyGoodsList = RechargeRequest::getGoodsByRechargeId($params);
    if ($buyGoodsList) {
        foreach ($buyGoodsList as $row) {
            $theId = $row['rechargeId'];
            $cfg_new = $CONFIG_RECHARGE[$theId];
            $goodsId = $theId;
            $goodsName = $cfg_new['name'];
            $cost = $cfg_new['cost'];

            if ($goodsId >= 61 && $goodsId <= 78 || $goodsId == 87) {
                $allNum += $row['allCount'];
                $allPrice += $row['sumPrice'];
                if (in_array($goodsId, [61, 62, 63, 87])) {
                    $theId = 3;
                    $outArr[$theId]['goodsName'] = $goodsName;
                    $outArr[$theId]['goodsPrice'] = $cost;
                    $outArr[$theId]['count'] += $row['allCount'];
                    $outArr[$theId]['totalNum'] += $row['sumPrice'];
                }
                if (in_array($goodsId, [64, 65, 66, 67])) {
                    $theId = 6;
                    $outArr[$theId]['goodsName'] = $goodsName;
                    $outArr[$theId]['goodsPrice'] = $cost;
                    $outArr[$theId]['count'] += $row['allCount'];
                    $outArr[$theId]['totalNum'] += $row['sumPrice'];
                }
                if (in_array($goodsId, [68, 69, 70, 71, 72])) {
                    $theId = 12;
                    $outArr[$theId]['goodsName'] = $goodsName;
                    $outArr[$theId]['goodsPrice'] = $cost;
                    $outArr[$theId]['count'] += $row['allCount'];
                    $outArr[$theId]['totalNum'] += $row['sumPrice'];
                }
                if (in_array($goodsId, [73, 74, 75, 76, 77, 78])) {
                    $theId = 49;
                    $outArr[$theId]['goodsName'] = $goodsName;
                    $outArr[$theId]['goodsPrice'] = $cost;
                    $outArr[$theId]['count'] += $row['allCount'];
                    $outArr[$theId]['totalNum'] += $row['sumPrice'];
                }
            }
        }

        foreach ($outArr as $goodsId => $value) {
            $outArr[$goodsId]['numRate'] = $allNum == 0 ? 0 : sprintf("%.4f", $value['count'] / $allNum) * 100;
            $outArr[$goodsId]['priceRate'] = $allPrice == 0 ? 0 : sprintf("%.4f", $value['totalNum'] / $allPrice) * 100;
        }
    }
}

Template::assign('title', $title);
Template::assign('outArr', $outArr);
Template::assign('serverDiv', $serverDiv);
Template::assign('startTime', $startTime);
Template::assign('endTime', $endTime);
Template::assign('_GET', $_GET);
Template::display('user/sta_buy_goods.tpl');
