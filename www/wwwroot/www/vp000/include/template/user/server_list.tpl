<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>

<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="btn-toolbar" style="margin-bottom:2px;">
    <a href="server_add.php" class="btn btn-primary"><i class="icon-plus"></i> 服务器</a>
    <a data-toggle="collapse" data-target="#search"  href="#" title= "检索"><button class="btn btn-primary" style="margin-left:5px"><i class="icon-search"></i></button></a>
    <a data-toggle="collapse" data-target="#change"  href="#" title= "矫正"><button class="btn btn-primary" style="margin-left:5px">矫正服务器时间</button></a>
</div>
    <{if $_GET.search }>
    <div id="search" class="collapse in">
    <{else }>
    <div id="search" class="collapse out" >
        <{/if }>
        <form class="form_search"  action="" method="GET" style="margin-bottom:0px">
            <div style="float:left;margin-right:5px">
                <label>查询服务器ID</label>
                <input type="text" name="serverId" value="<{$_GET.serverId}>" placeholder="输入服务器ID" >
                <input type="hidden" name="search" value="1" >
            </div>
            <div class="btn-toolbar" style="padding-top:25px;padding-bottom:0px;margin-bottom:0px">
                <button type="submit" class="btn btn-primary">检索</button>
            </div>
            <div style="clear:both;"></div>
        </form>
    </div>

<{if $_GET.change }>
<div id="change" class="collapse in">
    <{else }>
    <div id="change" class="collapse out" >
        <{/if }>
        <form class="form_search"  action="" method="GET" style="margin-bottom:0px">
            <div style="float:left;margin-right:5px">
                <{$serverDiv}>
                <input type="hidden" name="change" value="1" >
            </div>
            <div class="btn-toolbar" style="padding-top:25px;padding-bottom:0px;margin-bottom:0px">
                <button type="submit" class="btn btn-primary">矫正</button>
            </div>
            <div style="clear:both;"></div>
        </form>
    </div>

    <div class="block">
        <a href="#page-stats" class="block-heading" data-toggle="collapse">账号列表</a>
        <div id="page-stats" class="block-body collapse in">
            <table class="table table-striped">
                <thead>
                <tr>
                    <th style="width:20px">#</th>
                    <th style="width:60px">游戏</th>
                    <th style="width:50px">区服</th>
                    <th style="width:150px">host</th>
                    <th style="width:50px">是否新服</th>
                    <th style="width:60px">服务器状态</th>
                    <th style="width:60px">维护状态</th>
                    <th style="width:80px">开服时间</th>
                    <th style="width:40px">运行状态</th>
                    <th style="width:40px">主城运行状态</th>
                    <th style="width:80px">管理</th>
                </tr>
                </thead>
                <tbody>
                <{foreach name=serdver from=$server_infos item=server_info}>
                    <tr>
                        <td><{$server_info.id}></td>
                        <td><{$server_info.name}></td>
                        <td><{$server_info.area}></td>
                        <td><{$server_info.host}></td>
                        <td>
                            <{if $server_info.isNew == 0}>
                            非新服
                            <{else if $server_info.isNew == 1}>
                            新服
                            <{/if}>
                        </td>
                        <td>
                            <{if $server_info.status == 1}>
                            良好
                            <{else if $server_info.status == 2}>
                            正常
                            <{else if $server_info.status == 3}>
                            火爆
                            <{else if $server_info.status == 3}>
                            未开放
                            <{/if}>
                        </td>


                        <td>
                            <{if $server_info.isClose == 0}>
                            正常
                            <{else if $server_info.isClose == 1}>
                            维护
                            <{/if}>
                        </td>
                        <td><{$server_info.serverDate}></td>
                        <td><{$server_info.run}></td>
                        <td><{$server_info.csrun}></td>
                        <td>
                            <a href="server_modify.php?id=<{$server_info.id}>" title= "修改状态" ><i class="icon-pencil"></i></a>
                            <a href="server_mgr.php?id=<{$server_info.id}>" title= "单服监测" ><i class="icon-adjust"></i></a>
                        </td>
                    </tr>
                    <{/foreach}>
                </tbody>
            </table>
            <!--- START 分页模板 --->

            <{$page_html}>

            <!--- END --->
        </div>
    </div>

    <!---操作的确认层，相当于javascript:confirm函数--->
    <{$osadmin_action_confirm}>

    <!--- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 --->
    <{include file="footer.tpl" }>