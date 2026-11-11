<?php
require('../include/init.inc.php');
$method = $dayNum = '';
$search = $allPayRole = $allPayPrice = 0;
$outArr = $cache_user = $servers = array();
$chooseServer = '';
extract($_REQUEST, EXTR_IF_EXISTS);

//$startTime = $startTime ? $startTime : date('Y-m-d 00:00:00', time() - 86400 * 7);
//$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$dayList = [
    1 => 1,
    2 => 2,
    3 => 3,
    4 => 4,
    5 => 5,
    6 => 6,
    7 => 7,
];
$title = [
    'server_id' => '服务器',
    'day_num' => '天数',
    'user_id' => '用户id',
//    'accountId' => '账号id',
    'nickName' => '用户名',
    'lvl' => '结算等级',
    'rank_score' => '结算分数',
    'pay_total' => '充值总额',
//    'dayMiao' => '每日秒杀次数',
    'dayMiaoGold' => '平均每日秒杀次数(金币)',
    'dayMiaoDiamond' => '平均每日秒杀次数(钻石)',
    'dayMiaoScore' => '平均每日秒杀次数(积分)',
    'dayCost' => '每日消费返利',
    'openTag' => '开服目标',
];
$titleKey = array_keys($title);

$serversInfo = GameServerInfo::getAllServer();
$gameServerArr = [];
foreach ($serversInfo as $row) {
    $servers[$row['serverId']] = $row;
    $gameServerArr[] = $row['serverId'];
}
$serverSelect = Help::getServerSelect($gameServerArr, $chooseServer);
$selectServers = Help::getSelectedServers($gameServerArr, $chooseServer);
$selectIds = $selectServers['selectId'];

if ($search) {
    $allParam = [
        'servers' => $selectIds,
//        'dayNum' => $dayNum,
    ];

    $outArr = GameOpenServerRank::getRank($allParam);
    $rankTime = 0;
    if (!empty($outArr)) {
        foreach ($outArr as $out) {
            $cache_user[] = $out['user_id'];
            $rankTime = $out['day'];
        }
    }

    if (!empty($cache_user)) {
        $miaoParams = [
            'servers' => $selectIds,
            'users' => $cache_user,
            'shop_type' => 10//每日秒杀
        ];
        $miao = GameBuy::getTimesByDay($miaoParams);

        $user = GameUser::getServerRoleByUid($chooseServer, $cache_user);

        $params = [
            'servers' => $selectIds,
            'users' => $cache_user,
            'end' => date('Y-m-d H:i:s', strtotime($rankTime) + 86400),
        ];
        $recharge = RechargeRequest::getPayUsers($params);

        $rewardParams = [
            'servers' => $selectIds,
            'users' => $cache_user,
            'type' => [49, 6]//
        ];
        $reward = GameReward::getDataByDay($rewardParams);

        foreach ($outArr as &$out) {
            //统计的是前一天的数据，日期减一
            $out['day'] = date('Y-m-d', strtotime($out['day']) - 86400);
            $out['nickName'] = $user[$out['user_id']]['nickName'];
            foreach ($miao as $m) {
                if ($m['day'] == $out['day'] && $m['user_id'] == $out['user_id']) {
                    $out['dayMiao'] += $m['times'];
                    if ($m['currency_type'] == 1) {
                        $out['dayMiaoGold'] += $m['times'];
                    }
                    if ($m['currency_type'] == 2) {
                        $out['dayMiaoDiamond'] += $m['times'];
                    }
                    if ($m['currency_type'] == 7) {
                        $out['dayMiaoScore'] += $m['times'];
                    }
                }
            }

            foreach ($recharge as $rec) {
                if ($rec['userId'] == $out['user_id'] && $rec['day'] == $out['day']) {
                    $out['pay_total'] += $rec['allPrice'];
                }
            }

            foreach ($reward as $r) {
                if ($r['day'] == $out['day'] && $r['user_id'] == $out['user_id']) {
                    $day = $out['day'];
                    $openTime = $servers[$out['server_id']]['serverDate'];
                    $diff = Help::getDifferentDays($openTime, $day . ' 23:59:59');//日期格式不统一，会产生-1
                    if ($r['type'] == 6 && 7100001 <= $r['reward_id'] && $r['reward_id'] <= 7700012) {
                        $out['dayCost'] ++;
                    }

                    $rewStart = 6000001 + 8 * $diff;
                    $rewEnd = 6000008 + 8 * $diff;
                    if ($r['type'] == 49 && $rewStart <= $r['reward_id'] && $r['reward_id'] <= $rewEnd) {
                        $out['openTag'] ++;
                    }
                }
            }
        }
    }
}

if ($search == 2) {
    $fileName = '开服竞赛数据';
    Help::writeExcel($fileName, $title, $outArr);
    die();
}

// 设置模板变量
$group_options = UserGroup::getGroupForOptions();
$group_options[0] = "全部";
ksort($group_options);

Template::assign('serverSelect', $serverSelect);
Template::assign('title', $title);
Template::assign('dayList', $dayList);
Template::assign('startTime', $startTime);
Template::assign('endTime', $endTime);
Template::assign('allPayRole', $allPayRole);
Template::assign('allPayPrice', $allPayPrice);
Template::assign('outArr', $outArr);
Template::assign('group_options', $group_options);
Template::assign('_GET', $_GET);
Template::assign('page_html', $page_html);
Template::display('statistics/openServerRank.tpl');
