<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>

<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="btn-toolbar" style="margin-bottom:2px;">
    <form class="form_search" id="form_search" action="" method="GET" style="margin-bottom:0px">
        <div style="float:left;margin-right:5px">
            <{$serverDiv}>
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
        <td>新增付费“账户”数</td>
        <td>累计充值金额</td>
        <td>当日累充</td>
        <td>三日累充</td>
        <td>七日累充</td>
        <td>十四日累充</td>
        <td>三十日累充</td>
        <td>付费账户留存次日</td>
        <td>付费账户留存三日</td>
        <td>付费账户留存七日</td>
        <td>付费账户留存十四日</td>
        <td>付费账户留存三十日</td>
    </tr>
    </thead>
    <tbody>
    <{foreach $outArr as $key=>$out}>
        <tr>
            <td><{$key}></td>
            <td><{$out.newAddPayAccountNum}></td>
            <td><{$out.newAccountTotalPay}></td>
            <td><{$out.totalPay0}></td>
            <td><{$out.totalPay3}></td>
            <td><{$out.totalPay7}></td>
            <td><{$out.totalPay14}></td>
            <td><{$out.totalPay30}></td>
            <td><{$out.rate2}></td>
            <td><{$out.rate3}></td>
            <td><{$out.rate7}></td>
            <td><{$out.rate14}></td>
            <td><{$out.rate30}></td>
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