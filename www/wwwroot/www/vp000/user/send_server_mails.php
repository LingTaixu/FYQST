<?php
/*
 * 发送全服邮件
 */
require('../include/init.inc.php');
$method = $title = $content = $gold = $diamond = $item1 = $item2 = $item3 = $item4 = $num1 = $num2 = $num3 = $num4 = '';
$serverIdArr = [];

extract($_POST, EXTR_IF_EXISTS);

if ($method == 'sendMail') {
    if ($title == "" || $content == "") {
        echo json_encode([
            'code' => 1,
            'msg' => ErrorMessage::NEED_PARAM
        ]);
    } else {
        //'serverIdArr' => json_encode($serverIdArr),
        $mailData = array('title' => $title, '`content`' => $content);
        $items = array();
        if (intval($gold) > 0) {
            $items['99'] = intval($gold);
        }
        if (intval($diamond) > 0) {
            $items['200'] = intval($diamond);
        }
        if (intval($item1) > 0 && intval($num1) > 0) {
            $items[$item1] = intval($num1);
        }
        if (intval($item2) > 0 && intval($num2) > 0) {
            $items[$item2] = intval($num2);
        }
        if (intval($item3) > 0 && intval($num3) > 0) {
            $items[$item3] = intval($num3);
        }
        if (intval($item4) > 0 && intval($num4) > 0) {
            $items[$item4] = intval($num4);
        }

        $mailData['items'] = json_encode($items);

        $id = GameMail::sendServerMails($serverIdArr, $mailData);

        if ($id) {
            $logData = ["servers"=>json_encode($serverIdArr),"mailData"=>json_encode($mailData)];
            $logData = json_encode($logData);
            SysLog::addLog(UserSession::getUserName(), 'ADD', '全服邮件', 'GameMail', $logData);
            echo json_encode([
                'code' => 0,
                'msg' => 'success'
            ]);
        } else {
            echo json_encode([
                'code' => 1,
                'msg' => 'field'
            ]);
        }
    }
    exit();
}


Template::assign("_POST", $_POST);
$serverlist = getServerListByPlatform();
Template::assign('serverlist', $serverlist);
Template::display('user/send_server_mails.tpl');