/**
主-邀请奖励表(InviteRewardEntity)
主-邀请奖励表
**/
var _Class = module.exports = function(){
    /** id **/
    this.id = null;/**/
    /** 记录类型 **/
    this.recordType = null;/**/
    /** 账号 **/
    this.account = null;/**/
    /** 账号id **/
    this.accountId = null;/**/
    /** 角色id **/
    this.userId = null;/**/
    /** 角色昵称 **/
    this.nickName = null;/*角色昵称*/
    /** 奖励物品 **/
    this.items = null;/*{‘物品id’:&quot;物品数量&quot;}*/
    /** 记录时间 **/
    this.recordTime = null;/**/

};
_Class.tableName = 'uw_invite_reward';