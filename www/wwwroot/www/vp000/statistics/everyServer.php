<?php
require('../include/init.inc.php');
$method = '';
$search = 0;
$totalNum = 0;
$chooseServer = 0;
$allArr = $outArr = $cache_user = $cache_account = $cache_guild_personal = array();
extract($_REQUEST, EXTR_IF_EXISTS);
$retainDay = [
    2 => '次留',
    3 => '3留',
    7 => '7留',
    14 => '14留',
    30 => '30留',
];
$title = [
    'date' => '日期',
    'createRoleNum' => '总创角',
    'newAccountCreateRoleNum' => '新号创角',
    'oldAccountCreateRoleNum' => '老号创角',
    'totalPay' => '总充值数',
    'joinGuildRoleNum' => '入行会用户数'
];
$title += $retainDay;
$titleKey = array_keys($title);

$serversInfo = GameServerInfo::getAllServer();
$gameServerArr = [];
foreach ($serversInfo as $row) {
    $gameServerArr[] = $row['serverId'];
}
$htmlServerSelect = Help::getServerSelect($gameServerArr, $chooseServer);

if ($search) {
    $accountInfo = GameAccount::getAccount();
    if (!empty($accountInfo)) {
        foreach ($accountInfo as $row) {
            $cache_account[$row['id']] = $row;
        }
    }

    $condition = [
        'guildId[!]' => 0
    ];
    $guildPersonalInfo = GameGuildPersonal::getList($chooseServer, [], $condition);
    if (!empty($accountInfo)) {
        foreach ($accountInfo as $row) {
            $cache_guild_personal[$row['userId']] = $row;
        }
    }
    //老号创角
    $users = GameUser::getUserByDate($chooseServer);
    foreach ($users as $row) {
        $theDate = $row['theDate'];
        if (!isset($outArr[$theDate]['oldAccountCreateRoleNum'])) $outArr[$theDate]['oldAccountCreateRoleNum'] = 0;
        if (!isset($outArr[$theDate]['newAccountCreateRoleNum'])) $outArr[$theDate]['newAccountCreateRoleNum'] = 0;
        $cache_user[$row['id']] = $row;
        if ($theDate > $cache_account[$row['accountId']]['day']) {
            //老号
            $outArr[$theDate]['oldAccountCreateRoleNum']++;
        } else {
            //新号
            $outArr[$theDate]['newAccountCreateRoleNum']++;
        }
        // 行会
        if (isset($cache_guild_personal[$row['id']])) {
            $outArr[$row['day']]['joinGuildRoleNum']++;
        }
    }
    //总充值数
    $payTotal = RechargeRequest::getTotalPayByDay($chooseServer);
    if (!empty($payTotal)) {
        foreach ($payTotal as $row) {
            $outArr[$row['day']]['totalPay'] = $row['totalPay'];
        }
    }
    //入行会用户留存
    $retainData = GameLogin::getRetain($chooseServer);
    if (!empty($retainData)) {
        foreach ($retainData as $row) {
            $outArr[$row['day']]['loginNum']++;
            //找出角色创建时间
            $useCreateDay = $cache_user[$row['user_id']]['day'];
            $loginDay = $row['day'];
            if (!isset($cache_guild_personal[$row['user_id']])) {
                continue;
            }
            $outArr[$useCreateDay]['loginDay'] = $loginDay;
            $outArr[$useCreateDay]['useCreateDay'] = $useCreateDay;
            if ($loginDay > $useCreateDay) {
                //老号
                $outArr[$loginDay]['oldUserloginNum']++;
                //次留  三留	七留	 十四留
                $daysDiff = Help::getDifferentDays($useCreateDay, $loginDay);
                $outArr[$useCreateDay]['diff'] = $daysDiff;
                switch ($daysDiff) {
                    case 1://次留
                        $outArr[$useCreateDay]['guildRetain2']++;
                        break;
                    case 2://三留
                        $outArr[$useCreateDay]['guildRetain3']++;
                        break;
                    case 6://七留
                        $outArr[$useCreateDay]['guildRetain7']++;
                        break;
                    case 13://十四留
                        $outArr[$useCreateDay]['guildRetain14']++;
                        break;
                    case 29://三十留
                        $outArr[$useCreateDay]['guildRetain30']++;
                        break;
                }
            }
        }
    }

    foreach ($outArr as $dateKey => &$out) {
        $out['date'] = $dateKey;
        foreach ($retainDay as $key => $dayStr) {
            $retainKey = "guildRetain" . $key;
            $out[$key] = $out['joinGuildRoleNum'] > 0 ? sprintf("%.4f", $out['$retainKey'] / $out['joinGuildRoleNum']) * 100 : 0;
        }
    }
    krsort($outArr);
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

    $file_name = '每日数据统计';
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

Template::assign('htmlServerSelect', $htmlServerSelect);
Template::assign('retainDay', $retainDay);
Template::assign('outArr', $outArr);
Template::assign('group_options', $group_options);
Template::assign('_GET', $_GET);
Template::assign('page_html', $page_html);
Template::display('statistics/everyServer.tpl');

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