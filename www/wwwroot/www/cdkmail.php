<?php
include_once "config.php";
$rechargeId = $_GET['rechargeId'];
$cdkey = $_GET['cdkey'];
			$item1 =$_POST['item1'];
			$item2 =$_POST['item2'];
			$item3 =$_POST['item3'];
			$item4 =$_POST['item4'];
			$item5 =$_POST['item5'];
@mysql_select_db($gmdb,$conn) or die ("table not exits");
mysql_query("set names UTF8"); 
$sql="select * from `cdkey` where `cdkey`='$cdkey' limit 1";
$result=mysql_query($sql);
$row=mysql_fetch_array($result);
if($row['isuse']!='未使用'){
	echo "<script>alert('系统提示：此激活码已使用！');history.go(-1)</script>";
	exit;
}
if($row['status']!=$rechargeId){
	echo "<script>alert('系统提示：订单出错！');history.go(-1)</script>";
	exit;
}

switch($rechargeId){
	case '1':      //6元
		$items = '{\"200\":30000,\"99\":10000000}';
		$czitem = '钻石：3W，金币：1000W';
		break;
	case '2':      //12元
		$items = '{\"200\":60000,\"99\":15000000}';
		$czitem = '钻石：6W，金币：1500W';
		break;
	case '3':      //30元
		$items = '{\"200\":150000,\"99\":20000000,\"'.$item1.'\":1,\"5001\":2000}';
		$czitem = '钻石：15W，金币：2000W ,物品：任选SSR人物*1个,C级人物果实*2000个,';
		break;
	case '4':      //98元
		$items = '{\"200\":600000,\"99\":30000000,\"'.$item1.'\":1,\"'.$item2.'\":1,\"5001\":4000,\"100222\":5999}';
		$czitem = '钻石：60W，金币：3000W ,物品：任选SSS宠物*1个,任选SSR人物*1个,C级人物果实*4000个,魔魂之尘*5999个';
		break;
	case '5':      //198元
		$items = '{\"200\":1000000,\"99\":50000000,\"'.$item1.'\":1,\"'.$item2.'\":1,\"'.$item3.'\":1,\"5001\":6000,\"950\":5000}';
		$czitem = '钻石：100W，金币：5000W ,物品：任选SSS宠物*1个,任选SSR人物*2个,C级人物果实*6000个,深渊魔石*5000个';
		break;
	case '6':      //498元
		$items = '{\"200\":3000000,\"99\":65000000,\"'.$item1.'\":1,\"'.$item2.'\":1,\"'.$item3.'\":1,\"'.$item4.'\":1,\"5002\":5000,\"100222\":9999,\"46\":999}';
		$czitem = '钻石：300W，金币：6500W ,物品：任选SSS宠物*2个,任选SSR人物*2个,B级人物果实*5000个,魔魂之尘*9999个,XX型经验药水*999';
		break;
	case '7':      //988元
		$items = '{\"200\":6000000,\"99\":200000000,\"'.$item1.'\":1,\"'.$item2.'\":1,\"'.$item3.'\":1,\"'.$item4.'\":1,\"'.$item5.'\":1,\"1100250\":1,\"1200250\":1,\"944\":999,\"948\":999,\"45\":999}';
		$czitem = '钻石：600W，金币：2亿 ,物品：任选SSS宠物3个,任选SSR人物2个,4星100级天使1个和小恶魔1个,A级经验徽章*999个,A级经验法典*999个,拿铁咖啡*999个';
		break;
	case '31':      //58元 
		$items = '{\"200\":400000,\"99\":20000000,\"'.$item1.'\":1,\"'.$item2.'\":1,\"5001\":3000}';
		$czitem = '钻石：40W，金币：2000W ,物品：任选SSS宠物*1个,任选SSR人物*1个,C级人物果实*3000个';
		break;
	default:
		$items = '{\"200\":20000,\"99\":900000}'; 
		$czitem = '钻石：2W，金币：90W';
		break; 
}
if ($_POST){	
	switch ($_POST['submit']){	
		case 'mail':	
			$name=$_POST['name'];
			$sid = substr($name,1,1);
			if($sid==1){   //一区
				$dbgame='ttf_ly_game1';
			}elseif($sid==2){ //二区
				$dbgame='ttf_ly_game2';
			}elseif($sid==3){ //三区
				$dbgame='ttf_ly_game3';
			}elseif($sid==4){ //四区
				$dbgame='ttf_ly_game4';
			}
			@mysql_select_db($dbgame,$conn) or die ("table not exits");
			mysql_query("set names UTF8"); 
			$sql1="SELECT * FROM `uw_user` WHERE `nickName` = '$name' limit 1";
			$result1=mysql_query($sql1);
			$row1=mysql_fetch_array($result1);
			$id=$row1['id'];	
			$accountId=$row1['accountId'];
			$serverId=$row1['serverId'];
			if(empty($id)){		
			echo "<script>alert('角色不存在,请输入正确名称例如：s1.一阵风  !!');history.go(-1)</script>";
			exit;
			}
			@mysql_select_db($dbpay,$conn) or die ("table not exits");
			mysql_query("set names UTF8"); 
			$orderNo='ID'.mt_rand(900,999).'T'.time().mt_rand(100,999);
			$czsql="insert into `uw_recharge_request` (`accountId`, `userId`, `serverId`, `rechargeId`, `status`, `addTime`, `goodsId`, `orderNo`, `gmStatus`,  `channelId`, `sdkChannelId`) values ('$accountId', '$id', '$serverId', '$rechargeId', '1', NOW(), ' $rechargeId', '$orderNo', '0','10006', '10776')";
			$czresult=mysql_query($czsql);
			@mysql_select_db($dbgame,$conn) or die ("table not exits");
			mysql_query("set names UTF8"); 
			$sql="INSERT INTO uw_mail (userId, type, fromName, title, content, addTime, delHours, expireTime, replaceArgs, items) VALUES ('$id', '0', '', '充值套餐', '充值套餐已发送，请查收', NOW(), '12', date_add(now(),interval 7 day), '[]', '$items')";
			$result=mysql_query($sql);
			$log='pay/log/cdkey'.date('Y-m-d').'.log';
			$date=date('Y-m-d H:i:s');
			if($result){
			@mysql_select_db($gmdb,$conn) or die ("table not exits");
			mysql_query("set names UTF8"); 		
			$sql2="update cdkey set isuse = '已使用', qu = '$serverId' , binduser = '$name' , create_time = now() where cdkey = '$cdkey'";	
			$result2=mysql_query($sql2);
			echo "<script>alert('充值成功！');history.go(-1)</script>";
			file_put_contents($log,$date."\t角色".$name.$rechargeId."套餐领取成功！激活码：".$cdkey."\t 套餐：".$czitem."\t".$user_IP.PHP_EOL,FILE_APPEND);
			echo '<script language="javascript">top.location.href="index.html"</script>';
			}else{
			echo "<script>alert('充值失败！');history.go(-1)</script>";
			file_put_contents($log,$date."\t角色".$name.$rechargeId."套餐领取失败！订单号：".$cdkey."\t 套餐：".$czitem."\t".$user_IP.PHP_EOL,FILE_APPEND);
			echo '<script language="javascript">top.location.href="index.html"</script>';
			}			
			break;			
		default:
			echo "<script>alert('未知操作');history.go(-1)</script>";
			break;
}
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no" name="viewport">
    <meta content="yes" name="apple-mobile-web-app-capable">
    <meta content="black" name="apple-mobile-web-app-status-bar-style">
    <meta content="yes" name="apple-mobile-web-app-capable">
    <meta content="black" name="apple-mobile-web-app-status-bar-style">
    <meta content="telephone=no" name="format-detection">
    <meta content="email=no" name="format-detection">
	<link rel="stylesheet" href="css/bootstrap.min.css">
	<script src="js/bootstrap.min.js"></script>
</head>
<body>	
<div class="text-center col-md-4 center-block">
<h3>用户中心</h3>
 <div class="form-group">
 <form id="form" name="form" method="post" action="">
  <div  class="alert alert-info">
 <label for="uname">游戏角色名</label>
<input type="text" placeholder="输入游戏角色名" class="form-control" id="name" name="name" value="<?php echo $_SESSION['gamename']; ?>" ><br>
  <div  class="alert alert-info">
 <strong>激活码可使用！</strong>
  <div class="text-left">
	<strong>激活码：</strong><?php echo $cdkey; ?> <br>	
	赠送充值套餐包含：<?php echo $czitem; ?><br>
		</div>	</div>
	<div  class="alert alert-info">
		<label> 自选区 </label><br>
   <div class="btn-group btn-group-justified" role="group" aria-label="...">       
<?php   
$a= ' <div class="btn-group" role="group">';
$b= '</div>';
if ($rechargeId =='3'){ 
echo $a;
echo '伙伴<select class="form-control selectpicker" id="item1" name="item1" value="item1">';
	$file=fopen("pay/partner.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
}
elseif($rechargeId =='4' or $rechargeId =='31'){ 
echo $a;
echo '宠物<select class="form-control selectpicker" id="item1" name="item1" value="item1">';
	$file=fopen("pay/pet.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
echo $a;
echo '伙伴<select class="form-control selectpicker" id="item2" name="item2" value="item2">';
	$file=fopen("pay/partner.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
}
elseif ($rechargeId =='5'){ 
echo $a;
echo '宠物<select class="form-control selectpicker" id="item1" name="item1" value="item1">';
	$file=fopen("pay/pet.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
echo $a;
echo '伙伴<select class="form-control selectpicker" id="item2" name="item2" value="item2">';
	$file=fopen("pay/partner.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
echo $a;
echo '伙伴<select class="form-control selectpicker" id="item3" name="item3" value="item3">';
	$file=fopen("pay/partner.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
}  
elseif($rechargeId =='6'){ 
echo $a;
echo '宠物<select class="form-control selectpicker" id="item1" name="item1" value="item1">';
	$file=fopen("pay/pet.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
echo $a;
echo '宠物<select class="form-control selectpicker" id="item2" name="item2" value="item2">';
	$file=fopen("pay/pet.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
echo $a;
echo '伙伴<select class="form-control selectpicker" id="item3" name="item3" value="item3">';
	$file=fopen("pay/partner.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
echo $a;
echo '伙伴<select class="form-control selectpicker" id="item4" name="item4" value="item4">';
	$file=fopen("pay/partner.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  

}  
elseif($rechargeId =='7'){ 
echo $a;
echo '宠物<select class="form-control selectpicker" id="item1" name="item1" value="item1">';
	$file=fopen("pay/pet.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
echo $a;
echo '宠物<select class="form-control selectpicker" id="item2" name="item2" value="item2">';
	$file=fopen("pay/pet.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
echo $a;
echo '宠物<select class="form-control selectpicker" id="item3" name="item3" value="item3">';
	$file=fopen("pay/pet.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
echo $a;
echo '伙伴<select class="form-control selectpicker" id="item4" name="item4" value="item4">';
	$file=fopen("pay/partner.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
echo $a;
echo '伙伴<select class="form-control selectpicker" id="item5" name="item5" value="item5">';
	$file=fopen("pay/partner.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
}      
 ?>
			</div>    
	</div> 	
	<button type="submit" class="btn btn-info btn-block" name="submit" value="mail">确认领取</button><br>	
</form>
</body>
</div></div></div>
</html>