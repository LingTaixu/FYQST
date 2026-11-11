<?php
require ('../include/init.inc.php');
$type = $method = $id = "";
extract ( $_REQUEST, EXTR_IF_EXISTS );
if ($method == 'del' && ! empty ( $id )) {
    $result = GameMessage::delMessage ( $id );
    $message = GameMessage::getMessageById($id);
    if ($result>=0) {
        SysLog::addLog ( UserSession::getUserName(), 'DELETE', 'GameMessage',$id, json_encode($message) );
        //UserSession::reload();
        Common::exitWithSuccess ('已将消息删除','user/game_message.php');
    }else{
        OSAdmin::alert("error");
    }

}
//START
$row_count = GameMessage::count ($type);
$page_size = PAGE_SIZE;
$page_no=$page_no<1?1:$page_no;

$total_page=$row_count%$page_size==0?$row_count/$page_size:ceil($row_count/$page_size);
$total_page=$total_page<1?1:$total_page;
$page_no=$page_no>($total_page)?($total_page):$page_no;
$start = ($page_no - 1) * $page_size;
//END

$messageList = GameMessage::getMessageList($type,$start,$page_size);

//追加操作的确认层
$confirm_html = OSAdmin::renderJsConfirm("icon-remove");

$page_html=Pagination::showPager("game_message.php?type=$type",$page_no,PAGE_SIZE,$row_count);
Template::assign ( '_GET', $_GET);
Template::assign ( 'messageList', $messageList);
Template::assign ( 'queryoptionlist', $GAMEMESSAGE_QUERY_TYPE );
Template::assign ( 'page_html', $page_html );
Template::assign ( 'osadmin_action_confirm' , $confirm_html);
Template::display ( 'user/game_message.tpl' );