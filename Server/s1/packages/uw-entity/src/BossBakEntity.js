/**
游戏-世界BOSS备份(BossBakEntity)
世界BOSS
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** bossId **/
    this.bossId = null;/*bossId*/
    /** 开始时间 **/
    this.startTime = null;/*开始时间*/
    /** 结束时间 **/
    this.endTime = null;/*结束时间*/
    /** 击杀人的id **/
    this.killUserId = 0;/*击杀人的id*/
    /** 死亡时间 **/
    this.deathTime = null;/*死亡时间*/
    /** 状态 **/
    this.status = 0;/*状态 0:未开启 1:开启中*/
    /** 最后一次是否胜利 **/
    this.lastIsWin = 0;/*最后一次是否胜利*/
    /** 结算数据 **/
    this.resultData = null;/*结算数据*/
    /** 是否结算奖励 **/
    this.isPrize = 0;/*是否结算奖励*/
    /** 限时开启时间 **/
    this.limitStartTime = null;/*限时开启时间*/
    /** 限时结束时间 **/
    this.limitEndTime = null;/*限时结束时间*/
    /** 是否限时 **/
    this.isLimit = 0;/*是否限时*/
    /** 类型 **/
    this.type = 0;/*类型*/
    /** 原始bossId **/
    this.originBossId = 0;/*原始bossId*/
    /** 死亡bossId **/
    this.deathBossId = 0;/*死亡bossId*/
    /** 复活次数 **/
    this.repeatCount = 0;/*复活次数*/
    /** 最后复活时间 **/
    this.repeatTime = null;/*最后复活时间*/
    /** 召唤数据 **/
    this.callArr = null;/*召唤数据[[userId,userName,callTime],.....]*/
    /** 周几 **/
    this.week = 0;/*周几*/
    /** 异常数据 **/
    this.errData = null;/*异常数据*/

};
_Class.tableName = 'uw_boss_bak';