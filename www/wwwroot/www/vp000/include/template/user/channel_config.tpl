<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!-- START 以上内容不需更改，保证该TPL页内的标签匹配即可 -->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="well">
    <ul class="nav nav-tabs">
        <li class="active"><a href="#home" data-toggle="tab">修改渠道数据</a></li>
    </ul>

    <div id="myTabContent" class="tab-content">
        <div class="tab-pane active in" id="home">

            <form id="tab" method="post" action="">
                <label>渠道ID</label>
                <input type="text" name="channelId" value="<{$outArr.channelId}>" required="true" >
                </br>
                <label>渠道名称</label>
                <input type="text" name="channelName" value="<{$outArr.channelName}>" required="true" >
                </br>
                <label>子渠道ID</label>
                <input type="text" name="sdkChannelId" value="<{$outArr.sdkChannelId}>" >
                </br>
                <label>子渠道名称</label>
                <input type="text" name="sdkChannelName" value="<{$outArr.sdkChannelName}>" >
                </br>
                <label>描述</label>
                <input type="text" name="channelDesc" value="<{$outArr.channelDesc}>" required="true" >
                <div class="btn-toolbar">
                    <button type="submit" class="btn btn-primary"><strong>提交</strong></button>
                </div>
            </form>
        </div>
    </div>
    <div id="retmsg_id" class="block-body collapse in">
    </div>
</div>

<!-- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 -->
<{include file="footer.tpl" }>