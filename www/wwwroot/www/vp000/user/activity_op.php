<?php
require ('../include/init.inc.php');
$id = $type = $op_all = $items = $title = $fullTitle = $exValues = $exValues = $exValues2 = $exValues3 = $exData = $startTime = $endTime = $sort = $openStatus = $note = '';
extract ( $_REQUEST, EXTR_IF_EXISTS );

Common::checkParam($id);
$activity= GameActivity::getActivityById ( $id );

if (empty($activity)) {
    Common::exitWithError(ErrorMessage::ACTIVITY_NOT_EXIST, "user/activity_list.php");
}
if (Common::isPost ()) {

    if($endTime ==""|| $startTime =="" ){

        OSAdmin::alert("error",ErrorMessage::NEED_PARAM);
    }else{

        $update_data = array ('title' => $title,'fullTitle' => $fullTitle, 'startTime' => $startTime, 'endTime' => $endTime,
            'items' => $items, 'exValues' => $exValues, 'exValues2' => $exValues2, 'exValues3' => $exValues3, 'exData' => $exData,'note' => $note, 'sort' => $sort, 'isOpen' => $openStatus);

        if ($op_all == 1){
            $allServerList = GameServerInfo::getList(0, 3000);
            foreach ($allServerList as $k => $server) {
                $sid = $server['id'];
                $act = GameActivity::getServerActivity($sid, ['id' => $id]);
                if (empty($act)) {
                    $insertData = ['id' => $id, 'type' => $type];
                    $insertData = array_merge($insertData, $update_data);
                    $result = GameActivity::insert($insertData, $sid);
                } else {
                    GameActivity::updateByServerId($sid, $id, $update_data);
                    if ($type == 6 || $type == 49 || $type == 50) {  // 开服活动
                        GameActivity::OpenServer($server['id'], $server['serverDate']);
                    }
                }
            }
        }else{
            $result = GameActivity::update ( $id,$update_data );
        }

        if ($result>=0) {
            $current_user=UserSession::getSessionInfo();
            $ip = Common::getIp();
            $update_data['ip']=$ip;
            //SysLog::addLog ( UserSession::getUserName(), 'MODIFY', 'User' , $user_id, json_encode($update_data) );
            Common::exitWithSuccess ('更新完成','user/activity_list.php');
        } else {

            OSAdmin::alert("error");
        }
    }
}

$openArray = [
    0 => '关闭',
    1 => '开启',
];
$op_server = array(
    0 => "本服",
    1 => "全服"
);

Template::assign ( 'activity', $activity );
Template::assign('open_options_list', $openArray);
Template::assign ( 'op_server', $op_server);
Template::display ( 'user/activity_op.tpl' );