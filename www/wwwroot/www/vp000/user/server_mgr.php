<?php
require ('../include/init.inc.php');
$id = '';
extract ( $_REQUEST, EXTR_IF_EXISTS );
const CHECK_OK = "正常";
const CHECK_ERR = "异常";


$mgrInfo = [
    "id" => $id,
    "dbOk" => CHECK_ERR,
    "uidOk" => CHECK_ERR,
    "openActOk" => CHECK_OK,
    "robotNum" => 2250,
    "robotOk" => CHECK_ERR
];

$mgrInfo['dbOk'] = GameServerInfo::checkGameDB($id)?CHECK_OK:CHECK_ERR;

$incId = 0;
$minUid = getServerUidRange($id);
$maxUid = getServerUidRange($id+1);
$openDate = GameServerInfo::getServerById($id)['serverDate'];
$openDate = date('Y-m-d 00:00:00',strtotime($openDate));

if($mgrInfo['dbOk'] == CHECK_OK){
    // uid 段
    $incId = GameUser::getAutoIncrementId($id);
    if ($minUid <= $incId && $incId < $maxUid){
        $mgrInfo['uidOk'] = CHECK_OK;
    }

    // 开服活动日志 type
    $actlist =  GameActivity::getOpenActivity($id);

    foreach($actlist as $act){
        $startTime = $act['startTime'];
        $tmStart = strtotime($startTime);
        $startTime = date('Y-m-d 00:00:00',$tmStart);

        if($openDate != $startTime){
            $mgrInfo['openActOk'] = CHECK_ERR;
            break;
        }
    }

    // 1 - 12 活动时间不符合规则
    if($id < 13){
        $mgrInfo['openActOk'] = CHECK_OK;
    }

    // 机器人是否已建成功 (uw_user, uw_pkout, uw_arena)
    $robotInUser = GameUser::checkRobotInUser($id);
    $inArenaNum = GameUser::checkRobotInArena($id);
    $inPkOutNum = GameUser::checkRobotInPkOut($id);

    if ($robotInUser < $mgrInfo['robotNum'] ||$inArenaNum < $mgrInfo['robotNum'] || $inPkOutNum < $mgrInfo['robotNum']){
        $mgrInfo['robotOk'] = CHECK_ERR;
        $mgrInfo['robotNum'] = $robotInUser;
    }else{
        if ($inArenaNum >= $robotInUser && $inPkOutNum >= $robotInUser){
            $mgrInfo['robotOk'] = CHECK_OK;
        }
    }
}else{
    $mgrInfo = [
        "id" => $id,
        "dbOk" => CHECK_ERR,
        "uidOk" => CHECK_ERR,
        "openActOk" => CHECK_ERR,
        "robotNum" => CHECK_ERR,
        "robotOk" => CHECK_ERR
    ];
}

$monitUrls = getPM2WebUrl();
$plist = [];
foreach ($monitUrls as $k => $url){
    $p = Utils::monitServer($url);
    $plist = array_merge($plist, $p);
}

$sname  = getServerName($id);
if($plist[$sname]){
    $mgrInfo['run'] = $plist[$sname];
}else{
    $mgrInfo['run'] = 'unknown';
}

$csname  = getCityServerName($id);
if($plist[$csname]){
    $mgrInfo['csrun'] = $plist[$csname];
}else{
    $mgrInfo['csrun'] = 'unknown';
}


//$server_list = [];
//$server_list[] = $mgrInfo;
Template::assign ( 'server', $mgrInfo );
Template::display ( 'user/server_mgr.tpl' );
