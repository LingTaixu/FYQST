<?php

require('../include/init.inc.php');
$user_name = $class_name = $op = $item = "";
$playerinfo = $accountInfo = array();
extract($_REQUEST, EXTR_IF_EXISTS);

if ($class_name == 'uid') {  // 玩家内部账号
    $uid = $user_name;
    $playerinfo = GameUser::getRoleByAccountid($uid);

} else if ($class_name == 'charid') {
    $charid = $user_name;
    $playerinfo = GameUser::getRoleByUid($charid);

} else if ($class_name == 'charname') {
    $name = $user_name;
    $playerinfo = GameUser::getUserByNick($name);
}
$uid = $playerinfo['id'];

if ($op == 'rechargeSimulateToUser') {
    $id = 0;
    if (!empty($playerinfo)) {
        if (empty($playerinfo['channelId'])) {
            $accountInfo = GameAccount::getInfoById($playerinfo['accountId']);
        }

        $param = [
            'accountId' => $playerinfo['accountId'],
            'userId' => $playerinfo['id'],
            'serverId' => $playerinfo['serverIndexId'],
            'rechargeId' => $item,
            'status' => 1,
            'addTime' => date('Y-m-d H:i:s', time()),
            'goodsId' => $item,
            'orderNo' => getOrderNo($playerinfo['accountId']),
            'gmStatus' => 1,
            'lvl' => $playerinfo['lvl'],
            'goodsPrice' => isset($CONFIG_RECHARGE[$item]['cost']) ? $CONFIG_RECHARGE[$item]['cost'] : 0,
            'feeMoney' => 0,
            'channelId' => $playerinfo['channelId'] ? $playerinfo['channelId'] : $accountInfo['channelId'],
            'sdkChannelId' => $playerinfo['sdkChannelId'] ? $playerinfo['sdkChannelId'] : $accountInfo['channelId'],
        ];
        $id = RechargeRequest::add($param);
    }
    echo $id;
    exit;
}

$rechargeList = [];
$channelId = UserSession::getUserPlatform();
foreach ($CONFIG_PAY_INFO as $rechargeId => $pVal) {
    if (isset($pVal[$channelId])) {
        $rechargeList[$rechargeId] = $rechargeId . ' ' . $CONFIG_RECHARGE[$rechargeId]['name'];
    }
}


Template::assign('_GET', $_GET);
Template::assign('playerinfo', $playerinfo);
Template::assign('rechargeTypeList', $rechargeList);

Template::assign('queryoptionlist', $GAMEPLAYER_QUERY_TYPE);
Template::display('user/rechargeSimulate.tpl');

function getOrderNo($accountId)
{
    list($msec, $sec) = explode(' ', microtime());
    $mSecTime = (float)sprintf('%.0f', (floatval($msec) + floatval($sec)) * 1000);
    return 'SM' . $mSecTime . $accountId;
}
