<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!-- START 以上内容不需更改，保证该TPL页内的标签匹配即可 -->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="well">
    <ul class="nav nav-tabs">
        <li class="active"><a href="#home" data-toggle="tab">请填写公告信息</a></li>
    </ul>

    <div id="myTabContent" class="tab-content">
        <div class="tab-pane active in" id="home">

            <form id="tab" method="post" action="" autocomplete="off">
                <label>服务器</label>
                <{html_checkboxes name="serverIdArr" options=$serverlist selected=$info.serverIdArr separtator=" "}>

                <label>公告类型</label>
                <{html_options name="iconType" options=$queryoptionlist selected=$info.iconType}>
                <label>标题</label>
                <input type="text" name="title" value="<{$info.title}>" class="input-xlarge" required="true" >
                <label>内容</label>
                <textarea name="content" rows="3" class="input-xlarge"><{$info.content}></textarea>
                <label>是否开启</label>
                <{html_radios name="isOpen" options=$isOpenConfig  checked=$info.isOpen separtator=" "}>
                <label>公告时间</label>
                <input type="text" name="noticeTime" id="noticeTime" value="<{$info.noticeTime}>" class="input-xlarge" required="true" >
                <label>开始时间</label>
                <input type="text" name="startTime" id="startTime" value="<{$info.startTime}>" class="input-xlarge" required="true" placeholder="">
                <label>结束时间</label>
                <input type="text" name="endTime" id="endTime" value="<{$info.endTime}>" class="input-xlarge" required="true" placeholder="">
                <label>排序</label>
                <input type="text" name="sort" value="<{$info.sort}>" class="input-xlarge" >
                <label>公告额外信息</label>
                <input type="text" name="exData" value="<{$info.exData}>" class="input-xlarge" >
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
        var date=$( "#noticeTime" );
        //date.datepicker({ dateFormat: "yy-mm-dd hh" });
        //date.datepicker( "option", "firstDay", 1 );
        date.datetimepicker({
            //showOn: "button",
            //buttonImage: "./css/images/icon_calendar.gif",
            //buttonImageOnly: true,
            showSecond: true,
            dateFormat: 'yy-mm-dd',
            timeFormat: 'HH:mm:ss',
            stepHour: 1,
            stepMinute: 1,
            stepSecond: 1
        })
    });
    $(function() {
        var date=$( "#startTime" );
        //date.datepicker({ dateFormat:  "yy-mm-dd hh" });
        //date.datepicker( "option", "firstDay", 1 );

        date.datetimepicker({
            //showOn: "button",
            //buttonImage: "./css/images/icon_calendar.gif",
            //buttonImageOnly: true,
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
        //date.datepicker({ dateFormat:  "yy-mm-dd hh" });
        //date.datepicker( "option", "firstDay", 1 );

        date.datetimepicker({
            //showOn: "button",
            //buttonImage: "./css/images/icon_calendar.gif",
            //buttonImageOnly: true,
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