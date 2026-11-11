<?php
require ('../include/init.inc.php');
$id = $title = $content = $isOpen  = $updateTime = $iconType = $noticeTime = $startTime = $endTime = $sort = $exData = '';
$serverIdArr = [];
extract ( $_REQUEST, EXTR_IF_EXISTS );

Common::checkParam($id);
$info = GameNotice::getNoticeById ( $id );
//var_dump($info);
//exit();
if(empty($info)){
    Common::exitWithError(ErrorMessage::USER_NOT_EXIST,"user/game_notice.php");
}
if (Common::isPost ()) {
    if($title=="" || $content=="" ){

        OSAdmin::alert("error",ErrorMessage::NEED_PARAM);
    }else{
        $input_data = array ('title' => $title, '`content`' => $content, 'serverIdArr' => json_encode($serverIdArr), 'isOpen' => $isOpen,
            'updateTime' => $updateTime, '`iconType`' => $iconType, 'noticeTime' => $noticeTime, 'startTime' => $startTime, 'endTime' => $endTime,'sort'=>$sort,'exData'=>$exData );

        $result = GameNotice::updateNotice ($id, $input_data );
        if ($result>=0) {
            SysLog::addLog ( UserSession::getUserName(), 'UPDATE', 'GameNotice' ,$id, json_encode($input_data) );
            Common::exitWithSuccess ('更新公告完成','user/game_notice.php');
        }else{
            OSAdmin::alert("error");
        }
    }
}

Template::assign("_POST" ,$_POST);
Template::assign ( 'info', $info );
Template::assign ( 'queryoptionlist', $GAMENOTICE_QUERY_TYPE );
$isOpenConfig = [0=>'不开启',1=>'开启'];
Template::assign ( 'isOpenConfig', $isOpenConfig );
//$serverlist = $SERVER_LIST;
//unset($serverlist[0]);
$serverlist = getServerListByPlatform();
Template::assign ( 'serverlist', $serverlist );
Template::display ( 'user/game_notice_modify.tpl' );
