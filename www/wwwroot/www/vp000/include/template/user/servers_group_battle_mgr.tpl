<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>

<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>



<div class="block">
    <a href="#page-stats" class="block-heading" data-toggle="collapse">游戏状态</a>
    <div id="page-stats" class="block-body collapse in">
        <table class="table table-striped">
            <thead>
            <tr>
                <th style="width:20px">#</th>
                <th style="width:20px">运行状态</th>
            </tr>
            </thead>
            <tbody>

            <tr>
                <td><{$server.battleId}></td>
                <td><{$server.run}></td>
            </tr>
            </tbody>
        </table>
        <!--- START 分页模板 --->

        <{$page_html}>

        <!--- END --->
        <div class="form-actions">
            <button type="button" class="btn btn-primary" id="startBattle">启动服务</button>
            <button type="button" class="btn btn-primary" id="stopBattle">停止服务</button>
        </div>
    </div>

    <div id="retmsg_id" class="block-body collapse in">
    </div>


    <!---操作的确认层，相当于javascript:confirm函数--->
    <{$osadmin_action_confirm}>

    <script>
        $("#startBattle").click(function(){
            bootbox.confirm('确定要这样做吗？', function(result) {
                if(result){
                    var serverId = <{$server.battleId}>;
                    var reqpara ={op:'startBattle',data:{serverId:serverId}};
                    $.ajax({
                        url:"../api/ajax_api.php",
                        type:"GET",
                        dataType:"json",
                        data:reqpara,
                        success:function(data){
                            console.log(data);
                            $("#retmsg_id").html("启动成功!");
                            location.reload();
                        },
                        error:function(XMLHttpRequest, textStatus, errorThrown){
                            console.log(textStatus);
                            $("#retmsg_id").html("启动失败!");
                        }
                    });
                }
            });
        });
        $("#stopBattle").click(function(){
            bootbox.confirm('确定要这样做吗？', function(result) {
                if(result){
                    var serverId = <{$server.battleId}>;
                    var reqpara ={op:'stopBattle',data:{serverId:serverId}};
                    $.ajax({
                        url:"../api/ajax_api.php",
                        type:"GET",
                        dataType:"json",
                        data:reqpara,
                        success:function(data){
                            console.log(data);
                            $("#retmsg_id").html("停服成功!");
                            location.reload();
                        },
                        error:function(XMLHttpRequest, textStatus, errorThrown){
                            console.log(textStatus);
                            $("#retmsg_id").html("停服失败!");
                        }
                    });
                }
            });
        });
    </script>

    <!--- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 --->
    <{include file="footer.tpl" }>