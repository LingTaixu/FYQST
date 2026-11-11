<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>
<div class="btn-toolbar" style="margin-bottom:2px;">
    <a href="game_notice_add.php" class="btn btn-primary"><i class="icon-plus"></i> 新增</a>
    <a data-toggle="collapse" data-target="#search"  href="#" title= "检索"><button class="btn btn-primary" style="margin-left:5px"><i class="icon-search"></i></button></a>
</div>
<{if $_GET.search }>
<div id="search" class="collapse in">
    <{else }>
    <div id="search" class="collapse out" >
        <{/if }>
        <form class="form_search" action="" method="GET" style="margin-bottom:0px">
            <div style="float:left;margin-right:5px">
                <label>公告类型</label>
                <{html_options name="type" options=$queryoptionlist selected=$_GET.type}>
            </div>
            <div class="btn-toolbar" style="padding-top:25px;padding-bottom:0px;margin-bottom:0px">
                <button type="submit" class="btn btn-primary"><strong>查询</strong></button>
            </div>
            <div style="clear:both;"></div>
        </form>
    </div>

    <div class="block">
        <a href="#page-stats" class="block-heading" data-toggle="collapse">公告列表</a>
        <div id="page-stats" class="block-body collapse in">
            <table class="table table-striped">
                <thead>
                <tr>
                    <th style="width:30px">标题</th>
                    <th style="width:60px">类型</th>
                    <th style="width:20px">是否开启</th>
                    <th style="width:20px">公告时间</th>
                    <th style="width:20px">开始时间</th>
                    <th style="width:20px">结束时间</th>
                    <th style="width:20px">服务器</th>
                    <th style="width:30px">操作</th>
                </tr>
                </thead>
                <tbody>
                <{foreach name=notice from=$noticeList item=notice}>
                    <tr>
                        <td><{$notice.title}></td>
                        <td><{$notice.iconType}></td>
                        <td><{$notice.isOpen}></td>
                        <td><{$notice.noticeTime}></td>
                        <td><{$notice.startTime}></td>
                        <td><{$notice.endTime}></td>
                        <td><{$notice.serverIdArr}></td>
                        <td>
                            <a href="game_notice_modify.php?id=<{$notice.id}>" title= "修改" ><i class="icon-pencil"></i></a>
                            <a data-toggle="modal" href="#myModal" title="删除">
                                <i class="icon-remove" href="game_notice.php?method=del&id=<{$notice.id}>"></i>

                            </a>

                        </td>
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
