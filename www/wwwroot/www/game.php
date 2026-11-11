<?php
include_once "config.php";
@mysql_select_db($dbaccount,$conn) or die ("table not exits");
mysql_query("set names UTF8"); 
$name=$_POST['username'];
$pass=$_POST['passwd'];
if(!$name && !$pass){
	header("Location:/");	
}
if(preg_match('/[\x{4e00}-\x{9fa5}]/u', $name)>0){
	echo "<script>alert('用户名不能包含中文！');history.go(-1)</script>";
	exit;
}
$sql="select * from account where user='".$name."'";
$result=mysql_query($sql);
$row=mysql_fetch_array($result);
if($row['id']){
	if($row['pass']!=md5($pass)){
		echo "<script>alert('登录失败,用户名或密码错误！');history.go(-1)</script>";
		exit;
	}
	$_SESSION['user']=$name;		
}else{
	$sql="insert into account (user,pass) values ('".$name."','".md5($pass)."')";
	$result=mysql_query($sql);
	if($result){
		$_SESSION['user']=$name;
	}else{
		echo "<script>alert('网络繁忙,请稍后重试！');history.go(-1)</script>";
		exit;	
	}
}
$user =$_SESSION['user'];
if(!$user){
	header("Location:/");	
}
$t = strtotime(date('Y-m-d'));
//"account="+userdata.uid+"&time="+userdata.t+"&key="+this.appKey
$sign =md5('account='.$name.'&time='.$t.'&key='.$appKey);
$url="game.html?account={$name}&time={$t}&sign={$sign}";
header("Location:{$url}");
?>