<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!-- TPLSTART 以上内容不需更改，保证该TPL页内的标签匹配即可 -->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="btn-toolbar" style="float:left;margin-right: 5px;">
    <a data-toggle="collapse" data-target="#search"  href="#" title= "检索"><button class="btn btn-primary" style="margin-left:5px"><i class="icon-search"></i></button></a>
</div>
<div class="btn-toolbar" style="">
    <a href="giftAdd.php" class="btn btn-primary"><i class="icon-plus"></i> 生成礼包码</a>
</div>
    <{if $_GET.search }>
    <div id="search" class="collapse in">
    <{else }>
    <div id="search" class="collapse out" >
    <{/if }>
        <form class="form_search"  action="" method="POST" style="margin-bottom:0px">

            <div style="float:left;margin-right:5px">
                <label>礼包码</label>
                <input type="text" name="code" id="code" value="<{$_POST.code}>" placeholder="请输入礼包码..." >
            </div>
            <div class="btn-toolbar" style="padding-top:25px;padding-bottom:0px;margin-bottom:0px">
                <button type="submit" class="btn btn-primary"><strong>查询</strong></button>
            </div>
            <div style="clear:both;"></div>
        </form>
    </div>

<div class="block">
    <a href="#page-stats" class="block-heading" data-toggle="collapse">礼包码</a>
    <div id="page-stats" class="block-body collapse in">
        <table class="table table-striped">
            <thead>
            <tr>
                <th>礼包名</th>
                <th>礼包码</th>
                <th>状态</th>
                <th>使用者ID</th>
                <th>账号ID</th>
                <th>物品</th>
                <th>周期限制(天)</th>
                <th>生效时间</th>
                <th>截止时间</th>
            </tr>
            </thead>
            <tbody>

            <tr>
                <th><{$codelist.name}></th>
                <th><{$codelist.code}></th>
                <th><{$codelist.isUsed}></th>
                <th><{$codelist.userId}></th>
                <th><{$codelist.accountId}></th>
                <th><{$codelist.items}></th>
                <th><{$codelist.period}></th>
                <th><{$codelist.startTime}></th>
                <th><{$codelist.endTime}></th>
            </tr>

            </tbody>
        </table>
    </div>
</div>
<!---操作的确认层，相当于javascript:confirm函数--->
<{$osadmin_action_confirm}>

<!-- TPLEND 以下内容不需更改，请保证该TPL页内的标签匹配即可 -->
<{include file="footer.tpl" }>