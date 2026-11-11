/**
游戏-行会战记录(GuildBattleRecordEntity)
游戏-行会战记录
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/**/
    /** 工会战数据 **/
    this.battleData = null;/*{工会数据}*/
    /** 参与工会 **/
    this.battleGuild = null;/*[工会数据积分,,]*/
    /** 参与玩家 **/
    this.battleUser = null;/*[玩家数据积分,,]*/
    /** 胜利工会id **/
    this.guildId = null;/**/
    /** 胜利工会名称 **/
    this.guildName = null;/**/
    /** 会长id **/
    this.chairmanId = null;/**/
    /** 会长名 **/
    this.chairmanName = null;/**/
    /** 记录时间 **/
    this.recordTime = null;/**/

};
_Class.tableName = 'uw_guildBattle_record';