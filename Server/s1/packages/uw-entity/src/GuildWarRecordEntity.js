/**
游戏-公会战记录(GuildWarRecordEntity)
游戏-公会战记录(GuildWarRecordEntity)
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 记录数据 **/
    this.recordData = null;/*记录数据*/
    /** 记录时间 **/
    this.recordTime = null;/*记录时间*/
    /** 结束排名数据 **/
    this.lastRankData = null;/*结束排名数据*/

};
_Class.tableName = 'uw_guildwar_record';