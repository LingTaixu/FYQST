<?php
require('../include/init.inc.php');
define('EOL', (PHP_SAPI == 'cli') ? PHP_EOL : '<br />');
ini_set('memory_limit', '8024M');
ini_set('max_execution_time', '0');

const channelStr = '-';
$method = $startTime = $endTime = $selectServer = $html = '';
$search = 0;
$selectIds = $cache_account = $cache_user = $dateArr = $channelArr = $liuCunArr = $newAccountArr = $regArr = $totalCharge = $accountLogin = array();
$chargePersonNum = $totalCharge = $channel = $sdkChannel = $gameChannelArr = $gameSdkChannelArr = [];
$selectServer = '';
extract($_REQUEST, EXTR_IF_EXISTS);

$startTime = $startTime ? $startTime : '';
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$title = [
    'loginNum' => '活跃人数',
    'payRate' => '付费率',
    'arppu' => 'arppu',
    'newAdd' => '新增人数',
    'r2' => '次留',
    'r3' => '三留',
    'r7' => '七留',
];
$tSize = sizeof($title);

//服务器选项
$serversInfo = GameServerInfo::getAllServer();
$gameServerArr = [];
foreach ($serversInfo as $row) {
    $gameServerArr[] = $row['serverId'];
}
$serverDiv = Help::getServerInput($selectServer);
$selectServers = Help::getSelectedServers($gameServerArr, $selectServer);
$selectIds = $selectServers['selectId'];

//渠道选项
$channelList = GameChannelConfig::getList();
$channelDiv = '';
$sdkChannelDiv = '';

if (isset($PLATFORM_LIST)) {
    $channelDiv = Help::getChannelSelect($PLATFORM_LIST, $channel, 'channel');
}
if ($channelList) {
    foreach ($channelList as $row) {
        $channelId = $row['channelId'];
        $sdkChannelId = $row['sdkChannelId'];
        if ($channelId == 10006) {
            $gameSdkChannelArr[$sdkChannelId] = $row['channelDesc'];
        }
    }
    $sdkChannelDiv = Help::getChannelSelect($gameSdkChannelArr, $sdkChannel, 'sdkChannel');
}
if (empty($channel) || !in_array('10006', $channel)) {
    $sdkChannel = [];
}

if ($search) {
    $cache_account = GameAccount::getAccount();
    //支付
    $payParam = [
        'channels' => $channel,
        'sdkChannels' => $sdkChannel
    ];
    $payAccount = RechargeRequest::getPriceByDay($payParam);
    foreach ($payAccount as $row) {
        $price = $row['goodsPrice'];
        $channelId = $row['channelId'];
        $sdkChannelId = $row['sdkChannelId'];
        $day = $row['day'];
        $channelKey = $channelId . channelStr . $sdkChannelId;
        if (empty($channelArr) || !in_array($channelKey, $channelArr)) {
            $channelArr[] = $channelKey;
        }
        if (empty($dateArr) || !in_array($day, $dateArr)) {
            $dateArr[] = $day;
        }
        if (strtotime($day) >= strtotime($startTime) && strtotime($day) < strtotime($endTime)) {
            //充值账号数
            if (empty($chargePersonNum[$channelKey][$day]) || !in_array($row['accountId'], $chargePersonNum[$channelKey][$day])) {
                $chargePersonNum[$channelKey][$day][] = $row['accountId'];
            }
            //总金额
            $totalCharge[$channelKey][$day] += $price;
        }
    }
    $params = [
        'start' => $startTime,
        'end' => $endTime,
        'channels' => $channel,
        'sdkChannels' => $sdkChannel
    ];
    //注册人数
    $regData = GameAccount::getRegsByDateChannel($params);
    foreach ($regData as $row) {
        $channelId = $row['channelId'];
        $sdkChannelId = $row['sdkChannelId'];
        $channelKey = $channelId . channelStr . $sdkChannelId;
        $regArr[$channelKey][$row['regDate']] = $row['num'];
    }

    foreach ($selectIds as $sid) {
        //创角
        $userParam = [
            'channels' => $channel,
            'sdkChannels' => $sdkChannel
        ];
        $users = GameUser::getUserByDate($sid, $userParam);
        foreach ($users as $row) {
            $cache_user[$row['id']] = $row;
        }
        //总账号活跃
        $logParams = [
            'start' => $startTime,
            'end' => date('Y-m-d 00:00:00', strtotime($endTime) + 86400 * 8),//有8天后登录留存，做个预留
            'channels' => $channel,
            'sdkChannels' => $sdkChannel
        ];
        $loginUsers = GameLogin::getLoginUsers($sid, $logParams);
        if ($loginUsers) {
            foreach ($loginUsers as $row) {
                $day = $row['day'];
                $channelId = $row['channel_id'];
                $sdkChannelId = $row['sdk_channel_id'];
                $channelKey = $channelId . channelStr . $sdkChannelId;
                $userId = $row['user_id'];//登录日期
                $accountId = $cache_user[$userId]['accountId'];
                $accountCrt = $cache_account[$accountId]['day'];
                if (empty($channelArr) || !in_array($channelKey, $channelArr)) {
                    $channelArr[] = $channelKey;
                }
                if (empty($dateArr) || !in_array($day, $dateArr)) {
                    $dateArr[] = $day;
                }

                if (empty($accountLogin[$channelKey][$day]) || !in_array($accountId, $accountLogin[$channelKey][$day])) {
                    $accountLogin[$channelKey][$day][] = $accountId;
                }
                if ($day > $accountCrt) {
                    $daysDiff = Help::getDifferentDays($accountCrt, $day);
                    switch ($daysDiff) {
                        case 1://次留
                            $liuCunArr[$channelKey][$accountCrt]['liucun2']++;
                            break;
                        case 2://三留
                            $liuCunArr[$channelKey][$accountCrt]['liucun3']++;
                            break;
                        case 6://七留
                            $liuCunArr[$channelKey][$accountCrt]['liucun7']++;
                            break;
                    }
                } else {
                    //新号
                    if (strtotime($accountCrt) >= strtotime($startTime) && strtotime($accountCrt) < strtotime($endTime)) {
                        if (empty($newAccountArr[$channelKey][$accountCrt]) || !in_array($accountId, $newAccountArr[$channelKey][$accountCrt])) {
                            $newAccountArr[$channelKey][$accountCrt][] = $accountId;
                        }
                    }
                }
            }
        }

    }
}

