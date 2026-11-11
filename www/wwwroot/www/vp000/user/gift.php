<?php
require ('../include/init.inc.php');
$code = '';
extract ( $_POST, EXTR_IF_EXISTS );
$codelist = array();
if (Common::isPost ()) {
    $codelist = Gift::getGiftByCode($code);
    if(count($codelist)>0){
        if(is_numeric($codelist['usetime'])){
            $codelist['usetime'] = date('Y-m-d H:i:s', $codelist['usetime']);
        }
        if(is_numeric($codelist['user'])){
            $playerinfo = GameUser::getRoleByUid($codelist['user']);
            $codelist['user'] = $playerinfo["nickname"];
        }
        $codelist['isUsed'] = $codelist['isUsed'] == 1 ? '已使用' : '未使用';
    }
}
//START
$row_count = GameNotice::count ($type);
$page_size = PAGE_SIZE;
$page_no=$page_no<1?1:$page_no;

$total_page=$row_count%$page_size==0?$row_count/$page_size:ceil($row_count/$page_size);
$total_page=$total_page<1?1:$total_page;
$page_no=$page_no>($total_page)?($total_page):$page_no;
$start = ($page_no - 1) * $page_size;
//END

//$noticeList = Gift::getAllGift($type,$start,$page_size);
//$noticeList = Gift::getAllGift();

//追加操作的确认层
$confirm_html = OSAdmin::renderJsConfirm("icon-remove");

Template::assign ( 'osadmin_action_confirm' , $confirm_html);
//Template::assign ( 'gifts', $gifts );
Template::assign ( '_POST', $_POST );
Template::assign ( 'codelist', $codelist );
Template::display ( 'user/gift.tpl' );
