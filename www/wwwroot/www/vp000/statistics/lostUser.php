<?php
require('../include/init.inc.php');
$method = $startTime = $endTime = '';
$search = 0;
$totalNum = 0;
$selectServer = '';
$allArr = $outArr = $cache_user = $cache_talismanCombat = $cache_copy_progress = array();
extract($_REQUEST, EXTR_IF_EXISTS);

$startTime = $startTime ? $startTime : '';
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$title = [
    'date' => '日期',
    'userNum' => '玩家数',
    'avg_lvl' => '平均等级',
    'avg_diamond' => '平均钻石存量',
    'avg_maxCopyNum' => '平均关卡数',
    'avg_highPaTa' => '平均探险层数',
    'avg_totalAchieveExp' => '平均成就点数',
    'avg_combat' => '平均总战力',
    'avg_talismanCombat' => '平均宠物总战力',
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
    foreach ($selectIds as $game_sid) {
        $hour48 = time() - 2 * 86400;
        $params = [
            'lastTime' => $hour48,
            'start' => $startTime,
            'end' => $endTime,
        ];
        $userInfo = GameUser::getUserByLastTime($game_sid, $params);
        if (!empty($userInfo)) {
            foreach ($userInfo as $row) {
                $row['activity'] = json_decode($row['activity'], true);
                //过滤掉没领取过打赏礼包的
                if (!isset($row['activity'][1]) || $row['activity'][1][0] != 1) {
                    continue;
                }
                //计算总成就点
                $row['totalAchieveExp'] = getTotalAchieveExp($row['achieveLvl'], $row['achieveExp']);
                //用户表缓存
                $cache_user[$row['id']] = $row;
            }
        }

        $columns = ['userId', 'copyObj'];
        $subCondition = [
            'copyType' => 0
        ];
        $heroInfo = GameCopyProgress::getList($game_sid, $columns, $subCondition);
        if (!empty($heroInfo)) {
            foreach ($heroInfo as $row) {
                $row['copyObj'] = json_decode($row['copyObj'], true);//maxCopyProgress
                $arrKeys = array_keys($row['copyObj']);

                $maxCopyNum = $arrKeys ? end($arrKeys) : 1;
                //userId 对应最大 关卡数
                $cache_copy_progress[$row['userId']] = $maxCopyNum;
            }
        }

        $columns = ['userId', 'tempId', 'talismanNum', 'talismanCombat'];
        $heroInfo = GameHero::getList($game_sid, $columns);
        if (!empty($heroInfo)) {
            foreach ($heroInfo as $row) {
                $cache_talismanCombat[$row['userId']] += $row['talismanCombat'];
            }
        }
    }

    //等级、钻石存量、关卡数、探险层数、成就点数、战力：小队总战力、宠物总战力、称号总战力【全部计算平均值】
    foreach ($cache_user as $userId => $userData) {
        $outArr[$userData['createDay']]['day'] = strtotime($userData['createDay']);
        $outArr[$userData['createDay']]['total_lvl'] += $userData['lvl'];
        $outArr[$userData['createDay']]['total_diamond'] += $userData['diamond'];
        $outArr[$userData['createDay']]['total_maxCopyNum'] += $cache_copy_progress[$userId];
        $outArr[$userData['createDay']]['total_highPaTa'] += $userData['highPaTa'];
        $outArr[$userData['createDay']]['total_totalAchieveExp'] += $userData['totalAchieveExp'];
        $outArr[$userData['createDay']]['total_combat'] += $userData['combat'];
        $outArr[$userData['createDay']]['total_talismanCombat'] += $cache_talismanCombat[$userId];
        $outArr[$userData['createDay']]['userNum']++;
        $allArr['all']['total_lvl'] += $userData['lvl'];
        $allArr['all']['total_diamond'] += $userData['diamond'];
        $allArr['all']['total_maxCopyNum'] += $cache_copy_progress[$userId];
        $allArr['all']['total_highPaTa'] += $userData['highPaTa'];
        $allArr['all']['total_totalAchieveExp'] += $userData['totalAchieveExp'];
        $allArr['all']['total_combat'] += $userData['combat'];
        $allArr['all']['total_talismanCombat'] += $cache_talismanCombat[$userId];
        $allArr['all']['userNum']++;
    }
    array_multisort(array_column($outArr, 'day'), SORT_DESC, $outArr);
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
    $row++;

    foreach ($outArr as $dateVal => $data) {
        $Excel->setCellValue(getNameFromNumber(0) . '' . $row, $dateVal);
        $Excel->setCellValue(getNameFromNumber(1) . '' . $row, $data['userNum']);
        if ($data['userNum']) {
            $avg_lvl = floor($data['total_lvl'] / $data['userNum']);
            $Excel->setCellValue(getNameFromNumber(2) . '' . $row, $avg_lvl);
            $avg_diamond = floor($data['total_diamond'] / $data['userNum']);
            $Excel->setCellValue(getNameFromNumber(3) . '' . $row, $avg_diamond);
            $avg_maxCopyNum = floor($data['total_maxCopyNum'] / $data['userNum']);
            $Excel->setCellValue(getNameFromNumber(4) . '' . $row, $avg_maxCopyNum);
            $avg_highPaTa = floor($data['total_highPaTa'] / $data['userNum']);
            $Excel->setCellValue(getNameFromNumber(5) . '' . $row, $avg_highPaTa);
            $avg_totalAchieveExp = floor($data['total_totalAchieveExp'] / $data['userNum']);
            $Excel->setCellValue(getNameFromNumber(6) . '' . $row, $avg_totalAchieveExp);
            $avg_combat = floor($data['total_combat'] / $data['userNum']);
            $Excel->setCellValue(getNameFromNumber(7) . '' . $row, $avg_combat);
            $avg_talismanCombat = floor($data['total_talismanCombat'] / $data['userNum']);
            $Excel->setCellValue(getNameFromNumber(8) . '' . $row, $avg_talismanCombat);
        }
        $row++;
    }

    $file_name = '玩家流失统计';
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
Template::assign('startTime', $startTime);
Template::assign('endTime', $endTime);
Template::assign('allArr', $allArr);
Template::assign('outArr', $outArr);
Template::assign('group_options', $group_options);
Template::assign('_GET', $_GET);
Template::assign('page_html', $page_html);
Template::display('statistics/lostUser.tpl');

function getTotalAchieveExp($lvl, $exp)
{
    global $achieveCfg;
    $totalAchieveExp = $exp;
    for ($i = 1; $i <= $lvl; $i++) {
        $totalAchieveExp += $achieveCfg[$i];
    }
    return $totalAchieveExp;
}

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