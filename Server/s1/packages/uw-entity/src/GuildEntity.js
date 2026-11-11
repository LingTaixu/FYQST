/**
游戏-公会(GuildEntity)
公会。
**/
var _Class = module.exports = function(){
    /** 公会id **/
    this.id = null;/*id*/
    /** 公会名称 **/
    this.name = null;/*公会名称*/
    /** 公会旗号id **/
    this.iconId = null;/*公会旗号id*/
    /** 会长id **/
    this.chairmanId = null;/*会长id*/
    /** 副会长ids **/
    this.viceChairmanId = null;/*副会长ids*/
    /** 公会人数 **/
    this.guildPopulation = 1;/*公会人数*/
    /** 累计贡献值 **/
    this.addUpAct = 0;/*累计贡献值*/
    /** 加入条件 **/
    this.joinCon = 0;/*加入条件*/
    /** 加入最低等级 **/
    this.joinLvl = 0;/*加入最低等级*/
    /** 公会等级 **/
    this.lvl = 0;/*公会等级*/
    /** 公会公告 **/
    this.notice = null;/*公会公告*/
    /** 公会日志 **/
    this.note = null;/*公会日志*/
    /** 申请入会人员 **/
    this.appliedMembers = null;/*申请入会人员*/
    /** 每日开除会员数量 **/
    this.numbersArr = null;/*每天能开除的会员数量*/
    /** 最后开除成员时间 **/
    this.lastExpelTime = null;/*最后开除成员时间*/
    /** 爵位数据 **/
    this.ennobleData = null;/*{&quot;男爵&quot;:count,&quot;子爵&quot;:count,&quot;伯爵&quot;:count,&quot;侯爵&quot;:count,&quot;公爵&quot;:count}*/
    /** 公会副本数据 **/
    this.guildCopyData = null;/*{bossId:[进度,[参与userId,userId,...]],bossId:[进度,[参与userId,userId,...]],...}*/
    /** 副本重置次数 **/
    this.resetCount = 0;/*副本重置次数*/
    /** 副本重置时间 **/
    this.resetTime = null;/*副本重置时间*/
    /** 成员最后登录时间 **/
    this.lastLgTime = null;/**/
    /** 日活跃度 **/
    this.todayHyd = 0;/*日活跃度*/
    /** 周活跃度 **/
    this.weekHyd = 0;/*周活跃度*/
    /** 日活跃度刷新时间 **/
    this.todayHydRefreshTime = null;/*日活跃度刷新时间*/
    /** 周活跃度刷新时间 **/
    this.weekHydRefreshTime = null;/*周活跃度刷新时间*/
    /** 日福利值 **/
    this.fuli = 0;/*日福利值*/
    /** 活跃度数据 **/
    this.hydData = null;/*活跃度数据{&quot;id&quot;:[次数]}*/
    /** 日活跃幸运用户 **/
    this.hydLuckyName = null;/*日活跃幸运用户*/
    /** 工会仓库 **/
    this.wareHouse = null;/*[{itemId:itemNum},{}]*/

};
_Class.tableName = 'uw_guild';