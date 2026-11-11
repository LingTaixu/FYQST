<?php
require ('../include/init.inc.php');
$serverId = $id = $page_no = $search = $change = $selectServer = '';
extract ( $_REQUEST, EXTR_IF_EXISTS );

$serverDiv = Help::getServerInput($selectServer);
//START 数据库查询及分页数据
$page_size = PAGE_SIZE;
$page_no=$page_no<1?1:$page_no;

/**
 * 服务器状态
 */
// serverStatus = {
//    closed:0,//维护
//    good:1,//良好
//    normal:2,//正常
//    hot:3,//火爆
//    notOpen:4//未开放
//};

//矫正服务器活动时间，根据开服时间
if ($change) {
    $serversInfo = GameServerInfo::getEveryServer();
    $gameServerArr = $servers = [];
    foreach ($serversInfo as $row) {
        $servers[$row['serverId']] = $row;
        $gameServerArr[] = $row['serverId'];
    }

    $selectServers = Help::getSelectedServers($gameServerArr, $selectServer);
    $selectIds = $selectServers['selectId'];
    if ($selectIds) {
        foreach ($selectIds as $sid) {
            $openTime = $servers[$sid]['serverDate'];
            GameActivity::openServer($sid, $openTime);
        }
    }
    Common::exitWithSuccess('全服活动时间矫正成功', "user/server_list.php?selectServer={$selectServer}&search={$search}");
}

if($search){
    $row_count =  GameServerInfo::count ();
    $total_page=$row_count%$page_size==0?$row_count/$page_size:ceil($row_count/$page_size);
    $total_page=$total_page<1?1:$total_page;
    $page_no=$page_no>($total_page)?($total_page):$page_no;
    $start = ($page_no - 1) * $page_size;
    $server_infos = GameServerInfo::getListByServerId ($serverId, $start , $page_size );

}else{
    $row_count = GameServerInfo::count ();
    $total_page=$row_count%$page_size==0?$row_count/$page_size:ceil($row_count/$page_size);
    $total_page=$total_page<1?1:$total_page;
    $page_no=$page_no>($total_page)?($total_page):$page_no;
    $start = ($page_no - 1) * $page_size;
    $server_infos = GameServerInfo::getList ( $start , $page_size );
}

// 服务器状态
$monitUrls = getPM2WebUrl();
$plist = [];
foreach ($monitUrls as $k => $url){
    //echo $url;
    $p = Utils::monitServer($url);
    $plist = array_merge($plist, $p);
}

$server_infos2 = [];
foreach ($server_infos as $k => $server){
    $sid = $server['id'];
    $sname  = getServerName($sid);
    if ($plist[$sname]){
        $server['run'] = $plist[$sname];
    }else{
        $server['run'] = 'unknown';
    }
    $csname  = getCityServerName($sid);
    if ($plist[$csname]){
        $server['csrun'] = $plist[$csname];
    }else{
        $server['csrun'] = 'unknown';
    }
    $server_infos2[$k] = $server;
}
$page_html=Pagination::showPager("server_list.php?serverId=$serverId&search=$search",$page_no,$page_size,$row_count);

//追加操作的确认层
$confirm_html = OSAdmin::renderJsConfirm("icon-pencil");

// 设置模板变量
$group_options=UserGroup::getGroupForOptions();
$group_options[0] = "全部";
ksort($group_options);

Template::assign('serverDiv', $serverDiv);
Template::assign ( 'group_options', $group_options );
Template::assign ( 'server_infos', $server_infos2 );
Template::assign ( '_GET', $_GET );
Template::assign ( 'page_no', $page_no );
Template::assign ( 'page_html', $page_html );
Template::assign ( 'osadmin_action_confirm' , $confirm_html);
Template::display ( 'user/server_list.tpl' );
