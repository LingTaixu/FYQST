<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<!--
<div class="well">
    <ul class="nav nav-tabs">
        <li class="active"><a href="#home" data-toggle="tab">封禁账号</a></li>
    </ul>

    <div id="myTabContent" class="tab-content">
        <div class="tab-pane active in" id="home">
            <form id="tab" method="post" action="">
                <label>禁言过期时间</label>
                <input type="text" id="bendExpireAt" name="bendExpireAt" value="<{$info.bendExpireAt}>" >
                <label>封号</label>
                <{html_options name="status" options=$banStatusList selected=$info.status}>
                <div class="btn-toolbar">
                    <button type="submit" class="btn btn-primary"><strong>提交</strong></button>
                </div>
            </form>
        </div>
    </div>
</div>
-->

<div class="well">
    <ul class="nav nav-tabs">
        <li class="active"><a href="#home" data-toggle="tab">玩家信息</a></li>
    </ul>

    <form class="form-horizontal">
        <fieldset>
            <div class="control-group">
                <label class="control-label" >账号ID</label>
                <div class="controls">
                    <input class="input-xlarge uneditable-input" id="accid"  type="text" value="<{$info.id}>" readonly>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" >玩家账号</label>
                <div class="controls">
                    <input class="input-xlarge uneditable-input" id="charid"  type="text" value="<{$info.name}>" readonly>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" >封停状态</label>
                <div class="controls">
                    <input class="input-xlarge uneditable-input"  id="status"  type="text" value="<{$info.statusName}>" readonly>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" >禁言状态</label>
                <div class="controls">
                    <input class="input-xlarge uneditable-input"  id="bendStatus"  type="text" value="<{$info.bendName}>" readonly>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" >禁言过期时间</label>
                <div class="controls">
                    <input class="input-xlarge input"   id="bendExpireAt" name="bendExpireAt"   type="text" value="<{$info.bendExpireAt}>" >
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" >操作理由</label>
                <div class="controls">
                    <input class="input-xlarge focused"   type="text"  id="reasonid" value=""  required="true">
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-primary" id="kickoff_id">踢下线</button>
                <button type="button" class="btn btn-primary" id="seal_id">角色封停</button>
                <button type="button" class="btn btn-primary" id="unseal_id">角色解封</button>
                <button type="button" class="btn btn-primary" id="bend_id">角色禁言</button>
                <button type="button" class="btn btn-primary" id="unbend_id">解除禁言</button>
            </div>
        </fieldset>
    </form>
    <div id="retmsg_id" class="block-body collapse in">
    </div>
</div>

<script>
    $(function() {
        var date=$( "#bendExpireAt" );
        //date.datepicker({ dateFormat: "yy-mm-dd hh" });
        //date.datepicker( "option", "firstDay", 1 );
        date.datetimepicker({
            //showOn: "button",
            //buttonImage: "./css/images/icon_calendar.gif",
            //buttonImageOnly: true,
            showSecond: true,
            dateFormat: 'yy-mm-dd',
            timeFormat: 'HH:mm:ss',
            stepHour: 1,
            stepMinute: 1,
            stepSecond: 1
        })
    });
    $("#kickoff_id").click(function(){
        bootbox.confirm('确定要这样做吗？', function(result) {
            if(result){
                var accid = $("#accid").val();
                var reqpara ={op:'opKickOffUser',data:{accid:accid}};
                $.ajax({
                    url:"../api/ajax_api.php",
                    type:"GET",
                    dataType:"json",
                    data:reqpara,
                    success:function(data){
                        console.log(data);
                        $("#retmsg_id").html("踢人成功!");
                    },
                    error:function(XMLHttpRequest, textStatus, errorThrown){
                        console.log(textStatus);
                        $("#retmsg_id").html("踢人失败!");
                    }
                });
            }
        });
    });
    $("#bend_id").click(function(){
        bootbox.confirm('确定要这样做吗？', function(result) {
            if(result){
                var accid = $("#accid").val();
                var bendExpireAt = $("#bendExpireAt").val();
                if (bendExpireAt == ''){
                    alert("禁言需要选择结束时间");
                    return;
                }
                var reason = $("#reasonid").val();

                var reqpara ={op:'opBendUser',data:{accid:accid, bendExpireAt: bendExpireAt, reason:reason}};
                $.ajax({
                    url:"../api/ajax_api.php",
                    type:"GET",
                    dataType:"json",
                    data:reqpara,
                    success:function(data){
                        console.log(data);
                        $("#retmsg_id").html("禁言成功!");
                        $("#bendStatus").val("已禁言");
                    },
                    error:function(XMLHttpRequest, textStatus, errorThrown){
                        console.log(textStatus);
                        $("#retmsg_id").html("禁言失败!");
                    }
                });
            }
        });
    });
    $("#unbend_id").click(function(){
        bootbox.confirm('确定要这样做吗？', function(result) {
            if(result){
                var accid = $("#accid").val();
                var reason = $("#reasonid").val();
                var bendExpireAt = 0;
                var reqpara ={op:'opUnBendUser',data:{accid:accid, bendExpireAt: bendExpireAt}};
                $.ajax({
                    url:"../api/ajax_api.php",
                    type:"GET",
                    dataType:"json",
                    data:reqpara,
                    success:function(data){
                        console.log(data);
                        $("#retmsg_id").html("解除禁言成功!");
                        $("#bendStatus").val("正常");
                    },
                    error:function(XMLHttpRequest, textStatus, errorThrown){
                        console.log(textStatus);
                        $("#retmsg_id").html("解除禁言失败!");
                    }
                });
            }
        });
    });
    $("#seal_id").click(function(){
        bootbox.confirm('确定要这样做吗？', function(result) {
            if(result){
                var accid = $("#accid").val();
                var reason = $("#reasonid").val();
                var reqpara ={op:'opSealUser',data:{accid:accid, reason:reason}};
                $.ajax({
                    url:"../api/ajax_api.php",
                    type:"GET",
                    dataType:"json",
                    data:reqpara,
                    success:function(data){
                        console.log(data);
                        $("#retmsg_id").html("封停成功!");
                        $("#status").val("已封停");
                    },
                    error:function(XMLHttpRequest, textStatus, errorThrown){
                        console.log(textStatus);
                        $("#retmsg_id").html("封停失败!");
                    }
                });
            }
        });
    });
    $("#unseal_id").click(function(){
        bootbox.confirm('确定要这样做吗？', function(result) {
            if(result){
                var accid = $("#accid").val();
                var reqpara ={op:'opUnSealUser',data:{accid:accid}};
                $.ajax({
                    url:"../api/ajax_api.php",
                    type:"GET",
                    dataType:"json",
                    data:reqpara,
                    success:function(data){
                        console.log(data);
                        $("#retmsg_id").html("解封成功!");
                        $("#status").val("正常");
                    },
                    error:function(XMLHttpRequest, textStatus, errorThrown){
                        console.log(textStatus);
                        $("#retmsg_id").html("解封失败!");
                    }
                });
            }
        });
    });
</script>
<!--- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 --->
<{include file="footer.tpl" }>