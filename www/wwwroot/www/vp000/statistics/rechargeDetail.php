<?php
require('../include/init.inc.php');
$method = $user_id = $selectServer = $startTime = $endTime = $rechargeId = $userId = $buyStatus = '';
$page_no = $row_count = $search = 0;
$outArr = $totalArr = $userRet = $userInfo = array();
extract($_REQUEST, EXTR_IF_EXISTS);

$startTime = $startTime ? $startTime : date('Y-m-d 00:00:00', time() - 86400 * 7);
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$buyStatusList = [
    '' => '全部',
    0 => '未付款',
    1 => '购买未收到奖励',
    2 => '购买成功',
];
$totalTitle = [
    'allPrice' => "总金额"
];
$title = [
    'addTime' => '日期',
    'serverId' => '服务器',
    'userId' => '用户id',
    'userName' => '用户名称',
    'buyStatus' => '支付状态',
    'goodsType' => '充值类型',
    'goodsPrice' => '单价(元)',
    'orderNo' => '订单号',
    'lvl' => '购买等级',
    'sdkChannel' => '子渠道',
];
$titleKey = array_keys($title);

$serversInfo = GameServerInfo::getAllServer();
$gameServerArr = [];
foreach ($serversInfo as $row) {
    $gameServerArr[] = $row['serverId'];
}
$serverDiv = Help::getServerInput($selectServer);
$selectServers = Help::getSelectedServers($gameServerArr, $selectServer);
$selectIds = $selectServers['selectId'];

//START 数据库查询及分页数据
$page_size = PAGE_SIZE;
$page_no = $page_no < 1 ? 1 : $page_no;
$page_html = '';

if ($search == 1) {
    $channelList = GameChannelConfig::getList();
    $params = [
        'servers' => $selectIds,
        'rechargeId' => $rechargeId,
        'startTime' => $startTime,
        'endTime' => $endTime,
        'userId' => $userId,
        'buyStatus' => $buyStatus,
    ];
    $row_count = RechargeRequest::count($selectIds, '', '', $params);
    $total_page = $row_count % $page_size == 0 ? $row_count / $page_size : ceil($row_count / $page_size);
    $total_page = $total_page < 1 ? 1 : $total_page;
    $page_no = $page_no > ($total_page) ? ($total_page) : $page_no;
    $start = ($page_no - 1) * $page_size;
    $outArr = RechargeRequest::getDetailList($params, $start, $page_size);
    if ($outArr) {
        foreach ($outArr as $row) {
            $serverId = $row['serverId'];
            $userRet[$serverId][] = $row['userId'];
        }
        foreach ($userRet as $serVal => $uids) {
            $userInfo += GameUser::getRolesByUids($serVal, $uids);
        }
        foreach ($outArr as &$out) {
            $out['goodsType'] = $CONFIG_RECHARGE[$out['rechargeId']] ? $out['rechargeId'] . " - " . $CONFIG_RECHARGE[$out['rechargeId']]['name'] : $out['rechargeId'];
            $out['buyStatus'] = $buyStatusList[$out['status']] ? $buyStatusList[$out['status']] : $out['status'];
            $out['userName'] = $userInfo[$out['userId']]['nickName'];
            foreach ($channelList as $row) {
                if ($out['channelId'] == 10006 && $row['sdkChannelId'] == $out['sdkChannelId']) {
                    $out['sdkChannel'] = $row['channelDesc'];
                }
            }
        }
    }

    $totalParams = [
        'servers' => $selectIds,
        'start' => $startTime,
        'end' => $endTime,
    ];
    if ($userId) {
        $totalParams['users'] = [$userId];
    }
    $totalArr = RechargeRequest::getAllInfo($totalParams);

    $page_html = Pagination::showPager("rechargeDetail.php?selectServer=$selectServer&startTime=$startTime&endTime=$endTime&userId=$userId&buyStatus=$buyStatus&search=$search", $page_no, $page_size, $row_count);
}

