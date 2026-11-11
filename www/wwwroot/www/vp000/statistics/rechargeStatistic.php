<?php
require('../include/init.inc.php');
$method = $user_id = $selectServer = $startTime = $endTime = $rechargeId = $userId = '';
$page_no = $row_count = $search = 0;
$outArr = $rechargeRank = $cache_user = array();
extract($_REQUEST, EXTR_IF_EXISTS);

$startTime = $startTime ? $startTime : date('Y-m-d 00:00:00', time() - 86400 * 7);
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$statusList = [0 => '全部'];
foreach ($CONFIG_RECHARGE as $rKey => $rVal) {
    $statusList[$rKey] = $rVal['name'];
}
$title = [
    'day' => '日期',
    'goodsType' => '充值类型',
    'times' => '购买次数',
    'goodsPrice' => '单价',
    'total' => '总额',
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


if ($search) {
    $params = [
        'server' => $selectIds,
        'rechargeId' => $rechargeId,
        'startTime' => $startTime,
        'endTime' => $endTime,
        'userId' => $userId,
    ];
    $outArr = RechargeRequest::getGoodsByDay($params);
    if ($outArr) {
        foreach ($outArr as &$out) {
            $out['goodsType'] = $statusList[$out['rechargeId']] ? $statusList[$out['rechargeId']] : $out['rechargeId'];
        }
    }
}

if ($search == '2') {
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

    $file_name = '充值统计';
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
Template::assign('status_list', $statusList);
Template::assign('outArr', $outArr);
Template::assign('_GET', $_GET);
Template::display('statistics/rechargeStatistic.tpl');

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
