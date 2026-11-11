<?php
require ('../include/init.inc.php');
$id =$name = $serverArr = '';
extract ( $_REQUEST, EXTR_IF_EXISTS );

$chatGroupInfo = SpanServersChatGroup::getInfoById( $id );
if (Common::isPost ()) {
    if($name=="" || $serverArr=="" ){
        OSAdmin::alert("error",ErrorMessage::NEED_PARAM);
    }else{
        $update_data = array ('type'=> 1,'`name`' => $name, 'serverArr' => $serverArr);
        $id = SpanServersChatGroup::update( $id, $update_data );

        if ($id) {
            SysLog::addLog ( UserSession::getUserName(), 'MODIFY', 'SpanServersChatGroup' ,$id, json_encode($update_data) );
            Common::exitWithSuccess ('修改跨服聊天分组成功','user/servers_group_chat_list.php');
        }else{
            OSAdmin::alert("error");
        }
    }
}
Template::assign("chatGroupInfo" ,$chatGroupInfo);
Template::assign("_POST" ,$_POST);
Template::display ( 'user/servers_group_chat_modify.tpl' );
