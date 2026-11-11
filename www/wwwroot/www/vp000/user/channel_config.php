<?php
require('../include/init.inc.php');
$id = $channelId = $sdkChannelId = $channelName = $sdkChannelName = $channelDesc = '';
$outArr = [];
extract($_REQUEST, EXTR_IF_EXISTS);

if (is_numeric($id) && $id > 0) {
    $params = [
        'id' => $id
    ];
    $outArr = GameChannelConfig::getList($params);
    if ($outArr[0]) {
        $outArr = $outArr[0];
    }
}

if (Common::isPost()) {
    $theData = [
        'channelId' => $channelId,
        'sdkChannelId' => $sdkChannelId,
        'channelName' => $channelName,
        'sdkChannelName' => $sdkChannelName,
        'channelDesc' => $channelDesc,
    ];
    if (is_numeric($id) && $id > 0) {
        $ret = GameChannelConfig::updateDataById($id, $theData);
    } else {
        $ret = GameChannelConfig::addData($theData);
    }
    Common::exitWithSuccess('操作完成', 'user/channel_list.php');
}

Template::assign('_GET', $_GET);
Template::assign('outArr', $outArr);
Template::display('user/channel_config.tpl');