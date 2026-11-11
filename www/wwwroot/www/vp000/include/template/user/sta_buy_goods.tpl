<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="btn-toolbar" style="margin-bottom:2px;">
    <form class="form_search" id="form_search" action="" method="GET" style="margin-bottom:0px">
        <ul>
            <li style="float:left;margin-right:5px">
                <div style="float:left;margin-right:5px">
                    <{$serverDiv}>
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
                    <input type="hidden" name="search" id="search" value="<{$_GET.search}>" >
                    <button type="button" class="btn btn-primary search_btn" data-type="1">商品详情</button>
                    <button type="button" class="btn btn-primary search_btn" data-type="2">商品总览</button>
                    <button type="button" class="btn btn-primary search_btn" data-type="3">投食礼包</button>
                    <button type="button" class="btn btn-primary search_btn" data-type="4">每日特惠</button>
                </div>
            </li>
        </ul>
        <div style="clear:both;"></div>
    </form>
</div>

<div class="block">
    <a href="#page-stats" class="block-heading" data-toggle="collapse">充值商品统计</a>
    <div id="page-stats" class="block-body collapse in">
        <table class="table table-striped" style="width: 100%">
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

    </div>
</div>

<!--- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 --->
<{include file="footer.tpl" }>

<script type="text/javascript">
    $(document).on('click', '.output_btn', function () {
        $('#outPut').val(1);
        $("#form_search").submit();
    });

    $(document).on('click', '.search_btn', function () {
        $("#search").val($(this).attr('data-type'));
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