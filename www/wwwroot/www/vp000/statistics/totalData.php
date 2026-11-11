<?php
require('../include/init.inc.php');
$method = $startTime = $endTime = '';
$search = 0;
$outArr = $serverDatePayUsers = $createRoleRecharge = $accountLogin = $oldAccountLogin = array();
$selectServer = '';
extract($_REQUEST, EXTR_IF_EXISTS);

$startTime = $startTime ? $startTime : date('Y-m-d 00:00:00', time() - 86400 * 7);
$endTime = $endTime ? $endTime : date('Y-m-d 00:00:00', time() + 86400);

$title = [
    'date' => '日期',
    'clickGamePersonNum' => '点游戏人数',
    'regNum' => '注册人数',
    'oldAccountLogin' => '老账号活跃',
    'allAccountLogin' => '总账号活跃',
    'createRoleNum' => '总创角',
    'oldAccountCreateRoleNum' => '老号创角',
    'newAccountCreateRoleNum' => '新号创角',
//    'rate' => '转化率',
    'loginNum' => '登录人数',
    'oldUserloginNum' => '老用户',
    'activeRechargePersonNum' => '活跃付费用户',
    'chargePersonNum' => '充值人数',
    'payDau' => '活跃用户付费率',
    'totalChargeNum' => '充值金额',
    'newAccountChargeNum' => '新号充值',
    'newAccountChargePersonNum' => '新充值人数',
    'oldAccountChargeNum' => '老号充值',
    'arpu' => 'arpu',
    'arppu' => 'arppu值',
    'r2' => '次留',
    'r3' => '三留',
    'r7' => '七留',
    'r14' => '十四留',
    'zhushoubi' => '总注收比',
    'chuangshoubi' => '总创收比',
    'firstZsb' => '首日创收比',
    'firstCsb' => '首日创收比',
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
    $cache_account = GameAccount::getAccount();

    //点击游戏人数
    $clickData = GameClickAccount::getClicks($params);
    foreach ($clickData as $row) {
        $outArr[$row['theDate']]['clickGamePersonNum'] = $row['num'];
    }
    //注册人数
    $regData = GameAccount::getRegsByDate($params);
    foreach ($regData as $row) {
        $outArr[$row['regDate']]['regNum'] = $row['num'];
    }
    //充值人数
    $payUsers = RechargeRequest::getPayUsers($params);
//    $payUsers = RechargeRequest::getPayAccounts($params);
    foreach ($payUsers as $row) {
        if ($row['day'] > $cache_account[$row['accountId']]['day']) {
            //老号
            $outArr[$row['day']]['oldAccountChargePersonNum']++;
        } else {
            //新号
            $outArr[$row['day']]['newAccountChargePersonNum']++;
        }
        $outArr[$row['day']]['chargePersonNum']++;
        $serverDatePayUsers[$row['serverId']][$row['day']][$row['userId']] += $row['goodsPrice'];
    }
    //充值金额
    $cache_recharge = [];
    $payTotal = RechargeRequest::getPriceByDay($params);
    foreach ($payTotal as $row) {
        $theDate = $row['day'];
        if (!isset($outArr[$theDate]['oldAccountChargeNum'])) $outArr[$theDate]['oldAccountChargeNum'] = 0;
        if (!isset($outArr[$theDate]['newAccountChargeNum'])) $outArr[$theDate]['newAccountChargeNum'] = 0;
        //充值表缓存
//        $cache_recharge[$row['userId']][] = $row;
        $cache_recharge[$row['accountId']][] = $row;
        //$price = $CONFIG_RECHARGE[$row['goodsId']]['cost'];
        $price = $row['goodsPrice'];
        $totalRecharge += $price;
        $outArr[$theDate]['totalChargeNum'] += $price;
        if ($theDate > $cache_account[$row['accountId']]['day']) {
            //老号
            $outArr[$theDate]['oldAccountChargeNum'] += $price;
        } else {
            //新号
            $outArr[$theDate]['newAccountChargeNum'] += $price;
        }
    }

    $cache_user = [];
    foreach ($selectIds as $sid) {
        //总创角
        $allRoles = GameUser::getAllUsersByDate($sid, $params);
        foreach ($allRoles as $row) {
            $outArr[$row['theDate']]['createRoleNum'] += $row['num'];
        }
        //创角
        $users = GameUser::getUserByDate($sid);
        foreach ($users as $row) {
            $theDate = $row['theDate'];
            if (!isset($outArr[$theDate]['oldAccountCreateRoleNum'])) $outArr[$theDate]['oldAccountCreateRoleNum'] = 0;
            if (!isset($outArr[$theDate]['newAccountCreateRoleNum'])) $outArr[$theDate]['newAccountCreateRoleNum'] = 0;
            $cache_user[$row['id']] = $row;
            if ($theDate > $cache_account[$row['accountId']]['day']) {
                //老号
                $outArr[$theDate]['oldAccountCreateRoleNum']++;
                if (isset($serverDatePayUsers[$sid][$theDate][$row['id']])) {
                    $createRoleRecharge[$theDate] += $serverDatePayUsers[$sid][$theDate][$row['id']];
                }
            } else {
                //新号
                $outArr[$theDate]['newAccountCreateRoleNum']++;
            }
        }
        //登录人数
        $loginData = GameLogin::getLogin($sid, $params);
        foreach ($loginData as $row) {
            $outArr[$row['day']]['loginNum'] += $row['num'];
        }
        //总账号活跃
        $loginUsers = GameLogin::getLoginUsers($sid, $params);
        foreach ($loginUsers as $row) {
            $accountId = $cache_user[$row['user_id']]['accountId'];
            $userCrt = $cache_user[$row['user_id']]['theDate'];
            if ($accountId) {
                if (!isset($accountLogin[$row['day']])) {
                    $accountLogin[$row['day']][] = $accountId;
                } elseif (!in_array($accountId, $accountLogin[$row['day']])) {
                    $accountLogin[$row['day']][] = $accountId;
                }
                if ($row['day'] > $cache_account[$accountId]['day']) {
                    if (!in_array($accountId, $oldAccountLogin[$row['day']])) {
                        $oldAccountLogin[$row['day']][] = $accountId;
                    }
                }
            }
        }

        //老号|新号|活跃付费用户|次留  三留	七留	 十四留
        $retainData = GameLogin::getRetain($sid, $params);
        foreach ($retainData as $row) {
            if (!isset($outArr[$row['day']]['oldUserloginNum'])) $outArr[$row['day']]['oldUserloginNum'] = 0;
            if (!isset($outArr[$row['day']]['newUserloginNum'])) $outArr[$row['day']]['newUserloginNum'] = 0;
            //找出角色创建时间
            $useCreateDay = $cache_user[$row['user_id']]['theDate'];
            $loginDay = $row['day'];
            //活跃付费用户
            if (!empty($cache_recharge[$row['user_id']])) {
                foreach ($cache_recharge[$row['user_id']] as $recharge_row) {
                    if ($loginDay >= $recharge_row['day']) {
                        $outArr[$loginDay]['activeRechargePersonNum']++;
                        break;
                    }
                }
            }

            if ($loginDay > $useCreateDay) {
                //老号
                $outArr[$loginDay]['oldUserloginNum']++;
                //次留  三留	七留	 十四留
                //echo '<br />'.'登录日期'.$loginDay.'玩家创建时间'.$useCreateDay;
                $daysDiff = Help::getDifferentDays($useCreateDay, $loginDay);
                //echo '<br />'.$daysDiff;
                switch ($daysDiff) {
                    case 1://次留
                        $outArr[$useCreateDay]['liucun2']++;
                        break;
                    case 2://三留
                        $outArr[$useCreateDay]['liucun3']++;
                        break;
                    case 6://七留
                        $outArr[$useCreateDay]['liucun7']++;
                        break;
                    case 13://十四留
                        $outArr[$useCreateDay]['liucun14']++;
                        break;
                }
            } else {
                //新号
                $outArr[$loginDay]['newUserloginNum']++;
            }
        }
    }

    ksort($outArr);

    $allTotalChargeNum = $allRegNum = $allCreateRoleNum = 0;
    foreach ($outArr as $k => &$v) {
        $allTotalChargeNum += $v['totalChargeNum'];
        $allRegNum += $v['regNum'];
        $allCreateRoleNum += $v['createRoleNum'];
        $v['date'] = $k;
        $v['allAccountLogin'] = sizeof($accountLogin[$k]);
        $v['oldAccountLogin'] = sizeof($oldAccountLogin[$k]);
        $v['oldUserlogin'] = sizeof($v['oldUserlogin']);
//        $v['rate'] = $v['regNum'] == 0 ? 0 : sprintf("%.4f", $v['newAccountCreateRoleNum'] / $v['regNum']) * 100;
        $v['payDau'] = $v['allAccountLogin'] == 0 ? 0 : sprintf("%.4f", $v['chargePersonNum'] / $v['allAccountLogin']) * 100;
        $v['arpu'] = $v['allAccountLogin'] == 0 ? 0 : sprintf("%.2f", $v['totalChargeNum'] / $v['allAccountLogin']);
        $v['arppu'] = $v['chargePersonNum'] == 0 ? 0 : sprintf("%.2f", $v['totalChargeNum'] / $v['chargePersonNum']);
        $v['r2'] = $v['newUserloginNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun2'] / $v['newUserloginNum']) * 100;
        $v['r3'] = $v['newUserloginNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun3'] / $v['newUserloginNum']) * 100;
        $v['r7'] = $v['newUserloginNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun7'] / $v['newUserloginNum']) * 100;
        $v['r14'] = $v['newUserloginNum'] == 0 ? 0 : sprintf("%.4f", $v['liucun14'] / $v['newUserloginNum']) * 100;
        $v['zhushoubi'] = $allRegNum == 0 ? 0 : sprintf("%.2f", $allTotalChargeNum / $allRegNum);
        $v['chuangshoubi'] = $allCreateRoleNum == 0 ? 0 : sprintf("%.2f", $allTotalChargeNum / $allCreateRoleNum);
        $v['firstZsb'] = $v['regNum'] == 0 ? 0 : sprintf("%.2f", $v['newAccountChargeNum'] / $v['regNum']);
        $v['firstCsb'] = $v['createRoleNum'] == 0 ? 0 : sprintf("%.2f", ($createRoleRecharge[$k] + $v['newAccountChargeNum']) / $v['createRoleNum']);
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

    $file_name = '运营数据统计';
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
Template::assign('outArr', $outArr);
Template::assign('group_options', $group_options);
Template::assign('_GET', $_GET);
Template::assign('page_html', $page_html);
Template::display('statistics/totalData.tpl');

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