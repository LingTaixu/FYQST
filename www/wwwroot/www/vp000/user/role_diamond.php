<?php
require('../include/init.inc.php');
$method = $nick = $uid = $startTime = $endTime = '';
$search = 0;
$outArr = $data = array();
extract($_REQUEST, EXTR_IF_EXISTS);

$startTime = $startTime ? $startTime : '';
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$title = [
    'created' => '购买时间',
    'item_id' => '商品id',
    'item_name' => '商品名称',
    'num' => '花费钻石',
    'item_num' => '购买个数',
];
$titleKey = array_keys($title);

if (empty($uid)) {
    Common::exitWithMessage('无法找到该用户', 'user/role_op.php');
}

if ($search) {
    $sid = UserSession::getUserServerId();
    $params = [
        'sub_op' => 'cost',
        'start' => $startTime,
        'end' => $endTime,
        'user_id' => $uid,
    ];
    $outArr = CurrencyDiamondLog::getDataByUser($sid, $params);
    if ($outArr) {
        foreach ($outArr as &$out) {
            $item = $out['item_id'];
            $itemName = $CONFIG_ITEM_INFO[$out['item_id']]['name'];
            if (empty($itemName)) {
                $itemName = $CONFIG_ITEM_LOGIC[$out['item_id']]['type'];
            }
            if (empty($itemName)) {
                $itemName = $out['item_id'];
            }
            $out['item_name'] = $itemName;
        }
    }

}

if ($search == 2) {
    $fileName = '用户钻石消耗数据';
    Help::writeExcel($fileName, $title, $outArr);
    die();
}

// 设置模板变量
$group_options = UserGroup::getGroupForOptions();
$group_options[0] = "全部";
ksort($group_options);

Template::assign('title', $title);
Template::assign('startTime', $startTime);
Template::assign('endTime', $endTime);
Template::assign('outArr', $outArr);
Template::assign('group_options', $group_options);
Template::assign('_GET', $_GET);
Template::assign('uid', $uid);
Template::assign('page_html', $page_html);
Template::display('user/role_diamond.tpl');

