<?php

require ('../include/init.inc.php');
$serverIdArr = $class_name = $user_name = $chat_type = $page_no = $startTime = $endTime = "";
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
    if(empty($uid)){
        Common::exitWithSuccess ('没有此玩家!','user/chat_monitor.php');
    }
}

if(!empty($startTime)){
    $startTime = strtotime($startTime);
}
if(!empty($endTime)){
    $endTime = strtotime($endTime);
}

$chatlist = array();
//START
$row_count = ChatLogs::count ($serverIdArr,$chat_type,$startTime,$endTime,$uid);
$page_size = 200;
$page_no=$page_no<1?1:$page_no;

$total_page=$row_count%$page_size==0?$row_count/$page_size:ceil($row_count/$page_size);
$total_page=$total_page<1?1:$total_page;
$page_no=$page_no>($total_page)?($total_page):$page_no;
$start = ($page_no - 1) * $page_size;
//END

$chatlist = ChatLogs::getList($serverIdArr,$chat_type,$startTime,$endTime,$uid, $start,$page_size);

//
$page_html=Pagination::showPager("chat_monitor.php?user_name=$user_name&class_name=$class_name",$page_no,PAGE_SIZE,$row_count);
Template::assign ( 'page_no', $page_no );
Template::assign ( 'page_size', PAGE_SIZE );
Template::assign ( 'row_count', $row_count );
Template::assign ( 'page_html', $page_html );
Template::assign ( 'queryoptionlist', $GAMEPLAYER_QUERY_TYPE );
Template::assign ( 'dataList', $chatlist);
Template::assign ( '_POST', $_POST);
Template::assign ( '_GET', $_GET);
Template::assign ( 'chat_type', $CHAT_TYPE);

$serverlist = getServerListByPlatform();
Template::assign ( 'serverlist', $serverlist );
Template::display ( 'user/chat_monitor.tpl' );