<?php
require ('../include/init.inc.php');
$name = $serverArr = '';
extract ( $_POST, EXTR_IF_EXISTS );
if (Common::isPost ()) {
    if($name=="" || $serverArr=="" ){
        OSAdmin::alert("error",ErrorMessage::NEED_PARAM);
    }else{
        $input_data = array ('type'=> 1,'`name`' => $name, 'serverArr' => $serverArr);
        $id = SpanServersChatGroup::add ( $input_data );

        if ($id) {
            SysLog::addLog ( UserSession::getUserName(), 'ADD', 'SpanServersChatGroup' ,$id, json_encode($input_data) );
            Common::exitWithSuccess ('添加跨服聊天分组成功','user/servers_group_chat_list.php');
        }else{
            OSAdmin::alert("error");
        }
    }
}

Template::assign("_POST" ,$_POST);
Template::display ( 'user/servers_group_chat_add.tpl' );
