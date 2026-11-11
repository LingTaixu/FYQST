/**
游戏-世界BOSS记录(BossRecordEntity)
世界BOSS记录
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/**/
    /** 记录类型 **/
    this.recordType = null;/**/
    /** bossId **/
    this.bossId = null;/**/
    /** 用户id **/
    this.userId = null;/**/
    /** 用户昵称 **/
    this.userName = null;/**/
    /** 工会名称 **/
    this.guildName = null;/**/
    /** 伤害值 **/
    this.killValue = null;/**/
    /** 数据 **/
    this.data = null;/*扩展数据，保留*/
    /** 记录日期 **/
    this.recordDate = null;/**/

};
_Class.tableName = 'uw_boss_record';