<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!-- START 以上内容不需更改，保证该TPL页内的标签匹配即可 -->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>
<div class="well">
    <ul class="nav nav-tabs">
        <li class="active"><a href="#home" data-toggle="tab">请修改服务器配置</a></li>
    </ul>

    <div id="myTabContent" class="tab-content">
        <div class="tab-pane active in" id="home">


                <form class="form-horizontal" id="tab" method="post" action="">
                    <fieldset>
                        <div class="control-group">
                            <label class="control-label" >ID</label>
                            <div class="controls">
                                <input type="text" name="id" value="<{$server.id}>" readonly="true">
                            </div>
                        </div>
                        <div class="control-group">
                            <label class="control-label" >游戏名</label>
                            <div class="controls">
                                <input type="text" name="name" value="<{$server.name}>" >
                            </div>
                        </div>
                        <div class="control-group">
                            <label class="control-label" >区服名</label>
                            <div class="controls">
                                <input type="text" name="area" value="<{$server.area}>" >
                            </div>
                        </div>
                        <div class="control-group">
                            <label class="control-label" >是否新服</label>

                            <div class="controls">
                                <{html_options id="isNew" name="isNew" options=$news_status selected=$server.isNew}>
                            </div>

                        </div>
                        <div class="control-group">
                            <label class="control-label" >状态</label>
                            <div class="controls">
                                <{html_options id="status" name="status" options=$server_status selected=$server.status}>
                            </div>
                        </div>
                        <div class="control-group">
                            <label class="control-label" >维护状态</label>

                            <div class="controls">
                                <{html_options id="isClose" name="isClose" options=$maintenance_status selected=$server.isClose}>
                            </div>

                        </div>
                        <div class="control-group">
                            <label class="control-label" >开服日期</label>
                            <div class="controls">
                                <input type="text" id="serverDate" name="serverDate" value="<{$server.serverDate}>">
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
        var date=$("#serverDate" );
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