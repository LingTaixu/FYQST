<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div style="border:0px;padding-bottom:5px;height:auto">
    <form action="" method="GET" style="margin-bottom:0px">
        <div style="float:left;margin-right:5px">
            <label>请选择查询类型</label>
            <{html_options name="class_name" options=$queryoptionlist selected=$_GET.class_name}>
        </div>
        <div style="float:left;margin-right:15px">
            <label>用户账号ID 或 角色ID 或 角色名称</label>
            <input type="text" name="user_name" value="<{$_GET.user_name}>" placeholder="输入..." >
        </div>
        <div class="btn-toolbar" style="padding-top:25px;padding-bottom:0px;margin-bottom:0px">
            <button type="submit" class="btn btn-primary"><strong>查询</strong></button>
        </div>
        <div style="clear:both;"></div>
    </form>
</div>
<div class="well">
    <ul class="nav nav-tabs">
        <li class="active"><a href="#home" data-toggle="tab">角色信息</a></li>
    </ul>

    <div id="myTabContent" class="tab-content">
        <div class="tab-pane active in" id="home">
            <table class="table table-striped">
                <thead>
                <tr>
                    <th style="width:30px">UID</th>
                    <th style="width:60px">角色名称</th>
                    <th style="width:20px">等级</th>
                </tr>
                </thead>
                <tbody id="playerData">
                <{if $playerinfo != ''}>
                    <tr>
                        <td id="userId"><{$playerinfo.id}></td>
                        <td><{$playerinfo.nickName}></td>
                        <td><{$playerinfo.lvl}></td>
                    </tr>
                    <{/if }>
                </tbody>
            </table>

            <form class="form-horizontal" id="tab" method="post" action="">
                <fieldset>

                    <div class="control-group">
                        <label class="control-label" >充值类型</label>
                        <div class="controls">
                            <{html_options id="card_type" name="card_type" options=$rechargeTypeList selected=$_POST.card_type}>
                        </div>
                    </div>
                    <div class="control-group">
                        <div class="controls">
                            <button type="button" class="btn btn-primary" id="sendMail"><strong>确认</strong></button>
                        </div>
                    </div>
                </fieldset>
            </form>
        </div>
        <div id="retmsg_id" class="block-body collapse in"></div>
    </div>
</div>

<!--- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 --->
<{include file="footer.tpl" }>
<script>
    $("#sendMail").click(function () {
        $("#retmsg_id").html('');
        var item = $("#card_type").val();
        var userId = $("#playerData tr td:nth-child(1)").text();

        if (!item || !userId) {
            $("#retmsg_id").html("没有玩家数据！");
            return;
        }
        var reqPara = {
            op: 'rechargeSimulateToUser',
            item: item,
            class_name: 'charid',
            user_name: userId
        };

        $.ajax({
            url: "",
            type: "POST",
            //dataType:"json",
            data: reqPara,
            success: function (data) {
                if (data > 0) {
                    var msg = "操作: 执行成功";
                }
                $("#retmsg_id").html(msg);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(textStatus);
                var msg = "操作:" + reqpara.op + "执行失败";
                $("#retmsg_id").html(msg);
            }
        });
    });


</script>