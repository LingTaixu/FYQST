/**
游戏-雇佣奖励记录(EmployRewardRecordEntity)
游戏-雇佣奖励记录
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 记录类型 **/
    this.recordType = null;/*记录类型*/
    /** 玩家id **/
    this.userId = null;/*玩家id*/
    /** 玩家名称 **/
    this.userName = null;/*玩家名称*/
    /** 工会名称 **/
    this.guildName = null;/*工会名称*/
    /** 雇佣id **/
    this.employId = null;/*雇佣id*/
    /** 雇佣英雄id **/
    this.heroId = null;/*雇佣英雄id*/
    /** 物品 **/
    this.items = null;/*物品*/
    /** 记录日期 **/
    this.recordDate = null;/*记录日期*/

};
_Class.tableName = 'uw_employRewardRecord';