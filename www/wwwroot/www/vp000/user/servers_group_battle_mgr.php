<?php
require ('../include/init.inc.php');
$battleId = '';
extract ( $_REQUEST, EXTR_IF_EXISTS );

$mgrInfo = [
    "battleId" => $battleId
];

$monitUrls = getPM2BattleWebUrl();
$plist = [];
foreach ($monitUrls as $k => $url){
    $p = Utils::monitServer($url);
    $plist = array_merge($plist, $p);
}

$sname  = getBattleServerName($battleId);
if($plist[$sname]){
    $mgrInfo['run'] = $plist[$sname];
}else{
    $mgrInfo['run'] = 'unknown';
}

//$server_list = [];
//$server_list[] = $mgrInfo;
Template::assign ( 'server', $mgrInfo );
Template::display ( 'user/servers_group_battle_mgr.tpl' );
