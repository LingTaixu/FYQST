<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!-- START 以上内容不需更改，保证该TPL页内的标签匹配即可 -->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="well">
    <ul class="nav nav-tabs">
        <li class="active"><a href="#home" data-toggle="tab">编辑行会数据</a></li>
    </ul>

    <div id="myTabContent" class="tab-content">
        <div class="tab-pane active in" id="home">

            <form id="tab" method="post" action="">
                行会ID
                <input type="text" name="gid" value="<{$guild_info.id}>"  required="true">
                名称
                <input type="text" name="name" value="<{$guild_info.name}>" required="true" >
                等 级
                <input type="text" name="lvl" value="<{$guild_info.lvl}>" required="true" >
                </br>日活跃度
                <input type="text" name="todayHyd" value="<{$guild_info.todayHyd}>" required="true" >
                周活跃度
                <input type="text" name="weekHyd" value="<{$guild_info.weekHyd}>" required="true" >
                日福利值
                <input type="text" name="fuli" value="<{$guild_info.fuli}>" required="true" >
                </br>
                <div class="btn-toolbar">
                    <button type="submit" class="btn btn-primary"><strong>提交修改</strong></button>
                </div>
            </form>
        </div>
    </div>
</div>
<!-- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 -->
<{include file="footer.tpl" }>