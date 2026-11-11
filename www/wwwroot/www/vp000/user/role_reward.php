<?php
require('../include/init.inc.php');
$uid = $nick = $page_no = "";
extract($_REQUEST, EXTR_IF_EXISTS);
$outArr = [];

//START 数据库查询及分页数据
$page_size = PAGE_SIZE;
$page_no = $page_no < 1 ? 1 : $page_no;

$title = [
    'user_id' => '领取等级',
    'lvl' => '领取等级',
    'type' => 'type',
    'reward_id' => '领取类型',
    'data' => '领取物品',
    'created' => '领取时间',
];
$param = [
    'uid' => $uid,
];
$row_count = GameReward::count($param);
$total_page = $row_count % $page_size == 0 ? $row_count / $page_size : ceil($row_count / $page_size);
$total_page = $total_page < 1 ? 1 : $total_page;
$page_no = $page_no > ($total_page) ? ($total_page) : $page_no;
$start = ($page_no - 1) * $page_size;
$param['pageStart'] = $start;
$param['pageSize'] = $page_size;
$outArr = GameReward::getList($param);

$page_html = Pagination::showPager("role_reward.php?uid=$uid&nick=$nick", $page_no, $page_size, $row_count);


Template::assign('_GET', $_GET);
Template::assign('outArr', $outArr);
Template::assign('title', $title);
Template::assign('page_no', $page_no);
Template::assign('page_html', $page_html);
Template::display('user/role_reward.tpl');