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
                    <th style="width:20px">操作</th>
                </tr>
                </thead>
                <tbody id="playerData">
                <{if $playerinfo != ''}>
                    <tr>
                        <td id="userId"><{$playerinfo.id}></td>
                        <td><{$playerinfo.nickName}></td>
                        <td><{$playerinfo.lvl}></td>
                        <td>
                            <a href="role_modify.php?nick=<{$playerinfo.nickName}>&uid=<{$playerinfo.id}>" title= "修改基础数据" ><i class="icon-user"></i></a>
                            <a href="role_mail.php?nick=<{$playerinfo.nickName}>&uid=<{$playerinfo.id}>" title= "发送邮件" ><i class="icon-envelope"></i></a>
                            <a href="guild.php?nick=<{$playerinfo.nickName}>&gid=<{$guildId}>" title= "玩家行会" ><i class="icon-home"></i></a>
                        </td>
                    </tr>
                    <{/if }>
                </tbody>
            </table>

            <form class="form-horizontal" id="tab" method="post" action="">
                <fieldset>
                    <div class="control-group">
                        <label class="control-label" >邮件标题</label>
                        <div class="controls">
                            <textarea name="mail_title" id="mail_title" rows="2" class="input-xlarge" autofocus="true" placeholder='填写邮件标题'></textarea>
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label" >邮件内容</label>
                        <div class="controls">
                            <textarea name="mail_content" id="mail_content" rows="4" class="input-xlarge" autofocus="true" placeholder='填写邮件内容'></textarea>
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label" >积分类型</label>
                        <div class="controls">
                            <{html_options id="item_type" name="item_type" options=$card_type selected=$_POST.card_type}>
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label" >积分数量</label>
                        <div class="controls">
                            <input type="text" id="item_num" name="item_num" value="" placeholder="输入数量..."  required="true"  >
                        </div>
                    </div>
                </fieldset>
                <div class="control-group">
                    <label class="control-label" >              </label>
                    <div class="controls">
                        <button type="button" class="btn btn-primary" id="sendMail"><strong>发送邮件</strong></button>
                    </div>
                </div>
            </form>
        </div>
        <div id="retmsg_id" class="block-body collapse in"></div>
    </div>
</div>

<!--- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 --->
<{include file="footer.tpl" }>
<script>
    $("#sendMail").click(function(){
        var item = $("#item_type").val();
        var num = $("#item_num").val();
        var userId = $("#playerData tr td:nth-child(1)").text();
        var nickName = $("#playerData tr td:nth-child(2)").text();
        var mail_content = $("#mail_content").val();
        var mail_title = $("#mail_title").val();

        if(!item || !userId){
            $("#retmsg_id").html("没有玩家数据！");
            return;
        }
        if (!num || num == ""){
            $("#retmsg_id").html("没有填写积分数量！");
            return;
        }
        if(!mail_content || mail_content == "" || mail_title == ""){
            $("#retmsg_id").html("没有填写邮件内容！");
            return;
        }
        $("#retmsg_id").html("");
        var reqpara ={op:'opCardMailToUser',data:{item:item,userId:userId,num:num, nickName:nickName, mail_title:mail_title, mail_content:mail_content}};
        console.log(reqpara);
        $.ajax({
            url:"../api/ajax_api.php",
            type:"POST",
            //dataType:"json",
            data:reqpara,
            success:function(data){
                console.log(data);
                if(data){
                    var msg = "操作: 执行成功";
                }
                $("#retmsg_id").html(msg);
            },
            error:function(XMLHttpRequest, textStatus, errorThrown){
                console.log(textStatus);
                var msg = "操作:" + reqpara.op + "执行失败";
                $("#retmsg_id").html(msg);
            }
        });
    });


</script>