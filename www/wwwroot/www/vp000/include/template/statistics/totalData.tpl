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
    <a href="#page-stats" class="block-heading" data-toggle="collapse">运营数据</a>
</div>

<table class="table table-striped" style="width: auto;white-space:nowrap;">
    <thead>
    <tr>
        <td>日期</td>
        <td>点游戏人数</td>
        <td>注册人数</td>
        <td>老账号活跃</td>
        <td>总账号活跃</td>
        <td>总创角</td>
        <td>老号创角</td>
        <td>新号创角</td>
        <td>转化率</td>
        <td>登录人数</td>
        <td>老用户</td>
        <td>活跃付费用户</td>

        <td>充值人数</td>
        <td>活跃用户付费率</td>
        <td>充值金额</td>
        <td>新号充值</td>
        <td>新充值人数</td>
        <td>老号充值</td>

        <td>arpu</td>
        <td>arppu值</td>
        <td>次留</td>
        <td>三留</td>
        <td>七留</td>
        <td>十四留</td>
        <td>首日创收比</td>
        <td>首日注收比</td>
        <td>总创收比</td>
        <td>总注收比</td>

    </tr>
    </thead>
    <tbody>
    <{foreach name=out from=$outArr item=out}>
        <tr>
            <td><{$out.date}></td>
            <td><{$out.clickGamePersonNum}></td>
            <td><{$out.regNum}></td>
            <td><{$out.oldAccountLogin}></td>
            <td><{$out.allAccountLogin}></td>
            <td><{$out.createRoleNum}></td>
            <td><{$out.oldAccountCreateRoleNum}></td>
            <td><{$out.newAccountCreateRoleNum}></td>
            <td><{$out.rate}></td>
            <td><{$out.loginNum}></td>
            <td><{$out.oldUserloginNum}></td>
            <td><{$out.activeRechargePersonNum}></td>
            <td><{$out.chargePersonNum}></td>
            <td><{$out.payDau}></td>
            <td><{$out.totalChargeNum}></td>
            <td><{$out.newAccountChargeNum}></td>
            <td><{$out.newAccountChargePersonNum}></td>
            <td><{$out.oldAccountChargeNum}></td>
            <td><{$out.arpu}></td>
            <td><{$out.arppu}></td>
            <td><{$out.r2}></td>
            <td><{$out.r3}></td>
            <td><{$out.r7}></td>
            <td><{$out.r14}></td>
            <td><{$out.firstCsb}></td>
            <td><{$out.firstZsb}></td>
            <td><{$out.chuangshoubi}></td>
            <td><{$out.zhushoubi}></td>

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