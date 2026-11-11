<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!-- TPLSTART 以上内容不需更改，保证该TPL页内的标签匹配即可 -->
<div class="block">
    <a href="#page-stats" class="block-heading" data-toggle="collapse">角色信息</a>
    <div id="page-stats" class="block-body collapse in">

        <table class="table table-striped">
            <tbody>
            <tr><td>角色ID</td><td><{$player_info.id}> </td></tr>
            <tr><td>昵称</td><td><{$player_info.nickName}></td></tr>
            <tr><td>等级</td><td><{$player_info.lvl}></td></tr>
            <tr><td>金币</td><td><{$player_info.gold}></td></tr>
            <tr><td>钻石</td><td><{$player_info.diamond}></td></tr>
            </tbody>
        </table>

    </div>
</div>
<!-- TPLEND 以下内容不需更改，请保证该TPL页内的标签匹配即可 -->
<{include file="footer.tpl" }>