sort($dateArr);
$html = "<table class=\"table table-striped\" style=\"width: auto;white-space:nowrap;\">
    <thead>
    <tr>
        <th >日期</th>";
foreach ($dateArr as $date) {
    $html .= "<th colspan=\"$tSize\">$date</th>";
}
$html .= "</tr>
    <tr>
        <th >子渠道</th>";
foreach ($dateArr as $date) {
    foreach ($title as $t) {
        $html .= "<th >$t</th>";
    }
}
$html .= "</tr>
    </thead>
    <tbody>";
foreach ($channelArr as $channel) {
    $strArr = explode(channelStr, $channel);
    $channelId = $strArr[0];
    $sdkChannelId = $strArr[1];
    $html .= "<tr>
            <td>" . $PLATFORM_LIST[$channelId] . channelStr . $gameSdkChannelArr[$sdkChannelId] . "</td>";
    foreach ($dateArr as $day) {
        $html .= "<td>" . sizeof($accountLogin[$channel][$day]) . "</td>";
        $html .= "<td>" . getPercent(sizeof($chargePersonNum[$channel][$day]), sizeof($accountLogin[$channel][$day])) . "</td>";
        $html .= "<td>" . getDecimal($totalCharge[$channel][$day], sizeof($chargePersonNum[$channel][$day])) . "</td>";
        $html .= "<td>" . sizeof($newAccountArr[$channel][$day]) . "</td>";
        $html .= "<td>" . getPercent($liuCunArr[$channel][$day]['liucun2'], $regArr[$channel][$day]) . "</td>";
        $html .= "<td>" . getPercent($liuCunArr[$channel][$day]['liucun3'], $regArr[$channel][$day]) . "</td>";
        $html .= "<td>" . getPercent($liuCunArr[$channel][$day]['liucun7'], $regArr[$channel][$day]) . "</td>";
    }
    $html .= "</tr>";
}
$html .= "</tbody>
</table>";

// 设置模板变量
$group_options = UserGroup::getGroupForOptions();
$group_options[0] = "全部";
ksort($group_options);

Template::assign('channelDiv', $channelDiv);
Template::assign('sdkChannelDiv', $sdkChannelDiv);
Template::assign('title', $title);
Template::assign('startTime', $startTime);
Template::assign('endTime', $endTime);
Template::assign('html', $html);
Template::assign('group_options', $group_options);
Template::assign('_GET', $_GET);
Template::assign('page_html', $page_html);
Template::display('statistics/channelStatistic.tpl');

function getPercent($num, $den)
{
    $res = $den == 0 ? 0 : sprintf("%.4f", $num / $den) * 100;
    return $res;
}

function getDecimal($num, $den, $format = '%.2f')
{
    $res = $den == 0 ? 0 : sprintf($format, $num / $den);
    return $res;
}