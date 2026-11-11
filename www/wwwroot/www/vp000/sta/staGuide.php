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
    <title>引导数据统计-绯雨骑士团</title>
    <meta name="keywords" content="绯雨骑士团统计-魔贝网络"/>
    <meta name="description" content="绯雨骑士团统计-魔贝网络"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="author" content="">
    <script src="../assets/lib/jquery-1.8.1.min.js" ></script>
    <style type="text/css">
        .award_input {
            width: 50px;
        }
        .award_del {
            cursor: pointer;
        }
        .w30 {
            width: 30px;
        }
        table thead tr{background: #bbffd3;}
        table tbody tr:nth-child(odd){background: #eff8ff;}
        table td{white-space:nowrap;}
    </style>
</head>

<body>
<?php
    $CONFIG_GUIDE = [
        'init'=>['step'=>0,'desc'=>'第一关BOSS'],
        '10000_0'=>['step'=>1,'desc'=>'点击挑战','bigStepDesc'=>'第一关BOSS' ],

        '10001_0'=>['step'=>2,'desc'=>'点击角色','bigStepDesc'=>'穿装备'],
        '10001_1'=>['step'=>3,'desc'=>'选择第一个英雄','bigStepDesc'=>'穿装备'],
        '10001_2'=>['step'=>4,'desc'=>'选择部位','bigStepDesc'=>'穿装备'],
        '10001_3'=>['step'=>5,'desc'=>'选择装备','bigStepDesc'=>'穿装备'],


        '10002_0'=>['step'=>6,'desc'=>'点击挑战','bigStepDesc'=>'第二关BOSS' ],
        '10002_10000'=>['step'=>7,'desc'=>'引导完毕','bigStepDesc'=>'第二关BOSS' ],

        '10005_0'=>['step'=>8,'desc'=>'打造','bigStepDesc'=>'强化装备'],
        '10005_1'=>['step'=>9,'desc'=>'点击强化','bigStepDesc'=>'强化装备'],
        '10005_10000'=>['step'=>10,'desc'=>'引导完毕','bigStepDesc'=>'强化装备'],

        '10007_0'=>['step'=>11,'desc'=>'商城','bigStepDesc'=>'宠物拉霸'],
        '10007_1'=>['step'=>12,'desc'=>'宠物商人','bigStepDesc'=>'宠物拉霸'],
        '10007_2'=>['step'=>13,'desc'=>'拉霸','bigStepDesc'=>'宠物拉霸'],
        '10007_10000'=>['step'=>14,'desc'=>'引导完毕','bigStepDesc'=>'宠物拉霸'],

        '10013_0'=>['step'=>15,'desc'=>'点击成长','bigStepDesc'=>'守护精灵'],
        '10013_1'=>['step'=>16,'desc'=>'点击守护精灵','bigStepDesc'=>'守护精灵'],
        '10013_2'=>['step'=>17,'desc'=>'点击激活','bigStepDesc'=>'守护精灵'],
        '10013_3'=>['step'=>18,'desc'=>'点击高级培养','bigStepDesc'=>'守护精灵'],
        '10013_10000'=>['step'=>19,'desc'=>'引导完毕','bigStepDesc'=>'守护精灵'],

        '10011_0'=>['step'=>20,'desc'=>'点击PK','bigStepDesc'=>'PK'],
        '10011_10000'=>['step'=>21,'desc'=>'引导完毕','bigStepDesc'=>'PK'],

        '10075_0'=>['step'=>22,'desc'=>'点击成就','bigStepDesc'=>'成就'],
        '10075_1'=>['step'=>23,'desc'=>'点击完成','bigStepDesc'=>'成就'],
        '10075_2'=>['step'=>24,'desc'=>'点击提升段位','bigStepDesc'=>'成就'],
        '10075_10000'=>['step'=>25,'desc'=>'引导完毕','bigStepDesc'=>'成就'],

        '10015_0'=>['step'=>26,'desc'=>'点击副本','bigStepDesc'=>'史莱姆逆袭'],
        '10015_1'=>['step'=>27,'desc'=>'点击史莱姆逆袭','bigStepDesc'=>'史莱姆逆袭'],
        '10015_2'=>['step'=>28,'desc'=>'点击黑暗溶洞-1','bigStepDesc'=>'史莱姆逆袭'],
        '10015_3'=>['step'=>29,'desc'=>'点击进入','bigStepDesc'=>'史莱姆逆袭'],
        '10015_10000'=>['step'=>30,'desc'=>'引导完毕','bigStepDesc'=>'史莱姆逆袭'],

        '10017_0'=>['step'=>31,'desc'=>'点击角色','bigStepDesc'=>'符文系统'],
        '10017_1'=>['step'=>32,'desc'=>'点击觉醒','bigStepDesc'=>'符文系统'],
        '10017_2'=>['step'=>33,'desc'=>'点击一键装备','bigStepDesc'=>'符文系统'],
        '10017_3'=>['step'=>34,'desc'=>'点击角色觉醒','bigStepDesc'=>'符文系统'],
        '10017_10000'=>['step'=>35,'desc'=>'引导完毕','bigStepDesc'=>'符文系统'],

        '10079_0'=>['step'=>36,'desc'=>'点击组队副本','bigStepDesc'=>'组队副本'],
        '10079_1'=>['step'=>37,'desc'=>'点击第一个BOSS','bigStepDesc'=>'组队副本'],
        '10079_2'=>['step'=>38,'desc'=>'点击进入组队','bigStepDesc'=>'组队副本'],
        '10079_10000'=>['step'=>39,'desc'=>'引导完毕','bigStepDesc'=>'组队副本'],

        '10019_0'=>['step'=>40,'desc'=>'点击打造','bigStepDesc'=>'装备升星'],
        '10019_1'=>['step'=>41,'desc'=>'点击升星选项卡','bigStepDesc'=>'装备升星'],
        '10019_2'=>['step'=>42,'desc'=>'点击升星','bigStepDesc'=>'装备升星'],
        '10019_10000'=>['step'=>43,'desc'=>'引导完毕','bigStepDesc'=>'装备升星'],

        '10023_0'=>['step'=>44,'desc'=>'点击副本','bigStepDesc'=>'守卫女神'],
        '10023_1'=>['step'=>45,'desc'=>'点击守卫女神副本','bigStepDesc'=>'守卫女神'],
        '10023_2'=>['step'=>46,'desc'=>'点击前往击杀','bigStepDesc'=>'守卫女神'],
        '10023_10000'=>['step'=>47,'desc'=>'引导完毕','bigStepDesc'=>'守卫女神'],

        '10025_0'=>['step'=>48,'desc'=>'点击打造','bigStepDesc'=>'宝石升级'],
        '10025_1'=>['step'=>49,'desc'=>'点击宝石','bigStepDesc'=>'宝石升级'],
        '10025_2'=>['step'=>50,'desc'=>'点击升级','bigStepDesc'=>'宝石升级'],
        '10025_10000'=>['step'=>51,'desc'=>'引导完毕','bigStepDesc'=>'宝石升级'],

        '10027_0'=>['step'=>52,'desc'=>'点击主城','bigStepDesc'=>'公会'],
        '10027_1'=>['step'=>53,'desc'=>'点击行会','bigStepDesc'=>'公会'],
        '10027_10000'=>['step'=>54,'desc'=>'引导完毕','bigStepDesc'=>'公会'],

        '10077_0'=>['step'=>55,'desc'=>'点击佣兵','bigStepDesc'=>'佣兵'],
        '10077_1'=>['step'=>56,'desc'=>'点击雇佣1','bigStepDesc'=>'佣兵'],
        '10077_2'=>['step'=>57,'desc'=>'点击雇佣2','bigStepDesc'=>'佣兵'],
        '10077_10000'=>['step'=>58,'desc'=>'引导完毕','bigStepDesc'=>'佣兵'],


        '10021_0'=>['step'=>59,'desc'=>'点击主城','bigStepDesc'=>'竞技场'],
        '10021_1'=>['step'=>60,'desc'=>'点击竞技场','bigStepDesc'=>'竞技场'],
        '10021_2'=>['step'=>61,'desc'=>'点击挑战','bigStepDesc'=>'竞技场'],
        '10021_10000'=>['step'=>62,'desc'=>'引导完毕','bigStepDesc'=>'竞技场'],

        '10009_0'=>['step'=>63,'desc'=>'点击成长','bigStepDesc'=>'宠物升级'],
        '10009_1'=>['step'=>64,'desc'=>'点击宠物扭蛋','bigStepDesc'=>'宠物升级'],
        '10009_2'=>['step'=>65,'desc'=>'点击宠物','bigStepDesc'=>'宠物升级'],
        '10009_3'=>['step'=>66,'desc'=>'点击升级宠物','bigStepDesc'=>'宠物升级'],
        '10009_4'=>['step'=>67,'desc'=>'点击升级','bigStepDesc'=>'宠物升级'],
        '10009_10000'=>['step'=>68,'desc'=>'引导完毕','bigStepDesc'=>'宠物升级'],

        '10029_0'=>['step'=>69,'desc'=>'点击成长','bigStepDesc'=>'第二职业'],
        '10029_1'=>['step'=>70,'desc'=>'点击开启新职业','bigStepDesc'=>'第二职业'],
        '10029_10000'=>['step'=>71,'desc'=>'引导完毕','bigStepDesc'=>'第二职业'],

        '10033_0'=>['step'=>72,'desc'=>'点击主城','bigStepDesc'=>'探险系统'],
        '10033_1'=>['step'=>73,'desc'=>'点击探险','bigStepDesc'=>'探险系统'],
        '10033_2'=>['step'=>74,'desc'=>'点击挑战','bigStepDesc'=>'探险系统'],
        '10033_10000'=>['step'=>75,'desc'=>'引导完毕','bigStepDesc'=>'探险系统'],

        '10031_0'=>['step'=>76,'desc'=>'点击成长','bigStepDesc'=>'女仆咖啡店'],
        '10031_1'=>['step'=>77,'desc'=>'点击女仆咖啡店','bigStepDesc'=>'女仆咖啡店'],
        '10031_2'=>['step'=>78,'desc'=>'点击领取收益','bigStepDesc'=>'女仆咖啡店'],
        '10031_3'=>['step'=>79,'desc'=>'点击招揽生意','bigStepDesc'=>'女仆咖啡店'],
        '10031_4'=>['step'=>80,'desc'=>'点击开始接客','bigStepDesc'=>'女仆咖啡店'],
        '10031_5'=>['step'=>81,'desc'=>'点击关闭','bigStepDesc'=>'女仆咖啡店'],
        '10031_6'=>['step'=>82,'desc'=>'点击店铺装修','bigStepDesc'=>'女仆咖啡店'],
        '10031_7'=>['step'=>83,'desc'=>'点击装修店铺','bigStepDesc'=>'女仆咖啡店'],
        '10031_8'=>['step'=>84,'desc'=>'点击女仆升级','bigStepDesc'=>'女仆咖啡店'],
        '10031_9'=>['step'=>85,'desc'=>'点击女仆培养','bigStepDesc'=>'女仆咖啡店'],
        '10031_10000'=>['step'=>86,'desc'=>'引导完毕','bigStepDesc'=>'女仆咖啡店'],

        '10081_0'=>['step'=>87,'desc'=>'点击成长','bigStepDesc'=>'第三职业'],
        '10081_1'=>['step'=>88,'desc'=>'点击开启新职业','bigStepDesc'=>'第三职业'],
        '10081_10000'=>['step'=>89,'desc'=>'引导完毕','bigStepDesc'=>'第三职业'],

        '10035_0'=>['step'=>90,'desc'=>'点击成长','bigStepDesc'=>'星灵契约'],
        '10035_1'=>['step'=>91,'desc'=>'点击星灵契约','bigStepDesc'=>'星灵契约'],
        '10035_2'=>['step'=>92,'desc'=>'点击签订','bigStepDesc'=>'星灵契约'],
        '10035_10000'=>['step'=>93,'desc'=>'引导完毕','bigStepDesc'=>'星灵契约'],

        '10037_0'=>['step'=>94,'desc'=>'点击成长','bigStepDesc'=>'小队评级'],
        '10037_1'=>['step'=>95,'desc'=>'点击小队评级','bigStepDesc'=>'小队评级'],
        '10037_2'=>['step'=>96,'desc'=>'点击贿赂评审','bigStepDesc'=>'小队评级'],
        '10037_3'=>['step'=>97,'desc'=>'点击使用','bigStepDesc'=>'小队评级'],
        '10037_4'=>['step'=>98,'desc'=>'点击确定','bigStepDesc'=>'小队评级'],
        '10037_10000'=>['step'=>99,'desc'=>'引导完毕','bigStepDesc'=>'小队评级'],

    ];
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
    //$gameServerArr = [17];
?>
<div>
    <form action="" method="post" autocomplete="off">
        <?php
            if(count($gameServerArr) == count($_POST['serverArr'])){
                echo '<label><input type="checkbox" id="check_all" checked>全选<label>';
            }else{
                echo '<label><input type="checkbox" id="check_all" >全选<label>';
            }
            echo '<br />';
            foreach ($gameServerArr as $serverId){
                if(in_array($serverId,$_POST['serverArr'])){
                    echo '<label class="w30"><input name="serverArr[]" type="checkbox" value="'.$serverId.'" checked/>'.$serverId.'服<label>';
                }else{
                    echo '<label class="w30"><input name="serverArr[]" type="checkbox" value="'.$serverId.'"/>'.$serverId.'服<label>';
                }
            }
        ?>
        <br />
        <input type="submit" name="s" value="查询"/>
        <input type="hidden" name='search' value="search"/>
    </form>
</div>

<?php
if ($_REQUEST && $_REQUEST['search'] == "search") {
    $selectServerArr = $_POST['serverArr'];
    $str = '';
    foreach ($selectServerArr as $serverId){
        $str .= $serverId.',';
    }
    $str = rtrim($str, ",");
    //=========================================================统计=========================================================
    echo '<br />统计'.$str.'服数据';

    //------------------------------------------------------------------------------------------------------------------------
    $ret  = [];
    $totalNum = 0;
    foreach($selectServerArr as $key=>$game_sid){
        $dbname= $db_game.$game_sid;
        $ttf_game->select_db($dbname);
        $sql = "select id,accountId,lvl,DATE_FORMAT(createTime,'%Y-%m-%d %H:%i:%s') day,lastUpdateTime,nickName,exData from uw_user where accountId !=0";
        $result = $ttf_game->query($sql);

        while ($row = $result->fetch_assoc()) {
            $totalNum ++;
            $exDataArr = json_decode($row['exData'],true);
            if(is_array($exDataArr) && isset($exDataArr[1])){
                $guideId = $exDataArr[1];
            }else{
                $guideId = '10000_0';
            }
            $ret[$guideId]['lostNum'] ++;
            $ret[$guideId]['guideId'] = $guideId;
            $ret[$guideId][$row['lvl']] ++;
            $ret[$guideId]['step'] = $CONFIG_GUIDE[$guideId]['step'];
            if($guideId!=0 && explode('_',$guideId)[1] == '10000'){
                $ret[$guideId]['desc'] = isset($CONFIG_GUIDE[$guideId]['bigStepDesc'])?$CONFIG_GUIDE[$guideId]['bigStepDesc'].'_引导完毕':$CONFIG_GUIDE[$guideId]['desc'].'_引导完毕';
            }else{
                $ret[$guideId]['desc'] = isset($CONFIG_GUIDE[$guideId]['bigStepDesc'])?$CONFIG_GUIDE[$guideId]['bigStepDesc'].'_'.$CONFIG_GUIDE[$guideId]['desc']:$CONFIG_GUIDE[$guideId]['desc'];
            }
        }

        $result->free();
    }
    $ret['-1']=['lostNum'=>0,'1'=>$totalNum,'guideId'=>'','step'=>'-1','desc'=>'进入游戏'];
    echo '<br />引导流失数据分析,右侧为流失玩家等级分布';
    echo '<table border="1px" cellspacing="1" width="300%"><tr>
        <thead>
        <td>步骤</td>
        <td>引导号</td>
        <td>描述</td>
        <td>通过人数</td>
        <td>通过率</td>
        <td>流失人数</td>';
        for($lvl = 1;$lvl<=200;$lvl++){
            echo "<td style=\"width:100px\">". $lvl ."级</td>";
        }
    echo '</tr></thead>';
    array_multisort(array_column($ret,'step'),SORT_ASC,$ret);
    echo '<tbody>';
//echo '<pre>';
//print_r($ret);
//echo '</pre>';
//exit(0);
    foreach($ret as $k=>$v){
        echo "<tr>";
        echo "<td>". $v['step'] ."</td>";
        echo "<td>". $k ."</td>";
        echo "<td>". $v['desc'] ."</td>";
        $totalNum_2 =  $totalNum;
        $totalNum -= $v['lostNum'];
        echo "<td>". $totalNum ."</td>";//通过人数
        $passRate = sprintf("%.4f", $totalNum/$totalNum_2)*100;
        echo "<td>". $passRate."%</td>";
        echo "<td>". $v['lostNum'] ."</td>";
        for($lvl = 1;$lvl<=200;$lvl++){
            $lvl_num = isset($v[$lvl])?$v[$lvl]:'';
            if($lvl_num != 0){
                echo "<td><span style=\"color:#FF0000\">". $lvl_num ."</span></td>";
            }else{
                echo "<td>". $lvl_num ."</td>";
            }

        }
        echo "</tr>";
    }
    echo '</tbody>';
    echo '</table>';
}
?>

</body>
</html>

<script>
    $("#check_all").click(function(){
        if(this.checked){
            $("input[name='serverArr[]']").prop("checked",true);
        }else{
            $("input[name='serverArr[]']").prop("checked",false);
        }
    });
</script>