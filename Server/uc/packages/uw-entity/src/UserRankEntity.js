/**
游戏-用户排行榜(UserRankEntity)
用户排行榜
**/
var _Class = module.exports = function(){
    /** 排名 **/
    this.id = null;/*排名*/
    /** 用户id **/
    this.userId = null;/*领主id*/
    /** 用户名称 **/
    this.userName = null;/*领主名称*/
    /** 用户头像 **/
    this.iconId = null;/**/
    /** 用户等级 **/
    this.userLvl = null;/*英雄id*/
    /** 蓝钻标记 **/
    this.blueDiamond = null;/*蓝钻标记*/
    /** 英雄等级 **/
    this.pkWinCount = null;/**/
    /** 战力 **/
    this.combat = null;/**/
    /** 排名类型 **/
    this.rankType = null;/*排名类型*/
    /** 排名数值 **/
    this.rankValue = null;/*排名数值*/
    /** 公会名 **/
    this.guildName = null;/**/

};
_Class.tableName = 'uw_user_rank';