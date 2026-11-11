<?php
require('../include/init.inc.php');
$id = $type = $op_all = $items = $title = $fullTitle = $exValues = $exValues = $exValues2 = $exValues3 = $exData = $startTime = $endTime = $sort = $openStatus = $note = '';
$result = -1;
$activity = array();
extract($_POST, EXTR_IF_EXISTS);
$openArray = [
    0 => '关闭',
    1 => '开启',
];
$op_server = [
    0 => "本服",
    1 => "全服"
];

if (Common::isPost()) {
    $activity = array('id' => $id, 'type' => $type, 'title' => $title,'fullTitle' => $fullTitle, 'startTime' => $startTime, 'endTime' => $endTime,
        'items' => $items, 'exValues' => $exValues, 'exValues2' => $exValues2, 'exValues3' => $exValues3, 'exData' => $exData,'note' => $note, 'sort' => $sort, 'isOpen' => $openStatus);

    if ($id == '' || $type == '' || $title == '' || $endTime == "" || $startTime == "") {
        OSAdmin::alert("error", ErrorMessage::NEED_PARAM);
    } else {
        if ($op_all == 0) {
            $act = GameActivity::getActivityById($id);
            if (!empty($act)) {
                OSAdmin::alert("error", ErrorMessage::ACTIVITY_HAS_EXIST);
            } else {
                $result = GameActivity::insert($activity);
            }
        } elseif ($op_all == 1) {
            $serversInfo = GameServerInfo::getAllServer();
            $gameServerArr = [];
            foreach ($serversInfo as $row) {
                $sid = $row['serverId'];
                $act = GameActivity::getServerActivity($sid, ['id' => $id]);
                if (empty($act)) {
                    $result = GameActivity::insert($activity, $sid);
                }
            }
        }
        if ($result >= 0) {
            $current_user = UserSession::getSessionInfo();
            $ip = Common::getIp();
            $update_data['ip'] = $ip;
            //SysLog::addLog ( UserSession::getUserName(), 'MODIFY', 'User' , $user_id, json_encode($update_data) );
            Common::exitWithSuccess('更新完成', 'user/activity_list.php');
        } else {
            OSAdmin::alert("error");
        }
    }
}

Template::assign('activity', $activity);
Template::assign('open_options_list', $openArray);
Template::assign('op_server', $op_server);
Template::display('user/activity_add.tpl');