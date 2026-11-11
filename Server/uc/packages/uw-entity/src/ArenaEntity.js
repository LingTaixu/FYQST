/**
游戏-竞技场(ArenaEntity)

**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 用户id **/
    this.userId = 0;/*用户id*/
    /** 排名 **/
    this.rank = 0;/*排名*/
    /** 历史最高排名 **/
    this.highRank = 0;/*历史最高排名*/
    /** 挑战排名 **/
    this.fightRanks = 0;/*挑战排名*/
    /** 挑战次数数据 **/
    this.reNumData = null;/*挑战次数数据[剩余挑战次数，上一次恢复次数时间，下一次可以挑战的时间(cd)]*/
    /** 奖励数据 **/
    this.awardData = null;/*奖励数据*/
    /** 累计胜场 **/
    this.winCount = 0;/*累计胜场*/
    /** 连胜场数 **/
    this.conWinCount = 0;/*连胜场数*/
    /** 最大连胜场数 **/
    this.maxConWinCount = 0;/*最大连胜场数*/

};
_Class.tableName = 'uw_arena';