<?php
require('../include/init.inc.php');
$serverId = $id = $page_no = $search = $change = "";
$type = 0;
extract($_REQUEST, EXTR_IF_EXISTS);

$typeArr = [
    0 => '滚服',
    1 => '战斗服',
];
$title = [
    'id' => '序号',
    'name' => '机器名称',
    'desc_info' => '机器信息',
    'host' => '域名',
    'outer_ip' => '外网地址',
    'inner_ip' => '内网地址',
    'is_init' => '是否初始化',
    'typeStr' => '机器类型',
    'servers' => '游戏服'
];

//START 数据库查询及分页数据
$page_size = PAGE_SIZE * 2;
$page_no = $page_no < 1 ? 1 : $page_no;

$params = [
    'type' => $type
];
$row_count = MachineInfo::count($params);
$total_page = $row_count % $page_size == 0 ? $row_count / $page_size : ceil($row_count / $page_size);
$total_page = $total_page < 1 ? 1 : $total_page;
$page_no = $page_no > ($total_page) ? ($total_page) : $page_no;
$start = ($page_no - 1) * $page_size;
$params += [
    'pageStart' => $start,
    'pageSize' => $page_size
];
$machineInfo = MachineInfo::getList($params);
if ($machineInfo) {
   foreach ($machineInfo as &$value) {
       $value['typeStr'] = $typeArr[$value['type']];
   }
}

$page_html=Pagination::showPager("machine_list.php",$page_no,$page_size,$row_count);

//追加操作的确认层
$confirm_html = OSAdmin::renderJsConfirm("icon-pencil");

// 设置模板变量
$group_options = UserGroup::getGroupForOptions();
$group_options[0] = "全部";
ksort($group_options);

Template::assign('typeArr', $typeArr);
Template::assign('group_options', $group_options);
Template::assign('title', $title);
Template::assign('machineInfo', $machineInfo);
Template::assign('_GET', $_GET);
Template::assign('page_no', $page_no);
Template::assign('page_html', $page_html);
Template::assign('osadmin_action_confirm', $confirm_html);
Template::display('user/machine_list.tpl');
