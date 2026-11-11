<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>

<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="btn-toolbar" style="margin-bottom:2px;">
    <form class="form_search" id="form_search" action="" method="GET" style="margin-bottom:0px">
        <div style="float:left;margin-right:5px;width: 100%">
            <{$serverDiv}>
            <input type="hidden" name="search" id="search" value="1">
        </div>
        <div style="float:left;margin-right:5px;width: 100%">
            <div style="float:left;margin-right:5px">
                <label>开始时间</label>
                <input type="text" name="startTime" id="startTime" value="<{$startTime}>" class="input-xlarge"
                       placeholder="">
            </div>
            <div style="float:left;">
                <label>结束时间</label>
                <input type="text" name="endTime" id="endTime" value="<{$endTime}>" class="input-xlarge" placeholder="">
            </div>
        </div>
        <div class="btn-toolbar" style="padding-top:25px;padding-bottom:0px;margin-bottom:0px">
            <button type="button" id="search_btn" class="btn btn-primary mark_btn">检索</button>
            <button type="button" id="output_btn" class="btn btn-primary mark_btn">导出excel</button>
        </div>
        <div style="clear:both;"></div>
    </form>
</div>

<div class="block">
    <a href="#page-stats" class="block-heading" data-toggle="collapse">领取打赏礼包的流失用户</a>
</div>

<table class="table table-striped" style="width: auto;white-space:nowrap;">
    <thead>
    <tr>
        <td>玩家数</td>
        <td>平均等级</td>
        <td>平均钻石存量</td>
        <td>平均关卡数</td>
        <td>平均探险层数</td>
        <td>平均成就点数</td>
        <td>平均总战力</td>
        <td>平均宠物总战力</td>
    </tr>
    </thead>
    <tbody>
    <{foreach $allArr as $key=>$all}>
        <tr>
            <td><{$all.userNum}></td>
            <td><{floor($all.total_lvl / $all.userNum)}></td>
            <td><{floor($all.total_diamond / $all.userNum)}></td>
            <td><{floor($all.total_maxCopyNum / $all.userNum)}></td>
            <td><{floor($all.total_highPaTa / $all.userNum)}></td>
            <td><{floor($all.total_totalAchieveExp / $all.userNum)}></td>
            <td><{floor($all.total_combat / $all.userNum)}></td>
            <td><{floor($all.total_talismanCombat / $all.userNum)}></td>
        </tr>
        <{/foreach}>
    </tbody>
</table>

<table class="table table-striped" style="width: auto;white-space:nowrap;">
    <thead>
    <tr>
        <td>日期</td>
        <td>玩家数</td>
        <td>平均等级</td>
        <td>平均钻石存量</td>
        <td>平均关卡数</td>
        <td>平均探险层数</td>
        <td>平均成就点数</td>
        <td>平均总战力</td>
        <td>平均宠物总战力</td>
    </tr>
    </thead>
    <tbody>
    <{foreach $outArr as $key=>$out}>
        <tr>
            <td><{$key}></td>
            <td><{$out.userNum}></td>
            <td><{floor($out.total_lvl / $out.userNum)}></td>
            <td><{floor($out.total_diamond / $out.userNum)}></td>
            <td><{floor($out.total_maxCopyNum / $out.userNum)}></td>
            <td><{floor($out.total_highPaTa / $out.userNum)}></td>
            <td><{floor($out.total_totalAchieveExp / $out.userNum)}></td>
            <td><{floor($out.total_combat / $out.userNum)}></td>
            <td><{floor($out.total_talismanCombat / $out.userNum)}></td>
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