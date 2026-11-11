<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!-- START 以上内容不需更改，保证该TPL页内的标签匹配即可 -->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="well">
    <ul class="nav nav-tabs">
        <li class="active"><a href="#home" data-toggle="tab">请填写生成礼包码信息</a></li>
    </ul>

    <div id="myTabContent" class="tab-content">
        <div class="tab-pane active in" id="home">

            <form id="tab" method="post" action="">
                <div class="control-group">
                    <label class="control-label" >礼包类型</label>
                    <div class="controls">
                        <{html_options name="type" options=$type}>
                    </div>
                </div>
                <label>礼包名称</label>
                <input type="text" name="name" value="<{$_POST.name}>" class="input-xlarge" required="true"  autofocus="true" >
                <label>礼包描述</label>
                <input type="text" name="content" value="<{$_POST.content}>" class="input-xlarge" required="true"  autofocus="true" >
                <label>物品</label>
                <input type="text" name="items" value="<{$_POST.items}>" class="input-xlarge" required="true"  autofocus="true" >
                <label>生效时间</label>
                <input type="text" name="startTime" id="startTime" value="<{$_POST.startTime}>" class="input-xlarge" required="true"  autofocus="true" >
                <label>截止时间</label>
                <input type="text" name="endTime" id="endTime" value="<{$_POST.endTime}>" class="input-xlarge" required="true"  autofocus="true" >

                <label>兑换码领取周期(单位天数内只可领取一次 0无限制)</label>
                <input type="text" name="period" value="<{$_POST.period}>" class="input-xlarge" required="true"  autofocus="true" >天

                <label>数量（一次最多生成5000个）</label>
                <input type="text" name="count" value="<{$_POST.count}>" class="input-xlarge" required="true" autofocus="true" >


                <div class="btn-toolbar">
                    <button type="submit" class="btn btn-primary"><strong>提交</strong></button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 -->
<{include file="footer.tpl" }>
<script>
    $(function() {
        var date=$( "#startTime" );
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
        var date=$( "#endTime" );
        date.datetimepicker({
            showSecond: true,
            dateFormat: 'yy-mm-dd',
            timeFormat: 'HH:mm:ss',
            stepHour: 1,
            stepMinute: 1,
            stepSecond: 1
        })
    });
    //发送时间 过期时间 填上默认值
    $(document).ready(function () {
        if($( "#startTime" ).val() == ''){
            var time1 = new Date().Format("yyyy-MM-dd HH:mm:ss");
            $( "#startTime" ).val(time1);
        }
        if($( "#endTime" ).val() == ''){
            var time2 = new Date();
            time2.setDate(time2.getDate() + 90);
            time2 = time2.Format("yyyy-MM-dd HH:mm:ss");
            $( "#endTime" ).val(time2);
        }
        if($("input[name='period']").val() == ''){
            $("input[name='period']").val(0);
        }
        if($("input[name='count']").val() == ''){
            $("input[name='count']").val(10);
        }
    });
</script>