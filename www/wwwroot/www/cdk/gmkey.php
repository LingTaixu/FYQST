<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<?php
error_reporting(0);
header("Content-type: text/html; charset=utf-8"); 
include 'config.php';
	$mysqli = new mysqli($db_host,$db_username,$db_password,$gmdb,$dbport);
	if(!$mysqli){
	echo "<script>alert('系统提示：数据库连接失败');history.go(-1)</script>";
	exit;	
	}
	session_start();
	$mysqli->set_charset('utf8');	
	$query = $mysqli->prepare("select * from `user` where `user`=? and `password`=? limit 1");
	$query->bind_param('ss', $_SESSION["user"], $_SESSION["password"]);
	$query->execute();
	$result = $query->get_result();
	$row = mysqli_fetch_array($result);
	$check = md5($row['user'] . $row['password']);
	$status= $row['status'];
	if ($_SESSION['check'] <> $check || empty($_SESSION['status']) || $_SESSION['status'] <> $status  || $_SESSION['status'] <> 'admin'){		
	unset($_SESSION);
	echo "<script>alert('您无此权限！');window.location.href='index.php';</script>";
	exit;
	}	
	if(isset($_SESSION['expiretime'])) {   
    if($_SESSION['expiretime'] < time()) {  
    unset($_SESSION['expiretime']);  
	$query = $mysqli->prepare("INSERT INTO gmlog (user, create_time,name,remark,ip) VALUES (?, now(),?,'退出登陆',?)");
	$query->bind_param('sss', $_SESSION["user"], $_SESSION["name"], $user_IP);
	$query->execute();
	$mysqli->close();
	header('Location: exit.php?TIMEOUT'); // 登出  
	exit(0);  
	} else {  
	$_SESSION['expiretime'] = time() + 3600; // 刷新时间戳  
	}  
  
} 	
if ($_POST){	
	switch ($_POST['submit']){	
		case 'generate':
			$c=$_POST['c'];
			if(empty($c)){
			echo "<script>alert('数量不可为空');window.location.href='gmkey.php';</script>";
			exit;
			}
			break;
		case 'addkey':
			$cdkey = preg_split('/\r\n/',$_POST['cdkey']);			
			$vip = $_POST['vip'];
			if(empty($vip)){
			echo "<script>alert('VIP不可为空');window.location.href='gmkey.php';</script>";
			exit;
			}
			if(empty($cdkey)){
			echo "<script>alert('CDKEY不可为空');window.location.href='gmkey.php';</script>";
			exit;
			}
			foreach($cdkey as $cdkey){				
			$mysqli->set_charset('utf8');	
			$query = $mysqli->prepare("select * from `cdkey` where `cdkey` = ? limit 1");
			$query->bind_param('s', $cdkey);
			$query->execute();
			$result = $query->get_result();				
			if(mysql_num_rows($result)>0){
				$mysqli->close();
				echo "<script>alert('系统提示：该cdkey已经被在数据库了');window.location.href='gmkey.php';</script>";
				exit;
			}else {
			$query = $mysqli->prepare("INSERT INTO cdkey ( cdkey,status,isuse) VALUES (?, ?,'未使用')");
			$query->bind_param('ss', $cdkey,$vip);
			$query->execute();					
			$remark = '添加 cdkey:'.$cdkey.'时间'.$date.' 成功!!';
			$query = $mysqli->prepare("INSERT INTO gmlog (user, create_time,name,remark,ip) VALUES ( ? ,now(), ? , ?, ?)");
			$query->bind_param('ssss', $_SESSION["user"], $_SESSION["name"], $remark, $user_IP);
			$query->execute();				
			}
			echo "<script>alert('添加cdkey成功');window.location.href='gmkey.php';</script>";
			}	
			break;	
	}
}
function uuid($prefix = '')
  {
    $chars = md5(uniqid(mt_rand(), true));
    $uuid  = substr($chars,0,8) . '-';
    $uuid .= substr($chars,8,4) . '-';
    $uuid .= substr($chars,12,4) . '-';
    $uuid .= substr($chars,16,4) . '-';
    $uuid .= substr($chars,20,12);
    return $prefix . $uuid;
  }  
?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>GM后台管理系统</title>
</head>
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>GM</title>
    <!-- 最新版本的 Bootstrap 核心 CSS 文件 -->
    <link rel="stylesheet" href="css/bootstrap.min.css">
	<link rel="stylesheet" href="css/bootstrap-theme.min.css">
	<script src="js/bootstrap.min.js"></script>
	<script type="text/javascript">
	$("#form").submit(function(){
	var descrip = $("#cdkey").val();
	descrip=descrip.replace(/\n/g,'<br />');
	$("#cdkey").val(descrip);
	}
	</script>
</head>
<body>
<div class="text-center col-md-4 center-block">
<h1><?php echo $_SESSION['gmbt'];?>授权后台</h1>
 <h3 style="color:blue"><?php echo $_SESSION['name'];?> 欢迎登陆</h3> <br>
	 <button class="btn btn-info btn-block" onclick="window.location.href='gmkey.php'">CDKEY管理</button>
	 <button class="btn btn-info btn-block" onclick="window.location.href='gmallkeylist.php?page=1'">CDKEY所有列表</button>
	 <button class="btn btn-info btn-block" onclick="window.location.href='gmkeylist.php?page=1'">CDKEY未使用列表</button>
	<button class="btn btn-info btn-block" onclick="window.location.href='gm.php'">返回主菜单</button>
	<button class="btn btn-info btn-block" onclick="window.location.href='exit.php'">登陆注销</button><br>	 
<form id="form" name="form" method="post" action="">
    <div class="form-group">
            <label for="v">CDKEY生成系统</label>					     
			</select>	
			<input type="text" placeholder="生成CDKEY数量" class="form-control" id="c" name="c" value="" maxlength="3">
		<button type="submit" class="btn btn-info btn-block" name="submit" value="generate">生成CDKEY</button><br>				
        <textarea type="text" style="width: 100%; height: 200px ;overflow: auto;word-break: break-all; resize: none;"  class="form-control" id="cdkey" name="cdkey" value=""><?php 
		$i=1;
		while($i<=$c){
		$a=strtoupper(uuid());	
		$b=$b."\r".$a;
		$i++;
		}
		echo $b;  
		?></textarea>
		            <label for="v">套餐选择</label>
			<select class="form-control selectpicker" id="vip" name="vip" value="">
			<option value="">选择套餐</option>
			<option value="1">6元套餐礼包一</option>
			<option value="2">12元套餐礼包二</option>
			<option value="3">30元套餐礼包三</option>
			<option value="4">98元套餐礼包四</option>
			<option value="5">198元套餐礼包五</option>	
			<option value="6">498元套餐礼包六</option>
			<option value="7">998元套餐礼包七</option>
			<option value="31">58元套餐礼包八</option>	
			</select>	
        <button type="submit" class="btn btn-info btn-block" name="submit" value="addkey">导入数据库</button><br>	
		</div>	
</form>
<div class="form-group">
  <p class="admin_copyright">&copy; 2019 Powered by  <?php echo $_SESSION['copyright'];?></p>  </div>
</body>
</html>