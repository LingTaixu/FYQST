/**
主-用户调研(UserSurveyEntity)
主-用户调研(UserSurveyEntity)
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 服务器id **/
    this.serverId = null;/*服务器id*/
    /** 用户id **/
    this.userId = null;/*用户id*/
    /** 用户等级 **/
    this.userLvl = null;/*用户等级*/
    /** 用户vip等级 **/
    this.userVip = null;/*用户vip等级*/
    /** 活动id **/
    this.activityId = null;/*活动id*/
    /** 题目id **/
    this.questionId = null;/*题目id*/
    /** 玩家选择 **/
    this.selectIndex = null;/*玩家选择*/

};
_Class.tableName = 'uw_usersurvey_record';