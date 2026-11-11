<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!-- START 以上内容不需更改，保证该TPL页内的标签匹配即可 -->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="well">
    <ul class="nav nav-tabs">
        <li class="active"><a href="#home" data-toggle="tab">请填写跨服战斗分组信息</a></li>
    </ul>

    <div id="myTabContent" class="tab-content">
        <div class="tab-pane active in" id="home">

            <form id="tab" method="post" action="" autocomplete="off">
                <label>ID</label>
                <input type="text" name="id" value="<{$battleGroupInfo.id}>" readonly="true">
                <label>组名</label>
                <input type="text" name="name" id="name" value="<{$battleGroupInfo.name}>" class="input-xlarge" required="true" >

                <label>分组信息</label>
                <input type="text" name="serverArr" id="serverArr" value="<{$battleGroupInfo.serverArr}>" class="input-xlarge" required="true" >

                <label>battleHost</label>
                <input type="text" name="battleHost" id="battleHost" value="<{$battleGroupInfo.battleHost}>" class="input-xlarge" required="true" >
                <label>battlePort</label>
                <input type="text" name="battlePort" id="battlePort" value="<{$battleGroupInfo.battlePort}>" class="input-xlarge" required="true" >

                <label>battleId</label>
                <input type="text" name="battleId" id="battleId" value="<{$battleGroupInfo.battleId}>" class="input-xlarge" required="true" >

                <div class="btn-toolbar">
                    <button type="submit" class="btn btn-primary"><strong>提交</strong></button>
                    <div class="btn-group"></div>
                </div>
            </form>
        </div>
    </div>
</div>
<!-- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 -->
<{include file="footer.tpl" }>