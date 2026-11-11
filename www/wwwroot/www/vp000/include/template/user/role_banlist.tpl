<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>


<div style="border:0px;padding-bottom:5px;height:auto">
    <form action="" method="GET" style="margin-bottom:0px">
        <div style="float:left;margin-right:5px">
            <label>封禁类型</label>
            <{html_options name="ban_type" options=$banTypeOptionList selected=$_GET.ban_type}>
        </div>
        <div style="float:left;margin-right:5px">
            <label>请选择查询类型</label>
            <{html_options name="class_name" options=$queryoptionlist selected=$_GET.class_name}>
        </div>
        <div style="float:left;margin-right:15px">
            <label>用户账号ID 或 角色ID 或 角色名称</label>
            <input type="text" name="user_name" value="<{$_GET.user_name}>" placeholder="输入..." >
        </div>
        <div class="btn-toolbar" style="padding-top:25px;padding-bottom:0px;margin-bottom:0px">
            <button type="submit" class="btn btn-primary"><strong>查询</strong></button>
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
                <th style="width:60px">封停状态</th>
                <th style="width:60px">禁言状态</th>
                <th style="width:20px">禁言过期时间</th>
                <th style="width:20px">设备唯一号</th>
                <th style="width:30px">操作</th>
            </tr>
            </thead>
            <tbody>
            <{foreach name=account from=$banList item=account}>
                <tr>
                    <td><{$account.name}></td>
                    <td><{$account.statusName}></td>
                    <td><{$account.bendName}></td>
                    <td><{$account.bendExpireAt}></td>

                    <td><{$account.deviceId}></td>
                    <td>

                        <a href="role_ban.php?id=<{$account.id}>" title= "封禁管理" ><i class="icon-lock"></i></a>
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
