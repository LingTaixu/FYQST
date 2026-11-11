<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!-- START 以上内容不需更改，保证该TPL页内的标签匹配即可 -->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="well">
    <ul class="nav nav-tabs">
        <li class="active"><a href="#home" data-toggle="tab">请填写</a></li>
    </ul>

    <div id="myTabContent" class="tab-content">
        <div class="tab-pane active in" id="home">

            <form id="tab" method="post" action="" autocomplete="off">
                <label>服务器</label>
                <{html_options name="serverId" options=$serverlist selected=$info.serverId}>
                <label>公告类型</label>
                <{html_options name="type" options=$queryoptionlist selected=$info.type}>
                <label>字体颜色</label>
                <input id="color_b" type="text" class="input_cxcolor" name="color"  value="<{$info.color}>" readonly required="true" >
                <label>字体大小</label>
                <input type="text" name="size" value="<{$info.size}>" class="input-large" required="true">

                <label>显示次数</label>
                <input type="text" name="times" value="<{$info.times}>" class="input-large" required="true" >
                <label>间隔时间</label>
                <input type="text" name="interval" value="<{$info.interval}>" class="input-large" required="true" >
                <label>发送时间</label>
                <input type="text" name="sendTime" id="sendTime" value="<{$info.sendTime}>" class="input-xlarge" required="true" >
                <label>过期时间</label>
                <input type="text" name="expireTime" id="expireTime" value="<{$info.expireTime}>" class="input-xlarge" required="true" >

                <label>内容</label>
                <textarea name="message" rows="3" class="input-xlarge" required="true"><{$info.message}></textarea>



                <div class="btn-toolbar">
                    <button type="submit" class="btn btn-primary"><strong>提交修改</strong></button>
                    <div class="btn-group"></div>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
    $(function() {
        var date=$( "#sendTime" );
        date.datetimepicker({
            showSecond: true,
            dateFormat: 'yy-mm-dd',
            timeFormat: 'HH:mm:ss',
            stepHour: 1,
            stepMinute: 1,
            stepSecond: 1
        })
    });
    $(function() {
        var date=$( "#expireTime" );
        date.datetimepicker({
            showSecond: true,
            dateFormat: 'yy-mm-dd',
            timeFormat: 'HH:mm:ss',
            stepHour: 1,
            stepMinute: 1,
            stepSecond: 1
        })
    });
    $("#color_b").cxColor();
</script>

<!-- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 -->
<{include file="footer.tpl" }>