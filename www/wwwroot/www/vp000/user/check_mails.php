<?php

require ('../include/init.inc.php');
$serverIdArr = $class_name = $user_name = $chat_type = $page_no = "";
extract ( $_POST, EXTR_IF_EXISTS );
$playerinfo = array();
if($user_name != ''){
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
}


$chatlist = array();

//START
$row_count = GmtCheckMail::count ($uid,$platform,$serverId);

$page_size = PAGE_SIZE;
$page_no=$page_no<1?1:$page_no;

$total_page=$row_count%$page_size==0?$row_count/$page_size:ceil($row_count/$page_size);
$total_page=$total_page<1?1:$total_page;
$page_no=$page_no>($total_page)?($total_page):$page_no;
$start = ($page_no - 1) * $page_size;
//END
$platform = UserSession::getUserPlatform();
$serverId = UserSession::getUserServerId();
$maillist = GmtCheckMail::getMailList($uid,$platform,$serverId, $start,$page_size);

//
$page_html=Pagination::showPager("check_mails.php?user_name=$user_name&class_name=$class_name",$page_no,PAGE_SIZE,$row_count);
Template::assign ( 'page_no', $page_no );
Template::assign ( 'page_size', PAGE_SIZE );
Template::assign ( 'row_count', $row_count );
Template::assign ( 'page_html', $page_html );
Template::assign ( 'queryoptionlist', $GAMEPLAYER_QUERY_TYPE );
Template::assign ( 'dataList', $maillist);
Template::assign ( '_POST', $_POST);
Template::assign ( '_GET', $_GET);
Template::assign ( 'chat_type', $CHAT_TYPE);

$serverlist = getServerListByPlatform();
Template::assign ( 'serverlist', $serverlist );
Template::display ( 'user/check_mails.tpl' );