<?php
require('../include/init.inc.php');
$method = $selectServer = $startTime = $endTime = $dayNum = '';
$search = 0;
$data = $outArr = $cache_user = $cache_guild_personal = array();

extract($_REQUEST, EXTR_IF_EXISTS);

$begin = $startTime = $startTime ? $startTime : '';
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$title = [
    'day' => '开服天数',
    'serverNum' => '达成服务器数',
    'newRole' => '新创角',
    'inGuild' => '入会角色数',
    'r2' => '入会次留',
    'r3' => '入会3留',
    'r4' => '入会4留',
    'r5' => '入会5留',
    'r6' => '入会6留',
    'r7' => '入会7留',
    'r8' => '入会8留',
    'r9' => '入会9留',
    'r10' => '入会10留',
    'r14' => '入会14留',
    'r30' => '入会30留',
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
            if ($oneDiff >= $i) {
                $outArr[$i]['serverArray'][] = $sid;
                $outArr[$i]['serverNum']++;
            }
        }
    }

    foreach ($selectIds as $sid) {
        $openTime = $servers[$sid]['serverDate'];
        if (strtotime($openTime) > strtotime($startTime)) {
            $begin = $openTime;
        }

        $guildUser = $dayGuildUser = $firstUser = array();
        $condition = [
            'AND' => [
                'guildId[!]' => 0,
                'joinTime[>=]' => $begin,
                'joinTime[<]' => $endTime,
            ]
        ];
        $guildPersonalInfo = GameGuildPersonal::getList($sid, [], $condition);
        if (!empty($guildPersonalInfo)) {
            foreach ($guildPersonalInfo as $row) {
                $cache_guild_personal[$row['userId']] = $row;
                $guildUser[] = $row['userId'];
                $joinTime = $row['joinTime'];
                //和outArr key有关的,取开服时间
                $daysDiff = Help::getDifferentDays($openTime, $joinTime);
                if (isset($outArr[$daysDiff])) {
                    $outArr[$daysDiff]['inGuild'] ++;
                    $dayGuildUser[$daysDiff][$row['userId']] = 1;
                }
            }
        }

        //首日创角
        $firstParams = [
            'start' => $startTime,
            'end' => $endTime,
        ];
        $users = GameUser::getUserByDate($sid, $firstParams);
        foreach ($users as $row) {
            $cache_user[$row['id']] = $row;
            //找出角色创建时间
            $useCreateDay = $row['createTime'];
            //和outArr key有关的,取开服时间
            $daysDiff = Help::getDifferentDays($openTime, $useCreateDay);

            if (isset($outArr[$daysDiff])) {
                $outArr[$daysDiff]['newRole'] ++;
            }
        }

        //登录人数
        $params = [
            'servers' => $selectIds,
            'start' => $startTime,
            'end' => date('Y-m-d 00:00:00', strtotime($endTime) + 86400 * 30),//有30天后登录留存，做个预留
            'users' => $guildUser
        ];
        $loginData = GameLogin::getRetain($sid, $params);
        foreach ($loginData as $row) {
            $loginDay = $row['created'];//登录日期
            $userId = $row['user_id'];//登录uid
            //找出角色入会时间
            $useJoin = $cache_guild_personal[$row['user_id']]['joinTime'];

            $daysDiff = Help::getDifferentDays($useJoin, $loginDay);
            if ($daysDiff >= 0) {
                foreach ($dayGuildUser as $diff => $userArr) {
                    if (isset($userArr[$userId])) {
                        $ok = 'retain' . ($daysDiff + 1);
                        $outArr[$diff][$ok] ++;
                    }
                }
            }
        }
    }

    ksort($outArr);
    foreach ($outArr as $k => &$v) {
        $v['day'] = $k + 1;
        $v['r2'] = $v['inGuild'] == 0 ? 0 : sprintf("%.4f", $v['retain2'] / $v['inGuild']) * 100;;
        $v['r3'] = $v['inGuild'] == 0 ? 0 : sprintf("%.4f", $v['retain3'] / $v['inGuild']) * 100;;
        $v['r4'] = $v['inGuild'] == 0 ? 0 : sprintf("%.4f", $v['retain4'] / $v['inGuild']) * 100;;
        $v['r5'] = $v['inGuild'] == 0 ? 0 : sprintf("%.4f", $v['retain5'] / $v['inGuild']) * 100;;
        $v['r6'] = $v['inGuild'] == 0 ? 0 : sprintf("%.4f", $v['retain6'] / $v['inGuild']) * 100;;
        $v['r7'] = $v['inGuild'] == 0 ? 0 : sprintf("%.4f", $v['retain7'] / $v['inGuild']) * 100;;
        $v['r8'] = $v['inGuild'] == 0 ? 0 : sprintf("%.4f", $v['retain8'] / $v['inGuild']) * 100;;
        $v['r9'] = $v['inGuild'] == 0 ? 0 : sprintf("%.4f", $v['retain9'] / $v['inGuild']) * 100;;
        $v['r10'] = $v['inGuild'] == 0 ? 0 : sprintf("%.4f", $v['retain10'] / $v['inGuild']) * 100;;
        $v['r14'] = $v['inGuild'] == 0 ? 0 : sprintf("%.4f", $v['retain14'] / $v['inGuild']) * 100;;
        $v['r30'] = $v['inGuild'] == 0 ? 0 : sprintf("%.4f", $v['retain30'] / $v['inGuild']) * 100;;
    }
}

if ($search == 2) {
    $fileName = '开服行会数据';
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
Template::display('statistics/dayGuild.tpl');

