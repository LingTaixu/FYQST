<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>

<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="btn-toolbar" style="margin-bottom:2px;">
    <form class="form_search" id="form_search" action="" method="GET" style="margin-bottom:0px">
        <div style="float:left;margin-right:5px">
            <label>服务器选择</label>
            <{$htmlServerSelect}>
            <input type="hidden" name="search" id="search" value="1" >
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
        <td>日期</td>
        <td>总创角</td>
        <td>新号创角</td>
        <td>老号创角</td>
        <td>总充值数</td>
        <td>入行会用户数</td>
        <{foreach $retainDay as $day=>$dayStr}>
            <td>入行会用户<{$dayStr}></td>
        <{/foreach}>
    </tr>
    </thead>
    <tbody>
    <{foreach $outArr as $key=>$out}>
        <tr>
            <td><{$key}></td>
            <td><{$out.createRoleNum}></td>
            <td><{$out.newAccountCreateRoleNum}></td>
            <td><{$out.oldAccountCreateRoleNum}></td>
            <td><{$out.totalPay}></td>
            <td><{$out.joinGuildRoleNum}></td>
            <{foreach $retainDay as $day=>$dayStr}>
                <td><{$out.$day}></td>
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
</script>