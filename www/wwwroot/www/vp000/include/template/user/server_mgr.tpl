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
                <th style="width:20px">DB状态</th>
                <th style="width:20px">账号id段</th>
                <th style="width:20px">开服活动状态</th>
                <th style="width:20px">机器人数</th>
                <th style="width:20px">pk竞技场状态</th>
                <th style="width:20px">运行状态</th>
                <th style="width:20px">主城运行状态</th>
            </tr>
            </thead>
            <tbody>

                <tr>
                    <td><{$server.id}></td>
                    <td><{$server.dbOk}></td>
                    <td><{$server.uidOk}></td>
                    <td><{$server.openActOk}></td>
                    <td><{$server.robotNum}></td>
                    <td><{$server.robotOk}></td>
                    <td><{$server.run}></td>
                    <td><{$server.csrun}></td>
                </tr>
            </tbody>
        </table>
        <!--- START 分页模板 --->

        <{$page_html}>

        <!--- END --->
        <div class="form-actions">
            <button type="button" class="btn btn-primary" id="fixOpenActivity">修正开服活动时间</button>
            <button type="button" class="btn btn-primary" id="startServer">启动服务</button>
            <button type="button" class="btn btn-primary" id="stopServer">停止服务</button>
            <button type="button" class="btn btn-primary" id="reloadServer">reload服务</button>
        </div>
    </div>

    <div id="retmsg_id" class="block-body collapse in">
    </div>


    <!---操作的确认层，相当于javascript:confirm函数--->
    <{$osadmin_action_confirm}>

    <script>
        $("#fixOpenActivity").click(function(){
            bootbox.confirm('确定要这样做吗？', function(result) {
                if(result){
                    var serverId = <{$server.id}>;
                    var reqpara ={op:'fixOpenActivity',data:{serverId:serverId}};
                    $.ajax({
                        url:"../api/ajax_api.php",
                        type:"GET",
                        dataType:"json",
                        data:reqpara,
                        success:function(data){
                            console.log(data);
                            $("#retmsg_id").html("修正成功!");
                        },
                        error:function(XMLHttpRequest, textStatus, errorThrown){
                            console.log(textStatus);
                            $("#retmsg_id").html("修正失败!");
                        }
                    });
                }
            });
        });
        $("#startServer").click(function(){
            bootbox.confirm('确定要这样做吗？', function(result) {
                if(result){
                    var serverId = <{$server.id}>;
                    var reqpara ={op:'startServer',data:{serverId:serverId}};
                    $.ajax({
                        url:"../api/ajax_api.php",
                        type:"GET",
                        dataType:"json",
                        data:reqpara,
                        success:function(data){
                            console.log(data);
                            $("#retmsg_id").html("启动成功!");
                        },
                        error:function(XMLHttpRequest, textStatus, errorThrown){
                            console.log(textStatus);
                            $("#retmsg_id").html("启动失败!");
                        }
                    });
                }
            });
        });
        $("#stopServer").click(function(){
            bootbox.confirm('确定要这样做吗？', function(result) {
                if(result){
                    var serverId = <{$server.id}>;
                    var reqpara ={op:'stopServer',data:{serverId:serverId}};
                    $.ajax({
                        url:"../api/ajax_api.php",
                        type:"GET",
                        dataType:"json",
                        data:reqpara,
                        success:function(data){
                            console.log(data);
                            $("#retmsg_id").html("停服成功!");
                        },
                        error:function(XMLHttpRequest, textStatus, errorThrown){
                            console.log(textStatus);
                            $("#retmsg_id").html("停服失败!");
                        }
                    });
                }
            });
        });
        $("#reloadServer").click(function(){
            bootbox.confirm('确定要这样做吗？', function(result) {
                if(result){
                    var serverId = <{$server.id}>;
                    var reqpara ={op:'reloadServer',data:{serverId:serverId}};
                    $.ajax({
                        url:"../api/ajax_api.php",
                        type:"GET",
                        dataType:"json",
                        data:reqpara,
                        success:function(data){
                            console.log(data);
                            $("#retmsg_id").html("reload成功!");
                        },
                        error:function(XMLHttpRequest, textStatus, errorThrown){
                            console.log(textStatus);
                            $("#retmsg_id").html("reload失败!");
                        }
                    });
                }
            });
        });
    </script>

    <!--- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 --->
    <{include file="footer.tpl" }>