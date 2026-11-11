<?php

require ('../include/init.inc.php');
$gamerole_id = $content = "";
extract ( $_GET, EXTR_IF_EXISTS );

//START
//$row_count = CustomerChat::count ($gamerole_id);

//$page_size =  PAGE_SIZE;
//$page_no=$page_no<1?1:$page_no;
//
//$total_page=$row_count%$page_size==0?$row_count/$page_size:ceil($row_count/$page_size);
//$total_page=$total_page<1?1:$total_page;
//$page_no=$page_no>($total_page)?($total_page):$page_no;
//$start = ($page_no - 1) * $page_size;
//END

$gamerole = CustomerRole::getGameRole($gamerole_id);
$start = 0;
$page_size = 200;
$chat_list = CustomerChat::getList($gamerole_id,$start,$page_size);

//$page_html=Pagination::showPager("customer_chat.php?gamerole_id=$gamerole_id",$page_no,PAGE_SIZE,$row_count);
//Template::assign ( 'page_no', $page_no );
//Template::assign ( 'page_size', PAGE_SIZE );
//Template::assign ( 'row_count', $row_count );
//Template::assign ( 'page_html', $page_html );
Template::assign ( 'chat_list', $chat_list);
Template::assign ( 'role', $gamerole);
Template::assign ( 'content', $content);
Template::assign ( '_GET', $_GET);
Template::display ( 'user/customer_chat.tpl' );
