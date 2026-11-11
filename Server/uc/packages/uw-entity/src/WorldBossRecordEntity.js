/**
主-跨服世界boss记录(WorldBossRecordEntity)
主-世界boss记录
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/**/
    /** 战斗Id **/
    this.battleId = null;/**/
    /** 结果数据 **/
    this.resultData = null;/**/
    /** 记录时间 **/
    this.recordTime = null;/**/

};
_Class.tableName = 'uw_worldboss_record';