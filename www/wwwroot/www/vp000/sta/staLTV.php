<?php
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . "GMT");
header("Cache-Control: no-cache, must-revalidate");
header("Pragma: no-cache");
require_once ('config.db.php');
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta charset="utf-8">
    <!-- Title and other stuffs -->
    <title>每日新增付费用户数据统计-绯雨骑士团</title>
    <meta name="keywords" content="绯雨骑士团统计-魔贝网络"/>
    <meta name="description" content="绯雨骑士团统计-魔贝网络"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="author" content="">

    <style type="text/css">
        .award_input {
            width: 50px;
        }
        .award_del {
            cursor: pointer;
        }
        table thead tr{background: #bbffd3;}
        table tbody tr:nth-child(odd){background: #eff8ff;}
        select {
            width: 100px;
        }
    </style>
</head>

<body>
<?php
$startTime = time();
function getDaysDiff($a,$b){//2018-01-5 2018-01-04 return 1
    $date1 = strtotime($a);
    $date2 = strtotime($b);
    $daydiff = floor(($date1-$date2)/86400);//天数差
    return $daydiff;
}

$host = $CONFIG_DB['host'];
$port = $CONFIG_DB['port'];
$user = $CONFIG_DB['user'];
$pwd = $CONFIG_DB['pwd'];
$db_main = $CONFIG_DB['db_main'];//uw_recharge_request
$db_game = $CONFIG_DB['db_game'];//uw_user
$db_login = $CONFIG_DB['db_login'];//uw_account uw_server_info
$db_gamelog = $CONFIG_DB['db_gamelog'];

//------------------------------------------------------------ttf_main------------------------------------------------------------
$ttf_main = new mysqli($host, $user, $pwd,$db_main, $port);
$ttf_main->autocommit(true);
$ttf_main->set_charset('utf8');
//------------------------------------------------------------ttf_game------------------------------------------------------------
$ttf_game = new mysqli($host, $user, $pwd);
$ttf_game->autocommit(true);
$ttf_game->set_charset('utf8');
//------------------------------------------------------------ttf_login------------------------------------------------------------
$ttf_login = new mysqli($host, $user, $pwd,$db_login, $port);
$ttf_login->autocommit(true);
$ttf_login->set_charset('utf8');
//--------------------------------------------------------------gamelog----------------------------------------------------------
$gamelog = new mysqli($host, $user, $pwd,$db_gamelog, $port);
$gamelog->autocommit(true);
$gamelog->set_charset('utf8');
//获取开服的服务器列表
$sql = "select id,serverId  from uw_server_info where serverDate < now()";
$result = $ttf_login->query($sql);
while ($row = $result->fetch_assoc()) {
    $gameServerArr[] =  $row['serverId'];
}
$result->free();
?>
<div>
    <form action="" method="post" autocomplete="off">

        <input type="submit" name="s" value="查询"/>

        <input type="hidden" name='search' value="search"/>
    </form>
</div>

<?php
if ($_REQUEST && $_REQUEST['search'] == "search") {
    echo '<br />统计'.$gameServerArr[0].'-'.$gameServerArr[count($gameServerArr)-1].'服数据';
    //=========================================================统计=========================================================
    //-----------------------------------------------------------账号表缓存-------------------------------------------------------------
//    $sql = "select id,channelId,DATE_FORMAT(createTime,'%Y-%m-%d') day,userServers,sdkChannelId from uw_account";
//    $result = $ttf_login->query($sql);
//    while ($row = $result->fetch_assoc()) {
//        $cache_account[$row['id']] =  $row;
//    }
//    $result->free();
    //-----------------------------------------------------------每日新增付费“账户”数-------------------------------------------------------------
    //| id | accountId | userId  | serverId | rechargeId | status | addTime| transId | goodsId | orderNo| gmStatus | lvl  | goodsPrice | feeMoney |
    $aacount = 0;
    $sql = "select accountId,userId,goodsId,DATE_FORMAT(addTime,'%Y-%m-%d') day,goodsPrice from uw_recharge_request where status in(1,2) order by addTime asc";
    $result = $ttf_main->query($sql);
    while($row = $result->fetch_assoc()) {
        //充值表缓存
        $cache_recharge[$row['accountId']][] = $row;
        //if($row['day'] == $cache_account[$row['accountId']]['day']){
            //每日新增付费“账户”数
            //if(!isset($outArr[$row['day']]['newAccountChargePersonArr']))$outArr[$row['day']]['newAccountChargePersonArr'] = [];
            if(!in_array($row['accountId'],$allRechargeArr)){
                $allRechargeArr[] = $row['accountId'];
                $outArr[$row['day']]['newAccountChargePersonArr'][] = $row['accountId'];
                $aacount ++;
            }
        //}
    }
    $result->free();
//    echo $aacount;
//    echo '<br />';
//    echo '<pre>';
//    print_r($outArr);
//    echo '</pre>';
//    exit();

    //遍历每日数据
    foreach($outArr as $day=>$data){
        //遍历每日数据里的 新增付费账户
        foreach($data['newAccountChargePersonArr'] as $accountId){
            //遍历此账户的所有充值记录
            foreach ($cache_recharge[$accountId] as $recharge){
                //每日新增付费“账户”累计充值金额
                $outArr[$day]['newAccountTotalPay'] += $recharge['goodsPrice'];

                $dayDiff = getDaysDiff($recharge['day'],$day);
                if($dayDiff < 0 ){
                    echo '计算有错，请检查';
                    continue;
                }
                //每日新增付费“账户”三十日累计充值金额
                if($dayDiff <= 29){
                    $outArr[$day]['totalPay30'] += $recharge['goodsPrice'];
                    //每日新增付费“账户”十四日累计充值金额
                    if($dayDiff<=13){
                        $outArr[$day]['totalPay14'] += $recharge['goodsPrice'];
                        //每日新增付费“账户”七日累计充值金额
                        if($dayDiff<=6){
                            $outArr[$day]['totalPay7'] += $recharge['goodsPrice'];
                            //每日新增付费“账户”三日累计充值金额
                            if($dayDiff<=2){
                                $outArr[$day]['totalPay3'] += $recharge['goodsPrice'];
                                //每日新增付费“账户”当日累计充值金额
                                if($dayDiff==0){
                                    $outArr[$day]['totalPay0'] += $recharge['goodsPrice'];
                                }
                            }
                        }
                    }
                }

            }
        }
    }

//    echo '<pre>';
//    print_r($outArr);
//    echo '</pre>';
//    exit();
    //-----------------------------------------------------------遍历所有游戏服-------------------------------------------------------------
    foreach($gameServerArr as $key=>$game_sid){
        $dbname= $db_game.$game_sid;
        //echo '<br />查询'.$dbname;
        $ttf_game->select_db($dbname);
        $sql = "select id,accountId,DATE_FORMAT(createTime,'%Y-%m-%d') day,lastUpdateTime,nickName from uw_user where accountId !=0";
        $result = $ttf_game->query($sql);
        //用户表缓存 用于判断新老玩家 userid理论上不会重复 所有服user表放到一个缓存里
        while ($row = $result->fetch_assoc()) {
            $cache_user[$row['id']] = $row;
        }
        $result->free();

        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++算留存+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        $sql = "SELECT DATE_FORMAT(created,'%Y-%m-%d') day,count(*) loginNum,user_id FROM login_log_".$game_sid." WHERE user_id IS NOT NULL GROUP BY DATE_FORMAT(created,'%Y-%m-%d'),user_id";
        $result = $gamelog->query($sql);
        while ($row = $result->fetch_assoc()) {
            $loginDay = $row['day'];

            //找出角色账号Id
            $userAccountId = $cache_user[$row['user_id']]['accountId'];
            if(!isset($tempArr[$loginDay]))$tempArr[$loginDay] = [];
            //去除一号多服登录的重复记录 只按账号id算留存
            if(in_array($userAccountId,$tempArr[$loginDay])){
                continue;
            }else{
                $tempArr[$loginDay][] = $userAccountId;
            }
            //付费账户留存率当日、三日、七日、十四日、三十日】
            $day2 = date("Y-m-d",strtotime("-1 day",strtotime($loginDay)));
            $day3 = date("Y-m-d",strtotime("-2 day",strtotime($loginDay)));
            $day7 = date("Y-m-d",strtotime("-6 day",strtotime($loginDay)));
            $day14 = date("Y-m-d",strtotime("-13 day",strtotime($loginDay)));
            $day30 = date("Y-m-d",strtotime("-29 day",strtotime($loginDay)));
            //属于当日新充值用户
            if(in_array($userAccountId,$outArr[$day2]['newAccountChargePersonArr'])){
                $outArr[$day2]['liucun2'] ++;
            }else if(in_array($userAccountId,$outArr[$day3]['newAccountChargePersonArr'])){
                $outArr[$day3]['liucun3'] ++;
            }else if(in_array($userAccountId,$outArr[$day7]['newAccountChargePersonArr'])){
                $outArr[$day7]['liucun7'] ++;
            }else if(in_array($userAccountId,$outArr[$day14]['newAccountChargePersonArr'])){
                $outArr[$day14]['liucun14'] ++;
            }else if(in_array($userAccountId,$outArr[$day30]['newAccountChargePersonArr'])){
                $outArr[$day30]['liucun30'] ++;
            }
        }
        $result->free();
    }
    echo "<br />统计每日新增付费“账户”数、累计充值金额、当日、三日、七日、十四日、三十日累计充值金额、付费账户留存率次日、三日、七日、十四日、三十日";
    //统计每日新增付费“账户”数、累计充值金额、当日、三日、七日、十四日、三十日累计充值金额、付费账户留存率当日、三日、七日、十四日、三十日】
    echo '<table border="1px" cellspacing="1"><tr>
        <td>日期</td>
        <td>新增付费“账户”数</td>
        <td>累计充值金额</td> 
        <td>当日累充</td>
        <td>三日累充</td> 
        <td>七日累充</td>
        <td>十四日累充</td>
        <td>三十日累充</td>
        <td>付费账户留存次日</td>
        <td>付费账户留存三日</td>
        <td>付费账户留存七日</td>
        <td>付费账户留存十四日</td>
        <td>付费账户留存三十日</td>
    </tr>';
    foreach($outArr as $day=>$v){
        echo "<tr>";
        echo "<td>" . $day . "</td>";
        $newAddPayAccountNum = count($v[newAccountChargePersonArr]);
        echo "<td>" . $newAddPayAccountNum . "</td>";//新增付费“账户”数
        echo "<td>" . $v['newAccountTotalPay'] . "</td>";//累计充值金额
        echo "<td>" . $v['totalPay0'] . "</td>";//当日累充
        echo "<td>" . $v['totalPay3'] . "</td>";
        echo "<td>" . $v['totalPay7'] . "</td>";
        echo "<td>" . $v['totalPay14'] . "</td>";
        echo "<td>" . $v['totalPay30'] . "</td>";

        $rate_liucun2 = sprintf("%.4f", $v['liucun2']/$newAddPayAccountNum)*100;
        $rate_liucun3 = sprintf("%.4f", $v['liucun3']/$newAddPayAccountNum)*100;
        $rate_liucun7 = sprintf("%.4f", $v['liucun7']/$newAddPayAccountNum)*100;
        $rate_liucun14 = sprintf("%.4f", $v['liucun14']/$newAddPayAccountNum)*100;
        $rate_liucun30 = sprintf("%.4f", $v['liucun30']/$newAddPayAccountNum)*100;
        echo "<td>" .$rate_liucun2. "%</td>";
        echo "<td>" .$rate_liucun3. "%</td>";
        echo "<td>" .$rate_liucun7. "%</td>";
        echo "<td>" .$rate_liucun14. "%</td>";
        echo "<td>" .$rate_liucun30. "%</td>";
        echo "</tr>";
    }
    echo '</table>';
    $useTime = time() - $startTime;
    echo '<br/>耗时'.$useTime.'秒';
}
?>

</body>
</html>