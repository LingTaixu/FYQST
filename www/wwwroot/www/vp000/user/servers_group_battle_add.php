<?php
require ('../include/init.inc.php');
extract ( $_POST, EXTR_IF_EXISTS );
if (Common::isPost ()) {
    $lastServerId = SpanServersBattleGroup::getLastBattleId();
    $battleId = $lastServerId + 1;
    $m = MachineInfo::getMachine($battleId, 1);
    if(!$m){
        Common::exitWithSuccess (ErrorMessage::SERVER_NOTCONFIG_MACHINE,'user/servers_group_battle_list.php');
        return;
    }
    $name = "战斗".$battleId;
    $battlePort = 9000 + $battleId;
    $battleHost = $m['host'];
    $input_data = array ('type'=> 1,
        '`name`' => $name,
        'serverArr' => '[]',
        'battleHost' => $battleHost,
        'battlePort' => $battlePort,
        'battleId' => $battleId);
    $id = SpanServersBattleGroup::add ( $input_data );
    if ($id) {
        // 新开服
        Utils::createNewBattleServer($battleId);
        SysLog::addLog ( UserSession::getUserName(), 'ADD', 'SpanServersBattleGroup' ,$id, json_encode($input_data) );
        Common::exitWithSuccess ('添加跨服战斗分组成功','user/servers_group_battle_list.php');
    }else{
        OSAdmin::alert("error");
    }
}

Template::assign("_POST" ,$_POST);
Template::display ( 'user/servers_group_battle_add.tpl' );

