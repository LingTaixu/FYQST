<?php
require('../include/init.inc.php');
$id = $name = $desc = $host = $outer_ip = $inner_ip = $type = '';
$outArr = [];
extract($_REQUEST, EXTR_IF_EXISTS);

$typeArr = [
    0 => '滚服',
    1 => '战斗服',
];

if (Common::isPost()) {
    $nowTime = time();
    $theData = [
        'name' => $name,
        'desc_info' => $desc,
        'host' => $host,
        'outer_ip' => $outer_ip,
        'inner_ip' => $inner_ip
    ];
    if (is_numeric($id) && $id > 0) {
        $ret = MachineInfo::updateDataById($id, $theData);
    } else {
        $theData['type'] = $type;
        $theData['rtime'] = $nowTime;
        $theData['create_time'] = date('Y-m-d H:i:s', $nowTime);
        $ret = MachineInfo::addData($theData);
    }


    Common::exitWithSuccess('操作完成', 'user/machine_list.php');
}

Template::assign('_GET', $_GET);
Template::assign('outArr', $outArr);
Template::assign('typeArr', $typeArr);
Template::display('user/machine_add.tpl');