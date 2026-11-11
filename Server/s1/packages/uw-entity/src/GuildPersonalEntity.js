/**
游戏-公会个人信息(GuildPersonalEntity)
公会个人信息
**/
var _Class = module.exports = function(){
    /** 公会个人信息id **/
    this.id = null;/*公会个人信息id*/
    /** 用户id **/
    this.userId = null;/*用户id*/
    /** 公会id **/
    this.guildId = 0;/*公会id*/
    /** 职务 **/
    this.position = 0;/*职务*/
    /** 被提升为副会长的时间 **/
    this.viceTime = null;/*被提升为副会长的时间*/
    /** 今天贡献值 **/
    this.todayAct = 0;/*今天贡献值*/
    /** 今天公告次数 **/
    this.noticeCount = 0;/*今天公告次数*/
    /** 今天退会次数 **/
    this.exitGuildCount = 0;/*今天退会次数*/
    /** 今日抽奖次数 **/
    this.lotteryCount = 0;/*今日抽奖次数*/
    /** 贡献上一次刷新时间 **/
    this.actLastTime = null;/*贡献上一次刷新时间*/
    /** 累计贡献值 **/
    this.addUpAct = 0;/*累计贡献值*/
    /** 退会信息 **/
    this.outMsg = null;/*退会信息*/
    /** 申请信息 **/
    this.appliedMsg = null;/*申请信息*/
    /** 贡献数据 **/
    this.actData = null;/*格式:{&quot;贡献id&quot;:[次数]}*/
    /** 当前公会贡献 **/
    this.guildAct = 0;/*当前公会贡献*/
    /** 最后退会时间 **/
    this.lastQuipGuildTime = null;/*最后退会时间*/
    /** 爵位 **/
    this.ennoble = 0;/*爵位*/
    /** 加入公会时间 **/
    this.joinTime = null;/**/
    /** 公会礼包 **/
    this.giftData = null;/*公会礼包{&quot;id&quot;:[是否已完成,是否已领]}*/
    /** 日活跃度宝箱 **/
    this.todayHydChests = null;/**/
    /** 周活跃度宝箱 **/
    this.weekHydChests = null;/*周活跃度宝箱[是否领过索引,,]*/
    /** 周活跃刷新时间 **/
    this.weekRefreshTime = null;/**/
    /** 日捐献宝箱 **/
    this.fuliChests = null;/*日捐献宝箱[是否领过索引,,]*/
    /** 下次是否捐献暴击 **/
    this.actCrit = 0;/*1 暴击 0 不暴击*/

};
_Class.tableName = 'uw_guild_personal';