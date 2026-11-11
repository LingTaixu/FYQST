<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>
<form action="" method="POST" style="margin-bottom:0px">
<div class="btn-toolbar" style="margin-bottom:2px;">

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

    </form>

        <div class="btn-toolbar" style="margin-bottom:2px;">
            <button type="button" class="btn btn-primary" id="pass"><i class="icon-ok"></i> 审核通过</button>
            <button type="button" class="btn btn-primary" id="nopass"><i class="icon-remove"></i> 审核不通过</button>
        </div>
        <div id="retmsg_id" class="block-body collapse in"></div>

    <div class="block">
        <a href="#page-stats" class="block-heading" data-toggle="collapse">系统信息列表</a>
        <div id="page-stats" class="block-body collapse in">
            <table class="table table-striped">
                <thead>
                <tr>
                    <th style="width:10px"><input type="checkbox" id="check_all">全选</th>

                    <th style="width:20px">区服</th>
                    <th style="width:20px">玩家id</th>
                    <th style="width:50px">玩家名称</th>
                    <th style="width:50px">邮件标题</th>
                    <th style="width:50px">邮件内容</th>
                    <th style="width:50px">附件物品</th>
                    <th style="width:10px">审核状态</th>
                </tr>
                </thead>
                <tbody id="dataList">
                <{foreach name=data from=$dataList item=data}>
                    <tr>
                        <td><input type="checkbox" name="mailArr[]" value="<{$data.id}>" separtator=" "></td>

                        <td><{$data.serverId}></td>
                        <td><{$data.userId}></td>
                        <td><{$data.nickName}></td>
                        <td><{$data.title}></td>
                        <td><{$data.content}></td>
                        <td><{$data.items}></td>
                        <td><{$data.isChecked}></td>
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
            $("input[name='mailArr[]']").prop("checked",true);
        }else{
            $("input[name='mailArr[]']").prop("checked",false);
        }
    });
    //阻止事件冒泡
    $("input[name='mailArr[]']").click(function(event){
        event.stopPropagation();
    });

    $("#dataList tr").click(function(){
        var node = $(this).find("input[name='mailArr[]']");
        if(node.prop("checked")){
            node.prop("checked",false);
        }else{
            node.prop("checked",true);
        }
    });

    $("#pass").click(function(){
        bootbox.confirm('确定要这样做吗？', function(result) {
            if(result){
                var valArr = new Array();
                $("input[name='mailArr[]']:checked").each(function(i){
                    valArr[i] = $(this).val();
                });
                if(valArr.length == 0){
                    $("#retmsg_id").html('未选择任何数据');
                    return;
                }
                //valArr = JSON.stringify( valArr );
                var reqpara ={op:'checkMailsPass',data:{mails:valArr}};
                //console.log(reqpara);
                $.ajax({
                    url:"../api/ajax_api.php",
                    type:"POST",
                    //dataType:"json",
                    data:reqpara,
                    success:function(data){
                        //console.log(data);
                        var msg;
                        if(data.ret){
                            msg = "操作: [审核通过] 执行成功";
                        }else{
                            msg = "操作: [审核通过] 没有数据被修改";
                        }
                        window.location.reload();
                        $("#retmsg_id").html(msg);

                    },
                    error:function(XMLHttpRequest, textStatus, errorThrown){
                        console.log(textStatus);
                        var msg = "操作: [审核通过] 执行失败";
                        $("#retmsg_id").html(msg);
                    }
                });
            }
        });

    });


    $("#nopass").click(function(){
        bootbox.confirm('确定要这样做吗？', function(result) {
            if(result){
                var valArr = new Array();
                $("input[name='mailArr[]']:checked").each(function(i){
                    valArr[i] = $(this).val();
                });
                if(valArr.length == 0){
                    $("#retmsg_id").html('未选择任何数据');
                    return;
                }
                //valArr = JSON.stringify( valArr );
                var reqpara ={op:'checkMailsNotPass',data:{mails:valArr}};
                //console.log(reqpara);
                $.ajax({
                    url:"../api/ajax_api.php",
                    type:"POST",
                    //dataType:"json",
                    data:reqpara,
                    success:function(data){
                        console.log(data);
                        var msg;
                        if(data.ret){
                            msg = "操作: [审核不通过] 执行成功";
                        }else{
                            msg = "操作: [审核不通过] 没有数据被修改";
                        }
                        window.location.reload();
                        $("#retmsg_id").html(msg);

                    },
                    error:function(XMLHttpRequest, textStatus, errorThrown){
                        console.log(textStatus);
                        var msg = "操作: [审核通过] 执行失败";
                        $("#retmsg_id").html(msg);
                    }
                });
            }
        });

    });
</script>