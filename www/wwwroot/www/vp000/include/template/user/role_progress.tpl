<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!-- START 以上内容不需更改，保证该TPL页内的标签匹配即可 -->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="well">
    <ul class="nav nav-tabs">
        <li class="active"><a href="#home" data-toggle="tab">修改关卡数据</a></li>
    </ul>

    <div id="myTabContent" class="tab-content">
        <div class="tab-pane active in" id="home">

            <form id="tab" method="post" action="">
                挂机关卡
                <input type="text" name="normalCopy" value="<{$normalNum}>" required="true" >
                </br>
                金币试炼
                <input type="text" name="goldCopy" value="<{$goldNum}>" required="true" >
                </br>
                <!--经验试炼
                <input type="text" name="expCopy" value="<{$expNum}>" required="true" >
                </br>-->
                经验塔
                <input type="text" name="towerCopy" value="<{$towerNum}>" required="true" >
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

<!-- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 -->
<{include file="footer.tpl" }>