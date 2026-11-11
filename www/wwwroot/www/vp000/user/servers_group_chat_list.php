<?php
require('../include/init.inc.php');
$id = $page_no = $search = $method = '';
extract($_REQUEST, EXTR_IF_EXISTS);

if ($method == 'del' && ! empty ( $id )) {
    $result = SpanServersChatGroup::delById( $id );
    if ($result>=0) {
        SysLog::addLog ( UserSession::getUserName(), 'DELETE', 'SpanServersChatGroup',$id);
        Common::exitWithSuccess ('已将跨服聊天分组删除','user/servers_group_chat_list.php');
    }else{
        OSAdmin::alert("error");
    }
}
$title = [
    'id' => '序号',
    'name' => '组名',
    'serverArr' => '分组配置'
];

//START 数据库查询及分页数据
$page_size = PAGE_SIZE;
$page_no = $page_no < 1 ? 1 : $page_no;

$row_count = SpanServersChatGroup::count();
$total_page = $row_count % $page_size == 0 ? $row_count / $page_size : ceil($row_count / $page_size);
$total_page = $total_page < 1 ? 1 : $total_page;
$page_no = $page_no > ($total_page) ? ($total_page) : $page_no;
$start = ($page_no - 1) * $page_size;
$params = [
    'pageStart' => $start,
    'pageSize' => $page_size
];
$groupList = SpanServersChatGroup::getList($params);

$page_html=Pagination::showPager("servers_group_chat_list.php",$page_no,$page_size,$row_count);

//追加操作的确认层
$confirm_html = OSAdmin::renderJsConfirm("icon-remove");

// 设置模板变量
Template::assign('title', $title);
Template::assign('groupList', $groupList);
Template::assign('_GET', $_GET);
Template::assign('page_no', $page_no);
Template::assign('page_html', $page_html);
Template::assign('osadmin_action_confirm', $confirm_html);
Template::display('user/servers_group_chat_list.tpl');