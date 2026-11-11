<?php
error_reporting(E_ALL);
require('../include/init.inc.php');
$method = $user_id = $selectServer = '';
$page_no = $row_count = $search = 0;
$rechargeInfo = $rechargeRank = $cache_user = $chooseChannel = array();
extract($_REQUEST, EXTR_IF_EXISTS);
$title = [
    'id' => 'ID',
    'channelId' => '渠道ID',
    'channelName' => '渠道名称',
    'sdkChannelId' => '子渠道ID',
    'sdkChannelName' => '子渠道名称',
    'channelDesc' => '渠道描述',
    'do' => '操作',
];
$titleKey = array_keys($title);

//    $total_page = $row_count % $page_size == 0 ? $row_count / $page_size : ceil($row_count / $page_size);
//    $total_page = $total_page < 1 ? 1 : $total_page;
//    $page_no = $page_no > ($total_page) ? ($total_page) : $page_no;
//    $start = ($page_no - 1) * $page_size;
$outArr = GameChannelConfig::getList();
if ($outArr) {
    foreach ($outArr as &$out) {
        $out['do'] = "<a href=\"channel_config.php?id={$out['id']}\" title= \"修改状态\" ><i class=\"icon-pencil\"></i></a>";
    }
}

//$page_html = Pagination::showPager("topPay.php?selectServer=$selectServer&search=$search", $page_no, $page_size, $row_count);

//追加操作的确认层
$confirm_html = OSAdmin::renderJsConfirm("icon-pencil");

if ($search == 2) {
    unset($title['do']);
    $channelInfo = GameChannelConfig::getList();
    $fileName = '渠道列表';
    Help::writeExcel($fileName, $title, $channelInfo);
    die();
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
Template::assign('osadmin_action_confirm', $confirm_html);
Template::display('user/channel_list.tpl');