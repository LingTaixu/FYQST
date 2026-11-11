/**
游戏-野外pk(PkOutEntity)
游戏-野外pk
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 用户id **/
    this.userId = 0;/*用户id*/
    /** 对手组 **/
    this.enemyIds = null;/*对手组*/
    /** 额外的对手 **/
    this.exEnemyId = 0;/*额外的对手*/
    /** 上一次刷新对手时间 **/
    this.freshTime = null;/*上一次刷新对手时间*/
    /** pk值 **/
    this.pkValue = 0;/*pk值*/
    /** 历史最高pk值 **/
    this.highPkValue = 0;/*历史最高pk值*/
    /** 杀戮值 **/
    this.killValue = 0;/*杀戮值*/
    /** pk值结算时间 **/
    this.pkValueTime = null;/*pk值结算时间*/
    /** 对手类型 **/
    this.enemyTypes = 0;/**/
    /** 每日刷新对手次数 **/
    this.todayRefreshNum = 0;/*每日刷新对手次数*/
    /** 最近每日刷新时间 **/
    this.todayRefreshTime = null;/*最近每日刷新时间*/
    /** 连胜次数 **/
    this.winCount = 0;/*连胜次数*/
    /** 历史最高连胜次数 **/
    this.highWinCount = 0;/*历史最高连胜次数*/
    /** 累计胜利次数 **/
    this.accWinCount = 0;/*累计胜利次数*/

};
_Class.tableName = 'uw_pkout';