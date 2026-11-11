<?php
require ('../include/init.inc.php');
$id =  $serverId = $accountId = $transId = $method  = $page_no = $search = '';
extract ( $_REQUEST, EXTR_IF_EXISTS );

//START 数据库查询及分页数据
$page_size = PAGE_SIZE;
$page_no=$page_no<1?1:$page_no;

if ($method == "repay" && $id != ""){

    $update_data = array ('gmStatus' => 1, 'status' => 1 );
    $result = RechargeRequest::update ( $id,$update_data );

    if ($result>=0) {
        Common::exitWithSuccess ('补单完成','user/pay_list.php');
    } else {
        OSAdmin::alert("error");
    }
}

if($search){
    $row_count =  RechargeRequest::count ($serverId,$accountId,$transId);
    $total_page=$row_count%$page_size==0?$row_count/$page_size:ceil($row_count/$page_size);
    $total_page=$total_page<1?1:$total_page;
    $page_no=$page_no>($total_page)?($total_page):$page_no;
    $start = ($page_no - 1) * $page_size;
    $pay_infos = RechargeRequest::getList ($serverId,$accountId,$transId, $start , $page_size );

}else{
    $row_count = RechargeRequest::count (NULL,NULL, NULL);
    $total_page=$row_count%$page_size==0?$row_count/$page_size:ceil($row_count/$page_size);
    $total_page=$total_page<1?1:$total_page;
    $page_no=$page_no>($total_page)?($total_page):$page_no;
    $start = ($page_no - 1) * $page_size;
    $pay_infos = RechargeRequest::getList (NULL, NULL, NULL, $start , $page_size );
}
$page_html=Pagination::showPager("pay_list.php?serverId=$serverId&accountId=$accountId&transId=$transId&method=$method&search=$search",$page_no,$page_size,$row_count);

//追加操作的确认层
$confirm_html = OSAdmin::renderJsConfirm("icon-pencil");

Template::assign ( 'pay_infos', $pay_infos );
Template::assign ( '_GET', $_GET );
Template::assign ( 'page_no', $page_no );
Template::assign ( 'page_html', $page_html );
Template::assign ( 'osadmin_action_confirm' , $confirm_html);
Template::display ( 'user/pay_list.tpl' );
