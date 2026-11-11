<?php
require ('../include/init.inc.php');
//$serverId = '';

extract ( $_POST, EXTR_IF_EXISTS );

//$lastDay = GameServerInfo::getLastServerDate();
//$newDay = date('Y-m-d H:i:s',strtotime('+1 day',strtotime($lastDay)));

/*
$monitUrls = getPM2WebUrl();
$plist = [];
foreach ($monitUrls as $k => $url){
    //echo $url;
    $p = Utils::monitServer($url);
    $plist = array_merge($plist, $p);
}
*/

Utils::createNewServer(1);

 //GameUser::getAutoIncrementId(4);
echo "bye";
//Template::assign ( 'newDay', $newDay );
//Template::display ( 'user/server_add.tpl' );
