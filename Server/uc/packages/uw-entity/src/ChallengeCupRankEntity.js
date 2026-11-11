/**
王城擂主数据排行(ChallengeCupRankEntity)

**/
var _Class = module.exports = function(){
    /** 擂主数据id **/
    this.id = null;/**/
    /** 守擂用户id **/
    this.userId = null;/**/
    /** 守擂开始时间 **/
    this.startTime = null;/**/
    /** 守擂结束时间 **/
    this.endTime = null;/**/
    /** 最长守擂时间 **/
    this.maxTime = 0;/*最长守擂时间*/
    /** 头像 **/
    this.iconId = null;/**/
    /** 昵称 **/
    this.nickName = null;/**/
    /** 等级 **/
    this.lvl = null;/**/
    /** vip等级 **/
    this.vip = null;/**/

};
_Class.tableName = 'uw_challengeCup_rank';