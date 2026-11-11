/**
游戏-活动记录(ActivityRecordEntity)
游戏-活动记录
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 用户id **/
    this.userId = null;/*用户id*/
    /** 活动id **/
    this.activityId = null;/*活动id*/
    /** 活动类型 **/
    this.activityType = null;/*活动类型*/
    /** 用户等级 **/
    this.userLvl = null;/*用户等级*/
    /** 用户vip **/
    this.userVip = null;/*用户vip*/
    /** 消耗钻石数量 **/
    this.costDiamond = null;/*消耗钻石数量*/
    /** 获取钻石数量 **/
    this.getDiamond = null;/*获取钻石数量*/
    /** 参与活动次数 **/
    this.joinCount = null;/*参与活动次数*/
    /** 首次参加时间 **/
    this.addTime = null;/*首次参加时间*/
    /** 最后参与时间 **/
    this.updateTime = null;/*最后参与时间*/

};
_Class.tableName = 'uw_activity_record';