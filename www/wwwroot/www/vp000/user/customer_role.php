<?php

require ('../include/init.inc.php');
$page_no = "";
extract ( $_GET, EXTR_IF_EXISTS );

//START
$row_count = CustomerRole::count ();

$page_size = PAGE_SIZE;
$page_no=$page_no<1?1:$page_no;

$total_page=$row_count%$page_size==0?$row_count/$page_size:ceil($row_count/$page_size);
$total_page=$total_page<1?1:$total_page;
$page_no=$page_no>($total_page)?($total_page):$page_no;
$start = ($page_no - 1) * $page_size;
//END

$data = [];
$quest_list = CustomerRole::getList($start,$page_size);
$userIds = [];
foreach ($quest_list as $item) {
    $userIds[$item['area']][] = $item['role_id'];
    $data[$item['role_id']] = $item;
}
if ($userIds) {
    foreach ($userIds as $sid => $users) {
        $params = [
            'users' => $users
        ];
        $loginInfo = GameLogin::getLastLogin($sid, $params);
        foreach ($loginInfo as $login) {
            $data[$login['user_id']]['lastLogin'] = $login['lastLogin'];
        }

        $params['servers'] = array($sid);
        $recharge = RechargeRequest::getUserRechargeList($params);
        $rechargeInfo = $recharge['list'];
        foreach ($rechargeInfo as $r) {
            $data[$r['userId']]['totalNum'] = $r['totalNum'];
        }
    }
}

$page_html=Pagination::showPager("customer_role.php",$page_no,PAGE_SIZE,$row_count);
Template::assign ( 'page_no', $page_no );
Template::assign ( 'page_size', PAGE_SIZE );
Template::assign ( 'row_count', $row_count );
Template::assign ( 'page_html', $page_html );
Template::assign ( 'quest_list', $data);
Template::assign ( '_GET', $_GET);
Template::display ( 'user/customer_role.tpl' );
