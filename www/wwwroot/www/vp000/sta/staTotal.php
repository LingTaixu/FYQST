<?php
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . "GMT");
header("Cache-Control: no-cache, must-revalidate");
header("Pragma: no-cache");
require_once ('../include/config/config.recharge.php');
require_once ('config.db.php');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta charset="utf-8">
    <!-- Title and other stuffs -->
    <title>统计报表-绯雨骑士团</title>
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
    </style>
</head>

<body>
<div>
    <form action="" method="post" autocomplete="off">
        <ul>
            <li>查询账号<input type="text" name="u" value = '' autocomplete="off"/></li>
            <li>查询密码<input type="password" name="p" value = '' autocomplete="off"/></li>
            <li><input type="submit" name="s" value="查询"/></li>
        </ul>
        <input type="hidden" name='search' value="search"/>
    </form>
</div>

<?php
if ($_REQUEST && $_REQUEST['search'] == "search") {
    $user = $_REQUEST['u'];
    $password = $_REQUEST['p'];
    if (!($user == 'mmobay' && $password == 'aaaa1111') && !($user == 'sta' && $password == '201*')) {
        echo '账号或密码错误！';
        exit();
    }
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
    //------------------------------------------------------------ttf_login------------------------------------------------------------
    $ttf_login = new mysqli($host, $user, $pwd,$db_login, $port);
    $ttf_login->autocommit(true);
    $ttf_login->set_charset('utf8');
    //------------------------------------------------------------ttf_game------------------------------------------------------------
    $ttf_game = new mysqli($host, $user, $pwd);
    $ttf_game->autocommit(true);
    $ttf_game->set_charset('utf8');
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
    ////$gameServerArr = [1,2,3,4,5,6,7];//login_log表未创建报错  临时写死

    //账号表缓存
    $sql = "select id,channelId,DATE_FORMAT(createTime,'%Y-%m-%d') day,userServers,sdkChannelId from uw_account";
    $result = $ttf_login->query($sql);
    while ($row = $result->fetch_assoc()) {
        $cache_account[$row['id']] =  $row;
    }
    $result->free();

    //=========================================================统计=========================================================
    $outArr = [];
    //-----------------------------------------------------------点击游戏人数-------------------------------------------------------------
    $sql = "select DATE_FORMAT(createTime,'%Y-%m-%d') day,count(id) num from uw_click_account group by DATE_FORMAT(createTime,'%Y-%m-%d')";
    $result = $ttf_login->query($sql);
    while ($row = $result->fetch_assoc()) {
        //echo '<br />'.$row['day'].'|'.$row['num'];
        $outArr[$row['day']]['clickGamePersonNum'] = $row['num'];
    }
    $result->free();
    //-----------------------------------------------------------注册人数-------------------------------------------------------------
    $sql = "select DATE_FORMAT(createTime,'%Y-%m-%d') day,count(id) num from uw_account group by DATE_FORMAT(createTime,'%Y-%m-%d')";
    $result = $ttf_login->query($sql);
    while ($row = $result->fetch_assoc()) {
        //echo '<br />'.$row['day'].'|'.$row['num'];
        $outArr[$row['day']]['regNum'] = $row['num'];
    }
    $result->free();
    //-----------------------------------------------------------充值人数-------------------------------------------------------------
    $sql = "select count(*) num,DATE_FORMAT(addTime,'%Y-%m-%d') day,accountId,userId from uw_recharge_request where status in(1,2) group by DATE_FORMAT(addTime,'%Y-%m-%d'),userId order by accountId desc";
    $result = $ttf_main->query($sql);
    while($row = $result->fetch_assoc()) {
        if($row['day'] > $cache_account[$row['accountId']]['day']){
            //老号
            $outArr[$row['day']]['oldAccountChargePersonNum'] ++;
        }else{
            //新号
            $outArr[$row['day']]['newAccountChargePersonNum'] ++;
        }
        $outArr[$row['day']]['chargePersonNum'] ++;
    }
    $result->free();
    //-----------------------------------------------------------充值金额-------------------------------------------------------------
    //| id | accountId | userId  | serverId | rechargeId | status | addTime| transId | goodsId | orderNo| gmStatus | lvl  | goodsPrice | feeMoney |
    $sql = "select accountId,userId,goodsId,DATE_FORMAT(addTime,'%Y-%m-%d') day,goodsPrice from uw_recharge_request where status in(1,2)";
    $result = $ttf_main->query($sql);
    $totalRecharge = 0;
    while($row = $result->fetch_assoc()) {
        if(!isset($outArr[$row['day']]['oldAccountChargeNum']))$outArr[$row['day']]['oldAccountChargeNum'] =0;
        if(!isset($outArr[$row['day']]['newAccountChargeNum']))$outArr[$row['day']]['newAccountChargeNum'] =0;
        //充值表缓存
        $cache_recharge[$row['userId']][] = $row;
        //$price = $CONFIG_RECHARGE[$row['goodsId']]['cost'];
        $price = $row['goodsPrice'];
        $totalRecharge+= $price;
        $outArr[$row['day']]['totalChargeNum'] += $price;
        if($row['day'] > $cache_account[$row['accountId']]['day']){
            //老号
            $outArr[$row['day']]['oldAccountChargeNum'] += $price;
        }else{
            //新号
            $outArr[$row['day']]['newAccountChargeNum'] += $price;
        }
    }
    $result->free();

    //-----------------------------------------------------------遍历所有游戏服-------------------------------------------------------------
    foreach($gameServerArr as $key=>$game_sid){
        $dbname= $db_game.$game_sid;
        //echo '<br />查询'.$dbname;
        $ttf_game->select_db($dbname);
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++总创角+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        $sql = "select DATE_FORMAT(createTime,'%Y-%m-%d') day,count(*) num,serverId from uw_user where accountId !=0 group by DATE_FORMAT(createTime,'%Y-%m-%d')";
        $result = $ttf_game->query($sql);
        while ($row = $result->fetch_assoc()) {
            //echo '<br />'.$row['day'].'日'.$row['serverId'].'服创角人数'.$row['num'];
            $outArr[$row['day']]['createRoleNum'] += $row['num'];
        }
        $result->free();

        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++老号创角+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        $sql = "select id,accountId,DATE_FORMAT(createTime,'%Y-%m-%d') day,lastUpdateTime,nickName from uw_user where accountId !=0";
        $result = $ttf_game->query($sql);
        //用户表缓存 用于判断新老玩家 userid理论上不会重复 所有服user表放到一个缓存里
        //$cache_user = [];
        while ($row = $result->fetch_assoc()) {
            if(!isset($outArr[$row['day']]['oldAccountCreateRoleNum']))$outArr[$row['day']]['oldAccountCreateRoleNum'] =0;
            if(!isset($outArr[$row['day']]['newAccountCreateRoleNum']))$outArr[$row['day']]['newAccountCreateRoleNum'] =0;
            $cache_user[$row['id']] = $row;
            if($row['day'] > $cache_account[$row['accountId']]['day']){
                //老号
                $outArr[$row['day']]['oldAccountCreateRoleNum']++;
            }else{
                //新号
                $outArr[$row['day']]['newAccountCreateRoleNum']++;
            }
            //echo '<br />'.$row['day'].'日';
        }
        $result->free();

        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++登录人数+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        $sql = "SELECT day,count(*) AS num FROM (SELECT DATE_FORMAT(created,'%Y-%m-%d') day,count(*),user_id FROM login_log_".$game_sid." WHERE user_id IS NOT NULL GROUP BY DATE_FORMAT(created,'%Y-%m-%d'),user_id) AS tmp GROUP BY  day ORDER BY day ASC";
        $result = $gamelog->query($sql);
        while ($row = $result->fetch_assoc()) {
            if($row){
                //echo '<br />'.$row['day'].'日'.$game_sid.'服登录人数'.$row['num'];
                $outArr[$row['day']]['loginNum'] += $row['num'];
            }
        }
        $result->free();

        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++老号|新号|活跃付费用户|次留  三留	七留	 十四留+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        $sql = "SELECT DATE_FORMAT(created,'%Y-%m-%d') day,count(*) loginNum,user_id FROM login_log_".$game_sid." WHERE user_id IS NOT NULL GROUP BY DATE_FORMAT(created,'%Y-%m-%d'),user_id";
        $result = $gamelog->query($sql);
        while ($row = $result->fetch_assoc()) {
            if(!isset($outArr[$row['day']]['oldUserloginNum']))$outArr[$row['day']]['oldUserloginNum'] =0;
            if(!isset($outArr[$row['day']]['newUserloginNum']))$outArr[$row['day']]['newUserloginNum'] =0;
            //找出角色创建时间
            $useCreateDay = $cache_user[$row['user_id']]['day'];
            $loginDay = $row['day'];
            //活跃付费用户
            foreach($cache_recharge[$row['user_id']] as $recharge_row){
                if($loginDay >= $recharge_row['day']){
                    $outArr[$loginDay]['activeRechargePersonNum']++;
                    break;
                }
            }

            if($loginDay > $useCreateDay){
                //老号
                $outArr[$loginDay]['oldUserloginNum']++;
                //次留  三留	七留	 十四留
                //echo '<br />'.'登录日期'.$loginDay.'玩家创建时间'.$useCreateDay;
                $daysDiff = getDaysDiff($loginDay,$useCreateDay);
                //echo '<br />'.$daysDiff;
                switch ($daysDiff){
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
            }else{
                //新号
                $outArr[$loginDay]['newUserloginNum']++;
            }
        }
        $result->free();
    }


    // 以serverId来统计充值数
    $serverOutArr = [];
    $sql = "select  sum(goodsPrice) as totalPay, serverId from uw_recharge_request where status>0 group by serverId";
    $result = $ttf_main->query($sql);
    while($row = $result->fetch_assoc()) {
        $ser = [];
        $ser["serverId"] = $row['serverId'];
        $ser["totalPay"] = $row['totalPay'];
        $serverOutArr[] = $ser;
    }
    $result->free();

    echo '<br />统计'.$gameServerArr[0].'-'.$gameServerArr[count($gameServerArr)-1].'服数据';
    echo '<br />';
    echo '总计累计充值'.$totalRecharge.'元';
    echo '<br />';
    echo '<table border="1px" cellspacing="1"><tr>
        <td>日期</td>
        <td>点游戏人数</td>
        <td>注册人数</td>
        <td>总创角</td>
        <td>老号创角</td> 
        <td>新号创角</td> 
        <td>转化率</td> 
        <td>登录人数</td>
        <td>老用户</td>
        <td>活跃付费用户</td>
        
        <td>充值人数</td>             
        <td>活跃用户付费率</td>
        <td>充值金额</td>
        <td>新号充值</td>
        <td>新充值人数</td>
        <td>老号充值</td>
        
        <td>arpu</td>
        <td>arppu值</td>
        <td>次留</td>
        <td>三留</td>
        <td>七留</td>
        <td>十四留</td>
        <td>首日注收比</td>
        <td>首日创收比</td>
    </tr>';
    foreach($outArr as $k=>$v){
        echo "<tr>";
        echo "<td>" . $k . "</td>";
        echo "<td>" . $v['clickGamePersonNum'] . "</td>";
        echo "<td>" . $v['regNum'] . "</td>";
        echo "<td>" . $v['createRoleNum'] . "</td>";
        echo "<td>" . $v['oldAccountCreateRoleNum'] . "</td>";
        echo "<td>" . $v['newAccountCreateRoleNum'] . "</td>";
        //转化率
        $rate = sprintf("%.4f", $v['newAccountCreateRoleNum']/$v['regNum'])*100;
        echo "<td>".$rate."%</td>";
        echo "<td>" . $v['loginNum'] . "</td>";//登录人数
        echo "<td>" . $v['oldUserloginNum'] . "</td>";//老用户
        echo "<td>" . $v['activeRechargePersonNum'] . "</td>";//活跃付费用户

        echo "<td>" . $v['chargePersonNum'] . "</td> ";//充值人数
        $rate1 = sprintf("%.4f", $v['chargePersonNum']/$v['loginNum'])*100;
        echo "<td>".$rate1."%</td>";//活跃用户付费率
        echo "<td style=\"color:green\">". $v['totalChargeNum'] ."元</td>";//充值金额
        echo "<td>". $v['newAccountChargeNum'] ."元</td>";//新号充值
        echo "<td>" . $v['newAccountChargePersonNum'] . "</td>";//新充值人数
        echo "<td>". $v['oldAccountChargeNum'] ."元</td>";//老号充值

        $arpu = sprintf("%.2f", $v['totalChargeNum']/$v['loginNum']);
        echo "<td>$arpu</td>";//arpu 充值金额 / 活跃用户
        $arppu = sprintf("%.2f", $v['totalChargeNum']/$v['chargePersonNum']);
        echo "<td>$arppu</td>";//arppu值 充值金额 / 充值用户
        $rate_liucun2 = sprintf("%.4f", $v['liucun2']/$v['newUserloginNum'])*100;
        $rate_liucun3 = sprintf("%.4f", $v['liucun3']/$v['newUserloginNum'])*100;
        $rate_liucun7 = sprintf("%.4f", $v['liucun7']/$v['newUserloginNum'])*100;
        $rate_liucun14 = sprintf("%.4f", $v['liucun14']/$v['newUserloginNum'])*100;
        echo "<td>".$rate_liucun2."%</td>";//次留
        echo "<td>".$rate_liucun3."%</td>";//三留
        echo "<td>".$rate_liucun7."%</td>";//七留
        echo "<td>".$rate_liucun14."%</td>";//十四留
        $rate_zhushoubi = sprintf("%.2f", $v['newAccountChargeNum']/$v['regNum']);
        echo "<td>".$rate_zhushoubi."</td>";//首日注收比
        $rate_chuangshoubi = sprintf("%.2f", $v['newAccountChargeNum']/$v['newAccountCreateRoleNum']);
        echo "<td>$rate_chuangshoubi</td>";//首日创收比
        echo "</tr>";
    }
    echo '</table>';
    echo "</br></br>";
    echo "各个服务器充值统计:";
    echo '<table border="1px" cellspacing="1"><tr>
        <td>服务器Id</td>
        <td>充值总金额</td>
    </tr>';
    foreach($serverOutArr as $k=>$v) {
        echo "<tr>";
        echo "<td>" . $v['serverId'] . "</td>";
        echo "<td>" . $v['totalPay'] . "</td>";
        echo "</tr>";
    }
    echo '</table>';
}
?>

</body>
</html>
