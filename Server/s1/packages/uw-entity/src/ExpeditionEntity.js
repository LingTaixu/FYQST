/**
游戏-传奇之路(ExpeditionEntity)
传奇之路
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 用户id **/
    this.userId = 0;/**/
    /** 关卡数 **/
    this.stageId = 0;/*关卡数*/
    /** 挑战次数 **/
    this.fightCount = 0;/*挑战次数*/
    /** 元婴召唤次数 **/
    this.soulCount = 0;/*元婴召唤次数*/

};
_Class.tableName = 'uw_expedition';