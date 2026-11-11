<?php
require ('../include/init.inc.php');
$server_id = $class_name = $page_no = "";
extract ( $_GET, EXTR_IF_EXISTS );

//START
$row_count = GameActivity::count ();
$page_size = PAGE_SIZE;
$page_no=$page_no<1?1:$page_no;

$total_page=$row_count%$page_size==0?$row_count/$page_size:ceil($row_count/$page_size);
$total_page=$total_page<1?1:$total_page;
$page_no=$page_no>($total_page)?($total_page):$page_no;
$start = ($page_no - 1) * $page_size;
//END

$actlist = GameActivity::getList($start,$page_size);
if (!empty($actlist)) {
    foreach ($actlist as &$act) {
        $act['openStr'] = $act['isOpen'] == 1 ? '开启' : '关闭';
    }
}

$page_html=Pagination::showPager("activity_list.php",$page_no,PAGE_SIZE,$row_count);
Template::assign ( 'page_no', $page_no );
Template::assign ( 'page_size', PAGE_SIZE );
Template::assign ( 'row_count', $row_count );
Template::assign ( 'page_html', $page_html );
Template::assign ( 'actlist', $actlist);
Template::assign ( '_GET', $_GET);
Template::display ( 'user/activity_list.tpl' );