<?php
require('../include/init.inc.php');
$method = '';
$search = 0;
$totalNum = 0;
$selectServer = '';
$allArr = $outArr = $allRechargeArr = $cache_user = $cache_recharge = array();
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
    'newAddPayAccountNum' => '新增付费“账户”数',
    'newAccountTotalPay' => '累计充值金额',
    'totalPay0' => '当日累充',
    'totalPay3' => '三日累充',
    'totalPay7' => '七日累充',
    'totalPay14' => '十四日累充',
    'totalPay30' => '三十日累充',
    'rate2' => '付费账户留存次日',
    'rate3' => '付费账户留存三日',
    'rate7' => '付费账户留存七日',
    'rate14' => '付费账户留存十四日',
    'rate30' => '付费账户留存三十日'
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
        'servers' => $selectIds
    ];
    $rechargeInfo = RechargeRequest::getPriceByDay($params);
    $account = 0;
    if (!empty($rechargeInfo)) {
        foreach ($rechargeInfo as $row) {
            $cache_recharge[$row['accountId']][] = $row;
            if (!in_array($row['accountId'], $allRechargeArr)) {
                $allRechargeArr[] = $row['accountId'];
                $outArr[$row['day']]['newAccountChargePersonArr'][] = $row['accountId'];
                $account++;
            }
        }
    }

    //遍历每日数据
    foreach ($outArr as $day => $data) {
        //遍历每日数据里的 新增付费账户
        foreach ($data['newAccountChargePersonArr'] as $accountId) {
            //遍历此账户的所有充值记录
            foreach ($cache_recharge[$accountId] as $recharge) {
                //每日新增付费“账户”累计充值金额
                $outArr[$day]['newAccountTotalPay'] += $recharge['goodsPrice'];

                $dayDiff = Help::getDifferentDays($day, $recharge['day']);
                if ($dayDiff < 0) {
                    echo '计算有错，请检查';
                    continue;
                }
                //每日新增付费“账户”三十日累计充值金额
                if ($dayDiff <= 29) {
                    $outArr[$day]['totalPay30'] += $recharge['goodsPrice'];
                    //每日新增付费“账户”十四日累计充值金额
                    if ($dayDiff <= 13) {
                        $outArr[$day]['totalPay14'] += $recharge['goodsPrice'];
                        //每日新增付费“账户”七日累计充值金额
                        if ($dayDiff <= 6) {
                            $outArr[$day]['totalPay7'] += $recharge['goodsPrice'];
                            //每日新增付费“账户”三日累计充值金额
                            if ($dayDiff <= 2) {
                                $outArr[$day]['totalPay3'] += $recharge['goodsPrice'];
                                //每日新增付费“账户”当日累计充值金额
                                if ($dayDiff == 0) {
                                    $outArr[$day]['totalPay0'] += $recharge['goodsPrice'];
                                }
                            }
                        }
                    }
                }

            }
        }
    }
    krsort($outArr);

    foreach ($selectIds as $game_sid) {
        $userInfo = GameUser::getUserByDate($game_sid);
        if (!empty($userInfo)) {
            foreach ($userInfo as $row) {
                $cache_user[$row['id']] = $row;
            }
        }

        $retainInfo = GameLogin::getRetain($game_sid);
        if (!empty($retainInfo)) {
            foreach ($retainInfo as $row) {
                $loginDay = $row['day'];

                //找出角色账号Id
                $userAccountId = $cache_user[$row['user_id']]['accountId'];
                if (!isset($tempArr[$loginDay])) $tempArr[$loginDay] = [];
                //去除一号多服登录的重复记录 只按账号id算留存
                if (in_array($userAccountId, $tempArr[$loginDay])) {
                    continue;
                } else {
                    $tempArr[$loginDay][] = $userAccountId;
                }
                //付费账户留存率当日、三日、七日、十四日、三十日】
                $day2 = date("Y-m-d", strtotime("-1 day", strtotime($loginDay)));
                $day3 = date("Y-m-d", strtotime("-2 day", strtotime($loginDay)));
                $day7 = date("Y-m-d", strtotime("-6 day", strtotime($loginDay)));
                $day14 = date("Y-m-d", strtotime("-13 day", strtotime($loginDay)));
                $day30 = date("Y-m-d", strtotime("-29 day", strtotime($loginDay)));
                //属于当日新充值用户
                if (isset($outArr[$day2]) && in_array($userAccountId, $outArr[$day2]['newAccountChargePersonArr'])) {
                    $outArr[$day2]['liucun2']++;
                } else if (isset($outArr[$day3]) && in_array($userAccountId, $outArr[$day3]['newAccountChargePersonArr'])) {
                    $outArr[$day3]['liucun3']++;
                } else if (isset($outArr[$day7]) && in_array($userAccountId, $outArr[$day7]['newAccountChargePersonArr'])) {
                    $outArr[$day7]['liucun7']++;
                } else if (isset($outArr[$day14]) && in_array($userAccountId, $outArr[$day14]['newAccountChargePersonArr'])) {
                    $outArr[$day14]['liucun14']++;
                } else if (isset($outArr[$day30]) && in_array($userAccountId, $outArr[$day30]['newAccountChargePersonArr'])) {
                    $outArr[$day30]['liucun30']++;
                }
            }
        }
    }

    foreach ($outArr as $day => &$v) {
        $v['date'] = $day;
        $newAddPayAccountNum = count($v['newAccountChargePersonArr']);
        $v['newAddPayAccountNum'] = $newAddPayAccountNum;
        foreach ($retainDay as $rDay => $value) {
            if ($newAddPayAccountNum) {
                $retain = 'liucun' . $rDay;
                $rate = 'rate' . $rDay;
                $v[$rate] = sprintf("%.4f", $v[$retain] / $newAddPayAccountNum) * 100;
            }
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

    $file_name = '新增付费用户统计';
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
Template::assign('retainDay', $retainDay);
Template::assign('outArr', $outArr);
Template::assign('group_options', $group_options);
Template::assign('_GET', $_GET);
Template::assign('page_html', $page_html);
Template::display('statistics/firstPay.tpl');

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