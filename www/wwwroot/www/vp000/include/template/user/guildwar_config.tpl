<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!-- START 以上内容不需更改，保证该TPL页内的标签匹配即可 -->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>
<div class="well">
    <ul class="nav nav-tabs">
        <li class="active"><a href="#home" data-toggle="tab">编辑公会战日期配置</a></li>
    </ul>

    <div id="myTabContent" class="tab-content">
        <div class="tab-pane active in" id="home">


            <form class="form-horizontal" id="tab" method="post" action="">
                <fieldset>
                    <div class="control-group">
                        <label class="control-label" >报名开始时间</label>
                        <div class="controls">
                            <input type="text" id="signOpen" name="signOpen" value="<{$GuildWarCfg.signOpen}>" >
                        </div>
                    </div>

                    <div class="control-group">
                        <label class="control-label" >报名结束时间</label>
                        <div class="controls">
                            <input type="text" id="signEnd" name="signEnd" value="<{$GuildWarCfg.signEnd}>" >
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label" >行会战开始时间</label>
                        <div class="controls">
                            <input type="text" id="warOpen" name="warOpen" value="<{$GuildWarCfg.warOpen}>" >
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label" >行会战结束时间</label>
                        <div class="controls">
                            <input type="text" id="warEnd" name="warEnd" value="<{$GuildWarCfg.warEnd}>" >
                        </div>
                    </div>
                    <div class="control-group">
                        <div class="controls">
                            <button type="submit" class="btn btn-primary" id="modify"><strong>修改</strong></button>
                        </div>
                    </div>
                </fieldset>
            </form>

        </div>
    </div>
</div>
<script>
    $(function() {
        var date=$("#signOpen" );
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
        var date=$("#signEnd" );
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
        var date=$("#warOpen" );
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
        var date=$("#warEnd" );
        date.datetimepicker({
            showSecond: true,
            dateFormat: 'yy-mm-dd',
            timeFormat: 'HH:mm:ss',
            stepHour: 1,
            stepMinute: 1,
            stepSecond: 1
        })
    });
</script>
<!-- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 -->
<{include file="footer.tpl" }>