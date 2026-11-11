/**
主-行会战分组(GuildGroupEntity)
主-行会战分组(GuildGroupEntity)
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/**/
    /** 组名 **/
    this.name = null;/*组名*/
    /** 服务器组 **/
    this.serverArr = null;/*服务器组*/
    /** 上次排名 **/
    this.lastRankData = null;/*上次排名*/
    /** 上次排名时间 **/
    this.lastRankTime = null;/*上次排名时间*/
    /** 对应的redis序号 **/
    this.redisId = 0;/*对应的redis序号*/

};
_Class.tableName = 'uw_guild_group';