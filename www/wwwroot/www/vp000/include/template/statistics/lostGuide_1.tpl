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
    <a href="#page-stats" class="block-heading" data-toggle="collapse">新手引导流失</a>
</div>

<table class="table table-striped" style="width: auto;white-space:nowrap;">
    <thead>
    <tr>
        <td>步骤</td>
        <td>引导号</td>
        <td>描述</td>
        <td>通过人数</td>
        <td>通过率</td>
        <td>流失人数</td>
        <{for $lvl=1 to 200}>
        <td style="width:100px"><{$lvl}>级</td>
        <{/for}>
    </tr>
    </thead>
    <tbody>
    <{foreach $outArr as $key=>$out}>
        <tr>
            <td><{$out.step}></td>
            <td><{$key}></td>
            <td><{$out.desc}></td>
            <td><{$out.oldTotalNum}></td>
            <td><{$out.passRate}></td>
            <td><{$out.lostNum}></td>
            <{for $lvl=1 to 200}>
            <{if $out.$lvl > 0}>
            <td><span style="color:#FF0000"><{$out.$lvl}></span></td>
            <{else}>
            <td><{$out.$lvl}></td>
            <{/if}>
            <{/for}>
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