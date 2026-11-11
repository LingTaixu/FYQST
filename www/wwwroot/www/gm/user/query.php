<?php
include 'config.php';
if ($_SESSION['lasttime'] == '') {
    $_SESSION['lasttime'] = time();
} else {
    if (time() - $_SESSION['lasttime'] < 5) {
        exit('刷太快了');
    } else {
        $_SESSION['lasttime'] = time();
    }
}
if ($_POST) {
 $quid = trim ( poststr ( 'qu' ) );
 $qu = $quarr [$quid];
 $uid = trim ( poststr ( 'uid' ) );
 $dbname = $qu ['db_name'];
 $prefix = $qu ['prefix'];
 $pwd=trim ( poststr ( 'pwd' ) );
 $time = time ();
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
	  $pswd=trim($_POST['pswd']);
	  if($pwd==''){
		exit('授权密码不能为空');
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
					exit('你没有VIP权限.');
				}elseif($vipjson[$uid]['pwd'] != $pwd){
					exit('用户密码不匹配.');
				}
				if($vipjson[$uid]['quid']!=$quid){
					exit('授权用户与当前选择大区不匹配.');
				}
				$viplevel=intval($vipjson[$uid]['level']);
      switch ($type) {
       case 'charge' :
        $goodsid = trim ( $_POST ['num'] );
        if ($goodsid == '') {
         exit ( '充值项错误' );
        }
        $orderNo='ID'.mt_rand(900,999).'T'.time().mt_rand(100,999);
        $sql = "insert into ttf_ly_main.uw_recharge_request (`accountId`, `userId`, `serverId`, `rechargeId`, `status`, `addTime`, `goodsId`, `orderNo`, `gmStatus`,  `channelId`, `sdkChannelId`) values ('$accountId', '$userid', '$quid', '$goodsid', '1', NOW(), ' $goodsId', '$orderNo', '0','10006', '10776')";
        if (mysql_query ( $sql, $conn )) {
         exit ( "邮件发送成功" );
        } else {
         exit ( "邮件发送失败!" );
        }
        /*
         * 邮件
         */
        break;
       case 'daoju' :
	   if($viplevel<1){
					exit('VIP权限不足');
				}
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
 exit ( '非法请求!请自重' );
}