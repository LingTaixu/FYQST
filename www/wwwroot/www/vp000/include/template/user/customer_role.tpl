<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>

<div class="block">
    <a href="#page-stats" class="block-heading" data-toggle="collapse">提问玩家列表</a>
    <div id="page-stats" class="block-body collapse in">
        <table class="table table-striped">
            <thead>
            <tr>
                <th style="width:30px">账号ID</th>
                <th style="width:60px">角色ID</th>
                <th style="width:20px">角色名</th>
                <th style="width:25px">最后登录</th>
                <th style="width:20px">充值</th>
                <th style="width:20px">状态</th>
                <th style="width:20px">服务器</th>
                <th style="width:30px">更新时间</th>
                <th style="width:30px">处理</th>
            </tr>
            </thead>
            <tbody>
            <{foreach name=quest from=$quest_list item=quest}>
                <tr>
                    <td><{$quest.open_id}></td>
                    <td><{$quest.role_id}></td>
                    <td><{$quest.nickname}></td>
                    <td><{$quest.lastLogin}></td>
                    <td><{$quest.totalNum}></td>
                    <td><{$quest.statusName}></td>
                    <td><{$quest.area}></td>
                    <td><{$quest.updated}></td>
                    <td>
                        <a href="customer_chat.php?gamerole_id=<{$quest.id}>" title= "接单处理" ><i class="icon-user"></i></a>
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

<script type="text/javascript">

    $(document).ready(function(){

        // 设置计时器来刷新页面
        function refresh(){
            var content = $("#chatMsg").val();
            window.location.href="customer_role.php";
            // console.log("refresh ...");
        }
        window.setInterval(refresh, 300000);
    });

</script>
<!--- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 --->
<{include file="footer.tpl" }>
