<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>

<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="btn-toolbar" style="margin-bottom:2px;">
    <a href="servers_group_chat_add.php" class="btn btn-primary"><i class="icon-plus"></i> 添加分组</a>
</div>

<div class="block">
    <a href="#page-stats" class="block-heading" data-toggle="collapse">跨服聊天分组列表</a>
    <div id="page-stats" class="block-body collapse in">
        <table class="table table-striped" style="width: 100%">
            <thead>
            <tr>
                <{foreach $title as $tk=>$tv}>
                <th><{$tv}></th>
                <{/foreach}>
                <th style="width:80px">管理</th>
            </tr>
            </thead>
            <tbody>
            <{foreach $groupList as $key=>$out}>
                <tr>
                    <{foreach $title as $tk=>$tv}>
                    <td><{$out.$tk}></td>
                    <{/foreach}>
                    <td>
                        <a href="servers_group_chat_modify.php?id=<{$out.id}>" title="修改状态"><i class="icon-pencil"></i></a>
                        <a data-toggle="modal" href="#myModal" title="删除">
                            <i class="icon-remove" href="servers_group_chat_list.php?method=del&id=<{$out.id}>"></i>
                        </a>
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