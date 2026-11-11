/**
游戏-用户每日记录(GameRecordEntity)
用户每日数据记录
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 用户id **/
    this.userId = null;/*用户id*/
    /** 日期 **/
    this.recordTime = null;/*日期*/
    /** 登录次数 **/
    this.loginCount = 0;/**/
    /** 挑战副本次数 **/
    this.copyCount = 0;/*挑战副本次数*/
    /** 刷野次数 **/
    this.wipeCount = 0;/*刷野次数*/
    /** pk次数 **/
    this.pkCount = 0;/*pk次数*/
    /** 竞技场pk次数 **/
    this.jjcPkCount = 0;/*竞技场pk次数*/
    /** 充值次数 **/
    this.rechargeCount = 0;/*充值次数*/
    /** 充值总金额 **/
    this.rechargeSum = 0;/*充值总金额*/
    /** 充值记录 **/
    this.rechargeRecord = null;/*充值记录
            {&quot;id&quot;:充值次数,&quot;id&quot;:充值次数,.............}*/
    /** 商店记录 **/
    this.shopRecord = null;/*商店记录
            {&quot;id&quot;:[今日购买次数,历史购买总次数],{&quot;id&quot;:[今日购买次数,历史购买总次数],.............}*/
    /** 消耗金币记录 **/
    this.costGoldRecord = null;/*消耗金币记录
            {&quot;id&quot;:金币数量,&quot;id&quot;:金币数量,.............}*/
    /** 消耗钻石记录 **/
    this.costDiamondRecord = null;/*消耗钻石记录
            {&quot;id&quot;:钻石数量,&quot;id&quot;:钻石数量,.............}*/
    /** 消耗钻石记录1 **/
    this.costDiamondRecord1 = null;/*消耗钻石记录1*/
    /** 消耗钻石记录2 **/
    this.costDiamondRecord2 = null;/*消耗钻石记录2*/
    /** 获取钻石记录 **/
    this.getDiamondRecord = null;/*获取钻石记录
            {&quot;id&quot;:钻石数量,&quot;id&quot;:钻石数量,.............}*/
    /** 获取钻石记录1 **/
    this.getDiamondRecord1 = null;/*获取钻石记录1*/
    /** 获取钻石记录2 **/
    this.getDiamondRecord2 = null;/*获取钻石记录2*/
    /** 渠道号 **/
    this.channelId = null;/*渠道号*/
    /** 服务器id **/
    this.serverId = null;/*服务器id*/
    /** 拉霸次数 **/
    this.labaCount = null;/*拉霸次数*/
    /** 积分消耗数 **/
    this.costDScoreNum = null;/*积分消耗总数*/

};
_Class.tableName = 'uw_game_record';