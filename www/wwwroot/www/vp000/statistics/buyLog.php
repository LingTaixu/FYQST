<?php
require('../include/init.inc.php');
$method = $user_id = $selectServer = $startTime = $endTime = '';
$page_no = $row_count = $search = 0;
$outArr = $rechargeRank = $cache_user = array();
extract($_REQUEST, EXTR_IF_EXISTS);

$startTime = $startTime ? $startTime : date('Y-m-d 00:00:00', time() - 86400 * 7);
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$title = [
    'item_id' => '商品id',
    'item_name' => '商品名称',
    'currType' => '购买方式',
    'times' => '购买次数',
    'users' => '购买人数',
    'nums' => '购买总数',
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
        'servers' => $selectIds,
        'start' => $startTime,
        'end' => $endTime,
    ];
    $outArr = GameBuy::getDataByItemId($params);
    foreach ($outArr as &$out) {
        $out['currType'] = $CURRENCY_TYPE[$out['currency_type']];
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

    $file_name = '购买物品统计';
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

// 设置模板变量
$group_options = UserGroup::getGroupForOptions();
$group_options[0] = "全部";
ksort($group_options);

Template::assign('serverDiv', $serverDiv);
Template::assign('title', $title);
Template::assign('startTime', $startTime);
Template::assign('endTime', $endTime);
Template::assign('outArr', $outArr);
Template::assign('group_options', $group_options);
Template::assign('_GET', $_GET);
Template::assign('page_no', $page_no);
Template::assign('page_html', $page_html);
Template::display('statistics/buyLog.tpl');

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