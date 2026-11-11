<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!-- START 以上内容不需更改，保证该TPL页内的标签匹配即可 -->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>
<div class="well">
    <ul class="nav nav-tabs">
        <li class="active"><a href="#home" data-toggle="tab">活动编辑</a></li>
    </ul>

    <div id="myTabContent" class="tab-content">
        <div class="tab-pane active in" id="home">
            <form class="form-horizontal" id="tab" method="post" action="">
                <fieldset>
                    <div class="control-group">
                        <label class="control-label" >活动ID</label>
                        <div class="controls">
                            <input type="text" name="id" value="<{$activity.id}>" readonly="true">
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label" >活动类型</label>
                        <div class="controls">
                            <input type="text" name="type" value="<{$activity.type}>"  readonly="true">
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label" >活动排序</label>
                        <div class="controls">
                            <input type="text" name="sort" value="<{$activity.sort}>" >
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label" >开放状态</label>
                        <div class="controls">
                            <{html_options id="openStatus" name="openStatus" options=$open_options_list selected=$activity.isOpen}>
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label" >活动简称</label>
                        <div class="controls">
                            <input type="text" name="title" value="<{$activity.title}>" >
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label" >活动全称</label>
                        <div class="controls">
                            <input type="text" name="fullTitle" value="<{$activity.fullTitle}>" >
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label" >开始日期</label>
                        <div class="controls">
                            <input type="text" id="startTime" name="startTime" value="<{$activity.startTime}>">
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label" >结束日期</label>
                        <div class="controls">
                            <input type="text" id="endTime" name="endTime" value="<{$activity.endTime}>">
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label" >[数据库字段]items</label>
                        <div class="controls">
                            <textarea  rows="3" id="items" name="items" class="input-xlarge" required="true"><{$activity.items}></textarea>
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label" >[数据库字段]exValues</label>
                        <div class="controls">
                            <textarea rows="3" id="exValues" name="exValues" class="input-xlarge"  ><{$activity.exValues}></textarea>
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label" >[数据库字段]exValues2</label>
                        <div class="controls">
                            <textarea  rows="3" id="exValues2" name="exValues2" class="input-xlarge"  ><{$activity.exValues2}></textarea>
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label" >[数据库字段]exValues3</label>
                        <div class="controls">
                            <textarea  rows="3" id="exValues3" name="exValues3" class="input-xlarge"  ><{$activity.exValues3}></textarea>
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label" >[数据库字段]exData</label>
                        <div class="controls">
                            <textarea  rows="3" id="exData" name="exData" class="input-xlarge" ><{$activity.exData}></textarea>
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label" >备注note</label>
                        <div class="controls">
                            <textarea  rows="10" id="note" name="note" class="input-xxlarge" ><{$activity.note}></textarea>
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label" >是否修改所有服</label>

                        <div class="controls">
                            <{html_options id="op_all" name="op_all" options=$op_server selected=0}>
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
        var date=$("#startTime" );
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
</script>
<!-- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 -->
<{include file="footer.tpl" }>