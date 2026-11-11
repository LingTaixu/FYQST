<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>密卡激活中心</title>
</head>
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <!-- 最新版本的 Bootstrap 核心 CSS 文件 -->
    <link rel="stylesheet" href="css/bootstrap.min.css">	
</head>
<?php
error_reporting(0);
header("Content-type: text/html; charset=utf8");
include 'config.php';
	$gamename = $_POST['gamename'];
	$date=date('Y-m-d H:i:s',strtotime('+9years'));	
	$cdkey = $_POST['cdkey'];	
if(isset($_POST['submit'])) {		
				if(empty($username) || empty($password )){
				echo "<script>alert('账号或密码不可为空');history.go(-1)</script>";
				exit;
				}	
				$mysqli = new mysqli($db_host,$db_username,$db_password,$gmdb,$dbport);
				if(!$mysqli){
				echo "<script>alert('系统提示：数据库连接失败');history.go(-1)</script>";
				exit;	
				}
				$quser = $mysqli->prepare("select * from `user` where `user` = ? limit 1");
				$quser->bind_param('s', $username);
				$quser->execute();
				$qresult = $quser->get_result();				
				$qrow = mysqli_fetch_array($qresult);
				if(!empty($qrow['user'])){
					$mysqli->close();
					echo "<script>alert('系统提示：该帐号已经被注册');history.go(-1)</script>";
					exit;
				}	
				$mysql1 = new mysqli($db_host,$db_username,$db_password,$dbgame,$dbport);
				$mysql1->set_charset('utf8');	
				$query1 = $mysql1->prepare("SELECT * FROM `realm_role`.`tchar_new` WHERE `fPlayerName` = ? limit 1");
				$query1->bind_param('s', $gamename);
				$query1->execute();
				$result1 = $query1->get_result();
				$row1 = mysqli_fetch_array($result1);	
				$roleid=$row1['fAccountID'];
				if(empty($roleid)){
					echo "<script>alert('数据库无此角色');history.go(-1)</script>";
					exit;
				}	
				if(empty($cdkey)){		
				echo "<script>alert('激活码不可为空');history.go(-1)</script>";
				exit;
				}
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
				$vip = $row['status'];	
				if($row['isuse']!='未使用'){
					$mysqli->close();
					echo "<script>alert('系统提示：此激活码已使用！');history.go(-1)</script>";
					exit;
				}else {
				$query = $mysqli->prepare("INSERT INTO user (user, password,name,status,qu,roleid,endtime) VALUES (?, ?, ?, ?, ?, ?, ?)");
				$query->bind_param('sssssss', $username, $password, $gamename, $vip, $qu, $roleid, $date);
				$query->execute();					
				$remark = '添加 用户:'.$username.' '.' 密码:'.$password.' '.' 游戏账号:'.$gamename.' 权限:'.$vip."\t 角色ID：".$roleid."\t 激活码：".$cdkey."\t 有效期".$date.' 成功!!';
				$query2 = $mysqli->prepare("INSERT INTO gmlog (user, create_time,name,remark,ip) VALUES ( ? ,now(), ? , ?, ?)");
				$query2->bind_param('ssss', $_SESSION["user"], $_SESSION["name"], $remark, $user_IP);
				$query2->execute();	
				$query4 = $mysqli->prepare("update cdkey set isuse = '已使用', qu = ? , binduser = ? , create_time = now() where cdkey = ?");
				$query4->bind_param('sss', $qu,$username,$cdkey);
				$query4->execute();	
				$mysqli->close();
				echo '玩家ID：'.$roleid.'<br>';
				echo 'CDKey:'.$cdkey;
				echo "<script>alert('用户注册成功');history.go(-1)</script>";
				}
}
?>
<body>
<div class="text-center col-md-4 center-block">
<h2><?php echo $_SESSION['gmbt'];?>密卡充值中心</h2>
<form id="form" name="form" method="post" action="">
            <label for="uname">游戏角色名</label>
			<input type="text" placeholder="游戏角色名" class="form-control" id="gamename" name="gamename" value="" >
			 <label for="v">充值区</label>	
			<select class="form-control selectpicker" id="qu" name="qu" value="">
			<?php
			  foreach($yzfqu as $k=>$v){
				  echo '<option value="'.$k.'">'.$v.'</option>';
			  }
			  ?>
			  <input type="text" placeholder="输入卡密" class="form-control" id="cdkey" name="cdkey" value="" ><br>
			  
				 <label style="color:red">提示：套餐<?php echo $_GET['rechargeId'];?>礼包</label> <br>
		<?php
				switch($_GET['rechargeId']){
					case '1':      //6元
						$czitem = '钻石：3W，金币：50W';
						break;
					case '2':      //12元
						$czitem = '钻石：6W，金币：100W';
						break;
					case '3':      //30元
						$czitem = '钻石：15W，金币：400W ,物品：任选SSR人物*1个,C级人物果实*2000个,';
						break;
					case '4':      //98元
						$czitem = '钻石：60W，金币：1000W ,物品：任选SSS宠物*1个,任选SSR人物*1个,C级人物果实*4000个,魔魂之尘*5999个';
						break;
					case '5':      //198元
						$czitem = '钻石：100W，金币：3000W ,物品：任选SSS宠物*1个,任选SSR人物*2个,C级人物果实*6000个,深渊魔石*5000个';
						break;
					case '6':      //498元
						$czitem = '钻石：300W，金币：6000W ,物品：任选SSS宠物*2个,任选SSR人物*2个,B级人物果实*5000个,魔魂之尘*9999个,XX型经验药水*999';
						break;
					case '7':      //998元
						$czitem = '钻石：600W，金币：2亿 ,物品：任选SSS宠物3个,任选SSR人物2个,4星100级天使1个和4星100级小恶魔1个,A级经验徽章*999个,A级经验法典*999个,拿铁咖啡*999个';
						break;
					case '31':      //58元 
						$czitem = '钻石：40W，金币：800W ,物品：任选SSS宠物*1个,任选SSR人物*1个,C级人物果实*3000个';
						break;
					default:
						$items = '{\"200\":20000,\"99\":900000}'; 
						$czitem = '钻石：2W，金币：90W';
						break; 
				}
				echo $czitem;
				
		?>
		<br>
		<label> 自选区 </label> </div> 	
   <div class="btn-group btn-group-justified" role="group" aria-label="...">       
