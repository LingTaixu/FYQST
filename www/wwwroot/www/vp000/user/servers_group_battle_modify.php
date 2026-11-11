<?php
require('../include/init.inc.php');
$id = $name = $serverArr = $battleHost = $battlePort = $battleId = '';
extract($_REQUEST, EXTR_IF_EXISTS);

$battleGroupInfo = SpanServersBattleGroup::getInfoById($id);
if (Common::isPost()) {
    if ($name == "" || $serverArr == "") {
        OSAdmin::alert("error", ErrorMessage::NEED_PARAM);
    } else {
        $update_data = array('type' => 1, '`name`' => $name, 'serverArr' => $serverArr, 'battleHost' => $battleHost, 'battlePort' => $battlePort, 'battleId' => $battleId);
        $id = SpanServersBattleGroup::update($id, $update_data);

        if ($id) {
            SysLog::addLog(UserSession::getUserName(), 'MODIFY', 'SpanServersBattleGroup', $id, json_encode($update_data));
            Common::exitWithSuccess('修改跨服战斗分组成功', 'user/servers_group_battle_list.php');
        } else {
            OSAdmin::alert("error");
        }
    }
}
Template::assign("battleGroupInfo", $battleGroupInfo);
Template::assign("_POST", $_POST);
Template::display('user/servers_group_battle_modify.tpl');
