<?php
require ('../include/init.inc.php');
$title = $content = $isOpen  = $updateTime = $iconType = $noticeTime = $startTime = $endTime = $sort = $exData = '';
$serverIdArr = [];
extract ( $_POST, EXTR_IF_EXISTS );
if (Common::isPost ()) {
    if($title=="" || $content=="" ){

        OSAdmin::alert("error",ErrorMessage::NEED_PARAM);
    }else{
        $input_data = array ('title' => $title, '`content`' => $content, 'serverIdArr' => json_encode($serverIdArr), 'isOpen' => $isOpen,
            'updateTime' => $updateTime, '`iconType`' => $iconType, 'noticeTime' => $noticeTime, 'startTime' => $startTime, 'endTime' => $endTime,'sort'=>$sort,'exData'=>$exData );
        $id = GameNotice::addNotice ( $input_data );

        if ($id) {
            SysLog::addLog ( UserSession::getUserName(), 'ADD', 'GameNotice' ,$id, json_encode($input_data) );
            Common::exitWithSuccess ('添加公告成功','user/game_notice.php');
        }else{
            OSAdmin::alert("error");
        }
    }
}

Template::assign("_POST" ,$_POST);
Template::assign ( 'queryoptionlist', $GAMENOTICE_QUERY_TYPE );
$isOpenConfig = [0=>'不开启',1=>'开启'];
Template::assign ( 'isOpenConfig', $isOpenConfig );
//$serverlist = $SERVER_LIST;
//unset($serverlist[0]);
$serverlist = getServerListByPlatform();
Template::assign ( 'serverlist', $serverlist );
Template::display ( 'user/game_notice_add.tpl' );
