<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="well">
    <ul class="nav nav-tabs">
        <li class="active"><a href="#home" data-toggle="tab">修改 设置 </a></li>
    </ul>

    <div id="myTabContent" class="tab-content">
        <div class="tab-pane active in" id="home">
         <form id="tab" method="post" action="">
                <label>系统时间</label>
                <input type="text" name="bj_time" value="<{$info.bj_time}>" required="true" >
                <div class="btn-toolbar">
                    <button type="submit" class="btn btn-primary"><strong>修改时间</strong></button>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="well">
    <form class="form-horizontal">
        <fieldset>

            <div class="control-group">
                <label class="control-label" >物品名称</label>
                <div class="controls">
                    <input  id="item_name"  type="text" value="" >
                    <button type="button" class="btn btn-primary" id="cmd_query_item">查询</button>
                </div>
            </div>

        </fieldset>
    </form>
    <div id="retmsg_id" class="block-body collapse in">
    </div>
</div>

<script type="text/javascript">

    $("#cmd_query_item").click(function(){

        var reqpara = {};
        reqpara.op = "queryItem";
        reqpara.item_name = $("#item_name").val();


        if(reqpara.item_name == "" ) {
            console.log("no need to send");
            $("#retmsg_id").html("请填写查询内容");
            return;
        }

        $.ajax({
            url:"../api/api.php",
            type:"GET",
            dataType:"json",
            data:reqpara,
            success:function(data){
                console.log(data);
                $("#retmsg_id").html(data.data);
            },
            error:function(XMLHttpRequest, textStatus, errorThrown){
                console.log(textStatus);
                var msg = "操作:" + reqpara.op + "执行失败";
                $("#retmsg_id").html(msg);
            }
        });



    });
</script>

<!--- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 --->
<{include file="footer.tpl" }>