<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>

<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->
<style type="text/css">
    #ui-datepicker-div {
        top: 50px !important;
    }
</style>
<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="btn-toolbar" style="margin-bottom:2px;">
    <form class="form_search" id="form_search" action="" method="GET" style="margin-bottom:0px">
        <ul>
            <li style="float:left;margin-right:5px">
                <div style="float:left;margin-right:5px">
                    <{$serverDiv}>
                </div>
                <div style="float:left;margin-right:5px">
                    <label>拉霸次数</label>
                    <select name='labaNum' id='labaNum'>
                        <{foreach $labaNumArr as $lKey => $laba}>
                            <{if $lKey eq $_GET.labaNum }>
                            <option value = '<{$lKey}>' selected=selected><{$laba}></option>
                            <{else}>
                            <option value = '<{$lKey}>'><{$laba}></option>
                            <{/if}>
                        <{/foreach}>
                    </select>
                </div>
            </li>
            <li style="float:left;margin-right:5px">
                <div style="float:left;margin-right:5px">
                    <label>开始时间</label>
                    <input type="text" name="startTime" id="startTime" value="<{$startTime}>" class="input-xlarge" placeholder="">
                </div>
                <div style="float:left;">
                    <label>结束时间</label>
                    <input type="text" name="endTime" id="endTime" value="<{$endTime}>" class="input-xlarge" placeholder="">
                </div>
            </li>
            <li style="float:left;margin-right:5px">
                <div class="btn-toolbar" style="padding-top:15px;margin-right:5px">
                    <input type="hidden" name="search" id="search" value="1" >
                    <button type="button" id="search_btn" class="btn btn-primary mark_btn">检索</button>
                    <button type="button" id="output_btn" class="btn btn-primary mark_btn">导出excel</button>
                </div>
            </li>
        </ul>
        <div style="clear:both;"></div>
    </form>
</div>

<div class="block">
    <a href="#page-stats" class="block-heading" data-toggle="collapse">宠物拉霸统计</a>
    <div id="page-stats" class="block-body collapse in">
        <table class="table table-striped">
            <thead>
            <tr>
                <th style="width:20%">日期</th>
                <th style="width:20%">拉霸类型</th>
                <th style="width:20%">拉霸次数</th>
                <th style="width:20%">拉霸人数</th>
            </tr>
            </thead>
            <tbody>
            <{foreach $outArr as $key=>$out}>
                <tr>
                    <td><{$out.day}></td>
                    <td><{$out.laba_num}></td>
                    <td><{$out.times}></td>
                    <td><{$out.users}></td>
                </tr>
                <{/foreach}>
            </tbody>
        </table>
        <!--- START 分页模板 --->

        <{$page_html}>

        <!--- END --->
    </div>
</div>

<!---操作的确认层，相当于javascript:confirm函数--->
<{$osadmin_action_confirm}>

<!--- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 --->
<{include file="footer.tpl" }>

<script type="text/javascript">
    $(document).on('click', '.mark_btn', function () {
        if ($(this).attr('id') == 'search_btn') {
            $('#search').val(1);
        }
        if ($(this).attr('id') == 'output_btn') {
            $('#search').val(2);
        }
        $("#form_search").submit();
    });

    $(function () {
        var date = $("#startTime, #endTime");
        date.datetimepicker({
            top: 50,
            showSecond: false,
            dateFormat: 'yy-mm-dd',
            timeFormat: 'HH:mm:ss',
            stepHour: 1,
            stepMinute: 1,
            stepSecond: 1
        })
    });
</script>