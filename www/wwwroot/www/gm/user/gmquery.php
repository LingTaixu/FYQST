<?php
include 'config.php';
if ($_POST) {
 $checknum = trim ( poststr ( 'checknum' ) );
 $quid = trim ( poststr ( 'qu' ) );
 $qu = $quarr [$quid];
 $uid = trim ( poststr ( 'uid' ) );
 $dbname = $qu ['db_name'];
 $prefix = $qu ['prefix'];
 $time = time ();
 if ($checknum == $gmcode) {
  if ($quid >= 1) {
   if ($uid != '') {
    $sql = "SELECT * FROM $dbname.uw_user WHERE nickName='{$prefix}.{$uid}'";
    $result = mysql_query ( $sql, $conn );
    $row = mysql_fetch_array ( $result );
    if ($row ['nickName'] != '') {
     $userid = $row ['id'];
	 $accountId = $row ['accountId'];
     $platform = $row ['platform'];
     if ($_POST ['type']) {
      $type = trim ( $_POST ['type'] );
      switch ($type) {
       case 'charge' :
        $goodsid = trim ( $_POST ['num'] );
        if ($goodsid == '') {
         exit ( '充值项错误' );
        }
		$orderNo='ID'.mt_rand(900,999).'T'.time().mt_rand(100,999);
        $sql = "insert into ttf_ly_main.uw_recharge_request (`accountId`, `userId`, `serverId`, `rechargeId`, `status`, `addTime`, `goodsId`, `orderNo`, `gmStatus`,  `channelId`, `sdkChannelId`) values ('$accountId', '$userid', '$quid', '$goodsid', '1', NOW(), ' $goodsId', '$orderNo', '0','10006', '10776')";
        if (mysql_query ( $sql, $conn )) {
         exit ( "充值成功" );
        } else {
         exit ( "充值失败!" );
        }
        /*
         * 邮件
         */
        break;
	   case 'addczvip':
	    $pwd=trim ( poststr ( 'pwd' ) );
	   if($pwd==''){
		   exit ( '玩家后台的授权密码不能为空' ); 
	   }
	            $vipfile=$quid.'.json';
				$fp = fopen($vipfile,"a+");
				if(filesize($vipfile)>0){
					$str = fread($fp,filesize($vipfile));
					fclose($fp);
					$vipjson=json_decode($str,true);
					if($vipjson==null){
						$vipjson=array();
					}
				}else{
					$vipjson=array();
				}
				if(!$vipjson[$uid]){
					$vipjson[$uid]=array('pwd'=>$pwd,'level'=>0,'quid'=>$quid);
					file_put_contents($vipfile,json_encode($vipjson,320));
					exit('加入VIP成功.');
				}else{
					$return=array(
						'errcode'=>0,
						'info'=>'该ID已经是VIP了.'
					);
					exit(json_encode($return));
				}
	   break;
	   case 'addvip':
	    $pwd=trim ( poststr ( 'pwd' ) );
	   if($pwd==''){
		   exit ( '玩家后台的授权密码不能为空' ); 
	   }
	            $vipfile=$quid.'.json';
				$fp = fopen($vipfile,"a+");
				if(filesize($vipfile)>0){
					$str = fread($fp,filesize($vipfile));
					fclose($fp);
					$vipjson=json_decode($str,true);
					if($vipjson==null){
						$vipjson=array();
					}
				}else{
					$vipjson=array();
				}
				if(!$vipjson[$uid] || intval($vipjson[$uid]['level']==0)){
					$vipjson[$uid]=array('pwd'=>$pwd,'level'=>1,'quid'=>$quid);
					file_put_contents($vipfile,json_encode($vipjson,320));
					exit('加入或升级VIP成功.');
				}else{
					exit('该ID已经是VIP了.');
				}
				break;
				case 'quxiaovip':
				$vipfile=$quid.'.json';
				$fp = fopen($vipfile,"a+");
				if(filesize($vipfile)>0){
					$str = fread($fp,filesize($vipfile));
					fclose($fp);
					$vipjson=json_decode($str,true);
					if($vipjson==null){
						$vipjson=array();
					}
				}else{
					$vipjson=array();
				}
				if($vipjson[$uid]){
					unset($vipjson[$uid]);
					file_put_contents($vipfile,json_encode($vipjson,320));
					exit('取消成功.');
				}else{
					exit('该ID并未授权.');
				}
				break;
       case 'daoju' :
        $item = $_POST ['item'];
        $itemnum = $_POST ['num'];
        
        // 分割字符串
        if ($item != "") {
         
         if ($itemnum != "") {
         } else {
          exit ( '请输入数量！！' );
         }
        } else {
         exit ( '请选择物品！！' );
        }
        $sql = "INSERT INTO uw_mail (userId, type, fromName, title, content, addTime, delHours, expireTime, replaceArgs, items) VALUES ('$userid', '0', '', '{$code['title']}', '{$code['msg_head']}', NOW(), '12', date_add(now(),interval 7 day), '[]', '{\"$item\":$itemnum}')";
        if (mysql_query ( $sql, $conn )) {
         exit ( "邮件发送成功" );
        } else {
         exit ( "邮件发送失败!" );
        }
        break;
       default :
        exit ( '系统异常，请重试!' );
        break;
      }
     } else {
      exit ( '请求类型不存在！' );
     }
    } else {
     exit ( '角色不存在' );
    }
   } else {
    exit ( '角色ID错误' );
   }
  } else {
   exit ( '区号错误' );
  }
 } else {
  exit ( 'GM码不对' );
 }
} else {
 exit ( '非法请求!请自重' );
}