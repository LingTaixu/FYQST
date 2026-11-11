<?php

require ('../include/init.inc.php');
$ban_type = $user_name = $class_name = $page_no ="";
extract ( $_GET, EXTR_IF_EXISTS );
if(!empty($user_name)){
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
    $accountId = $playerinfo['accountId'];
    $accountInfo = GameAccount::getInfoById($accountId);
    GameAccount::setAccountBanInfo($accountInfo);
    $banList[] = $accountInfo;
}else{
    //START

    $page_size = PAGE_SIZE;
    $page_no=$page_no<1?1:$page_no;

    $total_page=$row_count%$page_size==0?$row_count/$page_size:ceil($row_count/$page_size);
    $total_page=$total_page<1?1:$total_page;
    $page_no=$page_no>($total_page)?($total_page):$page_no;
    $start = ($page_no - 1) * $page_size;
    //END
    if($ban_type == 1){
        $banList = GameAccount::getList($ban_type, $start,$page_size);//封号
        $row_count = GameAccount::count ($ban_type);
    }elseif($ban_type == 2){
        $banList = GameAccount::getList($ban_type, $start,$page_size);//禁言
        $row_count = GameAccount::count ($ban_type);
    }

    //
    $page_html=Pagination::showPager("role_banlist.php?ban_type=$ban_type",$page_no,PAGE_SIZE,$row_count);
    Template::assign ( 'page_no', $page_no );
    Template::assign ( 'page_size', PAGE_SIZE );
    Template::assign ( 'row_count', $row_count );
    Template::assign ( 'page_html', $page_html );
}
Template::assign ( 'banTypeOptionList', $BAN_ACCOUNT_TYPE );

Template::assign ( 'queryoptionlist', $GAMEPLAYER_QUERY_TYPE );
Template::assign ( '_GET', $_GET);
Template::assign ( 'banList', $banList);
Template::display ( 'user/role_banlist.tpl' );