<?php
date_default_timezone_set("Asia/Shanghai");
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . "GMT");
header("Cache-Control: no-cache, must-revalidate");
header("Pragma: no-cache");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta charset="utf-8">
    <!-- Title and other stuffs -->
    <title>引导数据统计-绯雨骑士团</title>
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

        table thead tr {
            background: #bbffd3;
        }

        table tbody tr:nth-child(odd) {
            background: #eff8ff;
        }

    </style>
</head>

<body>
<div>
    <form action="" method="post" autocomplete="off">
        <ul>
            <!--            <li>查询账号<input type="text" name="u" autocomplete="off"/></li>-->
            <li>玩家ID<input type="text" name="userId" autocomplete="off"/></li>
            <li><input type="submit" name="s" value="查询"/></li>
        </ul>
        <input type="hidden" name='search' value="search"/>
    </form>
</div>

<?php
//$file = fopen("guide_record.log", "r");
$file = fopen("/data/logs/guide_record.log", "r");
//输出文本中所有的行，直到文件结束为止。
while (!feof($file)) {
    $data[] = fgets($file);//fgets()函数从文件指针中读取一行
}
fclose($file);
$data = array_filter($data);

if ($_REQUEST && $_REQUEST['search'] == "search") {
    $userId = $_REQUEST['userId'];
    foreach ($data as $k => $v) {
        $row = explode('|', $v);
        if ($row[2] == $userId) {
            $ret[] = $row;
        }
    }

    echo '<table border="1px" cellspacing="1">
        <thead>
        <tr>
        <td>类型</td>
        <td>区服</td>
        <td>userId</td>
        <td>等级</td>
        <td>客户端时间</td>
        <td>服务器时间</td>
        <td>mapID</td>
        <td>引导号</td>
        <td>引导圈X坐标</td>
        <td>引导圈Y坐标</td>';

    echo '</tr></thead>';
    //array_multisort(array_column($ret,'guideId'),SORT_ASC,$ret);
    echo '<tbody>';
    foreach ($ret as $k => $v) {
        echo "<tr>";

        $type = $v[0];
        $serverId = $v[1];
        $userId = $v[2];
        $lvl = $v[3];
        $clientTime = '';
        $serverTime = '';
        $mapID = '';
        $guideId = '';
        $guide_x = '';
        $guide_y = '';
        switch ($type){
            case 'guide_appear':
                $guideId = $v[4];
                $guide_x = 'x:'.$v[5];
                $guide_y = 'y:'.$v[6];
                $clientTime =  date("Y-m-d H:i:s", $v[7]/1000);
                $serverTime =  date("Y-m-d H:i:s", $v[8]/1000);
                break;
            case 'prepareCopyRes':
                $clientTime =  date("Y-m-d H:i:s", $v[4]/1000);
                $serverTime =  date("Y-m-d H:i:s", $v[5]/1000);
                break;
            case 'enterMap':
                $mapID = 'mapID:'.$v[4];
                $clientTime =  date("Y-m-d H:i:s", $v[5]/1000);
                $serverTime =  date("Y-m-d H:i:s", $v[6]/1000);
                break;
            default:
                $clientTime =  date("Y-m-d H:i:s", $v[4]/1000);
                $serverTime =  date("Y-m-d H:i:s", $v[5]/1000);
                break;
                break;
        }

        echo "<td>" . $type . "</td>";
        echo "<td>" . $serverId . "</td>";
        echo "<td>" . $userId . "</td>";
        echo "<td>" . $lvl . "</td>";

        echo "<td>" . $clientTime . "</td>";
        echo "<td>" . $serverTime . "</td>";
        echo "<td>" . $mapID . "</td>";
        echo "<td>" . $guideId . "</td>";
        echo "<td>" . $guide_x . "</td>";
        echo "<td>" . $guide_y . "</td>";


        echo "</tr>";
    }
    echo '</tbody>';
    echo '</table>';
}
?>
</body>
</html>