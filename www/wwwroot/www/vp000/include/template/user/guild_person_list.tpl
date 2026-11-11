<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>

<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="block">
    <a href="#page-stats" class="block-heading" data-toggle="collapse">行会列表</a>
    <div id="page-stats" class="block-body collapse in">
        <table class="table table-striped" style="width: 100%">
            <thead>
            <tr>
                <{foreach $title as $tk=>$tv}>
                <th ><{$tv}></th>
                <{/foreach}>
                <th style="width:80px">管理</th>
            </tr>
            </thead>
            <tbody>
            <{foreach $outArr as $key=>$out}>
                <tr>
                    <{foreach $title as $tk=>$tv}>
                    <td><{$out.$tk}></td>
                    <{/foreach}>
                    <td>
                        <a href="#" title= "修改状态" onclick="updateChairman('<{$serverId}>', '<{$out.userId}>', '<{$out.guildId}>')"><i class="icon-pencil"></i></a>
                    </td>
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
            showSecond: true,
            dateFormat: 'yy-mm-dd',
            timeFormat: 'HH:mm:ss',
            stepHour: 1,
            stepMinute: 1,
            stepSecond: 1
        })
    });

    function updateChairman($serverId, $userId, $guildId) {
        bootbox.confirm('确定要这样做吗？', function(result) {
            if (result) {
                var params = {
                    serverId : $serverId,
                    userId : $userId,
                    guildId : $guildId
                };
                $.ajax({
                    url: "?search=3",
                    type: "POST",
                    data: params,
                    success: function (data) {
                        var msg = '';
                        console.log(data);
                        alert('操作成功');
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        alert('操作失败');
                    }
                });
            }
        });
    }
</script>