<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>

<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="btn-toolbar" style="margin-bottom:2px;">
    <a href="activity_add.php" class="btn btn-primary"><i class="icon-plus"></i> 活动</a>
</div>
    <div class="block">
        <a href="#page-stats" class="block-heading" data-toggle="collapse">活动列表</a>
        <div id="page-stats" class="block-body collapse in">
            <table class="table table-striped">
                <thead>
                <tr>
                    <th style="width:20px">活动ID</th>
                    <th style="width:60px">类型ID</th>
                    <th style="width:60px">活动简称</th>
                    <th style="width:60px">活动全称</th>
                    <th style="width:60px">排序</th>
                    <th style="width:60px">开放状态</th>
                    <th style="width:60px">开始时间</th>
                    <th style="width:40px">结束时间</th>
                    <th style="width:20px">管理</th>
                </tr>
                </thead>
                <tbody>
                <{foreach name=act from=$actlist item=act}>
                    <tr>
                        <td><{$act.id}></td>
                        <td><{$act.type}></td>
                        <td><{$act.title}></td>
                        <td><{$act.fullTitle}></td>
                        <td><{$act.sort}></td>
                        <td><{$act.openStr}></td>
                        <td><{$act.startTime}></td>
                        <td><{$act.endTime}></td>
                        <td>
                            <a href="activity_op.php?id=<{$act.id}>" title= "编辑" ><i class="icon-pencil"></i></a>
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