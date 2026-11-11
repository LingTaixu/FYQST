<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!-- TPLSTART 以上内容不需更改，保证该TPL页内的标签匹配即可 -->
<div class="block">
    <a href="#page-stats" class="block-heading" data-toggle="collapse">玩家信息</a>
    <div id="page-stats" class="block-body collapse in">

        <table class="table table-striped">
            <tbody>
                <tr><td width="30%">UID</td><td><{$player_info.id}> </td></tr>
                <tr><td>账号ID</td><td><{$player_info.accountId}> </td></tr>
                <tr><td>昵称</td><td><{$player_info.nickName}></td></tr>
                <tr><td>金币</td><td><{$player_info.gold}></td></tr>
                <tr><td>钻石</td><td><{$player_info.diamond}></td></tr>
                <tr><td>绑定钻石，即送的钻石</td><td><{$player_info.giveDiamond}></td></tr>
                <tr><td>非绑定钻石，即购买的钻石</td><td><{$player_info.buyDiamond}></td></tr>
                <tr><td>等级</td><td><{$player_info.lvl}></td></tr>
                <tr><td>经验</td><td><{$player_info.expc}></td></tr>
                <tr><td>战力</td><td><{$player_info.combat}></td></tr>
                <tr><td>VIP等级</td><td><{$player_info.vip}></td></tr>

                <tr><td>VIP积分</td><td><{$player_info.vipScore}></td></tr>
                <tr><td>充值积分</td><td><{$player_info.dScore}></td></tr>
                <tr><td>签名</td><td><{$player_info.signName}></td></tr>
                <tr><td>荣誉值</td><td><{$player_info.honor}></td></tr>
                <tr><td>声望</td><td><{$player_info.prestige}></td></tr>
                <tr><td>sdk渠道号</td><td><{$player_info.sdkChannelId}></td></tr>
                <tr><td>服务器索引</td><td><{$player_info.serverIndexId}></td></tr>

                <tr><td>转生等级</td><td><{$player_info.rebirthLvl}></td></tr>
                <tr><td>转生经验</td><td><{$player_info.rebirthExp}></td></tr>
                <tr><td>通天塔最高层数</td><td><{$player_info.highPaTa}></td></tr>

            </tbody>
        </table>

    </div>
</div>
<!-- TPLEND 以下内容不需更改，请保证该TPL页内的标签匹配即可 -->
<{include file="footer.tpl" }>