<?php
//error_reporting(0);
include_once "config.php";
$orderId=$_GET['orderId'];
$fee=$_GET['fee'];
$feeid=$_GET['feeid'];
$rolename=$_GET['rolename'];
$fee = $fee/100;
$user =$_SESSION['user'];
$_SESSION['gamename']=$rolename;
$pay =$_POST['pay'];
			$item1 =$_POST['item1'];
			$item2 =$_POST['item2'];
			$item3 =$_POST['item3'];
			$item4 =$_POST['item4'];
			$item5 =$_POST['item5'];
switch($feeid){
	case '1':      //6元
		$items = '{\"200\":30000,\"99\":10000000}';
		$czitem = '钻石：3W，金币：1000W';
		$url="#";
		break;
	case '2':      //12元
		$items = '{\"200\":60000,\"99\":15000000}';
		$czitem = '钻石：6W，金币：1500W';
		$url="#";
		break;
	case '3':      //30元
		$items = '{\"200\":150000,\"99\":20000000,\"'.$item1.'\":1,\"5001\":2000}';
		$czitem = '钻石：15W，金币：2000W ,物品：任选SSR人物*1个,C级人物果实*2000个,';
		$url="#";
		break;
	case '4':      //98元
		$items = '{\"200\":600000,\"99\":30000000,\"'.$item1.'\":1,\"'.$item2.'\":1,\"5001\":4000,\"100222\":5999}';
		$czitem = '钻石：60W，金币：3000W ,物品：任选SSS宠物*1个,任选SSR人物*1个,C级人物果实*4000个,魔魂之尘*5999个';
		$url="#";
		break;
	case '5':      //198元
		$items = '{\"200\":1000000,\"99\":50000000,\"'.$item1.'\":1,\"'.$item2.'\":1,\"'.$item3.'\":1,\"5001\":4000,\"950\":5000}';
		$czitem = '钻石：100W，金币：5000W ,物品：任选SSS宠物*1个,任选SSR人物*2个,C级人物果实*6000个,深渊魔石*5000个';
		$url="#";
		break;
	case '6':      //498元
		$items = '{\"200\":3000000,\"99\":65000000,\"'.$item1.'\":1,\"'.$item2.'\":1,\"'.$item3.'\":1,\"'.$item4.'\":1,\"5002\":5000,\"100222\":9999,\"46\":999}';
		$czitem = '钻石：300W，金币：6500W ,物品：任选SSS宠物*2个,任选SSR人物*2个,B级人物果实*5000个,魔魂之尘*9999个,XX型经验药水*999';
		$url="#";
		break;
	case '7':      //998元
		$items = '{\"200\":6000000,\"99\":200000000,\"'.$item1.'\":1,\"'.$item2.'\":1,\"'.$item3.'\":1,\"'.$item4.'\":1,\"'.$item5.'\":1,\"1100250\":1,\"1200250\":1,\"944\":999,\"948\":999,\"45\":999}';
		$czitem = '钻石：600W，金币：2亿 ,物品：任选SSS宠物3个,任选SSR人物2个,4星100级天使1个和小恶魔1个,A级经验徽章*999个,A级经验法典*999个,拿铁咖啡*999个';
		$url="#";
		break;
	case '31':      //58元 
		$items = '{\"200\":400000,\"99\":20000000,\"'.$item1.'\":1,\"'.$item2.'\":1,\"5001\":3000}';
		$czitem = '钻石：40W，金币：2000W ,物品：任选SSS宠物*1个,任选SSR人物*1个,C级人物果实*3000个';
		$url="#";
		break;
	default:
		$items = '{\"200\":20000,\"99\":900000}'; 
		$czitem = '钻石：2W，金币：90W';
		break; 
}
if ($_POST){	
	switch ($_POST['submit']){	
		case 'buy':	
			header("Location:{$url}");
			break; 
		case 'key':	
			$cdkey = $_POST['cdkey'];
			if(empty($cdkey)){		
				echo "<script>alert('激活码不可为空');history.go(-1)</script>";
				exit;
				}
				$mysqli = new mysqli($db_host,$db_username,$db_password,$gmdb,$dbport);
				$mysqli->set_charset('utf8');	
				$query = $mysqli->prepare("select * from `cdkey` where `cdkey`=? limit 1");
				$query->bind_param('s', $cdkey);
				$query->execute();
				$result = $query->get_result();
				$row = mysqli_fetch_array($result);			
				if($row['cdkey']==''){
					$mysqli->close();
					echo "<script>alert('系统提示：此激活码不可用！');history.go(-1)</script>";
					exit;
				}
				$rechargeId = $row['status'];	
				if($row['isuse']!='未使用'){
					$mysqli->close();
					echo "<script>alert('系统提示：此激活码已使用！');history.go(-1)</script>";
					exit;
				}else{
				$keyurl="cdkmail.php?rechargeId={$rechargeId}&cdkey={$cdkey}";				
				header("Location:{$keyurl}");					
				}
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
<h3>绯雨骑士团CDK平台</h3>
 <div class="form-group">

 <h4 style="color:blue"><?php echo $_SESSION['user'];?></h4><br>
 <form id="form" name="form" method="post" action="">
  <div class="text-left">
     <div  class="alert alert-info">
	<strong>订单号：</strong><?php echo $orderId; ?> <br>
	<strong>充值支付：</strong><?php echo $fee; ?>元
	</div>
	<div  class="alert alert-info">
	此套餐赠送包含：<?php echo $czitem; ?>
	  </div>
	   <label style="color:blue" > 请支付方式 ：</label>
	  <div class="radio" >	<h3 style="color:green">

	  </h3>
  </div>
	<button type="submit" class="btn btn-info btn-block" name="submit" value="buy">购买密卡</button><br>	
</form>
 <form id="form1" name="form1" method="post" action="">
  <div class="text-left">
     <div  class="alert alert-info">
	 <label for="v">激活区</label>
 <input type="text" placeholder="输入卡密" class="form-control" id="cdkey" name="cdkey" value=""><br>
  </div>
	<button type="submit" class="btn btn-info btn-block" name="submit" value="key">检查激活码</button><br>	
</form>
</body>
</div></div>
</html>