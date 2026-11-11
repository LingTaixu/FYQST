<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<div style="border:0px;padding-bottom:5px;height:auto">
    <div style="float:left;margin-right:15px">
        <textarea   id="chatMsg"  rows="3" class="input-xlarge" autofocus="true"><{$content}></textarea>
        <button type="submit" id="sendid" class="btn btn-primary"><strong>发送</strong></button>
    </div>
</div> <br/><br/><br/>
<div class="block" style="border:0px;padding-bottom:5px;height:auto">
    <a href="#page-stats" class="block-heading" data-toggle="collapse">对话列表</a>
    <div id="page-stats" class="block-body collapse in">
        <table class="table table-striped">
            <thead>
            <tr>
                <th style="width:14px">发送时间</th>
                <th style="width:14px">发送者</th>
                <th style="width:240px">内容</th>

            </tr>
            </thead>
            <tbody>
            <{foreach name=chat from=$chat_list item=chat}>
                <tr>
                    <td><{$chat.created}></td>
                    <td><{$chat.sender}></td>
                    <td><{$chat.content}></td>
                </tr>
                <{/foreach}>
            </tbody>
        </table>
        <!--- START 分页模板 --->

        <!--- END --->
    </div>
</div>

<script type="text/javascript">

    $(document).ready(function(){

        // 焦点设置到文本最后
        var t=$("#chatMsg").val();
        $("#chatMsg").val("").focus().val(t);

        $("#sendid").click(function(){

            var data = {};
            data.gamerole_id = <{$role.id}>;
            data.area = <{$role.area}>;
            data.game_id = <{$role.game_id}>;
            // data.open_id = <{$role.open_id}> ;
            data.role_id = <{$role.role_id}>;
            //data.uid = <{$role.role_id}>;
            data.content = $("#chatMsg").val();

            var reqpara = {op:"opKefuChat",data:data};

            if(reqpara.content == "" ) {
                console.log("no need to send");
                $("#retmsg_id").html("请填写查询内容");
                return;
            }

            $.ajax({
                url:"../api/ajax_api.php",
                type:"GET",
                dataType:"text",
                data:reqpara,
                success:function(data){
                    console.log(data);
                    $("#chatMsg").val('');
                    $("#retmsg_id").html(data.data);
                    refresh();
                },
                error:function(XMLHttpRequest, textStatus, errorThrown){
                    console.log(textStatus);
                    var msg = "操作:" + reqpara.op + "执行失败";
                    $("#retmsg_id").html(msg);
                }
            });
        });

    });

    // 设置计时器来刷新页面
    function refresh(){
        var content = $("#chatMsg").val();
        window.location.href="customer_chat.php?gamerole_id=<{$role.id}>&content="+content;
        // console.log("refresh ...");
    }
    window.setInterval(refresh, 300000);
</script>



<!--- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 --->
<{include file="footer.tpl" }>
