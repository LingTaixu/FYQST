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
                <{html_options name="serverId" options=$serverlist selected=$_POST.serverId}>
                <label>公告类型</label>
                <{html_options name="type" options=$queryoptionlist selected=$_POST.type}>
                <label>字体颜色</label>
                <input id="color_b" type="text" class="input_cxcolor" name="color"  value="<{$_POST.color}>" readonly required="true" >

                <label>字体大小</label>
                <input type="text" name="size" value="<{$_POST.size}>" class="input-large" required="true">

                <label>显示次数</label>
                <input type="text" name="times" value="<{$_POST.times}>" class="input-large" required="true" >次
                <label>间隔时间</label>
                <input type="text" name="interval" value="<{$_POST.interval}>" class="input-large" required="true" >秒
                <label>发送时间</label>
                <input type="text" name="sendTime" id="sendTime" value="<{$_POST.sendTime}>" class="input-xlarge" required="true" placeholder="">
                <label>过期时间</label>
                <input type="text" name="expireTime" id="expireTime" value="<{$_POST.expireTime}>" class="input-xlarge" required="true" placeholder="">

                <label>内容</label>
                <textarea name="message" rows="3" class="input-xlarge" required="true"><{$_POST.message}></textarea>



                <div class="btn-toolbar">
                    <button type="submit" class="btn btn-primary"><strong>提交</strong></button>
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
    //发送时间 过期时间 填上默认值
    $(document).ready(function () {
        if($( "#sendTime" ).val() == ''){
            var time1 = new Date().Format("yyyy-MM-dd HH:mm:ss");
            $( "#sendTime" ).val(time1);
        }
        if($( "#expireTime" ).val() == ''){
            var time2 = new Date();
            time2.setDate(time2.getDate() + 1);
            time2 = time2.Format("yyyy-MM-dd HH:mm:ss");
            $( "#expireTime" ).val(time2);
        }
        if($("input[name='size']").val() == ''){
            $("input[name='size']").val(18);
        }

        if($("input[name='times']").val() == ''){
            $("input[name='times']").val(5);
        }
        if($("input[name='interval']").val() == ''){
            $("input[name='interval']").val(60);
        }
    });
    $("#color_b").cxColor({
        color:"#FF0000"
    });
</script>

<!-- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 -->
<{include file="footer.tpl" }>