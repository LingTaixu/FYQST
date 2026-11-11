<?php

require ('../include/init.inc.php');
$user_name = $class_name = $page_no = "";
extract ( $_GET, EXTR_IF_EXISTS );

$playerinfo = array();
if($class_name == 'uid'){  // 玩家内部账号
    $uid = $user_name;
    $playerinfo = GameUser::getRoleByAccountid($uid);
}else if($class_name == 'charid'){
    $charid = $user_name;
    $playerinfo = GameUser::getRoleByUid($charid);
}else if($class_name == 'charname'){
    $name = $user_name;
    $playerinfo = GameUser::getUserByNick($name);
}
$uid = $playerinfo['id'];

$maillist = array();

//START
$row_count = GameMail::count ($uid);

$page_size = PAGE_SIZE;
$page_no=$page_no<1?1:$page_no;

$total_page=$row_count%$page_size==0?$row_count/$page_size:ceil($row_count/$page_size);
$total_page=$total_page<1?1:$total_page;
$page_no=$page_no>($total_page)?($total_page):$page_no;
$start = ($page_no - 1) * $page_size;
//END

$maillist = GameMail::getMailList($uid, $start,$page_size);

//
$page_html=Pagination::showPager("role_maillist.php?user_name=$user_name&class_name=$class_name",$page_no,PAGE_SIZE,$row_count);
Template::assign ( 'page_no', $page_no );
Template::assign ( 'page_size', PAGE_SIZE );
Template::assign ( 'row_count', $row_count );
Template::assign ( 'page_html', $page_html );
Template::assign ( 'queryoptionlist', $GAMEPLAYER_QUERY_TYPE );
Template::assign ( 'mail_info', $maillist);
Template::assign ( '_GET', $_GET);
Template::display ( 'user/role_maillist.tpl' );