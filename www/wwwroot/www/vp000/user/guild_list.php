<?php
require('../include/init.inc.php');
$outArr = [];
$serverId = $id = $page_no = $search = $change = "";
$type = 0;
extract($_REQUEST, EXTR_IF_EXISTS);

$title = [
    'id' => 'id',
    'name' => '公会名',
    'lvl' => '公会等级',
];

$serverId = UserSession::getUserServerId();
//START 数据库查询及分页数据
$page_size = PAGE_SIZE * 2;
$page_no = $page_no < 1 ? 1 : $page_no;

$params = [];
$row_count = GameGuild::count($params);
$total_page = $row_count % $page_size == 0 ? $row_count / $page_size : ceil($row_count / $page_size);
$total_page = $total_page < 1 ? 1 : $total_page;
$page_no = $page_no > ($total_page) ? ($total_page) : $page_no;
$start = ($page_no - 1) * $page_size;
$params += [
    'pageStart' => $start,
    'pageSize' => $page_size
];
$guild = GameGuild::getList($params);
//if ($guild) {
//}

$page_html=Pagination::showPager("guild_list.php",$page_no,$page_size,$row_count);

// 设置模板变量
$group_options = UserGroup::getGroupForOptions();
$group_options[0] = "全部";
ksort($group_options);

Template::assign('group_options', $group_options);
Template::assign('title', $title);
Template::assign('outArr', $guild);
Template::assign('_GET', $_GET);
Template::assign('page_no', $page_no);
Template::assign('page_html', $page_html);
Template::assign('serverId', $serverId);
Template::display('user/guild_list.tpl');