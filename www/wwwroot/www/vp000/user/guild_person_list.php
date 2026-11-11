<?php
require('../include/init.inc.php');
$outArr = [];
$serverId = $id = $page_no = $search = $userId = $guildId = "";
$type = 0;
extract($_REQUEST, EXTR_IF_EXISTS);

$position = [
    1 => '会长',
    2 => '副会长',
    3 => '会员',
];
$title = [
    'guildName' => '公会名称',
    'userId' => '玩家id',
    'nickName' => '玩家名称',
    'positionName' => '职位',
];

if ($search == 3) {
    $params = [
        'userId' => $userId,
        'guildId' => $guildId
    ];
    $result = GameGuildPersonal::updateInfoByApi($serverId, $params);
    echo $result;
    exit();
}

if ($serverId) {
    $params = [
        'guildId' => $id,
    ];
    $outArr = GameGuildPersonal::getDataJoinUser($serverId, $params);
    if ($outArr) {
        foreach ($outArr as &$out) {
            $out['positionName'] = isset($position[$out['position']]) ? $position[$out['position']] : '';
        }
    }
}

// 设置模板变量
$group_options = UserGroup::getGroupForOptions();
$group_options[0] = "全部";
ksort($group_options);

Template::assign('group_options', $group_options);
Template::assign('title', $title);
Template::assign('outArr', $outArr);
Template::assign('_GET', $_GET);
Template::assign('page_no', $page_no);
Template::assign('page_html', $page_html);
Template::assign('serverId', $serverId);
Template::display('user/guild_person_list.tpl');