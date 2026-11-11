<?php
require('../include/init.inc.php');
$method = $dayNum = $selectServer = '';
$search = $allPayRole = $allPayPrice = 0;
$outArr = $cache_user = $servers = $rankDay = array();

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
    'day_num' => '天数',
    'rank' => '排名',
    'pay_total' => '平均充值总额',
    'dayMiaoGold' => '平均每日秒杀次数(金币)',
    'dayMiaoDiamond' => '平均每日秒杀次数(钻石)',
    'dayMiaoScore' => '平均每日秒杀次数(积分)',
//    'dayCost' => '平均每日消费返利',
    'openTag' => '平均开服目标达成',
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
    $allParam = [
        'servers' => $selectIds,
//        'dayNum' => $dayNum,
    ];

    $rankList = GameOpenServerRank::getRank($allParam);
//    print_r($rankList);exit;
    $rankTime = 0;
    if (!empty($rankList)) {
        foreach ($rankList as $out) {
            $dayNum = $out['day_num'];
            $theServer = $out['server_id'];

            //这第四天居然是倒序的，没招
            //这第四天居然又改了现在是顺序，没招
//            if ($dayNum == 4) {
//                $rankScore = $out['rank_score'];
//                if (in_array($rankScore, [1, 2, 3])) {
//                    $rankDay[$dayNum][$theServer][$rankScore]['user_id'] = $out['user_id'];
//                    $rankDay[$dayNum][$theServer][$rankScore]['rank_score'] = $out['rank_score'];
//                    $cache_user[] = $out['user_id'];
//                    $rankTime = $out['day'];
//                } else {
//                    continue;
//                }
//                ksort($rankDay[$dayNum][$theServer]);
//            } else {
                $rankDay[$dayNum][$theServer]['count']++;
                if ($rankDay[$dayNum][$theServer]['count'] <= 3) {
                    $rankNum = $rankDay[$dayNum][$theServer]['count'];
                    $rankDay[$dayNum][$theServer][$rankNum]['user_id'] = $out['user_id'];
                    $rankDay[$dayNum][$theServer][$rankNum]['rank_score'] = $out['rank_score'];
                    $cache_user[] = $out['user_id'];
                    $rankTime = $out['day'];
                } else {
                    continue;
                }
//            }

        }
    }

    if (!empty($cache_user)) {
        $miaoParams = [
            'servers' => $selectIds,
            'users' => $cache_user,
            'shop_type' => 10//每日秒杀
        ];
        $miao = GameBuy::getTimesByServer($miaoParams);

        $user = GameUser::getServerRoleByUid($chooseServer, $cache_user);

        $params = [
            'servers' => $selectIds,
            'users' => $cache_user,
            'end' => $rankTime,
        ];
        $recharge = RechargeRequest::getPayUsers($params);

        $rewardParams = [
            'servers' => $selectIds,
            'users' => $cache_user,
            'type' => [49, 6]//
        ];
        $reward = GameReward::getDataByDay($rewardParams);

        foreach ($miao as $m) {
            $userId = $m['user_id'];
            $day = $m['day'];
            $theServer = $m['server_id'];
            $currencyType = $m['currency_type'];
            $openTime = $servers[$theServer]['serverDate'];
            $diff = Help::getDifferentDays($openTime, $day . ' 23:59:59');//日期格式不统一，会产生-1
            $dayNum = $diff + 1;

            foreach ($rankDay[$dayNum][$theServer] as $rk => $rv) {
                if ($rv['user_id'] == $userId) {
                    if ($currencyType == 1) {
                        $rankDay[$dayNum][$theServer][$rk]['dayMiaoGold'] = $m['times'];
                    }
                    if ($currencyType == 2) {
                        $rankDay[$dayNum][$theServer][$rk]['dayMiaoDiamond'] = $m['times'];
                    }
                    if ($currencyType == 7) {
                        $rankDay[$dayNum][$theServer][$rk]['dayMiaoScore'] = $m['times'];
                    }
                }
            }

        }

        foreach ($recharge as $rec) {
            $userId = $rec['userId'];
            $day = $rec['day'];
            $theServer = $rec['serverId'];
            $openTime = $servers[$theServer]['serverDate'];
            $diff = Help::getDifferentDays($openTime, $day . ' 23:59:59');//日期格式不统一，会产生-1
            $rankNum = $diff + 1;

//            if ($rankDay[$dayNum][$theServer][$rankNum]['user_id'] == $userId) {
//                $rankDay[$dayNum][$theServer][$rankNum]['pay_total'] += $rec['allPrice'];
//            }
            foreach ($rankDay[$rankNum][$theServer] as $rk => $rv) {
                if ($rv['user_id'] == $userId) {
                    $rankDay[$rankNum][$theServer][$rk]['pay_total'] += $rec['allPrice'];
                }
            }
        }

        foreach ($reward as $r) {
            $userId = $r['user_id'];
            $day = $r['day'];
            $theServer = $r['server_id'];
            $openTime = $servers[$theServer]['serverDate'];
            $diff = Help::getDifferentDays($openTime, $day . ' 23:59:59');//日期格式不统一，会产生-1
            $rankNum = $diff + 1;

            foreach ($rankDay[$rankNum][$theServer] as $rk => $rv) {
                if ($rv['user_id'] == $userId) {
                    $rankDay[$rankNum][$theServer][$rk]['pay_total'] += $r['allPrice'];
                    if ($r['type'] == 6 && 7100001 <= $r['reward_id'] && $r['reward_id'] <= 7700012) {
                        $rankDay[$rankNum][$theServer][$rk]['dayCost']++;
                    }

                    $rewStart = 6000001 + 8 * $diff;
                    $rewEnd = 6000008 + 8 * $diff;
                    if ($r['type'] == 49) {
                        if ($rankNum == 4) {
                            if (6000079 <= $r['reward_id'] && $r['reward_id'] <= 6000086) {
                                $rankDay[$rankNum][$theServer][$rk]['openTag']++;
                            }
                        } elseif ($rankNum == 6) {
                            if (6000087 <= $r['reward_id'] && $r['reward_id'] <= 6000094) {
                                $rankDay[$rankNum][$theServer][$rk]['openTag']++;
                            }
                        } elseif ($rankNum == 7) {
                            if (6000095 <= $r['reward_id'] && $r['reward_id'] <= 6000102) {
                                $rankDay[$rankNum][$theServer][$rk]['openTag']++;
                            }
                        } elseif ($rewStart <= $r['reward_id'] && $r['reward_id'] <= $rewEnd) {
                            $rankDay[$rankNum][$theServer][$rk]['openTag']++;
                        }
                    }
                }
            }
        }
    }

    foreach ($rankDay as $dayNum => $dayVal) {
        foreach ($dayVal as $sid => $serVal) {
            foreach ($serVal as $rank => $item) {
                if (is_numeric($rank)) {
                    $oKey = $dayNum . '_' . $rank;
                    $outArr[$oKey]['day_num'] = $dayNum;
                    $outArr[$oKey]['rank'] = $rank;
                    $outArr[$oKey]['pay_total'] += $item['pay_total'];
                    $outArr[$oKey]['dayMiaoGold'] += $item['dayMiaoGold'];
                    $outArr[$oKey]['dayMiaoDiamond'] += $item['dayMiaoDiamond'];
                    $outArr[$oKey]['dayMiaoScore'] += $item['dayMiaoScore'];
                    $outArr[$oKey]['dayCost'] += $item['dayCost'];
                    $outArr[$oKey]['openTag'] += $item['openTag'];
                    $outArr[$oKey]['users']++;
                }
            }
        }
    }

    foreach ($outArr as &$out) {
        $out['pay_total'] = sprintf("%.2f", $out['pay_total'] / $out['users']);
        $out['dayMiaoGold'] = sprintf("%.2f", $out['dayMiaoGold'] / $out['users']);
        $out['dayMiaoDiamond'] = sprintf("%.2f", $out['dayMiaoDiamond'] / $out['users']);
        $out['dayMiaoScore'] = sprintf("%.2f", $out['dayMiaoScore'] / $out['users']);
        $out['dayCost'] = sprintf("%.2f", $out['dayCost'] / $out['users']);
        $out['openTag'] = sprintf("%.2f", $out['openTag'] / $out['users']);
    }
}

if ($search == 2) {
    $fileName = '开服竞赛平均数据';
    Help::writeExcel($fileName, $title, $outArr);
    die();
}

// 设置模板变量
$group_options = UserGroup::getGroupForOptions();
$group_options[0] = "全部";
ksort($group_options);

Template::assign('serverDiv', $serverDiv);
Template::assign('title', $title);
Template::assign('outArr', $outArr);
Template::assign('group_options', $group_options);
Template::assign('_GET', $_GET);
Template::assign('page_html', $page_html);
Template::display('statistics/openRankAvg.tpl');
