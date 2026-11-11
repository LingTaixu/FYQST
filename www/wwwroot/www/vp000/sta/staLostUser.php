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
    <title>48小时未登录流失玩家数据统计-绯雨骑士团</title>
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
$achieveCfg = [
    1=>5,
    2=>100,
    3=>300,
    4=>600,
    5=>900,
    6=>1800,
    7=>3600
];
function getTotalAchieveExp($lvl,$exp){
    global $achieveCfg;
    $totalAchieveExp = $exp;
    for($i=1;$i<=$lvl;$i++){
        $totalAchieveExp += $achieveCfg[$i];
    }
    return $totalAchieveExp;
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


    //针对领取打赏礼包的流失用户（累计超过48小时没登录服务器的账户）数据进行分析挖掘，
    //找到流失点和突破点：每天统计1次【等级、钻石存量、关卡数、探险层数、成就点数、战力：小队总战力、宠物总战力、称号总战力【全部计算平均值】】
    //-----------------------------------------------------------遍历所有游戏服-------------------------------------------------------------
    foreach($gameServerArr as $key=>$game_sid){
        $dbname= $db_game.$game_sid;
        //echo '<br />查询'.$dbname;
        $ttf_game->select_db($dbname);

        //找出48小时内 没登录过的
        $hour48 = time() - 2*24*60*60;// 1516441755
//        $sql = "select id,accountId,lastUpdateTime,nickName,lvl,diamond,highPaTa,achieveLvl,achieveExp,combat,activity from uw_user where accountId !=0 and UNIX_TIMESTAMP(lastUpdateTime) < ".$hour48;
        $sql = "select id,accountId,DATE_FORMAT(createTime,'%Y-%m-%d') createDay,lastUpdateTime,serverId,nickName,lvl,diamond,highPaTa,achieveLvl,achieveExp,combat,activity from uw_user where accountId !=0 and UNIX_TIMESTAMP(lastUpdateTime) < ".$hour48." group by DATE_FORMAT(createTime,'%Y-%m-%d'),id order by createTime asc";

        $result = $ttf_game->query($sql);
        while ($row = $result->fetch_assoc()) {
            $row['activity'] = json_decode($row['activity'],true);
            //过滤掉没领取过打赏礼包的
            if(!isset($row['activity'][1]) || $row['activity'][1][0] != 1){
                continue;
            }
            //计算总成就点
            $row['totalAchieveExp'] = getTotalAchieveExp($row['achieveLvl'],$row['achieveExp']);
            //用户表缓存
            $cache_user[$row['id']] = $row;
        }
        $result->free();

        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++关卡数+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        $sql = "select userId,copyObj from uw_copy_progress where copyType = 0";
        $result = $ttf_game->query($sql);
        while ($row = $result->fetch_assoc()) {
            $row['copyObj'] = json_decode($row['copyObj'],true);//maxCopyProgress
            $arrKeys = array_keys($row['copyObj']);
//            print_r($arrKeys);
            $maxCopyNum = $arrKeys?end($arrKeys):1;
            //userId 对应最大 关卡数
            $cache_copy_progress[$row['userId']] = $maxCopyNum;

        }
        $result->free();
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++宠物总战力+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        $sql = "select userId,tempId,talismanNum,talismanCombat from uw_hero";
        $result = $ttf_game->query($sql);
        while ($row = $result->fetch_assoc()) {
            if($row['talismanCombat'] != NULL){
                //userId 对应 宠物总战力
                $cache_talismanCombat[$row['userId']] += $row['talismanCombat'];
            }
        }
        $result->free();
    }


    //等级、钻石存量、关卡数、探险层数、成就点数、战力：小队总战力、宠物总战力、称号总战力【全部计算平均值】
    foreach($cache_user as $userId=>$userData){
        $outArr[$userData['createDay']]['day'] = strtotime($userData['createDay']);
        $outArr[$userData['createDay']]['total_lvl'] += $userData['lvl'];
        $outArr[$userData['createDay']]['total_diamond'] += $userData['diamond'];
        $outArr[$userData['createDay']]['total_maxCopyNum'] += $cache_copy_progress[$userId];
        $outArr[$userData['createDay']]['total_highPaTa'] += $userData['highPaTa'];
        $outArr[$userData['createDay']]['total_totalAchieveExp'] += $userData['totalAchieveExp'];
        $outArr[$userData['createDay']]['total_combat'] += $userData['combat'];
        $outArr[$userData['createDay']]['total_talismanCombat'] += $cache_talismanCombat[$userId];
        $outArr[$userData['createDay']]['userNum'] ++;
        $total_lvl += $userData['lvl'];
        $total_diamond += $userData['diamond'];
        $total_maxCopyNum += $cache_copy_progress[$userId];
        $total_highPaTa += $userData['highPaTa'];
        $total_totalAchieveExp += $userData['totalAchieveExp'];
        $total_combat += $userData['combat'];
        $total_talismanCombat += $cache_talismanCombat[$userId];
        $userNum++;
    }

    array_multisort(array_column($outArr,'day'),SORT_ASC,$outArr);
//    echo '<pre>';
//    print_r($outArr);
//    echo '</pre>';
//    exit();
    echo "<br />领取打赏礼包的流失用户（累计超过48小时没登录服务器的账户）数据分析";
    echo '<table border="1px" cellspacing="1">
    <tr>
        <td colspan="10" style="text-align: center">总计</td>
    </tr>
    <tr>
        <td>玩家数</td>
        <td>平均等级</td>
        <td>平均钻石存量</td>
        <td>平均关卡数</td> 
        <td>平均探险层数</td>
        <td>平均成就点数</td> 
        <td>平均总战力</td>
        <td>平均宠物总战力</td>
    </tr>';
    echo "<tr>";
    echo "<td>".$userNum."</td>";
    echo "<td>" . floor($total_lvl/$userNum) . "</td>";
    echo "<td>" . floor($total_diamond/$userNum) . "</td>";
    echo "<td>" . floor($total_maxCopyNum/$userNum) . "</td>";
    echo "<td>" . floor($total_highPaTa/$userNum) . "</td>";
    echo "<td>" . floor($total_totalAchieveExp/$userNum) . "</td>";
    echo "<td>" . floor($total_combat/$userNum) . "</td>";
    echo "<td>" . floor($total_talismanCombat/$userNum) . "</td>";
    echo "</tr>";
    echo '</table>';


    echo "<br />";
    echo '<table border="1px" cellspacing="1"><tr>
        <td>日期</td>
        <td>玩家数</td>
        <td>平均等级</td>
        <td>平均钻石存量</td>
        <td>平均关卡数</td> 
        <td>平均探险层数</td>
        <td>平均成就点数</td> 
        <td>平均总战力</td>
        <td>平均宠物总战力</td>
    </tr>';
    foreach($outArr as $day=>$data){
        echo "<tr>";
        echo "<td>".$day."</td>";
        echo "<td>".$data['userNum']."</td>";
        echo "<td>" . floor($data['total_lvl']/$data['userNum']) . "</td>";
        echo "<td>" . floor($data['total_diamond']/$data['userNum']) . "</td>";
        echo "<td>" . floor($data['total_maxCopyNum']/$data['userNum']) . "</td>";
        echo "<td>" . floor($data['total_highPaTa']/$data['userNum']) . "</td>";
        echo "<td>" . floor($data['total_totalAchieveExp']/$data['userNum']) . "</td>";
        echo "<td>" . floor($data['total_combat']/$data['userNum']) . "</td>";
        echo "<td>" . floor($data['total_talismanCombat']/$data['userNum']) . "</td>";
        echo "</tr>";
    }

    echo '</table>';


    //-------------------------明细---------------------------
    echo "<br />";

    echo '<table border="1px" cellspacing="1">
    <tr>
        <td colspan="12" style="text-align: center">-------------------------明细---------------------------</td>
    </tr>
    <tr>
        <td>日期</td>
        <td>区服</td>
        <td>玩家名</td>
        <td>等级</td>
        <td>钻石</td>
        <td>关卡数</td> 
        <td>探险层数</td>
        <td>成就点数</td> 
        <td>总战力</td>
        <td>宠物总战力</td>
        <td>最后登录时间</td>
    </tr>';
    foreach($cache_user as $userId=>$userData){
        echo "<tr>";
        echo "<td>".$userData["createDay"]."</td>";
        echo "<td>".$userData["serverId"]."</td>";
        echo "<td>".$userData["nickName"]."</td>";
        echo "<td>" . $userData["lvl"] . "</td>";
        echo "<td>" . $userData["diamond"] . "</td>";
        echo "<td>" . $cache_copy_progress[$userId] . "</td>";
        echo "<td>" . $userData["highPaTa"] . "</td>";
        echo "<td>" . $userData['totalAchieveExp'] . "</td>";
        echo "<td>" . $userData['combat'] . "</td>";
        echo "<td>" . $cache_talismanCombat[$userId] . "</td>";
        echo "<td>" . $userData['lastUpdateTime'] . "</td>";
        echo "</tr>";
    }

    echo '</table>';
    $useTime = time() - $startTime;
    echo '<br/>耗时'.$useTime.'秒';
}
?>

</body>
</html>