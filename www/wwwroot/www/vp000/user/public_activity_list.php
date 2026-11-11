<?php
require('../include/init.inc.php');
$page_no = $row_count = $search = 0;
$server_id = $class_name = $tem = $changeOpen = "";
$actlist = [];
extract($_REQUEST, EXTR_IF_EXISTS);

$temType = [
    0 => '线上活动',
    1 => '模板'
];
$activityTitle = [
    'id' => '活动ID',
    'type' => '类型ID',
    'title' => '活动简称',
    'fullTitle' => '活动全称',
    'sort' => '排序',
    'openStr' => '开放状态',
    'startTime' => '开始时间',
    'endTime' => '结束时间',
    'serverArr' => '生效服务器',
    'isTempStr' => '是否模板',
    'isAnyTimeValid' => '任意时间生效',
];
$tempTitle = [
    'id' => '活动ID',
    'type' => '类型ID',
    'templateName' => '模板名称',
    'sort' => '排序',
    'openStr' => '开放状态',
    'startTime' => '开始时间',
    'endTime' => '结束时间',
    'serverArr' => '生效服务器',
    'isTempStr' => '是否模板',
    'isAnyTimeValid' => '任意时间生效',
];
$title = $tem == 1 ? $tempTitle : $activityTitle;

if ($search == 1) {
    $params = [
        'isTemplate' => $tem
    ];
    //START
    $row_count = GamePublicActivity::count($params);
    $page_size = PAGE_SIZE;
    $page_no = $page_no < 1 ? 1 : $page_no;

    $total_page = $row_count % $page_size == 0 ? $row_count / $page_size : ceil($row_count / $page_size);
    $total_page = $total_page < 1 ? 1 : $total_page;
    $page_no = $page_no > ($total_page) ? ($total_page) : $page_no;
    $start = ($page_no - 1) * $page_size;
//END

    $actlist = GamePublicActivity::getList($start, $page_size, $params);
    if (!empty($actlist)) {
        foreach ($actlist as &$act) {
            $act['openStr'] = $act['isOpen'] == 1 ? '开启' : '关闭';
            $act['isTempStr'] = $act['isTemplate'] == 1 ? '是' : '否';
            $act['serverArr'] = !empty($act['serverArr']) ? $act['serverArr'] : '所有服';
            $act['isAnyTimeValid'] = $act['isAnyTimeValid'] == 1 ? '是' : '否';
        }
    }
}

if ($search == 2) {
    $params = [
        'isOpen' => $changeOpen ? 1 : 0
    ];
    $result = GamePublicActivity::templateSwitch($params);
    echo $result;
    exit;
}

$page_html = Pagination::showPager("public_activity_list.php?search=1&tem=$tem", $page_no, PAGE_SIZE, $row_count);
Template::assign('page_no', $page_no);
Template::assign('page_size', PAGE_SIZE);
Template::assign('row_count', $row_count);
Template::assign('page_html', $page_html);
Template::assign('temType', $temType);
Template::assign('outArr', $actlist);
Template::assign('title', $title);
Template::assign('_GET', $_GET);
Template::display('user/public_activity_list.tpl');