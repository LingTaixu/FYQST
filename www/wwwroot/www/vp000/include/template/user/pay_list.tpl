<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>

<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div class="btn-toolbar" style="margin-bottom:2px;">
    <a data-toggle="collapse" data-target="#search"  href="#" title= "检索"><button class="btn btn-primary" style="margin-left:5px"><i class="icon-search"></i></button></a>
</div>
<{if $_GET.search }>
<div id="search" class="collapse in">
    <{else }>
    <div id="search" class="collapse out" >
        <{/if }>
        <form class="form_search"  action="" method="GET" style="margin-bottom:0px">
            <div style="float:left;margin-right:5px">
                <label>查询服务器ID</label>
                <input type="text" name="serverId" value="<{$_GET.serverId}>" placeholder="输入服务器ID" >
                <input type="hidden" name="search" value="1" >
            </div>
            <div style="float:left;margin-right:5px">
                <label>账号ID</label>
                <input type="text" name="accountId" value="<{$_GET.accountId}>" placeholder="输入账号ID" >
            </div>
            <div style="float:left;margin-right:5px">
                <label>平台流水号</label>
                <input type="text" name="transId" value="<{$_GET.transId}>" placeholder="输入平台流水号" >
            </div>
            <div class="btn-toolbar" style="padding-top:25px;padding-bottom:0px;margin-bottom:0px">
                <button type="submit" class="btn btn-primary">检索</button>
            </div>
            <div style="clear:both;"></div>
        </form>
    </div>
    <div class="block">
        <a href="#page-stats" class="block-heading" data-toggle="collapse">充值订单列表</a>
        <div id="page-stats" class="block-body collapse in">
            <table class="table table-striped">
                <thead>
                <tr>
                    <th style="width:20px">#</th>
                    <th style="width:65px">流水号</th>
                    <th style="width:60px">账号Id</th>
                    <th style="width:40px">用户Id</th>
                    <th style="width:40px">充值等级</th>
                    <th style="width:40px">服务器Id</th>
                    <th style="width:30px">商品Id</th>
                    <th style="width:30px">金额</th>
                    <th style="width:80px">账单状态</th>
                    <th style="width:80px">账单时间</th>
                    <th style="width:80px">状态2</th>
                    <th style="width:20px">管理</th>
                </tr>
                </thead>
                <tbody>
                <{foreach name=pay from=$pay_infos item=pay_info}>
                    <tr>
                        <td><{$pay_info.id}></td>
                        <td><{$pay_info.transId}></td>
                        <td><{$pay_info.accountId}></td>
                        <td><{$pay_info.userId}></td>
                        <td><{$pay_info.lvl}></td>
                        <td><{$pay_info.serverId}></td>
                        <td><{$pay_info.rechargeId}></td>
                        <td><{$pay_info.goodsPrice}>元</td>
                        <td>
                            <{if $pay_info.status == 0}>
                            订单生成待付款
                            <{else if $pay_info.status == 1}>
                            充值待领取
                            <{else if $pay_info.status == 2}>
                            订单完成
                            <{/if}>
                        </td>

                        <td><{$pay_info.addTime}></td>
                        <td>
                            <{if $pay_info.gmStatus == 0}>
                            正常
                            <{else if $pay_info.gmStatus == 1}>
                            补单
                            <{else if $pay_info.gmStatus == 2}>
                            模拟充值
                            <{/if}>
                        </td>
                        <td>
                            <{if $pay_info.status == 0}>
                            <a data-toggle="modal" href="#myModal"  title= "手工补单" ><i class="icon-pencil" href="pay_list.php?id=<{$pay_info.id}>&method=repay"></i></a>
                            <{/if}>
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