/**
王城擂主(ChallengeCupEntity)
王城擂主(ChallengeCupEntity)
**/
var _Class = module.exports = function(){
    /** 擂主信息表id **/
    this.id = null;/**/
    /** 当前守擂者角色id **/
    this.userId = null;/*当前守擂者userId*/
    /** 成为擂主的时间戳 **/
    this.leftTime = null;/*成为擂主的时间戳*/
    /** 老擂主id **/
    this.championUserId = null;/*老擂主userId*/
    /** 活动开始时间 **/
    this.startTime = null;/**/
    /** 活动数据 **/
    this.exData = null;/**/
    /** 活动状态 **/
    this.isOpen = 0;/**/
    /** 被膜拜次数 **/
    this.worship = 0;/*被膜拜次数*/
    /** 被膜拜总次数 **/
    this.worshipCount = 0;/*被膜拜总次数*/
    /** buff开启次数 **/
    this.buffOpenNum = 0;/*开启buff次数*/
    /** 最后一次开启时间 **/
    this.buffOpenTime = null;/*最后一次开启时间*/
    /** buff结束时间 **/
    this.buffEndTime = null;/*buff结束时间*/
    /** 战斗记录 **/
    this.recordArr = null;/*战斗记录*/

};
_Class.tableName = 'uw_challengeCup';