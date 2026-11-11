/**
主-行会战报名(GuildWarSignEntity)
主-行会战报名(GuildWarSignEntity)
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/**/
    /** 服务器id **/
    this.serverId = 0;/*服务器id*/
    /** 行会id **/
    this.guildId = 0;/*行会id*/
    /** 报名时间 **/
    this.signTime = null;/*报名时间*/
    /** 报名组别 **/
    this.groupId = 0;/*报名组别*/
    /** 报名人id **/
    this.signUserId = 0;/**/

};
_Class.tableName = 'uw_guild_war_sign';