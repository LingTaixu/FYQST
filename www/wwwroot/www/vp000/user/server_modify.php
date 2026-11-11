<?php
require ('../include/init.inc.php');
$id = $name = $area = $isNew = $status = $isClose = $serverDate = '';
extract ( $_REQUEST, EXTR_IF_EXISTS );

Common::checkParam($id);
$server = GameServerInfo::getServerById ( $id );
if(empty($server)){
    Common::exitWithError(ErrorMessage::USER_NOT_EXIST,"user/server_list.php");
}
if (Common::isPost ()) {

    if($name=="" || $area =="" || $isNew ==""|| $status ==""|| $isClose ==""|| $serverDate =="" ){

        OSAdmin::alert("error",ErrorMessage::NEED_PARAM);
    }else{

        $update_data = array ('name' => $name, 'area' => $area,
            'isNew' => $isNew, 'status' => $status, 'isClose' => $isClose, 'serverDate' => $serverDate );

        $result = GameServerInfo::update ( $id,$update_data );

        GameActivity::openServer($id, $serverDate);

        if ($result>=0) {
            $current_user=UserSession::getSessionInfo();
            $ip = Common::getIp();
            $update_data['ip']=$ip;
            //SysLog::addLog ( UserSession::getUserName(), 'MODIFY', 'User' , $user_id, json_encode($update_data) );
            Common::exitWithSuccess ('更新完成','user/server_list.php');
        } else {

            OSAdmin::alert("error");
        }
    }
}

$news_status = array(
    0 => "非新服",
    1 => "新服"
);

$maintenance_status = array(
    0 => "游戏中",
    1 => "维护中"
);
Template::assign ( 'server', $server );
Template::assign ( 'server_status', $SERVER_STATUS );
Template::assign ( 'news_status', $news_status );
Template::assign ( 'maintenance_status', $maintenance_status );
Template::display ( 'user/server_modify.tpl' );