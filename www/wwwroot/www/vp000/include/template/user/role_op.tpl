<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div style="border:0px;padding-bottom:5px;height:auto">
    <form action="" method="GET" style="margin-bottom:0px">
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
    <a href="#page-stats" class="block-heading" data-toggle="collapse">角色信息</a>
    <div id="page-stats" class="block-body collapse in">
        <table class="table table-striped">
            <thead>
            <tr>
                <th style="width:30px">账号名</th>
                <th style="width:30px">UID</th>
                <th style="width:60px">角色名称</th>
                <th style="width:20px">等级</th>
                <th style="width:20px">操作</th>
            </tr>
            </thead>
            <tbody>
            <{foreach name=player from=$player_info item=player}>
                <tr>
                    <td><{$player.openId}></td>
                    <td><{$player.id}></td>
                    <td><{$player.nickName}></td>
                    <td><{$player.lvl}></td>
                    <td>
                        <a href="role_info.php?nick=<{$player.nickName}>&uid=<{$player.id}>" title= "查看玩家信息" ><i class="icon-zoom-in"></i></a>
                        <a href="role_reward.php?nick=<{$player.nickName}>&uid=<{$player.id}>" title= "玩家获取物品" ><i class="icon-download-alt"></i></a>
                        <a href="role_diamond.php?nick=<{$player.nickName}>&uid=<{$player.id}>" title= "查看钻石消耗" ><i class="icon-heart-empty"></i></a>
                        <a href="role_modify.php?nick=<{$player.nickName}>&uid=<{$player.id}>" title= "修改基础数据" ><i class="icon-user"></i></a>
                        <a href="role_progress.php?nick=<{$player.nickName}>&uid=<{$player.id}>" title= "修改关卡数据" ><i class="icon-lock"></i></a>
                        <a href="role_mail.php?nick=<{$player.nickName}>&uid=<{$player.id}>" title= "发送邮件" ><i class="icon-envelope"></i></a>
                        <a href="role_mail2.php?nick=<{$player.nickName}>&uid=<{$player.id}>" title= "发送邮件2" ><i class="icon-envelope"></i></a>
                        <a href="guild.php?nick=<{$player.nickName}>&gid=<{$player.guildId}>" title= "玩家行会" ><i class="icon-home"></i></a>
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