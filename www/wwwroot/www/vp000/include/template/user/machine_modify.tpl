<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!-- START 以上内容不需更改，保证该TPL页内的标签匹配即可 -->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="well">
    <ul class="nav nav-tabs">
        <li class="active"><a href="#home" data-toggle="tab">修改机器数据</a></li>
    </ul>

    <div id="myTabContent" class="tab-content">
        <div class="tab-pane active in" id="home">

            <form id="tab" method="post" action="">
                <label>机器名称</label>
                <input type="text" name="name" value="<{$outArr.name}>" required="true" >
                </br>
                <label>机器信息</label>
                <input type="text" name="desc" value="<{$outArr.desc_info}>" required="false" >
                </br>
                <label>域名</label>
                <input type="text" name="host" value="<{$outArr.host}>" required="true" >
                </br>
                <label>外网地址</label>
                <input type="text" name="outer_ip" value="<{$outArr.outer_ip}>" required="true" >
                </br>
                <label>内网地址</label>
                <input type="text" name="inner_ip" value="<{$outArr.inner_ip}>" required="true" >
                </br>
                <label>游戏服</label>
                <textarea type="text" name="servers" required="false" ><{$outArr.servers}></textarea>
                <div class="btn-toolbar">
		    <button type="submit" name="method" value="1" class="btn btn-primary"><strong>提交</strong></button>
                    <{if $outArr.is_init == 0 }>
                    <button type="submit" name="method" value="2"  class="btn btn-primary"><strong>初始化</strong></button>
                    <{/if }>
                </div>
            </form>
        </div>
    </div>
    <div id="retmsg_id" class="block-body collapse in">
    </div>
</div>

<!-- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 -->
<{include file="footer.tpl" }>

