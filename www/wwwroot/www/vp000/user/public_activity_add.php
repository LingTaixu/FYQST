<?php
require('../include/init.inc.php');
$type = $items = $title = $fullTitle = $exValues = $exValues = $exValues2 = $exValues3 = $exData = $startTime = $endTime = $sort = $openStatus = $note = $serverArr = $templateName = $isTemplate = $isAnyTimeValid = '';
$result = -1;
$opType = $tempId = '';
$activity = array();
extract($_REQUEST, EXTR_IF_EXISTS);
$openArray = [
    0 => '关闭',
    1 => '开启',
];
$is_template = [
    0 => "否",
    1 => "是"
];
$tempList = [
    0 => '无'
];
$allTemp = GamePublicActivity::getTemplateList(['isTemplate' => 1], ['id', 'templateName']);
if ($allTemp) {
   foreach ($allTemp as $t) {
       $tempList[$t['id']] = $t['templateName'];
   }
}

if ($opType == 1) {
//    if (!empty($serverArr)) {
//        $gameServerArr = [];
//        for ($i = 1; $i < 10000; $i++) {
//            $gameServerArr[] = $i;
//        }
//        $selectServers = Help::getSelectedServers($gameServerArr, $serverArr);
//        $selectIds = $selectServers['selectId'];
//        $serverJson = json_encode($selectIds, JSON_NUMERIC_CHECK);
//    } else {
//        $serverJson = "";
//    }

    $pass = true;
    $activity = array('type' => $type, 'title' => $title,'fullTitle' => $fullTitle, 'startTime' => $startTime, 'endTime' => $endTime,
        'items' => $items, 'exValues' => $exValues, 'exValues2' => $exValues2, 'exValues3' => $exValues3, 'exData' => $exData,'note' => $note,
        'sort' => $sort, 'isOpen' => $openStatus, 'isTemplate' => $isTemplate, 'templateName' => $templateName, 'serverArr' => $serverArr,'isAnyTimeValid' => $isAnyTimeValid);

    if ($type == '' || $title == '' || $endTime == "" || $startTime == "") {
        OSAdmin::alert("error", ErrorMessage::NEED_PARAM);
    } else {
        if ($isTemplate && empty($templateName)) {
            OSAdmin::alert("error", ErrorMessage::TEMPLATE_NOT_NAME);
            $pass = false;
        }
        if ($isTemplate) {
            $act = GamePublicActivity::getTemplateList(['templateName' => $templateName], ['id', 'templateName']);
            if (!empty($act)) {
                OSAdmin::alert("error", ErrorMessage::TEMPLATE_HAS_EXIST);
                $pass = false;
            }
        }
        $act = GamePublicActivity::getActivityById($id);
        if (!empty($act)) {
            OSAdmin::alert("error", ErrorMessage::ACTIVITY_HAS_EXIST);
            $pass = false;
        }
        if ($pass) {
            $result = GamePublicActivity::insert($activity);

            if ($result >= 0) {
                $current_user = UserSession::getSessionInfo();
                $ip = Common::getIp();
                $update_data['ip'] = $ip;
                //SysLog::addLog ( UserSession::getUserName(), 'MODIFY', 'User' , $user_id, json_encode($update_data) );
                Common::exitWithSuccess('更新完成', 'user/public_activity_list.php');
            } else {
                OSAdmin::alert("error");
            }
        }
    }
}

//查选用模板
if ($opType == 2) {
    $params = [
        'id' => $tempId,
        'isTemplate' => 1,
    ];
    $temp = GamePublicActivity::getTemplateList($params);
    if ($temp) {
        $temp = $temp[0];
    }
    echo json_encode($temp);
    exit();
}

Template::assign('activity', $activity);
Template::assign('open_options_list', $openArray);
Template::assign('is_template', $is_template);
Template::assign('tempList', $tempList);
Template::display('user/public_activity_add.tpl');