<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!-- START 以上内容不需更改，保证该TPL页内的标签匹配即可 -->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="well">
    <ul class="nav nav-tabs">
        <li class="active"><a href="#home" data-toggle="tab">修改基础数据</a></li>
    </ul>

    <div id="myTabContent" class="tab-content">
        <div class="tab-pane active in" id="home">

            <form id="tab" method="post" action="">
                角色ID
                <input type="text" name="uid" id="uid" value="<{$player_info.id}>"  required="true">
                角色名称
                <input type="text" name="nick" id="nick" value="<{$player_info.nickName}>"  required="true">
                金币
                <input type="text" name="gold" value="<{$player_info.gold}>" required="true" >
                钻石
                <input type="text" name="diamond" value="<{$player_info.diamond}>" required="true" >
                积分
                <input type="text" name="diamond" value="<{$player_info.dscoreInfo}>" required="true" >
                </br>
                魔导等级
                <input type="text" name="magicLvl" value="<{$player_info.magicLvl}>" required="true" >
                等 级
                <input type="text" name="lvl" value="<{$player_info.lvl}>" required="true" >
                </br>转生等级
                <input type="text" name="rebirthLvl" value="<{$player_info.rebirthLvl}>" required="true" >
                转生经验
                <input type="text" name="rebirthExp" value="<{$player_info.rebirthExp}>" required="true" >
                </br>成就等级
                <input type="text" name="achieveLvl" value="<{$player_info.achieveLvl}>" required="true" >
                成就点
                <input type="text" name="achieveExp" value="<{$player_info.achieveExp}>" required="true" >
                </br>次元壁等级
                <input type="text" name="cybLvl" value="<{$player_info.cybLvl}>" required="true" >
                次元壁点数
                <input type="text" name="cybExp" value="<{$player_info.cybExp}>" required="true" >
                </br>军衔等级
                <input type="text" name="jxLvl" value="<{$player_info.jxLvl}>" required="true" >
                军衔点数
                <input type="text" name="jxExp" value="<{$player_info.jxExp}>" required="true" >
                <br/>挂机关卡
                <input type="text" name="curCopy" value="<{$curCopy}>" required="true" >
                深渊疲劳度
                <input type="text" name="fatigue" value="<{$fatigue}>" required="true" >
                </br>
                经验塔历史最高层数
                <input type="text" name="highPaTa" value="<{$player_info.highPaTa}>" required="true" >
                </br>
                英雄: <{$player_info.heroData}>
                </br>
                <div class="btn-toolbar">
                    <button type="submit" class="btn btn-primary"><strong>提交修改</strong></button>
                </div>
            </form>
        </div>
    </div>
    <div id="retmsg_id" class="block-body collapse in">
    </div>
</div>

<script type="text/javascript">

    $("#btn_lvup").click(function(){
        bootbox.confirm('确定要这样做吗？', function(result) {
            if(result){
                var uid = $("#uid").val();
                var reqpara ={op:'createTestUser',data:{uid:uid}};
                $.ajax({
                    url:"../api/ajax_api.php",
                    type:"GET",
                    dataType:"json",
                    data:reqpara,
                    success:function(data){
                        console.log(data);
                        if(data && data.ret){
                            var msg = "操作: [" + reqpara.op + "] 执行成功";
                        }else{
                            var msg = "操作:" + reqpara.op + "执行失败,修改用户只能有1个英雄，请换新号操作";
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
<!-- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 -->
<{include file="footer.tpl" }>