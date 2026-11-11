<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="well">
    <ul class="nav nav-tabs">
        <li class="active"><a href="#home" data-toggle="tab">全服邮件</a></li>
    </ul>

    <form class="form-horizontal" method="post" action="" autocomplete="off">
        <fieldset>
            <div class="control-group">
                <label class="control-label">服务器</label>
                <div class="controls">
                    <label style="display: inline-block;font-size: 12px;width: 180px"><input type="checkbox" id="selectAll" value="0" separtator=" ">全选</label>
                </div>
                <div class="controls">
                    <{html_checkboxes class="markServerId" name="serverIdArr" options=$serverlist selected=$_POST.serverIdArr separtator=" "}>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" >邮件标题</label>
                <div class="controls">
                    <textarea name="title" id="mail_title" rows="2" class="input-xlarge" autofocus="true" placeholder='填写邮件标题'></textarea>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" >邮件内容</label>
                <div class="controls">
                    <textarea name="content" id="mail_content" rows="10" cols="100" class="input-xxlarge" autofocus="true" placeholder='填写邮件内容'></textarea>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" >增加钻石</label>
                <div class="controls">
                    <input class="input-xlarge focused"  type="text" id="diamond" name="diamond" placeholder='增加钻石数量'>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" >增加金币</label>
                <div class="controls">
                    <input class="input-xlarge focused"  type="text" id="gold" name="gold" placeholder='增加金币数量'>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" >增加物品1</label>
                <div class="controls">
                    <select id="item1" name="item1" data-placeholder="物品名称" style="width:250px;"
                            class="chosen-select-deselect" tabindex="12">
                        <option value=""></option>
                    </select>
                    <!--<input class="input-xlarge focused"  type="text" id="item1" placeholder='物品id'>-->
                    <input class="input-xlarge focused"  type="text" id="num1" name="num1" placeholder='物品数量'>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" >增加物品2</label>
                <div class="controls">
                    <select id="item2" name="item2" data-placeholder="物品名称" style="width:250px;"
                            class="chosen-select-deselect" tabindex="12">
                        <option value=""></option>
                    </select>

                    <input class="input-xlarge focused"  type="text" id="num2" name="num2" placeholder='物品数量'>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" >增加物品3</label>
                <div class="controls">
                    <select id="item3" name="item3" data-placeholder="物品名称" style="width:250px;"
                            class="chosen-select-deselect" tabindex="12">
                        <option value=""></option>
                    </select>
                    <input class="input-xlarge focused"  type="text" id="num3" name="num3" placeholder='物品数量'>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" >增加物品4</label>
                <div class="controls">
                    <select id="item4" name="item4" data-placeholder="物品名称" style="width:250px;"
                            class="chosen-select-deselect" tabindex="12">
                        <option value=""></option>
                    </select>
                    <input class="input-xlarge focused"  type="text" id="num4" name="num4" placeholder='物品数量'>
                </div>
            </div>

        </fieldset>

        <div class="form-actions">
            <button type="button" class="btn btn-primary" id="send_mail">发送邮件</button>
        </div>
    </form>
    <div id="retmsg_id" class="block-body collapse in">
    </div>
</div>


<!--- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 --->
<{include file="footer.tpl" }>

<script type="text/javascript">
    $("#send_mail").click(function(){
        bootbox.confirm('确定要这样做吗？', function(result) {
            if(result){
                submitMail();
            }
        });
    });

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

        $(document).on('click', '#selectAll', function () {
            if ($(this).is(':checked')) {
                $("input[name='serverIdArr[]']").prop('checked', true);
            } else {
                $("input[name='serverIdArr[]']").prop('checked', false);
            }
        });
    });


    function submitMail() {
        $("#retmsg_id").html('');
        var serverIds = $(".markServerId");
        var selectServer = [];
        serverIds.each(function () {
            if ($(this).prop('checked')) {
                var id = $(this).val();
                selectServer[selectServer.length] = id;
            }
        });
        var eachLen = 1;//本来计划5个5个服发，结果还是太卡，就单个单个发
        var serverIdArr = {};
        for (var i in selectServer) {
            if (i > 0 && i % eachLen == 0) {
                sendMail(serverIdArr);
                serverIdArr = {};
            }
            serverIdArr[i] = selectServer[i];
        }
//        console.log(Object.keys(serverIdArr).length);
        if (Object.keys(serverIdArr).length > 0) {
            sendMail(serverIdArr);
        }
    }

    function sendMail(serverIdArr) {
        console.log(serverIdArr);
        var serverIdStr = '';
        for (var i in serverIdArr) {
            if (serverIdStr) {
                serverIdStr += ',' + serverIdArr[i];
            } else {
                serverIdStr = serverIdArr[i];
            }
        }
        var params = {
            method : 'sendMail',
            serverIdArr : serverIdArr,
            title : $("#mail_title").val(),
            content : $("#mail_content").val(),
            diamond : $("#diamond").val(),
            item1 : $("#item1").val(),
            item2 : $("#item2").val(),
            item3 : $("#item3").val(),
            item4 : $("#item4").val(),
            num1 : $("#num1").val(),
            num2 : $("#num2").val(),
            num3 : $("#num3").val(),
            num4 : $("#num4").val()
        };
        $.ajax({
            url: "",
            type: "POST",
            data: params,
            success: function (data) {
                var msg = '';
                data = JSON.parse(data);
                if (data.code > 0) {
                    msg = data.msg;
                } else {
                    msg = ": 成功; ";
                }
                var lastMsg = $("#retmsg_id").html();
                var nowMsg = serverIdStr + msg;
                $("#retmsg_id").html(lastMsg + " " + nowMsg);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var msg = ": 失败; ";
                var lastMsg = $("#retmsg_id").html();
                var nowMsg = serverIdStr + msg;
                $("#retmsg_id").html(lastMsg + " " + nowMsg);
            }
        });
    }
</script>