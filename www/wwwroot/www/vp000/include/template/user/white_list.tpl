<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<div style="border:0px;padding-bottom:5px;height:auto">
    <a href="role_op.php" class="btn btn-primary"><i class="icon-plus"></i> 查询用户账号</a>
 </div>
<div style="border:0px;padding-bottom:5px;height:auto">
    <form action="" method="POST" style="margin-bottom:0px">
         <div style="float:left;margin-right:15px">
            <label>用户账号|OPENID</label>
            <input type="text" name="open_id" value="" placeholder="输入..." >
        </div>
        <div style="float:left;margin-right:15px">
            <label>ChannelID</label>
            <{html_options name="channel_id" options=$channel_ids selected=$_GET.class_name}>
        </div>
        <div class="btn-toolbar" style="padding-top:25px;padding-bottom:0px;margin-bottom:0px">

            <button type="submit" class="btn btn-primary"><strong>增加白名单</strong></button>
        </div>
        <div style="clear:both;"></div>
    </form>
</div>
<div class="block">
    <a href="#page-stats" class="block-heading" data-toggle="collapse">角色列表</a>
    <div id="page-stats" class="block-body collapse in">
        <table class="table table-striped">
            <thead>
            <tr>
                <th style="width:30px">账号</th>
                <th style="width:60px">平台ID</th>
                <th style="width:30px">编辑</th>
            </tr>
            </thead>
            <tbody>
            <{foreach name=account from=$userList item=account}>
                <tr>
                    <td><{$account.name}></td>
                    <td><{$account.channelId}></td>
                    <td>
                        <a href="white_list.php?op=delete&open_id=<{$account.name}>&channel_id=<{$account.channelId}>" title= "删除" ><i class="icon-remove"></i></a>
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

<!--- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 --->
<{include file="footer.tpl" }>
