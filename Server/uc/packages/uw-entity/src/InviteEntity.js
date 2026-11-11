/**
主-邀请表(InviteEntity)
邀请成功表记录
**/
var _Class = module.exports = function(){
    /** id **/
    this.id = null;/**/
    /** 邀请者账号 **/
    this.inviterUid = null;/**/
    /** 被邀请者账号 **/
    this.inviteeUids = null;/**/
    /** 邀请人数 **/
    this.num = 0;/*邀请人数*/
    /** 领取奖励 **/
    this.rewards = null;/*[领取档位索引]*/

};
_Class.tableName = 'uw_invite';