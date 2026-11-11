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
    <title>分服每日数据统计-绯雨骑士团</title>
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

            <select name = "serverId" class="select">
                <?php
                    foreach($gameServerArr as $k=>$serverId){
                        if($serverId == $_POST['serverId']){
                            echo "<option value = '".$serverId."' selected=selected>".$serverId."服</option>";
                        }else{
                            echo "<option value = '".$serverId."'>".$serverId."服</option>";
                        }

                    }
                ?>
            </select>
            <input type="submit" name="s" value="查询"/>

        <input type="hidden" name='search' value="search"/>
    </form>
</div>

<?php
if ($_REQUEST && $_REQUEST['search'] == "search") {
    $serverId = $_REQUEST['serverId'];
    $dbname= $db_game.$serverId;
    $ttf_game->select_db($dbname);
    //=========================================================统计=========================================================
    echo '<br />统计'.$serverId.'服数据';
    //账号表缓存
    $sql = "select id,channelId,DATE_FORMAT(createTime,'%Y-%m-%d') day,userServers,sdkChannelId from uw_account";
    $result = $ttf_login->query($sql);
    while ($row = $result->fetch_assoc()) {
        $cache_account[$row['id']] =  $row;
    }
    $result->free();

    //--------------------------------------------------------行会人信息表 缓存---------------------------------------------------------------
    $sql = "select id,userId,guildId from uw_guild_personal where guildId != 0";//
    $result = $ttf_game->query($sql);
    while ($row = $result->fetch_assoc()) {
        $cache_guild_personal[$row['userId']] =  $row;
    }
    $result->free();

    //--------------------------------------------------------总角色数、新号创角、老号创角----------------------------------------------------------------
    //制作分服务器的每日数据统计：总角色数、总充值数、新号创角、老号创角、入行会用户留存【次留、3留、7留、14留、30留】
    $sql = "select id,accountId,DATE_FORMAT(createTime,'%Y-%m-%d') day,lastUpdateTime,nickName from uw_user where accountId !=0 order by createTime asc";
    $result = $ttf_game->query($sql);
    while ($row = $result->fetch_assoc()) {
        if(!isset($outArr[$row['day']]['createRoleNum']))$outArr[$row['day']]['createRoleNum'] =0;
        if(!isset($outArr[$row['day']]['oldAccountCreateRoleNum']))$outArr[$row['day']]['oldAccountCreateRoleNum'] =0;
        if(!isset($outArr[$row['day']]['newAccountCreateRoleNum']))$outArr[$row['day']]['newAccountCreateRoleNum'] =0;
        //玩家表缓存
        $cache_user[$row['id']] = $row;
        //总角色数
        $outArr[$row['day']]['createRoleNum'] ++;

        if($row['day'] > $cache_account[$row['accountId']]['day']){
            //老号创角
            $outArr[$row['day']]['oldAccountCreateRoleNum']++;
        }else{
            //新号创角
            $outArr[$row['day']]['newAccountCreateRoleNum']++;
        }

        // 行会
        if(isset($cache_guild_personal[$row['id']])){
            $outArr[$row['day']]['joinGuildRoleNum'] ++;
        }
    }
    $result->free();
//    echo '<pre>';
//    print_r($outArr);
//    echo '</pre>';

    //--------------------------------------------------------总充值数---------------------------------------------------------------
    $sql = "select  sum(goodsPrice) as totalPay,DATE_FORMAT(addTime,'%Y-%m-%d') day, serverId from uw_recharge_request where status>0 and serverId=".$serverId." group by DATE_FORMAT(addTime,'%Y-%m-%d')";
    $result = $ttf_main->query($sql);
    while ($row = $result->fetch_assoc()) {
        $outArr[$row['day']]['totalPay'] = $row['totalPay'];
    }
    $result->free();

    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++入行会用户留存【次留、3留、7留、14留、30留】+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    $sql = "SELECT DATE_FORMAT(created,'%Y-%m-%d') day,count(*) loginNum,user_id FROM login_log_".$serverId." WHERE user_id IS NOT NULL GROUP BY DATE_FORMAT(created,'%Y-%m-%d'),user_id order by created desc";
    $result = $gamelog->query($sql);
    while ($row = $result->fetch_assoc()) {
        $outArr[$row['day']]['loginNum'] ++;
        //找出角色创建时间
        $useCreateDay = $cache_user[$row['user_id']]['day'];
        $loginDay = $row['day'];
        if(!isset($cache_guild_personal[$row['user_id']])){
            continue;
        }
//        $outArr[$row['day']]['hasGuildPersonLoginNum'] ++;
//        date("Y-m-d",strtotime("+1 day",strtotime("2011-02-04")));
        if($loginDay > $useCreateDay){
            //老号
            $outArr[$loginDay]['oldUserloginNum']++;
            //次留  三留	七留	 十四留
            //echo '<br />'.'登录日期'.$loginDay.'玩家创建时间'.$useCreateDay;
            $daysDiff = getDaysDiff($loginDay,$useCreateDay);
            //echo '<br />'.$daysDiff;
            switch ($daysDiff){
                case 1://次留
                    $outArr[$useCreateDay]['guildLiucun2']++;
                    break;
                case 2://三留
                    $outArr[$useCreateDay]['guildLiucun3']++;
                    break;
                case 6://七留
                    $outArr[$useCreateDay]['guildLiucun7']++;
                    break;
                case 13://十四留
                    $outArr[$useCreateDay]['guildLiucun14']++;
                    break;
                case 29://三十留
                    $outArr[$useCreateDay]['guildLiucun30']++;
                    break;
            }
        }
    }
    $result->free();
//    echo '<pre>';
//    print_r($outArr);
//    echo '</pre>';
//    exit();

    echo '<table border="1px" cellspacing="1"><tr>
        <td>日期</td>
        <td>总创角</td>
        <td>新号创角</td> 
        <td>老号创角</td>
        <td>总充值数</td> 
        <td>入行会用户数</td>
        <td>入行会用户次留</td>
        <td>入行会用户3留</td>
        <td>入行会用户7留</td>
        <td>入行会用户14留</td>
        <td>入行会用户30留</td>
    </tr>';
    foreach($outArr as $day=>$v){
        echo "<tr>";
        echo "<td>" . $day . "</td>";
        echo "<td>" . $v['createRoleNum'] . "</td>";
        echo "<td>" . $v['newAccountCreateRoleNum'] . "</td>";
        echo "<td>" . $v['oldAccountCreateRoleNum'] . "</td>";
        echo "<td>" . $v['totalPay'] . "元</td>";
        echo "<td>" . $v['joinGuildRoleNum'] . "</td>";
//        $day2 = date("Y-m-d",strtotime("+1 day",strtotime($day)));
//        $day3 = date("Y-m-d",strtotime("+2 day",strtotime($day)));
//        $day7 = date("Y-m-d",strtotime("+6 day",strtotime($day)));
//        $day14 = date("Y-m-d",strtotime("+13 day",strtotime($day)));
//        $day30 = date("Y-m-d",strtotime("+29 day",strtotime($day)));
//        $rate_liucun2 = sprintf("%.4f", $outArr[$day2]['hasGuildPersonLoginNum']/$v['joinGuildRoleNum'])*100;
//        $rate_liucun3 = sprintf("%.4f", $outArr[$day3]['hasGuildPersonLoginNum']/$v['joinGuildRoleNum'])*100;
//        $rate_liucun7 = sprintf("%.4f", $outArr[$day7]['hasGuildPersonLoginNum']/$v['joinGuildRoleNum'])*100;
//        $rate_liucun14 = sprintf("%.4f", $outArr[$day14]['hasGuildPersonLoginNum']/$v['joinGuildRoleNum'])*100;
//        $rate_liucun30 = sprintf("%.4f", $outArr[$day30]['hasGuildPersonLoginNum']/$v['joinGuildRoleNum'])*100;
        $rate_liucun2 = sprintf("%.4f", $v['guildLiucun2']/$v['joinGuildRoleNum'])*100;
        $rate_liucun3 = sprintf("%.4f", $v['guildLiucun3']/$v['joinGuildRoleNum'])*100;
        $rate_liucun7 = sprintf("%.4f", $v['guildLiucun7']/$v['joinGuildRoleNum'])*100;
        $rate_liucun14 = sprintf("%.4f", $v['guildLiucun14']/$v['joinGuildRoleNum'])*100;
        $rate_liucun30 = sprintf("%.4f", $v['guildLiucun30']/$v['joinGuildRoleNum'])*100;
        echo "<td>" .$rate_liucun2. "%</td>";
        echo "<td>" .$rate_liucun3. "%</td>";
        echo "<td>" .$rate_liucun7. "%</td>";
        echo "<td>" .$rate_liucun14. "%</td>";
        echo "<td>" .$rate_liucun30. "%</td>";
        echo "</tr>";
    }
    echo '</table>';






}
?>

</body>
</html>