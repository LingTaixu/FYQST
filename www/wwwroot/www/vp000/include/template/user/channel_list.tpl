<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>

<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="btn-toolbar" style="margin-bottom:2px;">
    <div class="btn-toolbar" style="padding-top:25px;padding-bottom:0px;margin-bottom:0px">
        <a href="channel_config.php"><button type="button" id="search_btn" class="btn btn-primary mark_btn">新增渠道</button></a>
        <a href="channel_list.php?search=2"><button type="button" id="output_btn" class="btn btn-primary mark_btn">导出excel</button></a>
    </div>
</div>

<div class="block">
    <a href="#page-stats" class="block-heading" data-toggle="collapse">渠道列表</a>
    <div id="page-stats" class="block-body collapse in">
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
</script>