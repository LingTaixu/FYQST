<?php
require ('../include/init.inc.php');
$method = $filename = '';
extract ( $_GET, EXTR_IF_EXISTS );
if ($method == 'download' && ! empty ( $filename )) {
    $result = Gift::downLoadFile ( $filename );
}
$giftFileList = Gift::getFileList();

$confirm_html = OSAdmin::renderJsConfirm("icon-remove");
Template::assign ( 'osadmin_action_confirm' , $confirm_html);
Template::assign ( 'giftFileList', $giftFileList );
Template::display ( 'user/gift_download.tpl' );