<?php   
$rechargeId = $_GET['rechargeId'];
$a= ' <div class="btn-group" role="group">';
$b= '</div>';
if ($rechargeId =='3'){ 
echo $a;
echo '伙伴<select class="form-control selectpicker" id="item1" name="item1" value="item1">';
	$file=fopen("onekey/partner.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
}
elseif($rechargeId =='4' or $rechargeId =='31'){ 
echo $a;
echo '宠物<select class="form-control selectpicker" id="item1" name="item1" value="item1">';
	$file=fopen("onekey/pet.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
echo $a;
echo '伙伴<select class="form-control selectpicker" id="item2" name="item2" value="item2">';
	$file=fopen("onekey/partner.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
}
elseif ($rechargeId =='5'){ 
echo $a;
echo '宠物<select class="form-control selectpicker" id="item1" name="item1" value="item1">';
	$file=fopen("onekey/pet.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
echo $a;
echo '伙伴<select class="form-control selectpicker" id="item2" name="item2" value="item2">';
	$file=fopen("onekey/partner.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
echo $a;
echo '伙伴<select class="form-control selectpicker" id="item3" name="item3" value="item3">';
	$file=fopen("onekey/partner.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
}  
elseif($rechargeId =='6'){ 
echo $a;
echo '宠物<select class="form-control selectpicker" id="item1" name="item1" value="item1">';
	$file=fopen("onekey/pet.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
echo $a;
echo '宠物<select class="form-control selectpicker" id="item2" name="item2" value="item2">';
	$file=fopen("onekey/pet.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
echo $a;
echo '伙伴<select class="form-control selectpicker" id="item3" name="item3" value="item3">';
	$file=fopen("onekey/partner.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
echo $a;
echo '伙伴<select class="form-control selectpicker" id="item4" name="item4" value="item4">';
	$file=fopen("onekey/partner.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  

}  
elseif($rechargeId =='7'){ 
echo $a;
echo '宠物<select class="form-control selectpicker" id="item1" name="item1" value="item1">';
	$file=fopen("onekey/pet.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
echo $a;
echo '宠物<select class="form-control selectpicker" id="item2" name="item2" value="item2">';
	$file=fopen("onekey/pet.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
echo $a;
echo '宠物<select class="form-control selectpicker" id="item3" name="item3" value="item3">';
	$file=fopen("onekey/pet.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
echo $a;
echo '伙伴<select class="form-control selectpicker" id="item4" name="item4" value="item4">';
	$file=fopen("onekey/partner.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
echo $a;
echo '伙伴<select class="form-control selectpicker" id="item5" name="item5" value="item5">';
	$file=fopen("onekey/partner.txt", "r"); while(!feof($file)){$line=fgets($file);$txts=explode(';',$line); if(count($txts)==2){echo '<option value="'.$txts[0].'">'.$txts[1].'</option>';}}fclose($file);
echo '</select>'; 
echo $b;  
}      
 ?>
</div> <br>	<div class="form-group">	
        <button type="submit" class="btn btn-info btn-block" name="sub" value="yz">一键发送礼包</button></br>		
				
</form>
  <p class="admin_copyright">&copy; 2019 Powered by  <?php echo $_SESSION['copyright'];?></p>  
 </div>
</div>
</body>
</html>
