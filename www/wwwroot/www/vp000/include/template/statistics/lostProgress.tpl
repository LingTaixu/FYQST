<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>

<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="btn-toolbar" style="margin-bottom:2px;">
    <form class="form_search" id="form_search" action="" method="GET" style="margin-bottom:0px">
        <div style="float:left;margin-right:5px">
            <div class="controls">
                <{$serverDiv}>
            </div>
            <div class="controls">
                <div style="float: left;">
                    <label>关卡类型</label>
                    <{html_options name=copyType id="copyType" options=$copy_type_list selected=$_GET.copyType}>
                </div>
                <div style="float: left;">
                    <label>关卡起始</label>
                    <input type="text" id="progressStart" name="progressStart" value="<{$progressStart}>">
                </div>
                <div style="float: left;">
                    <label>关卡结束</label>
                    <input type="text" id="progressEnd" name="progressEnd" value="<{$progressEnd}>">
                </div>

            </div>
            <div class="controls">
                <button type="button" id="search_btn" class="btn btn-primary mark_btn">检索</button>
                <button type="button" id="output_btn" class="btn btn-primary mark_btn">导出excel</button>
            </div>
            <input type="hidden" name="search" id="search" value="1" >
        </div>

        <div style="clear:both;"></div>
    </form>
</div>

<div class="block">
    <a href="#page-stats" class="block-heading" data-toggle="collapse">关卡统计</a>
</div>

<table class="table table-striped" style="width: 100%;white-space:nowrap;">
    <thead>
    <tr>
        <td>关卡数</td>
        <td>通过人数</td>
        <td>通过率(%)</td>
    </tr>
    </thead>
    <tbody>
    <{foreach $outArr as $key=>$out}>
        <tr>
            <td><{$out.progress}></td>
            <td><{$out.passNum}></td>
            <td><{$out.passRate}></td>
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
</script>