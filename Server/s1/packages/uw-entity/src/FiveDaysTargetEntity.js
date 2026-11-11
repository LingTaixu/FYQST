/**
五日目标(FiveDaysTargetEntity)
五日目标历史排行榜
**/
var _Class = module.exports = function(){
    /** 主键 **/
    this.id = null;/**/
    /** 用户id **/
    this.userId = null;/**/
    /** 用户名称 **/
    this.userName = null;/**/
    /** 用户头像 **/
    this.iconId = null;/**/
    /** 用户等级 **/
    this.userLvl = null;/**/
    /** 英雄等级 **/
    this.pkWinCount = null;/**/
    /** 战力 **/
    this.combat = null;/**/
    /** 排名类型 **/
    this.rankType = null;/**/
    /** 排名数值 **/
    this.rankValue = null;/**/

};
_Class.tableName = 'uw_fivedays_rank';