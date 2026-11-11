<?php

require ('../include/init.inc.php');
$gid =  $lvl = $todayHyd = $weekHyd = $fuli = "";
extract ( $_REQUEST,  EXTR_IF_EXISTS );

if (Common::isPost ()) {
    //var_dump($_REQUEST);exit(0);
    if($gid =="" ){
        OSAdmin::alert("error",ErrorMessage::NEED_PARAM);
    }else{
        $guildInfo = GameGuild::getGuildById($gid);
        $chairmanId = $guildInfo['chairmanId'];
        $lvlcfg = $CONFIG_LVL[$lvl];
        $addUpAct = $lvlcfg['guildExp'];
        $update_data = array ('lvl' => $lvl, 'addUpAct' => $addUpAct, 'todayHyd' => $todayHyd, 'weekHyd' => $weekHyd, 'fuli' =>$fuli);
        $result = GameGuild::updateGuildInfo($gid,$update_data );
        $update_data2 = array ('addUpAct' => $addUpAct);
        GameGuildPersonal::updateGuildInfo($gid, $chairmanId, $update_data2);

        $p = $update_data;
        $p = array("_0"=>$gid, "_1" => array(
            array("lvl",$lvl),
            array("addUpAct",$addUpAct),
            array("todayHyd",$todayHyd),
            array("weekHyd",$weekHyd),
            array("fuli",$fuli)
            ));
        $para = json_encode($p);

        //$url = "http://127.0.0.1:24200/?r=admin.guild.b&a=$para&s=0&c=0&ak=JAGAHSAAJDF1FRHGAHAJKASKL34TSAFDSDFGA335";
        $url = GAME_SERVER1_URL."/?r=admin.guild.c&a=".$para."&s=0&c=0&ak=".GAME_SERVER_ADMKEY;
        $ret = Common::curlGet($url);
        //var_dump($ret); exit(0);
        if ($result>=0) {
            // SysLog::addLog ( UserSession::getUserName(), 'MODIFY', 'Module' ,$module_id, json_encode($update_data) );
            Common::exitWithSuccess ('修改完成','user/guild.php?gid='.$gid);
        } else {
            OSAdmin::alert("error");
        }
    }
}

$guildInfo = GameGuild::getGuildById($gid);

Template::assign ( '_GET', $_GET);
Template::assign ( 'guild_info', $guildInfo);
Template::display ( 'user/guild.tpl' );