if ($search == 2) {
    $channelList = GameChannelConfig::getList();
    $params = [
        'servers' => $selectIds,
        'rechargeId' => $rechargeId,
        'startTime' => $startTime,
        'endTime' => $endTime,
        'userId' => $userId,
        'buyStatus' => $buyStatus,
    ];
    $outArr = RechargeRequest::getDetailList($params);
    if ($outArr) {
        foreach ($outArr as $row) {
            $serverId = $row['serverId'];
            $userRet[$serverId][] = $row['userId'];
        }
        foreach ($userRet as $serVal => $uids) {
            $userInfo += GameUser::getRolesByUids($serVal, $uids);
        }
        foreach ($outArr as &$out) {
            $out['goodsType'] = $CONFIG_RECHARGE[$out['rechargeId']] ? $CONFIG_RECHARGE[$out['rechargeId']]['name'] : $out['rechargeId'];
            $out['buyStatus'] = $buyStatusList[$out['status']] ? $buyStatusList[$out['status']] : $out['status'];
            $out['userName'] = $userInfo[$out['userId']]['nickName'];
            foreach ($channelList as $row) {
                if ($out['channelId'] == 10006 && $row['sdkChannelId'] == $out['sdkChannelId']) {
                    $out['sdkChannel'] = $row['channelDesc'];
                }
            }
        }
    }

    $objPHPExcel = new PHPExcel();
// Set properties
    $objPHPExcel->getProperties()
        ->setCreator("Maarten Balliauw")
        ->setLastModifiedBy("Maarten Balliauw")
        ->setTitle("Office 2007 XLSX Test Document")
        ->setSubject("Office 2007 XLSX Test Document")
        ->setDescription("Test document for Office 2007 XLSX, generated using PHP classes.")
        ->setKeywords("office 2007 openxml php")
        ->setCategory("Test result file");

    $Excel = $objPHPExcel->setActiveSheetIndex(0);

    $row = 1;
//set data
    $line = 0;
    foreach ($title as $width => $value) {
        if (strlen($value) != mb_strlen($value)) {
            $width = (strlen($value) + iconv_strlen($value)) * 1.1 * 8.26 / 22;
            $objPHPExcel->getActiveSheet()->getColumnDimension(getNameFromNumber($line))->setWidth($width);
        } else {
            $objPHPExcel->getActiveSheet()->getColumnDimension(getNameFromNumber($line))->setAutoSize(true);
        }
        $Excel->setCellValue(getNameFromNumber($line++) . '' . $row, $value);
    }
    $row++;

    foreach ($outArr as $dateVal => $data) {
        $i = 0;
        foreach ($titleKey as $t) {
            $item = $data[$t] ? $data[$t] : '';
            $Excel->setCellValue(getNameFromNumber($i) . '' . $row, $item);
            $i++;
        }
        $row++;
    }

    $file_name = '充值明细';
// Rename sheet
    $objPHPExcel->getActiveSheet()->setTitle($file_name);
// Set active sheet index to the first sheet, so Excel opens this as the first sheet
    $objPHPExcel->setActiveSheetIndex(0);
// Redirect output to a client鈥檚 web browser (Excel5)
    header('Content-Type: application/vnd.ms-excel');
    header("Content-Disposition: attachment;filename={$file_name}.xls");
    header('Cache-Control: max-age=0');

    $objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel5');
    $objWriter->save('php://output');
    exit();
}

Template::assign('serverDiv', $serverDiv);
Template::assign('startTime', $startTime);
Template::assign('endTime', $endTime);
Template::assign('title', $title);
Template::assign('totalTitle', $totalTitle);
Template::assign('buyStatusList', $buyStatusList);
Template::assign('page_html', $page_html);
Template::assign('outArr', $outArr);
Template::assign('totalArr', $totalArr);
Template::assign('_GET', $_GET);
Template::display('statistics/rechargeDetail.tpl');

function getNameFromNumber($num)
{
    $numeric = $num % 26;
    $letter = chr(65 + $numeric);
    $num2 = intval($num / 26);
    if ($num2 > 0) {
        return getNameFromNumber($num2 - 1) . $letter;
    } else {
        return $letter;
    }
}