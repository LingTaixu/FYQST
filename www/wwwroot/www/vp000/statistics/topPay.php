<?php
error_reporting(E_ALL);
require('../include/init.inc.php');
$method = $user_id = $selectServer = '';
$page_no = $row_count = $search = 0;
$rechargeInfo = $rechargeRank = $cache_user = $chooseChannel = array();
extract($_REQUEST, EXTR_IF_EXISTS);
$title = [
    'accountId' => '账号ID',
    'userId' => '玩家ID',
    'nickName' => '玩家名称',
    'totalNum' => '总充值金额',
    'sdkChannel' => '子渠道',
];
$titleKey = array_keys($title);

//START 数据库查询及分页数据
$page_size = PAGE_SIZE;
$page_no = $page_no < 1 ? 1 : $page_no;
$page_html = '';

$serversInfo = GameServerInfo::getAllServer();
$gameServerArr = [];
foreach ($serversInfo as $row) {
    $gameServerArr[] = $row['serverId'];
}
$serverDiv = Help::getServerInput($selectServer);
$selectServers = Help::getSelectedServers($gameServerArr, $selectServer);
$selectIds = $selectServers['selectId'];

//渠道选项
$sdkChannel = UserSession::getUserPlatform();
$channelDiv = '';
if (isset($CONFIG_SDK_CHANNEL[$sdkChannel])) {
    $gameChannelArr = $CONFIG_SDK_CHANNEL[$sdkChannel];
    $channelDiv = Help::getChannelSelect($gameChannelArr, $chooseChannel);
}

if ($search == 1) {
    $params = [
        'servers' => $selectIds,
        'channels' => [$sdkChannel],
        'sdkChannels' => $chooseChannel
    ];
    $row_count = RechargeRequest::countTopPay($params);
    $total_page = $row_count % $page_size == 0 ? $row_count / $page_size : ceil($row_count / $page_size);
    $total_page = $total_page < 1 ? 1 : $total_page;
    $page_no = $page_no > ($total_page) ? ($total_page) : $page_no;
    $start = ($page_no - 1) * $page_size;
    $recharge = RechargeRequest::getUserRechargeList($params, $start, $page_size);
    $rechargeInfo = $recharge['list'];
    $userRet = $recharge['userRet'];

    foreach ($userRet as $serVal => $uids) {
        $userInfo = GameUser::getRolesByUids($serVal, $uids);
        foreach ($rechargeInfo as &$item) {
            $uid = $item['userId'];
            if ($serVal == $item['serverId']) {
                $item['nickName'] = $userInfo[$uid]['nickName'];
            }
            $sdkChannelName = $CONFIG_SDK_CHANNEL[$sdkChannel][$item['sdkChannelId']];
            $item['sdkChannel'] = isset($sdkChannelName) ? $sdkChannelName : $item['sdkChannelId'];
        }
    }
    $page_html = Pagination::showPager("topPay.php?selectServer=$selectServer&search=$search", $page_no, $page_size, $row_count);
}

if ($search == 2) {
    $serversInfo = GameServerInfo::getAllServer();
    $gameServerArr = [];
    foreach ($serversInfo as $row) {
        $gameServerArr[] = $row['serverId'];
    }
    $serverDiv = Help::getServerInput($selectServer);
    $selectServers = Help::getSelectedServers($gameServerArr, $selectServer);
    $selectIds = $selectServers['selectId'];

    $accountInfo = GameAccount::getAccount();
    if (!empty($accountInfo)) {
        foreach ($accountInfo as $row) {
            $cache_account[$row['id']] = $row;
        }
    }
    foreach ($selectIds as $sid) {
        $users = GameUser::getUserByDate($sid);
        if (!empty($accountInfo)) {
            foreach ($users as $row) {
                $cache_user[$row['id']] = $row;
            }
        }
    }

    $recharge = RechargeRequest::getUserRechargeList();
    $rechargeInfo = $recharge['list'];
    if ($rechargeInfo) {
        foreach ($rechargeInfo as &$row) {
            $row['nickName'] = $cache_user[$row['userId']]['nickName'];
            $sdkChannelName = $CONFIG_SDK_CHANNEL[$sdkChannel][$row['sdkChannelId']];
            $row['sdkChannel'] = $sdkChannelName ? $sdkChannelName : $row['sdkChannelId'];
        }
    }

    $fileName = '付费排行统计';
    Help::writeExcel($fileName, $title, $rechargeInfo);
    die();
}

$group_options = UserGroup::getGroupForOptions();

// 设置模板变量
$group_options = UserGroup::getGroupForOptions();
$group_options[0] = "全部";
ksort($group_options);

Template::assign('serverDiv', $serverDiv);
Template::assign('channelDiv', $channelDiv);
Template::assign('title', $title);
Template::assign('outArr', $rechargeInfo);
Template::assign('group_options', $group_options);
Template::assign('_GET', $_GET);
Template::assign('page_no', $page_no);
Template::assign('page_html', $page_html);
Template::display('statistics/topPay.tpl');

