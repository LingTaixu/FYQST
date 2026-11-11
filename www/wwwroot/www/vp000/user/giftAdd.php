<?php
require ('../include/init.inc.php');
$type = $name = $content = $startTime = $endTime = $items = $period = $count = '';
extract ( $_POST, EXTR_IF_EXISTS );
if (Common::isPost ()) {
    if(!is_numeric($count) || $count==0){
        OSAdmin::alert("error",ErrorMessage::NEED_PARAM);
    }elseif($count >200000){
        OSAdmin::alert("error","一次最多生成200000个");
    }else{
        $input_data = array ('type' => $type,'name' => $name,'content' => $content,'startTime' => $startTime,'endTime' => $endTime,'items' => $items,'period' => $period);
        $id = Gift::addGift ($input_data,$count);
        if ($id) {
            //SysLog::addLog ( UserSession::getUserName(), 'ADD', 'Gift' ,$type, json_encode($input_data) );
            Common::exitWithSuccess ('礼包生成完成','user/gift.php');
        }
    }
}
$type = ['只可领一次','无限制'];
Template::assign ( 'type', $type );
Template::assign("_POST" ,$_POST);
Template::display('user/gift_add.tpl' );
