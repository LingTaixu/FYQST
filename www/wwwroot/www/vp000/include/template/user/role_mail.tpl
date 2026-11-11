<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="well">
    <ul class="nav nav-tabs">
        <li class="active"><a href="#home" data-toggle="tab">角色管理</a></li>
    </ul>

    <form class="form-horizontal">
        <fieldset>
            <div class="control-group">
                <label class="control-label" >角色ID</label>
                <div class="controls">
                    <input class="input-xlarge uneditable-input" id="uid"  type="text" value="<{$player_info.id}>" readonly>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" >角色名称</label>
                <div class="controls">
                    <input class="input-xlarge uneditable-input"  id="nickName" type="text" value="<{$player_info.nickName}>" readonly>
                </div>
            </div>
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
                <label class="control-label" >增加元宝</label>
                <div class="controls">
                    <input class="input-xlarge focused"  type="text" id="diamond" placeholder='增加元宝数量'>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" >增加金币</label>
                <div class="controls">
                    <input class="input-xlarge focused"  type="text" id="gold" placeholder='增加金币数量'>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" >增加物品1</label>
                <div class="controls">
                    <select id="item1" data-placeholder="物品名称" style="width:250px;"
                            class="chosen-select-deselect" tabindex="12">
                        <option value=""></option>
                    </select>
                    <!--<input class="input-xlarge focused"  type="text" id="item1" placeholder='物品id'>-->
                    <input class="input-xlarge focused"  type="text" id="num1" placeholder='物品数量'>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" >增加物品2</label>
                <div class="controls">
                    <select id="item2" data-placeholder="物品名称" style="width:250px;"
                            class="chosen-select-deselect" tabindex="12">
                        <option value=""></option>
                    </select>

                    <input class="input-xlarge focused"  type="text" id="num2" placeholder='物品数量'>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" >增加物品3</label>
                <div class="controls">
                    <select id="item3" data-placeholder="物品名称" style="width:250px;"
                            class="chosen-select-deselect" tabindex="12">
                        <option value=""></option>
                    </select>
                    <input class="input-xlarge focused"  type="text" id="num3" placeholder='物品数量'>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" >增加物品4</label>
                <div class="controls">
                    <select id="item4" data-placeholder="物品名称" style="width:250px;"
                            class="chosen-select-deselect" tabindex="12">
                        <option value=""></option>
                    </select>
                    <input class="input-xlarge focused"  type="text" id="num4" placeholder='物品数量'>
                </div>
            </div>

        </fieldset>

        <div class="form-actions">
            <button type="button" class="btn btn-primary" id="cmd_mail_id">发送邮件</button>
        </div>
    </form>
    <div id="retmsg_id" class="block-body collapse in">
    </div>
</div>

<script type="text/javascript">
    $(document).ready(function () {
        //请求物品数据
        var wpMap = [];
        $.ajax({
            url: '../include/config/t_item.json',
            type: 'get',
            cache: false,
            data: {r: Math.random()},
            dataType: 'json',
            timeout: 30000,
            success: function (msg) {
                var html = '<option value=""></option>';
                if (msg.data.length > 0) {
                    //console.log(msg.data.length);
                    for (var i = 0; i < msg.data.length; i++) {
                        wpMap[msg.data[i].id] = msg.data[i].name;
                        html += '<option value="' + msg.data[i].id + '">' + msg.data[i].name + '</option>';
                    }
                    $("#item1").empty();
                    $("#item2").empty();
                    $("#item3").empty();
                    $("#item4").empty();
                    $("#item1").append(html);
                    $("#item2").append(html);
                    $("#item3").append(html);
                    $("#item4").append(html);
                } else {
                    $("#item1").empty();
                    $("#item1").append("没有数据");
                }
                ;
                //模糊搜索控件
                var config = {
                    '.chosen-select': {},
                    '.chosen-select-deselect': {allow_single_deselect: true},
                    '.chosen-select-no-single': {disable_search_threshold: 10},
                    '.chosen-select-no-results': {no_results_text: 'Oops, nothing found!'},
                    '.chosen-select-width': {width: "95%"}
                }
                for (var selector in config) {
                    $(selector).chosen(config[selector]);
                }
                //模糊搜索控件end
            },
            error: function (r, e) {
                $("#goodsName").empty();
                $("#goodsName").append("错误");
            }
        });
        //AJAX结束
    })
    $("#cmd_mail_id").click(function(){
        bootbox.confirm('确定要这样做吗？', function(result) {
            if(result){
                var reqpara = {};
                reqpara.op = "sendMail";
                reqpara.user = $("#username").val();
                reqpara.uid = $("#uid").val();
                reqpara.gold = $("#gold").val();
                reqpara.diamond = $("#diamond").val();
                reqpara.item1 =  $("#item1").val();
                reqpara.num1 =  $("#num1").val();
                reqpara.item2 =  $("#item2").val();
                reqpara.num2 =  $("#num2").val();
                reqpara.item3 =  $("#item3").val();
                reqpara.num3 =  $("#num3").val();
                reqpara.item4 =  $("#item4").val();
                reqpara.num4 =  $("#num4").val();
                reqpara.reason = "DEFAULT";
                reqpara.mail_content = $("#mail_content").val();
                reqpara.mail_title = $("#mail_title").val();
                reqpara.nickName = $("#nickName").val();

                if(reqpara.gold == "" && reqpara.diamond == "" && reqpara.item1 == "" && reqpara.num1 == "" && reqpara.item2 == "" && reqpara.num2 == "" && reqpara.item3 == "" && reqpara.num3 == "" && reqpara.item4 == ""
                    && reqpara.num4 == "" && reqpara.mail_content == "" && reqpara.mail_title == "") {
                    console.log("no need to send");
                    $("#retmsg_id").html("请填写发送内容");
                    return;
                }

                 $.ajax({
                    url:"../api/api.php",
                    type:"GET",
                    dataType:"json",
                    data:reqpara,
                    success:function(data){
                        console.log(data);
                        if(data){
                            var msg = "操作: [" + reqpara.op + "] 执行成功";
                        }else{
                            var msg = "操作:" + reqpara.op + "执行失败";
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
</script>

<!--- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 --->
<{include file="footer.tpl" }>