<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/1/9
 * Time: 22:32
 */

require ('../include/init.inc.php');
$serverid = $page_no =   "";
extract ( $_GET, EXTR_IF_EXISTS );
$serverid = $serverid == ""?"1":$serverid;

$serverid = UserSession::getUserServerId();

$numlist = array();

$rtime = GameOnlineNumLog::lastTime($serverid);

//START
$row_count = GameOnlineNumLog::count ($serverid, $rtime);

define ( 'NUM_PAGE_SIZE', 60 );
$page_size = NUM_PAGE_SIZE;
$page_no=$page_no<1?1:$page_no;

$total_page=$row_count%$page_size==0?$row_count/$page_size:ceil($row_count/$page_size);
$total_page=$total_page<1?1:$total_page;
$page_no=$page_no>($total_page)?($total_page):$page_no;
$start = ($page_no - 1) * $page_size;
//END

$numlist = GameOnlineNumLog::getOnlineNum($serverid, $start,$page_size,$rtime);

//var_dump($numlist);
// ��ʾ��ҳ��

$page_html=Pagination::showPager("onlinenum.php?serverid=$serverid",$page_no,NUM_PAGE_SIZE,$row_count);

// ����ͼ������
$labellist = array();
$datalist  = array();
foreach($numlist as $k=>$v){
    $labellist[] = $v["created"];
    $datalist[] = $v["num"];
}
$labels = json_encode($labellist);
$data = json_encode($datalist);

$serverlist = $GAMESERVER_IDLIST;
unset($serverlist["0"]);
Template::assign ( 'page_no', $page_no );
Template::assign ( 'page_size', PAGE_SIZE );
Template::assign ( 'row_count', $row_count );
Template::assign ( 'page_html', $page_html );
Template::assign ( 'num_info', $numlist);
Template::assign ( 'labellist', $labels);
Template::assign ( 'datalist', $data);
Template::assign ( '_GET', $_GET);
Template::assign ( 'serverid', $serverid);
Template::assign ( 'serverid_list', $serverlist );
Template::display ( 'user/onlinenum.tpl' );
