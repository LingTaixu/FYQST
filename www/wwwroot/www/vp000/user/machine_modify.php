<?php
require('../include/init.inc.php');
$method = $id = $name = $desc = $host = $outer_ip = $inner_ip = $servers = '';
$outArr = [];
extract($_REQUEST, EXTR_IF_EXISTS);

if (is_numeric($id) && $id > 0) {
    $params = [
        'id' => $id
    ];
    $outArr = MachineInfo::getList($params);
    if ($outArr[0]) {
        $outArr = $outArr[0];
    }
}

if ($method == 1) {
    $nowTime = time();
    $theData = [
        'name' => $name,
        'desc_info' => $desc,
        'host' => $host,
        'outer_ip' => $outer_ip,
        'inner_ip' => $inner_ip,
        'servers' => $servers,
    ];
    if (is_numeric($id) && $id > 0) {
        $ret = MachineInfo::updateDataById($id, $theData);
    }
    Common::exitWithSuccess('操作完成', 'user/machine_list.php');
    return;
}

if ($method == 2) {
    $m = MachineInfo::getMachineById($id);
    if ($m['type'] == 0){
        Utils::createNewMachine($outArr['inner_ip']);
    }else{
        Utils::createNewBattleMachine($outArr['inner_ip']);
    }
    $theData = [
        'is_init' => 1
    ];
    MachineInfo::updateDataById($id, $theData);
    Common::exitWithSuccess('初始化完成', 'user/machine_list.php');
    return;
}

Template::assign('_GET', $_GET);
Template::assign('outArr', $outArr);
Template::display('user/machine_modify.tpl');