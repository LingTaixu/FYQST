<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>
<form action="" method="POST" style="margin-bottom:0px">
<div style="border:0px;padding-bottom:5px;height:auto">
        <div style="padding-top:25px;float:left;margin-right:15px">
            <a data-toggle="collapse" data-target="#search"  href="#" title= "检索"><button type="button" class="btn btn-primary" style="margin-left:5px">服务器列表</button></a>
        </div>
        <div style="float:left;margin-right:5px">
            <label>聊天类型</label>
            <{html_options name="chat_type" options=$chat_type selected=$_POST.chat_type}>
        </div>

        <div style="float:left;margin-right:5px">
            <label>开始时间</label>
            <input type="text" name="startTime" id="startTime" value="<{$_POST.startTime}>" placeholder="">
        </div>
        <div style="float:left;margin-right:5px">
            <label>结束时间</label>
            <input type="text" name="endTime" id="endTime" value="<{$_POST.endTime}>" placeholder="">
        </div>

        <div style="float:left;margin-right:5px">
            <label>请选择查询类型</label>
            <{html_options name="class_name" options=$queryoptionlist selected=$_POST.class_name}>
        </div>
        <div style="float:left;margin-right:15px">
            <label>用户账号ID 或 角色ID 或 角色名称</label>
            <input type="text" name="user_name" value="<{$_POST.user_name}>" placeholder="输入..." >
        </div>


        <div class="btn-toolbar" style="padding-top:25px;padding-bottom:0px;margin-bottom:0px">
            <button type="submit" class="btn btn-primary"><strong>查询</strong></button>
        </div>
        <div style="clear:both;"></div>

</div>


    <{if $_GET.search }>
    <div id="search" class="collapse in">
    <{else }>
    <div id="search" class="collapse out" >
    <{/if }>
        <{html_checkboxes name="serverIdArr" options=$serverlist selected=$_POST.serverIdArr separtator=" "}>
    </div>
</form>
<div class="btn-toolbar" style="margin-bottom:2px;">
    <button type="button" class="btn btn-primary" id="bend"><i class="icon-ban-circle"></i> 禁言</button>
    <button type="button" class="btn btn-primary" id="seal"><i class="icon-remove-circle"></i> 封号</button>
</div>
<div id="retmsg_id" class="block-body collapse in"></div>
    <div class="block">
        <a href="#page-stats" class="block-heading" data-toggle="collapse">聊天列表</a>
        <div id="page-stats" class="block-body collapse in">
            <table class="table table-striped">
                <thead>
                <tr>
                    <th style="width:10px"><input type="checkbox" id="check_all">全选</th>
                    <th style="width:20px">服务器</th>
                    <th style="width:20px">账号名</th>
                    <th style="width:20px">角色ID</th>
                    <th style="width:20px">角色名</th>
                    <th style="width:20px">聊天类型</th>
                    <th style="width:90px">聊天内容</th>
                    <th style="width:30px">聊天时间</th>
                </tr>
                </thead>
                <tbody id="dataList">
                <{foreach name=data from=$dataList item=data}>
                    <tr>
                        <td><input type="checkbox" name="accountArr[]" value="<{$data.account}>#!#<{$data.userId}>#!#<{$data.serverId}>" separtator=" "></td>
                        <td><{$data.serverId}></td>
                        <td><{$data.account}></td>
                        <td><{$data.userId}></td>
                        <td><{$data.nickName}></td>
                        <td><{$data.type}></td>
                        <td><{$data.content}></td>
                        <td><{$data.chatTime}></td>
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
<script>
    $("#check_all").click(function(){
        if(this.checked){
            $("input[name='accountArr[]']").prop("checked",true);
        }else{
            $("input[name='accountArr[]']").prop("checked",false);
        }

    });
    //阻止事件冒泡
    $("input[name='accountArr[]']").click(function(event){
        event.stopPropagation();
    });

    $("#dataList tr").click(function(){
        var node = $(this).find("input[name='accountArr[]']");
        if(node.prop("checked")){
            node.prop("checked",false);
        }else{
            node.prop("checked",true);
        }
    });
    $("#bend").click(function(){
        bootbox.confirm('确定要这样做吗？', function(result) {
            if(result){
                var accArr = {};
                $("input[name='accountArr[]']:checked").each(function(i){
                    var val = $(this).val();
                    var arr = val.split("#!#");
                    accArr[arr[0]] = [arr[1],arr[2]];
                });
                if(Object.keys(accArr).length == 0){
                    $("#retmsg_id").html('未选择任何数据');
                    return;
                }
                var reqpara ={op:'bendAccountList',accounts:accArr};
                console.log(reqpara);
                $.ajax({
                    url:"../api/ban_api.php",
                    type:"POST",
                    //dataType:"json",
                    data:reqpara,
                    success:function(data){
                        console.log(data);
                        if(data){
                            var msg = "操作: [禁言] 执行成功";
                        }
                        $("#retmsg_id").html(msg);
                    },
                    error:function(XMLHttpRequest, textStatus, errorThrown){
                        console.log(textStatus);
                        var msg = "操作:" + reqpara.op + "执行失败";
                        $("#retmsg_id").html(msg);
                    }
                });
            }
        });

    });

    $("#seal").click(function(){
        bootbox.confirm('确定要这样做吗？', function(result) {
            if(result){
                var accArr = {};
                $("input[name='accountArr[]']:checked").each(function(i){
                    var val = $(this).val();
                    var arr = val.split("#!#");
                    accArr[arr[0]] = [arr[1],arr[2]];
                });
                if(Object.keys(accArr).length == 0){
                    $("#retmsg_id").html('未选择任何数据');
                    return;
                }
                var reqpara ={op:'sealAccountList',accounts:accArr};
                //console.log(reqpara);
                $.ajax({
                    url:"../api/ban_api.php",
                    type:"POST",
                    //dataType:"json",
                    data:reqpara,
                    success:function(data){
                        console.log(data);
                        if(data){
                            var msg = "操作: [封号] 执行成功";
                        }
                        $("#retmsg_id").html(msg);
                    },
                    error:function(XMLHttpRequest, textStatus, errorThrown){
                        console.log(textStatus);
                        var msg = "操作:" + reqpara.op + "执行失败";
                        $("#retmsg_id").html(msg);
                    }
                });
            }
        });
    });

    $(function() {
        var date=$( "#startTime" );
        date.datetimepicker({
            showSecond: true,
            dateFormat: 'yy-mm-dd',
            timeFormat: 'HH:mm:ss',
            stepHour: 1,
            stepMinute: 1,
            stepSecond: 1
        })
    });
    $(function() {
        var date=$( "#endTime" );
        date.datetimepicker({
            showSecond: true,
            dateFormat: 'yy-mm-dd',
            timeFormat: 'HH:mm:ss',
            stepHour: 1,
            stepMinute: 1,
            stepSecond: 1
        })
    });
</script>