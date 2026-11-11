<?php
date_default_timezone_set("Asia/Shanghai");
ini_set('memory_limit','1024M');
ini_set('display_errors','On');
$startMemory = memory_get_usage();
$startTime = time();
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
    <title>111</title>
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

<?php
    $host = $CONFIG_DB['host'];
    $port = $CONFIG_DB['port'];
    $user = $CONFIG_DB['user'];
    $pwd = $CONFIG_DB['pwd'];

    $db_game = $CONFIG_DB['db_game'];//uw_user
    //------------------------------------------------------------ttf_game------------------------------------------------------------
    $ttf_game = new mysqli($host, $user, $pwd);
    $ttf_game->autocommit(true);
    $ttf_game->set_charset('utf8');

    $gameServerArr = [75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95];//login_log表未创建报错  临时写死

    //-----------------------------------------------------------遍历所有游戏服-------------------------------------------------------------
    foreach($gameServerArr as $key=>$game_sid){
        $dbname= $db_game.$game_sid;
        //echo '<br />查询'.$dbname;
        $ttf_game->select_db($dbname);
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++总创角+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        $sql = "select * from uw_fivedays_rank";
        $result = $ttf_game->query($sql);
        while ($row = $result->fetch_assoc()) {
//            print_r($row);
            $outArr[$game_sid][] = $row;
        }
        $result->free();
    }

    echo '<br />新服竞赛结算数据'.$gameServerArr[0].'-'.$gameServerArr[count($gameServerArr)-1].'服数据';
//     id | userId  | userName               | iconId | userLvl | pkWinCount | combat | rankType | rankValue |
    $rankType = [
        1=> '等级榜',
        2=> '总战榜',
        3=> '财富榜',
        4=> '精灵战力',
        5=> 'PK榜',
        6=> '竞技榜',
        7=> '战神榜',
        8=> '法神榜',
        9=> '道尊榜',
        10=> '公会等级榜',
        11=> '公会战力榜',
        12=> '会长战力榜',
        13=> '探险榜',
        14=> 'tap榜',
        15=> '成就榜',
        16=> '宠物收集榜',
        17=> '勋章收集榜',
        18=> '关卡进度榜',
        19=> '宠物战力榜',
        20=> '角色宝石',
        21=> '符文榜',
        22=> '人物收集榜',
        23=> '神圣装备战力榜',
        24=> '伙伴战力榜',
        25=> '小队评级榜'
    ];
    foreach($outArr as $k=>$sData){
        echo "<table border='1px' cellspacing='1'>
            <thead><tr><td colspan='10'>".$k."服</td></tr></thead>
            <tr>
                <td>id</td>
                <td>userId</td>
                <td>userName</td>
                <td>iconId</td>
                <td>userLvl</td>
                <td>pkWinCount</td>
                <td>combat</td>
                <td>rankType</td>
                <td>rankValue</td>
            </tr>";
        foreach($sData as $k1=>$row){
            echo "<tr>";
            echo "<td>".$row['id']."</td>";
            echo "<td>".$row['userId']."</td>";
            echo "<td>".$row['userName']."</td>";
            echo "<td>".$row['iconId']."</td>";
            echo "<td>".$row['userLvl']."</td>";
            echo "<td>".$row['pkWinCount']."</td>";
            echo "<td>".$row['combat']."</td>";
            echo "<td>".$rankType[$row['rankType']]."</td>";
            echo "<td>".$row['rankValue']."</td>";
            echo "</tr>";
        }
        echo '</table>';
        echo '<br />';
    }

//    $costTime = time() - $startTime;
//    $costM = memory_get_usage() - $startMemory;
//    echo '耗时：'.$costTime.'内存使用:'.$costM;
?>

</body>
</html>
