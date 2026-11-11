<?php
require('../include/init.inc.php');
$method = $selectServer = $startTime = $endTime = '';
$search = 0;
$totalNum = $firstPass = 0;
$outArr = $servers = array();
extract($_REQUEST, EXTR_IF_EXISTS);

$startTime = $startTime ? $startTime : '';
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$title = [
    'step' => '步骤',
    'key' => '引导号',
    'desc' => '描述',
    'oldTotalNum' => '通过人数',
    'passRate' => '通过率',
    'remainRate' => '总留存率',
    'lostNum' => '流失人数',
];

$serversInfo = GameServerInfo::getAllServer();
$gameServerArr = [];
foreach ($serversInfo as $row) {
    $servers[$row['serverId']] = $row;
    $openTime = $row['serverDate'];
    if (strtotime($startTime) <= strtotime($openTime) && strtotime($openTime) < strtotime($endTime)) {
        $gameServerArr[] = $row['serverId'];
    }
}
$serverDiv = Help::getServerInput($selectServer);
$selectServers = Help::getSelectedServers($gameServerArr, $selectServer);
$selectIds = $selectServers['selectId'];

$configGuide = $CONFIG_GUIDE;

if ($search) {
    foreach ($configGuide as $guideId => $val) {
        $outArr[$guideId] = [
            'step' => $val['step'],
            'key' => $guideId,
            'guideId' => $guideId,
            'desc' => $val['desc'],
            'oldTotalNum' => 0,
            'passRate' => 0,
            'remainRate' => 0,
            'lostNum' => 0,
        ];
        for ($i = 1; $i <= 200; $i++) {
            $outArr[$guideId][$i] = '';
        }
    }
    $params = [
        'start' => $startTime,
        'end' => $endTime,
    ];
    foreach ($selectIds as $sid) {
        $exDataInfo = GameUser::getExData($sid, $params);
        foreach ($exDataInfo as $row) {
            $totalNum++;
            $exDataArr = json_decode($row['exData'], true);
            if (is_array($exDataArr) && isset($exDataArr[1])) {
                $guideId = $exDataArr[1];
            } else {
                $guideId = '10000_0';
            }
            $step = $configGuide[$guideId]['step'];
            if ($step) {
                $outArr[$guideId]['lostNum']++;
                $outArr[$guideId]['guideId'] = $guideId;
                $outArr[$guideId][$row['lvl']]++;
            }
        }
    }

    array_multisort(array_column($outArr, 'step'), SORT_ASC, $outArr);
    $firstPass = $totalNum;
    $preTotalNum = 0;
    foreach ($outArr as &$out) {
        $out['oldTotalNum'] = $totalNum;

        $out['passRate'] = sprintf("%.4f", $totalNum / $preTotalNum) * 100;
        $preTotalNum = $totalNum;
        $totalNum -= $out['lostNum'];
        $out['remainRate'] = $firstPass == 0 ? 0 : sprintf("%.4f", $out['oldTotalNum'] / $firstPass) * 100;
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
    foreach ($title as $value) {
        if (strlen($value) != mb_strlen($value)) {
            $width = (strlen($value) + iconv_strlen($value)) * 1.1 * 8.26 / 22;
            $objPHPExcel->getActiveSheet()->getColumnDimension(getNameFromNumber($line))->setWidth($width);
        } else {
            $objPHPExcel->getActiveSheet()->getColumnDimension(getNameFromNumber($line))->setAutoSize(true);
        }
        $Excel->setCellValue(getNameFromNumber($line++) . '' . $row, $value);
    }
    for ($i = 1; $i <= 200; $i++) {
        $value = $i . '级';
        if (strlen($value) != mb_strlen($value)) {
            $width = (strlen($value) + iconv_strlen($value)) * 1.1 * 8.26 / 22;
            $objPHPExcel->getActiveSheet()->getColumnDimension(getNameFromNumber($line))->setWidth($width);
        } else {
            $objPHPExcel->getActiveSheet()->getColumnDimension(getNameFromNumber($line))->setAutoSize(true);
        }
        $Excel->setCellValue(getNameFromNumber($line++) . '' . $row, $value);
    }
    $row++;

    foreach ($outArr as $kVal => $data) {
        $Excel->setCellValue(getNameFromNumber(0) . '' . $row, $data['step']);
        $Excel->setCellValue(getNameFromNumber(1) . '' . $row, $kVal);
        $Excel->setCellValue(getNameFromNumber(2) . '' . $row, $data['desc']);
        $Excel->setCellValue(getNameFromNumber(3) . '' . $row, $data['oldTotalNum']);
        $Excel->setCellValue(getNameFromNumber(4) . '' . $row, $data['passRate']);
        $Excel->setCellValue(getNameFromNumber(5) . '' . $row, $data['lostNum']);
        for ($i = 1; $i <= 200; $i++) {
            $line = 5 + $i;
            $Excel->setCellValue(getNameFromNumber($line) . '' . $row, $data[$i]);
        }
        $row++;
    }

    $file_name = '(旧)新手引导流失统计';
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

Template::assign('outArr', $outArr);
Template::assign('serverDiv', $serverDiv);
Template::assign('startTime', $startTime);
Template::assign('endTime', $endTime);
Template::assign('group_options', $group_options);
Template::assign('_GET', $_GET);
Template::assign('page_html', $page_html);
Template::display('statistics/lostGuide.tpl');

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