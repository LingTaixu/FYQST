<?php

require ('../include/init.inc.php');
$uid = $nick = $gold = $diamond = $lvl = $vip = $rebirthLvl = $rebirthExp = $curCopy = $achieveLvl = $achieveExp = $cybLvl = $cybExp = $jxLvl = $jxExp = $fatigue = $highPaTa = $magicLvl = $dscore = "";
extract ( $_REQUEST,  EXTR_IF_EXISTS );

$playInfo = GameUser::getRoleByUid($uid);
//获取挂机关卡
$copyProgress = GameCopyProgress::getCopyProgressByUid($uid);
$copyObj = json_decode($copyProgress['copyObj']);//maxCopyProgress

foreach ($copyObj as $k=>$v){
    $copyArr[] = $k;
}
$maxCopyNum = count($copyArr) > 0 ?max($copyArr):100001;
$maxCopyNum = $maxCopyNum - 100000;
//$maxCopyNum = $maxCopyNum > 999?($maxCopyNum-9001):$maxCopyNum;

if (Common::isPost ()) {

    if($uid == '' || $nick == ''){
        OSAdmin::alert("error",ErrorMessage::NEED_PARAM);
    }else{
        $exData = json_decode($playInfo['exData'], true);
        if (isset($exData[36])) {
            $exData[36][0] = intval($fatigue);
        } else {
            $exData[36][0] = intval($fatigue);
        }
        $exData = json_encode($exData);
        //背包
        $bag = json_decode($playInfo['bag'], true);

        if (isset($bag[1809])) {
            $bag[1809] = intval($dscore);
        } else {
            $bag[1809] = intval($dscore);
        }
        $bag = json_encode($bag);
        
        $update_data = array ('gold' => $gold, 'diamond' => $diamond, 'lvl' => $lvl,'rebirthLvl' => $rebirthLvl, 'rebirthExp' => $rebirthExp,
            'achieveLvl' => $achieveLvl, 'achieveExp' => $achieveExp, 'cybLvl' => $cybLvl, 'cybExp' => $cybExp, 'jxLvl' => $jxLvl,
            'jxExp' => $jxExp, 'exData' => $exData, 'highPaTa' => $highPaTa, 'nickName' => $nick, 'magicLvl' => $magicLvl, 'bag' => $bag);
         $result = GameUser::updateRoleInfo($uid,$update_data );

        $copyObj2 = array();
         if($curCopy && is_numeric($curCopy) && $curCopy > 0){
//             if($curCopy == 1){
//                 //$copyObj2 = (object)array();
//             }else if($curCopy <= 999){
//                 for ($i = 2; $i <= $curCopy; $i++) {
//                     $copyObj2[$i] = 1;
//                 }
//             }
//             else {
//                 for ($i = 2; $i <= 999; $i++) {
//                     $copyObj2[$i] = 1;
//                 }
//                 for ($i = 10001; $i <= $curCopy+9001 && $i <= 14401; $i++) {
//                     $copyObj2[$i] = 1;
//                 }
//             }
             $copyObj2[$curCopy + 100000] = 1;
             $copyObj2 = json_encode($copyObj2);
             //var_dump($copyObj2);
             $update_data2 = array('copyObj' => $copyObj2);
             $result2 = GameCopyProgress::updateCopyProgress($uid,$update_data2);
         }

        $serverId = UserSession::getUserServerId();
        $params['userId'] = $uid;
        $params = array_merge($params, $update_data);
        unset($params['exData']);
        $params['fatigue'] = $fatigue;
        $res = GameUser::updateRoleInfoByApi($serverId, $params);

        if ($result>=0) {
           // SysLog::addLog ( UserSession::getUserName(), 'MODIFY', 'Module' ,$module_id, json_encode($update_data) );
            Common::exitWithSuccess ('修改完成','user/role_modify.php?uid='.$uid);
        } else {
            OSAdmin::alert("error");
        }
    }
}

$bag = json_decode($playInfo['bag'], true);
$bagInfo = array();
foreach($bag as $k=>$v){
    $item = $CONFIG_ITEM[$k]['name']." * ".$v;
    $bagInfo[] = $item;
}

$bags = join("|",$bagInfo);
$playInfo['bags'] = $bags;
$playInfo['dscoreInfo'] = $bag[1809];

$equipBag = json_decode($playInfo['equipBag'], true);
$equipInfo = array();
foreach($equipBag as $k=>$v){
    $item = $CONFIG_ITEM[$v[0]]['name'];
    $equipInfo[] = $item;
}

$equips = join("|",$equipInfo);
$playInfo['equipBag'] = $equips;

$exData = json_decode($playInfo['exData'], true);
$fatigueNum = 0;
if (isset($exData[36])) {
    $fatigueNum = $exData[36][0];
}

Template::assign ( '_GET', $_GET);
Template::assign ( 'player_info', $playInfo);
Template::assign ( 'curCopy', $maxCopyNum);
Template::assign ( 'fatigue', $fatigueNum);
Template::display ( 'user/role_modify.tpl' );
