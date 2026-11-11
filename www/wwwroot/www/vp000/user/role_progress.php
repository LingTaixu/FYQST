<?php
require('../include/init.inc.php');
$uid = $normalCopy = $goldCopy = $expCopy = $towerCopy = "";
$normalNum = $goldNum = $expNum = $towerNum = 0;
extract($_REQUEST, EXTR_IF_EXISTS);

//获取挂机关卡
$copyType = [0, 1, 3, 8];
$copyProgress = GameCopyProgress::getCopyProgressByUid($uid, $copyType);
if (!empty($copyProgress)) {
    foreach ($copyProgress as $progress) {
        $type = $progress['copyType'];
        if ($type == 0) {
            $copyObj = json_decode($progress['copyObj'], true);//maxCopyProgress
            $normalArr = [];
            foreach ($copyObj as $k => $v) {
                $normalArr[] = $k;
            }
            $normalNum = count($normalArr) > 0 ? max($normalArr) : 1;
        }
        if ($type == 1) {
            $copyObj = json_decode($progress['copyStar'], true);//maxCopyProgress
            $goldArr = [];
            foreach ($copyObj as $k => $v) {
                $goldArr[] = $k;
            }
            $goldNum = count($goldArr) > 0 ? count($goldArr) : 1;
        }
        if ($type == 3) {
            $copyObj = json_decode($progress['copyStar'], true);//maxCopyProgress
            $expArr = [];
            foreach ($copyObj as $k => $v) {
                $expArr[] = $k;
            }
            $expNum = count($expArr) > 0 ? count($expArr) : 1;
        }
        if ($type == 8) {
            $copyObj = json_decode($progress['copyObj'], true);//maxCopyProgress
            $towerArr = [];
            foreach ($copyObj as $k => $v) {
                $towerArr[] = $k;
            }
            $towerNum = count($towerArr) > 0 ? count($towerArr) : 1;
        }
    }
}


if (Common::isPost()) {
    $nowTime = date('Y-m-d H:i:s', time());
    $copyObj2 = '';
    if ($normalCopy && is_numeric($normalCopy) && $normalCopy > 0) {
        if ($normalCopy == 1) {
            //$copyObj2 = (object)array();
        } else if ($normalCopy <= 999) {
            for ($i = 2; $i <= $normalCopy; $i++) {
                $copyObj2[$i] = 1;
            }
        } else {
            for ($i = 2; $i <= 999; $i++) {
                $copyObj2[$i] = 1;
            }
            for ($i = 10001; $i <= $normalCopy + 9001 && $i <= 14401; $i++) {
                $copyObj2[$i] = 1;
            }
        }
        $copyObj2 = json_encode($copyObj2);

        $update_data2 = array('copyObj' => $copyObj2);
        $result2 = GameCopyProgress::updateCopyProgress($uid, $update_data2);
    }
    $copyStar = '';
    if ($goldCopy && is_numeric($goldCopy) && $goldCopy > 0) {
        $timesPerDay = '';
        for ($i = 1; $i <= $goldCopy; $i++) {
            $copyLevel = $i + 2000;
            $copyStar[$copyLevel] = 3;
            $timesPerDay[$copyLevel] = 1;
        }
        $copyStar = json_encode($copyStar);
        $timesPerDay = json_encode($timesPerDay);

        $update_data2 = array('copyStar' => $copyStar, 'timesPerDay' => $timesPerDay, 'refreshTime' => $nowTime);
        $result2 = GameCopyProgress::updateCopyProgress($uid, $update_data2, 1);
    }
    $copyStar = '';
    if ($expCopy && is_numeric($expCopy) && $expCopy > 0) {
        $timesPerDay = '';
        for ($i = 1; $i <= $expCopy; $i++) {
            $copyLevel = $i + 3000;
            $copyStar[$copyLevel] = 3;
            $timesPerDay[$copyLevel] = 1;
        }
        $copyStar = json_encode($copyStar);
        $timesPerDay = json_encode($timesPerDay);

        $update_data2 = array('copyStar' => $copyStar, 'timesPerDay' => $timesPerDay, 'refreshTime' => $nowTime);
        $result2 = GameCopyProgress::updateCopyProgress($uid, $update_data2, 3);
    }
    $copyObj2 = '';
    if ($towerCopy && is_numeric($towerCopy) && $towerCopy > 0) {
        for ($i = 1; $i <= $towerCopy; $i++) {
            $copyLevel = $i + 8000;
            $copyObj2[$copyLevel] = [-1, 1];
        }
        $copyObj2 = json_encode($copyObj2);

        $update_data2 = array('copyObj' => $copyObj2);
        $result2 = GameCopyProgress::updateCopyProgress($uid, $update_data2, 8);

        $serverId = UserSession::getUserServerId();
        $params = [
            'userId' => $uid,
            'highPaTa' => $towerCopy,
        ];
        $result3 = GameUser::updateRoleInfoByApi($serverId, $params);

        $userParam = [
            'highPaTa' => $towerCopy
        ];
        $result4 = GameUser::updateRoleInfo($uid, $userParam);
    }
    Common::exitWithSuccess ('修改完成','user/role_progress.php?uid='.$uid);
}

Template::assign('_GET', $_GET);
Template::assign('normalNum', $normalNum);
Template::assign('goldNum', $goldNum);
Template::assign('expNum', $expNum);
Template::assign('towerNum', $towerNum);
Template::display('user/role_progress.tpl');