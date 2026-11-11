<?php
require('../include/init.inc.php');

$method = $copyType = $progressStart = $progressEnd = '';
$search = 0;
$totalNum = $pants = $firstCopy = 0;
$outArr = $newOutArr = $allCopyArr = array();
$selectServer = '';
extract($_REQUEST, EXTR_IF_EXISTS);
$title = [
    'progress' => '关卡数',
    'passNum' => '通过人数',
    'passRate' => '通过率(%)',
];
$copyTypeList = [
    '0' => '挂机关卡',
    '1' => '金币副本',
    '3' => '经验副本',
    '8' => '经验塔',
    '12' => '精灵副本',
    '13' => '神金副本',
    '14' => '宝石副本',
    '15' => '荣誉副本',
    '16' => '糖果副本',
    '17' => '月卡副本',
    '18' => '深渊副本',
];

$serversInfo = GameServerInfo::getAllServer();
$gameServerArr = [];
foreach ($serversInfo as $row) {
    $gameServerArr[] = $row['serverId'];
}
$serverDiv = Help::getServerInput($selectServer);
$selectServers = Help::getSelectedServers($gameServerArr, $selectServer);
$selectIds = $selectServers['selectId'];

if ($search) {
    $copyArray = $CONFIG_COPY[$copyType];
    $minCopyProgress = min(array_keys($copyArray));
    $maxCopyProgress = max(array_keys($copyArray));
    if (is_numeric($progressStart)) {
        $progressStart = $progressStart < $minCopyProgress ? $minCopyProgress : $progressStart;
    }
    if (is_numeric($progressEnd)) {
        $progressEnd = $progressEnd > $maxCopyProgress ? $maxCopyProgress : $progressEnd;
    }

    $params = [
        'copyType' => $copyType
    ];
    foreach ($selectIds as $sid) {
//        $totalNum = GameUser::count($sid);
        if ($copyType == 0) {
            $firstCopy = GameCopyProgress::count($sid, $params);
            $allCopyArr[1]['progress'] = 1;
            $allCopyArr[1]['passNum'] += $firstCopy;

            $result = GameCopyProgress::getProgressObjUsers($sid, $params);
        } elseif ($copyType == 8) {
            $result = GameCopyProgress::getTotalUserNum($sid, $params);
        } else {
            $result = GameCopyProgress::getProgressStarUsers($sid, $params);
        }

        $pants = 0;
        $progressArr = array();
        foreach ($result as $item) {
            $pants += $item['num'];
            $progressArr[$item['guan']] = $item['num'];
        }
        $lastKey = 0;
        $noPass = 0;
        foreach ($result as $pVal) {
            if ($lastKey > 0) {
                $passNum = $pants - $noPass;
            } else {
                $passNum = $pants;
            }
            if (isset($allCopyArr[$pVal['guan']])) {
                $allCopyArr[$pVal['guan']]['passNum'] += $passNum;
            } else {
                $allCopyArr[$pVal['guan']] = [
                    'progress' => $pVal['guan'],
                    'passNum' => $passNum,
                ];
            }

            $lastKey = $pVal['guan'];
            $noPass += $pVal['num'];
        }
        ksort($allCopyArr);
//        print_r($sid);
//        print_r('-----');
//print_r($allCopyArr);

        $maxCopy = max(array_keys($allCopyArr));
        $nextNum = next($allCopyArr)['passNum'];
        foreach ($copyArray as $ck => $cv) {
            $outArr[$ck]['progress'] = $ck;
            if (isset($allCopyArr[$ck])) {
                $outArr[$ck]['passNum'] += $allCopyArr[$ck]['passNum'];
                //[1,2],[5,1]  1-2,2-1,3-1,4-1,5-1,6-0....
                foreach ($allCopyArr as $k => $v) {
                    if ($k == $ck) {
                        $nextNum = current($allCopyArr)['passNum'];
                        break;
                    }
                }
            } else {
                if ($ck <= $maxCopy) {
                    $outArr[$ck]['passNum'] += $nextNum;
                } else {
                    $outArr[$ck]['passNum'] += 0;
                }

            }
        }
    }
//    print_r($outArr);exit;
    ksort($outArr);
    foreach ($outArr as &$out) {
        $out['passRate'] = $out['passNum'] > 0 ? sprintf("%.4f", current($outArr)['passNum'] / $out['passNum']) * 100 : 0;
        if (is_numeric($progressStart) && is_numeric($progressEnd)) {
            if ($out['progress'] >= $progressStart && $out['progress'] <= $progressEnd) {
                $newOutArr[$out['progress']] = $out;
            }
        } else {
            $newOutArr[$out['progress']] = $out;
        }
    }
}

if ($search == '2') {
//    $newOutArr = [];
//    foreach ($selectIds as $sid) {
//        $result = GameCopyProgress::getTotalUsers($sid, $params);
//        foreach ($result as $r) {
//            if ($r['guan'] >= 8091) {
//                $user = GameUser::getServerRoleByUid($sid, $r['userId']);
//                $out = [
//                    'userId' => $r['userId'],
//                    'server' => $sid,
//                    'guan' => $r['guan'],
//                    'nickName' => $user['nickName'],
//                    'diamond' => $user['diamond'],
//                    'giveDiamond' => $user['giveDiamond'],
//                    'buyDiamond' => $user['buyDiamond'],
//                    'dScore' => $user['dScore'],
//                    'vip' => $user['vip'],
//                ];
//                $newOutArr[] = $out;
//            }
//        }
//    }
//    $outTit = array_keys($out);


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
    $row++;

    foreach ($newOutArr as $kVal => $data) {
        $Excel->setCellValue(getNameFromNumber(0) . '' . $row, $data['progress']);
        $Excel->setCellValue(getNameFromNumber(1) . '' . $row, $data['passNum']);
        $Excel->setCellValue(getNameFromNumber(2) . '' . $row, $data['passRate']);
//        $a = 0;
//        foreach ($outTit as $title) {
//            $Excel->setCellValue(getNameFromNumber($a) . '' . $row, $data[$title]);
//            $a++;
//        }
        $row++;
    }

    $file_name = $copyTypeList[$copyType] . '统计';
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

Template::assign('outArr', $newOutArr);
Template::assign('serverDiv', $serverDiv);
Template::assign('copy_type_list', $copyTypeList);
Template::assign('progressStart', $progressStart);
Template::assign('progressEnd', $progressEnd);
Template::assign('group_options', $group_options);
Template::assign('_GET', $_GET);
Template::assign('page_html', $page_html);
Template::display('statistics/lostProgress.tpl');

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

function getProgressName($id)
{
    if ($id >= 10001) {
        return $id - 9001;
    } else {
        return $id;
    }
}