<?php
    /*
     *  设置玩家为白名单
     */

    require ('../include/init.inc.php');
    $op = $open_id = $channel_id = "";

    if (Common::isPost ()) {
        extract ( $_POST, EXTR_IF_EXISTS );
        if($open_id =="" || $channel_id == "" ){
            OSAdmin::alert("error",ErrorMessage::NEED_PARAM);
        }else{
            $result = GameAccount::setWhiteList ( $open_id,$channel_id, 3 );

            if ($result>0) {
                // SysLog::addLog ( UserSession::getUserName(), 'MODIFY', 'UserGroup' ,$group_id, json_encode($update_data) );
                Common::exitWithSuccess ( '白名单修改完成','user/white_list.php' );
            } else {

                OSAdmin::alert("error");
            }
        }
    }


    extract ( $_GET, EXTR_IF_EXISTS );
    if($op =="delete"){
        GameAccount::setWhiteList ( $open_id,$channel_id, 0 );
    }

    $userList = GameAccount::getWhiteList();

    Template::assign ( 'channel_ids', $CHANNEL_IDS);
    Template::assign ( 'userList', $userList);
    Template::display ( 'user/white_list.tpl' );