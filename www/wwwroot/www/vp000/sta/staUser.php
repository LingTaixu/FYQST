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
    <title>玩家充值统计-绯雨骑士团</title>
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
    </style>
</head>

<body>
<div>
    <form action="" method="post" autocomplete="off">
        <ul>
            <li>查询账号<input type="text" name="u" autocomplete="off"/></li>
            <li>查询密码<input type="password" name="p" autocomplete="off"/></li>
            <li><input type="submit" name="s" value="查询"/></li>
        </ul>
        <input type="hidden" name='search' value="search"/>
    </form>
</div>

<?php
if ($_REQUEST && $_REQUEST['search'] == "search") {
    $u = $_REQUEST['u'];
    $p = $_REQUEST['p'];
    if (!($u == 'mmobay' && $p == 'aaaa1111') && !($u == 'sta' && $p == '201*')) {
        echo '账号或密码错误！';
        exit();
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
    //获取开服的服务器列表
    $sql = "select id,serverId  from uw_server_info where serverDate < now()";
    $result = $ttf_login->query($sql);
    while ($row = $result->fetch_assoc()) {
        $gameServerArr[] =  $row['serverId'];
    }
    $result->free();
    ////$gameServerArr = [1,2,3,4,5,6,7];//login_log表未创建报错  临时写死

    //账号表存入缓存 用来判断是否老号
    $sql = "select id,channelId,DATE_FORMAT(createTime,'%Y-%m-%d') day,userServers,sdkChannelId from uw_account";
    $result = $ttf_login->query($sql);
    while ($row = $result->fetch_assoc()) {
        $cache_account[$row['id']] =  $row;
    }
    $result->free();
    //=========================================================统计=========================================================
    echo '<br />统计'.$gameServerArr[0].'-'.$gameServerArr[count($gameServerArr)-1].'服数据';

    //------------------------------------------------------------------------------------------------------------------------
    foreach($gameServerArr as $key=>$game_sid){
        $dbname= $db_game.$game_sid;
        //echo '<br />查询'.$dbname;
        $ttf_game->select_db($dbname);
        $sql = "select id,accountId,DATE_FORMAT(createTime,'%Y-%m-%d') day,lastUpdateTime,nickName from uw_user where accountId !=0";
        $result = $ttf_game->query($sql);
        //用户表缓存
        //$cache_user = [];
        while ($row = $result->fetch_assoc()) {
            $cache_user[$row['id']] = $row;
        }
        $result->free();
    }

    //充值金额
    //| id | accountId | userId  | serverId | rechargeId | status | addTime             | transId | goodsId | orderNo           | gmStatus | lvl  | goodsPrice | feeMoney |
    $sql = "select accountId,userId,goodsId,DATE_FORMAT(addTime,'%Y-%m-%d') day,goodsPrice from uw_recharge_request where status in(1,2)";
    $result = $ttf_main->query($sql);
    while($row = $result->fetch_assoc()) {
        $price = $row['goodsPrice'];
        //$price = $CONFIG_RECHARGE[$row['goodsId']]['cost'];
        $rechargeRank[$row['userId']]['totalChargeNum'] += $price;
        $rechargeRank[$row['userId']]['accountId'] = $row['accountId'];
        $rechargeRank[$row['userId']]['userId'] = $row['userId'];
        $rechargeRank[$row['userId']]['nickName'] = $cache_user[$row['userId']]['nickName'];
    }
    $result->free();

    echo '<table border="1px" cellspacing="1"><tr>
        <td>账号ID</td>
        <td>userId</td>
        <td>玩家名</td>
        <td>总充值金额</td> 
    </tr>';
    array_multisort(array_column($rechargeRank,'totalChargeNum'),SORT_DESC,$rechargeRank);
    foreach($rechargeRank as $k=>$v){
        echo "<tr>";
        echo "<td>". $v['accountId'] ."</td>";//userID
        echo "<td>". $v['userId'] ."</td>";//userID
        echo "<td>". $v['nickName'] ."</td>";//userID
        echo "<td>". $v['totalChargeNum'] ."</td>";//userID
        echo "</tr>";
    }
    echo '</table>';
}
?>

</body>
</html>
