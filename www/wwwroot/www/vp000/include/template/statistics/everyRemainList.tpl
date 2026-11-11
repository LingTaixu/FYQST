<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>

<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="btn-toolbar" style="margin-bottom:2px;">
    <form class="form_search" id="form_search" action="" method="GET" style="margin-bottom:0px">
        <ul>
            <li style="float:left;margin-right:5px;width: 100%">
                <{$serverDiv}>
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
    <a href="#page-stats" class="block-heading" data-toggle="collapse">各服留存数据</a>
</div>

<table class="table table-striped" style="width: 100%;white-space:nowrap;">
    <thead>
    <tr>
        <{foreach $title as $tk=>$tv}>
        <th ><{$tv}></th>
        <{/foreach}>
    </tr>
    </thead>
    <tbody>
    <{foreach $outArr as $key=>$out}>
        <tr>
            <{foreach $title as $tk=>$tv}>
            <td><{$out.$tk}></td>
            <{/foreach}>
        </tr>
        <{/foreach}>
    </tbody>
</table>

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
            showSecond: true,
            dateFormat: 'yy-mm-dd',
            timeFormat: 'HH:mm:ss',
            stepHour: 1,
            stepMinute: 1,
            stepSecond: 1
        })
    });
</script>